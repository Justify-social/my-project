"use client";

import { useSearchParams } from "next/navigation";
import { ErrorBoundary } from "@/components/ErrorBoundary/ErrorBoundary";
import LoadingSkeleton from "@/components/LoadingSkeleton";

function SubmissionContent() {
  const searchParams = useSearchParams();
  const campaignId = searchParams.get('id');

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Campaign Submission</h1>
      <p>Campaign ID: {campaignId}</p>
      {/* Add your submission content here */}
    </div>
  );
}

export default function SubmissionWrapper() {
  return (
    <ErrorBoundary>
      <SubmissionContent />
    </ErrorBoundary>
  );
} 