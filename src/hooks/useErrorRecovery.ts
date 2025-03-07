import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';

interface PendingAssetUpdate {
  asset: any;
  timestamp: number;
  correlationId: string;
}

interface PendingSubmission {
  data: any;
  timestamp: number;
  correlationId: string;
}

/**
 * Hook to manage error recovery for pending operations
 */
export function useErrorRecovery(campaignId: string) {
  const [hasPendingRecovery, setHasPendingRecovery] = useState(false);
  
  // Check for recoverable operations on mount
  useEffect(() => {
    checkForPendingOperations();
  }, [campaignId]);
  
  /**
   * Checks localStorage for any pending operations that could be recovered
   */
  const checkForPendingOperations = useCallback(() => {
    try {
      // 1. Check for pending asset updates
      const pendingUpdates = Object.keys(localStorage)
        .filter(key => key.startsWith('pendingAssetUpdate_'))
        .map(key => {
          try {
            return JSON.parse(localStorage.getItem(key) || 'null') as PendingAssetUpdate;
          } catch (e) {
            console.error('Failed to parse pending asset update:', e);
            return null;
          }
        })
        .filter((item): item is PendingAssetUpdate => item !== null);
      
      // 2. Check for pending submissions
      let pendingSubmission: PendingSubmission | null = null;
      try {
        const submissionData = localStorage.getItem(`pendingSubmission_${campaignId}`);
        if (submissionData) {
          pendingSubmission = JSON.parse(submissionData);
        }
      } catch (e) {
        console.error('Failed to parse pending submission:', e);
      }
      
      // 3. Check for pending uploads
      let pendingUpload: any = null;
      try {
        const uploadData = localStorage.getItem(`pendingUpload_${campaignId}`);
        if (uploadData) {
          pendingUpload = JSON.parse(uploadData);
        }
      } catch (e) {
        console.error('Failed to parse pending upload:', e);
      }
      
      const hasRecoverableOperations = 
        pendingUpdates.length > 0 || 
        pendingSubmission !== null ||
        pendingUpload !== null;
      
      setHasPendingRecovery(hasRecoverableOperations);
      
      return {
        pendingUpdates,
        pendingSubmission,
        pendingUpload,
        hasRecoverableOperations
      };
    } catch (e) {
      console.error('Error checking for pending operations:', e);
      return {
        pendingUpdates: [],
        pendingSubmission: null,
        pendingUpload: null,
        hasRecoverableOperations: false
      };
    }
  }, [campaignId]);
  
  /**
   * Attempt to recover pending operations
   */
  const recoverPendingOperations = useCallback(async (
    handlers: {
      onUpdateAsset?: (asset: any) => Promise<void>;
      onSubmitForm?: (data: any) => Promise<void>;
      onRetryUpload?: () => Promise<void>;
    } = {}
  ) => {
    const { pendingUpdates, pendingSubmission, pendingUpload } = checkForPendingOperations();
    let recoveredCount = 0;
    
    // 1. Recover asset updates
    if (handlers.onUpdateAsset) {
      for (const update of pendingUpdates) {
        try {
          await handlers.onUpdateAsset(update.asset);
          localStorage.removeItem(`pendingAssetUpdate_${update.asset.id}`);
          recoveredCount++;
        } catch (e) {
          console.error('Failed to recover asset update:', e);
        }
      }
    }
    
    // 2. Recover submission if needed
    if (pendingSubmission && handlers.onSubmitForm) {
      try {
        await handlers.onSubmitForm(pendingSubmission.data);
        localStorage.removeItem(`pendingSubmission_${campaignId}`);
        recoveredCount++;
      } catch (e) {
        console.error('Failed to recover submission:', e);
      }
    }
    
    // 3. Handle upload recovery
    if (pendingUpload && handlers.onRetryUpload) {
      try {
        await handlers.onRetryUpload();
        localStorage.removeItem(`pendingUpload_${campaignId}`);
        recoveredCount++;
      } catch (e) {
        console.error('Failed to recover upload:', e);
      }
    }
    
    // If we recovered anything, refresh the recovery state
    if (recoveredCount > 0) {
      checkForPendingOperations();
    }
    
    return { recoveredCount };
  }, [campaignId, checkForPendingOperations]);
  
  /**
   * Show recovery UI to the user
   */
  const showRecoveryPrompt = useCallback(() => {
    if (!hasPendingRecovery) return;
    
    toast((t) => (
      <div className="p-2">
        <p className="font-medium mb-2">You have unsaved changes. Would you like to recover them?</p>
        <div className="flex gap-2">
          <button 
            onClick={() => {
              toast.dismiss(t.id);
              recoverPendingOperations();
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Recover
          </button>
          <button 
            onClick={() => {
              // Clear all pending operations
              Object.keys(localStorage)
                .filter(key => 
                  key.startsWith('pendingAssetUpdate_') || 
                  key === `pendingSubmission_${campaignId}` ||
                  key === `pendingUpload_${campaignId}`
                )
                .forEach(key => localStorage.removeItem(key));
              
              checkForPendingOperations();
              toast.dismiss(t.id);
            }}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Discard
          </button>
        </div>
      </div>
    ), { duration: 10000 });
  }, [hasPendingRecovery, recoverPendingOperations, campaignId, checkForPendingOperations]);
  
  return {
    hasPendingRecovery,
    checkForPendingOperations,
    recoverPendingOperations,
    showRecoveryPrompt
  };
} 