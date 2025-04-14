'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller, SubmitHandler } from 'react-hook-form'; // RHF for potential final confirmation
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWizard } from '@/components/features/campaigns/WizardContext';
import {
    DraftCampaignData,
    SubmissionPayloadSchema, // Schema for final submission payload
    SubmissionPayloadData,
    // Import enums/types needed for display formatting
    platformToFrontend,
    PlatformEnumBackend,
    KPIEnum,
    FeatureEnum,
} from '@/components/features/campaigns/types';
import { toast } from 'react-hot-toast';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { Icon } from '@/components/ui/icon/icon';
import { Button } from '@/components/ui/button';
import { Checkbox } from "@/components/ui/checkbox";
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
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { cn } from '@/lib/utils';
import { AutosaveIndicator, AutosaveStatus } from "@/components/ui/autosave-indicator";
import { InfluencerCard } from "@/components/ui/card-influencer";
import { ProgressBarWizard } from "@/components/ui/progress-bar-wizard";

// --- Data Display Components --- 

interface SummarySectionProps {
    title: string;
    stepNumber: number;
    onEdit: () => void;
    children: React.ReactNode;
    isComplete?: boolean;
}

const SummarySection: React.FC<SummarySectionProps> = ({ title, stepNumber, onEdit, children, isComplete }) => {
    return (
        <AccordionItem value={`step-${stepNumber}`} className="border-b-0">
            <AccordionTrigger className={cn(
                "group",
                "flex justify-between items-center w-full text-left text-lg font-semibold text-primary p-4 rounded-lg border mb-2 transition-colors hover:bg-muted/50",
                isComplete ? "border-green-200 bg-green-50/50 hover:bg-green-50/80" : "border-border bg-card"
            )}>
                <div className="flex items-center">
                    <Badge variant={isComplete ? "default" : "secondary"} className={cn("mr-3 h-6 w-6 justify-center", isComplete && "bg-green-600 text-white")}>{stepNumber}</Badge>
                    <span className="group-hover:underline">{title}</span>
                    {isComplete && <Icon iconId="faCircleCheckSolid" className="ml-2 h-4 w-4 text-green-600 flex-shrink-0" />}
                </div>
                <div className="flex items-center">
                    {/* Use a span styled as a button to avoid nesting button elements */}
                    <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => { e.stopPropagation(); onEdit(); }}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); onEdit(); } }} // Add keyboard accessibility
                        className={cn(
                            // Mimic Button styles (variant="ghost", size="sm")
                            'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
                            'hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                            'h-8 px-3', // size=sm
                            'mr-2 text-sm cursor-pointer' // Added cursor-pointer
                        )}
                    >
                        <Icon iconId="faPenToSquareLight" className="mr-1.5 h-3.5 w-3.5" /> Edit
                    </span>
                    {/* Accordion chevron is added automatically by AccordionTrigger */}
                </div>
            </AccordionTrigger>
            <AccordionContent className="p-4 pt-0">
                <div className="pl-10 mt-2">
                    {children}
                </div>
            </AccordionContent>
        </AccordionItem>
    );
};

interface DataItemProps {
    label: string;
    value?: string | number | string[] | null;
    children?: React.ReactNode; // Allow passing complex children
    className?: string;
}

const DataItem: React.FC<DataItemProps> = ({ label, value, children, className }) => {
    const displayValue = useMemo(() => {
        if (children) return children;
        if (value === null || value === undefined || value === '') return <span className="text-muted-foreground italic">Not provided</span>;
        if (Array.isArray(value)) {
            if (value.length === 0) return <span className="text-muted-foreground italic">None</span>;
            return (
                <div className="flex flex-wrap gap-1">
                    {value.map((item, index) => <Badge key={index} variant="secondary">{item}</Badge>)}
                </div>
            );
        }
        return String(value);
    }, [value, children]);

    return (
        <div className={cn("mb-3", className)}>
            <p className="text-sm font-medium text-muted-foreground mb-0.5">{label}</p>
            <div className="text-sm text-foreground">{displayValue}</div>
        </div>
    );
};

