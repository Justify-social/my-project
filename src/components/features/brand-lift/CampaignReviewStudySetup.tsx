'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@clerk/nextjs';
import { cn } from '@/lib/utils';

// Shadcn UI Imports
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Checkbox as _Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Icon } from '@/components/ui/icon/icon';
import { Accordion } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { IconButtonAction } from '@/components/ui/button-icon-action';
import logger from '@/lib/logger';
import Image from 'next/image';
import { Textarea as _Textarea } from '@/components/ui/textarea';
import { AccordionTrigger as _AccordionTrigger } from '@/components/ui/accordion';
import { RemovableBadge } from '@/components/ui/removable-badge';
import {
  InfluencerCard as _InfluencerCard,
  EnhancedInfluencerCard,
} from '@/components/ui/card-influencer';
import { PlatformEnum } from '@/types/enums';
import { Separator as _Separator } from '@/components/ui/separator';
import { toast as _toast } from 'react-hot-toast';
import {
  showSuccessToast as _showSuccessToast,
  showErrorToast as _showErrorToast,
} from '@/components/ui/toast';

// Assuming these types might be needed from a shared location or defined here
// For DraftCampaignData structure - based on wizard context Step5Content
import type {
  Currency as PrismaCurrency,
  Position as PrismaPosition,
  Platform as PrismaPlatform,
} from '@prisma/client';

// Uncomment and verify paths if these components exist and are to be used
import { AssetCard } from '@/components/ui/card-asset';
// import type { Platform as PrismaPlatformType } from '@prisma/client'; // Already imported

// --- START: Comprehensive CampaignDetails Interface & Helper Utilities (copied/adapted from Step5Content) ---

// --- Utility Functions (copied from Step5Content) ---
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return 'Invalid Date';
  }
};

const formatCurrency = (
  amount: number | null | undefined,
  currency: string | null | undefined
): string => {
  if (amount === null || amount === undefined || !currency) return 'N/A';
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return String(amount); // Fallback
  }
};

// --- KPI & Feature Utilities (copied from Step5Content) ---
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

const formatKpiName = (kpiKey: string | null | undefined): string => {
  if (!kpiKey) return 'N/A';
  const normalizedKey = kpiKey.toLowerCase().replace(/_([a-z])/g, (_, char) => char.toUpperCase());
  return (
    kpiDisplayNames[normalizedKey] ||
    kpiKey
      .replace(/_/g, ' ')
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ')
  );
};

const getKpiTooltipText = (kpiKey: string | null | undefined): string | undefined => {
  if (!kpiKey) return undefined;
  const normalizedKey = kpiKey.toLowerCase().replace(/_([a-z])/g, (_, char) => char.toUpperCase());
  return kpiTooltips[normalizedKey];
};

const formatFeatureName = (featureKey: string | null | undefined): string => {
  if (!featureKey) return 'N/A';
  return featureKey
    .replace(/_/g, ' ')
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
};

const kpiIconMap: Record<string, string> = {
  actionIntent: '/icons/kpis/kpisActionIntent.svg',
  adRecall: '/icons/kpis/kpisAdRecall.svg',
  advocacy: '/icons/kpis/kpisAdvocacy.svg',
  brandAwareness: '/icons/kpis/kpisBrandAwareness.svg',
  brandPreference: '/icons/kpis/kpisBrandPreference.svg',
  consideration: '/icons/kpis/kpisConsideration.svg',
  messageAssociation: '/icons/kpis/kpisMessageAssociation.svg',
  purchaseIntent: '/icons/kpis/kpisPurchaseIntent.svg',
  recommendationIntent: '/icons/kpis/kpisRecommendationIntent.svg',
};

const getKpiIconPath = (kpiKey: string | null | undefined): string => {
  if (!kpiKey) return '';
  const normalizedKey = kpiKey.toLowerCase().replace(/_([a-z])/g, (_, char) => char.toUpperCase());
  return kpiIconMap[normalizedKey] || '';
};

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

const getLanguageName = (langCode: string | null | undefined): string => {
  if (!langCode) return 'N/A';
  const lang = TOP_LANGUAGES_MAP.find(l => l.value.toLowerCase() === langCode.toLowerCase());
  return lang ? lang.label : langCode.toUpperCase();
};

