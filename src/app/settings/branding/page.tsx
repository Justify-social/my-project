'use client'; // This page will likely need client-side state and interactions

import React, { useEffect, useState } from 'react'; // Added useEffect, useState
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input'; // Keep for ColorPicker internal input
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ColorPicker } from '@/components/ui/color-picker';
import { FileUploader, UploadThingResult } from '@/components/ui/file-uploader'; // Import FileUploader and its result type
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription, FormMessage } from "@/components/ui/form"; // Import RHF compatible Form components
import { toast } from 'react-hot-toast'; // For feedback
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton

// Define a simple Zod schema for validation (can be expanded)
const brandingSchema = z.object({
    primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid hex color").optional().default('#333333'),
    secondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid hex color").optional().default('#4A5568'),
    accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid hex color").optional().default('#00BFFF'),
    headerFont: z.string().min(1, "Header font is required").default('Inter'),
    bodyFont: z.string().min(1, "Body font is required").default('Inter'),
    logoUrl: z.string().url("Invalid URL").optional().nullable(), // Store the URL from UploadThing
});

type BrandingFormValues = z.infer<typeof brandingSchema>;

const BrandingPage = () => {
    const [isLoadingData, setIsLoadingData] = useState(true); // State for initial load

    const form = useForm<BrandingFormValues>({
        resolver: zodResolver(brandingSchema),
        defaultValues: async () => { // Use async defaultValues to fetch initial data
            setIsLoadingData(true);
            try {
                const response = await fetch('/api/branding');
                if (!response.ok) throw new Error('Failed to fetch initial settings');
                const result = await response.json();
                if (result.success) {
                    setIsLoadingData(false);
                    // Important: Ensure fetched data matches schema or provide defaults
                    return brandingSchema.parse(result.data || {});
                } else {
                    throw new Error(result.error || 'Failed to parse settings');
                }
            } catch (error) {
                console.error("Fetch Initial Branding Error:", error);
                toast.error("Could not load branding settings. Using defaults.");
                setIsLoadingData(false);
                return brandingSchema.parse({}); // Return schema defaults on error
            }
        }
    });

    const { control, handleSubmit, setValue, formState: { isSubmitting, errors } } = form;

    // onSubmit now sends the PATCH request
    const onSubmit = async (data: BrandingFormValues) => {
        console.log('Submitting branding settings:', data);
        const toastId = toast.loading("Saving settings...");
        try {
            const response = await fetch('/api/branding', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await response.json(); // Always try to parse response

            if (!response.ok) {
                // Use error message from API if available, otherwise generic message
                throw new Error(result.error || `Failed to save settings (${response.status})`);
            }

            if (!result.success) {
                throw new Error(result.error || 'An unknown error occurred');
            }

            toast.success("Branding settings saved!", { id: toastId });
            // Optionally reset form with new data if API returns it
            // form.reset(result.data); 
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Could not save settings.", { id: toastId });
            console.error("Save error:", error);
        }
    };

    // Handler for when logo upload completes
    const handleLogoUploadComplete = (results: UploadThingResult[]) => {
        if (results && results.length > 0 && results[0].url) {
            setValue('logoUrl', results[0].url, { shouldValidate: true, shouldDirty: true });
            console.log("Logo URL set in form:", results[0].url);
        } else {
            console.warn("Upload completed but no URL found in result:", results);
        }
    };

    // Display loading skeletons
    if (isLoadingData) {
        return (
            <div className="space-y-8">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
                <div className="flex justify-end">
                    <Skeleton className="h-10 w-24" />
                </div>
            </div>
        );
    }

    return (
        <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <Card className="border-divider">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-primary">Colour Palette</CardTitle>
                        <CardDescription className="text-secondary">Define your application's core colors.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={control}
                            name="primaryColor"
                            render={({ field }) => (
                                <FormItem className="flex items-center justify-between">
                                    {/* Label managed by ColorPicker internally */}
                                    <FormControl>
                                        <ColorPicker label="Primary Color (Jet)" value={field.value ?? ''} onChange={field.onChange} />
                                    </FormControl>
                                    <FormMessage className="ml-4 text-xs" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name="secondaryColor"
                            render={({ field }) => (
                                <FormItem className="flex items-center justify-between">
                                    <FormControl>
                                        <ColorPicker label="Secondary Color (Payne's Grey)" value={field.value ?? ''} onChange={field.onChange} />
                                    </FormControl>
                                    <FormMessage className="ml-4 text-xs" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name="accentColor"
                            render={({ field }) => (
                                <FormItem className="flex items-center justify-between">
                                    <FormControl>
                                        <ColorPicker label="Accent Color (Deep Sky Blue)" value={field.value ?? ''} onChange={field.onChange} />
                                    </FormControl>
                                    <FormMessage className="ml-4 text-xs" />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                <Card className="border-divider">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-primary">Typography</CardTitle>
                        <CardDescription className="text-secondary">Select fonts for headings and body text.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6 sm:grid-cols-2">
                        <FormField
                            control={control}
                            name="headerFont"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Header Font</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select header font" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Inter">Inter</SelectItem>
                                            <SelectItem value="Poppins">Poppins</SelectItem>
                                            <SelectItem value="Roboto">Roboto</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name="bodyFont"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Body Font</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select body font" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Inter">Inter</SelectItem>
                                            <SelectItem value="Poppins">Poppins</SelectItem>
                                            <SelectItem value="Roboto">Roboto</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                <Card className="border-divider">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-primary">Brand Logo</CardTitle>
                        <CardDescription className="text-secondary">Upload your company logo. The uploaded image URL will be saved.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Note: FileUploader manages its own state for the upload process.
                           We link it to RHF primarily for validation triggering (if needed)
                           and to capture the final URL via onUploadComplete. */}
                        <FormField
                            control={control}
                            name="logoUrl" // Field to potentially validate or hold the URL
                            render={({ field }) => ( // field isn't directly used by FileUploader input, but useful for RHF state
                                <FormItem>
                                    <FormLabel>Logo File</FormLabel>
                                    <FormControl>
                                        <FileUploader
                                            control={control} // Pass control down
                                            name={field.name} // Pass name down
                                            endpoint="logoUploader" // Use the likely correct UploadThing endpoint key
                                            maxFiles={1}
                                            maxSizeMB={2} // Match description/requirements
                                            accept={{ 'image/*': ['.png', '.jpeg', '.jpg', '.svg'] }}
                                            onUploadComplete={handleLogoUploadComplete}
                                            onUploadError={(error) => {
                                                toast.error(`Logo upload failed: ${error.message}`);
                                                // Optional: Clear the form field if upload fails
                                                // setValue('logoUrl', null, { shouldValidate: true });
                                            }}
                                        // We don't need field.onChange or field.value directly here
                                        // as FileUploader handles the file selection & upload process.
                                        // RHF integration is primarily for the final URL and validation.
                                        />
                                    </FormControl>
                                    {/* Optionally display the currently saved logo URL */}
                                    {field.value && (
                                        <FormDescription className="mt-2 text-xs">
                                            Current Logo URL: <a href={field.value} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline break-all">{field.value}</a>
                                        </FormDescription>
                                    )}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                <Separator />

                <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting} className="bg-interactive hover:bg-interactive/90">
                        {isSubmitting ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </form>
        </Form>
    );
};

export default BrandingPage; 