'use client';

/**
 * Component File Watcher
 *
 * This module uses chokidar to watch the filesystem for changes to UI component files.
 * When a component file is added, modified, or deleted, it triggers the appropriate
 * registry updates in real-time.
 */

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';

// Dynamic imports with fallbacks for browser environment
let chokidar: any;
let path: any;
let fs: any;
let componentRegistryDB: any;
let componentMetadataExtractor: any;

// Check if we're in a browser or server environment
const isServer = typeof window === 'undefined';

// Use Node.js modules if in Node environment, otherwise use browser-compatible versions
if (typeof window === 'undefined') {
  // Node.js environment
  fs = require('fs');
  path = require('path');
} else {
  // Browser environment
  path = require('../utils/path-browser-compatibility').default;
  fs = require('../utils/fs-browser-compatibility').default;
}

// Dynamically import modules based on environment
if (isServer) {
  // Server-side imports
  import('chokidar').then((module) => { chokidar = module.default || module; });
  import('../db/registry-db').then((module) => { componentRegistryDB = module.componentRegistryDB; });
  import('./metadata-extractor').then((module) => { componentMetadataExtractor = module.componentMetadataExtractor; });
} else {
  // Browser-side imports with mocks
  componentRegistryDB = { upsertComponent: () => console.warn('componentRegistryDB mock called') };
  componentMetadataExtractor = { extractFromFile: () => Promise.resolve(null) };
  // Note: chokidar is not imported in browser - will be null
}

// Define default watch paths and options
const UI_COMPONENTS_DIR = isServer ? path.join(process.cwd(), 'src/components/ui') : '/src/components/ui';
const WATCH_EXTENSIONS = ['.tsx', '.ts'];
const IGNORED_PATTERNS = ['**/node_modules/**', '**/dist/**', '**/.next/**', '**/*.test.tsx', '**/*.stories.tsx'];

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
 * ComponentFileWatcher watches filesystem for UI component changes
 * Only fully functional on the server side due to filesystem requirements
 */
export class ComponentFileWatcher {
  private watcher: any = null;
  private readonly options: FileWatcherOptions;
  private isInitialized: boolean = false;
  private processingQueue: Set<string> = new Set();
  private processingTimeout: NodeJS.Timeout | null = null;

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
   * Start watching files
   */
  public start(): void {
    if (this.watcher || !isServer || !chokidar) {
      if (!isServer) {
        console.warn('File watcher cannot start in browser environment');
      }
      return; // Already watching or in browser environment
    }

    // Create glob pattern with all extensions to watch
    const watchPattern = this.options.paths.map(p => 
      this.options.extensions.map(ext => path.join(p, `**/*${ext}`))
    ).flat();

    // Configure watcher
    this.watcher = chokidar.watch(watchPattern, {
      ignored: this.options.ignored,
      persistent: this.options.persistent,
      ignoreInitial: this.options.ignoreInitial,
      awaitWriteFinish: {
        stabilityThreshold: this.options.stabilityThreshold,
        pollInterval: this.options.pollInterval
      }
    });

    // Add event handlers
    this.watcher
      .on('add', (path: string) => this.handleFileAdd(path))
      .on('change', (path: string) => this.handleFileChange(path))
      .on('unlink', (path: string) => this.handleFileRemove(path))
      .on('ready', () => {
        this.isInitialized = true;
        console.log('Component file watcher initialized and ready');
      })
      .on('error', (error: Error) => {
        console.error('Component file watcher error:', error);
      });

    console.log('Component file watcher started with patterns:', watchPattern);
  }

  /**
   * Stop watching files
   */
  public stop(): Promise<void> {
    if (!this.watcher) {
      return Promise.resolve();
    }

    return this.watcher.close().then(() => {
      this.watcher = null;
      this.isInitialized = false;
      console.log('Component file watcher stopped');
    });
  }

  /**
   * Check if watcher is initialized and ready
   */
  public isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Rescan all components with current discovery logic
   * Only works on server side
   */
  public async rescanAll(): Promise<void> {
    if (!isServer) {
      console.warn('Component rescanning is not available in browser environment');
      return;
    }

    console.log('Starting full component rescan...');

    for (const basePath of this.options.paths) {
      await this.scanDirectory(basePath);
    }

    console.log('Full component rescan completed');
  }

