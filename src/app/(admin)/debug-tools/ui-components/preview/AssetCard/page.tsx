import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { AssetCard } from '@/components/ui/card-asset';

// Sample Data - Updated with real paths and more examples
const sampleAssets = [
  {
    id: 'vid1',
    name: 'YouTube Creative Example',
    url: '/videos/youtube-creative.mp4', // Path from /public
    type: 'video',
    platform: 'Youtube',
    budget: 1200,
    currency: 'USD',
    description: 'Short video ad optimized for YouTube pre-roll and in-stream placements.',
  },
  {
    id: 'vid2',
    name: 'TikTok Trend Ad',
    url: '/videos/tiktok-creative.mp4',
    type: 'video',
    platform: 'TikTok',
    budget: 850,
    currency: 'USD',
  },
  {
    id: 'vid3',
    name: 'Instagram Story Asset',
    url: '/videos/instagram-creative.mp4',
    type: 'video',
    platform: 'Instagram',
    budget: 1500,
    currency: 'USD',
    description: 'Vertical video designed for Instagram Stories and Reels engagement.',
  },
  {
    id: 'img1',
    name: 'Rachel Green - Influencer Post',
    url: '/images/influencers/rachel.jpg', // Path from /public
    type: 'image',
    platform: 'Instagram',
    influencerHandle: '@rachel_style',
    budget: 2500,
    currency: 'USD',
    description: 'Lifestyle image featuring product placement for summer campaign.',
  },
  {
    id: 'img2',
    name: 'Olivia Parker - Product Showcase',
    url: '/images/influencers/olivia.jpg',
    type: 'image',
    platform: 'Facebook',
    influencerHandle: '@olivia_beauty',
    budget: 1800,
    currency: 'USD',
  },
];

const statusStyles: Record<string, string> = {
  stable: 'bg-green-100 text-green-800 border-green-200',
  beta: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  deprecated: 'bg-red-100 text-red-800 border-red-200',
  development: 'bg-blue-100 text-blue-800 border-blue-200',
};

export default function AssetCardPreviewPage() {
  const componentMeta = {
    name: 'AssetCard',
    description:
      'Card component displaying asset information with preview, title, platform, and budget.',
    category: 'organism',
    subcategory: 'card',
    renderType: 'client',
    status: 'stable',
    author: 'Your Name/Team',
    since: '2024-01-01',
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {' '}
          {/* Use grid for layout */}
          {/* ---- Render cards from sample data ---- */}
          {sampleAssets.map(assetData => (
            <AssetCard
              key={assetData.id}
              asset={assetData} // Pass the whole object
              currency={assetData.currency} // Pass currency separately
            />
          ))}
        </div>
      </div>

      {/* Code Snippets Section - Removed */}
    </div>
  );
}
