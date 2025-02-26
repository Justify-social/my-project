"use client";

import React, { useState, useEffect, KeyboardEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import * as Yup from "yup";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { useWizard } from "@/context/WizardContext";
import Header from "@/components/Wizard/Header";
import ProgressBar from "@/components/Wizard/ProgressBar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { toast } from "react-hot-toast";
import LocationSelector from "@/components/Wizard/AudienceTargeting/LocationSelector";
import AgeDistributionSlider from "@/components/Wizard/AudienceTargeting/AgeDistributionSlider";
import GenderSelection from "@/components/Wizard/AudienceTargeting/GenderSelection";
import ScreeningQuestions from "@/components/Wizard/AudienceTargeting/ScreeningQuestions";
import LanguagesSelector from "@/components/Wizard/AudienceTargeting/LanguagesSelector";
import AdvancedTargeting from "@/components/Wizard/AudienceTargeting/AdvancedTargeting";
import CompetitorTracking from "@/components/Wizard/AudienceTargeting/CompetitorTracking";
import Image from "next/image";
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

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

interface AgeDistribution {
  age1824: number;
  age2534: number;
  age3544: number;
  age4554: number;
  age5564: number;
  age65plus: number;
}

export interface AudienceValues {
  location: string[];
  ageDistribution: AgeDistribution;
  gender: string[];
  otherGender: string;
  screeningQuestions: string[];
  languages: string[];
  educationLevel: string;
  jobTitles: string;
  incomeLevel: string;
  competitors: string[];
}

// =============================================================================
// VALIDATION SCHEMA
// =============================================================================

const AudienceSchema = Yup.object().shape({
  location: Yup.array().of(Yup.string()).min(1, "At least one location is required"),
  ageDistribution: Yup.object().shape({
    age1824: Yup.number().min(0).required(),
    age2534: Yup.number().min(0).required(),
    age3544: Yup.number().min(0).required(),
    age4554: Yup.number().min(0).required(),
    age5564: Yup.number().min(0).required(),
    age65plus: Yup.number().min(0).required(),
  }).test("sum", "Total allocation must be exactly 100%", (values: AgeDistribution | undefined) => {
    if (!values) return false;
    const total =
      values.age1824 +
      values.age2534 +
      values.age3544 +
      values.age4554 +
      values.age5564 +
      values.age65plus;
    return total === 100;
  }),
  gender: Yup.array().of(Yup.string()).min(1, "Select at least one gender"),
  otherGender: Yup.string().when("gender", (gender: string[], schema) =>
    gender.includes("Other") ? schema.required("Please specify other gender") : schema
  ),
  screeningQuestions: Yup.array().of(Yup.string()),
  languages: Yup.array().of(Yup.string()),
  educationLevel: Yup.string(),
  jobTitles: Yup.string(),
  incomeLevel: Yup.string(),
  competitors: Yup.array().of(Yup.string()),
});

// =============================================================================
// MAIN COMPONENT: AUDIENCE TARGETING (STEP 3)
// =============================================================================

function FormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const campaignId = searchParams.get('id');
  const { data, updateData } = useWizard();
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadCampaignData = async () => {
      if (!campaignId || isInitialized) return;

      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(`/api/campaigns/${campaignId}`);
        const result = await response.json();
        
        if (!isMounted) return;

        if (!response.ok) {
          throw new Error(result.error || 'Failed to load campaign');
        }

        if (result.success) {
          updateData(result.campaign, result);
          toast.success('Campaign data loaded');
        }
      } catch (error) {
        if (!isMounted) return;
        const message = error instanceof Error ? error.message : 'Failed to load campaign';
        setError(message);
        toast.error(message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setIsInitialized(true);
        }
      }
    };

    loadCampaignData();

    return () => {
      isMounted = false;
    };
  }, [campaignId, updateData, isInitialized]);

  // Update initialValues to use type assertion
  const audienceData = (data as any)?.audience || {};
  const initialValues: AudienceValues = {
    location: audienceData.location || [],
    ageDistribution: {
      age1824: audienceData.ageDistribution?.age1824 ?? 0,
      age2534: audienceData.ageDistribution?.age2534 ?? 0,
      age3544: audienceData.ageDistribution?.age3544 ?? 0,
      age4554: audienceData.ageDistribution?.age4554 ?? 0,
      age5564: audienceData.ageDistribution?.age5564 ?? 0,
      age65plus: audienceData.ageDistribution?.age65plus ?? 0,
    },
    gender: audienceData.gender || [],
    otherGender: audienceData.otherGender || "",
    screeningQuestions: audienceData.screeningQuestions || [],
    languages: audienceData.languages || [],
    educationLevel: audienceData.educationLevel || "",
    jobTitles: audienceData.jobTitles || "",
    incomeLevel: audienceData.incomeLevel || "",
    competitors: audienceData.competitors || [],
  };

  const handleSubmit = async (values: AudienceValues) => {
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
          audience: values
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update campaign');
      }

      toast.success('Campaign updated successfully');
      router.push(`/campaigns/wizard/step-4?id=${campaignId}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update campaign';
      setError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDraft = async (values: AudienceValues) => {
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
          audience: values,
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
    <div className="max-w-4xl mx-auto p-4 pb-16 bg-white">
      <Header currentStep={3} totalSteps={5} />
      <Formik
        initialValues={initialValues}
        validationSchema={AudienceSchema}
        onSubmit={handleSubmit}
      >
        {({ values, setFieldValue, submitForm, isValid }) => (
          <>
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold">Step 3: Audience Targeting</h1>
              <button 
                type="button"
                onClick={() => handleSaveDraft(values)}
                className="px-4 py-2 border border-gray-400 rounded hover:bg-gray-100 flex items-center"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <LoadingSpinner className="w-4 h-4 mr-2" />
                    Saving...
                  </>
                ) : (
                  'Save as Draft'
                )}
              </button>
            </div>

            <Form className="space-y-8">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold mb-4">Demographics</h2>
                <LocationSelector
                  selectedLocations={values.location}
                  onChange={(locs) => {
                    setFieldValue("location", locs);
                  }}
                />
                <AgeDistributionSlider
                  values={[
                    values.ageDistribution.age1824,
                    values.ageDistribution.age2534,
                    values.ageDistribution.age3544,
                    values.ageDistribution.age4554,
                    values.ageDistribution.age5564,
                    values.ageDistribution.age65plus,
                  ]}
                  onChange={(newValues) => {
                    setFieldValue('ageDistribution', {
                      age1824: newValues[0],
                      age2534: newValues[1],
                      age3544: newValues[2],
                      age4554: newValues[3],
                      age5564: newValues[4],
                      age65plus: newValues[5],
                    });
                  }}
                />
                <ErrorMessage
                  name="ageDistribution"
                  component="div"
                  className="text-red-600 text-sm"
                />
                <GenderSelection
                  selected={values.gender}
                  otherGender={values.otherGender}
                  onChange={(genders) => {
                    setFieldValue("gender", genders);
                  }}
                  onOtherChange={(val) => {
                    setFieldValue("otherGender", val);
                  }}
                />
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold mb-4">Screening Questions</h2>
                <ScreeningQuestions
                  selectedTags={values.screeningQuestions}
                  onChange={(tags) => {
                    setFieldValue("screeningQuestions", tags);
                  }}
                />
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold mb-4">Languages</h2>
                <LanguagesSelector
                  selected={values.languages}
                  onChange={(langs) => {
                    setFieldValue("languages", langs);
                  }}
                />
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-blue-600 underline"
                >
                  {showAdvanced ? "Hide Advanced Options" : "Show Advanced Options"}
                </button>
                {showAdvanced && <AdvancedTargeting />}
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold mb-4">Competitors to Monitor</h2>
                <CompetitorTracking
                  selected={values.competitors}
                  onChange={(companies) => {
                    setFieldValue("competitors", companies);
                  }}
                />
              </div>
              
              <div className="pb-4"></div>
            </Form>

            <ProgressBar
              currentStep={3}
              onStepClick={(step) => router.push(`/campaigns/wizard/step-${step}?id=${campaignId}`)}
              onBack={() => router.push(`/campaigns/wizard/step-2?id=${campaignId}`)}
              onNext={submitForm}
              disableNext={!isValid || isSaving}
            />
          </>
        )}
      </Formik>
    </div>
  );
}

export default function Step3Content() {
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
