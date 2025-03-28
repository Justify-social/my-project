"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {  Card  } from "@/components/ui/card";
import {  Tabs, TabsList, TabsTrigger, TabsContent  } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Icon } from '@/components/ui/icons';
import { mockInfluencerService } from "@/services/influencer/mock-service";
import { InfluencerCampaign, ContentRequirement } from "@/types/influencer";
import { formatCurrency, formatDateRange, formatDate, formatFollowerCount } from "@/utils/string/utils";

export default function CampaignDetailPage() {
  const router = useRouter();
  const params = useParams();
  const campaignId = params.id as string;
  
  const [campaign, setCampaign] = useState<InfluencerCampaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchCampaignData = async () => {
      setIsLoading(true);
      try {
        const data = await mockInfluencerService.getCampaignById(campaignId);
        setCampaign(data);
      } catch (err: any) {
        console.error("Error loading campaign:", err);
        setError(err.message || "Failed to load campaign details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaignData();
  }, [campaignId]);

  // Helper functions
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'active':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'canceled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getInfluencerStatusBadge = (status: string) => {
    switch (status) {
      case 'invited':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'completed':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'post':
        return 'faImage';
      case 'story':
        return 'faCircle';
      case 'reel':
        return 'faVideo';
      case 'video':
        return 'faVideo';
      default:
        return 'faFile';
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-10 px-4 font-work-sans">
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-gray-300 border-t-blue-600 mb-4"></div>
          <p className="text-gray-600 mt-4">Loading campaign details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !campaign) {
    return (
      <div className="container mx-auto py-10 px-4 font-work-sans">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <Icon name="faCircleExclamation" className="text-red-500 text-5xl mb-4" solid={false} />
          <h2 className="text-xl font-bold text-red-800 mb-2 font-sora">
            {error || "Campaign not found"}
          </h2>
          <p className="text-red-600 mb-6">
            {!campaign
              ? "The requested campaign could not be found. It may have been deleted or you don't have access to it."
              : "We encountered an error while loading the campaign details. Please try again."}
          </p>
          <div className="flex justify-center gap-4">
            <Button onClick={() => router.push("/influencer-marketplace/campaigns")}>
              <Icon name="faArrowLeft" className="mr-2" solid={false} />
              Back to Campaigns
            </Button>
            {error && (
              <Button variant="outline" onClick={() => window.location.reload()}>
                <Icon name="faRotate" className="mr-2" solid={false} />
                Retry
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 font-work-sans">
      {/* Back navigation */}
      <div className="mb-6">
        <Link
          href="/influencer-marketplace/campaigns"
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          <Icon name="faArrowLeft" className="mr-2 w-4 h-4" solid={false} />
          Back to Campaigns
        </Link>
      </div>

      {/* Campaign Header */}
      <div className="bg-white rounded-xl border border-[var(--divider-color)] p-6 mb-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Brand logo */}
          <div className="flex-shrink-0">
            <div className="w-20 h-20 bg-gray-50 rounded-lg p-2 flex items-center justify-center border border-gray-200">
              <img
                src={campaign.brand.logo}
                alt={campaign.brand.name}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </div>
          
          {/* Campaign details */}
          <div className="flex-grow">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold font-sora mb-1">{campaign.name}</h1>
                <div className="flex items-center gap-2 text-gray-600 mb-3">
                  <Icon name="faBuilding" className="w-4 h-4" solid={false} />
                  <span>{campaign.brand.name}</span>
                </div>
              </div>
              
              <div className="flex flex-col items-start md:items-end gap-2">
                <Badge
                  className={`px-3 py-1 ${getStatusBadgeStyle(campaign.status)}`}
                >
                  {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                </Badge>
                <div className="text-gray-600 text-sm">
                  {formatDateRange(campaign.startDate, campaign.endDate)}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm text-gray-600 font-sora mb-1">Budget</div>
                <div className="text-lg font-semibold">{formatCurrency(campaign.budget)}</div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm text-gray-600 font-sora mb-1">Objective</div>
                <div className="text-lg font-semibold">{campaign.objectives.primary}</div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm text-gray-600 font-sora mb-1">Influencers</div>
                <div className="text-lg font-semibold">{campaign.influencers.length}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Campaign Tabs */}
      <Tabs 
        defaultValue="overview" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="mb-10"
      >
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="influencers">Influencers</TabsTrigger>
          <TabsTrigger value="content">Content Requirements</TabsTrigger>
          <TabsTrigger value="assets">Creative Assets</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Campaign details */}
            <Card className="p-6 col-span-1 lg:col-span-2">
              <h2 className="text-xl font-bold mb-4 font-sora">Campaign Details</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1 font-sora">Description</h3>
                  <p className="text-gray-900">{campaign.notes || "No description provided."}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-1 font-sora">Campaign Period</h3>
                    <p className="text-gray-900">{formatDateRange(campaign.startDate, campaign.endDate)}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-1 font-sora">Budget</h3>
                    <p className="text-gray-900">{formatCurrency(campaign.budget)}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-1 font-sora">Status</h3>
                    <Badge className={`${getStatusBadgeStyle(campaign.status)}`}>
                      {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                    </Badge>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-1 font-sora">Brand</h3>
                    <p className="text-gray-900">{campaign.brand.name}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-1 font-sora">Created</h3>
                    <p className="text-gray-900">{formatDate(campaign.createdAt)}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-1 font-sora">Last Updated</h3>
                    <p className="text-gray-900">{formatDate(campaign.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </Card>
            
            {/* Objectives and KPIs */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4 font-sora">Objectives & KPIs</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1 font-sora">Primary Objective</h3>
                  <p className="text-gray-900">{campaign.objectives.primary}</p>
                </div>
                
                {campaign.objectives.secondary && campaign.objectives.secondary.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-1 font-sora">Secondary Objectives</h3>
                    <div className="flex flex-wrap gap-2">
                      {campaign.objectives.secondary.map((objective, index) => (
                        <Badge key={index} variant="outline" className="bg-gray-50">
                          {objective}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1 font-sora">KPIs</h3>
                  <div className="flex flex-wrap gap-2">
                    {campaign.objectives.kpis.map((kpi, index) => (
                      <Badge key={index} variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                        {kpi}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1 font-sora">Target Audience</h3>
                  <p className="text-gray-900">{campaign.objectives.targetAudience}</p>
                </div>
              </div>
            </Card>
            
            {/* Quick Actions */}
            <Card className="p-6 col-span-1 lg:col-span-3">
              <h2 className="text-xl font-bold mb-4 font-sora">Quick Actions</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button variant="outline" className="flex-col py-6 h-auto" onClick={() => router.push(`/influencer-marketplace/campaigns/${campaignId}/edit`)}>
                  <Icon name="faEdit" className="h-6 w-6 mb-2" solid={false} />
                  <span>Edit Campaign</span>
                </Button>
                
                <Button variant="outline" className="flex-col py-6 h-auto" onClick={() => setActiveTab("influencers")}>
                  <Icon name="faUsers" className="h-6 w-6 mb-2" solid={false} />
                  <span>Manage Influencers</span>
                </Button>
                
                <Button variant="outline" className="flex-col py-6 h-auto" onClick={() => setActiveTab("content")}>
                  <Icon name="faFileLines" className="h-6 w-6 mb-2" solid={false} />
                  <span>Content Requirements</span>
                </Button>
                
                <Button variant="outline" className="flex-col py-6 h-auto" onClick={() => router.push(`/influencer-marketplace/campaigns/${campaignId}/messages`)}>
                  <Icon name="faComment" className="h-6 w-6 mb-2" solid={false} />
                  <span>Messaging</span>
                </Button>
              </div>
            </Card>
          </div>
        </TabsContent>
        
        {/* Influencers Tab */}
        <TabsContent value="influencers" className="space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold font-sora">Campaign Influencers</h2>
              <Button onClick={() => router.push(`/influencer-marketplace/campaigns/${campaignId}/influencers/add`)}>
                <Icon name="faPlus" className="mr-2 w-4 h-4" solid={false} />
                Add Influencers
              </Button>
            </div>
            
            {campaign.influencers.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed border-gray-300 rounded-lg">
                <Icon name="faUsers" className="text-gray-400 text-4xl mb-3" solid={false} />
                <h3 className="text-xl font-medium text-gray-700 mb-2 font-sora">No Influencers Added</h3>
                <p className="text-gray-600 mb-4">
                  You haven't added any influencers to this campaign yet.
                </p>
                <Button onClick={() => router.push(`/influencer-marketplace/campaigns/${campaignId}/influencers/add`)}>
                  <Icon name="faPlus" className="mr-2 w-4 h-4" solid={false} />
                  Add Influencers
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {campaign.influencers.map((item, index) => (
                  <div 
                    key={index} 
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Influencer info */}
                      <div className="flex items-center gap-3 flex-grow">
                        <Image 
                          src={item.influencer.avatar} 
                          alt={item.influencer.name} 
                          width={48} 
                          height={48} 
                          className="rounded-full object-cover" 
                        />
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {item.influencer.name}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>{item.influencer.username}</span>
                            <span className="text-gray-300">•</span>
                            <div className="flex items-center">
                              <Icon name="faUsers" className="w-3 h-3 mr-1" solid={false} />
                              {formatFollowerCount(item.influencer.followers)}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Platform and status */}
                      <div className="flex flex-wrap gap-2 md:items-center">
                        <Badge variant="outline">
                          {item.influencer.platform}
                        </Badge>
                        <Badge variant="outline" className={getInfluencerStatusBadge(item.status)}>
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </Badge>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => router.push(`/influencer-marketplace/${item.influencer.id}`)}
                        >
                          <Icon name="faEye" className="w-4 h-4" solid={false} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => router.push(`/influencer-marketplace/campaigns/${campaignId}/influencers/${item.influencer.id}`)}
                        >
                          <Icon name="faEllipsisVertical" className="w-4 h-4" solid={false} />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Deliverables */}
                    {item.deliverables && item.deliverables.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="text-sm font-medium text-gray-700 mb-2 font-sora">
                          Deliverables
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {item.deliverables.map((deliverable, idx) => {
                            const requirement = campaign.contentRequirements.find(
                              r => r.id === deliverable.contentRequirementId
                            );
                            
                            return (
                              <div key={idx} className="bg-gray-50 p-3 rounded border border-gray-200 text-sm">
                                <div className="flex justify-between items-start mb-2">
                                  <div className="flex items-center">
                                    <Icon
                                      name={getContentTypeIcon(requirement?.type || 'post')}
                                      className="w-4 h-4 mr-2 text-gray-600"
                                      solid={false}
                                    />
                                    <span className="font-medium">
                                      {requirement?.type || 'Content'}
                                    </span>
                                  </div>
                                  <Badge 
                                    className={
                                      deliverable.status === 'approved'
                                        ? 'bg-green-100 text-green-800 border-green-300'
                                        : deliverable.status === 'rejected'
                                        ? 'bg-red-100 text-red-800 border-red-300'
                                        : deliverable.status === 'submitted'
                                        ? 'bg-blue-100 text-blue-800 border-blue-300'
                                        : 'bg-gray-100 text-gray-800 border-gray-300'
                                    }
                                  >
                                    {deliverable.status.charAt(0).toUpperCase() + deliverable.status.slice(1)}
                                  </Badge>
                                </div>
                                
                                {deliverable.submissionUrl && (
                                  <div className="mb-1">
                                    <a 
                                      href={deliverable.submissionUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-800 flex items-center"
                                    >
                                      <Icon name="faExternalLink" className="w-3 h-3 mr-1" solid={false} />
                                      View Submission
                                    </a>
                                  </div>
                                )}
                                
                                {deliverable.submissionDate && (
                                  <div className="text-gray-600 text-xs">
                                    Submitted: {formatDate(deliverable.submissionDate)}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>
        
        {/* Content Requirements Tab */}
        <TabsContent value="content" className="space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold font-sora">Content Requirements</h2>
              <Button onClick={() => router.push(`/influencer-marketplace/campaigns/${campaignId}/content/edit`)}>
                <Icon name="faEdit" className="mr-2 w-4 h-4" solid={false} />
                Edit Requirements
              </Button>
            </div>
            
            {campaign.contentRequirements.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed border-gray-300 rounded-lg">
                <Icon name="faFileLines" className="text-gray-400 text-4xl mb-3" solid={false} />
                <h3 className="text-xl font-medium text-gray-700 mb-2 font-sora">No Content Requirements</h3>
                <p className="text-gray-600 mb-4">
                  You haven't defined any content requirements for this campaign yet.
                </p>
                <Button onClick={() => router.push(`/influencer-marketplace/campaigns/${campaignId}/content/edit`)}>
                  <Icon name="faPlus" className="mr-2 w-4 h-4" solid={false} />
                  Add Requirements
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {campaign.contentRequirements.map((requirement: ContentRequirement, index) => (
                  <Card key={index} className="p-5 border border-gray-200 h-full">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center">
                        <Icon
                          name={getContentTypeIcon(requirement.type)}
                          className="w-5 h-5 mr-2 text-gray-700"
                          solid={false}
                        />
                        <h3 className="font-medium font-sora">
                          {requirement.type.charAt(0).toUpperCase() + requirement.type.slice(1)}
                        </h3>
                      </div>
                      
                      {requirement.required ? (
                        <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                          Required
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-600">
                          Optional
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-gray-700 mb-4">{requirement.description}</p>
                    
                    {requirement.specs && (
                      <div className="mt-3 bg-gray-50 p-3 rounded-md border border-gray-200">
                        <h4 className="text-sm font-medium mb-2 font-sora">Specifications</h4>
                        <ul className="space-y-1 text-sm">
                          {requirement.specs.minDuration && (
                            <li className="flex items-start">
                              <Icon name="faClock" className="w-4 h-4 mr-2 text-gray-600 mt-0.5" solid={false} />
                              <span>
                                Min Duration: {requirement.specs.minDuration} seconds
                              </span>
                            </li>
                          )}
                          
                          {requirement.specs.maxDuration && (
                            <li className="flex items-start">
                              <Icon name="faClock" className="w-4 h-4 mr-2 text-gray-600 mt-0.5" solid={false} />
                              <span>
                                Max Duration: {requirement.specs.maxDuration} seconds
                              </span>
                            </li>
                          )}
                          
                          {requirement.specs.orientation && (
                            <li className="flex items-start">
                              <Icon name="faDisplay" className="w-4 h-4 mr-2 text-gray-600 mt-0.5" solid={false} />
                              <span>
                                Orientation: {requirement.specs.orientation.charAt(0).toUpperCase() + requirement.specs.orientation.slice(1)}
                              </span>
                            </li>
                          )}
                          
                          {requirement.specs.resolution && (
                            <li className="flex items-start">
                              <Icon name="faImage" className="w-4 h-4 mr-2 text-gray-600 mt-0.5" solid={false} />
                              <span>
                                Resolution: {requirement.specs.resolution}
                              </span>
                            </li>
                          )}
                          
                          {requirement.specs.aspectRatio && (
                            <li className="flex items-start">
                              <Icon name="faRulerCombined" className="w-4 h-4 mr-2 text-gray-600 mt-0.5" solid={false} />
                              <span>
                                Aspect Ratio: {requirement.specs.aspectRatio}
                              </span>
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                    
                    {requirement.deliveryDate && (
                      <div className="mt-3 text-sm text-gray-600">
                        <Icon name="faCalendar" className="w-4 h-4 mr-1 inline-block" solid={false} />
                        Delivery by: {formatDate(requirement.deliveryDate)}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>
        
        {/* Creative Assets Tab */}
        <TabsContent value="assets" className="space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold font-sora">Creative Assets</h2>
              <Button onClick={() => router.push(`/influencer-marketplace/campaigns/${campaignId}/assets/manage`)}>
                <Icon name="faUpload" className="mr-2 w-4 h-4" solid={false} />
                Manage Assets
              </Button>
            </div>
            
            {!campaign.creativeAssets || campaign.creativeAssets.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed border-gray-300 rounded-lg">
                <Icon name="faImage" className="text-gray-400 text-4xl mb-3" solid={false} />
                <h3 className="text-xl font-medium text-gray-700 mb-2 font-sora">No Creative Assets</h3>
                <p className="text-gray-600 mb-4">
                  You haven't uploaded any creative assets for this campaign yet.
                </p>
                <Button onClick={() => router.push(`/influencer-marketplace/campaigns/${campaignId}/assets/manage`)}>
                  <Icon name="faUpload" className="mr-2 w-4 h-4" solid={false} />
                  Upload Assets
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {campaign.creativeAssets.map((asset, index) => (
                  <Card key={index} className="overflow-hidden border border-gray-200">
                    <div className="h-40 bg-gray-100 relative">
                      {asset.type.includes('image') ? (
                        <img
                          src={asset.url}
                          alt={asset.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Icon name="faFileVideo" className="text-gray-400 text-4xl" solid={false} />
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 mb-1 truncate" title={asset.name}>
                        {asset.name}
                      </h3>
                      
                      <div className="flex justify-between items-center mt-2">
                        <Badge variant="outline" className="bg-gray-50">
                          {asset.type}
                        </Badge>
                        
                        <a
                          href={asset.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Icon name="faDownload" className="w-4 h-4" solid={false} />
                        </a>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 