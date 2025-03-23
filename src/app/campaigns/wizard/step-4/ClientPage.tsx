"use client";

import { Suspense } from "react";
import Step4Content from "./Step4Content";
import { WizardSkeleton } from "@/components/ui/loading-skeleton";

export default function ClientPage() {
  return (
    <div className="min-h-screen bg-white">
      <Suspense fallback={<WizardSkeleton step={4} />}>
        <Step4Content />
      </Suspense>
    </div>
  );
} 