'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import CampaignSelector from '@/components/features/brand-lift/CampaignSelector';
import logger from '@/lib/logger';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge'; // For status
import { Progress } from '@/components/ui/progress'; // For survey completes
import { Button } from '@/components/ui/button'; // For 'See report' button
import { Icon } from '@/components/ui/icon/icon';

const CampaignSelectionPage: React.FC = () => {
  const router = useRouter();

  const handleCampaignSelected = (campaignId: string | null) => {
    if (campaignId) {
      logger.info(`Campaign selected, navigating to review/setup for campaign ID: ${campaignId}`);
      router.push(`/brand-lift/campaign-review-setup/${campaignId}`);
    } else {
      logger.error('Invalid or no campaign ID received from selector:', {
        receivedCampaignId: campaignId,
      });
    }
  };

  // Placeholder data for table structure - will be empty in rendering
  const recentTestResults: any[] = []; // Empty array as per no dummy data requirement

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-6">Brand Lift</h1>
        <CampaignSelector onCampaignSelected={handleCampaignSelected} />
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Brand Lift Results</h2>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Study Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>KPI</TableHead>
                <TableHead>Survey Completes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTestResults.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No recent brand lift studies found.
                  </TableCell>
                </TableRow>
              ) : (
                // This part will not render with empty recentTestResults
                recentTestResults.map(test => (
                  <TableRow key={test.id}>
                    <TableCell className="font-medium">{test.name}</TableCell>
                    <TableCell>{test.date}</TableCell>
                    <TableCell>
                      <Badge variant={test.status === 'Completed' ? 'default' : 'secondary'}>
                        {test.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{test.kpi}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <span className="mr-2 text-sm text-muted-foreground">
                          {test.completes}/{test.target}
                        </span>
                        <Progress
                          value={(test.completes / test.target) * 100}
                          className="w-24 h-2"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm">
                        {/* <Icon iconId="faFileLinesLight" className="mr-2 h-3.5 w-3.5" /> */}
                        See report
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {/* TODO: Add pagination if needed, similar to /campaigns page */}
      </div>
    </div>
  );
};

export default CampaignSelectionPage;
