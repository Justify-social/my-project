"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Image from "next/image";
import { useWizard } from "@/context/WizardContext";
import Header from "@/components/Wizard/Header";
import ProgressBar from "@/components/Wizard/ProgressBar";
import { toast } from "react-hot-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  HashtagIcon,
  StarIcon,
  BriefcaseIcon,
  CheckBadgeIcon,
  ChatBubbleLeftRightIcon,
  PresentationChartBarIcon,
  LightBulbIcon,
  PlusCircleIcon,
  TrashIcon
} from "@heroicons/react/24/outline";

// Define the available KPIs for the table
const kpis = [
  {
    key: "adRecall",
    title: "Ad Recall",
    definition: "The percentage of people who remember seeing your advertisement.",
    example: "After a week, 60% of viewers can recall your ad's main message.",
    icon: "/KPIs/Ad_Recall.svg"
  },
  {
    key: "brandAwareness",
    title: "Brand Awareness",
    definition: "The increase in recognition of your brand.",
    example: "Your brand name is recognised by 30% more people after the campaign.",
    icon: "/KPIs/Brand_Awareness.svg"
  },
  {
    key: "consideration",
    title: "Consideration",
    definition: "The percentage of people considering purchasing from your brand.",
    example: "25% of your audience considers buying your product after seeing your campaign.",
    icon: "/KPIs/Consideration.svg"
  },
  {
    key: "messageAssociation",
    title: "Message Association",
    definition: "How well people link your key messages to your brand.",
    example: "When hearing your slogan, 70% of people associate it directly with your brand.",
    icon: "/KPIs/Message_Association.svg"
  },
  {
    key: "brandPreference",
    title: "Brand Preference",
    definition: "Preference for your brand over competitors.",
    example: "40% of customers prefer your brand when choosing between similar products.",
    icon: "/KPIs/Brand_Preference.svg"
  },
  {
    key: "purchaseIntent",
    title: "Purchase Intent",
    definition: "Likelihood of purchasing your product or service.",
    example: "50% of viewers intend to buy your product after seeing the ad.",
    icon: "/KPIs/Purchase_Intent.svg"
  },
  {
    key: "actionIntent",
    title: "Action Intent",
    definition: "Likelihood of taking a specific action related to your brand (e.g., visiting your website).",
    example: "35% of people are motivated to visit your website after the campaign.",
    icon: "/KPIs/Action_Intent.svg"
  },
  {
    key: "recommendationIntent",
    title: "Recommendation Intent",
    definition: "Likelihood of recommending your brand to others.",
    example: "45% of customers are willing to recommend your brand to friends and family.",
    icon: "/KPIs/Brand_Preference.svg"
  },
  {
    key: "advocacy",
    title: "Advocacy",
    definition: "Willingness to actively promote your brand.",
    example: "20% of your customers regularly share your brand on social media or write positive reviews.",
    icon: "/KPIs/Advocacy.svg"
  },
];

// First, ensure KPI and Feature enums are properly defined
enum KPI {
  adRecall = "adRecall",
  brandAwareness = "brandAwareness",
  consideration = "consideration",
  messageAssociation = "messageAssociation",
  brandPreference = "brandPreference",
  purchaseIntent = "purchaseIntent",
  actionIntent = "actionIntent",
  recommendationIntent = "recommendationIntent",
  advocacy = "advocacy"
}

enum Feature {
  CREATIVE_ASSET_TESTING = "CREATIVE_ASSET_TESTING",
  BRAND_LIFT = "BRAND_LIFT",
  BRAND_HEALTH = "BRAND_HEALTH",
  MIXED_MEDIA_MODELLING = "MIXED_MEDIA_MODELLING"
}

