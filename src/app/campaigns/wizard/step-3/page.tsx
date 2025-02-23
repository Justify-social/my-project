'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import ClientPage from "./ClientPage";

function Step3Content() {
  const searchParams = useSearchParams();
  
  return <ClientPage />;
}

export default function Step3Page() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Step3Content />
    </Suspense>
  );
}

export const dynamic = "force-dynamic";
