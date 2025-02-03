// src/app/campaigns/new/page.tsx
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewCampaign() {
  const [name, setName] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/campaigns", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      router.push("/campaigns");
    }
  }

  return (
    <div>
      <h1>Create New Campaign</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Campaign Name:</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <button type="submit">Create Campaign</button>
      </form>
    </div>
  );
}
