'use client'; // This page will likely need client-side state and interactions

import React, { useState } from 'react'; // Removed unused useEffect
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image'; // Import Next.js Image component
import { useOrganization } from '@clerk/nextjs'; // Import useOrganization from Clerk
import { useClerk } from '@clerk/nextjs'; // Import useClerk
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ColorPicker } from '@/components/ui/color-picker';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'; // Import RHF compatible Form components
import { toast } from 'react-hot-toast'; // For feedback
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton

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
  // New Sans-serif fonts
  Source_Sans_3,
  PT_Sans,
  Ubuntu,
  Work_Sans,
  Merriweather_Sans,
  Cabin,
  Karla,
  Rubik,
  Manrope,
  Space_Grotesk,
  DM_Sans,
  // New Serif fonts
  Merriweather,
  Lora,
  PT_Serif,
  Bitter,
  Domine,
  EB_Garamond,
  Crimson_Text,
  Neuton,
  // Gentium_Book_Basic, // Note: Gentium_Book_Basic was listed, but next/font/google might prefer Gentium_Book_Plus or just Gentium_Plus. Sticking to direct names for now.
  // For simplicity, if Gentium_Book_Basic isn't a direct export, we might need to pick an alternative or verify its exact name in next/font/google.
  // Let's use Gentium_Plus as a placeholder if Gentium_Book_Basic is problematic, or omit for now to ensure runnable code.
  // Omitting Gentium_Book_Basic for now to avoid potential import errors without verification.
  // New Display fonts
  Lobster,
  Pacifico,
  Righteous,
  Alfa_Slab_One,
  Bebas_Neue,
  Anton,
  Abril_Fatface,
  Fredoka,
  Passion_One,
  // New Monospace fonts
  Source_Code_Pro,
  Inconsolata,
  Space_Mono,
  Cutive_Mono,
  Anonymous_Pro,
  // New Handwriting fonts
  Dancing_Script,
  Kalam,
  Caveat,
  // Google Font alternatives for system fonts
  Arimo, // Arial alternative
  Tinos, // Times New Roman alternative
} from 'next/font/google';

// Instantiate each font loader directly
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-poppins',
});
const lato = Lato({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-lato' });
const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-montserrat',
});
const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-roboto',
});
const openSans = Open_Sans({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-open-sans',
});
const raleway = Raleway({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-raleway',
});
const oswald = Oswald({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-oswald',
});
const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-roboto-mono',
});
const notoSans = Noto_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-noto-sans',
});
const nunitoSans = Nunito_Sans({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-nunito-sans',
});
const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-playfair-display',
});

// Instantiate new fonts
const sourceSans3 = Source_Sans_3({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-source-sans-3',
});
const ptSans = PT_Sans({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-pt-sans' });
const ubuntu = Ubuntu({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-ubuntu',
});
const workSans = Work_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-work-sans',
});
const merriweatherSans = Merriweather_Sans({
  subsets: ['latin'],
  weight: ['400', '700', '800'],
  variable: '--font-merriweather-sans',
});
const cabin = Cabin({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cabin',
});
const karla = Karla({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-karla' });
const rubik = Rubik({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-rubik',
});
const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-manrope',
});
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-space-grotesk',
});
const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-dm-sans',
});

const merriweather = Merriweather({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  variable: '--font-merriweather',
});
const lora = Lora({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-lora',
});
const ptSerif = PT_Serif({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-pt-serif',
});
const bitter = Bitter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-bitter',
});
const domine = Domine({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-domine' });
const ebGaramond = EB_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-eb-garamond',
});
const crimsonText = Crimson_Text({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-crimson-text',
});
const neuton = Neuton({
  subsets: ['latin'],
  weight: ['400', '700', '800'],
  variable: '--font-neuton',
});

const lobster = Lobster({ subsets: ['latin'], weight: '400', variable: '--font-lobster' });
const pacifico = Pacifico({ subsets: ['latin'], weight: '400', variable: '--font-pacifico' });
const righteous = Righteous({ subsets: ['latin'], weight: '400', variable: '--font-righteous' });
const alfaSlabOne = Alfa_Slab_One({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-alfa-slab-one',
});
const bebasNeue = Bebas_Neue({ subsets: ['latin'], weight: '400', variable: '--font-bebas-neue' });
const anton = Anton({ subsets: ['latin'], weight: '400', variable: '--font-anton' });
const abrilFatface = Abril_Fatface({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-abril-fatface',
});
const fredoka = Fredoka({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-fredoka',
});
const passionOne = Passion_One({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-passion-one',
});

const sourceCodePro = Source_Code_Pro({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-source-code-pro',
});
const inconsolata = Inconsolata({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-inconsolata',
});
const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-mono',
});
const cutiveMono = Cutive_Mono({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-cutive-mono',
});
const anonymousPro = Anonymous_Pro({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-anonymous-pro',
});

