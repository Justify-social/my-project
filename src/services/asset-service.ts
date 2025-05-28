/**
 * Asset Service - Handles asset operations like deletion and cleanup
 * ✅ UPDATED: Uses only Mux and CreativeAsset table as SSOT (dual storage removed)
 */

/**
 * Generates a unique correlation ID for tracing operations
 */
export function generateCorrelationId(prefix: string = 'op'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * @deprecated Use direct API call to /api/creative-assets/[assetId] DELETE instead
 * This function created circular dependency issues and has been removed.
 */
export async function deleteAssetFromAllSources(assetId: number): Promise<boolean> {
  console.warn(
    '[DEPRECATED] deleteAssetFromAllSources is deprecated. Use direct DELETE API call instead.'
  );
  return false;
}

/**
 * @deprecated Use deleteAssetFromAllSources instead
 */
export async function deleteAssetFromStorage(url: string): Promise<boolean> {
  console.warn(
    '[DEPRECATED] deleteAssetFromStorage is deprecated. Use deleteAssetFromAllSources instead.'
  );
  return false;
}

/**
 * Logs orphaned assets for background cleanup
 *
 * @param url The URL of the orphaned asset
 * @param assetId The ID of the asset
 */
export async function logOrphanedAsset(url: string, assetId: string): Promise<void> {
  try {
    await fetch('/api/assets/orphaned', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, assetId }),
    });
  } catch (error) {
    console.error('Failed to log orphaned asset:', error);
  }
}
