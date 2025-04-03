'use client';

import React from 'react';
import VerificationTest from '../verification-test';

/**
 * UI Component Verification Page
 * 
 * This page hosts the component verification test for comprehensive validation
 * of all UI components in the library.
 */
export default function ComponentVerificationPage() {
  return (
    <div className="container mx-auto">
      <div className="my-6 max-w-full">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
          <h1 className="text-2xl font-bold text-blue-800">UI Component Verification</h1>
          <p className="text-blue-600 mt-2">
            This page tests the rendering of all UI components discovered in the codebase.
            It verifies that the component discovery system is working correctly and that
            all components can be properly rendered in the preview system.
          </p>
        </div>
        
        <VerificationTest />
      </div>
    </div>
  );
} 