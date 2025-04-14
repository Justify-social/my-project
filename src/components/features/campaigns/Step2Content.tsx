'use client';

import React, { useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import { useWizard } from '@/components/features/campaigns/WizardContext';
import { toast } from 'react-hot-toast';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
import { Icon } from '@/components/ui/icon/icon';
import { cn } from '@/lib/utils';
import debounce from 'lodash/debounce';
import {
    Step2ValidationSchema,
    Step2FormData,
    DraftCampaignData,
    KPIEnum,
    FeatureEnum,
} from '@/components/features/campaigns/types';
import { AutosaveIndicator } from "@/components/ui/autosave-indicator";
import { ProgressBarWizard } from "@/components/ui/progress-bar-wizard";

// --- Constants for Display ---
const kpis = [
    { key: KPIEnum.Values.AD_RECALL, title: 'Ad Recall', icon: '/icons/kpis/kpisAdRecall.svg' },
    { key: KPIEnum.Values.BRAND_AWARENESS, title: 'Brand Awareness', icon: '/icons/kpis/kpisBrandAwareness.svg' },
    { key: KPIEnum.Values.CONSIDERATION, title: 'Consideration', icon: '/icons/kpis/kpisConsideration.svg' },
    { key: KPIEnum.Values.MESSAGE_ASSOCIATION, title: 'Message Association', icon: '/icons/kpis/kpisMessageAssociation.svg' },
    { key: KPIEnum.Values.BRAND_PREFERENCE, title: 'Brand Preference', icon: '/icons/kpis/kpisBrandPreference.svg' },
    { key: KPIEnum.Values.PURCHASE_INTENT, title: 'Purchase Intent', icon: '/icons/kpis/kpisPurchaseIntent.svg' },
    { key: KPIEnum.Values.ACTION_INTENT, title: 'Action Intent', icon: '/icons/kpis/kpisActionIntent.svg' },
    { key: KPIEnum.Values.RECOMMENDATION_INTENT, title: 'Recommendation Intent', icon: '/icons/kpis/kpisRecommendationIntent.svg' },
    { key: KPIEnum.Values.ADVOCACY, title: 'Advocacy', icon: '/icons/kpis/kpisAdvocacy.svg' },
];

const features = [
    { key: FeatureEnum.Values.CREATIVE_ASSET_TESTING, title: 'Creative Asset Testing', icon: '/icons/app/appCreativeAssetTesting.svg' },
    { key: FeatureEnum.Values.BRAND_LIFT, title: 'Brand Lift', icon: '/icons/app/appBrandLift.svg' },
    { key: FeatureEnum.Values.BRAND_HEALTH, title: 'Brand Health', icon: '/icons/app/appBrandHealth.svg' },
    { key: FeatureEnum.Values.MIXED_MEDIA_MODELING, title: 'Mixed Media Modelling', icon: '/icons/app/appMmm.svg' },
];

// --- Main Step 2 Component ---
function Step2Content() {
    const router = useRouter();
    const wizard = useWizard();

    const form = useForm<Step2FormData>({
        resolver: zodResolver(Step2ValidationSchema),
        mode: 'onChange',
        defaultValues: {
            primaryKPI: wizard.wizardState?.primaryKPI,
            secondaryKPIs: wizard.wizardState?.secondaryKPIs ?? [],
            features: wizard.wizardState?.features ?? [],
            messaging: {
                mainMessage: wizard.wizardState?.messaging?.mainMessage ?? '',
                hashtags: wizard.wizardState?.messaging?.hashtags ?? '',
                keyBenefits: wizard.wizardState?.messaging?.keyBenefits ?? '',
            },
            expectedOutcomes: {
                memorability: wizard.wizardState?.expectedOutcomes?.memorability ?? '',
                purchaseIntent: wizard.wizardState?.expectedOutcomes?.purchaseIntent ?? '',
                brandPerception: wizard.wizardState?.expectedOutcomes?.brandPerception ?? '',
            },
        }
    });

    // Effect to reset form when context data loads/changes
    useEffect(() => {
        if (wizard.wizardState && !form.formState.isDirty && !wizard.isLoading) {
            const messaging = wizard.wizardState.messaging ?? {};
            const outcomes = wizard.wizardState.expectedOutcomes ?? {};
            form.reset({
                primaryKPI: wizard.wizardState.primaryKPI,
                secondaryKPIs: wizard.wizardState.secondaryKPIs ?? [],
                features: wizard.wizardState.features ?? [],
                messaging: {
                    mainMessage: messaging.mainMessage ?? '',
                    hashtags: messaging.hashtags ?? '',
                    keyBenefits: messaging.keyBenefits ?? '',
                },
                expectedOutcomes: {
                    memorability: outcomes.memorability ?? '',
                    purchaseIntent: outcomes.purchaseIntent ?? '',
                    brandPerception: outcomes.brandPerception ?? '',
                },
            });
        }
    }, [wizard.wizardState, wizard.isLoading, form.reset, form.formState.isDirty]);

    // Watch form values for autosave
    const watchedValues = form.watch();

    // --- Autosave Logic ---
    const handleAutosave = useCallback(async () => {
        if (!wizard.campaignId || !form.formState.isDirty || !wizard.autosaveEnabled || wizard.isLoading) return;
        const isValid = await form.trigger();
        if (!isValid) return;
        const currentData = form.getValues();

        const payload: Partial<DraftCampaignData> = {
            primaryKPI: currentData.primaryKPI,
            secondaryKPIs: currentData.secondaryKPIs,
            messaging: currentData.messaging,
            expectedOutcomes: currentData.expectedOutcomes,
            features: currentData.features,
            step2Complete: form.formState.isValid,
            currentStep: 2,
        };
        try {
            wizard.updateWizardState(payload);
            const success = await wizard.saveProgress();
            if (success) {
                form.reset(currentData, { keepValues: true, keepDirty: false, keepErrors: true });
            } else {
                toast.error("Failed to save draft.");
            }
        } catch (error) {
            console.error("Autosave error:", error);
            toast.error("An error occurred saving draft.");
        }
    }, [wizard, form, wizard.autosaveEnabled]);

    const debouncedAutosaveRef = useRef(debounce(handleAutosave, 2000));
    useEffect(() => {
        if (!wizard.isLoading && form.formState.isDirty && wizard.autosaveEnabled) {
            debouncedAutosaveRef.current();
        }
        return () => { debouncedAutosaveRef.current.cancel(); };
    }, [watchedValues, wizard.isLoading, form.formState.isDirty, wizard.autosaveEnabled]);

    const onSubmit: SubmitHandler<Step2FormData> = async (data) => { /* ... */ };

    // --- Render Logic ---
    if (wizard.isLoading && !wizard.wizardState && wizard.campaignId) {
        return <LoadingSkeleton />;
    }

    // Watch necessary values for conditional rendering
    const primaryKPIValue = form.watch("primaryKPI");
    const secondaryKPIValues = form.watch("secondaryKPIs") ?? []; // Ensure it's an array

    const handleStepClick = (step: number) => {
        if (wizard.campaignId && step < 3) {
            router.push(`/campaigns/wizard/step-${step}?id=${wizard.campaignId}`);
        } else {
            console.log(`Navigation to step ${step} from step 2 not implemented or allowed via progress bar.`);
        }
    };

    const handleBack = () => {
        if (wizard.campaignId) {
            router.push(`/campaigns/wizard/step-1?id=${wizard.campaignId}`);
        }
    };
    // Handle Next combines validation, save, and navigation
    const onSubmitAndNavigate = async () => {
        const isValid = await form.trigger();
        if (!isValid) {
            toast.error("Please fix the errors before proceeding.");
            return;
        }
        const data = form.getValues();
        const payload: Partial<DraftCampaignData> = {
            primaryKPI: data.primaryKPI,
            secondaryKPIs: data.secondaryKPIs,
            messaging: data.messaging,
            expectedOutcomes: data.expectedOutcomes,
            features: data.features,
            step2Complete: true,
            currentStep: 3,
        };
        wizard.updateWizardState(payload);
        const saved = await wizard.saveProgress();
        if (saved) {
            form.reset(data, { keepValues: true, keepDirty: false });
            if (wizard.campaignId) {
                router.push(`/campaigns/wizard/step-3?id=${wizard.campaignId}`);
            } else {
                toast.error("Could not navigate: campaign ID not found.");
            }
        } else {
            toast.error("Failed to save progress before navigating.");
        }
    };

    // Determine Autosave Status from context
    const getAutosaveStatus = () => {
        if (wizard.isLoading) return 'saving';
        if (wizard.lastSaved) return 'success';
        return 'idle';
    };

    return (
        <div className="space-y-8">
            <ProgressBarWizard
                currentStep={2}
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

                    {/* KPIs Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center"><Icon iconId="faChartBarLight" className="w-5 h-5 mr-2 text-accent" />Key Performance Indicators (KPIs)</CardTitle>
                            <CardDescription>Select 1 Primary KPI and up to 4 Secondary KPIs.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Primary KPI Column */}
                                <FormField
                                    control={form.control}
                                    name="primaryKPI"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3 md:col-span-1">
                                            <FormLabel className="text-base font-semibold">Primary KPI *</FormLabel>
                                            <FormControl>
                                                <RadioGroup onValueChange={field.onChange} value={field.value} className="flex flex-col space-y-1">
                                                    {kpis.map((kpi) => (
                                                        <FormItem key={`primary-${kpi.key}`} className="flex items-center space-x-3 space-y-0">
                                                            <FormControl><RadioGroupItem value={kpi.key} /></FormControl>
                                                            <FormLabel className="font-normal flex items-center cursor-pointer">
                                                                <Image src={kpi.icon} alt={kpi.title} width={16} height={16} className="mr-1.5" /> {kpi.title}
                                                            </FormLabel>
                                                        </FormItem>
                                                    ))}
                                                </RadioGroup>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {/* Secondary KPIs Column */}
                                <FormField
                                    control={form.control}
                                    name="secondaryKPIs"
                                    render={() => (
                                        <FormItem className="space-y-3 md:col-span-2">
                                            <FormLabel className="text-base font-semibold">Secondary KPIs (Max 4)</FormLabel>
                                            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                                {kpis.map((kpi) => (
                                                    <FormField
                                                        key={`secondary-${kpi.key}`}
                                                        control={form.control}
                                                        name="secondaryKPIs"
                                                        render={({ field }) => {
                                                            const isDisabled = primaryKPIValue === kpi.key || (secondaryKPIValues.length >= 4 && !secondaryKPIValues.includes(kpi.key));
                                                            return (
                                                                <FormItem className={cn("flex flex-row items-center space-x-3 space-y-0 p-2 rounded-md", isDisabled ? "opacity-50 cursor-not-allowed" : "hover:bg-muted/50")}>
                                                                    <FormControl>
                                                                        <Checkbox
                                                                            checked={field.value?.includes(kpi.key)}
                                                                            onCheckedChange={(checked) => {
                                                                                if (isDisabled && checked) return;
                                                                                const currentValues = field.value || [];
                                                                                return checked ? field.onChange([...currentValues, kpi.key]) : field.onChange(currentValues.filter((value) => value !== kpi.key));
                                                                            }}
                                                                            disabled={isDisabled}
                                                                        />
                                                                    </FormControl>
                                                                    <FormLabel className={cn("font-normal flex items-center", isDisabled ? "text-muted-foreground" : "cursor-pointer")}>
                                                                        <Image src={kpi.icon} alt={kpi.title} width={16} height={16} className="mr-1.5" /> {kpi.title}
                                                                    </FormLabel>
                                                                </FormItem>
                                                            );
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                            <FormMessage />
                                            {secondaryKPIValues.length >= 4 && (<FormDescription className="text-xs">Maximum 4 selected.</FormDescription>)}
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Messaging Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center"><Icon iconId="faCommentsLight" className="w-5 h-5 mr-2 text-accent" />Messaging</CardTitle>
                            <CardDescription>Define the key messages and value propositions.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField control={form.control} name="messaging.mainMessage" render={({ field }) => (<FormItem><FormLabel>Main Message *</FormLabel><FormControl><Textarea placeholder="Single most important takeaway..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="messaging.hashtags" render={({ field }) => (<FormItem><FormLabel>Campaign Hashtags</FormLabel><FormControl><Input placeholder="#Campaign #Example" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="messaging.keyBenefits" render={({ field }) => (<FormItem><FormLabel>Key Benefits / Value Proposition *</FormLabel><FormControl><Textarea placeholder="List 3-5 key benefits..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                        </CardContent>
                    </Card>

                    {/* Hypotheses Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center"><Icon iconId="faLightbulbLight" className="w-5 h-5 mr-2 text-accent" />Hypotheses (Expected Outcomes)</CardTitle>
                            <CardDescription>Outline expected outcomes based on objectives and KPIs.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField control={form.control} name="expectedOutcomes.memorability" render={({ field }) => (<FormItem><FormLabel>Memorability / Ad Recall Hypothesis</FormLabel><FormControl><Textarea placeholder="e.g., We expect Ad Recall to increase by 15%..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="expectedOutcomes.purchaseIntent" render={({ field }) => (<FormItem><FormLabel>Purchase/Action Intent Hypothesis *</FormLabel><FormControl><Textarea placeholder="e.g., Purchase intent will rise by 10%..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="expectedOutcomes.brandPerception" render={({ field }) => (<FormItem><FormLabel>Brand Perception Hypothesis</FormLabel><FormControl><Textarea placeholder="e.g., Campaign will shift perception towards..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                        </CardContent>
                    </Card>

                    {/* Features Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center"><Icon iconId="faListLight" className="w-5 h-5 mr-2 text-accent" />Features to Include *</CardTitle>
                            <CardDescription>Select features to enable for this campaign.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <FormField
                                control={form.control}
                                name="features"
                                render={() => (
                                    <FormItem>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                            {features.map((feature) => (
                                                <FormField
                                                    key={feature.key}
                                                    control={form.control}
                                                    name="features"
                                                    render={({ field }) => (
                                                        <FormItem
                                                            className={cn("flex flex-col items-center justify-between rounded-lg border p-4 cursor-pointer transition-all", field.value?.includes(feature.key) ? "bg-accent text-accent-foreground border-accent/40 shadow-md" : "bg-background hover:bg-accent/5")}
                                                            onClick={() => {
                                                                const current = field.value || [];
                                                                const updated = current.includes(feature.key) ? current.filter(f => f !== feature.key) : [...current, feature.key];
                                                                field.onChange(updated);
                                                            }}
                                                        >
                                                            <FormControl>
                                                                <Checkbox checked={field.value?.includes(feature.key)} onCheckedChange={(checked) => field.onChange(checked ? [...(field.value || []), feature.key] : (field.value || []).filter(f => f !== feature.key))} className="sr-only" />
                                                            </FormControl>
                                                            <div className="flex items-center mb-3">
                                                                <div className="mr-3 w-6 h-6 flex items-center justify-center">
                                                                    <Image src={feature.icon} alt={feature.title} width={28} height={28} className={cn(field.value?.includes(feature.key) ? "filter brightness-0 invert" : "")} />
                                                                </div>
                                                                <FormLabel className="font-medium cursor-pointer">{feature.title}</FormLabel>
                                                            </div>
                                                            <div className="flex justify-end w-full mt-auto pt-2">
                                                                {field.value?.includes(feature.key) ? <Icon iconId="faCheckCircleSolid" className="w-5 h-5 text-accent-foreground" /> : <div className="w-5 h-5 border-2 border-muted rounded-full"></div>}
                                                            </div>
                                                        </FormItem>
                                                    )}
                                                />
                                            ))}
                                        </div>
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

export default Step2Content; 