"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useWizard } from "../../../../context/WizardContext";
import Header from "../../../../components/Wizard/Header";
import ProgressBar from "../../../../components/Wizard/ProgressBar";
import { FormikHelpers } from "formik";

// Use an env variable to decide whether to disable validations.
// When NEXT_PUBLIC_DISABLE_VALIDATION is "true", the validation schema will be empty.
const disableValidation = process.env.NEXT_PUBLIC_DISABLE_VALIDATION === "true";

const OverviewSchema = disableValidation
  ? Yup.object() // no validations in test mode
  : Yup.object().shape({
      name: Yup.string().required("Campaign name is required"),
      businessGoal: Yup.string()
        .max(3000, "Maximum 3000 characters")
        .required("Business goal is required"),
      startDate: Yup.string().required("Start date is required"),
      endDate: Yup.string().required("End date is required"),
      timeZone: Yup.string().required("Time zone is required"),
      contacts: Yup.string().required("Contacts are required"),
      primaryContact: Yup.object().shape({
        firstName: Yup.string().required("First name is required"),
        surname: Yup.string().required("Surname is required"),
        email: Yup.string().email("Invalid email").required("Email is required"),
        position: Yup.string().required("Position is required"),
      }),
      secondaryContact: Yup.object().shape({
        firstName: Yup.string(),
        surname: Yup.string(),
        email: Yup.string().email("Invalid email"),
        position: Yup.string(),
      }),
      currency: Yup.string().required("Currency is required"),
      totalBudget: Yup.number()
        .min(0, "Budget must be positive")
        .required("Total campaign budget is required"),
      socialMediaBudget: Yup.number()
        .min(0, "Budget must be positive")
        .required("Social media budget is required"),
      platform: Yup.string().required("Platform is required"),
      influencerHandle: Yup.string().required("Influencer handle is required"),
    });

interface Step1Data {
  name: string;
  businessGoal: string;
  startDate: string;
  endDate: string;
  timeZone: string;
  platforms: string[];
  totalBudget: number;
  socialMediaBudget: number;
  primaryContact: {
    firstName: string;
    surname: string;
    email: string;
    position: string;
  };
  secondaryContact?: {
    firstName: string;
    surname: string;
    email: string;
    position: string;
  };
  currency: string;
  platform: string;
  influencerHandle: string;
}

export default function Overview() {
  const router = useRouter();
  const { data, updateData } = useWizard();
  const [formData, setFormData] = useState<Step1Data>({
    name: data.overview.name || "",
    businessGoal: data.overview.businessGoal || "",
    startDate: data.overview.startDate || "",
    endDate: data.overview.endDate || "",
    timeZone: data.overview.timeZone || "UTC",
    platforms: data.overview.platforms || [],
    totalBudget: data.overview.totalBudget || 5000,
    socialMediaBudget: data.overview.socialMediaBudget || 0,
    primaryContact: {
      firstName: data.overview.primaryContact?.firstName || "",
      surname: data.overview.primaryContact?.surname || "",
      email: data.overview.primaryContact?.email || "",
      position: data.overview.primaryContact?.position || "",
    },
    secondaryContact: data.overview.secondaryContact || undefined,
    currency: data.overview.currency || "",
    platform: data.overview.platform || "",
    influencerHandle: data.overview.influencerHandle || "",
  });
  const [error, setError] = useState('');

  const handleSubmit = async (values: Step1Data, actions: FormikHelpers<Step1Data>) => {
    console.log('Form values being submitted:', values); // Debug log

    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error('Failed to create campaign');
      }

      const campaign = await response.json();
      console.log('Campaign created successfully:', campaign);

      // Store campaign ID in wizard context
      updateData('campaignId', campaign.id);
      updateData('step1', values);

      // Proceed to next step
      router.push('/campaigns/wizard/step-2');
    } catch (error) {
      console.error('Error submitting form:', error);
      actions.setStatus({ error: 'Failed to create campaign. Please try again.' });
    } finally {
      actions.setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 pb-20">
      <Header currentStep={1} totalSteps={5} />

      <h1 className="text-2xl font-bold mb-4">Step 1: Campaign Details</h1>

      <div className="flex justify-end mb-4">
        <button className="px-4 py-2 border border-gray-400 rounded hover:bg-gray-100">
          Save as Draft
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="name" className="block font-semibold">
            Campaign Name
          </label>
          <div className="flex items-center">
            <input
              id="name"
              name="name"
              placeholder="Campaign Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 border rounded"
            />
            <button type="button" className="ml-2 px-2 py-1 border rounded text-sm">
              Edit
            </button>
          </div>
          <ErrorMessage name="name" component="div" className="text-red-600 text-sm" />
        </div>

        <div>
          <label htmlFor="businessGoal" className="block font-semibold">
            What business goal does this campaign support?
          </label>
          <div className="flex items-center">
            <textarea
              id="businessGoal"
              name="businessGoal"
              placeholder="e.g. Increase market share by 5% in the next quarter. Launch a new product line targeting millennials."
              value={formData.businessGoal}
              onChange={(e) => setFormData({ ...formData, businessGoal: e.target.value })}
              className="w-full p-2 border rounded"
              maxLength={3000}
            />
            <button type="button" className="ml-2 px-2 py-1 border rounded text-sm">
              Edit
            </button>
          </div>
          <ErrorMessage name="businessGoal" component="div" className="text-red-600 text-sm" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="startDate" className="block font-semibold">
              Start Date
            </label>
            <input
              id="startDate"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full p-2 border rounded"
            />
            <ErrorMessage name="startDate" component="div" className="text-red-600 text-sm" />
          </div>
          <div>
            <label htmlFor="endDate" className="block font-semibold">
              End Date
            </label>
            <input
              id="endDate"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="w-full p-2 border rounded"
            />
            <ErrorMessage name="endDate" component="div" className="text-red-600 text-sm" />
          </div>
          <div>
            <label htmlFor="timeZone" className="block font-semibold">
              Select from common time zones
            </label>
            <select
              id="timeZone"
              name="timeZone"
              value={formData.timeZone}
              onChange={(e) => setFormData({ ...formData, timeZone: e.target.value })}
              className="w-full p-2 border rounded"
            >
              <option value="UTC">UTC</option>
              <option value="GMT">GMT</option>
              <option value="EST">EST</option>
              <option value="PST">PST</option>
            </select>
            <ErrorMessage name="timeZone" component="div" className="text-red-600 text-sm" />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-2">Platforms</h2>
          <div className="space-y-2">
            {['Instagram', 'TikTok', 'YouTube', 'Facebook'].map((platform) => (
              <label key={platform} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.platforms.includes(platform)}
                  onChange={(e) => {
                    const updatedPlatforms = e.target.checked
                      ? [...formData.platforms, platform]
                      : formData.platforms.filter(p => p !== platform);
                    setFormData({ ...formData, platforms: updatedPlatforms });
                  }}
                  className="mr-2"
                />
                {platform}
              </label>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-2">Budget</h2>
          <div className="flex items-center">
            <input
              id="totalBudget"
              name="totalBudget"
              type="number"
              min="0"
              step="100"
              value={formData.totalBudget}
              onChange={(e) => setFormData({ ...formData, totalBudget: Number(e.target.value) })}
              className="w-full p-2 border rounded"
            />
            <button type="button" className="ml-2 px-2 py-1 border rounded text-sm">
              Edit
            </button>
          </div>
          <ErrorMessage name="totalBudget" component="div" className="text-red-600 text-sm" />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.push('/campaigns')}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Next Step
          </button>
        </div>
      </form>
    </div>
  );
}
