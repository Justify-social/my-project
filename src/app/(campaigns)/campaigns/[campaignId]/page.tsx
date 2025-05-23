'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Separator,
} from '@/components/ui';
import { Icon } from '@/components/ui/icon/icon';
import Skeleton from '@/components/ui/loading-skeleton';
import ErrorFallback from '@/components/features/core/error-handling/ErrorFallback';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { AssetCard } from '@/components/ui/card-asset';
import { type VariantProps } from 'class-variance-authority';
import { badgeVariants } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
// Import the Duplicate Button using relative path
import { DuplicateCampaignButton } from '@/components/ui/button-duplicate-campaigns';
import { ConfirmDeleteDialog } from '@/components/ui/dialog-confirm-delete';
import { getCampaignStatusInfo, CampaignStatusKey } from '@/utils/statusUtils'; // Import centralized utility
import { useAuth } from '@clerk/nextjs'; // Import useAuth

// Define AGE_BRACKETS for the age distribution summary UI
const AGE_BRACKETS = [
  { key: 'age18_24', label: '18-24' },
  { key: 'age25_34', label: '25-34' },
  { key: 'age35_44', label: '35-44' },
  { key: 'age45_54', label: '45-54' },
  { key: 'age55_64', label: '55-64' },
  { key: 'age65plus', label: '65+' },
] as const;

// Language mapping (ideally from a shared constants file, mirroring Step3Content.tsx)
const TOP_LANGUAGES_MAP: Array<{ value: string; label: string }> = [
  { value: 'ar', label: 'Arabic' },
  { value: 'bn', label: 'Bengali' },
  { value: 'zh', label: 'Chinese (Mandarin)' },
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'hi', label: 'Hindi' },
  { value: 'id', label: 'Indonesian' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'ru', label: 'Russian' },
  { value: 'es', label: 'Spanish' },
  { value: 'tr', label: 'Turkish' },
  { value: 'vi', label: 'Vietnamese' },
];

// Define necessary types
interface CampaignData {
  id: string;
  name: string;
  status: CampaignStatusKey;
  startDate: string;
  endDate: string;
  timeZone: string;
  businessGoal: string;
  budget: {
    total: number;
    social: number;
    currency: string;
  };
  primaryContact: ContactDetails;
  secondaryContact?: ContactDetails;
  influencers?: Array<{ handle: string; platform: string }>;
  primaryKPI: string;
  secondaryKPIs: string[];
  features: string[];
  mainMessage: string;
  hashtags: string[];
  keyBenefits: string[];
  expectedOutcomes: {
    memorability: string;
    purchaseIntent: string;
    brandPerception: string;
  };
  audience: {
    genders: string[];
    ageRanges?: Record<string, number>;
    languages: string[];
    interests: string[];
    locations: string[];
    competitors: string[];
  };
  assets: {
    guidelinesSummary: string;
    requirements: Array<{ text: string; mandatory: boolean }>;
    uploaded: Array<UploadedAsset>;
    notes: string;
  };
  contacts: Array<ContactDetails & { phone?: string; isPrimary?: boolean }>;
}

// Define UploadedAsset type
interface UploadedAsset {
  id: string | number;
  name: string;
  url: string;
  type: string;
  description: string;
  budget: number;
  muxPlaybackId?: string;
  muxProcessingStatus?: string;
  muxAssetId?: string;
}

// Define ContactDetails type
interface ContactDetails {
  name: string;
  email: string;
  position: string;
}

// Define type for raw influencer data from API
interface ApiInfluencer {
  handle?: string | null;
  platform?: string | null;
  // Add other potential fields if they exist
}

// Define interfaces for other mapped API data structures
interface ApiLanguage {
  language?: string | null;
}

interface _ApiLocation {
  // Renamed to _ApiLocation as it's unused
  location?: string | null;
}

interface _ApiRequirement {
  // Renamed to _ApiRequirement as it's unused
  requirement?: string | null;
}

interface _ApiAsset {
  // Renamed to _ApiAsset as it's unused
  name?: string | null;
  url?: string | null;
}

interface _ApiContact {
  // Renamed to _ApiContact as it's unused
  firstName?: string | null;
  surname?: string | null;
  email?: string | null;
  position?: string | null;
}

// Define type for badge variants based on the component's CVA definition
type _BadgeVariant = VariantProps<typeof badgeVariants>['variant']; // Renamed to _BadgeVariant as it's unused

// KPI mapping for icons
const kpiIconMap: Record<string, string> = {
  adRecall: '/icons/kpis/kpisAdRecall.svg',
  brandAwareness: '/icons/kpis/kpisBrandAwareness.svg',
  consideration: '/icons/kpis/kpisConsideration.svg',
  messageAssociation: '/icons/kpis/kpisMessageAssociation.svg',
  brandPreference: '/icons/kpis/kpisBrandPreference.svg',
  purchaseIntent: '/icons/kpis/kpisPurchaseIntent.svg',
  actionIntent: '/icons/kpis/kpisActionIntent.svg',
  recommendationIntent: '/icons/kpis/kpisRecommendationIntent.svg',
  advocacy: '/icons/kpis/kpisAdvocacy.svg',
};

