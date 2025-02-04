// src/app/brand-lift/survey-preview/page.tsx
"use client";
import React from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function SurveyPreviewPage() {
  const searchParams = useSearchParams();
  const campaignId = searchParams.get("campaignId");
  const router = useRouter();

  const handleSubmitSurvey = () => {
    router.push(`/brand-lift/progress?campaignId=${campaignId}`);
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Survey Preview and Simulation</h1>
      <p>Campaign ID: {campaignId}</p>
      <div>
        <p>[Interactive preview of the survey as seen by panelists]</p>
      </div>
      <button onClick={handleSubmitSurvey}>Submit Survey for Brand Lift</button>
    </div>
  );
}
