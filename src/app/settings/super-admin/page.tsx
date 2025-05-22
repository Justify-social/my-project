'use client'; // Or server component if preferred, but client easier for initial placeholder

// Data fetching optimization
// export const dynamic = 'force-dynamic'; // Consider if needed for settings page

import React, { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/nextjs'; // Import useAuth
import { toast } from 'react-hot-toast';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
// Removed Tabs imports as settings layout handles tabs
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon/icon';
import Link from 'next/link'; // Import Link
import { Skeleton } from '@/components/ui/skeleton'; // Corrected import name
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'; // Added Dialog components
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'; // Added Table components
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'; // Added Select
import { LoadingSpinner } from '@/components/ui/loading-spinner'; // Added LoadingSpinner
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query'; // Removed useQuery, useMutation

// Define UserData structure (matches old page)
interface UserData {
  id: string;
  name: string;
  email: string;
  companyId: string;
  role: string;
  lastLogin: string;
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
}

// --- Skeleton ---
const TeamPageSkeleton = () => (
  <div className="space-y-8">
    <Skeleton className="h-8 w-1/4 mb-6" />
    <Card className="border-divider">
      <CardHeader>
        <Skeleton className="h-6 w-1/3 mb-2" />
        <Skeleton className="h-4 w-2/3" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-10 w-full mb-4" />
        <Skeleton className="h-10 w-full mb-4" />
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  </div>
);

// --- Invite Form Schema ---
// ... schema ...

// --- Main Component ---
const SuperAdminSettingsPage = () => {
  const { isLoaded: isUserLoaded } = useUser();
  const { isLoaded: isAuthLoaded, sessionClaims } = useAuth();
  const isSuperAdmin = sessionClaims?.['metadata.role'] === 'super_admin';

  const [organizations, setOrganizations] = useState<any[]>([]);
  const [isLoadingOrgs, setIsLoadingOrgs] = useState(true);
  const [orgError, setOrgError] = useState<string>('');

  const _queryClient = useQueryClient();
  const _router = useRouter();
  const [_page, _setPage] = useState(1);

  // --- Data Fetching Effect ---
  useEffect(() => {
    if (isAuthLoaded && isSuperAdmin) {
      const fetchOrganizations = async () => {
        setIsLoadingOrgs(true);
        setOrgError('');
        try {
          const response = await fetch('/api/admin/organizations');
          if (!response.ok) {
            throw new Error(`API Error fetching organisations: ${response.status} ${response.statusText}`);
          }
          const data = await response.json();
          setOrganizations(data || []);
        } catch (err) {
          console.error('Error fetching organisations:', err);
          setOrgError(err instanceof Error ? err.message : 'Failed to load organisations');
        } finally {
          setIsLoadingOrgs(false);
        }
      };

      fetchOrganizations();

    } else if (isAuthLoaded && !isSuperAdmin) {
      setIsLoadingOrgs(false);
    }
  }, [isAuthLoaded, isSuperAdmin]);

  // --- Render Logic ---
  if (!isAuthLoaded || !isUserLoaded) {
    return <TeamPageSkeleton />;
  }

  if (!isSuperAdmin) {
    return <div className="p-4">Access Denied. Super Admin role required.</div>;
  }

  return (
    <div className="space-y-8">
      {/* Organisation Management Section */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-primary">Organisation Management</h2>
        <Link href="/debug-tools">
          <Button className="bg-orange-500 hover:bg-orange-600 text-white" asChild>
            <span>
              <Icon iconId="faBugLight" className="mr-2 h-4 w-4" />
              Debug
            </span>
          </Button>
        </Link>
      </div>
      {isLoadingOrgs ? (
        <div className="flex justify-center items-center h-40">
          <LoadingSpinner />
        </div>
      ) : orgError ? (
        <div className="p-4 text-destructive bg-destructive/10 border border-destructive rounded-md">
          Error loading organisations: {orgError}
        </div>
      ) : (
        <Card>
          <CardHeader>
            {/* Search for organisations can be added here later */}
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>ID/Slug</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {organizations.map(org => (
                  <TableRow key={org.id} className="hover:bg-muted/50">
                    <TableCell>
                      <Link href={`/settings/super-admin/organisation/${org.id}`} className="font-medium text-primary hover:underline">
                        {org.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm text-secondary">{org.slug || org.id}</TableCell>
                    <TableCell className="text-sm text-secondary">{org.membersCount}</TableCell>
                    <TableCell className="text-sm text-secondary">
                      {new Date(org.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
                {organizations.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      No organisations found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SuperAdminSettingsPage;
