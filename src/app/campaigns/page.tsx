"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";

interface Campaign {
  id: number;
  name: string;
  objective: string;
  status: "Live" | "Paused" | "Completed";
  startDate: string;
  endDate?: string;
  surveysComplete: string; // e.g., "86%"
  tools: number; // e.g., 150
  kpi: string; // e.g., "24.3% Awareness"
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

  // Fetch campaigns from API
  useEffect(() => {
    async function fetchCampaigns() {
      try {
        const res = await fetch("/api/campaigns");
        if (!res.ok) {
          throw new Error("Failed to fetch campaigns");
        }
        const data = await res.json();
        setCampaigns(data);
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

  // Handle campaign deletion with confirmation
  const handleDeleteCampaign = async (id: number) => {
    if (!confirm("Are you sure you want to delete this campaign?")) return;
    try {
      const res = await fetch(`/api/campaigns/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCampaigns((prev) => prev.filter((c) => c.id !== id));
      } else {
        alert("Failed to delete campaign");
      }
    } catch (err) {
      alert("Error deleting campaign");
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
          <option value="Paused">Paused</option>
          <option value="Completed">Completed</option>
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
                    onClick={() => requestSort("objective")}
                  >
                    Objective
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
                  <th scope="col" className="px-4 py-2 font-bold">
                    Surveys Complete
                  </th>
                  <th scope="col" className="px-4 py-2 font-bold">
                    Tools
                  </th>
                  <th scope="col" className="px-4 py-2 font-bold">
                    KPI
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
                      <Link href={`/campaigns/${campaign.id}/edit`} legacyBehavior>
                        <a className="text-blue-600 hover:underline">{campaign.name}</a>
                      </Link>
                    </td>
                    <td className="px-4 py-2">{campaign.objective}</td>
                    <td className="px-4 py-2">
                      <span
                        style={{
                          color:
                            campaign.status === "Live"
                              ? "#28a745"
                              : campaign.status === "Paused"
                              ? "#FFC107"
                              : "#6c757d",
                        }}
                      >
                        {campaign.status}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {new Date(campaign.startDate).toLocaleDateString("en-US", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-2">
                      {campaign.endDate
                        ? new Date(campaign.endDate).toLocaleDateString("en-US", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "N/A"}
                    </td>
                    <td className="px-4 py-2">{campaign.surveysComplete}</td>
                    <td className="px-4 py-2">{campaign.tools}</td>
                    <td className="px-4 py-2">{campaign.kpi}</td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <Link href={`/campaigns/${campaign.id}/edit`} legacyBehavior>
                          <a
                            className="text-blue-600 hover:underline"
                            title="Edit Campaign – Modify settings and objectives"
                          >
                            ✏️
                          </a>
                        </Link>
                        <button
                          onClick={() => handleDeleteCampaign(campaign.id)}
                          title="Delete Campaign – This action cannot be undone"
                          aria-label={`Delete campaign ${campaign.name}`}
                          className="text-red-600"
                        >
                          ❌
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
