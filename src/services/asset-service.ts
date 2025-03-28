/**
 * Asset Service - Handles asset operations like deletion and cleanup
 */

/**
 * Generates a unique correlation ID for tracing operations
 */
export function generateCorrelationId(prefix: string = 'op'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Deletes an asset from cloud storage
 * 
 * @param url The URL of the asset to delete
 * @returns True if deletion was successful, otherwise false
 */
export async function deleteAssetFromStorage(url: string): Promise<boolean> {
  const correlationId = generateCorrelationId('cleanup');
  console.log(`[${correlationId}] Deleting asset from storage:`, url);
  
  try {
    const response = await fetch('/api/uploadthing/delete', {
      method: 'DELETE',
      headers: { 
        'Content-Type': 'application/json',
        'X-Correlation-ID': correlationId
      },
      body: JSON.stringify({ url })
    });
    
    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        try {
          const errorData = await response.json();
          console.error(`[${correlationId}] Failed to delete from storage:`, errorData);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_parseError) {
          console.error(`[${correlationId}] Failed to delete from storage: ${response.status} ${response.statusText}`);
        }
      } else {
        console.error(`[${correlationId}] Failed to delete from storage: ${response.status} ${response.statusText}`);
      }
      return false;
    }
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const result = await response.json();
      console.log(`[${correlationId}] Successfully deleted asset from storage`, result);
    } else {
      console.log(`[${correlationId}] Successfully deleted asset from storage`);
    }
    
    return true;
  } catch (error) {
    console.error(`[${correlationId}] Error deleting asset from storage:`, error);
    return false;
  }
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
      body: JSON.stringify({ url, assetId })
    });
  } catch (error) {
    console.error('Failed to log orphaned asset:', error);
  }
} 