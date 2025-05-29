import Mux from '@mux/mux-node';
import { serverConfig } from '@/config/server-config';
import { logger } from '@/utils/logger';

let muxClient: Mux | null = null;

if (serverConfig.mux.tokenId && serverConfig.mux.tokenSecret) {
  muxClient = new Mux({
    tokenId: serverConfig.mux.tokenId,
    tokenSecret: serverConfig.mux.tokenSecret,
  });
  logger.info('[MuxService] Mux client initialized successfully.');
} else {
  logger.error(
    '[MuxService] MUX_TOKEN_ID or MUX_TOKEN_SECRET is not configured. MuxService will not be operational.'
  );
}

// Initialize Mux with credentials from serverConfig
// The SDK will only be functional if tokenId and tokenSecret are present.
// const { Video } = new Mux( // OLD WAY - TO BE REMOVED
// serverConfig.mux.tokenId || '', // Provide empty string if null/undefined to avoid SDK error
// serverConfig.mux.tokenSecret || '' // Provide empty string if null/undefined
// );

// Placeholder for createDirectUploadUrl function
export async function createDirectUploadUrl(corsOrigin: string = '*') {
  // Implementation to follow
  if (!muxClient) {
    logger.error('[MuxService] Cannot create direct upload URL, Mux client not initialized.');
    throw new Error('Mux client not initialized.');
  }
  logger.info('[MuxService] createDirectUploadUrl called');
  try {
    const upload = await muxClient.video.uploads.create({
      new_asset_settings: {
        playback_policies: ['public'],
        // Consider adding other settings like `passthrough` if needed
      },
      cors_origin: corsOrigin, // Make this configurable, from env var for example
      // timeout: 60000 // Optional: customize timeout for the API call
    });

    // Check if upload itself and its critical properties (url, id) are present
    if (upload && upload.url && upload.id) {
      logger.info(
        `[MuxService] Mux direct upload URL created successfully. Upload ID: ${upload.id}, Asset ID: ${upload.asset_id}`
      );
      return {
        uploadUrl: upload.url,
        muxUploadId: upload.id,
        muxAssetId: upload.asset_id, // This might be null initially
      };
    } else {
      logger.error(
        '[MuxService] Failed to create Mux direct upload URL. Response or critical properties are undefined.',
        { upload }
      );
      throw new Error('Failed to create Mux direct upload URL.');
    }
  } catch (error) {
    logger.error('[MuxService] Error creating Mux direct upload URL:', error);
    if (error instanceof Mux.APIError && error.message) {
      throw new Error(`Mux API Error: ${error.message}`);
    }
    throw new Error('Failed to create Mux direct upload URL due to an internal error.');
  }
}

// Placeholder for getAssetPlaybackInfo function
export async function getAssetPlaybackInfo(muxAssetId: string) {
  // Implementation to follow
  if (!muxClient) {
    logger.error('[MuxService] Cannot get asset playback info, Mux client not initialized.');
    throw new Error('Mux client not initialized.');
  }
  if (!muxAssetId) {
    logger.warn('[MuxService] getAssetPlaybackInfo called with no muxAssetId.');
    throw new Error('Mux Asset ID is required.');
  }
  logger.info(`[MuxService] getAssetPlaybackInfo called for muxAssetId: ${muxAssetId}`);
  try {
    // The Mux SDK uses .retrieve() for getting a specific asset by ID
    const asset = await muxClient.video.assets.retrieve(muxAssetId);

    if (asset) {
      // Assuming asset is the direct response object
      logger.info(`[MuxService] Mux asset info retrieved successfully for Asset ID: ${asset.id}`);
      // Extract relevant information. The exact structure depends on the Mux.Video.Asset type.
      // Common properties: id, playback_ids, status, duration, aspect_ratio
      return {
        id: asset.id,
        status: asset.status,
        playbackIds: asset.playback_ids, // Array of playback IDs
        duration: asset.duration,
        aspectRatio: asset.aspect_ratio,
        // Add other relevant fields from the Mux.Video.Asset type as needed
      };
    } else {
      logger.error(
        `[MuxService] Failed to retrieve Mux asset info for Asset ID: ${muxAssetId}. Response undefined.`
      );
      throw new Error(`Failed to retrieve Mux asset info for Asset ID: ${muxAssetId}.`);
    }
  } catch (error) {
    logger.error(
      `[MuxService] Error retrieving Mux asset info for Asset ID: ${muxAssetId}:`,
      error
    );
    if (error instanceof Mux.APIError && error.message) {
      throw new Error(`Mux API Error: ${error.message}`);
    }
    if (error instanceof Mux.NotFoundError) {
      throw new Error(`Mux Asset with ID ${muxAssetId} not found.`);
    }
    throw new Error(
      `Failed to retrieve Mux asset info for Asset ID: ${muxAssetId} due to an internal error.`
    );
  }
}

export async function getAssetFullInfo(muxAssetId: string) {
  if (!muxClient) throw new Error('Mux client not initialized.');
  try {
    const asset = await muxClient.video.assets.retrieve(muxAssetId);
    return asset as unknown as {
      id: string;
      status: string;
      upload_id?: string;
      playback_ids?: { id: string; policy: string }[];
    };
  } catch (error) {
    logger.error('[MuxService] getAssetFullInfo error', error);
    throw error;
  }
}

export const muxService = {
  createDirectUploadUrl,
  getAssetPlaybackInfo,
  getAssetFullInfo,
  // Expose Video directly if needed for other operations, or wrap them
  // Video, // Example: if you need direct access to other Mux Video methods
  // Expose the client if direct access is needed, or specific sub-clients like video services
  // getRawClient: () => muxClient, // Example accessor
};

// logger.info('[MuxService] MuxService initialized.'); // Moved earlier or covered by client init log
