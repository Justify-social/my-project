/**
 * API Response Formatter
 * 
 * Utility to standardize API responses by ensuring consistent data formats, 
 * particularly for date fields and JSON string fields.
 * 
 * This fixes issues with:
 * 1. Empty date objects being returned as {} instead of null
 * 2. JSON string fields that need parsing before use in components
 * 3. Other inconsistencies in API responses that cause frontend errors
 */

/**
 * Standardizes an API response by normalizing data formats
 * - Converts empty date objects to null
 * - Parses JSON string fields into objects
 * - Adds consistent default values
 * 
 * @param data The API response data to standardize
 * @returns Standardized data safe for frontend use
 */
export function standardizeApiResponse(data: any) {
  if (!data) return null;
  
  const result = { ...data };
  
  // Handle date fields
  ['createdAt', 'updatedAt', 'startDate', 'endDate'].forEach(field => {
    if (field in result) {
      console.log(`Processing date field ${field}:`, result[field]);
      
      // If it's a valid date, convert to ISO string
      if (result[field] instanceof Date) {
        result[field] = result[field].toISOString();
        console.log(`Converted Date object to ISO string: ${result[field]}`);
      } 
      // If it's an empty object or null-like, convert to null
      else if (
        (typeof result[field] === 'object' && 
         result[field] !== null &&
         Object.keys(result[field]).length === 0) ||
        result[field] === null ||
        result[field] === undefined ||
        result[field] === ''
      ) {
        console.log(`Converting empty/null value to null for ${field}`);
        result[field] = null;
      }
      // Handle date strings by ensuring they're in ISO format
      else if (typeof result[field] === 'string' && result[field].trim()) {
        try {
          const dateObj = new Date(result[field]);
          if (!isNaN(dateObj.getTime())) {
            result[field] = dateObj.toISOString();
            console.log(`Parsed date string to ISO: ${result[field]}`);
          }
        } catch (e) {
          console.warn(`Failed to parse date string for ${field}:`, result[field]);
        }
      }
    }
  });
  
  // Handle the Influencer relation from Prisma model
  if (result.Influencer && Array.isArray(result.Influencer)) {
    console.log('Found Influencer relation in API response:', result.Influencer);
    
    // Copy the Influencer relation to the influencers field expected by the frontend
    result.influencers = result.Influencer.map((inf: any) => ({
      id: inf.id,
      platform: inf.platform,
      handle: inf.handle,
      platformId: inf.platformId
    }));
    
    console.log('Mapped Influencer relation to influencers array:', result.influencers);
    
    // Remove the original Influencer field to avoid confusion
    delete result.Influencer;
  }
  
  // Parse JSON string fields
  ['primaryContact', 'secondaryContact', 'budget', 'additionalContacts', 'influencers', 'demographics', 'locations', 'targeting', 'competitors'].forEach(field => {
    if (typeof result[field] === 'string') {
      try {
        console.log(`Parsing JSON string for ${field}:`, result[field]);
        const parsed = JSON.parse(result[field]);
        result[field] = parsed;
        console.log(`Successfully parsed ${field} to:`, result[field]);
      } catch (e) {
        console.warn(`Failed to parse ${field} JSON:`, result[field]);
        // Set appropriate defaults based on field type
        if (field === 'primaryContact' || field === 'secondaryContact') {
          result[field] = {};
        } else if (field === 'influencers' || field === 'additionalContacts' || field === 'locations' || field === 'competitors') {
          result[field] = [];
        } else if (field === 'demographics' || field === 'targeting') {
          result[field] = {};
        } else {
          result[field] = {};
        }
      }
    }
  });
  
  // Handle special case for budget object
  if (typeof result.budget === 'object' && result.budget !== null) {
    // Extract budget fields if they don't already exist
    if (!('totalBudget' in result) && 'total' in result.budget) {
      result.totalBudget = result.budget.total;
    }
    if (!('socialMediaBudget' in result) && 'socialMedia' in result.budget) {
      result.socialMediaBudget = result.budget.socialMedia;
    }
    if (!('currency' in result) && 'currency' in result.budget) {
      result.currency = result.budget.currency;
    }
  }
  
  // Ensure arrays are properly initialized
  ['influencers', 'additionalContacts', 'locations', 'competitors'].forEach(field => {
    if (!Array.isArray(result[field])) {
      console.log(`Initializing ${field} as empty array`);
      result[field] = [];
    }
  });
  
  // Ensure influencers has at least one empty item if it's empty
  if (Array.isArray(result.influencers) && result.influencers.length === 0) {
    console.log('Adding default empty influencer item to empty array');
    result.influencers = [{ platform: '', handle: '' }];
  }
  
  // Log standardized response for debugging
  console.log('Standardized API response:', result);
  
  return result;
}

/**
 * Standardizes an array of API response items
 * Useful for list endpoints returning multiple items
 * 
 * @param dataArray Array of items to standardize
 * @returns Array of standardized items
 */
export function standardizeApiResponseArray(dataArray: any[]) {
  if (!Array.isArray(dataArray)) return [];
  return dataArray.map(item => standardizeApiResponse(item));
}

/**
 * Prepares a date value for API submission by ensuring proper format
 * 
 * @param date Date value to format (string, Date object, or null)
 * @returns Properly formatted date string or null
 */
export function formatDateForApi(date: string | Date | null | undefined): string | null {
  if (!date) return null;
  
  try {
    // If it's already a string, check if it's valid
    if (typeof date === 'string') {
      if (!date.trim()) return null;
      
      // Check if it's a valid date
      const parsed = new Date(date);
      if (isNaN(parsed.getTime())) {
        return null;
      }
      
      // Return ISO string for consistency
      return parsed.toISOString();
    }
    
    // If it's a Date object, convert to ISO string
    if (date instanceof Date) {
      if (isNaN(date.getTime())) {
        return null;
      }
      return date.toISOString();
    }
    
    return null;
  } catch (e) {
    console.error('Error formatting date for API:', e, date);
    return null;
  }
} 