// Features mapping with their icons
const features = [
  { 
    key: Feature.CREATIVE_ASSET_TESTING, 
    title: "Creative Asset Testing",
    icon: "/Creative_Asset_Testing.svg"
  },
  { 
    key: Feature.BRAND_LIFT, 
    title: "Brand Lift",
    icon: "/Brand_Lift.svg"
  },
  { 
    key: Feature.BRAND_HEALTH, 
    title: "Brand Health",
    icon: "/Brand_Health.svg"
  },
  { 
    key: Feature.MIXED_MEDIA_MODELLING, 
    title: "Mixed Media Modelling",
    icon: "/MMM.svg"
  }
];

// Update the validation schema
const ObjectivesSchema = Yup.object().shape({
  mainMessage: Yup.string().required("Main message is required"),
  hashtags: Yup.string(),
  memorability: Yup.string().required("Memorability is required"),
  keyBenefits: Yup.string().required("Key benefits are required"),
  expectedAchievements: Yup.string().required("Expected achievements are required"),
  purchaseIntent: Yup.string().required("Purchase intent is required"),
  brandPerception: Yup.string(),
  primaryKPI: Yup.string()
    .required("Primary KPI is required")
    .oneOf([
      KPI.adRecall,
      KPI.brandAwareness,
      KPI.consideration,
      KPI.messageAssociation,
      KPI.brandPreference,
      KPI.purchaseIntent,
      KPI.actionIntent,
      KPI.recommendationIntent,
      KPI.advocacy
    ], "Invalid KPI selected"),
  secondaryKPIs: Yup.array()
    .of(Yup.string().oneOf([
      KPI.adRecall,
      KPI.brandAwareness,
      KPI.consideration,
      KPI.messageAssociation,
      KPI.brandPreference,
      KPI.purchaseIntent,
      KPI.actionIntent,
      KPI.recommendationIntent,
      KPI.advocacy
    ], "Invalid KPI selected"))
    .max(4, "Maximum 4 secondary KPIs"),
  features: Yup.array()
    .of(Yup.string().oneOf([
      Feature.CREATIVE_ASSET_TESTING,
      Feature.BRAND_LIFT,
      Feature.BRAND_HEALTH,
      Feature.MIXED_MEDIA_MODELLING
    ], "Invalid feature selected"))
});

// Custom Field Component for styled inputs
const StyledField = ({ label, name, type = "text", as, children, required = false, icon, ...props }: any) => {
  return (
    <div className="mb-5">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-blue-500 ml-1">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-2.5 text-gray-400">
            {icon}
          </div>
        )}
        {as ? (
          <Field
            as={as}
            id={name}
            name={name}
            className={`w-full p-2.5 ${icon ? 'pl-10' : 'pl-3'} border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 shadow-sm bg-white`}
            {...props}
          >
            {children}
          </Field>
        ) : (
          <Field
            type={type}
            id={name}
            name={name}
            className={`w-full p-2.5 ${icon ? 'pl-10' : 'pl-3'} border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 shadow-sm bg-white`}
            {...props}
          />
        )}
        <ErrorMessage name={name} component="p" className="mt-1 text-sm text-red-600" />
      </div>
    </div>
  );
};

