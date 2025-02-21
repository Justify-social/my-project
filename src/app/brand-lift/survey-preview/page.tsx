"use client";

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import SurveyPreviewContent from '@/components/brand-lift/SurveyPreviewContent';

const SurveyPreviewContent = dynamic(
  () => import('@/components/Brand-Lift/SurveyPreviewContent'),
  {
    ssr: false,
    loading: () => <div>Loading...</div>
  }
);

export default function Page() {
  return <SurveyPreviewContent />;
}
