"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import Image from 'next/image';

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

interface TestResult {
  id: number;
  name: string;
  date: string;
  status: "Paused" | "Completed";
  kpi?: string;
  kpiKey?: string;
  awareness?: string;
  consideration?: string;
  completes: number;
  target: number;
}

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
}];


// Helper function to get KPI details by key or title
const getKpiByKeyOrTitle = (keyOrTitle: string) => {
  // Check if it's a direct key match
  const byKey = kpis.find((kpi) => kpi.key === keyOrTitle);
  if (byKey) return byKey;

  // Check if it's a title match
  const byTitle = kpis.find((kpi) => kpi.title.toLowerCase() === keyOrTitle.toLowerCase());
  if (byTitle) return byTitle;

  // Extract and check for the KPI name if it's in a format like "60% Awareness"
  const match = keyOrTitle.match(/\d+%\s+(\w+)/);
  if (match && match[1]) {
    const kpiTitle = match[1];
    return kpis.find((kpi) => kpi.title.toLowerCase().includes(kpiTitle.toLowerCase()));
  }

  return null;
};

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
  const [selectedCampaign, setSelectedCampaign] = useState<number | null>(null);
  const [selectedCampaignName, setSelectedCampaignName] = useState<string>("");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock test results data with KPI keys
  const testResults: TestResult[] = [
  {
    id: 1,
    name: "Test A",
    date: "01/05/24",
    status: "Paused",
    kpiKey: "adRecall",
    completes: 150,
    target: 300
  },
  {
    id: 2,
    name: "Test B",
    date: "15/04/24",
    status: "Completed",
    kpi: "60% Awareness",
    kpiKey: "brandAwareness",
    completes: 300,
    target: 300
  },
  {
    id: 3,
    name: "Test C",
    date: "20/03/24",
    status: "Completed",
    kpi: "80% Consideration",
    kpiKey: "consideration",
    completes: 300,
    target: 300
  }];


  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await fetch('/api/campaigns', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && Array.isArray(data.campaigns)) {
          // Only include submitted campaigns
          const submittedCampaigns = data.campaigns.filter(
            (campaign: Campaign) => campaign.submissionStatus === 'submitted'
          );
          setCampaigns(submittedCampaigns);

          // Set the first campaign as selected if available
          if (submittedCampaigns.length > 0) {
            setSelectedCampaign(submittedCampaigns[0].id);
            setSelectedCampaignName(submittedCampaigns[0].campaignName);
          }
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

  const handleCampaignChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const campaignId = parseInt(e.target.value);
    setSelectedCampaign(campaignId);

    // Find the selected campaign to get its name
    const campaign = campaigns.find((c) => c.id === campaignId);
    if (campaign) {
      setSelectedCampaignName(campaign.campaignName);
    }
  };

  const handleCreateNewCampaign = () => {
    router.push("/brand-lift/create-campaign");
  };

  const handleEditCampaign = () => {
    if (selectedCampaign) {
      router.push(`/brand-lift/edit-campaign?id=${selectedCampaign}`);
    }
  };

  const handleLaunchCampaign = () => {
    if (selectedCampaign) {
      router.push(`/brand-lift/selected-campaign?id=${selectedCampaign}`);
    }
  };

  if (loading) return <div className="p-8 font-['Work_Sans'] text-[var(--primary-color)] font-work-sans">Loading campaigns...</div>;
  if (error) return <div className="p-8 font-['Work_Sans'] text-[var(--primary-color)] font-work-sans">Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-8 bg-[var(--background-color)] font-work-sans">
      <div className="mb-8 font-work-sans">
        <h1 className="text-3xl font-bold font-['Sora'] text-[var(--primary-color)] font-sora">Brand Lift</h1>
        <p className="mt-2 text-[var(--secondary-color)] font-['Work_Sans'] font-work-sans">
          Measure the effectiveness of your marketing campaigns with brand lift studies
        </p>
      </div>

      {/* Campaign Details Section */}
      <div className="mb-8 font-work-sans">
        <h2 className="text-xl font-semibold mb-4 font-['Sora'] text-[var(--primary-color)] font-sora">Campaign Details</h2>
        <div className="bg-[var(--background-color)] rounded-lg border border-[var(--divider-color)] p-6 font-work-sans">
          <div className="mb-4 font-work-sans">
            <label className="block text-sm font-medium mb-1 font-['Work_Sans'] text-[var(--primary-color)] font-work-sans">Select Campaign</label>
            <div className="relative font-work-sans">
              {campaigns.length > 0 ?
              <select
                className="w-full p-2 border border-[var(--divider-color)] rounded-md pr-10 appearance-none font-['Work_Sans'] text-[var(--primary-color)] font-work-sans"
                value={selectedCampaign?.toString() || ""}
                onChange={handleCampaignChange}>

                  {campaigns.map((campaign) =>
                <option key={campaign.id} value={campaign.id.toString()}>
                      {campaign.campaignName}
                    </option>
                )}
                </select> :

              <div className="w-full p-2 border border-[var(--divider-color)] rounded-md font-['Work_Sans'] text-[var(--secondary-color)] font-work-sans">
                  No campaigns available
                </div>
              }
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none font-work-sans">
                <svg className="h-5 w-5 text-[var(--secondary-color)] font-work-sans" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="text-right font-work-sans">
              <svg className="inline-block h-5 w-5 text-[var(--accent-color)] font-work-sans" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
              </svg>
          </div>
          </div>
          
          <div className="flex flex-wrap gap-4 font-work-sans">
            <button
              onClick={handleEditCampaign}
              disabled={!selectedCampaign}
              className={`flex items-center justify-center px-4 py-2 bg-[var(--secondary-color)] text-white rounded-md font-medium font-['Work_Sans'] hover:opacity-90 transition-opacity ${!selectedCampaign ? 'opacity-50 cursor-not-allowed' : ''} font-work-sans`}>

              <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              Edit
            </button>
            
            <button
              onClick={handleCreateNewCampaign}
              className="flex items-center justify-center px-4 py-2 bg-[var(--primary-color)] text-white rounded-md font-medium font-['Work_Sans'] hover:opacity-90 transition-opacity font-work-sans">

              <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Create New Campaign
            </button>
            
            <button
              onClick={handleLaunchCampaign}
              disabled={!selectedCampaign}
              className={`flex items-center justify-center px-4 py-2 bg-[var(--accent-color)] text-white rounded-md font-medium font-['Work_Sans'] hover:opacity-90 transition-opacity ml-auto ${!selectedCampaign ? 'opacity-50 cursor-not-allowed' : ''} font-work-sans`}>

              Launch Selected Campaign
            </button>
          </div>
        </div>
      </div>

      {/* Recent Brand Lift Results */}
                  <div className="font-work-sans">
        <h2 className="text-xl font-semibold mb-4 font-['Sora'] text-[var(--primary-color)] font-sora">Recent Brand Lift Results</h2>
        <div className="bg-[var(--background-color)] rounded-lg border border-[var(--divider-color)] overflow-hidden font-work-sans">
          <div className="overflow-x-auto font-work-sans">
            <table className="min-w-full divide-y divide-[var(--divider-color)]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--secondary-color)] uppercase tracking-wider font-['Work_Sans'] font-work-sans">
                    <div className="flex items-center font-work-sans">
                      Test Name
                      <svg className="ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--secondary-color)] uppercase tracking-wider font-['Work_Sans'] font-work-sans">
                    <div className="flex items-center font-work-sans">
                      Date
                      <svg className="ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--secondary-color)] uppercase tracking-wider font-['Work_Sans'] font-work-sans">
                    <div className="flex items-center font-work-sans">
                      Status
                      <svg className="ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--secondary-color)] uppercase tracking-wider font-['Work_Sans'] font-work-sans">
                    <div className="flex items-center font-work-sans">
                      KPI
                      <svg className="ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--secondary-color)] uppercase tracking-wider font-['Work_Sans'] font-work-sans">
                    <div className="flex items-center font-work-sans">
                      Survey Completes
                      <svg className="ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--secondary-color)] uppercase tracking-wider font-['Work_Sans'] font-work-sans">
                    <div className="flex items-center font-work-sans">
                      Actions
                      <svg className="ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[var(--background-color)] divide-y divide-[var(--divider-color)]">
                {testResults.map((test) => {
                  // Find KPI details if available
                  const kpiInfo = test.kpiKey ?
                  kpis.find((k) => k.key === test.kpiKey) :
                  test.kpi ? getKpiByKeyOrTitle(test.kpi) : null;

                  return (
                    <tr key={test.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-[var(--primary-color)] font-['Work_Sans'] font-work-sans">{test.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-[var(--secondary-color)] font-['Work_Sans'] font-work-sans">{test.date}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full font-['Work_Sans'] ${
                        test.status === "Completed" ?
                        "bg-green-100 text-green-800" :
                        "bg-yellow-100 text-yellow-800"} font-work-sans`
                        }>
                          {test.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center font-work-sans">
                          {kpiInfo?.icon &&
                          <div className="w-5 h-5 mr-2 font-work-sans">
                              <Image
                              src={kpiInfo.icon}
                              alt={kpiInfo.title}
                              width={20}
                              height={20} />

                            </div>
                          }
                          <div className="text-sm text-[var(--secondary-color)] font-['Work_Sans'] font-work-sans">
                            {test.kpi || (kpiInfo ? kpiInfo.title : "-----------------")}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 font-work-sans">
                          <div
                            className="bg-[var(--accent-color)] h-2.5 rounded-full font-work-sans"
                            style={{ width: `${test.completes / test.target * 100}%` }}>
                          </div>
                        </div>
                        <div className="text-xs text-[var(--secondary-color)] mt-1 font-['Work_Sans'] font-work-sans">
                          {test.completes} / {test.target}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium font-work-sans">
                        {test.status === "Completed" &&
                        <button className="text-[var(--accent-color)] hover:opacity-80 flex items-center font-['Work_Sans'] font-work-sans">
                            <svg className="mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </svg>
                            See report
                          </button>
                        }
                      </td>
                    </tr>);

                })}
              </tbody>
            </table>
                  </div>
          <div className="bg-[var(--background-color)] px-4 py-3 flex items-center justify-between border-t border-[var(--divider-color)] sm:px-6 font-work-sans">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between font-work-sans">
              <div className="font-work-sans">
                <div className="relative inline-flex items-center font-work-sans">
                  <span className="mr-2 text-sm text-[var(--secondary-color)] font-['Work_Sans'] font-work-sans">Show</span>
                  <select className="mr-2 border-[var(--divider-color)] rounded-md shadow-sm focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)] sm:text-sm font-['Work_Sans'] text-[var(--primary-color)] font-work-sans">
                    <option>10</option>
                  </select>
                </div>
              </div>
              <div className="font-work-sans">
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px font-work-sans" aria-label="Pagination">
                  <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-[var(--divider-color)] bg-[var(--background-color)] text-sm font-medium text-[var(--secondary-color)] hover:bg-gray-50 font-['Work_Sans'] font-work-sans">
                    Previous
                  </button>
                  <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-[var(--divider-color)] bg-[var(--background-color)] text-sm font-medium text-[var(--secondary-color)] hover:bg-gray-50 font-['Work_Sans'] font-work-sans">
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>);

}