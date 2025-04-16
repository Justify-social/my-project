/**
 * Campaign Service
 *
 * A unified service to handle all campaign-related operations with proper validation and data mapping.
 * This service handles API requests, data validation, and error handling for campaign operations.
 */

import { dbLogger, DbOperation } from './db-logger';
import {
  validateCampaignData,
  validateAudienceData,
  validateAssetData,
  validateFullCampaign,
  validationErrorResponse,
  CampaignData,
  AudienceData,
  AssetData,
  ValidationError,
  LocationData,
  GenderData,
  AgeRangeData,
  ScreeningQuestionData,
  LanguageData,
  CompetitorData,
} from './validation';

/**
 * Response interface for API operations
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  status: number;
  message: string;
  data?: T;
  errors?: ValidationError[];
}

// Define type for objectives update payload
interface ObjectivesUpdateData {
  objectives?: string[]; // Assuming string array based on usage
}

// Define type for audience update payload
interface AudienceUpdateData {
  locations?: LocationData[];
  genders?: GenderData[];
  ageRanges?: AgeRangeData[];
  screeningQuestions?: ScreeningQuestionData[];
  languages?: LanguageData[];
  competitors?: CompetitorData[];
}

/**
 * Campaign service for handling all campaign-related operations
 */
export class CampaignService {
  /**
   * Fetch a campaign by ID with all related data
   * @param id Campaign ID
   * @returns API response with campaign data
   */
  public async getCampaign(id: number): Promise<ApiResponse<CampaignData>> {
    try {
      dbLogger.info(DbOperation.FETCH, `Fetching campaign with ID ${id}`, { campaignId: id });

      const response = await fetch(`/api/campaigns/${id}`);

      if (!response.ok) {
        const errorData = await response.json();
        dbLogger.error(
          DbOperation.FETCH,
          `Error fetching campaign ${id}`,
          { campaignId: id, status: response.status },
          errorData
        );

        return {
          success: false,
          status: response.status,
          message: errorData.message || 'Failed to fetch campaign',
          errors: errorData.errors,
        };
      }

      const campaignData = await response.json();

      dbLogger.debug(DbOperation.FETCH, `Successfully fetched campaign ${id}`, { campaignId: id });

      return {
        success: true,
        status: response.status,
        message: 'Campaign fetched successfully',
        data: campaignData,
      };
    } catch (error) {
      dbLogger.error(
        DbOperation.FETCH,
        `Exception while fetching campaign ${id}`,
        { campaignId: id },
        error
      );

      return {
        success: false,
        status: 500,
        message:
          error instanceof Error ? error.message : 'Unknown error occurred while fetching campaign',
      };
    }
  }

