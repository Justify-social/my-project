import React, { useEffect } from 'react';
import { toast } from 'react-hot-toast';

// Track deleted asset IDs to prevent race conditions
const DELETED_ASSET_IDS = new Set<string>();

// In the useEffect for handling asset deletion events
useEffect(() => {
  const handleAssetDeleted = (event: CustomEvent) => {
    const { id, url, fileId, reason } = event.detail;
    
    // Skip if we've already processed this deletion event
    if (DELETED_ASSET_IDS.has(id) || (fileId && DELETED_ASSET_IDS.has(fileId))) {
      console.log(`Already processed deletion for asset ${id || fileId}, skipping`);
      return;
    }
    
    console.log(`Asset deletion event received: ${id} (${fileId}) - ${reason}`);
    
    // Find and remove the asset from both UI state and database
    const assetToRemove = assets.find(asset => 
      asset.id === id || (asset.url && fileId && asset.url.includes(fileId))
    );
    
    if (assetToRemove) {
      console.log(`Removing deleted asset from UI and database: ${assetToRemove.fileName}`);
      
      // Add to tracking set to prevent duplicate processing
      DELETED_ASSET_IDS.add(assetToRemove.id);
      if (fileId) DELETED_ASSET_IDS.add(fileId);
      
      // Remove from local state immediately to prevent further requests
      const updatedAssets = assets.filter(asset => asset.id !== assetToRemove.id);
      setAssets(updatedAssets);
      
      // Update wizard context to persist the change
      // Wrap in setTimeout to prevent state update conflicts
      setTimeout(() => {
        updateCampaignData({
          assets: {
            files: updatedAssets.map(asset => ({
              id: asset.id,
              url: asset.url,
              fileName: asset.fileName,
              fileSize: asset.fileSize,
              type: asset.type,
              details: asset.details,
              tags: []
            }))
          }
        });
      }, 0);
      
      // Show notification
      toast.success("Asset removed", {
        description: `"${assetToRemove.fileName}" has been removed from this campaign.`
      });
    }
  };
  
  document.addEventListener(ASSET_DELETED_EVENT, handleAssetDeleted as EventListener);
  
  return () => {
    document.removeEventListener(ASSET_DELETED_EVENT, handleAssetDeleted as EventListener);
  };
}, [assets, updateCampaignData]); 