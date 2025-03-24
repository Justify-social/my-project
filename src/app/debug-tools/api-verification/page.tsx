'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  verifyGeolocationApi,
  verifyExchangeRatesApi,
  verifyPhylloApi,
  verifyCintExchangeApi,
  verifyGiphyApi,
  verifyStripeApi,
  verifyAuth0Api,
  verifyUploadthingApi,
  verifyDatabaseConnection,
  verifyAllApis,
  ApiVerificationResult,
  ApiErrorType } from
'@/lib/api-verification';

/**
 * Helper function to check if a host is reachable without triggering CORS issues
 */
async function isHostReachable(hostname: string): Promise<{reachable: boolean;latency?: number;}> {
  const startTime = Date.now();

  try {
    // Use a HEAD request which is lightweight
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`https://${hostname}/`, {
      method: 'HEAD',
      mode: 'no-cors', // This prevents CORS errors but means we can't read the response
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const latency = Date.now() - startTime;

    // With mode: 'no-cors', the response type is 'opaque' and we can't read status
    // But if we get here without an error, the host is likely reachable
    return { reachable: true, latency };
  } catch (error) {
    console.warn(`Host ${hostname} connectivity check failed:`, error);
    return { reachable: false };
  }
}

/**
 * API Verification Debug Tool
 * 
 * This page allows administrators to test and verify external API integrations
 * used in Justify. It provides detailed information about API
 * response times, status, and any potential issues.
 */
export default function ApiVerificationPage() {
  const [results, setResults] = useState<ApiVerificationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedApi, setSelectedApi] = useState<string>('');
  const [lastTested, setLastTested] = useState<Record<string, Date | null>>({
    all: null,
    geolocation: null,
    exchange: null,
    phyllo: null,
    giphy: null,
    cint: null,
    stripe: null,
    auth0: null,
    uploadthing: null,
    database: null
  });

  // API descriptions shown in the UI
  const apiDescriptions: Record<string, string> = {
    geolocation: "Used to determine user location for targeted campaigns and localized content. Helps optimize campaign delivery to specific regions.",
    exchange: "Powers currency conversion for budgeting in the Campaign Wizard. Ensures accurate financial calculations across different currencies.",
    phyllo: "Integrates with influencer platforms to verify accounts and retrieve metrics. Critical for influencer-based campaigns.",
    giphy: "Powers GIF search and integration for campaign creative content. Provides access to an extensive library of animated content.",
    cint: "Market research platform that connects to consumer panels for surveys and audience insights. Essential for campaign targeting and market validation.",
    stripe: "Payment processing platform for subscription and one-time payments. Powers the billing system for premium features.",
    auth0: "Authentication and user management platform. Handles user sign-up, login, and profile management.",
    uploadthing: "File upload service for handling media uploads. Used for storing and managing user-generated content.",
    database: "Database connection using Postgres. Stores all application data including user profiles, campaigns, and analytics."
  };

  // Test a specific API
  const testApi = async (apiName: string) => {
    setIsLoading(true);
    setSelectedApi(apiName);

    try {
      let result: ApiVerificationResult;

      switch (apiName) {
        case 'geolocation':
          result = await verifyGeolocationApi();
          break;
        case 'exchange':
          result = await verifyExchangeRatesApi();
          break;
        case 'phyllo':
          result = await verifyPhylloApi();
          break;
        case 'giphy':
          result = await verifyGiphyApi();
          break;
        case 'cint':
          result = await verifyCintExchangeApi();
          break;
        case 'stripe':
          result = await verifyStripeApi();
          break;
        case 'auth0':
          result = await verifyAuth0Api();
          break;
        case 'uploadthing':
          result = await verifyUploadthingApi();
          break;
        case 'database':
          result = await verifyDatabaseConnection();
          break;
        default:
          throw new Error(`Unknown API: ${apiName}`);
      }

      setResults([result]);
      setLastTested((prev) => ({
        ...prev,
        [apiName]: new Date()
      }));
    } catch (error) {
      console.error(`Error testing API: ${apiName}`, error);
    } finally {
      setIsLoading(false);
    }
  };

  // Test all APIs
  const testAllApis = async () => {
    setIsLoading(true);
    setSelectedApi('all');

    try {
      const geolocationResult = await verifyGeolocationApi();
      const exchangeRatesResult = await verifyExchangeRatesApi();
      const phylloResult = await verifyPhylloApi();
      const giphyResult = await verifyGiphyApi();
      const cintResult = await verifyCintExchangeApi();
      const stripeResult = await verifyStripeApi();
      const auth0Result = await verifyAuth0Api();
      const uploadthingResult = await verifyUploadthingApi();
      const databaseResult = await verifyDatabaseConnection();

      const allResults = [
      geolocationResult,
      exchangeRatesResult,
      phylloResult,
      giphyResult,
      cintResult,
      stripeResult,
      auth0Result,
      uploadthingResult,
      databaseResult];


      setResults(allResults);
      setLastTested((prev) => ({
        ...prev,
        all: new Date(),
        geolocation: new Date(),
        exchange: new Date(),
        phyllo: new Date(),
        giphy: new Date(),
        cint: new Date(),
        stripe: new Date(),
        auth0: new Date(),
        uploadthing: new Date(),
        database: new Date()
      }));
    } catch (error) {
      console.error('Error testing all APIs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Format latency as "123 ms"
  const formatLatency = (latency?: number) => {
    return latency ? `${latency} ms` : 'N/A';
  };

  // Get appropriate color class based on latency
  const getLatencyColorClass = (latency?: number) => {
    if (!latency) return 'text-gray-500';
    if (latency < 300) return 'text-green-500';
    if (latency < 1000) return 'text-yellow-500';
    return 'text-red-500';
  };

  // Get status badge class based on success
  const getStatusBadgeClass = (success: boolean) => {
    return success ?
    'bg-green-100 text-green-800 border-green-200' :
    'bg-red-100 text-red-800 border-red-200';
  };

  // Get error type badge class
  const getErrorTypeBadgeClass = (errorType: ApiErrorType) => {
    switch (errorType) {
      case ApiErrorType.NETWORK_ERROR:
      case ApiErrorType.TIMEOUT_ERROR:
        return 'bg-red-100 text-red-800 border-red-200';
      case ApiErrorType.RATE_LIMIT_ERROR:
      case ApiErrorType.SERVER_ERROR:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case ApiErrorType.AUTHENTICATION_ERROR:
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case ApiErrorType.VALIDATION_ERROR:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case ApiErrorType.NOT_FOUND_ERROR:
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Format timestamp as local date/time string
  const formatTimestamp = (date: Date | null) => {
    if (!date) return 'Never';
    return date.toLocaleString();
  };

  // Render API badge
  const renderApiBadge = (apiName: string, lastTestedDate: Date | null, isInResults: boolean = false) => {
    const hasBeenTested = lastTestedDate !== null;
    const result = results.find((r) => r.apiName.includes(apiName));
    const isSuccess = result?.success || false;

    if (!hasBeenTested) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200 font-work-sans">
          Not Tested
        </span>);

    }

    if (isInResults && result) {
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(isSuccess)} font-work-sans`}>
          {isSuccess ? 'Verified' : 'Failed'}
        </span>);

    }

    // If it's been tested but not in current results
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200 font-work-sans">
        Previously Tested
      </span>);

  };

  return (
    <div className="container mx-auto px-4 py-8 font-work-sans">
      <header className="mb-8 font-sora">
        <div className="flex items-center justify-between font-work-sans">
          <div className="font-work-sans">
            <h1 className="text-2xl font-bold text-gray-900 font-sora">API Verification Debug Tool</h1>
            <p className="mt-1 text-gray-600 font-work-sans">
              Test and verify all external API integrations used in Justify
            </p>
          </div>
          <Link
            href="/debug-tools"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 font-work-sans">

            Back to Debug Tools
          </Link>
        </div>
      </header>

      <div className="bg-white rounded-lg shadow overflow-hidden font-work-sans">
        <div className="p-6 border-b font-work-sans">
          <h2 className="text-lg font-medium text-gray-900 font-sora">Test External APIs</h2>
          <p className="mt-1 text-sm text-gray-500 font-work-sans">
            Verify that all external API integrations are functioning correctly
          </p>
        </div>

        <div className="p-6 bg-gray-50 space-y-6 font-work-sans">
          {/* API Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 font-work-sans">
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm font-work-sans">
              <div className="flex justify-between items-start font-work-sans">
                <h3 className="font-medium text-gray-900 font-sora">IP Geolocation API</h3>
                {renderApiBadge('IP Geolocation API', lastTested.geolocation, results.some((r) => r.apiName.includes('IP Geolocation')))}
              </div>
              <p className="text-sm text-gray-500 mt-1 font-work-sans">{apiDescriptions.geolocation}</p>
              <div className="mt-2 text-xs text-gray-500 font-work-sans">
                Last tested: <span className="font-medium font-work-sans">{formatTimestamp(lastTested.geolocation)}</span>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm font-work-sans">
              <div className="flex justify-between items-start font-work-sans">
                <h3 className="font-medium text-gray-900 font-sora">Exchange Rates API</h3>
                {renderApiBadge('Exchange Rates API', lastTested.exchange, results.some((r) => r.apiName.includes('Exchange Rates')))}
              </div>
              <p className="text-sm text-gray-500 mt-1 font-work-sans">{apiDescriptions.exchange}</p>
              <div className="mt-2 text-xs text-gray-500 font-work-sans">
                Last tested: <span className="font-medium font-work-sans">{formatTimestamp(lastTested.exchange)}</span>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm font-work-sans">
              <div className="flex justify-between items-start font-work-sans">
                <h3 className="font-medium text-gray-900 font-sora">Phyllo API</h3>
                {renderApiBadge('Phyllo API', lastTested.phyllo, results.some((r) => r.apiName.includes('Phyllo')))}
              </div>
              <p className="text-sm text-gray-500 mt-1 font-work-sans">{apiDescriptions.phyllo}</p>
              <div className="mt-2 text-xs text-gray-500 font-work-sans">
                Last tested: <span className="font-medium font-work-sans">{formatTimestamp(lastTested.phyllo)}</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm font-work-sans">
              <div className="flex justify-between items-start font-work-sans">
                <h3 className="font-medium text-gray-900 font-sora">GIPHY API</h3>
                {renderApiBadge('GIPHY API', lastTested.giphy, results.some((r) => r.apiName.includes('GIPHY')))}
              </div>
              <p className="text-sm text-gray-500 mt-1 font-work-sans">{apiDescriptions.giphy}</p>
              <div className="mt-2 text-xs text-gray-500 font-work-sans">
                Last tested: <span className="font-medium font-work-sans">{formatTimestamp(lastTested.giphy || null)}</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm font-work-sans">
              <div className="flex justify-between items-start font-work-sans">
                <h3 className="font-medium text-gray-900 font-sora">Cint Exchange API</h3>
                {renderApiBadge('Cint Exchange API', lastTested.cint, results.some((r) => r.apiName.includes('Cint')))}
              </div>
              <p className="text-sm text-gray-500 mt-1 font-work-sans">{apiDescriptions.cint}</p>
              <div className="mt-2 text-xs text-gray-500 font-work-sans">
                Last tested: <span className="font-medium font-work-sans">{formatTimestamp(lastTested.cint || null)}</span>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm font-work-sans">
              <div className="flex justify-between items-start font-work-sans">
                <h3 className="font-medium text-gray-900 font-sora">Stripe API</h3>
                {renderApiBadge('Stripe API', lastTested.stripe, results.some((r) => r.apiName.includes('Stripe')))}
              </div>
              <p className="text-sm text-gray-500 mt-1 font-work-sans">{apiDescriptions.stripe}</p>
              <div className="mt-2 text-xs text-gray-500 font-work-sans">
                Last tested: <span className="font-medium font-work-sans">{formatTimestamp(lastTested.stripe || null)}</span>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm font-work-sans">
              <div className="flex justify-between items-start font-work-sans">
                <h3 className="font-medium text-gray-900 font-sora">Auth0 API</h3>
                {renderApiBadge('Auth0 API', lastTested.auth0, results.some((r) => r.apiName.includes('Auth0')))}
              </div>
              <p className="text-sm text-gray-500 mt-1 font-work-sans">{apiDescriptions.auth0}</p>
              <div className="mt-2 text-xs text-gray-500 font-work-sans">
                Last tested: <span className="font-medium font-work-sans">{formatTimestamp(lastTested.auth0 || null)}</span>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm font-work-sans">
              <div className="flex justify-between items-start font-work-sans">
                <h3 className="font-medium text-gray-900 font-sora">Uploadthing API</h3>
                {renderApiBadge('Uploadthing API', lastTested.uploadthing, results.some((r) => r.apiName.includes('Uploadthing')))}
              </div>
              <p className="text-sm text-gray-500 mt-1 font-work-sans">{apiDescriptions.uploadthing}</p>
              <div className="mt-2 text-xs text-gray-500 font-work-sans">
                Last tested: <span className="font-medium font-work-sans">{formatTimestamp(lastTested.uploadthing || null)}</span>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm font-work-sans">
              <div className="flex justify-between items-start font-work-sans">
                <h3 className="font-medium text-gray-900 font-sora">Database Connection</h3>
                {renderApiBadge('Database Connection', lastTested.database, results.some((r) => r.apiName.includes('Database')))}
              </div>
              <p className="text-sm text-gray-500 mt-1 font-work-sans">{apiDescriptions.database}</p>
              <div className="mt-2 text-xs text-gray-500 font-work-sans">
                Last tested: <span className="font-medium font-work-sans">{formatTimestamp(lastTested.database || null)}</span>
              </div>
            </div>
          </div>

          {/* API Selection */}
          <div className="mb-6 font-work-sans">
            <h2 className="text-lg font-bold text-primary-color font-sora mb-3">Select API to Test</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 font-work-sans">
              <button
                onClick={() => testApi('geolocation')}
                className={`px-4 py-3 rounded-md border font-work-sans transition-colors ${
                selectedApi === 'geolocation' ?
                'bg-accent-color text-white border-accent-color' :
                'bg-white text-gray-700 border-gray-200 hover:border-accent-color hover:text-accent-color'}`
                }
                disabled={isLoading}>

                {isLoading && selectedApi === 'geolocation' ?
                <div className="flex items-center justify-center font-work-sans">
                    <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 font-work-sans"></span>
                    <span className="font-work-sans">Testing...</span>
                  </div> :

                'IP Geolocation API'
                }
              </button>
              
              <button
                onClick={() => testApi('exchange')}
                className={`px-4 py-3 rounded-md border font-work-sans transition-colors ${
                selectedApi === 'exchange' ?
                'bg-accent-color text-white border-accent-color' :
                'bg-white text-gray-700 border-gray-200 hover:border-accent-color hover:text-accent-color'}`
                }
                disabled={isLoading}>

                {isLoading && selectedApi === 'exchange' ?
                <div className="flex items-center justify-center font-work-sans">
                    <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 font-work-sans"></span>
                    <span className="font-work-sans">Testing...</span>
                  </div> :

                'Exchange Rates API'
                }
              </button>
              
              <button
                onClick={() => testApi('phyllo')}
                className={`px-4 py-3 rounded-md border font-work-sans transition-colors ${
                selectedApi === 'phyllo' ?
                'bg-accent-color text-white border-accent-color' :
                'bg-white text-gray-700 border-gray-200 hover:border-accent-color hover:text-accent-color'}`
                }
                disabled={isLoading}>

                {isLoading && selectedApi === 'phyllo' ?
                <div className="flex items-center justify-center font-work-sans">
                    <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 font-work-sans"></span>
                    <span className="font-work-sans">Testing...</span>
                  </div> :

                'Phyllo API'
                }
              </button>
              
              <button
                onClick={() => testApi('giphy')}
                className={`px-4 py-3 rounded-md border font-work-sans transition-colors ${
                selectedApi === 'giphy' ?
                'bg-accent-color text-white border-accent-color' :
                'bg-white text-gray-700 border-gray-200 hover:border-accent-color hover:text-accent-color'}`
                }
                disabled={isLoading}>

                {isLoading && selectedApi === 'giphy' ?
                <div className="flex items-center justify-center font-work-sans">
                    <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 font-work-sans"></span>
                    <span className="font-work-sans">Testing...</span>
                  </div> :

                'GIPHY API'
                }
              </button>
              
              <button
                onClick={() => testApi('cint')}
                className={`px-4 py-3 rounded-md border font-work-sans transition-colors ${
                selectedApi === 'cint' ?
                'bg-accent-color text-white border-accent-color' :
                'bg-white text-gray-700 border-gray-200 hover:border-accent-color hover:text-accent-color'}`
                }
                disabled={isLoading}>

                {isLoading && selectedApi === 'cint' ?
                <div className="flex items-center justify-center font-work-sans">
                    <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 font-work-sans"></span>
                    <span className="font-work-sans">Testing...</span>
                  </div> :

                'Cint Exchange API'
                }
              </button>
              
              <button
                onClick={() => testApi('stripe')}
                className={`px-4 py-3 rounded-md border font-work-sans transition-colors ${
                selectedApi === 'stripe' ?
                'bg-accent-color text-white border-accent-color' :
                'bg-white text-gray-700 border-gray-200 hover:border-accent-color hover:text-accent-color'}`
                }
                disabled={isLoading}>

                {isLoading && selectedApi === 'stripe' ?
                <div className="flex items-center justify-center font-work-sans">
                    <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 font-work-sans"></span>
                    <span className="font-work-sans">Testing...</span>
                  </div> :

                'Stripe API'
                }
              </button>
              
              <button
                onClick={() => testApi('auth0')}
                className={`px-4 py-3 rounded-md border font-work-sans transition-colors ${
                selectedApi === 'auth0' ?
                'bg-accent-color text-white border-accent-color' :
                'bg-white text-gray-700 border-gray-200 hover:border-accent-color hover:text-accent-color'}`
                }
                disabled={isLoading}>

                {isLoading && selectedApi === 'auth0' ?
                <div className="flex items-center justify-center font-work-sans">
                    <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 font-work-sans"></span>
                    <span className="font-work-sans">Testing...</span>
                  </div> :

                'Auth0 API'
                }
              </button>
              
              <button
                onClick={() => testApi('uploadthing')}
                className={`px-4 py-3 rounded-md border font-work-sans transition-colors ${
                selectedApi === 'uploadthing' ?
                'bg-accent-color text-white border-accent-color' :
                'bg-white text-gray-700 border-gray-200 hover:border-accent-color hover:text-accent-color'}`
                }
                disabled={isLoading}>

                {isLoading && selectedApi === 'uploadthing' ?
                <div className="flex items-center justify-center font-work-sans">
                    <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 font-work-sans"></span>
                    <span className="font-work-sans">Testing...</span>
                  </div> :

                'Uploadthing API'
                }
              </button>
              
              <button
                onClick={() => testApi('database')}
                className={`px-4 py-3 rounded-md border font-work-sans transition-colors ${
                selectedApi === 'database' ?
                'bg-accent-color text-white border-accent-color' :
                'bg-white text-gray-700 border-gray-200 hover:border-accent-color hover:text-accent-color'}`
                }
                disabled={isLoading}>

                {isLoading && selectedApi === 'database' ?
                <div className="flex items-center justify-center font-work-sans">
                    <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 font-work-sans"></span>
                    <span className="font-work-sans">Testing...</span>
                  </div> :

                'Database Connection'
                }
              </button>
              
              <button
                onClick={testAllApis}
                className={`px-4 py-3 rounded-md border font-work-sans font-bold transition-colors ${
                selectedApi === 'all' ?
                'bg-blue-600 text-white border-blue-600' :
                'bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-600 hover:text-white'}`
                }
                disabled={isLoading}>

                {isLoading && selectedApi === 'all' ?
                <div className="flex items-center justify-center font-work-sans">
                    <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 font-work-sans"></span>
                    <span className="font-work-sans">Testing All...</span>
                  </div> :

                'Test All APIs'
                }
              </button>
            </div>
            
            {isLoading &&
            <div className="mt-3 p-3 bg-blue-50 text-blue-700 rounded-md font-work-sans">
                <p className="text-sm font-medium font-work-sans">Testing in progress, please wait...</p>
              </div>
            }
          </div>
        </div>

        {results.length > 0 &&
        <div className="p-6 border-t font-work-sans">
            <h3 className="text-lg font-medium text-gray-900 mb-4 font-sora">Results</h3>

            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg font-work-sans">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 font-work-sans">
                      API Name
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 font-work-sans">
                      Status
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 font-work-sans">
                      Latency
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 w-40 font-work-sans">
                      Endpoint
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 font-work-sans">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {results.map((result, index) =>
                <tr key={index} className={result.success ? '' : 'bg-red-50'}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 font-work-sans">
                        {result.apiName}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm font-work-sans">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeClass(result.success)} font-work-sans`}>
                          {result.success ? 'Success' : 'Failed'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm font-work-sans">
                        <span className={`${getLatencyColorClass(result.latency)} font-work-sans`}>
                          {formatLatency(result.latency)}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-500 w-40 max-w-xs font-work-sans">
                        <div className="truncate font-work-sans" title={result.endpoint || 'N/A'}>
                          {result.endpoint || 'N/A'}
                        </div>
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-500 font-work-sans">
                        {result.success ?
                    <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-40 font-work-sans">
                            {JSON.stringify(result.data, null, 2)}
                          </pre> :

                    <div className="space-y-2 font-work-sans">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getErrorTypeBadgeClass(result.error?.type || ApiErrorType.UNKNOWN_ERROR)} font-work-sans`}>
                              {result.error?.type}
                            </span>
                            <p className="font-work-sans">{result.error?.message}</p>
                            {result.error?.details &&
                      <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-40 font-work-sans">
                                {JSON.stringify(result.error.details, null, 2)}
                              </pre>
                      }
                            <div className="font-work-sans">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${result.error?.isRetryable ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'} font-work-sans`}>
                                {result.error?.isRetryable ? 'Retryable' : 'Non-retryable'}
                              </span>
                            </div>
                          </div>
                    }
                      </td>
                    </tr>
                )}
                </tbody>
              </table>
            </div>
          </div>
        }
      </div>
    </div>);

}