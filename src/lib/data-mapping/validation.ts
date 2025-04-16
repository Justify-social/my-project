/**
 * Campaign Data Validation
 *
 * This module provides validation functions for campaign data before it's saved to the database.
 * It ensures data integrity and provides helpful error messages for invalid data.
 */

import { dbLogger, DbOperation } from './db-logger';

// Types for campaign data
// These should match the database schema structure
export interface CampaignData {
  id?: number;
  name: string;
  status: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  objectives?: string[];
  description?: string;
  brandId?: number;
  audienceId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AudienceData {
  id?: number;
  campaignId?: number;
  targetLocations?: LocationData[];
  targetGenders?: GenderData[];
  targetAgeRanges?: AgeRangeData[];
  screeningQuestions?: ScreeningQuestionData[];
  languages?: LanguageData[];
  competitors?: CompetitorData[];
  createdAt?: string;
  updatedAt?: string;
}

export interface LocationData {
  id?: number;
  audienceId?: number;
  country: string;
  region?: string;
  city?: string;
}

export interface GenderData {
  id?: number;
  audienceId?: number;
  gender: string;
}

export interface AgeRangeData {
  id?: number;
  audienceId?: number;
  minAge: number;
  maxAge: number;
}

export interface ScreeningQuestionData {
  id?: number;
  audienceId?: number;
  question: string;
  required: boolean;
  options?: string[];
}

export interface LanguageData {
  id?: number;
  audienceId?: number;
  language: string;
}

export interface CompetitorData {
  id?: number;
  audienceId?: number;
  name: string;
}

export interface AssetData {
  id?: number;
  campaignId?: number;
  type: string;
  url?: string;
  name?: string;
  description?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Validation Result interface
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

// Validation Error interface
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

/**
 * Main validation function for campaign data
 * @param campaignData The campaign data to validate
 * @returns ValidationResult object with validation status and errors
 */
export function validateCampaignData(campaignData: CampaignData): ValidationResult {
  const errors: ValidationError[] = [];

  // Basic validations
  if (!campaignData.name || campaignData.name.trim().length === 0) {
    errors.push({
      field: 'name',
      message: 'Campaign name is required',
      code: 'REQUIRED_FIELD',
    });
  }

  if (campaignData.name && campaignData.name.length > 100) {
    errors.push({
      field: 'name',
      message: 'Campaign name must be less than 100 characters',
      code: 'MAX_LENGTH_EXCEEDED',
    });
  }

  // Status validation
  const validStatuses = ['draft', 'active', 'paused', 'completed', 'archived'];
  if (!validStatuses.includes(campaignData.status)) {
    errors.push({
      field: 'status',
      message: `Status must be one of: ${validStatuses.join(', ')}`,
      code: 'INVALID_VALUE',
    });
  }

  // Date validations
  if (campaignData.startDate && campaignData.endDate) {
    const start = new Date(campaignData.startDate);
    const end = new Date(campaignData.endDate);

    if (isNaN(start.getTime())) {
      errors.push({
        field: 'startDate',
        message: 'Start date is invalid',
        code: 'INVALID_DATE',
      });
    }

    if (isNaN(end.getTime())) {
      errors.push({
        field: 'endDate',
        message: 'End date is invalid',
        code: 'INVALID_DATE',
      });
    }

    if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && start > end) {
      errors.push({
        field: 'endDate',
        message: 'End date must be after start date',
        code: 'DATE_RANGE_INVALID',
      });
    }
  }

  // Budget validation
  if (campaignData.budget !== undefined && campaignData.budget < 0) {
    errors.push({
      field: 'budget',
      message: 'Budget must be a positive number',
      code: 'NEGATIVE_VALUE',
    });
  }

