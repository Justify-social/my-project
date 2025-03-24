"use client";

import { Suspense } from "react";
import Step5Content from "./Step5Content";
import { WizardSkeleton } from "@/components/ui/loading-skeleton";

export default function ClientPage() {
  return (
    <div className="min-h-screen bg-white">
      <Suspense fallback={<WizardSkeleton step={5} />}>
        <Step5Content />
      </Suspense>
    </div>
  );
} 