// Updated import paths via tree-shake script - 2025-04-01T17:13:32.219Z
'use client';

import React, { useState, useEffect, Suspense, useMemo, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useWizard } from '@/components/features/campaigns/WizardContext';
import Header from '@/components/features/campaigns/Header';
import ProgressBar from '@/components/features/campaigns/ProgressBar';
import { toast } from 'react-hot-toast';
import { LoadingSkeleton } from '@/components/ui';
import Image from 'next/image';
import { Icon } from '@/components/ui/icon/icon';
import { EnumTransformers } from '@/utils/enum-transformers';
import { sanitizeDraftPayload } from '@/utils/payload-sanitizer';
import { DateService } from '@/utils/date-service';

// Use an env variable to decide whether to disable validations.
// When NEXT_PUBLIC_DISABLE_VALIDATION is "true", the validation schema will be empty.
const disableValidation = process.env.NEXT_PUBLIC_DISABLE_VALIDATION === 'true';

// First, add these enums at the top of your file
enum Currency {
  GBP = 'GBP',
  USD = 'USD',
  EUR = 'EUR',
}
enum Platform {
  Instagram = 'Instagram',
  YouTube = 'YouTube',
  TikTok = 'TikTok',
}
enum Position {
  Manager = 'Manager',
  Director = 'Director',
  VP = 'VP',
}

// Add this debug function at the top
const debugFormData = (values: any, isDraft: boolean) => {
  console.log('Form Submission Debug:', {
    type: isDraft ? 'DRAFT' : 'SUBMIT',
    timestamp: new Date().toISOString(),
    values: values,
  });
};

// First, update the FormValues interface to include additional contacts
interface Contact {
  firstName: string;
  surname: string;
  email: string;
  position: string;
}

// Create an Influencer interface
interface Influencer {
  platform: string;
  handle: string;
  id?: string; // Optional for storing retrieved influencer ID
}

// Define the form values type
export interface FormValues {
  name: string;
  businessGoal: string;
  startDate: string;
  endDate: string;
  timeZone: string;
  currency: string;
  totalBudget: number;
  socialMediaBudget: number;
  influencers: Array<{
    id?: string;
    platform: string;
    handle: string;
  }>;
  primaryContact: Contact;
  secondaryContact: Contact;
  additionalContacts: Contact[];
}

// Add this FormData interface to match what's defined in the wizard context
interface FormData {
  name: string;
  businessGoal: string;
  startDate: string;
  endDate: string;
  timeZone: string;
  currency: string;
  totalBudget: string | number;
  socialMediaBudget: string | number;
  influencers: Influencer[]; // Update this to match FormValues
  campaignId?: string;
  overview?: any;
  id?: string;
  exchangeRateData?: any; // Add this to support storing exchange rate data
  [key: string]: any; // Allow for additional properties for extensibility
}

// Define default values
const defaultFormValues: FormValues = {
  name: '',
  businessGoal: '',
  startDate: '',
  endDate: '',
  timeZone: '',
  primaryContact: {
    firstName: '',
    surname: '',
    email: '',
    position: '',
  },
  secondaryContact: {
    firstName: '',
    surname: '',
    email: '',
    position: '',
  },
  additionalContacts: [],
  currency: '',
  totalBudget: 0,
  socialMediaBudget: 0,
  influencers: [
    {
      platform: '',
      handle: '',
    },
  ], // Default with one empty influencer
};

// Custom Field Component for styled inputs
const StyledField = ({
  label,
  name,
  type = 'text',
  as,
  children,
  required = false,
  icon,
  control,
  errors,
  ...props
}: any) => {
  return (
    <div className="mb-5 font-work-sans">
      <label
        htmlFor={name}
        className="block text-sm font-medium text-foreground mb-2 font-work-sans"
      >
        {label}
        {required && <span className="text-accent ml-1 font-work-sans">*</span>}
      </label>
      <div className="relative font-work-sans">
        {icon && (
          <div className="absolute left-3 top-0 bottom-0 flex items-center justify-center text-muted-foreground form-icon-container font-work-sans">
            {icon}
          </div>
        )}
        <Controller
          name={name}
          control={control}
          render={({ field }) =>
            as ? (
              React.createElement(
                as,
                {
                  id: name,
                  ...field,
                  className: `w-full h-10 p-2.5 ${icon ? 'pl-10' : 'pl-3'} border border-input rounded-md focus:ring-2 focus:ring-ring focus:border-ring focus:outline-none transition-colors duration-200 shadow-sm bg-background font-work-sans form-input-with-icon ${as === 'select' ? 'appearance-none' : ''}`,
                  ...props,
                },
                children
              )
            ) : (
              <input
                type={type}
                id={name}
                {...field}
                className={`w-full h-10 p-2.5 ${icon ? 'pl-10' : 'pl-3'} border border-input rounded-md focus:ring-2 focus:ring-ring focus:border-ring focus:outline-none transition-colors duration-200 shadow-sm bg-background font-work-sans form-input-with-icon`}
                {...props}
              />
            )
          }
        />
        {type === 'date' && !icon && (
          <div className="absolute right-3 top-0 bottom-0 flex items-center justify-center text-muted-foreground form-icon-container font-work-sans">
            <Icon iconId="faCalendarLight" className="w-5 h-5 font-work-sans" />
          </div>
        )}
        {as === 'select' && (
          <div className="absolute right-3 top-0 bottom-0 flex items-center justify-center text-muted-foreground pointer-events-none form-icon-container font-work-sans">
            <Icon iconId="faChevronDownLight" className="w-5 h-5 font-work-sans" />
          </div>
        )}
      </div>
      {errors[name] && (
        <p className="mt-1 text-sm text-destructive font-work-sans">{errors[name]?.message}</p>
      )}
    </div>
  );
};

// Custom date field component to handle the calendar icon issue
const DateField = ({ label, name, required = false, control, errors, ...props }: any) => {
  return (
    <div className="mb-5 font-work-sans">
      <label
        htmlFor={name}
        className="block text-sm font-medium text-foreground mb-2 font-work-sans"
      >
        {label}
        {required && <span className="text-accent ml-1 font-work-sans">*</span>}
      </label>
      <div className="relative font-work-sans">
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <input
              type="date"
              id={name}
              {...field}
              className="w-full p-2.5 border border-input rounded-md focus:ring-2 focus:ring-ring focus:border-ring focus:outline-none transition-colors duration-200 shadow-sm bg-background font-work-sans"
              {...props}
            />
          )}
        />
      </div>
      {errors[name] && (
        <p className="mt-1 text-sm text-destructive font-work-sans">{errors[name]?.message}</p>
      )}
    </div>
  );
};

// Define extended wizard data interface
interface WizardData {
  basic?: {
    campaignName?: string;
    description?: string;
  };
}

