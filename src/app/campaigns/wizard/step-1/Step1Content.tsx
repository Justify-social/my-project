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
import { 
  CalendarIcon, 
  InformationCircleIcon,
  ChevronDownIcon,
  UserCircleIcon,
  CurrencyDollarIcon,
  GlobeAltIcon,
  PlusCircleIcon,
  BriefcaseIcon,
  ClockIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  XCircleIcon
} from "@heroicons/react/24/outline";

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
      endDate: Yup.string()
        .required("End date is required")
        .test('is-after-start-date', 'End date must be after start date', function(endDate) {
          const { startDate } = this.parent;
          if (!startDate || !endDate) return true; // Skip validation if dates aren't provided
          return new Date(endDate) > new Date(startDate);
        }),
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

// First, update the FormValues interface to include additional contacts
interface Contact {
  firstName: string;
  surname: string;
  email: string;
  position: string;
}

// Define the form values type
interface FormValues {
  name: string;
  businessGoal: string;
  startDate: string;
  endDate: string;
  timeZone: string;
  primaryContact: Contact;
  secondaryContact: Contact;
  additionalContacts: Contact[];
  currency: string;
  totalBudget: string | number;
  socialMediaBudget: string | number;
  platform: string;
  influencerHandle: string;
}

// Add this FormData interface to match what's defined in the wizard context
interface FormData {
  name: string;
  businessGoal: string;
  startDate: string;
  endDate: string;
  timeZone: string;
  currency: string;
  totalBudget: string | number;
  socialMediaBudget: string | number;
  platform: string;
  influencerHandle: string;
  [key: string]: any; // Allow for additional properties for extensibility
}

// Define default values
const defaultFormValues: FormValues = {
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
  additionalContacts: [],
  currency: '',
  totalBudget: '',
  socialMediaBudget: '',
  platform: '',
  influencerHandle: '',
};

// Custom Field Component for styled inputs
const StyledField = ({ label, name, type = "text", as, children, required = false, icon, ...props }: any) => {
  return (
    <div className="mb-5">
      <label htmlFor={name} className="block text-sm font-medium text-primary-color mb-2 font-work-sans">
        {label}
        {required && <span className="text-accent-color ml-1">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-2.5 text-secondary-color">
            {icon}
          </div>
        )}
        {as ? (
          <Field
            as={as}
            id={name}
            name={name}
            className={`w-full p-2.5 ${icon ? 'pl-10' : 'pl-3'} border border-divider-color rounded-md focus:ring-2 focus:ring-accent-color focus:border-accent-color focus:outline-none transition-colors duration-200 shadow-sm bg-white font-work-sans`}
            {...props}
          >
            {children}
          </Field>
        ) : (
          <Field
            type={type}
            id={name}
            name={name}
            className={`w-full p-2.5 ${icon ? 'pl-10' : 'pl-3'} border border-divider-color rounded-md focus:ring-2 focus:ring-accent-color focus:border-accent-color focus:outline-none transition-colors duration-200 shadow-sm bg-white font-work-sans`}
            {...props}
          />
        )}
        {/* Only add the calendar icon on the right if it's a date type AND no icon was provided */}
        {type === "date" && !icon && (
          <CalendarIcon className="absolute right-3 top-2.5 w-5 h-5 text-secondary-color" />
        )}
        {as === "select" && (
          <ChevronDownIcon className="absolute right-3 top-2.5 w-5 h-5 text-secondary-color pointer-events-none" />
        )}
      </div>
      <ErrorMessage name={name} component="p" className="mt-1 text-sm text-red-600" />
    </div>
  );
};

// Custom date field component to handle the calendar icon issue
const DateField = ({ label, name, required = false, ...props }: any) => {
  return (
    <div className="mb-5">
      <label htmlFor={name} className="block text-sm font-medium text-primary-color mb-2 font-work-sans">
        {label}
        {required && <span className="text-accent-color ml-1">*</span>}
      </label>
      <div className="relative">
        <Field
          type="date"
          id={name}
          name={name}
          className="w-full p-2.5 pr-10 border border-divider-color rounded-md focus:ring-2 focus:ring-accent-color focus:border-accent-color focus:outline-none transition-colors duration-200 shadow-sm bg-white font-work-sans"
          {...props}
        />
        <CalendarIcon className="absolute right-3 top-2.5 w-5 h-5 text-secondary-color" />
      </div>
      <ErrorMessage name={name} component="p" className="mt-1 text-sm text-red-600" />
    </div>
  );
};

