"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

// Dummy chart data for demonstration purposes.
const sentimentDistributionData = [
  { name: "Positive", value: 72 },
  { name: "Neutral", value: 20 },
  { name: "Negative", value: 8 },
];

const sentimentOverTimeData = [
  { time: "02 AM", Positive: 50, Neutral: 30, Negative: 20 },
  { time: "06 AM", Positive: 55, Neutral: 25, Negative: 20 },
  { time: "08 AM", Positive: 60, Neutral: 20, Negative: 20 },
  { time: "12 AM", Positive: 72, Neutral: 20, Negative: 8 },
  { time: "02 PM", Positive: 70, Neutral: 20, Negative: 10 },
  { time: "04 PM", Positive: 65, Neutral: 25, Negative: 10 },
  { time: "08 PM", Positive: 60, Neutral: 30, Negative: 10 },
  { time: "12 PM", Positive: 50, Neutral: 35, Negative: 15 },
];

const competitorSentimentData = [
  { name: "Our Brand", value: 72 },
  { name: "Competitor A", value: 64 },
  { name: "Competitor B", value: 52 },
];

const shareOfVoiceData = [
  { name: "Our Brand", value: 52 },
  { name: "Competitor A", value: 44 },
  { name: "Competitor B", value: 35 },
];

const hashtagPerformanceData = {
  hashtag: "#bestcampaign",
  reach: "150K",
  positiveSentiment: "85%",
  conversionRate: "25%",
};

const COLORS = ["#0088FE", "#00C49F", "#FF8042"];

// -------------------------------------------------------------------
// FILTERS COMPONENT
// -------------------------------------------------------------------
interface FiltersProps {
  selectedCampaign: string;
  setSelectedCampaign: (value: string) => void;
  startDate: string;
  setStartDate: (value: string) => void;
  endDate: string;
  setEndDate: (value: string) => void;
  onReset: () => void;
  onApply: () => void;
}
const Filters: React.FC<FiltersProps> = ({
  selectedCampaign,
  setSelectedCampaign,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  onReset,
  onApply,
}) => (
  <div className="flex flex-wrap items-end gap-4 my-4">
    <div className="flex flex-col">
      <label htmlFor="campaign" className="mb-1 font-medium">
        Campaign
      </label>
      <select
        id="campaign"
        value={selectedCampaign}
        onChange={(e) => setSelectedCampaign(e.target.value)}
        className="border p-2 rounded w-64"
        aria-label="Select campaign"
      >
        <option value="">All Campaigns</option>
        <option value="Campaign 1">Campaign 1</option>
        <option value="Campaign 2">Campaign 2</option>
        <option value="Campaign 3">Campaign 3</option>
      </select>
    </div>
    <div className="flex flex-col">
      <label htmlFor="startDate" className="mb-1 font-medium">
        Start Date
      </label>
      <input
        type="date"
        id="startDate"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        className="border p-2 rounded"
        aria-label="Select start date"
      />
    </div>
    <div className="flex flex-col">
      <label htmlFor="endDate" className="mb-1 font-medium">
        End Date
      </label>
      <input
        type="date"
        id="endDate"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        className="border p-2 rounded"
        aria-label="Select end date"
      />
    </div>
    <div className="flex gap-2">
      <button
        onClick={onReset}
        className="w-[150px] h-[45px] bg-[#6C757D] text-white rounded"
        aria-label="Reset Filters"
      >
        Reset Filters
      </button>
      <button
        onClick={onApply}
        className="w-[150px] h-[45px] bg-[#007BFF] text-white rounded"
        aria-label="Apply Filters"
      >
        Apply
      </button>
    </div>
  </div>
);

// -------------------------------------------------------------------
// NAVIGATION TABS COMPONENT
// -------------------------------------------------------------------
interface NavigationTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}
const NavigationTabs: React.FC<NavigationTabsProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { name: "Brand Sentiment Overview", key: "overview" },
    { name: "Competitor Benchmarking", key: "competitor" },
    { name: "Hashtag Performance", key: "hashtag" },
  ];
  return (
    <nav className="flex space-x-4 border-b border-gray-300 mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => setActiveTab(tab.key)}
          className={`py-2 px-4 ${
            activeTab === tab.key ? "font-bold border-b-2 border-blue-500" : "text-blue-500 hover:underline"
          }`}
          aria-current={activeTab === tab.key ? "page" : undefined}
        >
          {tab.name}
        </button>
      ))}
    </nav>
  );
};

