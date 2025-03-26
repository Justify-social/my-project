"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icons";
import { mockInfluencerService } from "@/services/influencer/mock-service";
import { formatDateRange, formatCurrency, formatFollowerCount } from "@/lib/utils";
import { InfluencerCampaign, Influencer, ContentRequirement } from "@/types/influencer";

// Summary Section Component for displaying each step's data
interface SummarySectionProps {
  title: string;
  stepNumber: number;
  onEdit: () => void;
  children: React.ReactNode;
}

const SummarySection: React.FC<SummarySectionProps> = ({
  title,
  stepNumber,
  onEdit,
  children
}) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-[var(--divider-color)] mb-6 transition-all hover:shadow-md font-work-sans">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <div className="h-8 w-8 bg-[rgba(0,191,255,0.1)] text-[var(--accent-color)] rounded-full flex items-center justify-center mr-3 font-semibold">
            {stepNumber}
          </div>
          <h2 className="text-lg font-semibold text-[var(--primary-color)] font-sora">{title}</h2>
        </div>
        <button 
          onClick={onEdit} 
          className="group text-[var(--primary-color)] text-sm flex items-center transition-colors duration-200 font-work-sans" 
          aria-label={`Edit ${title}`}
        >
          <Icon name="faPenToSquare" className="h-4 w-4 mr-2 group-hover:text-[var(--accent-color)] transition-colors duration-200" iconType="button" solid={false} />
          <span className="group-hover:text-[var(--accent-color)] transition-colors duration-200">Edit</span>
        </button>
      </div>
      <div className="pl-11 font-work-sans">
        {children}
      </div>
    </div>
  );
};

// Data Display Components
interface DataItemProps {
  label: string;
  value: React.ReactNode;
  isHighlighted?: boolean;
}

const DataItem: React.FC<DataItemProps> = ({ label, value, isHighlighted = false }) => {
  return (
    <div className="mb-4 font-work-sans">
      <h4 className="text-sm font-medium text-[var(--secondary-color)] mb-1 font-sora">{label}</h4>
      <p className={`${isHighlighted ? "font-medium" : ""} text-[var(--primary-color)] font-work-sans`}>
        {value}
      </p>
    </div>
  );
};

