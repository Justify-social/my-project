import React from 'react';

interface LayoutContentProps {
  children: React.ReactNode;
}

export default function LayoutContent({ children }: LayoutContentProps) {
  return (
    <div className="flex-1 p-4 md:p-6 lg:p-8 ml-[240px] mt-[64px]">
      {children}
    </div>
  );
} 