// --- Review Sub-Components --- 

const Step1Review: React.FC<{ data: DraftCampaignData }> = ({ data }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
        <DataItem label="Campaign Name" value={data.name} />
        <DataItem label="Business Goal" value={data.businessGoal} className="md:col-span-2" />
        <DataItem label="Start Date" value={data.startDate ? new Date(data.startDate).toLocaleDateString() : null} />
        <DataItem label="End Date" value={data.endDate ? new Date(data.endDate).toLocaleDateString() : null} />
        <DataItem label="Timezone" value={data.timeZone} />
        <DataItem label="Currency" value={data.budget?.currency} />
        <DataItem label="Total Budget" value={data.budget?.total?.toLocaleString()} />
        <DataItem label="Social Media Budget" value={data.budget?.socialMedia?.toLocaleString()} />
        <DataItem label="Primary Contact Name" value={`${data.primaryContact?.firstName} ${data.primaryContact?.surname}`} />
        <DataItem label="Primary Contact Email" value={data.primaryContact?.email} />
        <DataItem label="Primary Contact Position" value={data.primaryContact?.position} />
        {data.secondaryContact && (
            <>
                <DataItem label="Secondary Contact Name" value={`${data.secondaryContact?.firstName} ${data.secondaryContact?.surname}`} />
                <DataItem label="Secondary Contact Email" value={data.secondaryContact?.email} />
                <DataItem label="Secondary Contact Position" value={data.secondaryContact?.position} />
            </>
        )}
        <div className="md:col-span-2">
            <p className="text-sm font-medium text-muted-foreground mb-1">Influencers</p>
            {data.Influencer && data.Influencer.length > 0 ? (
                <div className="space-y-2">
                    {data.Influencer.map((inf, idx) => (
                        <InfluencerCard
                            key={idx}
                            platform={inf.platform}
                            handle={inf.handle}
                            className="bg-muted/30"
                        />
                    ))}
                </div>
            ) : <span className="text-sm text-muted-foreground italic">None added</span>}
        </div>
    </div>
);

const Step2Review: React.FC<{ data: DraftCampaignData }> = ({ data }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
        <DataItem label="Primary KPI" value={data.primaryKPI} />
        <DataItem label="Secondary KPIs" value={data.secondaryKPIs} />
        <DataItem label="Features" value={data.features} />
        <DataItem label="Main Message" value={data.messaging?.mainMessage} className="md:col-span-2" />
        <DataItem label="Hashtags" value={data.messaging?.hashtags} />
        <DataItem label="Key Benefits" value={data.messaging?.keyBenefits} />
        <DataItem label="Memorability Hypothesis" value={data.expectedOutcomes?.memorability} />
        <DataItem label="Purchase Intent Hypothesis" value={data.expectedOutcomes?.purchaseIntent} />
        <DataItem label="Brand Perception Hypothesis" value={data.expectedOutcomes?.brandPerception} />
    </div>
);

const Step3Review: React.FC<{ data: DraftCampaignData }> = ({ data }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
        <DataItem label="Age Range" value={data.demographics?.ageRange?.join(' - ')} />
        <DataItem label="Genders" value={data.demographics?.genders} />
        <DataItem label="Languages" value={data.demographics?.languages} />
        <DataItem label="Interests" value={data.targeting?.interests} />
        <DataItem label="Keywords" value={data.targeting?.keywords} />
        <DataItem label="Locations" className="md:col-span-2">
            {data.locations && data.locations.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                    {data.locations.map((loc, idx) => (
                        <Badge key={idx} variant="outline">
                            {[loc.city, loc.region, loc.country].filter(Boolean).join(', ') || 'Invalid Location'}
                        </Badge>
                    ))}
                </div>
            ) : <span className="text-muted-foreground italic">None specified</span>}
        </DataItem>
        <DataItem label="Competitors" value={data.competitors} />
    </div>
);

