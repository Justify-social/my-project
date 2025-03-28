import { SurveyPreviewData, SurveyResponses, ValidationErrors } from '@/types/brandLift';

/**
 * API Service layer for Brand Lift surveys
 * Handles all communication with the backend for survey data
 */
export class BrandLiftService {
  private static instance: BrandLiftService;
  private baseUrl: string = '/api/brand-lift';

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get singleton instance of the service
   */
  public static getInstance(): BrandLiftService {
    if (!BrandLiftService.instance) {
      BrandLiftService.instance = new BrandLiftService();
    }
    return BrandLiftService.instance;
  }

  /**
   * Fetch survey preview data for a specific campaign
   * @param campaignId - The ID of the campaign
   * @returns Promise with survey preview data
   */
  public async getSurveyPreviewData(campaignId: string): Promise<SurveyPreviewData> {
    try {
      const response = await fetch(`${this.baseUrl}/survey-preview?campaignId=${campaignId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch survey preview: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching survey preview data:', error);
      throw error;
    }
  }

  /**
   * Submit survey responses
   * @param campaignId - The ID of the campaign
   * @param responses - The user's responses to survey questions
   * @returns Promise with validation result
   */
  public async submitSurveyResponses(
    campaignId: string, 
    responses: SurveyResponses
  ): Promise<{ success: boolean; errors?: ValidationErrors }> {
    try {
      const response = await fetch(`${this.baseUrl}/submit-responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaignId,
          responses,
        }),
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error submitting survey responses:', error);
      throw error;
    }
  }

  /**
   * Update creative assets in survey preview
   * @param campaignId - The ID of the campaign
   * @param platformId - The platform to update assets for
   * @param assetId - The ID of the new asset
   * @returns Promise with updated survey preview data
   */
  public async updateCreativeAsset(
    campaignId: string,
    platformId: string,
    assetId: string
  ): Promise<SurveyPreviewData> {
    try {
      const response = await fetch(`${this.baseUrl}/update-asset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaignId,
          platformId,
          assetId,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update asset: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating creative asset:', error);
      throw error;
    }
  }

  /**
   * Change active platform in survey preview
   * @param campaignId - The ID of the campaign
   * @param platformId - The ID of the platform to set as active
   * @returns Promise with updated survey preview data
   */
  public async changeActivePlatform(
    campaignId: string,
    platformId: string
  ): Promise<SurveyPreviewData> {
    try {
      const response = await fetch(`${this.baseUrl}/change-platform`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaignId,
          platformId,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to change platform: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error changing active platform:', error);
      throw error;
    }
  }
  
  /**
   * Save survey draft state
   * @param campaignId - The ID of the campaign
   * @param responses - The current partial responses
   * @returns Promise indicating success
   */
  public async saveSurveyDraft(
    campaignId: string,
    responses: SurveyResponses
  ): Promise<{ success: boolean }> {
    try {
      const response = await fetch(`${this.baseUrl}/save-draft`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaignId,
          responses,
        }),
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error saving survey draft:', error);
      throw error;
    }
  }
} 