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
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
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

    const form = useForm<Step3FormData>({
        resolver: zodResolver(Step3ValidationSchema),
        mode: 'onChange',
        defaultValues: {
            demographics: wizard.wizardState?.demographics ?? { ageRange: [18, 65], genders: [], languages: [] },
            locations: wizard.wizardState?.locations ?? [],
            targeting: wizard.wizardState?.targeting ?? { interests: [], keywords: [] },
            competitors: wizard.wizardState?.competitors ?? [],
        }
    });

    useEffect(() => {
        if (wizard.wizardState && !form.formState.isDirty && !wizard.isLoading) {
            form.reset({
                demographics: wizard.wizardState.demographics ?? { ageRange: [18, 65], genders: [], languages: [] },
                locations: wizard.wizardState.locations ?? [],
                targeting: wizard.wizardState.targeting ?? { interests: [], keywords: [] },
                competitors: wizard.wizardState.competitors ?? [],
            });
        }
    }, [wizard.wizardState, wizard.isLoading, form.reset, form.formState.isDirty]);

    const watchedValues = form.watch();

    // Autosave Logic (using context, no local status)
    const handleAutosave = useCallback(async () => {
        if (!wizard.campaignId || !form.formState.isDirty || !wizard.autosaveEnabled || wizard.isLoading) return;
        const isValid = await form.trigger();
        if (!isValid) {
            console.log("Autosave blocked: Form invalid", form.formState.errors);
            // Optional: Display a more user-friendly toast if desired
            // toast.error("Cannot save, invalid data in Step 3.");
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
            const success = await wizard.saveProgress(); // saveProgress updates context (isLoading, lastSaved)
            if (success) {
                form.reset(currentData, { keepValues: true, keepDirty: false, keepErrors: true });
            } else {
                toast.error("Failed to save draft for Step 3.");
            }
        } catch (error) {
            console.error("Step 3 Autosave error:", error);
            toast.error("An error occurred saving Step 3 draft.");
        }
    }, [wizard, form, wizard.autosaveEnabled]); // Dependencies include form and wizard context

    const debouncedAutosaveRef = useRef(debounce(handleAutosave, 2000));
    useEffect(() => {
        if (!wizard.isLoading && form.formState.isDirty && wizard.autosaveEnabled) {
            debouncedAutosaveRef.current();
        }
        return () => { debouncedAutosaveRef.current.cancel(); };
    }, [watchedValues, wizard.isLoading, form.formState.isDirty, wizard.autosaveEnabled]);

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
        const saved = await wizard.saveProgress();
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

    // Render Logic
    if (wizard.isLoading && !wizard.wizardState && wizard.campaignId) {
        return <LoadingSkeleton />;
    }

    // Temporary helper for JSON Textarea fields
    const parseJsonArrayInput = (value: string, fallback: any[] = []) => {
        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : fallback;
        } catch { return fallback; }
    };
    const formatJsonArrayInput = (value: any[] | undefined | null) => JSON.stringify(value || [], null, 2);

    // Determine Autosave Status from context
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
            />
            <div className="fixed top-4 right-4 z-50">
                <AutosaveIndicator
                    status={getAutosaveStatus()}
                    lastSaved={wizard.lastSaved}
                />
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitAndNavigate)} className="space-y-8 pb-[var(--footer-height)]">
                    {/* --- Demographics Card --- */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Demographics</CardTitle>
                            <CardDescription>Define the age and gender of your target audience.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <AgeRangeSlider
                                name="demographics.ageRange"
                                control={form.control}
                                label="Age Range"
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
                            {/* TODO: Implement proper Location Selector UI */}
                            <FormField
                                control={form.control}
                                name="locations"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Target Locations (Temp. JSON)</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder='[{"country": "US", "region": "California"}, {"country": "UK"}]'
                                                value={formatJsonArrayInput(field.value)}
                                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => field.onChange(parseJsonArrayInput(e.target.value))}
                                                rows={5}
                                            />
                                        </FormControl>
                                        <FormDescription>Temporary JSON input.</FormDescription>
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
                            <CardDescription>Refine audience by language, interests, keywords.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <LanguageSelector
                                name="demographics.languages"
                                control={form.control}
                                label="Languages"
                                options={MOCK_LANGUAGES}
                                allowMultiple={true}
                            />
                            {/* TODO: Implement proper Interest Selector UI */}
                            <FormField
                                control={form.control}
                                name="targeting.interests"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Interests (Temp. JSON)</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder='["Technology", "Fashion"]'
                                                value={formatJsonArrayInput(field.value)}
                                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => field.onChange(parseJsonArrayInput(e.target.value))}
                                                rows={3}
                                            />
                                        </FormControl>
                                        <FormDescription>Temporary JSON input.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {/* TODO: Implement Keywords input UI */}
                            <FormField
                                control={form.control}
                                name="targeting.keywords"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Keywords (Temp. JSON)</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder='["ai tools", "sustainable fashion"]'
                                                value={formatJsonArrayInput(field.value)}
                                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => field.onChange(parseJsonArrayInput(e.target.value))}
                                                rows={3}
                                            />
                                        </FormControl>
                                        <FormDescription>Temporary JSON input.</FormDescription>
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
                            <CardDescription>List competitors (optional).</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {/* TODO: Implement proper Competitor input UI */}
                            <FormField
                                control={form.control}
                                name="competitors"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Competitors (Temp. JSON)</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder='["brandx", "@competitor_handle"]'
                                                value={formatJsonArrayInput(field.value)}
                                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => field.onChange(parseJsonArrayInput(e.target.value))}
                                                rows={3}
                                            />
                                        </FormControl>
                                        <FormDescription>Temporary JSON input.</FormDescription>
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