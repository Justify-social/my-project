'use client';

import React, { useState, useCallback } from 'react';
// Import types/enums from the new client-safe file
import type { ApiVerificationResult } from '@/lib/api-verification-types';
import { ApiErrorType } from '@/lib/api-verification-types';
// If logger is used *only* for client-side logging (e.g., button clicks), it might be okay,
// but ensure it doesn't import server-only modules like prisma.
// For safety, we can comment it out if unsure.
// import { logger } from '@/lib/logger';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon/icon';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

/**
 * API Verification Debug Tool
 *
 * This page allows administrators to test and verify external API integrations
 * used in Justify. It provides detailed information about API
 * response times, status, and any potential issues.
 */
const ApiVerificationPage: React.FC = () => {
  const [results, setResults] = useState<ApiVerificationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastTestedTimes, setLastTestedTimes] = useState<Record<string, Date | null>>({});

  // API descriptions shown in the UI
  const apiDescriptions: Record<string, string> = {
    geolocation:
      'Used to determine user location for targeted campaigns and localized content. Helps optimize campaign delivery to specific regions.',
    exchange:
      'Powers currency conversion for budgeting in the Campaign Wizard. Ensures accurate financial calculations across different currencies.',
    insightiq:
      'Integrates with influencer platforms (via InsightIQ) to verify accounts and retrieve metrics. Critical for influencer-based campaigns.',
    giphy:
      'Powers GIF search and integration for campaign creative content. Provides access to an extensive library of animated content.',
    cint: 'Market research platform that connects to consumer panels for surveys and audience insights. Essential for campaign targeting and market validation.',
    stripe:
      'Payment processing platform for subscription and one-time payments. Powers the billing system for premium features.',
    database:
      'Database connection using Postgres. Stores all application data including user profiles, campaigns, and analytics.',
    algolia:
      'Powers application search functionality, including campaigns, influencers, etc. Requires Search API Key.',
  };

  const testAllApis = useCallback(async () => {
    setIsLoading(true);
    setResults([]);
    // logger?.info(`[ApiVerificationPage] Sending request to verify ALL APIs`); // Use optional chaining if logger kept
    console.log(`[ApiVerificationPage] Sending request to verify ALL APIs`); // Fallback log
    try {
      const response = await fetch('/api/debug/verify-api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}), // Empty body, backend doesn't need specific input for full check
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        const errorMsg = result.error || `API route failed with status ${response.status}`;
        // logger?.error(...)
        console.error(
          `[ApiVerificationPage] Backend verification route failed:`,
          errorMsg,
          result.details
        );
        setResults([
          {
            success: false,
            apiName: 'Verification Process',
            endpoint: '/api/debug/verify-api',
            error: {
              type: ApiErrorType.NETWORK_ERROR,
              message: errorMsg,
              details: result.details || null,
              isRetryable: response.status >= 500,
            },
          },
        ]);
      } else {
        // logger?.info(...)
        console.log('[ApiVerificationPage] Received verification results.');
        const receivedResults: ApiVerificationResult[] = Array.isArray(result.data)
          ? result.data
          : [];
        setResults(receivedResults);

        const newLastTested: Record<string, Date | null> = { ...lastTestedTimes };
        const now = new Date();
        receivedResults.forEach(res => {
          const apiKey = res.apiName.toLowerCase().split(' ')[0];
          if (apiKey) {
            newLastTested[apiKey] = now;
          }
        });
        setLastTestedTimes(newLastTested);
      }
    } catch (error) {
      // logger?.error(...)
      console.error('[ApiVerificationPage] Fetch error calling verification route:', error);
      setResults([
        {
          success: false,
          apiName: 'Verification Process',
          endpoint: '/api/debug/verify-api',
          error: {
            type: ApiErrorType.NETWORK_ERROR,
            message: error instanceof Error ? error.message : 'Network error',
            details: error,
            isRetryable: true,
          },
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, []);

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
  const getErrorTypeBadgeClass = (errorType?: ApiErrorType) => {
    // Use ApiErrorType for comparisons
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

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 max-w-screen-xl">
      <h1 className="text-3xl font-bold mb-6 font-heading">API Verification Tool</h1>

      {/* Overview Section - Use Card for consistency */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold font-heading">Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            This tool verifies the status and response times of external API integrations used in
            Justify. Use the button below to test all APIs. Results will display detailed
            information about each API's health.
          </p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Button onClick={testAllApis} disabled={isLoading} size="lg">
              {isLoading ? (
                <>
                  <Icon iconId="faCircleNotchLight" className="animate-spin mr-2 h-4 w-4" />
                  Testing All APIs...
                </>
              ) : (
                'Test All APIs'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Section - Use Card */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold font-heading">Results</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Use Shadcn Table components */}
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                    API Name
                  </TableHead>
                  <TableHead className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Status
                  </TableHead>
                  <TableHead className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Latency
                  </TableHead>
                  <TableHead className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Endpoint
                  </TableHead>
                  <TableHead className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Details
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-200 bg-white">
                {results.map((result, index) => (
                  <TableRow
                    key={result.apiName + index}
                    className={cn(
                      result.success ? '' : 'bg-red-50/50 hover:bg-red-100/50',
                      'align-top'
                    )}
                  >
                    <TableCell className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                      {result.apiName}
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-3 py-4 text-sm">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-xs font-medium ${getStatusBadgeClass(
                          result.success
                        )}`}
                      >
                        {result.success ? 'Operational' : 'Error'}
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-3 py-4 text-sm">
                      <span className={`${getLatencyColorClass(result.latency)}`}>
                        {formatLatency(result.latency)}
                      </span>
                    </TableCell>
                    <TableCell className="px-3 py-4 text-sm text-gray-500 max-w-xs">
                      <div className="truncate" title={result.endpoint || 'N/A'}>
                        {result.endpoint || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-4 text-sm text-gray-500 align-top">
                      {(() => {
                        // Use an IIFE for clarity
                        if (result.success) {
                          if (result.data && Object.keys(result.data).length > 0) {
                            return (
                              <ScrollArea className="h-40 w-full rounded-md border p-2 bg-gray-50">
                                <pre className="text-xs">
                                  {JSON.stringify(result.data, null, 2)}
                                </pre>
                              </ScrollArea>
                            );
                          } else {
                            return <span className="text-muted-foreground italic text-xs">OK</span>;
                          }
                        } else {
                          // Error case
                          return (
                            <div className="space-y-1 text-xs">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getErrorTypeBadgeClass(result.error?.type)}`}
                              >
                                {result.error?.type ?? ApiErrorType.UNKNOWN_ERROR}
                              </span>
                              <p className="font-medium text-red-700">
                                {result.error?.message ?? 'Unknown error'}
                              </p>
                              {result.error?.details != null && (
                                <ScrollArea className="h-24 w-full rounded-md border p-2 bg-gray-100 mt-1">
                                  <pre className="text-xs">
                                    {JSON.stringify(result.error.details, null, 2)}
                                  </pre>
                                </ScrollArea>
                              )}
                              <span
                                className={`block pt-1 text-xs font-medium ${result.error?.isRetryable ? 'text-green-600' : 'text-red-600'}`}
                              >
                                {result.error?.isRetryable
                                  ? 'Potentially Retryable'
                                  : 'Non-retryable'}
                              </span>
                            </div>
                          );
                        }
                      })()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ApiVerificationPage;
