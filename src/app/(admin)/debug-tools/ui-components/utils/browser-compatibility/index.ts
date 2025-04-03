/**
 * Browser Compatibility Layer
 * 
 * This module provides browser-compatible implementations of Node.js modules
 * that are not available in the browser environment.
 * 
 * It follows the Single Source of Truth principle by using registry data
 * from the icon and component registries when possible.
 */

import { fs } from '../fs-browser-compatibility';
import path from '../path-browser-compatibility';

export {
  fs,
  path
}; 