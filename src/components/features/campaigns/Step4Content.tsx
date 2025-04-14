'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller, useFieldArray, UseFormReturn, FormProvider, SubmitHandler, FieldValues, FieldPath, Control } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWizard } from '@/components/features/campaigns/WizardContext';
import {
    Step4ValidationSchema,
    Step4FormData,
    DraftCampaignData,
    // Import sub-schemas if needed
    DraftAssetSchema,
    CreativeAssetTypeEnum,
} from '@/components/features/campaigns/types';
import { toast } from 'react-hot-toast';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { Icon } from '@/components/ui/icon/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import ProgressBar from '@/components/features/campaigns/ProgressBar';
import debounce from 'lodash/debounce';
import { cn } from '@/lib/utils';
import { Progress } from "@/components/ui/progress";
import { AutosaveIndicator } from "@/components/ui/autosave-indicator";
// Use the new FileUploader from ui
import { FileUploader, UploadThingResult } from "@/components/ui/file-uploader";
// Import the new ProgressBarWizard
import { ProgressBarWizard } from "@/components/ui/progress-bar-wizard";

// Placeholder for Asset Preview Component
// import { AssetCard } from '@/components/ui/asset-card'; // Assuming a generic asset card

/**
 * =========================================================================
 * Component: FileUploader
 * Intended Location: /src/components/ui/file-uploader.tsx
 * Description: Reusable file upload component integrated with RHF.
 * NOTE: This is a simplified version. A production component would need
 *       integration with an upload service (e.g., S3, UploadThing),
 *       more robust error handling, and progress reporting.
 * =========================================================================
 */
interface FileUploaderProps<TFieldValues extends FieldValues = FieldValues> {
    name: FieldPath<TFieldValues>;
    control: Control<TFieldValues>;
    label?: string;
    description?: string;
    // Callback when upload (simulated) completes
    onUploadComplete?: (assetData: z.infer<typeof DraftAssetSchema>) => void;
}

function RefactoredFileUploader<TFieldValues extends FieldValues = FieldValues>(
    { name, control, label, description, onUploadComplete }: FileUploaderProps<TFieldValues>
) {
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Use field array methods if the target field is an array
    // For simplicity here, we assume direct control over a single field or manual array update via callback
    // const { append } = useFieldArray({ control, name: name as any }); // Requires name to be array type

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setFileName(file.name);
        setIsUploading(true);
        setUploadProgress(0);
        setError(null);

        // --- Simulate Upload --- 
        // Replace with actual upload logic (e.g., call to upload service)
        try {
            // Simulate progress
            for (let progress = 0; progress <= 100; progress += 10) {
                await new Promise(res => setTimeout(res, 50)); // Simulate network delay
                setUploadProgress(progress);
            }

            // Simulate successful upload response
            const uploadedAssetData: z.infer<typeof DraftAssetSchema> = {
                // id: uuidv4(), // Generate ID on backend ideally
                name: file.name,
                fileName: file.name,
                fileSize: file.size,
                type: file.type.startsWith('image') ? 'image' : file.type.startsWith('video') ? 'video' : undefined,
                url: URL.createObjectURL(file), // Temporary local URL for preview
                temp: false, // Mark as not temporary anymore
            };

            // --- Update Form State --- 
            // Option 1: Use callback to let parent manage the field array
            if (onUploadComplete) {
                onUploadComplete(uploadedAssetData);
            } else {
                console.warn("FileUploader: onUploadComplete callback not provided. Form state not updated.");
                // Option 2: Directly update field (if `name` points to a single asset object)
                // field.onChange(uploadedAssetData); // This would require Controller render prop access
                // Option 3: Use append if `name` points to field array (more complex)
                // append(uploadedAssetData);
            }

            setUploadProgress(100);
            toast.success(`Uploaded ${file.name} successfully!`);

        } catch (simulatedError: any) {
            console.error("Simulated upload error:", simulatedError);
            setError("Upload failed. Please try again.");
            toast.error(`Failed to upload ${file.name}.`);
            setUploadProgress(null);
        } finally {
            setIsUploading(false);
            // Reset file input to allow re-uploading the same file
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            // Keep fileName displayed after attempt
            // setFileName(null); // Optional: clear file name on error/completion
        }
        // --- End Simulate Upload ---
    };

    return (
        <Controller
            name={name} // This controller might just be for validation triggering
            control={control}
            render={({ fieldState }) => ( // Field is not directly used here if using callback
                <FormItem>
                    {label && <FormLabel>{label}</FormLabel>}
                    <FormControl>
                        <div className="flex flex-col space-y-2">
                            <Input
                                ref={fileInputRef}
                                type="file"
                                onChange={handleFileChange}
                                disabled={isUploading}
                                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                            />
                            {isUploading && uploadProgress !== null && (
                                <Progress value={uploadProgress} className="w-full h-2" />
                            )}
                            {fileName && !isUploading && (
                                <p className="text-sm text-muted-foreground">
                                    Selected: {fileName} {error ? <span className='text-destructive'>({error})</span> : ' (Ready)'}
                                </p>
                            )}
                        </div>
                    </FormControl>
                    {description && <FormDescription>{description}</FormDescription>}
                    {/* Display RHF validation errors if applicable to the field array itself */}
                    {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
                </FormItem>
            )}
        />
    );
}

