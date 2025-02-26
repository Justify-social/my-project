"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { useWizard } from "@/context/WizardContext";
import Header from "@/components/Wizard/Header";
import ProgressBar from "@/components/Wizard/ProgressBar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { toast } from "react-hot-toast";
import { 
  MagnifyingGlassIcon, 
  PlusIcon, 
  XMarkIcon, 
  ChevronRightIcon,
  PencilSquareIcon,
  InformationCircleIcon
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
  jobTitles: Yup.array().of(Yup.string()),
  incomeLevel: Yup.number(),
  competitors: Yup.array().of(Yup.string()),
});

// =============================================================================
// MAIN COMPONENT: AUDIENCE & COMPETITORS (STEP 3)
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
      age1824: audienceData.ageDistribution?.age1824 ?? 20,
      age2534: audienceData.ageDistribution?.age2534 ?? 25,
      age3544: audienceData.ageDistribution?.age3544 ?? 20,
      age4554: audienceData.ageDistribution?.age4554 ?? 15,
      age5564: audienceData.ageDistribution?.age5564 ?? 10,
      age65plus: audienceData.ageDistribution?.age65plus ?? 10,
    },
    gender: audienceData.gender || [],
    otherGender: audienceData.otherGender || "",
    screeningQuestions: audienceData.screeningQuestions || [],
    languages: audienceData.languages || [],
    educationLevel: audienceData.educationLevel || "",
    jobTitles: audienceData.jobTitles || [],
    incomeLevel: audienceData.incomeLevel ?? 20000,
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
    <div className="w-full max-w-6xl mx-auto px-6 py-8 bg-white">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Campaign Creation</h1>
        <p className="text-gray-500">Complete all required fields to create your campaign</p>
      </div>
      
      <Formik
        initialValues={initialValues}
        validationSchema={AudienceSchema}
        onSubmit={handleSubmit}
        enableReinitialize={true}
      >
        {({ values, setFieldValue, submitForm, isValid, dirty, errors }) => {
          return (
            <>
              <Form className="space-y-6">
                {/* Demographics Section */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Demographics</h2>
                  
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
                          <input
                            type="text" 
                            id="locationInput"
                            placeholder="Enter city, state, region or country"
                            className="w-full p-2.5 pl-10 pr-10 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const input = e.target as HTMLInputElement;
                                if (input && input.value.trim()) {
                                  const newLocations = [...values.location, input.value.trim()];
                                  setFieldValue('location', newLocations);
                                  input.value = '';
                                }
                              }
                            }}
                          />
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                          </div>
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => {
                              const input = document.getElementById('locationInput') as HTMLInputElement;
                              if (input && input.value.trim()) {
                                const newLocations = [...values.location, input.value.trim()];
                                setFieldValue('location', newLocations);
                                input.value = '';
                              }
                            }}
                          >
                            <PlusIcon className="h-5 w-5 text-blue-500" />
                          </button>
                        </div>
                        
                        {values.location.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {values.location.map((loc, index) => (
                              <span 
                                key={index}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {loc}
                                <button
                                  type="button"
                                  className="ml-1 h-4 w-4 rounded-full text-blue-400 hover:text-blue-600 focus:outline-none"
                                  onClick={() => {
                                    const newLocations = [...values.location];
                                    newLocations.splice(index, 1);
                                    setFieldValue('location', newLocations);
                                  }}
                                >
                                  <XMarkIcon className="h-3 w-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Age Distribution */}
                  <div className="mb-6">
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
                      {[
                        { key: 'age1824', label: '18-24' },
                        { key: 'age2534', label: '25-34' },
                        { key: 'age3544', label: '35-44' },
                        { key: 'age4554', label: '45-54' },
                        { key: 'age5564', label: '55-64' },
                        { key: 'age65plus', label: '65+' },
                      ].map((age) => (
                        <div key={age.key} className="flex items-center">
                          <span className="w-12 text-sm font-medium">{age.label}</span>
                          <div className="flex-grow mx-4">
                            <Slider
                              value={values.ageDistribution[age.key as keyof AgeDistribution]}
                              onChange={(value) => {
                                const newValue = typeof value === 'number' ? value : value[0];
                                
                                // Adjust other values proportionally to maintain 100% total
                                const oldValue = values.ageDistribution[age.key as keyof AgeDistribution];
                                const diff = newValue - oldValue;
                                const otherKeys = Object.keys(values.ageDistribution).filter(k => k !== age.key);
                                
                                const newDistribution = { ...values.ageDistribution };
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
                                  // Add/subtract from the largest value that's not the current one
                                  const largestKey = otherKeys.reduce((max, k) => 
                                    newDistribution[k as keyof AgeDistribution] > newDistribution[max as keyof AgeDistribution] ? k : max, 
                                    otherKeys[0]
                                  );
                                  newDistribution[largestKey as keyof AgeDistribution] += diff;
                                }
                                
                                setFieldValue('ageDistribution', newDistribution);
                              }}
                              min={0}
                              max={100}
                              step={1}
                              trackStyle={{ backgroundColor: '#0EA5E9', height: 6 }}
                              railStyle={{ backgroundColor: '#E5E7EB', height: 6 }}
                              handleStyle={{
                                borderColor: '#0EA5E9',
                                backgroundColor: '#0EA5E9',
                                opacity: 1,
                                height: 16,
                                width: 16,
                                marginTop: -5,
                              }}
                              className="mt-1"
                            />
                          </div>
                          <span className="w-12 text-right text-sm font-medium">
                            {values.ageDistribution[age.key as keyof AgeDistribution]}%
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    {/* Age Distribution Summary */}
                    <div className="mt-6">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Age Distribution Summary</h3>
                      <div className="flex items-center w-full h-6">
                        {Object.entries(values.ageDistribution).map(([key, value], index) => (
                          <div 
                            key={key}
                            className="h-full"
                            style={{ 
                              width: `${value}%`, 
                              backgroundColor: '#0EA5E9',
                              opacity: 0.7 + (index * 0.05),
                              borderRadius: index === 0 ? '4px 0 0 4px' : index === 5 ? '0 4px 4px 0' : '0'
                            }}
                          />
                        ))}
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender Selection
                    </label>
                    <div className="text-xs text-gray-500 mb-3">
                      Choose one or more gender identities
                    </div>
                    <div className="flex space-x-4">
                      <label className="inline-flex items-center">
                        <Field 
                          type="checkbox" 
                          name="gender" 
                          value="Male"
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Male</span>
                      </label>
                      <label className="inline-flex items-center">
                        <Field 
                          type="checkbox" 
                          name="gender" 
                          value="Female"
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Female</span>
                      </label>
                      <label className="inline-flex items-center">
                        <Field 
                          type="checkbox" 
                          name="gender" 
                          value="Other"
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Other</span>
                      </label>
                    </div>
                    {values.gender.includes("Other") && (
                      <div className="mt-2">
                        <Field 
                          type="text"
                          name="otherGender"
                          placeholder="Please specify"
                          className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                        />
                      </div>
                    )}
                    <ErrorMessage 
                      name="gender" 
                      component="div" 
                      className="mt-1 text-sm text-red-600" 
                    />
                  </div>
                </div>
                
                {/* Screening Questions */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Screening Questions</h2>
                  
                  <div className="relative mb-4">
                    <div className="flex items-center">
                      <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3" />
                      <input
                        type="text"
                        id="screeningQueryInput"
                        placeholder="Search Screening Questions"
                        className="w-full p-2.5 pl-10 pr-10 border border-gray-300 rounded-md"
                      />
                      <button
                        type="button"
                        className="absolute right-2 p-1 bg-blue-500 text-white rounded-full"
                        onClick={() => {
                          const input = document.getElementById('screeningQueryInput') as HTMLInputElement;
                          if (input && input.value.trim()) {
                            const newQuestions = [...values.screeningQuestions, input.value.trim()];
                            setFieldValue('screeningQuestions', newQuestions);
                            input.value = '';
                          }
                        }}
                      >
                        <PlusIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Suggested Questions</h3>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "Have you purchased from this brand before?", 
                        "How often do you use social media?", 
                        "Are you a decision maker for purchases in your household?"
                      ].map((question) => (
                        <button
                          key={question}
                          type="button"
                          className={`
                            text-sm px-3 py-1.5 rounded-md 
                            ${values.screeningQuestions.includes(question) 
                              ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                              : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'}
                          `}
                          onClick={() => {
                            const newQuestions = values.screeningQuestions.includes(question)
                              ? values.screeningQuestions.filter(q => q !== question)
                              : [...values.screeningQuestions, question];
                            setFieldValue('screeningQuestions', newQuestions);
                          }}
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {values.screeningQuestions.length > 0 && (
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Selected Questions</h3>
                      <div className="space-y-2">
                        {values.screeningQuestions.map((question, index) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-gray-50 border border-gray-200 rounded-md">
                            <span className="text-sm">{question}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const newQuestions = [...values.screeningQuestions];
                                newQuestions.splice(index, 1);
                                setFieldValue('screeningQuestions', newQuestions);
                              }}
                              className="text-gray-400 hover:text-gray-500"
                            >
                              <XMarkIcon className="h-5 w-5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Languages */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Languages</h2>
                  
                  <div className="relative">
                    <div className="mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Select language
                      </label>
                    </div>
                    
                    <div className="relative">
                      <div className="mb-4">
                        {['English', 'Spanish', 'French', 'German', 'Chinese'].map((language) => (
                          <div key={language} className="flex items-center mt-2">
                            <Field
                              type="checkbox"
                              name="languages"
                              value={language}
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label className="ml-2 block text-sm text-gray-700">
                              {language}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {values.languages.length > 0 && (
                      <div className="mt-3 p-2 bg-gray-50 rounded-md">
                        <div className="flex flex-wrap gap-2">
                          {values.languages.map((lang) => (
                            <span key={lang} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {lang}
                              <button
                                type="button"
                                className="ml-1 h-4 w-4 rounded-full text-blue-400 hover:text-blue-600 focus:outline-none"
                                onClick={() => {
                                  const newLanguages = values.languages.filter(l => l !== lang);
                                  setFieldValue('languages', newLanguages);
                                }}
                              >
                                <XMarkIcon className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Advanced Targeting */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">Advanced Targeting</h2>
                    <button
                      type="button"
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <ChevronRightIcon className={`h-5 w-5 transform ${showAdvanced ? 'rotate-90' : ''} transition-transform`} />
                    </button>
                  </div>
                  
                  {showAdvanced && (
                    <div className="mt-4 space-y-6">
                      {/* Education Level */}
                      <div>
                        <div className="mb-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Education Level
                          </label>
                        </div>
                        
                        <div className="relative">
                          <Field
                            as="select"
                            name="educationLevel"
                            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                          >
                            <option value="">Select Education</option>
                            <option value="high_school">High School</option>
                            <option value="some_college">Some College</option>
                            <option value="associates">Associate's Degree</option>
                            <option value="bachelors">Bachelor's Degree</option>
                            <option value="masters">Master's Degree</option>
                            <option value="doctorate">Doctorate</option>
                            <option value="professional">Professional Degree</option>
                          </Field>
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <ChevronRightIcon className="h-5 w-5 text-gray-400" />
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
                        
                        <div className="relative">
                          <div className="flex items-center">
                            <input
                              type="text"
                              id="jobTitleInput"
                              placeholder="Enter job titles (press Enter to add)"
                              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  const input = e.target as HTMLInputElement;
                                  if (input && input.value.trim()) {
                                    const newJobTitles = [...values.jobTitles, input.value.trim()];
                                    setFieldValue('jobTitles', newJobTitles);
                                    input.value = '';
                                  }
                                }
                              }}
                            />
                            <button
                              type="button"
                              className="absolute right-2 flex items-center justify-center h-6 w-6 text-blue-500"
                              onClick={() => {
                                const input = document.getElementById('jobTitleInput') as HTMLInputElement;
                                if (input && input.value.trim()) {
                                  const newJobTitles = [...values.jobTitles, input.value.trim()];
                                  setFieldValue('jobTitles', newJobTitles);
                                  input.value = '';
                                }
                              }}
                            >
                              <PlusIcon className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="mt-2 text-xs text-gray-500">
                            <p>Examples: Marketing Manager, Software Engineer, Financial Analyst</p>
                          </div>
                          
                          {values.jobTitles.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {values.jobTitles.map((title, index) => (
                                <span 
                                  key={index}
                                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                >
                                  {title}
                                  <button
                                    type="button"
                                    className="ml-1 h-4 w-4 rounded-full text-blue-400 hover:text-blue-600 focus:outline-none"
                                    onClick={() => {
                                      const newJobTitles = [...values.jobTitles];
                                      newJobTitles.splice(index, 1);
                                      setFieldValue('jobTitles', newJobTitles);
                                    }}
                                  >
                                    <XMarkIcon className="h-3 w-3" />
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Income Level */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Income Level
                          </label>
                          <div className="group relative">
                            <InformationCircleIcon className="h-5 w-5 text-gray-400 cursor-help" />
                            <div className="absolute right-0 bottom-6 w-64 bg-white shadow-lg rounded-md p-2 text-xs text-gray-700 hidden group-hover:block border border-gray-200">
                              Set the minimum income level for your target audience. This helps narrow down your demographic to users with specific purchasing power.
                            </div>
                          </div>
                        </div>
                        
                        <div className="pl-1">
                          <Slider
                            value={values.incomeLevel}
                            onChange={(value) => {
                              const newValue = typeof value === 'number' ? value : value[0];
                              setFieldValue('incomeLevel', newValue);
                            }}
                            min={0}
                            max={100000}
                            step={10000}
                            marks={{
                              0: '$0',
                              20000: '$20k',
                              50000: '$50k',
                              100000: '$100k+'
                            }}
                            trackStyle={{ backgroundColor: '#3B82F6', height: 4 }}
                            railStyle={{ backgroundColor: '#E5E7EB', height: 4 }}
                            handleStyle={{
                              borderColor: '#3B82F6',
                              backgroundColor: '#3B82F6',
                              opacity: 1,
                              height: 16,
                              width: 16,
                              marginTop: -6,
                              boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.2)',
                            }}
                            dotStyle={{
                              borderColor: '#E5E7EB',
                              backgroundColor: '#E5E7EB',
                              height: 8,
                              width: 8,
                              marginBottom: 0,
                            }}
                            activeDotStyle={{
                              borderColor: '#3B82F6',
                              backgroundColor: '#3B82F6',
                            }}
                            className="mt-2 mb-1"
                          />
                          <div className="mt-1 text-right font-medium text-sm text-gray-700">
                            {values.incomeLevel >= 100000 ? 
                              `$${values.incomeLevel.toLocaleString()}+` : 
                              `$${values.incomeLevel.toLocaleString()}`
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Competitors */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Competitors to Monitor</h2>
                  <p className="text-sm text-gray-500 mb-4">
                    Enter the names of key competitors you're tracking. These will help identify trends, opportunities, and gaps in your market.
                  </p>
                  
                  <div className="relative mb-6">
                    <div className="flex items-center">
                      <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3" />
                      <input
                        type="text"
                        id="competitorInput"
                        placeholder="Enter competitor name"
                        className="w-full p-2.5 pl-10 pr-10 border border-gray-300 rounded-md"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const input = document.getElementById('competitorInput') as HTMLInputElement;
                            if (input && input.value.trim()) {
                              const newCompetitors = [...values.competitors, input.value.trim()];
                              setFieldValue('competitors', newCompetitors);
                              input.value = '';
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="absolute right-2 p-1 bg-blue-500 text-white rounded-full"
                        onClick={() => {
                          const input = document.getElementById('competitorInput') as HTMLInputElement;
                          if (input && input.value.trim()) {
                            const newCompetitors = [...values.competitors, input.value.trim()];
                            setFieldValue('competitors', newCompetitors);
                            input.value = '';
                          }
                        }}
                      >
                        <PlusIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {values.competitors.length > 0 ? (
                      values.competitors.map((competitor, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                          <span>{competitor}</span>
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              onClick={() => {
                                const newCompetitors = [...values.competitors];
                                newCompetitors.splice(index, 1);
                                setFieldValue('competitors', newCompetitors);
                              }}
                              className="text-gray-400 hover:text-gray-500"
                            >
                              <XMarkIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center p-4 text-gray-500">
                        No competitors added yet
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Add bottom padding to prevent progress bar overlap */}
                <div className="pb-4"></div>
              </Form>
              
              <ProgressBar
                currentStep={3}
                onStepClick={(step) => router.push(`/campaigns/wizard/step-${step}?id=${campaignId}`)}
                onBack={() => router.push(`/campaigns/wizard/step-2?id=${campaignId}`)}
                onNext={submitForm}
                onSaveDraft={() => handleSaveDraft(values)}
                disableNext={!isValid || isSaving}
                isFormValid={isValid}
                isDirty={dirty}
                isSaving={isSaving}
              />
            </>
          );
        }}
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
