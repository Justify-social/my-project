// Updated import paths via tree-shake script - 2025-04-01T17:13:32.199Z
'use client';

import { useEffect } from 'react';
import SVGSVGElement from '../components/ui/icons/variants/IconVariants';
import { useRouter } from 'next/navigation';
import { useUser } from '@auth0/nextjs-auth0/client';
import Link from 'next/link';
import { Icon } from '@/components/ui/atoms/icon'
export default function Home() {
  const router = useRouter();
  const {
    user,
    isLoading
  } = useUser();
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
  return <div className="min-h-screen flex items-center justify-center font-work-sans">
      <div className="text-center font-work-sans">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mx-auto font-work-sans"></div>
        <p className="mt-4 text-gray-600 font-work-sans">Loading...</p>
      </div>
    </div>;
}
const features = [{
  name: 'Campaign Creation',
  description: 'Create and manage campaigns with our intuitive wizard interface. Set objectives, target audience, and creative requirements.',
  icon: (props: React.SVGProps<SVGSVGElement>) => <Icon iconId="faChevronRightLight" {...props}  className="text-[var(--secondary-color)] font-work-sans" />
}, {
  name: 'Asset Management',
  description: 'Upload, organize, and review creative assets. Collaborate with influencers and team members efficiently.',
  icon: (props: React.SVGProps<SVGSVGElement>) => <Icon iconId="faChevronRightLight" {...props}  className="text-[var(--secondary-color)] font-work-sans" />
}, {
  name: 'Analytics & Reporting',
  description: 'Track campaign performance, measure ROI, and generate comprehensive reports for stakeholders.',
  icon: (props: React.SVGProps<SVGSVGElement>) => <Icon iconId="faChevronRightLight" {...props}  className="text-[var(--secondary-color)] font-work-sans" />
}];