// src/app/brand-lift/report/page.tsx
"use client";
import React from "react";
import { useSearchParams } from "next/navigation";

export default function BrandLiftReportPage() {
  const searchParams = useSearchParams();
  const campaignId = searchParams.get("campaignId");

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Brand Lift Report</h1>
      <p>Campaign ID: {campaignId}</p>
      <div>
        <p>[Detailed report with charts, metrics, and AI insights]</p>
      </div>
      <button onClick={() => window.location.href = "/dashboard"}>
        Return to Dashboard
      </button>
    </div>
  );
}
