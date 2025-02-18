"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SelectedCampaignContent() {
  const router = useRouter();
  const [selectedCampaign, setSelectedCampaign] = useState('');

  const campaigns = [
    { id: '1', name: 'Summer Campaign 2024', status: 'Active', progress: 75 },
    { id: '2', name: 'Product Launch Q1', status: 'Completed', progress: 100 },
    { id: '3', name: 'Brand Awareness Drive', status: 'Active', progress: 45 },
  ];

  const handleCampaignSelect = (campaignId: string) => {
    setSelectedCampaign(campaignId);
    router.push(`/brand-lift/progress?campaign=${campaignId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6">Select Campaign</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {campaigns.map((campaign) => (
          <div
            key={campaign.id}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleCampaignSelect(campaign.id)}
          >
            <h3 className="text-lg font-semibold mb-2">{campaign.name}</h3>
            <div className="flex justify-between items-center mb-4">
              <span className={`px-2 py-1 rounded text-sm ${
                campaign.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {campaign.status}
              </span>
              <span className="text-gray-600">{campaign.progress}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${campaign.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 