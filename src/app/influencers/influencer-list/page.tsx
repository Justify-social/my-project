'use client';

import React from 'react';

export default function InfluencerListPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Influencer List</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          This feature is currently being rebuilt. Please check back soon for our improved influencer management experience.
        </p>
      </div>
      
      <div className="bg-white shadow overflow-hidden rounded-lg p-8 text-center">
        <svg 
          className="w-24 h-24 mx-auto text-gray-400 mb-4" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" 
          />
        </svg>
        <h2 className="text-xl font-medium text-gray-900 mb-2">Influencer Management Coming Soon</h2>
        <p className="text-gray-600">
          We're working on a new system to help you better manage your influencer relationships and campaigns.
        </p>
      </div>
    </div>
  );
} 