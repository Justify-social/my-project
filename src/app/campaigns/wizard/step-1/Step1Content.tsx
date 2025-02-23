"use client";

import React, { useState, useEffect, Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useWizard } from "@/context/WizardContext";
import Header from "@/components/Wizard/Header";
import ProgressBar from "@/components/Wizard/ProgressBar";
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

// Define the form values type
interface FormValues {
  name: string;
  businessGoal: string;
  startDate: string;
  endDate: string;
  timeZone: string;
  primaryContact: {
    firstName: string;
    surname: string;
    email: string;
    position: string;
  };
  secondaryContact: {
    firstName: string;
    surname: string;
    email: string;
    position: string;
  };
  currency: string;
  totalBudget: string | number;
  socialMediaBudget: string | number;
  platform: string;
  influencerHandle: string;
}

// Define the initial values
const initialValues = {
  name: '',
  businessGoal: '',
  startDate: '',
  endDate: '',
  timeZone: '',
  primaryContact: {
    firstName: '',
    surname: '',
    email: '',
    position: '',
  },
  secondaryContact: {
    firstName: '',
    surname: '',
    email: '',
    position: '',
  },
  currency: '',
  totalBudget: '',
  socialMediaBudget: '',
  platform: '',
  influencerHandle: '',
};

function SearchParamsWrapper() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const wizardContext = useWizard();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Destructure context with proper type checking
  if (!wizardContext) {
    throw new Error('Wizard context is required');
  }
  
  const { 
    formData,
    setFormData, 
    isEdit,
    setIsEdit, 
    data, 
    isEditing, 
    campaignData 
  } = wizardContext;

  // Get campaign ID from search params
  const campaignId = searchParams?.get('id');

  // Helper function to format dates - Define this BEFORE useMemo
  const formatDate = (date: string | undefined) => {
    if (!date) return '';
    try {
      return new Date(date).toISOString().split('T')[0];
    } catch (e) {
      console.error('Error formatting date:', e);
      return '';
    }
  };

  // Define default values first
  const defaultValues: FormValues = {
    name: '',
    businessGoal: '',
    startDate: '',
    endDate: '',
    timeZone: 'UTC',
    primaryContact: {
      firstName: '',
      surname: '',
      email: '',
      position: '',
    },
    secondaryContact: {
      firstName: '',
      surname: '',
      email: '',
      position: '',
    },
    currency: '',
    totalBudget: 0,
    socialMediaBudget: 0,
    platform: '',
    influencerHandle: '',
  };

  // Create initial values using the defaultValues and existing data
  const initialValues = useMemo(() => {
    if (isEditing && campaignData) {
      return {
        name: campaignData.campaignName || defaultValues.name,
        businessGoal: campaignData.description || defaultValues.businessGoal,
        startDate: formatDate(campaignData.startDate) || defaultValues.startDate,
        endDate: formatDate(campaignData.endDate) || defaultValues.endDate,
        timeZone: campaignData.timeZone || defaultValues.timeZone,
        primaryContact: {
          firstName: campaignData.primaryContact?.firstName || defaultValues.primaryContact.firstName,
          surname: campaignData.primaryContact?.surname || defaultValues.primaryContact.surname,
          email: campaignData.primaryContact?.email || defaultValues.primaryContact.email,
          position: campaignData.primaryContact?.position || defaultValues.primaryContact.position,
        },
        secondaryContact: {
          firstName: campaignData.secondaryContact?.firstName || defaultValues.secondaryContact.firstName,
          surname: campaignData.secondaryContact?.surname || defaultValues.secondaryContact.surname,
          email: campaignData.secondaryContact?.email || defaultValues.secondaryContact.email,
          position: campaignData.secondaryContact?.position || defaultValues.secondaryContact.position,
        },
        currency: campaignData.currency || defaultValues.currency,
        totalBudget: campaignData.totalBudget || defaultValues.totalBudget,
        socialMediaBudget: campaignData.socialMediaBudget || defaultValues.socialMediaBudget,
        platform: campaignData.platform || defaultValues.platform,
        influencerHandle: campaignData.influencerHandle || defaultValues.influencerHandle,
      };
    }

    // If not editing, check for basic data
    if (data?.basic) {
      return {
        name: data.basic.campaignName || defaultValues.name,
        businessGoal: data.basic.description || defaultValues.businessGoal,
        startDate: defaultValues.startDate,
        endDate: defaultValues.endDate,
        timeZone: defaultValues.timeZone,
        primaryContact: {
          firstName: defaultValues.primaryContact.firstName,
          surname: defaultValues.primaryContact.surname,
          email: defaultValues.primaryContact.email,
          position: defaultValues.primaryContact.position,
        },
        secondaryContact: {
          firstName: defaultValues.secondaryContact.firstName,
          surname: defaultValues.secondaryContact.surname,
          email: defaultValues.secondaryContact.email,
          position: defaultValues.secondaryContact.position,
        },
        currency: defaultValues.currency,
        totalBudget: defaultValues.totalBudget,
        socialMediaBudget: defaultValues.socialMediaBudget,
        platform: defaultValues.platform,
        influencerHandle: defaultValues.influencerHandle,
      };
    }

    return defaultValues;
  }, [isEditing, campaignData, data, defaultValues]);

  // Load campaign data when ID changes
  useEffect(() => {
    if (!campaignId) return;

    const loadCampaignData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/campaigns/${campaignId}`);
        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || 'Failed to load campaign');
        }

        // Make sure we're setting the complete campaign data
        if (setFormData && setIsEdit) {
          setFormData(result.data || result.campaign);
          setIsEdit(true);
          toast.success('Campaign data loaded');
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load campaign';
        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadCampaignData();
  }, [campaignId, setFormData, setIsEdit]);

  const handleSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      const method = isEditing ? 'PATCH' : 'POST';
      const url = isEditing ? `/api/campaigns/${campaignId}` : '/api/campaigns';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          status: 'draft'
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Failed to ${isEditing ? 'update' : 'create'} campaign`);
      }

      // Update form data with proper type checking
      if (setFormData) {
        setFormData({
          ...formData,
          campaignId: result.id || campaignId,
          step1: values
        });
      }

      toast.success(`Campaign ${isEditing ? 'updated' : 'created'} successfully`);
      router.push(`/campaigns/wizard/step-2?id=${result.id || campaignId}`);
    } catch (error) {
      console.error('Error:', error);
      const message = error instanceof Error ? error.message : 'An error occurred';
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const method = isEditing ? 'PATCH' : 'POST';
      const url = isEditing ? `/api/campaigns/${campaignId}` : '/api/campaigns';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          step: 1,
          status: 'draft'
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save draft');
      }

      // Update form data with proper type checking
      if (setFormData) {
        setFormData({
          ...formData,
          overview: values,
          id: result.id || campaignId
        });
      }

      toast.success('Draft saved successfully');
    } catch (error) {
      console.error('Draft save error:', error);
      const message = error instanceof Error ? error.message : 'Failed to save draft';
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
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
    <div className="max-w-4xl mx-auto p-4 pb-20">
      <Header currentStep={1} totalSteps={5} />
      <Formik
        initialValues={initialValues}
        validationSchema={OverviewSchema}
        onSubmit={handleSubmit}
        enableReinitialize={true}
      >
        {({ values, isValid, dirty, errors }) => {
          // Add debug log for form values
          console.log('Form values:', values);
          
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
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
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
              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={() => handleSaveDraft(values)}
                  className="btn btn-secondary"
                  disabled={isSubmitting}
                >
                  Save Draft
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting || !isValid}
                >
                  Next Step
                </button>
              </div>
              <ProgressBar
                currentStep={1}
                onStepClick={(step) => router.push(`/campaigns/wizard/step-${step}`)}
                onBack={null}
                onNext={handleNextStep}
                disableNext={isSubmitting || !isValid}
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

export default function Step1Content() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <SearchParamsWrapper />
    </Suspense>
  );
}