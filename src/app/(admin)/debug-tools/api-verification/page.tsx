'use client';

import React, { useState } from 'react';
import {
  verifyGeolocationApi,
  verifyExchangeRatesApi,
  verifyPhylloApi,
  verifyCintExchangeApi,
  verifyGiphyApi,
  verifyStripeApi,
  verifyUploadthingApi,
  verifyDatabaseConnection,
  ApiVerificationResult,
  ApiErrorType,
} from '@/lib/api-verification';

/**
 * API Verification Debug Tool
 *
 * This page allows administrators to test and verify external API integrations
 * used in Justify. It provides detailed information about API
 * response times, status, and any potential issues.
 */
const ApiVerificationPage: React.FC = () => {
  const [results, setResults] = useState<ApiVerificationResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApi, setSelectedApi] = useState<string>('');
  const [lastTested, setLastTested] = useState<Record<string, Date | null>>({});

  // API descriptions shown in the UI
  const apiDescriptions: Record<string, string> = {
    geolocation:
      'Used to determine user location for targeted campaigns and localized content. Helps optimize campaign delivery to specific regions.',
    exchange:
      'Powers currency conversion for budgeting in the Campaign Wizard. Ensures accurate financial calculations across different currencies.',
    phyllo:
      'Integrates with influencer platforms to verify accounts and retrieve metrics. Critical for influencer-based campaigns.',
    giphy:
      'Powers GIF search and integration for campaign creative content. Provides access to an extensive library of animated content.',
    cint: 'Market research platform that connects to consumer panels for surveys and audience insights. Essential for campaign targeting and market validation.',
    stripe:
      'Payment processing platform for subscription and one-time payments. Powers the billing system for premium features.',
    uploadthing:
      'File upload service for handling media uploads. Used for storing and managing user-generated content.',
    database:
      'Database connection using Postgres. Stores all application data including user profiles, campaigns, and analytics.',
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
      setLastTested(prev => ({
        ...prev,
        [apiName]: new Date(),
      }));
    } catch (error) {
      console.error(`Error testing API: ${apiName}`, error);
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
    return success
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-red-100 text-red-800 border-red-200';
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
  const renderApiBadge = (
    apiName: string,
    lastTestedDate: Date | null,
    isInResults: boolean = false
  ) => {
    const hasBeenTested = lastTestedDate !== null;
    const result = results.find(r => r.apiName.includes(apiName));
    const isSuccess = result?.success || false;

    if (!hasBeenTested) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200 font-body">
          Not Tested
        </span>
      );
    }

    if (isInResults && result) {
      return (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(isSuccess)} font-body`}
        >
          {isSuccess ? 'Verified' : 'Failed'}
        </span>
      );
    }

    // If it's been tested but not in current results
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200 font-body">
        Previously Tested
      </span>
    );
  };

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6 font-heading">API Verification Tool</h1>

      {/* Overview Section */}
      <section className="bg-background rounded-lg shadow-md p-6 mb-8 border border-border">
        <h2 className="text-2xl font-semibold mb-4 font-heading">Overview</h2>
        <p className="text-muted-foreground mb-6">
          This tool verifies the status and response times of external API integrations used in
          Justify. Use the buttons below to test individual APIs or all at once. Results will
          display detailed information about each API's health.
        </p>
      </section>

      <div className="bg-white rounded-lg shadow overflow-hidden font-body">
        <div className="p-6 border-b font-body">
          <h2 className="text-lg font-medium text-gray-900 font-heading">Test External APIs</h2>
          <p className="mt-1 text-sm text-gray-500 font-body">
            Verify that all external API integrations are functioning correctly
          </p>
        </div>

        <div className="p-6 bg-gray-50 space-y-6 font-body">
          {/* API Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 font-body">
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm font-body">
              <div className="flex justify-between items-start font-body">
                <h3 className="font-medium text-gray-900 font-heading">IP Geolocation API</h3>
                {renderApiBadge(
                  'IP Geolocation API',
                  lastTested.geolocation,
                  results.some(r => r.apiName.includes('IP Geolocation'))
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1 font-body">{apiDescriptions.geolocation}</p>
              <div className="mt-2 text-xs text-gray-500 font-body">
                Last tested:{' '}
                <span className="font-medium font-body">
                  {formatTimestamp(lastTested.geolocation)}
                </span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm font-body">
              <div className="flex justify-between items-start font-body">
                <h3 className="font-medium text-gray-900 font-heading">Exchange Rates API</h3>
                {renderApiBadge(
                  'Exchange Rates API',
                  lastTested.exchange,
                  results.some(r => r.apiName.includes('Exchange Rates'))
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1 font-body">{apiDescriptions.exchange}</p>
              <div className="mt-2 text-xs text-gray-500 font-body">
                Last tested:{' '}
                <span className="font-medium font-body">
                  {formatTimestamp(lastTested.exchange)}
                </span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm font-body">
              <div className="flex justify-between items-start font-body">
                <h3 className="font-medium text-gray-900 font-heading">Phyllo API</h3>
                {renderApiBadge(
                  'Phyllo API',
                  lastTested.phyllo,
                  results.some(r => r.apiName.includes('Phyllo'))
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1 font-body">{apiDescriptions.phyllo}</p>
              <div className="mt-2 text-xs text-gray-500 font-body">
                Last tested:{' '}
                <span className="font-medium font-body">{formatTimestamp(lastTested.phyllo)}</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm font-body">
              <div className="flex justify-between items-start font-body">
                <h3 className="font-medium text-gray-900 font-heading">GIPHY API</h3>
                {renderApiBadge(
                  'GIPHY API',
                  lastTested.giphy,
                  results.some(r => r.apiName.includes('GIPHY'))
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1 font-body">{apiDescriptions.giphy}</p>
              <div className="mt-2 text-xs text-gray-500 font-body">
                Last tested:{' '}
                <span className="font-medium font-body">
                  {formatTimestamp(lastTested.giphy || null)}
                </span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm font-body">
              <div className="flex justify-between items-start font-body">
                <h3 className="font-medium text-gray-900 font-heading">Cint Exchange API</h3>
                {renderApiBadge(
                  'Cint Exchange API',
                  lastTested.cint,
                  results.some(r => r.apiName.includes('Cint'))
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1 font-body">{apiDescriptions.cint}</p>
              <div className="mt-2 text-xs text-gray-500 font-body">
                Last tested:{' '}
                <span className="font-medium font-body">
                  {formatTimestamp(lastTested.cint || null)}
                </span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm font-body">
              <div className="flex justify-between items-start font-body">
                <h3 className="font-medium text-gray-900 font-heading">Stripe API</h3>
                {renderApiBadge(
                  'Stripe API',
                  lastTested.stripe,
                  results.some(r => r.apiName.includes('Stripe'))
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1 font-body">{apiDescriptions.stripe}</p>
              <div className="mt-2 text-xs text-gray-500 font-body">
                Last tested:{' '}
                <span className="font-medium font-body">
                  {formatTimestamp(lastTested.stripe || null)}
                </span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm font-body">
              <div className="flex justify-between items-start font-body">
                <h3 className="font-medium text-gray-900 font-heading">Uploadthing API</h3>
                {renderApiBadge(
                  'Uploadthing API',
                  lastTested.uploadthing,
                  results.some(r => r.apiName.includes('Uploadthing'))
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1 font-body">{apiDescriptions.uploadthing}</p>
              <div className="mt-2 text-xs text-gray-500 font-body">
                Last tested:{' '}
                <span className="font-medium font-body">
                  {formatTimestamp(lastTested.uploadthing || null)}
                </span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm font-body">
              <div className="flex justify-between items-start font-body">
                <h3 className="font-medium text-gray-900 font-heading">Database Connection</h3>
                {renderApiBadge(
                  'Database Connection',
                  lastTested.database,
                  results.some(r => r.apiName.includes('Database'))
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1 font-body">{apiDescriptions.database}</p>
              <div className="mt-2 text-xs text-gray-500 font-body">
                Last tested:{' '}
                <span className="font-medium font-body">
                  {formatTimestamp(lastTested.database || null)}
                </span>
              </div>
            </div>
          </div>

          {/* API Selection */}
          <div className="mb-6 font-body">
            <h2 className="text-lg font-bold text-primary-color font-heading mb-3">
              Select API to Test
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 font-body">
              <button
                onClick={() => testApi('geolocation')}
                className={`px-4 py-3 rounded-md border font-body transition-colors ${
                  selectedApi === 'geolocation'
                    ? 'bg-accent-color text-white border-accent-color'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-accent-color hover:text-accent-color'
                }`}
                disabled={isLoading}
              >
                {isLoading && selectedApi === 'geolocation' ? (
                  <div className="flex items-center justify-center font-body">
                    <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 font-body"></span>
                    <span className="font-body">Testing...</span>
                  </div>
                ) : (
                  'IP Geolocation API'
                )}
              </button>

              <button
                onClick={() => testApi('exchange')}
                className={`px-4 py-3 rounded-md border font-body transition-colors ${
                  selectedApi === 'exchange'
                    ? 'bg-accent-color text-white border-accent-color'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-accent-color hover:text-accent-color'
                }`}
                disabled={isLoading}
              >
                {isLoading && selectedApi === 'exchange' ? (
                  <div className="flex items-center justify-center font-body">
                    <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 font-body"></span>
                    <span className="font-body">Testing...</span>
                  </div>
                ) : (
                  'Exchange Rates API'
                )}
              </button>

              <button
                onClick={() => testApi('phyllo')}
                className={`px-4 py-3 rounded-md border font-body transition-colors ${
                  selectedApi === 'phyllo'
                    ? 'bg-accent-color text-white border-accent-color'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-accent-color hover:text-accent-color'
                }`}
                disabled={isLoading}
              >
                {isLoading && selectedApi === 'phyllo' ? (
                  <div className="flex items-center justify-center font-body">
                    <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 font-body"></span>
                    <span className="font-body">Testing...</span>
                  </div>
                ) : (
                  'Phyllo API'
                )}
              </button>

              <button
                onClick={() => testApi('giphy')}
                className={`px-4 py-3 rounded-md border font-body transition-colors ${
                  selectedApi === 'giphy'
                    ? 'bg-accent-color text-white border-accent-color'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-accent-color hover:text-accent-color'
                }`}
                disabled={isLoading}
              >
                {isLoading && selectedApi === 'giphy' ? (
                  <div className="flex items-center justify-center font-body">
                    <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 font-body"></span>
                    <span className="font-body">Testing...</span>
                  </div>
                ) : (
                  'GIPHY API'
                )}
              </button>

              <button
                onClick={() => testApi('cint')}
                className={`px-4 py-3 rounded-md border font-body transition-colors ${
                  selectedApi === 'cint'
                    ? 'bg-accent-color text-white border-accent-color'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-accent-color hover:text-accent-color'
                }`}
                disabled={isLoading}
              >
                {isLoading && selectedApi === 'cint' ? (
                  <div className="flex items-center justify-center font-body">
                    <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 font-body"></span>
                    <span className="font-body">Testing...</span>
                  </div>
                ) : (
                  'Cint Exchange API'
                )}
              </button>

              <button
                onClick={() => testApi('stripe')}
                className={`px-4 py-3 rounded-md border font-body transition-colors ${
                  selectedApi === 'stripe'
                    ? 'bg-accent-color text-white border-accent-color'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-accent-color hover:text-accent-color'
                }`}
                disabled={isLoading}
              >
                {isLoading && selectedApi === 'stripe' ? (
                  <div className="flex items-center justify-center font-body">
                    <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 font-body"></span>
                    <span className="font-body">Testing...</span>
                  </div>
                ) : (
                  'Stripe API'
                )}
              </button>

              <button
                onClick={() => testApi('uploadthing')}
                className={`px-4 py-3 rounded-md border font-body transition-colors ${
                  selectedApi === 'uploadthing'
                    ? 'bg-accent-color text-white border-accent-color'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-accent-color hover:text-accent-color'
                }`}
                disabled={isLoading}
              >
                {isLoading && selectedApi === 'uploadthing' ? (
                  <div className="flex items-center justify-center font-body">
                    <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 font-body"></span>
                    <span className="font-body">Testing...</span>
                  </div>
                ) : (
                  'Uploadthing API'
                )}
              </button>

              <button
                onClick={() => testApi('database')}
                className={`px-4 py-3 rounded-md border font-body transition-colors ${
                  selectedApi === 'database'
                    ? 'bg-accent-color text-white border-accent-color'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-accent-color hover:text-accent-color'
                }`}
                disabled={isLoading}
              >
                {isLoading && selectedApi === 'database' ? (
                  <div className="flex items-center justify-center font-body">
                    <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 font-body"></span>
                    <span className="font-body">Testing...</span>
                  </div>
                ) : (
                  'Database Connection'
                )}
              </button>
            </div>

            {isLoading && (
              <div className="mt-3 p-3 bg-blue-50 text-blue-700 rounded-md font-body">
                <p className="text-sm font-medium font-body">Testing in progress, please wait...</p>
              </div>
            )}
          </div>
        </div>

        {results.length > 0 && (
          <div className="p-6 border-t font-body">
            <h3 className="text-lg font-medium text-gray-900 mb-4 font-heading">Results</h3>

            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg font-body">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 font-body"
                    >
                      API Name
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 font-body"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 font-body"
                    >
                      Latency
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 w-40 font-body"
                    >
                      Endpoint
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 font-body"
                    >
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {results.map((result, index) => (
                    <tr key={index} className={result.success ? '' : 'bg-red-50'}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 font-body">
                        {result.apiName}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm font-body">
                        <span
                          className={`inline-block px-2 py-1 rounded-md text-xs font-medium ${getStatusBadgeClass(
                            result.success
                          )}`}
                        >
                          {result.success ? 'Operational' : 'Error'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm font-body">
                        <span className={`${getLatencyColorClass(result.latency)} font-body`}>
                          {formatLatency(result.latency)}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-500 w-40 max-w-xs font-body">
                        <div className="truncate font-body" title={result.endpoint || 'N/A'}>
                          {result.endpoint || 'N/A'}
                        </div>
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-500 font-body">
                        {result.success ? (
                          <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-40 font-body">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        ) : (
                          <div className="space-y-2 font-body">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getErrorTypeBadgeClass(result.error?.type || ApiErrorType.UNKNOWN_ERROR)} font-body`}
                            >
                              {result.error?.type}
                            </span>
                            <p className="font-body">{result.error?.message}</p>
                            {result.error?.details !== undefined &&
                              result.error?.details !== null && (
                                <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-40 font-body">
                                  {JSON.stringify(result.error.details, null, 2)}
                                </pre>
                              )}
                            <div className="font-body">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${result.error?.isRetryable ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'} font-body`}
                              >
                                {result.error?.isRetryable ? 'Retryable' : 'Non-retryable'}
                              </span>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiVerificationPage;
