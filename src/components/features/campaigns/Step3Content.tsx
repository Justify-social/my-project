'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller, useFieldArray, UseFormReturn, FormProvider, SubmitHandler, FieldValues, FieldPath, Control } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWizard } from '@/components/features/campaigns/WizardContext';
import {
    Step3ValidationSchema,
    Step3FormData,
    DraftCampaignData,
    // Import necessary sub-schemas if needed for default values/payload
    DemographicsSchema,
    LocationSchema
} from '@/components/features/campaigns/types';
import { toast } from 'react-hot-toast';
import { LoadingSkeleton, WizardSkeleton } from '@/components/ui/loading-skeleton';
import { Icon } from '@/components/ui/icon/icon';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Example for Gender/Language
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"; // Example for multi-select Language
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
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
import { AutosaveIndicator } from "@/components/ui/autosave-indicator";
import { ProgressBarWizard } from "@/components/ui/progress-bar-wizard";
import debounce from 'lodash/debounce';
import { cn } from '@/lib/utils';

// Import the new UI components
import { AgeRangeSlider } from "@/components/ui/slider-age-range";
import { AgeDistributionSliderGroup } from "@/components/ui/slider-age-distribution";
import { GenderSelector } from "@/components/ui/selector-gender";
import { LanguageSelector } from "@/components/ui/selector-language";

// --- Mock Data (Replace with actual data fetching/static data) ---
const MOCK_LANGUAGES = [
    { value: "en", label: "English" },
    { value: "es", label: "Spanish" },
    { value: "fr", label: "French" },
    { value: "de", label: "German" },
    { value: "it", label: "Italian" },
    { value: "pt", label: "Portuguese" },
];

const MOCK_LOCATIONS = [
    { value: "gb", label: "United Kingdom" },
    { value: "us", label: "United States" },
    { value: "ca", label: "Canada" },
    { value: "au", label: "Australia" },
    { value: "de", label: "Germany" },
    { value: "fr", label: "France" },
];

const MOCK_INTERESTS = [
    { value: "tech", label: "Technology" },
    { value: "fashion", label: "Fashion" },
    { value: "gaming", label: "Gaming" },
    { value: "travel", label: "Travel" },
    { value: "food", label: "Food & Drink" },
    { value: "sports", label: "Sports" },
];

