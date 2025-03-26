'use client';

import React, { useState } from 'react';
import DebugCard from '@/components/settings/shared/DebugCard';
import MembersListDebug from '@/components/settings/team-management/MembersListDebug';

export default function TeamManagementDebug() {
  const [count, setCount] = useState(0);
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Team Management Debug Page</h1>
      
      <DebugCard title="Basic Card Test">
        <p className="mb-4">This is a simplified test page to debug rendering issues.</p>
        
        <div className="flex items-center space-x-4 mb-4">
          <button
            onClick={() => setCount(count + 1)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Count: {count}
          </button>
          
          <button
            onClick={() => setCount(0)}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
          >
            Reset
          </button>
        </div>
        
        <MembersListDebug />
      </DebugCard>
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <DebugCard title="Card One">
          <p>This is the first test card to verify rendering.</p>
        </DebugCard>
        
        <DebugCard title="Card Two">
          <p>This is the second test card to verify rendering.</p>
        </DebugCard>
      </div>
    </div>
  );
} 