'use client';

import React, { useState } from 'react';
import HTMLInputElement from '../../ui/radio/types/index';
import { useFormSubmission } from '@/hooks/useFormSubmission';
import { transformCampaignFormData, CampaignFormValues, EnumUtils } from '@/utils/form-transformers';
import { KPI, Platform, Position, Currency } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { EnumTransformers } from '@/utils/enum-transformers';

/**
 * Example campaign wizard form demonstrating the use of 
 * form submission hooks and data transformers with proper enum handling
 */
export default function CampaignFormExample() {
  const router = useRouter();
  const [formValues, setFormValues] = useState<CampaignFormValues>({
    name: '',
    businessGoal: '',
    startDate: '',
    endDate: '',
    timeZone: 'UTC',
    primaryContact: {
      name: '',
      email: '',
      phone: '',
      position: ''
    },
    budget: {
      total: '',
      currency: 'USD' as Currency,
      allocation: [
      { category: 'Content Creation', percentage: 50 },
      { category: 'Media Spend', percentage: 50 }]

    },
    primaryKPI: 'brandAwareness',
    influencers: [
    {
      handle: '',
      platform: 'Instagram',
      name: '',
      url: '',
      posts: 0,
      videos: 0,
      reels: 0,
      stories: 0
    }]

  });

  // Setup form submission hook with data transformation
  const {
    submit,
    status,
    error,
    validationErrors
  } = useFormSubmission<CampaignFormValues>({
    endpoint: '/api/campaigns',
    method: 'POST',
    successMessage: 'Campaign created successfully!',
    transformData: (data) => {
      // First transform using the standard transformers
      const standardTransformed = transformCampaignFormData(data);

      // Then apply enum transformations
      return EnumTransformers.transformObjectToBackend(standardTransformed);
    },
    onSuccess: (response) => {
      // Navigate to next step or show success state
      if (response.data?.id) {
        router.push(`/campaigns/wizard/step-2?id=${response.data.id}`);
      }
    }
  });

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Handle nested fields with dot notation (e.g., "primaryContact.name")
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormValues((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof CampaignFormValues],
          [child]: value
        }
      }));
    } else {
      setFormValues((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting form values:', formValues);

    // Log the transformed values for debugging
    const standardTransformed = transformCampaignFormData(formValues);
    const finalTransformed = EnumTransformers.transformObjectToBackend(standardTransformed);
    console.log('Transformed values for API submission:', finalTransformed);

    await submit(formValues);
  };

  // Check if there's a validation error for a specific field
  const getFieldError = (fieldName: string) => {
    return validationErrors.find((err) => err.field === fieldName)?.message;
  };

  // Render loading state during submission
  if (status === 'submitting') {
    return (
      <div className="p-6 max-w-4xl mx-auto font-work-sans">
        <div className="flex items-center justify-center h-64 font-work-sans">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary font-work-sans"></div>
          <p className="ml-3 text-lg font-work-sans">Creating campaign...</p>
        </div>
      </div>);

  }

  return (
    <div className="p-6 max-w-4xl mx-auto font-work-sans">
      <h1 className="text-2xl font-bold mb-6 font-sora">Create New Campaign</h1>
      
      {/* Show API errors */}
      {error &&
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 font-work-sans">
          <div className="flex font-work-sans">
            <div className="flex-shrink-0 font-work-sans">
              <svg className="h-5 w-5 text-red-500 font-work-sans" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 font-work-sans">
              <h3 className="text-sm font-medium text-red-800 font-sora">Error submitting form</h3>
              <p className="text-sm text-red-700 mt-1 font-work-sans">{error.message}</p>
              {error.details &&
            <ul className="list-disc pl-5 mt-1 text-sm text-red-700 font-work-sans">
                  {Object.entries(error.details).map(([key, value]) =>
              <li key={key} className="font-work-sans">{key}: {value}</li>
              )}
                </ul>
            }
            </div>
          </div>
        </div>
      }
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Campaign Details Section */}
        <div className="bg-white shadow-sm rounded-lg p-6 font-work-sans">
          <h2 className="text-xl font-semibold mb-4 font-sora">Campaign Details</h2>
          
          <div className="space-y-4 font-work-sans">
            {/* Campaign Name */}
            <div className="font-work-sans">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 font-work-sans">
                Campaign Name*
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={formValues.name}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border ${
                getFieldError('name') ? 'border-red-300' : 'border-gray-300'} shadow-sm p-2 font-work-sans`
                }
                placeholder="Enter campaign name" />

              {getFieldError('name') &&
              <p className="mt-1 text-sm text-red-600 font-work-sans">{getFieldError('name')}</p>
              }
            </div>
            
            {/* Business Goal */}
            <div className="font-work-sans">
              <label htmlFor="businessGoal" className="block text-sm font-medium text-gray-700 font-work-sans">
                Business Goal*
              </label>
              <textarea
                name="businessGoal"
                id="businessGoal"
                value={formValues.businessGoal}
                onChange={handleChange}
                rows={3}
                className={`mt-1 block w-full rounded-md border ${
                getFieldError('businessGoal') ? 'border-red-300' : 'border-gray-300'} shadow-sm p-2 font-work-sans`
                }
                placeholder="Describe your business goal" />

              {getFieldError('businessGoal') &&
              <p className="mt-1 text-sm text-red-600 font-work-sans">{getFieldError('businessGoal')}</p>
              }
            </div>
            
            {/* Start and End Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-work-sans">
              <div className="font-work-sans">
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 font-work-sans">
                  Start Date*
                </label>
                <input
                  type="date"
                  name="startDate"
                  id="startDate"
                  value={formValues.startDate}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 font-work-sans" />

                {getFieldError('startDate') &&
                <p className="mt-1 text-sm text-red-600 font-work-sans">{getFieldError('startDate')}</p>
                }
              </div>
              
              <div className="font-work-sans">
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 font-work-sans">
                  End Date*
                </label>
                <input
                  type="date"
                  name="endDate"
                  id="endDate"
                  value={formValues.endDate}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 font-work-sans" />

                {getFieldError('endDate') &&
                <p className="mt-1 text-sm text-red-600 font-work-sans">{getFieldError('endDate')}</p>
                }
              </div>
            </div>
            
            {/* Primary KPI */}
            <div className="font-work-sans">
              <label htmlFor="primaryKPI" className="block text-sm font-medium text-gray-700 font-work-sans">
                Primary KPI
              </label>
              <select
                name="primaryKPI"
                id="primaryKPI"
                value={formValues.primaryKPI}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 font-work-sans">

                <option value="">Select a KPI</option>
                {EnumUtils.KPI.options().map((option) =>
                <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                )}
              </select>
            </div>
          </div>
        </div>
        
        {/* Primary Contact Section */}
        <div className="bg-white shadow-sm rounded-lg p-6 font-work-sans">
          <h2 className="text-xl font-semibold mb-4 font-sora">Primary Contact</h2>
          
          <div className="space-y-4 font-work-sans">
            {/* Contact Name */}
            <div className="font-work-sans">
              <label htmlFor="primaryContact.name" className="block text-sm font-medium text-gray-700 font-work-sans">
                Contact Name*
              </label>
              <input
                type="text"
                name="primaryContact.name"
                id="primaryContact.name"
                value={formValues.primaryContact?.name || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 font-work-sans"
                placeholder="Full name" />

            </div>
            
            {/* Contact Email */}
            <div className="font-work-sans">
              <label htmlFor="primaryContact.email" className="block text-sm font-medium text-gray-700 font-work-sans">
                Email*
              </label>
              <input
                type="email"
                name="primaryContact.email"
                id="primaryContact.email"
                value={formValues.primaryContact?.email || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 font-work-sans"
                placeholder="email@example.com" />

            </div>
            
            {/* Contact Phone */}
            <div className="font-work-sans">
              <label htmlFor="primaryContact.phone" className="block text-sm font-medium text-gray-700 font-work-sans">
                Phone
              </label>
              <input
                type="tel"
                name="primaryContact.phone"
                id="primaryContact.phone"
                value={formValues.primaryContact?.phone || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 font-work-sans"
                placeholder="+1 (555) 123-4567" />

            </div>
            
            {/* Contact Position */}
            <div className="font-work-sans">
              <label htmlFor="primaryContact.position" className="block text-sm font-medium text-gray-700 font-work-sans">
                Position
              </label>
              <select
                name="primaryContact.position"
                id="primaryContact.position"
                value={formValues.primaryContact?.position || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 font-work-sans">

                <option value="">Select position</option>
                {EnumUtils.Position.options().map((option) =>
                <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                )}
              </select>
            </div>
          </div>
        </div>
        
        {/* Budget Section */}
        <div className="bg-white shadow-sm rounded-lg p-6 font-work-sans">
          <h2 className="text-xl font-semibold mb-4 font-sora">Budget</h2>
          
          <div className="space-y-4 font-work-sans">
            {/* Total Budget */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-work-sans">
              <div className="font-work-sans">
                <label htmlFor="budget.total" className="block text-sm font-medium text-gray-700 font-work-sans">
                  Total Budget*
                </label>
                <input
                  type="number"
                  name="budget.total"
                  id="budget.total"
                  value={formValues.budget?.total || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 font-work-sans"
                  placeholder="Enter amount"
                  min="0"
                  step="1" />

              </div>
              
              <div className="font-work-sans">
                <label htmlFor="budget.currency" className="block text-sm font-medium text-gray-700 font-work-sans">
                  Currency
                </label>
                <select
                  name="budget.currency"
                  id="budget.currency"
                  value={formValues.budget?.currency || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 font-work-sans">

                  {EnumUtils.Currency.options().map((option) =>
                  <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  )}
                </select>
              </div>
            </div>
          </div>
        </div>
        
        {/* Platform & Influencer */}
        <div className="bg-white shadow-sm rounded-lg p-6 font-work-sans">
          <h2 className="text-xl font-semibold mb-4 font-sora">Platform & Influencer</h2>
          
          <div className="space-y-4 font-work-sans">
            {/* Platform */}
            <div className="font-work-sans">
              <label htmlFor="influencers[0].platform" className="block text-sm font-medium text-gray-700 font-work-sans">
                Platform
              </label>
              <select
                name="influencers[0].platform"
                id="influencers[0].platform"
                value={formValues.influencers?.[0]?.platform || ''}
                onChange={(e) => {
                  const platform = e.target.value as Platform;
                  setFormValues((prev) => ({
                    ...prev,
                    influencers: [
                    {
                      ...(prev.influencers?.[0] || {}),
                      platform
                    }]

                  }));
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 font-work-sans">

                {EnumUtils.Platform.options().map((option) =>
                <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                )}
              </select>
            </div>
            
            {/* Influencer Handle */}
            <div className="font-work-sans">
              <label htmlFor="influencers[0].handle" className="block text-sm font-medium text-gray-700 font-work-sans">
                Influencer Handle*
              </label>
              <div className="mt-1 flex rounded-md shadow-sm font-work-sans">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 font-work-sans">
                  @
                </span>
                <input
                  type="text"
                  name="influencers[0].handle"
                  id="influencers[0].handle"
                  value={formValues.influencers?.[0]?.handle || ''}
                  onChange={(e) => {
                    const handle = e.target.value;
                    setFormValues((prev) => ({
                      ...prev,
                      influencers: [
                      {
                        ...(prev.influencers?.[0] || {}),
                        handle
                      }]

                    }));
                  }}
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border-gray-300 font-work-sans"
                  placeholder="username" />

              </div>
            </div>
          </div>
        </div>
        
        {/* Submit Button */}
        <div className="flex justify-end font-work-sans">
          <button
            type="submit"
            disabled={status === 'submitting'}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 font-work-sans">

            {status === 'submitting' ? 'Creating...' : 'Create Campaign'}
          </button>
        </div>
      </form>
    </div>);

}