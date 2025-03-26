import React from 'react';

interface DebugCardProps {
  children: React.ReactNode;
  title?: string;
}

const DebugCard: React.FC<DebugCardProps> = ({ children, title }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
      {title && <h2 className="text-xl font-bold mb-4 text-gray-800">{title}</h2>}
      <div className="border-2 border-dashed border-red-300 p-4 rounded-lg">
        {children}
      </div>
    </div>
  );
};

export default DebugCard; 