'use client';

import { Component, ReactNode } from 'react';
import { toast } from 'react-hot-toast';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error) {
    console.error('Form Error:', error);
    toast.error('An unexpected error occurred. Our team has been notified.');
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <h3 className="text-red-800 font-semibold">Something went wrong</h3>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-4 btn btn-secondary"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
} 