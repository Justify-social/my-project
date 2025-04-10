'use client';

import React from 'react';
// Removed dynamic import
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

// Removed dynamic import wrapper
// const DashboardContentComponent = nextDynamic(() => import('./DashboardContent'), {
//     ssr: false, // Disable SSR for client-side charting library
//     loading: () => <DashboardLoadingSkeleton />
// });

export default function ClientDashboard({ user }: ClientDashboardProps) {
    // TODO: Add the actual dashboard content here 
    // This likely involves charts, stats, etc., using the 'user' prop

    // Placeholder content - replace with actual dashboard UI
    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold">Welcome, {user.name}!</h1>
            <p>Your Role: {user.role}</p>
            <p>Your ID: {user.id}</p>
            <p className="text-muted-foreground">(Dashboard content goes here)</p>

            {/* Example of where charts/stats might go */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="border p-4 rounded-lg shadow-sm">
                    <h3 className="font-medium mb-2">Metric 1</h3>
                    <p className="text-3xl font-semibold">1,234</p>
                </div>
                <div className="border p-4 rounded-lg shadow-sm">
                    <h3 className="font-medium mb-2">Metric 2</h3>
                    <p className="text-3xl font-semibold">56%</p>
                </div>
                <div className="border p-4 rounded-lg shadow-sm">
                    <h3 className="font-medium mb-2">Metric 3</h3>
                    <p className="text-3xl font-semibold">$7,890</p>
                </div>
            </div>
        </div>
    );
} 