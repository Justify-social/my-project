'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import ClientPage from "./ClientPage";

function Step3Content() {
  return <ClientPage />;
}

export default function Step3Page() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <LoadingSpinner />;
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Step3Content />
    </Suspense>
  );
}

export const dynamic = "force-dynamic";
