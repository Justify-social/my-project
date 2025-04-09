'use client';

import React, { useState, useEffect } from 'react';
import { useCampaignWizardContext } from '@/components/features/campaigns/CampaignWizardContext';
import { DatePicker } from '@/components/ui/date-picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

/**
 * BasicInfo props interface
 */
interface BasicInfoProps {
  onNext?: () => void;
  onBack?: () => void;
}

/**
 * Campaign Basic Information Step
 * 
 * First step in the campaign creation wizard that collects
 * the essential information about the campaign.
 */
const BasicInfo: React.FC<BasicInfoProps> = ({ onNext, onBack }) => {
  // Destructure correct properties, including saveAsDraft
  const { overviewData, updateFormData, saveAsDraft } = useCampaignWizardContext();

  // Local state for form fields, using overviewData
  const [name, setName] = useState(overviewData?.name || '');
  const [description, setDescription] = useState(overviewData?.description || '');
  // Budget might be stored differently, adjust access if needed
  const [budget, setBudget] = useState(overviewData?.budget?.toString() || '0');
  // Dates need careful handling (string vs Date)
  const [startDate, setStartDate] = useState<Date | null>(overviewData?.startDate ? new Date(overviewData.startDate) : null);
  const [endDate, setEndDate] = useState<Date | null>(overviewData?.endDate ? new Date(overviewData.endDate) : null);

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sync local state with context data (using overviewData)
  useEffect(() => {
    if (overviewData) {
      setName(overviewData.name || '');
      setDescription(overviewData.description || '');
      setBudget(overviewData.budget?.toString() || '0');
      // Ensure dates are Date objects or null
      setStartDate(overviewData.startDate ? new Date(overviewData.startDate) : null);
      setEndDate(overviewData.endDate ? new Date(overviewData.endDate) : null);
    }
  }, [overviewData]);

  /**
   * Validate the form fields
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Name validation
    if (!name.trim()) {
      newErrors.name = 'Campaign name is required';
    }

    // Budget validation
    const budgetValue = parseFloat(budget);
    if (isNaN(budgetValue) || budgetValue <= 0) {
      newErrors.budget = 'Budget must be a positive number';
    }

    // Date validation
    if (!startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (startDate && endDate && startDate > endDate) {
      newErrors.endDate = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      // Update form data in context using updateFormData
      updateFormData({
        name,
        description,
        budget: parseFloat(budget),
        // Convert Dates back to string format if needed by the hook/API
        startDate: startDate ? startDate.toISOString() : undefined,
        endDate: endDate ? endDate.toISOString() : undefined
      });

      // Call saveAsDraft here if submitting should also save
      // Or rely on the dedicated Save Draft button
      // await saveAsDraft(); 

      // Move to next step
      if (onNext) {
        onNext();
      }
    }
  };

  // Fix onChange handlers to use updateFormData or local state setters correctly
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    updateFormData({ name: value }); // Update context directly
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setDescription(value);
    updateFormData({ description: value }); // Update context directly
  };

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBudget(value);
    // Update context, ensuring it's a number
    const budgetValue = parseFloat(value);
    if (!isNaN(budgetValue)) {
      updateFormData({ budget: budgetValue });
    }
  };

  const handleStartDateChange = (date: Date | null) => {
    setStartDate(date);
    updateFormData({ startDate: date ? date.toISOString() : undefined });
  };

  const handleEndDateChange = (date: Date | null) => {
    setEndDate(date);
    updateFormData({ endDate: date ? date.toISOString() : undefined });
  };

  return (
    <div className="space-y-6 p-4 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 font-sora text-gray-900">Campaign Basic Information</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Campaign Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1 font-work-sans">
            Campaign Name <span className="text-red-500">*</span>
          </label>
          <Input
            id="name"
            value={name}
            onChange={handleNameChange}
            placeholder="Enter campaign name"
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1 font-work-sans">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={handleDescriptionChange}
            rows={3}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#00BFFF] focus:ring-[#00BFFF] font-work-sans"
            placeholder="Enter campaign description"
          />
        </div>

        {/* Budget */}
        <div>
          <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1 font-work-sans">
            Budget <span className="text-red-500">*</span>
          </label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm font-work-sans">$</span>
            </div>
            <Input
              id="budget"
              type="number"
              min="0"
              step="0.01"
              value={budget}
              onChange={handleBudgetChange}
              className="pl-7"
              placeholder="0.00"
            />
          </div>
          {errors.budget && <p className="text-red-500 text-xs mt-1">{errors.budget}</p>}
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1 font-work-sans">
              Start Date <span className="text-red-500">*</span>
            </label>
            <DatePicker
              id="startDate"
              value={startDate}
              onChange={handleStartDateChange}
              placeholder="Select start date"
            />
            {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>}
          </div>

          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1 font-work-sans">
              End Date
            </label>
            <DatePicker
              id="endDate"
              value={endDate}
              onChange={handleEndDateChange}
              placeholder="Select end date"
              minDate={startDate || undefined}
            />
            {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={!onBack}
            className="w-24"
          >
            Back
          </Button>

          <div>
            <Button
              type="button"
              variant="outline"
              onClick={saveAsDraft}
              className="mr-2"
            >
              Save Draft
            </Button>

            <Button
              type="submit"
              className="w-24"
            >
              Next
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BasicInfo; 