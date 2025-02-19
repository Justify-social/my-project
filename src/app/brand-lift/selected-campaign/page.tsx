"use client";

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';

const SelectedCampaignContent = dynamic(
  () => import('@/components/Brand-Lift/SelectedCampaignContent'),
  {
    ssr: false,
    loading: () => <div>Loading...</div>
  }
);

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SelectedCampaignContent />
    </Suspense>
  );
}
