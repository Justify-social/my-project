'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'; // Assuming this path is correct
import { Separator } from '@/components/ui/separator';

// Helper function to determine the active tab based on the pathname
const getActiveTab = (pathname: string | null): string => {
    if (!pathname) return 'profile';
    // Check based on the full path segment
    if (pathname.endsWith('/team')) return 'team';
    if (pathname.endsWith('/branding')) return 'branding';
    // Default to profile if it ends with /profile or is just /settings (or fails)
    if (pathname.endsWith('/profile')) return 'profile';
    // Add a check for the base /settings path if needed, defaulting to profile
    if (pathname === '/settings' || pathname === '/settings/') return 'profile';
    return 'profile'; // Default fallback
};

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const activeTab = getActiveTab(pathname);

    // Update hrefs to be absolute paths from the root
    const navItems = [
        { label: 'Profile Settings', value: 'profile', href: '/settings/profile' },
        { label: 'Team Management', value: 'team', href: '/settings/team' },
        { label: 'Branding', value: 'branding', href: '/settings/branding' },
    ];

    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
            <h1 className="text-2xl md:text-3xl font-bold text-primary mb-6">Settings</h1>
            <Tabs value={activeTab} className="w-full">
                <TabsList className="mb-6 grid w-full grid-cols-1 sm:grid-cols-3 gap-2 h-auto bg-transparent p-0">
                    {navItems.map((item) => (
                        <Link href={item.href} key={item.value} passHref>
                            <TabsTrigger
                                value={item.value}
                                className="w-full justify-start data-[state=active]:bg-muted data-[state=active]:shadow-sm data-[state=active]:border-accent data-[state=active]:border-b-2 rounded-none text-secondary hover:text-primary transition-colors duration-150 px-4 py-2 text-sm font-medium"
                            >
                                {item.label}
                            </TabsTrigger>
                        </Link>
                    ))}
                </TabsList>
                <Separator className="mb-8" />
                {/* Content for the active tab will be rendered here via the page file */}
                {children}
            </Tabs>
        </div>
    );
} 