// --- Main Step 4 Component ---
function Step4Content() {
    const router = useRouter();
    const wizard = useWizard();

    const form = useForm<Step4FormData>({
        resolver: zodResolver(Step4ValidationSchema),
        mode: 'onChange',
        defaultValues: {
            assets: wizard.wizardState?.assets ?? [],
            guidelines: wizard.wizardState?.guidelines ?? '',
            requirements: wizard.wizardState?.requirements ?? [],
            notes: wizard.wizardState?.notes ?? '',
        }
    });

    const { fields: requirementFields, append: appendRequirement, remove: removeRequirement } = useFieldArray({
        control: form.control,
        name: "requirements",
    });

    const { fields: assetFields, append: appendAsset, remove: removeAsset } = useFieldArray({
        control: form.control,
        name: "assets",
    });

    // Updated callback for the new FileUploader
    const handleAssetUploadComplete = useCallback((results: UploadThingResult[]) => {
        // Map UploadThingResult to DraftAssetSchema format
        const assetsToAdd: z.infer<typeof DraftAssetSchema>[] = results.map(res => {
            let assetType: z.infer<typeof CreativeAssetTypeEnum> | undefined = undefined;
            if (res.type?.startsWith('image/')) {
                assetType = 'image';
            } else if (res.type?.startsWith('video/')) {
                assetType = 'video';
            }
            // TODO: Consider handling other types or logging a warning for unmapped types

            return {
                // Generate a temporary client-side ID or use res.key if unique enough
                id: `temp-${res.key || Date.now()}`,
                url: res.url,
                name: res.name,
                fileName: res.name,
                fileSize: res.size,
                type: assetType,
                temp: true, // Mark as temporary until full form save
            };
        });
        appendAsset(assetsToAdd);
    }, [appendAsset]);

    // Handle upload errors (optional, FileUploader shows toast)
    const handleUploadError = useCallback((error: Error) => {
        console.error("Upload failed in parent:", error);
        // Additional parent-level error handling if needed
    }, []);

    useEffect(() => {
        if (wizard.wizardState && !form.formState.isDirty && !wizard.isLoading) {
            form.reset({
                assets: wizard.wizardState.assets ?? [],
                guidelines: wizard.wizardState.guidelines ?? '',
                requirements: wizard.wizardState.requirements ?? [],
                notes: wizard.wizardState.notes ?? '',
            });
        }
    }, [wizard.wizardState, wizard.isLoading, form.reset, form.formState.isDirty]);

    const watchedValues = form.watch();

    // Autosave Logic
    const handleAutosave = useCallback(async () => {
        if (!wizard.campaignId || !form.formState.isDirty || !wizard.autosaveEnabled || wizard.isLoading) return;
        const isValid = await form.trigger();
        if (!isValid) return;
        const currentData = form.getValues();

        const payload: Partial<DraftCampaignData> = {
            assets: currentData.assets, // Save assets managed by RHF state
            guidelines: currentData.guidelines,
            requirements: currentData.requirements,
            notes: currentData.notes,
            step4Complete: form.formState.isValid,
            currentStep: 4,
        };
        try {
            wizard.updateWizardState(payload);
            const success = await wizard.saveProgress();
            if (success) {
                form.reset(currentData, { keepValues: true, keepDirty: false, keepErrors: true });
            } else {
                toast.error("Failed to save Step 4 draft.");
            }
        } catch (error) {
            console.error("Step 4 Autosave error:", error);
            toast.error("An error occurred saving Step 4 draft.");
        }
    }, [wizard, form, wizard.autosaveEnabled]);

    const debouncedAutosaveRef = useRef(debounce(handleAutosave, 2000));
    useEffect(() => {
        if (!wizard.isLoading && form.formState.isDirty && wizard.autosaveEnabled) {
            debouncedAutosaveRef.current();
        }
        return () => { debouncedAutosaveRef.current.cancel(); };
    }, [watchedValues, wizard.isLoading, form.formState.isDirty, wizard.autosaveEnabled]);

    // Navigation Handlers
    const handleStepClick = (step: number) => {
        if (wizard.campaignId && step < 5) { // Allow nav to completed/current
            router.push(`/campaigns/wizard/step-${step}?id=${wizard.campaignId}`);
        }
    };
    const handleBack = () => {
        if (wizard.campaignId) router.push(`/campaigns/wizard/step-3?id=${wizard.campaignId}`);
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
            assets: data.assets,
            guidelines: data.guidelines,
            requirements: data.requirements,
            notes: data.notes,
            step4Complete: true,
            currentStep: 5,
        };
        wizard.updateWizardState(payload);
        const saved = await wizard.saveProgress();
        if (saved) {
            form.reset(data, { keepValues: true, keepDirty: false });
            if (wizard.campaignId) {
                router.push(`/campaigns/wizard/step-5?id=${wizard.campaignId}`);
            } else {
                toast.error("Could not navigate: campaign ID not found.");
            }
        } else {
            toast.error("Failed to save progress before navigating.");
        }
    };

    // Render Logic
    if (wizard.isLoading && !wizard.wizardState && wizard.campaignId) {
        // Revert to using LoadingSkeleton
        return <LoadingSkeleton />;
    }

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
                currentStep={4}
                steps={wizard.stepsConfig}
                onStepClick={handleStepClick}
                onBack={handleBack}
                onNext={onSubmitAndNavigate}
                isNextDisabled={!form.formState.isValid}
                isNextLoading={form.formState.isSubmitting || wizard.isLoading}
            />
            <div className="fixed top-4 right-4 z-50">
                <AutosaveIndicator status={getAutosaveStatus()} lastSaved={wizard.lastSaved} />
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitAndNavigate)} className="space-y-8 pb-[var(--footer-height)]"> {/* Add padding-bottom */}
                    {/* --- Assets Card --- */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Creative Assets</CardTitle>
                            <CardDescription>Upload your videos or images.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FileUploader
                                name="assets" // RHF field name (for validation trigger)
                                control={form.control}
                                endpoint="campaignAssetUploader" // Your UploadThing endpoint name
                                label="Upload Campaign Assets"
                                onUploadComplete={handleAssetUploadComplete}
                                onUploadError={handleUploadError}
                                accept={{ "image/*": [], "video/*": [] }} // Example accept prop
                                maxFiles={5} // Example: Allow up to 5 files
                                maxSizeMB={4}
                            />
                            {/* Display uploaded assets */}
                            <div className="mt-4 space-y-3">
                                <FormLabel className="text-sm font-medium">Uploaded Assets:</FormLabel>
                                {assetFields.length === 0 && (
                                    <div className="p-4 border-dashed border-2 rounded-md text-center text-muted-foreground">
                                        No assets uploaded yet.
                                    </div>
                                )}
                                {assetFields.map((asset, index) => (
                                    <Card key={asset.id} className="p-3 flex justify-between items-center bg-muted/50">
                                        <div className="flex items-center space-x-3 overflow-hidden">
                                            <Icon
                                                iconId={asset.type === 'image' ? 'faFileImageLight' : asset.type === 'video' ? 'faFileVideoLight' : 'faFileLight'}
                                                className="h-5 w-5 text-muted-foreground flex-shrink-0"
                                            />
                                            <div className="truncate">
                                                <p className="text-sm font-medium truncate">{asset.fileName || asset.name || `Asset ${index + 1}`}</p>
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {asset.type || 'Unknown Type'} {asset.fileSize ? `(${(asset.fileSize / 1024 / 1024).toFixed(2)} MB)` : ''}
                                                </p>
                                            </div>
                                        </div>
                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeAsset(index)} className="h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0">
                                            <Icon iconId="faTrashCanLight" className="h-4 w-4" />
                                        </Button>
                                    </Card>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </Form>
        </div>
    );
}

export default Step4Content; 