// Define extended wizard data interface
interface WizardData {
  basic?: {
    campaignName?: string;
    description?: string;
  };
}

// Replace the ContactSchema and ValidationSchema with corrected versions
const ContactSchema = Yup.object().shape({
  firstName: Yup.string().optional(),
  surname: Yup.string().optional(),
  email: Yup.string().email('Invalid email').optional(),
  position: Yup.string().optional(),
});

const PrimaryContactSchema = Yup.object().shape({
  firstName: Yup.string().required('First name is required'),
  surname: Yup.string().required('Last name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  position: Yup.string().required('Position is required'),
});

const ValidationSchema = Yup.object().shape({
  name: Yup.string().required('Campaign name is required'),
  businessGoal: Yup.string().required('Business goal is required'),
  startDate: Yup.date().required('Start date is required'),
  endDate: Yup.date()
    .required('End date is required')
    .min(Yup.ref('startDate'), 'End date cannot be before start date'),
  timeZone: Yup.string().required('Timezone is required'),
  primaryContact: PrimaryContactSchema,
  secondaryContact: ContactSchema,
  additionalContacts: Yup.array().of(ContactSchema).default([]),
  currency: Yup.string().required('Currency is required'),
  totalBudget: Yup.number()
    .required('Total budget is required')
    .positive('Total budget must be positive'),
  socialMediaBudget: Yup.number()
    .required('Social media budget is required')
    .positive('Social media budget must be positive')
    .max(Yup.ref('totalBudget'), 'Social media budget cannot exceed total budget'),
  platform: Yup.string().required('Platform is required'),
  influencerHandle: Yup.string().required('Influencer handle is required'),
});

// Separate the search params logic into its own component
function FormContent() {
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
    updateFormData,
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

  // Create initial values using the defaultValues and existing data
  const initialValues = useMemo(() => {
    if (isEditing && campaignData) {
      return {
        name: campaignData.campaignName || defaultFormValues.name,
        businessGoal: campaignData.description || defaultFormValues.businessGoal,
        startDate: formatDate(campaignData.startDate) || defaultFormValues.startDate,
        endDate: formatDate(campaignData.endDate) || defaultFormValues.endDate,
        timeZone: campaignData.timeZone || defaultFormValues.timeZone,
        primaryContact: {
          firstName: campaignData.primaryContact?.firstName || defaultFormValues.primaryContact.firstName,
          surname: campaignData.primaryContact?.surname || defaultFormValues.primaryContact.surname,
          email: campaignData.primaryContact?.email || defaultFormValues.primaryContact.email,
          position: campaignData.primaryContact?.position || defaultFormValues.primaryContact.position,
        },
        secondaryContact: {
          firstName: campaignData.secondaryContact?.firstName || defaultFormValues.secondaryContact.firstName,
          surname: campaignData.secondaryContact?.surname || defaultFormValues.secondaryContact.surname,
          email: campaignData.secondaryContact?.email || defaultFormValues.secondaryContact.email,
          position: campaignData.secondaryContact?.position || defaultFormValues.secondaryContact.position,
        },
        currency: campaignData.currency || defaultFormValues.currency,
        totalBudget: campaignData.totalBudget || defaultFormValues.totalBudget,
        socialMediaBudget: campaignData.socialMediaBudget || defaultFormValues.socialMediaBudget,
        platform: campaignData.platform || defaultFormValues.platform,
        influencerHandle: campaignData.influencerHandle || defaultFormValues.influencerHandle,
      };
    }

    // If not editing, check for basic data
    if (data && (data as WizardData).basic) {
      const wizardData = data as WizardData;
      return {
        name: wizardData.basic?.campaignName || defaultFormValues.name,
        businessGoal: wizardData.basic?.description || defaultFormValues.businessGoal,
        startDate: defaultFormValues.startDate,
        endDate: defaultFormValues.endDate,
        timeZone: defaultFormValues.timeZone,
        primaryContact: {
          firstName: defaultFormValues.primaryContact.firstName,
          surname: defaultFormValues.primaryContact.surname,
          email: defaultFormValues.primaryContact.email,
          position: defaultFormValues.primaryContact.position,
        },
        secondaryContact: {
          firstName: defaultFormValues.secondaryContact.firstName,
          surname: defaultFormValues.secondaryContact.surname,
          email: defaultFormValues.secondaryContact.email,
          position: defaultFormValues.secondaryContact.position,
        },
        currency: defaultFormValues.currency,
        totalBudget: defaultFormValues.totalBudget,
        socialMediaBudget: defaultFormValues.socialMediaBudget,
        platform: defaultFormValues.platform,
        influencerHandle: defaultFormValues.influencerHandle,
      };
    }

    return defaultFormValues;
  }, [isEditing, campaignData, data]);

  // Update the useEffect to prevent infinite loops
  useEffect(() => {
    if (!campaignId) return;
    
    // Only load data if we haven't already loaded it
    if (!isLoading && !campaignData) {
      loadCampaignData();
    }
    // Make sure we only include dependencies that won't change frequently
  }, [campaignId, isLoading, campaignData]);

  // Update the loadCampaignData function to avoid updating formData in a way that causes loops
  const loadCampaignData = async () => {
    if (!campaignId) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/campaigns/${campaignId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch campaign data');
      }

      const campaignData = await response.json();
      
      // Parse contacts field to get additionalContacts if available
      let additionalContacts = [];
      if (campaignData.contacts) {
        try {
          const parsedContacts = JSON.parse(campaignData.contacts);
          if (Array.isArray(parsedContacts)) {
            additionalContacts = parsedContacts;
          }
        } catch (e) {
          console.error('Error parsing additionalContacts:', e);
        }
      }

      // We don't need to set initialValues here as it's handled by the useMemo above
      // Just update the wizard context with the minimal necessary data
      
      // This was causing re-renders and potential loops
      // updateFormData({
      //   ...formData,
      //   campaignId
      // });
      
      toast.success('Campaign data loaded');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load campaign';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Update handleSubmit function to include additionalContacts
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

      // Update form data correctly
      updateFormData({
        campaignId: result.id || campaignId,
        // Add any other fields needed in formData
      });

      // Store additionalContacts in localStorage for recovery
      if (values.additionalContacts && values.additionalContacts.length > 0) {
        localStorage.setItem('additionalContacts', JSON.stringify(values.additionalContacts));
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

      // Update form data with the new values
      updateFormData({
        ...formData,
        overview: values,
        id: result.id || campaignId
      });

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
      <div className="p-6 bg-red-50 border border-red-200 rounded-md shadow-sm">
        <h3 className="text-red-800 font-semibold font-sora">Error</h3>
        <p className="text-red-600 font-work-sans">{error}</p>
        <button
          onClick={() => router.push('/campaigns')}
          className="mt-4 px-4 py-2 bg-accent-color text-white rounded-md hover:bg-accent-color/90 transition-colors duration-200 font-work-sans"
        >
          Return to Campaigns
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-8 bg-white">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-primary-color mb-2 font-sora">Campaign Creation</h1>
        <p className="text-secondary-color font-work-sans">Complete all required fields to create your campaign</p>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={ValidationSchema}
        onSubmit={handleSubmit}
        enableReinitialize={true}
      >
        {({ values, isValid, dirty, errors, setFieldValue }) => {
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
              <Form className="space-y-8">
                {/* Campaign Details */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-divider-color">
                  <h2 className="text-lg font-bold font-sora text-primary-color mb-5 flex items-center">
                    <BriefcaseIcon className="w-5 h-5 mr-2 text-accent-color" />
                    Campaign Details
                  </h2>
                  
                  <StyledField
                    label="Campaign Name"
                    name="name"
                    placeholder="Enter your campaign name"
                    required
                  />

                  <StyledField
                    label="What business goals does this campaign support?"
                    name="businessGoal"
                    as="textarea"
                    rows={4}
                    placeholder="e.g. Increase market share by 5% in the next quarter. Launch a new product line targeting millennials."
                    required
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    <DateField
                      label="Start Date"
                      name="startDate"
                      required
                    />
                    <DateField
                      label="End Date"
                      name="endDate"
                      required
                    />
                    <StyledField
                      label="Time Zone"
                      name="timeZone"
                      as="select"
                      required
                      icon={<ClockIcon className="w-5 h-5" />}
                    >
                      <option value="">Select time zone</option>
                      <option value="UTC">UTC</option>
                      <option value="GMT">GMT</option>
                      <option value="EST">EST</option>
                      <option value="PST">PST</option>
                    </StyledField>
                  </div>
                </div>

                {/* Primary Contact */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-divider-color">
                  <h2 className="text-lg font-bold font-sora text-primary-color mb-5 flex items-center">
                    <UserCircleIcon className="w-5 h-5 mr-2 text-accent-color" />
                    Primary Contact
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <StyledField
                      label="First Name"
                      name="primaryContact.firstName"
                      placeholder="Enter first name"
                      required
                      icon={<UserCircleIcon className="w-5 h-5" />}
                    />
                    <StyledField
                      label="Last Name"
                      name="primaryContact.surname"
                      placeholder="Enter last name"
                      required
                      icon={<UserCircleIcon className="w-5 h-5" />}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <StyledField
                      label="Email"
                      name="primaryContact.email"
                      type="email"
                      placeholder="email@example.com"
                      required
                      icon={<EnvelopeIcon className="w-5 h-5" />}
                    />
                    <StyledField
                      label="Position"
                      name="primaryContact.position"
                      as="select"
                      required
                      icon={<BuildingOfficeIcon className="w-5 h-5" />}
                    >
                      <option value="">Select Position</option>
                      <option value={Position.Manager}>{Position.Manager}</option>
                      <option value={Position.Director}>{Position.Director}</option>
                      <option value={Position.VP}>{Position.VP}</option>
                    </StyledField>
                  </div>
                </div>

                {/* Secondary Contact */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-divider-color">
                  <h2 className="text-lg font-bold font-sora text-primary-color mb-5 flex items-center">
                    <UserCircleIcon className="w-5 h-5 mr-2 text-accent-color" />
                    Secondary Contact <span className="text-sm font-normal text-secondary-color ml-2 font-work-sans">(Optional)</span>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <StyledField
                      label="First Name"
                      name="secondaryContact.firstName"
                      placeholder="Enter first name"
                      icon={<UserCircleIcon className="w-5 h-5" />}
                    />
                    <StyledField
                      label="Last Name"
                      name="secondaryContact.surname"
                      placeholder="Enter last name"
                      icon={<UserCircleIcon className="w-5 h-5" />}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <StyledField
                      label="Email"
                      name="secondaryContact.email"
                      type="email"
                      placeholder="email@example.com"
                      icon={<EnvelopeIcon className="w-5 h-5" />}
                    />
                    <StyledField
                      label="Position"
                      name="secondaryContact.position"
                      as="select"
                      icon={<BuildingOfficeIcon className="w-5 h-5" />}
                    >
                      <option value="">Select Position</option>
                      <option value={Position.Manager}>{Position.Manager}</option>
                      <option value={Position.Director}>{Position.Director}</option>
                      <option value={Position.VP}>{Position.VP}</option>
                    </StyledField>
                  </div>
                </div>

                {/* Additional Contacts */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-divider-color">
                  <div className="flex justify-between items-center mb-5">
                    <h2 className="text-lg font-bold font-sora text-primary-color flex items-center">
                      <UserGroupIcon className="w-5 h-5 mr-2 text-accent-color" />
                      Additional Contacts <span className="text-sm font-normal text-secondary-color ml-2 font-work-sans">(Optional)</span>
                    </h2>
                    <button
                      type="button"
                      onClick={() => {
                        const contacts = [...values.additionalContacts, {
                          firstName: '',
                          surname: '',
                          email: '',
                          position: '',
                        }];
                        setFieldValue('additionalContacts', contacts);
                      }}
                      className="flex items-center text-sm font-medium bg-white border border-accent-color text-accent-color hover:bg-accent-color/10 px-3 py-1 rounded-md transition-colors duration-200 font-work-sans"
                    >
                      <PlusCircleIcon className="w-5 h-5 mr-1" />
                      Add Contact
                    </button>
                  </div>

                  {values.additionalContacts && values.additionalContacts.length > 0 ? (
                    values.additionalContacts.map((contact, index) => (
                      <div key={index} className="mb-6 border border-divider-color rounded-lg p-4 relative shadow-sm bg-white">
                        <button
                          type="button"
                          onClick={() => {
                            const contacts = [...values.additionalContacts];
                            contacts.splice(index, 1);
                            setFieldValue('additionalContacts', contacts);
                          }}
                          className="absolute top-2 right-2 text-secondary-color hover:text-accent-color transition-colors duration-200"
                          aria-label="Remove contact"
                        >
                          <XCircleIcon className="w-5 h-5" />
                        </button>

                        <h3 className="text-md font-medium text-primary-color mb-3 font-sora">Contact {index + 3}</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <StyledField
                            label="First Name"
                            name={`additionalContacts.${index}.firstName`}
                            placeholder="Enter first name"
                            icon={<UserCircleIcon className="w-5 h-5" />}
                          />
                          <StyledField
                            label="Last Name"
                            name={`additionalContacts.${index}.surname`}
                            placeholder="Enter last name"
                            icon={<UserCircleIcon className="w-5 h-5" />}
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                          <StyledField
                            label="Email"
                            name={`additionalContacts.${index}.email`}
                            type="email"
                            placeholder="email@example.com"
                            icon={<EnvelopeIcon className="w-5 h-5" />}
                          />
                          <StyledField
                            label="Position"
                            name={`additionalContacts.${index}.position`}
                            as="select"
                            icon={<BuildingOfficeIcon className="w-5 h-5" />}
                          >
                            <option value="">Select Position</option>
                            <option value={Position.Manager}>{Position.Manager}</option>
                            <option value={Position.Director}>{Position.Director}</option>
                            <option value={Position.VP}>{Position.VP}</option>
                          </StyledField>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 border border-dashed border-divider-color rounded-lg bg-gray-50">
                      <UserGroupIcon className="w-12 h-12 mx-auto text-accent-color opacity-70" />
                      <p className="mt-2 text-primary-color font-sora">No additional contacts added yet.</p>
                      <p className="text-sm text-secondary-color font-work-sans">Click "Add Contact" to include more team members.</p>
                    </div>
                  )}
                </div>

                {/* Budget Section */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-divider-color">
                  <h2 className="text-lg font-bold font-sora text-primary-color mb-5 flex items-center">
                    <CurrencyDollarIcon className="w-5 h-5 mr-2 text-accent-color" />
                    Budget
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StyledField
                      label="Currency"
                      name="currency"
                      as="select"
                      required
                      icon={<CurrencyDollarIcon className="w-5 h-5" />}
                    >
                      <option value="">Select currency</option>
                      <option value={Currency.GBP}>GBP (£)</option>
                      <option value={Currency.USD}>USD ($)</option>
                      <option value={Currency.EUR}>EUR (€)</option>
                    </StyledField>
                    
                    <StyledField
                      label="Total Campaign Budget"
                      name="totalBudget"
                      type="number"
                      placeholder="5000"
                      required
                      icon={<CurrencyDollarIcon className="w-5 h-5" />}
                    />
                    
                    <StyledField
                      label="Social Media Budget"
                      name="socialMediaBudget"
                      type="number"
                      placeholder="3000"
                      required
                      icon={<CurrencyDollarIcon className="w-5 h-5" />}
                    />
                  </div>
                </div>

                {/* Influencers */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-divider-color">
                  <h2 className="text-lg font-bold font-sora text-primary-color mb-5 flex items-center">
                    <GlobeAltIcon className="w-5 h-5 mr-2 text-accent-color" />
                    Influencers
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <StyledField
                      label="Platform"
                      name="platform"
                      as="select"
                      required
                      icon={<GlobeAltIcon className="w-5 h-5" />}
                    >
                      <option value="">Select platform</option>
                      <option value={Platform.Instagram}>{Platform.Instagram}</option>
                      <option value={Platform.YouTube}>{Platform.YouTube}</option>
                      <option value={Platform.TikTok}>{Platform.TikTok}</option>
                    </StyledField>
                    
                    <StyledField
                      label="Influencer Handle"
                      name="influencerHandle"
                      placeholder="@username"
                      required
                      icon={<UserCircleIcon className="w-5 h-5" />}
                    />
                  </div>
                  
                  {values.influencerHandle && (
                    <div className="flex items-center gap-3 p-4 bg-white rounded-lg mt-4 border border-divider-color shadow-sm">
                      <div className="w-10 h-10 bg-accent-color/20 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center">
                        <UserCircleIcon className="w-6 h-6 text-accent-color" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-primary-color font-work-sans">Olivia Bennett</p>
                        <p className="text-xs text-secondary-color font-work-sans">@{values.influencerHandle}</p>
                      </div>
                      <div className="ml-auto flex items-center gap-2">
                        <span className="text-xs bg-accent-color/10 text-accent-color px-2 py-1 rounded-full font-medium">
                          7k Followers
                        </span>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                          2.3% Engagement
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </Form>

              {/* Add extra bottom padding to prevent progress bar overlap */}
              <div className="pb-24"></div>

              <ProgressBar
                currentStep={1}
                onStepClick={(step) => router.push(`/campaigns/wizard/step-${step}`)}
                onBack={null}
                onNext={handleNextStep}
                onSaveDraft={() => handleSaveDraft(values)}
                disableNext={isSubmitting || !isValid}
                isFormValid={isValid}
                isDirty={dirty}
                isSaving={isSubmitting}
              />
            </>
          );
        }}
      </Formik>
    </div>
  );
}

// Main component with Suspense boundary
export default function Step1Content() {
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