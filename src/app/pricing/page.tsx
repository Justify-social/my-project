'use client';

import { useEffect, useState } from "react";
import PricingContent from "./PricingContent";
import { ErrorBoundary } from "@/components/ErrorBoundary/ErrorBoundary";

export default function Page() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    console.log('PricingPage mounted');
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[var(--background-color)] flex items-center justify-center font-work-sans">
        <div className="text-center font-work-sans">
          <p className="text-lg text-[var(--secondary-color)] font-work-sans">Loading pricing page...</p>
        </div>
      </div>);

  }

  return (
    <ErrorBoundary>
      <PricingContent />
    </ErrorBoundary>);

}