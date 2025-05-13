'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/ui/icon/icon';
import { useUser, useAuth } from '@clerk/nextjs';
import { LoadingSkeleton, TableSkeleton } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { IconButtonAction } from '@/components/ui/button-icon-action';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Prisma } from '@prisma/client'; // Ensure Prisma namespace is imported
import { Label } from '@/components/ui/label';
import { logger } from '@/utils/logger';
import { ConfirmDeleteDialog } from '@/components/ui/dialog-confirm-delete'; // Added import
import { getCampaignStatusInfo, CampaignStatusKey } from '@/utils/statusUtils'; // Import centralized utility
import { Checkbox } from '@/components/ui/checkbox'; // Import Checkbox

// Define expected status values
// type CampaignStatus = 'DRAFT' | 'REVIEW' | 'APPROVED' | 'ACTIVE' | 'COMPLETED' | string;
type Platform = 'Instagram' | 'YouTube' | 'TikTok' | 'N/A';

// Define the shape of the data coming from /api/list-campaigns
// Based on campaignWizardSelectForList in src/lib/data/campaigns.ts
interface ApiListData {
  id: string;
  name: string | null;
  status: string | null; // Prisma Status enum values as strings
  startDate: Date | string | null; // Allow string dates from DB/JSON
  endDate: Date | string | null; // Allow string dates from DB/JSON
  budget: Prisma.JsonValue | null; // Comes as JSON
  primaryKPI: string | null;
  primaryContact: Prisma.JsonValue | null; // Comes as JSON
  createdAt: Date | string | null; // Allow string dates from DB/JSON
  Influencer: { platform: string | null }[] | null; // Prisma Platform enum values
  locations: Prisma.JsonValue | null; // Comes as JSON
}

// Helper function (can be moved to utils)
const safelyParseJson = <T,>(jsonValue: Prisma.JsonValue | null, defaultValue: T): T => {
  // Corrected generic syntax
  if (typeof jsonValue === 'string') {
    try {
      return JSON.parse(jsonValue) as T;
    } catch (error) {
      console.error('Error parsing JSON string:', error, jsonValue);
      return defaultValue;
    }
  }
  // If it's not a string or null, return default value. Avoid parsing non-strings.
  return defaultValue;
};

/**
 * Transforms raw campaign data from the NEW API (/api/list-campaigns)
 * based on the CampaignWizard model fields.
 */
const transformCampaignData = (campaign: ApiListData): Campaign => {
  // Safely format dates to ISO strings or empty string
  const formatDateToString = (dateInput: Date | string | null): string => {
    if (!dateInput) return '';
    try {
      // Standardize to Date object first
      const date = new Date(dateInput); // Accepts Date objects, ISO strings, timestamps

      // Check if the resulting Date object is valid
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }
    } catch (error) {
      console.error('Error formatting date:', error, dateInput);
    }
    return '';
  };

  // Safely parse budget JSON
  const budgetData = safelyParseJson<{ total?: number | string | null }>(campaign.budget, {});
  const totalBudget = Number(budgetData?.total || 0);

  // Safely parse primaryContact JSON
  const contactData = safelyParseJson<{
    firstName?: string;
    surname?: string;
    email?: string;
    position?: string;
  }>(campaign.primaryContact, {});
  const primaryContact = {
    firstName: contactData?.firstName || '',
    surname: contactData?.surname || '',
    email: contactData?.email || undefined,
    position: contactData?.position || undefined,
  };

  // Safely parse locations JSON
  const locationsArray = safelyParseJson<{ location?: string }[]>(campaign.locations, []);
  const audienceLocations = locationsArray
    .map(loc => loc?.location)
    .filter((loc): loc is string => typeof loc === 'string' && loc.trim() !== '')
    .map(location => ({ location }));

  // Determine platform from first influencer
  let platform: Platform = 'N/A';
  const firstInfluencerPlatform = campaign.Influencer?.[0]?.platform;
  if (firstInfluencerPlatform) {
    switch (firstInfluencerPlatform) {
      case 'INSTAGRAM':
        platform = 'Instagram';
        break;
      case 'YOUTUBE':
        platform = 'YouTube';
        break;
      case 'TIKTOK':
        platform = 'TikTok';
        break;
    }
  }

  let normalizedStatus = (campaign.status || 'DRAFT').toUpperCase();
  if (normalizedStatus === 'IN_REVIEW') {
    normalizedStatus = 'REVIEW'; // Though REVIEW is not a target display status
  }
  if (normalizedStatus === 'SUBMITTED_FINAL') {
    normalizedStatus = 'SUBMITTED'; // Normalize to canonical SUBMITTED
  }

  return {
    id: campaign.id,
    campaignName: campaign.name || 'Untitled Campaign',
    status: normalizedStatus as CampaignStatusKey, // Use imported CampaignStatusKey
    platform: platform,
    startDate: formatDateToString(campaign.startDate),
    endDate: formatDateToString(campaign.endDate),
    totalBudget: totalBudget,
    primaryKPI: campaign.primaryKPI || '',
    primaryContact: primaryContact,
    createdAt: formatDateToString(campaign.createdAt),
    audience: {
      locations: audienceLocations,
    },
  };
};

