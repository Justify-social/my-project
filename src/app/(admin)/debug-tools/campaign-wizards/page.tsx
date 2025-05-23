'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
import logger from '@/lib/logger';
import { Badge } from '@/components/ui/badge';

interface CampaignWizardDebugInfo {
  id: string;
  name: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  orgId: string;
  userId: string;
  user?: {
    name?: string | null;
    email?: string | null;
  };
}

const CampaignWizardCheckerPage: React.FC = () => {
  const [wizards, setWizards] = useState<CampaignWizardDebugInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWizards = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/debug/campaign-wizards');
        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(
            errData.error ||
              `API Error fetching campaign wizards: ${response.status} ${response.statusText}`
          );
        }
        const data = await response.json();
        setWizards(data || []);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        logger.error('Error fetching campaign wizards:', { error: errorMessage });
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWizards();
  }, []);

  // TODO: Consider fetching all org names once and mapping them if displaying org name is desired.

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Campaign Wizard Debugger</h1>
        <Link href="/debug-tools">
          <Button variant="outline">
            <Icon iconId="faArrowLeftLight" className="mr-2 h-4 w-4" />
            Back to Debug Tools
          </Button>
        </Link>
      </div>

      {isLoading && (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      )}
      {error && (
        <div className="p-4 text-destructive bg-destructive/10 border border-destructive rounded-md">
          Error loading campaign wizards: {error}
        </div>
      )}
      {!isLoading && !error && (
        <Card>
          <CardHeader>
            <CardTitle>Campaign Wizards ({wizards.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {wizards.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name / ID</TableHead>
                    <TableHead>Creator</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Organisation ID</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {wizards.map(wizard => (
                    <TableRow key={wizard.id}>
                      <TableCell>
                        <div className="font-medium">{wizard.name || 'Untitled Wizard'}</div>
                        <div className="text-xs text-muted-foreground">ID: {wizard.id}</div>
                      </TableCell>
                      <TableCell>
                        {wizard.user?.name && <div className="font-medium">{wizard.user.name}</div>}
                        {wizard.user?.email && (
                          <div className="text-xs text-muted-foreground">{wizard.user.email}</div>
                        )}
                        {!wizard.user?.name && !wizard.user?.email && (
                          <div className="text-xs text-muted-foreground">
                            User ID: {wizard.userId}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{wizard.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">{wizard.orgId}</span>
                      </TableCell>
                      <TableCell>{new Date(wizard.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/campaigns/wizard?wizardId=${wizard.id}`}>
                            <Icon iconId="faExternalLinkAltLight" className="mr-2 h-3.5 w-3.5" />
                            Open Wizard
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground">No campaign wizards found.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CampaignWizardCheckerPage;
