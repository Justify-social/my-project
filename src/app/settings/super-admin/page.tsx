'use client'; // Or server component if preferred, but client easier for initial placeholder

import React from 'react';
import { Protect } from '@clerk/nextjs'; // Import Protect for role checking
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

const SuperAdminPage = () => {
    return (
        // Use Clerk's <Protect> component for robust authorization check
        <Protect
            role="org:admin" // TODO: Replace with your actual SUPER_ADMIN role identifier (e.g., 'SUPER_ADMIN')
            fallback={<div>Access Denied: You do not have permission to view this page.</div>}
        >
            <Card className="border-divider">
                <CardHeader>
                    <CardTitle>Super Admin Area</CardTitle>
                    <CardDescription>Global settings and administrative tools.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-secondary">[Super admin controls will be built here]</p>
                </CardContent>
            </Card>
        </Protect>
    );
};

export default SuperAdminPage; 