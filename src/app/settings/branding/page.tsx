'use client'; // This page will likely need client-side state and interactions

import React, { useEffect, useState } from 'react'; // Added useEffect, useState
import { useForm } from 'react-hook-form';
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

// --- Font Loading (Must be top-level constants) ---
import {
    Inter,
    Poppins,
    Lato,
    Montserrat,
    Roboto,
    Open_Sans,
    Raleway,
    Oswald,
    Roboto_Mono,
    Noto_Sans,
    Nunito_Sans,
    Playfair_Display,
} from 'next/font/google';

// Instantiate each font loader directly
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const poppins = Poppins({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--font-poppins' });
const lato = Lato({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-lato' });
const montserrat = Montserrat({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--font-montserrat' });
const roboto = Roboto({ subsets: ['latin'], weight: ['400', '500', '700'], variable: '--font-roboto' });
const openSans = Open_Sans({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--font-open-sans' });
const raleway = Raleway({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--font-raleway' });
const oswald = Oswald({ subsets: ['latin'], weight: ['400', '500', '700'], variable: '--font-oswald' });
const robotoMono = Roboto_Mono({ subsets: ['latin'], weight: ['400', '500', '700'], variable: '--font-roboto-mono' });
const notoSans = Noto_Sans({ subsets: ['latin'], weight: ['400', '500', '700'], variable: '--font-noto-sans' });
const nunitoSans = Nunito_Sans({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--font-nunito-sans' });
const playfairDisplay = Playfair_Display({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--font-playfair-display' });

// Create a mapping from font name (string) to the font object
const fontMap: Record<string, { className: string }> = {
    Inter: inter,
    Poppins: poppins,
    Lato: lato,
    Montserrat: montserrat,
    Roboto: roboto,
    Open_Sans: openSans,
    Raleway: raleway,
    Oswald: oswald,
    Roboto_Mono: robotoMono,
    Noto_Sans: notoSans,
    Nunito_Sans: nunitoSans,
    Playfair_Display: playfairDisplay,
};

// Sort font names alphabetically for the options list
const fontOptions = Object.keys(fontMap).sort();
// -------------------------------------------

// Define Zod schema
const brandingSchema = z.object({
    primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid hex color").optional().default('#333333'),
    secondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid hex color").optional().default('#4A5568'),
    accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid hex color").optional().default('#00BFFF'),
    headerFont: z.enum(fontOptions as [string, ...string[]]).default('Inter'),
    bodyFont: z.enum(fontOptions as [string, ...string[]]).default('Inter'),
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
                    // Fetch data and parse, ensuring logoUrl is handled if it comes from API but isn't in schema
                    const fetchedData = result.data || {};
                    const parsedData = {
                        primaryColor: fetchedData.primaryColor,
                        secondaryColor: fetchedData.secondaryColor,
                        accentColor: fetchedData.accentColor,
                        headerFont: fetchedData.headerFont,
                        bodyFont: fetchedData.bodyFont,
                    }
                    return brandingSchema.parse(parsedData);
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

    const { control, handleSubmit, watch, formState: { isSubmitting, errors } } = form;

    // Watch selected fonts for preview
    const watchedHeaderFont = watch('headerFont', 'Inter');
    const watchedBodyFont = watch('bodyFont', 'Inter');

    // Get className from the font map
    const headerFontClass = fontMap[watchedHeaderFont]?.className || fontMap['Inter'].className;
    const bodyFontClass = fontMap[watchedBodyFont]?.className || fontMap['Inter'].className;

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

    // Display loading skeletons
    if (isLoadingData) {
        return (
            <div className="space-y-8">
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
                        <CardDescription className="text-secondary">Add your brand's core colours.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-4">
                            <FormField
                                control={control}
                                name="primaryColor"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Primary Colour</FormLabel>
                                        <FormControl>
                                            <ColorPicker value={field.value ?? ''} onChange={field.onChange} id="primary-color-picker" />
                                        </FormControl>
                                        <FormMessage className="ml-4 text-xs" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={control}
                                name="secondaryColor"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Secondary Colour</FormLabel>
                                        <FormControl>
                                            <ColorPicker value={field.value ?? ''} onChange={field.onChange} id="secondary-color-picker" />
                                        </FormControl>
                                        <FormMessage className="ml-4 text-xs" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={control}
                                name="accentColor"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Accent Colour</FormLabel>
                                        <FormControl>
                                            <ColorPicker value={field.value ?? ''} onChange={field.onChange} id="accent-color-picker" />
                                        </FormControl>
                                        <FormMessage className="ml-4 text-xs" />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-divider">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-primary">Typography</CardTitle>
                        <CardDescription className="text-secondary">Select fonts for headings and body text.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-6 sm:grid-cols-2">
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
                                                {fontOptions.map(fontName => (
                                                    <SelectItem key={fontName} value={fontName}>{fontName.replace(/_/g, ' ')}</SelectItem>
                                                ))}
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
                                                {fontOptions.map(fontName => (
                                                    <SelectItem key={fontName} value={fontName}>{fontName.replace(/_/g, ' ')}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <Separator />
                        <div className="mt-6 space-y-4">
                            <h4 className="text-md font-semibold text-primary">Font Preview</h4>
                            <div>
                                <p className={`text-lg font-semibold ${headerFontClass}`}>Header: Justify your social spend</p>
                            </div>
                            <div>
                                <p className={`text-sm ${bodyFontClass}`}>Body: Justify your social spend</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Separator />

                <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </form>
        </Form>
    );
};

export default BrandingPage; 