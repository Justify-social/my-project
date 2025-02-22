"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useWizard } from "../../../../context/WizardContext";
import Header from "../../../../components/Wizard/Header";
import ProgressBar from "../../../../components/Wizard/ProgressBar";
import { KPI, Feature } from '@prisma/client';
import { toast } from "react-hot-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

// Define the available KPIs for the table
const kpis = [
  {
    key: "adRecall",
    title: "Ad Recall",
    definition: "The percentage of people who remember seeing your advertisement.",
    example: "After a week, 60% of viewers can recall your ad's main message.",
  },
  {
    key: "brandAwareness",
    title: "Brand Awareness",
    definition: "The increase in recognition of your brand.",
    example: "Your brand name is recognised by 30% more people after the campaign.",
  },
  {
    key: "consideration",
    title: "Consideration",
    definition: "The percentage of people considering purchasing from your brand.",
    example: "25% of your audience considers buying your product after seeing your campaign.",
  },
  {
    key: "messageAssociation",
    title: "Message Association",
    definition: "How well people link your key messages to your brand.",
    example: "When hearing your slogan, 70% of people associate it directly with your brand.",
  },
  {
    key: "brandPreference",
    title: "Brand Preference",
    definition: "Preference for your brand over competitors.",
    example: "40% of customers prefer your brand when choosing between similar products.",
  },
  {
    key: "purchaseIntent",
    title: "Purchase Intent",
    definition: "Likelihood of purchasing your product or service.",
    example: "50% of viewers intend to buy your product after seeing the ad.",
  },
  {
    key: "actionIntent",
    title: "Action Intent",
    definition: "Likelihood of taking a specific action related to your brand (e.g., visiting your website).",
    example: "35% of people are motivated to visit your website after the campaign.",
  },
  {
    key: "recommendationIntent",
    title: "Recommendation Intent",
    definition: "Likelihood of recommending your brand to others.",
    example: "45% of customers are willing to recommend your brand to friends and family.",
  },
  {
    key: "advocacy",
    title: "Advocacy",
    definition: "Willingness to actively promote your brand.",
    example: "20% of your customers regularly share your brand on social media or write positive reviews.",
  },
];

// Define the validation schema for Step 2 fields.
const ObjectivesSchema = Yup.object().shape({
  mainMessage: Yup.string().required("Main message is required"),
  hashtags: Yup.string(),
  memorability: Yup.string().required("Memorability is required"),
  keyBenefits: Yup.string().required("Key benefits are required"),
  expectedAchievements: Yup.string().required("Expected achievements are required"),
  purchaseIntent: Yup.string().required("Purchase intent is required"),
  primaryKPI: Yup.string().oneOf(Object.values(KPI)).required("Primary KPI is required"),
  secondaryKPIs: Yup.array()
    .of(Yup.string().oneOf(Object.values(KPI)))
    .max(4, "Maximum 4 secondary KPIs"),
  features: Yup.array()
    .of(Yup.string().oneOf(Object.values(Feature)))
});