// KPI names mapping for proper capitalization
const kpiDisplayNames: Record<string, string> = {
  adRecall: 'Ad Recall',
  brandAwareness: 'Brand Awareness',
  consideration: 'Consideration',
  messageAssociation: 'Message Association',
  brandPreference: 'Brand Preference',
  purchaseIntent: 'Purchase Intent',
  actionIntent: 'Action Intent',
  recommendationIntent: 'Recommendation Intent',
  advocacy: 'Advocacy',
};

// KPI tooltips with detailed explanations
const kpiTooltips: Record<string, string> = {
  adRecall: 'Measures how well consumers remember seeing your ad after exposure',
  brandAwareness: 'Tracks the percentage of your target audience that recognizes your brand',
  consideration:
    'Measures if consumers would consider your product when making a purchase decision',
  messageAssociation: 'Tracks how strongly consumers associate your brand with specific messaging',
  brandPreference:
    'Measures if consumers prefer your brand over competitors for specific attributes',
  purchaseIntent: 'Tracks likelihood of consumers to purchase your product after campaign exposure',
  actionIntent: 'Measures likelihood of consumers taking a specific action (signing up, etc.)',
  recommendationIntent: 'Tracks if consumers would recommend your brand/product to others',
  advocacy: 'Measures how likely consumers are to actively advocate for your brand',
};

// Helper to get KPI display name
const getKpiDisplayName = (kpiKey: string): string => {
  // Remove any underscores and convert to camelCase
  const normalizedKey = kpiKey.toLowerCase().replace(/_([a-z])/g, (_, char) => char.toUpperCase());
  return kpiDisplayNames[normalizedKey] || kpiKey;
};

// Helper to get KPI icon path
const getKpiIconPath = (kpiKey: string): string => {
  // Remove any underscores and convert to camelCase
  const normalizedKey = kpiKey.toLowerCase().replace(/_([a-z])/g, (_, char) => char.toUpperCase());
  return kpiIconMap[normalizedKey] || '';
};

// Helper to get KPI tooltip
const getKpiTooltip = (kpiKey: string): string => {
  // Remove any underscores and convert to camelCase
  const normalizedKey = kpiKey
    .toLowerCase()
    .replace(/_([a-z])/g, (_: unknown, char: string) => char.toUpperCase());
  return kpiTooltips[normalizedKey] || 'Measures campaign performance';
};

// DataItem component for consistent display formatting
const _DataItem = ({
  // Renamed to _DataItem as it's unused
  label,
  value,
  iconId,
  className,
}: {
  label: string;
  value: React.ReactNode;
  iconId?: string;
  className?: string;
}) => (
  <div className={cn('flex items-start py-2', className)}>
    {iconId && <Icon iconId={iconId} className="mr-2 mt-1 text-muted-foreground" />}
    <div className="flex-1">
      <p className="text-sm font-medium text-muted-foreground mb-1">{label}</p>
      <div className="text-base text-foreground">{value || 'Not specified'}</div>
    </div>
  </div>
);

// PageSection wrapper component for consistent spacing between major page sections
const PageSection = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <section className={cn('mb-12', className)}>
    {' '}
    {/* Consistent bottom margin for all sections */}
    {children}
  </section>
);

// Section Header component (Ensure defined before use)
const SectionHeader = ({ title, className }: { title: string; className?: string }) => (
  <div className={cn('flex items-center gap-2 mb-6', className)}>
    <h2 className="text-xl font-semibold tracking-tight whitespace-nowrap">{title}</h2>
    <Separator className="flex-grow" />
  </div>
);

// Section Header without separator (for grid layouts)
const _SectionHeaderNoSeparator = (
  { title, className }: { title: string; className?: string } // Renamed to _SectionHeaderNoSeparator as it's unused
) => (
  <div className={cn('mb-6', className)}>
    {' '}
    {/* Standardized bottom margin */}
    <h2 className="text-xl font-semibold tracking-tight whitespace-nowrap">{title}</h2>
  </div>
);

// Card Group component for consistent styling
const _CardGroup = (
  { children, className }: { children: React.ReactNode; className?: string } // Renamed to _CardGroup as it's unused
) => (
  <div className={cn('grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5', className)}>
    {children}
  </div>
);

// Badge group for consistent badge rendering
const BadgeGroup = ({ items, className }: { items: string[]; className?: string }) => (
  <div className={cn('flex flex-wrap gap-2', className)}>
    {items && items.length > 0 ? (
      items.map((item, index) => (
        <Badge key={index} variant="outline" className="bg-background/80">
          {item}
        </Badge>
      ))
    ) : (
      <span className="text-muted-foreground text-sm italic">Not specified</span>
    )}
  </div>
);

