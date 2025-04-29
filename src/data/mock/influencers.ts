import { InfluencerProfileData } from '../types/influencer';
import { PlatformEnum } from '../types/enums';

/**
 * Mock database for influencer profiles.
 * Includes diverse examples reflecting different states and addressing user needs (Kelly P.).
 */
export const mockInfluencerDatabase: InfluencerProfileData[] = [
  {
    id: 'inf-1',
    name: 'Emily Carter',
    handle: 'emilycarterfit',
    avatarUrl: '/mock-avatars/emily.jpg', // Use placeholder paths
    platforms: [PlatformEnum.Instagram, PlatformEnum.TikTok],
    followersCount: 125000,
    justifyScore: 83,
    isPhylloVerified: true, // Verified example
    primaryAudienceLocation: 'United States',
    primaryAudienceAgeRange: '25-34',
    primaryAudienceGender: 'Female',
    engagementRate: 3.2,
    audienceQualityIndicator: 'High',
    bio: 'Lifestyle & wellness influencer sharing tips on healthy living, travel, and mindful fitness.',
    contactEmail: 'emily.carter.pro@email.com', // Example contact
    audienceDemographics: {
      ageDistribution: { '18-24': 15, '25-34': 55, '35-44': 20, '45-54': 10 },
      genderDistribution: { Female: 70, Male: 25, Other: 5 },
      locationDistribution: {
        'United States': 60,
        Canada: 15,
        'United Kingdom': 10,
        Australia: 5,
        Other: 10,
      },
    },
    engagementMetrics: {
      averageLikes: 4000,
      averageComments: 150,
    },
  },
  {
    id: 'inf-2',
    name: 'Michael Green',
    handle: 'mikethehiker',
    avatarUrl: '/mock-avatars/michael.jpg',
    platforms: [PlatformEnum.YouTube, PlatformEnum.Instagram],
    followersCount: 350000,
    justifyScore: 76,
    isPhylloVerified: true, // Verified example
    primaryAudienceLocation: 'Canada',
    primaryAudienceAgeRange: '35-44',
    primaryAudienceGender: 'Male',
    engagementRate: 5.8,
    audienceQualityIndicator: 'Medium',
    bio: 'Exploring the great outdoors. Documenting adventures and promoting sustainable travel.',
    contactEmail: null, // Example no contact
    audienceDemographics: {
      ageDistribution: { '18-24': 5, '25-34': 30, '35-44': 40, '45-54': 15, '55-64': 10 },
      genderDistribution: { Male: 65, Female: 30, Other: 5 },
      locationDistribution: { Canada: 45, 'United States': 30, Germany: 10, Other: 15 },
    },
    engagementMetrics: {
      averageLikes: 15000,
      averageComments: 800,
    },
  },
  {
    id: 'inf-3',
    name: 'Sarah Johnson',
    handle: 'sarahcookswell',
    avatarUrl: '/mock-avatars/sarah.jpg',
    platforms: [PlatformEnum.Instagram],
    followersCount: 89000,
    justifyScore: 79,
    isPhylloVerified: false, // Unverified example
    primaryAudienceLocation: 'United States',
    primaryAudienceAgeRange: '45-54', // Target for Kelly P.
    primaryAudienceGender: 'Female',
    engagementRate: 4.1,
    audienceQualityIndicator: 'High',
    bio: 'Healthy recipes for busy families. Food blogger & photographer.',
    contactEmail: 'sarah.j.biz@email.com',
    audienceDemographics: {
      ageDistribution: { '25-34': 15, '35-44': 30, '45-54': 40, '55-64': 15 }, // Older audience
      genderDistribution: { Female: 80, Male: 18, Other: 2 },
      locationDistribution: { 'United States': 75, Canada: 10, Other: 15 },
    },
    engagementMetrics: {
      averageLikes: 3600,
      averageComments: 250,
    },
  },
  {
    id: 'inf-4',
    name: 'David Martinez',
    handle: 'davidmartineztech',
    avatarUrl: '/mock-avatars/david.jpg',
    platforms: [PlatformEnum.YouTube],
    followersCount: 750000,
    justifyScore: 88,
    isPhylloVerified: true,
    primaryAudienceLocation: 'United States',
    primaryAudienceAgeRange: '18-24',
    primaryAudienceGender: 'Male',
    engagementRate: 6.5,
    audienceQualityIndicator: 'High',
    bio: 'Tech reviews, tutorials, and news. Unboxing the future.',
    contactEmail: 'david.tech@email.com',
    audienceDemographics: {
      ageDistribution: { '18-24': 60, '25-34': 30, '35-44': 10 },
      genderDistribution: { Male: 75, Female: 20, Other: 5 },
      locationDistribution: { 'United States': 50, India: 15, Brazil: 10, Other: 25 },
    },
    engagementMetrics: {
      averageLikes: 25000,
      averageComments: 1200,
    },
  },
  {
    id: 'inf-5',
    name: 'Chloe Chen',
    handle: 'chloefashion',
    avatarUrl: '/mock-avatars/chloe.jpg',
    platforms: [PlatformEnum.TikTok, PlatformEnum.Instagram],
    followersCount: 2100000,
    justifyScore: 72, // Lower score despite high followers
    isPhylloVerified: true,
    primaryAudienceLocation: 'United Kingdom',
    primaryAudienceAgeRange: '18-24',
    primaryAudienceGender: 'Female',
    engagementRate: 2.5, // Lower engagement rate
    audienceQualityIndicator: 'Medium', // Reflects potential lower quality
    bio: 'Daily fashion inspo, trends, and hauls. OOTD queen.',
    contactEmail: 'chloe.styles@email.com',
    audienceDemographics: {
      ageDistribution: { '18-24': 70, '25-34': 20, '35-44': 10 },
      genderDistribution: { Female: 85, Male: 10, Other: 5 },
      locationDistribution: { 'United Kingdom': 40, 'United States': 25, France: 10, Other: 25 },
    },
    engagementMetrics: {
      averageLikes: 50000, // High likes, but lower rate implies potential inflation
      averageComments: 500,
    },
  },
  {
    id: 'inf-6',
    name: 'Ben Carter',
    handle: 'bencartertravels',
    avatarUrl: '/mock-avatars/ben.jpg',
    platforms: [PlatformEnum.Instagram],
    followersCount: 55000,
    justifyScore: 85,
    isPhylloVerified: false,
    primaryAudienceLocation: 'Australia',
    primaryAudienceAgeRange: '25-34',
    primaryAudienceGender: 'Male',
    engagementRate: 4.8,
    audienceQualityIndicator: 'High',
    bio: 'Travel photographer capturing moments around the globe.',
    contactEmail: 'ben.pics@email.com',
    audienceDemographics: null, // Example missing detailed demographics
    engagementMetrics: null, // Example missing detailed metrics
  },
  // Add 10-14 more diverse examples here...
  {
    id: 'inf-7',
    name: 'Aisha Khan',
    handle: 'aishareads',
    avatarUrl: '/mock-avatars/aisha.jpg',
    platforms: [PlatformEnum.Instagram, PlatformEnum.YouTube],
    followersCount: 35000,
    justifyScore: 81,
    isPhylloVerified: true,
    primaryAudienceLocation: 'India',
    primaryAudienceAgeRange: '25-34',
    primaryAudienceGender: 'Female',
    engagementRate: 5.1,
    audienceQualityIndicator: 'High',
    bio: 'Book reviews, recommendations, and literary discussions.',
    contactEmail: 'aisha.books@email.com',
    audienceDemographics: {
      /* ... */
    },
    engagementMetrics: {
      /* ... */
    },
  },
  {
    id: 'inf-8',
    name: 'Kenji Tanaka',
    handle: 'kenjigames',
    avatarUrl: '/mock-avatars/kenji.jpg',
    platforms: [PlatformEnum.YouTube],
    followersCount: 150000,
    justifyScore: 78,
    isPhylloVerified: true,
    primaryAudienceLocation: 'Japan',
    primaryAudienceAgeRange: '18-24',
    primaryAudienceGender: 'Male',
    engagementRate: 6.0,
    audienceQualityIndicator: 'Medium',
    bio: 'Gaming walkthroughs, reviews, and live streams.',
    contactEmail: null,
    audienceDemographics: {
      /* ... */
    },
    engagementMetrics: {
      /* ... */
    },
  },
  {
    id: 'inf-9',
    name: 'Maria Garcia',
    handle: 'mariaskincare',
    avatarUrl: '/mock-avatars/maria.jpg',
    platforms: [PlatformEnum.TikTok],
    followersCount: 450000,
    justifyScore: 80,
    isPhylloVerified: true,
    primaryAudienceLocation: 'Mexico',
    primaryAudienceAgeRange: '25-34',
    primaryAudienceGender: 'Female',
    engagementRate: 3.9,
    audienceQualityIndicator: 'High',
    bio: 'Skincare tips, product reviews, and routines.',
    contactEmail: 'maria.skin@email.com',
    audienceDemographics: {
      /* ... */
    },
    engagementMetrics: {
      /* ... */
    },
  },
  {
    id: 'inf-10',
    name: 'Tom Williams',
    handle: 'tomwilliamscomedy',
    avatarUrl: '/mock-avatars/tom.jpg',
    platforms: [PlatformEnum.TikTok],
    followersCount: 3200000,
    justifyScore: 68, // Low score
    isPhylloVerified: false,
    primaryAudienceLocation: 'United States',
    primaryAudienceAgeRange: '18-24',
    primaryAudienceGender: 'Mixed',
    engagementRate: 2.1, // Low engagement
    audienceQualityIndicator: 'Low', // Low quality
    bio: 'Comedy sketches and funny videos.',
    contactEmail: 'tom.laughs@email.com',
    audienceDemographics: {
      /* ... */
    },
    engagementMetrics: {
      /* ... */
    },
  },
  {
    id: 'inf-11',
    name: 'Fatima Ahmed',
    handle: 'fatimacooks',
    avatarUrl: '/mock-avatars/fatima.jpg',
    platforms: [PlatformEnum.Instagram],
    followersCount: 150000,
    justifyScore: 84,
    isPhylloVerified: true,
    primaryAudienceLocation: 'United Arab Emirates',
    primaryAudienceAgeRange: '35-44',
    primaryAudienceGender: 'Female',
    engagementRate: 4.5,
    audienceQualityIndicator: 'High',
    bio: 'Middle Eastern recipes and cooking tutorials.',
    contactEmail: 'fatima.cuisine@email.com',
    audienceDemographics: {
      /* ... */
    },
    engagementMetrics: {
      /* ... */
    },
  },
  {
    id: 'inf-12',
    name: 'Alex Johnson (Non-Binary)',
    handle: 'alexj_art',
    avatarUrl: '/mock-avatars/alex.jpg',
    platforms: [PlatformEnum.Instagram],
    followersCount: 75000,
    justifyScore: 82,
    isPhylloVerified: true,
    primaryAudienceLocation: 'United States',
    primaryAudienceAgeRange: '25-34',
    primaryAudienceGender: 'Other', // Example Non-binary/Other
    engagementRate: 4.2,
    audienceQualityIndicator: 'High',
    bio: 'Digital artist creating vibrant illustrations and concept art.',
    contactEmail: 'alex.art@email.com',
    audienceDemographics: { genderDistribution: { Female: 40, Male: 30, Other: 30 } /* ... */ },
    engagementMetrics: {
      /* ... */
    },
  },
  {
    id: 'inf-13',
    name: 'Sophie Dubois',
    handle: 'sophiediy',
    avatarUrl: '/mock-avatars/sophie.jpg',
    platforms: [PlatformEnum.YouTube, PlatformEnum.Instagram],
    followersCount: 220000,
    justifyScore: 79,
    isPhylloVerified: true,
    primaryAudienceLocation: 'France',
    primaryAudienceAgeRange: '35-44',
    primaryAudienceGender: 'Female',
    engagementRate: 4.0,
    audienceQualityIndicator: 'Medium',
    bio: 'DIY home decor, crafts, and upcycling projects.',
    contactEmail: 'sophie.diy@email.com',
    audienceDemographics: {
      /* ... */
    },
    engagementMetrics: {
      /* ... */
    },
  },
  {
    id: 'inf-14',
    name: 'Carlos Rossi',
    handle: 'carlosfinance',
    avatarUrl: '/mock-avatars/carlos.jpg',
    platforms: [PlatformEnum.YouTube],
    followersCount: 80000,
    justifyScore: 86,
    isPhylloVerified: false,
    primaryAudienceLocation: 'Brazil',
    primaryAudienceAgeRange: '45-54', // Older audience
    primaryAudienceGender: 'Male',
    engagementRate: 5.5,
    audienceQualityIndicator: 'High',
    bio: 'Personal finance advice, investing tips, and market analysis.',
    contactEmail: 'carlos.rossi@email.com',
    audienceDemographics: {
      /* ... */
    },
    engagementMetrics: {
      /* ... */
    },
  },
  {
    id: 'inf-15',
    name: 'Laura Peters - 45+',
    handle: 'lauraspeters_style',
    avatarUrl: '/mock-avatars/laura.jpg',
    platforms: [PlatformEnum.Instagram],
    followersCount: 95000,
    justifyScore: 87, // High score, good target
    isPhylloVerified: true,
    primaryAudienceLocation: 'United States',
    primaryAudienceAgeRange: '45-54', // Kelly P.'s target
    primaryAudienceGender: 'Female',
    engagementRate: 4.9,
    audienceQualityIndicator: 'High',
    bio: 'Chic and timeless style for women over 40. Fashion, beauty, and lifestyle.',
    contactEmail: 'laura.p@email.com',
    audienceDemographics: {
      ageDistribution: { '35-44': 20, '45-54': 50, '55-64': 25, '65plus': 5 } /* ... */,
    },
    engagementMetrics: { averageLikes: 4500, averageComments: 300 },
  },
  {
    id: 'inf-16',
    name: 'Sam Lee - Podcaster',
    handle: 'samspeaks',
    avatarUrl: '/mock-avatars/sam.jpg',
    platforms: [PlatformEnum.YouTube], // Representing Podcast via YT
    followersCount: 110000, // Subscribers as followers
    justifyScore: 84,
    isPhylloVerified: true,
    primaryAudienceLocation: 'United States',
    primaryAudienceAgeRange: '35-54',
    primaryAudienceGender: 'Mixed',
    engagementRate: undefined, // Use undefined instead of null for optional number
    audienceQualityIndicator: 'High',
    bio: 'Podcast host discussing entrepreneurship, marketing, and productivity.',
    contactEmail: 'sam.lee.podcast@email.com',
    audienceDemographics: {
      /* ... */
    },
    engagementMetrics: null, // Explicitly null
  },
];
