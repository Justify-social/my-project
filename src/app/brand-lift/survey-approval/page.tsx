// src/app/brand-lift/survey-approval/page.tsx
"use client";
import React from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function SurveyApprovalPage() {
  const searchParams = useSearchParams();
  const campaignId = searchParams.get("campaignId");
  const router = useRouter();

  const handleApprove = () => {
    router.push(`/brand-lift/survey-preview?campaignId=${campaignId}`);
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Survey Approval</h1>
      <p>Review the survey design for campaign {campaignId}.</p>
      <div>
        <p>[Survey summary and any media previews]</p>
      </div>
      <button onClick={handleApprove}>Approve Survey</button>
    </div>
  );
}
