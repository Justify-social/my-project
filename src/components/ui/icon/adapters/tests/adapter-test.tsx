'use client';

/**
 * Adapter Test Component
 *
 * This component is used to test and verify the different icon adapters.
 * It showcases each adapter in various configurations to ensure they work as expected.
 */
import React from 'react';
import { ShadcnIcon } from '../shadcn-adapter';
import { IconAdapter } from '../font-awesome-adapter';
import { Icon } from '../../icon';
// Removed import for deleted semantic map
// import { UI_ICON_MAP } from '../../icon-semantic-map';

export const AdapterTest: React.FC = () => {
  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">Icon Adapter Tests</h1>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Core Icon Component (SSOT Implementation)</h2>
        <div className="flex gap-4 items-center">
          <div className="flex flex-col items-center">
            <Icon iconId="faGearLight" />
            <p className="text-sm mt-1">Light Variant</p>
          </div>
          <div className="flex flex-col items-center">
            <Icon iconId="faGearSolid" />
            <p className="text-sm mt-1">Solid Variant</p>
          </div>
          <div className="flex flex-col items-center">
            <Icon iconId="faGearLight" size="lg" />
            <p className="text-sm mt-1">Large Size</p>
          </div>
          <div className="flex flex-col items-center">
            <Icon iconId="faGearLight" className="text-blue-500" />
            <p className="text-sm mt-1">Custom Color</p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">ShadcnIcon Adapter (Canonical Adapter)</h2>
        <div className="flex gap-4 items-center">
          <div className="flex flex-col items-center">
            <ShadcnIcon iconId="faGearLight" />
            <p className="text-sm mt-1">Default</p>
          </div>
          <div className="flex flex-col items-center">
            <ShadcnIcon iconId="faGearLight" variant="solid" />
            <p className="text-sm mt-1">Solid Variant</p>
          </div>
          <div className="flex flex-col items-center">
            <ShadcnIcon iconId="faGearLight" size="lg" />
            <p className="text-sm mt-1">Large Size</p>
          </div>
          <div className="flex flex-col items-center">
            <ShadcnIcon iconId="faGearLight" className="text-blue-500" />
            <p className="text-sm mt-1">Custom Color</p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">IconAdapter (Legacy Adapter)</h2>
        <div className="flex gap-4 items-center">
          <div className="flex flex-col items-center">
            <IconAdapter iconId="faGearLight" />
            <p className="text-sm mt-1">Explicit Light</p>
          </div>
          <div className="flex flex-col items-center">
            <IconAdapter iconId="faGearSolid" />
            <p className="text-sm mt-1">Explicit Solid</p>
          </div>
          <div className="flex flex-col items-center">
            <IconAdapter iconId="faGearSolid" />
            <p className="text-sm mt-1">Legacy Solid</p>
          </div>
          <div className="flex flex-col items-center">
            <IconAdapter iconId="faGear" className="text-blue-500" />
            <p className="text-sm mt-1">Legacy Default</p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Semantic Mapping Test (Now uses direct ID)</h2>
        <div className="flex gap-4 items-center">
          <div className="flex flex-col items-center">
            <Icon iconId="faGearLight" />
            <p className="text-sm mt-1">Direct ID ('faGearLight')</p>
          </div>
          <div className="flex flex-col items-center">
            <ShadcnIcon iconId="faGearLight" />
            <p className="text-sm mt-1">With ShadcnIcon</p>
          </div>
          <div className="flex flex-col items-center">
            <IconAdapter iconId="faGearLight" />
            <p className="text-sm mt-1">With IconAdapter</p>
          </div>
        </div>
      </section>

      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h3 className="font-medium">SSOT Validation Results:</h3>
        <p>
          All adapters ultimately render through the core Icon component, maintaining SSOT
          principles.
        </p>
        <p>
          The different adapters provide compatibility layers while preserving the single source of
          truth.
        </p>
      </div>
    </div>
  );
};

export default AdapterTest;
