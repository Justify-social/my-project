'use client'; // Table interactions might need client
import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { UpcomingCampaignsTable, CampaignData } from '@/components/ui/card-upcoming-campaign'; // Import component and type

// Sample Data
const sampleCampaigns: CampaignData[] = [
  {
    id: 'CMP001',
    title: 'Summer Sale Kickoff',
    platform: 'Facebook',
    startDate: new Date('2024-07-01'),
    endDate: new Date('2024-07-15'),
    status: 'Scheduled',
    budget: 5000,
  },
  {
    id: 'CMP002',
    title: 'Influencer Collab - @styleguru',
    platform: 'Instagram',
    startDate: new Date('2024-07-05'),
    endDate: new Date('2024-07-12'),
    status: 'Scheduled',
    budget: 2500,
    influencer: {
      name: 'Rachel Green',
      image: '/images/influencers/rachel.jpg',
    },
  },
  {
    id: 'CMP003',
    title: 'TikTok Challenge: #JustDance',
    platform: 'TikTok',
    startDate: new Date('2024-07-10'),
    endDate: new Date('2024-07-24'),
    status: 'Planning',
    budget: 3000,
  },
  {
    id: 'CMP004',
    title: 'YouTube Brand Awareness',
    platform: 'YouTube',
    startDate: new Date('2024-07-15'),
    endDate: new Date('2024-08-15'),
    status: 'Draft',
    budget: 10000,
    influencer: {
      name: 'Olivia Parker',
      image: '/images/influencers/olivia.jpg',
    },
  },
];

const statusStyles: Record<string, string> = {
  stable: 'bg-green-100 text-green-800 border-green-200',
  beta: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  deprecated: 'bg-red-100 text-red-800 border-red-200',
  development: 'bg-blue-100 text-blue-800 border-blue-200',
};

export default function UpcomingCampaignsTablePreviewPage() {
  const componentMeta = {
    name: 'UpcomingCampaignsTable',
    description: 'Displays a table of upcoming campaigns within a card.',
    category: 'organism',
    subcategory: 'data-display',
    renderType: 'client',
    status: 'stable',
    author: 'Your Name/Team',
    since: '2024-02-15',
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-secondary">
        <ol className="list-none p-0 inline-flex space-x-2">
          <li className="flex items-center">
            <Link href="/debug-tools/ui-components" className="hover:text-Interactive">
              UI Components
            </Link>
          </li>
          <li className="flex items-center">
            <span className="mx-2">/</span>
            <span className="capitalize">{componentMeta.category}</span>
          </li>
          {componentMeta.subcategory && (
            <li className="flex items-center">
              <span className="mx-2">/</span>
              <span className="capitalize">{componentMeta.subcategory}</span>
            </li>
          )}
          <li className="flex items-center">
            <span className="mx-2">/</span>
            <span className="font-medium text-primary">{componentMeta.name}</span>
          </li>
        </ol>
      </nav>

      {/* Header Section */}
      <div className="mb-8 border-b border-divider pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold text-primary mb-2 sm:mb-0">{componentMeta.name}</h1>
          <div className="flex items-center space-x-3 text-sm">
            {componentMeta.status && (
              <Badge
                variant="outline"
                className={cn(
                  'font-medium',
                  statusStyles[componentMeta.status] || statusStyles.development
                )}
              >
                {componentMeta.status}
              </Badge>
            )}
            <span className="text-secondary capitalize">({componentMeta.renderType || 'N/A'})</span>
          </div>
        </div>
        {componentMeta.description && (
          <p className="mt-2 text-secondary max-w-3xl">{componentMeta.description}</p>
        )}
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
          {componentMeta.author && <span>Author: {componentMeta.author}</span>}
          {componentMeta.since && <span>Since: {componentMeta.since}</span>}
        </div>
      </div>

      {/* Examples Section (Rendering the actual component) */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-primary">Examples / Usage</h2>
        <div className="space-y-6">
          {/* ---- ADD YOUR RENDERING EXAMPLES MANUALLY BELOW ---- */}

          {/* Example 1: Basic Usage */}
          <div className="border border-divider rounded-lg p-0">
            {' '}
            {/* No padding needed, card has its own */}
            <UpcomingCampaignsTable
              campaigns={sampleCampaigns}
              // Add other props like onRowClick if available/needed
            />
          </div>

          {/* Example 2: Empty State - REMOVE THIS BLOCK */}
          {/* 
          <div className="border border-divider rounded-lg p-0">
            <UpcomingCampaignsTable
              campaigns={[]}
              title="Upcoming Campaigns (Empty)"
            />
          </div> 
          */}

          {/* ---- END MANUAL EXAMPLES ---- */}
        </div>
      </div>
    </div>
  );
}
