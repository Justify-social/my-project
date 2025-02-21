"use client";

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import SelectedCampaignContent from '@/components/brand-lift/SelectedCampaignContent';

const SelectedCampaignContent = dynamic(
  () => import('@/components/Brand-Lift/SelectedCampaignContent'),
  {
    ssr: false,
    loading: () => <div>Loading...</div>
  }
);

export default function Page() {
  return <SelectedCampaignContent />;
}
