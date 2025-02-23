import { NextResponse } from 'next/server';

// Mock data for the marketplace
const mockInfluencers = [
  {
    id: "1",
    name: "Olivia Bennett",
    bio: "Lifestyle & Travel influencer with a highly engaged audience.",
    avatar: "/profile-image.svg",
    dynamicScore: 92,
    tier: "Platinum",
    platform: "Instagram",
    featuredCampaignImage: "/images/campaigns/campaign1.jpg",
  },
  {
    id: "2",
    name: "John Smith",
    bio: "Tech reviewer and gadget enthusiast.",
    avatar: "/profile-image.svg",
    dynamicScore: 80,
    tier: "Silver",
    platform: "YouTube",
    featuredCampaignImage: "/images/campaigns/campaign2.jpg",
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get('page')) || 1;
  const itemsPerPage = Number(searchParams.get('itemsPerPage')) || 12;
  const platform = searchParams.get('platform');
  const tier = searchParams.get('tier');
  const sortBy = searchParams.get('sortBy');

  let filteredData = [...mockInfluencers];

  // Apply filters
  if (platform) {
    filteredData = filteredData.filter(inf => 
      inf.platform.toLowerCase() === platform.toLowerCase()
    );
  }
  if (tier) {
    filteredData = filteredData.filter(inf => 
      inf.tier.toLowerCase() === tier.toLowerCase()
    );
  }

  // Apply sorting
  switch (sortBy) {
    case 'score-desc':
      filteredData.sort((a, b) => b.dynamicScore - a.dynamicScore);
      break;
    case 'score-asc':
      filteredData.sort((a, b) => a.dynamicScore - b.dynamicScore);
      break;
    case 'name-asc':
      filteredData.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'name-desc':
      filteredData.sort((a, b) => b.name.localeCompare(a.name));
      break;
  }

  return NextResponse.json({
    influencers: filteredData,
    total: filteredData.length
  });
} 