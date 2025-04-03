// Updated import paths via tree-shake script - 2025-04-01T17:13:32.198Z
'use client';

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Icon } from '@/components/ui/atoms/icon'
import { useUser } from '@auth0/nextjs-auth0/client';
import { Skeleton } from "@/components/ui/atoms/skeleton";

/**
 * Transforms raw campaign data from API to the Campaign interface format
 * Safely handles different data formats and ensures consistent transformation
 */
const transformCampaignData = (campaign: any): Campaign => {
  // Log the incoming campaign ID for debugging
  console.log(`Campaign ID from API: ${campaign.id}, type: ${typeof campaign.id}`);

  // Debug date formats
  console.log(`Raw startDate from API: ${JSON.stringify(campaign.startDate)}, type: ${typeof campaign.startDate}`);
  console.log(`Raw endDate from API: ${JSON.stringify(campaign.endDate)}, type: ${typeof campaign.endDate}`);

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
    surname: ''
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
    submissionStatus: status as "draft" | "submitted" | "in_review" | "approved" | "active" | "paused" | "completed",
    // Use the first influencer's platform or default to Instagram
    platform: campaign.influencers?.[0]?.platform || 'Instagram' as "Instagram" | "YouTube" | "TikTok",
    startDate: safelyParseDate(campaign.startDate),
    endDate: safelyParseDate(campaign.endDate),
    totalBudget: safelyGetBudgetTotal(campaign.budget),
    primaryKPI: campaign.primaryKPI || '',
    primaryContact: primaryContact,
    createdAt: safelyParseDate(campaign.createdAt),
    audience: {
      locations: campaign.locations || []
    }
  };
};