  /**
   * Update campaign overview data
   * @param id Campaign ID
   * @param data Campaign overview data to update
   * @returns API response
   */
  public async updateOverview(id: number, data: Partial<CampaignData>): Promise<ApiResponse> {
    try {
      // Validate the data first
      const campaignDataForValidation: CampaignData = {
        id,
        name: data.name || '', // Provide default for validation
        status: data.status || 'draft', // Provide default for validation
        startDate: data.startDate,
        endDate: data.endDate,
        budget: data.budget,
        description: data.description,
        brandId: data.brandId,
      };

      const validationResult = validateCampaignData(campaignDataForValidation);

      if (!validationResult.valid) {
        return validationErrorResponse(validationResult);
      }

      dbLogger.info(DbOperation.UPDATE, `Updating campaign ${id} overview`, { campaignId: id });

      const response = await fetch(`/api/campaigns/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        dbLogger.error(
          DbOperation.UPDATE,
          `Error updating campaign ${id} overview`,
          { campaignId: id, status: response.status },
          errorData
        );

        return {
          success: false,
          status: response.status,
          message: errorData.message || 'Failed to update campaign overview',
          errors: errorData.errors,
        };
      }

      const updatedData = await response.json();

      dbLogger.info(DbOperation.UPDATE, `Successfully updated campaign ${id} overview`, {
        campaignId: id,
      });

      return {
        success: true,
        status: response.status,
        message: 'Campaign overview updated successfully',
        data: updatedData,
      };
    } catch (error) {
      dbLogger.error(
        DbOperation.UPDATE,
        `Exception while updating campaign ${id} overview`,
        { campaignId: id },
        error
      );

      return {
        success: false,
        status: 500,
        message:
          error instanceof Error ? error.message : 'Unknown error occurred while updating campaign',
      };
    }
  }

  /**
   * Update campaign objectives data
   * @param id Campaign ID
   * @param data Campaign objectives data to update
   * @returns API response
   */
  public async updateObjectives(id: number, data: ObjectivesUpdateData): Promise<ApiResponse> {
    try {
      dbLogger.info(DbOperation.UPDATE, `Updating campaign ${id} objectives`, { campaignId: id });

      const response = await fetch(`/api/campaigns/${id}/objectives`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          objectives: data.objectives,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        dbLogger.error(
          DbOperation.UPDATE,
          `Error updating campaign ${id} objectives`,
          { campaignId: id, status: response.status },
          errorData
        );

        return {
          success: false,
          status: response.status,
          message: errorData.message || 'Failed to update campaign objectives',
          errors: errorData.errors,
        };
      }

      const updatedData = await response.json();

      dbLogger.info(DbOperation.UPDATE, `Successfully updated campaign ${id} objectives`, {
        campaignId: id,
      });

      return {
        success: true,
        status: response.status,
        message: 'Campaign objectives updated successfully',
        data: updatedData,
      };
    } catch (error) {
      dbLogger.error(
        DbOperation.UPDATE,
        `Exception while updating campaign ${id} objectives`,
        { campaignId: id },
        error
      );

      return {
        success: false,
        status: 500,
        message:
          error instanceof Error
            ? error.message
            : 'Unknown error occurred while updating objectives',
      };
    }
  }

  /**
   * Update campaign audience data
   * @param id Campaign ID
   * @param data Campaign audience data to update
   * @returns API response
   */
  public async updateAudience(id: number, data: AudienceUpdateData): Promise<ApiResponse> {
    try {
      // Map the input data to the AudienceData structure for validation/API call
      const audienceData: AudienceData = {
        campaignId: id,
        targetLocations: data.locations || [], // Map input key
        targetGenders: data.genders || [], // Map input key
        targetAgeRanges: data.ageRanges || [], // Map input key
        screeningQuestions: data.screeningQuestions || [],
        languages: data.languages || [],
        competitors: data.competitors || [],
      };

      const validationResult = validateAudienceData(audienceData);

      if (!validationResult.valid) {
        return validationErrorResponse(validationResult);
      }

      dbLogger.info(DbOperation.UPDATE, `Updating campaign ${id} audience`, { campaignId: id });

      const response = await fetch(`/api/campaigns/${id}/audience`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(audienceData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        dbLogger.error(
          DbOperation.UPDATE,
          `Error updating campaign ${id} audience`,
          { campaignId: id, status: response.status },
          errorData
        );

        return {
          success: false,
          status: response.status,
          message: errorData.message || 'Failed to update campaign audience',
          errors: errorData.errors,
        };
      }

      const updatedData = await response.json();

      dbLogger.info(DbOperation.UPDATE, `Successfully updated campaign ${id} audience`, {
        campaignId: id,
      });

      return {
        success: true,
        status: response.status,
        message: 'Campaign audience updated successfully',
        data: updatedData,
      };
    } catch (error) {
      dbLogger.error(
        DbOperation.UPDATE,
        `Exception while updating campaign ${id} audience`,
        { campaignId: id },
        error
      );

      return {
        success: false,
        status: 500,
        message:
          error instanceof Error ? error.message : 'Unknown error occurred while updating audience',
      };
    }
  }

  /**
   * Update campaign assets
   * @param id Campaign ID
   * @param assets Campaign assets data to update
   * @returns API response
   */
  public async updateAssets(id: number, assets: AssetData[]): Promise<ApiResponse> {
    try {
      // Validate each asset
      for (const asset of assets) {
        const validationResult = validateAssetData(asset);
        if (!validationResult.valid) {
          return validationErrorResponse(validationResult);
        }
      }

      dbLogger.info(DbOperation.UPDATE, `Updating campaign ${id} assets`, {
        campaignId: id,
        assetCount: assets.length,
      });

      const response = await fetch(`/api/campaigns/${id}/assets`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ assets }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        dbLogger.error(
          DbOperation.UPDATE,
          `Error updating campaign ${id} assets`,
          { campaignId: id, status: response.status },
          errorData
        );

        return {
          success: false,
          status: response.status,
          message: errorData.message || 'Failed to update campaign assets',
          errors: errorData.errors,
        };
      }

      const updatedData = await response.json();

      dbLogger.info(DbOperation.UPDATE, `Successfully updated campaign ${id} assets`, {
        campaignId: id,
      });

      return {
        success: true,
        status: response.status,
        message: 'Campaign assets updated successfully',
        data: updatedData,
      };
    } catch (error) {
      dbLogger.error(
        DbOperation.UPDATE,
        `Exception while updating campaign ${id} assets`,
        { campaignId: id },
        error
      );

      return {
        success: false,
        status: 500,
        message:
          error instanceof Error ? error.message : 'Unknown error occurred while updating assets',
      };
    }
  }

  /**
   * Create a new campaign
   * @param data Initial campaign data
   * @returns API response with the created campaign
   */
  public async createCampaign(data: Partial<CampaignData>): Promise<ApiResponse<CampaignData>> {
    try {
      // Prepare minimal data for a new campaign
      const campaignData: CampaignData = {
        name: data.name || 'New Campaign',
        status: 'draft',
        ...data,
      };

      const validationResult = validateCampaignData(campaignData);

      if (!validationResult.valid) {
        return validationErrorResponse(validationResult);
      }

      dbLogger.info(DbOperation.CREATE, 'Creating new campaign', { name: campaignData.name });

      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(campaignData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        dbLogger.error(
          DbOperation.CREATE,
          'Error creating new campaign',
          { name: campaignData.name, status: response.status },
          errorData
        );

        return {
          success: false,
          status: response.status,
          message: errorData.message || 'Failed to create campaign',
          errors: errorData.errors,
        };
      }

      const createdCampaign = await response.json();

      // Safely convert the ID to a number
      const campaignId =
        typeof createdCampaign.id === 'string'
          ? parseInt(createdCampaign.id, 10)
          : (createdCampaign.id as number);

      dbLogger.info(DbOperation.CREATE, `Successfully created campaign with ID ${campaignId}`, {
        campaignId,
        name: createdCampaign.name,
      });

      return {
        success: true,
        status: response.status,
        message: 'Campaign created successfully',
        data: createdCampaign,
      };
    } catch (error) {
      dbLogger.error(
        DbOperation.CREATE,
        'Exception while creating campaign',
        { name: data.name },
        error
      );

      return {
        success: false,
        status: 500,
        message:
          error instanceof Error ? error.message : 'Unknown error occurred while creating campaign',
      };
    }
  }

  /**
   * Delete a campaign
   * @param id Campaign ID to delete
   * @returns API response
   */
  public async deleteCampaign(id: number): Promise<ApiResponse> {
    try {
      dbLogger.info(DbOperation.DELETE, `Deleting campaign with ID ${id}`, { campaignId: id });

      const response = await fetch(`/api/campaigns/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        dbLogger.error(
          DbOperation.DELETE,
          `Error deleting campaign ${id}`,
          { campaignId: id, status: response.status },
          errorData
        );

        return {
          success: false,
          status: response.status,
          message: errorData.message || 'Failed to delete campaign',
          errors: errorData.errors,
        };
      }

      dbLogger.info(DbOperation.DELETE, `Successfully deleted campaign ${id}`, { campaignId: id });

      return {
        success: true,
        status: response.status,
        message: 'Campaign deleted successfully',
      };
    } catch (error) {
      dbLogger.error(
        DbOperation.DELETE,
        `Exception while deleting campaign ${id}`,
        { campaignId: id },
        error
      );

      return {
        success: false,
        status: 500,
        message:
          error instanceof Error ? error.message : 'Unknown error occurred while deleting campaign',
      };
    }
  }

