"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Campaign {
  id: number;
  campaignName: string;
  platform: string;
  startDate: string;
  endDate: string;
  totalBudget: number;
  primaryKPI: string;
  submissionStatus: string;
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
        console.log('Fetched campaigns:', data); // Debug log
        
        if (data.success && Array.isArray(data.campaigns)) {
          // Only include submitted campaigns
          const submittedCampaigns = data.campaigns.filter(
            (campaign: Campaign) => campaign.submissionStatus === 'submitted'
          );
          setCampaigns(submittedCampaigns);
        } else {
          setCampaigns([]);
        }
      } catch (error) {
        console.error('Error fetching campaigns:', error);
        setError(error instanceof Error ? error.message : 'Failed to load campaigns');
        setCampaigns([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  const handleCampaignSelection = (campaignId: string) => {
    const selected = campaigns.find((campaign) => campaign.id.toString() === campaignId);
    if (selected) {
      setSelectedCampaign(campaignId);
    }
  };

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
          onChange={(e) => handleCampaignSelection(e.target.value)}
        >
          <option value="" disabled>
            Select a campaign
          </option>
          {campaigns.map((campaign) => (
            <option key={campaign.id} value={campaign.id}>
              {campaign.campaignName} ({campaign.platform})
            </option>
          ))}
        </select>

        {selectedCampaign && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold">Campaign Overview</h3>
            {(() => {
              const campaign = campaigns.find(c => c.id.toString() === selectedCampaign);
              if (!campaign) return null;
              
              return (
                <div className="space-y-2">
                  <div><strong>Campaign Name:</strong> {campaign.campaignName}</div>
                  <div><strong>Platform:</strong> {campaign.platform}</div>
                  <div><strong>Start Date:</strong> {new Date(campaign.startDate).toLocaleDateString()}</div>
                  <div><strong>End Date:</strong> {new Date(campaign.endDate).toLocaleDateString()}</div>
                  <div><strong>Budget:</strong> ${campaign.totalBudget.toLocaleString()}</div>
                  <div><strong>Primary KPI:</strong> {campaign.primaryKPI}</div>
                  <button
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
                    onClick={handleStartTest}
                  >
                    Launch Brand Lift Test
                  </button>
                </div>
              );
            })()}
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
