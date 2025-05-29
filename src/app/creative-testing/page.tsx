import { ComingSoon } from '@/components/ui/coming-soon';

export default function CreativeTestingPage() {
  return (
    <ComingSoon
      title="Creative Testing"
      description="Advanced A/B testing and creative performance analytics are coming soon. Test multiple creative variations, analyse performance metrics, and optimise your campaigns with data-driven insights. Justify will be in touch soon with updates on this powerful feature."
      iconId="appCreativeAssetTesting"
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
