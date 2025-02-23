"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorBoundary } from "./ErrorBoundary";

const Step1Content = dynamic(
  () => import("./Step1Content").then(mod => mod.default),
  { 
    ssr: false,
    loading: () => <LoadingSpinner />,
  }
);

export default function Step1ContentLoader() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner />}>
        <Step1Content />
      </Suspense>
    </ErrorBoundary>
  );
} 