const AGE_BRACKETS: ReadonlyArray<{ key: string; label: string }> = [
  { key: 'age18_24', label: '18-24' },
  { key: 'age25_34', label: '25-34' },
  { key: 'age35_44', label: '35-44' },
  { key: 'age45_54', label: '45-54' },
  { key: 'age55_64', label: '55-64' },
  { key: 'age65plus', label: '65+' },
] as const;

// --- Expanded CampaignDetails Interface (to match DraftCampaignData needs for review) ---
// This interface should align with the data structure expected by Step1Review, Step2Review, etc.
// and what the API at /api/campaign-data-for-brand-lift/${campaignId} should ideally return.
interface CampaignDetails {
  // Based on DraftCampaignData from wizard types and Step5Content needs
  id: string; // campaignId from wizard
  name?: string | null;
  businessGoal?: string | null;
  brand?: string | null;
  website?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  timeZone?: string | null;
  primaryContact?: {
    firstName?: string | null;
    surname?: string | null;
    email?: string | null;
    position?: PrismaPosition | null;
  } | null;
  secondaryContact?: {
    firstName?: string | null;
    surname?: string | null;
    email?: string | null;
    position?: PrismaPosition | null;
  } | null;
  additionalContacts?: Array<{
    firstName?: string | null;
    surname?: string | null;
    email?: string | null;
    position?: PrismaPosition | null;
  }> | null;
  budget?: {
    currency?: PrismaCurrency | null;
    total?: number | null;
    socialMedia?: number | null;
  } | null;
  Influencer?: Array<{
    id?: string | null; // Assuming influencer might have an ID from DB
    platform?: PrismaPlatform | null;
    handle?: string | null;
  }> | null;
  primaryKPI?: string | null;
  secondaryKPIs?: string[] | null;
  features?: string[] | null;
  messaging?: {
    mainMessage?: string | null;
    hashtags?: string[] | null;
    keyBenefits?: string[] | null;
  } | null;
  expectedOutcomes?: {
    memorability?: string | null;
    purchaseIntent?: string | null;
    brandPerception?: string | null;
  } | null;
  demographics?: {
    genders?: string[] | null;
    languages?: string[] | null;
    age18_24?: number | null;
    age25_34?: number | null;
    age35_44?: number | null;
    age45_54?: number | null;
    age55_64?: number | null;
    age65plus?: number | null;
  } | null;
  targeting?: {
    interests?: string[] | null;
    keywords?: string[] | null;
  } | null;
  locations?: Array<{
    city?: string | null;
    region?: string | null;
    country?: string | null;
  }> | null;
  competitors?: string[] | null;
  assets?: Array<{
    id?: string;
    fileName?: string | null;
    url?: string | null;
    type?: string | null; // e.g., 'image', 'video'
    name?: string | null; // Optional user-defined name for asset
    size?: number | null;
    uploadedAt?: string | null;
    rationale?: string | null;
    budget?: number | null;
    muxPlaybackId?: string | undefined;
    muxProcessingStatus?: string | undefined;
    muxAssetId?: string | undefined;
  }> | null;
  // campaignStatus?: string | null; // Or StatusEnum from types
  // step1Complete?: boolean;
  // step2Complete?: boolean;
  // step3Complete?: boolean;
  // step4Complete?: boolean;
  platform?: string | null; // Already in old CampaignDetails, ensure it fits
  audience?: { description?: string } | null; // Already in old, maybe map to demographics.genders/ages etc.
}

// --- END: Comprehensive CampaignDetails Interface & Helper Utilities ---

// --- Funnel Stage Mapping ---
const KpiFunnelStageMap: Record<string, string> = {
  // Top Funnel
  BRAND_AWARENESS: 'Top Funnel',
  AD_RECALL: 'Top Funnel',
  // Mid Funnel
  CONSIDERATION: 'Mid Funnel',
  BRAND_PREFERENCE: 'Mid Funnel',
  MESSAGE_ASSOCIATION: 'Mid Funnel',
  // Bottom Funnel
  PURCHASE_INTENT: 'Bottom Funnel',
  ACTION_INTENT: 'Bottom Funnel',
  RECOMMENDATION_INTENT: 'Bottom Funnel',
  ADVOCACY: 'Bottom Funnel',
};

const getFunnelStageFromKpi = (kpiKey: string | null | undefined): string => {
  if (!kpiKey) return 'Unknown'; // Default or error case
  // Normalize KPI key if it comes in different cases e.g. ad_recall vs AD_RECALL
  const normalizedKpiKey = kpiKey.toUpperCase().replace(/-/g, '_');
  return KpiFunnelStageMap[normalizedKpiKey] || 'Unknown';
};

