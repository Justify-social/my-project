/**
 * Browser Compatibility Utilities
 * 
 * This module provides browser-compatible implementations of Node.js modules
 * that are not available in browser environments. These utilities ensure that
 * code which depends on Node.js APIs can be safely used in browser contexts
 * by providing compatible interfaces and graceful error handling.
 * 
 * These are NOT mock implementations with fake data, but compatibility layers
 * that help maintain a single codebase that works in both Node.js and browser
 * environments, ensuring a SINGLE SOURCE OF TRUTH.
 */

import * as fsCompat from './fs';
import * as pathCompat from './path';

export const fs = fsCompat;
export const path = pathCompat;

export default {
  fs,
  path
}; 