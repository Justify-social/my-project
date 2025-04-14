// Updated import paths via tree-shake script - 2025-04-01T17:13:32.198Z
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/ui/icon/icon';
import { useUser } from '@clerk/nextjs';
import { LoadingSkeleton, TableSkeleton } from '@/components/ui';
import { Button } from '@/components/ui/button';
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

/**
 * Transforms raw campaign data from API to the Campaign interface format
 * Safely handles different data formats and ensures consistent transformation
 */
const transformCampaignData = (campaign: any): Campaign => {
  // Log the incoming campaign ID for debugging
  console.log(`Campaign ID from API: ${campaign.id}, type: ${typeof campaign.id}`);

  // Debug date formats
  console.log(
    `Raw startDate from API: ${JSON.stringify(campaign.startDate)}, type: ${typeof campaign.startDate}`
  );
  console.log(
    `Raw endDate from API: ${JSON.stringify(campaign.endDate)}, type: ${typeof campaign.endDate}`
  );

  // Helper to safely parse dates from various formats
  const safelyParseDate = (dateValue: any): string => {
    try {
      // Handle null or undefined
      if (!dateValue) return '';

      // Handle empty object case: {}
      if (dateValue && typeof dateValue === 'object' && Object.keys(dateValue).length === 0) {
        return '';
      }

      // Handle null values that might come from the API
      if (dateValue === null) return '';

      // Handle ISO date strings (which is what the API returns)
      if (typeof dateValue === 'string' && dateValue.trim() !== '') {
        // Check if it's a valid date without converting format
        const date = new Date(dateValue);
        if (!isNaN(date.getTime())) {
          // Return the original ISO string as is
          return dateValue;
        }
      }
      return '';
    } catch (error) {
      console.error('Error parsing date:', error, dateValue);
      return '';
    }
  };

  // Helper to safely parse JSON strings
  const safelyParseJSON = (jsonValue: any, defaultValue: any): any => {
    if (typeof jsonValue === 'object' && jsonValue !== null) {
      return jsonValue;
    }
    if (typeof jsonValue === 'string') {
      try {
        return JSON.parse(jsonValue);
      } catch (error) {
        console.error('Error parsing JSON:', error, jsonValue);
      }
    }
    return defaultValue;
  };

  // Helper to safely get budget total
  const safelyGetBudgetTotal = (budget: any): number => {
    if (!budget) return 0;
    try {
      // Already parsed object
      if (typeof budget === 'object') {
        return Number(budget.total || budget.totalBudget || 0);
      }

      // String that needs parsing
      if (typeof budget === 'string') {
        const parsedBudget = JSON.parse(budget);
        return Number(parsedBudget.total || parsedBudget.totalBudget || 0);
      }
      return 0;
    } catch (error) {
      console.error('Error getting budget total:', error, budget);
      return 0;
    }
  };

  // Parse primary contact
  const primaryContact = safelyParseJSON(campaign.primaryContact, {
    firstName: '',
    surname: '',
  });

  // Map the status properly from the database schema (DRAFT, IN_REVIEW, APPROVED, ACTIVE, COMPLETED)
  // to the frontend statuses
  let status;
  if (campaign.status) {
    status = campaign.status.toLowerCase();
  } else {
    status = 'draft';
  }
  return {
    id: campaign.id,
    campaignName: campaign.name || 'Untitled Campaign',
    submissionStatus: status as
      | 'draft'
      | 'submitted'
      | 'in_review'
      | 'approved'
      | 'active'
      | 'paused'
      | 'completed',
    // Use the first influencer's platform or default to Instagram
    platform:
      campaign.influencers?.[0]?.platform || ('Instagram' as 'Instagram' | 'YouTube' | 'TikTok'),
    startDate: safelyParseDate(campaign.startDate),
    endDate: safelyParseDate(campaign.endDate),
    totalBudget: safelyGetBudgetTotal(campaign.budget),
    primaryKPI: campaign.primaryKPI || '',
    primaryContact: primaryContact,
    createdAt: safelyParseDate(campaign.createdAt),
    audience: {
      locations: campaign.locations || [],
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
interface Campaign {
  id: string | number; // Handle both string and number IDs
  campaignName: string;
  submissionStatus:
  | 'draft'
  | 'in_review'
  | 'approved'
  | 'active'
  | 'submitted'
  | 'paused'
  | 'completed';
  platform: 'Instagram' | 'YouTube' | 'TikTok';
  startDate: string;
  endDate: string;
  totalBudget: number;
  primaryKPI: string;
  primaryContact: {
    firstName: string;
    surname: string;
    email?: string;
    position?: string;
  };
  createdAt: string;
  audience?: {
    locations: {
      location: string;
    }[];
  };
}
type SortDirection = 'ascending' | 'descending';
const ClientCampaignList: React.FC = () => {
  const { user, isLoaded } = useUser();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [objectiveFilter, setObjectiveFilter] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
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
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [campaignToAction, setCampaignToAction] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [duplicateName, setDuplicateName] = useState('');
  const [deleteInProgress, setDeleteInProgress] = useState(false);
  const router = useRouter();

  // Fetch campaigns from API
  useEffect(() => {
    const fetchCampaigns = async () => {
      setIsLoadingData(true);
      try {
        const response = await fetch('/api/campaigns', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            throw new Error('Unauthorized to fetch campaigns.');
          }
          throw new Error(`Failed to load campaigns: ${response.status}`);
        }
        const data = await response.json();
        console.log('API Response:', data);
        if (data.success && Array.isArray(data.data)) {
          console.log('Setting campaigns:', data.data);
          const transformedCampaigns = data.data.map(transformCampaignData);
          console.log('Transformed campaigns:', transformedCampaigns);
          setCampaigns(transformedCampaigns);
          setError('');
        } else {
          console.log('Invalid data format:', data);
          const errorDetails = !data.success
            ? 'API response indicates failure'
            : !Array.isArray(data.data)
              ? `Expected data.data to be an array, got ${typeof data.data}`
              : 'Unknown data format error';
          throw new Error(`Invalid data format received from server: ${errorDetails}`);
        }
      } catch (error) {
        console.error('Error fetching campaigns:', error);
        setError(error instanceof Error ? error.message : 'Failed to load campaigns');
      } finally {
        setIsLoadingData(false);
      }
    };
    if (isLoaded && user) {
      fetchCampaigns();
    } else if (isLoaded && !user) {
      setIsLoadingData(false);
    }
  }, [isLoaded, user]);

  // Get unique start and end dates from campaigns
  const uniqueDates = useMemo(() => {
    if (!campaigns || campaigns.length === 0)
      return {
        startDates: [],
        endDates: [],
      };

    // Helper function to safely parse dates
    const safelyFormatDate = (dateValue: any): string | undefined => {
      if (!dateValue) return undefined;
      try {
        // If it's already a Date object
        if (dateValue instanceof Date) {
          return dateValue.toISOString().split('T')[0];
        }

        // Handle string dates
        if (typeof dateValue === 'string') {
          // For ISO strings and other standard formats
          const date = new Date(dateValue);
          // Check if date is valid
          if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0];
          }
        }

        // Handle cases where the date might be a timestamp
        if (typeof dateValue === 'number') {
          const date = new Date(dateValue);
          if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0];
          }
        }
        return undefined;
      } catch (error) {
        console.error('Error parsing date:', error, dateValue);
        return undefined;
      }
    };
    const startDatesArray = campaigns
      .filter(campaign => campaign.startDate)
      .map(campaign => safelyFormatDate(campaign.startDate))
      .filter((date): date is string => !!date); // Type guard to ensure we only have strings

    const endDatesArray = campaigns
      .filter(campaign => campaign.endDate)
      .map(campaign => safelyFormatDate(campaign.endDate))
      .filter((date): date is string => !!date); // Type guard to ensure we only have strings

    const startDatesSet = new Set(startDatesArray);
    const endDatesSet = new Set(endDatesArray);

    // Convert Sets to Arrays and sort
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
      // Parse the ISO date string
      const date = new Date(dateString);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn(`Invalid date format: ${dateString}`);
        return 'Invalid date';
      }

      // Format the date for display
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
      const matchesStatus = !statusFilter || campaign.submissionStatus === statusFilter;

      // Match primaryKPI with objective filter using KPI_OPTIONS
      const matchesObjective = !objectiveFilter || campaign.primaryKPI === objectiveFilter;

      // Date filters with proper date comparison
      const matchesStartDate =
        !startDateFilter ||
        (campaign.startDate &&
          new Date(campaign.startDate).toISOString().split('T')[0] >= startDateFilter);
      const matchesEndDate =
        !endDateFilter ||
        (campaign.endDate &&
          new Date(campaign.endDate).toISOString().split('T')[0] <= endDateFilter);
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

      // Add null checks
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      // Sort dates by converting to timestamps
      if (sortConfig.key === 'startDate' || sortConfig.key === 'endDate') {
        const aDate = new Date(aVal as string).getTime();
        const bDate = new Date(bVal as string).getTime();
        return sortConfig.direction === 'ascending' ? aDate - bDate : bDate - aDate;
      }

      // Compare strings
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortConfig.direction === 'ascending'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      // Compare numbers
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

  // Function to refetch campaigns from the server
  const refetchCampaigns = async () => {
    try {
      setIsLoadingData(true);
      const response = await fetch('/api/campaigns', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add cache busting to ensure we get fresh data
          'Cache-Control': 'no-cache',
        },
      });
      if (!response.ok) {
        console.error(`Failed to refresh campaigns: ${response.status}`);
        return;
      }
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        console.log('Refreshed campaigns data:', data.data);

        // Transform the raw campaign data to match the Campaign interface
        const transformedCampaigns = data.data.map(transformCampaignData);
        setCampaigns(transformedCampaigns);
      }
    } catch (error) {
      console.error('Error refreshing campaigns:', error);
    } finally {
      setIsLoadingData(false);
    }
  };
  const deleteCampaign = async (campaignId: string) => {
    try {
      if (!user) {
        toast.error('You must be logged in to delete a campaign');
        throw new Error('Not authenticated');
      }

      // UUID validation - most campaigns appear to have UUID IDs based on the logs
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const isUuid = uuidRegex.test(campaignId);
      const isNumeric = !isNaN(Number(campaignId));
      if (!isUuid && !isNumeric) {
        console.error(`Invalid ID format (neither UUID nor numeric): ${campaignId}`);
        throw new Error('Invalid campaign ID format');
      }

      // Try to refresh the session before making the delete request
      try {
        await fetch('/api/auth/refresh', {
          method: 'GET',
          credentials: 'include',
        });
      } catch (refreshError) {
        console.warn('Session refresh failed, proceeding with deletion anyway', refreshError);
      }
      console.log(
        `Sending DELETE request for campaign ID: ${campaignId} (${isUuid ? 'UUID format' : 'numeric format'})`
      );
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          // Ensure we have the latest auth cookie
          'Cache-Control': 'no-cache',
        },
        credentials: 'include',
      });

      // Handle authentication errors specifically
      if (response.status === 401) {
        toast.error('Authentication error. Please try logging in again.');
        throw new Error('Authentication failed when deleting campaign');
      }
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('Failed to parse JSON response:', jsonError);
        throw new Error(`Failed to delete campaign: Invalid response from server`);
      }

      // Handle 404 errors specially - treat as success since the campaign is gone anyway
      if (response.status === 404) {
        console.warn('Campaign not found during deletion:', data);

        // Still update the UI to remove the campaign since it's not in the database
        setCampaigns(prevCampaigns =>
          prevCampaigns.filter(campaign => campaign.id.toString() !== campaignId)
        );

        // Show a more user-friendly message
        toast.success('Campaign removed from list');
        return {
          success: true,
          message: 'Campaign no longer exists',
        };
      }

      // Handle other errors
      if (!response.ok) {
        console.error('Delete campaign error:', data);
        throw new Error(
          data.error || data.message || `Failed to delete campaign: ${response.status}`
        );
      }

      // Update local state
      setCampaigns(prevCampaigns =>
        prevCampaigns.filter(campaign => campaign.id.toString() !== campaignId)
      );

      // If the deletion was successful, also trigger a refresh from the server to get the latest data
      if (data.success) {
        console.log(`Campaign deleted successfully from ${data.source || 'database'}`);
        // Refresh the campaigns list after a short delay to ensure the server has processed the deletion
        setTimeout(() => {
          refetchCampaigns();
        }, 1000);
      }
      return data;
    } catch (error) {
      console.error('Error deleting campaign:', error);
      throw error;
    }
  };
  const handleDeleteClick = (campaign: Campaign) => {
    // Convert ID to string in case it's a number
    const campaignId = campaign.id.toString();

    // Log the ID to help debugging
    console.log(`Preparing to delete campaign: ${campaignId}, type: ${typeof campaign.id}`);
    setCampaignToAction({
      id: campaignId,
      name: campaign.campaignName,
    });
    setShowDeleteModal(true);
  };
  const confirmDelete = async () => {
    if (!campaignToAction) return;
    console.log(`Confirming deletion of campaign: ${campaignToAction.id}`);
    try {
      // Don't use toast.promise since we're handling 404s specially
      setDeleteInProgress(true);
      try {
        const result = await deleteCampaign(campaignToAction.id);
        console.log('Delete campaign result:', result);
        toast.success('Campaign deleted successfully');
        setShowDeleteModal(false);
      } catch (error) {
        // Error is already logged in deleteCampaign
        console.log('Delete campaign error details:', error);
        if (error instanceof Error) {
          const errorMessage = error.message.toLowerCase();
          if (errorMessage.includes('not found') || errorMessage.includes('404')) {
            // If campaign wasn't found, still close the modal and show success
            console.log('Handling "not found" error as success');
            toast.success('Campaign removed from list');
            setShowDeleteModal(false);
          } else if (
            errorMessage.includes('invalid') &&
            (errorMessage.includes('id') ||
              errorMessage.includes('uuid') ||
              errorMessage.includes('format'))
          ) {
            // Special handling for invalid ID format errors
            console.log('Invalid ID format error detected');
            toast.error(
              'Campaign ID format issue detected. The system will still try to delete the campaign.'
            );

            // Even with invalid format, still remove it from the UI
            setCampaigns(prevCampaigns =>
              prevCampaigns.filter(campaign => campaign.id.toString() !== campaignToAction.id)
            );
            setShowDeleteModal(false);
          } else {
            // For other errors, show error toast
            toast.error(errorMessage);
          }
        } else {
          toast.error('Failed to delete campaign - unknown error');
        }
      } finally {
        setDeleteInProgress(false);
      }
    } catch (error) {
      console.error('Unhandled error in confirmDelete:', error);
      toast.error('An unexpected error occurred');
      setDeleteInProgress(false);
    }
  };
  const handleDuplicateClick = (campaign: Campaign) => {
    setCampaignToAction({
      id: campaign.id.toString(),
      name: campaign.campaignName,
    });
    setDuplicateName(`Copy of ${campaign.campaignName}`);
    setShowDuplicateModal(true);
  };
  const duplicateCampaign = async () => {
    if (!campaignToAction || !duplicateName.trim()) return;
    try {
      setIsLoadingData(true);
      const response = await fetch(`/api/campaigns/${campaignToAction.id}/duplicate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          newName: duplicateName.trim(),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `Failed to duplicate campaign: ${response.status}`);
      }

      // Refresh campaigns list
      const updatedResponse = await fetch('/api/campaigns', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const updatedData = await updatedResponse.json();
      if (updatedData.success && Array.isArray(updatedData.data)) {
        // Transform the raw campaign data to match the Campaign interface
        const transformedCampaigns = updatedData.data.map(transformCampaignData);
        setCampaigns(transformedCampaigns);
      }
      toast.success('Campaign duplicated successfully');
      setShowDuplicateModal(false);
    } catch (error) {
      console.error('Error duplicating campaign:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to duplicate campaign');
    } finally {
      setIsLoadingData(false);
    }
  };
  const handleViewCampaign = (campaignId: string) => {
    router.push(`/campaigns/${campaignId}`);
  };
  const resetFilters = () => {
    setSearch('');
    setStatusFilter('');
    setObjectiveFilter('');
    setStartDateFilter('');
    setEndDateFilter('');
    setCurrentPage(1);
  };

  // Helper to get status color and text
  const getStatusInfo = (status: string) => {
    // Normalize status to lowercase for case-insensitive matching
    const normalizedStatus = (status || '').toLowerCase();
    switch (normalizedStatus) {
      case 'approved':
        return {
          class: 'bg-green-100 text-green-800',
          text: 'Approved',
        };
      case 'active':
        return {
          class: 'bg-green-100 text-green-800',
          text: 'Active',
        };
      case 'submitted':
        return {
          class: 'bg-green-100 text-green-800',
          text: 'Submitted',
        };
      case 'in_review':
      case 'in-review':
      case 'inreview':
        return {
          class: 'bg-yellow-100 text-yellow-800',
          text: 'In Review',
        };
      case 'paused':
        return {
          class: 'bg-yellow-100 text-yellow-800',
          text: 'Paused',
        };
      case 'completed':
        return {
          class: 'bg-blue-100 text-blue-800',
          text: 'Completed',
        };
      case 'draft':
      default:
        return {
          class: 'bg-gray-100 text-gray-800',
          text: 'Draft',
        };
    }
  };

  // Helper to get KPI display name from key
  const getKpiDisplayName = (kpiKey: string): string => {
    const kpi = KPI_OPTIONS.find(k => k.key === kpiKey);
    return kpi ? kpi.title : kpiKey;
  };

  // Use isLoadingData for rendering loading state
  if (!isLoaded || (isLoadingData && !error)) {
    // Show skeleton if Clerk hasn't loaded OR if we are loading data (and no error occurred yet)
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

  if (isLoaded && !user) {
    return <div className="p-4 text-muted-foreground">Please sign in to view campaigns.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary">Campaigns</h1>
        <Link href="/campaigns/wizard/step-1" passHref>
          <Button>
            <Icon iconId="faPlusLight" className="mr-2 h-4 w-4" />
            New Campaign
          </Button>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-grow">
          <div className="relative w-full md:w-auto md:min-w-[250px]">
            <Icon
              iconId="faMagnifyingGlassLight"
              size="sm"
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
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
              className="pl-10 w-full border-divider"
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
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="in_review">In Review</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
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
        </div>

        <div className="flex-shrink-0 w-full md:w-auto md:ml-auto mt-4 md:mt-0">
          <Link href="/campaigns/wizard/step-1">
            <Button className="bg-accent hover:bg-accent/90 text-white w-full md:w-auto">
              <Icon iconId="faPlusLight" className="-ml-1 mr-2 h-5 w-5" />
              New Campaign
            </Button>
          </Link>
        </div>
      </div>

      {sortedCampaigns.length === 0 ? (
        <div className="bg-white p-6 text-center">
          No campaigns found. Try adjusting your search criteria.
        </div>
      ) : (
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
                    onClick={() => requestSort('submissionStatus')}
                  >
                    Status
                  </TableHead>
                  <TableHead
                    className="cursor-pointer text-secondary"
                    onClick={() => requestSort('primaryKPI')}
                  >
                    Objective
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
                  const statusInfo = getStatusInfo(campaign.submissionStatus);
                  return (
                    <TableRow key={campaign.id} className="hover:bg-gray-50">
                      <TableCell>
                        <Link href={`/campaigns/${campaign.id}`}>
                          <span className="text-accent hover:underline cursor-pointer font-medium">
                            {campaign.campaignName || 'Untitled Campaign'}
                          </span>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.class}`}
                        >
                          {statusInfo.text}
                        </span>
                      </TableCell>
                      <TableCell>
                        {campaign.primaryKPI ? getKpiDisplayName(campaign.primaryKPI) : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {campaign.startDate ? formatDate(campaign.startDate) : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {campaign.endDate ? formatDate(campaign.endDate) : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2 justify-center">
                          <span
                            className="group text-secondary hover:text-accent cursor-pointer p-1"
                            onClick={() => handleViewCampaign(campaign.id.toString())}
                            aria-label="View campaign"
                          >
                            <Icon
                              iconId="faEyeLight"
                              className="group-hover:hidden block w-4 h-4"
                            />
                            <Icon
                              iconId="faEyeSolid"
                              className="hidden group-hover:block w-4 h-4"
                            />
                          </span>
                          <Link
                            href={`/campaigns/wizard/step-1?id=${campaign.id}`}
                            passHref
                            legacyBehavior
                          >
                            <span
                              className="group text-secondary hover:text-accent cursor-pointer p-1"
                              aria-label="Edit campaign"
                            >
                              <Icon
                                iconId="faPenToSquareLight"
                                className="group-hover:hidden block w-4 h-4"
                              />
                              <Icon
                                iconId="faPenToSquareSolid"
                                className="hidden group-hover:block w-4 h-4"
                              />
                            </span>
                          </Link>
                          <span
                            className="group text-secondary hover:text-accent cursor-pointer p-1"
                            onClick={() => handleDuplicateClick(campaign)}
                            aria-label="Duplicate campaign"
                          >
                            <Icon
                              iconId="faCopyLight"
                              className="group-hover:hidden block w-4 h-4"
                            />
                            <Icon
                              iconId="faCopySolid"
                              className="hidden group-hover:block w-4 h-4"
                            />
                          </span>
                          <span
                            className="group text-secondary hover:text-destructive cursor-pointer p-1"
                            onClick={() => handleDeleteClick(campaign)}
                            aria-label="Delete campaign"
                          >
                            <Icon
                              iconId="faTrashCanLight"
                              className="group-hover:hidden block w-4 h-4"
                            />
                            <Icon
                              iconId="faTrashCanSolid"
                              className="hidden group-hover:block w-4 h-4"
                            />
                          </span>
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

      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{' '}
              <span className="font-medium">{campaignToAction?.name}</span>? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              disabled={deleteInProgress}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleteInProgress}>
              {deleteInProgress ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDuplicateModal} onOpenChange={setShowDuplicateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duplicate Campaign</DialogTitle>
            <DialogDescription>Please name the duplicate campaign:</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              id="duplicateName"
              value={duplicateName}
              onChange={e => setDuplicateName(e.target.value)}
              placeholder="Enter campaign name"
              className="border-divider"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDuplicateModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={duplicateCampaign}
              disabled={!duplicateName.trim() || isLoadingData}
              className="bg-interactive hover:bg-interactive/90 text-white"
            >
              {isLoadingData ? 'Duplicating...' : 'Duplicate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="md:hidden space-y-4">
        {displayedCampaigns.map(campaign => {
          const statusInfo = getStatusInfo(campaign.submissionStatus);
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

              <div className="flex justify-end space-x-2 border-t border-divider pt-3 mt-3">
                <span
                  className="group text-secondary hover:text-accent cursor-pointer p-1"
                  onClick={() => handleViewCampaign(campaign.id.toString())}
                  aria-label="View campaign"
                >
                  <Icon iconId="faEyeLight" className="group-hover:hidden block w-4 h-4" />
                  <Icon iconId="faEyeSolid" className="hidden group-hover:block w-4 h-4" />
                </span>
                <Link href={`/campaigns/wizard/step-1?id=${campaign.id}`} passHref legacyBehavior>
                  <span
                    className="group text-secondary hover:text-accent cursor-pointer p-1"
                    aria-label="Edit campaign"
                  >
                    <Icon
                      iconId="faPenToSquareLight"
                      className="group-hover:hidden block w-4 h-4"
                    />
                    <Icon
                      iconId="faPenToSquareSolid"
                      className="hidden group-hover:block w-4 h-4"
                    />
                  </span>
                </Link>
                <span
                  className="group text-secondary hover:text-accent cursor-pointer p-1"
                  onClick={() => handleDuplicateClick(campaign)}
                  aria-label="Duplicate campaign"
                >
                  <Icon iconId="faCopyLight" className="group-hover:hidden block w-4 h-4" />
                  <Icon iconId="faCopySolid" className="hidden group-hover:block w-4 h-4" />
                </span>
                <span
                  className="group text-secondary hover:text-destructive cursor-pointer p-1"
                  onClick={() => handleDeleteClick(campaign)}
                  aria-label="Delete campaign"
                >
                  <Icon iconId="faTrashCanLight" className="group-hover:hidden block w-4 h-4" />
                  <Icon iconId="faTrashCanSolid" className="hidden group-hover:block w-4 h-4" />
                </span>
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
