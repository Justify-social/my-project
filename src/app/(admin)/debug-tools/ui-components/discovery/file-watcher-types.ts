/**
 * File Watcher Types
 * 
 * This module defines shared types used by both client and server components
 * for file watching functionality. Separating these types helps maintain
 * a Single Source of Truth for the data structures while keeping the
 * client and server code properly separated.
 */

/**
 * FileWatcherOptions configures how the filesystem watcher operates
 */
export interface FileWatcherOptions {
  paths: string[];                  // Paths to watch
  extensions: string[];             // File extensions to watch
  ignored: string[];                // Patterns to ignore
  stabilityThreshold?: number;      // Wait time after changes before processing (ms)
  pollInterval?: number;            // Poll interval (ms)
  persistent?: boolean;             // Keep process running
  ignoreInitial?: boolean;          // Ignore initial file scan events
  onChange?: (path: string) => void; // Custom change handler
}

/**
 * Result from a server action
 */
export interface ServerActionResult<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

/**
 * Icon data structure that follows the structure in icon-registry.json
 * This ensures we maintain a consistent type definition aligned with our SSOT
 */
export interface IconData {
  id: string;
  name: string;
  fileName: string;
  path: string;
  category: string;
  type: string;
  weight: string;
  viewBox?: string;
  width?: number;
  height?: number;
  tags?: string[];
}

/**
 * Component metadata structure that follows the structure in component-registry.json
 */
export interface ComponentMetadata {
  id: string;
  name: string;
  path: string;
  category: 'atom' | 'molecule' | 'organism';
  description?: string;
  propsInterface?: string;
  props?: Record<string, { type: string; required: boolean; description?: string }>;
  dependencies?: string[];
  tags?: string[];
  lastUpdated?: string;
} 