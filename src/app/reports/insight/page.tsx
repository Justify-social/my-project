"use client";
import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  ChangeEvent,
} from "react";
import { useRouter } from "next/navigation";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
  BarChart,
  Bar,
} from "recharts";

// -------------------------------------------------
// Constants & Dummy Data
// -------------------------------------------------
const COLORS = ["#0088FE", "#00C49F", "#FF8042"];

interface Insight {
  id: number;
  title: string;
  description: string;
  status: "new" | "in-progress";
  favourite: boolean;
}

interface AIInsight {
  id: number;
  title: string;
}

const insightsData: Insight[] = [
  {
    id: 1,
    title: "Maximise ROI by Shifting Budget to High-Performing Ads",
    description:
      "Shift 20% of the budget from low-performing ads to those with higher conversion rates to maximise ROI.",
    status: "new",
    favourite: true,
  },
  {
    id: 2,
    title: "Drive Higher Conversions with A/B Tested Landing Pages and CTAs",
    description:
      "Refine landing page content and A/B test CTAs to boost the conversion rate by at least 10%.",
    status: "new",
    favourite: false,
  },
  {
    id: 3,
    title: "Boost Conversion Rates by Refining Landing Page Content and A/B Testing CTAs",
    description:
      "Refine landing page content and A/B test CTAs to increase conversion rates.",
    status: "in-progress",
    favourite: false,
  },
  // More insights can be added...
];

const aiInsightsData: AIInsight[] = [
  { id: 1, title: "Youth Momentum: Boosting Performance Among 18-24-Year-Olds" },
  { id: 2, title: "Brand Elements in Action: Experience Our Impact from the First Moment" },
  { id: 3, title: "Boost Social Media Channel Credit by 20% to Reflect Greater Influence." },
  { id: 4, title: "Increase social media budget by 10% to capitalise on high engagement." },
];

const sentimentDistributionData = [
  { name: "Positive", value: 72 },
  { name: "Neutral", value: 20 },
  { name: "Negative", value: 8 },
];

const sentimentOverTimeData = [
  { time: "02 AM", Positive: 50, Neutral: 30, Negative: 20 },
  { time: "06 AM", Positive: 55, Neutral: 25, Negative: 20 },
  { time: "08 AM", Positive: 60, Neutral: 20, Negative: 20 },
  { time: "12 PM", Positive: 72, Neutral: 20, Negative: 8 },
  { time: "02 PM", Positive: 70, Neutral: 20, Negative: 10 },
  { time: "04 PM", Positive: 65, Neutral: 25, Negative: 10 },
  { time: "08 PM", Positive: 60, Neutral: 30, Negative: 10 },
  { time: "12 AM", Positive: 50, Neutral: 35, Negative: 15 },
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

// -------------------------------------------------
// Subcomponents for Charts & Reports
// -------------------------------------------------

// Navigation Bar
const NavigationBar: React.FC = () => {
  const router = useRouter();
  return (
    <div className="mb-6 border-b border-gray-300">
      <nav className="flex space-x-4">
        <button
          onClick={() => router.push("/reports/insights")}
          className="py-2 px-4 font-bold border-b-2 border-blue-500"
          aria-current="page"
        >
          Insights
        </button>
        <button
          onClick={() => router.push("/reports/performance-reports")}
          className="py-2 px-4 text-blue-500 hover:underline"
        >
          Performance Reports
        </button>
        <button
          onClick={() => router.push("/reports/historical-data")}
          className="py-2 px-4 text-blue-500 hover:underline"
        >
          Historical Data
        </button>
      </nav>
    </div>
  );
};

// Sentiment Distribution as a Pie Chart
const SentimentPieChart: React.FC = () => (
  <div className="w-full h-64 border p-4 rounded" aria-label="Sentiment distribution pie chart">
    <h4 className="font-medium text-center mb-2">Sentiment Distribution</h4>
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={sentimentDistributionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
          {sentimentDistributionData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} aria-label={`${entry.name}: ${entry.value}%`} />
          ))}
        </Pie>
        <RechartsTooltip />
        <RechartsLegend />
      </PieChart>
    </ResponsiveContainer>
  </div>
);

