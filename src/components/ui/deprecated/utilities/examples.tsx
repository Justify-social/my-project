'use client';

import React, { useState } from 'react';

interface ComponentExample {
  name: string;
  component: React.ReactNode;
  code: string;
  description?: string;
}

interface ComponentExamplesProps {
  examples?: ComponentExample[];
}

const ComponentExamples: React.FC<ComponentExamplesProps> = ({ examples = [] }) => {
  const [activeTab, setActiveTab] = useState(examples.length > 0 ? examples[0].name : '');

  if (examples.length === 0) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500 text-center">No examples available</p>
      </div>
    );
  }

  return (
    <div className="font-work-sans">
      <div className="flex flex-wrap mb-4 border-b border-gray-200">
        {examples.map((example) => (
          <button
            key={example.name}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === example.name
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab(example.name)}
          >
            {example.name}
          </button>
        ))}
      </div>
      
      <div className="mt-4">
        {examples.map((example) => (
          <div
            key={example.name}
            className={`${activeTab === example.name ? 'block' : 'hidden'}`}
          >
            {example.description && (
              <p className="text-gray-600 mb-4 text-sm">{example.description}</p>
            )}
            
            <div className="p-6 bg-white rounded-lg border border-gray-200 mb-4">
              {example.component}
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                {example.code}
              </pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComponentExamples; 