"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { FormField } from "@/components/ui/forms/form-controls";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Icon } from "@/components/ui/icons";
import { mockInfluencerService } from "@/services/influencer/mock-service";
import { ContentRequirement } from "@/types/influencer";
import Link from "next/link";

export default function CampaignContentRequirementsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [contentRequirements, setContentRequirements] = useState<Array<ContentRequirement>>([]);
  const [currentRequirement, setCurrentRequirement] = useState<Omit<ContentRequirement, "id">>({
    type: "post",
    description: "",
    required: true,
    deliveryDate: "",
    specs: {
      minDuration: 0,
      maxDuration: 0,
      orientation: "portrait",
      resolution: "",
      aspectRatio: "",
    },
  });
  
  const [currentStep, setCurrentStep] = useState(2);
  const totalSteps = 4;

  // Load saved data from previous step if available
  useEffect(() => {
    // In a real implementation, we'd load from an API or context
    // For now, we're adding some sample data
    if (contentRequirements.length === 0) {
      setContentRequirements([
        {
          id: uuidv4(),
          type: "post",
          description: "Product showcase post featuring our brand",
          required: true,
          deliveryDate: "2023-07-15",
          specs: {
            orientation: "portrait",
            aspectRatio: "4:5",
          },
        },
      ]);
    }
  }, [contentRequirements.length]);

  // Handle input change
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setCurrentRequirement((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle specs change
  const handleSpecsChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setCurrentRequirement((prev) => ({
      ...prev,
      specs: {
        ...prev.specs,
        [name]: value,
      },
    }));
  };

  // Handle number input change with validation
  const handleNumberChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "minDuration" | "maxDuration"
  ) => {
    const value = e.target.value;
    const numValue = value === "" ? 0 : parseFloat(value);
    if (!isNaN(numValue)) {
      setCurrentRequirement((prev) => ({
        ...prev,
        specs: {
          ...prev.specs,
          [field]: numValue,
        },
      }));
    }
  };

  // Handle checkbox change
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setCurrentRequirement((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  // Add new content requirement
  const handleAddRequirement = () => {
    // Validate required fields
    if (!currentRequirement.description) {
      alert("Please add a description for the content requirement");
      return;
    }

    const newRequirement: ContentRequirement = {
      id: uuidv4(),
      ...currentRequirement,
    };

    setContentRequirements((prev) => [...prev, newRequirement]);
    
    // Reset form
    setCurrentRequirement({
      type: "post",
      description: "",
      required: true,
      deliveryDate: "",
      specs: {
        minDuration: 0,
        maxDuration: 0,
        orientation: "portrait",
        resolution: "",
        aspectRatio: "",
      },
    });
  };

  // Remove a content requirement
  const handleRemoveRequirement = (id: string) => {
    setContentRequirements((prev) => prev.filter((req) => req.id !== id));
  };

  // Next step handler
  const handleNextStep = async () => {
    // Validate at least one content requirement
    if (contentRequirements.length === 0) {
      alert("Please add at least one content requirement");
      return;
    }

    setIsLoading(true);
    try {
      // For prototype, we're just moving to the next step
      // In a real implementation, we would save the requirements to an API
      // and then navigate to the next step
      router.push("/influencer-marketplace/campaigns/create/influencers");
    } catch (error) {
      console.error("Error saving content requirements: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Back to previous step
  const handlePreviousStep = () => {
    router.push("/influencer-marketplace/campaigns/create");
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
          Step 2: Define the content requirements for your campaign
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

      {/* Existing content requirements */}
      {contentRequirements.length > 0 && (
        <Card className="p-6 mb-6 font-work-sans">
          <h2 className="text-xl font-bold mb-4 font-sora">Content Requirements</h2>
          <div className="space-y-4">
            {contentRequirements.map((requirement) => (
              <div
                key={requirement.id}
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors relative"
              >
                <button
                  onClick={() => handleRemoveRequirement(requirement.id)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                  aria-label="Remove requirement"
                >
                  <Icon name="faTrash" className="w-4 h-4" solid={false} />
                </button>
                <div className="flex flex-wrap gap-4 mb-2">
                  <div className="flex items-center">
                    <span className="font-medium mr-2">Type:</span>
                    <span className="capitalize">{requirement.type}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium mr-2">Required:</span>
                    <span>{requirement.required ? "Yes" : "No"}</span>
                  </div>
                  {requirement.deliveryDate && (
                    <div className="flex items-center">
                      <span className="font-medium mr-2">Delivery:</span>
                      <span>{requirement.deliveryDate}</span>
                    </div>
                  )}
                </div>
                <p className="text-gray-700 mb-2">{requirement.description}</p>
                {requirement.specs && Object.keys(requirement.specs).some(key => {
                  const specKey = key as keyof typeof requirement.specs;
                  return requirement.specs && requirement.specs[specKey];
                }) && (
                  <div className="mt-2 text-sm text-gray-600">
                    <p className="font-medium mb-1">Specifications:</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      {requirement.specs.orientation && (
                        <span>Orientation: {requirement.specs.orientation}</span>
                      )}
                      {requirement.specs.aspectRatio && (
                        <span>Aspect Ratio: {requirement.specs.aspectRatio}</span>
                      )}
                      {requirement.specs.resolution && (
                        <span>Resolution: {requirement.specs.resolution}</span>
                      )}
                      {requirement.specs.minDuration && requirement.specs.minDuration > 0 && (
                        <span>Min Duration: {requirement.specs.minDuration}s</span>
                      )}
                      {requirement.specs.maxDuration && requirement.specs.maxDuration > 0 && (
                        <span>Max Duration: {requirement.specs.maxDuration}s</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Add new content requirement */}
      <Card className="p-6 mb-6 font-work-sans">
        <h2 className="text-xl font-bold mb-4 font-sora">Add Content Requirement</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Content Type"
              id="content-type"
              required
              helperText="What type of content is required?"
            >
              <Select
                id="content-type"
                name="type"
                value={currentRequirement.type}
                onChange={handleInputChange}
                required
              >
                <option value="post">Post</option>
                <option value="story">Story</option>
                <option value="reel">Reel</option>
                <option value="video">Video</option>
              </Select>
            </FormField>

            <FormField
              label="Delivery Date"
              id="delivery-date"
              helperText="When should the content be delivered?"
            >
              <Input
                id="delivery-date"
                name="deliveryDate"
                type="date"
                value={currentRequirement.deliveryDate || ""}
                onChange={handleInputChange}
              />
            </FormField>
          </div>

          <FormField
            label="Description"
            id="description"
            required
            helperText="Detailed description of the content requirement"
          >
            <Input
              id="description"
              name="description"
              value={currentRequirement.description}
              onChange={handleInputChange}
              placeholder="E.g., Create an authentic product showcase for our new line of sustainable clothing..."
              className="h-24"
              required
            />
          </FormField>

          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="required"
              name="required"
              checked={currentRequirement.required}
              onChange={handleCheckboxChange}
              className="w-4 h-4 text-blue-600"
            />
            <label htmlFor="required" className="ml-2 text-sm font-medium">
              This content is required (not optional)
            </label>
          </div>

          <h3 className="text-lg font-medium font-sora mt-6 mb-3">Technical Specifications</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              label="Orientation"
              id="orientation"
              helperText="Content orientation"
            >
              <Select
                id="orientation"
                name="orientation"
                value={currentRequirement.specs?.orientation || ""}
                onChange={handleSpecsChange}
              >
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
                <option value="square">Square</option>
              </Select>
            </FormField>

            <FormField
              label="Aspect Ratio"
              id="aspect-ratio"
              helperText="E.g., 16:9, 4:5, 1:1"
            >
              <Input
                id="aspect-ratio"
                name="aspectRatio"
                value={currentRequirement.specs?.aspectRatio || ""}
                onChange={handleSpecsChange}
                placeholder="16:9"
              />
            </FormField>

            <FormField
              label="Resolution"
              id="resolution"
              helperText="E.g., 1080p, 4K"
            >
              <Input
                id="resolution"
                name="resolution"
                value={currentRequirement.specs?.resolution || ""}
                onChange={handleSpecsChange}
                placeholder="1080p"
              />
            </FormField>
          </div>

          {(currentRequirement.type === "video" || currentRequirement.type === "reel") && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <FormField
                label="Minimum Duration (seconds)"
                id="min-duration"
                helperText="Minimum length in seconds"
              >
                <Input
                  id="min-duration"
                  type="number"
                  value={currentRequirement.specs?.minDuration || ""}
                  onChange={(e) => handleNumberChange(e, "minDuration")}
                  placeholder="15"
                  min="0"
                />
              </FormField>

              <FormField
                label="Maximum Duration (seconds)"
                id="max-duration"
                helperText="Maximum length in seconds"
              >
                <Input
                  id="max-duration"
                  type="number"
                  value={currentRequirement.specs?.maxDuration || ""}
                  onChange={(e) => handleNumberChange(e, "maxDuration")}
                  placeholder="60"
                  min="0"
                />
              </FormField>
            </div>
          )}

          <div className="mt-6">
            <Button
              onClick={handleAddRequirement}
              leftIcon={<Icon name="faPlus" solid={false} />}
              variant="secondary"
            >
              Add Content Requirement
            </Button>
          </div>
        </div>
      </Card>

      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={handlePreviousStep}
          leftIcon={<Icon name="faArrowLeft" solid={false} />}
          disabled={isLoading}
        >
          Back: Basic Info
        </Button>
        <Button
          onClick={handleNextStep}
          rightIcon={<Icon name="faArrowRight" solid={false} />}
          loading={isLoading}
        >
          Next: Select Influencers
        </Button>
      </div>
    </div>
  );
} 