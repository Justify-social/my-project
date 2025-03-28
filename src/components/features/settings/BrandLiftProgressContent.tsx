"use client";

import React, { useState, useEffect, useCallback } from "react";
import ProgressBar from './branding/SurveyProgressBar';
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
const ProgressBar: React.FC<{current: number;total: number;}> = ({
  current,
  total
}) => {
  const percentage = total > 0 ? Math.round(current / total * 100) : 0;

  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden font-work-sans">
      <motion.div
        className="bg-blue-600 h-2.5"
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        aria-label={`Progress: ${percentage}%`} />

    </div>);

};

/**
 * MetricsCard
 * Displays interim brand-lift metrics.
 */
const MetricsCard: React.FC<{metrics: BrandLiftMetrics;}> = ({ metrics }) => {
  return (
    <ul className="list-disc list-inside text-sm text-primary-color space-y-1 font-work-sans">
      <li className="font-work-sans">Interim brand awareness lift: +{metrics.brandAwarenessLift}%</li>
      <li className="font-work-sans">Interim brand perception lift: +{metrics.brandPerceptionLift}%</li>
      <li className="font-work-sans">Interim recall/intent measure: +{metrics.recallIntentLift}%</li>
    </ul>);

};

/* ============================================================================
   MAIN COMPONENT
   ============================================================================ */

export default function BrandLiftProgressContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Store campaign ID
  const [campaignId, setCampaignId] = useState<string>("");

  // Brand lift metrics with default sample values
  const [metrics, setMetrics] = useState<BrandLiftMetrics>({
    brandAwarenessLift: 7,
    brandPerceptionLift: 5,
    recallIntentLift: 4
  });

  // Track current responses vs total required
  const [currentResponses, setCurrentResponses] = useState<number>(54);
  const [totalResponsesNeeded, setTotalResponsesNeeded] = useState<number>(300);

  // Loading state for data refresh
  const [isLoading, setIsLoading] = useState<boolean>(false);

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

  const handleRefreshData = useCallback(async () => {
    try {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setMetrics({
        brandAwarenessLift: Math.floor(Math.random() * 10),
        brandPerceptionLift: Math.floor(Math.random() * 10),
        recallIntentLift: Math.floor(Math.random() * 10)
      });
    } catch (error) {
      console.error("Failed to refresh brand-lift data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleReturnToDashboard = useCallback(() => {
    router.push(`/dashboard?campaignId=${campaignId}`);
  }, [router, campaignId]);

  return (
    <main className="min-h-screen w-full bg-gray-50 flex flex-col items-center justify-center px-6 py-6">
      <section className="bg-white rounded-lg shadow p-6 space-y-6 max-w-xl w-full">
        <h2 className="text-lg font-semibold text-primary-color font-sora">
          Brand Lift Study in Progress
        </h2>
        <p className="text-sm text-secondary-color font-work-sans">
          Your brand lift study is live. We are collecting responses and updating
          metrics in real time.
        </p>

        <div className="space-y-2 font-work-sans">
          <h3 className="font-medium text-sm text-primary-color font-sora">
            Completion Summary
          </h3>
          <p className="text-sm text-secondary-color font-work-sans">
            <strong>{currentResponses}</strong> of{" "}
            <strong>{totalResponsesNeeded}</strong>
          </p>
          <ProgressBar
            current={currentResponses}
            total={totalResponsesNeeded} />

        </div>

        <MetricsCard metrics={metrics} />

        <div className="flex gap-4 mt-4 font-work-sans">
          <button
            onClick={handleRefreshData}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-100 text-primary-color rounded hover:bg-gray-200 text-sm transition duration-150 font-work-sans">

            {isLoading ? "Refreshing..." : "Refresh Data"}
          </button>
          <button
            onClick={handleReturnToDashboard}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm transition duration-150 font-work-sans">

            Return to Dashboard
          </button>
        </div>
      </section>
    </main>);

}