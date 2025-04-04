/**
 * Component Preview - UI Component Library
 * 
 * Renders UI components with proper context and error boundaries.
 * Supports both direct component rendering and wrapper-based rendering
 * for Shadcn components that require context.
 */

import React, { ErrorInfo, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { 
  Card 
} from '@/components/ui';
import { 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/organisms/card/Card';
import { Alert, AlertDescription } from '@/components/ui/atoms/alert/Alert';
import { ShadcnWrappers } from './utils/shadcn-wrappers';
import { safeDynamicImport, createErrorComponent } from './utils/component-registry-utils';

interface ComponentPreviewProps {
  componentName: string;
  category?: string;
  importPath: string;
  shadcnComponent?: boolean;
  errorCallback?: (error: Error, errorInfo: ErrorInfo) => void;
}

// Error boundary to catch rendering errors
class ComponentErrorBoundary extends React.Component<
  { children: React.ReactNode; onError: (error: Error, errorInfo: ErrorInfo) => void },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; onError: (error: Error, errorInfo: ErrorInfo) => void }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Component error:", error, errorInfo);
    this.props.onError(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert variant="destructive">
          <AlertDescription>
            <div className="font-medium">Component Error</div>
            <div className="text-sm mt-1">{this.state.error?.message || 'An unknown error occurred'}</div>
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}

export const ComponentPreview: React.FC<ComponentPreviewProps> = ({
  componentName,
  category,
  importPath,
  shadcnComponent = false,
  errorCallback = () => {}
}) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [componentEl, setComponentEl] = useState<React.ReactNode | null>(null);

  const handleError = (error: Error) => {
    setError(error.message);
    errorCallback(error, {} as ErrorInfo);
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    // Check if this is a Shadcn component that has a wrapper implementation
    const wrapperKey = componentName.replace(/^Shadcn/, '');
    const hasWrapper = shadcnComponent && Object.keys(ShadcnWrappers).includes(wrapperKey);

    if (hasWrapper) {
      // For Shadcn components with wrappers, use the pre-made wrapper component
      // @ts-expect-error - Dynamic access to component wrappers
      const Wrapper = ShadcnWrappers[wrapperKey];
      setComponentEl(<Wrapper />);
      setLoading(false);
    } else {
      // For other components, dynamically load them
      try {
        const DynamicComponent = dynamic(
          () => safeDynamicImport(
            Promise.resolve(import(importPath)),
            componentName,
            createErrorComponent(componentName)
          ),
          {
            loading: () => <div className="animate-pulse bg-muted rounded h-24 w-full"></div>,
            ssr: false
          }
        );
        
        // Render the dynamic component with sample props
        setComponentEl(<DynamicComponent />);
        setLoading(false);
      } catch (err: any) {
        handleError(err);
        setLoading(false);
      }
    }
  }, [componentName, importPath, shadcnComponent]);

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="bg-muted/50 pb-2">
        <CardTitle className="text-sm font-medium">
          {componentName}
          {category && <span className="text-xs ml-2 text-muted-foreground">({category})</span>}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 flex items-center justify-center min-h-[200px]">
        {loading ? (
          <div className="animate-pulse bg-muted rounded h-24 w-full"></div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertDescription>
              <div className="font-medium">Failed to render component</div>
              <div className="text-sm mt-1">{error}</div>
            </AlertDescription>
          </Alert>
        ) : (
          <ComponentErrorBoundary onError={handleError}>
            <div className="w-full flex items-center justify-center">
              {componentEl}
            </div>
          </ComponentErrorBoundary>
        )}
      </CardContent>
    </Card>
  );
};

export default ComponentPreview; 