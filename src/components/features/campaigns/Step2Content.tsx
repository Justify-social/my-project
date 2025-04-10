// Updated import paths via tree-shake script - 2025-04-01T17:13:32.217Z
"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
// Restore Formik imports
import { Formik, Form, Field, ErrorMessage } from "formik";
// Remove React Hook Form imports
// import { useForm } from "react-hook-form";
// import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import Image from "next/image";
import { useWizard } from "@/components/features/campaigns/WizardContext";
import Header from "@/components/features/campaigns/Header";
import ProgressBar from "@/components/features/campaigns/ProgressBar";
import { toast } from "react-hot-toast";
// Remove Shadcn Form imports, keep Input/Textarea/Label for styling reference if needed
import { WizardSkeleton, Input, Textarea, Label } from "@/components/ui";
import { Icon } from '@/components/ui/icon'
import { EnumTransformers } from '@/utils/enum-transformers';
import { sanitizeStepPayload } from '@/utils/payload-sanitizer';
// Restore Prisma Enums if they were removed, assuming path
import { KPI, Feature } from "@prisma/client";
import { cn } from "@/lib/utils";
import { IconButtonAction } from "@/components/ui/button-icon-action";

// Define interface for messaging data structure
interface MessagingData {
  mainMessage?: string;
  hashtags?: string;
  memorability?: string;
  keyBenefits?: string;
  expectedAchievements?: string;
  purchaseIntent?: string;
  brandPerception?: string;
}

// Define the available KPIs for the table
const kpis = [{
  key: "adRecall",
  title: "Ad Recall",
  definition: "The percentage of people who remember seeing your advertisement.",
  example: "After a week, 60% of viewers can recall your ad's main message.",
  icon: "/icons/kpis/kpisAdRecall.svg"
}, {
  key: "brandAwareness",
  title: "Brand Awareness",
  definition: "The increase in recognition of your brand.",
  example: "Your brand name is recognised by 30% more people after the campaign.",
  icon: "/icons/kpis/kpisBrandAwareness.svg"
}, {
  key: "consideration",
  title: "Consideration",
  definition: "The percentage of people considering purchasing from your brand.",
  example: "25% of your audience considers buying your product after seeing your campaign.",
  icon: "/icons/kpis/kpisConsideration.svg"
}, {
  key: "messageAssociation",
  title: "Message Association",
  definition: "How well people link your key messages to your brand.",
  example: "When hearing your slogan, 70% of people associate it directly with your brand.",
  icon: "/icons/kpis/kpisMessageAssociation.svg"
}, {
  key: "brandPreference",
  title: "Brand Preference",
  definition: "Preference for your brand over competitors.",
  example: "40% of customers prefer your brand when choosing between similar products.",
  icon: "/icons/kpis/kpisBrandPreference.svg"
}, {
  key: "purchaseIntent",
  title: "Purchase Intent",
  definition: "Likelihood of purchasing your product or service.",
  example: "50% of viewers intend to buy your product after seeing the ad.",
  icon: "/icons/kpis/kpisPurchaseIntent.svg"
}, {
  key: "actionIntent",
  title: "Action Intent",
  definition: "Likelihood of taking a specific action related to your brand (e.g., visiting your website).",
  example: "35% of people are motivated to visit your website after the campaign.",
  icon: "/icons/kpis/kpisActionIntent.svg"
}, {
  key: "recommendationIntent",
  title: "Recommendation Intent",
  definition: "Likelihood of recommending your brand to others.",
  example: "45% of customers are willing to recommend your brand to friends and family.",
  icon: "/icons/kpis/kpisRecommendationIntent.svg"
}, {
  key: "advocacy",
  title: "Advocacy",
  definition: "Willingness to actively promote your brand.",
  example: "20% of your customers regularly share your brand on social media or write positive reviews.",
  icon: "/icons/kpis/kpisAdvocacy.svg"
}];

// Features mapping with their icons
const features = [{
  key: Feature.CREATIVE_ASSET_TESTING,
  title: "Creative Asset Testing",
  icon: "/icons/app/appCreativeAssetTesting.svg"
}, {
  key: Feature.BRAND_LIFT,
  title: "Brand Lift",
  icon: "/icons/app/appBrandLift.svg"
}, {
  key: Feature.BRAND_HEALTH,
  title: "Brand Health",
  icon: "/icons/app/appBrandHealth.svg"
}, {
  key: Feature.MIXED_MEDIA_MODELING,
  title: "Mixed Media Modelling",
  icon: "/icons/app/appMmm.svg"
}];

