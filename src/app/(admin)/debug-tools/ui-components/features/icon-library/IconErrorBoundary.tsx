// Updated import paths via tree-shake script - 2025-04-01T17:13:32.201Z
'use client';

import React, { Component, ReactNode, ErrorInfo } from 'react';
import { Card, CardContent } from '@/components/ui/organisms/card/Card'
import { Alert } from '@/components/ui/atoms/alert/Alert'
import { Icon } from '@/components/ui/atoms/icon';
import { Button } from '@/components/ui/atoms/button/Button'

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error boundary component for the icon library
 * Catches and displays errors in a user-friendly way
 */
export class IconErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Icon library error:', error, errorInfo);
    this.setState({
      errorInfo
    });
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <Card>
          <CardContent className="p-6">
            <Alert 
              variant="destructive"
              title="Something went wrong in the icon library"
              showIcon
            >
              <div className="text-sm mb-4">
                {this.state.error?.message || 'An unknown error occurred'}
              </div>
              {this.state.errorInfo && (
                <details className="mt-2">
                  <summary className="text-sm cursor-pointer">Technical details</summary>
                  <pre className="mt-2 bg-slate-100 p-2 rounded-md text-xs overflow-auto whitespace-pre-wrap max-h-40">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
              <Button 
                className="mt-4" 
                onClick={this.resetError}
                variant="outline"
              >
                <Icon iconId="faRotateLight"  className="mr-2 h-4 w-4" />
                Try again
              </Button>
            </Alert>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
} 