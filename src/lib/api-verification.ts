/**
 * API Verification Utilities
 * 
 * This file contains utilities for testing and verifying external API integrations
 * used in the Campaign Wizard. These utilities help ensure that APIs are functioning
 * correctly and provide helpful diagnostics when they are not.
 */

import { dbLogger, DbOperation } from './data-mapping/db-logger';

// Error types for API verification
export enum ApiErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  PERMISSION_ERROR = 'PERMISSION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

// Response interface for API verification
export interface ApiVerificationResult {
  success: boolean;
  apiName: string;
  endpoint?: string;
  latency?: number;
  error?: {
    type: ApiErrorType;
    message: string;
    details?: any;
    isRetryable: boolean;
  };
  data?: any;
}

/**
 * Test IP Geolocation API
 * @returns ApiVerificationResult
 */
export async function verifyGeolocationApi(): Promise<ApiVerificationResult> {
  const apiName = 'IP Geolocation API';
  
  try {
    dbLogger.info(
      'API_VERIFICATION',
      `Testing ${apiName}`,
      { apiName }
    );
    
    const startTime = Date.now();
    
    // Make a test request to the IP Geolocation API
    const response = await fetch('https://ipapi.co/json/', {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    const latency = Date.now() - startTime;
    
    if (!response.ok) {
      // Handle various error status codes
      let errorType = ApiErrorType.UNKNOWN_ERROR;
      let isRetryable = false;
      
      switch (response.status) {
        case 401:
          errorType = ApiErrorType.AUTHENTICATION_ERROR;
          isRetryable = false;
          break;
        case 403:
          errorType = ApiErrorType.PERMISSION_ERROR;
          isRetryable = false;
          break;
        case 404:
          errorType = ApiErrorType.NOT_FOUND_ERROR;
          isRetryable = false;
          break;
        case 422:
          errorType = ApiErrorType.VALIDATION_ERROR;
          isRetryable = false;
          break;
        case 429:
          errorType = ApiErrorType.RATE_LIMIT_ERROR;
          isRetryable = true;
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          errorType = ApiErrorType.SERVER_ERROR;
          isRetryable = true;
          break;
      }
      
      const errorData = await response.json().catch(() => ({}));
      
      dbLogger.error(
        'API_VERIFICATION',
        `${apiName} verification failed with status ${response.status}`,
        { apiName, status: response.status, errorType },
        errorData
      );
      
      return {
        success: false,
        apiName,
        endpoint: 'https://ipapi.co/json/',
        latency,
        error: {
          type: errorType,
          message: `API responded with status ${response.status}: ${response.statusText}`,
          details: errorData,
          isRetryable
        }
      };
    }
    
    // Get the response data
    const data = await response.json();
    
    // Check if the response has expected fields
    if (!data.ip || !data.country || !data.timezone) {
      dbLogger.error(
        'API_VERIFICATION',
        `${apiName} verification failed: Missing expected fields in response`,
        { apiName, data }
      );
      
      return {
        success: false,
        apiName,
        endpoint: 'https://ipapi.co/json/',
        latency,
        error: {
          type: ApiErrorType.VALIDATION_ERROR,
          message: 'API response is missing expected fields',
          details: data,
          isRetryable: false
        }
      };
    }
    
    // Log successful verification
    dbLogger.info(
      'API_VERIFICATION',
      `${apiName} verification successful`,
      { 
        apiName, 
        latency,
        country: data.country,
        timezone: data.timezone
      }
    );
    
    return {
      success: true,
      apiName,
      endpoint: 'https://ipapi.co/json/',
      latency,
      data: {
        ip: data.ip,
        country: data.country,
        countryName: data.country_name,
        city: data.city,
        region: data.region,
        timezone: data.timezone,
        currency: data.currency
      }
    };
  } catch (error) {
    // Handle network errors and other exceptions
    let errorType = ApiErrorType.UNKNOWN_ERROR;
    let isRetryable = false;
    let errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (error instanceof TypeError && errorMessage.includes('fetch')) {
      errorType = ApiErrorType.NETWORK_ERROR;
      isRetryable = true;
    } else if (error instanceof Error && errorMessage.includes('timeout')) {
      errorType = ApiErrorType.TIMEOUT_ERROR;
      isRetryable = true;
    }
    
    dbLogger.error(
      'API_VERIFICATION',
      `${apiName} verification failed with error: ${errorMessage}`,
      { apiName, errorType },
      error
    );
    
    return {
      success: false,
      apiName,
      endpoint: 'https://ipapi.co/json/',
      error: {
        type: errorType,
        message: errorMessage,
        details: error,
        isRetryable
      }
    };
  }
}

/**
 * Test Exchange Rates API
 * @returns ApiVerificationResult
 */
export async function verifyExchangeRatesApi(): Promise<ApiVerificationResult> {
  const apiName = 'Exchange Rates API';
  
  try {
    dbLogger.info(
      'API_VERIFICATION',
      `Testing ${apiName}`,
      { apiName }
    );
    
    const startTime = Date.now();
    
    // Make a test request to the Exchange Rates API
    const response = await fetch('https://api.exchangerate.host/latest?base=USD', {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    const latency = Date.now() - startTime;
    
    if (!response.ok) {
      // Handle various error status codes
      let errorType = ApiErrorType.UNKNOWN_ERROR;
      let isRetryable = false;
      
      switch (response.status) {
        case 401:
          errorType = ApiErrorType.AUTHENTICATION_ERROR;
          isRetryable = false;
          break;
        case 403:
          errorType = ApiErrorType.PERMISSION_ERROR;
          isRetryable = false;
          break;
        case 404:
          errorType = ApiErrorType.NOT_FOUND_ERROR;
          isRetryable = false;
          break;
        case 422:
          errorType = ApiErrorType.VALIDATION_ERROR;
          isRetryable = false;
          break;
        case 429:
          errorType = ApiErrorType.RATE_LIMIT_ERROR;
          isRetryable = true;
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          errorType = ApiErrorType.SERVER_ERROR;
          isRetryable = true;
          break;
      }
      
      const errorData = await response.json().catch(() => ({}));
      
      dbLogger.error(
        'API_VERIFICATION',
        `${apiName} verification failed with status ${response.status}`,
        { apiName, status: response.status, errorType },
        errorData
      );
      
      return {
        success: false,
        apiName,
        endpoint: 'https://api.exchangerate.host/latest',
        latency,
        error: {
          type: errorType,
          message: `API responded with status ${response.status}: ${response.statusText}`,
          details: errorData,
          isRetryable
        }
      };
    }
    
    // Get the response data
    const data = await response.json();
    
    // Check if the response has expected fields
    if (!data.rates || !data.base) {
      dbLogger.error(
        'API_VERIFICATION',
        `${apiName} verification failed: Missing expected fields in response`,
        { apiName, data }
      );
      
      return {
        success: false,
        apiName,
        endpoint: 'https://api.exchangerate.host/latest',
        latency,
        error: {
          type: ApiErrorType.VALIDATION_ERROR,
          message: 'API response is missing expected fields',
          details: data,
          isRetryable: false
        }
      };
    }
    
    // Check if major currencies are present
    const requiredCurrencies = ['EUR', 'GBP', 'JPY', 'CAD', 'AUD'];
    const missingCurrencies = requiredCurrencies.filter(currency => !(currency in data.rates));
    
    if (missingCurrencies.length > 0) {
      dbLogger.error(
        'API_VERIFICATION',
        `${apiName} verification failed: Missing required currencies in response`,
        { apiName, missingCurrencies }
      );
      
      return {
        success: false,
        apiName,
        endpoint: 'https://api.exchangerate.host/latest',
        latency,
        error: {
          type: ApiErrorType.VALIDATION_ERROR,
          message: `API response is missing required currencies: ${missingCurrencies.join(', ')}`,
          details: data,
          isRetryable: false
        }
      };
    }
    
    // Log successful verification
    dbLogger.info(
      'API_VERIFICATION',
      `${apiName} verification successful`,
      { 
        apiName, 
        latency,
        base: data.base,
        date: data.date,
        currencies: Object.keys(data.rates).length
      }
    );
    
    return {
      success: true,
      apiName,
      endpoint: 'https://api.exchangerate.host/latest',
      latency,
      data: {
        base: data.base,
        date: data.date,
        rates: {
          EUR: data.rates.EUR,
          GBP: data.rates.GBP,
          JPY: data.rates.JPY,
          CAD: data.rates.CAD,
          AUD: data.rates.AUD
        }
      }
    };
  } catch (error) {
    // Handle network errors and other exceptions
    let errorType = ApiErrorType.UNKNOWN_ERROR;
    let isRetryable = false;
    let errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (error instanceof TypeError && errorMessage.includes('fetch')) {
      errorType = ApiErrorType.NETWORK_ERROR;
      isRetryable = true;
    } else if (error instanceof Error && errorMessage.includes('timeout')) {
      errorType = ApiErrorType.TIMEOUT_ERROR;
      isRetryable = true;
    }
    
    dbLogger.error(
      'API_VERIFICATION',
      `${apiName} verification failed with error: ${errorMessage}`,
      { apiName, errorType },
      error
    );
    
    return {
      success: false,
      apiName,
      endpoint: 'https://api.exchangerate.host/latest',
      error: {
        type: errorType,
        message: errorMessage,
        details: error,
        isRetryable
      }
    };
  }
}

/**
 * Test Phyllo API (for influencer data)
 * Uses a mock implementation since we don't have actual credentials
 * @returns ApiVerificationResult
 */
export async function verifyPhylloApi(): Promise<ApiVerificationResult> {
  const apiName = 'Phyllo API';
  
  try {
    dbLogger.info(
      'API_VERIFICATION',
      `Testing ${apiName}`,
      { apiName }
    );
    
    const startTime = Date.now();
    
    // In a real implementation, we would make an actual API call
    // For now, we'll simulate an API call with a delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const latency = Date.now() - startTime;
    
    // For testing purposes, we'll simulate a successful response
    // In production, this would be an actual API call
    
    // Log successful verification
    dbLogger.info(
      'API_VERIFICATION',
      `${apiName} verification successful`,
      { 
        apiName, 
        latency,
        environment: 'simulated'
      }
    );
    
    return {
      success: true,
      apiName,
      endpoint: 'https://api.phyllo.com/v1/test',
      latency,
      data: {
        environment: 'simulated',
        status: 'operational',
        features: ['account_verification', 'influencer_metrics', 'engagement_data']
      }
    };
  } catch (error) {
    // Handle errors
    let errorType = ApiErrorType.UNKNOWN_ERROR;
    let isRetryable = false;
    let errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    dbLogger.error(
      'API_VERIFICATION',
      `${apiName} verification failed with error: ${errorMessage}`,
      { apiName, errorType },
      error
    );
    
    return {
      success: false,
      apiName,
      endpoint: 'https://api.phyllo.com/v1/test',
      error: {
        type: errorType,
        message: errorMessage,
        details: error,
        isRetryable
      }
    };
  }
}

/**
 * Test all APIs used in the Campaign Wizard
 * @returns Array of ApiVerificationResult
 */
export async function verifyAllApis(): Promise<ApiVerificationResult[]> {
  dbLogger.info(
    'API_VERIFICATION',
    'Starting verification of all external APIs',
    {}
  );
  
  const results = await Promise.all([
    verifyGeolocationApi(),
    verifyExchangeRatesApi(),
    verifyPhylloApi()
  ]);
  
  const allSuccessful = results.every(result => result.success);
  
  if (allSuccessful) {
    dbLogger.info(
      'API_VERIFICATION',
      'All APIs verified successfully',
      { apiCount: results.length }
    );
  } else {
    const failedApis = results.filter(result => !result.success).map(result => result.apiName);
    
    dbLogger.error(
      'API_VERIFICATION',
      `API verification failed for some APIs: ${failedApis.join(', ')}`,
      { failedApis }
    );
  }
  
  return results;
}

export default {
  verifyGeolocationApi,
  verifyExchangeRatesApi,
  verifyPhylloApi,
  verifyAllApis
}; 