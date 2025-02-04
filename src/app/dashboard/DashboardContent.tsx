"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import OnboardingModal from "../../components/OnboardingModal";
import dynamic from "next/dynamic";
import BrandHealthCard from "../../components/BrandHealthCard";
import InfluencerCard from "../../components/InfluencerCard";

// Dynamically import CalendarUpcoming with SSR disabled.
const CalendarUpcoming = dynamic(
  () => import("../../components/CalendarUpcoming"),
  { ssr: false }
);

interface DashboardContentProps {
  user: {
    name: string;
    email: string;
    role: string;
    hasSeenOnboarding: boolean;
  };
}

interface Campaign {
  id: number;
  name: string;
  startDate: string;
  endDate?: string;
}

export default function DashboardContent({ user }: DashboardContentProps) {
  const [showModal, setShowModal] = useState(!user.hasSeenOnboarding);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  const handleOnboardingComplete = async () => {
    await fetch("/api/user/setOnboardingTrue", { method: "POST" });
    setShowModal(false);
  };

  useEffect(() => {
    const fetchCampaigns = async () => {
      const res = await fetch("/api/campaigns");
      const data = await res.json();
      setCampaigns(data);
    };
    fetchCampaigns();
  }, []);

  // Sort campaigns by startDate and select the top 3 upcoming ones.
  const upcomingCampaigns = [...campaigns]
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 3);

  return (
    // Only render the main content here. The Sidebar is rendered by the global layout.
    <main style={{ padding: "1rem", flex: 1 }} role="main" aria-label="Dashboard main content">
      <h1 tabIndex={0}>Dashboard</h1>
      <p>Welcome, {user.name}!</p>
      {showModal && <OnboardingModal onComplete={handleOnboardingComplete} />}
      <div style={{ marginTop: "2rem" }}>
        <h2 tabIndex={0}>Upcoming Campaigns</h2>
        {/* Render the calendar only on the client */}
        <CalendarUpcoming campaigns={campaigns} />
        <ul>
          {upcomingCampaigns.map((campaign) => (
            <li key={campaign.id}>
              <Link
                href={`/campaigns/${campaign.id}`}
                aria-label={`View details for campaign ${campaign.name}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                {campaign.name} - {new Date(campaign.startDate).toLocaleDateString()}
              </Link>
            </li>
          ))}
        </ul>
        {/* Brand Health Card wrapped in a navigation link */}
        <div style={{ marginTop: "2rem" }}>
          <Link
            href="/dashboard/brand-health"
            aria-label="View detailed Brand Health metrics"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <BrandHealthCard />
          </Link>
        </div>
        {/* Influencer Card wrapped in a navigation link */}
        <div style={{ marginTop: "2rem" }}>
          <Link
            href="/dashboard/influencers"
            aria-label="View detailed Influencer Management information"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <InfluencerCard />
          </Link>
        </div>
      </div>
    </main>
  );
}
