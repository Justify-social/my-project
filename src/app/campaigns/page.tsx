"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

interface Campaign {
  id: number;
  name: string;
  startDate: string;
  endDate?: string;
}

export default function CampaignList() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchCampaigns() {
      const res = await fetch("/api/campaigns");
      const data = await res.json();
      setCampaigns(data);
    }
    fetchCampaigns();
  }, []);

  const filteredCampaigns = campaigns.filter((campaign) =>
    campaign.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Campaigns</h1>
      <div>
        <input
          type="text"
          placeholder="Search campaigns"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Link href="/campaigns/new">New Campaign</Link>
      </div>
      {filteredCampaigns.length === 0 ? (
        <p>No campaigns</p>
      ) : (
        <table border={1} cellPadding={8} cellSpacing={0}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCampaigns.map((campaign) => (
              <tr key={campaign.id}>
                <td>{campaign.name}</td>
                <td>{new Date(campaign.startDate).toLocaleDateString()}</td>
                <td>
                  {campaign.endDate
                    ? new Date(campaign.endDate).toLocaleDateString()
                    : "N/A"}
                </td>
                <td>
                  <Link href={`/campaigns/${campaign.id}/edit`}>Edit</Link>{" "}
                  |{" "}
                  <button
                    onClick={async () => {
                      await fetch(`/api/campaigns/${campaign.id}`, { method: "DELETE" });
                      setCampaigns(campaigns.filter((c) => c.id !== campaign.id));
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
