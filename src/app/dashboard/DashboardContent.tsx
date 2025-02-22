"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import useSWR from 'swr';

// Import dynamically loaded components and ensure they are exported correctly.
const CalendarUpcoming = dynamic(() => import("../../components/CalendarUpcoming"), {
  ssr: false,
});

// -----------------------
// Helper Components
// -----------------------

// Spinner for loading states
const Spinner: React.FC = () => (
  <div className="flex justify-center items-center py-4">
    <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-blue-500"></div>
  </div>
);

// Toast component for non-blocking notifications
interface ToastProps {
  message: string;
  type?: "error" | "success" | "info";
}
const Toast: React.FC<ToastProps> = ({ message, type = "info" }) => {
  const bgColor =
    type === "error" ? "bg-red-500" : type === "success" ? "bg-green-500" : "bg-blue-500";
  return (
    <div className={`fixed bottom-4 right-4 ${bgColor} text-white px-4 py-2 rounded shadow-lg`}>
      {message}
    </div>
  );
};

// Card component to wrap modules in a modern, "card" style
const Card: React.FC<{ title: string }> = ({ title, children }) => (
  <div className="bg-white shadow-xl rounded-lg p-6">
    <h2 className="text-xl font-semibold mb-4">{title}</h2>
    {children}
  </div>
);

// -----------------------
// Type Definitions
// -----------------------
interface Campaign {
  id: number;
  name: string;
  status: "Live" | "Paused" | "Completed";
  budget?: number;
  usersEngaged?: { current: number; total: number };
  startDate: string;
  endDate?: string;
}

interface Insight {
  title: string;
  description: string;
  actionText: string;
}

interface PerformanceMetrics {
  totalCampaigns: number;
  campaignChange: number;
  surveyResponses: number;
  surveyChange: number;
  liveCampaigns: number;
  liveChange: number;
  creditsAvailable: number;
  creditsChange: number;
}

interface DashboardContentProps {
  user: {
    name?: string;
    email?: string;
    picture?: string;
  };
}

// Update the type to match the API response
interface CampaignsResponse {
  success: boolean;
  campaigns: Campaign[];
  count: number;
  message: string;
}

