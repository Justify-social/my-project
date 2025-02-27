"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import Image from 'next/image';

// Define KPI information similar to Step-2
const kpis = [
  {
    key: "adRecall",
    title: "Ad Recall",
    definition: "The percentage of people who remember seeing your advertisement.",
    example: "After a week, 60% of viewers can recall your ad's main message.",
    icon: "/KPIs/Ad_Recall.svg"
  },
  {
    key: "brandAwareness",
    title: "Brand Awareness",
    definition: "The increase in recognition of your brand.",
    example: "Your brand name is recognised by 30% more people after the campaign.",
    icon: "/KPIs/Brand_Awareness.svg"
  },
  {
    key: "consideration",
    title: "Consideration",
    definition: "The percentage of people considering purchasing from your brand.",
    example: "25% of your audience considers buying your product after seeing your campaign.",
    icon: "/KPIs/Consideration.svg"
  },
  {
    key: "messageAssociation",
    title: "Message Association",
    definition: "How well people link your key messages to your brand.",
    example: "When hearing your slogan, 70% of people associate it directly with your brand.",
    icon: "/KPIs/Message_Association.svg"
  },
  {
    key: "brandPreference",
    title: "Brand Preference",
    definition: "Preference for your brand over competitors.",
    example: "40% of customers prefer your brand when choosing between similar products.",
    icon: "/KPIs/Brand_Preference.svg"
  },
  {
    key: "purchaseIntent",
    title: "Purchase Intent",
    definition: "Likelihood of purchasing your product or service.",
    example: "50% of viewers intend to buy your product after seeing the ad.",
    icon: "/KPIs/Purchase_Intent.svg"
  },
  {
    key: "actionIntent",
    title: "Action Intent",
    definition: "Likelihood of taking a specific action related to your brand (e.g., visiting your website).",
    example: "35% of people are motivated to visit your website after the campaign.",
    icon: "/KPIs/Action_Intent.svg"
  },
  {
    key: "recommendationIntent",
    title: "Recommendation Intent",
    definition: "Likelihood of recommending your brand to others.",
    example: "45% of customers are willing to recommend your brand to friends and family.",
    icon: "/KPIs/Brand_Preference.svg"
  },
  {
    key: "advocacy",
    title: "Advocacy",
    definition: "Willingness to actively promote your brand.",
    example: "20% of your customers regularly share your brand on social media or write positive reviews.",
    icon: "/KPIs/Advocacy.svg"
  },
];

// Features mapping with their icons
const features = [
  { 
    key: "CREATIVE_ASSET_TESTING", 
    title: "Creative Asset Testing",
    icon: "/Creative_Asset_Testing.svg"
  },
  { 
    key: "BRAND_LIFT", 
    title: "Brand Lift",
    icon: "/Brand_Lift.svg"
  },
  { 
    key: "BRAND_HEALTH", 
    title: "Brand Health",
    icon: "/Brand_Health.svg"
  },
  { 
    key: "MIXED_MEDIA_MODELLING", 
    title: "Mixed Media Modelling",
    icon: "/MMM.svg"
  }
];

// Helper function to get KPI details by key or title
const getKpiByKey = (key: string | undefined) => {
  if (!key) return undefined;
  return kpis.find(kpi => kpi.key === key || kpi.title === key);
};

// Helper function to get Feature details by key
const getFeatureByKey = (key: string) => {
  return features.find(feature => feature.key === key || feature.title === key);
};

interface Campaign {
  id: number;
  campaignName: string;
  platform: string;
  startDate: string;
  endDate: string;
  totalBudget: number;
  primaryKPI: string;
  submissionStatus: string;
  primaryContact?: {
    firstName?: string;
    surname?: string;
    email?: string;
    position?: string;
  };
  audience?: {
    age1824?: number;
    age2534?: number;
    age3544?: number;
    age4554?: number;
    age5564?: number;
    age65plus?: number;
    genders?: {gender: string}[];
    locations?: {location: string}[];
    languages?: {language: string}[];
  };
  objectives?: {
    primaryKPI?: string;
    secondaryKPIs?: string[];
    features?: string[];
    mainMessage?: string;
    hashtags?: string;
    keyBenefits?: string;
    expectedAchievements?: string;
  };
  creativeAssets?: {
    id: string;
    assetName: string;
    type: string;
    url: string;
    fileName: string;
  }[];
}

