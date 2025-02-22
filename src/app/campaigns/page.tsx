"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { TrashIcon } from "@heroicons/react/24/outline";
import { useUser } from '@auth0/nextjs-auth0/client';
import { auth0 } from '@/lib/auth';

interface Campaign {
  id: number;
  campaignName: string;
  submissionStatus: "draft" | "submitted";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const campaignsPerPage = 10;
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Campaign;
    direction: SortDirection;
  } | null>(null);
  const router = useRouter();

  // Updated fetch campaigns from API
  useEffect(() => {
    const fetchCampaigns = async () => {
      setLoading(true);
      try {
        if (!user) {
          throw new Error('Not authenticated');
        }

        console.log('Fetching campaigns...');

        const response = await fetch('/api/campaigns', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
          throw new Error(`Failed to load campaigns: ${response.status}`);
        }

        const data = await response.json();
        console.log('Campaigns data:', data);
        
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

  // Filter campaigns based on search text and dropdown filters
  const filteredCampaigns = useMemo(() => {
    if (!campaigns) return [];
    
    return campaigns.filter((campaign) => {
      if (!campaign) return false;
      
      const matchesSearch = campaign.campaignName
        ?.toLowerCase()
        ?.includes(search.toLowerCase()) ?? false;
        
      const matchesStatus = !statusFilter || campaign.submissionStatus === statusFilter;
      const matchesObjective = !objectiveFilter || campaign.primaryKPI === objectiveFilter;
      
      return matchesSearch && matchesStatus && matchesObjective;
    });
  }, [campaigns, search, statusFilter, objectiveFilter]);

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

      console.log('Deleting campaign:', campaignId); // Debug

      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await response.json();
      console.log('Delete response:', data); // Debug

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

  const handleDelete = async (campaignId: string) => {
    try {
      await toast.promise(
        deleteCampaign(campaignId),
        {
          loading: 'Deleting campaign...',
          success: 'Campaign deleted successfully',
          error: (err) => `Error: ${err.message}`
        }
      );
    } catch (error) {
      console.error('Error in handleDelete:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete campaign');
    }
  };

  return (
    <div className="min-h-screen bg-white p-4">
      {/* Header: Title and "New Campaign" Button in the Top Right */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-[#333333]">Campaign List View</h1>
        <Link href="/campaigns/wizard/step-1" legacyBehavior>
          <a>
            <button
              className="px-4 py-2 rounded border border-blue-500 text-blue-500 text-lg whitespace-nowrap"
              aria-label="New Campaign"
            >
              New Campaign
            </button>
          </a>
        </Link>
      </div>

      {/* Search and Filter Section */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <input
          type="text"
          placeholder="Search campaigns by name"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          aria-label="Search campaigns by name"
          className="border p-2 rounded w-[400px]"
        />
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          aria-label="Filter by status"
          className="border p-2 rounded"
        >
          <option value="">All Status</option>
          <option value="submitted">Submitted</option>
          <option value="draft">Draft</option>
        </select>
        <select
          value={objectiveFilter}
          onChange={(e) => {
            setObjectiveFilter(e.target.value);
            setCurrentPage(1);
          }}
          aria-label="Filter by objective"
          className="border p-2 rounded"
        >
          <option value="">All Objectives</option>
          <option value="Awareness">Awareness</option>
          <option value="Consideration">Consideration</option>
          <option value="Conversion">Conversion</option>
        </select>
      </div>

      {/* Loading, Error, or Empty States */}
      {userLoading ? (
        <p>Loading user...</p>
      ) : loading ? (
        <p>Loading campaigns...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : sortedCampaigns.length === 0 ? (
        <p>No campaigns found. Try adjusting your search criteria.</p>
      ) : (
        <>
          {/* Campaign Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300">
              <thead>
                <tr className="bg-gray-200">
                  <th
                    scope="col"
                    className="px-4 py-2 font-bold cursor-pointer"
                    onClick={() => requestSort("campaignName")}
                  >
                    Campaign Name
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-2 font-bold cursor-pointer"
                    onClick={() => requestSort("platform")}
                  >
                    Platform
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-2 font-bold cursor-pointer"
                    onClick={() => requestSort("submissionStatus")}
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-2 font-bold cursor-pointer"
                    onClick={() => requestSort("startDate")}
                  >
                    Start Date
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-2 font-bold cursor-pointer"
                    onClick={() => requestSort("endDate")}
                  >
                    End Date
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-2 font-bold cursor-pointer"
                    onClick={() => requestSort("totalBudget")}
                  >
                    Budget
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-2 font-bold cursor-pointer"
                    onClick={() => requestSort("primaryKPI")}
                  >
                    Primary KPI
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-2 font-bold cursor-pointer"
                    onClick={() => requestSort("audience.locations.location")}
                  >
                    Location
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-2 font-bold cursor-pointer"
                    onClick={() => requestSort("primaryContact.firstName")}
                  >
                    Contact
                  </th>
                  <th scope="col" className="px-4 py-2 font-bold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {displayedCampaigns.map((campaign, index) => (
                  <tr
                    key={campaign.id}
                    className="border"
                    style={{
                      backgroundColor: index % 2 === 0 ? "#FFFFFF" : "#F9F9F9",
                    }}
                  >
                    <td className="px-4 py-2">
                      <Link href={`/campaigns/${campaign.id}`}>
                        <span className="text-blue-600 hover:underline cursor-pointer">
                          {campaign.campaignName || 'Untitled Campaign'}
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-2">{campaign.platform || 'N/A'}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded-full text-sm ${
                          campaign.submissionStatus === "submitted"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {campaign.submissionStatus === "submitted" ? "Live" : "Draft"}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {campaign.startDate ? new Date(campaign.startDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-4 py-2">
                      {campaign.endDate ? new Date(campaign.endDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-4 py-2">
                      {campaign.totalBudget ? `$${campaign.totalBudget.toLocaleString()}` : 'N/A'}
                    </td>
                    <td className="px-4 py-2">{campaign.primaryKPI || 'N/A'}</td>
                    <td className="px-4 py-2">
                      {campaign.audience?.locations?.map(l => l.location).join(", ") || "N/A"}
                    </td>
                    <td className="px-4 py-2">
                      {campaign.primaryContact ? 
                        `${campaign.primaryContact.firstName} ${campaign.primaryContact.surname}` : 
                        'N/A'
                      }
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <Link href={`/campaigns/${campaign.id}/edit`}>
                          <span className="cursor-pointer text-blue-600">✏️</span>
                        </Link>
                        <button
                          onClick={() => handleDelete(campaign.id.toString())}
                          className="text-red-600 hover:text-red-800"
                          aria-label="Delete campaign"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded border disabled:opacity-50"
              aria-label="Previous page"
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded border disabled:opacity-50"
              aria-label="Next page"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CampaignList;

