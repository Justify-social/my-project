import { PrismaClient, Prisma, CreativeAssetType } from '@prisma/client';
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
  const correlationId = await generateCorrelationId();
  console.log(`[${correlationId}] Starting transaction for campaign ID: ${campaignId}`);

  // Validate and parse campaignId
  const numericCampaignId = parseInt(campaignId, 10); // Specify radix 10
  if (isNaN(numericCampaignId)) {
    console.error(`[${correlationId}] Invalid campaignId provided: ${campaignId}`);
    return { success: false, error: `Invalid campaign ID format: ${campaignId}` };
  }

  try {
    // Prepare assets data (ensure fields match Prisma schema)
    const formattedAssets = data.creativeAssets.map(asset => {
      // Ensure type matches the CreativeAssetType enum
      let assetType: CreativeAssetType;
      switch (asset.type?.toUpperCase()) { // Convert to uppercase for case-insensitive matching
        case 'IMAGE': assetType = CreativeAssetType.image; break;
        case 'VIDEO': assetType = CreativeAssetType.video; break;
        default:
          console.warn(`Invalid asset type: ${asset.type}, defaulting to image.`);
          assetType = CreativeAssetType.image; // Default to image if type is unknown/invalid
      }
      return {
        submissionId: numericCampaignId, // Use parsed ID
        name: asset.title || 'Untitled Asset', // Use 'name' field
        description: asset.description || '', // Use empty string as fallback
        url: asset.url,
        type: assetType, // Use the validated enum type
        fileSize: asset.fileSize || 0,
        format: asset.format || '', // Use empty string as fallback for non-nullable field
        influencerHandle: asset.influencerHandle || null,
        budget: asset.influencerBudget || 0
      }
    });

    // Execute transaction with maximum integrity
    const result = await prisma.$transaction(async (tx) => {
      // Update campaign status with appropriate properties
      const campaign = await tx.campaignWizardSubmission.update({
        where: { id: numericCampaignId }, // Use the validated number ID
        data: {
          // Use the correct status field from the schema
          submissionStatus: 'submitted' // Set status to submitted
        }
      });

      // Delete existing assets - prevents orphaned records
      await tx.creativeAsset.deleteMany({
        where: { submissionId: numericCampaignId } // Use the validated number ID
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