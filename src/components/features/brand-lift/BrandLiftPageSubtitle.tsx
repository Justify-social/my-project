'use client';

import React from 'react';
import Link from 'next/link';
import { Icon } from '@/components/ui/icon/icon';
import { Badge } from '@/components/ui/badge';

interface BrandLiftPageSubtitleProps {
  campaignId: string | undefined | null;
  campaignName: string | undefined | null;
  studyName: string | undefined | null;
  funnelStage: string | undefined | null; // e.g., "Top Funnel", "Full Funnel"
  // TODO: Potentially add campaignPathPrefix if it's not always '/campaigns/'
}

const FunnelIconMap: Record<string, string> = {
  'Top Funnel': 'appFunnelTop',
  'Middle Funnel': 'appFunnelMiddle',
  'Bottom Funnel': 'appFunnelBottom',
  'Full Funnel': 'appFunnelMiddle', // Or a specific full funnel icon if available e.g. appFunnelFull
};

const BrandLiftPageSubtitle: React.FC<BrandLiftPageSubtitleProps> = ({
  campaignId,
  campaignName,
  studyName,
  funnelStage,
}) => {
  if (!campaignName && !studyName && !funnelStage) {
    return null;
  }

  const funnelIconId = (funnelStage && FunnelIconMap[funnelStage]) || 'faFilterList'; // Default icon

  // Determine if there's content before the funnel stage that would require a separator
  const hasContentBeforeFunnel = (campaignId && campaignName) || studyName;

  return (
    <div className="flex items-center text-sm text-muted-foreground mb-4 flex-wrap gap-x-2 gap-y-1">
      {campaignId && campaignName && (
        <Badge variant="outline" className="flex items-center text-xs font-normal px-2 py-0.5">
          <Link
            href={`/campaigns/${campaignId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline hover:text-accent transition-colors flex items-center group"
          >
            <Icon
              iconId="faClipboardLight"
              className="mr-1 h-3 w-3 group-hover:hidden flex-shrink-0"
            />
            <Icon
              iconId="faClipboardSolid"
              className="mr-1 h-3 w-3 hidden group-hover:inline-block flex-shrink-0"
            />
            <span>{campaignName}</span>
          </Link>
        </Badge>
      )}

      {studyName && (
        <Badge variant="outline" className="flex items-center text-xs font-normal px-2 py-0.5">
          <Icon iconId="faChartLineLight" className="mr-1 h-3 w-3 flex-shrink-0" />
          <span className="font-medium text-foreground">{studyName}</span>
        </Badge>
      )}

      {/* Separator logic - only show if there is content before AND funnelStage is present */}
      {hasContentBeforeFunnel && funnelStage && (
        <span className="font-medium text-muted-foreground mx-1">-</span>
      )}

      {funnelStage && (
        <Badge variant="outline" className="flex items-center text-xs font-normal px-2 py-0.5">
          <Icon iconId={funnelIconId} className="mr-1 h-3 w-3 flex-shrink-0" />
          <span>{funnelStage.replace(/_/g, ' ')}</span>
        </Badge>
      )}
    </div>
  );
};

export default BrandLiftPageSubtitle;
