'use client';

import React, { useState, useEffect } from 'react';
import { redirect } from 'next/navigation';
import SettingsPageSkeleton from '@/components/settings/shared/SettingsPageSkeleton';

/**
 * Default Settings Page
 * This page serves as a redirect to the Profile Settings
 */
export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This effect simulates checking auth and permissions before redirecting
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Once loading is complete, redirect to profile settings
  if (!isLoading) {
    redirect('/settings/profile-settings');
  }

  return <SettingsPageSkeleton />;
} 