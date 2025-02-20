"use client";

import React, { Component, ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useWizard } from "../../../../context/WizardContext";
import Header from "../../../../components/Wizard/Header";
import ProgressBar from "../../../../components/Wizard/ProgressBar";
import { useState } from "react";

// =============================================================================
// SAMPLE DATA (In production, this comes from your Wizard Context or API)
// =============================================================================

const sampleCampaignDetails = {
  campaignName: "Senior Travellers",
  description:
    "Individuals aged 60 and above who enjoy leisure travel, cultural experiences, and comfortable accommodations, often prioritizing relaxation, safety, and value for money.",
  startDate: "10/08/2024",
  endDate: "24/08/2024",
  timeZone: "BST (UTC+1)",
  primaryContact: { name: "Ed Addams", email: "edaddams@domain.com", role: "CEO" },
  secondaryContact: { name: "Ed", email: "ed@domain.com", role: "CTO" },
};

const sampleBudget = {
  budgetAllocationLower: true,
  currency: "£ Pounds",
  totalCampaignBudget: "£5400",
  budgetAllocatedToSocialMedia: "£1000",
  influencerAssigned: "Olivia Bennett",
  influencerHandle: "oliviabennett (7k followers)",
};

const sampleObjectives = {
  primaryKPI: "Boost Brand Awareness",
  secondaryKPIs: ["Maximise Ad Recall", "Grow Brand Preference", "Motivate Action"],
  mainMessage: "Discover sustainable living with our eco-friendly products.",
  hashtags: "#bestcampaign",
  brandPerception: "Recognise us as the leader in sustainable technology.",
  keyBenefits: ["Innovative design", "Exceptional quality", "Outstanding customer service"],
  expectedAchievements: "20% increase in brand awareness within three months",
  purchaseIntent: "15% due to targeted ads",
};

const sampleAudience = {
  location: "United Kingdom",
  ageDistribution: "18-24, 25-34, 35-44, 45-54, 55-64, 65+",
  gender: "Male",
  language: "English (UK)",
  educationLevel: "Bachelor's Degree",
  jobTitles: "Manager, Developer",
  incomeRange: "$10,000-$20,200",
};

const sampleCompetitors = {
  competitors: ["Amazon", "Walmart", "Shopify"],
  marketHypothesis:
    "The industry is experiencing a surge in demand for eco-friendly products, which may affect consumer preferences.",
};

const sampleCreativeAssets = [
  {
    fileName: "File.MP4",
    influencerAssigned: "Isabella Turner",
    influencerHandle: "isabellaturner (5.1k followers)",
    assetDescription:
      "15-second Instagram video featuring vibrant visuals and influencer testimonials to boost awareness and drive traffic.",
    influencerBudget: "£500 per post",
  },
  // Additional creative asset entries can be added here.
];

const availableCredits = 135;
const usageCredits = 150;

// =============================================================================
// REQUIRED FIELDS CHECK
// =============================================================================

const requiredCampaignFieldsExist =
  sampleCampaignDetails.campaignName &&
  sampleCampaignDetails.description &&
  sampleCampaignDetails.startDate &&
  sampleCampaignDetails.endDate &&
  sampleCampaignDetails.timeZone &&
  sampleCampaignDetails.primaryContact &&
  sampleObjectives.primaryKPI &&
  sampleObjectives.mainMessage &&
  sampleAudience.location &&
  sampleCompetitors.competitors.length > 0 &&
  sampleCreativeAssets.length > 0;

// =============================================================================
// ERROR BOUNDARY COMPONENT
// =============================================================================

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }
  componentDidCatch(error: Error, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return <div>Something went wrong. Please try again later.</div>;
    }
    return this.props.children;
  }
}

// =============================================================================
// LOCKED REVIEW SECTION COMPONENTS (Boxed Sections)
// =============================================================================

const CampaignOverview: React.FC = () => (
  <section className="space-y-2">
    <div className="border p-4 rounded mb-4">
      <h2 className="text-xl font-bold mb-2">Campaign Overview</h2>
      <div>
        <strong>Campaign Name:</strong> {sampleCampaignDetails.campaignName}
      </div>
      <div>
        <strong>Description:</strong> {sampleCampaignDetails.description}
      </div>
      <div>
        <strong>Start Date:</strong> {sampleCampaignDetails.startDate}
      </div>
      <div>
        <strong>End Date:</strong> {sampleCampaignDetails.endDate}
      </div>
      <div>
        <strong>Time Zone:</strong> {sampleCampaignDetails.timeZone}
      </div>
      <div>
        <strong>Primary Contact:</strong> {sampleCampaignDetails.primaryContact.name},{" "}
        {sampleCampaignDetails.primaryContact.email}, {sampleCampaignDetails.primaryContact.role}
      </div>
      <div>
        <strong>Secondary Contact:</strong> {sampleCampaignDetails.secondaryContact.name},{" "}
        {sampleCampaignDetails.secondaryContact.email}, {sampleCampaignDetails.secondaryContact.role}
      </div>
      <button type="button" className="text-blue-600 underline text-sm">
        [Edit Fields]
      </button>
    </div>
  </section>
);

