'use client';

import React, { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'; // For error display

// Simple Error Boundary specifically for the preview
class PreviewErrorBoundary extends React.Component<
    { children: React.ReactNode; componentName: string },
    { hasError: boolean; error: Error | null }
> {
    constructor(props: { children: React.ReactNode; componentName: string }) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // You can also log the error to an error reporting service
        console.error(`Error rendering component preview for ${this.props.componentName}:`, error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            // Render fallback UI
            return (
                <Alert variant="destructive">
                    <AlertTitle>Preview Render Error ({this.props.componentName})</AlertTitle>
                    <AlertDescription>
                        <p>Could not render a live preview of this component.</p>
                        {this.state.error && (
                            <pre className="mt-2 text-xs bg-red-100 p-2 rounded">
                                {this.state.error.message}
                            </pre>
                        )}
                        <p className="mt-2 text-xs">Check the browser console for more details. The component might require specific props or context.</p>
                    </AlertDescription>
                </Alert>
            );
        }

        return this.props.children;
    }
}

interface ComponentPreviewRendererProps {
    filePath: string;
    componentName: string;
}

/**
 * Client component that dynamically loads and renders a UI component for preview.
 */
export default function ComponentPreviewRenderer({ filePath, componentName }: ComponentPreviewRendererProps) {
    const [Component, setComponent] = useState<React.ComponentType | null>(null);
    const [errorLoading, setErrorLoading] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        setErrorLoading(null); // Reset error on path change
        setComponent(null); // Reset component on path change

        const loadComponent = async () => {
            try {
                // Construct the import path using the alias (@ is typically src/)
                const dynamicImportPath = `@${filePath.startsWith('/') ? filePath : '/' + filePath}`;
                console.log(`Attempting to dynamically import: ${dynamicImportPath}`);

                // Use next/dynamic for loading
                const DynamicComponent = dynamic(() =>
                    import(/* webpackInclude: /\.tsx$/ */ `${dynamicImportPath}`)
                        .then(mod => {
                            // Attempt to get the component (default export or named export)
                            const comp = mod.default || mod[componentName];
                            if (!comp) {
                                throw new Error(`Component export '${componentName}' or default not found in ${dynamicImportPath}`);
                            }
                            return comp;
                        })
                        .catch(err => {
                            console.error("Dynamic import error:", err);
                            // Throw a custom component to render the error message inside Suspense boundary
                            // This ensures the error is caught by the outer error boundary if Suspense fallback fails
                            return () => <p className="text-red-500">Failed to load component: {err.message}</p>;
                        }),
                    {
                        // ssr: false, // Ensure it only runs client-side if needed (often default for dynamic)
                        loading: () => <LoadingSpinner />
                    }
                );

                if (isMounted) {
                    // Assign the dynamic component itself to state
                    setComponent(() => DynamicComponent);
                }
            } catch (err) {
                console.error("Error setting up dynamic import:", err);
                if (isMounted) {
                    setErrorLoading(err instanceof Error ? err.message : 'Failed to load component module.');
                    setComponent(null); // Ensure component is null on error
                }
            }
        };

        loadComponent();

        return () => {
            isMounted = false;
        };
        // Reload when filePath or componentName changes
    }, [filePath, componentName]);

    if (errorLoading) {
        return <p className="text-red-500">Error: {errorLoading}</p>;
    }

    // Render the dynamically loaded component within the Error Boundary
    return (
        <PreviewErrorBoundary componentName={componentName}>
            {/* Suspense handles the loading state defined in next/dynamic */}
            <Suspense fallback={<LoadingSpinner />}>
                {Component ? <Component /> : <LoadingSpinner />}
            </Suspense>
        </PreviewErrorBoundary>
    );
} 