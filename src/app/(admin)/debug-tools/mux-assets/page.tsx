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
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import logger from '@/lib/logger';
import { Badge } from '@/components/ui/badge';

interface MuxAsset {
  id: string;
  name: string | null;
  type: string; // e.g., 'video', 'image'
  url?: string | null; // Original uploaded URL
  muxAssetId?: string | null;
  muxPlaybackId?: string | null;
  muxProcessingStatus?: string | null;
  createdAt: string;
  updatedAt: string;
  campaignId?: string | null;
  campaignName?: string | null;
}

const MuxAssetCheckerPage: React.FC = () => {
  const [assets, setAssets] = useState<MuxAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssets = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/debug/mux-assets');
        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(
            errData.error ||
              `API Error fetching Mux assets: ${response.status} ${response.statusText}`
          );
        }
        const data = await response.json();
        setAssets(data || []);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        logger.error('Error fetching Mux assets:', { error: errorMessage });
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssets();
  }, []);

  const getMuxStatusBadgeVariant = (
    status: string | null | undefined
  ): 'default' | 'destructive' | 'secondary' | 'outline' => {
    if (!status) return 'default';
    switch (status.toUpperCase()) {
      case 'READY':
        return 'default';
      case 'MUX_PROCESSING':
      case 'AWAITING_UPLOAD':
      case 'PREPARING':
        return 'outline';
      case 'ERROR':
      case 'ERROR_NO_PLAYBACK_ID':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Mux Asset Debugger</h1>
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
          Error loading Mux assets: {error}
        </div>
      )}
      {!isLoading && !error && (
        <Card>
          <CardHeader>
            <CardTitle>Mux Creative Assets ({assets.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {assets.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name / ID</TableHead>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Mux Status</TableHead>
                    <TableHead>Mux Playback ID</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assets.map(asset => (
                    <TableRow key={asset.id}>
                      <TableCell>
                        <div className="font-medium">{asset.name || 'Untitled Asset'}</div>
                        <div className="text-xs text-muted-foreground">ID: {asset.id}</div>
                        {asset.muxAssetId && (
                          <div className="text-xs text-muted-foreground">
                            Mux Asset ID: {asset.muxAssetId}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {asset.campaignName ? (
                          <Link
                            href={`/campaigns/${asset.campaignId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm hover:underline"
                          >
                            {asset.campaignName}
                          </Link>
                        ) : (
                          asset.campaignId || 'N/A'
                        )}
                      </TableCell>
                      <TableCell>{asset.type}</TableCell>
                      <TableCell>
                        {asset.muxProcessingStatus ? (
                          <Badge variant={getMuxStatusBadgeVariant(asset.muxProcessingStatus)}>
                            {asset.muxProcessingStatus}
                          </Badge>
                        ) : (
                          'N/A'
                        )}
                      </TableCell>
                      <TableCell>{asset.muxPlaybackId || 'N/A'}</TableCell>
                      <TableCell>{new Date(asset.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        {asset.type === 'video' && asset.muxPlaybackId && (
                          <Button asChild variant="outline" size="sm">
                            <a
                              href={`https://stream.mux.com/${asset.muxPlaybackId}.m3u8`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Icon iconId="faPlayLight" className="mr-2 h-3.5 w-3.5" /> View Stream
                            </a>
                          </Button>
                        )}
                        {asset.type === 'image' && asset.url && (
                          <Button asChild variant="outline" size="sm" className="ml-2">
                            <a href={asset.url} target="_blank" rel="noopener noreferrer">
                              <Icon iconId="faImageLight" className="mr-2 h-3.5 w-3.5" /> View Image
                            </a>
                          </Button>
                        )}
                        {asset.muxAssetId && (
                          <Button asChild variant="outline" size="sm" className="ml-2">
                            <a
                              href={`https://dashboard.mux.com/organizations/YOUR_MUX_ORG_ID/environments/YOUR_MUX_ENV_ID/assets/${asset.muxAssetId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="View in Mux Dashboard (replace ORG/ENV ID in URL)"
                            >
                              <Icon iconId="faShareLight" className="mr-2 h-3.5 w-3.5" />
                              Mux DB
                            </a>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground">No Mux assets found.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MuxAssetCheckerPage;