// Summary Section Component for displaying each step's data
interface SummarySectionProps {
  title: string;
  children: React.ReactNode;
}

const SummarySection: React.FC<SummarySectionProps> = ({ 
  title, 
  children 
}) => {
  return (
    <div className="bg-[var(--background-color)] rounded-lg border border-[var(--divider-color)] p-6 mb-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <h2 className="text-lg font-semibold font-['Sora'] text-[var(--primary-color)]">{title}</h2>
        </div>
      </div>
      <div>
        {children}
      </div>
    </div>
  );
};

// Data Item Component for displaying individual data points
interface DataItemProps {
  label: string;
  value: string | number | null;
}

const DataItem: React.FC<DataItemProps> = ({ label, value }) => {
  // Convert objects or other non-primitive values to strings
  const displayValue = () => {
    if (value === null || value === undefined) {
      return 'Not provided';
    }
    
    // If value is an object, convert to a string representation
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value);
      } catch (e) {
        return 'Complex Object';
      }
    }
    
    return value;
  };

  return (
    <div className="mb-4">
      <p className="text-sm font-['Work_Sans'] text-[var(--secondary-color)] mb-1 font-medium">{label}</p>
      <p className="font-medium font-['Work_Sans'] text-[var(--primary-color)]">{displayValue()}</p>
    </div>
  );
};