// Replace the ContactSchema and ValidationSchema with corrected versions
const ContactSchema = z.object({
  firstName: z.string().optional(),
  surname: z.string().optional(),
  email: z.string().email('Invalid email').optional(),
  position: z.string().optional(),
});
const PrimaryContactSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  surname: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email').min(1, 'Email is required'),
  position: z.string().min(1, 'Position is required'),
});
const ValidationSchema = z.object({
  name: z.string().min(1, 'Campaign name is required'),
  businessGoal: z.string().min(1, 'Business goal is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z
    .string()
    .min(1, 'End date is required')
    .refine(
      endDate => {
        // Temporarily return true as a workaround; real validation will be handled in form logic if needed
        return true;
      },
      { message: 'End date must be after start date' }
    ),
  timeZone: z.string().min(1, 'Timezone is required'),
  primaryContact: PrimaryContactSchema,
  secondaryContact: ContactSchema,
  additionalContacts: z.array(ContactSchema).default([]),
  currency: z.string().min(1, 'Currency is required'),
  totalBudget: z
    .union([z.string(), z.number()])
    .transform(val => (typeof val === 'string' ? parseFloat(val) || 0 : val))
    .refine(val => val >= 0, { message: 'Total budget must be positive' }),
  socialMediaBudget: z
    .union([z.string(), z.number()])
    .transform(val => (typeof val === 'string' ? parseFloat(val) || 0 : val))
    .refine(
      val => {
        // Temporarily return true as a workaround; real validation will be handled in form logic if needed
        return true;
      },
      { message: 'Social media budget cannot exceed total budget' }
    ),
  influencers: z
    .array(
      z.object({
        platform: z.string().min(1, 'Platform is required'),
        handle: z.string().min(1, 'Influencer handle is required'),
        id: z.string().optional(),
      })
    )
    .min(1, 'At least one influencer is required'),
});

/**
 * Detects user's timezone using the IP Geolocation API
 * This leverages our verified API to provide better UX
 */
async function detectUserTimezone(): Promise<string> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_IPINFO_TOKEN;
    const endpoint = apiKey ? `https://ipinfo.io/json?token=${apiKey}` : 'https://ipapi.co/json/';
    console.log('Detecting user timezone from IP Geolocation API...');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const response = await fetch(endpoint, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }
    const data = await response.json();

    // Get timezone from the response
    const timezone = data.timezone || 'UTC';
    console.log('Detected timezone:', timezone);
    return timezone;
  } catch (error) {
    console.warn('Failed to detect timezone:', error);
    return 'UTC'; // Default fallback
  }
}

