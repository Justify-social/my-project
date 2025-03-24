"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";

interface Influencer {
  id: number;
  name: string;
  platforms: string[];
  audience: string; // e.g. "35-44, 70% Male, 20% Australia"
  nextSecurityCheckDue: string; // in days (as string)
  riskLevel: "Low" | "Medium" | "High";
  engagement: number; // percentage value from 0 to 100
}

const sampleInfluencers: Influencer[] = [
{
  id: 1,
  name: "Emily Carter",
  platforms: ["Instagram", "TikTok"],
  audience: "35-44, 70% Male, 20% Australia",
  nextSecurityCheckDue: "2",
  riskLevel: "High",
  engagement: 45
},
{
  id: 2,
  name: "Sarah Johnson",
  platforms: ["YouTube", "Twitter"],
  audience: "18-24, 65% Male, 65% UK",
  nextSecurityCheckDue: "12",
  riskLevel: "Low",
  engagement: 30
},
{
  id: 3,
  name: "Michael Green",
  platforms: ["Instagram", "Facebook"],
  audience: "25-34, 72% Female, 53% US",
  nextSecurityCheckDue: "5",
  riskLevel: "Medium",
  engagement: 55
},
{
  id: 4,
  name: "David Martinez",
  platforms: ["TikTok"],
  audience: "18-24, 65% Male, 65% UK",
  nextSecurityCheckDue: "8",
  riskLevel: "Low",
  engagement: 65
}
// Additional sample entries can be added here
];

