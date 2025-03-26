'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icons';
import { CustomTabs, CustomTabList, CustomTab, CustomTabPanels, CustomTabPanel } from '@/components/ui/custom-tabs';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import JustifyScoreDisplay from '@/components/Influencers/metrics/JustifyScoreDisplay';
import { mockInfluencerService } from '@/services/influencer/mock-service';
import { Influencer } from '@/types/influencer';
import { formatFollowerCount } from '@/lib/utils';

export default function InfluencerProfile() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  
  const [influencer, setInfluencer] = useState<Influencer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [justifyScoreBreakdown, setJustifyScoreBreakdown] = useState<any>(null);
  const [justifyScoreHistory, setJustifyScoreHistory] = useState<any>(null);
  
  // Load influencer data
  const loadInfluencer = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await mockInfluencerService.getInfluencerById(id);
      const scoreBreakdown = await mockInfluencerService.getJustifyScoreBreakdown(id);
      const scoreHistory = await mockInfluencerService.getJustifyScoreHistory(id);
      
      setInfluencer(data);
      setJustifyScoreBreakdown(scoreBreakdown);
      setJustifyScoreHistory(scoreHistory);
    } catch (err: any) {
      console.error('Error loading influencer:', err);
      setError(err.message || 'Failed to load influencer data');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (id) {
      loadInfluencer();
    }
  }, [id]);
  
  const formatFollowers = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M followers`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K followers`;
    }
    return `${count} followers`;
  };
  
  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Gold':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Silver':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'Bronze':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };
  
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'Instagram':
        return 'faInstagram';
      case 'YouTube':
        return 'faYoutube';
      case 'TikTok':
        return 'faTiktok';
      case 'Twitter':
        return 'faTwitter';
      case 'Facebook':
        return 'faFacebook';
      default:
        return 'faGlobe';
    }
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Loading influencer profile...</p>
        </div>
      </div>
    );
  }
  
  if (error || !influencer) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <Icon name="faCircleExclamation" className="text-red-500 text-4xl mb-4" />
          <h1 className="text-2xl font-bold mb-2">Error Loading Profile</h1>
          <p className="text-gray-600 mb-6">{error || 'Influencer not found'}</p>
          <Button onClick={() => router.push('/influencer-marketplace')}>
            <Icon name="faArrowLeft" className="mr-2" />
            Back to Marketplace
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="outline"
        onClick={() => router.push('/influencer-marketplace')}
        className="mb-6"
      >
        <Icon name="faArrowLeft" className="mr-2" />
        Back to Marketplace
      </Button>
      
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="md:w-1/3">
          <div className="relative w-full aspect-square rounded-lg overflow-hidden">
            <Image
              src={influencer.avatar}
              alt={influencer.name}
              fill
              style={{ objectFit: 'cover' }}
              priority
            />
          </div>
        </div>
        
        <div className="md:w-2/3">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-1">{influencer.name}</h1>
              <p className="text-gray-600 text-lg mb-4">{influencer.username}</p>
            </div>
            
            <JustifyScoreDisplay
              score={influencer.justifyMetrics.justifyScore}
              size="large"
              showLabel
            />
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="outline" className={getTierColor(influencer.tier)}>
              {influencer.tier} Tier
            </Badge>
            
            <Badge variant="outline" className="bg-gray-100 text-gray-800 flex items-center gap-1">
              <Icon name={getPlatformIcon(influencer.platform)} size="sm" />
              {influencer.platform}
            </Badge>
            
            <Badge variant="outline" className="bg-blue-50 text-blue-700 flex items-center gap-1">
              <Icon name="faUsers" size="sm" />
              {formatFollowers(influencer.followers)}
            </Badge>
            
            <Badge 
              variant="outline" 
              className={`flex items-center gap-1 ${
                influencer.safetyMetrics.riskScore < 10
                  ? 'bg-green-50 text-green-700'
                  : influencer.safetyMetrics.riskScore < 30
                    ? 'bg-yellow-50 text-yellow-700'
                    : 'bg-red-50 text-red-700'
              }`}
            >
              <Icon name="faShieldCheck" size="sm" />
              Risk: {influencer.safetyMetrics.riskScore}/100
            </Badge>
          </div>
          
          <p className="text-gray-700 mb-6">{influencer.bio}</p>
          
          <div className="flex gap-3">
            <Button>
              <Icon name="faEnvelope" className="mr-2" />
              Contact
            </Button>
            
            <Button variant="outline">
              <Icon name="faSave" className="mr-2" />
              Save Profile
            </Button>
            
            <Button variant="outline">
              <Icon name="faShare" className="mr-2" />
              Share
            </Button>
          </div>
        </div>
      </div>
      
      {/* Detailed Information Tabs */}
      <CustomTabs className="mb-8">
        <CustomTabList>
          <CustomTab>Overview</CustomTab>
          <CustomTab>Justify Metrics</CustomTab>
          <CustomTab>Audience Demographics</CustomTab>
          <CustomTab>Brand Safety</CustomTab>
        </CustomTabList>
        
        <CustomTabPanels>
          {/* Overview Tab */}
          <CustomTabPanel>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-5">
                <h3 className="text-lg font-bold mb-4 flex items-center">
                  <Icon name="faChartLine" className="mr-2 text-blue-600" />
                  Performance Summary
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Engagement Rate</p>
                    <p className="text-xl font-bold">{influencer.audienceMetrics.engagement.rate.toFixed(1)}%</p>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Avg. Likes</p>
                    <p className="text-xl font-bold">{formatFollowerCount(influencer.audienceMetrics.engagement.averageLikes)}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Avg. Comments</p>
                    <p className="text-xl font-bold">{formatFollowerCount(influencer.audienceMetrics.engagement.averageComments)}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Avg. Shares</p>
                    <p className="text-xl font-bold">{formatFollowerCount(influencer.audienceMetrics.engagement.averageShares)}</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-5">
                <h3 className="text-lg font-bold mb-4 flex items-center">
                  <Icon name="faUsers" className="mr-2 text-blue-600" />
                  Audience Overview
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Top Locations</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(influencer.audienceMetrics.demographics.topLocations).map(([location, percentage]) => (
                        <Badge key={location} variant="outline" className="bg-gray-50">
                          {location}: {percentage}%
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Gender Distribution</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(influencer.audienceMetrics.demographics.genderSplit).map(([gender, percentage]) => (
                        <Badge key={gender} variant="outline" className="bg-gray-50">
                          {gender}: {percentage}%
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </CustomTabPanel>
          
          {/* Justify Metrics Tab */}
          <CustomTabPanel>
            <Card className="p-5 mb-6">
              <h3 className="text-lg font-bold mb-4">Justify Score Breakdown</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex justify-center mb-6">
                    <JustifyScoreDisplay
                      score={influencer.justifyMetrics.justifyScore}
                      size="large"
                      showLabel
                    />
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">
                    The Justify Score is our proprietary rating system that evaluates influencers based on multiple factors including audience quality, content performance, and brand safety.
                  </p>
                </div>
                
                <div className="space-y-3">
                  {Object.entries(influencer.justifyMetrics.scoreComponents).map(([key, value]) => {
                    const label = key.replace(/([A-Z])/g, ' $1').trim();
                    return (
                      <div key={key} className="flex items-center">
                        <span className="text-sm w-1/2">{label}</span>
                        <div className="w-1/2 bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-blue-600 h-2.5 rounded-full" 
                            style={{ width: `${value}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-sm font-medium">{value}/100</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
            
            <Card className="p-5">
              <h3 className="text-lg font-bold mb-4">Historical Score Trend</h3>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Score history visualization would go here</p>
              </div>
              <div className="mt-4 grid grid-cols-5 gap-2">
                {influencer.justifyMetrics.historicalScoreTrend.map((item, index) => (
                  <div key={index} className="text-center">
                    <p className="text-xs text-gray-600">{new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                    <p className="font-medium">{item.score}</p>
                  </div>
                ))}
              </div>
            </Card>
          </CustomTabPanel>
          
          {/* Audience Demographics Tab */}
          <CustomTabPanel>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-5">
                <h3 className="text-lg font-bold mb-4">Age Distribution</h3>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Age distribution chart would go here</p>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {Object.entries(influencer.audienceMetrics.demographics.ageRanges).map(([range, percentage]) => (
                    <div key={range} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                      <span>{range}</span>
                      <span className="font-medium">{percentage}%</span>
                    </div>
                  ))}
                </div>
              </Card>
              
              <Card className="p-5">
                <h3 className="text-lg font-bold mb-4">Geographic Distribution</h3>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Location map would go here</p>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {Object.entries(influencer.audienceMetrics.demographics.topLocations).map(([location, percentage]) => (
                    <div key={location} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                      <span>{location}</span>
                      <span className="font-medium">{percentage}%</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </CustomTabPanel>
          
          {/* Brand Safety Tab */}
          <CustomTabPanel>
            <Card className="p-5 mb-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold">Safety Assessment</h3>
                <Badge 
                  variant="outline" 
                  className={
                    influencer.safetyMetrics.complianceStatus === 'compliant'
                      ? 'bg-green-50 text-green-700'
                      : influencer.safetyMetrics.complianceStatus === 'warning'
                        ? 'bg-yellow-50 text-yellow-700'
                        : 'bg-red-50 text-red-700'
                  }
                >
                  {influencer.safetyMetrics.complianceStatus}
                </Badge>
              </div>
              
              <div className="flex items-center mb-4">
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className={`h-4 rounded-full ${
                      influencer.safetyMetrics.riskScore < 10
                        ? 'bg-green-500'
                        : influencer.safetyMetrics.riskScore < 30
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                    }`}
                    style={{ width: `${influencer.safetyMetrics.riskScore}%` }}
                  ></div>
                </div>
                <span className="ml-3 text-sm font-medium">Risk Score: {influencer.safetyMetrics.riskScore}/100</span>
              </div>
              
              <p className="text-sm mb-4">
                Last assessed on {new Date(influencer.safetyMetrics.lastAssessmentDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Flagged Content</span>
                    <Badge variant="outline" className="bg-gray-100">
                      {influencer.safetyMetrics.contentModeration.flaggedContent ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600">Content that violates platform policies or brand safety guidelines</p>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Content Warnings</span>
                    <Badge 
                      variant="outline" 
                      className={
                        influencer.safetyMetrics.contentModeration.contentWarnings === 0
                          ? 'bg-green-50 text-green-700'
                          : influencer.safetyMetrics.contentModeration.contentWarnings < 3
                            ? 'bg-yellow-50 text-yellow-700'
                            : 'bg-red-50 text-red-700'
                      }
                    >
                      {influencer.safetyMetrics.contentModeration.contentWarnings}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600">Number of content warnings received from platforms</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-5">
              <h3 className="text-lg font-bold mb-4">Safety Recommendations</h3>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <Icon name="faCircleCheck" className="text-green-500 mt-1 mr-3" />
                  <div>
                    <p className="font-medium">Appropriate for Most Brands</p>
                    <p className="text-sm text-gray-600">
                      This influencer maintains a safe environment and follows platform guidelines.
                    </p>
                  </div>
                </div>
                
                {influencer.safetyMetrics.riskScore > 5 && (
                  <div className="flex items-start">
                    <Icon name="faCircleInfo" className="text-blue-500 mt-1 mr-3" />
                    <div>
                      <p className="font-medium">Consider Content Review</p>
                      <p className="text-sm text-gray-600">
                        While generally safe, we recommend reviewing recent content before partnering.
                      </p>
                    </div>
                  </div>
                )}
                
                {influencer.safetyMetrics.contentModeration.contentWarnings > 0 && (
                  <div className="flex items-start">
                    <Icon name="faTriangleExclamation" className="text-yellow-500 mt-1 mr-3" />
                    <div>
                      <p className="font-medium">Monitor For Compliance</p>
                      <p className="text-sm text-gray-600">
                        This influencer has received content warnings. Include clear guidelines in contracts.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </CustomTabPanel>
        </CustomTabPanels>
      </CustomTabs>
      
      {/* Campaign Actions */}
      <Card className="p-5">
        <h3 className="text-lg font-bold mb-4">Start a Campaign with {influencer.name}</h3>
        
        <div className="flex flex-col md:flex-row gap-4">
          <Button className="flex-1">
            <Icon name="faFileContract" className="mr-2" />
            Request Proposal
          </Button>
          
          <Button variant="outline" className="flex-1">
            <Icon name="faMessage" className="mr-2" />
            Direct Message
          </Button>
          
          <Button variant="secondary" className="flex-1">
            <Icon name="faFolder" className="mr-2" />
            Add to Campaign
          </Button>
        </div>
      </Card>
    </div>
  );
} 