import { PrismaClient, Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

// Asset interface for proper typing
interface Asset {
  title?: string;
  description?: string;
  url: string;
  type: string;
  fileSize?: number;
  format?: string;
  influencerHandle?: string;
  influencerBudget?: number;
}

// Campaign data interface
interface CampaignStepData {
  currentStep?: number;
  step4Complete?: boolean;
  creativeAssets: Asset[];
}

export async function generateCorrelationId(prefix: string = 'op'): Promise<string> {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export async function updateCampaignWithTransactions(
  campaignId: string, 
  data: CampaignStepData
): Promise<{ success: boolean; data?: any; error?: string }> {
  const correlationId = generateCorrelationId('tx');
  
  try {
    console.log(`[${correlationId}] Starting transaction for campaign ${campaignId}`);
    
    // Format assets for database
    const formattedAssets = data.creativeAssets.map((asset: Asset) => ({
      submissionId: campaignId,
      name: asset.title || '',
      description: asset.description || '',
      url: asset.url,
      type: asset.type,
      fileSize: asset.fileSize || 0,
      format: asset.format || 'unknown',
      influencerHandle: asset.influencerHandle || null,
      budget: asset.influencerBudget || 0
    }));
    
    // For safety, parse the campaignId to ensure it's a number if needed
    const parsedCampaignId = isNaN(parseInt(campaignId)) ? campaignId : parseInt(campaignId);
    
    // Execute transaction with maximum integrity
    const result = await prisma.$transaction(async (tx) => {
      // Update campaign status with appropriate properties
      const campaign = await tx.campaignWizardSubmission.update({
        where: { id: parsedCampaignId },
        data: {
          // Use fields that exist in the schema
          step4Complete: data.step4Complete || false
        }
      });
      
      // Delete existing assets - prevents orphaned records
      await tx.creativeAsset.deleteMany({
        where: { submissionId: parsedCampaignId }
      });
      
      // Create new assets in a batch
      await tx.creativeAsset.createMany({
        data: formattedAssets
      });
      
      return campaign;
    }, {
      maxWait: 5000, // Maximum wait time for transaction
      timeout: 10000  // Transaction timeout
    });
    
    console.log(`[${correlationId}] Transaction completed successfully`);
    
    // Cache successful transaction to prevent data loss
    localStorage.removeItem(`pendingSubmission_${campaignId}`);
    
    // Return success with transaction result
    return {
      success: true,
      data: result
    };
    
  } catch (error) {
    console.error(`[${correlationId}] Transaction failed:`, error);
    
    // Cache failed submission for later recovery
    try {
      localStorage.setItem(
        `pendingSubmission_${campaignId}`, 
        JSON.stringify({ data, timestamp: Date.now(), correlationId })
      );
    } catch (cacheError) {
      console.error(`[${correlationId}] Failed to cache submission:`, cacheError);
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown database error'
    };
  }
} 