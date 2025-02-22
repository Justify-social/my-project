"use client";

import React, { useState, useEffect, KeyboardEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import * as Yup from "yup";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { useWizard } from "../../../../context/WizardContext";
import Header from "../../../../components/Wizard/Header";
import ProgressBar from "../../../../components/Wizard/ProgressBar";
import { Section } from '@/components/ui/section';
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { toast } from "react-hot-toast";

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
// COMPONENT: LocationSelector
// =============================================================================

interface LocationSelectorProps {
  selectedLocations: string[];
  onChange: (locations: string[]) => void;
}
const LocationSelector: React.FC<LocationSelectorProps> = ({ selectedLocations, onChange }) => {
  const [query, setQuery] = useState("");
  const allLocations = [
    "London",
    "Manchester",
    "Birmingham",
    "Glasgow",
    "Liverpool",
    "Leeds",
    "Sheffield",
    "Bristol",
  ];
  const filtered = allLocations.filter(
    (loc) =>
      loc.toLowerCase().includes(query.toLowerCase()) &&
      !selectedLocations.includes(loc)
  );
  return (
    <div className="mb-4 relative">
      <label className="block font-semibold mb-1">Location</label>
      <input
        type="text"
        placeholder="Search by City, State, Region or Country"
        className="w-full p-2 border rounded"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Location search"
      />
      {query && filtered.length > 0 && (
        <ul className="absolute z-10 bg-white border w-full mt-1 list-none">
          {filtered.map((loc) => (
            <li
              key={loc}
              onClick={() => {
                onChange([...selectedLocations, loc]);
                setQuery("");
              }}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              role="option"
            >
              {loc}
            </li>
          ))}
        </ul>
      )}
      <div className="mt-2 flex flex-wrap gap-2">
        {selectedLocations.map((loc) => (
          <span key={loc} className="bg-gray-200 px-3 py-1 rounded-full flex items-center">
            {loc}
            <button
              type="button"
              onClick={() =>
                onChange(selectedLocations.filter((l) => l !== loc))
              }
              className="ml-2 text-red-500"
              aria-label={`Remove ${loc}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};

// =============================================================================
// COMPONENT: AgeDistributionSlider
// =============================================================================

interface AgeDistributionSliderProps {
  values: number[];
  onChange: (newValues: number[]) => void;
}
const AgeDistributionSlider: React.FC<AgeDistributionSliderProps> = ({
  values,
  onChange,
}) => {
  const ageGroups = ["18-24", "25-34", "35-44", "45-54", "55-64", "65+"];
  
  const handleSliderChange = (index: number, newValue: number) => {
    let newValues = [...values];
    const oldValue = newValues[index];
    
    // Ensure newValue is between 0 and 100
    newValue = Math.max(0, Math.min(100, newValue));
    
    // Calculate the difference to distribute
    const diff = newValue - oldValue;
    
    // If increasing one value, decrease others proportionally
    if (diff > 0) {
      const availableToDecrease = newValues.reduce((sum, val, i) => 
        i !== index ? sum + val : sum, 0);
      
      if (availableToDecrease > 0) {
        newValues = newValues.map((val, i) => {
          if (i === index) return newValue;
          const decrease = (val / availableToDecrease) * diff;
          return Math.max(0, val - decrease);
        });
      }
    } 
    // If decreasing one value, increase others proportionally
    else if (diff < 0) {
      const availableToIncrease = 100 - newValues.reduce((sum, val, i) => 
        i !== index ? sum + val : sum, 0);
      
      if (availableToIncrease > 0) {
        const totalOthers = newValues.reduce((sum, val, i) => 
          i !== index ? sum + val : sum, 0);
        
        newValues = newValues.map((val, i) => {
          if (i === index) return newValue;
          const increase = (val / totalOthers) * Math.abs(diff);
          return val + increase;
        });
      }
    }

    // Round all values and ensure they sum to 100
    newValues = newValues.map(v => Math.round(v));
    const total = newValues.reduce((sum, v) => sum + v, 0);
    
    if (total !== 100) {
      const difference = 100 - total;
      // Find largest value that's not the current index
      const maxIndex = newValues
        .map((v, i) => i !== index ? v : -1)
        .reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
      
      if (maxIndex >= 0) {
        newValues[maxIndex] += difference;
      }
    }

    onChange(newValues);
  };

  return (
    <div className="mb-6">
      <p className="text-sm text-gray-600 mb-4">
        Adjust the sliders to allocate percentages across age groups. The total must equal 100%.
      </p>
      
      <div className="space-y-4">
        {ageGroups.map((group, index) => (
          <div key={group} className="flex items-center gap-4">
            <span className="w-16 text-sm font-medium">{group}</span>
            <div className="flex-grow">
              <Slider
                min={0}
                max={100}
                step={1}
                value={values[index]}
                onChange={(value) => handleSliderChange(index, typeof value === 'number' ? value : value[0])}
                className="slider-blue"
                trackStyle={{ 
                  backgroundColor: '#2563EB', 
                  height: 4,
                  transition: 'all 0.3s ease' 
                }}
                handleStyle={{
                  borderColor: '#2563EB',
                  backgroundColor: '#2563EB',
                  opacity: 1,
                  boxShadow: '0 0 0 5px rgba(37, 99, 235, 0.1)',
                  width: 16,
                  height: 16,
                  marginTop: -6,
                  transition: 'all 0.3s ease'
                }}
                railStyle={{ 
                  backgroundColor: '#E5E7EB',
                  height: 4 
                }}
              />
            </div>
            <span className="w-12 text-right text-sm font-medium">
              {Math.round(values[index])}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// =============================================================================
// COMPONENT: GenderSelection
// =============================================================================

interface GenderSelectionProps {
  selected: string[];
  otherGender: string;
  onChange: (genders: string[]) => void;
  onOtherChange: (val: string) => void;
}
const GenderSelection: React.FC<GenderSelectionProps> = ({
  selected,
  otherGender,
  onChange,
  onOtherChange,
}) => (
  <div className="mb-4">
    <label className="block font-semibold mb-1">
      Choose one or more gender identities
    </label>
    <div role="group" className="flex items-center space-x-4">
      {["Male", "Female", "Other"].map((g) => (
        <label key={g} className="inline-flex items-center">
          <input
            type="checkbox"
            name="gender"
            value={g}
            checked={selected.includes(g)}
            onChange={(e) => {
              if (e.target.checked) {
                onChange([...selected, g]);
              } else {
                onChange(selected.filter((val) => val !== g));
              }
            }}
            className="mr-1"
          />
          {g}
        </label>
      ))}
    </div>
    {selected.includes("Other") && (
      <div className="mt-2">
        <input
          type="text"
          value={otherGender}
          onChange={(e) => onOtherChange(e.target.value)}
          placeholder="Please specify"
          className="w-full p-2 border rounded"
          aria-label="Specify other gender"
        />
      </div>
    )}
  </div>
);

// =============================================================================
// COMPONENT: ScreeningQuestions
// =============================================================================

interface ScreeningQuestionsProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
}
const ScreeningQuestions: React.FC<ScreeningQuestionsProps> = ({
  selectedTags,
  onChange,
}) => {
  const [query, setQuery] = useState("");
  const tagSuggestions = ["Tag Suggestion 1", "Tag Suggestion 2", "Other"];
  const filtered = tagSuggestions.filter(
    (tag) =>
      tag.toLowerCase().includes(query.toLowerCase()) &&
      !selectedTags.includes(tag)
  );
  return (
    <div className="mb-4 relative">
      <label className="block font-semibold mb-1">
        Search Screening Questions
      </label>
      <input
        type="text"
        placeholder="Type to search screening questions"
        className="w-full p-2 border rounded"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Screening questions search"
      />
      {query && filtered.length > 0 && (
        <ul className="absolute z-10 bg-white border w-full mt-1 list-none">
          {filtered.map((tag) => (
            <li
              key={tag}
              onClick={() => {
                onChange([...selectedTags, tag]);
                setQuery("");
              }}
              className="p-2 hover:bg-gray-100 cursor-pointer"
            >
              {tag}
            </li>
          ))}
        </ul>
      )}
      <div className="mt-2 flex flex-wrap gap-2">
        {selectedTags.map((tag) => (
          <span key={tag} className="bg-gray-200 px-3 py-1 rounded-full flex items-center">
            {tag}
            <button
              type="button"
              onClick={() => onChange(selectedTags.filter((t) => t !== tag))}
              className="ml-2 text-red-500"
              aria-label={`Remove ${tag}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};

// =============================================================================
// COMPONENT: LanguagesSelector
// =============================================================================

interface LanguagesSelectorProps {
  selected: string[];
  onChange: (langs: string[]) => void;
}
const LanguagesSelector: React.FC<LanguagesSelectorProps> = ({ selected, onChange }) => {
  const languages = ["English", "Spanish", "French", "German", "Mandarin"];
  return (
    <div className="mb-4">
      <label className="block font-semibold mb-1">Select language</label>
      <select
        multiple
        value={selected}
        onChange={(e) => {
          const selectedOptions = Array.from(e.target.selectedOptions).map(
            (o) => o.value
          );
          onChange(selectedOptions);
        }}
        className="w-full p-2 border rounded"
        aria-label="Select languages"
      >
        {languages.map((lang) => (
          <option key={lang} value={lang}>
            {lang}
          </option>
        ))}
      </select>
    </div>
  );
};

// =============================================================================
// COMPONENT: AdvancedTargeting
// =============================================================================

const AdvancedTargeting: React.FC = () => (
  <div className="border p-4 rounded mb-4">
    <h2 className="text-xl font-bold mb-2">Advanced Targeting</h2>
    <div className="mb-4">
      <label htmlFor="educationLevel" className="block font-semibold mb-1">
        Education Level
      </label>
      <Field
        as="select"
        id="educationLevel"
        name="educationLevel"
        className="w-full p-2 border rounded"
      >
        <option value="">Select Education Level</option>
        <option value="High School">High School</option>
        <option value="College">College</option>
        <option value="University">University</option>
        <option value="Postgraduate">Postgraduate</option>
      </Field>
      <ErrorMessage name="educationLevel" component="div" className="text-red-600 text-sm" />
    </div>
    <div className="mb-4">
      <label htmlFor="jobTitles" className="block font-semibold mb-1">
        Job Titles
      </label>
      <Field
        id="jobTitles"
        name="jobTitles"
        placeholder="Type to search job titles"
        className="w-full p-2 border rounded"
      />
      <ErrorMessage name="jobTitles" component="div" className="text-red-600 text-sm" />
    </div>
    <div className="mb-4">
      <label className="block font-semibold mb-1">Income Level</label>
      <div role="group" className="flex items-center space-x-4">
        {["$10,000", "$20,000", "$30,000"].map((inc) => (
          <label key={inc} className="inline-flex items-center">
            <Field type="radio" name="incomeLevel" value={inc} />
            <span className="ml-2">{inc}</span>
          </label>
        ))}
      </div>
      <ErrorMessage name="incomeLevel" component="div" className="text-red-600 text-sm" />
    </div>
  </div>
);

// =============================================================================
// COMPONENT: CompetitorTracking
// =============================================================================

interface CompetitorTrackingProps {
  selected: string[];
  onChange: (companies: string[]) => void;
}
const CompetitorTracking: React.FC<CompetitorTrackingProps> = ({ selected, onChange }) => {
  const [query, setQuery] = useState("");
  const allCompanies = [
    "Company Name 1",
    "Company Name 2",
    "Company Name 3",
    "Company Name 4",
  ];
  const filtered = allCompanies.filter(
    (comp) =>
      comp.toLowerCase().includes(query.toLowerCase()) && !selected.includes(comp)
  );
  return (
    <div className="mb-4 relative">
      <label className="block font-semibold mb-1">Search Companies</label>
      <input
        type="text"
        placeholder="Type to search companies (comma separated)"
        className="w-full p-2 border rounded"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Competitor search"
      />
      {query && filtered.length > 0 && (
        <ul className="absolute z-10 bg-white border w-full mt-1 list-none">
          {filtered.map((comp) => (
            <li
              key={comp}
              onClick={() => {
                onChange([...selected, comp]);
                setQuery("");
              }}
              className="p-2 hover:bg-gray-100 cursor-pointer"
            >
              {comp}
            </li>
          ))}
        </ul>
      )}
      <div className="mt-2 flex flex-wrap gap-2">
        {selected.map((comp) => (
          <span key={comp} className="bg-gray-200 px-3 py-1 rounded-full flex items-center">
            {comp}
            <button
              type="button"
              onClick={() => onChange(selected.filter((c) => c !== comp))}
              className="ml-2 text-red-500"
              aria-label={`Remove ${comp}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};

// =============================================================================
// MAIN COMPONENT: AUDIENCE TARGETING (STEP 3)
// =============================================================================

function AudienceTargetingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const campaignId = searchParams.get('id');
  const { data, updateData } = useWizard();
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update the useEffect for loading campaign data
  useEffect(() => {
    const loadCampaignData = async () => {
      if (campaignId) {
        try {
          setIsLoading(true);
          setError(null);
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
          setError(message);
          toast.error(message);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    loadCampaignData();
  }, [campaignId]);

  // Update initialValues to remove default values
  const initialValues: AudienceValues = {
    location: data.audience?.location || [],
    ageDistribution: {
      age1824: data.audience?.ageDistribution?.age1824 ?? 0,
      age2534: data.audience?.ageDistribution?.age2534 ?? 0,
      age3544: data.audience?.ageDistribution?.age3544 ?? 0,
      age4554: data.audience?.ageDistribution?.age4554 ?? 0,
      age5564: data.audience?.ageDistribution?.age5564 ?? 0,
      age65plus: data.audience?.ageDistribution?.age65plus ?? 0,
    },
    gender: data.audience?.gender || [],
    otherGender: data.audience?.otherGender || "",
    screeningQuestions: data.audience?.screeningQuestions || [],
    languages: data.audience?.languages || [],
    educationLevel: data.audience?.educationLevel || "",
    jobTitles: data.audience?.jobTitles || "",
    incomeLevel: data.audience?.incomeLevel || "",
    competitors: data.audience?.competitors || [],
  };

  // Update handleSubmit with better error handling
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

  // Update handleSaveDraft
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

  // Add loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
        <p className="ml-2">Loading campaign data...</p>
      </div>
    );
  }

  // Add error state
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
    <div className="max-w-4xl mx-auto p-4 pb-32">
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
                  'Save Draft'
                )}
              </button>
            </div>

            <Form className="space-y-8">
              {/* DEMOGRAPHICS SECTION */}
              <div>
                <h2 className="text-xl font-bold mb-2">Demographics</h2>
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

              {/* SCREENING QUESTIONS SECTION */}
              <div>
                <h2 className="text-xl font-bold mb-2">Screening Questions</h2>
                <ScreeningQuestions
                  selectedTags={values.screeningQuestions}
                  onChange={(tags) => {
                    setFieldValue("screeningQuestions", tags);
                  }}
                />
              </div>

              {/* LANGUAGES SECTION */}
              <div>
                <h2 className="text-xl font-bold mb-2">Languages</h2>
                <LanguagesSelector
                  selected={values.languages}
                  onChange={(langs) => {
                    setFieldValue("languages", langs);
                  }}
                />
              </div>

              {/* ADVANCED TARGETING (Collapsible) */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="mb-4 text-blue-600 underline"
                >
                  {showAdvanced ? "Hide Advanced Options" : "Show Advanced Options"}
                </button>
                {showAdvanced && <AdvancedTargeting />}
              </div>

              {/* COMPETITOR TRACKING SECTION */}
              <div>
                <h2 className="text-xl font-bold mb-2">Competitors to Monitor</h2>
                <CompetitorTracking
                  selected={values.competitors}
                  onChange={(companies) => {
                    setFieldValue("competitors", companies);
                  }}
                />
              </div>
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

export default function AudienceTargetingStep() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
        <p className="ml-2">Loading...</p>
      </div>
    }>
      <AudienceTargetingContent />
    </Suspense>
  );
}
