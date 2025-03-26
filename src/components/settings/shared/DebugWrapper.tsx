import React, { ReactNode } from 'react';

interface DebugWrapperProps {
  children: ReactNode;
  title?: string;
  dataInfo?: Record<string, any>;
}

/**
 * A wrapper component that provides debugging information and a visual container
 * for isolating components during troubleshooting.
 */
const DebugWrapper: React.FC<DebugWrapperProps> = ({ 
  children, 
  title = 'Debug View', 
  dataInfo 
}) => {
  return (
    <div className="border-4 border-dashed border-orange-500 p-4 my-4 rounded-lg bg-orange-50">
      <div className="flex justify-between items-center mb-2 bg-orange-100 p-2 rounded">
        <h3 className="font-bold text-orange-800">{title}</h3>
        <button 
          onClick={() => console.log('Debug data:', dataInfo || 'No data provided')}
          className="bg-orange-500 text-white px-2 py-1 rounded text-xs"
        >
          Log Info
        </button>
      </div>
      
      {dataInfo && (
        <div className="bg-white p-2 rounded mb-4 text-xs font-mono overflow-x-auto">
          <pre>{JSON.stringify(dataInfo, null, 2)}</pre>
        </div>
      )}
      
      <div className="relative">
        {children}
        <div className="absolute top-0 right-0 bg-orange-200 px-2 py-1 text-xs rounded-bl font-mono">
          {React.Children.count(children)} child(ren)
        </div>
      </div>
    </div>
  );
};

export default DebugWrapper; 