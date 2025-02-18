"use client";

import React from "react";

interface HeaderProps {
  currentStep: number;
  totalSteps: number;
}

export default function Header({ currentStep, totalSteps }: HeaderProps) {
  return (
    <header className="flex justify-between items-center mb-4 border-b pb-2">
      <div>
        <h2 className="text-xl font-bold">Campaign Wizard</h2>
      </div>
      <div>
        <span>
          Step {currentStep} of {totalSteps}
        </span>
      </div>
    </header>
  );
}