  // Log validation results
  if (errors.length > 0) {
    dbLogger.warn(
      DbOperation.VALIDATION,
      `Campaign validation failed with ${errors.length} errors`,
      { campaignId: campaignData.id, errors }
    );
  } else {
    dbLogger.debug(DbOperation.VALIDATION, 'Campaign validation successful', {
      campaignId: campaignData.id,
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate audience data
 * @param audienceData The audience data to validate
 * @returns ValidationResult object with validation status and errors
 */
export function validateAudienceData(audienceData: AudienceData): ValidationResult {
  const errors: ValidationError[] = [];

  // Validate locations
  if (audienceData.targetLocations) {
    audienceData.targetLocations.forEach((location, index) => {
      if (!location.country || location.country.trim().length === 0) {
        errors.push({
          field: `targetLocations[${index}].country`,
          message: 'Country is required for all target locations',
          code: 'REQUIRED_FIELD',
        });
      }
    });
  }

  // Validate genders
  if (audienceData.targetGenders) {
    const validGenders = ['male', 'female', 'non-binary', 'all'];
    audienceData.targetGenders.forEach((genderData, index) => {
      if (!validGenders.includes(genderData.gender.toLowerCase())) {
        errors.push({
          field: `targetGenders[${index}].gender`,
          message: `Gender must be one of: ${validGenders.join(', ')}`,
          code: 'INVALID_VALUE',
        });
      }
    });
  }

  // Validate age ranges
  if (audienceData.targetAgeRanges) {
    audienceData.targetAgeRanges.forEach((ageRange, index) => {
      if (ageRange.minAge < 0) {
        errors.push({
          field: `targetAgeRanges[${index}].minAge`,
          message: 'Minimum age cannot be negative',
          code: 'NEGATIVE_VALUE',
        });
      }

      if (ageRange.maxAge < ageRange.minAge) {
        errors.push({
          field: `targetAgeRanges[${index}].maxAge`,
          message: 'Maximum age must be greater than or equal to minimum age',
          code: 'INVALID_RANGE',
        });
      }

      if (ageRange.maxAge > 120) {
        errors.push({
          field: `targetAgeRanges[${index}].maxAge`,
          message: 'Maximum age cannot exceed 120',
          code: 'MAX_VALUE_EXCEEDED',
        });
      }
    });
  }

  // Validate screening questions
  if (audienceData.screeningQuestions) {
    audienceData.screeningQuestions.forEach((question, index) => {
      if (!question.question || question.question.trim().length === 0) {
        errors.push({
          field: `screeningQuestions[${index}].question`,
          message: 'Question text is required',
          code: 'REQUIRED_FIELD',
        });
      }

      if (question.options && question.options.length === 0) {
        errors.push({
          field: `screeningQuestions[${index}].options`,
          message: 'Question must have at least one option or no options array',
          code: 'EMPTY_ARRAY',
        });
      }
    });
  }

  // Log validation results
  if (errors.length > 0) {
    dbLogger.warn(
      DbOperation.VALIDATION,
      `Audience validation failed with ${errors.length} errors`,
      { audienceId: audienceData.id, campaignId: audienceData.campaignId, errors }
    );
  } else {
    dbLogger.debug(DbOperation.VALIDATION, 'Audience validation successful', {
      audienceId: audienceData.id,
      campaignId: audienceData.campaignId,
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate asset data
 * @param assetData The asset data to validate
 * @returns ValidationResult object with validation status and errors
 */
export function validateAssetData(assetData: AssetData): ValidationResult {
  const errors: ValidationError[] = [];

  // Type validation
  const validTypes = ['image', 'video', 'document', 'audio', 'other'];
  if (!validTypes.includes(assetData.type)) {
    errors.push({
      field: 'type',
      message: `Asset type must be one of: ${validTypes.join(', ')}`,
      code: 'INVALID_VALUE',
    });
  }

  // URL validation for completed assets
  if (assetData.status === 'completed' && (!assetData.url || assetData.url.trim().length === 0)) {
    errors.push({
      field: 'url',
      message: 'URL is required for completed assets',
      code: 'REQUIRED_FIELD',
    });
  }

  // Status validation
  const validStatuses = ['pending', 'uploading', 'processing', 'completed', 'failed'];
  if (assetData.status && !validStatuses.includes(assetData.status)) {
    errors.push({
      field: 'status',
      message: `Status must be one of: ${validStatuses.join(', ')}`,
      code: 'INVALID_VALUE',
    });
  }

  // Log validation results
  if (errors.length > 0) {
    dbLogger.warn(DbOperation.VALIDATION, `Asset validation failed with ${errors.length} errors`, {
      assetId: assetData.id,
      campaignId: assetData.campaignId,
      errors,
    });
  } else {
    dbLogger.debug(DbOperation.VALIDATION, 'Asset validation successful', {
      assetId: assetData.id,
      campaignId: assetData.campaignId,
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate full campaign with all related data
 * @param campaignData The campaign data
 * @param audienceData The audience data
 * @param assetsData The assets data
 * @returns ValidationResult object with combined validation status and errors
 */
export function validateFullCampaign(
  campaignData: CampaignData,
  audienceData?: AudienceData,
  assetsData?: AssetData[]
): ValidationResult {
  // Start with campaign validation
  const campaignValidation = validateCampaignData(campaignData);
  let errors = [...campaignValidation.errors];

  // Add audience validation if provided
  if (audienceData) {
    const audienceValidation = validateAudienceData(audienceData);
    errors = [...errors, ...audienceValidation.errors];
  }

  // Add assets validation if provided
  if (assetsData && assetsData.length > 0) {
    for (const asset of assetsData) {
      const assetValidation = validateAssetData(asset);
      errors = [...errors, ...assetValidation.errors];
    }
  }

  // Log overall validation results
  if (errors.length > 0) {
    dbLogger.warn(
      DbOperation.VALIDATION,
      `Full campaign validation failed with ${errors.length} errors`,
      { campaignId: campaignData.id, errorCount: errors.length }
    );
  } else {
    dbLogger.info(DbOperation.VALIDATION, 'Full campaign validation successful', {
      campaignId: campaignData.id,
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Format validation errors into a user-friendly message
 * @param result The validation result
 * @returns A string with formatted error messages
 */
export function formatValidationErrors(result: ValidationResult): string {
  if (result.valid) {
    return 'Validation passed successfully.';
  }

  return result.errors.map(error => `${error.field}: ${error.message}`).join('\n');
}

/**
 * Return response-ready validation error object for API responses
 * @param result The validation result
 * @returns An object ready to be returned as a JSON response
 */
export function validationErrorResponse(result: ValidationResult) {
  return {
    success: false,
    status: 400,
    message: 'Validation failed',
    errors: result.errors.map(error => ({
      field: error.field,
      message: error.message,
      code: error.code,
    })),
  };
}
