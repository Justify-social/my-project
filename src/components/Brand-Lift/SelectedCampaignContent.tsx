"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Define interfaces for better type safety
interface Contact {
  firstName: string;
  surname: string;
  email: string;
  position: string;
}

interface Overview {
  businessGoal: string;
  startDate: string;
  endDate: string;
  timeZone: string;
  primaryContact: Contact;
}

interface Objectives {
  mainMessage: string;
  hashtags?: string;
  memorability: string;
  keyBenefits: string;
}

interface TestResult {
  testName: string;
  status: string;
  date: string;
  kpi?: string;
  surveyCompletions: number;
}

interface CampaignDetails {
  id: number;
  name: string;
  status: string;
  kpi: string;
  platforms?: string[];
  overview?: Overview;
  objectives?: Objectives;
  recentTests?: TestResult[];
}

// Function to fetch campaign details using the provided campaignId.
const fetchCampaignDetails = async (campaignId: string): Promise<CampaignDetails | null> => {
  try {
    const response = await fetch(`/api/campaigns/${campaignId}`);
    if (!response.ok) throw new Error("Failed to fetch campaign details");
    return await response.json();
  } catch (error) {
    console.error("Error fetching campaign details:", error);
    return null;
  }
};

export default function SelectedCampaignContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const campaignId = searchParams.get("campaignId");

  const [campaignDetails, setCampaignDetails] = useState<CampaignDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!campaignId) {
      setError("Campaign ID is missing");
      setLoading(false);
      return;
    }

    const loadDetails = async () => {
      setLoading(true);
      const details = await fetchCampaignDetails(campaignId);
      if (!details) {
        setError("Failed to fetch campaign details");
      } else {
        setCampaignDetails(details);
      }
      setLoading(false);
    };

    loadDetails();
  }, [campaignId]);

  if (loading) return <div>Loading campaign details...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!campaignDetails) return <div>No campaign details available.</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header Section */}
      <h1 className="text-3xl font-semibold text-[#333]">
        Brand Lift - {campaignDetails.name}
      </h1>
      <p className="text-lg text-gray-600">
        Below is a summary of your campaign as configured in the wizard.
      </p>

      {/* Campaign Overview */}
      <div className="border p-4 rounded-lg bg-white shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Campaign Overview</h2>
        <div className="mb-2">
          <strong>Campaign Name:</strong> {campaignDetails.name}
        </div>
        <div className="mb-2">
          <strong>Status:</strong> {campaignDetails.status}
        </div>
        <div className="mb-2">
          <strong>Primary KPI:</strong> {campaignDetails.kpi}
        </div>
        <div className="mb-2">
          <strong>Platforms:</strong>{" "}
          {campaignDetails.platforms && campaignDetails.platforms.length > 0
            ? campaignDetails.platforms.join(", ")
            : "No platforms available"}
        </div>
        {campaignDetails.overview && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold">Overview</h3>
            <div>
              <strong>Business Goal:</strong> {campaignDetails.overview.businessGoal}
            </div>
            <div>
              <strong>Start Date:</strong> {campaignDetails.overview.startDate}
            </div>
            <div>
              <strong>End Date:</strong> {campaignDetails.overview.endDate}
            </div>
            <div>
              <strong>Time Zone:</strong> {campaignDetails.overview.timeZone}
            </div>
            <div>
              <strong>Primary Contact:</strong>{" "}
              {campaignDetails.overview.primaryContact.firstName}{" "}
              {campaignDetails.overview.primaryContact.surname} (
              {campaignDetails.overview.primaryContact.email})
            </div>
          </div>
        )}
        {campaignDetails.objectives && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold">Objectives & Messaging</h3>
            <div>
              <strong>Main Message:</strong> {campaignDetails.objectives.mainMessage}
            </div>
            <div>
              <strong>Hashtags:</strong> {campaignDetails.objectives.hashtags || "N/A"}
            </div>
            <div>
              <strong>Memorability:</strong> {campaignDetails.objectives.memorability}
            </div>
            <div>
              <strong>Key Benefits:</strong> {campaignDetails.objectives.keyBenefits}
            </div>
          </div>
        )}
      </div>

      {/* Recent Brand Lift Results */}
      <div className="border p-4 rounded-lg bg-white shadow-sm">
        <h2 className="text-xl font-semibold">Recent Brand Lift Results</h2>
        {campaignDetails.recentTests && campaignDetails.recentTests.length > 0 ? (
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
              {campaignDetails.recentTests.map((test) => (
                <tr key={test.testName} className="border-t">
                  <td className="p-2">{test.testName}</td>
                  <td className="p-2">{test.status}</td>
                  <td className="p-2">{test.date}</td>
                  <td className="p-2">{test.kpi || "N/A"}</td>
                  <td className="p-2">{test.surveyCompletions}</td>
                  <td className="p-2">
                    <button className="text-blue-600 hover:text-blue-800">See Report</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-gray-600 mt-4">No recent results available.</div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="mt-6 space-x-4">
        <button
          onClick={() =>
            router.push(`/campaigns/wizard/step-1?campaignId=${campaignDetails.id}`)
          }
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          Edit Campaign
        </button>
        <button
          onClick={() =>
            router.push(`/brand-lift/survey-design?campaignId=${campaignDetails.id}`)
          }
          className="px-4 py-2 bg-green-600 text-white rounded-md"
        >
          Launch Campaign
        </button>
      </div>
    </div>
  );
} 