"use client";

import { useState } from 'react';
import { CampaignData as ValidationCampaignData } from '@/lib/data-mapping/validation';
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
  const [uploadthingStatus, setUploadthingStatus] = useState<{ loading: boolean; data: any | null; error: string | null; }>({
    loading: false,
    data: null,
    error: null
  });
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
            ...(prev as CampaignData),
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

  const testUploadthingApi = async () => {
    setUploadthingStatus({
      loading: true,
      data: null,
      error: null
    });

    try {
      const response = await fetch('/api/uploadthing/test');
      if (!response.ok) {
        throw new Error(`Error testing Uploadthing API: ${response.statusText}`);
      }

      const data = await response.json();
      setUploadthingStatus({
        loading: false,
        data,
        error: null
      });
    } catch (error) {
      setUploadthingStatus({
        loading: false,
        data: null,
        error: error instanceof Error ? error.message : 'An error occurred'
      });
      console.error('Uploadthing test error:', error);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl font-work-sans">
      <h1 className="text-3xl font-bold mb-6 text-[var(--primary-color)] font-sora">Debug Tools</h1>

      {/* Debug Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 font-work-sans">
        {/* Campaign Data Verification Tool */}
        <div className="bg-[var(--background-color)] rounded-lg border border-[var(--divider-color)] p-6 shadow-sm font-work-sans">
          <h2 className="text-xl font-semibold mb-2 text-[var(--primary-color)] font-sora">Campaign Data Verification</h2>
          <p className="text-[var(--secondary-color)] mb-4 font-work-sans">
            Verify campaign data stored in the database and identify issues with form submissions.
          </p>
          <div className="mt-4 font-work-sans">
            <Link
              href="#campaign-verify"
              className="px-4 py-2 bg-[var(--accent-color)] text-white rounded-md inline-block hover:bg-white hover:text-[var(--accent-color)] hover:border hover:border-[var(--accent-color)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] focus:ring-offset-2 font-work-sans"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('campaign-verify')?.scrollIntoView({ behavior: 'smooth' });
              }}>

              Use Verification Tool
            </Link>
          </div>
        </div>

        {/* API Verification Tool */}
        <div className="bg-[var(--background-color)] rounded-lg border border-[var(--divider-color)] p-6 shadow-sm font-work-sans">
          <h2 className="text-xl font-semibold mb-2 text-[var(--primary-color)] font-sora">API Verification</h2>
          <p className="text-[var(--secondary-color)] mb-4 font-work-sans">
            Test and verify all external API integrations used in Justify.
          </p>
          <div className="mt-4 font-work-sans">
            <Link
              href="/debug-tools/api-verification"
              className="px-4 py-2 bg-[var(--accent-color)] text-white rounded-md inline-block hover:bg-white hover:text-[var(--accent-color)] hover:border hover:border-[var(--accent-color)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] focus:ring-offset-2 font-work-sans">

              Open API Verification
            </Link>
          </div>
        </div>

        {/* Font Awesome Test */}
        <div className="bg-[var(--background-color)] rounded-lg border border-[var(--divider-color)] p-6 shadow-sm font-work-sans">
          <h2 className="text-xl font-semibold mb-2 text-[var(--primary-color)] font-sora">Font Awesome Diagnostic</h2>
          <p className="text-[var(--secondary-color)] mb-4 font-work-sans">
            Test Font Awesome Pro connection and verify icons are loading properly across all styles.
          </p>
          <div className="mt-4 flex flex-wrap gap-3 font-work-sans">
            <Link
              href="/debug-tools/font-awesome-fixes"
              className="px-4 py-2 bg-[var(--accent-color)] text-white rounded-md inline-block hover:bg-white hover:text-[var(--accent-color)] hover:border hover:border-[var(--accent-color)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] focus:ring-offset-2 font-work-sans">

              Font Awesome Examples
            </Link>
          </div>
        </div>

        {/* UI Components Debug */}
        <div className="bg-[var(--background-color)] rounded-lg border border-[var(--divider-color)] p-6 shadow-sm font-work-sans">
          <h2 className="text-xl font-semibold mb-2 text-[var(--primary-color)] font-sora">UI Components</h2>
          <p className="text-[var(--secondary-color)] mb-4 font-work-sans">
            View and test all centralized UI components in the new component system.
          </p>
          <div className="mt-4 font-work-sans">
            <Link
              href="/debug-tools/ui-components"
              className="px-4 py-2 bg-[var(--accent-color)] text-white rounded-md inline-block hover:bg-white hover:text-[var(--accent-color)] hover:border hover:border-[var(--accent-color)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] focus:ring-offset-2 font-work-sans">

              View UI Components
            </Link>
          </div>
        </div>

        {/* Database Health */}
        <div className="bg-[var(--background-color)] rounded-lg border border-[var(--divider-color)] p-6 shadow-sm font-work-sans">
          <h2 className="text-xl font-semibold mb-2 text-[var(--primary-color)] font-sora">Database Health</h2>
          <p className="text-[var(--secondary-color)] mb-4 font-work-sans">
            Access system documentation, database schema, and health monitoring dashboards.
          </p>
          <div className="mt-4 font-work-sans">
            <Link
              href="/debug-tools/database"
              className="px-4 py-2 bg-[var(--accent-color)] text-white rounded-md inline-block hover:bg-white hover:text-[var(--accent-color)] hover:border hover:border-[var(--accent-color)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] focus:ring-offset-2 font-work-sans">

              View Database Health
            </Link>
          </div>
        </div>

        {/* Graphiti Monitoring */}
        <div className="bg-[var(--background-color)] rounded-lg border border-[var(--divider-color)] p-6 shadow-sm font-work-sans">
          <h2 className="text-xl font-semibold mb-2 text-[var(--primary-color)] font-sora">Graphiti Monitoring</h2>
          <p className="text-[var(--secondary-color)] mb-4 font-work-sans">
            Monitor Graphiti knowledge graph usage, integration health, and telemetry data.
          </p>
          <div className="mt-4 font-work-sans">
            <Link
              href="/debug-tools/graphiti-monitoring"
              className="px-4 py-2 bg-[var(--accent-color)] text-white rounded-md inline-block hover:bg-white hover:text-[var(--accent-color)] hover:border hover:border-[var(--accent-color)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] focus:ring-offset-2 font-work-sans">
              View Graphiti Dashboard
            </Link>
          </div>
        </div>

        {/* Uploadthing Test Tool */}
        <div className="bg-[var(--background-color)] rounded-lg border border-[var(--divider-color)] p-6 shadow-sm font-work-sans">
          <h2 className="text-xl font-semibold mb-2 text-[var(--primary-color)] font-sora">Uploadthing Test</h2>
          <p className="text-[var(--secondary-color)] mb-4 font-work-sans">
            Test the Uploadthing API connection and file management capabilities.
          </p>
          <div className="mt-4 flex flex-wrap gap-3 font-work-sans">
            <button
              onClick={testUploadthingApi}
              disabled={uploadthingStatus.loading}
              className="px-4 py-2 bg-[var(--accent-color)] text-white rounded-md inline-block hover:bg-white hover:text-[var(--accent-color)] hover:border hover:border-[var(--accent-color)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] focus:ring-offset-2 disabled:opacity-50 font-work-sans">

              {uploadthingStatus.loading ? 'Testing...' : 'Test Uploadthing API'}
            </button>
            <Link
              href="/settings/test-upload"
              className="px-4 py-2 bg-[var(--accent-color)] text-white rounded-md inline-block hover:bg-white hover:text-[var(--accent-color)] hover:border hover:border-[var(--accent-color)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] focus:ring-offset-2 font-work-sans">

              File Uploader
            </Link>
          </div>

          {uploadthingStatus.data &&
            <div className="mt-4 p-3 bg-gray-50 rounded-md overflow-hidden font-work-sans">
              <div className="flex items-center mb-2 font-work-sans">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${uploadthingStatus.data.success && uploadthingStatus.data.apiStatus === 'connected' ?
                    'bg-green-100 text-green-800 border border-green-200' :
                    'bg-red-100 text-red-800 border border-red-200'} font-work-sans`
                }>
                  {uploadthingStatus.data.success && uploadthingStatus.data.apiStatus === 'connected' ? 'Connected' : 'Error'}
                </span>
                <span className="text-xs text-[var(--secondary-color)] ml-2 font-work-sans">
                  {uploadthingStatus.data.env?.UPLOADTHING_TOKEN ? 'API Token Present' : 'API Token Missing'}
                </span>
              </div>
              <div className="text-xs overflow-auto max-h-40 bg-white p-2 rounded font-work-sans">
                <pre>{JSON.stringify(uploadthingStatus.data, null, 2)}</pre>
              </div>
            </div>
          }

          {uploadthingStatus.error &&
            <div className="mt-4 p-3 bg-red-50 text-red-600 border border-red-200 rounded-md text-sm font-work-sans">
              {uploadthingStatus.error}
            </div>
          }
        </div>
      </div>

      {/* Campaign Verification Tool */}
      <div id="campaign-verify" className="bg-[var(--background-color)] rounded-lg border border-[var(--divider-color)] p-6 mb-6 shadow-sm font-work-sans">
        <h2 className="text-xl font-semibold mb-4 text-[var(--primary-color)] font-sora">Verify Campaign Data</h2>
        <p className="text-[var(--secondary-color)] mb-4 font-work-sans">
          Enter a campaign ID to verify the data stored in the database. This tool helps identify issues
          with form submissions and data persistence.
        </p>

        <div className="flex gap-4 mb-6 font-work-sans">
          <input
            type="text"
            value={campaignId}
            onChange={(e) => setCampaignId(e.target.value)}
            placeholder="Enter Campaign ID"
            className="flex-grow p-2 border border-[var(--divider-color)] rounded-md focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)] font-work-sans" />

          <button
            onClick={fetchCampaignData}
            disabled={loading}
            className="px-4 py-2 bg-[var(--accent-color)] text-white rounded-md hover:bg-white hover:text-[var(--accent-color)] hover:border hover:border-[var(--accent-color)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] focus:ring-offset-2 disabled:opacity-50 font-work-sans">

            {loading ? 'Loading...' : 'Verify Data'}
          </button>
        </div>

        {error &&
          <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-200 rounded-md font-work-sans">
            {error}
          </div>
        }

        <div className="grid grid-cols-4 gap-4 mb-6 font-work-sans">
          {[1, 2, 3, 4].map((step) =>
            <button
              key={step}
              onClick={() => navigateToCampaignForm(step)}
              className="p-3 bg-gray-100 text-[var(--primary-color)] rounded-md hover:bg-white hover:border hover:border-[var(--accent-color)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] focus:ring-offset-2 font-work-sans">

              Go to Step {step}
            </button>
          )}
        </div>
      </div>

      {results &&
        <div className="bg-[var(--background-color)] rounded-lg border border-[var(--divider-color)] p-6 shadow-sm font-work-sans">
          <h2 className="text-xl font-semibold mb-4 text-[var(--primary-color)] font-sora">Campaign Data</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-work-sans">
            {/* Basic Details */}
            <div className="bg-gray-50 p-4 rounded-md font-work-sans">
              <h3 className="font-medium text-lg mb-2 text-[var(--primary-color)] font-sora">Basic Information</h3>
              <table className="w-full text-sm font-work-sans">
                <tbody>
                  <tr>
                    <td className="py-1 font-medium text-[var(--secondary-color)] font-work-sans">ID:</td>
                    <td className="py-1">{results.id}</td>
                  </tr>
                  <tr>
                    <td className="py-1 font-medium text-[var(--secondary-color)] font-work-sans">Name:</td>
                    <td className="py-1">{results.campaignName}</td>
                  </tr>
                  <tr>
                    <td className="py-1 font-medium text-[var(--secondary-color)] font-work-sans">Description:</td>
                    <td className="py-1">{results.description}</td>
                  </tr>
                  <tr>
                    <td className="py-1 font-medium text-[var(--secondary-color)] font-work-sans">Start Date:</td>
                    <td className="py-1">{results.startDate ? new Date(results.startDate).toLocaleDateString() : 'N/A'}</td>
                  </tr>
                  <tr>
                    <td className="py-1 font-medium text-[var(--secondary-color)] font-work-sans">End Date:</td>
                    <td className="py-1">{results.endDate ? new Date(results.endDate).toLocaleDateString() : 'N/A'}</td>
                  </tr>
                  <tr>
                    <td className="py-1 font-medium text-[var(--secondary-color)] font-work-sans">Time Zone:</td>
                    <td className="py-1">{results.timeZone}</td>
                  </tr>
                  <tr>
                    <td className="py-1 font-medium text-[var(--secondary-color)] font-work-sans">Status:</td>
                    <td className="py-1">{results.status}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Financial Information */}
            <div className="bg-gray-50 p-4 rounded-md font-work-sans">
              <h3 className="font-medium text-lg mb-2 text-[var(--primary-color)] font-sora">Financial Information</h3>
              <table className="w-full text-sm font-work-sans">
                <tbody>
                  <tr>
                    <td className="py-1 font-medium text-[var(--secondary-color)] font-work-sans">Currency:</td>
                    <td className="py-1">{results.currency}</td>
                  </tr>
                  <tr>
                    <td className="py-1 font-medium text-[var(--secondary-color)] font-work-sans">Total Budget:</td>
                    <td className="py-1">{results.totalBudget}</td>
                  </tr>
                  <tr>
                    <td className="py-1 font-medium text-[var(--secondary-color)] font-work-sans">Social Media Budget:</td>
                    <td className="py-1">{results.socialMediaBudget}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Primary Contact */}
            <div className="bg-gray-50 p-4 rounded-md font-work-sans">
              <h3 className="font-medium text-lg mb-2 text-[var(--primary-color)] font-sora">Primary Contact</h3>
              {results.primaryContact ?
                <table className="w-full text-sm font-work-sans">
                  <tbody>
                    <tr>
                      <td className="py-1 font-medium text-[var(--secondary-color)] font-work-sans">Name:</td>
                      <td className="py-1">{results.primaryContact.firstName} {results.primaryContact.surname}</td>
                    </tr>
                    <tr>
                      <td className="py-1 font-medium text-[var(--secondary-color)] font-work-sans">Email:</td>
                      <td className="py-1">{results.primaryContact.email}</td>
                    </tr>
                    <tr>
                      <td className="py-1 font-medium text-[var(--secondary-color)] font-work-sans">Position:</td>
                      <td className="py-1">{results.primaryContact.position}</td>
                    </tr>
                  </tbody>
                </table> :

                <p className="text-red-500 font-work-sans">Primary contact data missing</p>
              }
            </div>

            {/* Secondary Contact */}
            <div className="bg-gray-50 p-4 rounded-md font-work-sans">
              <h3 className="font-medium text-lg mb-2 text-[var(--primary-color)] font-sora">Secondary Contact</h3>
              {results.secondaryContact ?
                <table className="w-full text-sm font-work-sans">
                  <tbody>
                    <tr>
                      <td className="py-1 font-medium text-[var(--secondary-color)] font-work-sans">Name:</td>
                      <td className="py-1">{results.secondaryContact.firstName} {results.secondaryContact.surname}</td>
                    </tr>
                    <tr>
                      <td className="py-1 font-medium text-[var(--secondary-color)] font-work-sans">Email:</td>
                      <td className="py-1">{results.secondaryContact.email}</td>
                    </tr>
                    <tr>
                      <td className="py-1 font-medium text-[var(--secondary-color)] font-work-sans">Position:</td>
                      <td className="py-1">{results.secondaryContact.position}</td>
                    </tr>
                  </tbody>
                </table> :

                <p className="text-yellow-600 font-work-sans">No secondary contact</p>
              }
            </div>

            {/* Additional Contacts */}
            <div className="bg-gray-50 p-4 rounded-md col-span-1 md:col-span-2 font-work-sans">
              <h3 className="font-medium text-lg mb-2 text-[var(--primary-color)] font-sora">Additional Contacts</h3>
              {results.contacts ?
                <div className="font-work-sans">
                  {(() => {
                    try {
                      const contacts = JSON.parse(results.contacts);
                      if (Array.isArray(contacts) && contacts.length > 0) {
                        return (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-work-sans">
                            {contacts.map((contact, index) =>
                              <div key={index} className="border border-[var(--divider-color)] rounded p-2 font-work-sans">
                                <p className="font-medium font-work-sans">{contact.firstName} {contact.surname}</p>
                                <p className="text-sm text-[var(--secondary-color)] font-work-sans">{contact.email}</p>
                                <p className="text-sm text-[var(--secondary-color)] font-work-sans">{contact.position}</p>
                              </div>
                            )}
                          </div>);

                      } else {
                        return <p className="text-[var(--secondary-color)] font-work-sans">No additional contacts</p>;
                      }
                    } catch (e) {
                      return <p className="text-red-500 font-work-sans">Error parsing additional contacts</p>;
                    }
                  })()}
                </div> :

                <p className="text-[var(--secondary-color)] font-work-sans">No additional contacts data</p>
              }
            </div>

            {/* Platform Information */}
            <div className="bg-gray-50 p-4 rounded-md font-work-sans">
              <h3 className="font-medium text-lg mb-2 text-[var(--primary-color)] font-sora">Platform Information</h3>
              <table className="w-full text-sm font-work-sans">
                <tbody>
                  <tr>
                    <td className="py-1 font-medium text-[var(--secondary-color)] font-work-sans">Platform:</td>
                    <td className="py-1">{results.platform}</td>
                  </tr>
                  <tr>
                    <td className="py-1 font-medium text-[var(--secondary-color)] font-work-sans">Influencer Handle:</td>
                    <td className="py-1">{results.influencerHandle}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Objectives */}
            <div className="bg-gray-50 p-4 rounded-md font-work-sans">
              <h3 className="font-medium text-lg mb-2 text-[var(--primary-color)] font-sora">Objectives</h3>
              {results.objectives ?
                <div className="font-work-sans">
                  {(() => {
                    try {
                      const objectives = JSON.parse(results.objectives);
                      return (
                        <div className="font-work-sans">
                          <p className="font-work-sans"><span className="font-medium font-work-sans">Main Message:</span> {objectives.mainMessage}</p>
                          <p className="font-work-sans"><span className="font-medium font-work-sans">Hashtags:</span> {objectives.hashtags}</p>
                          <p className="font-work-sans"><span className="font-medium font-work-sans">Primary KPI:</span> {objectives.primaryKPI?.name} ({objectives.primaryKPI?.target})</p>
                          <p className="font-work-sans"><span className="font-medium font-work-sans">Secondary KPIs:</span> {objectives.secondaryKPIs?.length || 0}</p>
                          <p className="font-work-sans"><span className="font-medium font-work-sans">Features:</span> {objectives.features?.length || 0}</p>
                        </div>);

                    } catch (e) {
                      return <p className="text-red-500 font-work-sans">Error parsing objectives data</p>;
                    }
                  })()}
                </div> :

                <p className="text-yellow-600 font-work-sans">No objectives data</p>
              }
            </div>

            {/* Raw JSON Data */}
            <div className="bg-gray-50 p-4 rounded-md col-span-1 md:col-span-2 font-work-sans">
              <h3 className="font-medium text-lg mb-2 text-[var(--primary-color)] font-sora">Raw Data</h3>
              <div className="bg-[var(--background-color)] text-[var(--accent-color)] p-3 rounded overflow-auto max-h-96 font-work-sans">
                <pre className="text-xs font-work-sans">{JSON.stringify(results, null, 2)}</pre>
              </div>
            </div>
          </div>
        </div>
      }
    </div>);

}