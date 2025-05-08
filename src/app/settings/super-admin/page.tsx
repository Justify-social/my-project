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
  const { isLoaded: isUserLoaded } = useUser(); // Need user for checks
  const { isLoaded: isAuthLoaded, sessionClaims } = useAuth();
  const isSuperAdmin = sessionClaims?.['metadata.role'] === 'super_admin';

  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string>('');
  const [showSuspendConfirm, setShowSuspendConfirm] = useState(false);
  const [userToSuspend, setUserToSuspend] = useState<UserData | null>(null);
  const [isSuspending, setIsSuspending] = useState(false);
  const [suspendedUserIds, setSuspendedUserIds] = useState<Set<string>>(new Set());
  const _queryClient = useQueryClient(); // Prefixed
  const _router = useRouter(); // Prefixed
  const [_page, _setPage] = useState(1); // Prefixed

  // --- Data Fetching Effect ---
  useEffect(() => {
    if (isAuthLoaded && isSuperAdmin) {
      const fetchUsers = async () => {
        setIsLoadingData(true);
        setError('');
        try {
          // Update the fetch URL to the new API endpoint
          const response = await fetch('/api/settings/super-admin/users');
          if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
          }
          const data = await response.json();
          if (data.success) {
            setUsers(data.users || []);
          } else {
            throw new Error(data.error || 'Failed to parse users data');
          }
        } catch (err) {
          console.error('Error fetching users:', err);
          setError(err instanceof Error ? err.message : 'Failed to load users');
        } finally {
          setIsLoadingData(false);
        }
      };
      fetchUsers();
    } else if (isAuthLoaded && !isSuperAdmin) {
      setIsLoadingData(false);
    }
  }, [isAuthLoaded, isSuperAdmin]);

  // --- Handlers ---
  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    // TODO: Re-implement API call if needed
    console.log('Update role for', userId, 'to', newRole);
    toast('Role update endpoint not implemented yet.');
  };

  const handleViewUser = async (userData: UserData) => {
    // TODO: Re-implement user detail modal logic
    console.log('View user:', userData);
    toast('User detail view not implemented yet.');
  };

  const handleSuspendUser = async () => {
    if (!userToSuspend) return;
    setIsSuspending(true);
    toast('Suspend action endpoint not implemented yet.');
    console.log('Suspend user:', userToSuspend.id);
    // TODO: Re-implement API call if needed
    // Mock success for UI testing
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
    setSuspendedUserIds(prev => {
      const newSet = new Set(prev);
      newSet.add(userToSuspend.id);
      return newSet;
    });
    setShowSuspendConfirm(false);
    setUserToSuspend(null);
    setIsSuspending(false);
    toast.success('Mock suspend complete.');
  };

  const isUserSuspended = (userId: string) => {
    return suspendedUserIds.has(userId);
  };
  // --------------

  // --- Render Logic ---
  if (!isAuthLoaded || !isUserLoaded) {
    // Wait for both user and auth
    return <TeamPageSkeleton />;
  }

  if (!isSuperAdmin) {
    return <div className="p-4">Access Denied. Super Admin role required.</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header Section with Title and Debug Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-primary">User Management</h2>
        <Link href="/debug-tools" passHref>
          <Button className="bg-orange-500 hover:bg-orange-600 text-white">
            <Icon iconId="faBugLight" className="mr-2 h-4 w-4" />
            Debug
          </Button>
        </Link>
      </div>

      {isLoadingData ? (
        <div className="flex justify-center items-center h-40">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div className="p-4 text-destructive bg-destructive/10 border border-destructive rounded-md">
          Error loading users: {error}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex justify-end">
              <input
                type="text"
                placeholder="Search users..."
                className="px-3 py-1 border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring text-sm"
              />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map(userData => (
                  <TableRow key={userData.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="font-medium text-primary">{userData.name}</div>
                      <div className="text-xs text-secondary">{userData.email}</div>
                    </TableCell>
                    <TableCell className="text-sm text-secondary">{userData.companyId}</TableCell>
                    <TableCell>
                      <Select
                        defaultValue={userData.role}
                        onValueChange={newRole => handleUpdateUserRole(userData.id, newRole)}
                        disabled={isUserSuspended(userData.id)}
                      >
                        <SelectTrigger className="w-[100px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="OWNER">Owner</SelectItem>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                          <SelectItem value="MEMBER">Member</SelectItem>
                          <SelectItem value="VIEWER">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-sm text-secondary">
                      {new Date(userData.lastLogin).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewUser(userData)}
                        className="mr-2"
                      >
                        View
                      </Button>
                      {!isUserSuspended(userData.id) ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => {
                            setUserToSuspend(userData);
                            setShowSuspendConfirm(true);
                          }}
                        >
                          Suspend
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Suspended</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Suspend Confirmation Modal */}
      <Dialog open={showSuspendConfirm} onOpenChange={setShowSuspendConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Suspend User?</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Are you sure you want to suspend <strong>{userToSuspend?.name}</strong> (
              {userToSuspend?.email})?
            </p>
            <p className="mt-2 text-sm text-muted-foreground">This action can be reversed later.</p>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowSuspendConfirm(false)}
              disabled={isSuspending}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleSuspendUser} disabled={isSuspending}>
              {isSuspending ? <LoadingSpinner size="sm" className="mr-2" /> : null}
              Suspend User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SuperAdminSettingsPage;
