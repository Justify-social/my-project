import prismaWizard from '@/lib/prisma-campaign'

export async function POST(request: Request) {
  // Use prismaWizard instead of prisma
  const wizard = await prismaWizard.campaignWizard.create({
    // ... your creation logic
  })
} 