export default function SelectedCampaignContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const campaignId = searchParams.get('id');
  const [loading, setLoading] = useState<boolean>(true);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchCampaignData = async () => {
      if (!campaignId) {
        setError("Campaign ID not provided");
        setLoading(false);
        return;
      }

      try {
        // Fetch campaign details by ID
        const response = await fetch(`/api/campaigns?id=${campaignId}`, {
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
        
        if (data.success && data.campaign) {
          setCampaign(data.campaign);
        } else if (data.success && Array.isArray(data.campaigns) && data.campaigns.length > 0) {
          // Find the campaign with the matching ID
          const foundCampaign = data.campaigns.find(
            (c: Campaign) => c.id.toString() === campaignId
          );
          
          if (foundCampaign) {
            setCampaign(foundCampaign);
          } else {
            setError("Campaign not found");
          }
        } else {
          setError("Failed to load campaign details");
        }
      } catch (error) {
        console.error('Error fetching campaign details:', error);
        setError(error instanceof Error ? error.message : 'Failed to load campaign');
      } finally {
        setLoading(false);
      }
    };

    fetchCampaignData();
  }, [campaignId]);

  const handleEditCampaign = () => {
    router.push(`/brand-lift/edit-campaign?id=${campaignId}`);
  };

  const handleRunSurvey = () => {
    router.push(`/brand-lift/survey-design?id=${campaignId}`);
  };

  const handleBack = () => {
    router.push("/brand-lift");
  };

  if (loading) return <div className="p-8 font-['Work_Sans'] text-[var(--primary-color)]">Loading campaign details...</div>;
  if (error) return <div className="p-8 font-['Work_Sans'] text-[var(--primary-color)]">Error: {error}</div>;
  if (!campaign) return <div className="p-8 font-['Work_Sans'] text-[var(--primary-color)]">Campaign not found</div>;

  const primaryKpiInfo = getKpiByKey(campaign.objectives?.primaryKPI || campaign.primaryKPI);

  return (
    <div className="container mx-auto px-4 py-8 bg-[var(--background-color)]">
      <div className="flex items-center mb-6">
        <button 
          onClick={handleBack}
          className="mr-4 text-[var(--secondary-color)] hover:text-[var(--primary-color)]"
        >
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </button>
        <h1 className="text-3xl font-bold font-['Sora'] text-[var(--primary-color)]">Campaign Review</h1>
      </div>
      
      <div className="mb-6">
        <div className="flex items-center">
          <h2 className="text-2xl font-semibold font-['Sora'] text-[var(--primary-color)]">{campaign.campaignName}</h2>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 ml-3">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 8 8">
              <circle cx="4" cy="4" r="3" />
            </svg>
            Approved
          </span>
        </div>
      </div>

      {/* Campaign Overview Panel */}
      <SummarySection title="Campaign Overview">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DataItem label="Start Date" value={new Date(campaign.startDate).toLocaleDateString()} />
              <DataItem label="End Date" value={new Date(campaign.endDate).toLocaleDateString()} />
              <DataItem label="Platform" value={campaign.platform} />
              <DataItem label="Total Budget" value={`$${campaign.totalBudget}`} />
              
              {/* Primary KPI with Icon */}
              <div className="col-span-1 md:col-span-2">
                <p className="text-sm font-['Work_Sans'] text-[var(--secondary-color)] mb-1 font-medium">Primary KPI</p>
                <div className="flex items-center mt-1">
                  {primaryKpiInfo && (
                    <div className="flex items-center bg-blue-50 px-3 py-2 rounded-md border border-blue-100">
                      <div className="w-6 h-6 mr-2">
                        <Image 
                          src={primaryKpiInfo.icon} 
                          alt={primaryKpiInfo.title} 
                          width={24} 
                          height={24}
                        />
                      </div>
                      <span className="font-medium text-blue-800">{primaryKpiInfo.title}</span>
                      <div className="ml-3 text-sm text-blue-600">{primaryKpiInfo.definition}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {campaign.primaryContact && (
            <div className="p-4 bg-gray-50 rounded-md border border-[var(--divider-color)]">
              <h3 className="font-medium font-['Work_Sans'] text-[var(--primary-color)] mb-3">Primary Contact</h3>
              <div>
                <p className="font-medium font-['Work_Sans'] text-[var(--primary-color)]">
                  {campaign.primaryContact.firstName} {campaign.primaryContact.surname}
                </p>
                <div className="flex items-center mt-1">
                  <p className="text-[var(--secondary-color)] text-sm font-['Work_Sans']">
                    {campaign.primaryContact.email}
                  </p>
                  {campaign.primaryContact.position && (
                    <span className="ml-3 px-2 py-1 bg-gray-200 text-[var(--secondary-color)] text-xs rounded-md font-medium font-['Work_Sans']">
                      {campaign.primaryContact.position}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </SummarySection>

      {/* KPI Details */}
      <SummarySection title="Key Performance Indicators">
        <div className="mb-4">
          <h3 className="text-md font-semibold font-['Work_Sans'] text-[var(--primary-color)] mb-3">Primary KPI</h3>
          {primaryKpiInfo && (
            <div className="bg-blue-50 p-4 rounded-md border border-blue-100 mb-6">
              <div className="flex items-center">
                <div className="w-8 h-8 mr-3">
                  <Image 
                    src={primaryKpiInfo.icon} 
                    alt={primaryKpiInfo.title} 
                    width={32} 
                    height={32}
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900">{primaryKpiInfo.title}</h4>
                  <p className="text-sm text-blue-700 mt-1">{primaryKpiInfo.definition}</p>
                  <p className="text-xs text-blue-600 mt-1 italic">Example: {primaryKpiInfo.example}</p>
                </div>
              </div>
            </div>
          )}
          
          <h3 className="text-md font-semibold font-['Work_Sans'] text-[var(--primary-color)] mb-3">Secondary KPIs</h3>
          {campaign.objectives?.secondaryKPIs && campaign.objectives.secondaryKPIs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {campaign.objectives.secondaryKPIs.map((kpiKey, index) => {
                const kpiInfo = getKpiByKey(kpiKey);
                if (!kpiInfo) return null;
                
                return (
                  <div key={index} className="bg-gray-50 p-3 rounded-md border border-gray-200">
                    <div className="flex items-center">
                      <div className="w-6 h-6 mr-2">
                        <Image 
                          src={kpiInfo.icon} 
                          alt={kpiInfo.title} 
                          width={24} 
                          height={24}
                        />
                      </div>
                      <div>
                        <h4 className="font-medium text-[var(--primary-color)]">{kpiInfo.title}</h4>
                        <p className="text-xs text-[var(--secondary-color)] mt-1">{kpiInfo.definition}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-[var(--secondary-color)] italic">No secondary KPIs selected</p>
          )}
        </div>
      </SummarySection>

      {/* Objectives & Messaging */}
      <SummarySection title="Objectives & Messaging">
        <div className="grid grid-cols-1 gap-6 mb-4">
          {campaign.objectives?.mainMessage && (
            <div className="mb-4">
              <h4 className="text-sm font-medium font-['Work_Sans'] text-[var(--secondary-color)] mb-2">Main Message</h4>
              <p className="font-['Work_Sans'] text-[var(--primary-color)] bg-gray-50 p-4 rounded-md border border-[var(--divider-color)]">
                {campaign.objectives.mainMessage}
              </p>
            </div>
          )}
          
          {campaign.objectives?.hashtags && (
            <DataItem 
              label="Hashtags" 
              value={campaign.objectives.hashtags} 
            />
          )}
          
          {campaign.objectives?.keyBenefits && (
            <div className="mb-4">
              <h4 className="text-sm font-medium font-['Work_Sans'] text-[var(--secondary-color)] mb-2">Key Benefits</h4>
              <p className="font-['Work_Sans'] text-[var(--primary-color)] bg-gray-50 p-4 rounded-md border border-[var(--divider-color)]">
                {campaign.objectives.keyBenefits}
              </p>
            </div>
          )}

          {campaign.objectives?.expectedAchievements && (
            <div className="mb-4">
              <h4 className="text-sm font-medium font-['Work_Sans'] text-[var(--secondary-color)] mb-2">Expected Achievements</h4>
              <p className="font-['Work_Sans'] text-[var(--primary-color)] bg-gray-50 p-4 rounded-md border border-[var(--divider-color)]">
                {campaign.objectives.expectedAchievements}
              </p>
            </div>
          )}
        </div>

        {campaign.objectives?.features && campaign.objectives.features.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium font-['Work_Sans'] text-[var(--secondary-color)] mb-3">Features</h4>
            <div className="flex flex-wrap gap-3">
              {campaign.objectives.features.map((featureKey, idx) => {
                const featureInfo = getFeatureByKey(featureKey);
                return (
                  <span 
                    key={idx}
                    className="flex items-center bg-blue-50 text-blue-700 px-3 py-2 rounded-md text-sm font-medium font-['Work_Sans']"
                  >
                    {featureInfo && featureInfo.icon && (
                      <div className="w-5 h-5 mr-2">
                        <Image 
                          src={featureInfo.icon} 
                          alt={featureInfo.title || featureKey} 
                          width={20} 
                          height={20}
                        />
                      </div>
                    )}
                    {featureInfo ? featureInfo.title : featureKey.replace(/_/g, ' ')}
              </span>
                );
              })}
            </div>
          </div>
        )}
      </SummarySection>

      {/* Audience */}
      {campaign.audience && (
        <SummarySection title="Audience Targeting">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg border border-[var(--divider-color)]">
              <h3 className="font-medium font-['Work_Sans'] text-[var(--primary-color)] mb-4">Demographics</h3>
              
              {(campaign.audience.age1824 !== undefined || 
                campaign.audience.age2534 !== undefined ||
                campaign.audience.age3544 !== undefined ||
                campaign.audience.age4554 !== undefined ||
                campaign.audience.age5564 !== undefined ||
                campaign.audience.age65plus !== undefined) && (
                <div className="mb-5">
                  <h4 className="text-sm font-medium font-['Work_Sans'] text-[var(--secondary-color)] mb-2">Age Distribution</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white p-2 rounded border border-gray-200 text-center">
                      <div className="text-lg font-semibold">{campaign.audience.age1824 || 0}%</div>
                      <div className="text-xs text-gray-500">18-24</div>
                    </div>
                    <div className="bg-white p-2 rounded border border-gray-200 text-center">
                      <div className="text-lg font-semibold">{campaign.audience.age2534 || 0}%</div>
                      <div className="text-xs text-gray-500">25-34</div>
                    </div>
                    <div className="bg-white p-2 rounded border border-gray-200 text-center">
                      <div className="text-lg font-semibold">{campaign.audience.age3544 || 0}%</div>
                      <div className="text-xs text-gray-500">35-44</div>
                    </div>
                    <div className="bg-white p-2 rounded border border-gray-200 text-center">
                      <div className="text-lg font-semibold">{campaign.audience.age4554 || 0}%</div>
                      <div className="text-xs text-gray-500">45-54</div>
                    </div>
                    <div className="bg-white p-2 rounded border border-gray-200 text-center">
                      <div className="text-lg font-semibold">{campaign.audience.age5564 || 0}%</div>
                      <div className="text-xs text-gray-500">55-64</div>
                    </div>
                    <div className="bg-white p-2 rounded border border-gray-200 text-center">
                      <div className="text-lg font-semibold">{campaign.audience.age65plus || 0}%</div>
                      <div className="text-xs text-gray-500">65+</div>
                    </div>
                  </div>
                </div>
              )}
              
              {campaign.audience.genders && campaign.audience.genders.length > 0 && (
                <DataItem 
                  label="Genders" 
                  value={campaign.audience.genders.map(g => g.gender).join(", ")} 
                />
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-[var(--divider-color)]">
              <h3 className="font-medium font-['Work_Sans'] text-[var(--primary-color)] mb-4">Location</h3>
              
              {campaign.audience.locations && campaign.audience.locations.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium font-['Work_Sans'] text-[var(--secondary-color)] mb-2">Target Locations</h4>
                  <div className="flex flex-wrap gap-2">
                    {campaign.audience.locations.map((location, idx) => (
                      <span 
                        key={idx}
                        className="bg-white px-3 py-1 rounded-md text-sm font-medium font-['Work_Sans'] border border-gray-200"
                      >
                        {location.location}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {campaign.audience.languages && campaign.audience.languages.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium font-['Work_Sans'] text-[var(--secondary-color)] mb-2">Languages</h4>
                  <div className="flex flex-wrap gap-2">
                    {campaign.audience.languages.map((language, idx) => (
                      <span 
                        key={idx}
                        className="bg-white px-3 py-1 rounded-md text-sm font-medium font-['Work_Sans'] border border-gray-200"
                      >
                        {language.language}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </SummarySection>
      )}

      {/* Creative Assets Section (if available) */}
      {campaign.creativeAssets && campaign.creativeAssets.length > 0 && (
        <SummarySection title="Creative Assets">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {campaign.creativeAssets.map((asset, index) => (
              <div key={index} className="border border-[var(--divider-color)] rounded-md overflow-hidden">
                <div className="p-4">
                  <h3 className="font-medium font-['Work_Sans'] text-[var(--primary-color)] mb-2">{asset.assetName}</h3>
                  <p className="text-sm text-[var(--secondary-color)]">Type: {asset.type}</p>
                  <p className="text-sm text-[var(--secondary-color)] truncate">File: {asset.fileName}</p>
                  <div className="mt-3">
                    <a 
                      href={asset.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[var(--accent-color)] text-sm hover:underline"
                    >
                      View Asset →
                    </a>
                  </div>
            </div>
          </div>
        ))}
          </div>
        </SummarySection>
      )}

      {/* Survey Information */}
      <SummarySection title="Brand Lift Survey">
        <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-md">
          <p className="text-yellow-800 font-['Work_Sans']">
            No brand lift survey has been created for this campaign yet. Click "Run Brand Lift Survey" to get started.
          </p>
        </div>
      </SummarySection>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 mt-8">
        <button 
          onClick={handleBack}
          className="px-6 py-2 border border-[var(--divider-color)] bg-[var(--background-color)] text-[var(--primary-color)] rounded-md font-medium font-['Work_Sans'] hover:bg-gray-50"
        >
          Back
        </button>
        
        <button 
          onClick={handleEditCampaign}
          className="px-6 py-2 bg-[var(--secondary-color)] text-white rounded-md font-medium font-['Work_Sans'] hover:opacity-90 transition-opacity flex items-center"
        >
          <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
          Edit Campaign
        </button>
        
        <button 
          onClick={handleRunSurvey}
          className="px-6 py-2 bg-[var(--accent-color)] text-white rounded-md font-medium font-['Work_Sans'] hover:opacity-90 transition-opacity"
        >
          Run Brand Lift Survey
        </button>
      </div>
    </div>
  );
}