const BudgetAllocation: React.FC = () => {
  const warningMessage = sampleBudget.budgetAllocationLower
    ? "⚠ Your budget allocation is lower than average for similar campaigns."
    : "";
  return (
    <section className="space-y-2">
      <div className="border p-4 rounded mb-4">
        <h2 className="text-xl font-bold mb-2">Budget Allocation</h2>
        {warningMessage && <p className="text-yellow-600">{warningMessage}</p>}
        <div>
          <strong>Currency:</strong> {sampleBudget.currency}
        </div>
        <div>
          <strong>Total Campaign Budget:</strong> {sampleBudget.totalCampaignBudget}
        </div>
        <div>
          <strong>Budget Allocated to Social Media:</strong> {sampleBudget.budgetAllocatedToSocialMedia}
        </div>
        <div>
          <strong>Influencer Assigned:</strong> {sampleBudget.influencerAssigned} (
          {sampleBudget.influencerHandle})
        </div>
        <button type="button" className="text-blue-600 underline text-sm">
          [Edit Fields]
        </button>
      </div>
    </section>
  );
};

const ObjectivesMessagingReview: React.FC = () => (
  <section className="space-y-2">
    <div className="border p-4 rounded mb-4">
      <h2 className="text-xl font-bold mb-2">Objectives & Messaging</h2>
      <div>
        <strong>Primary KPI:</strong> {sampleObjectives.primaryKPI}
      </div>
      <div>
        <strong>Secondary KPIs:</strong> {sampleObjectives.secondaryKPIs.join(", ")}
      </div>
      <div>
        <strong>Main Campaign Message:</strong> {sampleObjectives.mainMessage}
      </div>
      <div>
        <strong>Hashtags:</strong> {sampleObjectives.hashtags}
      </div>
      <div>
        <strong>Brand Perception Goal:</strong> {sampleObjectives.brandPerception}
      </div>
      <div>
        <strong>Key Benefits:</strong> {sampleObjectives.keyBenefits.join(", ")}
      </div>
      <div>
        <strong>Expected Impact:</strong> Awareness: {sampleObjectives.expectedAchievements}; Purchase Intent:{" "}
        {sampleObjectives.purchaseIntent}
      </div>
      <button type="button" className="text-blue-600 underline text-sm">
        [Edit Fields]
      </button>
    </div>
  </section>
);

const AudienceTargetingReview: React.FC = () => (
  <section className="space-y-2">
    <div className="border p-4 rounded mb-4">
      <h2 className="text-xl font-bold mb-2">Audience Targeting</h2>
      <div>
        <strong>Location:</strong> {sampleAudience.location}
      </div>
      <div>
        <strong>Age Distribution:</strong> {sampleAudience.ageDistribution}
      </div>
      <div>
        <strong>Gender:</strong> {sampleAudience.gender}
      </div>
      <div>
        <strong>Language:</strong> {sampleAudience.language}
      </div>
      <div>
        <strong>Education Level:</strong> {sampleAudience.educationLevel}
      </div>
      <div>
        <strong>Job Titles:</strong> {sampleAudience.jobTitles}
      </div>
      <div>
        <strong>Income Range:</strong> {sampleAudience.incomeRange}
      </div>
      <button type="button" className="text-blue-600 underline text-sm">
        [Edit Fields]
      </button>
    </div>
  </section>
);

const CompetitorsContextReview: React.FC = () => (
  <section className="space-y-2">
    <div className="border p-4 rounded mb-4">
      <h2 className="text-xl font-bold mb-2">Competitors & Context</h2>
      <div>
        <strong>Competitors to Monitor:</strong> {sampleCompetitors.competitors.join(", ")}
      </div>
      <div>
        <strong>Market Hypothesis:</strong> {sampleCompetitors.marketHypothesis}
      </div>
      <button type="button" className="text-blue-600 underline text-sm">
        [Edit Fields]
      </button>
    </div>
  </section>
);

