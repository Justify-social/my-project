// Updated import paths via tree-shake script - 2025-04-01T17:13:32.202Z
'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/atoms/alert';
import { LoadingSpinner as Spinner } from '@/components/ui/atoms/loading-spinner';
import { Icon } from '@/components/ui/atoms/icon';
import { ComponentMetadata } from '../types';

/**
 * Props for the ComponentResolver
 */
interface ComponentResolverProps {
  /**
   * Path to the component to render
   */
  componentPath: string;
  /**
   * Props to pass to the rendered component
   */
  componentProps?: Record<string, any>;
  /**
   * Whether to show a card wrapper around the component
   */
  showCard?: boolean;
  /**
   * Whether to show a label with the component name
   */
  showLabel?: boolean;
  /**
   * Additional className for the wrapper
   */
  className?: string;
}

/**
 * ComponentResolver dynamically loads and renders a component by its path
 */
export default function ComponentResolver({
  componentPath,
  componentProps = {},
  showCard = true,
  showLabel = true,
  className = '',
}: ComponentResolverProps) {
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [componentName, setComponentName] = useState('');

  // Extract component name from path
  useEffect(() => {
    const pathParts = componentPath.split('/');
    const fileName = pathParts[pathParts.length - 1].replace(/\.[jt]sx?$/, '');
    setComponentName(fileName);
  }, [componentPath]);

  // Dynamic import of the component
  useEffect(() => {
    setLoading(true);
    setError(null);
    
    // Reset component when path changes
    setComponent(null);
    
    // In development, we're using mock components to demonstrate the resolver
    // In production, this would use dynamic imports to load actual components
    setTimeout(() => {
      try {
        // Mock component resolution
        const mockComponent = generateMockComponent(componentPath);
        
        if (mockComponent) {
          setComponent(() => mockComponent);
          setLoading(false);
        } else {
          throw new Error('Component not found');
        }
      } catch (err) {
        setError(`Failed to load component: ${err instanceof Error ? err.message : String(err)}`);
        setLoading(false);
      }
    }, 500); // Simulated loading delay
    
    // In production, we'd use dynamic imports instead of the mock:
    // import(`${componentPath}`)
    //   .then((module) => {
    //     const Component = module.default || Object.values(module)[0];
    //     setComponent(() => Component);
    //     setLoading(false);
    //   })
    //   .catch((err) => {
    //     setError(`Failed to load component: ${err.message}`);
    //     setLoading(false);
    //   });
  }, [componentPath]);

  // Render component or loading/error state
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-8">
          <Spinner className="mr-2" />
          <span>Loading component...</span>
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive">
          <Icon iconId="faCircleExclamationLight"  className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    if (!Component) {
      return (
        <Alert variant="default">
          <Icon iconId="faCircleExclamationLight"  className="h-4 w-4" />
          <AlertTitle>Component Not Found</AlertTitle>
          <AlertDescription>
            No component found at path: {componentPath}
          </AlertDescription>
        </Alert>
      );
    }

    try {
      return (
        <>
          {showLabel && (
            <div className="text-sm font-medium text-muted-foreground mb-2">
              {componentName}
            </div>
          )}
          <ErrorBoundary>
            <Component {...componentProps} />
          </ErrorBoundary>
        </>
      );
    } catch (renderError) {
      return (
        <Alert variant="destructive">
          <Icon iconId="faCircleExclamationLight"  className="h-4 w-4" />
          <AlertTitle>Render Error</AlertTitle>
          <AlertDescription>
            {renderError instanceof Error ? renderError.message : String(renderError)}
          </AlertDescription>
        </Alert>
      );
    }
  };

  return showCard ? (
    <Card className={className}>
      <CardContent className="p-4">
        {renderContent()}
      </CardContent>
    </Card>
  ) : (
    <div className={className}>
      {renderContent()}
    </div>
  );
}

/**
 * ErrorBoundary component to catch errors during component rendering
 */
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

  render() {
    if (this.state.hasError) {
      return (
        <Alert variant="destructive">
          <Icon iconId="faCircleExclamationLight"  className="h-4 w-4" />
          <AlertTitle>Render Error</AlertTitle>
          <AlertDescription>
            {this.state.error?.message || 'An error occurred while rendering this component'}
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}

/**
 * Generate a mock component for the given path
 * This is only for demo purposes and would be replaced with actual imports in production
 */
function generateMockComponent(path: string): React.ComponentType<any> | null {
  // Extract component name from path
  const pathParts = path.split('/');
  const fileName = pathParts[pathParts.length - 1].replace(/\.[jt]sx?$/, '');
  
  // Determine category from path
  let category = 'atom';
  if (path.includes('/molecules/') || path.includes('/molecule/')) {
    category = 'molecule';
  } else if (path.includes('/organisms/') || path.includes('/organism/')) {
    category = 'organism';
  }
  
  // Generate mock components based on component name
  if (fileName.toLowerCase().includes('button')) {
    return (props: any) => (
      <button 
        className={`px-4 py-2 rounded ${
          props.variant === 'outline' 
            ? 'border border-gray-300 text-gray-700' 
            : 'bg-blue-500 text-white'
        } ${props.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={props.disabled}
      >
        {props.children || 'Button'}
      </button>
    );
  }
  
  if (fileName.toLowerCase().includes('heading')) {
    return (props: any) => {
      const level = props.level || 1;
      const Tag = `h${level}` as keyof JSX.IntrinsicElements;
      return (
        <Tag className={`${props.className || ''} ${
          level === 1 ? 'text-2xl font-bold' :
          level === 2 ? 'text-xl font-bold' :
          level === 3 ? 'text-lg font-semibold' :
          'text-base font-medium'
        }`}>
          {props.children || 'Heading'}
        </Tag>
      );
    };
  }
  
  if (fileName.toLowerCase().includes('formfield')) {
    return (props: any) => (
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          {props.label || 'Label'}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {props.children || (
          <input type="text" className="block w-full px-3 py-2 border border-gray-300 rounded-md" />
        )}
        {props.error && (
          <p className="text-sm text-red-500">{props.error}</p>
        )}
      </div>
    );
  }
  
  if (fileName.toLowerCase().includes('sidebar')) {
    return (props: any) => (
      <div className="w-64 bg-gray-100 p-4 rounded-md min-h-[200px]">
        {props.header && (
          <div className="mb-4 font-bold">{props.header}</div>
        )}
        <ul className="space-y-2">
          {(props.items || [
            { id: '1', label: 'Dashboard', icon: '📊' },
            { id: '2', label: 'Settings', icon: '⚙️' },
            { id: '3', label: 'Profile', icon: '👤' }
          ]).map((item: any) => (
            <li key={item.id} className="flex items-center space-x-2 p-2 hover:bg-gray-200 rounded cursor-pointer">
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
        {props.footer && (
          <div className="mt-4 border-t pt-4">{props.footer}</div>
        )}
      </div>
    );
  }
  
  // Generic component for anything else
  return () => (
    <div className="p-4 border border-gray-300 rounded-md">
      <div className="font-medium mb-2">{fileName}</div>
      <div className="text-sm text-gray-500">
        Demo component from {category} category
      </div>
    </div>
  );
} 