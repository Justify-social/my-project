'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller, useFieldArray, UseFormReturn, FormProvider, useFormContext, SubmitHandler, FieldArrayWithId, FieldPath } from 'react-hook-form';
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
import { toast } from 'react-hot-toast';
import { LoadingSkeleton, WizardSkeleton } from '@/components/ui/loading-skeleton';
import { Icon } from '@/components/ui/icon/icon';
import Image from 'next/image';
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
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import debounce from 'lodash/debounce';
import { AutosaveIndicator } from "@/components/ui/autosave-indicator";
import { InfluencerCard } from "@/components/ui/card-influencer";
import { ProgressBarWizard } from "@/components/ui/progress-bar-wizard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
        console.error("Error formatting number:", e);
        return stringValue; // Fallback to unformatted number string on error
    }
};

/** Parses a formatted currency string back into a raw number string. */
const parseCurrencyInput = (formattedValue: string): string => {
    return formattedValue.replace(/[^\d]/g, ''); // Remove non-digits (commas, etc.)
};

// --- Placeholder Influencer Validation Logic & Types ---
interface InfluencerData {
    id: string; handle: string; displayName?: string; followerCount?: number;
    platformId?: string; avatarUrl?: string; verified?: boolean; url?: string;
    engagementRate?: number; averageLikes?: number; averageComments?: number;
    description?: string; lastFetched?: string;
}
async function validateInfluencerHandle(platform: string | undefined, handle: string): Promise<InfluencerData | null> {
    if (!platform) return null;
    console.log(`Simulating validation for ${handle} on ${platform}...`);
    await new Promise(resolve => setTimeout(resolve, 500));
    if (handle.length < 3) return null;
    const isValid = Math.random() > 0.2;
    if (!isValid) return null;
    const followerCount = handle.length * 10000 + Math.floor(Math.random() * 50000);
    return {
        id: `sim-${Date.now()}`,
        handle,
        displayName: handle.charAt(0).toUpperCase() + handle.slice(1),
        followerCount,
        platformId: platform.toLowerCase(),
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(handle)}&background=random`,
        verified: handle.length > 5,
        url: `https://${platform.toLowerCase()}.com/${handle}`,
        engagementRate: ((handle.length % 5) + 1) / 100,
        averageLikes: Math.floor(followerCount * (((handle.length % 5) + 1) / 100)),
        averageComments: Math.floor(followerCount * (((handle.length % 5) + 1) / 100) * 0.1),
        description: `Simulated profile for ${handle}.`,
        lastFetched: new Date().toISOString(),
    };
}

// --- Influencer Entry Component ---
interface InfluencerEntryProps {
    index: number;
    control: UseFormReturn<Step1FormData>['control'];
    errors: UseFormReturn<Step1FormData>['formState']['errors'];
    remove: (index: number) => void;
}

