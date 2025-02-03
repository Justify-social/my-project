"use client";

import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import OnboardingModal from "../../components/OnboardingModal";

interface DashboardContentProps {
  user: {
    name: string;
    email: string;
    role: string;
    hasSeenOnboarding: boolean;
  };
}

export default function DashboardContent({ user }: DashboardContentProps) {
  // If the user has not seen onboarding, show the modal.
  const [showModal, setShowModal] = useState(!user.hasSeenOnboarding);

  const handleOnboardingComplete = async () => {
    // Call your API endpoint to update the user's onboarding status.
    await fetch("/api/user/setOnboardingTrue", {
      method: "POST",
    });
    // After updating, hide the modal.
    setShowModal(false);
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar user={user} />
      <main style={{ padding: "1rem", flex: 1 }}>
        <h1>Dashboard</h1>
        <p>Welcome, {user.name}!</p>
        {showModal && <OnboardingModal onComplete={handleOnboardingComplete} />}
      </main>
    </div>
  );
}
