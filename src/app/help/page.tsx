import { ComingSoon } from '@/components/ui/coming-soon';

export default function HelpPage() {
  return (
    <ComingSoon
      title="Help & Support Center"
      description="A comprehensive help center with tutorials, documentation, FAQs, and live support is being developed. Get instant answers, watch step-by-step guides, and access expert support for all your marketing intelligence needs. Justify will be in touch soon with updates on this support platform."
      iconId="faCircleQuestionLight"
      secondaryActions={[
        {
          label: 'Contact Support',
          href: 'mailto:support@justify.social',
          iconId: 'faCircleQuestionLight',
        },
        { label: 'View Campaigns', href: '/campaigns', iconId: 'faClipboardLight' },
        { label: 'Dashboard', href: '/dashboard', iconId: 'faHouseLight' },
      ]}
    />
  );
}
