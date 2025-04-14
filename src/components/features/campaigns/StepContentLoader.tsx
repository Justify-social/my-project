'use client';

import React, { Suspense, lazy } from 'react';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton'; // Assuming a generic loading skeleton
import { StepContentProps } from './types'; // Import shared props type

// Define a mapping from step number to the component path
// Adjust paths if necessary
const stepComponentMap: Record<number, React.LazyExoticComponent<React.ComponentType<any>>> = {
    1: lazy(() => import('./Step1Content')),
    2: lazy(() => import('./Step2Content')),
    3: lazy(() => import('./Step3Content')),
    4: lazy(() => import('./Step4Content')),
    5: lazy(() => import('./Step5Content')),
};

/**
 * Dynamically loads the content component for the specified wizard step.
 */
export const StepContentLoader: React.FC<StepContentProps> = ({ step, ...restProps }) => {
    const StepComponent = stepComponentMap[step];

    if (!StepComponent) {
        // Handle invalid step number
        return <div className="text-center py-10 text-destructive">Error: Invalid step number ({step}).</div>;
    }

    return (
        <Suspense fallback={<LoadingSkeleton />}>
            <StepComponent step={step} {...restProps} />
        </Suspense>
    );
};

export default StepContentLoader; 