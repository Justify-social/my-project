'use client';

import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Icon from '../icon';

// Types
export interface Campaign {
  id: number;
  campaignName: string;
  submissionStatus: "draft" | "submitted" | "active" | "completed" | "in_review" | string;
  platform: "Instagram" | "YouTube" | "TikTok" | string;
  startDate: string;
  endDate?: string;
  totalBudget: number;
  primaryKPI: string;
}

// KPI mapping for display purposes
const kpiMapping = {
  adRecall: {
    title: "Ad Recall",
    icon: "/KPIs/Ad_Recall.svg"
  },
  brandAwareness: {
    title: "Brand Awareness",
    icon: "/KPIs/Brand_Awareness.svg"
  },
  consideration: {
    title: "Consideration",
    icon: "/KPIs/Consideration.svg"
  },
  messageAssociation: {
    title: "Message Association",
    icon: "/KPIs/Message_Association.svg"
  },
  brandPreference: {
    title: "Brand Preference",
    icon: "/KPIs/Brand_Preference.svg"
  },
  purchaseIntent: {
    title: "Purchase Intent",
    icon: "/KPIs/Purchase_Intent.svg"
  },
  actionIntent: {
    title: "Action Intent",
    icon: "/KPIs/Action_Intent.svg"
  },
  recommendationIntent: {
    title: "Recommendation Intent",
    icon: "/KPIs/Brand_Preference.svg"
  },
  advocacy: {
    title: "Advocacy",
    icon: "/KPIs/Advocacy.svg"
  }
};

// Component to display a status badge
const StatusBadge = ({ status, size = 'md' }: { status: string, size?: 'sm' | 'md' }) => {
  const getStatusInfo = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    
    switch (normalizedStatus) {
      case 'draft':
        return { text: 'Draft', color: 'bg-gray-100 text-gray-800' };
      case 'in_review':
      case 'in-review':
      case 'inreview':
        return { text: 'In Review', color: 'bg-yellow-100 text-yellow-800' };
      case 'active':
      case 'approved':
      case 'submitted':
        return { text: 'Active', color: 'bg-green-100 text-green-800' };
      case 'completed':
        return { text: 'Completed', color: 'bg-blue-100 text-blue-800' };
      default:
        return { text: status, color: 'bg-gray-100 text-gray-800' };
    }
  };

  const { text, color } = getStatusInfo(status);
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1';

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${color} ${sizeClass} font-work-sans`}>
      {text}
    </span>
  );
};

// Individual campaign card component
interface CampaignCardProps {
  campaign: Campaign;
  onClick?: () => void;
}

const CampaignCard: React.FC<CampaignCardProps> = ({ campaign, onClick }) => {
  const router = useRouter();
  const [iconError, setIconError] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const isMounted = useRef(true);

  // Ensure the card is visible, even after hydration
  useLayoutEffect(() => {
    // Force the card to be visible immediately after mounting
    if (cardRef.current) {
      cardRef.current.style.display = 'block';
      cardRef.current.style.visibility = 'visible';
      cardRef.current.style.opacity = '1';
    }
    
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Verify the campaign data is valid
  const isValid = campaign && campaign.id && campaign.campaignName;
  
  if (!isValid) {
    return (
      <div className="p-4 border border-red-200 rounded-lg bg-red-50">
        <p className="text-red-500 text-sm">Invalid campaign data</p>
      </div>
    );
  }

  // Get the KPI display info or use fallback if not found
  const kpiInfo = kpiMapping[campaign.primaryKPI as keyof typeof kpiMapping] || {
    title: campaign.primaryKPI || 'Brand Awareness',
    icon: "/KPIs/Brand_Awareness.svg"
  };

  return (
    <motion.div 
      ref={cardRef}
      initial={{ opacity: 1, y: 0 }} // Start visible instead of animating from invisible
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg border border-[var(--divider-color)] overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer" 
      onClick={() => onClick ? onClick() : router.push(`/campaigns/${campaign.id}`)}
      style={{ 
        display: 'block', 
        visibility: 'visible', 
        opacity: 1,
        willChange: 'transform' // Optimization for animation performance
      }}
    >
      <div className="p-3 sm:p-4 font-work-sans">
        <div className="flex items-start justify-between font-work-sans">
          <div className="flex-1 mr-2 font-work-sans">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-medium text-[var(--primary-color)] font-sora">{campaign.campaignName}</h3>
              <StatusBadge status={campaign.submissionStatus || 'draft'} size="sm" />
            </div>
            <p className="text-xs text-[var(--secondary-color)] mt-1 font-work-sans">
              {(() => {
                try {
                  return new Date(campaign.startDate).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'short'
                  });
                } catch (e) {
                  return 'Invalid date';
                }
              })()}
              {campaign.endDate && (() => {
                try {
                  return ` - ${new Date(campaign.endDate).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'short'
                  })}`;
                } catch (e) {
                  return '';
                }
              })()}
            </p>
          </div>
          <div className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-md flex items-center justify-center ${campaign.platform === 'Instagram' ? 'bg-gradient-to-br from-purple-500 to-pink-500' : campaign.platform === 'TikTok' ? 'bg-black' : 'bg-red-600'} font-work-sans`}>
            {campaign.platform === 'Instagram' && <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white font-work-sans" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>}
            {campaign.platform === 'TikTok' && <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white font-work-sans" viewBox="0 0 24 24" fill="currentColor"><path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"></path></svg>}
            {campaign.platform === 'YouTube' && <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white font-work-sans" viewBox="0 0 24 24" fill="currentColor"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"></path></svg>}
          </div>
        </div>
        
        <div className="mt-3 grid grid-cols-2 gap-2 sm:gap-4 text-xs font-work-sans">
          <div className="font-work-sans">
            <p className="text-[var(--secondary-color)] font-work-sans">Budget</p>
            <p className="font-medium text-[var(--primary-color)] font-work-sans">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0
              }).format(campaign.totalBudget)}
            </p>
          </div>
          <div className="font-work-sans">
            <p className="text-[var(--secondary-color)] font-work-sans">Primary KPI</p>
            <div className="flex items-center gap-1.5 font-work-sans">
              {!iconError ? (
                <img 
                  src={kpiInfo.icon} 
                  alt={kpiInfo.title} 
                  className="w-4 h-4" 
                  onError={() => setIconError(true)}
                  loading="eager"
                />
              ) : (
                <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-500 text-[8px]">KPI</span>
                </div>
              )}
              <p className="font-medium text-[var(--primary-color)] font-work-sans">{kpiInfo.title}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Main UpcomingCampaignsCard component