function FormContent() {
  const router = useRouter();
  const { data, updateData, campaignData, isEditing, loading } = useWizard();
  const searchParams = useSearchParams();
  const campaignId = searchParams.get('id');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log('Campaign Data:', campaignData); // Debug log

  const initialValues = {
    mainMessage: isEditing ? campaignData?.mainMessage || "" : "",
    hashtags: isEditing ? campaignData?.hashtags || "" : "",
    memorability: isEditing ? campaignData?.memorability || "" : "",
    keyBenefits: isEditing ? campaignData?.keyBenefits || "" : "",
    expectedAchievements: isEditing ? campaignData?.expectedAchievements || "" : "",
    purchaseIntent: isEditing ? campaignData?.purchaseIntent || "" : "",
    brandPerception: isEditing ? campaignData?.brandPerception || "" : "",
    primaryKPI: isEditing ? campaignData?.primaryKPI as KPI : "" as KPI,
    secondaryKPIs: isEditing ? (campaignData?.secondaryKPIs || []) : [] as KPI[],
    features: isEditing ? (campaignData?.features || []) : [] as Feature[],
  };

  useEffect(() => {
    // Debug log to verify data mapping
    console.log('Form Initial Values:', {
      mainMessage: campaignData?.mainMessage,
      primaryKPI: campaignData?.primaryKPI,
      secondaryKPIs: campaignData?.secondaryKPIs,
      features: campaignData?.features
    });
  }, [campaignData]);

  const handleSubmit = async (values: any) => {
    try {
      setIsSaving(true);
      setError(null);

      const currentCampaignId = campaignId || (data as any)?.id;
      if (!currentCampaignId) {
        throw new Error('Campaign ID is required');
      }

      const response = await fetch(`/api/campaigns/${currentCampaignId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mainMessage: values.mainMessage,
          hashtags: values.hashtags,
          memorability: values.memorability,
          keyBenefits: values.keyBenefits,
          expectedAchievements: values.expectedAchievements,
          purchaseIntent: values.purchaseIntent,
          brandPerception: values.brandPerception,
          primaryKPI: values.primaryKPI,
          secondaryKPIs: values.secondaryKPIs || [],
          features: values.features || [],
          step: 2,
          submissionStatus: 'draft'
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update campaign');
      }

      // Update local data
      updateData({
        ...data,
        ...result,
        id: currentCampaignId,
        step: 2,
        mainMessage: values.mainMessage,
        hashtags: values.hashtags,
        memorability: values.memorability,
        keyBenefits: values.keyBenefits,
        expectedAchievements: values.expectedAchievements,
        purchaseIntent: values.purchaseIntent,
        brandPerception: values.brandPerception,
        primaryKPI: values.primaryKPI,
        secondaryKPIs: values.secondaryKPIs || [],
        features: values.features || []
      }, result);

      toast.success('Campaign updated successfully');
      router.push(`/campaigns/wizard/step-3?id=${currentCampaignId}`);
      
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update campaign';
      setError(message);
      toast.error(message);
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

  if (loading) {
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
    <div className="max-w-5xl mx-auto p-4 pb-16 bg-white">
      <h1 className="text-2xl font-bold mb-6">Campaign Creation</h1>
      
      <Formik
        initialValues={initialValues}
        validationSchema={ObjectivesSchema}
        onSubmit={handleSubmit}
        enableReinitialize={true}
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
            <Form className="space-y-6">
              {/* KPIs Section */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <PresentationChartBarIcon className="w-5 h-5 mr-2 text-blue-500" />
                  Key Performance Indicators
                </h2>
                <p className="mb-4 text-sm text-gray-600">
                  Select 1 Primary KPI and up to 4 Secondary KPIs. A Primary KPI cannot be selected as a Secondary KPI.
                </p>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border p-2 text-left">KPI</th>
                      <th className="border p-2 text-left">Explanation</th>
                      <th className="border p-2 text-center">Primary KPI</th>
                      <th className="border p-2 text-center">Secondary KPI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {kpis.map((kpi) => (
                      <tr key={kpi.key} className="hover:bg-gray-50">
                        <td className="border p-2 font-medium">
                          <div className="flex items-center">
                            <div className="w-6 h-6 mr-2 flex-shrink-0">
                              <Image 
                                src={kpi.icon}
                                alt={kpi.title}
                                width={24}
                                height={24}
                              />
                            </div>
                            {kpi.title}
                          </div>
                        </td>
                        <td className="border p-2">
                          <div className="text-sm text-gray-600">{kpi.definition}</div>
                          <div className="text-xs text-gray-500 mt-1">Example: {kpi.example}</div>
                        </td>
                        <td className="border p-2 text-center">
                          <Field 
                            type="radio" 
                            name="primaryKPI" 
                            value={kpi.key} 
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="border p-2 text-center">
                          <Field
                            type="checkbox"
                            name="secondaryKPIs"
                            value={kpi.key}
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
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
                <ErrorMessage name="primaryKPI" component="p" className="mt-2 text-sm text-red-600" />
                <ErrorMessage name="secondaryKPIs" component="p" className="mt-2 text-sm text-red-600" />
              </div>

              {/* Primary and Secondary KPIs */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <CheckBadgeIcon className="w-5 h-5 mr-2 text-blue-500" />
                  Primary and Secondary KPIs
                </h2>
                <p className="mb-4 text-sm text-gray-600">
                  Pick up to one Primary KPI and up to any Secondary KPIs (max 4).
                </p>
                
                <div className="mt-4 grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-md font-medium mb-2">Primary KPI</h3>
                    <div className="grid grid-cols-1 gap-2">
                      {values.primaryKPI && (
                        <div className="bg-blue-50 p-2 rounded border border-blue-200 flex items-center">
                          <div className="w-5 h-5 mr-2">
                            <Image 
                              src={kpis.find(k => k.key === values.primaryKPI)?.icon || "/KPIs/Ad_Recall.svg"} 
                              alt="Primary KPI" 
                              width={20} 
                              height={20}
                            />
                          </div>
                          <span className="font-medium">
                            {kpis.find(k => k.key === values.primaryKPI)?.title || values.primaryKPI}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-md font-medium mb-2">Secondary KPIs {values.secondaryKPIs.length > 0 && `(${values.secondaryKPIs.length})`}</h3>
                    <div className="grid grid-cols-1 gap-2">
                      {values.secondaryKPIs.map((kpiKey: KPI) => (
                        <div key={kpiKey} className="bg-gray-50 p-2 rounded border border-gray-200 flex items-center">
                          <div className="w-5 h-5 mr-2">
                            <Image 
                              src={kpis.find(k => k.key === kpiKey)?.icon || "/KPIs/Ad_Recall.svg"} 
                              alt="Secondary KPI" 
                              width={20} 
                              height={20}
                            />
                          </div>
                          <span className="font-medium">
                            {kpis.find(k => k.key === kpiKey)?.title || kpiKey}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Messaging Section */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2 text-blue-500" />
                  Messaging
                </h2>
                <p className="mb-4 text-sm text-gray-600">
                  Define the key messages and value propositions for your campaign.
                </p>
                
                {/* Main Message */}
                <div className="mb-6">
                  <label htmlFor="mainMessage" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    What is the main message of your campaign?
                    <span className="text-blue-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-3 text-gray-400">
                      <DocumentTextIcon className="w-5 h-5" />
                    </div>
                    <Field
                      as="textarea"
                      id="mainMessage"
                      name="mainMessage"
                      placeholder="Discover sustainable living with our eco-friendly products."
                      className="w-full p-2.5 pl-10 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 shadow-sm min-h-[100px]"
                    />
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    {String(values.mainMessage).length}/3000
                  </div>
                  <ErrorMessage name="mainMessage" component="p" className="mt-1 text-sm text-red-600" />
                </div>
                
                {/* Hashtags */}
                <div className="mb-6">
                  <label htmlFor="hashtags" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    Hashtags related to the campaign
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-2.5 text-gray-400">
                      <HashtagIcon className="w-5 h-5" />
                    </div>
                    <Field
                      id="hashtags"
                      name="hashtags"
                      placeholder="#hashtag"
                      className="w-full p-2.5 pl-10 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                    />
                  </div>
                  <ErrorMessage name="hashtags" component="p" className="mt-1 text-sm text-red-600" />
                </div>
                
                {/* Memorability Statement */}
                <div className="mb-6">
                  <label htmlFor="memorability" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    What do you want people to remember after the campaign?
                    <span className="text-blue-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-3 text-gray-400">
                      <StarIcon className="w-5 h-5" />
                    </div>
                    <Field
                      as="textarea"
                      id="memorability"
                      name="memorability"
                      placeholder="Type the value"
                      className="w-full p-2.5 pl-10 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 shadow-sm min-h-[100px]"
                    />
                  </div>
                  <ErrorMessage name="memorability" component="p" className="mt-1 text-sm text-red-600" />
                </div>
                
                {/* Key Benefits */}
                <div className="mb-6">
                  <label htmlFor="keyBenefits" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    What are the key benefits your brand offers?
                    <span className="text-blue-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-3 text-gray-400">
                      <CheckBadgeIcon className="w-5 h-5" />
                    </div>
                    <Field
                      as="textarea"
                      id="keyBenefits"
                      name="keyBenefits"
                      placeholder="Innovative design, Exceptional quality, Outstanding customer service."
                      className="w-full p-2.5 pl-10 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 shadow-sm min-h-[100px]"
                    />
                  </div>
                  <ErrorMessage name="keyBenefits" component="p" className="mt-1 text-sm text-red-600" />
                </div>
              </div>

              {/* Hypotheses Section */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <LightBulbIcon className="w-5 h-5 mr-2 text-blue-500" />
                  Hypotheses
                </h2>
                <p className="mb-4 text-sm text-gray-600">
                  Outline the expected outcomes of your campaign based on your objectives and KPIs.
                </p>
                
                {/* Expected Achievements */}
                <div className="mb-6">
                  <label htmlFor="expectedAchievements" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    What do you expect to achieve with this campaign?
                    <span className="text-blue-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-3 text-gray-400">
                      <ClipboardDocumentListIcon className="w-5 h-5" />
                    </div>
                    <Field
                      as="textarea"
                      id="expectedAchievements"
                      name="expectedAchievements"
                      placeholder="We expect a 20% increase in brand awareness within three months."
                      className="w-full p-2.5 pl-10 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 shadow-sm min-h-[100px]"
                    />
                  </div>
                  <ErrorMessage name="expectedAchievements" component="p" className="mt-1 text-sm text-red-600" />
                </div>
                
                {/* Purchase Intent */}
                <div className="mb-6">
                  <label htmlFor="purchaseIntent" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    How do you think the campaign will impact Purchase Intent?
                    <span className="text-blue-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-3 text-gray-400">
                      <BriefcaseIcon className="w-5 h-5" />
                    </div>
                    <Field
                      as="textarea"
                      id="purchaseIntent"
                      name="purchaseIntent"
                      placeholder="Purchase intent will rise by 15% due to targeted ads."
                      className="w-full p-2.5 pl-10 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 shadow-sm min-h-[100px]"
                    />
                  </div>
                  <ErrorMessage name="purchaseIntent" component="p" className="mt-1 text-sm text-red-600" />
                </div>
              </div>

              {/* Features Section */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <CheckBadgeIcon className="w-5 h-5 mr-2 text-blue-500" />
                  Features to Include
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {features.map(feature => (
                    <label key={feature.key} className="flex items-center p-3 border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer">
                      <Field 
                        type="checkbox" 
                        name="features" 
                        value={feature.key}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 mr-3"
                      />
                      <div className="flex items-center">
                        <div className="w-5 h-5 mr-2">
                          <Image 
                            src={feature.icon} 
                            alt={feature.title} 
                            width={20} 
                            height={20}
                          />
                        </div>
                        <span>{feature.title}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Add bottom padding to prevent progress bar overlap - reduced from pb-8 to pb-4 */}
              <div className="pb-4"></div>
              
              <ProgressBar
                currentStep={2}
                onStepClick={(step) => router.push(`/campaigns/wizard/step-${step}?id=${campaignId || (data as any)?.id}`)}
                onBack={() => router.push(`/campaigns/wizard/step-1?id=${campaignId || (data as any)?.id}`)}
                onNext={submitForm}
                onSaveDraft={() => handleSaveDraft(values)}
                disableNext={isSubmitting}
                isFormValid={isValid}
                isDirty={dirty}
                isSaving={isSaving}
              />
            </Form>
          );
        }}
      </Formik>
    </div>
  );
}

export default function Step2Content() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <LoadingSpinner />;
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <FormContent />
    </Suspense>
  );
}
