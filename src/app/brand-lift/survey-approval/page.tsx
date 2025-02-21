"use client";

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import SurveyApprovalContent from '@/components/brand-lift/SurveyApprovalContent';

const SurveyApprovalContent = dynamic(
  () => import('/src/components/Brand-Lift/SurveyApprovalContent'),
  {
    ssr: false,
    loading: () => <div>Loading...</div>
  }
);

export default function Page() {
  return <SurveyApprovalContent />;
}
