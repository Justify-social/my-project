"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditCampaign() {
  const router = useRouter();
  const { id } = useParams();
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    async function fetchCampaign() {
      const res = await fetch(`/api/campaigns/${id}`);
      if (res.ok) {
        const data = await res.json();
        setName(data.name || "");
        if (data.startDate) {
          setStartDate(new Date(data.startDate).toISOString().split("T")[0]);
        }
        if (data.endDate) {
          setEndDate(new Date(data.endDate).toISOString().split("T")[0]);
        }
      } else {
        alert("Campaign not found");
      }
    }
    if (id) {
      fetchCampaign();
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/campaigns/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, startDate, endDate }),
    });
    if (res.ok) {
      router.push("/campaigns");
    } else {
      alert("Error updating campaign");
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Edit Campaign</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Campaign Name:</label>
          <input
            data-testid="campaign-name-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Start Date:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label>End Date:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <button data-testid="campaign-submit-button" type="submit">
          Update Campaign
        </button>
      </form>
    </div>
  );
}
