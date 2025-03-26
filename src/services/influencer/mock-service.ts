import { Influencer, InfluencerFilters, InfluencerCampaign, CampaignStatus, ContentRequirement, CampaignFormData } from '@/types/influencer';

/**
 * Mock data for influencers
 */
export const mockInfluencers: Influencer[] = [
  {
    id: "inf-1",
    name: "Emma Johnson",
    username: "@emma_creates",
    bio: "Lifestyle content creator, passionate about sustainable living and mindfulness. Sharing everyday tips for a balanced life.",
    avatar: "https://randomuser.me/api/portraits/women/1.jpg",
    platform: "Instagram",
    followers: 850000,
    tier: "Gold",
    justifyMetrics: {
      justifyScore: 92,
      scoreComponents: {
        audienceRelevance: 94,
        engagementQuality: 88,
        contentAuthenticity: 95,
        brandSafetyRating: 97,
        performanceConsistency: 86
      },
      historicalScoreTrend: [
        { date: "2023-08-15", score: 89 },
        { date: "2023-09-15", score: 90 },
        { date: "2023-10-15", score: 91 },
        { date: "2023-11-15", score: 92 },
        { date: "2023-12-15", score: 92 }
      ]
    },
    audienceMetrics: {
      demographics: {
        ageRanges: { "18-24": 32, "25-34": 45, "35-44": 18, "45-54": 4, "55+": 1 },
        genderSplit: { "female": 75, "male": 24, "other": 1 },
        topLocations: { "United States": 42, "United Kingdom": 18, "Canada": 12, "Australia": 8, "Germany": 5 }
      },
      engagement: {
        rate: 4.2,
        averageLikes: 35700,
        averageComments: 1250,
        averageShares: 860
      }
    },
    safetyMetrics: {
      riskScore: 3,
      lastAssessmentDate: "2023-12-01",
      complianceStatus: "compliant",
      contentModeration: {
        flaggedContent: false,
        contentWarnings: 0
      }
    }
  },
  {
    id: "inf-2",
    name: "James Wilson",
    username: "@james_tech",
    bio: "Tech reviewer and gadget enthusiast. Bringing you the latest in consumer electronics with honest, in-depth analysis.",
    avatar: "https://randomuser.me/api/portraits/men/2.jpg",
    platform: "YouTube",
    followers: 1250000,
    tier: "Gold",
    justifyMetrics: {
      justifyScore: 89,
      scoreComponents: {
        audienceRelevance: 91,
        engagementQuality: 85,
        contentAuthenticity: 94,
        brandSafetyRating: 90,
        performanceConsistency: 85
      },
      historicalScoreTrend: [
        { date: "2023-08-15", score: 86 },
        { date: "2023-09-15", score: 87 },
        { date: "2023-10-15", score: 89 },
        { date: "2023-11-15", score: 88 },
        { date: "2023-12-15", score: 89 }
      ]
    },
    audienceMetrics: {
      demographics: {
        ageRanges: { "18-24": 28, "25-34": 42, "35-44": 22, "45-54": 6, "55+": 2 },
        genderSplit: { "female": 32, "male": 67, "other": 1 },
        topLocations: { "United States": 38, "United Kingdom": 14, "India": 12, "Canada": 8, "Germany": 6 }
      },
      engagement: {
        rate: 3.8,
        averageLikes: 47500,
        averageComments: 3200,
        averageShares: 5400
      }
    },
    safetyMetrics: {
      riskScore: 8,
      lastAssessmentDate: "2023-11-15",
      complianceStatus: "compliant",
      contentModeration: {
        flaggedContent: false,
        contentWarnings: 0
      }
    }
  },
  {
    id: "inf-3",
    name: "Sofia Garcia",
    username: "@sofia_styles",
    bio: "Fashion and beauty content creator. Helping you express your personal style and find confidence through fashion.",
    avatar: "https://randomuser.me/api/portraits/women/3.jpg",
    platform: "Instagram",
    followers: 620000,
    tier: "Silver",
    justifyMetrics: {
      justifyScore: 83,
      scoreComponents: {
        audienceRelevance: 86,
        engagementQuality: 79,
        contentAuthenticity: 88,
        brandSafetyRating: 92,
        performanceConsistency: 70
      },
      historicalScoreTrend: [
        { date: "2023-08-15", score: 77 },
        { date: "2023-09-15", score: 79 },
        { date: "2023-10-15", score: 81 },
        { date: "2023-11-15", score: 83 },
        { date: "2023-12-15", score: 83 }
      ]
    },
    audienceMetrics: {
      demographics: {
        ageRanges: { "18-24": 45, "25-34": 38, "35-44": 12, "45-54": 4, "55+": 1 },
        genderSplit: { "female": 82, "male": 17, "other": 1 },
        topLocations: { "United States": 35, "Mexico": 18, "Spain": 12, "Colombia": 10, "Argentina": 8 }
      },
      engagement: {
        rate: 4.7,
        averageLikes: 29140,
        averageComments: 980,
        averageShares: 425
      }
    },
    safetyMetrics: {
      riskScore: 10,
      lastAssessmentDate: "2023-11-20",
      complianceStatus: "compliant",
      contentModeration: {
        flaggedContent: false,
        contentWarnings: 1
      }
    }
  },
  {
    id: "inf-4",
    name: "Alex Chen",
    username: "@alex_fitness",
    bio: "Health and fitness coach. Sharing workouts, nutrition tips, and motivation to help you achieve your fitness goals.",
    avatar: "https://randomuser.me/api/portraits/men/4.jpg",
    platform: "TikTok",
    followers: 1850000,
    tier: "Gold",
    justifyMetrics: {
      justifyScore: 90,
      scoreComponents: {
        audienceRelevance: 93,
        engagementQuality: 89,
        contentAuthenticity: 92,
        brandSafetyRating: 91,
        performanceConsistency: 85
      },
      historicalScoreTrend: [
        { date: "2023-08-15", score: 87 },
        { date: "2023-09-15", score: 88 },
        { date: "2023-10-15", score: 89 },
        { date: "2023-11-15", score: 90 },
        { date: "2023-12-15", score: 90 }
      ]
    },
    audienceMetrics: {
      demographics: {
        ageRanges: { "18-24": 38, "25-34": 42, "35-44": 15, "45-54": 4, "55+": 1 },
        genderSplit: { "female": 48, "male": 51, "other": 1 },
        topLocations: { "United States": 32, "United Kingdom": 14, "Canada": 10, "Australia": 8, "Germany": 6 }
      },
      engagement: {
        rate: 6.2,
        averageLikes: 114700,
        averageComments: 4250,
        averageShares: 18600
      }
    },
    safetyMetrics: {
      riskScore: 5,
      lastAssessmentDate: "2023-12-05",
      complianceStatus: "compliant",
      contentModeration: {
        flaggedContent: false,
        contentWarnings: 0
      }
    }
  },
  {
    id: "inf-5",
    name: "Olivia Thompson",
    username: "@olivia_foodie",
    bio: "Food content creator and recipe developer. Sharing simple, delicious recipes that anyone can make at home.",
    avatar: "https://randomuser.me/api/portraits/women/5.jpg",
    platform: "Instagram",
    followers: 420000,
    tier: "Silver",
    justifyMetrics: {
      justifyScore: 81,
      scoreComponents: {
        audienceRelevance: 84,
        engagementQuality: 80,
        contentAuthenticity: 87,
        brandSafetyRating: 89,
        performanceConsistency: 65
      },
      historicalScoreTrend: [
        { date: "2023-08-15", score: 77 },
        { date: "2023-09-15", score: 78 },
        { date: "2023-10-15", score: 80 },
        { date: "2023-11-15", score: 81 },
        { date: "2023-12-15", score: 81 }
      ]
    },
    audienceMetrics: {
      demographics: {
        ageRanges: { "18-24": 25, "25-34": 38, "35-44": 27, "45-54": 8, "55+": 2 },
        genderSplit: { "female": 70, "male": 29, "other": 1 },
        topLocations: { "United States": 45, "United Kingdom": 15, "Canada": 12, "Australia": 9, "France": 5 }
      },
      engagement: {
        rate: 5.1,
        averageLikes: 21420,
        averageComments: 870,
        averageShares: 430
      }
    },
    safetyMetrics: {
      riskScore: 4,
      lastAssessmentDate: "2023-11-10",
      complianceStatus: "compliant",
      contentModeration: {
        flaggedContent: false,
        contentWarnings: 0
      }
    }
  },
  {
    id: "inf-6",
    name: "David Kim",
    username: "@david_travels",
    bio: "Travel blogger and photographer. Exploring hidden gems and sharing travel tips to inspire your next adventure.",
    avatar: "https://randomuser.me/api/portraits/men/6.jpg",
    platform: "YouTube",
    followers: 580000,
    tier: "Silver",
    justifyMetrics: {
      justifyScore: 78,
      scoreComponents: {
        audienceRelevance: 82,
        engagementQuality: 75,
        contentAuthenticity: 84,
        brandSafetyRating: 80,
        performanceConsistency: 69
      },
      historicalScoreTrend: [
        { date: "2023-08-15", score: 72 },
        { date: "2023-09-15", score: 74 },
        { date: "2023-10-15", score: 75 },
        { date: "2023-11-15", score: 77 },
        { date: "2023-12-15", score: 78 }
      ]
    },
    audienceMetrics: {
      demographics: {
        ageRanges: { "18-24": 30, "25-34": 45, "35-44": 18, "45-54": 5, "55+": 2 },
        genderSplit: { "female": 48, "male": 51, "other": 1 },
        topLocations: { "United States": 28, "South Korea": 18, "Japan": 12, "United Kingdom": 8, "Canada": 7 }
      },
      engagement: {
        rate: 4.2,
        averageLikes: 24360,
        averageComments: 1150,
        averageShares: 2780
      }
    },
    safetyMetrics: {
      riskScore: 12,
      lastAssessmentDate: "2023-10-30",
      complianceStatus: "warning",
      contentModeration: {
        flaggedContent: false,
        contentWarnings: 1
      }
    }
  }
];

