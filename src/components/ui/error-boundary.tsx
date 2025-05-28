'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon/icon';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/logger';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  isolateError?: boolean; // Whether to prevent error propagation to parent
}

interface ErrorFallbackProps {
  error?: Error;
  resetError: () => void;
  className?: string;
}

// Default error fallback component with Apple/Shopify design
const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetError, className }) => {
  const getErrorType = () => {
    if (error?.message?.includes('Network')) return 'network';
    if (error?.message?.includes('Permission')) return 'permission';
    if (error?.message?.includes('Not found')) return 'notfound';
    return 'generic';
  };

  const getErrorConfig = () => {
    const errorType = getErrorType();

    switch (errorType) {
      case 'network':
        return {
          icon: 'faWifiLight',
          title: 'Connection Error',
          description: 'Unable to connect to our servers. Please check your internet connection.',
          actionText: 'Retry Connection',
          severity: 'warning' as const,
        };
      case 'permission':
        return {
          icon: 'faLockLight',
          title: 'Access Denied',
          description: "You don't have permission to access this information.",
          actionText: 'Go Back',
          severity: 'destructive' as const,
        };
      case 'notfound':
        return {
          icon: 'faSearchLight',
          title: 'Not Found',
          description: 'The requested information could not be found.',
          actionText: 'Try Again',
          severity: 'secondary' as const,
        };
      default:
        return {
          icon: 'faTriangleExclamationLight',
          title: 'Something went wrong',
          description: 'An unexpected error occurred. Our team has been notified.',
          actionText: 'Try Again',
          severity: 'destructive' as const,
        };
    }
  };

  const config = getErrorConfig();

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'warning':
        return {
          border: 'border-warning/20',
          bg: 'bg-warning/5',
          iconColor: 'text-warning',
          titleColor: 'text-warning',
        };
      case 'destructive':
        return {
          border: 'border-destructive/20',
          bg: 'bg-destructive/5',
          iconColor: 'text-destructive',
          titleColor: 'text-destructive',
        };
      case 'secondary':
        return {
          border: 'border-secondary/20',
          bg: 'bg-secondary/5',
          iconColor: 'text-secondary',
          titleColor: 'text-secondary',
        };
      default:
        return {
          border: 'border-muted/20',
          bg: 'bg-muted/5',
          iconColor: 'text-muted-foreground',
          titleColor: 'text-foreground',
        };
    }
  };

  const styles = getSeverityStyles(config.severity);

  return (
    <Card className={cn('w-full max-w-md mx-auto', styles.border, styles.bg, className)}>
      <CardContent className="p-6 text-center">
        <Icon iconId={config.icon} className={cn('h-12 w-12 mx-auto mb-4', styles.iconColor)} />
        <h3 className={cn('text-lg font-semibold mb-2', styles.titleColor)}>{config.title}</h3>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{config.description}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={resetError}
          className="hover:shadow-sm transition-shadow"
        >
          <Icon iconId="faRotateLight" className="mr-2 h-4 w-4" />
          {config.actionText}
        </Button>

        {/* Development error details */}
        {process.env.NODE_ENV === 'development' && error && (
          <details className="mt-4 text-left">
            <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
              Technical Details (Development Only)
            </summary>
            <pre className="mt-2 text-xs bg-muted/30 p-2 rounded overflow-x-auto">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}
      </CardContent>
    </Card>
  );
};

// Lightweight error fallback for inline components
const InlineErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetError, className }) => (
  <div
    className={cn(
      'flex items-center gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/20 text-sm',
      className
    )}
  >
    <Icon iconId="faTriangleExclamationLight" className="h-4 w-4 text-destructive flex-shrink-0" />
    <span className="flex-1 text-muted-foreground">Failed to load this section</span>
    <Button
      variant="ghost"
      size="sm"
      onClick={resetError}
      className="h-6 px-2 text-xs hover:bg-destructive/10"
    >
      Retry
    </Button>
  </div>
);

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error for monitoring
    logger.error('ErrorBoundary caught an error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;

      return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

// Higher-order component for easy error boundary wrapping
export function withErrorBoundary<P extends Record<string, any>>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

// Hook for manually triggering error boundaries (useful for async errors)
export function useErrorHandler() {
  const [, setError] = React.useState<Error | null>(null);

  return React.useCallback((error: Error) => {
    setError(() => {
      throw error;
    });
  }, []);
}

// Specific error boundaries for different component types
export const InlineErrorBoundary: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <ErrorBoundary
    fallback={props => <InlineErrorFallback {...props} className={className} />}
    isolateError={true}
  >
    {children}
  </ErrorBoundary>
);

export const CardErrorBoundary: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <ErrorBoundary
    fallback={props => <DefaultErrorFallback {...props} className={className} />}
    isolateError={true}
  >
    {children}
  </ErrorBoundary>
);

export { DefaultErrorFallback, InlineErrorFallback };