// KPI options matching Step2Content.tsx
interface KpiOption {
  key: string;
  title: string;
}
const KPI_OPTIONS: KpiOption[] = [
  {
    key: 'adRecall',
    title: 'Ad Recall',
  },
  {
    key: 'brandAwareness',
    title: 'Brand Awareness',
  },
  {
    key: 'consideration',
    title: 'Consideration',
  },
  {
    key: 'messageAssociation',
    title: 'Message Association',
  },
  {
    key: 'brandPreference',
    title: 'Brand Preference',
  },
  {
    key: 'purchaseIntent',
    title: 'Purchase Intent',
  },
  {
    key: 'actionIntent',
    title: 'Action Intent',
  },
  {
    key: 'recommendationIntent',
    title: 'Recommendation Intent',
  },
  {
    key: 'advocacy',
    title: 'Advocacy',
  },
];

// UPDATED Campaign interface to match transformed data
interface Campaign {
  id: string | number;
  campaignName: string;
  status: CampaignStatusKey; // Use imported CampaignStatusKey
  platform: Platform;
  startDate: string; // ISO string format
  endDate: string; // ISO string format
  totalBudget: number;
  primaryKPI: string;
  primaryContact: {
    firstName: string;
    surname: string;
    email?: string;
    position?: string;
  };
  createdAt: string; // ISO string format
  audience?: {
    locations: {
      location: string;
    }[];
  };
}

type SortDirection = 'ascending' | 'descending';

