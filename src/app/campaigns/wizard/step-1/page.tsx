"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useWizard } from "../../../../context/WizardContext";
import Header from "../../../../components/Wizard/Header";
import ProgressBar from "../../../../components/Wizard/ProgressBar";
import { toast } from "react-hot-toast";
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

export default function Overview() {
  const router = useRouter();
  const { data, updateData } = useWizard();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialValues = {
    name: data.overview.name || "",
    businessGoal: data.overview.businessGoal || "",
    startDate: data.overview.startDate || "",
    endDate: data.overview.endDate || "",
    timeZone: data.overview.timeZone || "UTC",
    contacts: data.overview.contacts || "",
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
    currency: data.overview.currency || "£",
    totalBudget: data.overview.totalBudget || 5000,
    socialMediaBudget: data.overview.socialMediaBudget || 1000,
    platform: data.overview.platform || "",
    influencerHandle: data.overview.influencerHandle || "",
  };

  const handleSubmit = async (values: any, isDraft = false) => {
    try {
      setIsSubmitting(true);
      console.log('Save Draft clicked');
      console.log('Form values:', values);

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
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Server response:', data);
        throw new Error(data.error || 'Failed to save campaign');
      }

      console.log('Success response:', data);
      
      if (isDraft) {
        toast.success('Draft saved successfully');
      } else {
        router.push(`/campaigns/wizard/step-2?id=${data.id}`);
      }

    } catch (error) {
      console.error('Submission error:', error);
      toast.error(error.message || 'Failed to save campaign');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 pb-20">
      <Header currentStep={1} totalSteps={5} />
      <h1 className="text-2xl font-bold mb-4">Step 1: Campaign Details</h1>
      
      <Formik
        initialValues={initialValues}
        validationSchema={OverviewSchema}
        onSubmit={handleSubmit}
      >
        {({ values, submitForm }) => (
          <>
            <div className="flex justify-end mb-4">
              <button 
                type="button" 
                onClick={() => {
                  console.log('Save Draft clicked');
                  console.log('Form values:', values);
                  handleSubmit(values, true);
                }}
                className="px-4 py-2 border border-gray-400 rounded hover:bg-gray-100"
                disabled={isSubmitting}
              >
                Save as Draft
              </button>
            </div>

            <Form className="space-y-8">
              {/* Campaign Name */}
              <div>
                <label htmlFor="name" className="block font-semibold">
                  Campaign Name
                </label>
                <div className="flex items-center">
                  <Field
                    id="name"
                    name="name"
                    placeholder="Campaign Name"
                    className="w-full p-2 border rounded"
                  />
                  <button type="button" className="ml-2 px-2 py-1 border rounded text-sm">
                    Edit
                  </button>
                </div>
                <ErrorMessage name="name" component="div" className="text-red-600 text-sm" />
              </div>
              {/* Business Goal */}
              <div>
                <label htmlFor="businessGoal" className="block font-semibold">
                  What business goal does this campaign support?
                </label>
                <div className="flex items-center">
                  <Field
                    as="textarea"
                    id="businessGoal"
                    name="businessGoal"
                    placeholder="e.g. Increase market share by 5% in the next quarter. Launch a new product line targeting millennials."
                    className="w-full p-2 border rounded"
                    maxLength={3000}
                  />
                  <button type="button" className="ml-2 px-2 py-1 border rounded text-sm">
                    Edit
                  </button>
                </div>
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
                <h2 className="text-xl font-bold mb-2">Influencers Section</h2>
                {/* Added the missing "contacts" field */}
                <div>
                  <label htmlFor="contacts" className="block font-semibold">
                    Contacts
                  </label>
                  <Field
                    id="contacts"
                    name="contacts"
                    placeholder="Enter contacts"
                    className="w-full p-2 border rounded"
                  />
                  <ErrorMessage name="contacts" component="div" className="text-red-600 text-sm" />
                </div>
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
                        placeholder="Ed"
                        className="w-full p-2 border rounded"
                      />
                      <ErrorMessage name="primaryContact.firstName" component="div" className="text-red-600 text-sm" />
                    </div>
                    <div className="mb-2">
                      <label htmlFor="primaryContact.surname" className="block text-sm font-medium">
                        Surname
                      </label>
                      <Field
                        id="primaryContact.surname"
                        name="primaryContact.surname"
                        placeholder="Addams"
                        className="w-full p-2 border rounded"
                      />
                      <ErrorMessage name="primaryContact.surname" component="div" className="text-red-600 text-sm" />
                    </div>
                    <div className="mb-2">
                      <label htmlFor="primaryContact.email" className="block text-sm font-medium">
                        Email
                      </label>
                      <Field
                        id="primaryContact.email"
                        name="primaryContact.email"
                        type="email"
                        placeholder="edaddams@domain.com"
                        className="w-full p-2 border rounded"
                      />
                      <ErrorMessage name="primaryContact.email" component="div" className="text-red-600 text-sm" />
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
                        placeholder="Ed"
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
                        placeholder="Addams"
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
                        placeholder="edaddams@domain.com"
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
                <h2 className="text-xl font-bold mb-2">Budget Section</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="currency" className="block font-semibold">
                      Currency
                    </label>
                    <Field as="select" id="currency" name="currency" className="w-full p-2 border rounded">
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
                    <div className="flex items-center">
                      <Field id="totalBudget" name="totalBudget" type="number" className="w-full p-2 border rounded" />
                      <button type="button" className="ml-2 px-2 py-1 border rounded text-sm">
                        Edit
                      </button>
                    </div>
                    <ErrorMessage name="totalBudget" component="div" className="text-red-600 text-sm" />
                  </div>
                  <div>
                    <label htmlFor="socialMediaBudget" className="block font-semibold">
                      Budget allocated to social media
                    </label>
                    <div className="flex items-center">
                      <Field id="socialMediaBudget" name="socialMediaBudget" type="number" className="w-full p-2 border rounded" />
                      <button type="button" className="ml-2 px-2 py-1 border rounded text-sm">
                        Edit
                      </button>
                    </div>
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
              onBack={() => router.push("/campaigns/wizard")}
              onNext={submitForm}
              disableNext={isSubmitting}
            />
          </>
        )}
      </Formik>
    </div>
  );
}