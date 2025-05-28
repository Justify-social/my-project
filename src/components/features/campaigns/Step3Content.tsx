'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useWizard } from '@/components/features/campaigns/WizardContext';
import {
  Step3ValidationSchema,
  Step3FormData,
  DraftCampaignData,
} from '@/components/features/campaigns/types';
import { toast as _toast } from 'react-hot-toast';
import { WizardSkeleton } from '@/components/ui/loading-skeleton';
import { Icon as _Icon } from '@/components/ui/icon/icon';
import { Button as _Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge as _Badge } from '@/components/ui/badge';
import { RemovableBadge } from '@/components/ui/removable-badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { ProgressBarWizard } from '@/components/ui/progress-bar-wizard';
import { AgeDistributionSliderGroup } from '@/components/ui/slider-age-distribution';
import { GenderSelector } from '@/components/ui/selector-gender';
import { LanguageSelector } from '@/components/ui/selector-language';
import { showSuccessToast, showErrorToast } from '@/components/ui/toast';
import {
  RadioGroup as _RadioGroup,
  RadioGroupItem as _RadioGroupItem,
} from '@/components/ui/radio-group';
import { Alert as _Alert, AlertDescription as _AlertDescription } from '@/components/ui/alert';
import { Separator as _Separator } from '@/components/ui/separator';
import {
  Collapsible as _Collapsible,
  CollapsibleContent as _CollapsibleContent,
  CollapsibleTrigger as _CollapsibleTrigger,
} from '@/components/ui/collapsible';

// --- Mock Data (Replace with actual data fetching/static data) ---
// Updated list of top 15 languages, sorted alphabetically
const TOP_LANGUAGES = [
  { value: 'ar', label: 'Arabic' },
  { value: 'bn', label: 'Bengali' },
  { value: 'zh', label: 'Chinese (Mandarin)' },
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'hi', label: 'Hindi' },
  { value: 'id', label: 'Indonesian' }, // Often grouped with Malay
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'ru', label: 'Russian' },
  { value: 'es', label: 'Spanish' },
  { value: 'tr', label: 'Turkish' },
  { value: 'vi', label: 'Vietnamese' },
];

