// src/hooks/useCampaignDetails.ts

import { useState, useEffect } from "react";

// Custom hook to fetch campaign details
export const useCampaignDetails = () => {
  const [campaignDetails, setCampaignDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // This could be modified to get campaignId dynamically
  const campaignId = new URLSearchParams(window.location.search).get("campaignId");

  useEffect(() => {
    const fetchCampaignDetails = async () => {
      if (!campaignId) {
        setError("Campaign ID is missing.");
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`/api/campaigns/${campaignId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch campaign details");
        }

        const data = await response.json();
        if (!data) {
          setError("Campaign details not found.");
        } else {
          setCampaignDetails(data);
        }
      } catch (err) {
        setError("Failed to fetch campaign details");
      } finally {
        setLoading(false);
      }
    };

    fetchCampaignDetails();
  }, [campaignId]);

  return { campaignDetails, loading, error };
};
