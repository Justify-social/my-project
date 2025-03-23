"use client";

import dynamic from 'next/dynamic';
import React from 'react';

const ErrorBoundary = dynamic(() => import('@/components/ErrorBoundary'), { ssr: false });

interface ErrorBoundaryWrapperProps {
  children: React.ReactNode;
}

export default function ErrorBoundaryWrapper({ children }: ErrorBoundaryWrapperProps) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
} 