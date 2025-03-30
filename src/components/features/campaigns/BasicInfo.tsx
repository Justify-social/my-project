'use client';

import React, { useState, useEffect } from 'react';
import Date from '../../../utils/date-service';
import { useWizard } from '@/src/components/features/campaigns/wizard/WizardContext';
import { DatePicker } from '@/components/ui/molecules/forms/date-picker/DatePicker'
import { Button } from '@/components/ui/atoms/button/Button'
import { Input } from '@/components/ui/atoms/input/Input'

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
  // Get context
  const { campaignData, updateCampaignData, saveDraft } = useWizard();
  
  // Local state for form fields
  const [name, setName] = useState(campaignData?.name || '');
  const [description, setDescription] = useState(campaignData?.description || '');
  const [budget, setBudget] = useState(campaignData?.budget?.toString() || '0');
  const [startDate, setStartDate] = useState<Date | null>(campaignData?.startDate || null);
  const [endDate, setEndDate] = useState<Date | null>(campaignData?.endDate || null);
  
  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Sync local state with context data
  useEffect(() => {
    if (campaignData) {
      setName(campaignData.name || '');
      setDescription(campaignData.description || '');
      setBudget(campaignData.budget?.toString() || '0');
      setStartDate(campaignData.startDate);
      setEndDate(campaignData.endDate);
    }
  }, [campaignData]);
  
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
      // Update campaign data in context
      updateCampaignData({
        name,
        description,
        budget: parseFloat(budget),
        startDate,
        endDate
      });
      
      // Save as draft
      await saveDraft();
      
      // Move to next step
      if (onNext) {
        onNext();
      }
    }
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
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter campaign name"
            error={!!errors.name}
            errorMessage={errors.name || ''}
          />
        </div>
        
        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1 font-work-sans">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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
              onChange={(e) => setBudget(e.target.value)}
              className="pl-7"
              placeholder="0.00"
              error={!!errors.budget}
              errorMessage={errors.budget || ''}
            />
          </div>
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
              onChange={setStartDate}
              placeholder="Select start date"
              error={!!errors.startDate}
              errorMessage={errors.startDate || ''}
            />
          </div>
          
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1 font-work-sans">
              End Date
            </label>
            <DatePicker
              id="endDate"
              value={endDate}
              onChange={setEndDate}
              placeholder="Select end date"
              error={!!errors.endDate}
              errorMessage={errors.endDate || ''}
              minDate={startDate || undefined}
            />
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
              onClick={saveDraft}
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