const dancingScript = Dancing_Script({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-dancing-script',
});
const kalam = Kalam({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-kalam' });
const caveat = Caveat({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-caveat',
});

// Instantiate Arimo and Tinos
const arimo = Arimo({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-arimo' });
const tinos = Tinos({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-tinos' });

// Create a mapping from font name (string) to the font object
// All fonts are now Google Fonts, so no more isSystemFont flag needed
const fontMap: Record<string, { className: string; variable: string }> = {
  // System font alternatives from Google Fonts
  Arimo: arimo, // Replaces Arial
  Tinos: tinos, // Replaces Times New Roman
  // Existing Google Fonts
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
  Source_Sans_3: sourceSans3,
  PT_Sans: ptSans,
  Ubuntu: ubuntu,
  Work_Sans: workSans,
  Merriweather_Sans: merriweatherSans,
  Cabin: cabin,
  Karla: karla,
  Rubik: rubik,
  Manrope: manrope,
  Space_Grotesk: spaceGrotesk,
  DM_Sans: dmSans,
  Merriweather: merriweather,
  Lora: lora,
  PT_Serif: ptSerif,
  Bitter: bitter,
  Domine: domine,
  EB_Garamond: ebGaramond,
  Crimson_Text: crimsonText,
  Neuton: neuton,
  Lobster: lobster,
  Pacifico: pacifico,
  Righteous: righteous,
  Alfa_Slab_One: alfaSlabOne,
  Bebas_Neue: bebasNeue,
  Anton: anton,
  Abril_Fatface: abrilFatface,
  Fredoka: fredoka,
  Passion_One: passionOne,
  Source_Code_Pro: sourceCodePro,
  Inconsolata: inconsolata,
  Space_Mono: spaceMono,
  Cutive_Mono: cutiveMono,
  Anonymous_Pro: anonymousPro,
  Dancing_Script: dancingScript,
  Kalam: kalam,
  Caveat: caveat,
};

// Sort all font names alphabetically for the options list
const fontOptions = Object.keys(fontMap).sort((a, b) => a.localeCompare(b)); // Simplified sorting

// Define Zod schema
const brandingSchema = z.object({
  primaryColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Invalid hex color')
    .optional()
    .default('#333333'),
  secondaryColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Invalid hex color')
    .optional()
    .default('#4A5568'),
  accentColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Invalid hex color')
    .optional()
    .default('#00BFFF'),
  headerFont: z.enum(fontOptions as [string, ...string[]]).default('Inter'),
  bodyFont: z.enum(fontOptions as [string, ...string[]]).default('Inter'),
});

type BrandingFormValues = z.infer<typeof brandingSchema>;

const BrandingPage = () => {
  const [isLoadingData, setIsLoadingData] = useState(true); // State for initial load
  const { organization, isLoaded: isOrgLoaded } = useOrganization(); // Get organization data
  const clerk = useClerk(); // Get clerk instance directly

  const form = useForm<BrandingFormValues>({
    resolver: zodResolver(brandingSchema),
    defaultValues: async () => {
      // Use async defaultValues to fetch initial data
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
          };
          return brandingSchema.parse(parsedData);
        } else {
          throw new Error(result.error || 'Failed to parse settings');
        }
      } catch (error) {
        console.error('Fetch Initial Branding Error:', error);
        toast.error('Could not load branding settings. Using defaults.');
        setIsLoadingData(false);
        return brandingSchema.parse({}); // Return schema defaults on error
      }
    },
  });

  const {
    control,
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = form;

  // Watch selected fonts for preview
  const watchedHeaderFont = watch('headerFont', 'Inter');
  const watchedBodyFont = watch('bodyFont', 'Inter');

  // Get className from the font map - simplified as all are Google Fonts now
  const headerFontClass = fontMap[watchedHeaderFont]?.className || fontMap['Inter'].className;
  const bodyFontClass = fontMap[watchedBodyFont]?.className || fontMap['Inter'].className;

  // onSubmit now sends the PATCH request
  const onSubmit = async (data: BrandingFormValues) => {
    console.log('Submitting branding settings:', data);
    const toastId = toast.loading('Saving settings...');
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

      toast.success('Branding settings saved!', { id: toastId });
      // Optionally reset form with new data if API returns it
      // form.reset(result.data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not save settings.', {
        id: toastId,
      });
      console.error('Save error:', error);
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
            <CardTitle className="text-xl font-bold text-primary">Organisation Logo</CardTitle>
            <CardDescription className="text-secondary">Your organisation's logo.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              {isOrgLoaded && organization?.imageUrl ? (
                <Image
                  src={organization.imageUrl}
                  alt={`${organization.name} Logo`}
                  width={100}
                  height={50}
                  className="rounded border border-muted object-contain"
                />
              ) : isOrgLoaded && !organization?.imageUrl ? (
                <p className="text-sm text-muted-foreground">
                  No logo found for your organisation.
                </p>
              ) : (
                (<Skeleton className="w-[100px] h-[50px]" />) // Skeleton while org data is loading
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!clerk.loaded || !organization} // Corrected: Use clerk.loaded directly
                onClick={() => {
                  if (clerk.redirectToOrganizationProfile && organization) {
                    // Check if method exists
                    clerk.redirectToOrganizationProfile();
                  } else {
                    toast.error('Cannot redirect to organisation settings at this time.');
                  }
                }}
              >
                Change Logo
              </Button>
            </div>
            {isOrgLoaded && !organization?.imageUrl && (
              <p className="text-xs text-muted-foreground pt-1">
                You can usually set your logo in your Clerk organisation settings.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-divider">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-primary">Colour Palette</CardTitle>
            <CardDescription className="text-secondary">
              Add your brand's core colours.
            </CardDescription>
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
                      <ColorPicker
                        value={field.value ?? ''}
                        onChange={field.onChange}
                        id="primary-color-picker"
                      />
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
                      <ColorPicker
                        value={field.value ?? ''}
                        onChange={field.onChange}
                        id="secondary-color-picker"
                      />
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
                      <ColorPicker
                        value={field.value ?? ''}
                        onChange={field.onChange}
                        id="accent-color-picker"
                      />
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
            <CardDescription className="text-secondary">
              Select fonts for headings and body text.
            </CardDescription>
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
                          <SelectItem key={fontName} value={fontName}>
                            {fontName.replace(/_/g, ' ')}
                          </SelectItem>
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
                          <SelectItem key={fontName} value={fontName}>
                            {fontName.replace(/_/g, ' ')}
                          </SelectItem>
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
                <p className={`text-lg font-semibold ${headerFontClass}`}>
                  Header: Justify your social spend
                </p>
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
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default BrandingPage;