// -------------------------------------------------------------------
// CHART COMPONENTS
// -------------------------------------------------------------------

// Sentiment Distribution as Pie Chart
const SentimentPieChart: React.FC<{ data: { name: string; value: number }[] }> = ({ data }) => (
  <PieChart width={300} height={300}>
    <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
      {data.map((entry, index) => (
        <Cell
          key={`cell-${index}`}
          fill={COLORS[index % COLORS.length]}
          aria-label={`${entry.name}: ${entry.value}%`}
        />
      ))}
    </Pie>
    <RechartsTooltip />
    <RechartsLegend />
  </PieChart>
);

// Sentiment Over Time as Line Chart
const SentimentLineChart: React.FC<{ data: any[] }> = ({ data }) => (
  <LineChart width={600} height={300} data={data}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="time" />
    <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
    <RechartsTooltip />
    <RechartsLegend />
    <Line type="monotone" dataKey="Positive" stroke="#0088FE" />
    <Line type="monotone" dataKey="Neutral" stroke="#00C49F" />
    <Line type="monotone" dataKey="Negative" stroke="#FF8042" />
  </LineChart>
);

// Competitor Benchmarking as Bar Chart
const CompetitorBarChart: React.FC<{ data: { name: string; value: number }[] }> = ({ data }) => (
  <BarChart width={600} height={300} data={data}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="name" />
    <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
    <RechartsTooltip />
    <RechartsLegend />
    <Bar dataKey="value" fill="#007BFF" aria-label="Competitor sentiment" />
  </BarChart>
);

// Share of Voice as Bar Chart
const ShareOfVoiceBarChart: React.FC<{ data: { name: string; value: number }[] }> = ({ data }) => (
  <BarChart width={600} height={300} data={data}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="name" />
    <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
    <RechartsTooltip />
    <RechartsLegend />
    <Bar dataKey="value" fill="#00BFFF" aria-label="Share of voice" />
  </BarChart>
);

// -------------------------------------------------------------------
// OTHER DASHBOARD COMPONENTS
// -------------------------------------------------------------------

// Key Insights (AI-generated summary)
const KeyInsights: React.FC<{ insight?: string; error?: string }> = ({ insight, error }) => (
  <div className="border p-4 rounded my-6">
    <h3 className="font-bold mb-2">Key Insights</h3>
    {error ? (
      <p className="text-red-500" aria-live="assertive">
        {error}
      </p>
    ) : (
      <p>
        {insight ||
          "Your recent social campaigns increased positive sentiment by 5%, demonstrating clear brand-building ROI."}
      </p>
    )}
  </div>
);

// Hashtag Performance (displayed as a table)
const HashtagPerformance: React.FC<{
  data: { hashtag: string; reach: string; positiveSentiment: string; conversionRate: string };
}> = ({ data }) => (
  <div className="border p-4 rounded my-6">
    <h3 className="font-bold mb-2">Monitor Hashtags</h3>
    <table className="w-full text-left">
      <thead>
        <tr>
          <th>Hashtag</th>
          <th>Reach</th>
          <th>Positive Sentiment</th>
          <th>Conversion Rate</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{data.hashtag}</td>
          <td>{data.reach}</td>
          <td>{data.positiveSentiment}</td>
          <td>{data.conversionRate}</td>
        </tr>
      </tbody>
    </table>
  </div>
);

