'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
// import Link from 'next/link'; // Removed unused Link
import { toast } from 'react-hot-toast';
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
import { Badge } from '@/components/ui/badge';
import { IconButtonAction } from '@/components/ui/button-icon-action';
import { Icon } from '@/components/ui/icon/icon';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getCampaignStatusInfo, CampaignStatusKey } from '@/utils/statusUtils';
import { cn } from '@/lib/utils';
import { ConfirmDeleteDialog } from '@/components/ui/dialog-confirm-delete';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Define the expected data structure for a brand lift study item
interface BrandLiftStudyListItem {
  id: string;
  name: string;
  createdAt: string;
  status: CampaignStatusKey; // Use CampaignStatusKey for compatibility with getCampaignStatusInfo
  primaryKpi: string;
  reportId?: string;
  reportStatus?: string;
}

const CampaignSelectionPage: React.FC = () => {
  const router = useRouter();
  const [studies, setStudies] = useState<BrandLiftStudyListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State for Delete Modal
  const [showDeleteStudyModal, setShowDeleteStudyModal] = useState(false);
  const [studyToDelete, setStudyToDelete] = useState<BrandLiftStudyListItem | null>(null);

  // State for Duplicate Modal
  const [isDuplicateStudyDialogOpen, setIsDuplicateStudyDialogOpen] = useState(false);
  const [studyToDuplicate, setStudyToDuplicate] = useState<BrandLiftStudyListItem | null>(null);
  const [newDuplicateStudyName, setNewDuplicateStudyName] = useState('');
  const [isDuplicatingStudy, setIsDuplicatingStudy] = useState(false);
  const [duplicateStudyNameError, setDuplicateStudyNameError] = useState<string | null>(null);

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

  const fetchBrandLiftStudies = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/brand-lift/surveys');
      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: 'Failed to fetch studies details' }));
        throw new Error(
          errorData.error || `Failed to fetch brand lift studies: ${response.statusText}`
        );
      }
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        setStudies(result.data);
      } else {
        throw new Error(result.error || 'Invalid data format received for brand lift studies.');
      }
    } catch (err: unknown) {
      logger.error('Error fetching brand lift studies:', { error: err });
      setError(err instanceof Error ? err.message : 'An error occurred');
      setStudies([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBrandLiftStudies();
  }, [fetchBrandLiftStudies]);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (e) {
      logger.warn('Invalid date string for formatDate:', { dateString });
      return 'Invalid Date';
    }
  };

  const formatKpiName = (kpiKey: string | null | undefined): string => {
    if (!kpiKey) return 'N/A';
    return kpiKey
      .toLowerCase()
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Action Handlers (stubs for now, to be implemented with modals and API calls)
  const handleViewStudy = (studyId: string) => {
    router.push(`/brand-lift/report/${studyId}`);
  };

  const handleEditStudy = (studyId: string) => {
    // TODO: Check study status before allowing edit
    // e.g., if (study.status === 'COLLECTING' || study.status === 'COMPLETED') return;
    router.push(`/brand-lift/survey-design/${studyId}`);
  };

  // Delete Study Handlers
  const handleDeleteStudyClick = (study: BrandLiftStudyListItem) => {
    setStudyToDelete(study);
    setShowDeleteStudyModal(true);
  };

  const executeDeleteStudy = async () => {
    if (!studyToDelete) return;
    try {
      const response = await fetch(`/api/brand-lift/surveys/${studyToDelete.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || 'Failed to delete study');
      }
      toast.success(`Study "${studyToDelete.name}" deleted successfully.`);
      fetchBrandLiftStudies(); // Refetch studies
    } catch (error: unknown) {
      logger.error('Failed to delete study:', { studyId: studyToDelete.id, error: error });
      toast.error(error instanceof Error ? error.message : 'Could not delete study.');
    }
    // setShowDeleteStudyModal(false); // ConfirmDeleteDialog handles its own closing via onClose prop
    // setStudyToDelete(null);
  };

  // Duplicate Study Handlers
  const handleDuplicateStudyClick = (study: BrandLiftStudyListItem) => {
    setStudyToDuplicate(study);
    setNewDuplicateStudyName(`Copy of ${study.name}`);
    setDuplicateStudyNameError(null);
    setIsDuplicatingStudy(false);
    setIsDuplicateStudyDialogOpen(true);
  };

  const handleDuplicateStudyConfirm = async () => {
    if (!studyToDuplicate) return;
    const trimmedName = newDuplicateStudyName.trim();
    if (!trimmedName) {
      setDuplicateStudyNameError('Study name cannot be empty.');
      return;
    }
    setDuplicateStudyNameError(null);
    setIsDuplicatingStudy(true);
    try {
      const response = await fetch(`/api/brand-lift/surveys/${studyToDuplicate.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newName: trimmedName }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || 'Failed to duplicate study');
      }
      const duplicatedStudy = await response.json();
      toast.success(`Study "${studyToDuplicate.name}" duplicated as "${duplicatedStudy.name}".`);
      setIsDuplicateStudyDialogOpen(false);
      fetchBrandLiftStudies(); // Refresh list
    } catch (error: unknown) {
      logger.error('Error duplicating study:', {
        studyId: studyToDuplicate.id,
        error: error,
      });
      toast.error(error instanceof Error ? error.message : 'Could not duplicate study.');
    } finally {
      setIsDuplicatingStudy(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-6">Brand Lift</h1>
        <CampaignSelector onCampaignSelected={handleCampaignSelected} />
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Brand Lift Studies</h2>
        {error && (
          <Alert variant="destructive">
            <Icon iconId="faTriangleExclamationLight" className="h-4 w-4" />
            <AlertTitle>Error Loading Studies</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Study Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>KPI</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    <TableCell>
                      <Skeleton className="h-5 w-3/4" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-28" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-8 w-32" />
                    </TableCell>
                  </TableRow>
                ))
              ) : studies.length === 0 && !error ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No recent brand lift studies found.
                  </TableCell>
                </TableRow>
              ) : (
                studies.map(study => {
                  const statusInfo = getCampaignStatusInfo(study.status as CampaignStatusKey);
                  const isViewDisabled =
                    !study.reportId && study.status.toUpperCase() !== 'COMPLETED';
                  const isEditDisabled = ['COLLECTING', 'COMPLETED', 'ARCHIVED'].includes(
                    study.status.toUpperCase()
                  );
                  const isDeleteDisabled = ['COLLECTING'].includes(study.status.toUpperCase());
                  const isDuplicateDisabled = false; // Duplication is generally always allowed

                  return (
                    <TableRow key={study.id}>
                      <TableCell className="font-medium">{study.name || 'N/A'}</TableCell>
                      <TableCell>{formatDate(study.createdAt)}</TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            statusInfo.class,
                            'px-2 py-0.5 text-xs',
                            // Add explicit hover overrides to prevent color change
                            // We need to deconstruct statusInfo.class to get the base bg and text
                            // For simplicity, let's assume most statuses use -100 for bg and -800 for text
                            // A more robust solution might involve parsing statusInfo.class or expanding getCampaignStatusInfo
                            // For now, this targets common patterns. Specific hover classes can be added if needed.
                            // Example: if statusInfo.class = "bg-green-100 text-green-800", then we add hover:bg-green-100 hover:text-green-800
                            // This requires knowing the exact classes. Let's try a generic approach if possible or adjust per status.
                            // For now, let's apply a common pattern, this might need refinement based on actual classes from getCampaignStatusInfo
                            {
                              'hover:bg-gray-100 hover:text-gray-800':
                                statusInfo.class.includes('gray'),
                              'hover:bg-yellow-100 hover:text-yellow-800':
                                statusInfo.class.includes('yellow'),
                              'hover:bg-green-100 hover:text-green-800':
                                statusInfo.class.includes('green'),
                              'hover:bg-accent hover:text-accent-foreground':
                                statusInfo.class.includes('accent'), // For 'COMPLETED'
                              // Add other specific color overrides if necessary
                            }
                          )}
                        >
                          {statusInfo.text}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatKpiName(study.primaryKpi)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1 justify-end">
                          <IconButtonAction
                            iconBaseName="faEye"
                            hoverColorClass="text-accent"
                            ariaLabel="View study report"
                            onClick={() => !isViewDisabled && handleViewStudy(study.id)}
                            className={cn(
                              'w-8 h-8',
                              isViewDisabled && 'opacity-50 cursor-not-allowed'
                            )}
                          />
                          <IconButtonAction
                            iconBaseName="faPenToSquare"
                            hoverColorClass="text-accent"
                            ariaLabel="Edit study"
                            onClick={() => !isEditDisabled && handleEditStudy(study.id)}
                            className={cn(
                              'w-8 h-8',
                              isEditDisabled && 'opacity-50 cursor-not-allowed'
                            )}
                          />
                          <IconButtonAction
                            iconBaseName="faCopy"
                            hoverColorClass="text-accent"
                            ariaLabel="Duplicate study"
                            onClick={() => !isDuplicateDisabled && handleDuplicateStudyClick(study)}
                            className={cn(
                              'w-8 h-8',
                              isDuplicateDisabled && 'opacity-50 cursor-not-allowed'
                            )}
                          />
                          <IconButtonAction
                            iconBaseName="faTrashCan"
                            hoverColorClass="text-destructive"
                            ariaLabel="Delete study"
                            onClick={() => !isDeleteDisabled && handleDeleteStudyClick(study)}
                            className={cn(
                              'w-8 h-8',
                              isDeleteDisabled && 'opacity-50 cursor-not-allowed'
                            )}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {studyToDelete && (
        <ConfirmDeleteDialog
          isOpen={showDeleteStudyModal}
          onClose={() => {
            setShowDeleteStudyModal(false);
            setStudyToDelete(null);
          }}
          onConfirm={executeDeleteStudy}
          itemName={studyToDelete?.name || 'this study'}
        />
      )}

      {/* Duplicate Study Dialog */}
      <Dialog open={isDuplicateStudyDialogOpen} onOpenChange={setIsDuplicateStudyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duplicate Brand Lift Study</DialogTitle>
            <DialogDescription>
              Enter a new name for the duplicated study (originally "{studyToDuplicate?.name}").
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-1">
            <Input
              id="duplicate-study-name"
              value={newDuplicateStudyName}
              onChange={e => setNewDuplicateStudyName(e.target.value)}
              placeholder="New study name"
              className={cn(duplicateStudyNameError && 'border-destructive')}
            />
            {duplicateStudyNameError && (
              <p className="text-xs text-destructive">{duplicateStudyNameError}</p>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button
                variant="outline"
                onClick={() => setIsDuplicateStudyDialogOpen(false)}
                disabled={isDuplicatingStudy}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={handleDuplicateStudyConfirm}
              disabled={isDuplicatingStudy || !newDuplicateStudyName.trim()}
            >
              {isDuplicatingStudy ? (
                <>
                  <Icon iconId="faCircleNotchLight" className="animate-spin mr-2 h-4 w-4" />
                  Duplicating...
                </>
              ) : (
                'Duplicate Study'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CampaignSelectionPage;
