"use client";

import React from "react";

interface OnboardingModalProps {
  onComplete: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete }) => {
  return (
    <div
      className="onboarding-modal font-work-sans"
      role="dialog"
      aria-modal="true"
      aria-label="User Onboarding"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000
      }}>

      <div
        style={{
          background: "white",
          padding: "2rem",
          borderRadius: "8px",
          maxWidth: "400px",
          textAlign: "center"
        }} className="font-work-sans">

        <h2 className="font-sora">Welcome to the Dashboard!</h2>
        <p className="font-work-sans">Here’s a quick guide to get you started.</p>
        <button onClick={onComplete} aria-label="Complete onboarding" className="font-work-sans">
          Got it!
        </button>
      </div>
    </div>);

};

export default OnboardingModal;