// Main Campaign Review Component
export default function CampaignReviewPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [campaign, setCampaign] = useState<Partial<InfluencerCampaign> | null>(null);
  const [selectedInfluencers, setSelectedInfluencers] = useState<{
    influencer: Influencer;
    budget: number;
    notes: string;
  }[]>([]);
  
  const [currentStep, setCurrentStep] = useState(4);
  const totalSteps = 4;

  // Load draft campaign data from local storage or service
  useEffect(() => {
    const loadCampaignData = async () => {
      setIsLoading(true);
      try {
        // In a real implementation, we would fetch from API or local storage
        // For now, let's use mock data
        const campaignData = await mockInfluencerService.getDraftCampaign();
        const influencersData = await mockInfluencerService.getSelectedInfluencers();
        
        setCampaign(campaignData);
        setSelectedInfluencers(influencersData);
      } catch (error) {
        console.error("Error loading campaign data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCampaignData();
  }, []);

  // Handle navigation to edit steps
  const handleEditBasicInfo = () => {
    router.push("/influencer-marketplace/campaigns/create");
  };

  const handleEditContentRequirements = () => {
    router.push("/influencer-marketplace/campaigns/create/content");
  };

  const handleEditInfluencers = () => {
    router.push("/influencer-marketplace/campaigns/create/influencers");
  };

  // Handle campaign launch
  const handleLaunchCampaign = async () => {
    setIsSubmitting(true);
    try {
      // In a real implementation, we would submit to API
      await mockInfluencerService.launchCampaign();
      
      // Navigate to campaigns list after successful launch
      router.push("/influencer-marketplace/campaigns?status=launched");
    } catch (error) {
      console.error("Error launching campaign:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Back to previous step
  const handlePreviousStep = () => {
    router.push("/influencer-marketplace/campaigns/create/influencers");
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-8 max-w-5xl font-work-sans">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent-color)]"></div>
          <p className="mt-4 text-[var(--secondary-color)]">Loading campaign data...</p>
        </div>
      </div>
    );
  }

  // Error state if no campaign data
  if (!campaign) {
    return (
      <div className="container mx-auto py-8 max-w-5xl font-work-sans">
        <div className="bg-red-50 p-6 rounded-lg border border-red-200">
          <h2 className="text-red-700 font-semibold font-sora mb-2">Campaign Data Not Found</h2>
          <p className="text-red-600 mb-4">We couldn't load your campaign data. This might be because you haven't started creating a campaign yet.</p>
          <Button onClick={() => router.push("/influencer-marketplace/campaigns/create")}>
            Start Creating a Campaign
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-5xl font-work-sans">
      <div className="mb-8">
        <div className="flex items-center mb-2">
          <Link href="/influencer-marketplace/campaigns" className="text-blue-600 hover:text-blue-800 flex items-center">
            <Icon name="faArrowLeft" className="mr-2 w-4 h-4" solid={false} />
            Back to Campaigns
          </Link>
        </div>
        <h1 className="text-2xl font-bold font-sora mb-2">Create New Campaign</h1>
        <p className="text-gray-600 font-work-sans">
          Step 4: Review and Launch
        </p>
      </div>

      {/* Step indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-3xl">
          {Array.from({ length: totalSteps }).map((_, idx) => (
            <div key={idx} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full font-medium ${
                  idx + 1 === currentStep
                    ? "bg-blue-600 text-white"
                    : idx + 1 < currentStep
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {idx + 1 < currentStep ? (
                  <Icon name="faCheck" solid={false} />
                ) : (
                  idx + 1
                )}
              </div>
              {idx < totalSteps - 1 && (
                <div
                  className={`h-1 w-16 sm:w-24 md:w-32 ${
                    idx + 1 < currentStep ? "bg-green-500" : "bg-gray-200"
                  }`}
                ></div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div id="review-container">
        {/* Campaign Overview */}
        <SummarySection 
          title="Campaign Overview" 
          stepNumber={1} 
          onEdit={handleEditBasicInfo}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <DataItem 
                label="Campaign Name" 
                value={campaign.name}
                isHighlighted={true} 
              />
              <DataItem 
                label="Brand" 
                value={
                  <div className="flex items-center">
                    {campaign.brand?.logo && (
                      <Image 
                        src={campaign.brand.logo} 
                        alt={campaign.brand?.name || "Brand"} 
                        width={24} 
                        height={24} 
                        className="mr-2 rounded-full"
                      />
                    )}
                    {campaign.brand?.name}
                  </div>
                } 
              />
              <DataItem 
                label="Status" 
                value={
                  <Badge variant="outline" className="bg-yellow-50 border-yellow-200 text-yellow-700">
                    Draft
                  </Badge>
                } 
              />
              <DataItem 
                label="Objectives" 
                value={
                  <div>
                    <div className="font-medium">Primary: {campaign.objectives?.primary}</div>
                    {campaign.objectives?.secondary && campaign.objectives.secondary.length > 0 && (
                      <div className="mt-1">
                        Secondary: {campaign.objectives.secondary.join(", ")}
                      </div>
                    )}
                  </div>
                } 
              />
            </div>
            <div>
              <DataItem 
                label="Budget" 
                value={formatCurrency(campaign.budget || 0)} 
                isHighlighted={true}
              />
              <DataItem 
                label="Campaign Period" 
                value={
                  campaign.startDate && campaign.endDate 
                    ? formatDateRange(campaign.startDate, campaign.endDate)
                    : "Not specified"
                } 
              />
              <DataItem 
                label="Target Audience" 
                value={campaign.objectives?.targetAudience || "Not specified"} 
              />
              <DataItem 
                label="KPIs" 
                value={
                  campaign.objectives?.kpis && campaign.objectives.kpis.length > 0
                    ? campaign.objectives.kpis.join(", ")
                    : "None specified"
                } 
              />
            </div>
          </div>
        </SummarySection>

        {/* Content Requirements */}
        <SummarySection 
          title="Content Requirements" 
          stepNumber={2} 
          onEdit={handleEditContentRequirements}
        >
          {campaign.contentRequirements && campaign.contentRequirements.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {campaign.contentRequirements.map((requirement: ContentRequirement, index) => (
                <Card key={index} className="p-4 border border-[var(--divider-color)]">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-[var(--primary-color)] font-sora">
                        {requirement.type}
                      </h3>
                      <p className="text-sm text-[var(--secondary-color)] mt-1">
                        {requirement.description}
                      </p>
                      
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {requirement.quantity && (
                          <div>
                            <span className="text-xs text-[var(--secondary-color)]">Quantity:</span>
                            <p className="text-sm font-medium">{requirement.quantity}</p>
                          </div>
                        )}
                        
                        {requirement.specs && Object.keys(requirement.specs).length > 0 && (
                          <div className="sm:col-span-2 mt-2">
                            <span className="text-xs text-[var(--secondary-color)]">Specifications:</span>
                            <ul className="mt-1 pl-5 list-disc text-sm">
                              {Object.entries(requirement.specs).map(([key, value]) => (
                                <li key={key}>
                                  {key}: {value}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <Badge 
                      variant="outline" 
                      className="bg-blue-50 border-blue-200 text-blue-700"
                    >
                      {requirement.platform}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <p className="text-[var(--secondary-color)]">No content requirements specified.</p>
              <button 
                onClick={handleEditContentRequirements}
                className="mt-2 text-[var(--accent-color)] hover:underline"
              >
                Add Content Requirements
              </button>
            </div>
          )}
        </SummarySection>

        {/* Selected Influencers */}
        <SummarySection 
          title="Selected Influencers" 
          stepNumber={3} 
          onEdit={handleEditInfluencers}
        >
          {selectedInfluencers && selectedInfluencers.length > 0 ? (
            <div>
              <div className="mb-4">
                <p className="text-sm text-[var(--secondary-color)]">
                  <strong>{selectedInfluencers.length}</strong> influencers selected with a total budget of{" "}
                  <strong>{formatCurrency(selectedInfluencers.reduce((sum, item) => sum + item.budget, 0))}</strong>
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedInfluencers.map((item, index) => (
                  <Card key={index} className="p-4 border border-[var(--divider-color)]">
                    <div className="flex">
                      <div className="mr-4">
                        <Image 
                          src={item.influencer.avatar} 
                          alt={item.influencer.name} 
                          width={60} 
                          height={60} 
                          className="rounded-full"
                        />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium text-[var(--primary-color)] font-sora">
                            {item.influencer.name}
                          </h3>
                          <Badge 
                            variant="outline" 
                            className="bg-purple-50 border-purple-200 text-purple-700"
                          >
                            {item.influencer.primaryPlatform}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-[var(--secondary-color)] mt-1">
                          @{item.influencer.handle}
                        </p>
                        
                        <div className="mt-2 flex items-center">
                          <Icon name="faUsers" className="mr-1 w-4 h-4 text-[var(--secondary-color)]" solid={false} />
                          <span className="text-sm">{formatFollowerCount(item.influencer.followers)}</span>
                        </div>
                        
                        <div className="mt-3 bg-gray-50 p-2 rounded">
                          <p className="text-sm font-medium">
                            Budget: {formatCurrency(item.budget)}
                          </p>
                          {item.notes && (
                            <p className="text-sm mt-1 text-[var(--secondary-color)]">
                              Notes: {item.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <p className="text-[var(--secondary-color)]">No influencers selected.</p>
              <button 
                onClick={handleEditInfluencers}
                className="mt-2 text-[var(--accent-color)] hover:underline"
              >
                Select Influencers
              </button>
            </div>
          )}
        </SummarySection>

        {/* Launch Confirmation */}
        <Card className="p-6 border-2 border-[var(--accent-color)] bg-blue-50 mt-8 mb-12">
          <h3 className="text-lg font-semibold text-[var(--primary-color)] font-sora mb-3">
            Ready to Launch?
          </h3>
          <p className="text-[var(--secondary-color)] mb-6">
            Once launched, this campaign will be visible to the selected influencers and they will be notified to review your proposal.
          </p>
          
          <div className="flex flex-wrap gap-4 justify-end">
            <Button 
              variant="outline" 
              onClick={() => router.push("/influencer-marketplace/campaigns")}
              disabled={isSubmitting}
            >
              Save as Draft
            </Button>
            <Button 
              onClick={handleLaunchCampaign}
              loading={isSubmitting}
              className="bg-[var(--accent-color)] hover:bg-blue-600"
            >
              <Icon name="faRocket" className="mr-2 w-4 h-4" solid={false} />
              Launch Campaign
            </Button>
          </div>
        </Card>

        {/* Navigation buttons */}
        <div className="flex justify-between items-center mb-8">
          <Button
            variant="outline"
            onClick={handlePreviousStep}
            leftIcon={<Icon name="faArrowLeft" solid={false} />}
            disabled={isSubmitting}
          >
            Back: Select Influencers
          </Button>
          <Button
            onClick={handleLaunchCampaign}
            rightIcon={<Icon name="faRocket" solid={false} />}
            loading={isSubmitting}
            className="bg-[var(--accent-color)] hover:bg-blue-600"
          >
            Launch Campaign
          </Button>
        </div>
      </div>
    </div>
  );
} 