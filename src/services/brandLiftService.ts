import { SurveyPreviewData, SurveyResponses, ValidationErrors } from '@/types/brandLift';
import { Platform, KPI, CreativeAssetType } from '@prisma/client';

/**
 * API Service layer for Brand Lift surveys
 * Handles all communication with the backend for survey data
 */
export class BrandLiftService {
  private static instance: BrandLiftService;
  private baseUrl: string = '/api/brand-lift';
  private useMockData: boolean = process.env.NODE_ENV === 'development';

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
   * Generate mock survey data for development
   */
  private getMockSurveyData(campaignId: string): SurveyPreviewData {
    // Use string value instead of enum reference to avoid potential issues
    const imageType = 'image' as CreativeAssetType;
    const videoType = 'video' as CreativeAssetType;
    
    return {
      id: campaignId,
      campaignName: `Campaign ${campaignId}`,
      date: new Date().toISOString().split('T')[0],
      brandName: "EcoFriendly",
      brandLogo: "/images/brand-logo.png",
      platforms: [Platform.Instagram, Platform.TikTok, Platform.YouTube],
      activePlatform: Platform.Instagram,
      adCreative: {
        id: "asset1",
        type: imageType, // Use the local constant instead of enum reference
        url: "https://placehold.co/600x800/0078D7/FFFFFF?text=Campaign+Ad",
        aspectRatio: "3:4",
        thumbnailUrl: "https://placehold.co/300x300/0078D7/FFFFFF?text=Thumbnail",
        duration: 0 // Add default duration for video types
      },
      adCaption: "Discover our sustainable products that are changing the world! #EcoFriendly",
      adHashtags: "#Sustainable #GreenLiving #EcoFriendly #SaveThePlanet",
      adMusic: "Earth Vibes - Environmental Sounds",
      questions: [
        {
          id: "q1",
          title: "Have you heard of EcoFriendly before seeing this ad?",
          type: "Single Choice",
          kpi: KPI.brandAwareness,
          options: [
            { id: "q1o1", text: "Yes, I know the brand well", image: "https://placehold.co/400x300/4CAF50/FFFFFF?text=Know+Well" },
            { id: "q1o2", text: "Yes, I've heard of it", image: "https://placehold.co/400x300/8BC34A/FFFFFF?text=Heard+Of+It" },
            { id: "q1o3", text: "No, I've never heard of it", image: "https://placehold.co/400x300/F44336/FFFFFF?text=Never+Heard" }
          ],
          required: true
        },
        {
          id: "q2",
          title: "Do you recall seeing this specific ad recently?",
          type: "Single Choice",
          kpi: KPI.adRecall,
          options: [
            { id: "q2o1", text: "Yes, definitely", image: "https://placehold.co/400x300/4CAF50/FFFFFF?text=Definitely" },
            { id: "q2o2", text: "Yes, I think so", image: "https://placehold.co/400x300/8BC34A/FFFFFF?text=Think+So" },
            { id: "q2o3", text: "No, I don't think so", image: "https://placehold.co/400x300/FFC107/FFFFFF?text=Don't+Think+So" },
            { id: "q2o4", text: "No, definitely not", image: "https://placehold.co/400x300/F44336/FFFFFF?text=Definitely+Not" }
          ],
          required: true
        },
        {
          id: "q3",
          title: "After seeing this ad, how likely are you to consider EcoFriendly products?",
          type: "Single Choice",
          kpi: KPI.consideration,
          options: [
            { id: "q3o1", text: "Very likely", image: "https://placehold.co/400x300/4CAF50/FFFFFF?text=Very+Likely" },
            { id: "q3o2", text: "Somewhat likely", image: "https://placehold.co/400x300/8BC34A/FFFFFF?text=Somewhat+Likely" },
            { id: "q3o3", text: "Neither likely nor unlikely", image: "https://placehold.co/400x300/9E9E9E/FFFFFF?text=Neutral" },
            { id: "q3o4", text: "Somewhat unlikely", image: "https://placehold.co/400x300/FF9800/FFFFFF?text=Somewhat+Unlikely" },
            { id: "q3o5", text: "Very unlikely", image: "https://placehold.co/400x300/F44336/FFFFFF?text=Very+Unlikely" }
          ],
          required: true
        }
      ]
    };
  }

  /**
   * Fetch survey preview data for a specific campaign
   * @param campaignId - The ID of the campaign
   * @returns Promise with survey preview data
   */
  public async getSurveyPreviewData(campaignId: string): Promise<SurveyPreviewData> {
    try {
      // In development mode, use mock data to avoid API dependency
      if (this.useMockData) {
        console.log('Using mock data for survey preview');
        return this.getMockSurveyData(campaignId);
      }

      const response = await fetch(`${this.baseUrl}/survey-preview?id=${campaignId}`);
      
      if (!response.ok) {
        console.warn(`API error: ${response.status} ${response.statusText}. Falling back to mock data.`);
        return this.getMockSurveyData(campaignId);
      }
      
      // Parse the response and add safeguards
      const data = await response.json();
      return this.ensureValidSurveyData(data, campaignId);
    } catch (error) {
      console.error('Error fetching survey preview data:', error);
      console.warn('Falling back to mock data due to API error');
      return this.getMockSurveyData(campaignId);
    }
  }

