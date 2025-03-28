// testCampaign.js
import PrismaClient from '@prisma/client';
const prisma = new PrismaClient();

async function testCampaign() {
  try {
    // Attempt to fetch campaigns
    const campaigns = await prisma.campaign.findMany();
    console.log('Campaigns:', campaigns);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCampaign();
