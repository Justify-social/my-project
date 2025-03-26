'use client';

import React, { useState } from 'react';

// Simplified debug version with minimal dependencies
export default function SimpleDebug() {
  const [count, setCount] = useState(0);
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Simple Debug Page</h1>
      
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-bold mb-4">Interactive Test</h2>
        <p>This is a minimal test component with no dependencies.</p>
        
        <div className="mt-4 flex space-x-4">
          <button
            onClick={() => setCount(prev => prev + 1)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Increment: {count}
          </button>
          
          <button
            onClick={() => setCount(0)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
          >
            Reset
          </button>
        </div>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-bold mb-4">Debug Information</h2>
        <ul className="list-disc pl-5">
          <li className="mb-2">Current time: {new Date().toLocaleTimeString()}</li>
          <li className="mb-2">Window width: {typeof window !== 'undefined' ? window.innerWidth : 'SSR'}</li>
          <li className="mb-2">React is loaded: {React ? 'Yes' : 'No'}</li>
          <li className="mb-2">Count state working: {count >= 0 ? 'Yes' : 'No'}</li>
        </ul>
        
        <div className="mt-4">
          <button
            onClick={() => console.log('Simple debug page is working!')}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            Log to Console
          </button>
        </div>
      </div>
    </div>
  );
} 