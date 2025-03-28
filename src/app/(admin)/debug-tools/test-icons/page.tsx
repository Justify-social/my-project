'use client';

import React from 'react';
import { Icon } from '@/components/ui/icons';

export default function IconTestPage() {
  // List of common icons to test
  const iconNames = [
    'faHouse',
    'faUser',
    'faEnvelope',
    'faCircleCheck',
    'faTriangleExclamation',
    'faUpload',
    'faDownload',
    'faChevronDown',
    'faChevronRight',
    'faArrowRight',
    'faTrash',
    'faSave',
    'faSearch'
  ];

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Icon System Test</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {iconNames.map(name => (
          <div key={name} className="flex flex-col items-center p-4 border rounded-lg">
            <div className="flex items-center mb-4">
              <Icon name={name} size="lg" className="text-blue-500 mr-4" />
              <Icon name={name} solid={true} size="lg" className="text-blue-700" />
            </div>
            <span className="text-sm text-gray-700">{name}</span>
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-bold mt-12 mb-6">Hover Effects</h2>
      <div className="flex flex-wrap gap-6">
        <button className="p-3 border rounded flex items-center hover:bg-gray-50">
          <Icon name="faEdit" className="mr-2" iconType="button" />
          Button Icon (hover me)
        </button>
        
        <button className="p-3 border rounded flex items-center hover:bg-gray-50">
          <Icon name="faTrash" className="mr-2" iconType="button" action="delete" />
          Delete Action
        </button>
        
        <button className="p-3 border rounded flex items-center hover:bg-gray-50">
          <Icon name="faCircleExclamation" className="mr-2" iconType="button" action="warning" />
          Warning Action
        </button>
        
        <button className="p-3 border rounded flex items-center hover:bg-gray-50">
          <Icon name="faCircleCheck" className="mr-2" iconType="button" action="success" />
          Success Action
        </button>
      </div>
    </div>
  );
} 