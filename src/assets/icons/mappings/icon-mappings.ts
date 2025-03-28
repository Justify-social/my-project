/**
 * Icon Mappings - Transition File
 * 
 * This file re-exports the icon mappings from the original location.
 * In the future, it will contain the primary mapping functions and constants.
 */

// Import from original location
import { 
  SEMANTIC_TO_FA_MAP,
  FA_TO_SVG_MAP,
  getIconBaseName,
  getIconPath
} from '@/components/ui/icons/icon-mappings';

// Re-export everything
export {
  SEMANTIC_TO_FA_MAP,
  FA_TO_SVG_MAP,
  getIconBaseName,
  getIconPath
};

// Export default as object for convenience
export default {
  SEMANTIC_TO_FA_MAP,
  FA_TO_SVG_MAP,
  getIconBaseName,
  getIconPath
}; 