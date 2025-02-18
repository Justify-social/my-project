"use client";

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';

const SelectedCampaignContent = dynamic(
  () => import('@/components/brand-lift/SelectedCampaignContent'),
  {
    ssr: false,
    loading: () => <div>Loading...</div>
  }
);

export default function SelectedCampaignPage() {
  return <SelectedCampaignContent />;
}
