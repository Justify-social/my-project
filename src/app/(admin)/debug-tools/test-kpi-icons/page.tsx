'use client';

import React from 'react';
import Image from 'next/image';

export default function KpiIconTestPage() {
  // List of KPI icons
  const kpiIcons = [
    'Action_Intent',
    'Ad_Recall',
    'Advocacy',
    'Brand_Awareness',
    'Brand_Preference',
    'Consideration',
    'Message_Association',
    'Purchase_Intent'
  ];

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">KPI Icons Test</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {kpiIcons.map(name => (
          <div key={name} className="flex flex-col items-center p-4 border rounded-lg">
            <div className="flex items-center justify-center w-24 h-24 mb-4">
              <img 
                src={`/KPIs/${name}.svg`} 
                alt={name} 
                className="w-16 h-16"
              />
            </div>
            <span className="text-sm text-gray-700">{name.replace('_', ' ')}</span>
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-bold mt-12 mb-6">Usage in Components</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-6 border rounded-lg bg-white shadow">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <img src="/KPIs/Brand_Awareness.svg" alt="Brand Awareness" className="w-6 h-6 mr-2" />
            Brand Awareness
          </h3>
          <p className="text-gray-600">
            Shows how familiar your target audience is with your brand.
          </p>
        </div>
        
        <div className="p-6 border rounded-lg bg-white shadow">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <img src="/KPIs/Purchase_Intent.svg" alt="Purchase Intent" className="w-6 h-6 mr-2" />
            Purchase Intent
          </h3>
          <p className="text-gray-600">
            Measures the likelihood that a consumer will buy your product or service.
          </p>
        </div>
      </div>
    </div>
  );
} 