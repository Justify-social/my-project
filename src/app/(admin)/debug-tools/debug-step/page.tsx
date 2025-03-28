"use client";

import React, { useState, useEffect } from 'react';
import ValidationResult from '../../../../lib/data-mapping/validation';
import { useRouter, useSearchParams } from 'next/navigation';

type ValidationStatus = 'present' | 'missing' | 'error';

interface FieldValidation {
  value: any;
  status: ValidationStatus;
  error?: string;
}

interface StepValidation {
  status: 'complete' | 'incomplete';
  fields: Record<string, FieldValidation>;
}

interface ValidationResult {
  id: number;
  step1: StepValidation;
  step2: StepValidation;
  step3: StepValidation;
  step4: StepValidation;
}

export default function DebugStep() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [campaignId, setCampaignId] = useState<string>(searchParams.get('id') || '');
  const [step, setStep] = useState<number>(parseInt(searchParams.get('step') || '1'));
  const [results, setResults] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const validateCampaign = async () => {
    if (!campaignId) {
      setError('Please enter a campaign ID');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/debug-tools/validate-campaign?id=${campaignId}`);

      if (!response.ok) {
        throw new Error(`Error validating campaign: ${response.statusText}`);
      }

      const data = await response.json();
      setResults(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
      console.error('Debug error:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigateToCampaignForm = () => {
    if (!campaignId) {
      setError('Please enter a campaign ID');
      return;
    }
    router.push(`/campaigns/wizard/step-${step}?id=${campaignId}`);
  };

  useEffect(() => {
    if (campaignId) {
      validateCampaign();
    }
  }, [campaignId]);

  const getStatusColor = (status: ValidationStatus) => {
    switch (status) {
      case 'present':return 'text-green-600';
      case 'missing':return 'text-yellow-600';
      case 'error':return 'text-red-600';
      default:return 'text-[var(--secondary-color)]';
    }
  };

  const renderStepDetail = (stepData: StepValidation, stepNumber: number) => {
    return (
      <div className="bg-[var(--background-color)] rounded-lg border border-[var(--divider-color)] p-6 shadow-sm font-work-sans">
        <div className="flex justify-between mb-4 font-work-sans">
          <h2 className="text-xl font-semibold text-[var(--primary-color)] font-sora">
            Step {stepNumber} {stepData.status === 'complete' ? '✅' : '❓'}
          </h2>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          stepData.status === 'complete' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'} font-work-sans`
          }>
            {stepData.status}
          </span>
        </div>
        
        <div className="space-y-4 font-work-sans">
          {Object.entries(stepData.fields).map(([fieldName, validation], index) =>
          <div key={index} className="border-b border-[var(--divider-color)] pb-3 font-work-sans">
              <div className="flex justify-between items-start font-work-sans">
                <div className="font-work-sans">
                  <p className="font-medium text-[var(--primary-color)] font-work-sans">{fieldName}</p>
                  <span className={`text-sm ${getStatusColor(validation.status)} font-work-sans`}>
                    {validation.status}
                    {validation.error && <span className="ml-2 text-red-500 font-work-sans">Error: {validation.error}</span>}
                  </span>
                </div>
                <div className="text-right font-work-sans">
                  {typeof validation.value === 'object' && validation.value !== null ?
                <button
                  onClick={() => alert(JSON.stringify(validation.value, null, 2))}
                  className="text-[var(--accent-color)] hover:underline text-xs font-work-sans">

                      View
                    </button> :

                <span className="text-sm text-[var(--secondary-color)] font-work-sans">
                      {validation.value === null ? 'null' :
                  validation.value === undefined ? 'undefined' :
                  typeof validation.value === 'boolean' ? validation.value.toString() :
                  validation.value}
                    </span>
                }
                </div>
              </div>
            </div>
          )}
        </div>
      </div>);

  };

  return (
    <div className="container mx-auto p-6 max-w-5xl font-work-sans">
      <h1 className="text-3xl font-bold mb-6 text-[var(--primary-color)] font-sora">Campaign Wizard Step Debug</h1>
      
      <div className="bg-[var(--background-color)] rounded-lg border border-[var(--divider-color)] p-6 mb-6 shadow-sm font-work-sans">
        <div className="flex gap-4 mb-6 font-work-sans">
          <input
            type="text"
            value={campaignId}
            onChange={(e) => setCampaignId(e.target.value)}
            placeholder="Enter Campaign ID"
            className="flex-grow p-2 border border-[var(--divider-color)] rounded-md focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)] font-work-sans" />

          <select
            value={step}
            onChange={(e) => setStep(parseInt(e.target.value))}
            className="p-2 border border-[var(--divider-color)] rounded-md focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)] font-work-sans">

            <option value={1}>Step 1 (Details)</option>
            <option value={2}>Step 2 (Objectives)</option>
            <option value={3}>Step 3 (Audience)</option>
            <option value={4}>Step 4 (Assets)</option>
          </select>
          <button
            onClick={validateCampaign}
            disabled={loading}
            className="px-4 py-2 bg-[var(--accent-color)] text-white rounded-md hover:bg-[var(--accent-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] focus:ring-offset-2 disabled:opacity-50 font-work-sans">

            {loading ? 'Loading...' : 'Validate'}
          </button>
        </div>
        
        <button
          onClick={navigateToCampaignForm}
          className="px-4 py-2 bg-gray-100 text-[var(--primary-color)] rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] focus:ring-offset-2 font-work-sans">

          Go to Step {step}
        </button>
        
        {error &&
        <div className="mb-4 mt-4 p-3 bg-red-50 text-red-600 border border-red-200 rounded-md font-work-sans">
            {error}
          </div>
        }
      </div>
      
      {results &&
      <div className="space-y-6 font-work-sans">
          {step === 1 && renderStepDetail(results.step1, 1)}
          {step === 2 && renderStepDetail(results.step2, 2)}
          {step === 3 && renderStepDetail(results.step3, 3)}
          {step === 4 && renderStepDetail(results.step4, 4)}
        </div>
      }
    </div>);

}