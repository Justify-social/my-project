'use client';

import React from 'react';
import { default as nextDynamic } from 'next/dynamic';
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

// Define the skeleton fallback using the imported SSOT component
// (Could be moved to a shared file)
const DashboardLoadingSkeleton = () => {
    return <div className="animate-pulse space-y-4 p-4">
        <LoadingSkeleton className="h-8 w-3/4" />
        <LoadingSkeleton className="h-4 w-full" />
        <LoadingSkeleton className="h-4 w-5/6" />
        <LoadingSkeleton className="h-10 w-1/2" />
    </div>;
};

// Define expected user prop type
// (Could be moved to a shared file)
interface DashboardUser {
    id: string;
    name: string;
    role: string;
}

interface ClientDashboardProps {
    user: DashboardUser;
}

// Move the dynamic import here
const DashboardContentComponent = nextDynamic(() => import('./DashboardContent'), {
    ssr: false, // Disable SSR for client-side charting library
    loading: () => <DashboardLoadingSkeleton />
});

export default function ClientDashboard({ user }: ClientDashboardProps) {
    return (
        <div className="px-4 md:px-6 py-6 font-work-sans">
            {/* Render the dynamically imported component */}
            <DashboardContentComponent user={user} />
        </div>
    );
} 