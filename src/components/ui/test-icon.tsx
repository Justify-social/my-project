/**
 * Test file for debugging icon rendering
 */
'use client';

import React from 'react';
import { Icon } from '@/components/ui/atoms/icons';

export function TestIcons() {
  // A simple wrapper to test each icon with label for clarity
  const IconTest = ({ name, label }: { name: string; label: string }) => (
    <div className="flex items-center mb-4 border p-2 rounded">
      <Icon name={name} size="lg" className="mr-2" />
      <span>{label}</span>
    </div>
  );

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Icon Rendering Test</h1>
      
      <h2 className="text-xl font-semibold mb-4">App Icons</h2>
      <IconTest name="appHome" label="appHome" />
      <IconTest name="appSettings" label="appSettings" />
      <IconTest name="appBilling" label="appBilling" />
      <IconTest name="appHelp" label="appHelp" />
      <IconTest name="appReports" label="appReports" />
      <IconTest name="appMMM" label="appMMM" />
      <IconTest name="appCampaigns" label="appCampaigns" />
      <IconTest name="appBrand_Health" label="appBrand_Health" />
      <IconTest name="appBrand_Lift" label="appBrand_Lift" />
      <IconTest name="appCreative_Asset_testing" label="appCreative_Asset_testing" />
      <IconTest name="appInfluencers" label="appInfluencers" />

      <h2 className="text-xl font-semibold mb-4 mt-8">Standard Icons (for comparison)</h2>
      <IconTest name="faHome" label="faHome" />
      <IconTest name="faGear" label="faGear (Settings)" />
      <IconTest name="faCreditCard" label="faCreditCard (Billing)" />
      <IconTest name="faQuestion" label="faQuestion (Help)" />
    </div>
  );
}

export default TestIcons; 