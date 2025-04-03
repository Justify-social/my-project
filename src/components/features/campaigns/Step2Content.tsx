// Updated import paths via tree-shake script - 2025-04-01T17:13:32.217Z
"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Image from "next/image";
import { useWizard } from "@/components/features/campaigns/WizardContext";
import Header from "@/components/features/campaigns/Header";
import ProgressBar from "@/components/features/campaigns/ProgressBar";
import { toast } from "react-hot-toast";
import { WizardSkeleton } from "@/components/ui/loading-skeleton";
import { Icon } from '@/components/ui/atoms/icon'
import { EnumTransformers } from '@/utils/enum-transformers';
import { sanitizeStepPayload } from '@/utils/payload-sanitizer';

// Define the available KPIs for the table
const kpis = [{
  key: "adRecall",
  title: "Ad Recall",
  definition: "The percentage of people who remember seeing your advertisement.",
  example: "After a week, 60% of viewers can recall your ad's main message.",
  icon: "/icons/kpis/Ad_Recall.svg"
}, {
  key: "brandAwareness",
  title: "Brand Awareness",
  definition: "The increase in recognition of your brand.",
  example: "Your brand name is recognised by 30% more people after the campaign.",
  icon: "/icons/kpis/Brand_Awareness.svg"
}, {
  key: "consideration",
  title: "Consideration",
  definition: "The percentage of people considering purchasing from your brand.",
  example: "25% of your audience considers buying your product after seeing your campaign.",
  icon: "/icons/kpis/Consideration.svg"
}, {
  key: "messageAssociation",
  title: "Message Association",
  definition: "How well people link your key messages to your brand.",
  example: "When hearing your slogan, 70% of people associate it directly with your brand.",
  icon: "/icons/kpis/Message_Association.svg"
}, {
  key: "brandPreference",
  title: "Brand Preference",
  definition: "Preference for your brand over competitors.",
  example: "40% of customers prefer your brand when choosing between similar products.",
  icon: "/icons/kpis/Brand_Preference.svg"
}, {
  key: "purchaseIntent",
  title: "Purchase Intent",
  definition: "Likelihood of purchasing your product or service.",
  example: "50% of viewers intend to buy your product after seeing the ad.",
  icon: "/icons/kpis/Purchase_Intent.svg"
}, {
  key: "actionIntent",
  title: "Action Intent",
  definition: "Likelihood of taking a specific action related to your brand (e.g., visiting your website).",
  example: "35% of people are motivated to visit your website after the campaign.",
  icon: "/icons/kpis/Action_Intent.svg"
}, {
  key: "recommendationIntent",
  title: "Recommendation Intent",
  definition: "Likelihood of recommending your brand to others.",
  example: "45% of customers are willing to recommend your brand to friends and family.",
  icon: "/icons/kpis/Brand_Preference.svg"
}, {
  key: "advocacy",
  title: "Advocacy",
  definition: "Willingness to actively promote your brand.",
  example: "20% of your customers regularly share your brand on social media or write positive reviews.",
  icon: "/icons/kpis/Advocacy.svg"
}];

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
  advocacy = "advocacy",
}
enum Feature {
  CREATIVE_ASSET_TESTING = "CREATIVE_ASSET_TESTING",
  BRAND_LIFT = "BRAND_LIFT",
  BRAND_HEALTH = "BRAND_HEALTH",
  MIXED_MEDIA_MODELLING = "MIXED_MEDIA_MODELLING",
}

// Features mapping with their icons
const features = [{
  key: Feature.CREATIVE_ASSET_TESTING,
  title: "Creative Asset Testing",
  icon: "/icons/app/Creative_Asset_Testing.svg"
}, {
  key: Feature.BRAND_LIFT,
  title: "Brand Lift",
  icon: "/icons/app/Brand_Lift.svg"
}, {
  key: Feature.BRAND_HEALTH,
  title: "Brand Health",
  icon: "/icons/app/Brand_Health.svg"
}, {
  key: Feature.MIXED_MEDIA_MODELLING,
  title: "Mixed Media Modelling",
  icon: "/icons/app/MMM.svg"
}];