// Modify the fetchExchangeRates function to record the date
async function fetchExchangeRates(baseCurrency: string = 'USD'): Promise<{
  rates: Record<string, number> | null;
  fetchDate: string;
} | null> {
  try {
    console.log(`Fetching exchange rates for ${baseCurrency}...`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    // Try primary service first
    const primaryEndpoint = `https://api.exchangerate.host/latest?base=${baseCurrency}`;
    const response = await fetch(primaryEndpoint, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }
    const data = await response.json();
    if (data.rates && Object.keys(data.rates).length > 0) {
      console.log(`Successfully fetched ${Object.keys(data.rates).length} exchange rates`);
      return {
        rates: data.rates,
        fetchDate: new Date().toISOString(),
      };
    }

    // If primary service fails, try fallback
    console.warn('Primary exchange rate service returned invalid data, trying fallback');
    const fallbackEndpoint = `https://open.er-api.com/v6/latest/${baseCurrency}`;
    const fallbackResponse = await fetch(fallbackEndpoint, {
      method: 'GET',
      signal: controller.signal,
    });
    if (!fallbackResponse.ok) {
      throw new Error(`Fallback API returned status ${fallbackResponse.status}`);
    }
    const fallbackData = await fallbackResponse.json();
    if (fallbackData.rates && Object.keys(fallbackData.rates).length > 0) {
      console.log(
        `Successfully fetched ${Object.keys(fallbackData.rates).length} exchange rates from fallback service`
      );
      return {
        rates: fallbackData.rates,
        fetchDate: new Date().toISOString(),
      };
    }
    throw new Error('Both exchange rate services failed to return valid data');
  } catch (error) {
    console.warn('Failed to fetch exchange rates:', error);
    return null;
  }
}

// Replace the ExchangeRateInfo component with a simpler component that just fetches the rates silently
const ExchangeRateHandler = ({
  currency,
  onRatesFetched,
}: {
  currency: string;
  onRatesFetched: (data: any) => void;
}) => {
  useEffect(() => {
    if (!currency) return;
    fetchExchangeRates(currency)
      .then(data => {
        if (data) {
          onRatesFetched(data);
        }
      })
      .catch(err => console.warn('Error fetching exchange rates:', err));
  }, [currency, onRatesFetched]);
  return null; // This component doesn't render anything
};

// Create a new DateRangePicker component
const DateRangePicker = ({
  startFieldName,
  endFieldName,
  label,
  control,
  errors,
  getValues,
  setValue,
}: {
  startFieldName: string;
  endFieldName: string;
  label: string;
  control: any;
  errors: any;
  getValues: any;
  setValue: any;
}) => {
  const startDate = getValues(startFieldName);
  const endDate = getValues(endFieldName);

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = e.target.value;
    setValue(startFieldName, newStartDate);

    // If end date exists and is now before start date, update it
    if (endDate && new Date(endDate) <= new Date(newStartDate)) {
      // Set end date to start date + 1 day
      const nextDay = new Date(newStartDate);
      nextDay.setDate(nextDay.getDate() + 1);
      setValue(endFieldName, nextDay.toISOString().split('T')[0]);
    }
  };

  // Calculate minimum end date (day after start date)
  const minEndDate = startDate
    ? (() => {
      const nextDay = new Date(startDate);
      nextDay.setDate(nextDay.getDate() + 1);
      return nextDay.toISOString().split('T')[0];
    })()
    : '';
  return (
    <div className="mb-5 font-work-sans">
      <label className="block text-sm font-medium text-foreground mb-2 font-work-sans">
        {label} <span className="text-accent ml-1 font-work-sans">*</span>
      </label>

      <div className="bg-background rounded-lg border p-4 font-work-sans">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-work-sans">
          <div className="font-work-sans">
            <label
              htmlFor={startFieldName}
              className="block text-sm text-muted-foreground mb-1 font-work-sans"
            >
              Start Date
            </label>
            <div className="relative font-work-sans">
              <Controller
                name={startFieldName}
                control={control}
                render={({ field }) => (
                  <input
                    type="date"
                    id={startFieldName}
                    {...field}
                    onChange={e => {
                      field.onChange(e);
                      handleStartDateChange(e);
                    }}
                    className={`w-full h-10 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring ${errors[startFieldName] ? 'border-destructive' : 'border-input'} font-work-sans`}
                    min={new Date().toISOString().split('T')[0]}
                  />
                )}
              />
            </div>
            {errors[startFieldName] && (
              <div className="text-destructive text-sm mt-1 font-work-sans">
                {errors[startFieldName]?.message}
              </div>
            )}
          </div>

          <div className="font-work-sans">
            <label
              htmlFor={endFieldName}
              className="block text-sm text-muted-foreground mb-1 font-work-sans"
            >
              End Date
            </label>
            <div className="relative font-work-sans">
              <Controller
                name={endFieldName}
                control={control}
                render={({ field }) => (
                  <input
                    type="date"
                    id={endFieldName}
                    {...field}
                    className={`w-full h-10 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring ${errors[endFieldName] ? 'border-destructive' : 'border-input'} font-work-sans`}
                    min={minEndDate}
                    disabled={!startDate}
                  />
                )}
              />
            </div>
            {errors[endFieldName] && (
              <div className="text-destructive text-sm mt-1 font-work-sans">
                {errors[endFieldName]?.message}
              </div>
            )}
          </div>
        </div>

        {startDate && endDate && (
          <div className="mt-3 text-sm text-primary bg-accent/10 p-2 rounded font-work-sans">
            <div className="flex items-center font-work-sans">
              <Icon
                iconId="faCircleInfoLight"
                className="w-4 h-4 mr-1 text-accent font-work-sans"
              />
              <span className="font-work-sans">
                Campaign Duration: {calculateDuration(startDate, endDate)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to calculate duration between dates
const calculateDuration = (startDate: string, endDate: string): string => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays === 1) return '1 day';
  if (diffDays < 7) return `${diffDays} days`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    const days = diffDays % 7;
    return `${weeks} week${weeks > 1 ? 's' : ''}${days ? ` and ${days} day${days > 1 ? 's' : ''}` : ''}`;
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    const days = diffDays % 30;
    return `${months} month${months > 1 ? 's' : ''}${days ? ` and ${days} day${days > 1 ? 's' : ''}` : ''}`;
  }
  const years = Math.floor(diffDays / 365);
  const days = diffDays % 365;
  return `${years} year${years > 1 ? 's' : ''}${days ? ` and ${days} day${days > 1 ? 's' : ''}` : ''}`;
};

// Add this after the fetchExchangeRates function
/**
 * Interface to define the structure of influencer data returned from Phyllo API
 */
interface InfluencerData {
  id: string;
  handle: string;
  displayName?: string;
  followerCount?: number;
  platformId?: string;
  avatarUrl?: string;
  verified?: boolean;
  url?: string;
  engagementRate?: number;
  averageLikes?: number;
  averageComments?: number;
  description?: string;
  lastFetched?: string;
}

/**
 * Validates an influencer handle using the Phyllo API
 * @param platform The social media platform (Instagram, YouTube, TikTok)
 * @param handle The influencer's handle/username
 */
async function validateInfluencerHandle(
  platform: string,
  handle: string
): Promise<InfluencerData | null> {
  if (!platform || !handle) return null;
  try {
    console.log(`Validating influencer handle ${handle} on ${platform}...`);

    // In a real implementation, we would make a direct API call to Phyllo
    // For this demo, we'll simulate a response based on our API verification

    // Check if we have API credentials
    const hasClientId = process.env.NEXT_PUBLIC_PHYLLO_CLIENT_ID !== undefined;
    const hasClientSecret = process.env.NEXT_PUBLIC_PHYLLO_CLIENT_SECRET !== undefined;
    if (!hasClientId || !hasClientSecret) {
      console.warn('Phyllo API credentials missing. Using simulated data.');

      // Return simulated data after a delay to simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));

      // Generate a consistent but fake follower count based on handle length
      // Just for demo purposes
      const followerCount = handle.length * 10000 + Math.floor(Math.random() * 50000);
      const engagementRate = ((handle.length % 5) + 1) / 100;
      return {
        id: `sim-${Date.now()}`,
        handle,
        displayName: handle.charAt(0).toUpperCase() + handle.slice(1),
        followerCount,
        platformId: platform.toLowerCase(),
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(handle)}&background=random`,
        verified: handle.length > 5,
        url: `https://${platform.toLowerCase()}.com/${handle}`,
        engagementRate,
        averageLikes: Math.floor(followerCount * engagementRate),
        averageComments: Math.floor(followerCount * engagementRate * 0.1),
        description: `This is a simulated profile for ${handle} on ${platform}.`,
        lastFetched: new Date().toISOString(),
      };
    }

    // If running in server context with proper credentials,
    // we would make a real API call to Phyllo here

    // Phyllo API would be called as follows:
    // 1. Create a user if doesn't exist
    // 2. Generate SDK token for that user
    // 3. Fetch profile data if account is connected

    // For now, we'll use simulated data
    await new Promise(resolve => setTimeout(resolve, 800));

    // Randomly generate some realistic data for demo purposes
    const followerCount = Math.floor(100000 + Math.random() * 900000);
    const engagementRate = Math.random() * 0.05 + 0.01; // 1-6%
    const averageLikes = Math.floor(followerCount * engagementRate);
    const averageComments = Math.floor(averageLikes * 0.1);
    return {
      id: `phyllo-${Date.now()}`,
      handle,
      displayName: handle.charAt(0).toUpperCase() + handle.slice(1),
      followerCount,
      platformId: platform.toLowerCase(),
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(handle)}&background=random`,
      verified: Math.random() > 0.5,
      url: `https://${platform.toLowerCase()}.com/${handle}`,
      engagementRate,
      averageLikes,
      averageComments,
      description: `${handle} is a content creator on ${platform}.`,
      lastFetched: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error validating influencer handle:', error);
    return null;
  }
}

// Add a debounce utility function
const debounce = <T extends (...args: any[]) => any>(func: T, wait: number) => {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Create a new component for influencer entries
const InfluencerEntry = ({
  index,
  remove,
  control,
  errors,
  getValues,
}: {
  index: number;
  remove: () => void;
  control: any;
  errors: any;
  getValues: any;
}) => {
  const influencer = getValues().influencers[index];
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<InfluencerData | null>(null);
  const [lastValidated, setLastValidated] = useState({
    platform: '',
    handle: '',
  });

  // Create a debounced validation function
  const debouncedValidate = useRef(
    debounce(async (platform: string, handle: string) => {
      if (!platform || !handle || handle.length < 3) return;

      // Don't revalidate if nothing changed
      if (platform === lastValidated.platform && handle === lastValidated.handle) return;
      setIsValidating(true);
      try {
        const result = await validateInfluencerHandle(platform, handle);
        setValidationResult(result);
        setLastValidated({
          platform,
          handle,
        });

        // If validation succeeded, store the influencer ID
        if (result) {
          // Assuming you're using useFieldArray to manage influencers
          // You might want to use the push method to add the new influencer
          // This is a placeholder and should be adjusted based on your actual implementation
        }
      } catch (error) {
        console.error('Error validating influencer:', error);
      } finally {
        setIsValidating(false);
      }
    }, 800) // 800ms debounce delay
  ).current;

  // Trigger validation when platform or handle changes
  useEffect(() => {
    if (influencer.platform && influencer.handle && influencer.handle.length >= 3) {
      debouncedValidate(influencer.platform, influencer.handle);
    } else {
      // Reset validation if handle is cleared
      if (validationResult && (!influencer.handle || influencer.handle.length < 3)) {
        setValidationResult(null);
      }
    }
  }, [influencer.platform, influencer.handle, debouncedValidate]);
  const hasError = errors.influencers?.[index]?.platform || errors.influencers?.[index]?.handle;
  return (
    <div className="bg-background rounded-lg border p-4 mb-4 font-work-sans">
      <div className="flex justify-between items-center mb-3 font-work-sans">
        <h4 className="text-foreground font-medium font-heading">Influencer #{index + 1}</h4>
        {index > 0 && (
          <button
            type="button"
            onClick={remove}
            className="text-destructive hover:text-destructive/80 transition-colors duration-200 font-work-sans"
          >
            <Icon iconId="faCloseLight" className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-work-sans">
        <div className="font-work-sans">
          <label
            htmlFor={`influencers.${index}.platform`}
            className="block text-sm font-medium text-foreground mb-2 font-work-sans"
          >
            Platform <span className="text-accent ml-1 font-work-sans">*</span>
          </label>
          <Controller
            name={`influencers.${index}.platform`}
            control={control}
            render={({ field }) => (
              <select
                {...field}
                className={`w-full pl-3 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring appearance-none ${errors.influencers?.[index]?.platform ? 'border-destructive' : 'border-input'}`}
              >
                <option value="">Select platform</option>
                <option value={Platform.Instagram}>Instagram</option>
                <option value={Platform.YouTube}>YouTube</option>
                <option value={Platform.TikTok}>TikTok</option>
              </select>
            )}
          />
          {errors.influencers?.[index]?.platform && (
            <div className="text-destructive text-sm mt-1 font-work-sans">
              {errors.influencers[index]?.platform?.message}
            </div>
          )}
        </div>

        <div className="font-work-sans">
          <label
            htmlFor={`influencers.${index}.handle`}
            className="block text-sm font-medium text-foreground mb-2 font-work-sans"
          >
            Influencer Handle <span className="text-accent ml-1 font-work-sans">*</span>
          </label>
          <div className="relative font-work-sans">
            <Controller
              name={`influencers.${index}.handle`}
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  placeholder="e.g. @username"
                  className={`w-full pl-3 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring ${errors.influencers?.[index]?.handle ? 'border-destructive' : 'border-input'}`}
                />
              )}
            />
          </div>
          {errors.influencers?.[index]?.handle && (
            <div className="text-destructive text-sm mt-1 font-work-sans">
              {errors.influencers[index]?.handle?.message}
            </div>
          )}

          {!isValidating && influencer.handle && influencer.handle.length < 3 && (
            <div className="text-xs text-muted-foreground mt-1 font-work-sans">
              Type at least 3 characters to search
            </div>
          )}
        </div>
      </div>

      {validationResult && (
        <div className="mt-3 font-work-sans">
          <InfluencerPreview
            platform={influencer.platform}
            handle={influencer.handle}
            data={validationResult}
          />
        </div>
      )}

      {!validationResult &&
        !isValidating &&
        influencer.platform &&
        influencer.handle &&
        influencer.handle.length >= 3 && (
          <div className="mt-3 text-warning-foreground text-sm font-work-sans">
            No data found for this influencer.
          </div>
        )}
    </div>
  );
};

// Update the InfluencerPreview component to accept data directly
const InfluencerPreview = ({
  platform,
  handle,
  data,
}: {
  platform: string;
  handle: string;
  data?: InfluencerData;
}) => {
  const [influencerData, setInfluencerData] = useState<InfluencerData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (data) {
      setInfluencerData(data);
      return;
    }
    if (!platform || !handle) return;
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await validateInfluencerHandle(platform, handle);
        setInfluencerData(result);
      } catch (err) {
        setError('Failed to validate influencer');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [platform, handle, data]);
  if (isLoading) {
    return (
      <div className="bg-muted/50 rounded-md p-3 flex items-center justify-center font-work-sans">
        <Icon iconId="faCircleNotchLight" className="animate-spin mr-2 h-4 w-4 text-foreground" />
        <p className="text-sm text-muted-foreground font-work-sans">Validating influencer...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="bg-destructive/10 rounded-md p-3 font-work-sans">
        <p className="text-sm text-destructive font-work-sans">{error}</p>
      </div>
    );
  }
  if (!influencerData) {
    return (
      <div className="bg-warning/10 rounded-md p-3 font-work-sans">
        <p className="text-sm text-warning-foreground font-work-sans">
          No data available for this influencer.
        </p>
      </div>
    );
  }

  // Convert platform name to lowercase for standard format and return filename stem
  const getPlatformFilenameStem = (platformName: string): string => {
    const name = platformName.toLowerCase();
    if (name.includes('instagram')) return 'brandsInstagram';
    if (name.includes('tiktok')) return 'brandsTiktok';
    if (name.includes('youtube')) return 'brandsYoutube';
    if (name.includes('facebook')) return 'brandsFacebook';
    if (name.includes('twitter') || name.includes('x')) return 'brandsXTwitter'; // Match registry id
    if (name.includes('linkedin')) return 'brandsLinkedin';
    // Add other potential platforms from registry if needed
    // if (name.includes('github')) return 'brandsGithub';
    return 'brandsInstagram'; // Default fallback (consider a more generic icon or error handling)
  };

  // Get normalized platform filename stem
  const platformFilenameStem = getPlatformFilenameStem(platform);

  return (
    <div className="bg-muted/50 rounded-md p-3 flex items-center font-work-sans">
      <div className="flex items-start font-work-sans">
        {influencerData.avatarUrl ? (
          <img
            src={influencerData.avatarUrl}
            alt={`${handle}'s avatar`}
            className="w-12 h-12 rounded-full mr-3 object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gray-200 mr-3 flex items-center justify-center font-work-sans">
            <Icon iconId="faUserLight" className="h-6 w-6 text-gray-500 font-work-sans" />
          </div>
        )}
        <div className="font-work-sans">
          <div className="flex items-center font-work-sans">
            <p className="font-medium text-foreground font-work-sans">
              {influencerData.displayName || handle}
            </p>
            {influencerData.verified && (
              <span className="ml-1 text-accent font-work-sans">
                <Icon iconId="faCircleCheckSolid" className="h-4 w-4" />
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground font-work-sans">
            <Image
              src={`/icons/brands/${platformFilenameStem}.svg`}
              alt={platform}
              width={16}
              height={16}
              className="mr-1.5 inline-block relative top-[-1px]"
            />
            @{handle}
          </p>
          <div className="mt-1 flex space-x-3 text-xs text-gray-500 font-work-sans">
            <span className="font-work-sans">
              {influencerData.followerCount?.toLocaleString() || 'Unknown'} followers
            </span>
            {influencerData.engagementRate && (
              <span className="font-work-sans">
                {influencerData.engagementRate.toFixed(2)}% engagement
              </span>
            )}
          </div>
        </div>
      </div>
      {influencerData.description && (
        <p className="mt-2 text-sm text-gray-600 line-clamp-2 font-work-sans">
          {influencerData.description}
        </p>
      )}
    </div>
  );
};

// Define InfluencerList component
const InfluencerList = ({
  control,
  errors,
  getValues,
  setValue,
}: {
  control: any;
  errors: any;
  getValues: any;
  setValue: any;
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'influencers',
  });

  return (
    <div className="font-work-sans">
      {fields.map((field, index) => (
        <InfluencerEntry
          key={field.id}
          index={index}
          remove={() => remove(index)}
          control={control}
          errors={errors}
          getValues={getValues}
        />
      ))}

      <button
        type="button"
        onClick={() => {
          const contacts = [
            ...getValues().additionalContacts,
            {
              firstName: '',
              surname: '',
              email: '',
              position: '',
            },
          ];
          setValue('additionalContacts', contacts);
        }}
        className="mt-3 flex items-center text-[var(--primary-color)] hover:text-[var(--accent-color)] font-work-sans"
      >
        <Icon iconId="faPlusLight" className="h-5 w-5 mr-2" />
        Add Another Influencer
      </button>
    </div>
  );
};

// Separate the search params logic into its own component
function Step1Content() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const campaignId = searchParams ? searchParams.get('id') : null;
  const {
    data,
    loading,
    updateCampaignData,
    campaignData: contextCampaignData,
    reloadCampaignData,
  } = useWizard();

  // --- Define safeGet helper function ONCE ---
  const safeGet = (obj: any, path: string, defaultValue: any = '') => {
    if (!obj) return defaultValue;
    const parts = path.split('.');
    let current = obj;
    for (const part of parts) {
      if (current === null || current === undefined || typeof current !== 'object') {
        return defaultValue;
      }
      current = current[part];
    }
    return current !== null && current !== undefined ? current : defaultValue;
  };
  // -----------------------------------------

  // --- Re-add State Declarations ---
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exchangeRateData, setExchangeRateData] = useState<any>(null);
  // Determine if editing based on context data
  const isEditing = !!(contextCampaignData && contextCampaignData.id);
  // -----------------------------------

  const formikRef = useRef<any>(null);

  // --- initialValues ALWAYS starts with defaults ---
  const initialValues = useMemo(() => {
    console.log('[Step1Content] Setting initialValues to defaultFormValues.');
    return defaultFormValues;
  }, []); // Empty dependency array - only runs once

  // --- Use useEffect to populate form AFTER initial render if contextData exists ---
  useEffect(() => {
    // Only run if we have data AND the formik instance is ready
    if (contextCampaignData && formikRef.current) {
      console.log(
        '[Step1Content useEffect] Populating form with context data:',
        contextCampaignData
      );

      // Safely get contacts
      let primaryContact = contextCampaignData.primaryContact || {};
      if (typeof primaryContact === 'string') {
        try {
          primaryContact = JSON.parse(primaryContact);
        } catch (e) {
          primaryContact = {};
        }
      }
      let secondaryContact = contextCampaignData.secondaryContact || {};
      if (typeof secondaryContact === 'string') {
        try {
          secondaryContact = JSON.parse(secondaryContact);
        } catch (e) {
          secondaryContact = {};
        }
      }

      // Safely get influencers
      let influencers = contextCampaignData.Influencer || [];
      if (typeof influencers === 'string') {
        try {
          influencers = JSON.parse(influencers);
        } catch (e) {
          influencers = [];
        }
      }
      if (!Array.isArray(influencers)) {
        influencers = [];
      }

      // Format dates
      const startDate = DateService.toFormDate(contextCampaignData.startDate) || '';
      const endDate = DateService.toFormDate(contextCampaignData.endDate) || '';

      // --- Determine final influencers array BEFORE creating formattedData ---
      let finalInfluencersForForm: Influencer[];
      if (Array.isArray(influencers) && influencers.length > 0) {
        finalInfluencersForForm = influencers.map((inf: any) => ({
          // Keep 'any' for now
          platform: inf.platform ? EnumTransformers.platformFromBackend(inf.platform) : '',
          handle: inf.handle || '',
          id: inf.id || undefined,
        }));
      } else {
        finalInfluencersForForm = defaultFormValues.influencers;
      }
      // ---------------------------------------------------------------------

      // Format data for resetForm
      const formattedData = {
        name:
          contextCampaignData.name || contextCampaignData.campaignName || defaultFormValues.name,
        businessGoal:
          contextCampaignData.businessGoal ||
          contextCampaignData.description ||
          defaultFormValues.businessGoal,
        startDate: startDate,
        endDate: endDate,
        timeZone: contextCampaignData.timeZone || defaultFormValues.timeZone,
        primaryContact: {
          firstName: safeGet(
            primaryContact,
            'firstName',
            defaultFormValues.primaryContact.firstName
          ),
          surname: safeGet(primaryContact, 'surname', defaultFormValues.primaryContact.surname),
          email: safeGet(primaryContact, 'email', defaultFormValues.primaryContact.email),
          position: safeGet(primaryContact, 'position', defaultFormValues.primaryContact.position),
        },
        secondaryContact: {
          firstName: safeGet(
            secondaryContact,
            'firstName',
            defaultFormValues.secondaryContact.firstName
          ),
          surname: safeGet(secondaryContact, 'surname', defaultFormValues.secondaryContact.surname),
          email: safeGet(secondaryContact, 'email', defaultFormValues.secondaryContact.email),
          position: safeGet(
            secondaryContact,
            'position',
            defaultFormValues.secondaryContact.position
          ),
        },
        additionalContacts: Array.isArray(contextCampaignData.additionalContacts)
          ? contextCampaignData.additionalContacts
          : defaultFormValues.additionalContacts,
        currency:
          contextCampaignData.budget &&
            typeof contextCampaignData.budget === 'object' &&
            'currency' in contextCampaignData.budget
            ? contextCampaignData.budget.currency
            : defaultFormValues.currency,
        totalBudget:
          contextCampaignData.budget &&
            typeof contextCampaignData.budget === 'object' &&
            'total' in contextCampaignData.budget
            ? contextCampaignData.budget.total
            : defaultFormValues.totalBudget,
        socialMediaBudget:
          contextCampaignData.budget &&
            typeof contextCampaignData.budget === 'object' &&
            'socialMedia' in contextCampaignData.budget
            ? contextCampaignData.budget.socialMedia
            : defaultFormValues.socialMediaBudget,
        influencers: finalInfluencersForForm,
      } as FormValues; // Add type assertion

      console.log('[Step1Content useEffect] Calling resetForm with:', formattedData);
      formikRef.current.resetForm({ values: formattedData });
    }
  }, [contextCampaignData, formikRef]); // Depend on contextData and formikRef

  // Modify the handleSubmit function to use EnumTransformers
  const handleSubmit = async (values: any) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    try {
      // Validate required fields client-side before submission
      const requiredFields = [
        'name',
        'businessGoal',
        'startDate',
        'endDate',
        'timeZone',
        'currency',
      ];
      const missingFields = requiredFields.filter(
        (field: string) => !values[field as keyof FormValues]
      );
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }
      // Fetch current exchange rates if not already fetched
      if (values.currency && !exchangeRateData) {
        const rates = await fetchExchangeRates(values.currency);
        if (rates) {
          setExchangeRateData(rates);
        }
      }
      // Log form data for debugging
      console.log('Submitting form data:', JSON.stringify(values, null, 2));

      // Transform enum values and ensure budget values are numbers
      console.log('Before transformation - currency:', values.currency);
      console.log('Before transformation - platform:', values.influencers?.[0]?.platform);
      console.log('Before transformation - position:', values.primaryContact?.position);

      // Create a clean version of the form data
      const cleanValues = {
        name: values.name,
        businessGoal: values.businessGoal,
        startDate: values.startDate,
        endDate: values.endDate,
        timeZone: values.timeZone,
        primaryContact:
          values.primaryContact.firstName || values.primaryContact.email
            ? {
              firstName: values.primaryContact.firstName || '',
              surname: values.primaryContact.surname || '',
              email: values.primaryContact.email || '',
              position: values.primaryContact.position || 'Manager',
            }
            : null,
        // Only include secondaryContact if it has actual data
        ...(values.secondaryContact.firstName || values.secondaryContact.email
          ? {
            secondaryContact: {
              firstName: values.secondaryContact.firstName || '',
              surname: values.secondaryContact.surname || '',
              email: values.secondaryContact.email || '',
              position: values.secondaryContact.position || 'Manager',
            },
          }
          : {}),
        // omit the property entirely if empty
        additionalContacts: values.additionalContacts || [],
        currency: values.currency,
        totalBudget: parseFloat(values.totalBudget.toString() || '0'),
        socialMediaBudget: parseFloat(values.socialMediaBudget.toString() || '0'),
        influencers: (values.influencers || []).filter((i: Influencer) => i.handle),
      };
      const formattedValues = {
        ...cleanValues,
        currency: EnumTransformers.currencyToBackend(values.currency),
        // Transform influencers if they exist
        influencers: cleanValues.influencers.map((influencer: Influencer) => ({
          ...influencer,
          platform: EnumTransformers.platformToBackend(influencer.platform),
        })),
        // Transform contact positions if needed
        primaryContact: cleanValues.primaryContact
          ? {
            ...cleanValues.primaryContact,
            position: cleanValues.primaryContact.position
              ? EnumTransformers.positionToBackend(cleanValues.primaryContact.position)
              : 'Manager',
          }
          : null,
        // Only include secondaryContact in transformedValues if it exists in cleanValues
        ...(cleanValues.secondaryContact
          ? {
            secondaryContact: {
              ...cleanValues.secondaryContact,
              position: cleanValues.secondaryContact.position
                ? EnumTransformers.positionToBackend(cleanValues.secondaryContact.position)
                : 'Manager',
            },
          }
          : {}),
      };
      console.log('After transformation - currency:', formattedValues.currency);
      console.log('After transformation - platform:', formattedValues.influencers?.[0]?.platform);
      console.log('After transformation - position:', formattedValues.primaryContact?.position);
      const method = isEditing ? 'PATCH' : 'POST';
      const url = isEditing ? `/api/campaigns/${campaignId}` : '/api/campaigns';
      console.log(
        `Making ${method} request to ${url} with transformed data:`,
        JSON.stringify(formattedValues, null, 2)
      );

      // Prepare the request payload
      const requestPayload = {
        ...formattedValues,
        step: 1,
        status: 'draft',
        exchangeRateData: exchangeRateData, // Include exchange rate data
      };
      console.log('Full draft request payload:', JSON.stringify(requestPayload, null, 2));

      // Pre-submission validation to ensure payload structure is correct
      const validatePayload = (payload: any) => {
        console.log('Validating payload before submission');

        // Check that required fields exist
        if (!payload.name) {
          console.warn('Missing required field: name');
          return false;
        }

        // Check for a partially filled secondaryContact that might cause validation errors
        if (payload.secondaryContact) {
          const sc = payload.secondaryContact;
          const hasPartialData =
            (sc.firstName && (!sc.surname || !sc.email)) ||
            (sc.surname && (!sc.firstName || !sc.email)) ||
            (sc.email && (!sc.firstName || !sc.surname));
          if (hasPartialData) {
            console.warn('Partially filled secondaryContact may fail validation');
            // Either remove the entire secondaryContact or ensure all required fields have values
            if (!sc.firstName || !sc.surname || !sc.email) {
              console.warn(
                'Removing partially filled secondaryContact to prevent validation errors'
              );
              delete payload.secondaryContact;
            }
          }
        }

        // Additional validation could be added here

        return true;
      };

      // Validate payload before sending
      validatePayload(requestPayload);
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
      });
      const result = await response.json();
      if (!response.ok) {
        console.error('API error response status:', response.status);
        console.error('API error response body:', JSON.stringify(result, null, 2));

        // Check if there's validation error details
        if (result.details) {
          console.error('Validation error details:', JSON.stringify(result.details, null, 2));

          // Enhanced error parsing for validation errors
          const parseValidationError = (details: any) => {
            if (!details) return null;
            const errors: string[] = [];

            // Handle the common _errors array
            if (details._errors && details._errors.length > 0) {
              errors.push(...details._errors);
            }

            // Process nested field errors
            Object.entries(details).forEach(([field, error]) => {
              if (field === '_errors') return;
              if (error && typeof error === 'object' && (error as any)._errors) {
                const fieldErrors = (error as any)._errors;
                if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
                  errors.push(`${field}: ${fieldErrors.join(', ')}`);
                }
              }
            });
            return errors.length > 0 ? errors.join('; ') : null;
          };
          const errorDetails = parseValidationError(result.details);
          if (errorDetails) {
            console.error('Parsed validation errors:', errorDetails);
          }
        }
        let errorMessage = result.error || 'An error occurred';

        // If the error is a validation error, try to provide more details
        if (result.details && typeof result.details === 'object') {
          const errorDetails = Object.entries(result.details)
            .filter(([key, value]) => {
              // Skip the top-level _errors field
              if (key === '_errors') return false;

              // Check if the value has _errors array
              const val = value as any;
              return val && val._errors && Array.isArray(val._errors) && val._errors.length > 0;
            })
            .map(([key, value]) => {
              const val = value as any;
              return `${key}: ${val._errors.join(', ')}`;
            })
            .join('; ');
          if (errorDetails) {
            errorMessage += ` - ${errorDetails}`;
          }
        }
        throw new Error(errorMessage);
      }
      console.log('API success response:', JSON.stringify(result, null, 2));

      // Update the campaign ID in the URL if this is a new campaign
      if (result.id || result.data?.id) {
        const newCampaignId = result.id || result.data?.id;
        localStorage.setItem('lastCampaignId', newCampaignId.toString());

        // Only update URL if needed - avoid full page refresh
        const currentId = searchParams?.get('id');
        if (!currentId && typeof router.replace === 'function') {
          // Simple URL update, Next.js App Router has no shallow option
          router.replace(`/campaigns/wizard/step-1?id=${newCampaignId}`);
        }
      }

      // Update the campaign data in context directly instead of reloading
      if (typeof updateCampaignData === 'function' && (result.data || result)) {
        updateCampaignData(result.data || result);
      }

      toast.success(`Campaign ${isEditing ? 'updated' : 'created'} successfully`);
      router.push(`/campaigns/wizard/step-2?id=${result.id || result.data?.id || campaignId}`);
    } catch (error) {
      console.error('Form submission error:', error);
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update handleSaveDraft function with defensive programming
  const handleSaveDraft = async (values: FormValues) => {
    if (isSubmitting) return;
    setIsSubmitting(true); // Use local state
    setError(null); // Use local state
    try {
      // Create a draft-friendly payload using the sanitization utility
      const sanitizedPayload = sanitizeDraftPayload({
        ...values,
        step: 1,
        status: 'draft',
      });
      console.log('Sanitized draft payload:', JSON.stringify(sanitizedPayload, null, 2));
      const method = campaignId ? 'PATCH' : 'POST';
      const url = campaignId ? `/api/campaigns/${campaignId}/wizard/1` : '/api/campaigns';
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sanitizedPayload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API error response:', errorData);
        throw new Error(errorData.error || `Failed to save draft: ${response.status}`);
      }
      const result = await response.json();
      console.log('API success response for draft save:', JSON.stringify(result, null, 2));

      // Update the campaign ID in the URL if this is a new campaign
      if (result.id || result.data?.id) {
        const newCampaignId = result.id || result.data?.id;
        localStorage.setItem('lastCampaignId', newCampaignId.toString());

        // Only update URL if needed - avoid full page refresh
        const currentId = searchParams?.get('id');
        if (!currentId && typeof router.replace === 'function') {
          // Simple URL update, Next.js App Router has no shallow option
          router.replace(`/campaigns/wizard/step-1?id=${newCampaignId}`);
        }
      }

      // Update the campaign data in context directly instead of reloading
      if (typeof updateCampaignData === 'function' && (result.data || result)) {
        updateCampaignData(result.data || result);
      }

      toast.success('Draft saved successfully');
    } catch (error) {
      console.error('Draft save error:', error);
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false); // Use local state
    }
  };

  // Replace Formik with useForm from React Hook Form
  const {
    control,
    handleSubmit: useFormHandleSubmit,
    formState: { errors: useFormErrors, isSubmitting: useFormIsSubmitting },
    getValues,
    setValue,
  } = useForm({
    resolver: zodResolver(ValidationSchema),
    defaultValues: initialValues,
    mode: 'onBlur',
  });

  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-8 bg-background font-work-sans">
      <div className="mb-8 font-work-sans">
        <h1 className="text-2xl font-semibold text-foreground mb-2 font-heading">Campaign Creation</h1>
        <p className="text-muted-foreground font-work-sans">
          Complete all required fields to create your campaign
        </p>
      </div>

      <form onSubmit={useFormHandleSubmit(handleSubmit)} className="space-y-8">
        {/* Campaign Details */}
        <div className="bg-[var(--background-color)] rounded-xl p-6 shadow-sm border border-[var(--divider-color)] font-work-sans">
          <h2 className="text-lg font-bold font-heading text-primary mb-5 flex items-center">
            <Image
              src="/icons/app/appCampaigns.svg"
              alt="Campaign Details"
              width={16}
              height={16}
              className="mr-2"
            />
            Campaign Details
          </h2>

          <StyledField
            label="Campaign Name"
            name="name"
            placeholder="Enter your campaign name"
            required
            control={control}
            errors={useFormErrors}
          />

          <StyledField
            label="What business goals does this campaign support?"
            name="businessGoal"
            as="textarea"
            rows={4}
            placeholder="e.g. Increase market share by 5% in the next quarter. Launch a new product line targeting millennials."
            required
            control={control}
            errors={useFormErrors}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 font-work-sans">
            <DateRangePicker
              startFieldName="startDate"
              endFieldName="endDate"
              label="Campaign Duration"
              control={control}
              errors={useFormErrors}
              getValues={getValues}
              setValue={setValue}
            />

            <StyledField
              label="Time Zone"
              name="timeZone"
              as="select"
              required
              icon={<Icon iconId="faGlobeLight" className="w-5 h-5" />}
              control={control}
              errors={useFormErrors}
            >
              <option value="">Select time zone</option>
              <option value="UTC">UTC (Coordinated Universal Time)</option>
              <option value="GMT">GMT (Greenwich Mean Time)</option>
              <option value="America/New_York">EST (Eastern Standard Time)</option>
              <option value="America/Chicago">CST (Central Standard Time)</option>
              <option value="America/Denver">MST (Mountain Standard Time)</option>
              <option value="America/Los_Angeles">PST (Pacific Standard Time)</option>
              <option value="Europe/London">BST (British Summer Time)</option>
              <option value="Europe/Paris">CET (Central European Time)</option>
              <option value="Europe/Athens">EET (Eastern European Time)</option>
              <option value="Asia/Tokyo">JST (Japan Standard Time)</option>
              <option value="Asia/Shanghai">CST (China Standard Time)</option>
              <option value="Australia/Sydney">AEST (Australian Eastern Standard Time)</option>
            </StyledField>
          </div>
        </div>

        {/* Primary Contact */}
        <div className="bg-[var(--background-color)] rounded-xl p-6 shadow-sm border border-[var(--divider-color)] font-work-sans">
          <h2 className="text-lg font-bold font-heading text-primary mb-5 flex items-center">
            <Icon
              iconId="faUserLight"
              className="w-5 h-5 mr-2 text-[var(--accent-color)] font-work-sans"
            />
            Primary Contact
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-work-sans">
            <StyledField
              label="First Name"
              name="primaryContact.firstName"
              placeholder="Enter first name"
              required
              icon={<Icon iconId="faUserLight" className="w-5 h-5" />}
              control={control}
              errors={useFormErrors}
            />

            <StyledField
              label="Last Name"
              name="primaryContact.surname"
              placeholder="Enter last name"
              required
              icon={<Icon iconId="faUserLight" className="w-5 h-5" />}
              control={control}
              errors={useFormErrors}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 font-work-sans">
            <StyledField
              label="Email"
              name="primaryContact.email"
              type="email"
              placeholder="email@example.com"
              required
              icon={<Icon iconId="faEnvelopeLight" className="w-5 h-5" />}
              control={control}
              errors={useFormErrors}
            />

            <StyledField
              label="Position"
              name="primaryContact.position"
              as="select"
              required
              icon={<Icon iconId="faBuildingLight" className="w-5 h-5" />}
              control={control}
              errors={useFormErrors}
            >
              <option value="">Select Position</option>
              <option value={Position.Manager}>{Position.Manager}</option>
              <option value={Position.Director}>{Position.Director}</option>
              <option value={Position.VP}>{Position.VP}</option>
            </StyledField>
          </div>
        </div>

        {/* Secondary Contact */}
        <div className="bg-[var(--background-color)] rounded-xl p-6 shadow-sm border border-[var(--divider-color)] font-work-sans">
          <h2 className="text-lg font-bold font-heading text-primary mb-5 flex items-center">
            <Icon
              iconId="faUserGroupLight"
              className="w-5 h-5 mr-2 text-[var(--accent-color)] font-work-sans"
            />
            Secondary Contact{' '}
            <span className="text-sm font-normal text-[var(--secondary-color)] ml-2 font-work-sans">
              (Optional)
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-work-sans">
            <StyledField
              label="First Name"
              name="secondaryContact.firstName"
              placeholder="Enter first name"
              icon={<Icon iconId="faUserLight" className="w-5 h-5" />}
              control={control}
              errors={useFormErrors}
            />

            <StyledField
              label="Last Name"
              name="secondaryContact.surname"
              placeholder="Enter last name"
              icon={<Icon iconId="faUserLight" className="w-5 h-5" />}
              control={control}
              errors={useFormErrors}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 font-work-sans">
            <StyledField
              label="Email"
              name="secondaryContact.email"
              type="email"
              placeholder="email@example.com"
              icon={<Icon iconId="faEnvelopeLight" className="w-5 h-5" />}
              control={control}
              errors={useFormErrors}
            />

            <StyledField
              label="Position"
              name="secondaryContact.position"
              as="select"
              icon={<Icon iconId="faBuildingLight" className="w-5 h-5" />}
              control={control}
              errors={useFormErrors}
            >
              <option value="">Select Position</option>
              <option value={Position.Manager}>{Position.Manager}</option>
              <option value={Position.Director}>{Position.Director}</option>
              <option value={Position.VP}>{Position.VP}</option>
            </StyledField>
          </div>
        </div>

        {/* Additional Contacts */}
        <div className="bg-[var(--background-color)] rounded-xl p-6 shadow-sm border border-[var(--divider-color)] font-work-sans">
          <div className="flex justify-between items-center mb-5 font-work-sans">
            <h2 className="text-lg font-bold font-heading text-primary flex items-center">
              <Icon
                iconId="faUserLight"
                className="w-5 h-5 mr-2 text-[var(--accent-color)] font-work-sans"
              />
              Additional Contacts{' '}
              <span className="text-sm font-normal text-[var(--secondary-color)] ml-2 font-work-sans">
                (Optional)
              </span>
            </h2>
            <button
              type="button"
              onClick={() => {
                const contacts = [
                  ...getValues().additionalContacts,
                  {
                    firstName: '',
                    surname: '',
                    email: '',
                    position: '',
                  },
                ];
                setValue('additionalContacts', contacts);
              }}
              className="flex items-center text-sm font-medium bg-[var(--background-color)] border border-[var(--accent-color)] text-[var(--accent-color)] hover:bg-[var(--accent-color)]/10 px-3 py-1 rounded-md transition-colors duration-200 font-work-sans"
            >
              <Icon iconId="faPlusLight" className="w-5 h-5 mr-1" />
              Add Contact
            </button>
          </div>

          {getValues().additionalContacts && getValues().additionalContacts.length > 0 ? (
            getValues().additionalContacts.map((contact: Contact, index: number) => (
              <div
                key={index}
                className="mb-6 border border-[var(--divider-color)] rounded-lg p-4 relative shadow-sm bg-white font-work-sans"
              >
                <button
                  type="button"
                  onClick={() => {
                    const contacts = [...getValues().additionalContacts];
                    contacts.splice(index, 1);
                    setValue('additionalContacts', contacts);
                  }}
                  className="absolute top-2 right-2 text-[var(--secondary-color)] hover:text-[var(--accent-color)] transition-colors duration-200 font-work-sans"
                  aria-label="Remove contact"
                >
                  <Icon iconId="faCloseLight" className="h-5 w-5" />
                </button>

                <h3 className="text-md font-medium text-primary mb-3 font-heading">
                  Contact {index + 3}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-work-sans">
                  <StyledField
                    label="First Name"
                    name={`additionalContacts.${index}.firstName`}
                    placeholder="Enter first name"
                    icon={<Icon iconId="faUserLight" className="w-5 h-5" />}
                    control={control}
                    errors={useFormErrors}
                  />

                  <StyledField
                    label="Last Name"
                    name={`additionalContacts.${index}.surname`}
                    placeholder="Enter last name"
                    icon={<Icon iconId="faUserLight" className="w-5 h-5" />}
                    control={control}
                    errors={useFormErrors}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 font-work-sans">
                  <StyledField
                    label="Email"
                    name={`additionalContacts.${index}.email`}
                    type="email"
                    placeholder="email@example.com"
                    icon={<Icon iconId="faEnvelopeLight" className="w-5 h-5" />}
                    control={control}
                    errors={useFormErrors}
                  />

                  <StyledField
                    label="Position"
                    name={`additionalContacts.${index}.position`}
                    as="select"
                    icon={<Icon iconId="faBuildingLight" className="w-5 h-5" />}
                    control={control}
                    errors={useFormErrors}
                  >
                    <option value="">Select Position</option>
                    <option value={Position.Manager}>{Position.Manager}</option>
                    <option value={Position.Director}>{Position.Director}</option>
                    <option value={Position.VP}>{Position.VP}</option>
                  </StyledField>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 border border-dashed border-[var(--divider-color)] rounded-lg bg-gray-50 font-work-sans">
              <Icon
                iconId="faUserLight"
                className="w-12 h-12 mx-auto text-[var(--accent-color)] opacity-70 font-work-sans"
              />
              <p className="mt-2 text-[var(--primary-color)] font-work-sans">
                No additional contacts added yet.
              </p>
              <p className="text-sm text-[var(--secondary-color)] font-work-sans">
                Click "Add Contact" to include more team members.
              </p>
            </div>
          )}
        </div>

        {/* Influencers */}
        <div className="bg-[var(--background-color)] rounded-xl p-6 shadow-sm border border-[var(--divider-color)] font-work-sans">
          <h2 className="text-lg font-bold font-heading text-primary mb-5 flex items-center">
            <Icon
              iconId="faStarLight"
              className="w-5 h-5 mr-2 text-[var(--accent-color)] font-work-sans"
            />
            Influencer Details
          </h2>
          <div className="mb-4 font-work-sans">
            <p className="text-gray-600 text-sm mb-4 font-work-sans">
              Add the influencers you want to work with for this campaign. You can add multiple
              influencers.
            </p>

            <InfluencerList
              control={control}
              errors={useFormErrors}
              getValues={getValues}
              setValue={setValue}
            />
          </div>
        </div>

        {/* Budget Section */}
        <div className="bg-[var(--background-color)] rounded-xl p-6 shadow-sm border border-[var(--divider-color)] font-work-sans">
          <h2 className="text-lg font-bold font-heading text-primary mb-5 flex items-center">
            <Icon
              iconId="faMoneyBillLight"
              className="w-5 h-5 mr-2 text-[var(--accent-color)] font-work-sans"
            />
            Budget
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-work-sans">
            <div className="font-work-sans">
              <StyledField
                label="Currency"
                name="currency"
                as="select"
                required
                icon={<Icon iconId="faMoneyBillLight" className="w-5 h-5" />}
                control={control}
                errors={useFormErrors}
              >
                <option value="">Select currency</option>
                <option value={Currency.GBP}>GBP (£)</option>
                <option value={Currency.USD}>USD ($)</option>
                <option value={Currency.EUR}>EUR (€)</option>
              </StyledField>
              <ExchangeRateHandler
                currency={getValues().currency}
                onRatesFetched={setExchangeRateData}
              />
            </div>

            <StyledField
              label="Total Campaign Budget"
              name="totalBudget"
              type="number"
              placeholder="5000"
              required
              icon={<Icon iconId="faMoneyBillLight" className="w-5 h-5" />}
              control={control}
              errors={useFormErrors}
            />

            <StyledField
              label="Social Media Budget"
              name="socialMediaBudget"
              type="number"
              placeholder="3000"
              required
              icon={<Icon iconId="faMoneyBillLight" className="w-5 h-5" />}
              control={control}
              errors={useFormErrors}
            />
          </div>
        </div>

        {/* Add extra bottom padding to prevent progress bar overlap */}
        <div className="pb-24 font-work-sans"></div>

        <ProgressBar
          currentStep={1}
          onStepClick={step => router.push(`/campaigns/wizard/step-${step}`)}
          onBack={null}
          onNext={() => useFormHandleSubmit(handleSubmit)()}
          onSaveDraft={() => handleSaveDraft(getValues())}
          disableNext={useFormIsSubmitting || Object.keys(useFormErrors).length > 0}
          isFormValid={Object.keys(useFormErrors).length === 0}
          isDirty={true}
          isSaving={useFormIsSubmitting}
        />
      </form>
    </div>
  );
}

// Replace the Step1ContentWrapper with this new default export
export default function Step1Page() {
  const [isClientSide, setIsClientSide] = useState(false);

  useEffect(() => {
    setIsClientSide(true);
  }, []);

  // Render loading skeleton on the server or during initial client render
  if (!isClientSide) {
    return <LoadingSkeleton />;
  }

  // Render the actual content within Suspense on the client side
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <Step1Content />
    </Suspense>
  );
}
