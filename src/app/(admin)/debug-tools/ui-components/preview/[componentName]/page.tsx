import React, { Suspense } from 'react';
import Link from 'next/link';
// Import discovery utility DIRECTLY - It's a Server Component!
import { getComponentRegistry } from '@/app/(admin)/debug-tools/ui-components/utils/discovery';
import { type ExtendedComponentMetadata } from '../../types';
import ComponentPreviewRenderer from '../ComponentPreviewRenderer';
import { notFound } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"; // Import Alert components

interface ComponentPreviewPageProps {
    params: Promise<{
        componentName: string;
    }>;
}

// Status badge styling (keep as is)
const statusStyles: Record<string, string> = {
    stable: 'bg-green-100 text-green-800 border-green-200',
    beta: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    deprecated: 'bg-red-100 text-red-800 border-red-200',
    development: 'bg-blue-100 text-blue-800 border-blue-200',
};

/**
 * Server page to display details and preview for a specific UI component.
 * Uses discovery utility directly.
 */
export default async function ComponentPreviewPage({ params }: ComponentPreviewPageProps) {
    // Await the params promise FIRST
    const resolvedParams = await params;
    const componentNameParam = resolvedParams.componentName;
    const decodedName = decodeURIComponent(componentNameParam);

    // Get registry DIRECTLY
    const registry = await getComponentRegistry(); // Assuming this doesn't use params

    // Find the component metadata from the registry
    const componentMeta = registry.byName[decodedName.toLowerCase()];

    // Handle component not found
    if (!componentMeta) {
        console.warn(`Component metadata not found in registry for: ${decodedName}`);
        notFound();
    }

    // Destructure metadata - guaranteed non-null here
    const {
        name, // Use name from metadata
        description,
        category,
        subcategory,
        status,
        author,
        since,
        examples,
        filePath,
        renderType
    } = componentMeta;

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
                        {/* Use category from fetched meta */}
                        <span className="capitalize">{category || 'Unknown'}</span>
                    </li>
                    {subcategory && (
                        <li className="flex items-center">
                            <span className="mx-2">/</span>
                            <span className="capitalize">{subcategory}</span>
                        </li>
                    )}
                    <li className="flex items-center">
                        <span className="mx-2">/</span>
                        {/* Use name from fetched meta OR fallback to decoded name if fetch failed but we aren't 404ing */}
                        <span className="font-medium text-primary">{name}</span>
                    </li>
                </ol>
            </nav>

            {/* Header Section - Use name from meta OR fallback */}
            <div className="mb-8 border-b border-divider pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-3xl font-bold text-primary mb-2 sm:mb-0">{name}</h1>
                    <div className="flex items-center space-x-3 text-sm">
                        {status && (
                            <Badge
                                variant="outline"
                                className={cn('font-medium', statusStyles[status] || statusStyles.development)}
                            >
                                {status}
                            </Badge>
                        )}
                        <span className="text-secondary capitalize">({renderType || 'N/A'})</span>
                    </div>
                </div>
                {description && (
                    <p className="mt-2 text-secondary max-w-3xl">{description}</p>
                )}
                <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
                    {author && <span>Author: {author}</span>}
                    {since && <span>Since: {since}</span>}
                </div>
            </div>

            {/* Live Preview Section - Pass name from meta */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-primary">Live Preview</h2>
                <div className="border border-divider rounded-lg p-6 min-h-[200px] flex items-center justify-center bg-background">
                    <Suspense fallback={<LoadingSpinner />}>
                        {/* {filePath ? ( */}
                        {/* Pass name from metadata to renderer */}
                        {/*  <ComponentPreviewRenderer filePath={filePath} componentName={name} /> */}
                        {/* ) : ( */}
                        <Alert variant="destructive">
                            <AlertTitle>Preview Unavailable</AlertTitle>
                            {/* Check filePath existence based on potentially null componentMeta */}
                            <AlertDescription>{componentMeta?.filePath ? 'Renderer commented out.' : 'Component file path not found in metadata.'}</AlertDescription>
                        </Alert>
                        {/* )} */}
                    </Suspense>
                </div>
            </div>

            {/* Examples Section */}
            {examples && examples.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4 text-primary">Examples</h2>
                    <div className="space-y-4">
                        {examples.map((exampleCode: string, index: number) => (
                            <div key={index} className="border border-divider rounded-lg overflow-hidden">
                                <pre className="text-sm p-4 bg-gray-50 text-gray-800 overflow-x-auto">
                                    <code>{exampleCode}</code>
                                </pre>
                            </div>
                        ))}
                    </div>
                </div>
            )}

        </div>
    );
}

// Optional: Generate static paths if needed for faster builds
// export async function generateStaticParams() {
//   const registry = await getComponentRegistry();
//   return registry.components.map(comp => ({
//     componentName: encodeURIComponent(comp.name),
//   }));
// } 