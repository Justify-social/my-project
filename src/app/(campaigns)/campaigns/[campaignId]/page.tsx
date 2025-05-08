'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Separator,
} from '@/components/ui';
import { Icon } from '@/components/ui/icon/icon';
import Skeleton from '@/components/ui/loading-skeleton';
import ErrorFallback from '@/components/features/core/error-handling/ErrorFallback';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import CardAsset from '@/components/ui/card-asset';
import { type VariantProps } from 'class-variance-authority';
import { badgeVariants } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// Define necessary types
interface CampaignData {
  id: string;
  name: string;
  status: string;
  startDate: string;
  endDate: string;
  timeZone: string;
  businessGoal: string;
  budget: {
    total: number;
    social: number;
    currency: string;
  };
  primaryContact: {
    name: string;
    email: string;
    position: string;
  };
  secondaryContact?: {
    name: string;
    email: string;
    position: string;
  };
  influencers?: Array<{ handle: string; platform: string }>;
  primaryKPI: string;
  secondaryKPIs: string[];
  features: string[];
  mainMessage: string;
  hashtags: string[];
  keyBenefits: string;
  expectedOutcomes: {
    memorability: string;
    purchaseIntent: string;
    brandPerception: string;
  };
  audience: {
    genders: string[];
    ageRange?: string;
    languages: string[];
    interests: string[];
    keywords: string[];
    locations: string[];
    competitors: string[];
  };
  assets: {
    guidelinesSummary: string;
    requirements: Array<{ text: string; mandatory: boolean }>;
    uploaded: Array<{ name: string; url: string }>;
    notes: string;
  };
  contacts?: Array<{ name: string; email: string; position: string; phone?: string }>;
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

interface ApiLocation {
  location?: string | null;
}

interface ApiRequirement {
  requirement?: string | null;
}

interface ApiAsset {
  name?: string | null;
  url?: string | null;
}

interface ApiContact {
  firstName?: string | null;
  surname?: string | null;
  email?: string | null;
  position?: string | null;
}

// Define type for badge variants based on the component's CVA definition
type BadgeVariant = VariantProps<typeof badgeVariants>['variant'];

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
  const normalizedKey = kpiKey.toLowerCase().replace(/_([a-z])/g, (_, char) => char.toUpperCase());
  return kpiTooltips[normalizedKey] || 'Measures campaign performance';
};

