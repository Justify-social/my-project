"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Campaign {
  id: number;
  name: string;
  // ... other campaign properties
}

// MOCK API CALL: Replace this with your real API call.
const fetchCampaignData = async (): Promise<any[]> => {
  try {
    const response = await fetch("/api/campaigns");
    if (!response.ok) throw new Error("Failed to fetch campaigns");
    return await response.json();
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return []; // Return an empty array on error.
  }
};

export default function BrandLiftPage() {
  const [selectedCampaign, setSelectedCampaign] = useState<string>("");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await fetch('/api/campaigns', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success && Array.isArray(data.campaigns)) {
          setCampaigns(data.campaigns);
        } else {
          setCampaigns([]); // Set empty array if no campaigns
        }
      } catch (error) {
        console.error('Error fetching campaigns:', error);
        setError(error instanceof Error ? error.message : 'Failed to load campaigns');
        setCampaigns([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  // When a campaign is chosen, update state (but DO NOT immediately push navigation)
  const handleCampaignSelection = (campaignId: number) => {
    const selected = campaigns.find((campaign) => campaign.id === campaignId);
    if (selected) {
      setSelectedCampaign(selected.name);
    }
  };

  // Only navigate if a valid campaign is selected.
  const handleStartTest = () => {
    if (!selectedCampaign) {
      alert("Please select a campaign first!");
      return;
    }
    router.push(`/brand-lift/selected-campaign?campaignId=${selectedCampaign}`);
  };

  if (loading) return <div>Loading campaigns...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header Section */}
      <h1 className="text-3xl font-semibold text-[#333]">Brand Lift</h1>
      <p className="text-lg text-gray-600">
        Discover how your campaign impacts brand lift and audience perception.
      </p>

      {/* Campaign Selection Section */}
      <div className="border p-4 rounded-lg bg-white shadow-sm">
        <h2 className="text-xl font-semibold">Select a Campaign</h2>
        <select
          className="mt-2 p-2 border rounded-md w-full"
          value={selectedCampaign}
          onChange={(e) => handleCampaignSelection(Number(e.target.value))}
        >
          <option value="" disabled>
            Select a campaign
          </option>
          {Array.isArray(campaigns) && campaigns.map((campaign) => (
            <option key={campaign.id} value={campaign.name}>
              {campaign.name}
            </option>
          ))}
        </select>

        {selectedCampaign && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold">Campaign Overview</h3>
            <div>
              <strong>Campaign Name:</strong> {selectedCampaign}
            </div>
            <button
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md"
              onClick={handleStartTest}
            >
              Launch {selectedCampaign}
            </button>
          </div>
        )}
      </div>

      {/* Recent Brand Lift Results Section */}
      <div className="border p-4 rounded-lg bg-white shadow-sm mt-4">
        <h2 className="text-xl font-semibold">Recent Brand Lift Results</h2>
        <table className="min-w-full mt-4 border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Test Name</th>
              <th className="text-left p-2">Status</th>
              <th className="text-left p-2">Date</th>
              <th className="text-left p-2">KPI</th>
              <th className="text-left p-2">Survey Completions</th>
              <th className="text-left p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* These rows are mocked. In production, replace with dynamic data. */}
            <tr className="border-t">
              <td className="p-2">Test A</td>
              <td className="p-2">Paused</td>
              <td className="p-2">01/05/24</td>
              <td className="p-2">N/A</td>
              <td className="p-2">150</td>
              <td className="p-2">
                <button className="text-blue-600 hover:text-blue-800">See Report</button>
              </td>
            </tr>
            <tr className="border-t">
              <td className="p-2">Test B</td>
              <td className="p-2">Completed</td>
              <td className="p-2">15/04/24</td>
              <td className="p-2">60% Awareness</td>
              <td className="p-2">300</td>
              <td className="p-2">
                <button className="text-blue-600 hover:text-blue-800">See Report</button>
              </td>
            </tr>
            <tr className="border-t">
              <td className="p-2">Test C</td>
              <td className="p-2">Completed</td>
              <td className="p-2">20/03/24</td>
              <td className="p-2">80% Consideration</td>
              <td className="p-2">300</td>
              <td className="p-2">
                <button className="text-blue-600 hover:text-blue-800">See Report</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Bottom Navigation with Progress Bar Placeholder */}
      <div className="flex justify-between items-center mt-6">
        <div className="text-sm text-gray-600">Progress Bar goes here</div>
        <div className="space-x-4">
          <button
            onClick={() => router.push("/campaigns")}
            className="px-4 py-2 bg-gray-500 text-white rounded-md"
          >
            Back
          </button>
          <button
            onClick={handleStartTest}
            className="px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            Start Test
          </button>
        </div>
      </div>
    </div>
  );
}
