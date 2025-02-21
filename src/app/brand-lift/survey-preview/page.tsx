"use client";

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';

const SurveyPreviewContent = dynamic(
  () => import('@/components/brand-lift/SurveyPreviewContent').then(mod => mod.default),
  {
    ssr: false,
  }
);

export default function Page() {
  return <SurveyPreviewContent />;
}
