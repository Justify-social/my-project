'use client';

import React from 'react';

interface HeaderProps {
  currentStep: number;
  totalSteps: number;
}

export default function Header({ currentStep, totalSteps }: HeaderProps) {
  return (
    <header className="flex justify-between items-center mb-6 border-b border-divider-color pb-4 font-heading">
      <div className="font-body">
        <h2 className="text-2xl font-bold font-heading text-primary-color">Campaign Wizard</h2>
        <p className="text-sm text-secondary-color mt-1 font-body">
          Create and configure your marketing campaign
        </p>
      </div>
      <div className="bg-white rounded-lg border border-divider-color px-4 py-2 shadow-sm font-body">
        <span className="font-medium font-body">
          Step <span className="text-accent-color font-body">{currentStep}</span> of{' '}
          <span className="font-body">{totalSteps}</span>
        </span>
      </div>
    </header>
  );
}