interface UpcomingCampaignsCardProps {
  campaigns: Campaign[];
  isLoading: boolean;
  onNewCampaign: () => void;
  onSelectCampaign?: (id: number | string) => void;
}

const UpcomingCampaignsCard: React.FC<UpcomingCampaignsCardProps> = ({
  campaigns,
  isLoading,
  onNewCampaign,
  onSelectCampaign
}) => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [debugMode, setDebugMode] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMounted = useRef(true);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  // Preload common KPI icons to avoid loading flickering
  useEffect(() => {
    try {
      const icons = Object.values(kpiMapping).map(item => item.icon);
      icons.forEach(icon => {
        const img = new Image();
        img.src = icon;
      });
    } catch (err) {
      console.error("Error preloading icons:", err);
    }
  }, []);
  
  // Always ensure campaigns is an array
  const validCampaigns = React.useMemo(() => {
    try {
      if (!Array.isArray(campaigns)) {
        console.warn("Campaigns is not an array:", campaigns);
        if (isMounted.current) {
          setError("Invalid campaign data format");
        }
        return [];
      }
      
      if (campaigns.length === 0) {
        return [];
      }
      
      // Filter and sort
      return campaigns
        .filter(campaign => 
          campaign && 
          campaign.id && 
          campaign.campaignName && 
          campaign.startDate
        )
        .sort((a, b) => {
          try {
            const aDate = new Date(a.startDate).getTime();
            const bDate = new Date(b.startDate).getTime();
            return !isNaN(aDate) && !isNaN(bDate) ? aDate - bDate : 0;
          } catch (err) {
            console.error("Error sorting campaigns:", err);
            return 0;
          }
        });
    } catch (err) {
      console.error("Error processing campaigns:", err);
      if (isMounted.current) {
        setError("Failed to process campaign data");
      }
      return [];
    }
  }, [campaigns]);

  const handleCampaignClick = (campaign: Campaign) => {
    if (onSelectCampaign) {
      onSelectCampaign(campaign.id);
    } else {
      router.push(`/campaigns/${campaign.id}`);
    }
  };

  const toggleDebugMode = () => {
    setDebugMode(!debugMode);
  };

  // Add effect to ensure campaigns are visible after hydration
  useLayoutEffect(() => {
    // Force a redraw to ensure campaign tiles are visible
    const forceRedraw = () => {
      if (!containerRef.current || !isMounted.current) return;
      
      const campaignElements = containerRef.current.querySelectorAll('.campaign-card-container');
      campaignElements.forEach(element => {
        if (element instanceof HTMLElement) {
          element.style.display = 'block';
          element.style.visibility = 'visible';
          element.style.opacity = '1';
        }
      });
    };
    
    // Run immediately and after a short delay to ensure update after hydration
    forceRedraw();
    const timeoutId = setTimeout(forceRedraw, 100);
    const longTimeoutId = setTimeout(forceRedraw, 500); // Extra safety
    
    return () => {
      clearTimeout(timeoutId);
      clearTimeout(longTimeoutId);
    };
  }, [validCampaigns]);

  return (
    <div className="h-full border border-[var(--divider-color)] rounded-lg bg-white overflow-hidden font-work-sans relative">
      <div className="p-3 sm:p-4 border-b border-[var(--divider-color)] font-work-sans flex justify-between items-center">
        <h3 className="text-sm font-medium text-[var(--secondary-color)] font-sora">Upcoming</h3>
        <button 
          onClick={toggleDebugMode} 
          className="text-xs text-gray-400 hover:text-gray-600"
          title="Toggle debug info"
        >
          {debugMode ? "Hide Debug" : ""}
        </button>
      </div>
      
      <div className="p-3 sm:p-4 font-work-sans">
        {isLoading ? (
          <div className="py-4 sm:py-6 animate-pulse font-work-sans">
            <div className="h-24 bg-gray-200 rounded-lg mb-3"></div>
            <div className="h-24 bg-gray-200 rounded-lg"></div>
          </div>
        ) : error ? (
          <div className="text-center py-4 sm:py-6 border border-dashed border-red-300 rounded-lg bg-red-50 font-work-sans">
            <p className="text-sm text-red-500 font-work-sans mb-2">
              {error}
            </p>
            <button 
              onClick={() => setError(null)} 
              className="text-xs text-red-600 underline"
            >
              Dismiss
            </button>
          </div>
        ) : (
          <div>
            {validCampaigns.length === 0 ? (
              <div className="text-center py-4 sm:py-6 border border-dashed border-[var(--divider-color)] rounded-lg font-work-sans">
                <p className="text-sm text-[var(--secondary-color)] font-work-sans">
                  No campaigns to display
                </p>
                <button 
                  onClick={onNewCampaign} 
                  className="group mt-3 px-3 py-1.5 bg-[var(--accent-color)] text-white text-sm rounded-md hover:bg-opacity-90 transition-colors font-work-sans"
                >
                  <Icon name="faPlus" className="w-3 h-3 mr-1" iconType="button" />
                  <span className="font-work-sans">Create Your First Campaign</span>
                </button>
              </div>
            ) : (
              <>
                {debugMode && (
                  <div className="mb-3 p-2 border border-blue-200 bg-blue-50 rounded-md text-xs">
                    <p><strong>Total campaigns:</strong> {campaigns?.length || 0}</p>
                    <p><strong>Valid campaigns:</strong> {validCampaigns.length}</p>
                    <p><strong>First campaign:</strong> {validCampaigns[0]?.campaignName || 'None'}</p>
                  </div>
                )}
                <div className="space-y-3 overflow-y-auto max-h-[420px] font-work-sans" ref={containerRef}>
                  {validCampaigns.map((campaign) => (
                    <div 
                      key={campaign.id} 
                      className="campaign-card-container"
                      style={{ 
                        display: 'block', 
                        minHeight: '80px', 
                        visibility: 'visible', 
                        opacity: 1,
                        position: 'relative' // Ensures proper stacking context
                      }}
                    >
                      <CampaignCard 
                        campaign={campaign} 
                        onClick={() => handleCampaignClick(campaign)}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UpcomingCampaignsCard; 