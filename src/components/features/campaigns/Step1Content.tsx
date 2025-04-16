'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  useForm,
  useFieldArray,
  UseFormReturn,
  FormProvider,
  useFormContext,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWizard } from '@/components/features/campaigns/WizardContext';
import {
  Step1ValidationSchema,
  Step1FormData,
  DraftCampaignData,
  PlatformEnumFrontend,
  PlatformEnumBackend,
  CurrencyEnum,
  PositionEnum,
  platformToFrontend,
  PlatformSchema,
  InfluencerSchema,
} from '@/components/features/campaigns/types';
import { WizardSkeleton } from '@/components/ui/loading-skeleton';
import { Icon } from '@/components/ui/icon/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { ProgressBarWizard } from '@/components/ui/progress-bar-wizard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { differenceInDays, isValid as isValidDate } from 'date-fns';
import { IconButtonAction } from '@/components/ui/button-icon-action';
import timezonesData from '@/lib/timezones.json'; // Import the static timezone data
import { logger } from '@/lib/logger';

// --- Formatting Helpers ---

/** Formats a number string into a currency-like string with commas. */
const formatCurrencyInput = (value: string | number | undefined | null): string => {
  if (value === null || value === undefined) return '';
  const stringValue = String(value).replace(/[^\d]/g, ''); // Remove non-digits
  if (stringValue === '') return '';
  try {
    // Use Intl.NumberFormat for robust formatting
    return new Intl.NumberFormat('en-US').format(parseInt(stringValue, 10));
  } catch (e) {
    console.error('Error formatting number:', e);
    return stringValue; // Fallback to unformatted number string on error
  }
};

/** Parses a formatted currency string back into a raw number string. */
const parseCurrencyInput = (formattedValue: string): string => {
  return formattedValue.replace(/[^\d]/g, ''); // Remove non-digits (commas, etc.)
};

// --- Influencer Entry Component ---
interface InfluencerEntryProps {
  index: number;
  control: UseFormReturn<Step1FormData>['control'];
  errors: UseFormReturn<Step1FormData>['formState']['errors'];
  remove: (index: number) => void;
}