// The old ALL_KPIS and FUNNEL_STAGES definitions are here in the original file
// I will use the versions copied from Step5Content for consistency if they differ, or merge.
// For now, assuming the copied ones above are the SSOT for this refactor.

const _ALL_KPIS = [
  // This is the existing ALL_KPIS from CampaignReviewStudySetup, ensure it matches the one copied from Step5Content or merge.
  {
    id: 'BRAND_AWARENESS',
    label: 'Brand Awareness',
    description: 'Measures if respondents recall seeing the brand.',
  },
  {
    id: 'AD_RECALL',
    label: 'Ad Recall',
    description: 'Measures if respondents recall seeing the specific ad.',
  },
  {
    id: 'MESSAGE_ASSOCIATION',
    label: 'Message Association',
    description: 'Measures if respondents associate the key message with the brand.',
  },
  {
    id: 'CONSIDERATION',
    label: 'Consideration',
    description: 'Measures if respondents would consider the brand for relevant purchases.',
  },
  {
    id: 'BRAND_PREFERENCE',
    label: 'Brand Preference',
    description: 'Measures if respondents prefer the brand over competitors.',
  },
  {
    id: 'PURCHASE_INTENT',
    label: 'Purchase Intent',
    description: 'Measures likelihood to purchase in the near future.',
  },
  {
    id: 'ACTION_INTENT',
    label: 'Action Intent',
    description:
      'Measures likelihood to take a specific action (e.g., visit website, search for info).',
  },
  {
    id: 'RECOMMENDATION_INTENT',
    label: 'Recommendation Intent',
    description: 'Measures likelihood to recommend the brand/product to others.',
  },
  {
    id: 'ADVOCACY',
    label: 'Advocacy',
    description: 'Measures active promotion or defense of the brand/product.',
  },
];

const _FUNNEL_STAGES = [
  {
    id: 'TOP_FUNNEL',
    label: 'Top Funnel',
    description: 'Focuses on Awareness and Recall metrics.',
  },
  {
    id: 'MID_FUNNEL',
    label: 'Mid Funnel',
    description: 'Focuses on Consideration and Preference.',
  },
  { id: 'BOTTOM_FUNNEL', label: 'Bottom Funnel', description: 'Focuses on Intent and Action.' },
];

// Old CampaignDetails interface (will be effectively replaced by the comprehensive one above)
// interface CampaignDetails {
//   id: number;
//   campaignName: string;
//   primaryKPI?: string | null;
//   platform?: string | null;
//   audience?: { description?: string } | null;
// }

const studySetupSchema = z.object({
  studyName: z.string().min(3, { message: 'Study name must be at least 3 characters.' }),
});

type StudySetupFormValues = z.infer<typeof studySetupSchema>;

interface CampaignReviewStudySetupProps {
  campaignId: string;
}

// --- START: Core Display Components (Correctly Placed) ---

// DataItemProps and DataItem Component
interface DataItemProps {
  label: string;
  value?: string | number | string[] | null;
  children?: React.ReactNode;
  className?: string;
}

const DataItem: React.FC<DataItemProps> = ({ label, value, children, className }) => {
  const displayValue = React.useMemo(() => {
    if (children) return children;
    if (value === null || value === undefined || value === '')
      return <span className="text-muted-foreground italic">Not provided</span>;
    if (Array.isArray(value)) {
      if (value.length === 0) return <span className="text-muted-foreground italic">None</span>;
      return (
        <div className="flex flex-wrap gap-2">
          {value.map((item, index) => (
            <RemovableBadge key={index} variant="secondary" size="sm">
              {item}
            </RemovableBadge>
          ))}
        </div>
      );
    }

    // Convert single string values to badges (except for "N/A" and "Not provided" cases)
    const stringValue = String(value);
    if (stringValue === 'N/A' || stringValue.toLowerCase().includes('not provided')) {
      return <span className="text-muted-foreground italic">{stringValue}</span>;
    }

    return (
      <RemovableBadge variant="secondary" size="sm">
        {stringValue}
      </RemovableBadge>
    );
  }, [value, children]);

  return (
    <div className={cn('mb-3', className)}>
      <p className="text-sm font-medium text-muted-foreground mb-0.5">{label}</p>
      <div className="text-sm text-foreground">{displayValue}</div>
    </div>
  );
};

