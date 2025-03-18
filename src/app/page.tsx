'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@auth0/nextjs-auth0/client';
import Link from 'next/link';
import { migrateHeroIcon } from '@/lib/icon-helpers';

export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useUser();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        // If user is authenticated, redirect to dashboard
        router.push('/dashboard');
      } else {
        // If user is not authenticated, redirect to login
        router.push('/api/auth/login');
      }
    }
  }, [user, isLoading, router]);

  // Show loading state while checking authentication
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

const features = [
  {
    name: 'Campaign Creation',
    description: 'Create and manage campaigns with our intuitive wizard interface. Set objectives, target audience, and creative requirements.',
    icon: (props: React.SVGProps<SVGSVGElement>) => migrateHeroIcon('ArrowRightIcon', props),
  },
  {
    name: 'Asset Management',
    description: 'Upload, organize, and review creative assets. Collaborate with influencers and team members efficiently.',
    icon: (props: React.SVGProps<SVGSVGElement>) => migrateHeroIcon('ArrowRightIcon', props),
  },
  {
    name: 'Analytics & Reporting',
    description: 'Track campaign performance, measure ROI, and generate comprehensive reports for stakeholders.',
    icon: (props: React.SVGProps<SVGSVGElement>) => migrateHeroIcon('ArrowRightIcon', props),
  },
];