  /**
   * Recursively scan a directory for component files
   * Only works on server side
   */
  private async scanDirectory(directory: string): Promise<void> {
    if (!isServer) return;

    try {
      const entries = fs.readdirSync(directory, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(directory, entry.name);

        if (entry.isDirectory && !this.isIgnored(fullPath)) {
          await this.scanDirectory(fullPath);
        } else if (entry.isFile && this.shouldProcessFile(fullPath)) {
          await this.handleFileAdd(fullPath);
        }
      }
    } catch (error) {
      console.error(`Error scanning directory ${directory}:`, error);
    }
  }

  /**
   * Check if file should be processed based on extension
   */
  private shouldProcessFile(filePath: string): boolean {
    const ext = path.extname(filePath);
    return this.options.extensions.includes(ext) && !this.isIgnored(filePath);
  }

  /**
   * Check if path should be ignored
   */
  private isIgnored(filePath: string): boolean {
    return this.options.ignored.some(pattern => {
      if (pattern.startsWith('**/')) {
        return filePath.includes(pattern.substring(3));
      }
      return filePath.includes(pattern);
    });
  }

  /**
   * Process a component file by extracting its metadata and updating the registry
   * Only fully functional on server side
   */
  private async processFile(filePath: string): Promise<void> {
    if (!isServer) {
      console.warn(`Cannot process file ${filePath} in browser environment`);
      return;
    }

    try {
      // Extract metadata from the file
      const metadata = await componentMetadataExtractor.extractFromFile(filePath);
      
      if (metadata) {
        // Update the registry
        componentRegistryDB.upsertComponent(metadata);
        console.log(`Updated component in registry: ${filePath}`);
        
        // Call custom change handler if provided
        if (this.options.onChange) {
          this.options.onChange(filePath);
        }
      }
    } catch (error) {
      console.error(`Error processing component file ${filePath}:`, error);
    }
  }

  /**
   * Debounce file processing to prevent rapid consecutive updates
   */
  private debounceProcessing(): void {
    if (this.processingTimeout) {
      clearTimeout(this.processingTimeout);
    }

    this.processingTimeout = setTimeout(() => {
      const paths = Array.from(this.processingQueue);
      this.processingQueue.clear();
      
      paths.forEach(async filePath => {
        await this.processFile(filePath);
      });

      this.processingTimeout = null;
    }, 500); // Debounce time in ms
  }

  /**
   * Handle file add event
   */
  private handleFileAdd(filePath: string): void {
    if (!this.shouldProcessFile(filePath)) {
      return;
    }

    console.log(`Component file added: ${filePath}`);
    this.processingQueue.add(filePath);
    this.debounceProcessing();
  }

  /**
   * Handle file change event
   */
  private handleFileChange(filePath: string): void {
    if (!this.shouldProcessFile(filePath)) {
      return;
    }

    console.log(`Component file changed: ${filePath}`);
    this.processingQueue.add(filePath);
    this.debounceProcessing();
  }

  /**
   * Handle file remove event
   * Only fully functional on server side
   */
  private handleFileRemove(filePath: string): void {
    if (!isServer) {
      console.warn(`Cannot handle file removal for ${filePath} in browser environment`);
      return;
    }

    if (!this.shouldProcessFile(filePath)) {
      return;
    }

    console.log(`Component file removed: ${filePath}`);
    
    // TODO: Implement registry cleanup for removed components
    // This would require tracking component paths to IDs
  }
}

/**
 * Browser-compatible hook for file watching
 * This is a simplified version that doesn't actually watch files in the browser
 */
export function useComponentFileWatcher(options?: Partial<FileWatcherOptions>) {
  const [isWatching, setIsWatching] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Only attempt to initialize watcher on server side
    if (isServer) {
      try {
        const watcher = new ComponentFileWatcher(options);
        watcher.start();
        setIsWatching(true);
        
        return () => {
          watcher.stop().catch(err => console.error('Error stopping watcher', err));
        };
      } catch (err: any) {
        setError(err);
        console.error('Error initializing file watcher:', err);
      }
    } else {
      console.log('File watching is disabled in browser environments');
    }
  }, []);

  return { isWatching, error };
}

// Export singleton instance for server-side use
export const componentFileWatcher = isServer ? new ComponentFileWatcher() : null; 