/**
 * Payload Sanitization Utilities
 * 
 * This module provides utilities for sanitizing API payloads, particularly
 * for handling draft saves with incomplete data. It ensures consistent
 * treatment of empty/null/partial values across all form submissions.
 */

/**
 * Sanitizes an API payload by:
 * 1. Removing null values
 * 2. Removing empty objects
 * 3. Removing undefined fields
 * 4. Ensuring proper data structure for API validation
 * 
 * @param payload The payload to sanitize
 * @param options Configuration options
 * @returns A sanitized version of the payload
 */
export function sanitizeApiPayload<T>(
  payload: T, 
  options: {
    removeEmptyStrings?: boolean,
    removeEmptyArrays?: boolean,
    preserveFields?: string[]
  } = {}
): Partial<T> {
  const { 
    removeEmptyStrings = false,
    removeEmptyArrays = true,
    preserveFields = []
  } = options;
  
  if (payload === null || payload === undefined) return {} as Partial<T>;
  if (typeof payload !== 'object' || Array.isArray(payload)) return payload as unknown as Partial<T>;
  
  const result: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(payload)) {
    // Never remove fields that should be preserved (even if empty)
    if (preserveFields.includes(key)) {
      result[key] = value;
      continue;
    }
    
    // Skip null/undefined values
    if (value === null || value === undefined) continue;
    
    // Handle empty strings
    if (typeof value === 'string' && value.trim() === '' && removeEmptyStrings) {
      continue;
    }
    
    // Handle arrays (can be empty if removeEmptyArrays is false)
    if (Array.isArray(value)) {
      if (value.length > 0 || !removeEmptyArrays) {
        // Filter out null or empty objects in arrays
        result[key] = value.filter(item => {
          if (item === null || item === undefined) return false;
          if (typeof item === 'object' && Object.keys(sanitizeApiPayload(item)).length === 0) return false;
          return true;
        });
      }
      continue;
    }
    
    // Handle nested objects recursively
    if (typeof value === 'object') {
      const sanitized = sanitizeApiPayload(value, options);
      
      // Only include non-empty objects
      if (Object.keys(sanitized).length > 0) {
        result[key] = sanitized;
      }
      continue;
    }
    
    // Keep primitive values as is
    result[key] = value;
  }
  
  return result as Partial<T>;
}

/**
 * Specially handles contact objects to ensure they either:
 * 1. Are completely valid with all required fields
 * 2. Are completely removed from the payload
 * 
 * This matches the API validation expectations where contacts need
 * complete information if present.
 */
export function sanitizeContactFields<T extends Record<string, unknown>>(
  payload: T,
  contactFields: string[] = ['primaryContact', 'secondaryContact']
): T {
  // Make a copy of the payload to avoid mutating the original
  const result = { ...payload };
  
  for (const fieldName of contactFields) {
    const contact = result[fieldName];
    
    // Skip if field doesn't exist
    if (!contact) continue;
    
    // Check if contact has all required fields properly filled
    const contactObj = contact as Record<string, unknown>;
    const hasCompleteData = contactObj.firstName && 
                           contactObj.surname && 
                           contactObj.email;
    
    // Remove contact field entirely if incomplete
    if (!hasCompleteData) {
      delete result[fieldName];
      console.warn(`Removing incomplete ${fieldName} to prevent validation errors`);
    }
  }
  
  return result;
}

/**
 * Draft-specific sanitizer that applies rules appropriate for draft saves
 * with a more lenient approach than final submissions
 */
export function sanitizeDraftPayload<T extends Record<string, unknown>>(payload: T): Partial<T> {
  // First apply general sanitization
  const sanitized = sanitizeApiPayload(payload, {
    removeEmptyStrings: false,
    removeEmptyArrays: false,
    // Always include required fields for drafts, even if empty
    preserveFields: ['name', 'status', 'step']
  }) as Record<string, unknown>; // Cast to allow property access
  
  // Sanitize influencers to ensure they have the minimal required fields
  if (sanitized.influencers && Array.isArray(sanitized.influencers)) {
    // Remove any influencers with empty/undefined platform or handle
    sanitized.influencers = sanitized.influencers.filter((influencer: unknown) => {
      // For completely empty influencer entries, keep one for the UI
      if (sanitized.influencers && Array.isArray(sanitized.influencers) && sanitized.influencers.length === 1) {
        return true;
      }
      
      // Otherwise, only keep entries that have both platform and handle
      const inf = influencer as Record<string, unknown>;
      return influencer && 
        typeof influencer === 'object' && 
        inf.platform && 
        inf.handle;
    });
  }
  
  // Then apply contact-specific sanitization
  // Cast the result to ensure TypeScript is happy with the return type
  return sanitizeContactFields(sanitized as unknown as Record<string, unknown>) as Partial<T>;
}

/**
 * Sanitize a campaign payload for a specific wizard step
 */
export function sanitizeStepPayload<T extends Record<string, unknown>>(payload: T, step: number): Partial<T> {
  // Apply base sanitization
  const sanitized = sanitizeApiPayload(payload);
  
  // Apply step-specific sanitization
  switch(step) {
    case 1:
      return sanitizeStep1Payload(sanitized);
    case 2: 
      return sanitizeStep2Payload(sanitized);
    case 3:
      return sanitizeStep3Payload(sanitized);
    case 4:
      return sanitizeStep4Payload(sanitized);
    case 5:
      return sanitizeStep5Payload(sanitized);
    default:
      return sanitized;
  }
}

/**
 * Step 1 specific sanitization (campaign basics)
 */
function sanitizeStep1Payload<T extends Record<string, unknown>>(payload: T): Partial<T> {
  // Handle contacts appropriately
  return sanitizeContactFields(payload);
}

/**
 * Step 2 specific sanitization (KPIs and features)
 */
function sanitizeStep2Payload<T extends Record<string, unknown>>(payload: T): Partial<T> {
  const result = { ...payload };
  
  // Handle arrays of values
  if (Array.isArray(result.secondaryKPIs) && result.secondaryKPIs.length === 0) {
    delete result.secondaryKPIs;
  }
  
  if (Array.isArray(result.features) && result.features.length === 0) {
    delete result.features;
  }
  
  return result;
}

/**
 * Step 3 specific sanitization (audience targeting)
 */
function sanitizeStep3Payload<T extends Record<string, unknown>>(payload: T): Partial<T> {
  const result = { ...payload };
  
  // Handle audience data
  if (result.audience && Object.keys(result.audience).length === 0) {
    delete result.audience;
  }
  
  return result;
}

/**
 * Step 4 specific sanitization (creative assets)
 */
function sanitizeStep4Payload<T extends Record<string, unknown>>(payload: T): Partial<T> {
  const result = { ...payload };
  
  // Handle creative assets
  if (Array.isArray(result.creativeAssets) && result.creativeAssets.length === 0) {
    delete result.creativeAssets;
  }
  
  return result;
}

/**
 * Step 5 specific sanitization (review and submit)
 */
function sanitizeStep5Payload<T extends Record<string, unknown>>(payload: T): Partial<T> {
  // For step 5, we want to keep most fields as they are for review
  return payload;
} 