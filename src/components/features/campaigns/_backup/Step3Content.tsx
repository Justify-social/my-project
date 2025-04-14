'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { useWizard } from '@/components/features/campaigns/WizardContext';
import ProgressBar from '@/components/features/campaigns/ProgressBar';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { WizardSkeleton } from '@/components/ui';
import { toast } from 'react-hot-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Icon } from '@/components/ui/icon/icon';
import { Label } from '@/components/ui/label';

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
  location: Yup.array().of(Yup.string()).min(1, 'At least one location is required'),
  ageDistribution: Yup.object()
    .shape({
      age1824: Yup.number().min(0).required(),
      age2534: Yup.number().min(0).required(),
      age3544: Yup.number().min(0).required(),
      age4554: Yup.number().min(0).required(),
      age5564: Yup.number().min(0).required(),
      age65plus: Yup.number().min(0).required(),
    })
    .test('sum', 'Total allocation must be exactly 100%', (values: AgeDistribution | undefined) => {
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
  gender: Yup.array().of(Yup.string()).min(1, 'Select at least one gender'),
  otherGender: Yup.string().when('gender', (gender: string[], schema: any) =>
    gender.includes('Other') ? schema.required('Please specify other gender') : schema
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
  const campaignId = searchParams?.get('id');
  const { data, loading, campaignData } = useWizard();
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  console.log('Step3Content: Full campaign data:', campaignData);
  console.log('Step3Content: campaignData.demographics:', campaignData?.demographics);
  console.log('Step3Content: campaignData.audience:', campaignData?.audience);
  console.log('Step3Content: campaignData.locations:', campaignData?.locations);
  console.log('Step3Content: campaignData.targeting:', campaignData?.targeting);
  console.log('Step3Content: campaignData.competitors:', campaignData?.competitors);

  // --- TEMP: Cast campaignData to any to bypass persistent type errors ---
  const safeCampaignData = campaignData as any;
  // --- END TEMP ---

  // Use optional chaining directly on campaignData
  const audienceData = campaignData?.audience ?? {};

  // Debugging logs using optional chaining
  console.log('Step3Content: Full campaign data:', campaignData);
  console.log('Step3Content: campaignData.demographics:', campaignData?.demographics);
  console.log('Step3Content: campaignData.audience:', campaignData?.audience);
  console.log('Step3Content: campaignData.locations:', campaignData?.locations);
  console.log('Step3Content: campaignData.targeting:', campaignData?.targeting);
  console.log('Step3Content: campaignData.competitors:', campaignData?.competitors);

  // Ensure audience arrays are properly handled
  const ensureStringArray = (value: unknown): string[] => {
    if (!value) return [];
    if (Array.isArray(value)) {
      return value
        .map(item => {
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
        })
        .filter(Boolean);
    }
    return typeof value === 'string' ? [value] : [];
  };

  // Initialize arrays safely using the casted data
  const locationArray = ensureStringArray(safeCampaignData?.locations ?? []);
  const screeningQuestionsArray = ensureStringArray(
    safeCampaignData?.targeting?.screeningQuestions ?? []
  );
  const languagesArray = ensureStringArray(safeCampaignData?.targeting?.languages ?? []);
  const jobTitlesArray = ensureStringArray(safeCampaignData?.demographics?.jobTitles ?? []);
  const competitorsArray = ensureStringArray(safeCampaignData?.competitors ?? []);

  console.log('Step3Content: Initialized location array:', locationArray);
  console.log('Step3Content: Initialized screening questions array:', screeningQuestionsArray);
  console.log('Step3Content: Initialized languages array:', languagesArray);
  console.log('Step3Content: Initialized job titles array:', jobTitlesArray);
  console.log('Step3Content: Initialized competitors array:', competitorsArray);

  // Construct initialValues using the casted data
  const initialValues: AudienceValues = {
    location: locationArray,
    ageDistribution: safeCampaignData?.demographics?.ageDistribution ?? {
      age1824: 0,
      age2534: 0,
      age3544: 0,
      age4554: 0,
      age5564: 0,
      age65plus: 100,
    },
    gender: ensureStringArray(safeCampaignData?.demographics?.gender ?? []),
    otherGender: safeCampaignData?.demographics?.otherGender || '',
    screeningQuestions: screeningQuestionsArray,
    languages: languagesArray,
    educationLevel: safeCampaignData?.demographics?.educationLevel || '',
    jobTitles: jobTitlesArray,
    incomeLevel: safeCampaignData?.demographics?.incomeLevel ?? 0,
    competitors: competitorsArray,
  };

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
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audience: values,
        }),
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
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audience: values,
          submissionStatus: 'draft',
        }),
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
      toast.error(
        'Failed to save draft: ' + (error instanceof Error ? error.message : 'Unknown error')
      );
    }
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen font-body">
        <WizardSkeleton step={3} />
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md font-body">
        <h3 className="text-red-800 font-semibold font-heading">Error</h3>
        <p className="text-red-600 font-body">{error}</p>
        <button
          onClick={() => router.push('/campaigns')}
          className="mt-4 btn btn-secondary font-body"
        >
          Return to Campaigns
        </button>
      </div>
    );
  }
  return (
    <div className="w-full max-w-5xl mx-auto px-6 py-8 bg-background font-body">
      <div className="mb-8 font-body">
        <h1 className="text-2xl font-semibold text-foreground mb-2 font-heading">Campaign Creation</h1>
        <p className="text-muted-foreground font-body">
          Complete all required fields to create your campaign
        </p>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={AudienceSchema}
        onSubmit={handleSubmit}
        enableReinitialize={true}
      >
        {({ values, setFieldValue, submitForm, isValid, dirty }: { values: AudienceValues; setFieldValue: (field: string, value: any) => void; submitForm: () => void; isValid: boolean; dirty: boolean }) => {
          return (
            <>
              <Form className="space-y-6">
                {/* Demographics Section */}
                <div className="bg-background rounded-xl p-6 shadow-sm border font-body">
                  <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center font-heading">
                    <Icon
                      iconId="faUserGroupLight"
                      className="w-5 h-5 mr-2 text-accent font-body"
                    />
                    Demographics
                  </h2>

                  {/* Location Selector */}
                  <div className="mb-6 font-body">
                    <div className="mb-2 font-body">
                      <Label className="block text-sm font-medium font-body">Location</Label>
                    </div>

                    <div className="relative font-body">
                      <div className="flex flex-col font-body">
                        <div className="relative font-body">
                          <input
                            type="text"
                            id="locationInput"
                            placeholder="Enter city, state, region or country"
                            className="w-full p-2.5 pl-10 pr-10 border border-input rounded-md focus:ring-ring focus:border-ring font-body"
                            onKeyDown={e => {
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

                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none font-body">
                            <Icon
                              iconId="faMapLight"
                              className="h-5 w-5 text-muted-foreground font-body"
                            />
                          </div>

                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center font-body"
                            onClick={() => {
                              const input = document.getElementById(
                                'locationInput'
                              ) as HTMLInputElement;
                              if (input && input.value.trim()) {
                                const newLocations = [...values.location, input.value.trim()];
                                setFieldValue('location', newLocations);
                                input.value = '';
                              }
                            }}
                          >
                            <div className="bg-accent rounded-full p-1.5 flex items-center justify-center w-6 h-6 hover:bg-accent/80 transition-colors font-body">
                              <Icon
                                iconId="faPlusLight"
                                className="h-3 w-3 text-accent-foreground font-body"
                              />
                            </div>
                          </button>
                        </div>

                        {Array.isArray(values.location) && values.location.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2 font-body">
                            {values.location.map((loc: string, index: number) => (
                              <span
                                key={index}
                                className="inline-flex items-center justify-between p-3 border rounded-lg bg-background font-body"
                              >
                                <span className="font-body">{loc}</span>
                                <button
                                  type="button"
                                  className="ml-2 group text-muted-foreground hover:text-destructive font-body"
                                  onClick={() => {
                                    const newLocations = [...values.location];
                                    newLocations.splice(index, 1);
                                    setFieldValue('location', newLocations);
                                  }}
                                >
                                  <Icon
                                    iconId="faTrashCanLight"
                                    className="w-4 h-4 group-hover:hidden"
                                  />
                                  <Icon
                                    iconId="faTrashCanSolid"
                                    className="w-4 h-4 hidden group-hover:block"
                                  />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Age Distribution */}
                  <div className="mb-6 font-body">
                    <div className="border-t pt-6 mt-6 font-body"></div>
                    <div className="flex justify-between items-center mb-2 font-body">
                      <Label className="block text-sm font-medium font-body">
                        Age Distribution
                      </Label>
                      <div className="text-xs text-muted-foreground font-body">
                        Allocate percentages to each age range (Total must equal 100%)
                      </div>
                    </div>

                    {/* Age Distribution Sliders */}
                    <div className="space-y-4 mb-4 font-body">
                      {[
                        {
                          key: 'age1824',
                          label: '18-24',
                        },
                        {
                          key: 'age2534',
                          label: '25-34',
                        },
                        {
                          key: 'age3544',
                          label: '35-44',
                        },
                        {
                          key: 'age4554',
                          label: '45-54',
                        },
                        {
                          key: 'age5564',
                          label: '55-64',
                        },
                        {
                          key: 'age65plus',
                          label: '65+',
                        },
                      ].map(age => (
                        <div key={age.key} className="flex items-center font-body">
                          <span className="w-12 text-sm font-medium font-body">
                            {age.label}
                          </span>
                          <div className="flex-grow mx-4 font-body">
                            <Slider
                              value={values.ageDistribution[age.key as keyof AgeDistribution]}
                              onChange={value => {
                                const newValue = typeof value === 'number' ? value : value[0];

                                // Adjust other values proportionally to maintain 100% total
                                const oldValue =
                                  values.ageDistribution[age.key as keyof AgeDistribution];
                                const diff = newValue - oldValue;
                                const otherKeys = Object.keys(values.ageDistribution).filter(
                                  k => k !== age.key
                                );
                                const newDistribution = {
                                  ...values.ageDistribution,
                                };
                                newDistribution[age.key as keyof AgeDistribution] = newValue;
                                const totalOthers = otherKeys.reduce(
                                  (sum, k) =>
                                    sum + values.ageDistribution[k as keyof AgeDistribution],
                                  0
                                );
                                if (totalOthers > 0 && diff !== 0) {
                                  otherKeys.forEach(k => {
                                    const oldOtherValue =
                                      values.ageDistribution[k as keyof AgeDistribution];
                                    const ratio = oldOtherValue / totalOthers;
                                    newDistribution[k as keyof AgeDistribution] = Math.max(
                                      0,
                                      oldOtherValue - diff * ratio
                                    );
                                  });
                                }

                                // Round values
                                Object.keys(newDistribution).forEach(k => {
                                  newDistribution[k as keyof AgeDistribution] = Math.round(
                                    newDistribution[k as keyof AgeDistribution]
                                  );
                                });

                                // Ensure total is 100%
                                const total = Object.values(newDistribution).reduce(
                                  (sum, val) => sum + val,
                                  0
                                );
                                if (total !== 100) {
                                  const diff = 100 - total;
                                  // Add/subtract from the largest value that&apos;s not the current one
                                  const largestKey = otherKeys.reduce(
                                    (max, k) =>
                                      newDistribution[k as keyof AgeDistribution] >
                                        newDistribution[max as keyof AgeDistribution]
                                        ? k
                                        : max,
                                    otherKeys[0]
                                  );
                                  newDistribution[largestKey as keyof AgeDistribution] += diff;
                                }
                                setFieldValue('ageDistribution', newDistribution);
                              }}
                              min={0}
                              max={100}
                              step={1}
                              trackStyle={{ backgroundColor: 'hsl(var(--accent))', height: 6 }}
                              railStyle={{ backgroundColor: 'hsl(var(--border))', height: 6 }}
                              handleStyle={{
                                borderColor: 'hsl(var(--accent))',
                                backgroundColor: 'hsl(var(--accent))',
                                opacity: 1,
                                height: 16,
                                width: 16,
                                marginTop: -5,
                              }}
                              dotStyle={{
                                borderColor: 'hsl(var(--border))',
                                backgroundColor: 'hsl(var(--border))',
                                height: 8,
                                width: 8,
                                marginBottom: 0,
                              }}
                              activeDotStyle={{
                                borderColor: 'hsl(var(--accent))',
                                backgroundColor: 'hsl(var(--accent))',
                              }}
                              className="mt-1"
                            />
                          </div>
                          <span className="w-12 text-right text-sm font-medium font-body">
                            {values.ageDistribution[age.key as keyof AgeDistribution]}%
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Age Range */}
                    <div className="mt-6 font-body">
                      <h4 className="text-foreground font-medium mb-3 text-sm font-heading">
                        Age Range
                      </h4>
                      <div className="grid grid-cols-6 gap-1 font-body">
                        {['18-24', '25-34', '35-44', '45-54', '55-64', '65+'].map(
                          (range, index) => {
                            // Check if this age range is selected
                            const ageKey =
                              range === '65+' ? 'age65plus' : `age${range.replace('-', '')}`;
                            const percentage =
                              values.ageDistribution[ageKey as keyof AgeDistribution] || 0;
                            return (
                              <div
                                key={range}
                                className={`text-center py-1.5 text-xs rounded ${percentage > 0 ? 'bg-accent text-accent-foreground font-medium' : 'bg-muted text-muted-foreground'} font-body`}
                              >
                                {range}
                              </div>
                            );
                          }
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Gender Selection */}
                  <div className="mb-6 font-body">
                    <div className="border-t pt-6 mt-6 font-body"></div>
                    <Label className="block text-sm font-medium mb-2 font-body">
                      Gender Selection
                    </Label>
                    <div className="text-xs text-muted-foreground mb-3 font-body">
                      Choose one or more gender identities
                    </div>
                    <div className="flex space-x-4 font-body">
                      <Label className="inline-flex items-center font-body">
                        <Field
                          type="checkbox"
                          name="gender"
                          value="Male"
                          className="h-4 w-4 text-secondary border-input rounded focus:ring-secondary"
                        />
                        <span className="ml-2 text-sm text-foreground">Male</span>
                      </Label>
                      <Label className="inline-flex items-center font-body">
                        <Field
                          type="checkbox"
                          name="gender"
                          value="Female"
                          className="h-4 w-4 text-secondary border-input rounded focus:ring-secondary"
                        />
                        <span className="ml-2 text-sm text-foreground">Female</span>
                      </Label>
                      <Label className="inline-flex items-center font-body">
                        <Field
                          type="checkbox"
                          name="gender"
                          value="Other"
                          className="h-4 w-4 text-secondary border-input rounded focus:ring-secondary"
                        />
                        <span className="ml-2 text-sm text-foreground">Other</span>
                      </Label>
                    </div>
                    {values.gender.includes('Other') && (
                      <div className="mt-2 font-body">
                        <Field
                          type="text"
                          name="otherGender"
                          placeholder="Please specify"
                          className="mt-1 p-2 block w-full border border-input rounded-md"
                        />
                      </div>
                    )}
                    <ErrorMessage
                      name="gender"
                      component="div"
                      className="mt-1 text-sm text-destructive"
                    />
                  </div>
                </div>

                {/* Screening Questions */}
                <div className="bg-background rounded-xl p-6 shadow-sm border font-body">
                  <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center font-heading">
                    <Icon iconId="faCircleQuestionLight" className="w-5 h-5 mr-2 text-accent" />
                    Screening Questions
                  </h2>
                  <div className="relative mb-4 font-body">
                    <div className="flex items-center font-body">
                      <Icon
                        iconId="faMagnifyingGlassLight"
                        className="h-5 w-5 text-muted-foreground absolute left-3"
                      />
                      <input
                        type="text"
                        id="screeningQueryInput"
                        placeholder="Search Screening Questions"
                        className="w-full p-2.5 pl-10 pr-10 border border-input rounded-md"
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const input = e.target as HTMLInputElement;
                            if (input && input.value.trim()) {
                              const newQuestions = [
                                ...values.screeningQuestions,
                                input.value.trim(),
                              ];
                              setFieldValue('screeningQuestions', newQuestions);
                              input.value = '';
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="absolute right-2 flex items-center font-body"
                        onClick={() => {
                          const input = document.getElementById(
                            'screeningQueryInput'
                          ) as HTMLInputElement;
                          if (input && input.value.trim()) {
                            const newQuestions = [...values.screeningQuestions, input.value.trim()];
                            setFieldValue('screeningQuestions', newQuestions);
                            input.value = '';
                          }
                        }}
                      >
                        <div className="bg-accent rounded-full p-1.5 flex items-center justify-center w-6 h-6 hover:bg-accent/80 transition-colors">
                          <Icon iconId="faPlusSolid" className="h-3 w-3 text-accent-foreground" />
                        </div>
                      </button>
                    </div>
                  </div>
                  <div className="mb-4 font-body">
                    <h3 className="text-sm font-medium text-foreground mb-2 font-heading">
                      Suggested Questions
                    </h3>
                    <div className="flex flex-wrap gap-2 font-body">
                      {[
                        'Have you purchased from this brand before?',
                        'How often do you use social media?',
                        'Are you a decision maker for purchases in your household?',
                      ].map(question => (
                        <button
                          key={question}
                          type="button"
                          className={`
                            text-sm px-3 py-1.5 rounded-md 
                            ${values.screeningQuestions.includes(question)
                              ? 'bg-accent text-accent-foreground border border-accent'
                              : 'bg-muted/50 text-foreground border border hover:bg-muted/80'
                            } font-body`}
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
                  {Array.isArray(values.screeningQuestions) &&
                    values.screeningQuestions.length > 0 && (
                      <div className="flex flex-wrap gap-2 font-body">
                        {values.screeningQuestions.map((question, index) => (
                          <div
                            key={index}
                            className="inline-flex items-center justify-between p-3 border rounded-lg bg-background"
                          >
                            <span className="font-body">{question}</span>
                            <button
                              type="button"
                              className="ml-3 group text-muted-foreground hover:text-destructive font-body"
                              onClick={() => {
                                const newQuestions = [...values.screeningQuestions];
                                newQuestions.splice(index, 1);
                                setFieldValue('screeningQuestions', newQuestions);
                              }}
                            >
                              <Icon
                                iconId="faTrashCanLight"
                                className="w-4 h-4 group-hover:hidden"
                              />
                              <Icon
                                iconId="faTrashCanSolid"
                                className="w-4 h-4 hidden group-hover:block"
                              />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                </div>

                {/* Languages */}
                <div className="bg-background rounded-xl p-6 shadow-sm border font-body">
                  <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center font-heading">
                    <Icon iconId="faGlobeLight" className="w-5 h-5 mr-2 text-accent" />
                    Languages
                  </h2>
                  <div className="relative font-body">
                    <div className="mb-2 font-body">
                      <Label className="block text-sm font-medium font-body">
                        Select language
                      </Label>
                    </div>
                    <div className="relative font-body">
                      <div className="mb-4 font-body">
                        {['English', 'Spanish', 'French', 'German', 'Chinese'].map(language => (
                          <div key={language} className="flex items-center mt-2 font-body">
                            <Field
                              type="checkbox"
                              name="languages"
                              value={language}
                              className="h-4 w-4 text-secondary border-input rounded focus:ring-secondary"
                            />
                            <Label className="ml-2 block text-sm text-foreground font-body">
                              {language}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    {Array.isArray(values.languages) && values.languages.length > 0 && (
                      <div className="mt-3 font-body">
                        <div className="flex flex-wrap gap-2 font-body">
                          {values.languages.map(lang => (
                            <span
                              key={lang}
                              className="inline-flex items-center justify-between p-3 border rounded-lg bg-background"
                            >
                              <span className="font-body">{lang}</span>
                              <button
                                type="button"
                                className="ml-2 group text-muted-foreground hover:text-destructive font-body"
                                onClick={() => {
                                  const newLanguages = values.languages.filter(l => l !== lang);
                                  setFieldValue('languages', newLanguages);
                                }}
                              >
                                <Icon
                                  iconId="faTrashCanLight"
                                  className="w-4 h-4 group-hover:hidden"
                                />
                                <Icon
                                  iconId="faTrashCanSolid"
                                  className="w-4 h-4 hidden group-hover:block"
                                />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Advanced Targeting */}
                <div className="bg-background rounded-xl p-6 shadow-sm border font-body">
                  <div
                    className="flex justify-between items-center cursor-pointer font-body"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                  >
                    <h2 className="text-lg font-semibold text-foreground flex items-center font-heading">
                      <Icon iconId="faFilterLight" className="w-5 h-5 mr-2 text-accent" />
                      Advanced Targeting
                    </h2>
                    <div className="text-accent hover:text-accent/80 font-body">
                      <Icon
                        iconId="faChevronRightLight"
                        className={`h-5 w-5 transform ${showAdvanced ? 'rotate-90' : ''} transition-transform`}
                      />
                    </div>
                  </div>
                  {showAdvanced && (
                    <div className="mt-4 space-y-6 font-body">
                      {/* Education Level */}
                      <div className="font-body">
                        <div className="mb-2 font-body">
                          <Label className="block text-sm font-medium font-body">
                            Education Level
                          </Label>
                        </div>
                        <div className="relative font-body">
                          <Field
                            as="select"
                            name="educationLevel"
                            className="block w-full px-3 py-2 text-base border border-input focus:outline-none focus:ring-ring focus:border-ring sm:text-sm rounded-md appearance-none font-body"
                          >
                            <option value="">Select Education</option>
                            <option value="high_school">High School</option>
                            <option value="some_college">Some College</option>
                            <option value="associates">Associate&apos;s Degree</option>
                            <option value="bachelors">Bachelor&apos;s Degree</option>
                            <option value="masters">Master&apos;s Degree</option>
                            <option value="doctorate">Doctorate</option>
                            <option value="professional">Professional Degree</option>
                          </Field>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none font-body">
                            <Icon
                              iconId="faChevronDownLight"
                              className="h-5 w-5 text-muted-foreground"
                            />
                          </div>
                        </div>
                      </div>
                      {/* Job Titles */}
                      <div className="font-body">
                        <div className="mb-2 font-body">
                          <Label className="block text-sm font-medium font-body">
                            Job Titles
                          </Label>
                        </div>
                        <div className="relative mb-6 font-body">
                          <div className="flex items-center font-body">
                            <Icon
                              iconId="faMagnifyingGlassLight"
                              className="h-5 w-5 text-muted-foreground absolute left-3"
                            />
                            <input
                              type="text"
                              id="jobTitleInput"
                              placeholder="Enter job titles (press Enter to add)"
                              className="w-full p-2.5 pl-10 pr-10 border border-input rounded-md focus:ring-ring focus:border-ring"
                              onKeyDown={e => {
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
                              className="absolute right-2 flex items-center font-body"
                              onClick={() => {
                                const input = document.getElementById(
                                  'jobTitleInput'
                                ) as HTMLInputElement;
                                if (input && input.value.trim()) {
                                  const newJobTitles = [...values.jobTitles, input.value.trim()];
                                  setFieldValue('jobTitles', newJobTitles);
                                  input.value = '';
                                }
                              }}
                            >
                              <div className="bg-accent rounded-full p-1.5 flex items-center justify-center w-6 h-6 hover:bg-accent/80 transition-colors">
                                <Icon
                                  iconId="faPlusLight"
                                  className="h-3 w-3 text-accent-foreground"
                                />
                              </div>
                            </button>
                          </div>
                          <div className="mt-2 text-xs text-muted-foreground font-body">
                            <p className="font-body">
                              Examples: Marketing Manager, Software Engineer, Financial Analyst
                            </p>
                          </div>
                          {Array.isArray(values.jobTitles) && values.jobTitles.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2 font-body">
                              {values.jobTitles.map((title, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center justify-between p-3 border rounded-lg bg-background"
                                >
                                  <span className="font-body">{title}</span>
                                  <button
                                    type="button"
                                    className="ml-2 group text-muted-foreground hover:text-destructive"
                                    onClick={() => {
                                      const newJobTitles = [...values.jobTitles];
                                      newJobTitles.splice(index, 1);
                                      setFieldValue('jobTitles', newJobTitles);
                                    }}
                                  >
                                    <Icon
                                      iconId="faTrashCanLight"
                                      className="w-4 h-4 group-hover:hidden"
                                    />
                                    <Icon
                                      iconId="faTrashCanSolid"
                                      className="w-4 h-4 hidden group-hover:block"
                                    />
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Income Level */}
                      <div className="font-body">
                        <div className="flex justify-between items-center mb-2 font-body">
                          <Label className="block text-sm font-medium font-body">
                            Income Level
                          </Label>
                          <div className="group relative font-body">
                            <Icon
                              iconId="faCircleInfoLight"
                              className="h-5 w-5 text-muted-foreground cursor-help"
                            />
                            <div className="absolute right-0 bottom-6 w-64 bg-background shadow-lg rounded-md p-2 text-xs text-foreground hidden group-hover:block border font-body">
                              Set the minimum income level for your target audience. This helps
                              narrow down your demographic to users with specific purchasing power.
                            </div>
                          </div>
                        </div>
                        <div className="w-full px-0 font-body">
                          <div className="flex flex-col w-full font-body">
                            <div className="relative w-full max-w-full pt-4 pb-6 font-body">
                              <Slider
                                value={values.incomeLevel}
                                onChange={value => {
                                  const newValue = typeof value === 'number' ? value : value[0];
                                  setFieldValue('incomeLevel', newValue);
                                }}
                                min={0}
                                max={100000}
                                step={10000}
                                marks={{
                                  0: '',
                                  20000: '',
                                  50000: '',
                                  100000: '',
                                }}
                                trackStyle={{
                                  backgroundColor: 'hsl(var(--accent))',
                                  height: 4,
                                }}
                                railStyle={{
                                  backgroundColor: 'hsl(var(--border))',
                                  height: 4,
                                }}
                                handleStyle={{
                                  borderColor: 'hsl(var(--accent))',
                                  backgroundColor: 'hsl(var(--accent))',
                                  opacity: 1,
                                  height: 16,
                                  width: 16,
                                  marginTop: -6,
                                  boxShadow: '0 0 0 2px hsla(var(--accent), 0.2)',
                                }}
                                dotStyle={{
                                  borderColor: 'hsl(var(--border))',
                                  backgroundColor: 'hsl(var(--border))',
                                  height: 8,
                                  width: 8,
                                  marginBottom: 0,
                                }}
                                activeDotStyle={{
                                  borderColor: 'hsl(var(--accent))',
                                  backgroundColor: 'hsl(var(--accent))',
                                }}
                                className="w-full"
                              />
                              <div className="absolute inset-x-0 bottom-0 flex justify-between text-xs text-muted-foreground px-1 font-body">
                                <span className="font-body">$0</span>
                                <span className="font-body">$20k</span>
                                <span className="font-body">$50k</span>
                                <span className="font-body">$100k+</span>
                              </div>
                            </div>
                            <div className="mt-2 text-right font-medium text-sm text-foreground font-body">
                              {values.incomeLevel >= 100000
                                ? `$${values.incomeLevel.toLocaleString()}+`
                                : `$${values.incomeLevel.toLocaleString()}`}
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Competitors */}
                      <div className="font-body">
                        <div className="mb-2 font-body">
                          <Label className="block text-sm font-medium font-body">
                            Competitors
                          </Label>
                        </div>
                        <div className="relative font-body">
                          <p className="text-muted-foreground mb-4 font-body">
                            Enter the names of key competitors...
                          </p>
                          <div className="flex items-center font-body">
                            <Icon
                              iconId="faMagnifyingGlassLight"
                              className="h-5 w-5 text-muted-foreground absolute left-3"
                            />
                            <input
                              type="text"
                              id="competitorInput"
                              placeholder="Enter competitor name"
                              className="w-full p-2.5 pl-10 pr-10 border border-input rounded-md focus:ring-ring focus:border-ring"
                              onKeyDown={e => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  const input = e.target as HTMLInputElement;
                                  if (input && input.value.trim()) {
                                    const companies = input.value
                                      .split(',')
                                      .map(c => c.trim())
                                      .filter(Boolean);
                                    if (companies.length > 0) {
                                      const newCompetitors = [...values.competitors, ...companies];
                                      setFieldValue('competitors', newCompetitors);
                                      input.value = '';
                                    }
                                  }
                                }
                              }}
                            />
                            <button
                              type="button"
                              className="absolute right-2 flex items-center font-body"
                              onClick={() => {
                                const input = document.getElementById(
                                  'competitorInput'
                                ) as HTMLInputElement;
                                if (input && input.value.trim()) {
                                  const companies = input.value
                                    .split(',')
                                    .map(c => c.trim())
                                    .filter(Boolean);
                                  if (companies.length > 0) {
                                    const newCompetitors = [...values.competitors, ...companies];
                                    setFieldValue('competitors', newCompetitors);
                                    input.value = '';
                                  }
                                }
                              }}
                            >
                              <div className="bg-accent rounded-full p-1.5 flex items-center justify-center w-6 h-6 hover:bg-accent/80 transition-colors">
                                <Icon
                                  iconId="faPlusLight"
                                  className="h-3 w-3 text-accent-foreground"
                                />
                              </div>
                            </button>
                          </div>
                          {Array.isArray(values.competitors) && values.competitors.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2 font-body">
                              {values.competitors.map((comp, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center justify-between p-3 border rounded-lg bg-background"
                                >
                                  <span className="font-body">{comp}</span>
                                  <button
                                    type="button"
                                    className="ml-2 group text-muted-foreground hover:text-destructive"
                                    onClick={() => {
                                      const updatedCompetitors = [...values.competitors];
                                      updatedCompetitors.splice(index, 1);
                                      setFieldValue('competitors', updatedCompetitors);
                                    }}
                                  >
                                    <Icon
                                      iconId="faTrashCanLight"
                                      className="w-4 h-4 group-hover:hidden"
                                    />
                                    <Icon
                                      iconId="faTrashCanSolid"
                                      className="w-4 h-4 hidden group-hover:block"
                                    />
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Form>

              <ProgressBar
                currentStep={3}
                onStepClick={step => router.push(`/campaigns/wizard/step-${step}?id=${campaignId}`)}
                onBack={() => router.push(`/campaigns/wizard/step-2?id=${campaignId}`)}
                onNext={submitForm}
                onSaveDraft={() => handleSaveDraft(values)}
                disableNext={!isValid || isSaving}
                isFormValid={isValid}
                isDirty={dirty}
                isSaving={isSaving}
              />

              {/* Add substantial bottom padding to prevent progress bar overlap */}
              <div className="pb-16 font-body"></div>
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
    return <WizardSkeleton step={3} />;
  }
  return (
    <Suspense fallback={<WizardSkeleton step={3} />}>
      <FormContent />
    </Suspense>
  );
}
