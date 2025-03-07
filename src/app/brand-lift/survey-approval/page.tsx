"use client";

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';

const SurveyApprovalContent = dynamic(
  () => import('@/components/Brand-Lift/SurveyApprovalContent'),
  {
    ssr: false,
    loading: () => <div>Loading...</div>
  }
);

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SurveyApprovalContent />
    </Suspense>
  );
}
