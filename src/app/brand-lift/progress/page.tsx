// src/app/brand-lift/progress/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function BrandLiftProgressPage() {
  const searchParams = useSearchParams();
  const campaignId = searchParams.get("campaignId");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // For MVP, simulate progress increment.
    const interval = setInterval(() => {
      setProgress((prev) => (prev < 100 ? prev + 10 : 100));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Brand Lift Progress</h1>
      <p>Campaign ID: {campaignId}</p>
      <div style={{ background: "#ccc", width: "100%", height: "20px", marginBottom: "1rem" }}>
        <div style={{ background: "#4caf50", width: `${progress}%`, height: "20px" }} />
      </div>
      <p>{progress}% completed</p>
      <button onClick={() => window.location.href = `/brand-lift/report?campaignId=${campaignId}`}>
        View Report
      </button>
    </div>
  );
}