// KPI options matching Step2Content.tsx
interface KpiOption {
  key: string;
  title: string;
}
const KPI_OPTIONS: KpiOption[] = [{
  key: "adRecall",
  title: "Ad Recall"
}, {
  key: "brandAwareness",
  title: "Brand Awareness"
}, {
  key: "consideration",
  title: "Consideration"
}, {
  key: "messageAssociation",
  title: "Message Association"
}, {
  key: "brandPreference",
  title: "Brand Preference"
}, {
  key: "purchaseIntent",
  title: "Purchase Intent"
}, {
  key: "actionIntent",
  title: "Action Intent"
}, {
  key: "recommendationIntent",
  title: "Recommendation Intent"
}, {
  key: "advocacy",
  title: "Advocacy"
}];
interface Campaign {
  id: string | number; // Handle both string and number IDs
  campaignName: string;
  submissionStatus: "draft" | "in_review" | "approved" | "active" | "submitted" | "paused" | "completed";
  platform: "Instagram" | "YouTube" | "TikTok";
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
type SortDirection = "ascending" | "descending";
const ClientCampaignList: React.FC = () => {
  const {
    user,
    isLoading: userLoading,
    error: userError
  } = useUser();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [objectiveFilter, setObjectiveFilter] = useState("");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
  const [duplicateName, setDuplicateName] = useState("");
  const [deleteInProgress, setDeleteInProgress] = useState(false);
  const router = useRouter();

  // Fetch campaigns from API
  useEffect(() => {
    const fetchCampaigns = async () => {
      setLoading(true);
      try {
        if (!user) {
          throw new Error('Not authenticated');
        }
        const response = await fetch('/api/campaigns', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) {
          throw new Error(`Failed to load campaigns: ${response.status}`);
        }
        const data = await response.json();
        console.log("API Response:", data);
        if (data.success && Array.isArray(data.data)) {
          console.log("Setting campaigns:", data.data);

          // Transform the raw campaign data to match the Campaign interface
          const transformedCampaigns = data.data.map(transformCampaignData);

          // Debug the first campaign's dates if available
          if (transformedCampaigns.length > 0) {
            console.log("Debugging first campaign's dates:");
            const firstCampaign = transformedCampaigns[0];
            console.log(`Campaign: ${firstCampaign.campaignName}`);
            console.log(`Start date: ${firstCampaign.startDate}`);
            console.log(`End date: ${firstCampaign.endDate}`);
          }
          console.log("Transformed campaigns:", transformedCampaigns);
          setCampaigns(transformedCampaigns);
        } else {
          console.log("Invalid data format:", data);
          const errorDetails = !data.success ? "API response indicates failure" : !Array.isArray(data.data) ? `Expected data.data to be an array, got ${typeof data.data}` : "Unknown data format error";
          throw new Error(`Invalid data format received from server: ${errorDetails}`);
        }
      } catch (error) {
        console.error('Error fetching campaigns:', error);
        setError(error instanceof Error ? error.message : 'Failed to load campaigns');
      } finally {
        setLoading(false);
      }
    };
    if (!userLoading && user) {
      fetchCampaigns();
    }
  }, [user, userLoading]);

  // Get unique start and end dates from campaigns
  const uniqueDates = useMemo(() => {
    if (!campaigns || campaigns.length === 0) return {
      startDates: [],
      endDates: []
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
    const startDatesArray = campaigns.filter((campaign) => campaign.startDate).map((campaign) => safelyFormatDate(campaign.startDate)).filter((date): date is string => !!date); // Type guard to ensure we only have strings

    const endDatesArray = campaigns.filter((campaign) => campaign.endDate).map((campaign) => safelyFormatDate(campaign.endDate)).filter((date): date is string => !!date); // Type guard to ensure we only have strings

    const startDatesSet = new Set(startDatesArray);
    const endDatesSet = new Set(endDatesArray);

    // Convert Sets to Arrays and sort
    const startDates = Array.from(startDatesSet).sort();
    const endDates = Array.from(endDatesSet).sort();
    return {
      startDates,
      endDates
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
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error, dateString);
      return 'Invalid date';
    }
  };

  // Filter campaigns based on search text and dropdown filters
  const filteredCampaigns = useMemo(() => {
    if (!campaigns) return [];
    return campaigns.filter((campaign) => {
      if (!campaign) return false;
      const matchesSearch = campaign.campaignName?.toLowerCase()?.includes(search.toLowerCase()) ?? false;
      const matchesStatus = !statusFilter || campaign.submissionStatus === statusFilter;

      // Match primaryKPI with objective filter using KPI_OPTIONS
      const matchesObjective = !objectiveFilter || campaign.primaryKPI === objectiveFilter;

      // Date filters with proper date comparison
      const matchesStartDate = !startDateFilter || campaign.startDate && new Date(campaign.startDate).toISOString().split('T')[0] >= startDateFilter;
      const matchesEndDate = !endDateFilter || campaign.endDate && new Date(campaign.endDate).toISOString().split('T')[0] <= endDateFilter;
      return matchesSearch && matchesStatus && matchesObjective && matchesStartDate && matchesEndDate;
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
      if (sortConfig.key === "startDate" || sortConfig.key === "endDate") {
        const aDate = new Date(aVal as string).getTime();
        const bDate = new Date(bVal as string).getTime();
        return sortConfig.direction === "ascending" ? aDate - bDate : bDate - aDate;
      }

      // Compare strings
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortConfig.direction === "ascending" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }

      // Compare numbers
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortConfig.direction === "ascending" ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });
  }, [filteredCampaigns, sortConfig]);

  // Pagination calculations
  const totalPages = Math.ceil(sortedCampaigns.length / campaignsPerPage);
  const displayedCampaigns = sortedCampaigns.slice((currentPage - 1) * campaignsPerPage, currentPage * campaignsPerPage);

  // Handle sorting request from clicking on table headers
  const requestSort = (key: keyof Campaign) => {
    let direction: SortDirection = "ascending";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({
      key,
      direction
    });
  };

  // Function to refetch campaigns from the server
  const refetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/campaigns', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          // Add cache busting to ensure we get fresh data
          'Cache-Control': 'no-cache'
        }
      });
      if (!response.ok) {
        console.error(`Failed to refresh campaigns: ${response.status}`);
        return;
      }
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        console.log("Refreshed campaigns data:", data.data);

        // Transform the raw campaign data to match the Campaign interface
        const transformedCampaigns = data.data.map(transformCampaignData);
        setCampaigns(transformedCampaigns);
      }
    } catch (error) {
      console.error('Error refreshing campaigns:', error);
    } finally {
      setLoading(false);
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
          credentials: 'include'
        });
      } catch (refreshError) {
        console.warn('Session refresh failed, proceeding with deletion anyway', refreshError);
      }
      console.log(`Sending DELETE request for campaign ID: ${campaignId} (${isUuid ? 'UUID format' : 'numeric format'})`);
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          // Ensure we have the latest auth cookie
          'Cache-Control': 'no-cache'
        },
        credentials: 'include'
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
        setCampaigns((prevCampaigns) => prevCampaigns.filter((campaign) => campaign.id.toString() !== campaignId));

        // Show a more user-friendly message
        toast.success('Campaign removed from list');
        return {
          success: true,
          message: 'Campaign no longer exists'
        };
      }

      // Handle other errors
      if (!response.ok) {
        console.error('Delete campaign error:', data);
        throw new Error(data.error || data.message || `Failed to delete campaign: ${response.status}`);
      }

      // Update local state
      setCampaigns((prevCampaigns) => prevCampaigns.filter((campaign) => campaign.id.toString() !== campaignId));

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
      name: campaign.campaignName
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
          } else if (errorMessage.includes('invalid') && (errorMessage.includes('id') || errorMessage.includes('uuid') || errorMessage.includes('format'))) {
            // Special handling for invalid ID format errors
            console.log('Invalid ID format error detected');
            toast.error('Campaign ID format issue detected. The system will still try to delete the campaign.');

            // Even with invalid format, still remove it from the UI
            setCampaigns((prevCampaigns) => prevCampaigns.filter((campaign) => campaign.id.toString() !== campaignToAction.id));
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
      name: campaign.campaignName
    });
    setDuplicateName(`Copy of ${campaign.campaignName}`);
    setShowDuplicateModal(true);
  };
  const duplicateCampaign = async () => {
    if (!campaignToAction || !duplicateName.trim()) return;
    try {
      setLoading(true);
      const response = await fetch(`/api/campaigns/${campaignToAction.id}/duplicate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          newName: duplicateName.trim()
        })
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
          'Content-Type': 'application/json'
        }
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
      setLoading(false);
    }
  };
  const handleViewCampaign = (campaignId: string) => {
    router.push(`/campaigns/${campaignId}`);
  };
  const resetFilters = () => {
    setSearch("");
    setStatusFilter("");
    setObjectiveFilter("");
    setStartDateFilter("");
    setEndDateFilter("");
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
          text: 'Approved'
        };
      case 'active':
        return {
          class: 'bg-green-100 text-green-800',
          text: 'Active'
        };
      case 'submitted':
        return {
          class: 'bg-green-100 text-green-800',
          text: 'Submitted'
        };
      case 'in_review':
      case 'in-review':
      case 'inreview':
        return {
          class: 'bg-yellow-100 text-yellow-800',
          text: 'In Review'
        };
      case 'paused':
        return {
          class: 'bg-yellow-100 text-yellow-800',
          text: 'Paused'
        };
      case 'completed':
        return {
          class: 'bg-blue-100 text-blue-800',
          text: 'Completed'
        };
      case 'draft':
      default:
        return {
          class: 'bg-gray-100 text-gray-800',
          text: 'Draft'
        };
    }
  };

  // Helper to get KPI display name from key
  const getKpiDisplayName = (kpiKey: string): string => {
    const kpi = KPI_OPTIONS.find((k) => k.key === kpiKey);
    return kpi ? kpi.title : kpiKey;
  };
  return <div className="min-h-screen bg-white px-4 md:px-6 py-6 font-work-sans">
      {/* Header: Title and Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 font-work-sans">
        <h1 className="text-xl md:text-2xl font-bold text-[var(--primary-color)] font-sora">Campaign List View</h1>
        <Link href="/campaigns/wizard/step-1" className="mt-4 md:mt-0 px-5 py-2.5 bg-[var(--accent-color)] text-white rounded text-base font-medium font-work-sans">
          New Campaign
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 font-work-sans">
        {/* Search Bar */}
        <div className="relative w-full md:w-auto md:flex-grow md:max-w-md font-work-sans">
          <input type="text" placeholder="Search campaigns" value={search} onChange={(e) => {
          setSearch(e.target.value);
          setCurrentPage(1);
        }} aria-label="Search campaigns by name" className="border border-[var(--divider-color)] p-2.5 pl-10 rounded w-full focus:outline-none focus:ring-1 focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)] font-work-sans" />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none font-work-sans">
            <Icon iconId="faMagnifyingGlassLight" size="sm"  className="text-[var(--secondary-color)] font-work-sans" />
          </div>
        </div>

        {/* Filter Selection */}
        <div className="flex flex-wrap items-center gap-3 font-work-sans">
          <div className="relative inline-block font-work-sans">
            <select value={objectiveFilter} onChange={(e) => {
            setObjectiveFilter(e.target.value);
            setCurrentPage(1);
          }} aria-label="Filter by objective" className="appearance-none border border-[var(--divider-color)] p-2.5 pr-10 rounded bg-white focus:outline-none focus:ring-1 focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)] font-work-sans">
              <option value="">Objective</option>
              {KPI_OPTIONS.map((kpi) => <option key={kpi.key} value={kpi.key}>{kpi.title}</option>)}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 font-work-sans">
              <Icon iconId="faChevronDownLight" size="sm"  className="text-[var(--secondary-color)] font-work-sans" />
            </div>
          </div>

          <div className="relative inline-block font-work-sans">
            <select value={statusFilter} onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }} aria-label="Filter by status" className="appearance-none border border-[var(--divider-color)] p-2.5 pr-10 rounded bg-white focus:outline-none focus:ring-1 focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)] font-work-sans">
              <option value="">Status</option>
              <option value="approved">Approved</option>
              <option value="active">Active</option>
              <option value="submitted">Submitted</option>
              <option value="in_review">In Review</option>
              <option value="paused">Paused</option>
              <option value="draft">Draft</option>
              <option value="completed">Completed</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 font-work-sans">
              <Icon iconId="faChevronDownLight" size="sm"  className="text-[var(--secondary-color)] font-work-sans" />
            </div>
          </div>

          <div className="relative inline-block font-work-sans">
            <select value={startDateFilter} onChange={(e) => {
            setStartDateFilter(e.target.value);
            setCurrentPage(1);
          }} aria-label="Filter by start date" className="appearance-none border border-[var(--divider-color)] p-2.5 pr-10 rounded bg-white focus:outline-none focus:ring-1 focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)] font-work-sans">
              <option value="">Start Date</option>
              {uniqueDates.startDates.map((date) => <option key={date} value={date}>
                  {formatDate(date)}
                </option>)}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 font-work-sans">
              <Icon iconId="faChevronDownLight" size="sm"  className="text-[var(--secondary-color)] font-work-sans" />
            </div>
          </div>

          <div className="relative inline-block font-work-sans">
            <select value={endDateFilter} onChange={(e) => {
            setEndDateFilter(e.target.value);
            setCurrentPage(1);
          }} aria-label="Filter by end date" className="appearance-none border border-[var(--divider-color)] p-2.5 pr-10 rounded bg-white focus:outline-none focus:ring-1 focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)] font-work-sans">
              <option value="">End Date</option>
              {uniqueDates.endDates.map((date) => <option key={date} value={date}>
                  {formatDate(date)}
                </option>)}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 font-work-sans">
              <Icon iconId="faChevronDownLight" size="sm"  className="text-[var(--secondary-color)] font-work-sans" />
            </div>
          </div>

          <button onClick={resetFilters} className="px-3 py-2.5 bg-[var(--secondary-color)] text-white rounded text-sm font-medium hover:bg-opacity-90 transition-colors font-work-sans">
            Reset Filters
          </button>
        </div>
      </div>

      {/* Loading, Error, or Empty States */}
      {userLoading ?
    <div className="bg-white p-6 rounded-lg border border-gray-200 overflow-hidden font-work-sans">
          <TableSkeleton
        rows={5}
        cols={6}
        hasHeader={true}
        hasFilter={false}
        colWidths={['30%', '15%', '15%', '15%', '15%', '10%']} />

        </div> :
    loading ?
    <div className="bg-white p-6 rounded-lg border border-gray-200 overflow-hidden font-work-sans">
          <TableSkeleton
        rows={8}
        cols={6}
        hasHeader={true}
        hasFilter={false}
        colWidths={['30%', '15%', '15%', '15%', '15%', '10%']} />

        </div> :
    error ?
    <div className="bg-white p-6 text-center text-red-500 font-work-sans">{error}</div> :
    sortedCampaigns.length === 0 ?
    <div className="bg-white p-6 text-center font-work-sans">
          No campaigns found. Try adjusting your search criteria.
        </div> :

    <>
          {/* Campaign Table for Larger Screens */}
          <div className="hidden md:block overflow-hidden rounded-lg border border-[var(--divider-color)] font-work-sans">
            <div className="overflow-x-auto font-work-sans">
              <table className="min-w-full border-collapse">
                <thead className="bg-white border-b border-[var(--divider-color)]">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer font-work-sans" onClick={() => requestSort("campaignName")}>
                      Campaign Name
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer font-work-sans" onClick={() => requestSort("submissionStatus")}>
                      Status
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer font-work-sans" onClick={() => requestSort("primaryKPI")}>
                      Objective
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer font-work-sans" onClick={() => requestSort("startDate")}>
                      Start Date
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer font-work-sans" onClick={() => requestSort("endDate")}>
                      End Date
                    </th>
                    <th scope="col" className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider font-work-sans">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--divider-color)]">
                  {displayedCampaigns.map((campaign, index) => {
                const statusInfo = getStatusInfo(campaign.submissionStatus);
                return <tr key={campaign.id} className="hover:bg-[var(--background-color)]">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link href={`/campaigns/${campaign.id}`}>
                            <span className="text-[var(--accent-color)] hover:underline cursor-pointer font-medium font-work-sans">
                              {campaign.campaignName || 'Untitled Campaign'}
                            </span>
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.class} font-work-sans`}>
                            {statusInfo.text}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {campaign.primaryKPI ? getKpiDisplayName(campaign.primaryKPI) : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {campaign.startDate ? formatDate(campaign.startDate) : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {campaign.endDate ? formatDate(campaign.endDate) : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3 justify-center font-work-sans">
                            <button onClick={() => handleViewCampaign(campaign.id.toString())} className="group text-gray-500 transition-colors font-work-sans" title="View campaign">
                              <Icon iconId="faEyeLight" size="md" />
                            </button>
                            <Link href={`/campaigns/wizard/step-1?id=${campaign.id}`} className="group text-gray-500 transition-colors font-work-sans" title="Edit campaign">
                              <Icon iconId="faPenToSquareLight" size="md" />
                            </Link>
                            <button onClick={() => handleDuplicateClick(campaign)} className="group text-gray-500 transition-colors cursor-pointer font-work-sans" title="Duplicate campaign">
                              <Icon iconId="faCopyLight" size="md" />
                            </button>
                            <button onClick={() => handleDeleteClick(campaign)} className="group text-gray-500 transition-colors cursor-pointer font-work-sans" title="Delete campaign">
                              <Icon iconId="faTrashCanLight" size="md" action="delete" />
                            </button>
                          </div>
                        </td>
                      </tr>;
              })}
                </tbody>
              </table>
            </div>

            {/* Pagination for Desktop */}
            <div className="px-6 py-4 flex items-center justify-between border-t border-[var(--divider-color)] font-work-sans">
              <div className="flex items-center font-work-sans">
                <span className="mr-2 text-sm text-gray-700 font-work-sans">Show</span>
                <select value={campaignsPerPage} onChange={(e) => {
              setCampaignsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }} className="border border-[var(--divider-color)] rounded p-1 text-sm font-work-sans">
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
              <div className="flex items-center space-x-4 font-work-sans">
                <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-4 py-2 text-sm border border-[var(--divider-color)] rounded-md text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--background-color)] transition-colors font-work-sans">
                  Previous
                </button>
                <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0} className="px-4 py-2 text-sm border border-[var(--divider-color)] rounded-md text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--background-color)] transition-colors font-work-sans">
                  Next
                </button>
              </div>
            </div>
          </div>

          {/* Mobile View as Cards */}
          <div className="md:hidden space-y-4 font-work-sans">
            {displayedCampaigns.map((campaign) => {
          const statusInfo = getStatusInfo(campaign.submissionStatus);
          return <div key={campaign.id} className="bg-white border border-[var(--divider-color)] rounded-lg p-5 shadow-sm font-work-sans">
                  <div className="flex justify-between items-start mb-3 font-work-sans">
                    <Link href={`/campaigns/${campaign.id}`}>
                      <h3 className="font-semibold text-[var(--primary-color)] font-sora">
                        {campaign.campaignName || 'Untitled Campaign'}
                      </h3>
                    </Link>
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.class} font-work-sans`}>
                      {statusInfo.text}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm mb-4 font-work-sans">
                    <div className="font-work-sans">
                      <p className="text-gray-500 mb-1 font-work-sans">Objective</p>
                      <p className="font-medium font-work-sans">{campaign.primaryKPI ? getKpiDisplayName(campaign.primaryKPI) : 'N/A'}</p>
                    </div>
                    <div className="font-work-sans">
                      <p className="text-gray-500 mb-1 font-work-sans">Dates</p>
                      <p className="font-medium font-work-sans">
                        {campaign.startDate ? formatDate(campaign.startDate) : 'N/A'} - {campaign.endDate ? formatDate(campaign.endDate) : 'N/A'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 border-t border-[var(--divider-color)] pt-4 font-work-sans">
                    <button onClick={() => handleViewCampaign(campaign.id.toString())} className="group p-1.5 text-gray-500 transition-colors cursor-pointer font-work-sans" title="View campaign">
                      <Icon iconId="faEyeLight" size="md" />
                    </button>
                    <Link href={`/campaigns/wizard/step-1?id=${campaign.id}`} className="group p-1.5 text-gray-500 transition-colors font-work-sans" title="Edit campaign">
                      <Icon iconId="faPenToSquareLight" size="md" />
                    </Link>
                    <button onClick={() => handleDuplicateClick(campaign)} className="group p-1.5 text-gray-500 transition-colors cursor-pointer font-work-sans" title="Duplicate campaign">
                      <Icon iconId="faCopyLight" size="md" />
                    </button>
                    <button onClick={() => handleDeleteClick(campaign)} className="group p-1.5 text-gray-500 transition-colors cursor-pointer font-work-sans" title="Delete campaign">
                      <Icon iconId="faTrashCanLight" size="md" action="delete" />
                    </button>
                  </div>
                </div>;
        })}
            
            {/* Mobile Pagination */}
            <div className="flex justify-between items-center border-t border-[var(--divider-color)] pt-4 mt-6 font-work-sans">
              <span className="text-sm text-gray-600 font-work-sans">
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex space-x-3 font-work-sans">
                <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-3 py-2 text-sm bg-white border border-[var(--divider-color)] rounded-md disabled:opacity-50 disabled:cursor-not-allowed font-work-sans">
                  Previous
                </button>
                <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0} className="px-3 py-2 text-sm bg-white border border-[var(--divider-color)] rounded-md disabled:opacity-50 disabled:cursor-not-allowed font-work-sans">
                  Next
                </button>
              </div>
            </div>
          </div>
        </>
    }

      {/* Delete Confirmation Modal */}
      {showDeleteModal && <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center font-work-sans">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 font-work-sans">
            <div className="flex justify-between items-center mb-4 font-work-sans">
              <h3 className="text-lg font-semibold text-[var(--primary-color)] font-sora">Confirm Deletion</h3>
              <button onClick={() => setShowDeleteModal(false)} className="group text-gray-500 hover:text-gray-700 font-work-sans">
                <Icon iconId="faXmarkLight" size="sm" />
              </button>
            </div>
            
            <div className="mb-6 font-work-sans">
              <p className="mb-2 font-work-sans">Are you sure you want to delete <span className="font-medium font-work-sans">{campaignToAction?.name}</span>?</p>
              <p className="text-red-600 text-sm font-work-sans">This action cannot be undone.</p>
            </div>
            
            <div className="flex justify-end space-x-3 font-work-sans">
              <button onClick={() => setShowDeleteModal(false)} disabled={deleteInProgress} className={`px-4 py-2 border border-[var(--divider-color)] rounded text-gray-700 hover:bg-gray-50 transition-colors ${deleteInProgress ? 'opacity-50 cursor-not-allowed' : ''} font-work-sans`}>
                Cancel
              </button>
              <button onClick={confirmDelete} disabled={deleteInProgress} className={`px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center ${deleteInProgress ? 'opacity-70 cursor-not-allowed' : ''} font-work-sans`}>
                {deleteInProgress ? <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white font-work-sans" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </> : 'Delete'}
              </button>
            </div>
          </div>
        </div>}

      {/* Duplicate Campaign Modal */}
      {showDuplicateModal && <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center font-work-sans">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 font-work-sans">
            <div className="flex justify-between items-center mb-4 font-work-sans">
              <h3 className="text-lg font-semibold text-[var(--primary-color)] font-sora">Duplicate Campaign</h3>
              <button onClick={() => setShowDuplicateModal(false)} className="group text-gray-500 hover:text-gray-700 font-work-sans">
                <Icon iconId="faXmarkLight" size="sm" />
              </button>
            </div>
            
            <div className="mb-6 font-work-sans">
              <label htmlFor="duplicateName" className="block mb-2 text-sm font-medium text-gray-700 font-work-sans">
                Please name the duplicate campaign:
              </label>
              <input type="text" id="duplicateName" value={duplicateName} onChange={(e) => setDuplicateName(e.target.value)} className="w-full p-2.5 border border-[var(--divider-color)] rounded focus:outline-none focus:ring-1 focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)] font-work-sans" placeholder="Enter campaign name" />
            </div>
            
            <div className="flex justify-end space-x-3 font-work-sans">
              <button onClick={() => setShowDuplicateModal(false)} className="px-4 py-2 border border-[var(--divider-color)] rounded text-gray-700 hover:bg-gray-50 transition-colors font-work-sans">
                Cancel
              </button>
              <button onClick={duplicateCampaign} disabled={!duplicateName.trim()} className="px-4 py-2 bg-[var(--accent-color)] text-white rounded hover:bg-opacity-90 transition-colors disabled:bg-opacity-50 disabled:cursor-not-allowed font-work-sans">
                Duplicate
              </button>
            </div>
          </div>
        </div>}
    </div>;
};
export default ClientCampaignList;