// --- Main Step 3 Component ---
function Step3Content() {
  const router = useRouter();
  const wizard = useWizard();

  // --- Form Setup (Hooks must be top-level) ---
  const form = useForm<Step3FormData>({
    resolver: zodResolver(Step3ValidationSchema),
    mode: 'onChange',
    defaultValues: {
      demographics: wizard.wizardState?.demographics ?? {
        age18_24: 0,
        age25_34: 0,
        age35_44: 0,
        age45_54: 0,
        age55_64: 0,
        age65plus: 0,
        genders: [],
        languages: [],
      },
      locations: wizard.wizardState?.locations ?? [],
      targeting: wizard.wizardState?.targeting ?? { interests: [], keywords: [] },
      competitors: wizard.wizardState?.competitors ?? [],
    },
  });
  const watchedValues = form.watch(); // Watch form values

  // --- State for Tag Inputs (Hooks must be top-level) ---
  const [keywordInput, setKeywordInput] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [competitorInput, setCompetitorInput] = useState('');
  const [interestInput, setInterestInput] = useState('');

  // --- Effects (Hooks must be top-level) ---
  useEffect(() => {
    if (wizard.wizardState && !form.formState.isDirty && !wizard.isLoading) {
      form.reset({
        demographics: wizard.wizardState.demographics ?? {
          age18_24: 0,
          age25_34: 0,
          age35_44: 0,
          age45_54: 0,
          age55_64: 0,
          age65plus: 0,
          genders: [],
          languages: [],
        },
        locations: wizard.wizardState.locations ?? [],
        targeting: wizard.wizardState.targeting ?? { interests: [], keywords: [] },
        competitors: wizard.wizardState.competitors ?? [],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wizard.wizardState, wizard.isLoading, form.reset, form.formState.isDirty]);

  // Navigation Handlers
  const handleStepClick = (step: number) => {
    if (wizard.campaignId && step < 4) {
      // Allow nav to completed/current
      router.push(`/campaigns/wizard/step-${step}?id=${wizard.campaignId}`);
    }
  };
  const handleBack = () => {
    if (wizard.campaignId) router.push(`/campaigns/wizard/step-2?id=${wizard.campaignId}`);
  };
  // Combined Save & Next handler
  const onSubmitAndNavigate = async () => {
    const isValid = await form.trigger();
    if (!isValid) {
      showErrorToast('Please fix the errors before proceeding.');
      return;
    }
    const data = form.getValues();
    const payload: Partial<DraftCampaignData> = {
      demographics: data.demographics,
      locations: data.locations,
      targeting: data.targeting,
      competitors: data.competitors,
      step3Complete: true,
      currentStep: 3,
    };
    // wizard.updateWizardState(payload); // Commented out immediate state update

    // Log the payload being sent when clicking Next
    console.log(
      '[Step 3] Payload prepared for onSubmitAndNavigate, sending to saveProgress:',
      payload
    );

    const saved = await wizard.saveProgress(payload); // Save Step 3 data first
    if (saved) {
      // Only navigate AFTER successful save
      form.reset(data, { keepValues: true, keepDirty: false });
      if (wizard.campaignId) {
        router.push(`/campaigns/wizard/step-4?id=${wizard.campaignId}`); // Navigate to Step 4
      } else {
        showErrorToast('Could not navigate: campaign ID not found.');
      }
    } else {
      showErrorToast('Failed to save progress before navigating.');
    }
  };

  // NEW: Handler for the manual Save button
  const handleSave = async (): Promise<boolean> => {
    console.log('[Step 3] Attempting Manual Save...');
    const isValid = await form.trigger();
    if (!isValid) {
      console.warn('[Step 3] Validation failed for manual save.');
      showErrorToast('Please fix the errors before saving.');
      return false;
    }
    const data = form.getValues();
    console.log('[Step 3] Form data is valid for manual save.', data);

    // Prepare payload, keeping currentStep as 3
    const payload: Partial<DraftCampaignData> = {
      demographics: data.demographics,
      locations: data.locations,
      targeting: data.targeting,
      competitors: data.competitors,
      step3Complete: form.formState.isValid, // Use current validation state
      currentStep: 3,
    };

    console.log('[Step 3] Payload prepared for manual save, sending to saveProgress:', payload);

    try {
      // Only call saveProgress, do not update local state or navigate
      const saveSuccess = await wizard.saveProgress(payload);

      if (saveSuccess) {
        console.log('[Step 3] Manual save successful!');
        showSuccessToast('Progress saved!');
        // Optionally reset dirty state if needed
        // form.reset(data, { keepValues: true, keepDirty: false, keepErrors: true });
        return true;
      } else {
        console.error('[Step 3] Manual save failed.');
        // saveProgress should show specific error
        return false;
      }
    } catch (error) {
      console.error('[Step 3] Error during manual save:', error);
      showErrorToast('An unexpected error occurred during save.');
      return false;
    }
  };

  // Keyword Input Handlers
  const currentKeywords = Array.isArray(watchedValues.targeting?.keywords)
    ? watchedValues.targeting.keywords
    : [];
  const handleAddKeyword = () => {
    const newKeyword = keywordInput.trim();
    if (newKeyword && !currentKeywords.includes(newKeyword)) {
      form.setValue('targeting.keywords', [...currentKeywords, newKeyword], {
        shouldValidate: true,
        shouldDirty: true,
      });
      setKeywordInput(''); // Clear input
    }
  };
  const handleRemoveKeyword = (keywordToRemove: string) => {
    form.setValue(
      'targeting.keywords',
      currentKeywords.filter(kw => kw !== keywordToRemove),
      { shouldValidate: true, shouldDirty: true }
    );
  };
  const handleKeywordInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevent form submission
      handleAddKeyword();
    }
  };

  // Location Input Handlers
  const currentLocations = Array.isArray(watchedValues.locations) ? watchedValues.locations : [];
  const handleAddLocation = () => {
    const newLocation = locationInput.trim();
    if (newLocation && !currentLocations.some(loc => loc.city === newLocation)) {
      form.setValue('locations', [...currentLocations, { city: newLocation }], {
        shouldValidate: true,
        shouldDirty: true,
      });
      setLocationInput(''); // Clear input
    }
  };
  const handleRemoveLocation = (locationCityToRemove: string) => {
    form.setValue(
      'locations',
      currentLocations.filter(loc => loc.city !== locationCityToRemove),
      { shouldValidate: true, shouldDirty: true }
    );
  };
  const handleLocationInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAddLocation();
    }
  };

  // Interest Input Handlers (New)
  const currentInterests = Array.isArray(watchedValues.targeting?.interests)
    ? watchedValues.targeting.interests
    : [];
  const handleAddInterest = () => {
    const newInterest = interestInput.trim();
    if (newInterest && !currentInterests.includes(newInterest)) {
      form.setValue('targeting.interests', [...currentInterests, newInterest], {
        shouldValidate: true,
        shouldDirty: true,
      });
      setInterestInput(''); // Clear input
    }
  };
  const handleRemoveInterest = (interestToRemove: string) => {
    form.setValue(
      'targeting.interests',
      currentInterests.filter(i => i !== interestToRemove),
      { shouldValidate: true, shouldDirty: true }
    );
  };
  const handleInterestInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevent form submission
      handleAddInterest();
    }
  };

  // Competitor Input Handlers
  const currentCompetitors = Array.isArray(watchedValues.competitors)
    ? watchedValues.competitors
    : [];
  const handleAddCompetitor = () => {
    const newCompetitor = competitorInput.trim();
    if (newCompetitor && !currentCompetitors.includes(newCompetitor)) {
      form.setValue('competitors', [...currentCompetitors, newCompetitor], {
        shouldValidate: true,
        shouldDirty: true,
      });
      setCompetitorInput(''); // Clear input
    }
  };
  const handleRemoveCompetitor = (competitorToRemove: string) => {
    form.setValue(
      'competitors',
      currentCompetitors.filter(comp => comp !== competitorToRemove),
      { shouldValidate: true, shouldDirty: true }
    );
  };
  const handleCompetitorInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAddCompetitor();
    }
  };

  // --- Render Logic (Starts after all hooks and handlers) ---
  // Loading State Check
  if (wizard.isLoading && !wizard.wizardState && wizard.campaignId) {
    // Use WizardSkeleton for step 3 loading
    return <WizardSkeleton step={3} />;
  }

  return (
    <div className="space-y-8">
      {/* Use ProgressBarWizard */}
      <ProgressBarWizard
        currentStep={3}
        steps={wizard.stepsConfig}
        onStepClick={handleStepClick}
        onBack={handleBack}
        onNext={onSubmitAndNavigate}
        isNextDisabled={!form.formState.isValid}
        isNextLoading={form.formState.isSubmitting || wizard.isLoading}
        getCurrentFormData={form.getValues}
        onSave={handleSave}
      />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmitAndNavigate)}
          className="space-y-8 pb-[var(--footer-height)]"
        >
          {/* --- Demographics Card --- */}
          <Card>
            <CardHeader>
              <CardTitle>Demographics</CardTitle>
              <CardDescription>
                Define the age distribution and gender of your target audience.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <AgeDistributionSliderGroup
                name="demographics"
                control={form.control}
                setValue={form.setValue}
              />
              {/* Wrap GenderSelector for centering */}
              <div className="flex justify-center pt-4">
                <GenderSelector
                  name="demographics.genders"
                  control={form.control}
                  label="Gender(s)"
                />
              </div>
            </CardContent>
          </Card>

          {/* --- Locations Card --- */}
          <Card>
            <CardHeader>
              <CardTitle>Locations</CardTitle>
              <CardDescription>Specify the geographic focus.</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Locations Tag Input */}
              <FormField
                control={form.control}
                name="locations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Locations</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Type a location and press Enter..."
                        value={locationInput}
                        onChange={e => setLocationInput(e.target.value)}
                        onKeyDown={handleLocationInputKeyDown}
                      />
                    </FormControl>
                    <div className="flex flex-wrap gap-2 pt-2 min-h-[2.5rem] items-center">
                      {/* Ensure field.value is treated as array & handle optional city */}
                      {(Array.isArray(field.value) ? field.value : []).map(
                        (location: { city?: string; id?: string | number }) => {
                          const city = location?.city;
                          if (!city) return null; // Skip rendering if city is missing
                          return (
                            <RemovableBadge
                              key={`${city}-${location.id}`}
                              variant="secondary"
                              size="md"
                              onRemove={() => handleRemoveLocation(city)}
                              removeAriaLabel={`Remove location ${city}`}
                            >
                              {city}
                            </RemovableBadge>
                          );
                        }
                      )}
                    </div>
                    <FormDescription>Add target countries, regions, or cities.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* --- Targeting Card --- */}
          <Card>
            <CardHeader>
              <CardTitle>Advanced Targeting</CardTitle>
              <CardDescription>
                Refine audience by language, interests, and keywords.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <LanguageSelector
                name="demographics.languages"
                control={form.control}
                label="Languages"
                options={TOP_LANGUAGES} // Use the new list
                allowMultiple={true}
                placeholder="Select target language(s)..."
              />
              {/* Remove LanguageSelector for Interests - Replaced with Tag Input */}
              {/* 
                            <LanguageSelector
                                name="targeting.interests" 
                                control={form.control}
                                label="Interests"
                                options={MOCK_INTERESTS} 
                                allowMultiple={true}
                                placeholder="Select audience interests..."
                            /> 
                            */}
              {/* --- Interest Tag Input (New) --- */}
              <FormField
                control={form.control}
                name="targeting.interests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interests</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Type an interest and press Enter..."
                        value={interestInput}
                        onChange={e => setInterestInput(e.target.value)}
                        onKeyDown={handleInterestInputKeyDown}
                      />
                    </FormControl>
                    <div className="flex flex-wrap gap-2 pt-2 min-h-[2.5rem] items-center">
                      {(Array.isArray(field.value) ? field.value : []).map((interest: string) => (
                        <RemovableBadge
                          key={interest}
                          variant="secondary"
                          size="md"
                          onRemove={() => handleRemoveInterest(interest)}
                          removeAriaLabel={`Remove interest ${interest}`}
                        >
                          {interest}
                        </RemovableBadge>
                      ))}
                    </div>
                    <FormDescription>Add relevant audience interests.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* --- End Interest Tag Input --- */}

              {/* Keywords Input */}
              <FormField
                control={form.control}
                name="targeting.keywords"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Keywords</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Type a keyword and press Enter..."
                        value={keywordInput}
                        onChange={e => setKeywordInput(e.target.value)}
                        onKeyDown={handleKeywordInputKeyDown}
                      />
                    </FormControl>
                    <div className="flex flex-wrap gap-2 pt-2 min-h-[2.5rem] items-center">
                      {/* Ensure field.value is treated as array */}
                      {(Array.isArray(field.value) ? field.value : []).map((keyword: string) => (
                        <RemovableBadge
                          key={keyword}
                          variant="secondary"
                          size="md"
                          onRemove={() => handleRemoveKeyword(keyword)}
                          removeAriaLabel={`Remove keyword ${keyword}`}
                        >
                          {keyword}
                        </RemovableBadge>
                      ))}
                    </div>
                    <FormDescription>
                      Add relevant keywords that define your target audience.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* --- Competitors Card --- */}
          <Card>
            <CardHeader>
              <CardTitle>Competitor Tracking</CardTitle>
              <CardDescription>
                List competitor handles or brand names to monitor (optional).
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Competitors Tag Input */}
              <FormField
                control={form.control}
                name="competitors"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Competitors to Monitor</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Type a competitor name/handle and press Enter..."
                        value={competitorInput}
                        onChange={e => setCompetitorInput(e.target.value)}
                        onKeyDown={handleCompetitorInputKeyDown}
                      />
                    </FormControl>
                    <div className="flex flex-wrap gap-2 pt-2 min-h-[2.5rem] items-center">
                      {(Array.isArray(field.value) ? field.value : []).map((competitor: string) => (
                        <RemovableBadge
                          key={competitor}
                          variant="secondary"
                          size="md"
                          onRemove={() => handleRemoveCompetitor(competitor)}
                          removeAriaLabel={`Remove competitor ${competitor}`}
                        >
                          {competitor}
                        </RemovableBadge>
                      ))}
                    </div>
                    <FormDescription>
                      Add competitor handles or brand names to monitor.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}

export default Step3Content;
