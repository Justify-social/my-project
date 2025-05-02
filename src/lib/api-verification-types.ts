/**
 * API Verification Shared Types
 *
 * This file contains ONLY types, enums, and interfaces related to API verification
 * that are safe to be imported by both Client and Server Components.
 * It MUST NOT contain any server-only imports or logic (e.g., Prisma, serverConfig).
 */

/**
 * Enumeration of possible API error types for better error categorization
 * SAFE FOR CLIENT AND SERVER
 */
export enum ApiErrorType {
  AUTHENTICATION_ERROR = 'Authentication Error',
  VALIDATION_ERROR = 'Validation Error',
  RATE_LIMIT_ERROR = 'Rate Limit Error',
  SERVER_ERROR = 'Server Error',
  NETWORK_ERROR = 'Network Error',
  TIMEOUT_ERROR = 'Timeout Error',
  NOT_FOUND_ERROR = 'Not Found Error',
  UNKNOWN_ERROR = 'Unknown Error',
}

/**
 * Interface defining error information for API verification
 * SAFE FOR CLIENT AND SERVER
 */
export interface ApiErrorInfo {
  type: ApiErrorType;
  message: string;
  details?: unknown; // Use 'unknown' or a specific serializable type
  isRetryable: boolean;
}

/**
 * Interface defining the result of API verification
 * SAFE FOR CLIENT AND SERVER
 */
export interface ApiVerificationResult {
  success: boolean;
  apiName: string;
  endpoint: string; // Endpoint URL or identifier
  latency?: number; // Latency in milliseconds
  data?: unknown; // Use 'unknown' or a specific serializable type for success data
  error?: ApiErrorInfo;
}

// Add any other purely type/interface/enum definitions needed by both client/server here
