"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import { Card } from '@/components/ui/card';

interface Campaign {
  id: number;
  campaignName: string;
  platform: string;
  startDate: string;
  endDate: string;
  totalBudget: number;
  primaryKPI: string;
  submissionStatus: string;
}

// MOCK API CALL: Replace this with your real API call.
const fetchCampaignData = async (): Promise<any[]> => {
  try {
    const response = await fetch("/api/campaigns");
    if (!response.ok) throw new Error("Failed to fetch campaigns");
    return await response.json();
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return []; // Return an empty array on error.
  }
};

export default function BrandLiftPage() {
  const [selectedCampaign, setSelectedCampaign] = useState<string>("");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');

  const features = [
    {
      title: 'Create New Survey',
      description: 'Design and launch a new brand lift survey',
      href: '/brand-lift/survey-design',
      icon: '📝'
    },
    {
      title: 'Active Campaigns',
      description: 'View and manage your ongoing brand lift studies',
      href: '/brand-lift/list',
      icon: '📊'
    },
    {
      title: 'Reports',
      description: 'Access detailed brand lift measurement reports',
      href: '/brand-lift/reports',
      icon: '📈'
    },
    {
      title: 'Survey Progress',
      description: 'Track the progress of your active surveys',
      href: '/brand-lift/progress',
      icon: '🎯'
    }
  ];

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await fetch('/api/campaigns', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Fetched campaigns:', data); // Debug log
        
        if (data.success && Array.isArray(data.campaigns)) {
          // Only include submitted campaigns
          const submittedCampaigns = data.campaigns.filter(
            (campaign: Campaign) => campaign.submissionStatus === 'submitted'
          );
          setCampaigns(submittedCampaigns);
        } else {
          setCampaigns([]);
        }
      } catch (error) {
        console.error('Error fetching campaigns:', error);
        setError(error instanceof Error ? error.message : 'Failed to load campaigns');
        setCampaigns([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  const handleCampaignSelection = (campaignId: string) => {
    const selected = campaigns.find((campaign) => campaign.id.toString() === campaignId);
    if (selected) {
      setSelectedCampaign(campaignId);
    }
  };

  const handleStartTest = () => {
    if (!selectedCampaign) {
      alert("Please select a campaign first!");
      return;
    }
    router.push(`/brand-lift/selected-campaign?campaignId=${selectedCampaign}`);
  };

  if (loading) return <div>Loading campaigns...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Brand Lift Measurement</h1>
        <p className="mt-2 text-gray-600">
          Measure the impact of your campaigns on brand awareness, consideration, and preference
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature) => (
          <Link href={feature.href} key={feature.title}>
            <Card className="p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer h-full">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-12 bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold mb-4">Quick Stats</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-blue-600 text-lg font-semibold">Active Surveys</div>
            <div className="text-3xl font-bold mt-2">3</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-green-600 text-lg font-semibold">Completed Studies</div>
            <div className="text-3xl font-bold mt-2">12</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-purple-600 text-lg font-semibold">Average Lift</div>
            <div className="text-3xl font-bold mt-2">+24%</div>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">Recent Activity</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="divide-y divide-gray-200">
            {[
              {
                action: 'Survey Completed',
                campaign: 'Q4 Brand Awareness Campaign',
                date: '2 hours ago',
                status: 'success'
              },
              {
                action: 'New Survey Started',
                campaign: 'Product Launch Campaign',
                date: '1 day ago',
                status: 'info'
              },
              {
                action: 'Report Generated',
                campaign: 'Holiday Marketing Campaign',
                date: '2 days ago',
                status: 'success'
              }
            ].map((activity, index) => (
              <div key={index} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{activity.action}</p>
                    <p className="text-sm text-gray-600">{activity.campaign}</p>
                  </div>
                  <span className="text-sm text-gray-500">{activity.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
