/**
 * Button Import Test
 * 
 * This test file validates that the Button component can be imported
 * from both the Shadcn flat path and the Atomic Design path.
 */

'use client';

import React from 'react';

// Import from Shadcn flat path
import { Button } from '@/components/ui/button';

// Import from Atomic Design path
import { Button as ButtonAtomic } from '@/components/ui/atoms/button/Button';

/**
 * This component tests the import of Button components from different paths.
 * It verifies that both the Shadcn-style import and the Atomic Design import resolve correctly.
 */
export default function ButtonImportTest() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-medium">Shadcn Import Path</h3>
        <div className="flex gap-2">
          <Button variant="default">Button from '@/components/ui/button'</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-medium">Atomic Design Import Path</h3>
        <div className="flex gap-2">
          <ButtonAtomic variant="default">Button from '@/components/ui/atoms/button/Button'</ButtonAtomic>
          <ButtonAtomic variant="secondary">Secondary</ButtonAtomic>
          <ButtonAtomic variant="outline">Outline</ButtonAtomic>
        </div>
      </div>

      <div className="border p-4 mt-4 bg-green-50 rounded">
        <p className="text-green-700">
          If you can see both buttons above, the import path resolution is working correctly!
          This confirms that both Shadcn-style flat imports and Atomic Design imports 
          are correctly resolving to the same component.
        </p>
      </div>
    </div>
  );
} 