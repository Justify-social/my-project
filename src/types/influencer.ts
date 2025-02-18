////////////////////////////////////
// src/types/influencer.ts
////////////////////////////////////
export interface Influencer {
  id: string;
  name: string;
  bio?: string;
  avatar: string;
  dynamicScore: number;
  tier: string;
  platform: string;
  featuredCampaignImage?: string;
}
