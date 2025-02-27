"use client";

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';

const SurveyPreviewContent = dynamic(
  () => import('@/components/Brand-Lift/SurveyPreviewContent'),
  {
    ssr: false,
    loading: () => <div>Loading...</div>
  }
);

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SurveyPreviewContent />
    </Suspense>
  );
}