// KPI Badge component with icon and tooltip
const KpiBadge = ({ kpi, isPrimary = false }: { kpi: string; isPrimary?: boolean }) => {
  const iconPath = getKpiIconPath(kpi);
  const displayName = getKpiDisplayName(kpi);
  const tooltipText = getKpiTooltip(kpi);

  return (
    <div className="group relative">
      <div
        className={cn(
          'flex items-center gap-2 rounded-md border',
          isPrimary
            ? 'bg-accent/15 border-accent/30 px-4 py-3'
            : 'bg-accent/10 border-accent/20 px-3 py-2'
        )}
      >
        {iconPath && (
          <div className={cn('flex-shrink-0 relative', isPrimary ? 'h-6 w-6' : 'h-5 w-5')}>
            <Image
              src={iconPath}
              alt={displayName}
              fill
              className="object-contain"
              style={{
                filter:
                  'invert(47%) sepia(98%) saturate(1776%) hue-rotate(179deg) brightness(104%) contrast(105%)',
              }}
            />
          </div>
        )}
        <span
          className={cn(
            'font-medium text-accent',
            isPrimary ? 'text-base font-semibold' : 'text-sm'
          )}
        >
          {displayName}
        </span>
      </div>
      <div className="absolute z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gray-900 text-white text-sm rounded-md py-2 px-3 w-64 bottom-full left-1/2 -translate-x-1/2 mb-2 shadow-lg pointer-events-none">
        <div className="absolute w-3 h-3 bg-gray-900 transform rotate-45 left-1/2 -translate-x-1/2 bottom-[-6px]"></div>
        {tooltipText}
      </div>
    </div>
  );
};

// Format measurement name with proper capitalization
const _formatMeasurementName = (name: string): string => {
  // Renamed to _formatMeasurementName as it's unused
  return name
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Add this helper function within the CampaignDetail component scope,
// or ensure it's imported if defined elsewhere and accessible.
const getAssetTypeFromUrl = (url: string): string => {
  if (!url) return 'file'; // Default or 'unknown'
  const extension = url.split('.').pop()?.toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) return 'image';
  if (['mp4', 'webm', 'mov', 'avi'].includes(extension || '')) return 'video';
  return 'file'; // Fallback for other types
};

