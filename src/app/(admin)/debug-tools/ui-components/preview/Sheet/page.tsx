'use client';
import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const SHEET_SIDES = ['top', 'right', 'bottom', 'left'] as const;

// type SheetSide = (typeof SHEET_SIDES)[number]; // Unused type alias

const statusStyles: Record<string, string> = {
  stable: 'bg-green-100 text-green-800 border-green-200',
  beta: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  deprecated: 'bg-red-100 text-red-800 border-red-200',
  development: 'bg-blue-100 text-blue-800 border-blue-200',
};

export default function SheetPreviewPage() {
  const componentMeta = {
    name: 'Sheet',
    description:
      'Displays content that complements the main content, appearing from the side of the screen.',
    category: 'organism',
    subcategory: 'overlay',
    renderType: 'client',
    status: 'stable',
    author: 'Shadcn UI',
    since: '2023-06-01',
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

          {/* Example 1: Sheet from different sides */}
          <div className="border border-divider rounded-lg p-6">
            <h3 className="text-lg font-medium mb-3">Sheet Sides</h3>
            <div className="grid grid-cols-2 gap-2">
              {SHEET_SIDES.map(side => (
                <Sheet key={side}>
                  <SheetTrigger asChild>
                    <Button variant="outline">Open ({side})</Button>
                  </SheetTrigger>
                  <SheetContent side={side}>
                    <SheetHeader>
                      <SheetTitle>Edit profile ({side})</SheetTitle>
                      <SheetDescription>
                        Make changes to your profile here. Click save when you're done.
                      </SheetDescription>
                    </SheetHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor={`name-${side}`} className="text-right">
                          Name
                        </Label>
                        <Input
                          id={`name-${side}`}
                          defaultValue="Pedro Duarte"
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor={`username-${side}`} className="text-right">
                          Username
                        </Label>
                        <Input
                          id={`username-${side}`}
                          defaultValue="@peduarte"
                          className="col-span-3"
                        />
                      </div>
                    </div>
                    <SheetFooter>
                      <SheetClose asChild>
                        <Button type="submit">Save changes</Button>
                      </SheetClose>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
              ))}
            </div>
          </div>

          {/* ---- END MANUAL EXAMPLES ---- */}
        </div>
      </div>
    </div>
  );
}
