'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { toast } from 'react-hot-toast';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    toast.error('An unexpected error occurred. Our team has been notified.');
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback ||
      <div className="p-4 bg-red-50 border border-red-200 rounded-md font-work-sans">
          <h2 className="text-red-800 font-semibold font-sora">Something went wrong</h2>
          <p className="text-red-600 font-work-sans">{this.state.error?.message}</p>
        </div>;

    }

    return this.props.children;
  }
}