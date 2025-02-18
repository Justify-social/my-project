"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

/* ============================================================================
   TYPE DEFINITIONS
   ============================================================================ */
interface BrandLiftMetrics {
  brandAwarenessLift: number;
  brandPerceptionLift: number;
  recallIntentLift: number;
}

/* ============================================================================
   COMPONENTS
   ============================================================================ */

/**
 * ProgressBar
 * Renders an animated horizontal bar indicating the percentage of completion.
 */
const ProgressBar: React.FC<{ current: number; total: number }> = ({
  current,
  total,
}) => {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
      <motion.div
        className="bg-blue-600 h-2.5"
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        aria-label={`Progress: ${percentage}%`}
      />
    </div>
  );
};

/**
 * MetricsCard
 * Displays interim brand-lift metrics.
 */
const MetricsCard: React.FC<{ metrics: BrandLiftMetrics }> = ({ metrics }) => {
  return (
    <ul className="list-disc list-inside text-sm text-primary-color space-y-1">
      <li>Interim brand awareness lift: +{metrics.brandAwarenessLift}%</li>
      <li>Interim brand perception lift: +{metrics.brandPerceptionLift}%</li>
      <li>Interim recall/intent measure: +{metrics.recallIntentLift}%</li>
    </ul>
  );
};

/* ============================================================================
   MAIN COMPONENT: BrandLiftProgressPage
   ============================================================================ */

export default function BrandLiftProgressPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Store campaign ID
  const [campaignId, setCampaignId] = useState<string>("");

  // Brand lift metrics with default sample values
  const [metrics, setMetrics] = useState<BrandLiftMetrics>({
    brandAwarenessLift: 7,
    brandPerceptionLift: 5,
    recallIntentLift: 4,
  });

  // Track current responses vs total required
  const [currentResponses, setCurrentResponses] = useState<number>(54);
  const [totalResponsesNeeded, setTotalResponsesNeeded] = useState<number>(300);

  // Loading state for data refresh
  const [isLoading, setIsLoading] = useState<boolean>(false);

  /**
   * On component mount:
   * - Retrieve campaign ID from sessionStorage or query params.
   */
  useEffect(() => {
    const storedCampaignId = sessionStorage.getItem("campaignId");
    if (storedCampaignId) {
      setCampaignId(storedCampaignId);
    } else {
      const paramId = searchParams.get("campaignId");
      if (paramId) {
        setCampaignId(paramId);
      }
    }
  }, [searchParams]);

  /**
   * handleRefreshData
   * Simulates fetching fresh brand-lift data from an API.
   */
  const handleRefreshData = useCallback(async () => {
    try {
      setIsLoading(true);
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Randomise metrics for demonstration purposes
      setMetrics({
        brandAwarenessLift: Math.floor(Math.random() * 10),
        brandPerceptionLift: Math.floor(Math.random() * 10),
        recallIntentLift: Math.floor(Math.random() * 10),
      });
    } catch (error) {
      console.error("Failed to refresh brand-lift data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * handleReturnToDashboard
   * Navigates the user back to the dashboard.
   */
  const handleReturnToDashboard = useCallback(() => {
    router.push(`/dashboard?campaignId=${campaignId}`);
  }, [router, campaignId]);

  return (
    <main className="min-h-screen w-full bg-gray-50 flex flex-col items-center justify-center px-6 py-6">
      {/* Content Card */}
      <section className="bg-white rounded-lg shadow p-6 space-y-6 max-w-xl w-full">
        <h2 className="text-lg font-semibold text-primary-color">
          Brand Lift Study in Progress
        </h2>
        <p className="text-sm text-secondary-color">
          Your brand lift study is live. We are collecting responses and updating
          metrics in real time.
        </p>

        {/* Progress Bar & Completion Summary */}
        <div className="space-y-2">
          <h3 className="font-medium text-sm text-primary-color">
            Completion Summary
          </h3>
          <p className="text-sm text-secondary-color">
            <strong>{currentResponses}</strong> of{" "}
            <strong>{totalResponsesNeeded}</strong>
          </p>
          <ProgressBar
            current={currentResponses}
            total={totalResponsesNeeded}
          />
        </div>

        {/* Interim Metrics */}
        <MetricsCard metrics={metrics} />

        {/* Action Buttons */}
        <div className="flex gap-4 mt-4">
          <button
            onClick={handleRefreshData}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-100 text-primary-color rounded hover:bg-gray-200 text-sm transition duration-150"
          >
            {isLoading ? "Refreshing..." : "Refresh Data"}
          </button>
          <button
            onClick={handleReturnToDashboard}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm transition duration-150"
          >
            Return to Dashboard
          </button>
        </div>
      </section>
    </main>
  );
}