const ClientCampaignList: React.FC = () => {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { orgId, isLoaded: isAuthLoaded } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [objectiveFilter, setObjectiveFilter] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [myCampaignsFilter, setMyCampaignsFilter] = useState(false); // State for "Created by me" filter
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [campaignsPerPage, setCampaignsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Campaign;
    direction: SortDirection;
  } | null>(null);

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<{ id: string; name: string } | null>(
    null
  );
  const [deleteInProgress, setDeleteInProgress] = useState(false);
  const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false);
  const [campaignToDuplicate, setCampaignToDuplicate] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [newDuplicateName, setNewDuplicateName] = useState('');
  const [isCheckingName, setIsCheckingName] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const router = useRouter();

  // Define Toast Helper Functions Locally
  const showSuccessToast = (
    message: string,
    iconId?: string,
    customClassName?: string,
    iconClassName?: string
  ) => {
    const finalIconId = iconId || 'faFloppyDiskLight';
    const successIcon = (
      <Icon iconId={finalIconId} className={`h-5 w-5 ${iconClassName || 'text-success'}`} />
    );
    toast.success(message, {
      duration: 3000,
      className: customClassName || 'toast-success-custom',
      icon: successIcon,
    });
  };
  const showErrorToast = (message: string, iconId?: string) => {
    const finalIconId = iconId || 'faTriangleExclamationLight';
    const errorIcon = <Icon iconId={finalIconId} className="h-5 w-5 text-destructive" />;
    toast.error(message, {
      duration: 5000,
      className: 'toast-error-custom',
      icon: errorIcon,
    });
  };

  const fetchCampaigns = useCallback(async () => {
    // Make fetchCampaigns useCallback
    setIsLoadingData(true);
    setError('');
    try {
      const queryParams = new URLSearchParams();
      if (myCampaignsFilter) {
        queryParams.append('filterByCreator', 'true');
      }
      // Add other filters to queryParams here if implementing server-side filtering for them
      // e.g., if (statusFilter) queryParams.append('status', statusFilter);

      const response = await fetch(`/api/list-campaigns?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        let errorDetails = `Failed to load campaigns: ${response.status}`;
        try {
          const errorData = await response.json();
          errorDetails = errorData.error || errorData.message || errorDetails;
        } catch {
          /* Ignore JSON parsing error */
        }
        if (response.status === 401 || response.status === 403) {
          throw new Error('Unauthorized to fetch campaigns.');
        }
        throw new Error(errorDetails);
      }
      const data = await response.json();
      console.log('API Response from /api/list-campaigns:', data);

      if (data.success && Array.isArray(data.data)) {
        const transformedCampaigns = data.data.map(transformCampaignData);
        setCampaigns(transformedCampaigns);
        if (data.message && data.data.length === 0) {
          setError(data.message);
        }
      } else {
        const errorMsg = data.error || data.message || 'Invalid data format received from server.';
        console.log('Invalid data format or error message from API:', data);
        setError(errorMsg);
        setCampaigns([]);
      }
    } catch (err) {
      console.error('Error fetching campaigns:', err);
      setError(err instanceof Error ? err.message : 'Failed to load campaigns');
      setCampaigns([]);
    } finally {
      setIsLoadingData(false);
    }
  }, [myCampaignsFilter]); // Add myCampaignsFilter to dependency array

  useEffect(() => {
    if (isUserLoaded && isAuthLoaded) {
      if (user && orgId) {
        fetchCampaigns();
      } else if (user && !orgId) {
        setIsLoadingData(false);
        setCampaigns([]);
        setError(
          'Please select an active organization to view campaigns, or create one in Settings.'
        );
      } else if (!user) {
        setIsLoadingData(false);
        setCampaigns([]);
      }
    }
  }, [isUserLoaded, user, isAuthLoaded, orgId, fetchCampaigns]); // Add fetchCampaigns to dependencies

  const refetchCampaigns = useCallback(async () => {
    // Make refetchCampaigns useCallback
    // This function essentially calls fetchCampaigns, so can be simplified or directly call fetchCampaigns
    await fetchCampaigns();
  }, [fetchCampaigns]);

  // Get unique start and end dates from campaigns
  const uniqueDates = useMemo(() => {
    if (!campaigns || campaigns.length === 0)
      return {
        startDates: [],
        endDates: [],
      };

    // Updated helper function to safely parse dates for filters
    const safelyFormatDateForFilter = (
      dateValue: string | number | Date | null | undefined // Removed Record<string, never>
    ): string | undefined => {
      if (!dateValue) return undefined;
      // Explicitly handle only types Date constructor accepts
      if (
        typeof dateValue !== 'string' &&
        typeof dateValue !== 'number' &&
        !(dateValue instanceof Date)
      ) {
        console.warn(
          'safelyFormatDateForFilter received unexpected type:',
          typeof dateValue,
          dateValue
        );
        return undefined; // Ignore unexpected types
      }
      try {
        const date = new Date(dateValue);
        if (!isNaN(date.getTime())) {
          return date.toISOString().split('T')[0]; // Use YYYY-MM-DD format for filtering
        }
        return undefined;
      } catch (error) {
        console.error('Error parsing date for filter:', error, dateValue);
        return undefined;
      }
    };

    const startDatesArray = campaigns
      .map(campaign => safelyFormatDateForFilter(campaign.startDate))
      .filter((date): date is string => !!date);

    const endDatesArray = campaigns
      .map(campaign => safelyFormatDateForFilter(campaign.endDate))
      .filter((date): date is string => !!date);

    const startDatesSet = new Set(startDatesArray);
    const endDatesSet = new Set(endDatesArray);

    const startDates = Array.from(startDatesSet).sort();
    const endDates = Array.from(endDatesSet).sort();
    return {
      startDates,
      endDates,
    };
  }, [campaigns]);

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.warn(`Invalid date format: ${dateString}`);
        return 'Invalid date';
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      console.error('Error formatting date:', error, dateString);
      return 'Invalid date';
    }
  };

  // Filter campaigns based on search text and dropdown filters
  const filteredCampaigns = useMemo(() => {
    if (!campaigns) return [];
    return campaigns.filter(campaign => {
      if (!campaign) return false;
      const matchesSearch =
        campaign.campaignName?.toLowerCase()?.includes(search.toLowerCase()) ?? false;
      const matchesStatus = !statusFilter || campaign.status?.toLowerCase() === statusFilter;

      // Match primaryKPI with objective filter using KPI_OPTIONS
      const kpiOption = KPI_OPTIONS.find(kpi => kpi.title === campaign.primaryKPI);
      const kpiKey = kpiOption ? kpiOption.key : '';
      const matchesObjective = !objectiveFilter || kpiKey === objectiveFilter;

      // Date filters with proper date comparison
      const campaignStartDate = campaign.startDate ? campaign.startDate.split('T')[0] : '';
      const campaignEndDate = campaign.endDate ? campaign.endDate.split('T')[0] : '';
      const matchesStartDate =
        !startDateFilter || (campaignStartDate && campaignStartDate >= startDateFilter);
      const matchesEndDate =
        !endDateFilter || (campaignEndDate && campaignEndDate <= endDateFilter);

      return (
        matchesSearch && matchesStatus && matchesObjective && matchesStartDate && matchesEndDate
      );
    });
  }, [campaigns, search, statusFilter, objectiveFilter, startDateFilter, endDateFilter]);

  // Sort campaigns based on the active sort configuration
  const sortedCampaigns = useMemo(() => {
    if (!filteredCampaigns || filteredCampaigns.length === 0) return [];
    if (!sortConfig) return filteredCampaigns;
    return [...filteredCampaigns].sort((a, b) => {
      if (!a || !b) return 0;
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (
        sortConfig.key === 'startDate' ||
        sortConfig.key === 'endDate' ||
        sortConfig.key === 'createdAt'
      ) {
        const aDate = new Date(aVal as string).getTime();
        const bDate = new Date(bVal as string).getTime();
        if (isNaN(aDate) && isNaN(bDate)) return 0;
        if (isNaN(aDate)) return 1;
        if (isNaN(bDate)) return -1;
        return sortConfig.direction === 'ascending' ? aDate - bDate : bDate - aDate;
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortConfig.direction === 'ascending'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'ascending' ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });
  }, [filteredCampaigns, sortConfig]);

  // Pagination calculations
  const totalPages = Math.ceil(sortedCampaigns.length / campaignsPerPage);
  const displayedCampaigns = sortedCampaigns.slice(
    (currentPage - 1) * campaignsPerPage,
    currentPage * campaignsPerPage
  );

  // Handle sorting request from clicking on table headers
  const requestSort = (key: keyof Campaign) => {
    let direction: SortDirection = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({
      key,
      direction,
    });
  };

  // RESTORED HANDLER FUNCTIONS:
  const handleViewCampaign = (campaignId: string) => {
    router.push(`/campaigns/${campaignId}`);
  };

  const handleDeleteClick = (campaign: Campaign) => {
    const campaignId = campaign.id.toString();
    console.log(`Preparing to delete campaign: ${campaignId}, type: ${typeof campaign.id}`);
    setCampaignToDelete({
      id: campaignId,
      name: campaign.campaignName,
    });
    setShowDeleteModal(true);
  };

  const executeDeleteCampaign = async () => {
    if (!campaignToDelete) {
      showErrorToast('No campaign selected for deletion.');
      return;
    }
    // The deleteCampaign function already handles API call, toasts, and state updates.
    // It throws an error on failure, which ConfirmDeleteDialog doesn't need to explicitly handle beyond its own processing state.
    // ConfirmDeleteDialog will call onClose, which sets showDeleteModal to false.
    try {
      await deleteCampaign(campaignToDelete.id);
      // Success toast is in deleteCampaign
      // No need to call setShowDeleteModal(false) here, ConfirmDeleteDialog's onClose will handle it.
    } catch (error) {
      // Error toast is in deleteCampaign or caught by it and re-thrown
      // showErrorToast(error instanceof Error ? error.message : 'Failed to delete campaign from dialog');
      // No need to call setShowDeleteModal(false) here, ConfirmDeleteDialog's onClose will handle it.
    }
  };

  const deleteCampaign = async (campaignId: string) => {
    // NOTE: Assumes DELETE /api/campaigns/[campaignId] targets CampaignWizard correctly.
    // If not, this endpoint needs to be created/updated.
    try {
      if (!user) {
        toast.error('You must be logged in to delete a campaign');
        throw new Error('Not authenticated');
      }
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (response.status === 401) {
        throw new Error('Authentication failed when deleting campaign');
      }

      let data = { success: false, message: 'Unknown delete error' };
      try {
        data = await response.json();
      } catch (jsonError) {
        if (!response.ok && response.status !== 404) {
          // Don't throw if 404, handle below
          throw new Error(
            `Failed to delete campaign: Server returned non-JSON response with status ${response.status}`
          );
        }
        // If 404 or OK with no body, proceed
        data.success = response.ok || response.status === 404;
        data.message = response.status === 404 ? 'Campaign not found' : 'Campaign deleted';
      }

      if (response.status === 404) {
        console.warn('Campaign not found during deletion (404):', campaignId);
        toast.success('Campaign already removed');
        // Still update UI and trigger refetch
      } else if (!response.ok) {
        console.error('Delete campaign error:', data);
        throw new Error(data.message || `Failed to delete campaign: ${response.status}`);
      }

      // Update local state optimistically or after success
      setCampaigns(prevCampaigns =>
        prevCampaigns.filter(campaign => campaign.id.toString() !== campaignId)
      );

      // Trigger refetch to ensure consistency
      // Use the updated refetchCampaigns which calls the correct list endpoint
      showSuccessToast(
        'Campaign deleted successfully',
        'faTrashCanLight',
        'toast-delete-custom',
        'text-destructive'
      );
      setTimeout(() => {
        refetchCampaigns();
      }, 500); // Short delay

      return data;
    } catch (error) {
      console.error('Error in deleteCampaign function:', error);
      throw error; // Re-throw to be caught by confirmDelete
    }
  };

  // Helper to get status color and text
  const getStatusInfo = (status: CampaignStatusKey | null | undefined) => {
    const normalizedStatus = (status || '').toLowerCase();
    switch (normalizedStatus) {
      case 'draft':
        return { class: 'bg-muted text-muted-foreground', text: 'Draft' }; // Grey
      case 'submitted_final': // Handle SUBMITTED_FINAL from backend
      case 'submitted': // Allow filtering by "submitted"
        return { class: 'bg-warning text-warning-foreground', text: 'Submitted' }; // Yellow
      case 'active':
        return { class: 'bg-success text-success-foreground', text: 'Active' }; // Green
      case 'approved':
        return { class: 'bg-success text-success-foreground', text: 'Approved' }; // Green
      case 'paused':
        return { class: 'bg-muted text-muted-foreground', text: 'Paused' }; // Grey
      case 'completed':
        return { class: 'bg-accent text-accent-foreground', text: 'Completed' }; // Deep Sky Blue
      // Removed 'review' case
      default:
        const defaultText = status
          ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
          : 'Unknown';
        return { class: 'bg-muted text-muted-foreground', text: defaultText }; // Default to Grey
    }
  };

  // Helper to get the display name for a KPI key
  const getKpiDisplayName = (kpiKey: string): string => {
    if (!kpiKey) return 'N/A';
    const camelCaseKey = kpiKey.toLowerCase().replace(/_([a-z])/g, g => g[1].toUpperCase());
    const kpiOption = KPI_OPTIONS.find(option => option.key === camelCaseKey);
    return kpiOption ? kpiOption.title : kpiKey;
  };

  // --- Restore Local Duplicate Click Handler and Logic ---
  const handleDuplicateClick = (campaign: Campaign) => {
    setCampaignToDuplicate({
      id: campaign.id.toString(),
      name: campaign.campaignName,
    });
    setNewDuplicateName(`Copy of ${campaign.campaignName}`);
    setIsDuplicateDialogOpen(true);
    setNameError(null);
    setIsCheckingName(false);
    setIsDuplicating(false);
  };

  const checkNameExists = async (name: string): Promise<boolean> => {
    if (!isUserLoaded) {
      showErrorToast('Authentication state is not loaded yet. Please wait and try again.');
      return true; // Indicate failure to prevent proceeding
    }
    if (!user) {
      showErrorToast('You must be signed in to perform this action. Please sign in and try again.');
      router.push('/sign-in'); // Optional: redirect to sign-in
      return true; // Indicate failure
    }

    setIsCheckingName(true);
    setNameError(null);
    try {
      // TODO: Use actual API endpoint
      const response = await fetch(`/api/campaigns/check-name?name=${encodeURIComponent(name)}`);
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to check name');
      }
      if (result.exists) {
        setNameError('This campaign name already exists. Please choose another.');
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Failed to check campaign name existence:', error);
      showErrorToast('Could not verify campaign name. Please try again.');
      return true; // Explicitly return true on error
    } finally {
      setIsCheckingName(false);
    }
  };

  const handleDuplicateConfirm = async () => {
    if (!isUserLoaded) {
      showErrorToast('Authentication state is not loaded yet. Please wait and try again.');
      return;
    }
    if (!user) {
      showErrorToast('You must be signed in to duplicate campaigns. Please sign in and try again.');
      router.push('/sign-in'); // Optional: redirect to sign-in
      return;
    }

    if (!campaignToDuplicate) return;
    const trimmedName = newDuplicateName.trim();
    if (!trimmedName) {
      setNameError('Campaign name cannot be empty.');
      return;
    }
    const nameExists = await checkNameExists(trimmedName);
    if (nameExists) return;

    setIsDuplicating(true);
    try {
      const response = await fetch(`/api/campaigns/${campaignToDuplicate.id}/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ newName: trimmedName }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || `Failed to duplicate campaign: ${response.status}`);
      }
      showSuccessToast(
        'Campaign duplicated successfully!',
        'faCircleCheckLight',
        'toast-success-custom',
        'text-success'
      );
      setIsDuplicateDialogOpen(false); // Close dialog
      refetchCampaigns(); // Refresh list
    } catch (error) {
      logger.error('Error duplicating campaign:', error);
      showErrorToast(error instanceof Error ? error.message : 'Failed to duplicate campaign');
    } finally {
      setIsDuplicating(false);
      setCampaignToDuplicate(null); // Clear target
    }
  };
  // --- End Restore Local Duplicate Logic ---

  // Render loading state
  if (isLoadingData && !campaigns.length && !error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <LoadingSkeleton className="h-9 w-1/3" />
          <LoadingSkeleton className="h-10 w-36" />
        </div>
        {/* Correct props for TableSkeleton */}
        <TableSkeleton columns={6} rows={campaignsPerPage} />
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-600">Error: {error}</div>;
  }

  if (isUserLoaded && !user) {
    return <div className="p-4 text-muted-foreground">Please sign in to view campaigns.</div>;
  }

  if (isUserLoaded && user && !orgId && error.includes('organization')) {
    return <div className="p-4 text-center text-muted-foreground">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary">Campaigns</h1>
      </div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-grow">
          <div className="relative w-full md:w-auto md:min-w-[250px]">
            <Icon
              iconId="faMagnifyingGlassLight"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none h-4 w-4"
            />
            <Input
              type="text"
              placeholder="Search campaigns..."
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Search campaigns by name"
              className="pl-10 w-full border-divider h-10"
            />
          </div>

          <Select
            value={objectiveFilter}
            onValueChange={value => {
              setObjectiveFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-full md:w-[150px] border-divider">
              <SelectValue placeholder="Objective" />
            </SelectTrigger>
            <SelectContent>
              {KPI_OPTIONS.map(kpi => (
                <SelectItem key={kpi.key} value={kpi.key}>
                  {kpi.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={statusFilter}
            onValueChange={value => {
              setStatusFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-full md:w-[130px] border-divider">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={startDateFilter}
            onValueChange={value => {
              setStartDateFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-full md:w-[160px] border-divider">
              <SelectValue placeholder="Start Date" />
            </SelectTrigger>
            <SelectContent>
              {uniqueDates.startDates.map(date => (
                <SelectItem key={date} value={date}>
                  {formatDate(date)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={endDateFilter}
            onValueChange={value => {
              setEndDateFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-full md:w-[160px] border-divider">
              <SelectValue placeholder="End Date" />
            </SelectTrigger>
            <SelectContent>
              {uniqueDates.endDates.map(date => (
                <SelectItem key={date} value={date}>
                  {formatDate(date)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center space-x-2 pt-2 md:pt-0">
            <Checkbox
              id="my-campaigns-filter"
              checked={myCampaignsFilter}
              onCheckedChange={checked => setMyCampaignsFilter(Boolean(checked))}
              disabled={!orgId} // Disable if no org is active
            />
            <Label htmlFor="my-campaigns-filter" className="text-sm font-medium whitespace-nowrap">
              Show only my campaigns
            </Label>
          </div>
        </div>

        <div className="flex-shrink-0 w-full md:w-auto md:ml-auto mt-4 md:mt-0">
          <Link href="/campaigns/wizard/step-1">
            <Button
              asChild
              className="bg-accent hover:bg-accent/90 text-white w-full md:w-auto"
              disabled={!orgId || !isAuthLoaded}
              title={!orgId ? 'Select an organization to create a new campaign' : 'New Campaign'}
            >
              <>
                <Icon iconId="faPlusLight" className="-ml-1 mr-2 h-5 w-5" />
                New Campaign
              </>
            </Button>
          </Link>
        </div>
      </div>
      {error && campaigns.length === 0 && (
        <div className="bg-white p-6 text-center text-destructive">{error}</div>
      )}
      {!error && sortedCampaigns.length === 0 && !isLoadingData && (
        <div className="bg-white p-6 text-center">
          No campaigns found. Try adjusting your search criteria or create a new campaign.
        </div>
      )}
      {sortedCampaigns.length > 0 && (
        <>
          <div className="hidden md:block border rounded-lg border-divider overflow-hidden">
            <Table>
              <TableHeader className="bg-background">
                <TableRow>
                  <TableHead
                    className="cursor-pointer text-secondary"
                    onClick={() => requestSort('campaignName')}
                  >
                    Campaign Name
                  </TableHead>
                  <TableHead
                    className="cursor-pointer text-secondary"
                    onClick={() => requestSort('status')}
                  >
                    Status
                  </TableHead>
                  <TableHead
                    className="cursor-pointer text-secondary"
                    onClick={() => requestSort('primaryKPI')}
                  >
                    Objective{' '}
                    {sortConfig?.key === 'primaryKPI' &&
                      (sortConfig.direction === 'ascending' ? '▲' : '▼')}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer text-secondary"
                    onClick={() => requestSort('startDate')}
                  >
                    Start Date
                  </TableHead>
                  <TableHead
                    className="cursor-pointer text-secondary"
                    onClick={() => requestSort('endDate')}
                  >
                    End Date
                  </TableHead>
                  <TableHead className="text-center text-secondary">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedCampaigns.map(campaign => {
                  const statusInfo = getCampaignStatusInfo(campaign.status);
                  return (
                    <TableRow key={campaign.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        <Link
                          href={`/campaigns/${campaign.id}`}
                          className="text-accent hover:underline"
                        >
                          {campaign.campaignName}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.class}`}
                        >
                          {statusInfo.text}
                        </span>
                      </TableCell>
                      <TableCell>{getKpiDisplayName(campaign.primaryKPI)}</TableCell>
                      <TableCell>
                        {campaign.startDate ? formatDate(campaign.startDate) : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {campaign.endDate ? formatDate(campaign.endDate) : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1 justify-center">
                          <IconButtonAction
                            iconBaseName="faEye"
                            hoverColorClass="text-accent"
                            ariaLabel="View campaign"
                            onClick={() => handleViewCampaign(campaign.id.toString())}
                            className="w-8 h-8"
                          />
                          <Link href={`/campaigns/wizard/step-1?id=${campaign.id}`}>
                            <IconButtonAction
                              iconBaseName="faPenToSquare"
                              hoverColorClass="text-accent"
                              ariaLabel="Edit campaign"
                              className="w-8 h-8"
                            />
                          </Link>
                          <IconButtonAction
                            iconBaseName="faCopy"
                            hoverColorClass="text-accent"
                            ariaLabel="Duplicate campaign"
                            onClick={() => handleDuplicateClick(campaign)}
                            className="w-8 h-8"
                          />
                          <IconButtonAction
                            iconBaseName="faTrashCan"
                            hoverColorClass="text-destructive"
                            ariaLabel="Delete campaign"
                            onClick={() => handleDeleteClick(campaign)}
                            className="w-8 h-8"
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="hidden md:flex items-center justify-between mt-4 px-2 py-3 border-t border-divider">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">Show</span>
              <Select
                value={campaignsPerPage.toString()}
                onValueChange={value => {
                  setCampaignsPerPage(Number(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[75px] border-divider">
                  <SelectValue placeholder={campaignsPerPage} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-gray-700">entries</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="border-divider"
              >
                Previous
              </Button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="border-divider"
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
      {campaignToDelete && (
        <ConfirmDeleteDialog
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setCampaignToDelete(null); // Clear selection on close
          }}
          onConfirm={executeDeleteCampaign}
          itemName={campaignToDelete?.name || 'this item'}
        />
      )}
      <Dialog open={isDuplicateDialogOpen} onOpenChange={setIsDuplicateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duplicate Campaign</DialogTitle>
            <DialogDescription>
              Enter a new name for the duplicated campaign (originally "{campaignToDuplicate?.name}
              ").
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <Label htmlFor="duplicate-name">New Campaign Name</Label>
            <Input
              id="duplicate-name"
              value={newDuplicateName}
              onChange={e => {
                setNewDuplicateName(e.target.value);
                if (nameError) setNameError(null);
              }}
              placeholder="Enter new campaign name"
              className={nameError ? 'border-destructive' : ''}
            />
            {isCheckingName && <p className="text-xs text-muted-foreground">Checking name...</p>}
            {nameError && <p className="text-xs text-destructive">{nameError}</p>}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button
                variant="outline"
                onClick={() => setIsDuplicateDialogOpen(false)}
                disabled={isDuplicating}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={handleDuplicateConfirm}
              disabled={
                !isUserLoaded ||
                !user ||
                isDuplicating ||
                isCheckingName ||
                !newDuplicateName.trim() ||
                !!nameError
              }
              className="bg-accent text-primary-foreground hover:bg-accent/90 hover:text-foreground"
            >
              {isDuplicating ? (
                <>
                  <Icon iconId="faCircleNotchLight" className="animate-spin mr-2 h-4 w-4" />{' '}
                  Duplicating...
                </>
              ) : (
                'Duplicate Campaign'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="md:hidden space-y-4">
        {displayedCampaigns.map(campaign => {
          const statusInfo = getCampaignStatusInfo(campaign.status);
          return (
            <div
              key={campaign.id}
              className="bg-white border border-divider rounded-lg p-4 shadow-sm"
            >
              <div className="flex justify-between items-start mb-3">
                <Link href={`/campaigns/${campaign.id}`}>
                  <h3 className="font-semibold text-accent hover:underline">
                    {campaign.campaignName || 'Untitled Campaign'}
                  </h3>
                </Link>
                <span
                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.class}`}
                >
                  {statusInfo.text}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <p className="text-gray-500 mb-1">Objective</p>
                  <p className="font-medium text-gray-900">
                    {campaign.primaryKPI ? getKpiDisplayName(campaign.primaryKPI) : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Start Date</p>
                  <p className="font-medium text-gray-900">
                    {campaign.startDate ? formatDate(campaign.startDate) : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">End Date</p>
                  <p className="font-medium text-gray-900">
                    {campaign.endDate ? formatDate(campaign.endDate) : 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex justify-end space-x-1 border-t border-divider pt-3 mt-3">
                <IconButtonAction
                  iconBaseName="faEye"
                  hoverColorClass="text-accent"
                  ariaLabel="View campaign"
                  onClick={() => handleViewCampaign(campaign.id.toString())}
                  className="w-8 h-8"
                />
                <Link href={`/campaigns/wizard/step-1?id=${campaign.id}`}>
                  <IconButtonAction
                    iconBaseName="faPenToSquare"
                    hoverColorClass="text-accent"
                    ariaLabel="Edit campaign"
                    className="w-8 h-8"
                  />
                </Link>
                <IconButtonAction
                  iconBaseName="faCopy"
                  hoverColorClass="text-accent"
                  ariaLabel="Duplicate campaign"
                  onClick={() => handleDuplicateClick(campaign)}
                  className="w-8 h-8"
                />
                <IconButtonAction
                  iconBaseName="faTrashCan"
                  hoverColorClass="text-destructive"
                  ariaLabel="Delete campaign"
                  onClick={() => handleDeleteClick(campaign)}
                  className="w-8 h-8"
                />
              </div>
            </div>
          );
        })}
        <div className="flex items-center justify-between mt-4 px-2 py-3 border-t border-divider">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="border-divider"
          >
            Previous
          </Button>
          <span className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="border-divider"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};
export default ClientCampaignList;
