"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useWizard } from "../../../../context/WizardContext";
import Header from "../../../../components/Wizard/Header";
import ProgressBar from "../../../../components/Wizard/ProgressBar";
import { toast } from "react-hot-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
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

// First, add these enums at the top of your file
enum Currency {
  GBP = "GBP",
  USD = "USD",
  EUR = "EUR"
}

enum Platform {
  Instagram = "Instagram",
  YouTube = "YouTube",
  TikTok = "TikTok"
}

enum Position {
  Manager = "Manager",
  Director = "Director",
  VP = "VP"
}

// Add this debug function at the top
const debugFormData = (values: any, isDraft: boolean) => {
  console.log('Form Submission Debug:', {
    type: isDraft ? 'DRAFT' : 'SUBMIT',
    timestamp: new Date().toISOString(),
    values: values,
  });
};

function OverviewContent() {
  const router = useRouter();
  const { data, updateData } = useWizard();
  const searchParams = useSearchParams();
  const campaignId = searchParams.get('id');
  
  const [state, setState] = useState({
    isSubmitting: false,
    isLoading: false,
    error: null as string | null,
  });

  const initialValues = {
    name: data.overview.name || "",
    businessGoal: data.overview.businessGoal || "",
    startDate: data.overview.startDate || "",
    endDate: data.overview.endDate || "",
    timeZone: data.overview.timeZone || "UTC",
    primaryContact: {
      firstName: data.overview.primaryContact?.firstName || "",
      surname: data.overview.primaryContact?.surname || "",
      email: data.overview.primaryContact?.email || "",
      position: data.overview.primaryContact?.position || "",
    },
    secondaryContact: {
      firstName: data.overview.secondaryContact?.firstName || "",
      surname: data.overview.secondaryContact?.surname || "",
      email: data.overview.secondaryContact?.email || "",
      position: data.overview.secondaryContact?.position || "",
    },
    currency: data.overview.currency || "",
    totalBudget: data.overview.totalBudget || "",
    socialMediaBudget: data.overview.socialMediaBudget || "",
    platform: data.overview.platform || "",
    influencerHandle: data.overview.influencerHandle || "",
  };

  useEffect(() => {
    const loadCampaignData = async () => {
      if (campaignId) {
        try {
          setState(prev => ({ ...prev, isLoading: true, error: null }));
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
          setState(prev => ({ ...prev, error: message }));
          toast.error(message);
        } finally {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    loadCampaignData();
  }, [campaignId]);

  const handleSubmit = async (values: any) => {
    try {
      setState(prev => ({ ...prev, isSubmitting: true, error: null }));
      
      // Create campaign first to get ID
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          status: 'draft'
        })
      });

      const result = await response.json();
      console.log('Campaign created:', result);

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create campaign');
      }

      // Store the campaign ID and data
      updateData({
        ...data,
        campaignId: result.id,
        step1: values
      });

      // Navigate to next step with the new ID
      router.push(`/campaigns/wizard/step-2?id=${result.id}`);
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast.error('Failed to create campaign');
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  const handleSaveDraft = async (values: any) => {
    try {
      setState(prev => ({ ...prev, isSubmitting: true }));

      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: values.name,
          businessGoal: values.businessGoal,
          startDate: values.startDate,
          endDate: values.endDate,
          timeZone: values.timeZone,
          primaryContact: values.primaryContact,
          secondaryContact: values.secondaryContact,
          currency: values.currency,
          totalBudget: Number(values.totalBudget),
          socialMediaBudget: Number(values.socialMediaBudget),
          platform: values.platform,
          influencerHandle: values.influencerHandle,
          step: 1,
          status: 'draft'
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save draft');
      }

      updateData({
        ...data,
        overview: values,
        id: result.id
      });

      toast.success('Draft saved successfully');
    } catch (error) {
      console.error('Draft save error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save draft');
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
        <p className="ml-2">Loading campaign data...</p>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <h3 className="text-red-800 font-semibold">Error</h3>
        <p className="text-red-600">{state.error}</p>
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
    <div className="max-w-4xl mx-auto p-4 pb-20">
      <Header currentStep={1} totalSteps={5} />
      <Formik
        initialValues={initialValues}
        validationSchema={OverviewSchema}
        onSubmit={handleSubmit}
      >
        {({ values, isValid, dirty, errors }) => {
          const handleNextStep = async () => {
            if (!isValid) {
              const errorKeys = Object.keys(errors);
              console.log('Validation errors:', errors);
              toast.error(`Please fix the following: ${errorKeys.join(', ')}`);
              return;
            }

            await handleSubmit(values);
          };

          return (
            <>
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Step 1: Campaign Details</h1>
                <button 
                  type="button"
                  onClick={() => handleSaveDraft(values)}
                  className="px-4 py-2 border border-gray-400 rounded hover:bg-gray-100 flex items-center"
                  disabled={state.isSubmitting}
                >
                  {state.isSubmitting ? (
                    <>
                      <LoadingSpinner className="w-4 h-4 mr-2" />
                      Saving...
                    </>
                  ) : (
                    'Save Draft'
                  )}
                </button>
              </div>

              <Form className="space-y-8">
                {/* Campaign Name */}
                <div>
                  <label htmlFor="name" className="block font-semibold">
                    Campaign Name
                  </label>
                  <Field
                    id="name"
                    name="name"
                    placeholder="Campaign Name"
                    className="w-full p-2 border rounded"
                  />
                  <ErrorMessage name="name" component="div" className="text-red-600 text-sm" />
                </div>
                {/* Business Goal */}
                <div>
                  <label htmlFor="businessGoal" className="block font-semibold">
                    What business goal does this campaign support?
                  </label>
                  <Field
                    as="textarea"
                    id="businessGoal"
                    name="businessGoal"
                    placeholder="e.g. Increase market share by 5% in the next quarter. Launch a new product line targeting millennials."
                    className="w-full p-2 border rounded"
                    maxLength={3000}
                  />
                  <ErrorMessage name="businessGoal" component="div" className="text-red-600 text-sm" />
                </div>
                {/* Date & Time */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="startDate" className="block font-semibold">
                      Start Date
                    </label>
                    <Field id="startDate" name="startDate" type="date" className="w-full p-2 border rounded" />
                    <ErrorMessage name="startDate" component="div" className="text-red-600 text-sm" />
                  </div>
                  <div>
                    <label htmlFor="endDate" className="block font-semibold">
                      End Date
                    </label>
                    <Field id="endDate" name="endDate" type="date" className="w-full p-2 border rounded" />
                    <ErrorMessage name="endDate" component="div" className="text-red-600 text-sm" />
                  </div>
                  <div>
                    <label htmlFor="timeZone" className="block font-semibold">
                      Select from common time zones
                    </label>
                    <Field as="select" id="timeZone" name="timeZone" className="w-full p-2 border rounded">
                      <option value="UTC">UTC</option>
                      <option value="GMT">GMT</option>
                      <option value="EST">EST</option>
                      <option value="PST">PST</option>
                    </Field>
                    <ErrorMessage name="timeZone" component="div" className="text-red-600 text-sm" />
                  </div>
                </div>
                {/* Contacts / Influencers Section */}
                <div>
                  <h2 className="text-xl font-bold mb-2">Who's in charge?</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {/* Primary Contact */}
                    <div className="border p-4 rounded">
                      <h3 className="font-semibold mb-2">Primary Contact</h3>
                      <div className="mb-2">
                        <label htmlFor="primaryContact.firstName" className="block text-sm font-medium">
                          First Name
                        </label>
                        <Field
                          id="primaryContact.firstName"
                          name="primaryContact.firstName"
                          placeholder="First Name"
                          className="w-full p-2 border rounded"
                        />
                      </div>
                      <div className="mb-2">
                        <label htmlFor="primaryContact.surname" className="block text-sm font-medium">
                          Surname
                        </label>
                        <Field
                          id="primaryContact.surname"
                          name="primaryContact.surname"
                          placeholder="Surname"
                          className="w-full p-2 border rounded"
                        />
                      </div>
                      <div className="mb-2">
                        <label htmlFor="primaryContact.email" className="block text-sm font-medium">
                          Email
                        </label>
                        <Field
                          id="primaryContact.email"
                          name="primaryContact.email"
                          type="email"
                          placeholder="email@domain.com"
                          className="w-full p-2 border rounded"
                        />
                      </div>
                      <div>
                        <label htmlFor="primaryContact.position" className="block text-sm font-medium">
                          Position
                        </label>
                        <Field
                          as="select"
                          id="primaryContact.position"
                          name="primaryContact.position"
                          className="w-full p-2 border rounded"
                        >
                          <option value="">Select Position</option>
                          <option value={Position.Manager}>{Position.Manager}</option>
                          <option value={Position.Director}>{Position.Director}</option>
                          <option value={Position.VP}>{Position.VP}</option>
                        </Field>
                        <ErrorMessage name="primaryContact.position" component="div" className="text-red-600 text-sm" />
                      </div>
                    </div>
                    {/* Secondary Contact */}
                    <div className="border p-4 rounded">
                      <h3 className="font-semibold mb-2">Secondary Contact</h3>
                      <div className="mb-2">
                        <label htmlFor="secondaryContact.firstName" className="block text-sm font-medium">
                          First Name
                        </label>
                        <Field
                          id="secondaryContact.firstName"
                          name="secondaryContact.firstName"
                          placeholder="First Name"
                          className="w-full p-2 border rounded"
                        />
                      </div>
                      <div className="mb-2">
                        <label htmlFor="secondaryContact.surname" className="block text-sm font-medium">
                          Surname
                        </label>
                        <Field
                          id="secondaryContact.surname"
                          name="secondaryContact.surname"
                          placeholder="Surname"
                          className="w-full p-2 border rounded"
                        />
                      </div>
                      <div className="mb-2">
                        <label htmlFor="secondaryContact.email" className="block text-sm font-medium">
                          Email
                        </label>
                        <Field
                          id="secondaryContact.email"
                          name="secondaryContact.email"
                          type="email"
                          placeholder="email@domain.com"
                          className="w-full p-2 border rounded"
                        />
                      </div>
                      <div>
                        <label htmlFor="secondaryContact.position" className="block text-sm font-medium">
                          Position
                        </label>
                        <Field
                          as="select"
                          id="secondaryContact.position"
                          name="secondaryContact.position"
                          className="w-full p-2 border rounded"
                        >
                          <option value="">Select Position</option>
                          <option value={Position.Manager}>{Position.Manager}</option>
                          <option value={Position.Director}>{Position.Director}</option>
                          <option value={Position.VP}>{Position.VP}</option>
                        </Field>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Budget Section */}
                <div>
                  <h2 className="text-xl font-bold mb-2">Budget</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="currency" className="block font-semibold">
                        Currency
                      </label>
                      <Field as="select" id="currency" name="currency" className="w-full p-2 border rounded">
                        <option value="">Select Currency</option>
                        <option value={Currency.GBP}>GBP (£)</option>
                        <option value={Currency.USD}>USD ($)</option>
                        <option value={Currency.EUR}>EUR (€)</option>
                      </Field>
                      <ErrorMessage name="currency" component="div" className="text-red-600 text-sm" />
                    </div>
                    <div>
                      <label htmlFor="totalBudget" className="block font-semibold">
                        Total campaign budget
                      </label>
                      <Field 
                        id="totalBudget" 
                        name="totalBudget" 
                        type="number" 
                        placeholder="Enter budget"
                        className="w-full p-2 border rounded" 
                      />
                      <ErrorMessage name="totalBudget" component="div" className="text-red-600 text-sm" />
                    </div>
                    <div>
                      <label htmlFor="socialMediaBudget" className="block font-semibold">
                        Budget allocated to social media
                      </label>
                      <Field 
                        id="socialMediaBudget" 
                        name="socialMediaBudget" 
                        type="number" 
                        placeholder="Enter social media budget"
                        className="w-full p-2 border rounded" 
                      />
                      <ErrorMessage name="socialMediaBudget" component="div" className="text-red-600 text-sm" />
                    </div>
                  </div>
                </div>
                {/* Platform & Influencer Selection */}
                <div>
                  <h2 className="text-xl font-bold mb-2">Platform & Influencer Selection</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="platform" className="block font-semibold">
                        Platform
                      </label>
                      <Field as="select" id="platform" name="platform" className="w-full p-2 border rounded">
                        <option value="">Select Platform</option>
                        <option value={Platform.Instagram}>{Platform.Instagram}</option>
                        <option value={Platform.YouTube}>{Platform.YouTube}</option>
                        <option value={Platform.TikTok}>{Platform.TikTok}</option>
                      </Field>
                      <ErrorMessage name="platform" component="div" className="text-red-600 text-sm" />
                    </div>
                    <div>
                      <label htmlFor="influencerHandle" className="block font-semibold">
                        Start typing influencer's handle
                      </label>
                      <Field
                        id="influencerHandle"
                        name="influencerHandle"
                        placeholder="e.g. oliviabennett"
                        className="w-full p-2 border rounded"
                      />
                      <ErrorMessage name="influencerHandle" component="div" className="text-red-600 text-sm" />
                    </div>
                  </div>
                </div>
              </Form>
              <ProgressBar
                currentStep={1}
                onStepClick={(step) => router.push(`/campaigns/wizard/step-${step}`)}
                onBack={null}
                onNext={handleNextStep}
                disableNext={state.isSubmitting || !isValid}
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

export default function Overview() {
  return (
    <Suspense 
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner />
          <p className="ml-2">Loading...</p>
        </div>
      }
    >
      <OverviewContent />
    </Suspense>
  );
}