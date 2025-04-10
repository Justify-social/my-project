'use client';

import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';
import { useAuthState } from '@/lib/auth/authCoordinator';
import { LoadingSpinner } from "@/components/ui/loading-spinner";

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
                    <LoadingSpinner size="lg" color="primary" />
                </div>
                {children}
            </>
        );
    }

    return <>{children}</>;
} 