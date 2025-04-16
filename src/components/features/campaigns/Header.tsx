'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

export default function Header({ currentStep, totalSteps, className }: HeaderProps) {
  return (
    <header
      className={cn(
        'flex justify-between items-center mb-6 border-b border-divider pb-4',
        className
      )}
    >
      <div>
        <h2 className="text-2xl font-bold text-primary">Campaign Wizard</h2>
        <p className="text-sm text-secondary mt-1">Create and configure your marketing campaign</p>
      </div>
      <div className="bg-background rounded-lg border border-divider px-3 py-1.5 shadow-sm">
        <span className="text-sm font-medium text-secondary">
          Step <span className="font-semibold text-accent">{currentStep}</span> of {totalSteps}
        </span>
      </div>
    </header>
  );
}
