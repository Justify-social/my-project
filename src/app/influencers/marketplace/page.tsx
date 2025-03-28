'use client';

import React from 'react';

export default function InfluencerMarketplacePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Influencer Marketplace</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          This feature is currently being rebuilt. Please check back soon for our enhanced influencer discovery platform.
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
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" 
          />
        </svg>
        <h2 className="text-xl font-medium text-gray-900 mb-2">Our New Influencer Platform is Coming Soon</h2>
        <p className="text-gray-600">
          We're working on bringing you a completely redesigned experience for finding and collaborating with influencers.
        </p>
      </div>
    </div>
  );
} 