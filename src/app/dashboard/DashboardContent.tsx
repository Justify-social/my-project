"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import OnboardingModal from "../../components/OnboardingModal";
import dynamic from "next/dynamic";

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
    await fetch("/api/user/setOnboardingTrue", {
      method: "POST",
    });
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
    <div style={{ display: "flex" }}>
      <Sidebar user={user} />
      <main style={{ padding: "1rem", flex: 1 }}>
        <h1>Dashboard</h1>
        <p>Welcome, {user.name}!</p>
        {showModal && <OnboardingModal onComplete={handleOnboardingComplete} />}
        <div style={{ marginTop: "2rem" }}>
          <h2>Upcoming Campaigns</h2>
          {/* Render the calendar only on the client */}
          <CalendarUpcoming campaigns={campaigns} />
          <ul>
            {upcomingCampaigns.map(campaign => (
              <li key={campaign.id}>
                {campaign.name} - {new Date(campaign.startDate).toLocaleDateString()}
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}
