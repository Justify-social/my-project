"use client";

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';

const SurveyPreviewContent = dynamic(
  () => import('../../../components/brand-lift/SurveyPreviewContent'),
  {
    ssr: false,
  }
);

export default function Page() {
  return <SurveyPreviewContent />;
}
