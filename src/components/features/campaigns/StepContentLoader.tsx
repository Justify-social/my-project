"use client";

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { WizardSkeleton } from '@/components/ui/skeleton';
import Step1Content from './Step1Content';
import Step2Content from './Step2Content';
import Step3Content from './Step3Content';
import Step4Content from './Step4Content';
import Step5Content from './Step5Content';

// Define a simple ErrorBoundary component
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("Error in campaign wizard:", error);
  }

  render() {
    if (this.state.hasError) {
      return <div className="p-4 text-red-600">Something went wrong. Please try again.</div>;
    }
    return this.props.children;
  }
}

// Define StepLoaderProps interface
interface StepLoaderProps {
  step: number;
}

export function StepLoader({ step }: StepLoaderProps) {
  const renderContent = () => {
    switch (step) {
      case 1:
        return <Step1Content />;
      case 2:
        return <Step2Content />;
      case 3:
        return <Step3Content />;
      case 4:
        return <Step4Content />;
      case 5:
        return <Step5Content />;
      default:
        throw new Error(`Step ${step} not implemented`);
    }
  };

  return (
    <ErrorBoundary>
      <Suspense fallback={<WizardSkeleton step={step} />}>
        {renderContent()}
      </Suspense>
    </ErrorBoundary>
  );
} 