const Step4Review: React.FC<{ data: DraftCampaignData }> = ({ data }) => (
    <div className="space-y-4">
        <DataItem label="Brand Guidelines Summary" value={data.guidelines} />
        <DataItem label="Mandatory Requirements">
            {data.requirements && data.requirements.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1 text-sm">
                    {data.requirements.map((req, idx) => (
                        <li key={idx}>{req.description} {req.mandatory ? "(Mandatory)" : "(Optional)"}</li>
                    ))}
                </ul>
            ) : <span className="text-muted-foreground italic">None</span>}
        </DataItem>
        <DataItem label="Uploaded Assets">
            {data.assets && data.assets.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                    {data.assets.map((asset, idx) => (
                        <Badge key={idx} variant="outline">{asset.name || asset.fileName || `Asset ${idx + 1}`}</Badge>
                    ))}
                </div>
            ) : <span className="text-muted-foreground italic">None uploaded</span>}
        </DataItem>
        <DataItem label="Additional Notes" value={data.notes} />
    </div>
);

// --- Final Confirmation Schema --- 
const ConfirmationSchema = z.object({
    confirm: z.boolean().refine(val => val === true, {
        message: "You must confirm the details before submitting.",
    }),
});
type ConfirmationFormData = z.infer<typeof ConfirmationSchema>;