// --- Main Step 3 Component ---
function Step3Content() {
    const router = useRouter();
    const wizard = useWizard();

    // --- Form Setup (Hooks must be top-level) ---
    const form = useForm<Step3FormData>({
        resolver: zodResolver(Step3ValidationSchema),
        mode: 'onChange',
        defaultValues: {
            demographics: wizard.wizardState?.demographics ?? {
                age18_24: 0, age25_34: 0, age35_44: 0,
                age45_54: 0, age55_64: 0, age65plus: 0,
                genders: [], languages: []
            },
            locations: wizard.wizardState?.locations ?? [],
            targeting: wizard.wizardState?.targeting ?? { interests: [], keywords: [] },
            competitors: wizard.wizardState?.competitors ?? [],
        }
    });
    const watchedValues = form.watch(); // Watch form values

    // --- State for Tag Inputs (Hooks must be top-level) ---
    const [keywordInput, setKeywordInput] = useState('');
    const [locationInput, setLocationInput] = useState('');
    const [competitorInput, setCompetitorInput] = useState('');

    // --- Effects (Hooks must be top-level) ---
    useEffect(() => {
        if (wizard.wizardState && !form.formState.isDirty && !wizard.isLoading) {
            form.reset({
                demographics: wizard.wizardState.demographics ?? {
                    age18_24: 0, age25_34: 0, age35_44: 0,
                    age45_54: 0, age55_64: 0, age65plus: 0,
                    genders: [], languages: []
                },
                locations: wizard.wizardState.locations ?? [],
                targeting: wizard.wizardState.targeting ?? { interests: [], keywords: [] },
                competitors: wizard.wizardState.competitors ?? [],
            });
        }
    }, [wizard.wizardState, wizard.isLoading, form.reset, form.formState.isDirty]);

    // --- Autosave Logic (COMMENTED OUT - Belongs here if enabled) ---
    /*
        const handleAutosave = useCallback(async () => {
            if (!wizard.campaignId || !form.formState.isDirty || !wizard.autosaveEnabled || wizard.isLoading) return;
            const isValid = await form.trigger();
            if (!isValid) {
                console.log("Autosave blocked: Form invalid", form.formState.errors);
                return;
            }
            const currentData = form.getValues();
            const payload: Partial<DraftCampaignData> = {
                demographics: currentData.demographics,
                locations: currentData.locations,
                targeting: currentData.targeting,
                competitors: currentData.competitors,
                step3Complete: form.formState.isValid,
                currentStep: 3,
            };
            try {
                wizard.updateWizardState(payload);
                const success = await wizard.saveProgress(); 
                if (success) {
                    form.reset(currentData, { keepValues: true, keepDirty: false, keepErrors: true });
                } else {
                    toast.error("Failed to save draft for Step 3.");
                }
            } catch (error) {
                console.error("Step 3 Autosave error:", error);
                toast.error("An error occurred saving Step 3 draft.");
            }
        }, [wizard, form, wizard.autosaveEnabled]); 
    
        const debouncedAutosaveRef = useRef(debounce(handleAutosave, 2000));
        useEffect(() => {
            if (!wizard.isLoading && form.formState.isDirty && wizard.autosaveEnabled) {
                debouncedAutosaveRef.current();
            }
            return () => { debouncedAutosaveRef.current.cancel(); };
        }, [watchedValues, wizard.isLoading, form.formState.isDirty, wizard.autosaveEnabled]);
    */
    // Navigation Handlers
    const handleStepClick = (step: number) => {
        if (wizard.campaignId && step < 4) { // Allow nav to completed/current
            router.push(`/campaigns/wizard/step-${step}?id=${wizard.campaignId}`);
        }
    };
    const handleBack = () => {
        if (wizard.campaignId) router.push(`/campaigns/wizard/step-2?id=${wizard.campaignId}`);
    };
    // Combined Save & Next handler
    const onSubmitAndNavigate = async () => {
        const isValid = await form.trigger();
        if (!isValid) {
            toast.error("Please fix the errors before proceeding.");
            return;
        }
        const data = form.getValues();
        const payload: Partial<DraftCampaignData> = {
            demographics: data.demographics,
            locations: data.locations,
            targeting: data.targeting,
            competitors: data.competitors,
            step3Complete: true,
            currentStep: 4,
        };
        wizard.updateWizardState(payload);
        const saved = await wizard.saveProgress(payload);
        if (saved) {
            form.reset(data, { keepValues: true, keepDirty: false });
            if (wizard.campaignId) {
                router.push(`/campaigns/wizard/step-4?id=${wizard.campaignId}`);
            } else {
                toast.error("Could not navigate: campaign ID not found.");
            }
        } else {
            toast.error("Failed to save progress before navigating.");
        }
    };

    // Keyword Input Handlers
    const currentKeywords = watchedValues.targeting?.keywords ?? [];
    const handleAddKeyword = () => {
        const newKeyword = keywordInput.trim();
        if (newKeyword && !currentKeywords.includes(newKeyword)) {
            form.setValue('targeting.keywords', [...currentKeywords, newKeyword], { shouldValidate: true, shouldDirty: true });
            setKeywordInput(''); // Clear input
        }
    };
    const handleRemoveKeyword = (keywordToRemove: string) => {
        form.setValue('targeting.keywords', currentKeywords.filter(kw => kw !== keywordToRemove), { shouldValidate: true, shouldDirty: true });
    };
    const handleKeywordInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent form submission
            handleAddKeyword();
        }
    };

    // Location Input Handlers
    const currentLocations = (watchedValues.locations as unknown as string[] ?? []);
    const handleAddLocation = () => {
        const newLocation = locationInput.trim();
        if (newLocation && !currentLocations.includes(newLocation)) {
            form.setValue('locations', [...currentLocations, newLocation] as any, { shouldValidate: true, shouldDirty: true });
            setLocationInput(''); // Clear input
        }
    };
    const handleRemoveLocation = (locationToRemove: string) => {
        form.setValue('locations', currentLocations.filter(loc => loc !== locationToRemove) as any, { shouldValidate: true, shouldDirty: true });
    };
    const handleLocationInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleAddLocation();
        }
    };

    // Competitor Input Handlers
    const currentCompetitors = watchedValues.competitors ?? [];
    const handleAddCompetitor = () => {
        const newCompetitor = competitorInput.trim();
        if (newCompetitor && !currentCompetitors.includes(newCompetitor)) {
            form.setValue('competitors', [...currentCompetitors, newCompetitor], { shouldValidate: true, shouldDirty: true });
            setCompetitorInput(''); // Clear input
        }
    };
    const handleRemoveCompetitor = (competitorToRemove: string) => {
        form.setValue('competitors', currentCompetitors.filter(comp => comp !== competitorToRemove), { shouldValidate: true, shouldDirty: true });
    };
    const handleCompetitorInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleAddCompetitor();
        }
    };

    // --- Render Logic (Starts after all hooks and handlers) ---
    // Loading State Check
    if (wizard.isLoading && !wizard.wizardState && wizard.campaignId) {
        // Use WizardSkeleton for step 3 loading
        return <WizardSkeleton step={3} />;
    }

    // Determine Autosave Status (Now safe to call after hooks)
    const getAutosaveStatus = () => {
        if (wizard.isLoading) return 'saving';
        if (wizard.lastSaved) return 'success';
        return 'idle';
    };

    return (
        <div className="space-y-8">
            {/* Use ProgressBarWizard */}
            <ProgressBarWizard
                currentStep={3}
                steps={wizard.stepsConfig}
                onStepClick={handleStepClick}
                onBack={handleBack}
                onNext={onSubmitAndNavigate}
                isNextDisabled={!form.formState.isValid}
                isNextLoading={form.formState.isSubmitting || wizard.isLoading}
                getCurrentFormData={form.getValues}
            />
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitAndNavigate)} className="space-y-8 pb-[var(--footer-height)]">
                    {/* --- Demographics Card --- */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Demographics</CardTitle>
                            <CardDescription>Define the age distribution and gender of your target audience.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <AgeDistributionSliderGroup
                                name="demographics"
                                control={form.control}
                                setValue={form.setValue}
                                errors={form.formState.errors}
                            />
                            <GenderSelector
                                name="demographics.genders"
                                control={form.control}
                                label="Gender(s)"
                            />
                        </CardContent>
                    </Card>

                    {/* --- Locations Card --- */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Locations</CardTitle>
                            <CardDescription>Specify the geographic focus.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {/* Locations Tag Input */}
                            <FormField
                                control={form.control}
                                name="locations"
                                render={({ field }) => ( // field value here is expected to be LocationSchema[] but we treat as string[] for tag input
                                    <FormItem>
                                        <FormLabel>Target Locations</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Type a location and press Enter..."
                                                value={locationInput}
                                                onChange={(e) => setLocationInput(e.target.value)}
                                                onKeyDown={handleLocationInputKeyDown}
                                            />
                                        </FormControl>
                                        <div className="flex flex-wrap gap-2 pt-2 min-h-[2.5rem] items-center">
                                            {(field.value as unknown as { city: string }[])?.map((location: { city: string }) => (
                                                <Badge key={location.city} variant="secondary" className="pl-2 pr-1 text-sm">
                                                    {location.city}
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="ml-1 h-4 w-4 text-secondary-foreground hover:text-white hover:bg-transparent p-0"
                                                        onClick={() => handleRemoveLocation(location.city)}
                                                        aria-label={`Remove location ${location.city}`}
                                                    >
                                                        <Icon iconId="faXmarkLight" className="h-3 w-3" />
                                                    </Button>
                                                </Badge>
                                            ))}
                                        </div>
                                        <FormDescription>Add target countries, regions, or cities.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* --- Targeting Card --- */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Advanced Targeting</CardTitle>
                            <CardDescription>Refine audience by language, interests, and keywords.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <LanguageSelector
                                name="demographics.languages"
                                control={form.control}
                                label="Languages"
                                options={MOCK_LANGUAGES} // TODO: Replace with actual fetched options
                                allowMultiple={true}
                                placeholder="Select target language(s)..."
                            />
                            {/* Replaced JSON placeholder with adapted LanguageSelector for Interests */}
                            <LanguageSelector
                                name="targeting.interests" // Connects to the correct form field
                                control={form.control}
                                label="Interests"
                                options={MOCK_INTERESTS} // Use mock interests for now (TODO: Replace)
                                allowMultiple={true}
                                placeholder="Select audience interests..."
                            />
                            {/* Keywords Input */}
                            <FormField
                                control={form.control}
                                name="targeting.keywords"
                                render={({ field }) => ( // field here represents the array of keywords
                                    <FormItem>
                                        <FormLabel>Keywords</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Type a keyword and press Enter..."
                                                value={keywordInput}
                                                onChange={(e) => setKeywordInput(e.target.value)}
                                                onKeyDown={handleKeywordInputKeyDown}
                                            />
                                        </FormControl>
                                        <div className="flex flex-wrap gap-2 pt-2 min-h-[2.5rem] items-center">
                                            {field.value?.map((keyword: string) => (
                                                <Badge key={keyword} variant="secondary" className="pl-2 pr-1 text-sm">
                                                    {keyword}
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="ml-1 h-4 w-4 text-secondary-foreground hover:text-white hover:bg-transparent p-0"
                                                        onClick={() => handleRemoveKeyword(keyword)}
                                                        aria-label={`Remove keyword ${keyword}`}
                                                    >
                                                        <Icon iconId="faXmarkLight" className="h-3 w-3" />
                                                    </Button>
                                                </Badge>
                                            ))}
                                        </div>
                                        <FormDescription>Add relevant keywords that define your target audience.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* --- Competitors Card --- */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Competitor Tracking</CardTitle>
                            <CardDescription>List competitor handles or brand names to monitor (optional).</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {/* Competitors Tag Input */}
                            <FormField
                                control={form.control}
                                name="competitors"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Competitors to Monitor</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Type a competitor name/handle and press Enter..."
                                                value={competitorInput}
                                                onChange={(e) => setCompetitorInput(e.target.value)}
                                                onKeyDown={handleCompetitorInputKeyDown}
                                            />
                                        </FormControl>
                                        <div className="flex flex-wrap gap-2 pt-2 min-h-[2.5rem] items-center">
                                            {field.value?.map((competitor: string) => (
                                                <Badge key={competitor} variant="secondary" className="pl-2 pr-1 text-sm">
                                                    {competitor}
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="ml-1 h-4 w-4 text-secondary-foreground hover:text-white hover:bg-transparent p-0"
                                                        onClick={() => handleRemoveCompetitor(competitor)}
                                                        aria-label={`Remove competitor ${competitor}`}
                                                    >
                                                        <Icon iconId="faXmarkLight" className="h-3 w-3" />
                                                    </Button>
                                                </Badge>
                                            ))}
                                        </div>
                                        <FormDescription>List competitor handles or brand names.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>
                </form>
            </Form>
        </div>
    );
}

export default Step3Content; 