const InfluencerEntry: React.FC<InfluencerEntryProps> = ({ index, control, errors, remove }) => {
    const [isValidating, setIsValidating] = useState(false);
    const [validationData, setValidationData] = useState<InfluencerData | null>(null);

    // Define state type to match the expected enum value from the field
    const [currentPlatform, setCurrentPlatform] = useState<z.infer<typeof PlatformEnumBackend> | undefined>(undefined);
    const [currentHandle, setCurrentHandle] = useState<string | undefined>(undefined);

    const triggerValidation = useCallback(async (platform: string | undefined, handle: string) => {
        if (!platform || !handle || handle.length < 3) {
            setValidationData(null);
            setIsValidating(false);
            return;
        }
        setIsValidating(true);
        setValidationData(null);
        try {
            const result = await validateInfluencerHandle(platform, handle);
            setValidationData(result);
            if (!result) {
                console.warn(`Validation failed for ${handle} on ${platform}`);
            }
        } catch (error) {
            console.error("Error validating influencer:", error);
            toast.error("Failed to validate influencer handle.");
        } finally {
            setIsValidating(false);
        }
    }, []);

    const debouncedValidate = useCallback(debounce(triggerValidation, 800), [triggerValidation]);

    useEffect(() => {
        // Pass the platform value (which is the backend enum) directly
        debouncedValidate(currentPlatform, currentHandle || '');
        return () => {
            debouncedValidate.cancel();
        };
    }, [currentPlatform, currentHandle, debouncedValidate]);

    const influencerError = errors.Influencer && errors.Influencer[index as unknown as keyof typeof errors.Influencer] ? ((errors.Influencer[index as unknown as keyof typeof errors.Influencer] as any)?.handle?.message || (errors.Influencer[index as unknown as keyof typeof errors.Influencer] as any)?.platform?.message) : undefined;

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
                        render={({ field }) => {
                            // Update local state when field value changes
                            useEffect(() => {
                                // Type of field.value should match PlatformEnumBackend here
                                setCurrentPlatform(field.value);
                            }, [field.value]);

                            return (
                                <FormItem>
                                    <FormLabel>Platform *</FormLabel>
                                    <Select
                                        onValueChange={(frontendValue) => {
                                            try {
                                                const backendValue = PlatformSchema.parse(frontendValue);
                                                field.onChange(backendValue);
                                            }
                                            catch (e) {
                                                field.onChange(undefined);
                                            }
                                        }}
                                        value={field.value ? platformToFrontend(field.value) : undefined}
                                    >
                                        <FormControl>
                                            <SelectTrigger><SelectValue placeholder="Select platform" /></SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {PlatformEnumFrontend.options.map((platform) => (<SelectItem key={platform} value={platform}>{platform}</SelectItem>))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage>{errors.Influencer && (errors.Influencer[index as unknown as keyof typeof errors.Influencer] as any)?.platform?.message}</FormMessage>
                                </FormItem>
                            );
                        }}
                    />
                    <FormField
                        control={control}
                        name={`Influencer.${index}.handle`}
                        render={({ field }) => {
                            // Update local state when field value changes
                            useEffect(() => {
                                // field.value for handle is string
                                setCurrentHandle(field.value);
                            }, [field.value]);

                            return (
                                <FormItem>
                                    <FormLabel>Handle / Username *</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input placeholder="@username or channel_name" {...field} />
                                            {isValidating && (
                                                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                                    <Icon iconId="faSpinnerThirdLight" className="h-4 w-4 text-muted-foreground animate-spin" />
                                                </div>
                                            )}
                                        </div>
                                    </FormControl>
                                    <FormMessage>{errors.Influencer && (errors.Influencer[index as unknown as keyof typeof errors.Influencer] as any)?.handle?.message}</FormMessage>
                                    {!isValidating && validationData === null && currentHandle && currentHandle.length >= 3 && (
                                        <FormDescription className="text-destructive flex items-center text-xs pt-1">
                                            <Icon iconId="faCircleXmarkLight" className="h-3 w-3 mr-1" />
                                            Handle not found or failed validation.
                                        </FormDescription>
                                    )}
                                </FormItem>
                            );
                        }}
                    />
                </div>
                {!isValidating && validationData && currentPlatform && (
                    <div className="mt-2">
                        <InfluencerCard
                            platform={currentPlatform}
                            handle={validationData.handle}
                            displayName={validationData.displayName}
                            avatarUrl={validationData.avatarUrl}
                            followerCount={validationData.followerCount}
                            engagementRate={validationData.engagementRate}
                            verified={validationData.verified}
                            profileUrl={validationData.url}
                            className="bg-background border-green-200"
                        />
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

// Helper types
// Type for influencer data within the Step 1 form (MUST align with Step1FormData -> InfluencerSchema -> PlatformEnumBackend)
type Step1Influencer = z.infer<typeof InfluencerSchema>; // Use the Zod schema type directly
// Type for influencer data when preparing payload for context/API (already uses Backend enum)
type PayloadInfluencer = z.infer<typeof InfluencerSchema>; // Use the Zod schema type directly
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
            headers: { 'Accept': 'application/json' }, // Needed for ipapi.co
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


/**
 * Fetches exchange rates from an external API.
 */
async function fetchExchangeRates(baseCurrency: string = 'USD'): Promise<{
    rates: Record<string, number> | null;
    fetchDate: string;
} | null> {
    const exchangeRatesApiKey = process.env.NEXT_PUBLIC_EXCHANGERATES_API_KEY;

    if (!exchangeRatesApiKey) {
        console.error('Error: NEXT_PUBLIC_EXCHANGERATES_API_KEY is not defined in the environment variables.');
        return null; // Cannot proceed without API key
    }

    const endpoint = `https://api.exchangeratesapi.io/v1/latest?access_key=${exchangeRatesApiKey}&base=${baseCurrency}`;
    const usedApi = 'exchangeratesapi.io';

    console.log(`Fetching rates for ${baseCurrency} from ${usedApi}...`);

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5-second timeout

        const response = await fetch(endpoint, {
            method: 'GET',
            signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorBody = await response.text();
            let errorMessage = `${usedApi} API returned status ${response.status}`;
            try {
                const errorJson = JSON.parse(errorBody);
                if (errorJson?.error?.message) {
                    errorMessage += `: ${errorJson.error.message}`;
                } else if (errorJson?.error?.code) {
                    errorMessage += ` (Code: ${errorJson.error.code})`;
                }
            } catch (e) { /* Ignore parsing error, just use status */ }
            console.error(errorMessage, `| Raw Response: ${errorBody}`);
            // Throw the specific error message if available
            throw new Error(errorMessage);
        }

        const data = await response.json();

        // Check for success flag and rates object
        if (data.success === true && data.rates && Object.keys(data.rates).length > 0) {
            console.log(`Successfully fetched ${Object.keys(data.rates).length} exchange rates from ${usedApi}.`);
            return {
                rates: data.rates,
                fetchDate: data.timestamp ? new Date(data.timestamp * 1000).toISOString() : new Date().toISOString(), // Use API timestamp if available
            };
        } else {
            // Handle cases where success might be false or rates are missing
            console.warn(`API call to ${usedApi} succeeded (status ${response.status}) but response indicates failure or missing rates:`, data);
            throw new Error(`API indicated failure or missing rates: ${JSON.stringify(data?.error || data)}`);
        }

    } catch (error) {
        // Log the caught error (could be fetch error or error thrown above)
        console.error(`Failed to fetch exchange rates from ${usedApi}:`, error);
        return null; // Return null on any failure
    }
}

// --- Duration Helper ---
const calculateDuration = (startStr: string | null | undefined, endStr: string | null | undefined): string => {
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
    const { wizardState, updateWizardState, isLoading, saveProgress, lastSaved, autosaveEnabled, setAutosaveEnabled, stepsConfig } = useWizard();
    const router = useRouter();
    const initialDataLoaded = useRef(false);
    const [detectedTimezone, setDetectedTimezone] = useState<string | null>(null);
    const [exchangeRateData, setExchangeRateData] = useState<any>(null); // State for exchange rates
    // Get searchParams once
    const searchParams = useMemo(() => new URLSearchParams(typeof window !== 'undefined' ? window.location.search : ''), []);


    // Effect to detect timezone on mount
    useEffect(() => {
        detectUserTimezone().then(tz => {
            setDetectedTimezone(tz);
            console.log("Timezone detection complete.", tz);
        });
    }, []); // Empty dependency array means run once on mount

    // Initialize form with static defaults - PROVIDE EXPLICIT TYPE
    const form = useForm<z.infer<typeof Step1ValidationSchema>>({
        resolver: zodResolver(Step1ValidationSchema),
        defaultValues: {
            name: '',
            businessGoal: '',
            brand: '',
            website: '',
            startDate: null,
            endDate: null,
            timeZone: 'GMT',
            primaryContact: { firstName: '', surname: '', email: '', position: PositionEnum.Values.Director },
            secondaryContact: { firstName: '', surname: '', email: '', position: PositionEnum.Values.Director },
            additionalContacts: [],
            // Nest budget fields
            budget: {
                currency: CurrencyEnum.Values.USD,
                total: 0, // Use number for default
                socialMedia: 0, // Use number for default
            },
            Influencer: [{ id: `new-${Date.now()}`, platform: PlatformEnumBackend.Values.INSTAGRAM, handle: '' }], // Start empty handle
        },
        mode: 'onChange',
    });

    // Effect to reset form when data is loaded from context OR timezone is detected
    useEffect(() => {
        if ((!isLoading && wizardState || detectedTimezone) && !initialDataLoaded.current) {
            // Ensure we only reset ONCE after BOTH data is loaded AND timezone is detected (if applicable)
            if (isLoading || detectedTimezone === null) {
                // Still waiting for data or timezone
                return;
            }

            console.log("[Step1Content useEffect] Resetting form with wizardState and detected timezone:", wizardState, detectedTimezone);

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
                    position: (wizardState?.primaryContact?.position && PositionEnum.safeParse(wizardState.primaryContact.position).success
                        ? wizardState.primaryContact.position
                        : PositionEnum.Values.Director) as z.infer<typeof PositionEnum>,
                },
                secondaryContact: {
                    firstName: wizardState?.secondaryContact?.firstName || '',
                    surname: wizardState?.secondaryContact?.surname || '',
                    email: wizardState?.secondaryContact?.email || '',
                    position: (wizardState?.secondaryContact?.position && PositionEnum.safeParse(wizardState.secondaryContact.position).success
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
                    currency: (wizardState?.budget?.currency && CurrencyEnum.safeParse(wizardState.budget.currency).success
                        ? wizardState.budget.currency
                        : CurrencyEnum.Values.USD) as z.infer<typeof CurrencyEnum>,
                    total: parseFloat(wizardState?.budget?.total?.toString() || '0') || 0,
                    socialMedia: parseFloat(wizardState?.budget?.socialMedia?.toString() || '0') || 0,
                },
                Influencer: Array.isArray(wizardState?.Influencer) && wizardState.Influencer.length > 0
                    ? wizardState.Influencer.map((inf: any) => ({
                        id: inf?.id || `new-${Date.now()}`,
                        platform: (inf?.platform && PlatformEnumBackend.safeParse(inf.platform).success
                            ? inf.platform
                            : PlatformEnumBackend.Values.INSTAGRAM) as z.infer<typeof PlatformEnumBackend>,
                        handle: inf?.handle || '',
                    }))
                    : [{ id: `new-${Date.now()}`, platform: PlatformEnumBackend.Values.INSTAGRAM, handle: '' }], // Start empty handle
            };

            console.log("[Step1Content useEffect] Calling form.reset with formatted data:", formattedData);
            form.reset(formattedData);
            initialDataLoaded.current = true; // Mark as loaded
        }
    }, [isLoading, wizardState, detectedTimezone, form.reset]);

    // UseFieldArray hooks (CORRECTED - no type assertions)
    const { fields, append: appendInfluencer, remove: removeInfluencer } = useFieldArray({
        control: form.control,
        name: "Influencer",
    });

    const { fields: contactFields, append: appendContact, remove: removeContact } = useFieldArray({
        control: form.control,
        name: 'additionalContacts',
    });

    // Watch relevant fields for side effects
    const watchedCurrency = form.watch('budget.currency'); // Watch specifically for currency changes

    // Watch timezone field
    const watchedTimezone = form.watch('timeZone');

    // Effect to fetch exchange rates when currency changes
    useEffect(() => {
        // Ensure watchedCurrency is a valid string before fetching
        if (watchedCurrency && typeof watchedCurrency === 'string' && watchedCurrency.length > 0) { // Re-enabled currency watching
            console.log(`Currency changed to: ${watchedCurrency}. Fetching exchange rates...`);
            fetchExchangeRates(watchedCurrency).then(data => { // Use watchedCurrency
                if (data) {
                    setExchangeRateData(data);
                    console.log("Exchange rates fetched:", data); // General log message
                    // Optional: Autosave trigger
                } else {
                    setExchangeRateData(null);
                    console.warn("Failed to fetch exchange rates for", watchedCurrency);
                }
            });
        } else {
            setExchangeRateData(null); // Clear if currency is invalid/unset
        }
    }, [watchedCurrency]); // Dependency: run when watchedCurrency changes

    const filteredInfluencers = useMemo(() => {
        const influencers = wizardState?.Influencer;
        if (!Array.isArray(influencers)) return [];
        return influencers.filter((inf): inf is ContextInfluencer => !!inf?.platform && !!inf?.handle);
    }, [wizardState?.Influencer]);

    const filteredContacts = useMemo(() => {
        const contacts = wizardState?.additionalContacts;
        if (!Array.isArray(contacts)) return [];
        return contacts.filter((contact) => !!contact?.email);
    }, [wizardState?.additionalContacts]);


    // --- AUTOSAVE LOGIC (COMMENTED OUT) --- 
    /*
        // Ref to store the latest form and context values for the debounced function
        const latestStateRef = useRef({
            isDirty: form.formState.isDirty,
            isLoading: isLoading,
            isValid: form.formState.isValid,
            autosaveEnabled: autosaveEnabled,
            wizardState: wizardState,
            getValues: form.getValues,
            trigger: form.trigger,
            updateWizardState: updateWizardState,
            searchParams: searchParams,
        });
    
        // Update the ref whenever relevant state/props change
        useEffect(() => {
            latestStateRef.current = {
                isDirty: form.formState.isDirty,
                isLoading: isLoading,
                isValid: form.formState.isValid,
                autosaveEnabled: autosaveEnabled,
                wizardState: wizardState,
                getValues: form.getValues,
                trigger: form.trigger,
                updateWizardState: updateWizardState,
                searchParams: searchParams,
            };
        }, [form.formState.isDirty, isLoading, form.formState.isValid, autosaveEnabled, wizardState, form.getValues, form.trigger, updateWizardState, searchParams]);
    
        // Create the debounced function using useRef to keep it stable
        const debouncedSaveRef = useRef(
            debounce(() => {
                // Access the LATEST state values via the ref inside the debounced function
                const { 
                    isDirty,
                    isLoading: currentIsLoading,
                    isValid: currentIsValid,
                    autosaveEnabled: currentAutosaveEnabled,
                    wizardState: currentWizardState,
                    getValues,
                    trigger,
                    updateWizardState: currentUpdateWizardState,
                    searchParams: currentSearchParams
                } = latestStateRef.current;
    
                console.log('[Debounced Save] Executing. Checking conditions...');
                console.log('[Debounced Save] Conditions:', { currentAutosaveEnabled, currentIsLoading, isDirty });
    
                if (!currentAutosaveEnabled || currentIsLoading || !isDirty) {
                     console.log('[Debounced Save] Skipped.');
                     return;
                }
                
                const campaignIdFromUrl = currentSearchParams?.get('id');
                const currentCampaignId = currentWizardState?.campaignId || campaignIdFromUrl;
                if (!currentCampaignId) {
                     console.log('[Debounced Save] Skipped: Campaign ID is missing.');
                    return;
                }
    
                console.log('[Debounced Save] Conditions met. Triggering validation for campaign:', currentCampaignId);
    
                trigger().then((isValidNow) => {
                    if (!isValidNow) {
                        console.warn('[Debounced Save] Payload generation skipped: Form validation failed.');
                        return;
                    }
                    const currentData = getValues();
                    const payload: Partial<DraftCampaignData> = {
                        // ... payload construction ...
                        name: currentData.name,
                        businessGoal: currentData.businessGoal,
                        startDate: currentData.startDate instanceof Date ? currentData.startDate.toISOString() : currentData.startDate || undefined,
                        endDate: currentData.endDate instanceof Date ? currentData.endDate.toISOString() : currentData.endDate || undefined,
                        timeZone: currentData.timeZone,
                        primaryContact: currentData.primaryContact,
                        secondaryContact: currentData.secondaryContact,
                        additionalContacts: Array.isArray(currentData.additionalContacts) ? currentData.additionalContacts : [],
                        budget: {
                            total: parseFloat(String(currentData.budget?.total || '0')) || 0,
                            socialMedia: parseFloat(String(currentData.budget?.socialMedia || '0')) || 0,
                            currency: currentData.budget?.currency as z.infer<typeof CurrencyEnum>,
                        },
                        Influencer: Array.isArray(currentData.Influencer)
                            ? currentData.Influencer.filter((inf): inf is ContextInfluencer => !!inf?.platform && !!inf?.handle)
                            : [],
                        step1Complete: isValidNow,
                        currentStep: 1,
                    };
                    console.log('[Debounced Save] Updating wizard state with payload:', JSON.stringify(payload, null, 2));
                    currentUpdateWizardState(payload);
                    console.log('[Debounced Save] Wizard state updated. Context will handle actual saving.');
                });
            }, 2000)
        ).current;
    
        // useEffect hook to trigger the debounced save
        useEffect(() => {
            console.log('[Autosave Trigger useEffect] Checking conditions...');
            // ... (conditions check) ...
            if (!isLoading && form.formState.isDirty && autosaveEnabled) {
                console.log('[Autosave Trigger useEffect] Conditions met. Calling debounced function.');
                debouncedSaveRef();
            } else {
                // ... (log skip reason) ...
                console.log(`[Autosave Trigger useEffect] Conditions not met. Skipping debounce call. Reason: ${reason}`);
            }
            return () => {
                console.log('[Autosave Trigger useEffect] Cleaning up. Cancelling debounced save.');
                debouncedSaveRef.cancel();
            };
        }, [isLoading, form.formState.isDirty, autosaveEnabled, debouncedSaveRef]);
    */
    // --- END AUTOSAVE LOGIC ---

    const handleStepClick = (step: number) => {
        if (wizardState?.campaignId && step === 1) {
            router.push(`/campaigns/wizard/step-1?id=${wizardState.campaignId}`);
        }
        // Add logic for other steps if needed, potentially saving first
    };

    const onSubmitAndNavigate = async () => {
        const isValid = await form.trigger();
        if (!isValid) {
            toast.error("Please fix the errors before proceeding.");
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
                ? data.Influencer.filter((inf): inf is ContextInfluencer => !!inf?.id && !!inf?.platform && !!inf?.handle) // Filter valid influencers
                : [],
            step1Complete: true, // Explicitly mark step 1 as complete on successful submit
            currentStep: 2, // Set current step to the next step
        };

        console.log("Submitting Step 1 data and navigating:", payload);
        updateWizardState(payload); // Update state first

        // Ensure save completes before navigating and get the ID
        const savedCampaignId = await saveProgress(payload);

        if (savedCampaignId) { // Check if we got an ID back
            logger.info("Save successful, navigating to Step 2."); // Use logger
            // Use the returned/confirmed ID for navigation
            router.push(`/campaigns/wizard/step-2?id=${savedCampaignId}`);
        } else {
            toast.error("Failed to save progress before navigating.");
            logger.error("Save failed, navigation aborted."); // Use logger
        }
    };

    if (isLoading && !wizardState) {
        return <WizardSkeleton step={1} />;
    }

    const getAutosaveStatus = () => {
        // Reflect saving state based on context's isLoading, potentially add isSaving from context if available
        if (isLoading) return 'saving'; // Might need refinement if context provides a specific isSaving flag
        if (lastSaved) return 'success';
        return 'idle';
    };

    return (
        <>
            <ProgressBarWizard
                currentStep={1}
                steps={stepsConfig}
                onStepClick={handleStepClick}
                onBack={null} // No back button on Step 1
                onNext={onSubmitAndNavigate}
                isNextDisabled={!form.formState.isValid} // Disable next if form invalid
                isNextLoading={form.formState.isSubmitting || isLoading} // Reflect loading state
                getCurrentFormData={form.getValues}
            />
            <FormProvider {...form}> {/* Use FormProvider if passing form methods down */}
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmitAndNavigate)} className="space-y-6 pt-8 pb-[var(--footer-height)]">
                        <Card>
                            <CardHeader>
                                <CardTitle>Basic Information</CardTitle>
                                <CardDescription>Enter the core details for your campaign.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Row 1: Campaign Name & Business Goal */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Campaign Name *</FormLabel><FormControl><Input placeholder="Summer Sale Launch" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="businessGoal" render={({ field }) => (<FormItem><FormLabel>Business Goal</FormLabel><FormControl><Textarea placeholder="What is the main objective?" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                                </div>
                                {/* Row 2: Brand & Website */}
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
                                                    <Input placeholder="https://www.example.com" {...field} value={field.value ?? ''} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* --- NEW CARD for Schedule & Timezone --- */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Schedule & Timezone</CardTitle>
                                <CardDescription>Set the campaign dates and select the relevant timezone.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Campaign Duration Section (Moved Here) */}
                                <div className="md:col-span-1 space-y-4"> {/* Container for Duration */}
                                    <div> {/* Group for Duration Inputs + Display */}
                                        <FormLabel>Campaign Duration *</FormLabel>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2"> {/* Added mt-2 */}
                                            {/* Start Date Field */}
                                            <FormField
                                                control={form.control}
                                                name="startDate"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-col relative">
                                                        <FormLabel className="text-xs font-medium absolute top-1 left-3 bg-background px-1 z-10 text-muted-foreground">Start Date</FormLabel>
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
                                            {/* End Date Field */}
                                            <FormField
                                                control={form.control}
                                                name="endDate"
                                                render={({ field }) => {
                                                    // Get string value and CAST to expected type
                                                    const currentStartDateStr = form.getValues("startDate") as string | null;
                                                    const disabledBefore = (date: Date) => {
                                                        if (!currentStartDateStr) return false; // Check if string exists
                                                        const currentStartDate = new Date(currentStartDateStr);
                                                        if (!isValidDate(currentStartDate)) {
                                                            return false; // Don't disable if start date is invalid
                                                        }
                                                        // Disable dates strictly BEFORE the start date
                                                        return date < currentStartDate;
                                                    };

                                                    return (
                                                        <FormItem className="flex flex-col relative">
                                                            <FormLabel className="text-xs font-medium absolute top-1 left-3 bg-background px-1 z-10 text-muted-foreground">End Date</FormLabel>
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
                                        {/* Campaign Duration Display */}
                                        <Alert variant="default" className="mt-4">
                                            <AlertDescription className="flex items-center text-sm">
                                                <Icon iconId="faCircleInfoLight" className="h-4 w-4 mr-2 flex-shrink-0" />
                                                <span>Campaign Duration: {calculateDuration(form.getValues('startDate') as string | null, form.getValues('endDate') as string | null)}</span>
                                            </AlertDescription>
                                        </Alert>
                                    </div>
                                </div>

                                {/* Timezone Section (Moved Here) */}
                                <div className="md:col-span-1"> {/* Container for Timezone */}
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
                                                                <Icon iconId="faGlobeLight" className="mr-2 h-4 w-4 text-muted-foreground" />
                                                                <SelectValue placeholder="Select timezone...">
                                                                    {/* Display formatted label of selected timezone */}
                                                                    {field.value ? (timezonesData.find(opt => opt.value === field.value)?.label || field.value) : 'Select timezone...'}
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
                        {/* --- END NEW CARD --- */}

                        <Card>
                            <CardHeader>
                                <CardTitle>Contact Information</CardTitle>
                                <CardDescription>Primary contact is required.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <h4 className="text-md font-semibold mb-3 text-foreground">Primary Contact *</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-md bg-card/50">
                                        <FormField control={form.control} name="primaryContact.firstName" render={({ field }) => (<FormItem><FormLabel>First Name</FormLabel><FormControl><Input placeholder="John" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <FormField control={form.control} name="primaryContact.surname" render={({ field }) => (<FormItem><FormLabel>Surname</FormLabel><FormControl><Input placeholder="Doe" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <FormField control={form.control} name="primaryContact.email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="john.doe@example.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <FormField control={form.control} name="primaryContact.position" render={({ field }) => (<FormItem><FormLabel>Position</FormLabel><Select onValueChange={field.onChange} value={field.value || PositionEnum.Values.Director}><FormControl><SelectTrigger><SelectValue placeholder="Select position" /></SelectTrigger></FormControl><SelectContent>{PositionEnum.options.map(pos => (<SelectItem key={pos} value={pos}>{pos}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-md font-semibold mb-3 text-foreground">Secondary Contact (Optional)</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-md bg-card/50">
                                        <FormField control={form.control} name="secondaryContact.firstName" render={({ field }) => (<FormItem><FormLabel>First Name</FormLabel><FormControl><Input placeholder="Jane" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <FormField control={form.control} name="secondaryContact.surname" render={({ field }) => (<FormItem><FormLabel>Surname</FormLabel><FormControl><Input placeholder="Smith" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <FormField control={form.control} name="secondaryContact.email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="jane.smith@example.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <FormField control={form.control} name="secondaryContact.position" render={({ field }) => (<FormItem><FormLabel>Position</FormLabel><Select onValueChange={field.onChange} value={field.value || PositionEnum.Values.Director}><FormControl><SelectTrigger><SelectValue placeholder="Select position" /></SelectTrigger></FormControl><SelectContent>{PositionEnum.options.map(pos => (<SelectItem key={pos} value={pos}>{pos}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                                    </div>
                                </div>

                                {/* Additional Contacts Section */}
                                <div className="space-y-4 mt-6"> {/* Added margin-top */}
                                    {/* Render header only if there are contacts or potential to add */}
                                    {(contactFields.length > 0) && (
                                        <h4 className="text-md font-semibold mb-3 text-foreground">Additional Contacts</h4>
                                    )}
                                    {contactFields.map((item, index) => (
                                        <div key={item.id} className="p-4 border rounded-md bg-card/50 relative space-y-4">
                                            {/* Optional: Header per contact entry */}
                                            {/* <h5 className="text-sm font-semibold text-muted-foreground">Additional Contact {index + 1}</h5> */}
                                            <IconButtonAction
                                                iconBaseName="faTrashCan"
                                                hoverColorClass="text-destructive"
                                                ariaLabel={`Remove Additional Contact ${index + 1}`}
                                                className="absolute top-2 right-2 h-7 w-7"
                                                onClick={() => removeContact(index)}
                                            />
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                                <FormField control={form.control} name={`additionalContacts.${index}.firstName`} render={({ field }) => (<FormItem><FormLabel>First Name</FormLabel><FormControl><Input placeholder="Alex" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                <FormField control={form.control} name={`additionalContacts.${index}.surname`} render={({ field }) => (<FormItem><FormLabel>Surname</FormLabel><FormControl><Input placeholder="Chen" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                <FormField control={form.control} name={`additionalContacts.${index}.email`} render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="alex.chen@example.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                <FormField control={form.control} name={`additionalContacts.${index}.position`} render={({ field }) => (
                                                    <FormItem><FormLabel>Position</FormLabel>
                                                        {/* Revert value prop to use default enum */}
                                                        <Select onValueChange={field.onChange} value={field.value || PositionEnum.Values.Director}>
                                                            <FormControl><SelectTrigger><SelectValue placeholder="Select position" /></SelectTrigger></FormControl>
                                                            <SelectContent>{PositionEnum.options.map(pos => (<SelectItem key={pos} value={pos}>{pos}</SelectItem>))}</SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>)}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Add Additional Contact Button */}
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="mt-4"
                                    // Provide default structure matching ContactSchema
                                    onClick={() => appendContact({
                                        firstName: '',
                                        surname: '',
                                        email: '',
                                        position: PositionEnum.Values.Director // Ensure this matches your schema/defaults
                                    })}
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
                                    <FormField control={form.control} name="budget.currency" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Currency *</FormLabel>
                                            <Select onValueChange={field.onChange} value={(field.value as string | undefined) || CurrencyEnum.Values.USD}>
                                                <FormControl>
                                                    <SelectTrigger><SelectValue placeholder="Select currency" /></SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {CurrencyEnum.options.map(curr => (<SelectItem key={curr} value={curr}>{curr}</SelectItem>))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="budget.total" render={({ field }) => (
                                        <FormItem><FormLabel>Total Budget *</FormLabel>
                                            <FormControl><div className="relative">
                                                <Input
                                                    type="text"
                                                    placeholder="5,000"
                                                    {...field}
                                                    value={formatCurrencyInput(field.value !== null && field.value !== undefined ? String(field.value) : '')}
                                                    onChange={(e) => field.onChange(parseCurrencyInput(e.target.value))}
                                                    className="pl-7"
                                                />
                                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{form.getValues("budget.currency") === 'GBP' ? '£' : form.getValues("budget.currency") === 'EUR' ? '€' : '$'}</span>
                                            </div></FormControl>
                                            <FormMessage />
                                        </FormItem>)} />
                                    <FormField control={form.control} name="budget.socialMedia" render={({ field }) => (
                                        <FormItem><FormLabel>Social Media Budget *</FormLabel>
                                            <FormControl><div className="relative">
                                                <Input
                                                    type="text"
                                                    placeholder="1,000"
                                                    {...field}
                                                    value={formatCurrencyInput(field.value !== null && field.value !== undefined ? String(field.value) : '')}
                                                    onChange={(e) => field.onChange(parseCurrencyInput(e.target.value))}
                                                    className="pl-7"
                                                />
                                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{form.getValues("budget.currency") === 'GBP' ? '£' : form.getValues("budget.currency") === 'EUR' ? '€' : '$'}</span>
                                            </div></FormControl>
                                            <FormMessage />
                                        </FormItem>)} />
                                </div>
                                <div className="mt-4">
                                    <FormLabel className="text-md font-semibold">Influencer(s) *</FormLabel>
                                    <FormDescription className="mb-4">Add the influencer(s) you want to work with.</FormDescription>
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
                                    <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => appendInfluencer({ id: `new-${Date.now()}`, platform: PlatformEnumBackend.Values.INSTAGRAM, handle: '' })} >
                                        <Icon iconId="faPlusLight" className="mr-2 h-4 w-4" /> Add Influencer
                                    </Button>
                                    {form.formState.errors.Influencer?.root && (
                                        <p className="text-sm font-medium text-destructive mt-2">{form.formState.errors.Influencer.root.message}</p>
                                    )}
                                    {form.formState.errors.Influencer && !form.formState.errors.Influencer.root && typeof form.formState.errors.Influencer.message === 'string' && (
                                        <p className="text-sm font-medium text-destructive mt-2">{form.formState.errors.Influencer.message}</p>
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