// Update the validation schema
const ObjectivesSchema = Yup.object().shape({
  mainMessage: Yup.string().required("Main message is required"),
  hashtags: Yup.string(),
  memorability: Yup.string().required("Memorability is required"),
  keyBenefits: Yup.string().required("Key benefits are required"),
  expectedAchievements: Yup.string().required("Expected achievements are required"),
  purchaseIntent: Yup.string().required("Purchase intent is required"),
  brandPerception: Yup.string(),
  primaryKPI: Yup.string().required("Primary KPI is required").oneOf([KPI.adRecall, KPI.brandAwareness, KPI.consideration, KPI.messageAssociation, KPI.brandPreference, KPI.purchaseIntent, KPI.actionIntent, KPI.recommendationIntent, KPI.advocacy], "Invalid KPI selected"),
  secondaryKPIs: Yup.array().of(Yup.string().oneOf([KPI.adRecall, KPI.brandAwareness, KPI.consideration, KPI.messageAssociation, KPI.brandPreference, KPI.purchaseIntent, KPI.actionIntent, KPI.recommendationIntent, KPI.advocacy], "Invalid KPI selected")).max(4, "Maximum 4 secondary KPIs"),
  features: Yup.array().of(Yup.string().oneOf([Feature.CREATIVE_ASSET_TESTING, Feature.BRAND_LIFT, Feature.BRAND_HEALTH, Feature.MIXED_MEDIA_MODELLING], "Invalid feature selected"))
});