// SummarySectionProps and SummarySection Component
interface SummarySectionProps {
  title: string;
  stepNumber: number;
  onEdit: (step: number) => void;
  children: React.ReactNode;
  isComplete?: boolean;
}

const SummarySection: React.FC<SummarySectionProps> = ({
  title,
  stepNumber,
  onEdit,
  children,
  isComplete,
}) => {
  return (
    <Card className="group border rounded-lg mb-2">
      <div
        className={cn(
          'flex justify-between items-center w-full p-4',
          isComplete ? 'bg-green-50/50' : 'bg-card'
        )}
      >
        <div className="flex flex-1 items-center text-left text-lg font-semibold text-primary p-0 mr-4">
          <div className="flex items-center">
            <Badge
              variant={isComplete ? 'default' : 'secondary'}
              className={cn('mr-3 h-6 w-6 justify-center', isComplete && 'bg-green-600 text-white')}
            >
              {stepNumber}
            </Badge>
            <span>{title}</span>
            {isComplete && (
              <Icon
                iconId="faCircleCheckSolid"
                className="ml-2 h-4 w-4 text-green-600 flex-shrink-0"
              />
            )}
          </div>
        </div>
        <div className="flex items-center flex-shrink-0">
          <IconButtonAction
            iconBaseName="faPenToSquare"
            hoverColorClass="text-accent"
            ariaLabel={`Edit ${title}`}
            onClick={_e => {
              onEdit(stepNumber);
            }}
          />
        </div>
      </div>
      <CardContent className="p-4 pt-2 border-t overflow-visible">
        <div className="pl-[calc(1rem_+_1.5rem_+_0.75rem)] mt-2">{children}</div>
      </CardContent>
    </Card>
  );
};

