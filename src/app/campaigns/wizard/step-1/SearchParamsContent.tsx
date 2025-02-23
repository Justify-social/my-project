'use client';

import { useSearchParams } from 'next/navigation';

export default function SearchParamsContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  
  return (
    <div>
      {/* Your page content */}
    </div>
  );
} 