"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function PostSubmissionScreen() {
  const router = useRouter();

  // State for CTA loading and error messages
  const [loadingBrandLift, setLoadingBrandLift] = useState(false);
  const [errorBrandLift, setErrorBrandLift] = useState("");
  const [loadingAssetTesting, setLoadingAssetTesting] = useState(false);
  const [errorAssetTesting, setErrorAssetTesting] = useState("");
  const [loadingCampaignDashboard, setLoadingCampaignDashboard] = useState(false);
  const [errorCampaignDashboard, setErrorCampaignDashboard] = useState("");

  // CTA Option 1: Set Up Brand Lift Study
  const handleBrandLiftStudy = async () => {
    setErrorBrandLift("");
    setLoadingBrandLift(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      router.push("/campaigns/wizard/submission/brand-lift-study");
    } catch (error) {
      setErrorBrandLift("Error: Unable to load the requested page. Please try again later.");
    } finally {
      setLoadingBrandLift(false);
    }
  };

  // CTA Option 2: Start Creative Asset Testing
  const handleAssetTesting = async () => {
    setErrorAssetTesting("");
    setLoadingAssetTesting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      router.push("/campaigns/wizard/submission/asset-testing");
    } catch (error) {
      setErrorAssetTesting("Error: Unable to load the requested page. Please try again later.");
    } finally {
      setLoadingAssetTesting(false);
    }
  };

  // CTA Option 3: View Campaign Dashboard
  const handleCampaignDashboard = async () => {
    setErrorCampaignDashboard("");
    setLoadingCampaignDashboard(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      router.push("/campaigns/dashboard");
    } catch (error) {
      setErrorCampaignDashboard("Error: Unable to load the requested page. Please try again later.");
    } finally {
      setLoadingCampaignDashboard(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4">
      {/* Header and Confirmation Message */}
      <h1 className="text-center font-bold mb-4" style={{ fontSize: "32px", color: "#333333" }}>
        Submission
      </h1>
      <p className="mb-8 text-center" style={{ fontSize: "20px", color: "#666666" }}>
        Your campaign has been submitted successfully!
      </p>

      {/* CTA Options */}
      <div className="flex flex-col md:flex-row gap-8 items-center">
        {/* Option 1: Set Up Brand Lift Study */}
        <div className="flex flex-col items-center bg-white border rounded p-6 w-[220px]">
          <h2 className="font-bold text-lg">Set Up Brand Lift Study</h2>
          <p className="mt-2 text-center">
            Measure how your campaign impacts brand awareness and consumer behavior with a Brand Lift Study.
          </p>
          <button
            onClick={handleBrandLiftStudy}
            disabled={loadingBrandLift}
            className="mt-4 w-[220px] h-[50px] rounded transition duration-200 text-white"
            style={{ backgroundColor: loadingBrandLift ? "#CCCCCC" : "#007BFF" }}
            onMouseOver={(e) => { if (!loadingBrandLift) e.currentTarget.style.backgroundColor = "#0056b3"; }}
            onMouseOut={(e) => { if (!loadingBrandLift) e.currentTarget.style.backgroundColor = "#007BFF"; }}
            aria-label="Press Enter to set up Brand Lift Study"
          >
            {loadingBrandLift ? "Loading..." : "Set Up"}
          </button>
          {errorBrandLift && (
            <div className="mt-2 flex items-center text-red-600 text-sm">
              <span>{errorBrandLift}</span>
              <button onClick={handleBrandLiftStudy} className="ml-2 underline" aria-label="Retry Brand Lift Study Setup">
                Retry
              </button>
            </div>
          )}
        </div>

        {/* Option 2: Start Creative Asset Testing */}
        <div className="flex flex-col items-center bg-white border rounded p-6 w-[220px]">
          <h2 className="font-bold text-lg">Start Creative Asset Testing</h2>
          <p className="mt-2 text-center">
            Test your creative assets to see how they perform and resonate with your audience.
          </p>
          <button
            onClick={handleAssetTesting}
            disabled={loadingAssetTesting}
            className="mt-4 w-[220px] h-[50px] rounded transition duration-200 text-white"
            style={{ backgroundColor: loadingAssetTesting ? "#CCCCCC" : "#007BFF" }}
            onMouseOver={(e) => { if (!loadingAssetTesting) e.currentTarget.style.backgroundColor = "#0056b3"; }}
            onMouseOut={(e) => { if (!loadingAssetTesting) e.currentTarget.style.backgroundColor = "#007BFF"; }}
            aria-label="Press Enter to start Creative Asset Testing"
          >
            {loadingAssetTesting ? "Testing in progress..." : "Start Testing"}
          </button>
          {errorAssetTesting && (
            <div className="mt-2 flex items-center text-red-600 text-sm">
              <span>{errorAssetTesting}</span>
              <button onClick={handleAssetTesting} className="ml-2 underline" aria-label="Retry Creative Asset Testing">
                Retry
              </button>
            </div>
          )}
        </div>

        {/* Option 3: View Campaign Dashboard */}
        <div className="flex flex-col items-center bg-white border rounded p-6 w-[220px]">
          <h2 className="font-bold text-lg">View Campaign Dashboard</h2>
          <p className="mt-2 text-center">
            Access detailed insights and performance metrics for your campaign.
          </p>
          <button
            onClick={handleCampaignDashboard}
            disabled={loadingCampaignDashboard}
            className="mt-4 w-[220px] h-[50px] rounded transition duration-200 text-white"
            style={{ backgroundColor: loadingCampaignDashboard ? "#CCCCCC" : "#007BFF" }}
            onMouseOver={(e) => { if (!loadingCampaignDashboard) e.currentTarget.style.backgroundColor = "#0056b3"; }}
            onMouseOut={(e) => { if (!loadingCampaignDashboard) e.currentTarget.style.backgroundColor = "#007BFF"; }}
            aria-label="Press Enter to view your Campaign Dashboard"
          >
            {loadingCampaignDashboard ? "Loading..." : "View Campaign"}
          </button>
          {errorCampaignDashboard && (
            <div className="mt-2 flex items-center text-red-600 text-sm">
              <span>{errorCampaignDashboard}</span>
              <button onClick={handleCampaignDashboard} className="ml-2 underline" aria-label="Retry viewing Campaign Dashboard">
                Retry
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