  /**
   * Update full campaign data in a single transaction
   * @param id Campaign ID
   * @param data Complete campaign data
   * @returns API response
   */
  public async updateFullCampaign(
    id: number,
    data: {
      campaign: CampaignData;
      audience?: AudienceData;
      assets?: AssetData[];
    }
  ): Promise<ApiResponse> {
    try {
      // Ensure the ID is set correctly
      data.campaign.id = id;
      if (data.audience) {
        data.audience.campaignId = id;
      }
      if (data.assets) {
        data.assets.forEach(asset => (asset.campaignId = id));
      }

      // Validate the full data set
      const validationResult = validateFullCampaign(data.campaign, data.audience, data.assets);

      if (!validationResult.valid) {
        return validationErrorResponse(validationResult);
      }

      dbLogger.info(DbOperation.TRANSACTION, `Updating full campaign ${id} data in transaction`, {
        campaignId: id,
      });

      const response = await fetch(`/api/campaigns/${id}/full`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        dbLogger.error(
          DbOperation.TRANSACTION,
          `Error updating full campaign ${id} data`,
          { campaignId: id, status: response.status },
          errorData
        );

        return {
          success: false,
          status: response.status,
          message: errorData.message || 'Failed to update campaign data',
          errors: errorData.errors,
        };
      }

      const updatedData = await response.json();

      dbLogger.info(DbOperation.TRANSACTION, `Successfully updated full campaign ${id} data`, {
        campaignId: id,
      });

      return {
        success: true,
        status: response.status,
        message: 'Campaign updated successfully',
        data: updatedData,
      };
    } catch (error) {
      dbLogger.error(
        DbOperation.TRANSACTION,
        `Exception while updating full campaign ${id} data`,
        { campaignId: id },
        error
      );

      return {
        success: false,
        status: 500,
        message:
          error instanceof Error ? error.message : 'Unknown error occurred while updating campaign',
      };
    }
  }