// Validation Schema - ensure it uses the correct Enums
const ObjectivesSchema = Yup.object().shape({
  mainMessage: Yup.string().required("Main message is required"),
  hashtags: Yup.string(),
  memorability: Yup.string().required("Memorability is required"),
  keyBenefits: Yup.string().required("Key benefits are required"),
  expectedAchievements: Yup.string().required("Expected achievements are required"),
  purchaseIntent: Yup.string().required("Purchase intent is required"),
  brandPerception: Yup.string(),
  primaryKPI: Yup.string().required("Primary KPI is required").oneOf(Object.values(KPI), "Invalid KPI selected"),
  secondaryKPIs: Yup.array().of(Yup.string().oneOf(Object.values(KPI), "Invalid KPI selected")).max(4, "Maximum 4 secondary KPIs"),
  features: Yup.array().of(Yup.string().oneOf([Feature.CREATIVE_ASSET_TESTING, Feature.BRAND_LIFT, Feature.BRAND_HEALTH, Feature.MIXED_MEDIA_MODELING], "Invalid feature selected"))
});

// Restore StyledField definition - NOW APPLY THEMED STYLING
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
    {/* Use standard Label component */}
    <Label htmlFor={name} className="block text-sm font-medium mb-2">
      {label}
      {/* Use themed text-destructive for asterisk */}
      {required && <span className="text-destructive ml-1">*</span>}
    </Label>
    <div className="relative font-work-sans">
      {/* Use themed text-muted-foreground for icon */}
      {icon && <div className="absolute left-3 top-2.5 text-muted-foreground pointer-events-none">
        {icon} {/* Assuming icon is already <Icon/> */}
      </div>}
      {/* Apply standard Shadcn Input/Textarea styling via classes */}
      {/* Base classes from Shadcn Input: flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 */}
      {as ? <Field as={as} id={name} name={name} className={cn(
        "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        // Add padding for icon if present
        icon ? 'pl-10' : 'px-3',
        // Specific height for non-textarea?
        as !== 'textarea' ? 'h-10' : '',
        // Remove default browser appearance for select
        as === 'select' ? 'appearance-none' : ''
      )} {...props}>
        {children}
      </Field> : <Field type={type} id={name} name={name} className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        // Add padding for icon if present
        icon ? 'pl-10' : 'px-3'
      )} {...props} />}
      {/* Use themed text-destructive for error message */}
      <ErrorMessage name={name} component="p" className="mt-1 text-sm text-destructive font-work-sans" />
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
  const campaignId = searchParams?.get('id');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialValues, setInitialValues] = useState<any>({
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

  useEffect(() => {
    if (campaignData && !hasLoadedData) {
      const messaging = campaignData?.messaging;
      const safeMessaging: MessagingData = typeof messaging === 'object' && messaging !== null ? messaging as MessagingData : {};
      const formInitialValues = {
        primaryKPI: campaignData.primaryKPI || null,
        secondaryKPIs: Array.isArray(campaignData.secondaryKPIs) ? campaignData.secondaryKPIs : [],
        features: Array.isArray(campaignData.features) ? campaignData.features : [],
        mainMessage: safeMessaging.mainMessage || '',
        hashtags: safeMessaging.hashtags || '',
        memorability: safeMessaging.memorability || '',
        keyBenefits: safeMessaging.keyBenefits || '',
        expectedAchievements: safeMessaging.expectedAchievements || '',
        purchaseIntent: safeMessaging.purchaseIntent || '',
        brandPerception: safeMessaging.brandPerception || ''
      };
      setInitialValues(formInitialValues);
      setHasLoadedData(true);
    }
  }, [campaignData, hasLoadedData]);

  const handleSubmit = async (values: any) => {
    try {
      setIsSaving(true);
      setError(null);
      const transformedValues = {
        ...values,
        primaryKPI: EnumTransformers.kpiToBackend(values.primaryKPI),
        secondaryKPIs: values.secondaryKPIs?.map((kpi: string) => EnumTransformers.kpiToBackend(kpi)) || [],
        features: values.features?.map((feature: string) => EnumTransformers.featureToBackend(feature)) || []
      };
      const currentCampaignId = campaignId || (data as any)?.id;
      if (!currentCampaignId) {
        toast.error('Campaign ID is required');
        return;
      }
      const response = await fetch(`/api/campaigns/${currentCampaignId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
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
      if (!response.ok) throw new Error(result.error || 'Failed to update campaign');

      updateData({ ...data, ...result, id: currentCampaignId, step: 2, primaryKPI: transformedValues.primaryKPI, secondaryKPIs: transformedValues.secondaryKPIs, features: transformedValues.features }, result);
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
      const messagingData = {
        mainMessage: values.mainMessage || '',
        hashtags: values.hashtags || '',
        memorability: values.memorability || '',
        keyBenefits: values.keyBenefits || '',
        expectedAchievements: values.expectedAchievements || '',
        purchaseIntent: values.purchaseIntent || '',
        brandPerception: values.brandPerception || ''
      };
      const sanitizedValues = sanitizeStepPayload({ ...values, messaging: messagingData }, 2);
      const transformedValues = EnumTransformers.transformObjectToBackend(sanitizedValues);
      const currentCampaignId = campaignId || (data as any)?.id;
      if (!currentCampaignId) {
        toast.error('Campaign ID is required');
        setIsSaving(false);
        return;
      }
      const requestPayload = { ...transformedValues, status: 'draft', step: 2 };

      console.log(`Making PATCH request to /api/campaigns/${currentCampaignId} with draft data:`, JSON.stringify(requestPayload, null, 2));
      const response = await fetch(`/api/campaigns/${currentCampaignId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to save draft');

      if (typeof updateData === 'function' && result.data) {
        updateData({ ...data, ...result.data, id: currentCampaignId, step: 2, primaryKPI: transformedValues.primaryKPI, secondaryKPIs: transformedValues.secondaryKPIs, features: transformedValues.features }, result.data);
      }
      toast.success('Draft saved successfully');
      setInitialValues(values);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save draft';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <WizardSkeleton step={2} />;
  if (error) {
    return <div className="p-4 bg-red-50 border border-red-200 rounded-md font-work-sans">
      <h3 className="text-red-800 font-semibold font-sora">Error</h3>
      <p className="text-red-600 font-work-sans">{error}</p>
      <button onClick={() => router.push('/campaigns')} className="mt-4 btn btn-secondary font-work-sans">
        Return to Campaigns
      </button>
    </div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-4 pb-16 bg-background font-work-sans">
      <h1 className="text-2xl font-bold mb-6 font-sora">Campaign Creation</h1>
      <Formik enableReinitialize initialValues={initialValues} validationSchema={ObjectivesSchema} onSubmit={handleSubmit}>
        {({ values, setFieldValue, isValid, dirty }) => (
          <Form className="space-y-8">
            <div className="bg-background rounded-xl p-6 shadow-sm border font-work-sans">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center font-sora">
                <Icon iconId="faChartBarLight" className="w-5 h-5 mr-2 text-accent" />
                Key Performance Indicators
              </h2>
              <p className="mb-4 text-sm text-muted-foreground font-work-sans">
                Select 1 Primary KPI and up to 4 Secondary KPIs. A Primary KPI cannot be selected as a Secondary KPI.
              </p>
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border p-2 text-center font-work-sans">Primary KPI</th>
                    <th className="border p-2 text-center font-work-sans">Secondary KPIs</th>
                  </tr>
                </thead>
                <tbody>
                  {kpis.map((kpi) => <tr key={kpi.key} className="hover:bg-muted/50">
                    <td className="border p-2 text-center font-work-sans">
                      <Field type="radio" name="primaryKPI" value={kpi.key} className="w-4 h-4 text-secondary focus:ring-secondary" />
                    </td>
                    <td className="border p-2 text-center font-work-sans">
                      <Field type="checkbox" name="secondaryKPIs" value={kpi.key} className="w-4 h-4 text-secondary focus:ring-secondary" disabled={values.primaryKPI === kpi.key || (Array.isArray(values.secondaryKPIs) && values.secondaryKPIs.length >= 4 && !(values.secondaryKPIs || []).includes(kpi.key))} />
                    </td>
                  </tr>)}
                </tbody>
              </table>
              <ErrorMessage name="primaryKPI" component="p" className="mt-2 text-sm text-destructive" />
              <ErrorMessage name="secondaryKPIs" component="p" className="mt-2 text-sm text-destructive" />
            </div>

            <div className="bg-background rounded-xl p-6 shadow-sm border font-work-sans">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center font-sora">
                <Icon iconId="faChartLineLight" className="w-5 h-5 mr-2 text-accent" />
                Primary and Secondary KPIs
              </h2>
              <p className="mb-4 text-sm text-muted-foreground font-work-sans">
                Pick up to one Primary KPI and up to any Secondary KPIs (max 4).
              </p>

              <div className="mt-4 grid grid-cols-2 gap-6 font-work-sans">
                <div className="font-work-sans">
                  <h3 className="text-md font-medium mb-2 font-sora">Primary KPI</h3>
                  <div className="grid grid-cols-1 gap-2 font-work-sans">
                    {values.primaryKPI && <div className="bg-accent p-2 rounded border border-accent/40 flex items-center text-accent-foreground font-work-sans">
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
                    {(values.secondaryKPIs ?? []).map((kpiKey: KPI) => {
                      if (!kpiKey) return null;
                      return (
                        <div key={kpiKey} className="bg-muted/50 p-2 rounded border flex items-center font-work-sans">
                          <div className="w-5 h-5 mr-2 font-work-sans">
                            <Image src={kpis.find((k) => k.key === kpiKey)?.icon || ''} alt={kpiKey} width={20} height={20} />
                          </div>
                          <span className="flex-grow font-work-sans">{kpis.find((k) => k.key === kpiKey)?.title || kpiKey}</span>
                          <IconButtonAction
                            iconBaseName="faTrashCan"
                            hoverColorClass="text-destructive"
                            ariaLabel="Remove Secondary KPI"
                            onClick={() => {
                              const currentKPIs = values.secondaryKPIs || [];
                              const updatedKpis = currentKPIs.filter((k: KPI): k is KPI => k !== kpiKey);
                              setFieldValue('secondaryKPIs', updatedKpis);
                            }}
                            className="ml-auto"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-background rounded-xl p-6 shadow-sm border font-work-sans">
              <h2 className="text-xl font-semibold mb-4 flex items-center font-sora">
                <Icon iconId="faCommentsLight" className="w-5 h-5 mr-2 text-accent" />
                Messaging
              </h2>
              <p className="text-muted-foreground mb-6 font-work-sans">
                Define the key messages and value propositions for your campaign.
              </p>
              <div className="space-y-4 font-work-sans">
                <StyledField label="What is the main message of your campaign?" name="mainMessage" as="textarea" rows={3} required icon={<Icon iconId="faCommentDotsLight" className="h-5 w-5" />} placeholder="Discover sustainable living with our eco-friendly products." />
                <StyledField label="Hashtags related to the campaign" name="hashtags" icon={<Icon iconId="faTagLight" className="h-5 w-5" />} placeholder="#hashtag" />
                <StyledField label="Memorability Score (1-10)" name="memorability" required icon={<Icon iconId="faStarLight" className="h-5 w-5" />} placeholder="Type the value" type="number" />
                <StyledField label="What are the key benefits your brand offers?" name="keyBenefits" required icon={<Icon iconId="faCircleCheckLight" className="h-5 w-5" />} placeholder="Innovative design, Exceptional quality, Outstanding customer service." />
              </div>
            </div>

            <div className="bg-background rounded-xl p-6 shadow-sm border font-work-sans">
              <h2 className="text-xl font-semibold mb-4 flex items-center font-sora">
                <Icon iconId="faLightbulbLight" className="w-5 h-5 mr-2 text-accent" />
                Hypotheses
              </h2>
              <p className="text-muted-foreground mb-6 font-work-sans">
                Outline the expected outcomes of your campaign based on your objectives and KPIs.
              </p>
              <div className="space-y-4 font-work-sans">
                <StyledField label="What do you expect to achieve with this campaign?" name="expectedAchievements" as="textarea" rows={2} required icon={<Icon iconId="faArrowTrendUpLight" className="h-5 w-5" />} placeholder="We expect a 20% increase in brand awareness within three months." />
                <StyledField label="How do you think the campaign will impact Purchase Intent?" name="purchaseIntent" as="textarea" rows={2} required icon={<Icon iconId="faDollarSignLight" className="h-5 w-5" />} placeholder="Purchase intent will rise by 15% due to targeted ads." />
                <StyledField label="How will it change people's perception of your brand?" name="brandPerception" as="textarea" rows={2} icon={<Icon iconId="faChartBarLight" className="h-5 w-5" />} placeholder="Our brand will be seen as more innovative and customer-focused." />
              </div>
            </div>

            <div className="bg-background rounded-xl p-6 shadow-sm border font-work-sans">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center font-sora">
                <Icon iconId="faListLight" className="w-5 h-5 mr-2 text-accent" />
                Features to Include
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-work-sans">
                {features.map((feature) =>
                  <div
                    key={feature.key}
                    className={`
                          cursor-pointer rounded-lg border p-4 transition-all duration-200 
                          ${Array.isArray(values.features) && values.features.includes(feature.key) ?
                        'bg-accent border-accent/40 shadow-md text-accent-foreground transform scale-[1.02]' :
                        'bg-background border hover:border-accent/20 hover:bg-accent/5 hover:shadow-sm'}
                          focus:outline-none focus:ring-2 focus:ring-ring/50 font-work-sans`
                    }
                    onClick={() => {
                      const currentFeatures = values.features || [];
                      const updatedFeatures = currentFeatures.includes(feature.key)
                        ? currentFeatures.filter((f: string) => f !== feature.key)
                        : [...currentFeatures, feature.key];
                      setFieldValue('features', updatedFeatures);
                    }}
                    tabIndex={0}
                    role="checkbox"
                    aria-checked={Array.isArray(values.features) && values.features.includes(feature.key)}
                  >
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
                        <Icon iconId="faCheckCircleSolid" className="w-5 h-5 text-accent-foreground" />
                      }
                      {!(Array.isArray(values.features) && values.features.includes(feature.key)) &&
                        <div className="text-muted-foreground text-xs font-work-sans">Click to select</div>
                      }
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pb-4 font-work-sans"></div>

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
        )}
      </Formik>
    </div>
  );
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