// Sentiment Performance Over Time as a Line Chart
const SentimentLineChart: React.FC = () => (
  <div className="w-full h-80 border p-4 rounded" aria-label="Sentiment over time line chart">
    <h4 className="font-medium text-center mb-2">Sentiment Over Time</h4>
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={sentimentOverTimeData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" />
        <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
        <RechartsTooltip />
        <RechartsLegend />
        <Line type="monotone" dataKey="Positive" stroke="#0088FE" />
        <Line type="monotone" dataKey="Neutral" stroke="#00C49F" />
        <Line type="monotone" dataKey="Negative" stroke="#FF8042" />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

// Competitor Benchmarking as a Bar Chart
const CompetitorBarChart: React.FC = () => (
  <div className="w-full h-64 border p-4 rounded" aria-label="Competitor benchmarking bar chart">
    <h4 className="font-medium text-center mb-2">Competitor Benchmarking</h4>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={competitorSentimentData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
        <RechartsTooltip />
        <RechartsLegend />
        <Bar dataKey="value" fill="#007BFF" />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

// Share of Voice as a Bar Chart
const ShareOfVoiceBarChart: React.FC = () => (
  <div className="w-full h-64 border p-4 rounded" aria-label="Share of voice bar chart">
    <h4 className="font-medium text-center mb-2">Share of Voice</h4>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={shareOfVoiceData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
        <RechartsTooltip />
        <RechartsLegend />
        <Bar dataKey="value" fill="#00BFFF" />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

// Hashtag Performance Report (Displayed as a Report Card)
const HashtagPerformance: React.FC = () => (
  <div className="w-full border p-4 rounded" aria-label="Hashtag performance report">
    <h4 className="font-medium text-center mb-2">Hashtag Performance</h4>
    <div className="text-center">
      <p className="font-bold">{hashtagPerformanceData.hashtag}</p>
      <p>Reach: {hashtagPerformanceData.reach}</p>
      <p>Positive Sentiment: {hashtagPerformanceData.positiveSentiment}</p>
      <p>Conversion Rate: {hashtagPerformanceData.conversionRate}</p>
    </div>
  </div>
);

// Key Insights Section
const KeyInsights: React.FC<{ insight?: string; error?: string }> = ({ insight, error }) => (
  <div className="border p-4 rounded my-6">
    <h3 className="font-bold mb-2">Key Insights</h3>
    {error ? (
      <p className="text-red-500" aria-live="assertive">
        {error}
      </p>
    ) : (
      <p>{insight || "Your recent campaigns increased positive sentiment by 5%, demonstrating clear ROI."}</p>
    )}
  </div>
);

// -------------------------------------------------
// Main Insights Dashboard Component
// -------------------------------------------------
const InsightsSummaryPage: React.FC = () => {
  const router = useRouter();

  // Filter & Pagination State
  const [searchTerm, setSearchTerm] = useState("");
  const [isFavourite, setIsFavourite] = useState(false);
  const [category, setCategory] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dateError, setDateError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [exportError, setExportError] = useState("");

  // Filtering (simulate insights filtering)
  const filteredInsights = useMemo(() => {
    return insightsData.filter((insight) => {
      const matchesSearch = insight.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFavourite = isFavourite ? insight.favourite === true : true;
      const matchesCategory = category
        ? insight.title.toLowerCase().includes(category.toLowerCase())
        : true;
      return matchesSearch && matchesFavourite && matchesCategory;
    });
  }, [searchTerm, isFavourite, category]);

  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredInsights.length / itemsPerPage);
  const paginatedInsights = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredInsights.slice(start, start + itemsPerPage);
  }, [filteredInsights, currentPage]);

  // Validate date range
  useEffect(() => {
    if (startDate && endDate && startDate > endDate) {
      setDateError("Error: Invalid date range. Please select a valid period.");
    } else {
      setDateError("");
    }
  }, [startDate, endDate]);

  // Simulated export function
  const handleExport = useCallback(async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      if (Math.random() > 0.5) throw new Error("Export failed");
      setExportError("");
      alert("Insights report exported successfully!");
    } catch (error) {
      setExportError("Error: Unable to generate insights report. Please try again.");
    }
  }, []);

  const handleResetFilters = useCallback(() => {
    setSearchTerm("");
    setIsFavourite(false);
    setCategory("");
    setStartDate("");
    setEndDate("");
    setDateError("");
    setCurrentPage(1);
  }, []);

  const handlePreviousPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  return (
    <div className="p-6">
      {/* Header: Title and Export Button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#333333]">Reports &gt; Insights</h1>
        <button
          onClick={handleExport}
          className="w-36 h-10 bg-blue-500 text-white rounded hover:bg-blue-600"
          aria-label="Export Insights"
        >
          Export Insights
        </button>
      </div>

      {/* Navigation Bar */}
      <NavigationBar />

      {/* Filters Section */}
      <div className="mb-6">
        <div className="mb-4">
          <label htmlFor="search" className="block mb-1 font-medium">
            Search insights by keywords
          </label>
          <input
            type="text"
            id="search"
            placeholder="Search insights..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            aria-label="Search insights by keyword"
          />
          {searchTerm && filteredInsights.length === 0 && (
            <p className="text-red-500 mt-1">No insights found. Try adjusting your search term.</p>
          )}
        </div>

        <div className="flex flex-wrap gap-4 items-end">
          {/* Favourite Checkbox */}
          <div className="flex flex-col">
            <label className="mb-1 font-medium">Saved as Favourite</label>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={isFavourite}
                onChange={(e) => setIsFavourite(e.target.checked)}
                className="form-checkbox"
                aria-label="Toggle favourite insights"
              />
              <span className="ml-2">Yes</span>
            </label>
          </div>

          {/* Category Dropdown */}
          <div className="flex flex-col">
            <label htmlFor="category" className="mb-1 font-medium">
              Filter by Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-64 p-2 border border-gray-300 rounded"
              aria-label="Filter insights by category"
            >
              <option value="">Select Category</option>
              <option value="Performance">Performance</option>
              <option value="Engagement">Engagement</option>
              <option value="Optimization">Optimization</option>
              <option value="Opportunities">Opportunities</option>
            </select>
          </div>

          {/* Date Range Picker */}
          <div className="flex flex-col">
            <label className="mb-1 font-medium">Refine by Date</label>
            <div className="flex space-x-2">
              <input
                type="date"
                value={startDate}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)}
                className="p-2 border border-gray-300 rounded"
                aria-label="Select start date"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value)}
                className="p-2 border border-gray-300 rounded"
                aria-label="Select end date"
              />
            </div>
            {dateError && <p className="text-red-500 mt-1">{dateError}</p>}
          </div>

          {/* Reset Filters Button */}
          <div>
            <button
              onClick={handleResetFilters}
              className="w-36 h-10 bg-gray-500 text-white rounded hover:bg-gray-600"
              aria-label="Reset filters"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Insights & Reports Sections */}
      <section className="mb-8">
        <h2 className="font-semibold mb-2 text-lg">Sentiment Overview</h2>
        <p className="mb-4 text-gray-700">
          Explore the breakdown of brand sentiment.
        </p>
        <SentimentPieChart />
      </section>

      <section className="mb-8">
        <h2 className="font-semibold mb-2 text-lg">Sentiment Performance Over Time</h2>
        <p className="mb-4 text-gray-700">
          Track sentiment trends across various time intervals.
        </p>
        <SentimentLineChart />
      </section>

      <section className="mb-8">
        <h2 className="font-semibold mb-2 text-lg">Competitor Benchmarking</h2>
        <p className="mb-4 text-gray-700">
          Compare our brand sentiment against competitors.
        </p>
        <CompetitorBarChart />
      </section>

      <section className="mb-8">
        <h2 className="font-semibold mb-2 text-lg">Share of Voice Analysis</h2>
        <p className="mb-4 text-gray-700">
          Review market share of voice compared to competitors.
        </p>
        <ShareOfVoiceBarChart />
      </section>

      <section className="mb-8">
        <h2 className="font-semibold mb-2 text-lg">Hashtag Performance</h2>
        <p className="mb-4 text-gray-700">
          Monitor key hashtag metrics.
        </p>
        <HashtagPerformance />
      </section>

      <section className="mb-8">
        <h2 className="font-semibold mb-2 text-lg">Key Insights</h2>
        <KeyInsights insight="Your recent campaigns increased positive sentiment by 5%, demonstrating clear ROI in brand performance." />
      </section>

      {/* Insights Pagination */}
      <section className="mb-8">
        <div className="flex justify-between items-center">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="w-36 h-10 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages} (Shows 5 insights per page)
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="w-36 h-10 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </section>

      {/* AI-Generated Insights */}
      <section className="mb-8">
        <h2 className="font-semibold mb-2 text-lg">AI-Generated Insights</h2>
        <div className="space-y-4">
          {aiInsightsData.map((aiInsight) => (
            <div
              key={aiInsight.id}
              className="p-4 border rounded bg-white"
              role="article"
              aria-label={`AI insight: ${aiInsight.title}`}
            >
              <h3 className="text-lg font-medium">{aiInsight.title}</h3>
              <button
                onClick={() => alert(`Reading AI insight: ${aiInsight.title}`)}
                className="w-36 h-10 bg-blue-500 text-white rounded hover:bg-blue-600 mt-2"
                aria-label={`Read AI insight ${aiInsight.title}`}
              >
                Read
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Export Error Display */}
      {exportError && <p className="text-red-500 mt-4">{exportError}</p>}
    </div>
  );
};

export default InsightsSummaryPage;
