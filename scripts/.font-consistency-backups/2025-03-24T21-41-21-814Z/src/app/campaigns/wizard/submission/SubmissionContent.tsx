"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Icon } from "@/components/ui/icons";
import { WizardSkeleton } from "@/components/ui/loading-skeleton";
import { ErrorBoundary } from "@/components/ErrorBoundary/ErrorBoundary";
import ErrorFallback from '@/components/ErrorFallback';
import { EnumTransformers } from '@/utils/enum-transformers';

function SubmissionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const campaignId = searchParams.get('id');
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
        console.log("API Response:", data);
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
        console.log("Transformed campaign data:", transformedCampaign);
        setCampaign(transformedCampaign);
      } catch (err) {
        console.error("Error fetching campaign:", err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchCampaign();
  }, [campaignId]);

  if (loading) {
    return <WizardSkeleton step={5} stepContent={
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6 text-center animate-pulse">
          <div className="mx-auto w-20 h-20 bg-gray-200 rounded-full mb-6"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto mb-6"></div>
          <div className="flex justify-center items-center mb-6 space-x-4">
            <div className="h-6 bg-gray-200 rounded-full w-24"></div>
            <div className="h-6 bg-gray-200 rounded-full w-6"></div>
            <div className="h-6 bg-gray-200 rounded-full w-24"></div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
        </div>
        
        <div className="mb-8">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
                <div className="flex justify-end">
                  <div className="h-5 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-200 rounded w-32"></div>
          <div className="h-8 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    } />;
  }

  if (error) {
    return <div className="w-full max-w-7xl mx-auto px-4 py-8 min-h-screen">
        <div className="bg-red-50 p-6 rounded-lg border border-red-200">
          <h3 className="text-red-800 font-medium text-lg">Error Loading Campaign</h3>
          <p className="text-red-600 mt-2">{error}</p>
          <button onClick={() => router.push('/campaigns')} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center">

            <Icon name="faChevronLeft" className="w-4 h-4 mr-2" solid={false} />
            Return to Campaigns
          </button>
        </div>
      </div>;
  }

  if (!campaign) {
    return <div className="w-full max-w-7xl mx-auto px-4 py-8 min-h-screen">
        <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
          <h3 className="text-yellow-800 font-medium text-lg">Campaign Data Missing</h3>
          <p className="text-yellow-700 mt-2">
            Unable to load campaign data. The API response did not contain the expected campaign information.
          </p>
          <button onClick={() => router.push('/campaigns')} className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 flex items-center">

            <Icon name="faChevronLeft" className="w-4 h-4 mr-2" solid={false} />
            Return to Campaigns
          </button>
        </div>
      </div>;
  }

  return <div className="w-full max-w-7xl mx-auto px-4 py-8 bg-white min-h-screen">
      {/* Success Message - Simplified */}
      <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm mb-12 text-center">
        <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
          <Icon name="faCheck" className="h-12 w-12 text-[#00BFFF]" solid={false} />
        </div>
        
        <h2 className="text-2xl font-bold text-[#333333] mb-3 font-['Sora']">
          Campaign successfully submitted!
        </h2>
        
        {/* Add campaign status badge */}
        <div className="flex justify-center items-center mb-6">
          <div className="flex items-center bg-red-50 text-red-800 px-4 py-2 rounded-full text-sm font-medium line-through mr-2">
            DRAFT
          </div>
          <div className="text-[#4A5568] mx-2">→</div>
          <div className="flex items-center bg-green-50 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
            APPROVED
          </div>
        </div>
        
        <p className="text-[#4A5568] font-['Work Sans']">
          Your campaign has been submitted and approved. It will become active based on your scheduled start date.
        </p>
      </div>

      {/* Next Steps */}
      <div className="mb-12">
        <h3 className="text-xl font-semibold text-[#333333] mb-6 font-['Sora']">Next Steps:</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Set Up Brand Lift Study */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-[#D1D5DB] flex flex-col h-full">
            <div className="flex-1">
              <h3 className="font-semibold text-[#333333] text-lg mb-2 font-['Sora']">Set Up Brand Lift Study</h3>
              <p className="text-[#4A5568] text-sm mb-6 font-['Work Sans']">
                Measure how your campaign impacts brand awareness and consumer behavior with a Brand Lift Study.
              </p>
            </div>
            <Link href="/brand-lift" className="flex items-center justify-end text-[#00BFFF] hover:text-blue-800 mt-2 text-sm font-medium">

              <span>Set Up</span>
              <Icon name="faChevronRight" className="h-4 w-4 ml-1" solid={false} />
            </Link>
          </div>
          
          {/* Start Creative Asset Testing */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-[#D1D5DB] flex flex-col h-full">
            <div className="flex-1">
              <h3 className="font-semibold text-[#333333] text-lg mb-2 font-['Sora']">Start Creative Asset Testing</h3>
              <p className="text-[#4A5568] text-sm mb-6 font-['Work Sans']">
                Test your creative assets to see how they perform and resonate with your audience.
              </p>
            </div>
            <Link href="/creative-testing" className="flex items-center justify-end text-[#00BFFF] hover:text-blue-800 mt-2 text-sm font-medium">

              <span>Start Testing</span>
              <Icon name="faChevronRight" className="h-4 w-4 ml-1" solid={false} />
            </Link>
          </div>
          
          {/* View Campaign Dashboard */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-[#D1D5DB] flex flex-col h-full">
            <div className="flex-1">
              <h3 className="font-semibold text-[#333333] text-lg mb-2 font-['Sora']">View Campaign Dashboard</h3>
              <p className="text-[#4A5568] text-sm mb-6 font-['Work Sans']">
                Access detailed insights and performance metrics for your campaign.
              </p>
            </div>
            <Link href={`/campaigns/${campaignId}`} className="flex items-center justify-end text-[#00BFFF] hover:text-blue-800 mt-2 text-sm font-medium">

              <span>View Campaign</span>
              <Icon name="faChevronRight" className="h-4 w-4 ml-1" solid={false} />
            </Link>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <button onClick={() => router.push('/campaigns')} className="flex items-center text-[#4A5568] hover:text-[#333333] font-medium font-['Work Sans']">

          <Icon name="faChevronLeft" className="w-4 h-4 mr-2" solid={false} />
          Back to Campaigns
        </button>

        <button onClick={() => router.push(`/campaigns/${campaignId}`)} className="flex items-center bg-[#00BFFF] text-white px-5 py-2 rounded-md hover:bg-blue-600 font-['Work Sans']">

          <Icon name="faInfo" className="w-5 h-5 mr-2" solid={false} />
          View Full Details
        </button>
      </div>
    </div>;
}

export default function WrappedSubmissionContent() {
  return <ErrorBoundary fallback={<ErrorFallback />}>
      <SubmissionContent />
    </ErrorBoundary>;
}