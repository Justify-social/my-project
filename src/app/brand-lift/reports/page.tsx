import { ComingSoon } from '@/components/ui/coming-soon';

export default function BrandLiftReportsPage() {
  return (
    <ComingSoon
      title="Brand Lift Reports"
      description="Comprehensive brand lift reporting and analytics are currently in development. Access detailed study results, compare pre and post-campaign metrics, analyse audience insights, and generate executive summaries. Justify will be in touch soon with updates on this powerful reporting feature."
      iconId="faChartLineLight"
      primaryAction={{
        label: 'Get Notified',
        href: '/settings/profile?notify=brand-lift-reports',
      }}
      secondaryActions={[
        {
          label: 'Create Study',
          href: '/brand-lift/campaign-selection',
          iconId: 'appBrandLift',
        },
        { label: 'View Campaigns', href: '/campaigns', iconId: 'faClipboardLight' },
        { label: 'Dashboard', href: '/dashboard', iconId: 'faHouseLight' },
      ]}
    />
  );
}