// KpiBadge Component
const KpiBadge = ({ kpi, isPrimary = false }: { kpi: string; isPrimary?: boolean }) => {
  const iconPath = getKpiIconPath(kpi);
  const displayName = formatKpiName(kpi);
  const tooltipText = getKpiTooltipText(kpi);

  const badgeContent = (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-md border',
        isPrimary
          ? 'bg-accent/15 border-accent/30 px-4 py-3'
          : 'bg-accent/10 border-accent/20 px-3 py-2'
      )}
    >
      {iconPath && (
        <div className={cn('flex-shrink-0 relative', isPrimary ? 'h-5 w-5' : 'h-4 w-4')}>
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
        className={cn('font-medium text-accent', isPrimary ? 'text-base font-semibold' : 'text-sm')}
      >
        {displayName}
      </span>
    </div>
  );

  if (!tooltipText) {
    return badgeContent;
  }

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>{badgeContent}</TooltipTrigger>
        <TooltipContent
          side="top"
          align="center"
          className="max-w-xs bg-gray-900 text-white text-xs rounded-md py-2 px-3 shadow-lg"
        >
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// --- END: Core Display Components ---

// --- START: Step-Specific Review Components (copied from Step5Content.tsx) ---

// Helper to map Prisma Platform to PlatformEnum
const mapPrismaPlatformToFrontendEnum = (
  prismaPlatform: PrismaPlatform | null | undefined
): PlatformEnum | null => {
  if (!prismaPlatform) return null;
  switch (prismaPlatform) {
    case 'INSTAGRAM': // Assuming PrismaPlatform values are strings like 'INSTAGRAM'
      return PlatformEnum.Instagram;
    case 'YOUTUBE':
      return PlatformEnum.YouTube;
    case 'TIKTOK':
      return PlatformEnum.TikTok;
    // Add other Prisma Platform values if they exist and map to PlatformEnum
    // Example:
    // case 'FACEBOOK':
    //   return PlatformEnum.Facebook;
    // case 'TWITTER':
    //   return PlatformEnum.Twitter;
    default:
      logger.warn(
        `[mapPrismaPlatformToFrontendEnum] Unknown Prisma platform type encountered: ${prismaPlatform}`
      );
      return null;
  }
};

const Step1Review: React.FC<{ data: CampaignDetails }> = ({ data }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
    <DataItem label="Campaign Name" value={data.name} />
    <DataItem label="Business Goal" value={data.businessGoal} className="md:col-span-2" />
    <DataItem label="Campaign Duration">
      {data.startDate && data.endDate ? (
        <RemovableBadge variant="secondary" size="sm">
          {`${formatDate(data.startDate)} - ${formatDate(data.endDate)}`}
        </RemovableBadge>
      ) : (
        <span className="text-muted-foreground italic">N/A</span>
      )}
    </DataItem>
    <DataItem label="Timezone" value={data.timeZone} />
    <DataItem label="Total Budget">
      {data.budget?.total && data.budget?.currency ? (
        <RemovableBadge variant="secondary" size="sm">
          {formatCurrency(data.budget.total, data.budget.currency as string | undefined)}
        </RemovableBadge>
      ) : (
        <span className="text-muted-foreground italic">N/A</span>
      )}
    </DataItem>
    <DataItem label="Social Budget">
      {data.budget?.socialMedia && data.budget?.currency ? (
        <RemovableBadge variant="secondary" size="sm">
          {formatCurrency(data.budget.socialMedia, data.budget.currency as string | undefined)}
        </RemovableBadge>
      ) : (
        <span className="text-muted-foreground italic">N/A</span>
      )}
    </DataItem>
    <DataItem label="Primary Contact Name">
      {(() => {
        const fullName =
          `${data.primaryContact?.firstName || ''} ${data.primaryContact?.surname || ''}`.trim();
        return fullName ? (
          <RemovableBadge variant="secondary" size="sm">
            {fullName}
          </RemovableBadge>
        ) : (
          <span className="text-muted-foreground italic">N/A</span>
        );
      })()}
    </DataItem>
    <DataItem label="Primary Contact Email" value={data.primaryContact?.email} />
    <DataItem
      label="Primary Contact Position"
      value={data.primaryContact?.position as string | undefined}
    />
    {data.secondaryContact && (
      <>
        <DataItem label="Secondary Contact Name">
          {(() => {
            const fullName =
              `${data.secondaryContact?.firstName || ''} ${data.secondaryContact?.surname || ''}`.trim();
            return fullName ? (
              <RemovableBadge variant="secondary" size="sm">
                {fullName}
              </RemovableBadge>
            ) : (
              <span className="text-muted-foreground italic">N/A</span>
            );
          })()}
        </DataItem>
        <DataItem label="Secondary Contact Email" value={data.secondaryContact?.email} />
        <DataItem
          label="Secondary Contact Position"
          value={data.secondaryContact?.position as string | undefined}
        />
      </>
    )}
    <div className="md:col-span-2">
      <p className="text-sm font-medium text-muted-foreground mb-1">Influencers</p>
      {data.Influencer && data.Influencer.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {data.Influencer.map((inf, idx) => {
            const frontendPlatform = mapPrismaPlatformToFrontendEnum(inf.platform);
            if (!frontendPlatform) {
              // Optionally render something else or skip if platform is unknown/null
              // For now, skipping if platform cannot be mapped.
              // Consider a placeholder or logging if this case is frequent.
              logger.warn(
                `Skipping influencer card for ${inf.handle} due to unmappable platform: ${inf.platform}`
              );
              return null;
            }
            return (
              <EnhancedInfluencerCard
                key={inf.id || idx}
                influencer={{
                  handle: inf.handle || 'N/A',
                  platform: frontendPlatform,
                }}
                className="w-full"
              />
            );
          })}
        </div>
      ) : (
        <span className="text-sm text-muted-foreground italic">None added</span>
      )}
    </div>
  </div>
);

const Step2Review: React.FC<{ data: CampaignDetails }> = ({ data }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
    <DataItem label="Primary KPI">
      {data.primaryKPI ? (
        <KpiBadge kpi={data.primaryKPI} isPrimary={true} />
      ) : (
        <span className="text-muted-foreground italic">Not provided</span>
      )}
    </DataItem>
    <DataItem label="Secondary KPIs">
      {data.secondaryKPIs && data.secondaryKPIs.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {data.secondaryKPIs.map((kpi, idx) => (
            <KpiBadge key={idx} kpi={kpi} isPrimary={false} />
          ))}
        </div>
      ) : (
        <span className="text-muted-foreground italic">None</span>
      )}
    </DataItem>
    <DataItem label="Features">
      {data.features && data.features.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {data.features.map((feature, idx) => (
            <RemovableBadge key={idx} variant="secondary" size="sm">
              {formatFeatureName(feature)}
            </RemovableBadge>
          ))}
        </div>
      ) : (
        <span className="text-muted-foreground italic">None</span>
      )}
    </DataItem>
    <DataItem label="Main Message" value={data.messaging?.mainMessage} className="md:col-span-2" />
    <DataItem label="Hashtags">
      {data.messaging?.hashtags && data.messaging.hashtags.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {data.messaging.hashtags.map((tag, idx) => (
            <RemovableBadge key={idx} variant="secondary" size="sm">
              #{tag}
            </RemovableBadge>
          ))}
        </div>
      ) : (
        <span className="text-muted-foreground italic">None</span>
      )}
    </DataItem>
    <DataItem label="Key Benefits">
      {data.messaging?.keyBenefits && data.messaging.keyBenefits.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {data.messaging.keyBenefits.map((benefit, idx) => (
            <RemovableBadge key={idx} variant="secondary" size="sm">
              {benefit}
            </RemovableBadge>
          ))}
        </div>
      ) : (
        <span className="text-muted-foreground italic">None</span>
      )}
    </DataItem>
    <DataItem label="Memorability" value={data.expectedOutcomes?.memorability} />
    <DataItem label="Purchase Intent" value={data.expectedOutcomes?.purchaseIntent} />
    <DataItem label="Brand Perception" value={data.expectedOutcomes?.brandPerception} />
  </div>
);