export default function CampaignStep2() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const campaignId = searchParams.get('id');
  const { data, updateData } = useWizard();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add debug logging
  useEffect(() => {
    console.log('Campaign ID from URL:', campaignId);
    console.log('Current data:', data);
  }, [campaignId, data]);

  // Load campaign data
  useEffect(() => {
    const loadCampaignData = async () => {
      if (campaignId) {
        try {
          setIsLoading(true);
          setError(null);
          const response = await fetch(`/api/campaigns/${campaignId}`);
          const data = await response.json();
          
          if (!response.ok) {
            throw new Error(data.error || 'Failed to load campaign');
          }

          if (data.success) {
            updateData(data.campaign);
            toast.success('Campaign data loaded');
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to load campaign';
          setError(message);
          toast.error(message);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    loadCampaignData();
  }, [campaignId]);

  const initialValues = {
    mainMessage: data.objectives?.mainMessage || "",
    hashtags: data.objectives?.hashtags || "",
    memorability: data.objectives?.memorability || "",
    keyBenefits: data.objectives?.keyBenefits || "",
    expectedAchievements: data.objectives?.expectedAchievements || "",
    purchaseIntent: data.objectives?.purchaseIntent || "",
    primaryKPI: data.objectives?.primaryKPI || "" as KPI,
    secondaryKPIs: data.objectives?.secondaryKPIs || [] as KPI[],
    features: data.objectives?.features || [] as Feature[],
  };

  const handleSubmit = async (values: any) => {
    try {
      setIsSaving(true);
      setError(null);

      // Get campaign ID from context if not in URL
      const currentCampaignId = campaignId || data.id;

      if (!currentCampaignId) {
        throw new Error('Campaign ID is required');
      }

      console.log('Submitting with campaign ID:', currentCampaignId);

      const response = await fetch(`/api/campaigns/${currentCampaignId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          objectives: {  // Nest under objectives
            mainMessage: values.mainMessage,
            hashtags: values.hashtags,
            memorability: values.memorability,
            keyBenefits: values.keyBenefits,
            expectedAchievements: values.expectedAchievements,
            purchaseIntent: values.purchaseIntent,
            primaryKPI: values.primaryKPI,
            secondaryKPIs: values.secondaryKPIs,
            features: values.features,
          },
          step: 2
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update campaign');
      }

      // Update local data
      updateData({
        ...data,
        objectives: values,
        id: currentCampaignId
      });

      toast.success('Campaign updated successfully');
      
      // Navigate to next step
      console.log('Navigating to step 3...');
      router.push(`/campaigns/wizard/step-3?id=${currentCampaignId}`);
      
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update campaign';
      setError(message);
      toast.error(message);
      console.error('Submit error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDraft = async (values: any) => {
    try {
      setIsSaving(true);
      setError(null);

      if (!campaignId) {
        throw new Error('Campaign ID is required');
      }

      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          submissionStatus: 'draft'
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save draft');
      }

      toast.success('Draft saved successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save draft';
      setError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
        <p className="ml-2">Loading campaign data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <h3 className="text-red-800 font-semibold">Error</h3>
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => router.push('/campaigns')}
          className="mt-4 btn btn-secondary"
        >
          Return to Campaigns
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 pb-32">
      <Header currentStep={2} totalSteps={5} />
      
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Step 2: Objectives & Messaging</h1>
        <button 
          type="button"
          onClick={() => handleSaveDraft(initialValues)}
          className="px-4 py-2 border border-gray-400 rounded hover:bg-gray-100 flex items-center"
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <LoadingSpinner className="w-4 h-4 mr-2" />
              Saving...
            </>
          ) : (
            'Save Draft'
          )}
        </button>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={ObjectivesSchema}
        onSubmit={handleSubmit}
        validateOnMount={true}
        validateOnChange={true}
      >
        {({ values, submitForm, isValid, dirty, errors, isSubmitting }) => {
          console.log('Form State:', { 
            isValid, 
            dirty, 
            hasErrors: Object.keys(errors).length > 0,
            errors,
            values,
            isSubmitting 
          });
          
          return (
            <>
              <Form className="space-y-8">
                {/* Collapsible KPI Table */}
                <details open className="mb-6 border p-4 rounded">
                  <summary className="font-bold text-lg mb-2 cursor-pointer">
                    Key Performance Indicators (KPIs)
                  </summary>
                  <p className="mb-4 text-sm text-gray-600">
                    Select 1 Primary KPI and up to 4 Secondary KPIs. A Primary KPI cannot be selected as a Secondary KPI.
                  </p>
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="border p-2 text-left">KPI Explanation</th>
                        <th className="border p-2 text-center">Primary KPI</th>
                        <th className="border p-2 text-center">Secondary KPI</th>
                      </tr>
                    </thead>
                    <tbody>
                      {kpis.map((kpi) => (
                        <tr key={kpi.key}>
                          <td className="border p-2">
                            <div className="font-bold">{kpi.title}</div>
                            <div className="text-sm text-gray-600">{kpi.definition}</div>
                            <div className="text-xs text-gray-500">Example: {kpi.example}</div>
                          </td>
                          <td className="border p-2 text-center">
                            <Field type="radio" name="primaryKPI" value={kpi.key} />
                          </td>
                          <td className="border p-2 text-center">
                            <Field
                              type="checkbox"
                              name="secondaryKPIs"
                              value={kpi.key}
                              disabled={
                                values.primaryKPI === kpi.key ||
                                (!values.secondaryKPIs.includes(kpi.key) &&
                                  values.secondaryKPIs.length >= 4)
                              }
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </details>

                {/* Messaging Section */}
                <div>
                  <h2 className="text-xl font-bold mb-2">Messaging</h2>
                  <p className="mb-4 text-gray-600">
                    Define the key messages and value propositions for your campaign.
                  </p>
                  {/* Main Message */}
                  <div>
                    <label htmlFor="mainMessage" className="block font-semibold">
                      What is the main message of your campaign?
                    </label>
                    <div className="flex items-center">
                      <Field
                        as="textarea"
                        id="mainMessage"
                        name="mainMessage"
                        placeholder="Discover sustainable living with our eco-friendly products."
                        className="w-full p-2 border rounded"
                        maxLength={3000}
                      />
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      {String(values.mainMessage).length}/3000
                    </div>
                    <ErrorMessage name="mainMessage" component="div" className="text-red-600 text-sm" />
                  </div>
                  {/* Hashtags */}
                  <div>
                    <label htmlFor="hashtags" className="block font-semibold">
                      Hashtags related to the campaign
                    </label>
                    <Field
                      id="hashtags"
                      name="hashtags"
                      placeholder="#hashtag"
                      className="w-full p-2 border rounded"
                    />
                    <ErrorMessage name="hashtags" component="div" className="text-red-600 text-sm" />
                  </div>
                  {/* Memorability Statement */}
                  <div>
                    <label htmlFor="memorability" className="block font-semibold">
                      What do you want people to remember after the campaign?
                    </label>
                    <div className="flex items-center">
                      <Field
                        as="textarea"
                        id="memorability"
                        name="memorability"
                        placeholder="Type the value"
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <ErrorMessage name="memorability" component="div" className="text-red-600 text-sm" />
                  </div>
                  {/* Key Benefits */}
                  <div>
                    <label htmlFor="keyBenefits" className="block font-semibold">
                      What are the key benefits your brand offers?
                    </label>
                    <div className="flex items-center">
                      <Field
                        as="textarea"
                        id="keyBenefits"
                        name="keyBenefits"
                        placeholder="Innovative design, Exceptional quality, Outstanding customer service."
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <ErrorMessage name="keyBenefits" component="div" className="text-red-600 text-sm" />
                  </div>
                </div>

                {/* Hypotheses Section */}
                <div>
                  <h2 className="text-xl font-bold mb-2">Hypotheses</h2>
                  <p className="mb-4 text-gray-600">
                    Outline the expected outcomes of your campaign based on your objectives and KPIs.
                  </p>
                  <div>
                    <label htmlFor="expectedAchievements" className="block font-semibold">
                      What do you expect to achieve with this campaign?
                    </label>
                    <Field
                      as="textarea"
                      id="expectedAchievements"
                      name="expectedAchievements"
                      placeholder="We expect a 20% increase in brand awareness within three months."
                      className="w-full p-2 border rounded"
                    />
                    <ErrorMessage name="expectedAchievements" component="div" className="text-red-600 text-sm" />
                  </div>
                  <div>
                    <label htmlFor="purchaseIntent" className="block font-semibold">
                      How do you think the campaign will impact Purchase Intent?
                    </label>
                    <Field
                      as="textarea"
                      id="purchaseIntent"
                      name="purchaseIntent"
                      placeholder="Purchase intent will rise by 15% due to targeted ads."
                      className="w-full p-2 border rounded"
                    />
                    <ErrorMessage name="purchaseIntent" component="div" className="text-red-600 text-sm" />
                  </div>
                </div>

                {/* Features Section */}
                <div>
                  <h2 className="text-xl font-bold mb-2">Features to Include</h2>
                  <div role="group" className="flex flex-col">
                    <label className="inline-flex items-center">
                      <Field type="checkbox" name="features" value="Creative Asset Testing" />
                      <span className="ml-2">Creative Asset Testing</span>
                    </label>
                    <label className="inline-flex items-center">
                      <Field type="checkbox" name="features" value="Brand Lift" />
                      <span className="ml-2">Brand Lift</span>
                    </label>
                    <label className="inline-flex items-center">
                      <Field type="checkbox" name="features" value="Brand Health" />
                      <span className="ml-2">Brand Health</span>
                    </label>
                    <label className="inline-flex items-center">
                      <Field type="checkbox" name="features" value="Mixed Media Modelling" />
                      <span className="ml-2">Mixed Media Modelling</span>
                    </label>
                  </div>
                </div>
              </Form>
              
              <ProgressBar
                currentStep={2}
                onStepClick={(step) => router.push(`/campaigns/wizard/step-${step}?id=${campaignId || data.id}`)}
                onBack={() => router.push(`/campaigns/wizard/step-1?id=${campaignId || data.id}`)}
                onNext={submitForm}
                disableNext={isSubmitting}
                isFormValid={isValid}
                isDirty={dirty}
              />
            </>
          );
        }}
      </Formik>
    </div>
  );
}
