/**
 * Development Registry Watcher
 * 
 * This module provides a file watcher for development mode that monitors
 * component files and refreshes the registry cache when changes occur.
 * It's only activated in development mode and on the server side.
 */

import { ComponentMetadata } from '../db/registry';
import { generateDevRegistry, findComponentFiles } from './development-registry';

// Environment detection
const isServer = typeof window === 'undefined';
const isBrowser = !isServer;
const isDev = process.env.NODE_ENV === 'development';

// Registry cache and callbacks
let registryCache: Record<string, ComponentMetadata> | null = null;
let lastScanTime = 0;
const onChangeCallbacks: Array<() => void> = [];

// Initialization state
let isInitializing = false;
let isInitialized = false;

// Watcher instance (declared without type for browser compatibility)
let watcher: any = null;

/**
 * Initialize the development registry watcher
 * Only runs on the server in development mode
 */
export function initDevRegistryWatcher(): void {
  // Skip if not on server or not in development mode
  if (!isServer || !isDev) {
    console.log('Dev Registry Watcher skipped - not running on server or not in development mode');
    return;
  }
  
  // Skip if already initialized or initializing
  if (isInitialized) {
    console.log('Dev Registry Watcher already initialized');
    return;
  }
  
  if (isInitializing) {
    console.log('Dev Registry Watcher already initializing');
    return;
  }
  
  isInitializing = true;
  console.log('Initializing Development Registry Watcher...');
  
  try {
    // Start with an initial scan
    refreshRegistryCache().catch(err => {
      console.error('Error during initial registry scan:', err);
    });
    
    // Initialize watcher in a non-blocking way
    initWatcher().catch(err => {
      console.error('Error initializing watcher:', err);
      isInitializing = false;
    });
  } catch (error) {
    console.error('Failed to initialize Dev Registry Watcher:', error);
    isInitializing = false;
  }
}

/**
 * Initialize the file watcher asynchronously
 */
async function initWatcher(): Promise<void> {
  try {
    // Skip in browser environment
    if (isBrowser) {
      console.log('Browser environment detected, skipping watcher initialization');
      isInitialized = true;
      isInitializing = false;
      return;
    }
    
    // Dynamically import chokidar to avoid browser issues
    const chokidar = await import('chokidar');
    
    // Find component files to watch
    const files = await findComponentFiles();
    if (files.length === 0) {
      console.warn('No component files found to watch');
      isInitializing = false;
      return;
    }
    
    // Initialize the watcher with the found files
    try {
      watcher = chokidar.watch(files, {
        persistent: true,
        ignoreInitial: true, // Skip initial add events since we already scanned
        awaitWriteFinish: {
          stabilityThreshold: 1000, // Wait 1s after file changes before considering it ready
          pollInterval: 100
        }
      });
      
      // Add event handlers
      watcher
        .on('add', handleFileChange)
        .on('change', handleFileChange)
        .on('unlink', handleFileChange)
        .on('error', (error: unknown) => console.error('Dev Registry Watcher error:', error))
        .on('ready', () => {
          console.log('Dev Registry Watcher initialized and ready');
          isInitialized = true;
          isInitializing = false;
        });
        
      console.log(`Dev Registry Watcher is monitoring ${files.length} component files`);
    } catch (watcherError) {
      console.error('Failed to initialize chokidar watcher:', watcherError);
      isInitializing = false;
    }
  } catch (err) {
    console.error('Error initializing watcher:', err);
    isInitializing = false;
  }
}

/**
 * Handle file change events
 */
function handleFileChange(filePath: string): void {
  // Skip in browser environment
  if (isBrowser) {
    return;
  }
  
  console.log(`Component file changed: ${filePath}`);
  
  // Debounce registry refresh (wait for multiple changes to settle)
  const now = Date.now();
  if (now - lastScanTime < 1000) {
    // Too soon after last refresh, skip this one
    return;
  }
  
  // Refresh the registry cache
  refreshRegistryCache().catch(err => {
    console.error('Error refreshing registry after file change:', err);
  });
}

/**
 * Refresh the registry cache
 */
async function refreshRegistryCache(): Promise<void> {
  // Skip in browser environment
  if (isBrowser) {
    console.log('Browser environment detected, using mock registry data');
    lastScanTime = Date.now();
    registryCache = await generateDevRegistry();
    return;
  }
  
  console.log('Refreshing component registry cache...');
  
  try {
    // Update scan time first to prevent multiple concurrent scans
    lastScanTime = Date.now();
    
    // Generate a fresh registry
    const freshRegistry = await generateDevRegistry();
    if (freshRegistry && Object.keys(freshRegistry).length > 0) {
      registryCache = freshRegistry;
      console.log(`Registry cache refreshed with ${Object.keys(registryCache).length} components`);
      
      // Notify all registered callbacks
      notifyChangeListeners();
    } else {
      console.error('Generated registry is empty or invalid:', freshRegistry);
    }
  } catch (error) {
    console.error('Error refreshing registry cache:', error);
    throw error; // Re-throw to let caller handle it
  }
}

/**
 * Notify all change listeners
 */
function notifyChangeListeners(): void {
  console.log(`Notifying ${onChangeCallbacks.length} registry change listeners`);
  onChangeCallbacks.forEach(callback => {
    try {
      callback();
    } catch (error) {
      console.error('Error in registry change listener:', error);
    }
  });
}

/**
 * Get the current registry cache
 */
export function getRegistryCache(): Record<string, ComponentMetadata> | null {
  // If in browser and no cache exists, generate a mock registry
  if (isBrowser && !registryCache) {
    refreshRegistryCache().catch(console.error);
  }
  return registryCache;
}

/**
 * Register a callback to be notified when the registry changes
 */
export function onRegistryChange(callback: () => void): void {
  onChangeCallbacks.push(callback);
}

/**
 * Unregister a change callback
 */
export function offRegistryChange(callback: () => void): void {
  const index = onChangeCallbacks.indexOf(callback);
  if (index !== -1) {
    onChangeCallbacks.splice(index, 1);
  }
}

/**
 * Stop the watcher and clean up resources
 */
export function stopDevRegistryWatcher(): void {
  if (watcher && isServer) {
    console.log('Stopping Dev Registry Watcher...');
    watcher.close();
    watcher = null;
  }
  isInitialized = false;
} 