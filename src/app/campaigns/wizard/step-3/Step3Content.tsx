"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { useWizard } from "@/context/WizardContext";
import ProgressBar from "@/components/Wizard/ProgressBar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { toast } from "react-hot-toast";
import { Icon } from "@/components/ui/icon";

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
  jobTitles: string[];
  incomeLevel: number;
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
    age65plus: Yup.number().min(0).required()
  }).test("sum", "Total allocation must be exactly 100%", (values: AgeDistribution | undefined) => {
    if (!values) return false;
    const total = values.age1824 + values.age2534 + values.age3544 + values.age4554 + values.age5564 + values.age65plus;
    return total === 100;
  }),
  gender: Yup.array().of(Yup.string()).min(1, "Select at least one gender"),
  otherGender: Yup.string().when("gender", (gender: string[], schema) => gender.includes("Other") ? schema.required("Please specify other gender") : schema),
  screeningQuestions: Yup.array().of(Yup.string()),
  languages: Yup.array().of(Yup.string()),
  educationLevel: Yup.string(),
  jobTitles: Yup.array().of(Yup.string()),
  incomeLevel: Yup.number(),
  competitors: Yup.array().of(Yup.string())
});

// =============================================================================
// MAIN COMPONENT: AUDIENCE & COMPETITORS (STEP 3)
// =============================================================================

function FormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const campaignId = searchParams.get('id');
  const {
    data,
    loading,
    campaignData
  } = useWizard();
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  console.log('Step3Content: Full campaign data:', data);
  console.log('Step3Content: Raw campaignData:', campaignData);
  console.log('Step3Content: data.demographics:', (data as Record<string, unknown>)?.demographics);
  console.log('Step3Content: data.audience:', (data as Record<string, unknown>)?.audience);
  console.log('Step3Content: data.locations:', (data as Record<string, unknown>)?.locations);
  console.log('Step3Content: data.targeting:', (data as Record<string, unknown>)?.targeting);
  console.log('Step3Content: data.competitors:', (data as Record<string, unknown>)?.competitors);
  console.log('Step3Content: campaignData.audience:', campaignData?.audience);

  // First look for data in the normalized audience structure from the API response formatter
  const audienceData = (campaignData?.audience || {}) as Partial<AudienceValues>;

  // Then fall back to extracting from other data fields if needed
  const demographics = (campaignData as Record<string, unknown>)?.demographics || {};
  const locations = Array.isArray((campaignData as Record<string, unknown>)?.locations) ? (campaignData as Record<string, unknown>)?.locations : [];
  const targeting = (campaignData as Record<string, unknown>)?.targeting || {};
  const competitors = Array.isArray((campaignData as Record<string, unknown>)?.competitors) ? (campaignData as Record<string, unknown>)?.competitors : [];
  console.log('Step3Content: Audience data from API formatter:', audienceData);
  console.log('Step3Content: Extracted demographics:', demographics);
  console.log('Step3Content: Extracted locations:', locations);
  console.log('Step3Content: Extracted targeting:', targeting);
  console.log('Step3Content: Extracted competitors:', competitors);

  // Ensure audience arrays are properly handled
  const ensureStringArray = (value: unknown): string[] => {
    if (!value) return [];
    if (Array.isArray(value)) {
      return value.map(item => {
        if (typeof item === 'string') return item;
        if (item && typeof item === 'object') {
          // Try to extract common field names
          const typedItem = item as Record<string, unknown>;
          if (typeof typedItem.location === 'string') return typedItem.location;
          if (typeof typedItem.question === 'string') return typedItem.question;
          if (typeof typedItem.language === 'string') return typedItem.language;
          if (typeof typedItem.name === 'string') return typedItem.name;
          if (typeof typedItem.competitor === 'string') return typedItem.competitor;
        }
        return String(item);
      }).filter(Boolean);
    }
    return typeof value === 'string' ? [value] : [];
  };

  // Extract array fields with guaranteed string array result
  const locationArray = ensureStringArray(audienceData.location || locations);
  const screeningQuestionsArray = ensureStringArray(audienceData.screeningQuestions || targeting.screeningQuestions);
  const languagesArray = ensureStringArray(audienceData.languages || targeting.languages);
  const jobTitlesArray = ensureStringArray(audienceData.jobTitles || demographics.jobTitles);
  const competitorsArray = ensureStringArray(audienceData.competitors || competitors);
  console.log('Step3Content: Extracted location array:', locationArray);
  console.log('Step3Content: Extracted screening questions array:', screeningQuestionsArray);
  console.log('Step3Content: Extracted languages array:', languagesArray);
  console.log('Step3Content: Extracted job titles array:', jobTitlesArray);
  console.log('Step3Content: Extracted competitors array:', competitorsArray);
  const initialValues: AudienceValues = {
    // Prefer the normalized audience data first, then fall back to separate fields
    location: locationArray,
    ageDistribution: audienceData.ageDistribution || {
      age1824: demographics.ageDistribution?.age1824 ?? 20,
      age2534: demographics.ageDistribution?.age2534 ?? 25,
      age3544: demographics.ageDistribution?.age3544 ?? 20,
      age4554: demographics.ageDistribution?.age4554 ?? 15,
      age5564: demographics.ageDistribution?.age5564 ?? 10,
      age65plus: demographics.ageDistribution?.age65plus ?? 10
    },
    gender: ensureStringArray(audienceData.gender || demographics.gender),
    otherGender: audienceData.otherGender || demographics.otherGender || "",
    screeningQuestions: screeningQuestionsArray,
    languages: languagesArray,
    educationLevel: audienceData.educationLevel || demographics.educationLevel || "",
    jobTitles: jobTitlesArray,
    incomeLevel: audienceData.incomeLevel ?? demographics.incomeLevel ?? 20000,
    competitors: competitorsArray
  };
  console.log('Step3Content: Initialized form values:', initialValues);
  const handleSubmit = async (values: AudienceValues) => {
    try {
      setIsSaving(true);
      setError(null);
      if (!campaignId) {
        throw new Error('Campaign ID is required');
      }
      console.log('Submitting audience data:', JSON.stringify(values, null, 2));
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          audience: values
        })
      });
      const result = await response.json();
      if (!response.ok) {
        console.error('Error response from API:', result);
        throw new Error(result.error || 'Failed to update campaign');
      }
      console.log('API response:', result);
      toast.success('Campaign updated successfully');
      router.push(`/campaigns/wizard/step-4?id=${campaignId}`);
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      const message = error instanceof Error ? error.message : 'Failed to update campaign';
      setError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };
  const handleSaveDraft = async (values: AudienceValues) => {
    try {
      if (!campaignId) {
        console.error('No campaign ID available');
        toast.error('Cannot save draft: No campaign ID found');
        return;
      }
      console.log('Saving draft with data:', JSON.stringify(values, null, 2));
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          audience: values,
          submissionStatus: 'draft'
        })
      });
      const result = await response.json();
      if (!response.ok) {
        console.error('Error response from API:', result);
        toast.error(result.error || 'Failed to save draft');
        return;
      }
      console.log('Draft save API response:', result);
      toast.success('Draft saved successfully');
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error('Failed to save draft: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
        <p className="ml-2">Loading campaign data...</p>
      </div>;
  }
  if (error) {
    return <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <h3 className="text-red-800 font-semibold">Error</h3>
        <p className="text-red-600">{error}</p>
        <button onClick={() => router.push('/campaigns')} className="mt-4 btn btn-secondary">

          Return to Campaigns
        </button>
      </div>;
  }
  return <div className="w-full max-w-5xl mx-auto px-6 py-8 bg-white">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Campaign Creation</h1>
        <p className="text-gray-500">Complete all required fields to create your campaign</p>
      </div>
      
      <Formik initialValues={initialValues} validationSchema={AudienceSchema} onSubmit={handleSubmit} enableReinitialize={true}>

        {({
        values,
        setFieldValue,
        submitForm,
        isValid,
        dirty
      }) => {
        return <>
              <Form className="space-y-6">
                {/* Demographics Section */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Icon name="faUserGroup" className="w-5 h-5 mr-2 text-blue-500" solid={false} />
                    Demographics
                  </h2>
                  
                  {/* Location Selector */}
                  <div className="mb-6">
                    <div className="mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Location
                      </label>
                    </div>
                    
                    <div className="relative">
                      <div className="flex flex-col">
                        <div className="relative">
                          <input type="text" id="locationInput" placeholder="Enter city, state, region or country" className="w-full p-2.5 pl-10 pr-10 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const input = e.target as HTMLInputElement;
                          if (input && input.value.trim()) {
                            const newLocations = [...values.location, input.value.trim()];
                            setFieldValue('location', newLocations);
                            input.value = '';
                          }
                        }
                      }} />

                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Icon name="faMap" className="h-5 w-5 text-gray-400" solid={false} />
                          </div>

                          <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => {
                        const input = document.getElementById('locationInput') as HTMLInputElement;
                        if (input && input.value.trim()) {
                          const newLocations = [...values.location, input.value.trim()];
                          setFieldValue('location', newLocations);
                          input.value = '';
                        }
                      }}>

                            <div className="bg-blue-500 rounded-full p-1">
                              <Icon name="faPlus" className="h-3 w-3 text-white" solid={false} />
                            </div>
                          </button>
                        </div>

                        {Array.isArray(values.location) && values.location.length > 0 && <div className="mt-3 flex flex-wrap gap-2">
                            {values.location.map((loc, index) => <span key={index} className="inline-flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white">

                                <span>{loc}</span>
                                <button 
                                  type="button" 
                                  className="ml-2 group text-gray-400 hover:text-red-500" 
                                  onClick={() => {
                                    const newLocations = [...values.location];
                                    newLocations.splice(index, 1);
                                    setFieldValue('location', newLocations);
                                  }}
                                >
                                  <Icon name="faTrashCan" className="w-4 h-4 group-hover:hidden" solid={false} />
                                  <Icon name="faTrashCan" className="w-4 h-4 hidden group-hover:block" solid={true} />
                                </button>
                              </span>)}
                          </div>}
                      </div>
                    </div>
                  </div>
                  
                  {/* Age Distribution */}
                  <div className="mb-6">
                    <div className="border-t border-gray-200 pt-6 mt-6"></div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Age Distribution
                      </label>
                      <div className="text-xs text-gray-500">
                        Allocate percentages to each age range (Total must equal 100%)
                      </div>
                    </div>
                    
                    {/* Age Distribution Sliders */}
                    <div className="space-y-4 mb-4">
                      {[{
                    key: 'age1824',
                    label: '18-24'
                  }, {
                    key: 'age2534',
                    label: '25-34'
                  }, {
                    key: 'age3544',
                    label: '35-44'
                  }, {
                    key: 'age4554',
                    label: '45-54'
                  }, {
                    key: 'age5564',
                    label: '55-64'
                  }, {
                    key: 'age65plus',
                    label: '65+'
                  }].map(age => <div key={age.key} className="flex items-center">
                          <span className="w-12 text-sm font-medium">{age.label}</span>
                          <div className="flex-grow mx-4">
                            <Slider value={values.ageDistribution[age.key as keyof AgeDistribution]} onChange={value => {
                        const newValue = typeof value === 'number' ? value : value[0];

                        // Adjust other values proportionally to maintain 100% total
                        const oldValue = values.ageDistribution[age.key as keyof AgeDistribution];
                        const diff = newValue - oldValue;
                        const otherKeys = Object.keys(values.ageDistribution).filter(k => k !== age.key);
                        const newDistribution = {
                          ...values.ageDistribution
                        };
                        newDistribution[age.key as keyof AgeDistribution] = newValue;
                        const totalOthers = otherKeys.reduce((sum, k) => sum + values.ageDistribution[k as keyof AgeDistribution], 0);
                        if (totalOthers > 0 && diff !== 0) {
                          otherKeys.forEach(k => {
                            const oldOtherValue = values.ageDistribution[k as keyof AgeDistribution];
                            const ratio = oldOtherValue / totalOthers;
                            newDistribution[k as keyof AgeDistribution] = Math.max(0, oldOtherValue - diff * ratio);
                          });
                        }

                        // Round values
                        Object.keys(newDistribution).forEach(k => {
                          newDistribution[k as keyof AgeDistribution] = Math.round(newDistribution[k as keyof AgeDistribution]);
                        });

                        // Ensure total is 100%
                        const total = Object.values(newDistribution).reduce((sum, val) => sum + val, 0);
                        if (total !== 100) {
                          const diff = 100 - total;
                          // Add/subtract from the largest value that&apos;s not the current one
                          const largestKey = otherKeys.reduce((max, k) => newDistribution[k as keyof AgeDistribution] > newDistribution[max as keyof AgeDistribution] ? k : max, otherKeys[0]);
                          newDistribution[largestKey as keyof AgeDistribution] += diff;
                        }
                        setFieldValue('ageDistribution', newDistribution);
                      }} min={0} max={100} step={1} trackStyle={{
                        backgroundColor: '#0EA5E9',
                        height: 6
                      }} railStyle={{
                        backgroundColor: '#E5E7EB',
                        height: 6
                      }} handleStyle={{
                        borderColor: '#0EA5E9',
                        backgroundColor: '#0EA5E9',
                        opacity: 1,
                        height: 16,
                        width: 16,
                        marginTop: -5
                      }} className="mt-1" />

                          </div>
                          <span className="w-12 text-right text-sm font-medium">
                            {values.ageDistribution[age.key as keyof AgeDistribution]}%
                          </span>
                        </div>)}
                    </div>
                    
                    {/* Age Distribution Summary */}
                    <div className="mt-6">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Age Distribution Summary</h3>
                      <div className="flex items-center w-full h-6">
                        {Object.entries(values.ageDistribution).map(([key, value], index) => <div key={key} className="h-full" style={{
                      width: `${value}%`,
                      backgroundColor: '#0EA5E9',
                      opacity: 0.7 + index * 0.05,
                      borderRadius: index === 0 ? '4px 0 0 4px' : index === 5 ? '0 4px 4px 0' : '0'
                    }} />)}
                      </div>
                      <div className="flex justify-between mt-1 text-xs text-gray-500">
                        <span>18-24</span>
                        <span>25-34</span>
                        <span>35-44</span>
                        <span>45-54</span>
                        <span>55-64</span>
                        <span>65+</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Gender Selection */}
                  <div className="mb-6">
                    <div className="border-t border-gray-200 pt-6 mt-6"></div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender Selection
                    </label>
                    <div className="text-xs text-gray-500 mb-3">
                      Choose one or more gender identities
                    </div>
                    <div className="flex space-x-4">
                      <label className="inline-flex items-center">
                        <Field type="checkbox" name="gender" value="Male" className="h-4 w-4 text-blue-600 border-gray-300 rounded" />

                        <span className="ml-2 text-sm text-gray-700">Male</span>
                      </label>
                      <label className="inline-flex items-center">
                        <Field type="checkbox" name="gender" value="Female" className="h-4 w-4 text-blue-600 border-gray-300 rounded" />

                        <span className="ml-2 text-sm text-gray-700">Female</span>
                      </label>
                      <label className="inline-flex items-center">
                        <Field type="checkbox" name="gender" value="Other" className="h-4 w-4 text-blue-600 border-gray-300 rounded" />

                        <span className="ml-2 text-sm text-gray-700">Other</span>
                      </label>
                    </div>
                    {values.gender.includes("Other") && <div className="mt-2">
                        <Field type="text" name="otherGender" placeholder="Please specify" className="mt-1 p-2 block w-full border border-gray-300 rounded-md" />

                      </div>}
                <ErrorMessage name="gender" component="div" className="mt-1 text-sm text-red-600" />

                  </div>
                </div>
                
                {/* Screening Questions */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Icon name="faCircleQuestion" className="w-5 h-5 mr-2 text-blue-500" solid={false} />
                    Screening Questions
                  </h2>
                  
                  <div className="relative mb-4">
                    <div className="flex items-center">
                      <Icon name="faSearch" className="h-5 w-5 text-gray-400 absolute left-3" solid={false} />
                      <input type="text" id="screeningQueryInput" placeholder="Search Screening Questions" className="w-full p-2.5 pl-10 pr-10 border border-gray-300 rounded-md" onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const input = e.target as HTMLInputElement;
                      if (input && input.value.trim()) {
                        const newQuestions = [...values.screeningQuestions, input.value.trim()];
                        setFieldValue('screeningQuestions', newQuestions);
                        input.value = '';
                      }
                    }
                  }} />

                      <button type="button" className="absolute right-2 flex items-center" onClick={() => {
                    const input = document.getElementById('screeningQueryInput') as HTMLInputElement;
                    if (input && input.value.trim()) {
                      const newQuestions = [...values.screeningQuestions, input.value.trim()];
                      setFieldValue('screeningQuestions', newQuestions);
                      input.value = '';
                    }
                  }}>

                        <div className="bg-blue-500 rounded-full p-1">
                          <Icon name="faPlus" className="h-3 w-3 text-white" solid={false} />
                        </div>
                      </button>
                    </div>
              </div>

                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Suggested Questions</h3>
                    <div className="flex flex-wrap gap-2">
                      {["Have you purchased from this brand before?", "How often do you use social media?", "Are you a decision maker for purchases in your household?"].map(question => <button key={question} type="button" className={`
                            text-sm px-3 py-1.5 rounded-md 
                            ${values.screeningQuestions.includes(question) ? 'bg-blue-100 text-blue-800 border border-blue-300' : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'}
                          `} onClick={() => {
                    const newQuestions = values.screeningQuestions.includes(question) ? values.screeningQuestions.filter(q => q !== question) : [...values.screeningQuestions, question];
                    setFieldValue('screeningQuestions', newQuestions);
                  }}>

                          {question}
                        </button>)}
                    </div>
                  </div>
                  
                  {Array.isArray(values.screeningQuestions) && values.screeningQuestions.length > 0 && <div className="space-y-2">
                      {values.screeningQuestions.map((question, index) => <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white">
                          <span>{question}</span>
                          <button 
                            type="button" 
                            className="group text-gray-400 hover:text-red-500" 
                            onClick={() => {
                              const newQuestions = [...values.screeningQuestions];
                              newQuestions.splice(index, 1);
                              setFieldValue('screeningQuestions', newQuestions);
                            }}
                          >
                            <Icon name="faTrashCan" className="w-4 h-4 group-hover:hidden" solid={false} />
                            <Icon name="faTrashCan" className="w-4 h-4 hidden group-hover:block" solid={true} />
                          </button>
                        </div>)}
                    </div>}
                </div>
                
                {/* Languages */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Icon name="faGlobe" className="w-5 h-5 mr-2 text-blue-500" solid={false} />
                    Languages
                  </h2>
                  
                  <div className="relative">
                    <div className="mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Select language
                      </label>
                    </div>
                    
                    <div className="relative">
                      <div className="mb-4">
                        {['English', 'Spanish', 'French', 'German', 'Chinese'].map(language => <div key={language} className="flex items-center mt-2">
                            <Field type="checkbox" name="languages" value={language} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />

                            <label className="ml-2 block text-sm text-gray-700">
                              {language}
                            </label>
                          </div>)}
                      </div>
              </div>

                    {Array.isArray(values.languages) && values.languages.length > 0 && <div className="mt-3">
                        <div className="flex flex-wrap gap-2">
                          {values.languages.map(lang => <span key={lang} className="inline-flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white">
                              <span>{lang}</span>
                              <button 
                                type="button" 
                                className="ml-2 group text-gray-400 hover:text-red-500" 
                                onClick={() => {
                                  const newLanguages = values.languages.filter(l => l !== lang);
                                  setFieldValue('languages', newLanguages);
                                }}
                              >
                                <Icon name="faTrashCan" className="w-4 h-4 group-hover:hidden" solid={false} />
                                <Icon name="faTrashCan" className="w-4 h-4 hidden group-hover:block" solid={true} />
                              </button>
                            </span>)}
                        </div>
                      </div>}
                  </div>
                </div>
                
                {/* Advanced Targeting */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex justify-between items-center cursor-pointer" onClick={() => setShowAdvanced(!showAdvanced)}>

                    <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Icon name="faFilter" className="w-5 h-5 mr-2 text-blue-500" solid={false} />
                      Advanced Targeting
                    </h2>
                    <div className="text-blue-500 hover:text-blue-700">
                      <Icon name="faChevronRight" className={`h-5 w-5 transform ${showAdvanced ? 'rotate-90' : ''} transition-transform`} solid={false} />
                    </div>
                  </div>
                  
                  {showAdvanced && <div className="mt-4 space-y-6">
                      {/* Education Level */}
              <div>
                        <div className="mb-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Education Level
                          </label>
                        </div>
                        
                        <div className="relative">
                          <Field as="select" name="educationLevel" className="block w-full px-3 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md appearance-none">

                            <option value="">Select Education</option>
                            <option value="high_school">High School</option>
                            <option value="some_college">Some College</option>
                            <option value="associates">Associate&apos;s Degree</option>
                            <option value="bachelors">Bachelor&apos;s Degree</option>
                            <option value="masters">Master&apos;s Degree</option>
                            <option value="doctorate">Doctorate</option>
                            <option value="professional">Professional Degree</option>
                          </Field>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      
                      {/* Job Titles */}
                      <div>
                        <div className="mb-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Job Titles
                          </label>
                        </div>
                        
                        <div className="relative mb-6">
                          <div className="flex items-center">
                            <Icon name="faSearch" className="h-5 w-5 text-gray-400 absolute left-3" solid={false} />
                            <input type="text" id="jobTitleInput" placeholder="Enter job titles (press Enter to add)" className="w-full p-2.5 pl-10 pr-10 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const input = e.target as HTMLInputElement;
                          if (input && input.value.trim()) {
                            const newJobTitles = [...values.jobTitles, input.value.trim()];
                            setFieldValue('jobTitles', newJobTitles);
                            input.value = '';
                          }
                        }
                      }} />

                            <button type="button" className="absolute right-2 flex items-center" onClick={() => {
                        const input = document.getElementById('jobTitleInput') as HTMLInputElement;
                        if (input && input.value.trim()) {
                          const newJobTitles = [...values.jobTitles, input.value.trim()];
                          setFieldValue('jobTitles', newJobTitles);
                          input.value = '';
                        }
                      }}>

                              <div className="bg-blue-500 rounded-full p-1">
                                <Icon name="faPlus" className="h-3 w-3 text-white" solid={false} />
                              </div>
                            </button>
                          </div>
                          <div className="mt-2 text-xs text-gray-500">
                            <p>Examples: Marketing Manager, Software Engineer, Financial Analyst</p>
              </div>

                          {Array.isArray(values.jobTitles) && values.jobTitles.length > 0 && <div className="mt-3 flex flex-wrap gap-2">
                              {values.jobTitles.map((title, index) => <span key={index} className="inline-flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white">

                                  <span>{title}</span>
                <button 
                  type="button" 
                  className="ml-2 group text-gray-400 hover:text-red-500" 
                  onClick={() => {
                    const newJobTitles = [...values.jobTitles];
                    newJobTitles.splice(index, 1);
                    setFieldValue('jobTitles', newJobTitles);
                  }}
                >
                  <Icon name="faTrashCan" className="w-4 h-4 group-hover:hidden" solid={false} />
                  <Icon name="faTrashCan" className="w-4 h-4 hidden group-hover:block" solid={true} />
                </button>
                                </span>)}
                            </div>}
                        </div>
              </div>

                      {/* Income Level */}
              <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Income Level
                          </label>
                          <div className="group relative">
                            <Icon name="faCircleInfo" className="h-5 w-5 text-gray-400 cursor-help" solid={false} />
                            <div className="absolute right-0 bottom-6 w-64 bg-white shadow-lg rounded-md p-2 text-xs text-gray-700 hidden group-hover:block border border-gray-200">
                              Set the minimum income level for your target audience. This helps narrow down your demographic to users with specific purchasing power.
                            </div>
                          </div>
                        </div>
                        
                        <div className="w-full px-0">
                          <div className="flex flex-col w-full">
                            <div className="relative w-full max-w-full pt-4 pb-6">
                              <Slider value={values.incomeLevel} onChange={value => {
                          const newValue = typeof value === 'number' ? value : value[0];
                          setFieldValue('incomeLevel', newValue);
                        }} min={0} max={100000} step={10000} marks={{
                          0: '',
                          20000: '',
                          50000: '',
                          100000: ''
                        }} trackStyle={{
                          backgroundColor: '#3B82F6',
                          height: 4
                        }} railStyle={{
                          backgroundColor: '#E5E7EB',
                          height: 4
                        }} handleStyle={{
                          borderColor: '#3B82F6',
                          backgroundColor: '#3B82F6',
                          opacity: 1,
                          height: 16,
                          width: 16,
                          marginTop: -6,
                          boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.2)'
                        }} dotStyle={{
                          borderColor: '#E5E7EB',
                          backgroundColor: '#E5E7EB',
                          height: 8,
                          width: 8,
                          marginBottom: 0
                        }} activeDotStyle={{
                          borderColor: '#3B82F6',
                          backgroundColor: '#3B82F6'
                        }} className="w-full" />

                              <div className="absolute inset-x-0 bottom-0 flex justify-between text-xs text-gray-600 px-1">
                                <span>$0</span>
                                <span>$20k</span>
                                <span>$50k</span>
                                <span>$100k+</span>
              </div>
                            </div>
                            <div className="mt-2 text-right font-medium text-sm text-gray-700">
                              {values.incomeLevel >= 100000 ? `$${values.incomeLevel.toLocaleString()}+` : `$${values.incomeLevel.toLocaleString()}`}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>}
                </div>
                
                {/* Competitors */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                    <Icon name="faBuilding" className="w-5 h-5 mr-2 text-blue-500" solid={false} />
                    Competitors to Monitor
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Enter the names of key competitors you&apos;re tracking. These will help identify trends, opportunities, and gaps in your market.
                  </p>
                  
                  {/* Competitor Input */}
                  <div className="mb-6">
                    <div className="relative">
                      <input type="text" id="competitorInput" placeholder="Enter competitor name" className="w-full p-2.5 pl-10 pr-10 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const input = e.target as HTMLInputElement;
                      if (input && input.value.trim()) {
                        const newCompetitors = [...values.competitors, input.value.trim()];
                        setFieldValue('competitors', newCompetitors);
                        input.value = '';
                      }
                    }
                  }} />

                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Icon name="faSearch" className="h-5 w-5 text-gray-400" solid={false} />
                      </div>
                      <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => {
                    const input = document.getElementById('competitorInput') as HTMLInputElement;
                    if (input && input.value.trim()) {
                      const newCompetitors = [...values.competitors, input.value.trim()];
                      setFieldValue('competitors', newCompetitors);
                      input.value = '';
                    }
                  }}>

                        <div className="bg-blue-500 rounded-full p-1">
                          <Icon name="faPlus" className="h-3 w-3 text-white" solid={false} />
                        </div>
                      </button>
                    </div>
                    
                    {Array.isArray(values.competitors) && values.competitors.length > 0 && <div className="mt-3 flex flex-wrap gap-2">
                        {values.competitors.map((competitor, index) => <span key={index} className="inline-flex items-center justify-between px-3 py-2 border border-gray-200 rounded-lg bg-white">

                            <span>{competitor}</span>
                            <button 
                              type="button" 
                              className="ml-2 group text-gray-400 hover:text-red-500" 
                              onClick={() => {
                                const updatedCompetitors = [...values.competitors];
                                updatedCompetitors.splice(index, 1);
                                setFieldValue('competitors', updatedCompetitors);
                              }}
                            >
                              <Icon name="faTrashCan" className="w-4 h-4 group-hover:hidden" solid={false} />
                              <Icon name="faTrashCan" className="w-4 h-4 hidden group-hover:block" solid={true} />
                            </button>
                          </span>)}
                      </div>}
                  </div>
                </div>
              </Form>

              <ProgressBar currentStep={3} onStepClick={step => router.push(`/campaigns/wizard/step-${step}?id=${campaignId}`)} onBack={() => router.push(`/campaigns/wizard/step-2?id=${campaignId}`)} onNext={submitForm} onSaveDraft={() => handleSaveDraft(values)} disableNext={!isValid || isSaving} isFormValid={isValid} isDirty={dirty} isSaving={isSaving} />


              {/* Add substantial bottom padding to prevent progress bar overlap */}
              <div className="pb-16"></div>
            </>;
      }}
      </Formik>
    </div>;
}
export default function Step3Content() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) {
    return <LoadingSpinner />;
  }
  return <Suspense fallback={<LoadingSpinner />}>
      <FormContent />
    </Suspense>;
}