// Mock campaign data
const mockCampaigns: InfluencerCampaign[] = [
  {
    id: '1',
    name: 'Summer Product Launch',
    brand: {
      id: 'brand1',
      name: 'EcoLifestyle',
      logo: '/brands/ecolifestyle-logo.png'
    },
    status: 'active',
    budget: 50000,
    startDate: '2023-06-01',
    endDate: '2023-07-15',
    objectives: {
      primary: 'Product launch awareness',
      secondary: ['Drive website traffic', 'Generate user content'],
      kpis: ['Impressions', 'Engagement rate', 'Click-through rate'],
      targetAudience: 'Environmentally conscious consumers aged 18-35'
    },
    contentRequirements: [
      {
        id: 'cr1',
        type: 'post',
        description: 'Product showcase with lifestyle setting',
        required: true,
        deliveryDate: '2023-06-10'
      },
      {
        id: 'cr2',
        type: 'story',
        description: 'Unboxing experience and first impressions',
        required: true,
        deliveryDate: '2023-06-05'
      },
      {
        id: 'cr3',
        type: 'reel',
        description: 'Creative use of product in daily routine',
        required: false,
        deliveryDate: '2023-06-20',
        specs: {
          minDuration: 15,
          maxDuration: 60,
          orientation: 'portrait',
          aspectRatio: '9:16'
        }
      }
    ],
    influencers: [
      {
        influencer: mockInfluencers[0],
        status: 'accepted',
        paymentTerms: [
          {
            amount: 2500,
            schedule: 'upfront',
            dueDate: '2023-06-01'
          },
          {
            amount: 2500,
            schedule: 'completion',
            dueDate: '2023-07-15'
          }
        ],
        contractUrl: '/contracts/campaign1-influencer1.pdf',
        deliverables: [
          {
            id: 'd1',
            contentRequirementId: 'cr1',
            status: 'approved',
            submissionUrl: 'https://instagram.com/p/example1',
            submissionDate: '2023-06-09'
          },
          {
            id: 'd2',
            contentRequirementId: 'cr2',
            status: 'approved',
            submissionUrl: 'https://instagram.com/stories/example1',
            submissionDate: '2023-06-04'
          }
        ]
      },
      {
        influencer: mockInfluencers[1],
        status: 'accepted',
        paymentTerms: [
          {
            amount: 3000,
            schedule: 'milestone',
            milestoneDescription: '50% on contract signing, 50% on completion',
            dueDate: '2023-06-01'
          }
        ],
        deliverables: [
          {
            id: 'd3',
            contentRequirementId: 'cr1',
            status: 'pending'
          },
          {
            id: 'd4',
            contentRequirementId: 'cr2',
            status: 'submitted',
            submissionUrl: 'https://instagram.com/stories/example2',
            submissionDate: '2023-06-06',
            feedbackNotes: 'Please add more focus on the eco-friendly packaging'
          }
        ]
      }
    ],
    creativeAssets: [
      {
        id: 'asset1',
        name: 'Product Image Pack',
        url: '/assets/campaigns/summer-launch-product-images.zip',
        type: 'image'
      },
      {
        id: 'asset2',
        name: 'Brand Guidelines',
        url: '/assets/campaigns/brand-guidelines.pdf',
        type: 'document'
      }
    ],
    approvalWorkflow: {
      requiresApproval: true,
      approvers: [
        {
          id: 'user1',
          name: 'Alex Johnson',
          email: 'alex@ecolifestyle.com',
          role: 'Marketing Director'
        }
      ]
    },
    notes: 'Focus on sustainability aspects and the innovative materials used in the product.',
    createdAt: '2023-05-15',
    updatedAt: '2023-06-02'
  },
  {
    id: '2',
    name: 'Holiday Gift Guide Campaign',
    brand: {
      id: 'brand2',
      name: 'LuxeBeauty',
      logo: '/brands/luxebeauty-logo.png'
    },
    status: 'pending',
    budget: 75000,
    startDate: '2023-11-01',
    endDate: '2023-12-20',
    objectives: {
      primary: 'Drive holiday sales',
      secondary: ['Increase brand awareness', 'Highlight gift sets'],
      kpis: ['Sales attribution', 'Engagement', 'Reach'],
      targetAudience: 'Beauty enthusiasts, gift shoppers aged 25-45'
    },
    contentRequirements: [
      {
        id: 'cr4',
        type: 'post',
        description: 'Holiday gift guide featuring our products',
        required: true,
        deliveryDate: '2023-11-15'
      },
      {
        id: 'cr5',
        type: 'video',
        description: 'Product tutorial using the holiday collection',
        required: true,
        deliveryDate: '2023-11-25',
        specs: {
          minDuration: 120,
          maxDuration: 300,
          orientation: 'landscape',
          resolution: '1080p'
        }
      }
    ],
    influencers: [
      {
        influencer: mockInfluencers[2],
        status: 'invited',
        paymentTerms: [
          {
            amount: 5000,
            schedule: 'upfront',
            dueDate: '2023-11-01'
          }
        ]
      }
    ],
    creativeAssets: [
      {
        id: 'asset3',
        name: 'Holiday Collection Images',
        url: '/assets/campaigns/holiday-collection.zip',
        type: 'image'
      }
    ],
    approvalWorkflow: {
      requiresApproval: true,
      approvers: [
        {
          id: 'user2',
          name: 'Sarah Williams',
          email: 'sarah@luxebeauty.com',
          role: 'Product Manager'
        }
      ]
    },
    createdAt: '2023-09-10',
    updatedAt: '2023-09-10'
  }
];

