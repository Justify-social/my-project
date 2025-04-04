'use client';

import { Icon } from '@/components/ui/atoms/icon';
import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './index';
import { Button } from '@/components/ui/atoms/button/Button';
import { Badge } from '@/components/ui/atoms/badge/badge';

interface Campaign {
  id: number;
  campaignName: string;
  status: string;
  startDate: string;
  platform: string;
  budget?: number;
}

interface UpcomingCampaignsCardProps {
  campaigns?: Campaign[];
  loading?: boolean;
  error?: string;
  onViewAll?: () => void;
}

/**
 * UpcomingCampaignsCard Component
 * 
 * Displays a list of upcoming campaigns in a card format
 */
const UpcomingCampaignsCard: React.FC<UpcomingCampaignsCardProps> = ({
  campaigns = [],
  loading = false,
  error = '',
  onViewAll
}) => {
  // Format date to readable format
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch (error) {
      return dateString;
    }
  };

  // Get appropriate badge style based on status
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string, icon: string }> = {
      'draft': { color: 'bg-gray-100 text-gray-800', icon: 'faPencilLight' },
      'active': { color: 'bg-green-100 text-green-800', icon: 'faCircleCheckLight' },
      'paused': { color: 'bg-yellow-100 text-yellow-800', icon: 'faPauseLight' },
      'completed': { color: 'bg-blue-100 text-blue-800', icon: 'faCheckLight' },
      'error': { color: 'bg-red-100 text-red-800', icon: 'faXmarkLight' }
    };

    const lowercaseStatus = status.toLowerCase();
    const config = statusMap[lowercaseStatus] || { color: 'bg-gray-100 text-gray-800', icon: 'faInfoLight' };
    
    return (
      <Badge variant="outline" className={`${config.color} inline-flex items-center px-2 py-1 rounded-full text-xs font-medium`}>
        <Icon iconId={config.icon} size="xs" className="mr-1"/>
        {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
      </Badge>
    );
  };

  // Display loading skeleton
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Campaigns</CardTitle>
          <CardDescription>Your scheduled marketing campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="animate-pulse flex items-center justify-between pb-4 border-b">
                <div>
                  <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="h-5 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <div className="h-9 bg-gray-200 rounded w-24 animate-pulse"></div>
        </CardFooter>
      </Card>
    );
  }

  // Display error message
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Campaigns</CardTitle>
          <CardDescription>Your scheduled marketing campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 text-center bg-red-50 rounded-lg border border-red-100">
            <Icon iconId="faXmarkCircleLight" className="text-red-500 mb-2 h-10 w-10"/>
            <p className="text-red-800">{error}</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={onViewAll} variant="outline">
            <Icon iconId="faRefreshLight" size="sm" className="mr-2"/>
            Try Again
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // No campaigns to display
  if (campaigns.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Campaigns</CardTitle>
          <CardDescription>Your scheduled marketing campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-6 text-center bg-gray-50 rounded-lg border border-gray-100">
            <Icon iconId="faCalendarLight" className="text-gray-400 mb-2 h-10 w-10"/>
            <p className="text-gray-600">No upcoming campaigns</p>
            <Button variant="outline" size="sm" className="mt-3">
              <Icon iconId="faPlusLight" size="xs" className="mr-1"/>
              Create Campaign
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={onViewAll} variant="outline">
            View All Campaigns
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Display campaigns
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Campaigns</CardTitle>
        <CardDescription>Your scheduled marketing campaigns</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="flex items-center justify-between pb-4 border-b last:border-0 last:pb-0">
              <div>
                <h4 className="font-medium text-gray-900 mb-1">{campaign.campaignName}</h4>
                <div className="flex items-center text-sm text-gray-500">
                  <Icon iconId="faCalendarLight" size="xs" className="mr-1"/>
                  <span>{formatDate(campaign.startDate)}</span>
                  {campaign.platform && (
                    <>
                      <span className="mx-2">•</span>
                      <Icon 
                        iconId={
                          campaign.platform.toLowerCase() === 'instagram' ? 'brandsInstagram' : 
                          campaign.platform.toLowerCase() === 'tiktok' ? 'brandsTiktok' : 
                          campaign.platform.toLowerCase() === 'youtube' ? 'brandsYoutube' :
                          campaign.platform.toLowerCase() === 'twitter' ? 'brandsXTwitter' :
                          campaign.platform.toLowerCase() === 'linkedin' ? 'brandsLinkedin' :
                          campaign.platform.toLowerCase() === 'facebook' ? 'brandsFacebook' : 
                          'faGlobeLight'
                        } 
                        size="xs" 
                        className="mr-1"
                      />
                      <span>{campaign.platform}</span>
                    </>
                  )}
                  {campaign.budget && (
                    <>
                      <span className="mx-2">•</span>
                      <Icon iconId="faDollarSignLight" size="xs" className="mr-1"/>
                      <span>${campaign.budget.toLocaleString()}</span>
                    </>
                  )}
                </div>
              </div>
              {getStatusBadge(campaign.status)}
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={onViewAll} variant="outline">
          <Icon iconId="faListLight" size="sm" className="mr-2"/>
          View All Campaigns
        </Button>
      </CardFooter>
    </Card>
  );
};

export default UpcomingCampaignsCard; 