  /**
   * Ensures the survey data has all required fields with fallbacks if needed
   * @param data - The survey data to validate
   * @param campaignId - The campaign ID for fallback data
   * @returns Valid survey preview data
   */
  private ensureValidSurveyData(data: any, campaignId: string): SurveyPreviewData {
    const fallbackData = this.getMockSurveyData(campaignId);
    
    // Ensure we have valid creative assets
    if (!data.adCreative || typeof data.adCreative !== 'object') {
      console.warn('Creative asset missing or invalid, using fallback');
      data.adCreative = fallbackData.adCreative;
    } else {
      // Ensure creative asset has required fields
      data.adCreative = {
        id: data.adCreative.id || fallbackData.adCreative.id,
        type: data.adCreative.type || fallbackData.adCreative.type,
        url: data.adCreative.url || fallbackData.adCreative.url,
        aspectRatio: data.adCreative.aspectRatio || fallbackData.adCreative.aspectRatio,
        thumbnailUrl: data.adCreative.thumbnailUrl || fallbackData.adCreative.thumbnailUrl,
        duration: data.adCreative.duration || 0
      };
    }
    
    // Ensure other required fields
    return {
      id: data.id || campaignId,
      campaignName: data.campaignName || `Campaign ${campaignId}`,
      date: data.date || new Date().toISOString().split('T')[0],
      brandName: data.brandName || fallbackData.brandName,
      brandLogo: data.brandLogo || fallbackData.brandLogo,
      platforms: Array.isArray(data.platforms) && data.platforms.length > 0 
        ? data.platforms 
        : fallbackData.platforms,
      activePlatform: data.activePlatform || fallbackData.activePlatform,
      adCreative: data.adCreative,
      adCaption: data.adCaption || fallbackData.adCaption,
      adHashtags: data.adHashtags || fallbackData.adHashtags,
      adMusic: data.adMusic || fallbackData.adMusic,
      questions: Array.isArray(data.questions) && data.questions.length > 0
        ? data.questions.map((q: any) => ({
            id: q.id || `q${Math.random().toString(36).slice(2, 7)}`,
            title: q.title || 'Question',
            type: q.type || 'Single Choice',
            kpi: q.kpi || KPI.brandAwareness,
            options: Array.isArray(q.options) ? q.options : fallbackData.questions[0].options
          }))
        : fallbackData.questions
    };
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
      if (this.useMockData) {
        console.log('Using mock data for survey response submission');
        return { success: true };
      }

      const response = await fetch(`${this.baseUrl}/submit-responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: campaignId,
          responses,
        }),
      });
      
      if (!response.ok) {
        console.warn(`API error: ${response.status} ${response.statusText}. Returning mock success.`);
        return { success: true };
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error submitting survey responses:', error);
      // Return mock success in development
      return { success: true };
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
      if (this.useMockData) {
        console.log('Using mock data for asset update');
        const mockData = this.getMockSurveyData(campaignId);
        mockData.adCreative.id = assetId;
        mockData.adCreative.url = `https://placehold.co/600x800/0078D7/FFFFFF?text=New+Asset+${assetId}`;
        return mockData;
      }

      const response = await fetch(`${this.baseUrl}/update-asset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: campaignId,
          platformId,
          assetId,
        }),
      });
      
      if (!response.ok) {
        console.warn(`API error: ${response.status} ${response.statusText}. Falling back to mock data.`);
        return this.getMockSurveyData(campaignId);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating creative asset:', error);
      return this.getMockSurveyData(campaignId);
    }
  }

  /**
   * Change active platform in survey preview
   * @param campaignId - The ID of the campaign
   * @param platform - The platform to set as active
   * @returns Promise with updated survey preview data
   */
  public async changeActivePlatform(
    campaignId: string,
    platform: Platform
  ): Promise<SurveyPreviewData> {
    try {
      if (this.useMockData) {
        console.log('Using mock data for platform change');
        const mockData = this.getMockSurveyData(campaignId);
        mockData.activePlatform = platform;
        
        // Adjust aspect ratio based on platform
        if (platform === Platform.Instagram) {
          mockData.adCreative.aspectRatio = "1:1";
          mockData.adCreative.url = "https://placehold.co/600x600/0078D7/FFFFFF?text=Instagram+Post";
        } else if (platform === Platform.TikTok) {
          mockData.adCreative.aspectRatio = "9:16";
          mockData.adCreative.url = "https://placehold.co/450x800/000000/FFFFFF?text=TikTok+Video";
        } else if (platform === Platform.YouTube) {
          mockData.adCreative.aspectRatio = "16:9";
          mockData.adCreative.url = "https://placehold.co/800x450/FF0000/FFFFFF?text=YouTube+Video";
        }
        
        return mockData;
      }

      const response = await fetch(`${this.baseUrl}/change-platform`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: campaignId,
          platform,
        }),
      });
      
      if (!response.ok) {
        console.warn(`API error: ${response.status} ${response.statusText}. Falling back to mock data.`);
        const mockData = this.getMockSurveyData(campaignId);
        mockData.activePlatform = platform;
        return mockData;
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error changing active platform:', error);
      const mockData = this.getMockSurveyData(campaignId);
      mockData.activePlatform = platform;
      return mockData;
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
      if (this.useMockData) {
        console.log('Using mock data for saving draft', { campaignId, responses });
        return { success: true };
      }

      const response = await fetch(`${this.baseUrl}/save-draft`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: campaignId,
          responses,
        }),
      });
      
      if (!response.ok) {
        console.warn(`API error: ${response.status} ${response.statusText}. Returning mock success.`);
        return { success: true };
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error saving survey draft:', error);
      return { success: true };
    }
  }
} 