// src/app/campaigns/wizard/layout.tsx

import { WizardProvider } from '@/components/features/campaigns/WizardContext';

export default function WizardLayout({ children }: { children: React.ReactNode }) {
  return <WizardProvider>{children}</WizardProvider>;
}
