// src/app/brand-lift/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Campaign {
  id: number;
  name: string;
}

export default function BrandLiftCampaignSelection() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchCampaigns = async () => {
      const res = await fetch("/api/campaigns");
      const data = await res.json();
      setCampaigns(data);
    };
    fetchCampaigns();
  }, []);

  const handleSelectCampaign = (id: number) => {
    router.push(`/brand-lift/survey-design?campaignId=${id}`);
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Brand Lift Measurement</h1>
      {campaigns.length === 0 ? (
        <p>No campaigns available for brand lift. Please create a campaign first.</p>
      ) : (
        <div>
          <h2>Select a Campaign for Brand Lift</h2>
          <ul>
            {campaigns.map((campaign) => (
              <li key={campaign.id}>
                {campaign.name}{" "}
                <button onClick={() => handleSelectCampaign(campaign.id)}>Select</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