export default function CampaignDetail() {
  const router = useRouter();
  const params = useParams();
  const { orgId: _activeOrgId, isLoaded: _isAuthLoaded, userId: _clerkUserId } = useAuth(); // Prefixed unused variables
  const campaignIdParam = (params?.campaignId as string) || '';
  const [campaignData, setCampaignData] = useState<CampaignData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // --- Restore Local Toast Helper Functions ---
  const showSuccessToast = (
    message: string,
    iconId?: string,
    customClassName?: string,
    iconClassName?: string
  ) => {
    const finalIconId = iconId || 'faFloppyDiskLight';
    const successIcon = (
      <Icon iconId={finalIconId} className={`h-5 w-5 ${iconClassName || 'text-success'}`} />
    );
    toast.success(message, {
      duration: 3000,
      className: customClassName || 'toast-success-custom',
      icon: successIcon,
    });
  };

  const showErrorToast = (message: string, iconId?: string) => {
    const finalIconId = iconId || 'faTriangleExclamationLight';
    const errorIcon = <Icon iconId={finalIconId} className="h-5 w-5 text-destructive" />;
    toast.error(message, {
      duration: 5000,
      className: 'toast-error-custom',
      icon: errorIcon,
    });
  };
  // --- End Restored Local Helpers ---

  const executeDeleteCampaign = async () => {
    if (!campaignIdParam) {
      showErrorToast('Campaign ID is missing, cannot delete.');
      return;
    }
    try {
      const response = await fetch(`/api/campaigns/${campaignIdParam}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.status === 401) {
        showErrorToast('Authentication failed. Please log in and try again.');
        throw new Error('Authentication failed when deleting campaign');
      }

      let data: { success: boolean; message: string } = {
        success: false,
        message: 'Unknown delete error',
      };
      if (response.status !== 204) {
        try {
          data = await response.json();
        } catch {
          // Prefixed unused variable
          if (!response.ok && response.status !== 404) {
            throw new Error(
              `Failed to delete campaign: Server returned non-JSON response with status ${response.status}`
            );
          }
          data.success = response.ok || response.status === 404;
          data.message = response.status === 404 ? 'Campaign not found' : 'Campaign deleted';
        }
      }

      if (response.status === 404) {
        showSuccessToast(
          'Campaign already removed or not found.',
          'faCircleInfoLight',
          'toast-success-custom',
          'text-accent'
        );
        router.push('/campaigns');
      } else if (!response.ok && response.status !== 204) {
        showErrorToast(data.message || `Failed to delete campaign: ${response.status}`);
        throw new Error(data.message || `Failed to delete campaign: ${response.status}`);
      } else {
        showSuccessToast(
          'Campaign deleted successfully',
          'faTrashCanLight',
          'toast-delete-custom',
          'text-destructive'
        );
        router.push('/campaigns');
      }
    } catch (error) {
      console.error('Error in executeDeleteCampaign:', error);
      if (!(error instanceof Error && error.message.includes('Authentication failed'))) {
        showErrorToast('An unexpected error occurred while deleting the campaign.');
      }
    }
  };

  useEffect(() => {
    const fetchCampaignData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/campaigns/${campaignIdParam}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch campaign data: ${response.status}`);
        }
        const apiResponse = await response.json();
        const data = apiResponse.data || apiResponse;
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid campaign data received from API');
        }

        // Normalize status for SSOT
        let rawStatus = ((data as { status?: string }).status || 'DRAFT').toUpperCase();
        if (rawStatus === 'SUBMITTED_FINAL') {
          rawStatus = 'SUBMITTED';
        }
        // Add any other necessary normalizations here if backend sends other variations

        const transformedData: CampaignData = {
          id: (data as { id?: string | number }).id
            ? (data as { id: string | number }).id.toString()
            : 'N/A',
          name: (data as { name?: string }).name || 'Unnamed Campaign',
          status: rawStatus as CampaignStatusKey,
          startDate: (data as { startDate?: string }).startDate
            ? new Date((data as { startDate: string }).startDate).toLocaleDateString()
            : 'N/A',
          endDate: (data as { endDate?: string }).endDate
            ? new Date((data as { endDate: string }).endDate).toLocaleDateString()
            : 'N/A',
          timeZone: (data as { timeZone?: string }).timeZone || 'N/A',
          businessGoal: (data as { businessGoal?: string }).businessGoal || 'Not Set',
          budget: {
            total: (data as { budget?: { total?: number } })?.budget?.total || 0,
            social: (data as { budget?: { socialMedia?: number } })?.budget?.socialMedia || 0,
            currency: (data as { budget?: { currency?: string } })?.budget?.currency || 'USD',
          },
          primaryContact: {
            name:
              (data as { primaryContact?: { name?: string } })?.primaryContact?.name ||
              'Not specified',
            email:
              (data as { primaryContact?: { email?: string } })?.primaryContact?.email ||
              'Not specified',
            position:
              (data as { primaryContact?: { position?: string } })?.primaryContact?.position ||
              'Not specified',
          },
          secondaryContact: (data as { secondaryContact?: ContactDetails })?.secondaryContact
            ? {
                name: (data as { secondaryContact: ContactDetails }).secondaryContact.name || 'N/A',
                email:
                  (data as { secondaryContact: ContactDetails }).secondaryContact.email || 'N/A',
                position:
                  (data as { secondaryContact: ContactDetails }).secondaryContact.position || 'N/A',
              }
            : undefined,
          influencers: ((data as { influencers?: ApiInfluencer[] }).influencers || []).map(
            (inf: ApiInfluencer) => ({
              handle: inf.handle || 'N/A',
              platform: inf.platform || 'N/A',
            })
          ),
          primaryKPI: (data as { primaryKPI?: string }).primaryKPI || 'N/A',
          secondaryKPIs: (data as { secondaryKPIs?: string[] }).secondaryKPIs || [],
          features: (data as { features?: string[] }).features || [],
          mainMessage: (data as { mainMessage?: string }).mainMessage || 'N/A',
          hashtags: (data as { hashtags?: string[] }).hashtags || [],
          keyBenefits: (data as { keyBenefits?: string[] }).keyBenefits || [],
          expectedOutcomes: {
            memorability:
              (data as { expectedOutcomes?: { memorability?: string } })?.expectedOutcomes
                ?.memorability || 'N/A',
            purchaseIntent:
              (data as { expectedOutcomes?: { purchaseIntent?: string } })?.expectedOutcomes
                ?.purchaseIntent || 'N/A',
            brandPerception:
              (data as { expectedOutcomes?: { brandPerception?: string } })?.expectedOutcomes
                ?.brandPerception || 'N/A',
          },
          audience: {
            genders: (data as { audience?: { genders?: string[] } })?.audience?.genders || [],
            ageRanges:
              (data as { audience?: { ageRanges?: Record<string, number> } })?.audience
                ?.ageRanges || {},
            languages: (
              (data as { audience?: { languages?: ApiLanguage[] } })?.audience?.languages || []
            ).map(
              (lang: ApiLanguage) =>
                TOP_LANGUAGES_MAP.find(l => l.value === lang.language)?.label ||
                lang.language ||
                'N/A'
            ),
            interests: (data as { audience?: { interests?: string[] } })?.audience?.interests || [],
            locations: (
              (data as { audience?: { locations?: { location?: string }[] } })?.audience
                ?.locations || []
            ).map((loc: { location?: string }) => loc.location || 'N/A'),
            competitors:
              (data as { audience?: { competitors?: string[] } })?.audience?.competitors || [],
          },
          assets: {
            guidelinesSummary:
              (data as { assets?: { guidelinesSummary?: string } })?.assets?.guidelinesSummary ||
              'N/A',
            requirements: (
              (
                data as {
                  assets?: { requirements?: { requirement?: string; mandatory?: boolean }[] };
                }
              )?.assets?.requirements || []
            ).map((req: { requirement?: string; mandatory?: boolean }) => ({
              text: req.requirement || 'N/A',
              mandatory: req.mandatory || false,
            })),
            uploaded: (
              (data as { assets?: { uploadedAssets?: UploadedAsset[] } })?.assets?.uploadedAssets ||
              []
            ).map((asset: UploadedAsset) => ({
              ...asset,
              id: asset.id || Date.now() + Math.random(), // Ensure ID exists
              name: asset.name || 'Untitled Asset',
              url: asset.url || '#',
              type: asset.type || getAssetTypeFromUrl(asset.url),
              description: asset.description || 'No description',
              budget: asset.budget || 0,
            })),
            notes: (data as { assets?: { notes?: string } })?.assets?.notes || '',
          },
          contacts: ((data as { contacts?: _ApiContact[] }).contacts || []).map(
            (contact: _ApiContact) => ({
              name: `${contact.firstName || ''} ${contact.surname || ''}`.trim() || 'N/A',
              email: contact.email || 'N/A',
              position: contact.position || 'N/A',
              phone: (contact as { phone?: string }).phone || undefined, // Keep if exists
              isPrimary: (contact as { isPrimary?: boolean }).isPrimary || false, // Keep if exists
            })
          ),
        };
        setCampaignData(transformedData);
      } catch (err) {
        console.error('Error fetching campaign data:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load campaign details. Please try again later.'
        );
        toast.error('Failed to load campaign details');
      } finally {
        setIsLoading(false);
      }
    };

    if (campaignIdParam) {
      fetchCampaignData();
    } else {
      setError('Invalid campaign ID');
      setIsLoading(false);
    }
  }, [campaignIdParam]);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleDownloadAllAssets = async () => {
    if (
      !campaignData ||
      !campaignData.assets.uploaded ||
      campaignData.assets.uploaded.length === 0
    ) {
      showErrorToast('No assets to download.');
      return;
    }

    const zip = new JSZip();

    try {
      const assetPromises = campaignData.assets.uploaded.map(async asset => {
        try {
          const response = await fetch(asset.url);
          if (!response.ok) {
            console.error(
              `Failed to fetch asset ${asset.name} from ${asset.url}: ${response.statusText}`
            );
            return;
          }
          const blob = await response.blob();
          let fileName = asset.name;
          if (!fileName.includes('.')) {
            const type = blob.type.split('/')[1];
            if (type) fileName = `${fileName}.${type}`;
          }
          zip.file(fileName, blob);
        } catch (error) {
          console.error(`Error processing asset ${asset.name}:`, error);
        }
      });

      await Promise.all(assetPromises);

      if (Object.keys(zip.files).length === 0) {
        showErrorToast('No assets could be fetched for download.');
        return;
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, `${campaignData.name || 'campaign'}_assets.zip`);
      showSuccessToast('Download successful');
    } catch (error) {
      console.error('Error creating zip file:', error);
      showErrorToast('Failed to download assets. See console for details.');
    }
  };

  // Add a check before rendering action buttons
  const canPerformActions = _isAuthLoaded && _activeOrgId;

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-1/3" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-20" />
          </div>
        </div>
        <Skeleton className="h-0.5 w-full my-4" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>

        <SectionHeader title="" className="mt-8" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !campaignData) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <ErrorFallback
          error={new Error(error || 'Campaign data not available')}
          resetErrorBoundary={() => setError(null)}
        />
      </div>
    );
  }

  // Use the imported getCampaignStatusInfo
  const statusInfo = getCampaignStatusInfo(campaignData.status);

  console.log(
    'Asset details for rendering:',
    campaignData.assets.uploaded.map(asset => ({
      name: asset.name,
      url: asset.url,
      type: asset.type,
      source: asset.url !== '#' ? 'API' : 'Default',
    }))
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-12">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">{campaignData.name}</h1>
          <Badge
            className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.class} hover:${statusInfo.class}`}
          >
            {statusInfo.text}
          </Badge>
        </div>

        <div className="flex gap-2">
          <Link href={`/campaigns/wizard/step-1?id=${campaignIdParam}`}>
            <Button
              asChild
              variant="outline"
              size="sm"
              disabled={!canPerformActions}
              title={!canPerformActions ? 'Select an active organization to edit' : 'Edit Campaign'}
            >
              <span className="inline-flex items-center">
                <Icon iconId="faPenToSquareLight" className="mr-2 h-4 w-4 text-muted-foreground" />
                Edit
              </span>
            </Button>
          </Link>
          <DuplicateCampaignButton
            campaignId={campaignIdParam}
            campaignName={campaignData.name}
            onDuplicateSuccess={() => {
              console.log('Duplicate successful, parent notified.');
            }}
            variant="outline"
            size="sm"
            buttonContent={
              <span className="inline-flex items-center">
                <Icon iconId="faCopyLight" className="mr-2 h-4 w-4 text-muted-foreground" />
                Duplicate
              </span>
            }
          />
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteModal(true)}
            disabled={!canPerformActions} // Disable delete button
            title={
              !canPerformActions ? 'Select an active organization to delete' : 'Delete Campaign'
            }
          >
            <Icon iconId="faTrashCanLight" className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <PageSection>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Card className="shadow-sm hover:shadow-md transition-all border bg-card overflow-hidden">
            <CardHeader className="bg-muted/10 border-b px-5 py-3">
              <CardTitle className="text-sm font-medium">Business Goal</CardTitle>
            </CardHeader>
            <CardContent className="px-5 py-4">
              <p className="font-medium text-base">{campaignData.businessGoal}</p>
            </CardContent>
          </Card>

          <div className="md:col-span-2 grid grid-cols-1 lg:grid-cols-3 gap-5">
            <Card className="shadow-sm hover:shadow-md transition-all border bg-card overflow-hidden">
              <CardHeader className="bg-muted/10 border-b px-5 py-3">
                <CardTitle className="text-sm font-medium">Campaign Duration</CardTitle>
              </CardHeader>
              <CardContent className="px-5 py-4">
                <p className="font-medium text-base">
                  {campaignData.startDate} - {campaignData.endDate}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{campaignData.timeZone}</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm hover:shadow-md transition-all border bg-card overflow-hidden">
              <CardHeader className="bg-muted/10 border-b px-5 py-3">
                <CardTitle className="text-sm font-medium">Budget</CardTitle>
              </CardHeader>
              <CardContent className="px-5 py-4">
                <div className="text-lg font-semibold text-foreground mb-1">
                  Social: {formatCurrency(campaignData.budget.social, campaignData.budget.currency)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total: {formatCurrency(campaignData.budget.total, campaignData.budget.currency)}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm hover:shadow-md transition-all border bg-card overflow-hidden">
              <CardHeader className="bg-muted/10 border-b px-5 py-3">
                <CardTitle className="text-sm font-medium">Primary Contact</CardTitle>
              </CardHeader>
              <CardContent className="px-5 py-4">
                <p className="font-medium text-base">{campaignData.primaryContact.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {campaignData.primaryContact.position}
                </p>
                <p className="text-xs text-accent mt-1.5">{campaignData.primaryContact.email}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageSection>

      {campaignData.influencers && campaignData.influencers.length > 0 && (
        <PageSection>
          <SectionHeader title="Influencers" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {campaignData.influencers.map((influencer, index) => {
              const platformKey = influencer.platform.toLowerCase();
              const platformDisplayMap: Record<
                string,
                { brandIconId: string; displayName: string }
              > = {
                instagram: { brandIconId: 'brandsInstagram', displayName: 'Instagram' },
                youtube: { brandIconId: 'brandsYoutube', displayName: 'YouTube' },
                tiktok: { brandIconId: 'brandsTiktok', displayName: 'TikTok' },
                twitter: { brandIconId: 'brandsXTwitter', displayName: 'X (Twitter)' },
                facebook: { brandIconId: 'brandsFacebook', displayName: 'Facebook' },
                linkedin: { brandIconId: 'brandsLinkedin', displayName: 'LinkedIn' },
              };

              const platformInfo = platformDisplayMap[platformKey];

              return (
                <Card
                  key={index}
                  className="shadow-sm hover:shadow-md transition-all border bg-card overflow-hidden group"
                >
                  <CardContent className="p-4 flex flex-col items-center text-center">
                    <div className="mb-4 h-24 w-24 rounded-full bg-accent/15 flex items-center justify-center group-hover:bg-accent/25 transition-colors">
                      <Icon iconId={'faUserCircleLight'} className="h-full w-full text-accent" />
                    </div>

                    <div className="flex items-center space-x-2">
                      {platformInfo ? (
                        <Icon
                          iconId={platformInfo.brandIconId}
                          className="h-5 w-5 flex-shrink-0 text-muted-foreground group-hover:text-foreground transition-colors"
                        />
                      ) : (
                        <Icon
                          iconId="faLinkSimpleLight"
                          className="h-5 w-5 flex-shrink-0 text-muted-foreground"
                        />
                      )}
                      <p className="text-sm font-semibold text-foreground truncate">
                        {influencer.handle}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </PageSection>
      )}

      <PageSection>
        <SectionHeader title="Contacts" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {campaignData.contacts.map((contact, index) => (
            <Card
              key={index}
              className="shadow-sm hover:shadow-md transition-all border bg-card overflow-hidden group"
            >
              <CardContent className="p-5">
                <div className="flex items-start">
                  <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center mr-3 group-hover:bg-accent/20 transition-colors">
                    <Icon
                      iconId="faUserLight"
                      className="h-5 w-5 text-accent group-hover:fa-solid transition-all"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{contact.name || 'N/A'}</h3>
                    <p className="text-xs text-muted-foreground">{contact.position || 'N/A'}</p>
                    {contact.email && (
                      <p className="text-xs text-accent break-words mt-2 flex items-center">
                        <Icon iconId="faEnvelopeLight" className="mr-1.5 opacity-70 h-3 w-3" />
                        <a href={`mailto:${contact.email}`} className="hover:underline">
                          {contact.email}
                        </a>
                      </p>
                    )}
                    {contact.phone && (
                      <p className="text-xs text-accent break-words mt-1 flex items-center">
                        <Icon iconId="faPhoneLight" className="mr-1.5 opacity-70 h-3 w-3" />
                        <a href={`tel:${contact.phone}`} className="hover:underline">
                          {contact.phone}
                        </a>
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </PageSection>

      <PageSection>
        <SectionHeader title="Performance" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
          <Card className="shadow-sm hover:shadow-md transition-all border bg-card md:col-span-1 h-full flex flex-col">
            <CardHeader className="bg-muted/10 border-b px-5 py-4 flex-shrink-0">
              <CardTitle className="text-base font-medium">Primary KPI</CardTitle>
            </CardHeader>
            <CardContent className="px-5 py-4 flex-grow flex justify-center items-center">
              <KpiBadge kpi={campaignData.primaryKPI} isPrimary={true} />
            </CardContent>
          </Card>

          {campaignData.secondaryKPIs && campaignData.secondaryKPIs.length > 0 && (
            <Card className="shadow-sm hover:shadow-md transition-all border bg-card md:col-span-2 h-full">
              <CardHeader className="bg-muted/10 border-b px-5 py-4">
                <CardTitle className="text-base font-medium">Secondary KPIs</CardTitle>
              </CardHeader>
              <CardContent className="px-5 py-4 flex flex-wrap gap-3 items-center">
                {campaignData.secondaryKPIs.map((kpi, index) => (
                  <KpiBadge key={index} kpi={kpi} />
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </PageSection>

      <PageSection>
        <SectionHeader title="Hypotheses and Messaging" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          <div>
            <Card className="shadow-sm hover:shadow-md transition-all border bg-card overflow-hidden h-full">
              <CardHeader className="bg-muted/10 border-b px-5 py-4">
                <CardTitle className="text-base font-medium">Expected Outcomes</CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-5">
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-1">
                    Memorability / Ad Recall Hypothesis
                  </h4>
                  <p className="text-sm text-foreground bg-muted/30 p-3 rounded-md leading-relaxed">
                    {campaignData.expectedOutcomes?.memorability || 'Not specified'}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-1">
                    Purchase/Action Intent Hypothesis
                  </h4>
                  <p className="text-sm text-foreground bg-muted/30 p-3 rounded-md leading-relaxed">
                    {campaignData.expectedOutcomes?.purchaseIntent || 'Not specified'}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-1">
                    Brand Perception Hypothesis
                  </h4>
                  <p className="text-sm text-foreground bg-muted/30 p-3 rounded-md leading-relaxed">
                    {campaignData.expectedOutcomes?.brandPerception || 'Not specified'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          <div>
            <Card className="shadow-sm hover:shadow-md transition-all border bg-card overflow-hidden h-full">
              <CardHeader className="bg-muted/10 border-b px-5 py-4">
                <CardTitle className="text-base font-medium">Campaign Messaging</CardTitle>
              </CardHeader>
              <CardContent className="p-6 flex flex-col space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-1.5">
                    Main Message
                  </h3>
                  <p className="text-sm text-foreground bg-muted/30 p-3 rounded-md leading-relaxed">
                    {campaignData.mainMessage || 'Not specified'}
                  </p>
                </div>
                <Separator />
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">Hashtags</h3>
                  <BadgeGroup items={campaignData.hashtags || []} />
                </div>
                <Separator />
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-1.5">
                    Key Benefits
                  </h3>
                  <p className="text-sm text-foreground bg-muted/30 p-3 rounded-md leading-relaxed">
                    {campaignData.keyBenefits || 'Not specified'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageSection>

      <PageSection>
        <SectionHeader title="Target Audience" />
        <Card className="shadow-sm border bg-card overflow-hidden">
          <CardHeader className="bg-muted/10 border-b px-5 py-4">
            <CardTitle className="text-base font-medium">Audience Profile</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Age Ranges</h3>
                {campaignData.audience.ageRanges &&
                typeof campaignData.audience.ageRanges === 'object' &&
                Object.keys(campaignData.audience.ageRanges).length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-2 justify-start items-center">
                    {AGE_BRACKETS.map(bracket => {
                      const percentage =
                        (campaignData.audience.ageRanges as Record<string, number>)[bracket.key] ||
                        0;
                      const colorClass =
                        percentage > 10
                          ? 'bg-accent/10 border-accent'
                          : percentage > 0
                            ? 'bg-secondary/10 border-secondary'
                            : 'border-input bg-transparent opacity-60';
                      return (
                        <div
                          key={`${bracket.key}-summary`}
                          className={cn(
                            'relative h-12 w-16 rounded-md border-2 flex flex-col items-center justify-center p-1 transition-colors duration-200',
                            percentage > 0 ? colorClass : 'border-input bg-transparent opacity-60'
                          )}
                          title={`${bracket.label}: ${Number(percentage).toFixed(0)}%`}
                        >
                          <span
                            className={cn(
                              'text-xs font-semibold',
                              percentage > 0 ? 'text-foreground' : 'text-muted-foreground'
                            )}
                          >
                            {Number(percentage).toFixed(0)}%
                          </span>
                          <span className="text-[10px] text-muted-foreground mt-0.5">
                            {bracket.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground italic">Not specified</span>
                )}
                <h3 className="text-sm font-medium text-muted-foreground mt-4 mb-3">Genders</h3>
                <div className="flex flex-wrap gap-2">
                  {campaignData.audience.genders.length > 0 ? (
                    campaignData.audience.genders.map((gender, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="bg-background border-border px-2.5 py-0.5 text-xs"
                      >
                        {gender}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground text-xs italic">Not specified</span>
                  )}
                </div>
                <h3 className="text-sm font-medium text-muted-foreground mt-4 mb-3">Locations</h3>
                <div className="flex flex-wrap gap-2">
                  {campaignData.audience.locations.length > 0 ? (
                    campaignData.audience.locations.map((location, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="bg-background border-border px-2.5 py-0.5 text-xs"
                      >
                        {location}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground text-xs italic">Not specified</span>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {campaignData.audience.languages.length > 0 ? (
                    campaignData.audience.languages.map((lang, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="bg-background border-border px-2.5 py-0.5 text-xs"
                      >
                        {lang}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground text-xs italic">Not specified</span>
                  )}
                </div>
                <h3 className="text-sm font-medium text-muted-foreground mt-4 mb-3">Competitors</h3>
                <div className="flex flex-wrap gap-2">
                  {campaignData.audience.competitors.length > 0 ? (
                    campaignData.audience.competitors.map((competitor, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="bg-background border-border px-2.5 py-0.5 text-xs"
                      >
                        {competitor}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground text-xs italic">Not specified</span>
                  )}
                </div>
                <h3 className="text-sm font-medium text-muted-foreground mt-4 mb-3">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {campaignData.audience.interests.length > 0 ? (
                    campaignData.audience.interests.map((interest, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="bg-background border-border px-2.5 py-0.5 text-xs"
                      >
                        {interest}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground text-xs italic">Not specified</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </PageSection>

      <PageSection>
        <SectionHeader title="Creative Assets" />
        <Card className="shadow-sm border bg-card overflow-hidden">
          <CardHeader className="bg-muted/10 border-b px-5 py-4 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-medium">Creative Assets</CardTitle>
            {campaignData.assets.uploaded && campaignData.assets.uploaded.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 rounded-md border border-gray-200 shadow-sm hover:shadow bg-background group"
                onClick={handleDownloadAllAssets}
              >
                <Icon
                  iconId="faDownloadLight"
                  className="mr-2 h-3.5 w-3.5 group-hover:fa-solid transition-all"
                />
                Download All
              </Button>
            )}
          </CardHeader>
          <CardContent className="px-5 py-6">
            {campaignData.assets.uploaded && campaignData.assets.uploaded.length > 0 ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {campaignData.assets.uploaded.map(assetItem => {
                    return (
                      <AssetCard
                        key={assetItem.id}
                        asset={assetItem}
                        currency={campaignData.budget?.currency}
                        cardClassName="w-full h-full"
                        className="p-0"
                      />
                    );
                  })}
                </div>

                {campaignData.assets.guidelinesSummary &&
                  campaignData.assets.guidelinesSummary !== 'Not Set' && (
                    <div className="mt-6 pt-6 border-t">
                      <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center">
                        Guidelines Summary
                      </h3>
                      <div className="p-4 bg-muted/10 rounded-md border text-sm">
                        {campaignData.assets.guidelinesSummary}
                      </div>
                    </div>
                  )}
                {campaignData.assets.requirements &&
                  campaignData.assets.requirements.length > 0 && (
                    <div className="mt-6 pt-6 border-t">
                      <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center">
                        Requirements
                      </h3>
                      <div className="space-y-2">
                        {campaignData.assets.requirements.map((req, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-2 p-3 bg-muted/10 rounded-md border"
                          >
                            <Icon
                              iconId={req.mandatory ? 'faCircleCheckLight' : 'faCircleInfoLight'}
                              className={`h-5 w-5 mt-0.5 ${req.mandatory ? 'text-green-500' : 'text-accent'}`}
                            />
                            <span className="text-sm">{req.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                <div className="h-20 w-20 rounded-full bg-muted/20 flex items-center justify-center mb-4">
                  <Icon iconId="faFileImageLight" className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No assets uploaded</h3>
                <p className="text-muted-foreground max-w-md mb-6">
                  Creative assets for this campaign will appear here once uploaded. You can upload
                  assets from the campaign editor.
                </p>
                <Button
                  onClick={() => router.push(`/campaigns/wizard/step-4?id=${campaignIdParam}`)}
                  className="bg-accent hover:bg-accent/90 text-white"
                >
                  <Icon iconId="faUploadLight" className="mr-2" />
                  Edit Campaign to Upload Assets
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </PageSection>

      {campaignData && (
        <ConfirmDeleteDialog
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={executeDeleteCampaign}
          itemName={campaignData.name || 'this campaign'}
        />
      )}
    </div>
  );
}
