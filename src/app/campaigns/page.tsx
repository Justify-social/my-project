"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { 
  TrashIcon, 
  PencilIcon, 
  DocumentDuplicateIcon, 
  EyeIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import { useUser } from '@auth0/nextjs-auth0/client';

// KPI options matching Step2Content.tsx
const KPI_OPTIONS = [
  { key: "adRecall", title: "Ad Recall" },
  { key: "brandAwareness", title: "Brand Awareness" },
  { key: "consideration", title: "Consideration" },
  { key: "messageAssociation", title: "Message Association" },
  { key: "brandPreference", title: "Brand Preference" },
  { key: "purchaseIntent", title: "Purchase Intent" },
  { key: "actionIntent", title: "Action Intent" },
  { key: "recommendationIntent", title: "Recommendation Intent" },
  { key: "advocacy", title: "Advocacy" }
];

interface Campaign {
  id: number;
  campaignName: string;
  submissionStatus: "draft" | "submitted" | "paused" | "completed";
  platform: "Instagram" | "YouTube" | "TikTok";
  startDate: string;
  endDate: string;
  totalBudget: number;
  primaryKPI: string;
  primaryContact: {
    firstName: string;
    surname: string;
  };
  createdAt: string;
  audience?: {
    locations: { location: string }[];
  };
}

type SortDirection = "ascending" | "descending";

