'use client'; // Carousel needs client components
import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'; // Import Carousel components
import { Card, CardContent } from '@/components/ui/card'; // For item content

const statusStyles: Record<string, string> = {
  stable: 'bg-green-100 text-green-800 border-green-200',
  beta: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  deprecated: 'bg-red-100 text-red-800 border-red-200',
  development: 'bg-blue-100 text-blue-800 border-blue-200',
};

export default function CarouselPreviewPage() {
  const componentMeta = {
    name: 'Carousel',
    description:
      'Displays items in a scrollable container with previous/next controls. Based on embla-carousel-react.', // Updated description
    category: 'organism',
    subcategory: 'navigation',
    renderType: 'client',
    status: 'stable', // Added status
    author: 'Shadcn UI', // Added author
    since: '2023-11-01', // Added since date (example)
  };
  // const examples: string[] = []; // Removed examples array

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

          {/* Example 1: Basic Carousel */}
          <div className="border border-divider rounded-lg p-6">
            <h3 className="text-lg font-medium mb-3">Basic Carousel</h3>
            <div className="flex justify-center px-10">
              {' '}
              {/* Add padding for controls */}
              <Carousel className="w-full max-w-xs">
                <CarouselContent>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <CarouselItem key={index}>
                      <div className="p-1">
                        <Card>
                          <CardContent className="flex aspect-square items-center justify-center p-6 bg-muted">
                            <span className="text-4xl font-semibold">{index + 1}</span>
                          </CardContent>
                        </Card>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </div>
          </div>

          {/* Example 2: Sizing (Basis) */}
          <div className="border border-divider rounded-lg p-6">
            <h3 className="text-lg font-medium mb-3">Sizing (1/3 Basis)</h3>
            <div className="flex justify-center px-10">
              <Carousel className="w-full max-w-sm">
                <CarouselContent className="-ml-1">
                  {Array.from({ length: 9 }).map((_, index) => (
                    <CarouselItem key={index} className="pl-1 md:basis-1/2 lg:basis-1/3">
                      <div className="p-1">
                        <Card>
                          <CardContent className="flex aspect-square items-center justify-center p-6 bg-secondary text-secondary-foreground">
                            <span className="text-2xl font-semibold">{index + 1}</span>
                          </CardContent>
                        </Card>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </div>
          </div>

          {/* Example 3: Vertical Orientation */}
          <div className="border border-divider rounded-lg p-6">
            <h3 className="text-lg font-medium mb-3">Vertical Orientation</h3>
            <div className="flex justify-center py-10">
              <Carousel
                opts={{
                  align: 'start',
                }}
                orientation="vertical"
                className="w-full max-w-xs"
              >
                <CarouselContent className="-mt-1 h-[200px]">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <CarouselItem key={index} className="pt-1 md:basis-1/2">
                      <div className="p-1">
                        <Card>
                          <CardContent className="flex items-center justify-center p-6 bg-accent text-accent-foreground">
                            <span className="text-3xl font-semibold">{index + 1}</span>
                          </CardContent>
                        </Card>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </div>
          </div>

          {/* ---- END MANUAL EXAMPLES ---- */}
        </div>
      </div>

      {/* Code Snippets Section - Removed */}
      {/* {examples && examples.length > 0 && ( ... )} */}
    </div>
  );
}