// -----------------------
// DashboardContent Component
// -----------------------
const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function DashboardContent({ user }: DashboardContentProps) {
  const router = useRouter();
  const [toastMessage, setToastMessage] = useState<string>("");

  // Update the SWR hook to use the correct type
  const { data, error: campaignError } = useSWR<CampaignsResponse>('/api/campaigns', fetcher);

  const isLoadingCampaigns = !data && !campaignError;

  // New Campaign navigation (goes to wizard step-1)
  const handleNewCampaign = () => {
    router.push("/campaigns/wizard/step-1");
  };

  // Dummy Insights & Metrics
  const insights: Insight[] = [
    {
      title: "Youth Momentum: Boosting Performance Among 18-24-Year-Olds",
      description:
        "Campaign 'NextGen Focus: Amplify Impact' is performing 20% better among 18-24-year-olds. Consider allocating more budget to this segment.",
      actionText: "Read",
    },
    {
      title: "Low Engagement on 'NextGen Focus: Amplify Impact'",
      description: "Engagement rate is 15% below average. Consider revising the call-to-action.",
      actionText: "View All Insights",
    },
  ];

  const metrics: PerformanceMetrics = {
    totalCampaigns: 154,
    campaignChange: 10,
    surveyResponses: 3000,
    surveyChange: -81,
    liveCampaigns: 31,
    liveChange: 5,
    creditsAvailable: 135,
    creditsChange: -47,
  };

  const engagementData = [
    { date: "01 Aug", engagement: 20 },
    { date: "05 Aug", engagement: 35 },
    { date: "10 Aug", engagement: 50 },
    { date: "15 Aug", engagement: 45 },
    { date: "20 Aug", engagement: 30 },
    { date: "25 Aug", engagement: 25 },
    { date: "30 Aug", engagement: 20 },
  ];

  // Then, modify the useMemo hook to use the campaigns array from the response
  const upcomingCampaigns = useMemo(() => {
    // Add debug logging
    console.log('Data in useMemo:', data);

    // Safely access the campaigns array
    const campaignsArray = data?.campaigns || [];
    
    return campaignsArray
      .filter(campaign => campaign && campaign.startDate)
      .sort((a, b) => {
        const dateA = new Date(a.startDate).getTime();
        const dateB = new Date(b.startDate).getTime();
        return dateA - dateB;
      })
      .slice(0, 3);
  }, [data]);

  // Add debug logging for the result
  console.log('Upcoming campaigns:', upcomingCampaigns);

  const getRiskColor = (risk: "Low" | "Medium" | "High") => {
    if (risk === "High") return "#DC3545";
    if (risk === "Medium") return "#FFC107";
    return "#28A745";
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), 3000);
  };

  // Combined Social Profiles & Engagement Card
  const SocialAndEngagementCard: React.FC = () => (
    <Card title="Social Profiles & Engagement">
      {/* Social Profiles Table */}
      <div className="mb-4 overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr>
              <th className="p-2 text-left font-bold border">Influencer</th>
              <th className="p-2 text-left font-bold border">Campaign</th>
              <th className="p-2 text-left font-bold border">Engagement</th>
              <th className="p-2 text-left font-bold border">Likes</th>
              <th className="p-2 text-left font-bold border">Comments</th>
            </tr>
          </thead>
          <tbody>
            <tr className="hover:bg-gray-100">
              <td className="p-2 border">Ethan Edge</td>
              <td className="p-2 border">Back to Inspiration</td>
              <td className="p-2 border">3K</td>
              <td className="p-2 border">561</td>
              <td className="p-2 border">12</td>
            </tr>
            <tr className="hover:bg-gray-100">
              <td className="p-2 border">Olivia Wave</td>
              <td className="p-2 border">New Beginnings</td>
              <td className="p-2 border">2K</td>
              <td className="p-2 border">652</td>
              <td className="p-2 border">52</td>
            </tr>
          </tbody>
        </table>
      </div>
      {/* Engagement Over Time Chart */}
      <div className="w-full" style={{ height: "300px" }}>
        <ResponsiveContainer>
          <LineChart data={engagementData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="engagement" stroke="#007BFF" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );

  return (
    <main className="p-6" role="main" aria-label="Dashboard main content">
      {toastMessage && <Toast message={toastMessage} />}

      {/* Header: Only New Campaign Button */}
      <div className="flex justify-end items-center mb-8">
        <button
          onClick={handleNewCampaign}
          className="w-[150px] h-[45px] rounded bg-blue-500 text-white text-sm sm:text-base hover:bg-blue-600 transition-colors duration-150"
          aria-label="New Campaign"
        >
          New Campaign
        </button>
      </div>

      {/* Two-Column Grid for Dashboard Modules (6 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-8">
          <Card title="Upcoming Campaigns">
            <CalendarUpcoming campaigns={data?.campaigns || []} />
          </Card>
          <Card title="Active Campaign Performance">
            {isLoadingCampaigns ? (
              <Spinner />
            ) : campaignError ? (
              <p className="text-red-500">{campaignError}</p>
            ) : data?.campaigns.filter((c) => c.status !== "Completed").length > 0 ? (
              <ul className="space-y-2">
                {data?.campaigns
                  .filter((campaign) => campaign.status !== "Completed")
                  .map((campaign) => (
                    <li
                      key={campaign.id}
                      className="p-2 border rounded flex flex-col sm:flex-row justify-between items-start sm:items-center"
                    >
                      <span className="font-bold">{campaign.name}</span>
                      <span className="text-sm">
                        {campaign.status === "Live" && (
                          <span className="text-green-500">Live</span>
                        )}
                        {campaign.status === "Paused" && (
                          <span className="text-orange-500">Paused</span>
                        )}
                      </span>
                      <span className="text-sm">
                        Budget: $
                        {campaign.budget !== undefined
                          ? campaign.budget.toLocaleString()
                          : "N/A"}
                      </span>
                      <span className="text-sm">
                        Users Engaged:{" "}
                        {campaign.usersEngaged
                          ? campaign.usersEngaged.current
                          : "N/A"}{" "}
                        of {campaign.usersEngaged ? campaign.usersEngaged.total : "N/A"}
                      </span>
                    </li>
                  ))}
              </ul>
            ) : (
              <p>No active campaigns. Start a new campaign now.</p>
            )}
          </Card>
          <Card title="Latest Campaign Insights">
            <div className="space-y-4">
              {insights.map((insight, idx) => (
                <div key={idx} className="p-4 border rounded">
                  <h3 className="font-bold">{insight.title}</h3>
                  <p>{insight.description}</p>
                  <button
                    onClick={() => showToast(`${insight.actionText} clicked`)}
                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-150"
                  >
                    {insight.actionText}
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          <Card title="Campaigns Overview - Last 30 Days">
            <div className="p-2">
              <p>
                Total Campaigns: {metrics.totalCampaigns} (
                {metrics.campaignChange > 0 ? `+${metrics.campaignChange}` : metrics.campaignChange} campaigns)
              </p>
              <p>
                Survey Responses: {metrics.surveyResponses} (
                {metrics.surveyChange > 0 ? `+${metrics.surveyChange}` : metrics.surveyChange} responses)
              </p>
              <p>
                Live Campaigns: {metrics.liveCampaigns} (
                {metrics.liveChange > 0 ? `+${metrics.liveChange}` : metrics.liveChange} more than last month)
              </p>
              <p>
                Credits Available: {metrics.creditsAvailable} (
                {metrics.creditsChange > 0 ? `+${metrics.creditsChange}` : metrics.creditsChange} credits)
              </p>
            </div>
          </Card>

          <SocialAndEngagementCard />

          <Card title="Security Check">
            <p className="mb-4">Maintain safety. Complete your security check on time.</p>
            <button
              onClick={() => showToast("Running security check...")}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-150"
              aria-label="Run security check"
            >
              Run Check
            </button>
          </Card>
        </div>
      </div>
    </main>
  );
}
