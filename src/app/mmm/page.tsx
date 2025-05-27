import { ComingSoon } from '@/components/ui/coming-soon';

export default function MMMPage() {
  return (
    <ComingSoon
      title="Marketing Mix Modeling"
      description="Advanced Marketing Mix Modeling (MMM) and attribution analysis is currently in development. Understand the true impact of your marketing channels, optimise budget allocation, and measure incrementality across all touchpoints. Justify will be in touch soon with updates on this sophisticated analytics feature."
      iconId="appMmm"
      primaryAction={{
        label: 'Get Notified',
        href: '/settings/profile?notify=mmm',
      }}
      secondaryActions={[
        { label: 'View Campaigns', href: '/campaigns', iconId: 'faClipboardLight' },
        {
          label: 'Brand Lift Studies',
          href: '/brand-lift/campaign-selection',
          iconId: 'faChartLineLight',
        },
        { label: 'Dashboard', href: '/dashboard', iconId: 'faHouseLight' },
      ]}
    />
  );
}
