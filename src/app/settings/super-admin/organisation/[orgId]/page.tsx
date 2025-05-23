'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon/icon';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import logger from '@/lib/logger';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

// Define a type for the user data expected from /api/admin/organizations/[orgId]/users
interface OrgUserData {
  id: string; // Clerk User ID
  firstName?: string | null;
  lastName?: string | null;
  identifier?: string | null; // email
  profileImageUrl?: string | null;
  role: string; // Role within the organization
}

// Define a type for organization details (if we fetch them for the header)
interface OrganisationDetails {
  id: string;
  name: string;
  // add other details if fetched, e.g., slug, membersCount
}

// Define type for Campaign Wizard data
interface CampaignWizardSummary {
  id: string; // CampaignWizard UUID
  name: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  userId?: string | null;
  user?: { name?: string | null; email?: string | null } | null;
}

// Define type for Brand Lift Study data for this view
interface BrandLiftStudySummary {
  id: string; // BrandLiftStudy ID
  name: string; // BrandLiftStudy name
  status: string;
  createdAt: string;
  updatedAt: string;
  submissionId: number;
  campaignWizardId?: string | null;
  campaignWizardName?: string | null;
  // campaign: { // This structure comes from the API
  //   campaignName: string;
  //   wizard: {
  //     id: string;
  //     name: string;
  //   };
  // };
}

const OrganisationDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const orgId = params?.orgId as string;

  const { isLoaded: isAuthLoaded, sessionClaims } = useAuth();
  const isSuperAdmin = sessionClaims?.['metadata.role'] === 'super_admin';

  const [organisation, setOrganisation] = useState<OrganisationDetails | null>(null);
  const [users, setUsers] = useState<OrgUserData[]>([]);
  const [campaignWizards, setCampaignWizards] = useState<CampaignWizardSummary[]>([]);
  const [brandLiftStudies, setBrandLiftStudies] = useState<BrandLiftStudySummary[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthLoaded && !isSuperAdmin) {
      setError('Access Denied. Super Admin role required.');
      setIsLoading(false);
      return;
    }

    if (isAuthLoaded && isSuperAdmin && orgId) {
      const fetchDataForOrg = async () => {
        setIsLoading(true);
        setError(null);
        try {
          // Fetch all data concurrently
          const [orgDetailsRes, usersRes, wizardsRes, studiesRes] = await Promise.all([
            fetch('/api/admin/organizations').then(res =>
              res.ok ? res.json() : Promise.reject(new Error('Failed to fetch org list for name'))
            ),
            fetch(`/api/admin/organizations/${orgId}/users`),
            fetch(`/api/admin/organizations/${orgId}/campaign-wizards`),
            fetch(`/api/admin/organizations/${orgId}/brand-lift-studies`),
          ]);

          // Process Org Details for header
          const allOrgsData = orgDetailsRes as OrganisationDetails[];
          const currentOrg = allOrgsData.find((o: OrganisationDetails) => o.id === orgId);
          if (currentOrg) {
            setOrganisation({ id: currentOrg.id, name: currentOrg.name });
          } else {
            setOrganisation({ id: orgId, name: orgId }); // Fallback
            logger.warn(`Organisation name for ${orgId} not found in full list.`);
          }

          // Process Users
          if (!usersRes.ok) {
            const errData = await usersRes.json().catch(() => ({}));
            throw new Error(
              errData.error || `API Error fetching users: ${usersRes.status} ${usersRes.statusText}`
            );
          }
          setUsers((await usersRes.json()) || []);

          // Process Campaign Wizards
          if (!wizardsRes.ok) {
            const errData = await wizardsRes.json().catch(() => ({}));
            throw new Error(
              errData.error ||
                `API Error fetching campaign wizards: ${wizardsRes.status} ${wizardsRes.statusText}`
            );
          }
          setCampaignWizards((await wizardsRes.json()) || []);

          // Process Brand Lift Studies
          if (!studiesRes.ok) {
            const errData = await studiesRes.json().catch(() => ({}));
            throw new Error(
              errData.error ||
                `API Error fetching brand lift studies: ${studiesRes.status} ${studiesRes.statusText}`
            );
          }
          setBrandLiftStudies((await studiesRes.json()) || []);
        } catch (err: unknown) {
          const errorMessage = err instanceof Error ? err.message : String(err);
          logger.error(`Error fetching data for organisation ${orgId}:`, {
            error: errorMessage,
            orgId,
          });
          setError(errorMessage);
        } finally {
          setIsLoading(false);
        }
      };
      fetchDataForOrg();
    } else if (isAuthLoaded && !orgId) {
      setError('Organisation ID is missing.');
      setIsLoading(false);
    }
  }, [isAuthLoaded, isSuperAdmin, orgId]);

  if (!isAuthLoaded) {
    return (
      <div className="container mx-auto p-4 md:p-6 text-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isSuperAdmin && isAuthLoaded) {
    return (
      <div className="container mx-auto p-4 md:p-6">Access Denied. Super Admin role required.</div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <Skeleton className="h-8 w-1/2 mb-4" /> {/* For title */}
        <Skeleton className="h-6 w-1/3 mb-6" /> {/* For subtitle/org name */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
        {/* Add more skeletons for campaigns/studies later */}
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 md:p-6 text-destructive text-center">
        <Icon iconId="faTriangleExclamationLight" className="h-10 w-10 mx-auto mb-4" />
        <h2 className="text-xl font-semibold">Error</h2>
        <p>{error}</p>
        <Button onClick={() => router.push('/settings/super-admin')} className="mt-4">
          Back to Super Admin
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-8">
      <Button
        variant="outline"
        onClick={() => router.push('/settings/super-admin')}
        className="mb-4"
      >
        <Icon iconId="faArrowLeftLight" className="mr-2 h-4 w-4" />
        Back to All Organisations
      </Button>

      <h1 className="text-3xl font-bold">Organisation Details: {organisation?.name || orgId}</h1>

      {/* Users Section */}
      <Card>
        <CardHeader>
          <CardTitle>Users in Organisation</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Org Role</TableHead>
                  <TableHead>User ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map(user => (
                  <TableRow key={user.id}>
                    <TableCell>
                      {user.profileImageUrl && (
                        <Image
                          src={user.profileImageUrl}
                          alt="avatar"
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-full inline-block mr-2"
                        />
                      )}
                      {user.firstName || ''} {user.lastName || ''}
                    </TableCell>
                    <TableCell>{user.identifier}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>{user.id}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground">No users found in this organisation.</p>
          )}
        </CardContent>
      </Card>

      {/* Campaign Wizards Section */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Wizards ({campaignWizards.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {campaignWizards.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaignWizards.map(wizard => (
                  <TableRow key={wizard.id}>
                    <TableCell className="font-medium">
                      {wizard.name || 'Untitled Wizard'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={wizard.status === 'DRAFT' ? 'outline' : 'default'}>
                        {wizard.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>{wizard.user?.name || 'N/A'}</div>
                      <div className="text-xs text-muted-foreground">
                        {wizard.user?.email || wizard.userId}
                      </div>
                    </TableCell>
                    <TableCell>{new Date(wizard.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="outline" size="sm">
                        <Link
                          href={`/campaigns/${wizard.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Icon iconId="faEyeLight" className="mr-2 h-3.5 w-3.5" /> View Wizard
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground">
              No campaign wizards found for this organisation.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Brand Lift Studies Section */}
      <Card>
        <CardHeader>
          <CardTitle>Brand Lift Studies ({brandLiftStudies.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {brandLiftStudies.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Study Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Associated Campaign</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {brandLiftStudies.map(study => (
                  <TableRow key={study.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/brand-lift/approval/${study.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {study.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant={study.status === 'DRAFT' ? 'outline' : 'default'}>
                        {study.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {study.campaignWizardName ? (
                        <Link
                          href={`/campaigns/${study.campaignWizardId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm hover:underline"
                        >
                          {study.campaignWizardName}
                        </Link>
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                    <TableCell>{new Date(study.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          window.open(
                            `/api/brand-lift/surveys/${study.id}/export-structure`,
                            '_blank'
                          )
                        }
                        className="mr-2"
                      >
                        <Icon iconId="faDownloadLight" className="mr-2 h-3.5 w-3.5" />
                        Export JSON
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground">
              No brand lift studies found for this organisation.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrganisationDetailPage;
