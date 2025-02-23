"use client";

import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import Step3Content from "./Step3Content";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Step3Content />
    </Suspense>
  );
}