export default function InfluencerListView() {
  const router = useRouter();

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState("");
  const [riskFilter, setRiskFilter] = useState("");
  const [minEngagement, setMinEngagement] = useState<number>(0);
  const [maxEngagement, setMaxEngagement] = useState<number>(100);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const influencersPerPage = 10;

  const resetFilters = () => {
    setSearchQuery("");
    setPlatformFilter("");
    setRiskFilter("");
    setMinEngagement(0);
    setMaxEngagement(100);
    setCurrentPage(1);
  };

  const filteredInfluencers = useMemo(() => {
    return sampleInfluencers.filter((inf) => {
      const matchesSearch = inf.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPlatform = platformFilter ? inf.platforms.includes(platformFilter) : true;
      const matchesRisk = riskFilter ? inf.riskLevel === riskFilter : true;
      const matchesEngagement = inf.engagement >= minEngagement && inf.engagement <= maxEngagement;
      return matchesSearch && matchesPlatform && matchesRisk && matchesEngagement;
    });
  }, [searchQuery, platformFilter, riskFilter, minEngagement, maxEngagement]);

  const totalPages = Math.ceil(filteredInfluencers.length / influencersPerPage);
  const currentInfluencers = filteredInfluencers.slice(
    (currentPage - 1) * influencersPerPage,
    currentPage * influencersPerPage
  );

  // Helper to determine risk colour
  const getRiskColor = (risk: "Low" | "Medium" | "High") => {
    if (risk === "High") return "#DC3545"; // Red
    if (risk === "Medium") return "#FFC107"; // Orange
    return "#28A745"; // Green
  };

  return (
    <div className="p-6 font-work-sans">
      {/* Page Title */}
      <h1 className="text-2xl font-bold text-[#333333] mb-4 font-sora">Influencer Safety</h1>

      {/* Reset Filters Button */}
      <div className="mb-4 font-work-sans">
        <button
          onClick={resetFilters}
          className="w-[150px] h-[45px] bg-[#6C757D] text-white rounded font-work-sans"
          aria-label="Reset all filters">

          Reset Filters
        </button>
      </div>

      {/* Search and Filter Options */}
      <div className="mb-6 space-y-4 font-work-sans">
        {/* Search Bar */}
        <div className="font-work-sans">
          <label htmlFor="search" className="block font-medium mb-1 font-work-sans">
            Search influencers by name
          </label>
          <input
            id="search"
            type="text"
            placeholder="Search influencers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border p-2 rounded w-[400px] font-work-sans"
            aria-label="Search influencers by name" />

        </div>

        {/* Filter Options */}
        <div className="flex space-x-4 font-work-sans">
          <div className="font-work-sans">
            <label htmlFor="platform" className="block font-medium mb-1 font-work-sans">
              Platform
            </label>
            <select
              id="platform"
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="border p-2 rounded w-[200px] font-work-sans"
              aria-label="Filter influencers by platform">

              <option value="">All</option>
              <option value="Instagram">Instagram</option>
              <option value="TikTok">TikTok</option>
              <option value="YouTube">YouTube</option>
              <option value="Twitter">Twitter</option>
              <option value="Facebook">Facebook</option>
            </select>
          </div>
          <div className="font-work-sans">
            <label htmlFor="risk" className="block font-medium mb-1 font-work-sans">
              Risk Level
            </label>
            <select
              id="risk"
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="border p-2 rounded w-[200px] font-work-sans"
              aria-label="Filter influencers by risk level">

              <option value="">All</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
          <div className="font-work-sans">
            <label className="block font-medium mb-1 font-work-sans">Engagement Rate (%)</label>
            <div className="flex space-x-2 font-work-sans">
              <input
                type="number"
                min="0"
                max="100"
                value={minEngagement}
                onChange={(e) => setMinEngagement(Number(e.target.value))}
                className="border p-2 rounded w-[90px] font-work-sans"
                aria-label="Minimum engagement rate" />

              <span className="self-center font-work-sans">-</span>
              <input
                type="number"
                min="0"
                max="100"
                value={maxEngagement}
                onChange={(e) => setMaxEngagement(Number(e.target.value))}
                className="border p-2 rounded w-[90px] font-work-sans"
                aria-label="Maximum engagement rate" />

            </div>
          </div>
        </div>
      </div>

      {/* Influencer List Table */}
      <div className="overflow-x-auto mb-6 font-work-sans">
        <table className="min-w-full border">
          <thead>
            <tr>
              <th className="p-2 text-left font-bold border font-work-sans">Name</th>
              <th className="p-2 text-left font-bold border font-work-sans">Platform(s)</th>
              <th className="p-2 text-left font-bold border font-work-sans">Audience Demographics</th>
              <th className="p-2 text-left font-bold border font-work-sans">Next Security Check Due (days)</th>
              <th className="p-2 text-left font-bold border font-work-sans">Risk Assessment Score</th>
            </tr>
          </thead>
          <tbody>
            {currentInfluencers.length > 0 ?
            currentInfluencers.map((inf) =>
            <tr key={inf.id} className="hover:bg-gray-100">
                  <td className="p-2 border">
                    <button
                  onClick={() =>
                  router.push(`/influencers/influencer-list/profile?id=${inf.id}`)
                  }
                  className="text-blue-500 hover:underline font-work-sans"
                  aria-label={`View profile for ${inf.name}`}>

                      {inf.name}
                    </button>
                  </td>
                  <td className="p-2 border">{inf.platforms.join(", ")}</td>
                  <td className="p-2 border">{inf.audience}</td>
                  <td className="p-2 border">{inf.nextSecurityCheckDue} days</td>
                  <td className="p-2 border">
                    <span style={{ color: getRiskColor(inf.riskLevel) }} className="font-work-sans">
                      {inf.riskLevel}
                    </span>
                    {inf.riskLevel === "High" &&
                Number(inf.nextSecurityCheckDue) <= 2 &&
                <span className="ml-2 text-red-500 text-sm font-work-sans">
                          Security check overdue! Immediate review required.
                        </span>
                }
                  </td>
                </tr>
            ) :

            <tr>
                <td colSpan={5} className="p-2 text-center font-work-sans">
                  No influencers found. Try adjusting your search term or filters.
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mb-6 font-work-sans">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50 font-work-sans"
          aria-label="Previous page">

          Previous
        </button>
        <span className="font-work-sans">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50 font-work-sans"
          aria-label="Next page">

          Next
        </button>
      </div>
    </div>);

}