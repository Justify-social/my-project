"use client";

import React, { useState, useEffect, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import * as Yup from "yup";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { useWizard } from "../../../../context/WizardContext";
import Header from "../../../../components/Wizard/Header";
import ProgressBar from "../../../../components/Wizard/ProgressBar";

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
      <button type="button" className="mt-2 text-sm text-blue-600 underline">
        Edit Field
      </button>
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
  values: propValues,
  onChange,
}) => {
  const ageGroups = ["18-24", "25-34", "35-44", "45-54", "55-64", "65+"];
  const [values, setValues] = useState<number[]>(propValues);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    setValues(propValues);
  }, [propValues]);

  const recalcDistribution = (
    index: number,
    newValue: number,
    current: number[]
  ): number[] => {
    const newDistribution = [...current];
    newDistribution[index] = newValue;
    const otherIndices = current
      .map((_, i) => i)
      .filter((i) => i !== index);
    const sumOthers = otherIndices.reduce((sum, i) => sum + current[i], 0);
    const remaining = 100 - newValue;
    if (sumOthers === 0) {
      const share = remaining / otherIndices.length;
      otherIndices.forEach((i) => (newDistribution[i] = share));
    } else {
      otherIndices.forEach((i) => {
        newDistribution[i] = Math.round((current[i] / sumOthers) * remaining);
      });
    }
    const total = newDistribution.reduce((a, b) => a + b, 0);
    if (total !== 100) {
      const diff = 100 - total;
      let candidateIndex = otherIndices[0];
      otherIndices.forEach((i) => {
        if (newDistribution[i] > newDistribution[candidateIndex])
          candidateIndex = i;
      });
      newDistribution[candidateIndex] += diff;
    }
    return newDistribution;
  };

  const handleChange = (index: number, newVal: number) => {
    const newVals = recalcDistribution(index, newVal, values);
    setValues(newVals);
    onChange(newVals);
    const total = newVals.reduce((a, b) => a + b, 0);
    setError(total !== 100 ? "Total allocation must be exactly 100%." : "");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    let newVal = values[index];
    if (e.key === "ArrowUp" || e.key === "ArrowRight") {
      newVal = Math.min(newVal + 1, 100);
    } else if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
      newVal = Math.max(newVal - 1, 0);
    }
    handleChange(index, newVal);
  };

  return (
    <div className="mb-4">
      <p className="italic text-sm mb-2">
        Adjust the sliders to allocate percentages across age groups. The total must equal 100%. Moving one slider will auto‑adjust the others.
      </p>
      {ageGroups.map((group, index) => (
        <div key={index} className="flex items-center mb-3" style={{ paddingBottom: "12px" }}>
          <span className="w-20 text-left">{group}</span>
          <div className="flex-grow mx-4">
            <Slider
              min={0}
              max={100}
              value={Math.round(values[index])}
              onChange={(val: number) => handleChange(index, val)}
              onAfterChange={(val: number) => handleChange(index, val)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              trackStyle={{ backgroundColor: "#3182ce", height: 8 }}
              handleStyle={{
                borderColor: "#3182ce",
                height: 24,
                width: 24,
                marginLeft: -12,
                marginTop: -8,
                backgroundColor: "#fff",
              }}
              railStyle={{ backgroundColor: "#e2e8f0", height: 8 }}
            />
          </div>
          <span className="w-12 text-right font-bold">{Math.round(values[index])}%</span>
        </div>
      ))}
      {error && <p className="text-red-600 text-sm">{error}</p>}
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
      <button type="button" className="mt-2 text-sm text-blue-600 underline">
        Edit Field
      </button>
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
      <button type="button" className="mt-2 text-sm text-blue-600 underline">
        Edit Field
      </button>
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
      <button type="button" className="mt-2 text-sm text-blue-600 underline">
        Edit Field
      </button>
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

export default function AudienceTargetingStep() {
  const router = useRouter();
  const { data, updateData } = useWizard();
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  const initialValues: AudienceValues = {
    location: data.audience.location || [],
    ageDistribution: {
      age1824: data.audience.ageDistribution?.age1824 ?? 20,
      age2534: data.audience.ageDistribution?.age2534 ?? 25,
      age3544: data.audience.ageDistribution?.age3544 ?? 20,
      age4554: data.audience.ageDistribution?.age4554 ?? 15,
      age5564: data.audience.ageDistribution?.age5564 ?? 10,
      age65plus: data.audience.ageDistribution?.age65plus ?? 10,
    },
    gender: data.audience.gender || [],
    otherGender: data.audience.otherGender || "",
    screeningQuestions: data.audience.screeningQuestions || [],
    languages: data.audience.languages || [],
    educationLevel: data.audience.educationLevel || "",
    jobTitles: data.audience.jobTitles || "",
    incomeLevel: data.audience.incomeLevel || "",
    competitors: data.audience.competitors || [],
  };

  const handleSubmit = async (
    values: AudienceValues,
    actions: FormikHelpers<AudienceValues>
  ) => {
    try {
      // Get campaign ID from context or URL
      const campaignId = data.campaignId; // Assuming you have this in your wizard context

      // Save to database
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Failed to save campaign data');
      }

      // Update local state
      updateData("audience", values);
      
      // Proceed to next step
      router.push("/campaigns/wizard/step-4");
    } catch (error) {
      console.error('Error saving campaign data:', error);
      actions.setStatus({ error: 'Failed to save campaign data. Please try again.' });
    } finally {
      actions.setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={AudienceSchema}
      onSubmit={handleSubmit}
    >
      {({ setFieldValue, isValid, isSubmitting, submitForm, values }) => (
        <>
          <div className="max-w-4xl mx-auto p-4 pb-32">
            <Header currentStep={3} totalSteps={5} />
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold">Step 3: Audience Targeting</h1>
              <button className="px-4 py-2 border border-gray-400 rounded hover:bg-gray-100">
                Save as Draft
              </button>
            </div>
            <Form className="space-y-8">
              {/* DEMOGRAPHICS SECTION */}
              <div>
                <h2 className="text-xl font-bold mb-2">Demographics</h2>
                <LocationSelector
                  selectedLocations={values.location}
                  onChange={(locs) => setFieldValue("location", locs)}
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
                  onChange={(newVals) =>
                    setFieldValue("ageDistribution", {
                      age1824: Math.round(newVals[0]),
                      age2534: Math.round(newVals[1]),
                      age3544: Math.round(newVals[2]),
                      age4554: Math.round(newVals[3]),
                      age5564: Math.round(newVals[4]),
                      age65plus: Math.round(newVals[5]),
                    })
                  }
                />
                <ErrorMessage
                  name="ageDistribution"
                  component="div"
                  className="text-red-600 text-sm"
                />
                <GenderSelection
                  selected={values.gender}
                  otherGender={values.otherGender}
                  onChange={(genders) => setFieldValue("gender", genders)}
                  onOtherChange={(val) => setFieldValue("otherGender", val)}
                />
              </div>

              {/* SCREENING QUESTIONS SECTION */}
              <div>
                <h2 className="text-xl font-bold mb-2">Screening Questions</h2>
                <ScreeningQuestions
                  selectedTags={values.screeningQuestions}
                  onChange={(tags) => setFieldValue("screeningQuestions", tags)}
                />
              </div>

              {/* LANGUAGES SECTION */}
              <div>
                <h2 className="text-xl font-bold mb-2">Languages</h2>
                <LanguagesSelector
                  selected={values.languages}
                  onChange={(langs) => setFieldValue("languages", langs)}
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
                  onChange={(companies) => setFieldValue("competitors", companies)}
                />
              </div>
            </Form>
          </div>

          {/* Fixed Bottom Navigation Bar using ProgressBar */}
          <ProgressBar
            currentStep={3}
            onStepClick={(step) => router.push(`/campaigns/wizard/step-${step}`)}
            onBack={() => router.push("/campaigns/wizard/step-2")}
            onNext={submitForm}
            disableNext={!isValid || isSubmitting}
            data-cy="next-button"
          />
        </>
      )}
    </Formik>
  );
}
