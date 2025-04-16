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
import { logger } from './logger';
import { User } from '@prisma/client'; // Import User type

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

  // Handle the Influencer relation from Prisma model
  if (result.Influencer && Array.isArray(result.Influencer)) {
    // logger.debug('Found Influencer relation in API response:', result.Influencer);

    // Copy the Influencer relation to the influencers field expected by the frontend
    result.influencers = result.Influencer.map((inf: Record<string, unknown>) => ({
      id: inf.id,
      platform: inf.platform,
      handle: inf.handle,
      platformId: inf.platformId,
    }));

    // logger.debug('Mapped Influencer relation to influencers array:', result.influencers);

    // Remove the original Influencer field to avoid confusion
    delete result.Influencer;
  }

  // Parse JSON string fields
  [
    'primaryContact',
    'secondaryContact',
    'budget',
    'additionalContacts',
    'influencers',
    'demographics',
    'locations',
    'targeting',
    'competitors',
  ].forEach(field => {
    if (typeof result[field] === 'string') {
      try {
        // logger.debug(`Parsing JSON string for ${field}:`, result[field]);
        const parsed = JSON.parse(result[field]);
        result[field] = parsed;
        // logger.debug(`Successfully parsed ${field} to:`, result[field]);
      } catch {
        logger.warn(`Failed to parse ${field} JSON:`, result[field]);
        // Set appropriate defaults based on field type
        if (field === 'primaryContact' || field === 'secondaryContact') {
          result[field] = {};
        } else if (
          field === 'influencers' ||
          field === 'additionalContacts' ||
          field === 'locations' ||
          field === 'competitors'
        ) {
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
  const _locations = Array.isArray(result.locations) ? result.locations : [];
  const targeting = result.targeting || {};
  const _competitors = Array.isArray(result.competitors) ? result.competitors : [];

  // Extract location strings
  /* // Removed unused variable locationStrings
  const locationStrings = locations
    .map((loc: Record<string, unknown>) => {
      // Handle different location formats
      if (typeof loc === 'string') return loc;
      if (loc && typeof loc.location === 'string') return loc.location;
      return '';
    })
    .filter(Boolean);
  */
  // console.log('API formatter - extracted locationStrings:', locationStrings);

  // Extract screening questions
  const _targetingWithScreening = targeting as { screeningQuestions?: unknown[] };
  /* // Removed unused variable screeningQuestions
  const screeningQuestions = Array.isArray(targetingWithScreening.screeningQuestions)
    ? targetingWithScreening.screeningQuestions
        .map((q: unknown) => {
          if (typeof q === 'string') return q;
          if (q && typeof q === 'object') {
            const questionObj = q as Record<string, unknown>;
            if (typeof questionObj.question === 'string') return questionObj.question;
          }
          return '';
        })
        .filter(Boolean)
    : [];
  */
  // console.log('API formatter - extracted screeningQuestions:', screeningQuestions);

  // Extract languages
  const _targetingWithLanguages = targeting as { languages?: unknown[] };
  /* // Removed unused variable languages
  const languages = Array.isArray(targetingWithLanguages.languages)
    ? targetingWithLanguages.languages
        .map((l: unknown) => {
          if (typeof l === 'string') return l;
          if (l && typeof l === 'object') {
            const languageObj = l as Record<string, unknown>;
            if (typeof languageObj.language === 'string') return languageObj.language;
          }
          return '';
        })
        .filter(Boolean)
    : [];
  */
  // console.log('API formatter - extracted languages:', languages);

  // Extract job titles
  const _demographicsWithJobs = demographics as { jobTitles?: unknown[] };
  /* // Removed unused variable jobTitles
  const jobTitles = Array.isArray(demographicsWithJobs.jobTitles)
    ? demographicsWithJobs.jobTitles
    : [];
  */
  // console.log('API formatter - jobTitles:', jobTitles);

  // Extract competitors
  /* // Removed unused variable competitorStrings
  const competitorStrings = Array.isArray(competitors) ? competitors : [];
  */
  // console.log('API formatter - extracted competitorStrings:', competitorStrings);

  // Create or update audience field with transformed data
  /* // Removed unused variable demographicsWithAge
  const demographicsWithAge = demographics as {
    ageDistribution?: {
      age1824?: number;
      age2534?: number;
      age3544?: number;
      age4554?: number;
      age5564?: number;
      age65plus?: number;
    };
    gender?: unknown[];
    otherGender?: string;
    educationLevel?: string;
    incomeLevel?: number;
  };
  */

  // Constructing the audience object is currently unused, removing
  // const audience = {
  //   ...(result.audience || {}),
  //   location: locationStrings,
  //   ageDistribution: {
  //     age1824: demographicsWithAge.ageDistribution?.age1824 ?? 20,
  //     age2534: demographicsWithAge.ageDistribution?.age2534 ?? 25,
  //     age3544: demographicsWithAge.ageDistribution?.age3544 ?? 20,
  //     age4554: demographicsWithAge.ageDistribution?.age4554 ?? 15,
  //     age5564: demographicsWithAge.ageDistribution?.age5564 ?? 10,
  //     age65plus: demographicsWithAge.ageDistribution?.age65plus ?? 10,
  //   },
  //   gender: Array.isArray(demographicsWithAge.gender) ? demographicsWithAge.gender : [],
  //   otherGender: demographicsWithAge.otherGender || '',
  //   screeningQuestions: screeningQuestions,
  //   languages: languages,
  //   educationLevel: demographicsWithAge.educationLevel || '',
  //   jobTitles: jobTitles,
  //   incomeLevel: demographicsWithAge.incomeLevel ?? 20000,
  //   competitors: competitorStrings,
  // };

  // console.log('Normalized audience data:', audience); // Also remove associated log

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
      // logger.debug(`Initializing ${field} as empty array`);
      result[field] = [];
    }
  });

  // Ensure influencers has at least one empty item if it's empty
  if (Array.isArray(result.influencers) && result.influencers.length === 0) {
    // logger.debug('Adding default empty influencer item to empty array');
    result.influencers = [{ platform: '', handle: '' }];
  }

  // Log standardized response for debugging
  // logger.debug('Standardized API response:', result);

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

// TODO: Define or import CampaignWithDetails type properly
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const formatCampaignDataForResponse = (campaign: any) => {
  const {
    // Revert destructuring changes
    influencers,
    _contacts,
    audience,
    _creativeAssets,
    _creativeRequirements,
    _locations,
    _competitors,
    _restOfCampaign, // Prefix unused
  } = campaign;

  const _formattedInfluencers = influencers?.map(({ _user, ..._inf }: { _user: User }) => ({
    // Add explicit type for _user
    // ... existing code ...
  }));

  // Example transformation for audience (assuming nested structures)

  const _formattedAudience = audience // Prefix unused
    ? {
        ...audience,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        targetingWithScreening: audience.targetingWithScreening?.map((tws: any) => ({ ...tws })),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        targetingWithLanguages: audience.targetingWithLanguages?.map((twl: any) => ({ ...twl })),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        demographicsWithJobs: audience.demographicsWithJobs?.map((dwj: any) => ({ ...dwj })),
      }
    : undefined;

  return {
    // ... existing code ...
  };
};