const CampaignList: React.FC = () => {
  const { user, isLoading: userLoading, error: userError } = useUser();
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
  const [campaignToAction, setCampaignToAction] = useState<{id: string, name: string} | null>(null);
  const [duplicateName, setDuplicateName] = useState("");
  
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
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to load campaigns: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success && Array.isArray(data.campaigns)) {
          setCampaigns(data.campaigns);
        } else {
          throw new Error('Invalid data format received from server');
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
    if (!campaigns || campaigns.length === 0) return { startDates: [], endDates: [] };
    
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
    
    return { startDates, endDates };
  }, [campaigns]);

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Filter campaigns based on search text and dropdown filters
  const filteredCampaigns = useMemo(() => {
    if (!campaigns) return [];
    
    return campaigns.filter((campaign) => {
      if (!campaign) return false;
      
      const matchesSearch = campaign.campaignName
        ?.toLowerCase()
        ?.includes(search.toLowerCase()) ?? false;
        
      const matchesStatus = !statusFilter || campaign.submissionStatus === statusFilter;
      
      // Match primaryKPI with objective filter using KPI_OPTIONS
      const matchesObjective = !objectiveFilter || 
        campaign.primaryKPI === objectiveFilter;
      
      // Date filters with proper date comparison
      const matchesStartDate = !startDateFilter || 
        (campaign.startDate && new Date(campaign.startDate).toISOString().split('T')[0] >= startDateFilter);
      
      const matchesEndDate = !endDateFilter || 
        (campaign.endDate && new Date(campaign.endDate).toISOString().split('T')[0] <= endDateFilter);
      
      return matchesSearch && matchesStatus && matchesObjective && matchesStartDate && matchesEndDate;
    });
  }, [campaigns, search, statusFilter, objectiveFilter, startDateFilter, endDateFilter]);

  // Sort campaigns based on the active sort configuration
  const sortedCampaigns = useMemo(() => {
    if (!filteredCampaigns || filteredCampaigns.length === 0) return [];
    if (!sortConfig) return filteredCampaigns;

    return [...filteredCampaigns].sort((a, b) => {
      if (!a || !b) return 0;
      
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      
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
        return sortConfig.direction === "ascending"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
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
  const displayedCampaigns = sortedCampaigns.slice(
    (currentPage - 1) * campaignsPerPage,
    currentPage * campaignsPerPage
  );

  // Handle sorting request from clicking on table headers
  const requestSort = (key: keyof Campaign) => {
    let direction: SortDirection = "ascending";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const deleteCampaign = async (campaignId: string) => {
    try {
      if (!user) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Failed to delete campaign: ${response.status}`);
      }

      // Update local state
      setCampaigns(prevCampaigns => 
        prevCampaigns.filter(campaign => campaign.id.toString() !== campaignId)
      );

      return data;
    } catch (error) {
      console.error('Error deleting campaign:', error);
      throw error;
    }
  };

  const handleDeleteClick = (campaign: Campaign) => {
    setCampaignToAction({id: campaign.id.toString(), name: campaign.campaignName});
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!campaignToAction) return;
    
    try {
      await toast.promise(
        deleteCampaign(campaignToAction.id),
        {
          loading: 'Deleting campaign...',
          success: 'Campaign deleted successfully',
          error: (err) => `Error: ${err.message}`
        }
      );
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error in handleDelete:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete campaign');
    }
  };

  const handleDuplicateClick = (campaign: Campaign) => {
    setCampaignToAction({id: campaign.id.toString(), name: campaign.campaignName});
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
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ newName: duplicateName.trim() })
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
      if (updatedData.success && Array.isArray(updatedData.campaigns)) {
        setCampaigns(updatedData.campaigns);
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
    switch(status) {
      case 'submitted':
        return { class: 'bg-green-100 text-green-800', text: 'Live' };
      case 'paused':
        return { class: 'bg-yellow-100 text-yellow-800', text: 'Paused' };
      case 'completed':
        return { class: 'bg-blue-100 text-blue-800', text: 'Completed' };
      default:
        return { class: 'bg-gray-100 text-gray-800', text: 'Draft' };
    }
  };

  // Helper to get KPI display name from key
  const getKpiDisplayName = (kpiKey: string) => {
    const kpi = KPI_OPTIONS.find(k => k.key === kpiKey);
    return kpi ? kpi.title : kpiKey;
  };

  return (
    <div className="min-h-screen bg-white px-4 md:px-6 py-6">
      {/* Header: Title and Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <h1 className="text-xl md:text-2xl font-bold text-[var(--primary-color)]">Campaign List View</h1>
        <Link 
          href="/campaigns/wizard/step-1" 
          className="mt-4 md:mt-0 px-5 py-2.5 bg-[var(--accent-color)] text-white rounded text-base font-medium"
        >
          New Campaign
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        {/* Search Bar */}
        <div className="relative w-full md:w-auto md:flex-grow md:max-w-md">
          <input
            type="text"
            placeholder="Search campaigns"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Search campaigns by name"
            className="border border-[var(--divider-color)] p-2.5 pl-10 rounded w-full focus:outline-none focus:ring-1 focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)]"
          />
          <svg 
            className="absolute left-3 top-3 h-4 w-4 text-gray-500" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Filter Selection */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative inline-block">
            <select
              value={objectiveFilter}
              onChange={(e) => {
                setObjectiveFilter(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter by objective"
              className="appearance-none border border-[var(--divider-color)] p-2.5 pr-10 rounded bg-white focus:outline-none focus:ring-1 focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)]"
            >
              <option value="">Objective</option>
              {KPI_OPTIONS.map(kpi => (
                <option key={kpi.key} value={kpi.key}>{kpi.title}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>

          <div className="relative inline-block">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter by status"
              className="appearance-none border border-[var(--divider-color)] p-2.5 pr-10 rounded bg-white focus:outline-none focus:ring-1 focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)]"
            >
              <option value="">Status</option>
              <option value="submitted">Live</option>
              <option value="paused">Paused</option>
              <option value="draft">Draft</option>
              <option value="completed">Completed</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>

          <div className="relative inline-block">
            <select
              value={startDateFilter}
              onChange={(e) => {
                setStartDateFilter(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter by start date"
              className="appearance-none border border-[var(--divider-color)] p-2.5 pr-10 rounded bg-white focus:outline-none focus:ring-1 focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)]"
            >
              <option value="">Start Date</option>
              {uniqueDates.startDates.map(date => (
                <option key={date} value={date}>
                  {formatDate(date)}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>

          <div className="relative inline-block">
            <select
              value={endDateFilter}
              onChange={(e) => {
                setEndDateFilter(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter by end date"
              className="appearance-none border border-[var(--divider-color)] p-2.5 pr-10 rounded bg-white focus:outline-none focus:ring-1 focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)]"
            >
              <option value="">End Date</option>
              {uniqueDates.endDates.map(date => (
                <option key={date} value={date}>
                  {formatDate(date)}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>

          <button
            onClick={resetFilters}
            className="px-3 py-2.5 bg-[var(--secondary-color)] text-white rounded text-sm font-medium hover:bg-opacity-90 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Loading, Error, or Empty States */}
      {userLoading ? (
        <div className="bg-white p-6 text-center">Loading user...</div>
      ) : loading ? (
        <div className="bg-white p-6 text-center">Loading campaigns...</div>
      ) : error ? (
        <div className="bg-white p-6 text-center text-red-500">{error}</div>
      ) : sortedCampaigns.length === 0 ? (
        <div className="bg-white p-6 text-center">
          No campaigns found. Try adjusting your search criteria.
        </div>
      ) : (
        <>
          {/* Campaign Table for Larger Screens */}
          <div className="hidden md:block overflow-hidden rounded-lg border border-[var(--divider-color)]">
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead className="bg-white border-b border-[var(--divider-color)]">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort("campaignName")}
                    >
                      Campaign Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort("submissionStatus")}
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort("primaryKPI")}
                    >
                      Objective
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort("startDate")}
                    >
                      Start Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort("endDate")}
                    >
                      End Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--divider-color)]">
                  {displayedCampaigns.map((campaign, index) => {
                    const statusInfo = getStatusInfo(campaign.submissionStatus);
                    
                    return (
                      <tr key={campaign.id} className="hover:bg-[var(--background-color)]">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link href={`/campaigns/${campaign.id}`}>
                            <span className="text-[var(--accent-color)] hover:underline cursor-pointer font-medium">
                              {campaign.campaignName || 'Untitled Campaign'}
                            </span>
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.class}`}>
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
                          <div className="flex items-center space-x-3 justify-center">
                            <button 
                              onClick={() => handleViewCampaign(campaign.id.toString())}
                              className="text-gray-500 hover:text-[var(--accent-color)] transition-colors" 
                              title="View campaign"
                            >
                              <EyeIcon className="h-5 w-5" />
                            </button>
                            <Link 
                              href={`/campaigns/wizard/step-1?id=${campaign.id}`}
                              className="text-gray-500 hover:text-[var(--accent-color)] transition-colors"
                              title="Edit campaign"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </Link>
                            <button 
                              onClick={() => handleDuplicateClick(campaign)}
                              className="text-gray-500 hover:text-[var(--accent-color)] transition-colors" 
                              title="Duplicate campaign"
                            >
                              <DocumentDuplicateIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(campaign)}
                              className="text-gray-500 hover:text-red-600 transition-colors"
                              title="Delete campaign"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination for Desktop */}
            <div className="px-6 py-4 flex items-center justify-between border-t border-[var(--divider-color)]">
              <div className="flex items-center">
                <span className="mr-2 text-sm text-gray-700">Show</span>
                <select
                  value={campaignsPerPage}
                  onChange={(e) => {
                    setCampaignsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border border-[var(--divider-color)] rounded p-1 text-sm"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm border border-[var(--divider-color)] rounded-md text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--background-color)] transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="px-4 py-2 text-sm border border-[var(--divider-color)] rounded-md text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--background-color)] transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          {/* Mobile View as Cards */}
          <div className="md:hidden space-y-4">
            {displayedCampaigns.map((campaign) => {
              const statusInfo = getStatusInfo(campaign.submissionStatus);
              
              return (
                <div key={campaign.id} className="bg-white border border-[var(--divider-color)] rounded-lg p-5 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <Link href={`/campaigns/${campaign.id}`}>
                      <h3 className="font-semibold text-[var(--primary-color)]">
                        {campaign.campaignName || 'Untitled Campaign'}
                      </h3>
                    </Link>
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.class}`}>
                      {statusInfo.text}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-gray-500 mb-1">Objective</p>
                      <p className="font-medium">{campaign.primaryKPI ? getKpiDisplayName(campaign.primaryKPI) : 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Dates</p>
                      <p className="font-medium">
                        {campaign.startDate ? formatDate(campaign.startDate) : 'N/A'} - {campaign.endDate ? formatDate(campaign.endDate) : 'N/A'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 border-t border-[var(--divider-color)] pt-4">
                    <button 
                      onClick={() => handleViewCampaign(campaign.id.toString())}
                      className="p-1.5 text-gray-500 hover:text-[var(--accent-color)] transition-colors" 
                      title="View campaign"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    <Link 
                      href={`/campaigns/wizard/step-1?id=${campaign.id}`}
                      className="p-1.5 text-gray-500 hover:text-[var(--accent-color)] transition-colors"
                      title="Edit campaign"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </Link>
                    <button 
                      onClick={() => handleDuplicateClick(campaign)}
                      className="p-1.5 text-gray-500 hover:text-[var(--accent-color)] transition-colors" 
                      title="Duplicate campaign"
                    >
                      <DocumentDuplicateIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(campaign)}
                      className="p-1.5 text-gray-500 hover:text-red-600 transition-colors"
                      title="Delete campaign"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              );
            })}
            
            {/* Mobile Pagination */}
            <div className="flex justify-between items-center border-t border-[var(--divider-color)] pt-4 mt-6">
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex space-x-3">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm bg-white border border-[var(--divider-color)] rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="px-3 py-2 text-sm bg-white border border-[var(--divider-color)] rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[var(--primary-color)]">Confirm Deletion</h3>
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="mb-2">Are you sure you want to delete <span className="font-medium">{campaignToAction?.name}</span>?</p>
              <p className="text-red-600 text-sm">This action cannot be undone.</p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-[var(--divider-color)] rounded text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Duplicate Campaign Modal */}
      {showDuplicateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[var(--primary-color)]">Duplicate Campaign</h3>
              <button 
                onClick={() => setShowDuplicateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mb-6">
              <label htmlFor="duplicateName" className="block mb-2 text-sm font-medium text-gray-700">
                Please name the duplicate campaign:
              </label>
              <input
                type="text"
                id="duplicateName"
                value={duplicateName}
                onChange={(e) => setDuplicateName(e.target.value)}
                className="w-full p-2.5 border border-[var(--divider-color)] rounded focus:outline-none focus:ring-1 focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)]"
                placeholder="Enter campaign name"
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDuplicateModal(false)}
                className="px-4 py-2 border border-[var(--divider-color)] rounded text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={duplicateCampaign}
                disabled={!duplicateName.trim()}
                className="px-4 py-2 bg-[var(--accent-color)] text-white rounded hover:bg-opacity-90 transition-colors disabled:bg-opacity-50 disabled:cursor-not-allowed"
              >
                Duplicate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignList;

