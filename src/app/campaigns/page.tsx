// src/app/campaigns/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

interface Campaign {
  id: number;
  name: string;
  startDate?: string;
  endDate?: string;
}

export default function CampaignList() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    async function fetchCampaigns() {
      try {
        const res = await fetch("/api/campaigns");
        if (!res.ok) {
          console.error("Failed to fetch campaigns");
          return;
        }
        const data = await res.json();
        setCampaigns(data);
      } catch (error) {
        console.error("Error fetching campaigns:", error);
      }
    }
    fetchCampaigns();
  }, []);

  return (
    <div>
      <h1>Campaigns</h1>
      <Link href="/campaigns/new">
        {/* In Next.js 13, you can just use <Link> without <a> if using the new Link component */}
        Create New Campaign
      </Link>
      <ul>
        {campaigns.map((campaign) => (
          <li key={campaign.id}>
            <Link href={`/campaigns/${campaign.id}`}>{campaign.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
