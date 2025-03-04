"use client";

import React from "react";

interface HeaderProps {
  currentStep: number;
  totalSteps: number;
}

export default function Header({ currentStep, totalSteps }: HeaderProps) {
  return (
    <header className="flex justify-between items-center mb-6 border-b border-divider-color pb-4">
      <div>
        <h2 className="text-2xl font-bold font-sora text-primary-color">Campaign Wizard</h2>
        <p className="text-sm text-secondary-color mt-1">Create and configure your marketing campaign</p>
      </div>
      <div className="bg-white rounded-lg border border-divider-color px-4 py-2 shadow-sm">
        <span className="font-medium">
          Step <span className="text-accent-color">{currentStep}</span> of <span>{totalSteps}</span>
        </span>
      </div>
    </header>
  );
}
