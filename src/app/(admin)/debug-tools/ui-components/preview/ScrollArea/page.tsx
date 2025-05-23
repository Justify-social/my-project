import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

const statusStyles: Record<string, string> = {
  stable: 'bg-green-100 text-green-800 border-green-200',
  beta: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  deprecated: 'bg-red-100 text-red-800 border-red-200',
  development: 'bg-blue-100 text-blue-800 border-blue-200',
};

export default function ScrollAreaPreviewPage() {
  const componentMeta = {
    name: 'ScrollArea',
    description:
      'Augments native scroll functionality for customizing the appearance of scrollbars.',
    category: 'molecule',
    subcategory: 'layout',
    renderType: 'client', // ScrollArea likely requires client interaction
    status: 'stable',
    author: 'Shadcn UI',
    since: '2023-01-01', // Example date
  };

  const tags = Array.from({ length: 50 }).map((_, i, a) => `v1.2.0-beta.${a.length - i}`);

  // Example data for horizontal scroll
  interface Artwork {
    artist: string;
    art: string;
  }
  const works: Artwork[] = Array.from({ length: 10 }).map((_, i) => ({
    artist: `Artist ${i + 1}`,
    art: `ArtworkItem ${i + 1}`,
  }));

  return (
    // Wrap the entire page content in Suspense
    <React.Suspense fallback={<div>Loading component preview...</div>}>
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
              <span className="text-secondary capitalize">
                ({componentMeta.renderType || 'N/A'})
              </span>
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
          <div className="space-y-8">
            {' '}
            {/* Increased spacing for clarity */}
            {/* Example 1: Basic Vertical Scroll */}
            <div className="border border-divider rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">Vertical Scrolling</h3>
              <ScrollArea className="h-72 w-60 rounded-md border border-divider">
                {' '}
                {/* Adjusted width */}
                <div className="p-4">
                  <h4 className="mb-4 text-sm font-medium leading-none">Tags</h4>
                  {tags.map(tag => (
                    <React.Fragment key={tag}>
                      <div className="text-sm py-1">{tag}</div> {/* Added padding */}
                      <Separator className="my-1" /> {/* Adjusted margin */}
                    </React.Fragment>
                  ))}
                </div>
              </ScrollArea>
            </div>
            {/* Example 2: Horizontal Scroll */}
            <div className="border border-divider rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">Horizontal Scrolling</h3>
              <ScrollArea className="w-full whitespace-nowrap rounded-md border border-divider">
                {' '}
                {/* Use full width */}
                <div className="flex w-max space-x-4 p-4">
                  {works.map(artwork => (
                    <figure key={artwork.artist} className="shrink-0">
                      <div className="overflow-hidden rounded-md">
                        <div className="h-40 w-40 bg-secondary flex items-center justify-center text-center p-2 text-secondary-foreground">
                          {artwork.art}
                        </div>
                      </div>
                      <figcaption className="pt-2 text-xs text-muted-foreground">
                        Photo by{' '}
                        <span className="font-semibold text-foreground">{artwork.artist}</span>
                      </figcaption>
                    </figure>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>
            {/* ---- END MANUAL EXAMPLES ---- */}
          </div>
        </div>

        {/* Code Snippets Section - Removed as per original structure */}
      </div>
    </React.Suspense>
  );
}
