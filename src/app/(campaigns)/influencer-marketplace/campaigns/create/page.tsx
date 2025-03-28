"use client";

import React, { useState } from "react";
import HTMLInputElement from '../../../../../components/ui/radio/types/index';
import { useRouter } from "next/navigation";
import { FormField } from "@/components/ui/forms/form-controls";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {  Card  } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Icon } from '@/components/ui/icons';
import { mockInfluencerService } from "@/services/influencer/mock-service";
import { CampaignFormData } from "@/types/influencer";
import Link from "next/link";

export default function CreateCampaignPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<CampaignFormData>>({
    name: "",
    brandId: "",
    budget: 0,
    startDate: "",
    endDate: "",
    primaryObjective: "",
    kpis: [],
    targetAudience: "",
    contentRequirements: [],
    selectedInfluencers: [],
    requiresApproval: true,
  });

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // Handle input change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle number input change with validation
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = value === "" ? 0 : parseFloat(value);
    if (!isNaN(numValue)) {
      setFormData((prev) => ({
        ...prev,
        [name]: numValue,
      }));
    }
  };

  // Handle date change
  const handleDateChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission for step 1
  const handleNextStep = async () => {
    // Validate required fields for step 1
    if (!formData.name || !formData.startDate || !formData.endDate || !formData.budget) {
      alert("Please fill out all required fields");
      return;
    }

    setIsLoading(true);
    try {
      // For prototype, we're just moving to the next step
      // Later we'll save the draft campaign
      setCurrentStep(currentStep + 1);
      
      // Eventually navigate to step 2
      // router.push(`/influencer-marketplace/campaigns/create/step-2`);
    } catch (error) {
      console.error("Error saving campaign: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, this would call the service to save the draft
      // await campaignService.saveAsDraft(formData);
      alert("Campaign draft saved!");
    } catch (error) {
      console.error("Error saving draft: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-5xl">
      <div className="mb-8">
        <div className="flex items-center mb-2">
          <Link href="/influencer-marketplace/campaigns" className="text-blue-600 hover:text-blue-800 flex items-center">
            <Icon name="faArrowLeft" className="mr-2 w-4 h-4" solid={false} />
            Back to Campaigns
          </Link>
        </div>
        <h1 className="text-2xl font-bold font-sora mb-2">Create New Campaign</h1>
        <p className="text-gray-600 font-work-sans">
          Create a new influencer marketing campaign to collaborate with our network of vetted creators.
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
        <div className="flex justify-between max-w-3xl mt-2 text-sm font-work-sans">
          <div className="text-center">Basic Info</div>
          <div className="text-center">Content</div>
          <div className="text-center">Influencers</div>
          <div className="text-center">Review</div>
        </div>
      </div>

      <Card className="p-6 mb-6 font-work-sans">
        <h2 className="text-xl font-bold mb-4 font-sora">Campaign Details</h2>
        <div className="space-y-4">
          <FormField
            label="Campaign Name"
            id="campaign-name"
            required
            helperText="Choose a descriptive name for your campaign"
          >
            <Input
              id="campaign-name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Summer Fashion Collection Launch"
              required
            />
          </FormField>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Start Date"
              id="start-date"
              required
              helperText="When will this campaign start?"
            >
              <Input
                id="start-date"
                name="startDate"
                type="date"
                value={formData.startDate || ""}
                onChange={handleChange}
                required
              />
            </FormField>

            <FormField
              label="End Date"
              id="end-date"
              required
              helperText="When will this campaign end?"
            >
              <Input
                id="end-date"
                name="endDate"
                type="date"
                value={formData.endDate || ""}
                onChange={handleChange}
                required
              />
            </FormField>
          </div>

          <FormField
            label="Campaign Budget"
            id="budget"
            required
            helperText="The total budget for this campaign (USD)"
            startIcon={<Icon name="faDollarSign" className="h-5 w-5 text-gray-400" solid={false} />}
          >
            <Input
              id="budget"
              name="budget"
              type="number"
              value={formData.budget === 0 ? "" : formData.budget}
              onChange={handleNumberChange}
              placeholder="5000"
              required
            />
          </FormField>

          <FormField
            label="Primary Objective"
            id="primary-objective"
            required
            helperText="What's the main goal of this campaign?"
          >
            <Select
              id="primary-objective"
              name="primaryObjective"
              value={formData.primaryObjective}
              onChange={handleChange}
              required
            >
              <option value="">Select an objective</option>
              <option value="Brand Awareness">Brand Awareness</option>
              <option value="Product Launch">Product Launch</option>
              <option value="Engagement">Engagement</option>
              <option value="Conversion">Conversion</option>
              <option value="User-Generated Content">User-Generated Content</option>
              <option value="Other">Other</option>
            </Select>
          </FormField>

          <FormField
            label="Target Audience"
            id="target-audience"
            helperText="Describe your ideal audience for this campaign"
          >
            <Input
              id="target-audience"
              name="targetAudience"
              value={formData.targetAudience || ""}
              onChange={handleChange}
              placeholder="18-34 year old fashion enthusiasts interested in sustainable brands..."
              className="h-24"
            />
          </FormField>
        </div>
      </Card>

      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={handleSaveDraft}
          leftIcon={<Icon name="faSave" solid={false} />}
          disabled={isLoading}
        >
          Save Draft
        </Button>
        <div className="flex items-center gap-3">
          <Link href="/influencer-marketplace/campaigns">
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button
            onClick={handleNextStep}
            rightIcon={<Icon name="faArrowRight" solid={false} />}
            loading={isLoading}
          >
            Next: Content Requirements
          </Button>
        </div>
      </div>
    </div>
  );
} 