  /**
   * Auto-save campaign data during wizard steps
   * @param id Campaign ID
   * @param step Wizard step number
   * @param data Step-specific data
   * @returns API response
   */
  public async autoSaveWizardStep(id: number, step: number, data: unknown): Promise<ApiResponse> {
    try {
      dbLogger.info(DbOperation.UPDATE, `Auto-saving campaign ${id} wizard step ${step}`, {
        campaignId: id,
        step,
      });

      const response = await fetch(`/api/campaigns/${id}/wizard/${step}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          step,
          data,
          autosave: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        dbLogger.warn(
          DbOperation.UPDATE,
          `Error auto-saving campaign ${id} wizard step ${step}`,
          { campaignId: id, step, status: response.status },
          errorData
        );

        return {
          success: false,
          status: response.status,
          message: errorData.message || 'Failed to auto-save campaign data',
          errors: errorData.errors,
        };
      }

      const savedData = await response.json();

      dbLogger.debug(
        DbOperation.UPDATE,
        `Successfully auto-saved campaign ${id} wizard step ${step}`,
        { campaignId: id, step }
      );

      return {
        success: true,
        status: response.status,
        message: 'Campaign auto-saved successfully',
        data: savedData,
      };
    } catch (error) {
      const unknownError = error as unknown; // Type as unknown
      console.error(
        `Error auto-saving campaign ${id} wizard step ${step}:`,
        unknownError instanceof Error ? unknownError.message : String(unknownError)
      );
      return {
        success: false,
        status: 500,
        message:
          error instanceof Error ? error.message : 'An unknown error occurred during autosave.',
      };
    }
  }
}

// Instantiate the service
export const campaignService = new CampaignService();
