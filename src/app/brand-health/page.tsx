import { ComingSoon } from '@/components/ui/coming-soon';

export default function BrandHealthPage() {
  return (
    <ComingSoon
      title="Brand Health"
      description="Comprehensive brand health monitoring and sentiment analysis tools are in development. Track brand perception, monitor social sentiment, analyse competitor positioning, and measure brand equity over time. Justify will be in touch soon with updates on this strategic feature."
      iconId="appBrandHealth"
      primaryAction={{
        label: 'Get Notified',
        href: '/settings/profile?notify=brand-health',
      }}
      secondaryActions={[
        {
          label: 'Brand Lift Studies',
          href: '/brand-lift/campaign-selection',
          iconId: 'faChartLineLight',
        },
        { label: 'View Campaigns', href: '/campaigns', iconId: 'faClipboardLight' },
        { label: 'Dashboard', href: '/dashboard', iconId: 'faHouseLight' },
      ]}
    />
  );
}
