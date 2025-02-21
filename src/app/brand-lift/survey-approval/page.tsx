"use client";

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';

const SurveyApprovalContent = dynamic(
  () => import('../../../components/brand-lift/SurveyApprovalContent'),
  {
    ssr: false,
  }
);

export default function Page() {
  return <SurveyApprovalContent />;
}