// DataItem component for consistent display formatting
const DataItem = ({
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

// Section Header component
const SectionHeader = ({ title, className }: { title: string; className?: string }) => (
  <div className={cn('flex items-center gap-2 mb-5', className)}>
    <h2 className="text-xl font-semibold tracking-tight whitespace-nowrap">{title}</h2>
    <Separator className="flex-grow" />
  </div>
);

// Card Group component for consistent styling
const CardGroup = ({ children, className }: { children: React.ReactNode; className?: string }) => (
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
          'flex items-center gap-2 px-3 py-2 rounded-md border',
          isPrimary ? 'bg-accent/15 border-accent/30' : 'bg-accent/10 border-accent/20'
        )}
      >
        {iconPath && (
          <div className="flex-shrink-0 h-5 w-5 relative">
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
        <span className={cn('text-sm font-medium text-accent', isPrimary && 'font-semibold')}>
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
const formatMeasurementName = (name: string): string => {
  return name
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export default function CampaignDetail() {
  const router = useRouter();
  const params = useParams();
  const campaignIdParam = (params?.campaignId as string) || '';
  const [campaignData, setCampaignData] = useState<CampaignData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCampaignData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/campaigns/${campaignIdParam}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch campaign data: ${response.status}`);
        }
        const apiResponse = await response.json();
        // Extract the nested data object from the API response
        const data = apiResponse.data || apiResponse; // Fallback to apiResponse if data is not nested
        // Transform API data to match our CampaignData interface
        // Temporarily simplify transformation to isolate issues
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid campaign data received from API');
        }

        // Minimal transformation for debugging
        const transformedData: CampaignData = {
          id: data.id ? data.id.toString() : 'N/A',
          name: data.name || 'Unnamed Campaign',
          status: data.status ? data.status.toLowerCase() : 'Unknown',
          startDate: data.startDate ? new Date(data.startDate).toLocaleDateString() : 'N/A',
          endDate: data.endDate ? new Date(data.endDate).toLocaleDateString() : 'N/A',
          timeZone: data.timeZone || 'N/A',
          businessGoal: data.businessGoal || 'Not Set',
          budget: {
            total: data.budget?.total || 0,
            social: data.budget?.socialMedia || 0,
            currency: data.budget?.currency || 'USD',
          },
          primaryContact: {
            name: data.primaryContact
              ? `${data.primaryContact.firstName || ''} ${data.primaryContact.surname || ''}`.trim()
              : 'N/A',
            email: data.primaryContact?.email || 'N/A',
            position: data.primaryContact?.position || 'N/A',
          },
          secondaryContact: data.secondaryContact
            ? {
                name: `${data.secondaryContact.firstName || ''} ${data.secondaryContact.surname || ''}`.trim(),
                email: data.secondaryContact?.email || 'N/A',
                position: data.secondaryContact?.position || 'N/A',
              }
            : undefined,
          influencers:
            data.Influencer && Array.isArray(data.Influencer)
              ? data.Influencer.map((inf: ApiInfluencer) => ({
                  handle: inf.handle || 'N/A',
                  platform: inf.platform || 'N/A',
                }))
              : [],
          primaryKPI: data.primaryKPI || 'Not Set',
          secondaryKPIs:
            data.secondaryKPIs && Array.isArray(data.secondaryKPIs) ? data.secondaryKPIs : [],
          features: data.features && Array.isArray(data.features) ? data.features : [],
          mainMessage: data.mainMessage || data.messaging?.mainMessage || 'Not Set',
          hashtags: Array.isArray(data.messaging?.hashtags) ? data.messaging.hashtags : [],
          keyBenefits: data.messaging?.keyBenefits || 'Not Set',
          expectedOutcomes: {
            memorability: data.expectedOutcomes?.memorability || 'Not Set',
            purchaseIntent: data.expectedOutcomes?.purchaseIntent || 'Not Set',
            brandPerception: data.expectedOutcomes?.brandPerception || 'Not Set',
          },
          audience: {
            genders:
              data.demographics?.gender && Array.isArray(data.demographics.gender)
                ? data.demographics.gender
                : [],
            ageRange: data.demographics?.ageRange
              ? Array.isArray(data.demographics.ageRange)
                ? data.demographics.ageRange.join('-')
                : data.demographics.ageRange
              : 'Not Set',
            languages:
              data.targeting?.languages && Array.isArray(data.targeting.languages)
                ? data.targeting.languages.map((l: ApiLanguage) => l?.language || 'N/A')
                : [],
            interests:
              data.demographics?.interests && Array.isArray(data.demographics.interests)
                ? data.demographics.interests
                : [],
            keywords: [],
            locations:
              data.locations && Array.isArray(data.locations)
                ? data.locations.map((loc: ApiLocation) => loc?.location || 'N/A')
                : [],
            competitors:
              data.competitors && Array.isArray(data.competitors) ? data.competitors : [],
          },
          assets: {
            guidelinesSummary:
              data.assetsDetails?.guidelinesSummary ||
              data.assetDetails?.guidelines ||
              data.guidelines ||
              'Not Set',
            requirements: (data.assetsDetails?.requirements &&
            Array.isArray(data.assetsDetails.requirements)
              ? data.assetsDetails.requirements
              : data.assetDetails?.requirementsList &&
                  Array.isArray(data.assetDetails.requirementsList)
                ? data.assetDetails.requirementsList
                : data.requirements && Array.isArray(data.requirements)
                  ? data.requirements
                  : []
            ).map((req: ApiRequirement | any) => ({
              // Allow for slightly different req structures
              text: req?.text || req?.requirement || 'N/A',
              mandatory: req?.mandatory || false, // Attempt to get mandatory flag
            })),
            uploaded: (data.assetsDetails?.uploadedFiles &&
            Array.isArray(data.assetsDetails.uploadedFiles)
              ? data.assetsDetails.uploadedFiles
              : data.assetDetails?.files && Array.isArray(data.assetDetails.files)
                ? data.assetDetails.files
                : data.assets && Array.isArray(data.assets)
                  ? data.assets
                  : []
            ).map((asset: ApiAsset | any) => ({
              // Allow for slightly different asset structures
              name: asset?.name || asset?.fileName || 'Unnamed Asset',
              url: asset?.url || '#',
            })),
            notes: data.assetsDetails?.notes || data.assetDetails?.notes || data.notes || 'Not Set',
          },
          contacts: [
            ...(data.primaryContact
              ? [
                  {
                    name:
                      `${data.primaryContact.firstName || ''} ${data.primaryContact.surname || ''}`.trim() ||
                      'N/A',
                    email: data.primaryContact.email || 'N/A',
                    position: data.primaryContact.position || 'N/A',
                    phone: undefined,
                  },
                ]
              : []),
            ...(data.secondaryContact
              ? [
                  {
                    name:
                      `${data.secondaryContact.firstName || ''} ${data.secondaryContact.surname || ''}`.trim() ||
                      'N/A',
                    email: data.secondaryContact.email || 'N/A',
                    position: data.secondaryContact.position || 'N/A',
                    phone: undefined,
                  },
                ]
              : []),
            ...(data.additionalContacts && Array.isArray(data.additionalContacts)
              ? data.additionalContacts.map((contact: ApiContact) => ({
                  name: `${contact.firstName || ''} ${contact.surname || ''}`.trim() || 'N/A',
                  email: contact.email || 'N/A',
                  position: contact.position || 'N/A',
                  phone: undefined,
                }))
              : []),
          ],
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

  const getStatusInfo = (status: string): { className: string; text: string } => {
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
      case 'draft':
        return { className: 'bg-gray-100 text-gray-800', text: 'Draft' };
      case 'pending':
      case 'in_review':
      case 'review':
        return { className: 'bg-yellow-100 text-yellow-800', text: 'Review' };
      case 'approved':
      case 'active':
        return {
          className: 'bg-green-100 text-green-800',
          text: status === 'approved' ? 'Approved' : 'Active',
        };
      case 'completed':
        return { className: 'bg-blue-100 text-blue-800', text: 'Completed' };
      case 'rejected':
        return { className: 'bg-red-100 text-red-800', text: 'Rejected' };
      case 'ended':
        return { className: 'bg-gray-100 text-gray-800', text: 'Ended' };
      default:
        return { className: 'bg-gray-100 text-gray-800', text: status || 'Unknown' };
    }
  };

  // Formatted display for currency
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
      toast.error('No assets to download.');
      return;
    }

    const toastId = toast.loading('Preparing assets for download...');
    const zip = new JSZip();

    try {
      const assetPromises = campaignData.assets.uploaded.map(async asset => {
        try {
          const response = await fetch(asset.url); // Assuming asset.url is directly downloadable
          if (!response.ok) {
            console.error(
              `Failed to fetch asset ${asset.name} from ${asset.url}: ${response.statusText}`
            );
            return; // Skip this asset
          }
          const blob = await response.blob();
          let fileName = asset.name;
          // Basic extension check - might need improvement for more complex cases or if names don't have extensions
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
        toast.error('No assets could be fetched for download.', { id: toastId });
        return;
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, `${campaignData.name || 'campaign'}_assets.zip`);
      toast.success('Assets downloaded successfully!', { id: toastId });
    } catch (error) {
      console.error('Error creating zip file:', error);
      toast.error('Failed to download assets. See console for details.', { id: toastId });
    }
  };

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

  const statusInfo = getStatusInfo(campaignData.status);

  // Define what age ranges to display based on the data
  const ageRanges = [
    { label: '18-24: 25%', isActive: campaignData.audience.ageRange?.includes('18-24') },
    { label: '25-34: 15%', isActive: campaignData.audience.ageRange?.includes('25-34') },
    { label: '35-44: 15%', isActive: campaignData.audience.ageRange?.includes('35-44') },
    { label: '45-54: 15%', isActive: campaignData.audience.ageRange?.includes('45-54') },
    { label: '55-64: 15%', isActive: campaignData.audience.ageRange?.includes('55-64') },
    { label: '65+: 15%', isActive: campaignData.audience.ageRange?.includes('65+') },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-10">
      {/* Header Section with Campaign Name & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">{campaignData.name}</h1>
          <Badge className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.className}`}>
            {statusInfo.text}
          </Badge>
        </div>

        <div className="flex gap-2">
          <Link href={`/campaigns/wizard/step-1?id=${campaignIdParam}`}>
            <Button
              variant="outline"
              className="group rounded-md border border-gray-200 shadow-sm hover:shadow bg-background"
              size="sm"
            >
              <Icon
                iconId="faPenToSquareLight"
                className="mr-2 text-muted-foreground group-hover:fa-solid group-hover:text-foreground transition-all"
              />
              Edit
            </Button>
          </Link>
          <Button
            variant="outline"
            className="group rounded-md border border-gray-200 shadow-sm hover:shadow bg-background"
            size="sm"
            onClick={() => toast.success('Duplicate functionality to be implemented')}
          >
            <Icon
              iconId="faCopyLight"
              className="mr-2 text-muted-foreground group-hover:fa-solid group-hover:text-foreground transition-all"
            />
            Duplicate
          </Button>
          <Button
            variant="destructive"
            className="group rounded-md"
            size="sm"
            onClick={() => toast.error('Delete functionality to be implemented')}
          >
            <Icon iconId="faTrashCanLight" className="mr-2 group-hover:fa-solid transition-all" />
            Delete
          </Button>
        </div>
      </div>

      {/* Campaign Overview Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        {/* Business Goal */}
        <Card className="shadow-sm hover:shadow-md transition-all border bg-card overflow-hidden xl:col-span-2">
          <CardHeader className="bg-muted/10 border-b px-5 py-3 flex items-center gap-2">
            <Icon iconId="faBullseyeLight" className="h-4 w-4 text-accent flex-shrink-0" />
            <CardTitle className="text-sm font-medium">Business Goal</CardTitle>
          </CardHeader>
          <CardContent className="px-5 py-4">
            <p className="font-medium text-base">{campaignData.businessGoal}</p>
          </CardContent>
        </Card>

        {/* Campaign Duration */}
        <Card className="shadow-sm hover:shadow-md transition-all border bg-card overflow-hidden">
          <CardHeader className="bg-muted/10 border-b px-5 py-3 flex items-center gap-2">
            <Icon iconId="faCalendarDaysLight" className="h-4 w-4 text-accent flex-shrink-0" />
            <CardTitle className="text-sm font-medium">Campaign Duration</CardTitle>
          </CardHeader>
          <CardContent className="px-5 py-4">
            <p className="font-medium text-base">
              {campaignData.startDate} - {campaignData.endDate}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{campaignData.timeZone}</p>
          </CardContent>
        </Card>

        {/* Budget */}
        <Card className="shadow-sm hover:shadow-md transition-all border bg-card overflow-hidden">
          <CardHeader className="bg-muted/10 border-b px-5 py-3 flex items-center gap-2">
            <Icon iconId="faDollarSignLight" className="h-4 w-4 text-accent flex-shrink-0" />
            <CardTitle className="text-sm font-medium">Budget</CardTitle>
          </CardHeader>
          <CardContent className="px-5 py-4">
            <div className="font-medium text-base">
              Total: {formatCurrency(campaignData.budget.total, campaignData.budget.currency)}
            </div>
            <div className="text-sm text-muted-foreground mt-1 flex items-center">
              <Icon iconId="faShareNodesLight" className="mr-1.5 h-3 w-3 opacity-80" />
              Social: {formatCurrency(campaignData.budget.social, campaignData.budget.currency)}
            </div>
          </CardContent>
        </Card>

        {/* Primary Contact */}
        <Card className="shadow-sm hover:shadow-md transition-all border bg-card overflow-hidden">
          <CardHeader className="bg-muted/10 border-b px-5 py-3 flex items-center gap-2">
            <Icon iconId="faUserLight" className="h-4 w-4 text-accent flex-shrink-0" />
            <CardTitle className="text-sm font-medium">Primary Contact</CardTitle>
          </CardHeader>
          <CardContent className="px-5 py-4">
            <p className="font-medium text-base">{campaignData.primaryContact.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {campaignData.primaryContact.position}
            </p>
            <p className="text-xs text-accent mt-1.5 flex items-center">
              <Icon iconId="faEnvelopeLight" className="mr-1.5 h-3 w-3 opacity-80" />
              {campaignData.primaryContact.email}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* KPIs, Objectives & Expected Outcomes Section */}
      <div>
        <SectionHeader title="Performance & Outcomes" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Primary & Secondary KPIs Card */}
          <Card className="shadow-sm hover:shadow-md transition-all border bg-card">
            <CardHeader className="bg-muted/10 border-b px-5 py-4">
              <div className="flex items-center gap-2">
                <Icon iconId="faChartBarLight" className="h-5 w-5 text-accent flex-shrink-0" />
                <CardTitle className="text-base font-medium">Key Performance Indicators</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-5 py-4 space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">Primary KPI</h3>
                <KpiBadge kpi={campaignData.primaryKPI} isPrimary={true} />
              </div>
              {campaignData.secondaryKPIs.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                    Secondary KPIs
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {campaignData.secondaryKPIs.map((kpi, index) => (
                      <KpiBadge key={index} kpi={kpi} />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Expected Outcomes Card */}
          <Card className="shadow-sm hover:shadow-md transition-all border bg-card overflow-hidden">
            <CardHeader className="bg-muted/10 border-b px-5 py-4">
              <div className="flex items-center gap-2">
                <Icon iconId="faClipboardLight" className="h-5 w-5 text-accent flex-shrink-0" />
                <CardTitle className="text-base font-medium">Expected Outcomes</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-5">
              <div className="flex items-start">
                <Icon
                  iconId="faCommentDotsLight"
                  className="h-6 w-6 text-accent mr-3 mt-0.5 flex-shrink-0"
                />
                <div>
                  <h4 className="font-medium text-foreground mb-1">Memorability</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {campaignData.expectedOutcomes.memorability}
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <Icon
                  iconId="faCreditCardLight"
                  className="h-6 w-6 text-accent mr-3 mt-0.5 flex-shrink-0"
                />
                <div>
                  <h4 className="font-medium text-foreground mb-1">Purchase Intent</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {campaignData.expectedOutcomes.purchaseIntent}
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <Icon
                  iconId="faStarLight"
                  className="h-6 w-6 text-accent mr-3 mt-0.5 flex-shrink-0"
                />
                <div>
                  <h4 className="font-medium text-foreground mb-1">Brand Perception</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {campaignData.expectedOutcomes.brandPerception}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Campaign Messaging Section */}
      <div>
        <SectionHeader title="Campaign Messaging" />
        <Card className="shadow-sm hover:shadow-md transition-all border bg-card overflow-hidden">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-start">
              <Icon
                iconId="faMegaphoneLight"
                className="h-7 w-7 text-accent mr-4 mt-1 flex-shrink-0"
              />
              <div>
                <h3 className="text-base font-semibold text-foreground mb-1.5">Main Message</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {campaignData.mainMessage}
                </p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start">
                <Icon iconId="faTagLight" className="h-7 w-7 text-accent mr-4 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-base font-semibold text-foreground mb-2">Hashtags</h3>
                  <div className="flex flex-wrap gap-2">
                    {campaignData.hashtags.length > 0 ? (
                      campaignData.hashtags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="rounded-md text-xs font-medium bg-accent/10 text-accent border-accent/20 px-2.5 py-1"
                        >
                          #{tag}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground text-sm italic">Not specified</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-start">
                <Icon
                  iconId="faThumbsUpLight"
                  className="h-7 w-7 text-accent mr-4 mt-1 flex-shrink-0"
                />
                <div>
                  <h3 className="text-base font-semibold text-foreground mb-1.5">Key Benefits</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {campaignData.keyBenefits}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contacts Section */}
      <div>
        <SectionHeader title="Contacts" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {campaignData.contacts &&
            campaignData.contacts.map((contact, index) => (
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
      </div>

      {/* Influencers Section */}
      {campaignData.influencers && campaignData.influencers.length > 0 && (
        <div>
          <SectionHeader title="Influencers" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {campaignData.influencers.map((influencer, index) => {
              const platformKey = influencer.platform.toLowerCase();
              // Define a mapping for platform-specific brand icons and their display names
              const platformDisplayMap: Record<
                string,
                { brandIconId: string; displayName: string }
              > = {
                instagram: { brandIconId: 'brandsInstagram', displayName: 'Instagram' },
                youtube: { brandIconId: 'brandsYoutube', displayName: 'YouTube' },
                tiktok: { brandIconId: 'brandsTiktok', displayName: 'TikTok' },
                twitter: { brandIconId: 'brandsXTwitter', displayName: 'X (Twitter)' }, // Assuming brandsXTwitter is in brands-icon-registry
                facebook: { brandIconId: 'brandsFacebook', displayName: 'Facebook' },
                linkedin: { brandIconId: 'brandsLinkedin', displayName: 'LinkedIn' },
                // Add other platforms from your brands-icon-registry.json as needed
              };

              const platformInfo = platformDisplayMap[platformKey];

              return (
                <Card
                  key={index}
                  className="shadow-sm hover:shadow-md transition-all border bg-card overflow-hidden group"
                >
                  <CardContent className="p-5">
                    <div className="flex flex-col items-center text-center">
                      {/* Main avatar icon (generic user) */}
                      <div
                        className={`h-16 w-16 rounded-full flex items-center justify-center mb-3 bg-muted/30 group-hover:bg-muted/50 transition-colors`}
                      >
                        <Icon
                          iconId={'faUserCircleLight'} // Generic user avatar
                          className="h-10 w-10 text-muted-foreground group-hover:text-foreground transition-colors"
                        />
                      </div>
                      <h3 className="font-medium text-base mb-1.5">{influencer.handle}</h3>

                      {/* Platform icon instead of text badge */}
                      {platformInfo ? (
                        <div className="flex items-center gap-1.5">
                          <Icon
                            iconId={platformInfo.brandIconId}
                            className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors"
                          />
                          <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                            {platformInfo.displayName}
                          </span>
                        </div>
                      ) : (
                        // Fallback if platform icon is not in the map (displays platform name as text)
                        <Badge
                          variant="outline"
                          className="rounded-full text-xs bg-background/70 border-border"
                        >
                          {influencer.platform}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Target Audience Section */}
      <div>
        <SectionHeader title="Target Audience" />
        <Card className="shadow-sm border bg-card overflow-hidden">
          {/* Ensure icon is to the left of the title */}
          <CardHeader className="bg-muted/10 border-b px-5 py-4 flex items-center gap-2">
            <Icon iconId="faUsersLight" className="h-5 w-5 text-accent flex-shrink-0" />
            <CardTitle className="text-base font-medium">Audience Profile</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Demographics Row: Age Ranges, Genders, Languages */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-8">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center">
                  <Icon iconId="faChartBarLight" className="mr-2 h-4 w-4 flex-shrink-0" />{' '}
                  {/* Corrected Icon */}
                  Age Ranges
                </h3>
                {campaignData.audience.ageRange && campaignData.audience.ageRange !== 'Not Set' ? (
                  <div className="flex flex-col space-y-1.5">
                    {ageRanges.filter(range => range.isActive).length > 0 ? (
                      ageRanges
                        .filter(range => range.isActive)
                        .map((range, index) => (
                          <div key={index} className="flex items-center text-sm">
                            <span className="text-accent font-medium w-20">
                              {range.label.split(':')[0]}:
                            </span>
                            <span className="text-foreground">
                              {range.label.split(':')[1]?.trim()}
                            </span>
                          </div>
                        ))
                    ) : (
                      <span className="text-sm text-muted-foreground italic">
                        Specific ranges not active or data unavailable. Overall:{' '}
                        {campaignData.audience.ageRange}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground italic">Not specified</span>
                )}
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center">
                  <Icon iconId="faUsersLight" className="mr-2 h-4 w-4 flex-shrink-0" />
                  Genders
                </h3>
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
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center">
                  <Icon iconId="faGlobeLight" className="mr-2 h-4 w-4 flex-shrink-0" />{' '}
                  {/* Corrected Icon */}
                  Languages
                </h3>
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
              </div>
            </div>

            <Separator />

            {/* Interests Row */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center">
                <Icon iconId="faHeartLight" className="mr-2 h-4 w-4 flex-shrink-0" />
                Interests
              </h3>
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

            <Separator />

            {/* Locations & Competitors Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center">
                  <Icon iconId="faMapLight" className="mr-2 h-4 w-4 flex-shrink-0" />
                  Locations
                </h3>
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
                <h3 className="text-sm font-memory text-muted-foreground mb-3 flex items-center">
                  <Icon iconId="faBuildingLight" className="mr-2 h-4 w-4 flex-shrink-0" />
                  Competitors
                </h3>
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
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Creative Assets Section */}
      <div>
        <SectionHeader title="Creative Assets" />
        <Card className="shadow-sm border bg-card overflow-hidden">
          <CardHeader className="bg-muted/10 border-b px-5 py-4 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon iconId="faImageLight" className="h-5 w-5 text-accent flex-shrink-0" />
              <CardTitle className="text-base font-medium">Creative Assets</CardTitle>
            </div>
            {campaignData.assets.uploaded.length > 0 && (
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
            {campaignData.assets.uploaded.length > 0 ? (
              <div className="space-y-6">
                {/* Assets Gallery */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {campaignData.assets.uploaded.map((asset, index) => (
                    <CardAsset
                      key={index}
                      title={asset.name}
                      className="w-full h-[180px] transition-all hover:scale-[1.02] shadow-sm hover:shadow-md border border-gray-200 rounded-md overflow-hidden group"
                    />
                  ))}
                </div>

                {/* Asset Guidelines */}
                {campaignData.assets.guidelinesSummary &&
                  campaignData.assets.guidelinesSummary !== 'Not Set' && (
                    <div className="mt-6 pt-6 border-t">
                      <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center">
                        <Icon iconId="faClipboardListLight" className="mr-2 h-4 w-4" />
                        Guidelines Summary
                      </h3>
                      <div className="p-4 bg-muted/10 rounded-md border text-sm">
                        {campaignData.assets.guidelinesSummary}
                      </div>
                    </div>
                  )}

                {/* Asset Requirements */}
                {campaignData.assets.requirements.length > 0 && (
                  <div className="mt-6 pt-6 border-t">
                    <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center">
                      <Icon iconId="faListCheckLight" className="mr-2 h-4 w-4" />
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
      </div>
    </div>
  );
}