const InfluencerEntry: React.FC<InfluencerEntryProps> = ({ index, control, errors, remove }) => {
  const { watch } = useFormContext<Step1FormData>();

  const _watchedPlatform = watch(`Influencer.${index}.platform`);
  const _watchedHandle = watch(`Influencer.${index}.handle`);

  // Placeholder values for validation until hook is implemented
  const _isValidating = false;
  const _validationData = null;

  return (
    <Card className="mb-4 border-border bg-card/50 relative overflow-hidden">
      <CardContent className="p-4 space-y-4">
        <div className="flex justify-end absolute top-2 right-2">
          <IconButtonAction
            iconBaseName="faTrashCan"
            hoverColorClass="text-destructive"
            ariaLabel="Remove Influencer"
            className="h-7 w-7"
            onClick={() => remove(index)}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <FormField
            control={control}
            name={`Influencer.${index}.platform`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Platform *</FormLabel>
                <Select
                  onValueChange={frontendValue => {
                    try {
                      const backendValue = PlatformSchema.parse(frontendValue);
                      field.onChange(backendValue);
                    } catch {
                      field.onChange(undefined);
                    }
                  }}
                  value={field.value ? platformToFrontend(field.value) : undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PlatformEnumFrontend.options.map(platform => (
                      <SelectItem key={platform} value={platform}>
                        {platform}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage>{errors.Influencer?.[index]?.platform?.message}</FormMessage>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`Influencer.${index}.handle`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Handle / Username *</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input placeholder="@username or channel_name" {...field} />
                    {/* *** Spinner COMMENTED OUT - Depends on hook *** */}
                    {/* {isValidating && ( ... )} */}
                  </div>
                </FormControl>
                <FormMessage>{errors.Influencer?.[index]?.handle?.message}</FormMessage>
                {/* *** Error description COMMENTED OUT - Depends on hook *** */}
                {/* {!isValidating && validationData === null && watchedHandle && watchedHandle.length >= 3 && validationError && ( ... )} */}
              </FormItem>
            )}
          />
        </div>
        {/* *** InfluencerCard display COMMENTED OUT - Depends on hook *** */}
        {/* {!isValidating && validationData && ( ... )} */}
      </CardContent>
    </Card>
  );
};

// Helper types
// Type for influencer data within the Step 1 form (MUST align with Step1FormData -> InfluencerSchema -> PlatformEnumBackend)
// type Step1Influencer = z.infer<typeof InfluencerSchema>; // REMOVED Unused Type
// Type for influencer data when preparing payload for context/API (already uses Backend enum)
// type PayloadInfluencer = z.infer<typeof InfluencerSchema>; // REMOVED Unused Type
// Type for influencer data coming from the context (uses Backend enum)
type ContextInfluencer = z.infer<typeof InfluencerSchema>;

// --- Add Helper Functions ---

/**
 * Detects user's timezone using an IP Geolocation API.
 */
async function detectUserTimezone(): Promise<string> {
  try {
    // Prefer ipgeolocation.io if key is available
    const ipGeoApiKey = process.env.NEXT_PUBLIC_IPGEOLOCATION_API_KEY;
    const endpoint = ipGeoApiKey
      ? `https://api.ipgeolocation.io/ipgeo?apiKey=${ipGeoApiKey}`
      : 'https://ipapi.co/json/'; // Fallback

    console.log('Detecting user timezone from IP Geolocation API...');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3-second timeout

    const response = await fetch(endpoint, {
      method: 'GET',
      signal: controller.signal,
      headers: { Accept: 'application/json' }, // Needed for ipapi.co
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }
    const data = await response.json();

    // Extract timezone based on API used
    const timezone = ipGeoApiKey ? data.time_zone?.name : data.timezone;

    if (!timezone) {
      console.warn('Timezone not found in API response:', data);
      return 'UTC'; // Fallback if timezone field is missing
    }

    console.log('Detected timezone:', timezone);
    return timezone;
  } catch (error) {
    console.warn('Failed to detect timezone:', error);
    return 'UTC'; // Default fallback on error
  }
}

// --- Duration Helper ---
const calculateDuration = (
  startStr: string | null | undefined,
  endStr: string | null | undefined
): string => {
  // Explicitly handle null/undefined/empty inputs
  if (!startStr || !endStr) return '...';

  const startDate = new Date(startStr);
  const endDate = new Date(endStr);

  // Check for invalid date parsing
  if (!isValidDate(startDate) || !isValidDate(endDate) || endDate < startDate) {
    return '...';
  }

  const days = differenceInDays(endDate, startDate) + 1; // Inclusive
  return `${days} day${days !== 1 ? 's' : ''}`;
};

function Step1Content() {
  const { wizardState, updateWizardState, isLoading, saveProgress, stepsConfig } = useWizard();
  const router = useRouter();
  const initialDataLoaded = useRef(false);
  const [detectedTimezone, setDetectedTimezone] = useState<string | null>(null);

  // Ensure all hooks are called unconditionally at the top level
  useEffect(() => {
    detectUserTimezone().then(tz => {
      setDetectedTimezone(tz);
      console.log('Timezone detection complete.', tz);
    });
  }, []);

  const form = useForm<Step1FormData>({
    resolver: zodResolver(Step1ValidationSchema),
    defaultValues: {
      name: '',
      businessGoal: '',
      brand: '',
      website: '',
      startDate: null,
      endDate: null,
      timeZone: 'GMT',
      primaryContact: {
        firstName: '',
        surname: '',
        email: '',
        position: PositionEnum.Values.Director,
      },
      secondaryContact: {
        firstName: '',
        surname: '',
        email: '',
        position: PositionEnum.Values.Director,
      },
      additionalContacts: [],
      budget: {
        currency: CurrencyEnum.Values.USD,
        total: 0,
        socialMedia: 0,
      },
      Influencer: [
        { id: `new-${Date.now()}`, platform: PlatformEnumBackend.Values.INSTAGRAM, handle: '' },
      ],
    },
    mode: 'onChange',
  });

  useEffect(() => {
    if (((!isLoading && wizardState) || detectedTimezone) && !initialDataLoaded.current) {
      if (isLoading || detectedTimezone === null) return;

      console.log(
        '[Step1Content useEffect] Resetting form with wizardState and detected timezone:',
        wizardState,
        detectedTimezone
      );

      const formattedData: Step1FormData = {
        name: wizardState?.name || '',
        businessGoal: wizardState?.businessGoal || '',
        brand: wizardState?.brand || '',
        website: wizardState?.website || '',
        startDate: wizardState?.startDate || null,
        endDate: wizardState?.endDate || null,
        timeZone: wizardState?.timeZone || detectedTimezone || 'GMT',
        primaryContact: {
          firstName: wizardState?.primaryContact?.firstName || '',
          surname: wizardState?.primaryContact?.surname || '',
          email: wizardState?.primaryContact?.email || '',
          position: (wizardState?.primaryContact?.position &&
          PositionEnum.safeParse(wizardState.primaryContact.position).success
            ? wizardState.primaryContact.position
            : PositionEnum.Values.Director) as z.infer<typeof PositionEnum>,
        },
        secondaryContact: {
          firstName: wizardState?.secondaryContact?.firstName || '',
          surname: wizardState?.secondaryContact?.surname || '',
          email: wizardState?.secondaryContact?.email || '',
          position: (wizardState?.secondaryContact?.position &&
          PositionEnum.safeParse(wizardState.secondaryContact.position).success
            ? wizardState.secondaryContact.position
            : PositionEnum.Values.Director) as z.infer<typeof PositionEnum>,
        },
        additionalContacts: Array.isArray(wizardState?.additionalContacts)
          ? wizardState.additionalContacts.map(contact => ({
              firstName: contact?.firstName || '',
              surname: contact?.surname || '',
              email: contact?.email || '',
              position: (contact?.position && PositionEnum.safeParse(contact.position).success
                ? contact.position
                : PositionEnum.Values.Director) as z.infer<typeof PositionEnum>,
            }))
          : [],
        budget: {
          currency: (wizardState?.budget?.currency &&
          CurrencyEnum.safeParse(wizardState.budget.currency).success
            ? wizardState.budget.currency
            : CurrencyEnum.Values.USD) as z.infer<typeof CurrencyEnum>,
          total: parseFloat(wizardState?.budget?.total?.toString() || '0') || 0,
          socialMedia: parseFloat(wizardState?.budget?.socialMedia?.toString() || '0') || 0,
        },
        Influencer:
          Array.isArray(wizardState?.Influencer) && wizardState.Influencer.length > 0
            ? wizardState.Influencer.map((inf: unknown) => {
                // Ensure properties are strings or provide defaults
                const id =
                  typeof inf === 'object' &&
                  inf !== null &&
                  'id' in inf &&
                  typeof inf.id === 'string'
                    ? inf.id
                    : `new-${Date.now()}`;
                const platformValue =
                  typeof inf === 'object' && inf !== null && 'platform' in inf
                    ? inf.platform
                    : undefined;
                const handleValue =
                  typeof inf === 'object' &&
                  inf !== null &&
                  'handle' in inf &&
                  typeof inf.handle === 'string'
                    ? inf.handle
                    : '';

                return {
                  id: id,
                  platform: (platformValue && PlatformEnumBackend.safeParse(platformValue).success
                    ? platformValue
                    : PlatformEnumBackend.Values.INSTAGRAM) as z.infer<typeof PlatformEnumBackend>,
                  handle: handleValue,
                };
              })
            : [
                {
                  id: `new-${Date.now()}`,
                  platform: PlatformEnumBackend.Values.INSTAGRAM,
                  handle: '',
                },
              ],
      };

      console.log(
        '[Step1Content useEffect] Calling form.reset with formatted data:',
        formattedData
      );
      form.reset(formattedData as Step1FormData);
      initialDataLoaded.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, wizardState, detectedTimezone, form.reset]);

  const {
    fields,
    append: appendInfluencer,
    remove: removeInfluencer,
  } = useFieldArray({
    control: form.control,
    name: 'Influencer',
  });

  const {
    fields: contactFields,
    append: appendContact,
    remove: removeContact,
  } = useFieldArray({
    control: form.control,
    name: 'additionalContacts',
  });

  const handleStepClick = (step: number) => {
    if (wizardState?.campaignId && step === 1) {
      router.push(`/campaigns/wizard/step-1?id=${wizardState.campaignId}`);
    }
  };

  const onSubmitAndNavigate = async () => {
    const isValid = await form.trigger();
    if (!isValid) {
      return;
    }
    const data = form.getValues();
    const payload: Partial<DraftCampaignData> = {
      name: data.name,
      businessGoal: data.businessGoal,
      brand: data.brand,
      website: data.website,
      startDate: data.startDate,
      endDate: data.endDate,
      timeZone: data.timeZone,
      primaryContact: data.primaryContact,
      secondaryContact: data.secondaryContact,
      additionalContacts: Array.isArray(data.additionalContacts) ? data.additionalContacts : [],
      budget: {
        total: parseFloat(String(data.budget?.total || '0')) || 0,
        socialMedia: parseFloat(String(data.budget?.socialMedia || '0')) || 0,
        currency: data.budget?.currency as z.infer<typeof CurrencyEnum>,
      },
      Influencer: Array.isArray(data.Influencer)
        ? data.Influencer.filter(
            (inf): inf is ContextInfluencer => !!inf?.id && !!inf?.platform && !!inf?.handle
          )
        : [],
      step1Complete: true,
      currentStep: 2,
    };
    updateWizardState(payload);
    const savedCampaignId = await saveProgress(payload);
    if (savedCampaignId) {
      logger.info('Save successful, navigating to Step 2.');
      router.push(`/campaigns/wizard/step-2?id=${savedCampaignId}`);
    } else {
      logger.error('Save failed, navigation aborted.');
    }
  };

  if (isLoading && !wizardState) {
    return <WizardSkeleton step={1} />;
  }

  return (
    <>
      <ProgressBarWizard
        currentStep={1}
        steps={stepsConfig}
        onStepClick={handleStepClick}
        onBack={null}
        onNext={onSubmitAndNavigate}
        isNextDisabled={!form.formState.isValid}
        isNextLoading={form.formState.isSubmitting || isLoading}
        getCurrentFormData={form.getValues}
      />
      <FormProvider {...form}>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmitAndNavigate)}
            className="space-y-6 pt-8 pb-[var(--footer-height)]"
          >
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Enter the core details for your campaign.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Campaign Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Summer Sale Launch" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="businessGoal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Goal</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="What is the main objective?"
                            {...field}
                            value={field.value ?? ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="brand"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Acme Corporation" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://www.example.com"
                            {...field}
                            value={field.value ?? ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Schedule & Timezone</CardTitle>
                <CardDescription>
                  Set the campaign dates and select the relevant timezone.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-1 space-y-4">
                  <div>
                    <FormLabel>Campaign Duration *</FormLabel>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                      <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col relative">
                            <FormLabel className="text-xs font-medium absolute top-1 left-3 bg-background px-1 z-10 text-muted-foreground">
                              Start Date
                            </FormLabel>
                            <DatePicker
                              value={field.value ? new Date(field.value) : undefined}
                              onChange={(date: Date | undefined) => {
                                field.onChange(date ? date.toISOString() : null);
                                form.trigger('endDate');
                              }}
                              displayFormat="dd/MM/yyyy"
                              className="w-full pt-3"
                              placeholder="Select Start Date"
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => {
                          const currentStartDateStr = form.getValues('startDate') as string | null;
                          const disabledBefore = (date: Date) => {
                            if (!currentStartDateStr) return false;
                            const currentStartDate = new Date(currentStartDateStr);
                            if (!isValidDate(currentStartDate)) return false;
                            return date < currentStartDate;
                          };
                          return (
                            <FormItem className="flex flex-col relative">
                              <FormLabel className="text-xs font-medium absolute top-1 left-3 bg-background px-1 z-10 text-muted-foreground">
                                End Date
                              </FormLabel>
                              <DatePicker
                                value={field.value ? new Date(field.value) : undefined}
                                onChange={(date: Date | undefined) => {
                                  field.onChange(date ? date.toISOString() : null);
                                  form.trigger('endDate');
                                }}
                                displayFormat="dd/MM/yyyy"
                                className="w-full pt-3"
                                placeholder="Select End Date"
                                disabled={disabledBefore}
                              />
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />
                    </div>
                    <Alert variant="default" className="mt-4">
                      <AlertDescription className="flex items-center text-sm">
                        <Icon iconId="faCircleInfoLight" className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>
                          Campaign Duration:{' '}
                          {calculateDuration(
                            form.getValues('startDate') as string | null,
                            form.getValues('endDate') as string | null
                          )}
                        </span>
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>
                <div className="md:col-span-1">
                  <FormField
                    control={form.control}
                    name="timeZone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time Zone *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ''}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <div className="flex items-center">
                                <Icon
                                  iconId="faGlobeLight"
                                  className="mr-2 h-4 w-4 text-muted-foreground"
                                />
                                <SelectValue placeholder="Select timezone...">
                                  {field.value
                                    ? timezonesData.find(opt => opt.value === field.value)?.label ||
                                      field.value
                                    : 'Select timezone...'}
                                </SelectValue>
                              </div>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {timezonesData.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>Primary contact is required.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="text-md font-semibold mb-3 text-foreground">Primary Contact *</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-md bg-card/50">
                    <FormField
                      control={form.control}
                      name="primaryContact.firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="primaryContact.surname"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Surname</FormLabel>
                          <FormControl>
                            <Input placeholder="Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="primaryContact.email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="john.doe@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="primaryContact.position"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Position</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || PositionEnum.Values.Director}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select position" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {PositionEnum.options.map(pos => (
                                <SelectItem key={pos} value={pos}>
                                  {pos}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <div>
                  <h4 className="text-md font-semibold mb-3 text-foreground">
                    Secondary Contact (Optional)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-md bg-card/50">
                    <FormField
                      control={form.control}
                      name="secondaryContact.firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Jane" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="secondaryContact.surname"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Surname</FormLabel>
                          <FormControl>
                            <Input placeholder="Smith" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="secondaryContact.email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="jane.smith@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="secondaryContact.position"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Position</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || PositionEnum.Values.Director}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select position" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {PositionEnum.options.map(pos => (
                                <SelectItem key={pos} value={pos}>
                                  {pos}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <div className="space-y-4 mt-6">
                  {contactFields.length > 0 && (
                    <h4 className="text-md font-semibold mb-3 text-foreground">
                      Additional Contacts
                    </h4>
                  )}
                  {contactFields.map((item, index) => (
                    <div
                      key={item.id}
                      className="p-4 border rounded-md bg-card/50 relative space-y-4"
                    >
                      <IconButtonAction
                        iconBaseName="faTrashCan"
                        hoverColorClass="text-destructive"
                        ariaLabel={`Remove Additional Contact ${index + 1}`}
                        className="absolute top-2 right-2 h-7 w-7"
                        onClick={() => removeContact(index)}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <FormField
                          control={form.control}
                          name={`additionalContacts.${index}.firstName`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Alex" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`additionalContacts.${index}.surname`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Surname</FormLabel>
                              <FormControl>
                                <Input placeholder="Chen" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`additionalContacts.${index}.email`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input
                                  type="email"
                                  placeholder="alex.chen@example.com"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`additionalContacts.${index}.position`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Position</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value || PositionEnum.Values.Director}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select position" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {PositionEnum.options.map(pos => (
                                    <SelectItem key={pos} value={pos}>
                                      {pos}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() =>
                    appendContact({
                      firstName: '',
                      surname: '',
                      email: '',
                      position: PositionEnum.Values.Director,
                    })
                  }
                >
                  <Icon iconId="faPlusLight" className="mr-2 h-4 w-4" /> Add Additional Contact
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Budget & Influencers</CardTitle>
                <CardDescription>Define the budget and add influencer(s).</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <FormField
                    control={form.control}
                    name="budget.currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={(field.value as string | undefined) || CurrencyEnum.Values.USD}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CurrencyEnum.options.map(curr => (
                              <SelectItem key={curr} value={curr}>
                                {curr}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="budget.total"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Budget *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="text"
                              placeholder="5,000"
                              {...field}
                              value={formatCurrencyInput(
                                field.value !== null && field.value !== undefined
                                  ? String(field.value)
                                  : ''
                              )}
                              onChange={e => field.onChange(parseCurrencyInput(e.target.value))}
                              className="pl-7"
                            />
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                              {form.getValues('budget.currency') === 'GBP'
                                ? '£'
                                : form.getValues('budget.currency') === 'EUR'
                                  ? '€'
                                  : '$'}
                            </span>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="budget.socialMedia"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Social Media Budget *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="text"
                              placeholder="1,000"
                              {...field}
                              value={formatCurrencyInput(
                                field.value !== null && field.value !== undefined
                                  ? String(field.value)
                                  : ''
                              )}
                              onChange={e => field.onChange(parseCurrencyInput(e.target.value))}
                              className="pl-7"
                            />
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                              {form.getValues('budget.currency') === 'GBP'
                                ? '£'
                                : form.getValues('budget.currency') === 'EUR'
                                  ? '€'
                                  : '$'}
                            </span>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="mt-4">
                  <FormLabel className="text-md font-semibold">Influencer(s) *</FormLabel>
                  <FormDescription className="mb-4">
                    Add the influencer(s) you want to work with.
                  </FormDescription>
                  <div className="space-y-4">
                    {fields.map((item, index) => (
                      <InfluencerEntry
                        key={item.id}
                        index={index}
                        control={form.control}
                        errors={form.formState.errors}
                        remove={removeInfluencer}
                      />
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() =>
                      appendInfluencer({
                        id: `new-${Date.now()}`,
                        platform: PlatformEnumBackend.Values.INSTAGRAM,
                        handle: '',
                      })
                    }
                  >
                    <Icon iconId="faPlusLight" className="mr-2 h-4 w-4" /> Add Influencer
                  </Button>
                  {form.formState.errors.Influencer?.root && (
                    <p className="text-sm font-medium text-destructive mt-2">
                      {form.formState.errors.Influencer.root.message}
                    </p>
                  )}
                  {form.formState.errors.Influencer &&
                    !form.formState.errors.Influencer.root &&
                    typeof form.formState.errors.Influencer.message === 'string' && (
                      <p className="text-sm font-medium text-destructive mt-2">
                        {form.formState.errors.Influencer.message}
                      </p>
                    )}
                </div>
              </CardContent>
            </Card>
          </form>
        </Form>
      </FormProvider>
    </>
  );
}

export default Step1Content;
