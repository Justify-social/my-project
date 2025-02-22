"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircleIcon, ArrowLeftIcon, DocumentTextIcon } from '@heroicons/react/24/solid';

export default function CampaignSubmissionPage() {
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
        const response = await fetch(`/api/campaigns/${campaignId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch campaign');
        }

        setCampaign(data.campaign);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [campaignId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading submission details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 p-6 rounded-lg">
          <h3 className="text-red-800 font-medium">Error</h3>
          <p className="text-red-600 mt-2">{error}</p>
          <button
            onClick={() => router.push('/campaigns')}
            className="mt-4 text-red-700 hover:text-red-600 font-medium flex items-center"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Return to Campaigns
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Success Header */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6"
          >
            <CheckCircleIcon className="w-10 h-10 text-green-500" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Campaign Successfully Submitted!
          </h1>
          <p className="text-gray-600">
            Your campaign has been submitted and is now pending review.
          </p>
        </div>

        {/* Campaign Summary */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <h2 className="text-xl font-semibold text-gray-800">Campaign Summary</h2>
            <span className="px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
              {campaign.submissionStatus}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Campaign Details</h3>
              <div className="space-y-2">
                <p><span className="text-gray-600">Name:</span> {campaign.campaignName}</p>
                <p><span className="text-gray-600">Platform:</span> {campaign.platform}</p>
                <p>
                  <span className="text-gray-600">Duration:</span>{' '}
                  {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-700 mb-2">Budget Information</h3>
              <div className="space-y-2">
                <p>
                  <span className="text-gray-600">Total Budget:</span>{' '}
                  {campaign.currency} {campaign.totalBudget?.toLocaleString()}
                </p>
                <p>
                  <span className="text-gray-600">Social Media Budget:</span>{' '}
                  {campaign.currency} {campaign.socialMediaBudget?.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="font-medium text-gray-700 mb-2">Primary Contact</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p>{campaign.primaryContact?.firstName} {campaign.primaryContact?.surname}</p>
              <p className="text-blue-600">{campaign.primaryContact?.email}</p>
              <p className="text-gray-500">{campaign.primaryContact?.position}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-6">
          <button
            onClick={() => router.push('/campaigns')}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Campaigns
          </button>

          <button
            onClick={() => router.push(`/campaigns/${campaignId}`)}
            className="flex items-center bg-blue-600 text-white px-6 py-2 rounded-lg 
                     hover:bg-blue-700 transition-colors"
          >
            <DocumentTextIcon className="w-5 h-5 mr-2" />
            View Full Details
          </button>
        </div>

        {/* Debug Information */}
        <details className="mt-8">
          <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
            Debug Information
          </summary>
          <pre className="mt-2 p-4 bg-gray-100 rounded-lg overflow-auto text-sm">
            {JSON.stringify(campaign, null, 2)}
          </pre>
        </details>
      </motion.div>
    </div>
  );
}
