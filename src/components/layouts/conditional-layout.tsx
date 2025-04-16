'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import ClientLayout from '@/components/layouts/client-layout';

// Define the paths where the main ClientLayout should NOT be rendered
const AUTH_PATHS = ['/sign-in', '/sign-up'];

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Handle potential null pathname (though unlikely in page context)
    if (!pathname) {
        // Decide how to handle this - maybe return null or a loading state?
        // For now, let's assume it won't be null in practice for routes.
        // Or, return children directly if unsure.
        return <>{children}</>;
    }

    // Check if the current path starts with any of the auth paths
    const isAuthPage = AUTH_PATHS.some(path => pathname.startsWith(path));

    if (isAuthPage) {
        // For auth pages, render children directly without the main layout
        return <>{children}</>;
    }

    // For all other pages, wrap children with the main ClientLayout
    return (
        <ClientLayout>
            {children}
        </ClientLayout>
    );
} 