// Custom Field Component for styled inputs
const StyledField = ({
  label,
  name,
  type = "text",
  as,
  children,
  required = false,
  icon,
  ...props
}: any) => {
  return <div className="mb-5 font-work-sans">
      <label htmlFor={name} className="block text-sm font-medium text-[var(--primary-color)] mb-2 font-work-sans">
        {label}
        {required && <span className="text-[var(--accent-color)] ml-1 font-work-sans">*</span>}
      </label>
      <div className="relative font-work-sans">
        {icon && <div className="absolute left-3 top-2.5 text-[var(--secondary-color)] font-work-sans">
            {icon}
          </div>}
        {as ? <Field as={as} id={name} name={name} className={`w-full p-2.5 ${icon ? 'pl-10' : 'pl-3'} border border-[var(--divider-color)] rounded-md focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)] shadow-sm bg-white`} {...props}>

            {children}
          </Field> : <Field type={type} id={name} name={name} className={`w-full p-2.5 ${icon ? 'pl-10' : 'pl-3'} border border-[var(--divider-color)] rounded-md focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)] shadow-sm bg-white`} {...props} />}
        <ErrorMessage name={name} component="p" className="mt-1 text-sm text-red-600 font-work-sans" />
      </div>
    </div>;
};
function FormContent() {
  const router = useRouter();
  const {
    data,
    updateData,
    campaignData,
    isEditing,
    loading
  } = useWizard();
  const searchParams = useSearchParams();
  const campaignId = searchParams.get('id');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialValues, setInitialValues] = useState<{
    primaryKPI: any;
    secondaryKPIs: any[];
    features: any[];
    mainMessage: string;
    hashtags: string;
    memorability: string;
    keyBenefits: string;
    expectedAchievements: string;
    purchaseIntent: string;
    brandPerception: string;
  }>({
    primaryKPI: null,
    secondaryKPIs: [],
    features: [],
    mainMessage: '',
    hashtags: '',
    memorability: '',
    keyBenefits: '',
    expectedAchievements: '',
    purchaseIntent: '',
    brandPerception: ''
  });
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
      console.log('Messaging data if available:', campaignData.messaging ? JSON.stringify(campaignData.messaging, null, 2) : 'No messaging data found');

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
        secondaryKPIs: values.secondaryKPIs?.map((kpi: string) => EnumTransformers.kpiToBackend(kpi)) || [],
        features: values.features?.map((feature: string) => EnumTransformers.featureToBackend(feature)) || []
      };
      console.log('Submitting with transformed values:', transformedValues);
      const response = await fetch(`/api/campaigns/${currentCampaignId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
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
        })
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
        console.log('Secondary KPIs before sanitization:', Array.isArray(values.secondaryKPIs) ? values.secondaryKPIs.join(', ') : values.secondaryKPIs);
      }
      if (values.features) {
        console.log('Features before sanitization:', Array.isArray(values.features) ? values.features.join(', ') : values.features);
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
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestPayload)
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
    return <WizardSkeleton step={2} />;
  }
  if (error) {
    return <div className="p-4 bg-red-50 border border-red-200 rounded-md font-work-sans">
        <h3 className="text-red-800 font-semibold font-sora">Error</h3>
        <p className="text-red-600 font-work-sans">{error}</p>
        <button onClick={() => router.push('/campaigns')} className="mt-4 btn btn-secondary font-work-sans">

          Return to Campaigns
        </button>
      </div>;
  }
  return <div className="max-w-5xl mx-auto p-4 pb-16 bg-white font-work-sans">
      <h1 className="text-2xl font-bold mb-6 font-sora">Campaign Creation</h1>
      
      <Formik enableReinitialize initialValues={{
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
      ...(initialValues as any)
    }} validationSchema={Yup.object({
      primaryKPI: Yup.string().required('A primary KPI is required')
    })} onSubmit={handleSubmit}>

        {({
        values,
        errors,
        touched,
        isValid,
        dirty,
        setFieldValue,
        handleChange
      }) => {
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
        return <Form className="space-y-8">
              {/* KPIs Section */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-[var(--divider-color)] font-work-sans">
                <h2 className="text-lg font-semibold text-[var(--primary-color)] mb-4 flex items-center font-sora">
                  <Icon iconId="faChartBarLight" className="w-5 h-5 mr-2 text-[var(--accent-color)] font-work-sans"  />
                  Key Performance Indicators
                </h2>
                <p className="mb-4 text-sm text-[var(--secondary-color)] font-work-sans">
                  Select 1 Primary KPI and up to 4 Secondary KPIs. A Primary KPI cannot be selected as a Secondary KPI.
                </p>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border p-2 text-left font-work-sans">KPI</th>
                      <th className="border p-2 text-left font-work-sans">Explanation</th>
                      <th className="border p-2 text-center font-work-sans">Primary KPI</th>
                      <th className="border p-2 text-center font-work-sans">Secondary KPI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {kpis.map((kpi) => <tr key={kpi.key} className="hover:bg-gray-50">
                        <td className="border p-2 font-medium">
                          <div className="flex items-center font-work-sans">
                            <div className="w-6 h-6 mr-2 flex-shrink-0 font-work-sans">
                              <Image src={kpi.icon} alt={kpi.title} width={24} height={24} />

                            </div>
                            {kpi.title}
                          </div>
                        </td>
                        <td className="border p-2">
                          <div className="text-sm text-[var(--secondary-color)] font-work-sans">{kpi.definition}</div>
                          <div className="text-xs text-[var(--secondary-color)] mt-1 font-work-sans">Example: {kpi.example}</div>
                        </td>
                        <td className="border p-2 text-center font-work-sans">
                          <Field type="radio" name="primaryKPI" value={kpi.key} className="w-4 h-4 text-secondary focus:ring-secondary font-work-sans" />

                        </td>
                        <td className="border p-2 text-center font-work-sans">
                          <Field type="checkbox" name="secondaryKPIs" value={kpi.key} className="w-4 h-4 text-secondary focus:ring-secondary font-work-sans" disabled={values.primaryKPI === kpi.key || Array.isArray(values.secondaryKPIs) && !values.secondaryKPIs.includes(kpi.key) && values.secondaryKPIs.length >= 4} />

                        </td>
                      </tr>)}
                  </tbody>
                </table>
                <ErrorMessage name="primaryKPI" component="p" className="mt-2 text-sm text-red-600 font-work-sans" />
                <ErrorMessage name="secondaryKPIs" component="p" className="mt-2 text-sm text-red-600 font-work-sans" />
              </div>

              {/* Primary and Secondary KPIs */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-[var(--divider-color)] font-work-sans">
                <h2 className="text-lg font-semibold text-[var(--primary-color)] mb-4 flex items-center font-sora">
                  <Icon iconId="faChartLineLight" className="w-5 h-5 mr-2 text-[var(--accent-color)] font-work-sans"  />
                  Primary and Secondary KPIs
                </h2>
                <p className="mb-4 text-sm text-[var(--secondary-color)] font-work-sans">
                  Pick up to one Primary KPI and up to any Secondary KPIs (max 4).
                </p>
                
                <div className="mt-4 grid grid-cols-2 gap-6 font-work-sans">
                  <div className="font-work-sans">
                    <h3 className="text-md font-medium mb-2 font-sora">Primary KPI</h3>
                    <div className="grid grid-cols-1 gap-2 font-work-sans">
                      {values.primaryKPI && <div className="bg-[var(--accent-color)] p-2 rounded border border-[var(--accent-color)] border-opacity-20 flex items-center text-white font-work-sans">
                          <div className="w-5 h-5 mr-2 filter brightness-0 invert font-work-sans">
                            <Image src={kpis.find((k) => k.key === values.primaryKPI)?.icon || "/icons/kpis/Ad_Recall.svg"} alt="Primary KPI" width={20} height={20} />
                          </div>
                          <span className="font-medium font-work-sans">
                            {kpis.find((k) => k.key === values.primaryKPI)?.title || values.primaryKPI}
                          </span>
                        </div>}
                    </div>
                  </div>
                  
                  <div className="font-work-sans">
                    <h3 className="text-md font-medium mb-2 font-sora">Secondary KPIs {Array.isArray(values.secondaryKPIs) && values.secondaryKPIs.length > 0 && `(${values.secondaryKPIs.length})`}</h3>
                    <div className="grid grid-cols-1 gap-2 font-work-sans">
                      {Array.isArray(values.secondaryKPIs) && values.secondaryKPIs.map((kpiKey: KPI) => <div key={kpiKey} className="bg-gray-50 p-2 rounded border border-[var(--divider-color)] flex items-center font-work-sans">
                          <div className="w-5 h-5 mr-2 font-work-sans">
                            <Image src={kpis.find((k) => k.key === kpiKey)?.icon || ''} alt={kpiKey} width={20} height={20} />

                          </div>
                          <span className="flex-grow font-work-sans">{kpis.find((k) => k.key === kpiKey)?.title || kpiKey}</span>
                          <button
                      type="button"
                      className="group text-[var(--secondary-color)] hover:text-red-500 font-work-sans"
                      onClick={() => {
                        const updatedKpis = values.secondaryKPIs.filter((k: KPI) => k !== kpiKey);
                        setFieldValue('secondaryKPIs', updatedKpis);
                      }}>

                            <Icon iconId="faTrashCanLight" className="w-4 h-4 group-hover:hidden"  />
                            <Icon iconId="faTrashCanSolid" className="w-4 h-4 hidden group-hover:block"  />
                          </button>
                        </div>)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Messaging Section */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-[var(--divider-color)] font-work-sans">
                <h2 className="text-xl font-semibold mb-4 flex items-center font-sora">
                  <Icon iconId="faCommentsLight" className="w-5 h-5 mr-2 text-[var(--accent-color)] font-work-sans"  />
                  Messaging
                </h2>
                <p className="text-[var(--secondary-color)] mb-6 font-work-sans">
                  Define the key messages and value propositions for your campaign.
                </p>
                
                <div className="space-y-4 font-work-sans">
                  <StyledField label="What is the main message of your campaign?" name="mainMessage" as="textarea" rows={3} required icon={<Icon iconId="faCommentDotsLight" className="h-5 w-5"  />} placeholder="Discover sustainable living with our eco-friendly products." />

                  
                  <StyledField label="Hashtags related to the campaign" name="hashtags" icon={<Icon iconId="faTagLight" className="h-5 w-5"  />} placeholder="#hashtag" />

                  
                  <StyledField label="Memorability Score (1-10)" name="memorability" required icon={<Icon iconId="faStarLight" className="h-5 w-5"  />} placeholder="Type the value" />

                  
                  <StyledField label="What are the key benefits your brand offers?" name="keyBenefits" required icon={<Icon iconId="faCircleCheckLight" className="h-5 w-5"  />} placeholder="Innovative design, Exceptional quality, Outstanding customer service." />

                </div>
              </div>

              {/* Hypotheses Section */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-[var(--divider-color)] font-work-sans">
                <h2 className="text-xl font-semibold mb-4 flex items-center font-sora">
                  <Icon iconId="faLightbulbLight" className="w-5 h-5 mr-2 text-[var(--accent-color)] font-work-sans"  />
                  Hypotheses
                </h2>
                <p className="text-[var(--secondary-color)] mb-6 font-work-sans">
                  Outline the expected outcomes of your campaign based on your objectives and KPIs.
                </p>
                
                <div className="space-y-4 font-work-sans">
                  <StyledField label="What do you expect to achieve with this campaign?" name="expectedAchievements" as="textarea" rows={2} required icon={<Icon iconId="faArrowTrendUpLight" className="h-5 w-5"  />} placeholder="We expect a 20% increase in brand awareness within three months." />

                  
                  <StyledField label="How do you think the campaign will impact Purchase Intent?" name="purchaseIntent" as="textarea" rows={2} required icon={<Icon iconId="faDollarSignLight" className="h-5 w-5"  />} placeholder="Purchase intent will rise by 15% due to targeted ads." />

                  
                  <StyledField label="How will it change people's perception of your brand?" name="brandPerception" as="textarea" rows={2} icon={<Icon iconId="faChartBarLight" className="h-5 w-5"  />} placeholder="Our brand will be seen as more innovative and customer-focused." />

                </div>
              </div>

              {/* Features Section */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-[var(--divider-color)] font-work-sans">
                <h2 className="text-lg font-semibold text-[var(--primary-color)] mb-4 flex items-center font-sora">
                  <Icon iconId="faListLight" className="w-5 h-5 mr-2 text-[var(--accent-color)] font-work-sans"  />
                  Features to Include
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-work-sans">
                  {features.map((feature) =>
              <div
                key={feature.key}
                className={`
                        cursor-pointer rounded-lg border p-4 transition-all duration-200 
                        ${Array.isArray(values.features) && values.features.includes(feature.key) ?
                'bg-[var(--accent-color)] border-[var(--accent-color)] border-opacity-40 shadow-md text-white transform scale-[1.02]' :
                'bg-white border-[var(--divider-color)] hover:border-[var(--accent-color)] hover:border-opacity-20 hover:bg-[var(--accent-color)] hover:bg-opacity-5 hover:shadow-sm'}
                        focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] focus:ring-opacity-50 font-work-sans`
                }
                onClick={() => {
                  if (!Array.isArray(values.features)) {
                    setFieldValue('features', [feature.key]);
                    return;
                  }
                  const updatedFeatures = values.features.includes(feature.key) ?
                  values.features.filter((f: Feature) => f !== feature.key) :
                  [...values.features, feature.key];
                  setFieldValue('features', updatedFeatures);
                }}
                tabIndex={0}
                role="checkbox"
                aria-checked={Array.isArray(values.features) && values.features.includes(feature.key)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (!Array.isArray(values.features)) {
                      setFieldValue('features', [feature.key]);
                      return;
                    }
                    const updatedFeatures = values.features.includes(feature.key) ?
                    values.features.filter((f: Feature) => f !== feature.key) :
                    [...values.features, feature.key];
                    setFieldValue('features', updatedFeatures);
                  }
                }}>

                      {/* Hidden Formik field to properly track the value for this feature */}
                      <Field
                  type="checkbox"
                  name="features"
                  value={feature.key}
                  checked={Array.isArray(values.features) && values.features.includes(feature.key)}
                  className="hidden" />

                      
                      <div className="flex items-center mb-3 font-work-sans">
                        <div className="mr-3 w-6 h-6 flex items-center justify-center font-work-sans">
                          <Image
                      src={feature.icon}
                      alt={feature.title}
                      width={28}
                      height={28}
                      className={`transition-all duration-200 ${Array.isArray(values.features) && values.features.includes(feature.key) ? 'filter brightness-0 invert' : ''}`} />

                        </div>
                        <span className="font-medium font-work-sans">{feature.title}</span>
                      </div>
                      <div className="flex justify-end mt-3 font-work-sans">
                        {Array.isArray(values.features) && values.features.includes(feature.key) &&
                  <Icon iconId="faCheckCircleSolid" className="w-5 h-5"  />
                  }
                        {!(Array.isArray(values.features) && values.features.includes(feature.key)) &&
                  <div className="text-[var(--secondary-color)] text-xs font-work-sans">Click to select</div>
                  }
                      </div>
                    </div>
              )}
                </div>
              </div>
              
              {/* Add bottom padding to prevent progress bar overlap - reduced from pb-8 to pb-4 */}
              <div className="pb-4 font-work-sans"></div>
              
              <ProgressBar currentStep={2} onStepClick={(step) => router.push(`/campaigns/wizard/step-${step}?id=${campaignId || (data as any)?.id}`)} onBack={() => router.push(`/campaigns/wizard/step-1?id=${campaignId || (data as any)?.id}`)} onNext={() => handleSubmit(values)} onSaveDraft={() => handleSaveDraft(values)} disableNext={disableNext} isFormValid={isValid} isDirty={dirty} isSaving={isSaving} />

            </Form>;
      }}
      </Formik>
    </div>;
}
export default function Step2Content() {
  const [isClientSide, setIsClientSide] = useState(false);

  useEffect(() => {
    setIsClientSide(true);
  }, []);

  if (!isClientSide) {
    return <WizardSkeleton step={2} />;
  }

  return (
    <Suspense fallback={<WizardSkeleton step={2} />}>
      <FormContent />
    </Suspense>);

}