"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface CampaignData {
  id?: string;
  campaignName?: string;
  description?: string;
  startDate?: string | Date;
  endDate?: string | Date;
  timeZone?: string;
  status?: string;
  currency?: string;
  totalBudget?: number | string;
  socialMediaBudget?: number | string;
  platform?: string;
  influencerHandle?: string;
  primaryContact?: any;
  secondaryContact?: any;
  contacts?: string;
  objectives?: string;
  contactsData?: any;
  [key: string]: any;
}

export default function DebugTools() {
  const [campaignId, setCampaignId] = useState<string>('');
  const [results, setResults] = useState<CampaignData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchCampaignData = async () => {
    if (!campaignId) {
      setError('Please enter a campaign ID');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/campaigns/${campaignId}`);
      if (!response.ok) {
        throw new Error(`Error fetching campaign: ${response.statusText}`);
      }
      
      const data = await response.json();
      setResults(data);
      
      // Also fetch contacts if not included in the main response
      try {
        const contactsResponse = await fetch(`/api/campaigns/${campaignId}/contacts`);
        if (contactsResponse.ok) {
          const contactsData = await contactsResponse.json();
          setResults((prev: CampaignData | null) => ({
            ...prev as CampaignData,
            contactsData
          }));
        }
      } catch (e) {
        console.error('Error fetching contacts:', e);
      }
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
      console.error('Debug tools error:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigateToCampaignForm = (step: number) => {
    if (!campaignId) {
      setError('Please enter a campaign ID');
      return;
    }
    router.push(`/campaigns/wizard/step-${step}?id=${campaignId}`);
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <h1 className="text-3xl font-bold mb-6 text-[var(--primary-color)]">Debug Tools</h1>
      
      {/* Debug Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Campaign Data Verification Tool */}
        <div className="bg-[var(--background-color)] rounded-lg border border-[var(--divider-color)] p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-2 text-[var(--primary-color)]">Campaign Data Verification</h2>
          <p className="text-[var(--secondary-color)] mb-4">
            Verify campaign data stored in the database and identify issues with form submissions.
          </p>
          <div className="mt-4">
            <Link
              href="#campaign-verify"
              className="px-4 py-2 bg-[var(--accent-color)] text-white rounded-md inline-block hover:bg-white hover:text-[var(--accent-color)] hover:border hover:border-[var(--accent-color)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] focus:ring-offset-2"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('campaign-verify')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Use Verification Tool
            </Link>
          </div>
        </div>
        
        {/* API Verification Tool */}
        <div className="bg-[var(--background-color)] rounded-lg border border-[var(--divider-color)] p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-2 text-[var(--primary-color)]">API Verification</h2>
          <p className="text-[var(--secondary-color)] mb-4">
            Test and verify all external API integrations used in Justify.
          </p>
          <div className="mt-4">
            <Link
              href="/debug-tools/api-verification"
              className="px-4 py-2 bg-[var(--accent-color)] text-white rounded-md inline-block hover:bg-white hover:text-[var(--accent-color)] hover:border hover:border-[var(--accent-color)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] focus:ring-offset-2"
            >
              Open API Verification
            </Link>
          </div>
        </div>
      </div>
      
      {/* Campaign Verification Tool */}
      <div id="campaign-verify" className="bg-[var(--background-color)] rounded-lg border border-[var(--divider-color)] p-6 mb-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-[var(--primary-color)]">Verify Campaign Data</h2>
        <p className="text-[var(--secondary-color)] mb-4">
          Enter a campaign ID to verify the data stored in the database. This tool helps identify issues
          with form submissions and data persistence.
        </p>
        
        <div className="flex gap-4 mb-6">
          <input
            type="text"
            value={campaignId}
            onChange={(e) => setCampaignId(e.target.value)}
            placeholder="Enter Campaign ID"
            className="flex-grow p-2 border border-[var(--divider-color)] rounded-md focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)]"
          />
          <button
            onClick={fetchCampaignData}
            disabled={loading}
            className="px-4 py-2 bg-[var(--accent-color)] text-white rounded-md hover:bg-white hover:text-[var(--accent-color)] hover:border hover:border-[var(--accent-color)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Verify Data'}
          </button>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-200 rounded-md">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map(step => (
            <button
              key={step}
              onClick={() => navigateToCampaignForm(step)}
              className="p-3 bg-gray-100 text-[var(--primary-color)] rounded-md hover:bg-white hover:border hover:border-[var(--accent-color)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] focus:ring-offset-2"
            >
              Go to Step {step}
            </button>
          ))}
        </div>
      </div>
      
      {results && (
        <div className="bg-[var(--background-color)] rounded-lg border border-[var(--divider-color)] p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-[var(--primary-color)]">Campaign Data</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Details */}
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium text-lg mb-2 text-[var(--primary-color)]">Basic Information</h3>
              <table className="w-full text-sm">
                <tbody>
                  <tr>
                    <td className="py-1 font-medium text-[var(--secondary-color)]">ID:</td>
                    <td className="py-1">{results.id}</td>
                  </tr>
                  <tr>
                    <td className="py-1 font-medium text-[var(--secondary-color)]">Name:</td>
                    <td className="py-1">{results.campaignName}</td>
                  </tr>
                  <tr>
                    <td className="py-1 font-medium text-[var(--secondary-color)]">Description:</td>
                    <td className="py-1">{results.description}</td>
                  </tr>
                  <tr>
                    <td className="py-1 font-medium text-[var(--secondary-color)]">Start Date:</td>
                    <td className="py-1">{results.startDate ? new Date(results.startDate).toLocaleDateString() : 'N/A'}</td>
                  </tr>
                  <tr>
                    <td className="py-1 font-medium text-[var(--secondary-color)]">End Date:</td>
                    <td className="py-1">{results.endDate ? new Date(results.endDate).toLocaleDateString() : 'N/A'}</td>
                  </tr>
                  <tr>
                    <td className="py-1 font-medium text-[var(--secondary-color)]">Time Zone:</td>
                    <td className="py-1">{results.timeZone}</td>
                  </tr>
                  <tr>
                    <td className="py-1 font-medium text-[var(--secondary-color)]">Status:</td>
                    <td className="py-1">{results.status}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            {/* Financial Information */}
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium text-lg mb-2 text-[var(--primary-color)]">Financial Information</h3>
              <table className="w-full text-sm">
                <tbody>
                  <tr>
                    <td className="py-1 font-medium text-[var(--secondary-color)]">Currency:</td>
                    <td className="py-1">{results.currency}</td>
                  </tr>
                  <tr>
                    <td className="py-1 font-medium text-[var(--secondary-color)]">Total Budget:</td>
                    <td className="py-1">{results.totalBudget}</td>
                  </tr>
                  <tr>
                    <td className="py-1 font-medium text-[var(--secondary-color)]">Social Media Budget:</td>
                    <td className="py-1">{results.socialMediaBudget}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            {/* Primary Contact */}
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium text-lg mb-2 text-[var(--primary-color)]">Primary Contact</h3>
              {results.primaryContact ? (
                <table className="w-full text-sm">
                  <tbody>
                    <tr>
                      <td className="py-1 font-medium text-[var(--secondary-color)]">Name:</td>
                      <td className="py-1">{results.primaryContact.firstName} {results.primaryContact.surname}</td>
                    </tr>
                    <tr>
                      <td className="py-1 font-medium text-[var(--secondary-color)]">Email:</td>
                      <td className="py-1">{results.primaryContact.email}</td>
                    </tr>
                    <tr>
                      <td className="py-1 font-medium text-[var(--secondary-color)]">Position:</td>
                      <td className="py-1">{results.primaryContact.position}</td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <p className="text-red-500">Primary contact data missing</p>
              )}
            </div>
            
            {/* Secondary Contact */}
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium text-lg mb-2 text-[var(--primary-color)]">Secondary Contact</h3>
              {results.secondaryContact ? (
                <table className="w-full text-sm">
                  <tbody>
                    <tr>
                      <td className="py-1 font-medium text-[var(--secondary-color)]">Name:</td>
                      <td className="py-1">{results.secondaryContact.firstName} {results.secondaryContact.surname}</td>
                    </tr>
                    <tr>
                      <td className="py-1 font-medium text-[var(--secondary-color)]">Email:</td>
                      <td className="py-1">{results.secondaryContact.email}</td>
                    </tr>
                    <tr>
                      <td className="py-1 font-medium text-[var(--secondary-color)]">Position:</td>
                      <td className="py-1">{results.secondaryContact.position}</td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <p className="text-yellow-600">No secondary contact</p>
              )}
            </div>
            
            {/* Additional Contacts */}
            <div className="bg-gray-50 p-4 rounded-md col-span-1 md:col-span-2">
              <h3 className="font-medium text-lg mb-2 text-[var(--primary-color)]">Additional Contacts</h3>
              {results.contacts ? (
                <div>
                  {(() => {
                    try {
                      const contacts = JSON.parse(results.contacts);
                      if (Array.isArray(contacts) && contacts.length > 0) {
                        return (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {contacts.map((contact, index) => (
                              <div key={index} className="border border-[var(--divider-color)] rounded p-2">
                                <p className="font-medium">{contact.firstName} {contact.surname}</p>
                                <p className="text-sm text-[var(--secondary-color)]">{contact.email}</p>
                                <p className="text-sm text-[var(--secondary-color)]">{contact.position}</p>
                              </div>
                            ))}
                          </div>
                        );
                      } else {
                        return <p className="text-[var(--secondary-color)]">No additional contacts</p>;
                      }
                    } catch (e) {
                      return <p className="text-red-500">Error parsing additional contacts</p>;
                    }
                  })()}
                </div>
              ) : (
                <p className="text-[var(--secondary-color)]">No additional contacts data</p>
              )}
            </div>
            
            {/* Platform Information */}
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium text-lg mb-2 text-[var(--primary-color)]">Platform Information</h3>
              <table className="w-full text-sm">
                <tbody>
                  <tr>
                    <td className="py-1 font-medium text-[var(--secondary-color)]">Platform:</td>
                    <td className="py-1">{results.platform}</td>
                  </tr>
                  <tr>
                    <td className="py-1 font-medium text-[var(--secondary-color)]">Influencer Handle:</td>
                    <td className="py-1">{results.influencerHandle}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            {/* Objectives */}
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium text-lg mb-2 text-[var(--primary-color)]">Objectives</h3>
              {results.objectives ? (
                <div>
                  {(() => {
                    try {
                      const objectives = JSON.parse(results.objectives);
                      return (
                        <div>
                          <p><span className="font-medium">Main Message:</span> {objectives.mainMessage}</p>
                          <p><span className="font-medium">Hashtags:</span> {objectives.hashtags}</p>
                          <p><span className="font-medium">Primary KPI:</span> {objectives.primaryKPI?.name} ({objectives.primaryKPI?.target})</p>
                          <p><span className="font-medium">Secondary KPIs:</span> {objectives.secondaryKPIs?.length || 0}</p>
                          <p><span className="font-medium">Features:</span> {objectives.features?.length || 0}</p>
                        </div>
                      );
                    } catch (e) {
                      return <p className="text-red-500">Error parsing objectives data</p>;
                    }
                  })()}
                </div>
              ) : (
                <p className="text-yellow-600">No objectives data</p>
              )}
            </div>
            
            {/* Raw JSON Data */}
            <div className="bg-gray-50 p-4 rounded-md col-span-1 md:col-span-2">
              <h3 className="font-medium text-lg mb-2 text-[var(--primary-color)]">Raw Data</h3>
              <div className="bg-[var(--background-color)] text-[var(--accent-color)] p-3 rounded overflow-auto max-h-96">
                <pre className="text-xs">{JSON.stringify(results, null, 2)}</pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 