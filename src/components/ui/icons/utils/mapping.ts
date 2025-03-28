/**
 * Icon Mapping Utilities
 * 
 * This module provides mapping utilities for the icon system.
 */

import {
  SEMANTIC_TO_FA_MAP,
  getIconBaseName,
  getIconPath,
  getStyleFromPrefix,
  getKnownAppIcons,
  getKnownKpiIcons
} from '../mapping/icon-mappings';

// Re-export from data module to avoid duplication
import { PLATFORM_ICON_MAP, PLATFORM_COLORS } from '../data/icon-data';

// Export all mappings and utilities
export {
  // Icon to icon mappings
  SEMANTIC_TO_FA_MAP,
  PLATFORM_ICON_MAP,
  PLATFORM_COLORS,
  
  // Utility functions
  getIconBaseName,
  getIconPath,
  getStyleFromPrefix,
  getKnownAppIcons,
  getKnownKpiIcons
};