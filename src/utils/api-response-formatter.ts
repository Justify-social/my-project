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
import { DateService } from './date-service';

/**
 * Standardizes an API response by normalizing data formats
 * - Converts empty date objects to null
 * - Parses JSON string fields into objects
 * - Adds consistent default values
 * 
 * @param data The API response data to standardize
 * @returns Standardized data safe for frontend use
 */
export function standardizeApiResponse(data: unknown) {
  if (!data) return null;
  
  const result = { ...(data as Record<string, unknown>) };
  
  // Handle date fields using DateService
  ['createdAt', 'updatedAt', 'startDate', 'endDate'].forEach(field => {
    if (field in result) {
      console.log(`Processing date field ${field}:`, result[field]);
      
      // Use DateService to standardize dates
      const standardized = DateService.standardizeDate(result[field]);
      
      // Use the ISO format for API data, but preserve the specific format that startDate/endDate need
      if (field === 'startDate' || field === 'endDate') {
        // For form date fields, use formatted (YYYY-MM-DD) 
        result[field] = standardized.formatted || null;
        console.log(`Standardized ${field} to form date:`, result[field]);
      } else {
        // For other date fields use ISO
        result[field] = standardized.iso || null;
        console.log(`Standardized ${field} to ISO date:`, result[field]);
      }
    }
  });
  
  // Handle the Influencer relation from Prisma model
  if (result.Influencer && Array.isArray(result.Influencer)) {
    console.log('Found Influencer relation in API response:', result.Influencer);
    
    // Copy the Influencer relation to the influencers field expected by the frontend
    result.influencers = result.Influencer.map((inf: Record<string, unknown>) => ({
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
      } catch {
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
  
  // Transform audience data from demographics, locations, targeting, competitors fields
  // into a consolidated audience structure
  const demographics = result.demographics || {};
  const locations = Array.isArray(result.locations) ? result.locations : [];
  const targeting = result.targeting || {};
  const competitors = Array.isArray(result.competitors) ? result.competitors : [];
  
  // Debug logs for array fields
  console.log('API formatter - demographics:', demographics);
  console.log('API formatter - locations:', locations);
  console.log('API formatter - targeting:', targeting);
  console.log('API formatter - competitors:', competitors);
  
  // Extract location strings
  const locationStrings = locations.map((loc: Record<string, unknown>) => {
    // Handle different location formats
    if (typeof loc === 'string') return loc;
    if (loc && typeof loc.location === 'string') return loc.location;
    return '';
  }).filter(Boolean);
  console.log('API formatter - extracted locationStrings:', locationStrings);
  
  // Extract screening questions
  const targetingWithScreening = targeting as { screeningQuestions?: unknown[] };
  const screeningQuestions = Array.isArray(targetingWithScreening.screeningQuestions) 
    ? targetingWithScreening.screeningQuestions.map((q: unknown) => {
        if (typeof q === 'string') return q;
        if (q && typeof q === 'object') {
          const questionObj = q as Record<string, unknown>;
          if (typeof questionObj.question === 'string') return questionObj.question;
        }
        return '';
      }).filter(Boolean)
    : [];
  console.log('API formatter - extracted screeningQuestions:', screeningQuestions);
  
  // Extract languages
  const targetingWithLanguages = targeting as { languages?: unknown[] };
  const languages = Array.isArray(targetingWithLanguages.languages)
    ? targetingWithLanguages.languages.map((l: unknown) => {
        if (typeof l === 'string') return l;
        if (l && typeof l === 'object') {
          const languageObj = l as Record<string, unknown>;
          if (typeof languageObj.language === 'string') return languageObj.language;
        }
        return '';
      }).filter(Boolean)
    : [];
  console.log('API formatter - extracted languages:', languages);
  
  // Extract job titles
  const demographicsWithJobs = demographics as { jobTitles?: unknown[] };
  const jobTitles = Array.isArray(demographicsWithJobs.jobTitles)
    ? demographicsWithJobs.jobTitles
    : [];
  console.log('API formatter - jobTitles:', jobTitles);
  
  // Extract competitors
  const competitorStrings = Array.isArray(competitors) 
    ? competitors
    : [];
  console.log('API formatter - extracted competitorStrings:', competitorStrings);
  
  // Create or update audience field with transformed data
  const demographicsWithAge = demographics as { 
    ageDistribution?: { 
      age1824?: number, 
      age2534?: number, 
      age3544?: number, 
      age4554?: number, 
      age5564?: number, 
      age65plus?: number 
    },
    gender?: unknown[],
    otherGender?: string,
    educationLevel?: string,
    incomeLevel?: number
  };
  
  result.audience = {
    ...(result.audience || {}),
    location: locationStrings,
    ageDistribution: {
      age1824: demographicsWithAge.ageDistribution?.age1824 ?? 20,
      age2534: demographicsWithAge.ageDistribution?.age2534 ?? 25,
      age3544: demographicsWithAge.ageDistribution?.age3544 ?? 20,
      age4554: demographicsWithAge.ageDistribution?.age4554 ?? 15,
      age5564: demographicsWithAge.ageDistribution?.age5564 ?? 10,
      age65plus: demographicsWithAge.ageDistribution?.age65plus ?? 10,
    },
    gender: Array.isArray(demographicsWithAge.gender) ? demographicsWithAge.gender : [],
    otherGender: demographicsWithAge.otherGender || "",
    screeningQuestions: screeningQuestions,
    languages: languages,
    educationLevel: demographicsWithAge.educationLevel || "",
    jobTitles: jobTitles,
    incomeLevel: demographicsWithAge.incomeLevel ?? 20000,
    competitors: competitorStrings,
  };
  
  console.log('Normalized audience data:', result.audience);
  
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
export function standardizeApiResponseArray(dataArray: unknown[]) {
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
  return DateService.toApiDate(date as string);
} 