const CreativeAssetsReview: React.FC = () => (
  <section className="space-y-2">
    <div className="border p-4 rounded mb-4">
      <h2 className="text-xl font-bold mb-2">Creative Assets</h2>
      {sampleCreativeAssets.map((asset, index) => (
        <div key={index} className="border p-2 rounded mb-2">
          <div>
            <strong>Asset Name:</strong> {asset.fileName}
          </div>
          <div>
            <strong>Influencer Assigned:</strong> {asset.influencerAssigned} ({asset.influencerHandle})
          </div>
          <div>
            <strong>Asset Description:</strong> {asset.assetDescription}
          </div>
          <div>
            <strong>Influencer Budget:</strong> {asset.influencerBudget}
          </div>
          <button type="button" className="text-blue-600 underline text-sm">
            [Edit Fields]
          </button>
        </div>
      ))}
    </div>
  </section>
);

const CampaignSubmissionSummary: React.FC = () => {
  const submissionWarning =
    usageCredits > availableCredits
      ? `⚠ Submitting this campaign will use ${usageCredits} credits. You only have ${availableCredits} credits. Need more credits? Purchase here.`
      : "";
  return (
    <section className="space-y-2">
      <div className="border p-4 rounded mb-4">
        <h2 className="text-xl font-bold mb-2">Campaign Submission Summary</h2>
        <div>
          <strong>Available Credits:</strong> {availableCredits}
        </div>
        <div>
          <strong>Usage Credits:</strong> {usageCredits}
        </div>
        {submissionWarning && <p className="text-red-600">{submissionWarning}</p>}
        <div className="mt-2">
          <button type="button" className="text-blue-600 underline text-sm">
            [Save as Draft]
          </button>
          <button type="button" className="text-blue-600 underline text-sm ml-4">
            [Edit Fields]
          </button>
        </div>
      </div>
    </section>
  );
};

// =============================================================================
// MAIN PAGE COMPONENT: STEP 5 - REVIEW & SUBMIT
// =============================================================================

export default function ReviewSubmitStep() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const campaignId = searchParams.get('id');
  const { updateData } = useWizard();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Disable the submit button if required fields are missing.
  const isSubmitDisabled = !requiredCampaignFieldsExist;

  const handleSaveAsDraft = () => {
    updateData("reviewSubmit", { status: "draft" });
    alert("Draft saved successfully.");
  };

  const handleSubmit = async (formData: FormData) => {
    try {
      setIsSubmitting(true);
      
      const response = await fetch(`/api/campaigns/${campaignId}/steps`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          step: 5,
          data: {
            submissionStatus: 'submitted'
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit campaign');
      }

      // After successful submission, redirect to the campaign overview or success page
      router.push(`/campaigns/${campaignId}`);
    } catch (error) {
      console.error('Error submitting campaign:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ErrorBoundary>
      <div className="max-w-4xl mx-auto p-5 space-y-8" style={{ paddingBottom: "120px" }}>
        {/* Header & Top Navigation */}
        <Header currentStep={5} totalSteps={5} />
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Step 5: Review & Submit</h1>
          <button
            onClick={handleSaveAsDraft}
            className="px-4 py-2 border border-gray-400 rounded hover:bg-gray-100 transition"
          >
            Save as Draft
          </button>
        </div>

        {/* Locked Review Sections */}
        <CampaignOverview />
        <BudgetAllocation />
        <ObjectivesMessagingReview />
        <AudienceTargetingReview />
        <CompetitorsContextReview />
        <CreativeAssetsReview />
        <CampaignSubmissionSummary />

        {/* Full-width Submit Button */}
        <div className="mt-8">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            className="w-full py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
          >
            Submit Campaign
          </button>
          {isSubmitDisabled && (
            <p className="mt-2 text-center text-red-600 text-sm">
              {!requiredCampaignFieldsExist
                ? "Error: All fields must be completed before submission."
                : "Error: Not enough credits. Purchase more before submission."}
            </p>
          )}
        </div>
      </div>

      {/* Fixed Bottom Navigation Bar using ProgressBar */}
      <ProgressBar
        currentStep={5}
        onStepClick={(step) => router.push(`/campaigns/wizard/step-${step}`)}
        onBack={() => router.push("/campaigns/wizard/step-4")}
        onNext={() => handleSubmit}
        disableNext={isSubmitDisabled}
      />
    </ErrorBoundary>
  );
}