// --- Main Step 5 Component ---
function Step5Content() {
    const router = useRouter();
    const wizard = useWizard();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const form = useForm<ConfirmationFormData>({
        resolver: zodResolver(ConfirmationSchema),
        defaultValues: { confirm: false },
    });

    // --- Data Transformation & Validation for Submission (REWRITTEN) ---
    const prepareSubmissionPayload = useCallback((): SubmissionPayloadData | null => {
        const draft = wizard.wizardState;
        if (!draft) {
            toast.error("Cannot prepare submission, draft data is missing.");
            return null;
        }

        // Construct the payload object step-by-step, ensuring fields match SubmissionPayloadSchema
        // Use nullish coalescing (??) for defaults where appropriate, and safe access
        const payload: Partial<SubmissionPayloadData> = {
            // Core Info
            campaignName: draft.name ?? 'Untitled Campaign', // Ensure required fields have fallbacks
            description: draft.businessGoal ?? '',
            startDate: draft.startDate ? (typeof draft.startDate === 'string' ? draft.startDate : draft.startDate.toISOString()) : undefined,
            endDate: draft.endDate ? (typeof draft.endDate === 'string' ? draft.endDate : draft.endDate.toISOString()) : undefined,
            timeZone: draft.timeZone ?? 'UTC', // Default timezone if necessary
            currency: draft.budget?.currency,
            totalBudget: draft.budget?.total,
            socialMediaBudget: draft.budget?.socialMedia,
            platform: draft.Influencer?.[0]?.platform, // Use capitalized Influencer
            influencerHandle: draft.Influencer?.[0]?.handle, // Use capitalized Influencer

            // Contacts
            primaryContact: draft.primaryContact ? {
                firstName: draft.primaryContact.firstName,
                surname: draft.primaryContact.surname,
                email: draft.primaryContact.email,
                position: draft.primaryContact.position,
            } : undefined,
            secondaryContact: draft.secondaryContact ? {
                firstName: draft.secondaryContact.firstName,
                surname: draft.secondaryContact.surname,
                email: draft.secondaryContact.email,
                position: draft.secondaryContact.position,
            } : undefined,

            // Objectives
            primaryKPI: draft.primaryKPI ?? undefined, // Map null to undefined for submission schema
            secondaryKPIs: draft.secondaryKPIs ?? [],
            features: draft.features ?? [],
            mainMessage: draft.messaging?.mainMessage ?? '',
            hashtags: draft.messaging?.hashtags ?? '',
            keyBenefits: draft.messaging?.keyBenefits ?? '',
            memorability: draft.expectedOutcomes?.memorability ?? '',
            purchaseIntent: draft.expectedOutcomes?.purchaseIntent ?? '',
            brandPerception: draft.expectedOutcomes?.brandPerception ?? '',

            // Audience - Map carefully to SubmissionPayloadSchema.audience
            audience: {
                ageRangeMin: draft.demographics?.ageRange?.[0] ?? 18,
                ageRangeMax: draft.demographics?.ageRange?.[1] ?? 65,
                keywords: draft.targeting?.keywords ?? [],
                interests: draft.targeting?.interests ?? [],
                // Relational Data - Needs mapping based on API expectation
                // Assuming API expects arrays of objects with specific fields
                competitors: draft.competitors?.map(name => ({ name })) ?? [],
                // Gender requires proportion - Assign 0 or distribute if data exists
                gender: draft.demographics?.genders?.map(g => ({ gender: g, proportion: 0 })) ?? [],
                languages: draft.demographics?.languages?.map(lang => ({ language: lang })) ?? [],
                // Locations require proportion - Assign 0 or distribute
                geographicSpread: draft.locations?.map(loc => ({
                    country: loc.country ?? '', // Ensure country is string
                    // region: loc.region, // Add if needed by AudienceLocationSubmissionSchema
                    // city: loc.city, // Add if needed by AudienceLocationSubmissionSchema
                    proportion: 0
                })) ?? [],
                screeningQuestions: [], // Assuming none in draft
                // Default age distributions if not captured elsewhere
                age1824: 0, age2534: 0, age3544: 0, age4554: 0, age5564: 0, age65plus: 0,
            },

            // Creatives
            creativeAssets: draft.assets?.map(asset => ({
                name: asset.name ?? asset.fileName ?? 'Untitled Asset',
                description: asset.description ?? '',
                url: asset.url ?? '', // Should be a valid URL from upload
                type: asset.type ?? 'image', // Ensure valid enum value
                fileSize: asset.fileSize,
                format: asset.type, // May need better format derivation
                // dimensions, duration might need to be added if available
            })) ?? [],
            creativeRequirements: draft.requirements?.map(req => ({
                description: req.description ?? '',
                mandatory: req.mandatory ?? false,
            })) ?? [],

            submissionStatus: 'submitted',
            // userId typically set by backend
        };

        // Final Validation using the Strict Submission Schema
        const result = SubmissionPayloadSchema.safeParse(payload);

        if (!result.success) {
            console.error("Submission Payload Validation Error:", result.error.errors);
            // Format errors for user-friendly display
            const errorMessages = result.error.errors.map(e => {
                const field = e.path.join('.');
                // Try to provide helpful messages
                if (e.code === z.ZodIssueCode.invalid_type && e.path.length > 0) {
                    return `${field}: Invalid type provided (expected ${e.expected}, received ${e.received})`;
                }
                if (e.message && field) {
                    return `${field}: ${e.message}`;
                }
                return e.message; // Fallback to default message
            }).filter(Boolean).join('; \n');

            const finalMessage = `Submission data is invalid. Please review the following: \n${errorMessages}`;
            toast.error(finalMessage, { duration: 8000 });
            setSubmitError("Validation failed. Check highlighted fields or previous steps.");
            return null; // Indicate failure
        }

        console.log("Submission Payload Validated Successfully:", result.data);
        return result.data; // Return the validated data

    }, [wizard.wizardState]);

    // Submit Handler (Uses validated payload)
    const onSubmit: SubmitHandler<ConfirmationFormData> = async (formData) => {
        if (!formData.confirm) {
            toast.error("Please confirm the details before submitting.");
            return;
        }
        setIsSubmitting(true);
        setSubmitError(null);

        const finalPayload = prepareSubmissionPayload();

        if (!finalPayload) {
            setIsSubmitting(false);
            // Validation errors already shown by prepareSubmissionPayload
            return;
        }

        console.log("Submitting Payload to /api/campaigns:", finalPayload);

        try {
            const response = await fetch('/api/campaigns', { // POST to create submission
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(finalPayload),
            });
            const result = await response.json(); // Try to parse JSON regardless of status

            if (!response.ok) {
                // Use error from JSON response if available, otherwise status text
                throw new Error(result?.error || result?.message || `API Error: ${response.status} ${response.statusText}`);
            }

            toast.success("Campaign submitted successfully!");
            // TODO: Implement clearWizardState in context if needed
            // wizard.clearWizardState();
            router.push('/dashboard?submission=success'); // Navigate away on success

        } catch (err: any) {
            console.error("Submission Error:", err);
            const message = err.message || "Failed to submit campaign.";
            setSubmitError(message);
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Render Logic ---
    const { wizardState, isLoading, stepsConfig } = wizard;

    if (isLoading && !wizardState && wizard.campaignId) return <LoadingSkeleton />;
    if (!wizardState) {
        return (
            <div className="text-center py-10">
                <p className="text-muted-foreground">Campaign data not found.</p>
                <Button variant="outline" onClick={() => router.push('/dashboard')} className="mt-4">Go to Dashboard</Button>
            </div>
        );
    }

    const handleStepClick = (step: number) => {
        if (wizard.campaignId) router.push(`/campaigns/wizard/step-${step}?id=${wizard.campaignId}`);
    };
    const handleBack = () => {
        if (wizard.campaignId) router.push(`/campaigns/wizard/step-4?id=${wizard.campaignId}`);
    };
    const handleNext = form.handleSubmit(onSubmit);

    // Determine Autosave Status from context
    const getAutosaveStatus = (): AutosaveStatus => {
        // No autosave on step 5, return 'idle' which is a valid AutosaveStatus
        const status: AutosaveStatus = 'idle';
        return status;
    };

    return (
        <div className="space-y-8">
            <ProgressBarWizard
                currentStep={5}
                steps={stepsConfig}
                onStepClick={handleStepClick}
                onBack={handleBack}
                onNext={handleNext}
                isNextDisabled={!form.formState.isValid || isSubmitting}
                isNextLoading={isSubmitting}
                submitButtonText="Submit Campaign"
            />

            <div className="fixed top-4 right-4 z-50">
                <AutosaveIndicator status={getAutosaveStatus()} lastSaved={wizard.lastSaved} />
            </div>

            <h1 className="text-2xl font-semibold">Review Campaign Details</h1>

            <Accordion type="multiple" defaultValue={['step-1', 'step-2', 'step-3', 'step-4']} className="w-full space-y-2">
                <SummarySection title="Basic Information & Contacts" stepNumber={1} onEdit={() => handleStepClick(1)} isComplete={wizardState.step1Complete}>
                    <Step1Review data={wizardState} />
                </SummarySection>
                <SummarySection title="Objectives & Messaging" stepNumber={2} onEdit={() => handleStepClick(2)} isComplete={wizardState.step2Complete}>
                    <Step2Review data={wizardState} />
                </SummarySection>
                <SummarySection title="Audience Targeting" stepNumber={3} onEdit={() => handleStepClick(3)} isComplete={wizardState.step3Complete}>
                    <Step3Review data={wizardState} />
                </SummarySection>
                <SummarySection title="Assets & Guidelines" stepNumber={4} onEdit={() => handleStepClick(4)} isComplete={wizardState.step4Complete}>
                    <Step4Review data={wizardState} />
                </SummarySection>
            </Accordion>

            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Confirmation</CardTitle>
                    <CardDescription>Please review all campaign details carefully before submitting.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <FormField
                                control={form.control}
                                name="confirm"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>Confirm Campaign Details</FormLabel>
                                            <FormDescription>I have reviewed all the campaign information and confirm it is accurate.</FormDescription>
                                            <FormMessage />
                                        </div>
                                    </FormItem>
                                )}
                            />
                            {submitError && (
                                <p className="mt-4 text-sm font-medium text-destructive"><Icon iconId="faExclamationTriangleLight" className="inline h-4 w-4 mr-1" /> {submitError}</p>
                            )}
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}

export default Step5Content; 