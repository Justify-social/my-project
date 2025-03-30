/**
 * UI Component Library Layout
 * 
 * This layout provides the structure for the UI Component Library.
 * It includes a dynamic sidebar component and the main content area.
 */
'use client';

import React, { ErrorInfo } from 'react';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';

// Create an error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error in UI Components layout:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const isChunkLoadError = this.state.error?.message.includes('ChunkLoadError') || 
                              this.state.error?.message.includes('Loading chunk');
      
      return (
        <div className="p-8 bg-red-50 border border-red-200 rounded-md m-4">
          <h2 className="text-xl font-semibold text-red-700 mb-4">
            {isChunkLoadError ? 'Component Loading Error' : 'Something went wrong'}
          </h2>
          <p className="text-red-600 mb-4">
            {isChunkLoadError 
              ? 'Failed to load required component chunks. This may be due to network issues or a problem with the component browser.' 
              : this.state.error?.message}
          </p>
          <div className="mt-6">
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Simple fallback sidebar for when the dynamic import fails
const SidebarFallback = () => (
  <div className="w-64 bg-gray-100 p-4">
    <div className="text-lg font-semibold mb-4">UI Components</div>
    <div className="text-sm text-red-500">
      Failed to load sidebar. Please refresh the page.
    </div>
  </div>
);

// Load the sidebar with improved error handling
const DynamicStyledSidebar = dynamic(
  () => import('./components/DynamicStyledSidebar').then(mod => mod.default).catch(err => {
    console.error('Failed to load sidebar:', err);
    return SidebarFallback;
  }),
  { 
    ssr: false,
    loading: () => (
      <div className="w-64 bg-gray-100 p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    )
  }
);

export default function UIComponentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || '';
  const isUIComponentsPath = pathname === '/debug-tools/ui-components' || pathname.startsWith('/debug-tools/ui-components/');
  
  return (
    <ErrorBoundary>
      <div className="flex min-h-screen bg-background">
        {/* Use our custom sidebar for UI components pages */}
        {isUIComponentsPath && <DynamicStyledSidebar />}
        
        {/* Main content with proper margin for sidebar */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </ErrorBoundary>
  );
} 