// -------------------------------------------------------------------
// MAIN DASHBOARD COMPONENT
// -------------------------------------------------------------------
export default function BrandHealthDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  // Filter state
  const [selectedCampaign, setSelectedCampaign] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterError, setFilterError] = useState("");

  // Dummy flags simulating data availability.
  const sentimentDataAvailable = true; // set to false to simulate missing data
  const competitorDataAvailable = true;
  const hashtagDataAvailable = true;

  const resetFilters = useCallback(() => {
    setSelectedCampaign("");
    setStartDate("");
    setEndDate("");
    setFilterError("");
  }, []);

  const applyFilters = useCallback(() => {
    // Basic validation (in real app, further validation would occur)
    if (!selectedCampaign && !startDate && !endDate) {
      setFilterError("Error: Please select a valid campaign and time range.");
      return;
    }
    setFilterError("");
    // TODO: Update dashboard data based on filters (simulate with alert for now)
    alert("Filters applied!");
  }, [selectedCampaign, startDate, endDate]);

  return (
    <div className="p-6">
      {/* Page Title & Primary Action Buttons */}
      <div className="flex justify-between items-center mb-6">
        <h1
          className="text-2xl font-bold"
          style={{ fontSize: "28px", color: "#333333", textAlign: "left" }}
        >
          Brand Health Monitoring
        </h1>
        <div className="flex gap-4">
          <button
            onClick={resetFilters}
            className="w-[150px] h-[45px] bg-[#6C757D] text-white rounded"
            aria-label="Reset Filters"
          >
            Reset Filters
          </button>
          <button
            onClick={applyFilters}
            className="w-[150px] h-[45px] bg-[#007BFF] text-white rounded"
            aria-label="Apply Filters"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <NavigationTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Filters Section */}
      <Filters
        selectedCampaign={selectedCampaign}
        setSelectedCampaign={setSelectedCampaign}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        onReset={resetFilters}
        onApply={applyFilters}
      />
      {filterError && (
        <p className="text-red-500 my-2" aria-live="assertive">
          {filterError}
        </p>
      )}

      {/* Brand Sentiment Overview */}
      {activeTab === "overview" && (
        <>
          <section className="my-6">
            <h2 className="text-xl font-bold mb-4">Brand Sentiment Overview</h2>
            <p className="mb-4">
              Sentiment scores linked directly to your campaign investments, proving ROI in
              tangible brand terms.
            </p>
            {sentimentDataAvailable ? (
              <SentimentPieChart data={sentimentDistributionData} />
            ) : (
              <p className="text-red-500">
                No sentiment data available. Try selecting a different time period.
              </p>
            )}
          </section>

          {/* Key Insights */}
          <KeyInsights />

          {/* Sentiment Performance Analysis */}
          <section className="my-6">
            <h2 className="text-xl font-bold mb-4">Sentiment Performance Analysis</h2>
            <p className="mb-4">Track sentiment trends over time.</p>
            <SentimentLineChart data={sentimentOverTimeData} />
          </section>
        </>
      )}

      {/* Competitor Benchmarking & Share of Voice */}
      {activeTab === "competitor" && (
        <>
          <section className="my-6">
            <h2 className="text-xl font-bold mb-4">Competitor Benchmarking</h2>
            <p className="mb-4">
              By outperforming Competitor A by 8% in positive sentiment, we confirm that our social
              investment yields tangible competitive advantages.
            </p>
            {competitorDataAvailable ? (
              <CompetitorBarChart data={competitorSentimentData} />
            ) : (
              <p className="text-red-500">
                Error: Unable to load competitor data. Please try again later.
              </p>
            )}
          </section>
          <section className="my-6">
            <h2 className="text-xl font-bold mb-4">Share of Voice</h2>
            {competitorDataAvailable ? (
              <ShareOfVoiceBarChart data={shareOfVoiceData} />
            ) : (
              <p className="text-red-500">
                Error: Unable to load competitor data. Please try again later.
              </p>
            )}
          </section>
        </>
      )}

      {/* Hashtag Performance Analysis */}
      {activeTab === "hashtag" && (
        <section className="my-6">
          <HashtagPerformance
            data={
              hashtagDataAvailable
                ? hashtagPerformanceData
                : { hashtag: "", reach: "", positiveSentiment: "", conversionRate: "" }
            }
          />
          {!hashtagDataAvailable && (
            <p className="text-red-500">
              Error: Unable to retrieve hashtag data. Refresh the page and try again.
            </p>
          )}
        </section>
      )}
    </div>
  );
}
