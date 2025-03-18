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
import { Icon } from "@/components/ui/icon";
import { EnumTransformers } from '@/utils/enum-transformers';
import { sanitizeStepPayload } from '@/utils/payload-sanitizer';

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
  const [initialValues, setInitialValues] = useState({});
  const [hasLoadedData, setHasLoadedData] = useState(false);
  const [disableNext, setDisableNext] = useState(false);

  console.log('Campaign Data:', campaignData); // Debug log

  useEffect(() => {
    // Update the hasLoadedData flag when campaignData becomes available
    if (campaignData) {
      console.log('Setting hasLoadedData to true for campaign with ID:', campaignData.id);
      setHasLoadedData(true);
    }
  }, [campaignData]);

  useEffect(() => {
    if (campaignData && hasLoadedData) {
      console.log('Campaign Data for Form Initialization:', JSON.stringify(campaignData, null, 2));
      console.log('Messaging data if available:', campaignData.messaging ? 
        JSON.stringify(campaignData.messaging, null, 2) : 'No messaging data found');
      
      // Initialize form with campaign data
      const formInitialValues = {
        // ALWAYS initialize arrays - key fix here
        primaryKPI: campaignData.primaryKPI || null,
        secondaryKPIs: Array.isArray(campaignData.secondaryKPIs) ? campaignData.secondaryKPIs : [],
        features: Array.isArray(campaignData.features) ? campaignData.features : [],
        
        // Extract messaging fields from nested object
        mainMessage: campaignData.messaging?.mainMessage || '',
        hashtags: campaignData.messaging?.hashtags || '',
        memorability: campaignData.messaging?.memorability || '',
        keyBenefits: campaignData.messaging?.keyBenefits || '',
        expectedAchievements: campaignData.messaging?.expectedAchievements || '',
        purchaseIntent: campaignData.messaging?.purchaseIntent || '',
        brandPerception: campaignData.messaging?.brandPerception || ''
      };
      
      console.log('Form Initial Values to be set:', JSON.stringify(formInitialValues, null, 2));
      setInitialValues(formInitialValues);
    }
  }, [campaignData, hasLoadedData]);

  const handleSubmit = async (values: any) => {
    try {
      setIsSaving(true);
      setError(null);

      const currentCampaignId = campaignId || (data as any)?.id;
      if (!currentCampaignId) {
        throw new Error('Campaign ID is required');
      }

      // Transform enum values to match backend format
      const transformedValues = {
        ...values,
        primaryKPI: EnumTransformers.kpiToBackend(values.primaryKPI),
        secondaryKPIs: values.secondaryKPIs?.map((kpi: string) => 
          EnumTransformers.kpiToBackend(kpi)
        ) || [],
        features: values.features?.map((feature: string) => 
          EnumTransformers.featureToBackend(feature)
        ) || [],
      };

      console.log('Submitting with transformed values:', transformedValues);

      const response = await fetch(`/api/campaigns/${currentCampaignId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mainMessage: transformedValues.mainMessage,
          hashtags: transformedValues.hashtags,
          memorability: transformedValues.memorability,
          keyBenefits: transformedValues.keyBenefits,
          expectedAchievements: transformedValues.expectedAchievements,
          purchaseIntent: transformedValues.purchaseIntent,
          brandPerception: transformedValues.brandPerception,
          primaryKPI: transformedValues.primaryKPI,
          secondaryKPIs: transformedValues.secondaryKPIs,
          features: transformedValues.features,
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
        mainMessage: transformedValues.mainMessage,
        hashtags: transformedValues.hashtags,
        memorability: transformedValues.memorability,
        keyBenefits: transformedValues.keyBenefits,
        expectedAchievements: transformedValues.expectedAchievements,
        purchaseIntent: transformedValues.purchaseIntent,
        brandPerception: transformedValues.brandPerception,
        primaryKPI: transformedValues.primaryKPI,
        secondaryKPIs: transformedValues.secondaryKPIs,
        features: transformedValues.features
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

      console.log('Original form values:', JSON.stringify(values, null, 2));
      
      // Ensure KPI and features are properly formatted
      if (values.primaryKPI) {
        console.log('Primary KPI before sanitization:', values.primaryKPI);
      }
      
      if (values.secondaryKPIs) {
        console.log('Secondary KPIs before sanitization:', 
          Array.isArray(values.secondaryKPIs) ? values.secondaryKPIs.join(', ') : values.secondaryKPIs);
      }
      
      if (values.features) {
        console.log('Features before sanitization:', 
          Array.isArray(values.features) ? values.features.join(', ') : values.features);  
      }
      
      // Extract all messaging fields from the form 
      const messagingData = {
        mainMessage: values.mainMessage || '',
        hashtags: values.hashtags || '',
        memorability: values.memorability || '',
        keyBenefits: values.keyBenefits || '',
        expectedAchievements: values.expectedAchievements || '',
        purchaseIntent: values.purchaseIntent || '',
        brandPerception: values.brandPerception || ''
      };
      
      console.log('Messaging data extracted from form:', JSON.stringify(messagingData, null, 2));

      // Step 1: Apply step-specific sanitization
      const sanitizedValues = sanitizeStepPayload({
        ...values,
        // Ensure these fields are included explicitly
        messaging: messagingData
      }, 2);
      
      console.log('After sanitization:', JSON.stringify(sanitizedValues, null, 2));
      
      // Step 2: Transform enum values
      const transformedValues = EnumTransformers.transformObjectToBackend(sanitizedValues);
      console.log('After enum transformation:', JSON.stringify(transformedValues, null, 2));
      
      // Always include status and step
      const requestPayload = {
        ...transformedValues,
        status: 'draft',
        step: 2
      };
      
      console.log('Final request payload:', JSON.stringify(requestPayload, null, 2));

      // Using the same endpoint pattern as Step1Content.tsx
      const url = `/api/campaigns/${campaignId}`;
      console.log(`Making PATCH request to ${url} with transformed data:`, JSON.stringify(requestPayload, null, 2));
      
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('API error response status:', response.status);
        console.error('API error response body:', JSON.stringify(result, null, 2));
        
        if (result.details) {
          console.error('Validation error details:', JSON.stringify(result.details, null, 2));
        }
        
        throw new Error(result.error || 'Failed to save draft');
      }

      console.log('API success response for draft save:', JSON.stringify(result, null, 2));
      
      // Update the campaign data in context directly instead of reloading
      if (typeof updateData === 'function' && result.data) {
        updateData({
          ...data,
          ...result.data,
          id: campaignId,
          step: 2,
          primaryKPI: transformedValues.primaryKPI,
          secondaryKPIs: transformedValues.secondaryKPIs || [],
          features: transformedValues.features || [],
          // Explicitly add all messaging fields too
          mainMessage: messagingData.mainMessage,
          hashtags: messagingData.hashtags,
          memorability: messagingData.memorability,
          keyBenefits: messagingData.keyBenefits,
          expectedAchievements: messagingData.expectedAchievements,
          purchaseIntent: messagingData.purchaseIntent,
          brandPerception: messagingData.brandPerception
        }, result.data);
      }

      toast.success('Draft saved successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save draft';
      console.error('Form submission error:', error);
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
        enableReinitialize
        initialValues={{
          primaryKPI: null,
          secondaryKPIs: [],
          features: [],
          mainMessage: '',
          hashtags: '',
          memorability: '',
          keyBenefits: '',
          expectedAchievements: '',
          purchaseIntent: '',
          brandPerception: '',
          ...initialValues as any
        }}
        validationSchema={Yup.object({
          primaryKPI: Yup.string().required('A primary KPI is required')
        })}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, isValid, dirty, setFieldValue, handleChange }) => {
          console.log('Form State:', { 
            isValid, 
            dirty, 
            hasErrors: Object.keys(errors).length > 0,
            errors,
            values,
            isSubmitting: false 
          });
          
          // Add detailed logging of specific form fields
          console.log('Messaging fields in form:', {
            mainMessage: values.mainMessage,
            hashtags: values.hashtags,
            memorability: values.memorability,
            keyBenefits: values.keyBenefits,
            expectedAchievements: values.expectedAchievements,
            purchaseIntent: values.purchaseIntent
          });
          
          return (
            <Form className="space-y-8">
              {/* KPIs Section */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Icon name="view" className="w-5 h-5 mr-2 text-blue-500" />
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
                              (Array.isArray(values.secondaryKPIs) && 
                                !values.secondaryKPIs.includes(kpi.key) &&
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
                  <Icon name="check" className="w-5 h-5 mr-2 text-blue-500" />
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
                    <h3 className="text-md font-medium mb-2">Secondary KPIs {Array.isArray(values.secondaryKPIs) && values.secondaryKPIs.length > 0 && `(${values.secondaryKPIs.length})`}</h3>
                    <div className="grid grid-cols-1 gap-2">
                      {Array.isArray(values.secondaryKPIs) && values.secondaryKPIs.map((kpiKey: KPI) => (
                        <div key={kpiKey} className="bg-gray-50 p-2 rounded border border-gray-200 flex items-center">
                          <div className="w-5 h-5 mr-2">
                            <Image 
                              src={kpis.find(k => k.key === kpiKey)?.icon || ''}
                              alt={kpiKey}
                              width={20}
                              height={20}
                            />
                          </div>
                          <span className="flex-grow">{kpis.find(k => k.key === kpiKey)?.title || kpiKey}</span>
                          <button
                            type="button"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => {
                              const updatedKpis = values.secondaryKPIs.filter((k: KPI) => k !== kpiKey);
                              setFieldValue('secondaryKPIs', updatedKpis);
                            }}
                          >
                            <Icon name="trash" className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Messaging Section */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h2 className="text-xl font-semibold mb-4">Messaging</h2>
                <p className="text-gray-600 mb-6">
                  Define the key messages and value propositions for your campaign.
                </p>
                
                <div className="space-y-4">
                  <StyledField
                    label="What is the main message of your campaign?"
                    name="mainMessage"
                    as="textarea"
                    rows={3}
                    required
                    icon={<Icon name="info" className="h-5 w-5" />}
                    placeholder="Discover sustainable living with our eco-friendly products."
                  />
                  
                  <StyledField
                    label="Hashtags related to the campaign"
                    name="hashtags"
                    icon={<Icon name="info" className="h-5 w-5" />}
                    placeholder="#hashtag"
                  />
                  
                  <StyledField
                    label="Memorability Score (1-10)"
                    name="memorability"
                    required
                    icon={<Icon name="star" className="h-5 w-5" />}
                    placeholder="Type the value"
                  />
                  
                  <StyledField
                    label="What are the key benefits your brand offers?"
                    name="keyBenefits"
                    required
                    icon={<Icon name="info" className="h-5 w-5" />}
                    placeholder="Innovative design, Exceptional quality, Outstanding customer service."
                  />
                </div>
              </div>

              {/* Hypotheses Section */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h2 className="text-xl font-semibold mb-4">Hypotheses</h2>
                <p className="text-gray-600 mb-6">
                  Outline the expected outcomes of your campaign based on your objectives and KPIs.
                </p>
                
                <div className="space-y-4">
                  <StyledField
                    label="What do you expect to achieve with this campaign?"
                    name="expectedAchievements"
                    as="textarea"
                    rows={2}
                    required
                    icon={<Icon name="check" className="h-5 w-5" />}
                    placeholder="We expect a 20% increase in brand awareness within three months."
                  />
                  
                  <StyledField
                    label="How do you think the campaign will impact Purchase Intent?"
                    name="purchaseIntent"
                    as="textarea"
                    rows={2}
                    required
                    icon={<Icon name="lightBulb" className="h-5 w-5" />}
                    placeholder="Purchase intent will rise by 15% due to targeted ads."
                  />
                  
                  <StyledField
                    label="How will it change people's perception of your brand?"
                    name="brandPerception"
                    as="textarea"
                    rows={2}
                    icon={<Icon name="chatBubble" className="h-5 w-5" />}
                    placeholder="Our brand will be seen as more innovative and customer-focused."
                  />
                </div>
              </div>

              {/* Features Section */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Icon name="check" className="w-5 h-5 mr-2 text-blue-500" />
                  Features to Include
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {features.map(feature => (
                    <div key={feature.key} className="flex items-start space-x-2">
                      <div className="pt-0.5">
                        <Field
                          type="checkbox"
                          name="features"
                          value={feature.key}
                          checked={Array.isArray(values.features) && values.features.includes(feature.key)}
                          onChange={() => {
                            if (!Array.isArray(values.features)) {
                              setFieldValue('features', [feature.key]);
                              return;
                            }
                            
                            const updatedFeatures = values.features.includes(feature.key)
                              ? values.features.filter((f: Feature) => f !== feature.key)
                              : [...values.features, feature.key];
                            setFieldValue('features', updatedFeatures);
                          }}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </div>
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
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Add bottom padding to prevent progress bar overlap - reduced from pb-8 to pb-4 */}
              <div className="pb-4"></div>
              
              <ProgressBar
                currentStep={2}
                onStepClick={(step) => router.push(`/campaigns/wizard/step-${step}?id=${campaignId || (data as any)?.id}`)}
                onBack={() => router.push(`/campaigns/wizard/step-1?id=${campaignId || (data as any)?.id}`)}
                onNext={() => handleSubmit(values)}
                onSaveDraft={() => handleSaveDraft(values)}
                disableNext={disableNext}
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