const Step3Review: React.FC<{ data: CampaignDetails }> = ({ data }) => {
  const ageValues = AGE_BRACKETS.map(
    bracket => data.demographics?.[bracket.key as keyof typeof data.demographics] ?? 0
  );
  const maxAgeValue = Math.max(...ageValues.map(v => Number(v))); // Ensure values are numbers
  const hasAgeData = ageValues.some(v => Number(v) > 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
      <DataItem label="Genders" value={data.demographics?.genders} />
      <DataItem label="Languages">
        {data.demographics?.languages && data.demographics.languages.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {data.demographics.languages.map((langCode, idx) => (
              <RemovableBadge key={idx} variant="secondary" size="sm">
                {getLanguageName(langCode)}
              </RemovableBadge>
            ))}
          </div>
        ) : (
          <span className="text-muted-foreground italic">None</span>
        )}
      </DataItem>
      <div className="md:col-span-2 pt-2">
        <p className="text-sm font-medium text-muted-foreground mb-2">Age Ranges</p>
        {hasAgeData ? (
          <div className="flex flex-wrap gap-3">
            {AGE_BRACKETS.map(bracket => {
              const value = data.demographics?.[bracket.key as keyof typeof data.demographics];
              if (value === undefined || value === null || Number(value) === 0) return null;
              const isMax = Number(value) === maxAgeValue;
              const borderColorClass = isMax ? 'border-accent' : 'border-gray-300';

              return (
                <div
                  key={bracket.key}
                  className={cn(
                    'flex flex-col items-center justify-center p-3 rounded-lg border min-w-[70px] text-center',
                    borderColorClass,
                    isMax ? 'bg-accent/10' : 'bg-gray-50'
                  )}
                >
                  <span
                    className={cn(
                      'text-lg font-semibold block mb-0.5',
                      isMax ? 'text-accent' : 'text-foreground'
                    )}
                  >
                    {value}%
                  </span>
                  <span className="text-xs text-muted-foreground">{bracket.label}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">Not specified</p>
        )}
      </div>
      <DataItem label="Interests" value={data.targeting?.interests} />
      <DataItem label="Keywords" value={data.targeting?.keywords} />
      <DataItem label="Locations" className="md:col-span-2">
        {data.locations && data.locations.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {data.locations.map((loc, idx) => (
              <RemovableBadge key={idx} variant="secondary" size="sm">
                {[loc.city, loc.region, loc.country].filter(Boolean).join(', ') ||
                  'Invalid Location'}
              </RemovableBadge>
            ))}
          </div>
        ) : (
          <span className="text-muted-foreground italic">None specified</span>
        )}
      </DataItem>
      <DataItem label="Competitors" value={data.competitors} />
    </div>
  );
};

const Step4Review: React.FC<{ data: CampaignDetails }> = ({ data }) => (
  <div className="space-y-4">
    <div>
      <p className="text-sm font-medium text-muted-foreground mb-1">Uploaded Assets</p>
      {data.assets && data.assets.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-2">
          {data.assets.map((asset, idx) => {
            // Try to get influencer information from the campaign's influencer list
            // For now, we'll associate the first influencer if available
            // TODO: Implement proper asset-to-influencer mapping when the API provides it
            const primaryInfluencer =
              data.Influencer && data.Influencer.length > 0 ? data.Influencer[0] : null;

            const assetCardData = {
              id: asset.id || `asset-${idx}`,
              name: asset.name ?? asset.fileName ?? undefined,
              url: asset.url ?? undefined,
              type: asset.type ?? undefined,
              description: asset.rationale ?? undefined,
              budget: asset.budget ?? undefined,
              muxPlaybackId: asset.muxPlaybackId ?? undefined,
              muxProcessingStatus: asset.muxProcessingStatus ?? undefined,
              muxAssetId: asset.muxAssetId ?? undefined,
              // Include influencer information for consistency across all AssetCard usages
              influencerHandle: primaryInfluencer?.handle ?? undefined,
              platform: primaryInfluencer?.platform ?? undefined,
            };
            return (
              <AssetCard
                key={assetCardData.id}
                asset={assetCardData}
                currency={(data.budget?.currency as string) ?? 'USD'}
                cardClassName="h-full"
                className="p-0"
              />
            );
          })}
        </div>
      ) : (
        <span className="text-sm text-muted-foreground italic">None uploaded</span>
      )}
    </div>
  </div>
);

// --- END: Step-Specific Review Components ---

// --- Main CampaignReviewStudySetup Component Definition (follows) ---
const CampaignReviewStudySetup: React.FC<CampaignReviewStudySetupProps> = ({ campaignId }) => {
  const router = useRouter();
  const { orgId: activeOrgId, isLoaded: isAuthLoaded, isSignedIn } = useAuth();
  const [campaignData, setCampaignData] = useState<CampaignDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { register, handleSubmit, setValue, formState } = useForm<StudySetupFormValues>({
    resolver: zodResolver(studySetupSchema),
    defaultValues: {
      studyName: '',
    },
  });

  const { errors } = formState;

  useEffect(() => {
    const fetchCampaignDetails = async () => {
      setIsLoading(true);
      setFetchError(null);
      try {
        const response = await fetch(`/api/campaign-data-for-brand-lift/${campaignId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || `Failed to fetch campaign details: ${response.statusText}`
          );
        }
        const data: CampaignDetails = await response.json();
        setCampaignData(data);
        setValue('studyName', `${data.name ?? 'Campaign'} - Brand Lift Study`);
      } catch (error: unknown) {
        logger.error('Error fetching campaign details:', {
          campaignId,
          error: (error as Error).message,
        });
        setFetchError((error as Error).message || 'An unexpected error occurred.');
      }
      setIsLoading(false);
    };
    fetchCampaignDetails();
  }, [campaignId, setValue]);

  const onSubmit: SubmitHandler<StudySetupFormValues> = async data => {
    if (!isAuthLoaded || !isSignedIn || !activeOrgId) {
      logger.error('Brand Lift Study creation attempt without active user or organization.', {
        isAuthLoaded,
        isSignedIn,
        activeOrgId,
      });
      setSubmitError(
        'An active user session and organization are required to create a study. Please check your login and organization settings.'
      );
      setIsSubmitting(false);
      return;
    }

    if (!campaignData) {
      logger.error('Campaign data is not loaded, cannot submit study.');
      setSubmitError('Campaign data is missing. Please refresh and try again.');
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const derivedFunnelStage = getFunnelStageFromKpi(campaignData.primaryKPI);
    if (derivedFunnelStage === 'Unknown' && campaignData.primaryKPI) {
      logger.warn(
        `Could not derive funnel stage for KPI: ${campaignData.primaryKPI}. Defaulting to 'Unknown'. Review KpiFunnelStageMap.`
      );
      // Optionally, you could prevent submission or ask user to clarify if funnel stage is critical and unknown.
    }

    try {
      const payload = {
        name: data.studyName,
        campaignId: campaignId,
        primaryKpi: campaignData.primaryKPI || undefined,
        secondaryKpis: campaignData.secondaryKPIs || [],
        funnelStage: derivedFunnelStage,
      };
      logger.info('Submitting new Brand Lift study', { payload });
      const response = await fetch('/api/brand-lift/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to create study: ${response.statusText}`);
      }
      const newStudy = await response.json();
      logger.info('Brand Lift study created successfully', { newStudyId: newStudy.id });
      router.push(`/brand-lift/survey-design/${newStudy.id}`);
    } catch (error: unknown) {
      logger.error('Error creating Brand Lift study:', { error: (error as Error).message });
      setSubmitError((error as Error).message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSection = useCallback(
    (step: number) => {
      if (campaignData?.id) {
        router.push(`/campaigns/wizard/step-${step}?id=${campaignData.id}`);
      } else {
        logger.warn('Attempted to edit section but campaignData.id is not available.');
        // Optionally show a toast error
      }
    },
    [router, campaignData?.id]
  );

  if (isLoading) {
    return (
      <div className="space-y-8">
        {/* Skeleton for the "Study Name" Card */}
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-3/5 mb-1" /> {/* Title: New Brand Lift Study Setup */}
            <Skeleton className="h-4 w-4/5" /> {/* Description */}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/4 mb-1" /> {/* Label: Study Name */}
              <Skeleton className="h-10 w-full" /> {/* Input */}
            </div>
          </CardContent>
        </Card>

        {/* Skeleton for the "Review Campaign Details" Accordion */}
        <div className="space-y-6 mt-8">
          <Skeleton className="h-8 w-2/5 mb-4" /> {/* Title: Review Campaign Details */}
          <div className="space-y-2">
            {[1, 2, 3, 4].map(item => (
              <Card key={item} className="border rounded-lg">
                <CardHeader className="p-4">
                  <Skeleton className="h-6 w-1/2" /> {/* Accordion Item Header Title */}
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* Skeleton for Footer/Button */}
        <CardFooter className="flex justify-end mt-6 pt-6 border-t">
          <Skeleton className="h-10 w-48" /> {/* Button: Continue to Survey Design */}
        </CardFooter>
      </div>
    );
  }

  if (fetchError) {
    return (
      <Alert variant="destructive">
        <Icon iconId="faTriangleExclamationLight" className="h-4 w-4" />
        <AlertTitle>Error Loading Campaign Data</AlertTitle>
        <AlertDescription>{fetchError}</AlertDescription>
      </Alert>
    );
  }

  if (isAuthLoaded && !activeOrgId) {
    return (
      <Alert variant="default">
        <Icon iconId="faTriangleExclamationLight" className="h-4 w-4 text-yellow-500" />
        <AlertTitle>Organization Required</AlertTitle>
        <AlertDescription>
          You need to have an active organization selected to set up a Brand Lift study. Please
          select or create an organization in your settings.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>New Brand Lift Study Setup</CardTitle>
          <CardDescription>Define the name for your new study.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="studyName">Study Name</Label>
            <Input
              id="studyName"
              {...register('studyName')}
              placeholder="e.g., Q3 Product Launch Lift Study"
            />
            {errors.studyName && (
              <p className="text-xs text-destructive">{errors.studyName.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {campaignData && (
        <div className="space-y-6 mt-8">
          <h1 className="text-2xl font-semibold">Review Campaign Details</h1>
          <Accordion
            type="multiple"
            defaultValue={['step-1', 'step-2', 'step-3', 'step-4']} // Keep all open by default
            className="w-full space-y-2"
          >
            <SummarySection
              title="Basic Information & Contacts"
              stepNumber={1}
              onEdit={handleEditSection}
              isComplete={true}
            >
              <Step1Review data={campaignData} />
            </SummarySection>
            <SummarySection
              title="Objectives & Messaging"
              stepNumber={2}
              onEdit={handleEditSection}
              isComplete={true}
            >
              <Step2Review data={campaignData} />
            </SummarySection>
            <SummarySection
              title="Audience Targeting"
              stepNumber={3}
              onEdit={handleEditSection}
              isComplete={true}
            >
              <Step3Review data={campaignData} />
            </SummarySection>
            <SummarySection
              title="Assets & Guidelines"
              stepNumber={4}
              onEdit={handleEditSection}
              isComplete={true}
            >
              <Step4Review data={campaignData} />
            </SummarySection>
          </Accordion>
        </div>
      )}

      <CardFooter className="flex justify-end mt-6 pt-6 border-t">
        {submitError && (
          <Alert variant="destructive" className="mr-auto max-w-md">
            <Icon iconId="faTriangleExclamationLight" className="h-4 w-4" />
            <AlertTitle>Error Creating Study</AlertTitle>
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}
        <Button
          type="submit"
          disabled={
            isSubmitting || !isAuthLoaded || !activeOrgId || !campaignData || !formState.isValid
          }
          title={!activeOrgId ? 'Select an organization to proceed' : 'Continue to survey design'}
        >
          {isSubmitting ? (
            <Icon iconId="faSpinnerLight" className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Continue to Survey Design
        </Button>
      </CardFooter>
    </form>
  );
};

export default CampaignReviewStudySetup;
