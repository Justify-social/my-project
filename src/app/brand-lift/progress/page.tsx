"use client";

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// Create a separate component for the content that uses useSearchParams
const ProgressContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const campaignId = searchParams.get('id');
  
  // State for campaign data
  const [campaignData, setCampaignData] = useState({
    name: 'Senior Travellers',
    date: '21 Jul 2024',
    description: 'Detailed and Ongoing Evaluation of Brand Awareness, Perception, and Audience Engagement Metrics to Assess Overall Impact',
    status: 'in-progress',
    completionCount: 143,
    targetCount: 300,
    metrics: {
      awareness: '+10%',
      perception: '+5%',
      impact: '+15%'
    }
  });
  
  // In a real app, this would fetch data from an API
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (!campaignId) {
      router.push('/brand-lift');
      return;
    }
    
    // Here you would fetch the actual campaign data
    // Simulate API call with setTimeout
    setLoading(true);
    const fetchData = async () => {
      try {
        // Replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 500));
        // Keep using the mock data for now
        setLoading(false);
      } catch (error) {
        console.error('Error fetching campaign data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [campaignId, router]);
  
  const handleRefreshData = async () => {
    setLoading(true);
    try {
      // Simulate data refresh
      await new Promise(resolve => setTimeout(resolve, 800));
      setLoading(false);
    } catch (error) {
      console.error('Error refreshing data:', error);
      setLoading(false);
    }
  };
  
  const handleReturnToDashboard = () => {
    router.push('/brand-lift');
  };
  
  // Calculate progress percentage
  const progressPercentage = Math.floor((campaignData.completionCount / campaignData.targetCount) * 100);
  
  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <div className="p-8 mb-6">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--primary-color)' }}>Brand Lift Progress</h1>
        <div className="flex items-center mt-2">
          <span style={{ color: 'var(--secondary-color)' }} className="mr-4">{campaignData.name}</span>
          <span style={{ color: 'var(--secondary-color)', opacity: 0.8 }}>{campaignData.date}</span>
        </div>
      </div>
      
      {/* Main Card */}
      <div style={{ backgroundColor: 'var(--background-color)' }} className="rounded-lg shadow-sm mx-8 p-8 max-w-4xl">
        {/* Study Info */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold" style={{ color: 'var(--primary-color)' }}>Brand Lift Study In Progress</h2>
          <p style={{ color: 'var(--secondary-color)' }} className="mt-1">{campaignData.description}</p>
        </div>
        
        {/* Study Status */}
        <div className="mb-8">
          <p style={{ color: 'var(--secondary-color)' }} className="mb-4">your brand lift study is now live, we're collecting responses...</p>
          
          {/* Completion Summary */}
          <div style={{ backgroundColor: '#f9fafb' }} className="rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <span className="font-medium" style={{ color: 'var(--primary-color)' }}>Completion Summary</span>
              <div className="flex items-center">
                <span style={{ color: 'var(--accent-color)' }} className="font-medium">{campaignData.completionCount}</span>
                <span style={{ color: 'var(--secondary-color)' }} className="ml-1">of {campaignData.targetCount}</span>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full rounded-full h-2 mb-6" style={{ backgroundColor: 'var(--divider-color)' }}>
              <div 
                className="rounded-full h-2" 
                style={{ 
                  backgroundColor: 'var(--accent-color)',
                  width: `${progressPercentage}%` 
                }}
              ></div>
            </div>
            
            {/* Metrics */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span style={{ color: 'var(--secondary-color)' }}>interim brand awareness lift</span>
                <span style={{ color: '#10b981' }} className="font-medium">{campaignData.metrics.awareness}</span>
              </div>
              <div className="flex justify-between items-center">
                <span style={{ color: 'var(--secondary-color)' }}>interim brand perception</span>
                <span style={{ color: '#10b981' }} className="font-medium">{campaignData.metrics.perception}</span>
              </div>
              <div className="flex justify-between items-center">
                <span style={{ color: 'var(--secondary-color)' }}>interim overall impact</span>
                <span style={{ color: '#10b981' }} className="font-medium">{campaignData.metrics.impact}</span>
              </div>
            </div>
            
            {/* Note */}
            <div className="mt-6 p-3 rounded text-sm" style={{ backgroundColor: '#f1f5f9', color: 'var(--secondary-color)' }}>
              full results become stable once target completes are reached.
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={handleRefreshData}
            disabled={loading}
            className="px-6 py-3 text-white rounded-lg transition-colors disabled:opacity-70"
            style={{ backgroundColor: '#4b5563', color: 'white' }}
          >
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </button>
          <button 
            onClick={handleReturnToDashboard}
            className="px-6 py-3 text-white rounded-lg transition-colors"
            style={{ backgroundColor: 'var(--accent-color)' }}
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

// Main page component with Suspense boundary
export default function BrandLiftProgressPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen w-full p-8" style={{ backgroundColor: '#f9fafb' }}>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--primary-color)' }}>Loading Progress...</h1>
        </div>
      }
    >
      <ProgressContent />
    </Suspense>
  );
}
