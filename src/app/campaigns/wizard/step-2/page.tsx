'use client';

import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import ClientPage from "./ClientPage";

export default function Page() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ClientPage />
    </Suspense>
  );
}

export const dynamic = "force-dynamic";
