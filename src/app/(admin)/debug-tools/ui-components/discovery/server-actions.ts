'use server';

/**
 * Server Actions for File System Operations
 * 
 * This module contains server-only actions for file system operations.
 * It's marked with 'use server' at the top level to ensure these functions
 * are properly handled by Next.js and run exclusively on the server.
 * 
 * This approach maintains the Single Source of Truth principle by centralizing
 * all filesystem access in server-side code while providing a clean API
 * for client components.
 */

import { type FileWatcherOptions } from './file-watcher-types';

/**
 * Load server-side modules dynamically
 * This prevents bundling these modules in client-side code
 */
export async function serverLoadModules() {
  try {
    // Dynamically load server-only modules
    const chokidarModule = await import('chokidar');
    const registryModule = await import('../db/registry-db');
    const extractorModule = await import('./metadata-extractor');
    
    return {
      success: true,
      message: 'Server modules loaded successfully',
      modules: {
        chokidar: chokidarModule.default || chokidarModule,
        componentRegistryDB: registryModule.componentRegistryDB,
        componentMetadataExtractor: extractorModule.componentMetadataExtractor
      }
    };
  } catch (error) {
    console.error('Failed to load server modules:', error);
    return {
      success: false,
      message: `Error loading server modules: ${error instanceof Error ? error.message : String(error)}`,
      modules: null
    };
  }
}

/**
 * Start watching files for changes
 * This runs only on the server and watches the filesystem
 */
export async function serverWatchFiles(options: FileWatcherOptions) {
  try {
    // Ensure modules are loaded
    const loadResult = await serverLoadModules();
    if (!loadResult.success || !loadResult.modules) {
      return loadResult;
    }
    
    const { chokidar, componentRegistryDB, componentMetadataExtractor } = loadResult.modules;
    
    // Create glob pattern with all extensions to watch
    const watchPattern = options.paths.map(p => 
      options.extensions.map(ext => `${p}/**/*${ext}`)
    ).flat();
    
    // Configure and start the watcher
    const watcher = chokidar.watch(watchPattern, {
      ignored: options.ignored,
      persistent: options.persistent,
      ignoreInitial: options.ignoreInitial,
      awaitWriteFinish: {
        stabilityThreshold: options.stabilityThreshold,
        pollInterval: options.pollInterval
      }
    });
    
    // Add event handlers with registry updates
    watcher
      .on('add', (path: string) => {
        console.log(`File added: ${path}`);
        processFile(path, componentMetadataExtractor, componentRegistryDB);
      })
      .on('change', (path: string) => {
        console.log(`File changed: ${path}`);
        processFile(path, componentMetadataExtractor, componentRegistryDB);
      })
      .on('unlink', (path: string) => {
        console.log(`File removed: ${path}`);
        if (componentRegistryDB) {
          componentRegistryDB.removeComponent(path);
        }
      });
    
    return {
      success: true,
      message: 'File watcher started successfully'
    };
  } catch (error) {
    console.error('Error starting file watcher:', error);
    return {
      success: false, 
      message: `Error starting file watcher: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Process a single file by extracting metadata and updating the registry
 */
async function processFile(filePath: string, metadataExtractor: any, registryDB: any) {
  try {
    // Extract metadata from the file
    if (metadataExtractor) {
      const metadata = await metadataExtractor.extractFromFile(filePath);
      
      if (metadata && registryDB) {
        // Update the registry
        registryDB.upsertComponent(metadata);
        console.log(`Updated component in registry: ${filePath}`);
      }
    }
  } catch (error) {
    console.error(`Error processing component file ${filePath}:`, error);
  }
}

/**
 * Get static icon registry data
 * This implements the Single Source of Truth pattern for icon registry data
 * by providing consolidated access to all category-specific registry files
 */
export async function getIconRegistry() {
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    // Array of all category-specific registry files
    const registryFiles = [
      'app-icon-registry.json',
      'brands-icon-registry.json',
      'kpis-icon-registry.json',
      'light-icon-registry.json',
      'solid-icon-registry.json'
    ];
    
    // Load and consolidate all registry files
    const allIcons = [];
    const loadErrors = [];
    
    for (const filename of registryFiles) {
      try {
        const filePath = path.join(process.cwd(), 'public/static', filename);
        const fileData = await fs.readFile(filePath, 'utf8');
        const registry = JSON.parse(fileData);
        
        if (registry && Array.isArray(registry.icons)) {
          allIcons.push(...registry.icons);
        }
      } catch (fileError: unknown) {
        loadErrors.push(`Error loading ${filename}: ${fileError instanceof Error ? fileError.message : String(fileError)}`);
      }
    }
    
    // If we couldn't load any registry files, try the legacy approach
    if (allIcons.length === 0 && loadErrors.length > 0) {
      const legacyPath = path.join(process.cwd(), 'public/static/icon-registry.json');
      const legacyData = await fs.readFile(legacyPath, 'utf8');
      const legacyRegistry = JSON.parse(legacyData);
      
      if (legacyRegistry && Array.isArray(legacyRegistry.icons)) {
        allIcons.push(...legacyRegistry.icons);
      }
    }
    
    // Create consolidated registry
    const consolidatedRegistry = {
      icons: allIcons,
      version: '1.0.0',
      updatedAt: new Date().toISOString(),
      generatedAt: new Date().toISOString()
    };
    
    return {
      success: true,
      message: `Successfully loaded ${allIcons.length} icons from ${registryFiles.length} registry files`,
      data: consolidatedRegistry,
      loadErrors: loadErrors.length > 0 ? loadErrors : null
    };
  } catch (error) {
    console.error('Error loading icon registry:', error);
    return {
      success: false,
      message: `Error loading icon registry: ${error instanceof Error ? error.message : String(error)}`,
      data: null
    };
  }
}

/**
 * Get component registry data 
 * This ensures we're using component-registry.json as the SSOT
 */
export async function getComponentRegistry() {
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    // Use component-registry.json as the SSOT
    const componentRegistryPath = path.join(process.cwd(), 'public/static/component-registry.json');
    const componentData = await fs.readFile(componentRegistryPath, 'utf8');
    const componentRegistry = JSON.parse(componentData);
    
    return {
      success: true,
      message: `Successfully loaded ${componentRegistry.components.length} components from component-registry.json`,
      data: componentRegistry
    };
  } catch (error) {
    console.error('Error loading component registry:', error);
    return {
      success: false,
      message: `Error loading component registry: ${error instanceof Error ? error.message : String(error)}`,
      data: null
    };
  }
} 