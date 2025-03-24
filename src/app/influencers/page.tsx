"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

const tourSteps = [
"Welcome to Your Dashboard",
"Monitoring Key Metrics",
"Ensuring Influencer Safety",
"Completing Your First Report"];


export default function OnboardingPage() {
  const router = useRouter();

  // State for controlling the tour and skip confirmation modals
  const [isTourActive, setIsTourActive] = useState(false);
  const [tourStepIndex, setTourStepIndex] = useState(0);
  const [isSkipConfirmActive, setIsSkipConfirmActive] = useState(false);

  // Error state if tour fails to load (simulate if needed)
  const [tourError, setTourError] = useState("");

  // Handlers for the tour
  const startTour = () => {
    setTourStepIndex(0);
    setIsTourActive(true);
    setTourError("");
  };

  const nextStep = () => {
    if (tourStepIndex < tourSteps.length - 1) {
      setTourStepIndex(tourStepIndex + 1);
    }
  };

  const previousStep = () => {
    if (tourStepIndex > 0) {
      setTourStepIndex(tourStepIndex - 1);
    }
  };

  const finishTour = () => {
    setIsTourActive(false);
    router.push("/influencers/influencer-list");
  };

  // Handler for Skip
  const handleSkip = () => {
    setIsSkipConfirmActive(true);
  };

  const confirmSkip = () => {
    setIsSkipConfirmActive(false);
    router.push("/influencers/influencer-list");
  };

  const cancelSkip = () => {
    setIsSkipConfirmActive(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50 font-work-sans">
      {/* Page Title */}
      <h1 className="text-2xl font-bold text-[#333333] text-center mb-4 font-sora">
        Influencer Safety Tools
      </h1>

      {/* Welcome Message */}
      <p className="text-lg text-[#666666] text-center mb-8 font-work-sans">
        Welcome to Influencer Safety! <br /> Easily monitor key metrics and ensure safety aligned with your goals.
      </p>

      {/* Primary Action Buttons */}
      <div className="flex flex-col items-center space-y-4 font-work-sans">
        <button
          onClick={startTour}
          className="w-[200px] h-[50px] rounded-[6px] text-[18px] bg-blue-500 text-white py-3 hover:bg-blue-600 transition-colors duration-150 font-work-sans"
          aria-label="Take a Tour to learn more about key platform features">

          Take a Tour
        </button>
        <button
          onClick={handleSkip}
          className="w-[200px] h-[50px] rounded-[6px] text-[18px] bg-gray-500 text-white py-3 hover:bg-gray-600 transition-colors duration-150 font-work-sans"
          aria-label="Skip onboarding and go straight to your dashboard">

          Skip
        </button>
      </div>

      {/* Onboarding Tour Modal */}
      {isTourActive &&
      <div
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 font-work-sans"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-modal-title">

          <div className="bg-white rounded p-6 w-[400px] font-work-sans">
            <h2
            id="tour-modal-title"
            className="text-xl font-bold mb-4 text-center font-sora">

              {tourSteps[tourStepIndex]}
            </h2>
            {tourError &&
          <p className="text-red-500 mb-4 text-center font-work-sans">{tourError}</p>
          }
            <div className="flex justify-between mt-6 font-work-sans">
              <button
              onClick={previousStep}
              disabled={tourStepIndex === 0}
              className="bg-blue-500 text-white px-4 py-2 rounded transition-opacity duration-150 disabled:opacity-50 font-work-sans"
              aria-label="Previous step in onboarding tutorial">

                Previous
              </button>
              {tourStepIndex < tourSteps.length - 1 ?
            <button
              onClick={nextStep}
              className="bg-blue-500 text-white px-4 py-2 rounded transition-colors duration-150 hover:bg-blue-600 font-work-sans"
              aria-label="Next step in onboarding tutorial">

                  Next
                </button> :

            <button
              onClick={finishTour}
              className="bg-blue-500 text-white px-4 py-2 rounded transition-colors duration-150 hover:bg-blue-600 font-work-sans"
              aria-label="Finish onboarding tour">

                  Finish Tour
                </button>
            }
            </div>
          </div>
        </div>
      }

      {/* Skip Confirmation Modal */}
      {isSkipConfirmActive &&
      <div
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 font-work-sans"
        role="dialog"
        aria-modal="true"
        aria-labelledby="skip-modal-title">

          <div className="bg-white rounded p-6 w-[400px] font-work-sans">
            <h2
            id="skip-modal-title"
            className="text-xl font-bold mb-4 text-center font-sora">

              Are you sure you want to skip onboarding?
            </h2>
            <div className="flex justify-end space-x-4 font-work-sans">
              <button
              onClick={cancelSkip}
              className="bg-gray-500 text-white px-4 py-2 rounded transition-colors duration-150 hover:bg-gray-600 font-work-sans"
              aria-label="Cancel skip onboarding">

                Cancel
              </button>
              <button
              onClick={confirmSkip}
              className="bg-gray-500 text-white px-4 py-2 rounded transition-colors duration-150 hover:bg-gray-600 font-work-sans"
              aria-label="Skip onboarding">

                Skip Onboarding
              </button>
            </div>
          </div>
        </div>
      }
    </div>);

}