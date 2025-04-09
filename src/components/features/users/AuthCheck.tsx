'use client';

import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';
import { useAuthState } from '@/lib/auth/authCoordinator';

export default function AuthCheck({ children }: { children: ReactNode }) {
    const { isAuthenticated, isLoading, isInitialized } = useAuthState();
    const router = useRouter();

    useEffect(() => {
        if (isInitialized && !isLoading && !isAuthenticated) {
            router.push('/api/auth/login');
        }
    }, [isAuthenticated, isLoading, isInitialized, router]);

    // Important: Always render children to prevent interrupting component lifecycle
    if (isLoading || !isInitialized) {
        return (
            <>
                <div className="fixed inset-0 bg-white bg-opacity-75 z-50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
                </div>
                {children}
            </>
        );
    }

    return <>{children}</>;
} 