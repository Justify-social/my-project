"use client";

import { useEffect, useState } from "react";

// Define the interface for the brand health data
interface BrandHealthData {
  sentiment: string;
  score: number;
  trend: "up" | "down" | "stable";
}

export default function BrandHealthCard() {
  // Local state to store brand health data, loading status, and errors
  const [data, setData] = useState<BrandHealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  // Fetch live data on mount; fallback to static data on error
  useEffect(() => {
    async function fetchBrandHealth() {
      try {
        // Attempt to fetch live data from an API endpoint (replace with your endpoint)
        const res = await fetch("/api/brand-health");
        if (!res.ok) {
          throw new Error(`Failed to fetch brand health data: ${res.status}`);
        }
        const jsonData: BrandHealthData = await res.json();
        setData(jsonData);
      } catch (err) {
        console.error("Error fetching brand health data:", err);
        // Fallback static data if the API call fails
        setData({
          sentiment: "Positive",
          score: 85,
          trend: "up",
        });
        setError("Displaying placeholder data due to an error.");
      } finally {
        setLoading(false);
      }
    }

    fetchBrandHealth();
  }, []);

  if (loading) {
    return <div>Loading Brand Health Metrics...</div>;
  }

  if (!data) {
    return <div>Error loading data.</div>;
  }

  return (
    <div className="p-4 bg-white shadow rounded">
      {/* Add a data-testid attribute for reliable testing */}
      <h2 data-testid="brand-health-header" className="text-xl font-bold mb-2">
        Brand Health
      </h2>
      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
      <div className="flex items-center mb-1">
        <span className="text-lg">Sentiment:</span>
        <span className="ml-2 text-green-600 font-semibold">{data.sentiment}</span>
      </div>
      <div className="flex items-center mb-1">
        <span className="text-lg">Score:</span>
        <span className="ml-2 text-blue-600 font-semibold">{data.score}</span>
      </div>
      <div className="flex items-center">
        <span className="text-lg">Trend:</span>
        <span
          className={`ml-2 font-semibold ${
            data.trend === "up"
              ? "text-green-500"
              : data.trend === "down"
              ? "text-red-500"
              : "text-gray-500"
          }`}
        >
          {data.trend === "up"
            ? "Increasing"
            : data.trend === "down"
            ? "Decreasing"
            : "Stable"}
        </span>
      </div>
    </div>
  );
}
