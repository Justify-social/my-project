"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';

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
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback ||
      <div className="text-center p-8 font-work-sans" role="alert">
          <h2 className="text-xl font-bold text-red-600 font-sora">Something went wrong</h2>
          <p className="mt-2 text-gray-600 font-work-sans">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
          onClick={() => this.setState({ hasError: false })}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-work-sans">

            Try Again
          </button>
        </div>;

    }

    return this.props.children;
  }
}