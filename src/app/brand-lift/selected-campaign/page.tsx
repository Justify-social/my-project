"use client";

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';

const SelectedCampaignContent = dynamic(
  () => import('../../../components/brand-lift/SelectedCampaignContent'),
  {
    ssr: false,
  }
);

export default function Page() {
  return <SelectedCampaignContent />;
}
