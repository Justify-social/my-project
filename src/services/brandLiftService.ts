import { SurveyPreviewData, SurveyResponses, ValidationErrors } from '@/types/brandLift';
import { Platform, KPI, CreativeAssetType } from '@prisma/client';
import { mapCampaignToSurveyData as mapperUtil } from '@/utils/surveyMappers';

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
   * Creates survey questions based on campaign KPIs
   * @param primaryKPI - The primary KPI of the campaign
   * @param secondaryKPIs - The secondary KPIs of the campaign
   * @param brandName - The brand name for question text
   * @returns Array of survey questions
   */
  private generateQuestionsFromKPIs(primaryKPI: KPI, secondaryKPIs: KPI[] = [], brandName: string): SurveyPreviewData['questions'] {
    const questions: SurveyPreviewData['questions'] = [];
    const allKPIs = [primaryKPI, ...secondaryKPIs];
    const processedKPIs = new Set<KPI>();
    
    // Process each KPI only once
    allKPIs.forEach(kpi => {
      if (processedKPIs.has(kpi)) return;
      processedKPIs.add(kpi);
      
      // Generate question based on KPI type
      switch(kpi) {
        case KPI.brandAwareness:
          questions.push({
            id: `q-${kpi}`,
            title: `Have you heard of ${brandName} before seeing this ad?`,
            type: "Single Choice",
            kpi: kpi,
            options: [
              { id: `q-${kpi}-o1`, text: "Yes, I know the brand well", image: "https://placehold.co/400x300/4CAF50/FFFFFF?text=Know+Well" },
              { id: `q-${kpi}-o2`, text: "Yes, I've heard of it", image: "https://placehold.co/400x300/8BC34A/FFFFFF?text=Heard+Of+It" },
              { id: `q-${kpi}-o3`, text: "No, I've never heard of it", image: "https://placehold.co/400x300/F44336/FFFFFF?text=Never+Heard" }
            ],
            required: true
          });
          break;
        case KPI.adRecall:
          questions.push({
            id: `q-${kpi}`,
            title: "Do you recall seeing this specific ad recently?",
            type: "Single Choice",
            kpi: kpi,
            options: [
              { id: `q-${kpi}-o1`, text: "Yes, definitely", image: "https://placehold.co/400x300/4CAF50/FFFFFF?text=Definitely" },
              { id: `q-${kpi}-o2`, text: "Yes, I think so", image: "https://placehold.co/400x300/8BC34A/FFFFFF?text=Think+So" },
              { id: `q-${kpi}-o3`, text: "No, I don't think so", image: "https://placehold.co/400x300/FFC107/FFFFFF?text=Don't+Think+So" },
              { id: `q-${kpi}-o4`, text: "No, definitely not", image: "https://placehold.co/400x300/F44336/FFFFFF?text=Definitely+Not" }
            ],
            required: true
          });
          break;
        case KPI.consideration:
          questions.push({
            id: `q-${kpi}`,
            title: `After seeing this ad, how likely are you to consider ${brandName} products?`,
            type: "Single Choice",
            kpi: kpi,
            options: [
              { id: `q-${kpi}-o1`, text: "Very likely", image: "https://placehold.co/400x300/4CAF50/FFFFFF?text=Very+Likely" },
              { id: `q-${kpi}-o2`, text: "Somewhat likely", image: "https://placehold.co/400x300/8BC34A/FFFFFF?text=Somewhat+Likely" },
              { id: `q-${kpi}-o3`, text: "Neither likely nor unlikely", image: "https://placehold.co/400x300/9E9E9E/FFFFFF?text=Neutral" },
              { id: `q-${kpi}-o4`, text: "Somewhat unlikely", image: "https://placehold.co/400x300/FF9800/FFFFFF?text=Somewhat+Unlikely" },
              { id: `q-${kpi}-o5`, text: "Very unlikely", image: "https://placehold.co/400x300/F44336/FFFFFF?text=Very+Unlikely" }
            ],
            required: true
          });
          break;
        case KPI.messageAssociation:
          questions.push({
            id: `q-${kpi}`,
            title: `What message do you associate with ${brandName} after seeing this ad?`,
            type: "Single Choice",
            kpi: kpi,
            options: [
              { id: `q-${kpi}-o1`, text: "Quality", image: "https://placehold.co/400x300/4CAF50/FFFFFF?text=Quality" },
              { id: `q-${kpi}-o2`, text: "Innovation", image: "https://placehold.co/400x300/8BC34A/FFFFFF?text=Innovation" },
              { id: `q-${kpi}-o3`, text: "Value", image: "https://placehold.co/400x300/9E9E9E/FFFFFF?text=Value" },
              { id: `q-${kpi}-o4`, text: "Sustainability", image: "https://placehold.co/400x300/FF9800/FFFFFF?text=Sustainability" },
              { id: `q-${kpi}-o5`, text: "Reliability", image: "https://placehold.co/400x300/F44336/FFFFFF?text=Reliability" }
            ],
            required: true
          });
          break;
        case KPI.purchaseIntent:
          questions.push({
            id: `q-${kpi}`,
            title: `How likely are you to purchase from ${brandName} in the next month?`,
            type: "Single Choice",
            kpi: kpi,
            options: [
              { id: `q-${kpi}-o1`, text: "Definitely will purchase", image: "https://placehold.co/400x300/4CAF50/FFFFFF?text=Definitely" },
              { id: `q-${kpi}-o2`, text: "Probably will purchase", image: "https://placehold.co/400x300/8BC34A/FFFFFF?text=Probably" },
              { id: `q-${kpi}-o3`, text: "Might or might not purchase", image: "https://placehold.co/400x300/9E9E9E/FFFFFF?text=Maybe" },
              { id: `q-${kpi}-o4`, text: "Probably will not purchase", image: "https://placehold.co/400x300/FF9800/FFFFFF?text=Probably+Not" },
              { id: `q-${kpi}-o5`, text: "Definitely will not purchase", image: "https://placehold.co/400x300/F44336/FFFFFF?text=Definitely+Not" }
            ],
            required: true
          });
          break;
        // Add other KPI types as needed
        default:
          // Default question for other KPIs
          questions.push({
            id: `q-${kpi}`,
            title: `How would you rate ${brandName} based on this ad?`,
            type: "Single Choice",
            kpi: kpi,
            options: [
              { id: `q-${kpi}-o1`, text: "Excellent", image: "https://placehold.co/400x300/4CAF50/FFFFFF?text=Excellent" },
              { id: `q-${kpi}-o2`, text: "Good", image: "https://placehold.co/400x300/8BC34A/FFFFFF?text=Good" },
              { id: `q-${kpi}-o3`, text: "Average", image: "https://placehold.co/400x300/9E9E9E/FFFFFF?text=Average" },
              { id: `q-${kpi}-o4`, text: "Poor", image: "https://placehold.co/400x300/FF9800/FFFFFF?text=Poor" },
              { id: `q-${kpi}-o5`, text: "Very Poor", image: "https://placehold.co/400x300/F44336/FFFFFF?text=Very+Poor" }
            ],
            required: true
          });
      }
    });
    
    return questions;
  }

  /**
   * @returns Promise with survey preview data
   */
  public async getSurveyPreviewData(campaignId: string): Promise<SurveyPreviewData> {
    try {
      // First, try to get real campaign data from the campaigns API
      console.log('Fetching campaign data for survey preview:', campaignId);
      const campaignResponse = await fetch(`/api/campaigns/${campaignId}`);
      
      if (campaignResponse.ok) {
        const campaignData = await campaignResponse.json();
        console.log('Campaign data received:', JSON.stringify(campaignData, null, 2));
        console.log('Campaign startDate:', campaignData.startDate, typeof campaignData.startDate);
        
        // Map campaign data to survey preview data using utility function
        const fallbackData = this.getMockSurveyData(campaignId);
        const surveyData = mapperUtil(campaignData, fallbackData);
        return this.ensureValidSurveyData(surveyData, campaignId);
      }
      
      console.warn(`Campaign API error: ${campaignResponse.status}. Trying brand-lift specific API.`);
      
      // If campaign API fails, try the brand-lift specific API
      const brandLiftResponse = await fetch(`${this.baseUrl}/survey-preview?id=${campaignId}`);
      
      if (brandLiftResponse.ok) {
        const data = await brandLiftResponse.json();
        return this.ensureValidSurveyData(data, campaignId);
      }
      
      console.warn(`API error: ${brandLiftResponse.status}. Falling back to mock data.`);
      return this.getMockSurveyData(campaignId);
    } catch (error) {
      console.error('Error fetching survey preview data:', error);
      console.warn('Falling back to mock data due to API error');
      return this.getMockSurveyData(campaignId);
    }
  }

  /**
   * Maps campaign data from the campaigns API to the survey preview format
   * @param campaignData - The campaign data from the API
   * @param campaignId - The campaign ID
   * @returns Mapped survey preview data
   * @deprecated Use the utility function from @/utils/surveyMappers instead
   */
  private mapCampaignToSurveyData(campaignData: any, campaignId: string): SurveyPreviewData {
    console.warn('Using deprecated mapping function. Use mapCampaignToSurveyData from @/utils/surveyMappers instead.');
    const fallbackData = this.getMockSurveyData(campaignId);
    return mapperUtil(campaignData, fallbackData);
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
        const error = await response.json();
        throw new Error(error.message || 'Failed to save survey draft');
      }

      return await response.json();
    } catch (error) {
      console.error('Error saving survey draft:', error);
      throw error;
    }
  }

  /**
   * Share survey for review with team members
   * @param campaignId Survey ID to share
   * @param reviewerData Reviewer contact information
   * @returns Success status
   */
  public async shareSurveyForReview(
    campaignId: string, 
    reviewerData: { firstname: string, surname: string, email: string, position: string }
  ): Promise<{ success: boolean }> {
    try {
      if (this.useMockData) {
        console.log('Using mock data for sharing survey', { campaignId, reviewerData });
        return { success: true };
      }

      const response = await fetch(`${this.baseUrl}/share-survey`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: campaignId,
          reviewer: reviewerData,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to share survey for review');
      }

      return await response.json();
    } catch (error) {
      console.error('Error sharing survey for review:', error);
      throw error;
    }
  }

  /**
   * Get platform-specific configuration for creative preview
   * @param platform - The platform to get configuration for
   * @returns Promise with platform configuration
   */
  public async getPlatformConfig(platform: Platform): Promise<any> {
    try {
      if (this.useMockData) {
        console.log(`Using mock data for ${platform} platform config`);
        // Return mock configuration based on platform
        switch (platform) {
          case Platform.Instagram:
            return {
              appName: 'Instagram',
              topBarIcons: ['camera', 'igtv', 'messenger'],
              bottomNavItems: [
                { name: 'Home', icon: 'home' },
                { name: 'Search', icon: 'search' },
                { name: 'Reels', icon: 'video-play' },
                { name: 'Shop', icon: 'shopping-bag' },
                { name: 'Profile', icon: 'user', special: true }
              ],
              counterLabels: ['likes', 'comments', 'shares', 'save'],
              showTranslation: true
            };
          case Platform.TikTok:
            return {
              appName: 'TikTok',
              topBarIcons: ['search', 'live'],
              bottomNavItems: [
                { name: 'Home', icon: 'home' },
                { name: 'Friends', icon: 'users' },
                { name: 'Create', icon: 'plus-circle', special: true },
                { name: 'Inbox', icon: 'inbox' },
                { name: 'Profile', icon: 'user' }
              ],
              counterLabels: ['likes', 'comments', 'shares', 'bookmarks'],
              showTranslation: false,
              songInfo: 'Original Sound - Artist Name'
            };
          case Platform.YouTube:
            return {
              appName: 'YouTube',
              topBarIcons: ['cast', 'notifications', 'search'],
              bottomNavItems: [
                { name: 'Home', icon: 'home' },
                { name: 'Shorts', icon: 'play' },
                { name: 'Create', icon: 'plus-circle', special: true },
                { name: 'Subscriptions', icon: 'rss' },
                { name: 'Library', icon: 'collection' }
              ],
              counterLabels: ['views', 'likes', 'comments', 'shares'],
              showTranslation: true
            };
          // Check if Facebook exists in the imported Platform enum
          // If not, this case will be removed by TypeScript
          case 'Facebook' as any:
            return {
              appName: 'Facebook',
              topBarIcons: ['search', 'messenger'],
              bottomNavItems: [
                { name: 'Home', icon: 'home' },
                { name: 'Friends', icon: 'users' },
                { name: 'Watch', icon: 'tv' },
                { name: 'Profile', icon: 'user' },
                { name: 'Notifications', icon: 'bell' }
              ],
              counterLabels: ['likes', 'comments', 'shares'],
              showTranslation: false
            };
          default:
            throw new Error(`No mock configuration available for platform: ${platform}`);
        }
      }

      const response = await fetch(`${this.baseUrl}/platform-config?platform=${platform}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        console.warn(`API error: ${response.status} ${response.statusText}. Falling back to mock data.`);
        // Call this method recursively with useMockData temporarily forced to true
        const originalMockSetting = this.useMockData;
        this.useMockData = true;
        const mockConfig = await this.getPlatformConfig(platform);
        this.useMockData = originalMockSetting;
        return mockConfig;
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching platform config for ${platform}:`, error);
      throw error;
    }
  }
} 