// Mock objectives options for form selects
const mockObjectives = [
  'Brand awareness',
  'Product launch',
  'Drive sales',
  'Increase engagement',
  'Build community',
  'Generate content',
  'Drive website traffic',
  'Promote event',
  'Educate audience',
  'Customer loyalty'
];

// Mock KPIs for form selects
const mockKpis = [
  'Impressions',
  'Reach',
  'Engagement rate',
  'Click-through rate',
  'Conversion rate',
  'Cost per acquisition',
  'Sales attribution',
  'Follower growth',
  'Brand sentiment',
  'Share of voice'
];

/**
 * Mock influencer service for development
 */
export const mockInfluencerService = {
  /**
   * Get influencers with optional filtering
   */
  getInfluencers: async (filters?: InfluencerFilters) => {
    // Add artificial delay to simulate API request
    await new Promise(resolve => setTimeout(resolve, 800));
    
    let filteredInfluencers = [...mockInfluencers];
    
    // Apply filters if provided
    if (filters) {
      if (filters.platform) {
        filteredInfluencers = filteredInfluencers.filter(influencer => 
          influencer.platform.toLowerCase() === filters.platform?.toLowerCase()
        );
      }
      
      if (filters.tier) {
        filteredInfluencers = filteredInfluencers.filter(influencer => 
          influencer.tier === filters.tier
        );
      }
      
      if (filters.minScore) {
        filteredInfluencers = filteredInfluencers.filter(influencer => 
          influencer.justifyMetrics.justifyScore >= filters.minScore!
        );
      }
      
      if (filters.minFollowers) {
        filteredInfluencers = filteredInfluencers.filter(influencer => 
          influencer.followers >= filters.minFollowers!
        );
      }
      
      if (filters.minEngagement) {
        filteredInfluencers = filteredInfluencers.filter(influencer => 
          influencer.audienceMetrics.engagement.rate >= filters.minEngagement!
        );
      }
      
      if (filters.maxRiskScore !== undefined) {
        filteredInfluencers = filteredInfluencers.filter(influencer => 
          influencer.safetyMetrics.riskScore <= filters.maxRiskScore!
        );
      }
      
      // Sort by specified property
      if (filters.sortBy) {
        if (filters.sortBy === 'justifyScore') {
          filteredInfluencers.sort((a, b) => 
            b.justifyMetrics.justifyScore - a.justifyMetrics.justifyScore
          );
        } else if (filters.sortBy === 'followers') {
          filteredInfluencers.sort((a, b) => b.followers - a.followers);
        } else if (filters.sortBy === 'engagement') {
          filteredInfluencers.sort((a, b) => 
            b.audienceMetrics.engagement.rate - a.audienceMetrics.engagement.rate
          );
        }
      }
    }
    
    return filteredInfluencers;
  },
  
  /**
   * Get a single influencer by ID
   */
  getInfluencerById: async (id: string) => {
    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const influencer = mockInfluencers.find(inf => inf.id === id);
    
    if (!influencer) {
      throw new Error(`Influencer with ID ${id} not found`);
    }
    
    return influencer;
  },
  
  /**
   * Search influencers by text query and optional filters
   */
  searchInfluencers: async (query: string, filters?: InfluencerFilters) => {
    // Add artificial delay to simulate API request
    await new Promise(resolve => setTimeout(resolve, 600));
    
    let results = [...mockInfluencers];
    
    // Filter by text query
    if (query) {
      const queryLower = query.toLowerCase();
      results = results.filter(influencer => 
        influencer.name.toLowerCase().includes(queryLower) || 
        influencer.username.toLowerCase().includes(queryLower) || 
        influencer.bio.toLowerCase().includes(queryLower) || 
        influencer.platform.toLowerCase().includes(queryLower)
      );
    }
    
    // Apply additional filters
    if (filters) {
      if (filters.platform) {
        results = results.filter(influencer => 
          influencer.platform.toLowerCase() === filters.platform?.toLowerCase()
        );
      }
      
      if (filters.tier) {
        results = results.filter(influencer => influencer.tier === filters.tier);
      }
      
      if (filters.minScore) {
        results = results.filter(influencer => 
          influencer.justifyMetrics.justifyScore >= filters.minScore!
        );
      }
      
      if (filters.minFollowers) {
        results = results.filter(influencer => 
          influencer.followers >= filters.minFollowers!
        );
      }
      
      if (filters.minEngagement) {
        results = results.filter(influencer => 
          influencer.audienceMetrics.engagement.rate >= filters.minEngagement!
        );
      }
      
      if (filters.maxRiskScore !== undefined) {
        results = results.filter(influencer => 
          influencer.safetyMetrics.riskScore <= filters.maxRiskScore!
        );
      }
    }
    
    return results;
  },
  
  /**
   * Get Justify Score breakdown for an influencer
   */
  getJustifyScoreBreakdown: async (id: string) => {
    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const influencer = mockInfluencers.find(inf => inf.id === id);
    
    if (!influencer) {
      throw new Error(`Influencer with ID ${id} not found`);
    }
    
    return {
      score: influencer.justifyMetrics.justifyScore,
      components: influencer.justifyMetrics.scoreComponents,
      explanation: {
        audienceRelevance: "Based on audience demographics match and engagement quality",
        engagementQuality: "Measures authenticity and depth of audience interactions",
        contentAuthenticity: "Evaluates genuine content creation and originality",
        brandSafetyRating: "Assesses risk level based on content history and behavior",
        performanceConsistency: "Measures reliability in delivering expected results"
      }
    };
  },
  
  /**
   * Get historical score data for an influencer
   */
  getJustifyScoreHistory: async (id: string) => {
    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const influencer = mockInfluencers.find(inf => inf.id === id);
    
    if (!influencer) {
      throw new Error(`Influencer with ID ${id} not found`);
    }
    
    return influencer.justifyMetrics.historicalScoreTrend;
  },

  // Get all campaigns
  getCampaigns: async (filters?: { status?: CampaignStatus, searchQuery?: string }) => {
    // Add artificial delay to simulate API request
    await new Promise(resolve => setTimeout(resolve, 800));
    
    let filteredCampaigns = [...mockCampaigns];
    
    // Apply status filter if provided
    if (filters?.status) {
      filteredCampaigns = filteredCampaigns.filter(campaign => campaign.status === filters.status);
    }
    
    // Apply search query if provided
    if (filters?.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filteredCampaigns = filteredCampaigns.filter(campaign => 
        campaign.name.toLowerCase().includes(query) || 
        campaign.brand.name.toLowerCase().includes(query)
      );
    }
    
    return filteredCampaigns;
  },
  
  // Get a campaign by ID
  getCampaignById: async (id: string) => {
    // Add artificial delay to simulate API request
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const campaign = mockCampaigns.find(c => c.id === id);
    
    if (!campaign) {
      throw new Error(`Campaign with ID ${id} not found`);
    }
    
    return campaign;
  },
  
  // Create a new campaign
  createCampaign: async (campaignData: CampaignFormData) => {
    // Add artificial delay to simulate API request
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate a new ID and dates
    const now = new Date().toISOString();
    const newId = (mockCampaigns.length + 1).toString();
    
    // Find the brand (in a real app, this would come from the database)
    const brand = {
      id: campaignData.brandId,
      name: 'Sample Brand', // This would be fetched from a brand service
      logo: '/brands/sample-logo.png'
    };
    
    // Map selected influencers
    const influencers = campaignData.selectedInfluencers.map(id => {
      const influencer = mockInfluencers.find(inf => inf.id === id);
      
      if (!influencer) {
        throw new Error(`Influencer with ID ${id} not found`);
      }
      
      return {
        influencer,
        status: 'invited' as const,
        paymentTerms: [
          {
            amount: 0, // This would be set in a real app
            schedule: 'upfront' as const,
            dueDate: campaignData.startDate
          }
        ]
      };
    });
    
    // Map content requirements
    const contentRequirements: ContentRequirement[] = campaignData.contentRequirements.map((req, index) => ({
      ...req,
      id: `new-cr-${index + 1}`
    }));
    
    // Create the new campaign object
    const newCampaign: InfluencerCampaign = {
      id: newId,
      name: campaignData.name,
      brand,
      status: 'draft',
      budget: campaignData.budget,
      startDate: campaignData.startDate,
      endDate: campaignData.endDate,
      objectives: {
        primary: campaignData.primaryObjective,
        secondary: campaignData.secondaryObjectives || [],
        kpis: campaignData.kpis,
        targetAudience: campaignData.targetAudience
      },
      contentRequirements,
      influencers,
      creativeAssets: campaignData.creativeAssets?.map((asset, index) => ({
        ...asset,
        id: `new-asset-${index + 1}`
      })),
      approvalWorkflow: {
        requiresApproval: campaignData.requiresApproval,
        approvers: campaignData.approverIds?.map(id => ({
          id,
          name: 'Approver Name', // This would be fetched from a user service
          email: 'approver@example.com',
          role: 'Marketing Manager'
        }))
      },
      notes: campaignData.notes,
      createdAt: now,
      updatedAt: now
    };
    
    // In a real app, this would be saved to the database
    // Here we just return the new campaign
    return newCampaign;
  },
  
  // Update an existing campaign
  updateCampaign: async (id: string, campaignData: Partial<CampaignFormData>) => {
    // Add artificial delay to simulate API request
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const campaignIndex = mockCampaigns.findIndex(c => c.id === id);
    
    if (campaignIndex === -1) {
      throw new Error(`Campaign with ID ${id} not found`);
    }
    
    // In a real app, this would update the database
    // Here we would merge the update with the existing campaign
    
    return {
      ...mockCampaigns[campaignIndex],
      ...campaignData,
      updatedAt: new Date().toISOString()
    };
  },
  
  // Delete a campaign
  deleteCampaign: async (id: string) => {
    // Add artificial delay to simulate API request
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const campaignIndex = mockCampaigns.findIndex(c => c.id === id);
    
    if (campaignIndex === -1) {
      throw new Error(`Campaign with ID ${id} not found`);
    }
    
    // In a real app, this would delete from the database
    // Here we just return success
    return { success: true };
  },
  
  // Get form options for campaigns
  getCampaignFormOptions: async () => {
    // Add artificial delay to simulate API request
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return {
      objectives: mockObjectives,
      kpis: mockKpis,
      influencers: mockInfluencers.map(inf => ({
        id: inf.id,
        name: inf.name,
        username: inf.username,
        platform: inf.platform,
        avatar: inf.avatar,
        followers: inf.followers,
        justifyScore: inf.justifyMetrics.justifyScore
      }))
    };
  },

  /**
   * Get a draft campaign with all the data from the previous steps
   * @returns Promise with campaign data
   */
  getDraftCampaign: async (): Promise<Partial<InfluencerCampaign>> => {
    // In a real implementation, this would retrieve from API or local storage
    // For now, return mock data
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
    
    return {
      id: "draft-1",
      name: "Summer Product Launch Campaign",
      brand: {
        id: "brand-1",
        name: "EcoStyle Beauty",
        logo: "https://randomuser.me/api/portraits/women/60.jpg"
      },
      status: "draft",
      budget: 25000,
      startDate: "2023-07-01",
      endDate: "2023-09-30",
      objectives: {
        primary: "Product Launch",
        secondary: ["Brand Awareness", "User-Generated Content"],
        kpis: ["Reach", "Engagement", "Content Production"],
        targetAudience: "Women, 18-35, interested in sustainable beauty and skincare"
      },
      contentRequirements: [
        {
          id: "req-1",
          type: "reel",
          description: "Create an engaging product unboxing and first impressions (Instagram). Quantity: 1",
          required: true,
          specs: {
            minDuration: 30,
            maxDuration: 60
          }
        },
        {
          id: "req-2",
          type: "post",
          description: "Lifestyle image featuring the product in daily routine (Instagram). Quantity: 2",
          required: true,
          specs: {
            orientation: "portrait"
          }
        },
        {
          id: "req-3",
          type: "video",
          description: "Creative video showing before/after results (TikTok). Quantity: 1",
          required: true,
          specs: {
            minDuration: 15,
            maxDuration: 30
          }
        }
      ],
      approvalWorkflow: {
        requiresApproval: true,
        approvers: [
          {
            id: "user-1",
            name: "Sarah Johnson",
            email: "sarah@ecostyle.com",
            role: "Marketing Director"
          }
        ]
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  },

  /**
   * Get selected influencers with budget allocation and notes
   * @returns Promise with selected influencers data
   */
  getSelectedInfluencers: async (): Promise<{
    influencer: Influencer;
    budget: number;
    notes: string;
  }[]> => {
    await new Promise(resolve => setTimeout(resolve, 600)); // Simulate API delay
    
    // Get some influencers from our mock data
    const allInfluencers = await mockInfluencerService.getInfluencers();
    const selectedInfluencerIds = ["inf-1", "inf-3", "inf-5"];
    
    const selectedInfluencers = allInfluencers
      .filter(inf => selectedInfluencerIds.includes(inf.id))
      .map(influencer => ({
        influencer,
        budget: Math.round((influencer.tier === "Gold" ? 8000 : 
                            influencer.tier === "Silver" ? 5000 : 
                            influencer.tier === "Bronze" ? 3000 : 1500) / 100) * 100,
        notes: influencer.tier === "Gold" ? 
               "High priority influencer, offer exclusivity bonus if needed" : 
               influencer.platform === "TikTok" ? 
               "Focus on short-form creative content" : ""
      }));
    
    return selectedInfluencers;
  },

  /**
   * Launch a campaign
   * @returns Promise resolving when campaign is launched
   */
  launchCampaign: async (): Promise<boolean> => {
    // Simulate API delay and processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In a real implementation, this would make API calls to:
    // 1. Update the campaign status to "active"
    // 2. Notify selected influencers
    // 3. Create negotiation records, etc.
    
    return true;
  }
}; 