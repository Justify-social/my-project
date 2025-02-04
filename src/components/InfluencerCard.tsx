"use client";

import { useEffect, useState } from "react";

interface InfluencerData {
  totalInfluencers: number;
  averageEngagement: number;
}

export default function InfluencerCard() {
  const [data, setData] = useState<InfluencerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchInfluencerData() {
      try {
        const res = await fetch("/api/influencers");
        if (!res.ok) {
          throw new Error(`Failed to fetch influencer data: ${res.status}`);
        }
        const jsonData: InfluencerData = await res.json();
        setData(jsonData);
      } catch (err) {
        console.error("Error fetching influencer data:", err);
        // Fallback to static data if API call fails.
        setData({
          totalInfluencers: 5,
          averageEngagement: 7.5,
        });
        setError("Displaying placeholder data due to an error.");
      } finally {
        setLoading(false);
      }
    }
    fetchInfluencerData();
  }, []);

  if (loading) {
    return <div>Loading Influencer Metrics...</div>;
  }

  if (!data) {
    return <div>Error loading data.</div>;
  }

  return (
    <div className="p-4 bg-white shadow rounded">
      {/* The header for testing */}
      <h2 data-testid="influencer-card-header" className="text-xl font-bold mb-2">
        Influencer Management
      </h2>
      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
      <div className="flex items-center mb-1">
        <span className="text-lg">Total Influencers:</span>
        <span className="ml-2 text-green-600 font-semibold">{data.totalInfluencers}</span>
      </div>
      <div className="flex items-center">
        <span className="text-lg">Avg Engagement:</span>
        <span className="ml-2 text-blue-600 font-semibold">
          {data.averageEngagement}%
        </span>
      </div>
    </div>
  );
}
