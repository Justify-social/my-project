// Updated import paths via tree-shake script - 2025-04-01T17:13:32.195Z
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Icon } from '@/components/ui/icon/icon';
import { WizardSkeleton } from '@/components/ui';
import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary';
import ErrorFallback from '@/components/features/core/error-handling/ErrorFallback';
import { EnumTransformers } from '@/utils/enum-transformers';
import { useFormContext, useFieldArray, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import ProgressBar from '@/components/features/campaigns/ProgressBar';
import { toast } from 'react-hot-toast';
import { useWizard } from '@/components/features/campaigns/WizardContext';
// import { Campaign } from '@prisma/client'; // Prisma types might not be needed directly here

function SubmissionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const campaignId = searchParams?.get('id');
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCampaign = async () => {
      if (!campaignId) {
        setError('No campaign ID provided');
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`/api/campaigns?id=${campaignId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch campaign: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        console.log('API Response:', data);
        let campaignData;
        if (data.campaign) {
          campaignData = data.campaign;
        } else if (data.data) {
          campaignData = data.data;
        } else {
          campaignData = data;
        }

        // Transform enum values from backend format to frontend format for display
        const transformedCampaign = EnumTransformers.transformObjectFromBackend(campaignData);
        console.log('Transformed campaign data:', transformedCampaign);
        setCampaign(transformedCampaign);
      } catch (err) {
        console.error('Error fetching campaign:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchCampaign();
  }, [campaignId]);

  if (loading) {
    return (
      <WizardSkeleton
        step={5}
        stepContent={
          <div className="space-y-6 font-body">
            <div className="bg-white rounded-lg shadow p-6 text-center animate-pulse font-body">
              <div className="mx-auto w-20 h-20 bg-gray-200 rounded-full mb-6 font-body"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto mb-6 font-body"></div>
              <div className="flex justify-center items-center mb-6 space-x-4 font-body">
                <div className="h-6 bg-gray-200 rounded-full w-24 font-body"></div>
                <div className="h-6 bg-gray-200 rounded-full w-6 font-body"></div>
                <div className="h-6 bg-gray-200 rounded-full w-24 font-body"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto font-body"></div>
            </div>

            <div className="mb-8 font-body">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-6 font-body"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-body">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg shadow p-6 animate-pulse font-body"
                  >
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-4 font-body"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-3 font-body"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-3 font-body"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-6 font-body"></div>
                    <div className="flex justify-end font-body">
                      <div className="h-5 bg-gray-200 rounded w-20 font-body"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center font-body">
              <div className="h-8 bg-gray-200 rounded w-32 font-body"></div>
              <div className="h-8 bg-gray-200 rounded w-32 font-body"></div>
            </div>
          </div>
        }
      />
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-8 min-h-screen font-body">
        <div className="bg-red-50 p-6 rounded-lg border border-red-200 font-body">
          <h3 className="text-red-800 font-medium text-lg font-heading">Error Loading Campaign</h3>
          <p className="text-red-600 mt-2 font-body">{error}</p>
          <button
            onClick={() => router.push('/campaigns')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center font-body"
          >
            <Icon iconId="faChevronLeftLight" className="w-4 h-4 mr-2" />
            Return to Campaigns
          </button>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-8 min-h-screen font-body">
        <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200 font-body">
          <h3 className="text-yellow-800 font-medium text-lg font-heading">Campaign Data Missing</h3>
          <p className="text-yellow-700 mt-2 font-body">
            Unable to load campaign data. The API response did not contain the expected campaign
            information.
          </p>
          <button
            onClick={() => router.push('/campaigns')}
            className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 flex items-center font-body"
          >
            <Icon iconId="faChevronLeftLight" className="w-4 h-4 mr-2" />
            Return to Campaigns
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 bg-white min-h-screen font-body">
      {/* Success Message - Simplified */}
      <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm mb-12 text-center font-body">
        <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6 font-body">
          <Icon iconId="faCheckLight" className="h-12 w-12 text-[var(--accent-color)] font-body" />
        </div>

        <h2 className="text-2xl font-bold text-[var(--primary-color)] mb-3 font-['Sora'] font-heading">
          Campaign successfully submitted!
        </h2>

        {/* Add campaign status badge */}
        <div className="flex justify-center items-center mb-6 font-body">
          <div className="flex items-center bg-red-50 text-red-800 px-4 py-2 rounded-full text-sm font-medium line-through mr-2 font-body">
            DRAFT
          </div>
          <div className="text-[var(--secondary-color)] mx-2 font-body">→</div>
          <div className="flex items-center bg-green-50 text-green-800 px-4 py-2 rounded-full text-sm font-medium font-body">
            APPROVED
          </div>
        </div>

        <p className="text-[var(--secondary-color)] font-['Work Sans'] font-body">
          Your campaign has been submitted and approved. It will become active based on your
          scheduled start date.
        </p>
      </div>

      {/* Next Steps */}
      <div className="mb-12 font-body">
        <h3 className="text-xl font-semibold text-[var(--primary-color)] mb-6 font-['Sora'] font-heading">
          Next Steps:
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-body">
          {/* Set Up Brand Lift Study */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-[var(--divider-color)] flex flex-col h-full font-body">
            <div className="flex-1 font-body">
              <h3 className="font-semibold text-[var(--primary-color)] text-lg mb-2 font-['Sora'] font-heading">
                Set Up Brand Lift Study
              </h3>
              <p className="text-[var(--secondary-color)] text-sm mb-6 font-['Work Sans'] font-body">
                Measure how your campaign impacts brand awareness and consumer behavior with a Brand
                Lift Study.
              </p>
            </div>
            <Link
              href="/brand-lift"
              className="flex items-center justify-end text-[var(--accent-color)] hover:text-blue-800 mt-2 text-sm font-medium font-body"
            >
              <span className="font-body">Set Up</span>
              <Icon iconId="faChevronRightLight" className="h-4 w-4 ml-1" />
            </Link>
          </div>

          {/* Start Creative Asset Testing */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-[var(--divider-color)] flex flex-col h-full font-body">
            <div className="flex-1 font-body">
              <h3 className="font-semibold text-[var(--primary-color)] text-lg mb-2 font-['Sora'] font-heading">
                Start Creative Asset Testing
              </h3>
              <p className="text-[var(--secondary-color)] text-sm mb-6 font-['Work Sans'] font-body">
                Test your creative assets to see how they perform and resonate with your audience.
              </p>
            </div>
            <Link
              href="/creative-testing"
              className="flex items-center justify-end text-[var(--accent-color)] hover:text-blue-800 mt-2 text-sm font-medium font-body"
            >
              <span className="font-body">Start Testing</span>
              <Icon iconId="faChevronRightLight" className="h-4 w-4 ml-1" />
            </Link>
          </div>

          {/* View Campaign Dashboard */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-[var(--divider-color)] flex flex-col h-full font-body">
            <div className="flex-1 font-body">
              <h3 className="font-semibold text-[var(--primary-color)] text-lg mb-2 font-['Sora'] font-heading">
                View Campaign Dashboard
              </h3>
              <p className="text-[var(--secondary-color)] text-sm mb-6 font-['Work Sans'] font-body">
                Access detailed insights and performance metrics for your campaign.
              </p>
            </div>
            <Link
              href={`/campaigns/${campaignId}`}
              className="flex items-center justify-end text-[var(--accent-color)] hover:text-blue-800 mt-2 text-sm font-medium font-body"
            >
              <span className="font-body">View Campaign</span>
              <Icon iconId="faChevronRightLight" className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center font-body">
        <button
          onClick={() => router.push('/campaigns')}
          className="flex items-center text-[var(--secondary-color)] hover:text-[var(--primary-color)] font-medium font-['Work Sans'] font-body"
        >
          <Icon iconId="faChevronLeftLight" className="w-4 h-4 mr-2" />
          Back to Campaigns
        </button>

        <button
          onClick={() => router.push(`/campaigns/${campaignId}`)}
          className="flex items-center bg-[var(--accent-color)] text-white px-5 py-2 rounded-md hover:bg-blue-600 font-['Work Sans'] font-body"
        >
          <Icon iconId="faCircleInfoLight" className="w-5 h-5 mr-2" />
          View Full Details
        </button>
      </div>
    </div>
  );
}

export default function WrappedSubmissionContent() {
  return (
    <ErrorBoundary
      fallback={
        <ErrorFallback
          error={new Error('Error in submission form')}
          resetErrorBoundary={() => window.location.reload()}
        />
      }
    >
      <SubmissionContent />
    </ErrorBoundary>
  );
}
