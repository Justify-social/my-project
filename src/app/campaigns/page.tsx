"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { TrashIcon } from "@heroicons/react/24/outline";

interface Campaign {
  id: number;
  campaignName: string;
  primaryKPI: string;
  submissionStatus: "draft" | "submitted";
  startDate: string;
  endDate: string;
  platform: "Instagram" | "YouTube" | "TikTok";
  totalBudget: number;
  primaryContact: {
    firstName: string;
    surname: string;
  };
  audience?: {
    locations: { location: string }[];
  };
  creativeAssets: {
    id: number;
    type: string;
  }[];
}

type SortDirection = "ascending" | "descending";

const CampaignList: React.FC = () => {
  // State for campaigns, search/filters, sorting, pagination, and error/loading messages
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
    async function fetchCampaigns() {
      try {
        const res = await fetch("/api/campaigns");
        if (!res.ok) {
          throw new Error("Failed to fetch campaigns");
        }
        const data = await res.json();
        // Transform the data to match the table display
        const transformedData = data.map((campaign: Campaign) => ({
          id: campaign.id,
          name: campaign.campaignName,
          objective: campaign.primaryKPI,
          status: campaign.submissionStatus === "submitted" ? "Live" : "Draft",
          startDate: campaign.startDate,
          endDate: campaign.endDate,
          surveysComplete: "0%", // You might want to calculate this based on your needs
          tools: campaign.creativeAssets?.length || 0,
          kpi: `${campaign.primaryKPI}`,
          platform: campaign.platform,
          budget: campaign.totalBudget,
          location: campaign.audience?.locations?.map(l => l.location).join(", ") || "N/A",
          contactName: `${campaign.primaryContact.firstName} ${campaign.primaryContact.surname}`
        }));
        setCampaigns(transformedData);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    fetchCampaigns();
  }, []);

  // Filter campaigns based on search text and dropdown filters
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((campaign) => {
      const matchesSearch = campaign.name
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesStatus = statusFilter ? campaign.status === statusFilter : true;
      const matchesObjective = objectiveFilter
        ? campaign.objective === objectiveFilter
        : true;
      return matchesSearch && matchesStatus && matchesObjective;
    });
  }, [campaigns, search, statusFilter, objectiveFilter]);

  // Sort campaigns based on the active sort configuration
  const sortedCampaigns = useMemo(() => {
    if (sortConfig !== null) {
      return [...filteredCampaigns].sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];
        // Sort dates by converting to timestamps
        if (sortConfig.key === "startDate" || sortConfig.key === "endDate") {
          const aDate = aVal ? new Date(aVal as string).getTime() : 0;
          const bDate = bVal ? new Date(bVal as string).getTime() : 0;
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
    }
    return filteredCampaigns;
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
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for auth cookies
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete campaign');
      }

      const data = await response.json();
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
          error: (err) => `Failed to delete campaign: ${err.message}`
        }
      );
      
      // Refresh the campaigns list
      router.refresh();
    } catch (error) {
      console.error('Error in handleDelete:', error);
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
          <option value="Live">Live</option>
          <option value="Draft">Draft</option>
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
      {loading ? (
        <p>Loading...</p>
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
                    onClick={() => requestSort("name")}
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
                    onClick={() => requestSort("status")}
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
                    onClick={() => requestSort("budget")}
                  >
                    Budget
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-2 font-bold cursor-pointer"
                    onClick={() => requestSort("kpi")}
                  >
                    Primary KPI
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-2 font-bold cursor-pointer"
                    onClick={() => requestSort("location")}
                  >
                    Location
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-2 font-bold cursor-pointer"
                    onClick={() => requestSort("contactName")}
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
                          {campaign.name}
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-2">{campaign.platform}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded-full text-sm ${
                          campaign.status === "Live"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {campaign.status}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {new Date(campaign.startDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2">
                      {new Date(campaign.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2">
                      ${campaign.budget.toLocaleString()}
                    </td>
                    <td className="px-4 py-2">{campaign.kpi}</td>
                    <td className="px-4 py-2">{campaign.location}</td>
                    <td className="px-4 py-2">{campaign.contactName}</td>
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
