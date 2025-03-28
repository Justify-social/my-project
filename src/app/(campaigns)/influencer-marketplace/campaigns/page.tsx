'use client';

import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../../../../components/ui/spinner-examples';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icons';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Tabs, TabList, Tab, TabPanel } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { mockInfluencerService } from '@/services/influencer/mock-service';
import { InfluencerCampaign, CampaignStatus } from '@/types/influencer';

export default function CampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<InfluencerCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | ''>('');
  const [currentTab, setCurrentTab] = useState<CampaignStatus | 'all'>('all');

  // Load campaigns on initial render
  useEffect(() => {
    loadCampaigns();
  }, [currentTab]);

  // Load campaigns with status filter if active tab is changed
  const loadCampaigns = async () => {
    setLoading(true);
    setError(null);

    try {
      // Only apply status filter when a specific tab is selected
      const status = currentTab !== 'all' ? currentTab : undefined;
      const data = await mockInfluencerService.getCampaigns({ 
        status, 
        searchQuery: searchQuery.trim() || undefined 
      });
      setCampaigns(data);
    } catch (err: any) {
      console.error('Error loading campaigns:', err);
      setError(err.message || 'Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadCampaigns();
  };

  // Get the status badge color based on campaign status
  const getStatusBadgeColor = (status: CampaignStatus) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format date to locale string
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Influencer Campaigns</h1>
          <p className="text-gray-600">Manage your influencer marketing campaigns</p>
        </div>
        <Button onClick={() => router.push('/influencer-marketplace/campaigns/create')}>
          <Icon name="faPlus" className="mr-2" />
          Create Campaign
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-end gap-4">
          <div className="flex-1">
            <form onSubmit={handleSearch} className="flex">
              <Input
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 rounded-r-none"
              />
              <Button type="submit" className="rounded-l-none">
                <Icon name="faSearch" />
              </Button>
            </form>
          </div>
          
          <div className="w-full lg:w-1/4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <Select
              value={statusFilter}
              onChange={(value) => setStatusFilter(value as CampaignStatus | '')}
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'draft', label: 'Draft' },
                { value: 'pending', label: 'Pending' },
                { value: 'active', label: 'Active' },
                { value: 'completed', label: 'Completed' },
                { value: 'canceled', label: 'Canceled' }
              ]}
            />
          </div>
          
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('');
              loadCampaigns();
            }}
          >
            <Icon name="faFilterSlash" className="mr-2" />
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Tabs for campaign status */}
      <Tabs 
        defaultTab="all" 
        onChange={(tab) => setCurrentTab(tab as CampaignStatus | 'all')}
        className="mb-6"
      >
        <TabList className="mb-4">
          <Tab id="all">All</Tab>
          <Tab id="draft">Draft</Tab>
          <Tab id="pending">Pending</Tab>
          <Tab id="active">Active</Tab>
          <Tab id="completed">Completed</Tab>
        </TabList>
        
        <TabPanel id="all" className="mt-0">
          {renderCampaignList(campaigns)}
        </TabPanel>
        
        <TabPanel id="draft" className="mt-0">
          {renderCampaignList(campaigns)}
        </TabPanel>
        
        <TabPanel id="pending" className="mt-0">
          {renderCampaignList(campaigns)}
        </TabPanel>
        
        <TabPanel id="active" className="mt-0">
          {renderCampaignList(campaigns)}
        </TabPanel>
        
        <TabPanel id="completed" className="mt-0">
          {renderCampaignList(campaigns)}
        </TabPanel>
      </Tabs>
    </div>
  );

  // Helper function to render campaign list
  function renderCampaignList(campaignList: InfluencerCampaign[]) {
    if (loading) {
      return (
        <div className="text-center py-20">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Loading campaigns...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-10">
          <Icon name="faCircleExclamation" className="text-5xl text-red-500 mb-4" />
          <h3 className="text-xl font-bold mb-2">Error Loading Campaigns</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={loadCampaigns}>
            <Icon name="faRotate" className="mr-2" />
            Retry
          </Button>
        </div>
      );
    }

    if (campaignList.length === 0) {
      return (
        <div className="text-center py-20">
          <Icon name="faFile" className="text-5xl text-gray-400 mb-4" />
          <h3 className="text-xl font-bold mb-2">No Campaigns Found</h3>
          <p className="text-gray-600 mb-6">
            {searchQuery || statusFilter 
              ? "No campaigns match your search criteria."
              : "You don't have any campaigns yet."}
          </p>
          <Button onClick={() => router.push('/influencer-marketplace/campaigns/create')}>
            <Icon name="faPlus" className="mr-2" />
            Create Your First Campaign
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {campaignList.map(campaign => (
          <Card key={campaign.id} className="p-0 overflow-hidden hover:shadow-md transition-shadow">
            <div 
              className="flex flex-col md:flex-row cursor-pointer"
              onClick={() => router.push(`/influencer-marketplace/campaigns/${campaign.id}`)}
            >
              {/* Left column with brand info */}
              <div className="bg-gray-50 p-6 md:w-1/4 flex flex-col justify-between">
                <div>
                  <div className="w-16 h-16 bg-white rounded p-2 mb-4 flex items-center justify-center">
                    <img 
                      src={campaign.brand.logo} 
                      alt={campaign.brand.name} 
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <h3 className="font-bold text-lg mb-1">{campaign.brand.name}</h3>
                  <Badge className={getStatusBadgeColor(campaign.status)}>
                    {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                  </Badge>
                </div>
                
                <div className="mt-4 text-sm">
                  <p className="text-gray-500">Created: {formatDate(campaign.createdAt)}</p>
                </div>
              </div>
              
              {/* Right column with campaign details */}
              <div className="p-6 md:w-3/4">
                <div className="flex flex-col md:flex-row justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold mb-1">{campaign.name}</h2>
                    <p className="text-gray-600 text-sm">
                      {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
                    </p>
                  </div>
                  <div className="mt-2 md:mt-0">
                    <span className="text-lg font-bold text-gray-900">
                      ${campaign.budget.toLocaleString()}
                    </span>
                    <span className="text-gray-500 text-sm ml-1">budget</span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Campaign Objective</h4>
                  <p className="text-gray-900">{campaign.objectives.primary}</p>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center">
                    <Icon name="faUsers" size="sm" className="mr-1" />
                    {campaign.influencers.length} Influencers
                  </div>
                  
                  <div className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm flex items-center">
                    <Icon name="faImage" size="sm" className="mr-1" />
                    {campaign.contentRequirements.length} Deliverables
                  </div>
                  
                  {campaign.objectives.kpis.slice(0, 2).map((kpi, index) => (
                    <div key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                      {kpi}
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-end">
                  <Button variant="outline" size="sm" className="text-sm">
                    <Icon name="faEye" className="mr-1" size="sm" />
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }
} 