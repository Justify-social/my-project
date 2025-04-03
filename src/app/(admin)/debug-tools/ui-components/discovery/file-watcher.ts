'use client';

/**
 * Component File Watcher (Client)
 *
 * This module provides browser-compatible file watching functionality.
 * It delegates actual filesystem operations to server actions to maintain
 * the separation between client and server code in Next.js.
 * 
 * This approach preserves the Single Source of Truth principle by:
 * 1. Keeping filesystem operations on the server
 * 2. Providing a consistent API across client/server
 * 3. Maintaining shared types for data structures
 */

import { useState, useEffect } from 'react';
import { 
  serverWatchFiles, 
  getIconRegistry, 
  getComponentRegistry 
} from './server-actions';
import { FileWatcherOptions } from './file-watcher-types';

// Proper environment detection
const isServer = typeof window === 'undefined';
const isBrowser = !isServer;

// Define default watch paths and options
const UI_COMPONENTS_DIR = 'src/components/ui';
const WATCH_EXTENSIONS = ['.tsx', '.ts'];
const IGNORED_PATTERNS = ['**/node_modules/**', '**/dist/**', '**/.next/**', '**/*.test.tsx', '**/*.stories.tsx'];

/**
 * Client-side ComponentFileWatcher that delegates to server actions
 * This is safe for use in client components
 */
export class ComponentFileWatcher {
  private readonly options: FileWatcherOptions;
  private isInitialized: boolean = false;
  private isWatching: boolean = false;

  constructor(options?: Partial<FileWatcherOptions>) {
    this.options = {
      paths: options?.paths || [UI_COMPONENTS_DIR],
      extensions: options?.extensions || WATCH_EXTENSIONS,
      ignored: options?.ignored || IGNORED_PATTERNS,
      stabilityThreshold: options?.stabilityThreshold || 1000,
      pollInterval: options?.pollInterval || 100,
      persistent: options?.persistent !== undefined ? options.persistent : true,
      ignoreInitial: options?.ignoreInitial !== undefined ? options.ignoreInitial : false,
      onChange: options?.onChange,
    };
  }

  /**
   * Start watching files - delegates to server action
   */
  public async start(): Promise<void> {
    if (this.isWatching) {
      console.log('File watcher is already running');
      return;
    }
    
    console.log('Attempting to start file watcher via server action');
    try {
      const result = await serverWatchFiles(this.options);
      if (result.success) {
        this.isWatching = true;
        this.isInitialized = true;
        console.log('File watcher started via server action');
      } else {
        console.warn('Failed to start file watcher:', result.message);
      }
    } catch (error) {
      console.error('Error starting file watcher:', error);
    }
  }

  /**
   * Stop watching files
   */
  public async stop(): Promise<void> {
    this.isWatching = false;
    console.log('File watcher stopped');
    return Promise.resolve();
  }

  /**
   * Check if watcher is initialized and ready
   */
  public isReady(): boolean {
    return this.isInitialized;
  }
  
  /**
   * Get icon registry data from the SSOT (icon-registry.json)
   */
  public async getIconRegistry() {
    try {
      return await getIconRegistry();
    } catch (error) {
      console.error('Error fetching icon registry:', error);
      return { success: false, message: 'Failed to fetch icon registry', data: null };
    }
  }
  
  /**
   * Get component registry data from the SSOT (component-registry.json)
   */
  public async getComponentRegistry() {
    try {
      return await getComponentRegistry();
    } catch (error) {
      console.error('Error fetching component registry:', error);
      return { success: false, message: 'Failed to fetch component registry', data: null };
    }
  }
}

// Create a singleton instance for easy access
export const componentFileWatcher = new ComponentFileWatcher();

/**
 * React hook for using the component file watcher in components
 */
export function useComponentFileWatcher(options?: Partial<FileWatcherOptions>) {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Only provide UI controls for manual starting in browser environment
  const [isWatching, setIsWatching] = useState(false);
  
  useEffect(() => {
    // Don't auto-start in browser, let user trigger it
    if (!isBrowser) {
      init();
    }
    
    // Cleanup
    return () => {
      // Don't actually stop the watcher on unmount to allow for persistence
    };
  }, []);
  
  // Initialize on mount
  const init = async () => {
    try {
      if (!componentFileWatcher.isReady()) {
        await componentFileWatcher.start();
      }
      setIsReady(componentFileWatcher.isReady());
      setIsWatching(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error initializing file watcher');
      console.error('File watcher initialization error:', e);
    }
  };
  
  // Start watching function for manual triggering
  const startWatching = async () => {
    if (isWatching) return;
    
    try {
      await componentFileWatcher.start();
      setIsWatching(true);
      setIsReady(componentFileWatcher.isReady());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error starting file watcher');
      console.error('File watcher start error:', e);
    }
  };
  
  // Stop watching function for manual triggering
  const stopWatching = async () => {
    if (!isWatching) return;
    
    try {
      await componentFileWatcher.stop();
      setIsWatching(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error stopping file watcher');
      console.error('File watcher stop error:', e);
    }
  };
  
  // Fetch icon registry data from SSOT
  const getIconRegistry = async () => {
    return await componentFileWatcher.getIconRegistry();
  };
  
  // Fetch component registry data from SSOT
  const getComponentRegistry = async () => {
    return await componentFileWatcher.getComponentRegistry();
  };
  
  return {
    isReady,
    isWatching,
    error,
    startWatching,
    stopWatching,
    getIconRegistry,
    getComponentRegistry
  };
} 