/**
 * Component Registry Webpack Plugin
 * 
 * This plugin scans the codebase for UI components during build time,
 * extracts metadata, and generates a static JSON file that can be 
 * included in the bundle for immediate component access in all environments.
 * 
 * Features:
 * - Generates component registry during webpack compilation
 * - Supports incremental updates during development
 * - File watching capabilities for real-time updates
 * - Caching for performance optimization
 * - Production optimizations like minification and versioning
 */

const path = require('path');
const fs = require('fs');
const glob = require('glob');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const t = require('@babel/types');
const crypto = require('crypto');
const chokidar = require('chokidar');

/**
 * ComponentRegistryPlugin
 * 
 * Webpack plugin that generates a static component registry during build time.
 * Uses AST parsing to extract component metadata from React/TypeScript files.
 */
class ComponentRegistryPlugin {
  constructor(options = {}) {
    this.options = {
      componentPaths: ['./src/components/ui'],
      outputPath: './public/static/component-registry.json',
      includePatterns: ['**/*.tsx', '**/*.jsx'],
      excludePatterns: ['**/*.test.*', '**/*.spec.*', '**/node_modules/**'],
      maxParallelScans: 5,
      incremental: false,     // Enable incremental builds (dev only)
      watch: false,           // Enable file watching (dev only)
      cache: true,            // Enable caching for better performance
      cacheFile: '.component-registry-cache.json',
      logLevel: 'info',       // 'verbose', 'info', 'warn', 'error'
      minify: false,          // Minify output (prod only)
      buildId: undefined,     // Versioning for production
      ...options
    };
    
    this.cacheData = null;
    this.watcher = null;
    this.isWatching = false;
    this.registryData = null;
    this.pendingUpdates = new Set();
    this.updateTimeout = null;
    this.logger = this.createLogger(this.options.logLevel);
  }

  /**
   * Create a simple logger with the specified level
   * @param {string} level - Log level ('verbose', 'info', 'warn', 'error')
   * @returns {Object} Logger object
   */
  createLogger(level) {
    const levels = { verbose: 0, info: 1, warn: 2, error: 3 };
    const currentLevel = levels[level] || 1;
    
    return {
      verbose: (...args) => currentLevel <= 0 && console.log('[ComponentRegistry]', ...args),
      info: (...args) => currentLevel <= 1 && console.log('[ComponentRegistry]', ...args),
      warn: (...args) => currentLevel <= 2 && console.warn('[ComponentRegistry]', ...args),
      error: (...args) => currentLevel <= 3 && console.error('[ComponentRegistry]', ...args),
    };
  }

  apply(compiler) {
    // Store compiler reference safely
    this.compiler = compiler;
    
    // Load cache on initialization
    if (this.options.cache) {
      this.loadCache();
    }
    
    // Handle environment specific setup
    if (compiler.options.mode === 'development') {
      this.setupDevelopmentMode(compiler);
    } else {
      this.setupProductionMode(compiler);
    }
    
    // Cleanup on done (for production builds)
    compiler.hooks.done.tap('ComponentRegistryPlugin', stats => {
      // Save any pending changes
      if (this.pendingUpdates.size > 0) {
        this.processUpdates([...this.pendingUpdates]);
        this.pendingUpdates.clear();
      }
      
      // Save cache before finishing
      if (this.options.cache && !this.isWatching) {
        this.saveCache();
      }
      
      // Show stats
      if (this.registryData) {
        this.logger.info(`Registry complete: ${this.registryData.components.length} components`);
      }
    });
    
    // Cleanup on shutdown
    compiler.hooks.shutdown.tap('ComponentRegistryPlugin', () => {
      this.cleanup();
    });
  }
  
  /**
   * Setup for development mode with HMR support
   * @param {Object} compiler - Webpack compiler
   */
  setupDevelopmentMode(compiler) {
    // Use more modern hooks with proper error handling
    compiler.hooks.beforeCompile.tapAsync(
      'ComponentRegistryPlugin',
      (compilation, callback) => {
        this.logger.info('Starting component scan...');
        
        // For the initial build, generate a complete registry
        this.generateComponentRegistry()
          .then(() => {
            // If watching is enabled and we're not already watching, start the watcher
            if (this.options.watch && !this.isWatching) {
              this.startWatcher(compiler);
            }
            callback();
          })
          .catch(err => {
            this.logger.error('Error during component scan:', err);
            // Still call callback to prevent build from hanging
            callback(err);
          });
      }
    );
    
    // Use the more modern hooks for emitting assets
    compiler.hooks.compilation.tap('ComponentRegistryPlugin', (compilation) => {
      // Make sure we're using the right stage for asset processing
      // PROCESS_ASSETS_STAGE_ADDITIONAL is for adding new assets
      const stage = compilation.constructor.PROCESS_ASSETS_STAGE_ADDITIONAL 
        || compilation.PROCESS_ASSETS_STAGE_ADDITIONAL 
        || /* Webpack 4 fallback */ { name: 'PROCESS_ASSETS_STAGE_ADDITIONAL', stage: 100 };
      
      compilation.hooks.processAssets.tapAsync(
        {
          name: 'ComponentRegistryPlugin',
          stage: stage.stage || stage
        },
        (assets, callback) => {
          try {
            if (this.registryData) {
              const jsonContent = this.getRegistryJSON();
              // Ensure the path is normalized correctly
              const outputPath = this.options.outputPath.replace(/^\.\/public\//, '');
              
              // Use a source object compatible with both Webpack 4 and 5
              compilation.emitAsset(outputPath, {
                source: () => Buffer.from(jsonContent, 'utf8'),
                size: () => jsonContent.length
              });
              this.logger.info(`Emitted registry to ${outputPath} with ${this.registryData.components.length} components`);
            } else {
              this.logger.warn('No registry data available to emit');
            }
            callback();
          } catch (error) {
            this.logger.error('Error emitting registry asset:', error);
            callback();
          }
        }
      );
      
      // Add diagnostics asset in development mode
      compilation.hooks.processAssets.tapAsync(
        {
          name: 'ComponentRegistryDiagnostics',
          stage: stage.stage || stage
        },
        (assets, callback) => {
          try {
            if (this.registryData) {
              const diagnostics = {
                timestamp: new Date().toISOString(),
                componentCount: this.registryData.components.length,
                scanDuration: this.registryData.scanDuration,
                cacheHits: this.registryData.cacheHits || 0,
                warnings: this.registryData.warnings || []
              };
              
              const diagnosticsPath = 'static/component-registry-diagnostics.json';
              const jsonContent = JSON.stringify(diagnostics, null, 2);
              
              compilation.emitAsset(diagnosticsPath, {
                source: () => Buffer.from(jsonContent, 'utf8'),
                size: () => jsonContent.length
              });
            }
            callback();
          } catch (error) {
            this.logger.error('Error emitting diagnostics:', error);
            callback();
          }
        }
      );
    });
  }
  
  /**
   * Setup for production mode (full builds)
   * @param {Object} compiler - Webpack compiler
   */
  setupProductionMode(compiler) {
    // Use hooks with proper error handling for production
    compiler.hooks.beforeCompile.tapAsync(
      'ComponentRegistryPlugin',
      (compilation, callback) => {
        this.logger.info('Starting production component scan...');
        
        const startTime = Date.now();
        
        this.generateComponentRegistry()
          .then(() => {
            const duration = Date.now() - startTime;
            this.logger.info(`Production component scan completed in ${duration}ms`);
            
            // Add build information to registry for production
            if (this.registryData) {
              this.registryData.buildId = this.options.buildId || this.generateBuildId();
              this.registryData.buildTime = new Date().toISOString();
              this.registryData.environment = 'production';
            }
            
            callback();
          })
          .catch(err => {
            this.logger.error('Error during production component scan:', err);
            
            // Create a fallback registry in case of error to prevent build failures
            if (!this.registryData) {
              this.registryData = {
                components: [],
                generatedAt: new Date().toISOString(),
                buildId: this.options.buildId || this.generateBuildId(),
                buildTime: new Date().toISOString(),
                environment: 'production',
                error: err.message || 'Unknown error during component scan'
              };
              this.logger.warn('Using fallback empty registry due to scan error');
            }
            
            // Still call callback to continue the build with a fallback registry
            callback();
          });
      }
    );
    
    // Use the same asset emission logic but with production optimizations
    compiler.hooks.compilation.tap('ComponentRegistryPlugin', (compilation) => {
      const stage = compilation.constructor.PROCESS_ASSETS_STAGE_ADDITIONAL 
        || compilation.PROCESS_ASSETS_STAGE_ADDITIONAL 
        || /* Webpack 4 fallback */ { name: 'PROCESS_ASSETS_STAGE_ADDITIONAL', stage: 100 };
      
      compilation.hooks.processAssets.tapAsync(
        {
          name: 'ComponentRegistryPlugin',
          stage: stage.stage || stage
        },
        (assets, callback) => {
          try {
            if (this.registryData) {
              // For production, we may want to minify the JSON
              const jsonContent = this.options.minify 
                ? JSON.stringify(this.registryData)
                : this.getRegistryJSON();
                
              // Ensure the path is normalized correctly
              const outputPath = this.options.outputPath.replace(/^\.\/public\//, '');
              
              // Emit optimized asset
              compilation.emitAsset(outputPath, {
                source: () => Buffer.from(jsonContent, 'utf8'),
                size: () => jsonContent.length
              });
              
              // Also emit a backup copy for resilience
              const backupPath = outputPath.replace('.json', '.backup.json');
              compilation.emitAsset(backupPath, {
                source: () => Buffer.from(jsonContent, 'utf8'),
                size: () => jsonContent.length
              });
              
              this.logger.info(`Emitted production registry to ${outputPath} with ${this.registryData.components.length} components`);
            } else {
              this.logger.warn('No registry data available to emit for production');
            }
            callback();
          } catch (error) {
            this.logger.error('Error emitting production registry asset:', error);
            callback();
          }
        }
      );
    });
  }

  /**
   * Load cache data from disk
   */
  loadCache() {
    try {
      const cacheFilePath = path.resolve(this.options.cacheFile);
      if (fs.existsSync(cacheFilePath)) {
        const cacheContent = fs.readFileSync(cacheFilePath, 'utf-8');
        this.cacheData = JSON.parse(cacheContent);
        this.logger.verbose(`Loaded cache with ${Object.keys(this.cacheData.files || {}).length} entries`);
      } else {
        this.cacheData = { files: {}, meta: { lastUpdate: new Date().toISOString() } };
      }
    } catch (err) {
      this.logger.warn('Failed to load cache:', err.message);
      this.cacheData = { files: {}, meta: { lastUpdate: new Date().toISOString() } };
    }
  }
  
  /**
   * Save cache data to disk
   */
  saveCache() {
    try {
      if (!this.cacheData) return;
      
      const cacheFilePath = path.resolve(this.options.cacheFile);
      this.cacheData.meta.lastUpdate = new Date().toISOString();
      
      fs.writeFileSync(
        cacheFilePath,
        JSON.stringify(this.cacheData, null, 2)
      );
      this.logger.verbose(`Saved cache with ${Object.keys(this.cacheData.files || {}).length} entries`);
    } catch (err) {
      this.logger.warn('Failed to save cache:', err.message);
    }
  }
  
  /**
   * Start watching for file changes
   * @param {Object} compiler - Webpack compiler instance
   */
  startWatcher(compiler) {
    if (this.isWatching) return;
    
    this.isWatching = true;
    const watchPaths = this.options.componentPaths.map(p => path.resolve(p));
    
    // Create a file watcher using chokidar
    this.watcher = chokidar.watch(watchPaths, {
      ignored: this.options.excludePatterns,
      ignoreInitial: true,
      persistent: true
    });
    
    // Handle file changes
    this.watcher
      .on('add', this.handleFileChange.bind(this))
      .on('change', this.handleFileChange.bind(this))
      .on('unlink', this.handleFileRemove.bind(this));
    
    this.logger.info(`Watching for component changes in: ${watchPaths.join(', ')}`);
    
    // Cleanup watcher when webpack is done
    compiler.hooks.watchClose.tap('ComponentRegistryPlugin', () => {
      this.cleanup();
    });
  }
  
  /**
   * Handle file change or addition
   * @param {string} filePath - Path of the changed file
   */
  handleFileChange(filePath) {
    const ext = path.extname(filePath);
    if (!['.tsx', '.jsx', '.js'].includes(ext)) return;
    
    this.logger.verbose(`File changed: ${filePath}`);
    this.pendingUpdates.add(filePath);
    
    // Debounce updates to avoid frequent rebuilds
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }
    
    this.updateTimeout = setTimeout(() => {
      if (this.pendingUpdates.size > 0) {
        this.processUpdates([...this.pendingUpdates]);
        this.pendingUpdates.clear();
      }
    }, 300);
  }
  
  /**
   * Handle file removal
   * @param {string} filePath - Path of the removed file
   */
  handleFileRemove(filePath) {
    if (!this.registryData) return;
    
    const relativePath = path.relative(process.cwd(), filePath).replace(/\\/g, '/');
    let updated = false;
    
    // Remove any components from this file
    this.registryData.components = this.registryData.components.filter(comp => {
      if (comp.path === relativePath) {
        updated = true;
        return false;
      }
      return true;
    });
    
    // Also remove from cache
    if (this.cacheData && this.cacheData.files) {
      delete this.cacheData.files[relativePath];
    }
    
    if (updated) {
      this.logger.info(`Removed components from: ${relativePath}`);
      this.writeRegistryFile();
    }
  }
  
  /**
   * Process a batch of file updates incrementally
   * @param {string[]} filePaths - Array of file paths to update
   */
  async processUpdates(filePaths) {
    if (!this.registryData) {
      // If we don't have registry data yet, do a full scan
      await this.generateComponentRegistry();
      return;
    }
    
    this.logger.verbose(`Processing updates for ${filePaths.length} files...`);

    // Extract components from each updated file
    const updatedComponents = [];
    const processedPaths = new Set();
    
    for (const filePath of filePaths) {
      const relativePath = path.relative(process.cwd(), filePath).replace(/\\/g, '/');
      processedPaths.add(relativePath);
      
      try {
        const components = await this.extractComponentMetadata(filePath);
        if (components) {
          updatedComponents.push(...components);
          
          // Update cache
          if (this.options.cache && this.cacheData) {
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            const contentHash = this.hashFileContent(fileContent);
            this.cacheData.files[relativePath] = { 
              hash: contentHash, 
              components: components.map(c => c.name),
              lastUpdated: new Date().toISOString()
            };
          }
        }
      } catch (err) {
        this.logger.error(`Error processing ${filePath}:`, err.message);
      }
    }
    
    // Remove old components for these paths
    this.registryData.components = this.registryData.components.filter(comp => {
      return !processedPaths.has(comp.path);
    });
    
    // Add updated components
    this.registryData.components.push(...updatedComponents);
    this.registryData.updatedAt = new Date().toISOString();
    
    this.logger.info(`Updated ${updatedComponents.length} components from ${filePaths.length} files`);

    // Write the updated registry
    this.writeRegistryFile();
    
    // Save cache after significant changes
    if (this.options.cache && updatedComponents.length > 0) {
      this.saveCache();
    }
  }
  
  /**
   * Write the registry to the output file
   */
  writeRegistryFile() {
    try {
      const outputPath = path.resolve(this.options.outputPath);
      const outputDir = path.dirname(outputPath);
      
      // Don't overwrite with empty or smaller registry
      if (!this.registryData || !this.registryData.components || this.registryData.components.length === 0) {
        // Check if an existing registry exists with components
        if (fs.existsSync(outputPath)) {
          try {
            const existingContent = fs.readFileSync(outputPath, 'utf-8');
            const existingRegistry = JSON.parse(existingContent);
            
            if (existingRegistry && 
                existingRegistry.components && 
                Array.isArray(existingRegistry.components) && 
                existingRegistry.components.length > 0) {
              
              this.logger.info(`Existing registry has ${existingRegistry.components.length} components. Preserving it.`);
              this.registryData = existingRegistry;
              return;
            }
          } catch (error) {
            this.logger.warn(`Error reading existing registry: ${error.message}. Will create new one.`);
          }
        }
        
        this.logger.warn('No components found, not writing empty registry');
        return;
      }
      
      // NEW: Check if existing registry has more components than what we just found
      if (fs.existsSync(outputPath)) {
        try {
          const existingContent = fs.readFileSync(outputPath, 'utf-8');
          const existingRegistry = JSON.parse(existingContent);
          
          if (existingRegistry && 
              existingRegistry.components && 
              Array.isArray(existingRegistry.components) && 
              existingRegistry.components.length > this.registryData.components.length) {
            
            this.logger.warn(`New registry has only ${this.registryData.components.length} components, but existing registry has ${existingRegistry.components.length}. Preserving existing registry.`);
            
            // Copy existing components and merge with metadata from the new registry
            const mergedRegistry = {
              ...this.registryData,
              components: existingRegistry.components,
              _preservedFromNewer: true,
              _originalComponentCount: this.registryData.components.length
            };
            
            this.registryData = mergedRegistry;
            this.logger.info(`Preserved ${existingRegistry.components.length} components from existing registry`);
          }
        } catch (error) {
          this.logger.warn(`Error comparing existing registry: ${error.message}. Proceeding with new registry.`);
        }
      }
      
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      // Create a backup before writing
      if (fs.existsSync(outputPath)) {
        const backupPath = outputPath.replace('.json', '.backup.json');
        fs.copyFileSync(outputPath, backupPath);
        this.logger.info(`Created backup at ${backupPath}`);
      }
      
      fs.writeFileSync(outputPath, this.getRegistryJSON());
      this.logger.info(`Updated registry with ${this.registryData.components.length} components written to ${outputPath}`);
    } catch (err) {
      this.logger.error('Failed to write registry file:', err.message);
    }
  }
  
  /**
   * Get the JSON content of the registry
   * @returns {string} JSON string of the registry
   */
  getRegistryJSON() {
    if (!this.registryData) return '{}';
    
    const registryData = {
      ...this.registryData,
      updatedAt: new Date().toISOString()
    };
    
    // Add build ID for versioning in production
    if (this.options.buildId) {
      registryData.buildId = this.options.buildId;
    }
    
    // Either minify or pretty print based on options
    return this.options.minify 
      ? JSON.stringify(registryData)
      : JSON.stringify(registryData, null, 2);
  }
  
  /**
   * Hash file content for cache invalidation
   * @param {string} content - File content
   * @returns {string} Content hash
   */
  hashFileContent(content) {
    return crypto.createHash('md5').update(content).digest('hex');
  }
  
  /**
   * Clean up resources (watchers, timeouts)
   */
  cleanup() {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
    
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
      this.updateTimeout = null;
    }
    
    this.isWatching = false;
    
    // Final cache save
    if (this.options.cache) {
      this.saveCache();
    }
  }

  /**
   * Scan directories for component files and generate registry JSON
   * @returns {Promise<void>}
   */
  async generateComponentRegistry() {
    try {
      // Track scan time for diagnostics
      const startTime = Date.now();
      
      // Find all component files
      const componentFiles = await this.findComponentFiles();
      this.logger.info(`Found ${componentFiles.length} potential component files to analyze`);

      // Initialize metrics
      let extractedComponents = 0;
      let successfulFiles = 0;
      let failedFiles = 0;
      let cacheHits = 0;
      const warnings = [];
      
      // Process files for new components
      const components = [];
      
      // Process files in reasonable batches to avoid blocking the event loop
      const batchSize = this.options.maxParallelScans || 10;
      let currentBatch = 0;
      const totalBatches = Math.ceil(componentFiles.length / batchSize);
      
      while (currentBatch < totalBatches) {
        const batchStart = currentBatch * batchSize;
        const batchEnd = Math.min(batchStart + batchSize, componentFiles.length);
        const batchFiles = componentFiles.slice(batchStart, batchEnd);
        
        this.logger.verbose(`Processing batch ${currentBatch + 1}/${totalBatches} (${batchFiles.length} files)`);
        
        // Process all files in the current batch
        const batchResults = await Promise.all(
          batchFiles.map(async file => {
            try {
              // Check cache first if enabled
              if (this.options.cache && this.cacheData && this.cacheData.files) {
                const relativePath = path.relative(process.cwd(), file).replace(/\\/g, '/');
                const fileStats = fs.statSync(file);
                const fileHash = this.hashFileContent(await fs.promises.readFile(file, 'utf-8'));
                
                // Check if file is in cache and hash matches
                if (this.cacheData.files[relativePath] && 
                    this.cacheData.files[relativePath].hash === fileHash) {
                  
                  const cachedComponents = this.cacheData.files[relativePath].components;
                  if (cachedComponents && cachedComponents.length > 0) {
                    cacheHits++;
                    this.logger.verbose(`Cache hit for ${relativePath} (${cachedComponents.length} components)`);
                    return { file, components: cachedComponents, cached: true };
                  }
                }
              }
              
              // Process the file to extract components
              const fileComponents = await this.extractComponentMetadata(file);
              
              // Skip files with no extracted components
              if (!fileComponents || fileComponents.length === 0) {
                this.logger.verbose(`No components found in ${file}`);
                return { file, components: [], cached: false };
              }
              
              // Update cache
              if (this.options.cache && this.cacheData && this.cacheData.files) {
                const relativePath = path.relative(process.cwd(), file).replace(/\\/g, '/');
                const fileHash = this.hashFileContent(await fs.promises.readFile(file, 'utf-8'));
                
                this.cacheData.files[relativePath] = {
                  hash: fileHash,
                  lastModified: new Date().toISOString(),
                  components: fileComponents
                };
              }
              
              successfulFiles++;
              extractedComponents += fileComponents.length;
              
              return { file, components: fileComponents, cached: false };
            } catch (error) {
              failedFiles++;
              warnings.push(`Error processing ${file}: ${error.message}`);
              this.logger.error(`Failed to process file ${file}:`, error);
              return { file, components: [], error: error.message, cached: false };
            }
          })
        );
        
        // Collect all components from the batch
        for (const result of batchResults) {
          if (result.components && result.components.length > 0) {
            components.push(...result.components);
          }
        }
        
        currentBatch++;
      }
      
      // Ensure unique components (in case of duplicates)
      const uniqueComponents = [];
      const componentMap = new Map();
      
      for (const component of components) {
        const key = `${component.name}:${component.path}`;
        if (!componentMap.has(key)) {
          componentMap.set(key, component);
          uniqueComponents.push(component);
        }
      }
      
      this.logger.info(`Extracted metadata for ${uniqueComponents.length} components (${extractedComponents} total, ${failedFiles} failures, ${cacheHits} cache hits)`);

      // Calculate scan duration for diagnostics
      const scanDuration = Date.now() - startTime;
      
      // Store registry data
      this.registryData = { 
        components: uniqueComponents,
        generatedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: '1.0.0',
        // Diagnostic information
        scanDuration,
        cacheHits,
        successfulFiles,
        failedFiles,
        warnings: warnings.slice(0, 10), // Limit to avoid huge registry files
        metadata: {
          totalFiles: componentFiles.length,
          extractedComponents,
          uniqueComponents: uniqueComponents.length,
          environment: process.env.NODE_ENV || 'unknown'
        }
      };
      
      // Generate registry file
      this.writeRegistryFile();
      
      return Promise.resolve();
    } catch (error) {
      this.logger.error('Failed to generate component registry:', error);
      
      // Create a fallback registry even when failing
      this.logger.warn('Creating fallback empty registry due to error');
      this.registryData = {
        components: [],
        generatedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: '1.0.0',
        error: error.message,
        environment: process.env.NODE_ENV || 'unknown'
      };
      
      // Try to write fallback registry
      try {
        this.writeRegistryFile();
      } catch (writeError) {
        this.logger.error('Failed to write fallback registry:', writeError);
      }
      
      return Promise.reject(error);
    }
  }

  /**
   * Find all component files in the specified directories
   * @returns {Promise<string[]>} List of file paths
   */
  async findComponentFiles() {
    const allFiles = [];
    
    for (const componentPath of this.options.componentPaths) {
      const basePath = path.resolve(componentPath);
      
      // Skip if directory doesn't exist
      if (!fs.existsSync(basePath)) {
        this.logger.warn(`Directory not found: ${basePath}`);
        continue;
      }
      
      for (const pattern of this.options.includePatterns) {
        const globPattern = path.join(basePath, pattern);
        const files = glob.sync(globPattern, { 
          ignore: this.options.excludePatterns.map(p => path.join(basePath, p)),
          nodir: true
        });
        
        allFiles.push(...files);
      }
    }
    
    // Remove duplicates
    return [...new Set(allFiles)];
  }

  /**
   * Process component files to extract metadata with optional caching
   * @param {string[]} files List of file paths to process
   * @returns {Promise<Object[]>} Component metadata objects
   */
  async processComponentFiles(files) {
    const components = [];
    const batchSize = this.options.maxParallelScans;
    
    // Process files in batches to avoid excessive memory usage
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      
      // Process each file in the batch
      const batchResults = await Promise.all(
        batch.map(async (file) => {
          const relativePath = path.relative(process.cwd(), file).replace(/\\/g, '/');
          
          // Use cache if available and enabled
          if (this.options.cache && this.cacheData && this.cacheData.files) {
            const fileContent = fs.readFileSync(file, 'utf-8');
            const contentHash = this.hashFileContent(fileContent);
            
            // Check if we have valid cache for this file
            if (this.cacheData.files[relativePath] && 
                this.cacheData.files[relativePath].hash === contentHash) {
              this.logger.verbose(`Using cached results for: ${relativePath}`);
              // Skip processing and return null, we'll add cached components later
              return null;
            }
            
            // Update cache with new hash
            const components = await this.extractComponentMetadata(file);
            if (components) {
              this.cacheData.files[relativePath] = { 
                hash: contentHash, 
                components: components.map(c => c.name),
                lastUpdated: new Date().toISOString()
              };
            }
            return components;
          }
          
          // No cache, process normally
          return this.extractComponentMetadata(file);
        })
      );
      
      // Filter out null results and flatten the array
      components.push(...batchResults.filter(Boolean).flat());
    }
    
    return components;
  }

  /**
   * Extract component metadata from a single file using AST parsing
   * @param {string} filePath Path to the component file
   * @returns {Promise<Object[]|null>} Component metadata or null if no components found
   */
  async extractComponentMetadata(filePath) {
    // Create a safe local reference to logger
    const logger = this.logger || {
      warn: (...args) => console.warn('[ComponentRegistry]', ...args),
      error: (...args) => console.error('[ComponentRegistry]', ...args),
      info: (...args) => console.log('[ComponentRegistry]', ...args),
      verbose: (...args) => console.log('[ComponentRegistry]', ...args)
    };
    
    try {
      const relativeFilePath = path.relative(process.cwd(), filePath).replace(/\\/g, '/');
      
      // Skip files in node_modules and test files
      if (relativeFilePath.includes('node_modules') || 
          relativeFilePath.includes('.test.') || 
          relativeFilePath.includes('.spec.')) {
        logger.verbose(`Skipping file: ${relativeFilePath} (excluded pattern)`);
        return null;
      }
      
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const components = [];
      
      // Skip empty files
      if (!fileContent.trim()) {
        logger.verbose(`Skipping empty file: ${relativeFilePath}`);
        return null;
      }
      
      // Enhanced logging for debugging the AST parsing
      logger.verbose(`Processing file: ${relativeFilePath} (${fileContent.length} bytes)`);
      
      // IMPROVED: Add better error handling for AST parsing
      let ast;
      try {
        // First try with full plugin options
        ast = parser.parse(fileContent, {
          sourceType: 'module',
          plugins: ['jsx', 'typescript', 'classProperties', 'decorators-legacy', 'objectRestSpread']
        });
      } catch (parserError1) {
        try {
          // Fallback to simpler configuration
          logger.verbose(`First parsing attempt failed, trying fallback parser config: ${parserError1.message}`);
          ast = parser.parse(fileContent, {
            sourceType: 'module',
            plugins: ['jsx', 'typescript']
          });
        } catch (parserError2) {
          try {
            logger.verbose(`Second parsing attempt failed, trying minimal parser config: ${parserError2.message}`);
            ast = parser.parse(fileContent, {
              sourceType: 'module'
            });
          } catch (parserError3) {
            // Give up on AST parsing and fall back to filename-based component detection
            logger.warn(`Failed to parse ${relativeFilePath} with multiple configurations: ${parserError3.message}`);
            
            // Use fallback detection based on filename and file type
            return this.extractComponentsByFilename(relativeFilePath, fileContent);
          }
        }
      }
      
      logger.verbose(`AST parsing successful for: ${relativeFilePath}`);
      
      // Extract category from path (atoms, molecules, organisms)
      let category = 'unknown';
      if (relativeFilePath.includes('/atoms/')) {
        category = 'atom';
      } else if (relativeFilePath.includes('/molecules/')) {
        category = 'molecule';
      } else if (relativeFilePath.includes('/organisms/')) {
        category = 'organism';
      }
      
      // More lenient component detection
      // Check for potential component indicators in the file content
      const isPotentialComponent = 
        relativeFilePath.endsWith('.tsx') ||
        relativeFilePath.endsWith('.jsx') ||
        fileContent.includes('React') ||
        fileContent.includes('react') ||
        fileContent.includes('import {') ||
        fileContent.includes('export ') ||
        fileContent.includes('function ') ||
        fileContent.includes('class ');
      
      if (!isPotentialComponent) {
        logger.verbose(`Skipping non-component file: ${relativeFilePath}`);
        return null;
      }
      
      // Component definition flags
      let hasExportedComponents = false;
      
      // Create a context object to pass through AST traversal
      const traversalContext = {
        filePath: relativeFilePath,
        logger,
        category,
        components,
        thisRef: this // Keep reference to 'this' for method calls
      };
      
      // IMPROVED: Wrap traverse in try/catch to handle any traversal errors
      try {
        // Traverse the AST to find React components
        traverse(ast, {
          // Export declarations
          ExportNamedDeclaration(path) {
            // Handle function or class component exports
            if (path.node.declaration) {
              if (t.isFunctionDeclaration(path.node.declaration) || 
                  t.isArrowFunctionExpression(path.node.declaration) ||
                  t.isClassDeclaration(path.node.declaration)) {
                
                // Get the component name
                let name = '';
                
                // For function declarations, get name from id
                if (t.isFunctionDeclaration(path.node.declaration) && path.node.declaration.id) {
                  name = path.node.declaration.id.name;
                } 
                // For arrow functions assigned to variables, get name from variable
                else if (t.isVariableDeclaration(path.node.declaration)) {
                  const declarations = path.node.declaration.declarations;
                  if (declarations && declarations.length > 0 && declarations[0].id) {
                    if (t.isIdentifier(declarations[0].id)) {
                      name = declarations[0].id.name;
                    }
                  }
                }
                // For class declarations, get name from id
                else if (t.isClassDeclaration(path.node.declaration) && path.node.declaration.id) {
                  name = path.node.declaration.id.name;
                }
                
                // Skip if not likely a component or couldn't determine name
                if (!name) {
                  logger.verbose(`Couldn't determine name for component in ${relativeFilePath}`);
                  // IMPROVED: Use safe path operations
                  const fileBaseName = path.basename ? 
                    path.basename(relativeFilePath, path.extname(relativeFilePath)) : 
                    relativeFilePath.split('/').pop().split('.')[0];
                    
                  if (/^[A-Z]/.test(fileBaseName)) {
                    // Use filename as fallback if it's PascalCase
                    name = fileBaseName;
                    logger.verbose(`Using filename as component name: ${name}`);
                  } else {
                    return;
                  }
                }
                
                // Skip if not likely a component (must be PascalCase)
                if (!name || !/^[A-Z]/.test(name)) {
                  logger.verbose(`Skipping non-component export: ${name} (not PascalCase)`);
                  return;
                }
                
                // It's a component!
                hasExportedComponents = true;
                logger.verbose(`Found component: ${name} in ${relativeFilePath}`);
                
                // Extract JSDoc comments for description
                let description = '';
                const comments = path.node.leadingComments || [];
                if (comments.length > 0) {
                  description = comments
                    .map(comment => comment.value.trim().replace(/^\*+/gm, '').trim())
                    .join('\n');
                }
                
                // Extract props from TypeScript type annotations
                const props = [];
                try {
                  if (t.isFunctionDeclaration(path.node.declaration)) {
                    // For function components, look at parameters
                    const params = path.node.declaration.params;
                    if (params && params.length > 0 && params[0] && params[0].typeAnnotation) {
                      // Props object
                      traversalContext.thisRef.extractPropsFromTypeAnnotation.call(traversalContext.thisRef, params[0].typeAnnotation, props);
                    }
                  } else if (t.isClassDeclaration(path.node.declaration)) {
                    // For class components, look for propTypes or prop declarations
                    traversalContext.thisRef.extractPropsFromClass.call(traversalContext.thisRef, path.node.declaration, props);
                  }
                } catch (error) {
                  traversalContext.logger.warn(`TypeScript extraction warning for ${relativeFilePath}: ${error.message}`);
                  // Continue with empty props array rather than failing
                }
                
                components.push({
                  path: relativeFilePath,
                  name,
                  category,
                  lastUpdated: new Date().toISOString(),
                  exports: [name],
                  props,
                  description: description || `UI ${name} component`
                });
              }
            } else if (path.node.specifiers) {
              // Handle re-exports: export { Component } from './Component'
              path.node.specifiers.forEach(specifier => {
                if (t.isExportSpecifier(specifier) && specifier.exported) {
                  const name = specifier.exported.name;
                  
                  // Skip if not likely a component (must be PascalCase)
                  if (!name || !/^[A-Z]/.test(name)) {
                    logger.verbose(`Skipping non-component re-export: ${name} (not PascalCase)`);
                    return;
                  }
                  
                  hasExportedComponents = true;
                  logger.verbose(`Found re-exported component: ${name} in ${relativeFilePath}`);
                  
                  components.push({
                    path: relativeFilePath,
                    name,
                    category,
                    lastUpdated: new Date().toISOString(),
                    exports: [name],
                    props: [], // Cannot determine props for re-exports without following the import
                    description: `UI ${name} component`
                  });
                }
              });
            }
          },
          
          // Default exports
          ExportDefaultDeclaration(path) {
            let name = '';
            
            // Handle different types of default exports
            if (t.isFunctionDeclaration(path.node.declaration) && path.node.declaration.id) {
              name = path.node.declaration.id.name;
            } else if (t.isClassDeclaration(path.node.declaration) && path.node.declaration.id) {
              name = path.node.declaration.id.name;
            } else if (t.isIdentifier(path.node.declaration)) {
              name = path.node.declaration.name;
            } else if (t.isArrowFunctionExpression(path.node.declaration)) {
              // Handle anonymous arrow functions: export default () => {}
              // Use filename as component name
              // IMPROVED: Use safe path operations
              const fileBaseName = path.basename ? 
                path.basename(relativeFilePath, path.extname(relativeFilePath)) : 
                relativeFilePath.split('/').pop().split('.')[0];
                
              if (/^[A-Z]/.test(fileBaseName)) {
                name = fileBaseName;
                logger.verbose(`Using filename for anonymous default export: ${name}`);
              }
            }
            
            // Skip if not likely a component or couldn't determine name
            if (!name) {
              // Try to use filename as fallback if it's PascalCase
              // IMPROVED: Use safe path operations
              const fileBaseName = path.basename ? 
                path.basename(relativeFilePath, path.extname(relativeFilePath)) : 
                relativeFilePath.split('/').pop().split('.')[0];
                
              if (/^[A-Z]/.test(fileBaseName)) {
                name = fileBaseName;
                logger.verbose(`Using filename for default export: ${name}`);
              } else {
                logger.verbose(`Couldn't determine name for default export in ${relativeFilePath}`);
                return;
              }
            }
            
            // Skip if not likely a component (must be PascalCase)
            if (!name || !/^[A-Z]/.test(name)) {
              logger.verbose(`Skipping non-component default export: ${name} (not PascalCase)`);
              return;
            }
            
            hasExportedComponents = true;
            logger.verbose(`Found default exported component: ${name} in ${relativeFilePath}`);
            
            // Extract JSDoc comments for description
            let description = '';
            const comments = path.node.leadingComments || [];
            if (comments.length > 0) {
              description = comments
                .map(comment => comment.value.trim().replace(/^\*+/gm, '').trim())
                .join('\n');
            }
            
            components.push({
              path: relativeFilePath,
              name,
              category,
              lastUpdated: new Date().toISOString(),
              exports: ['default', name],
              props: [], // Simplified for default exports
              description: description || `UI ${name} component`
            });
          },
          
          // Add more component patterns as needed
          VariableDeclaration(path) {
            // Handle const Component = React.memo(() => {}) or similar patterns
            const declarations = path.node.declarations;
            
            if (!declarations || declarations.length === 0) return;
            
            declarations.forEach(declaration => {
              if (!declaration.id || !t.isIdentifier(declaration.id)) return;
              
              const name = declaration.id.name;
              
              // Skip if not likely a component (must be PascalCase)
              if (!name || !/^[A-Z]/.test(name)) return;
              
              // Check if it's exported
              let isExported = false;
              let currentPath = path;
              
              // IMPROVED: Safer traversal of parent path
              while (currentPath && currentPath.parentPath) {
                currentPath = currentPath.parentPath;
                if (t.isExportNamedDeclaration(currentPath.node) || t.isExportDefaultDeclaration(currentPath.node)) {
                  isExported = true;
                  break;
                }
              }
              
              if (!isExported) {
                // Look for export statements that might export this variable
                let foundExport = false;
                path.scope.path.traverse({
                  ExportNamedDeclaration(exportPath) {
                    if (exportPath.node.specifiers) {
                      for (const specifier of exportPath.node.specifiers) {
                        if (
                          t.isExportSpecifier(specifier) && 
                          t.isIdentifier(specifier.local) && 
                          specifier.local.name === name
                        ) {
                          foundExport = true;
                          break;
                        }
                      }
                    }
                  },
                  ExportDefaultDeclaration(exportPath) {
                    if (
                      t.isIdentifier(exportPath.node.declaration) && 
                      exportPath.node.declaration.name === name
                    ) {
                      foundExport = true;
                    }
                  }
                });
                
                if (!foundExport) {
                  logger.verbose(`Skipping unexported component: ${name}`);
                  return;
                }
              }
              
              // It's an exported component!
              hasExportedComponents = true;
              logger.verbose(`Found variable component: ${name} in ${relativeFilePath}`);
              
              // Extract props from TypeScript type annotations or forwardRef patterns
              const props = [];
              
              // New section to handle forwardRef patterns
              try {
                if (declaration.init) {
                  // Handle React.forwardRef pattern
                  if (
                    t.isCallExpression(declaration.init) && 
                    t.isMemberExpression(declaration.init.callee) &&
                    t.isIdentifier(declaration.init.callee.object) && 
                    t.isIdentifier(declaration.init.callee.property) &&
                    (declaration.init.callee.object.name === 'React' || declaration.init.callee.object.name === 'react') &&
                    declaration.init.callee.property.name === 'forwardRef'
                  ) {
                    logger.verbose(`Found React.forwardRef component: ${name}`);
                    
                    // React.forwardRef takes a function with (props, ref) arguments
                    if (declaration.init.arguments && declaration.init.arguments.length > 0) {
                      const forwardRefFn = declaration.init.arguments[0];
                      
                      // For arrow functions: React.forwardRef((props, ref) => {...})
                      if (t.isArrowFunctionExpression(forwardRefFn) && forwardRefFn.params && forwardRefFn.params.length > 0) {
                        // First parameter is the props object
                        const propsParam = forwardRefFn.params[0];
                        if (propsParam && propsParam.typeAnnotation) {
                          traversalContext.thisRef.extractPropsFromTypeAnnotation.call(
                            traversalContext.thisRef, 
                            propsParam.typeAnnotation, 
                            props
                          );
                        }
                      }
                      // For function expressions: React.forwardRef(function(props, ref) {...})
                      else if (t.isFunctionExpression(forwardRefFn) && forwardRefFn.params && forwardRefFn.params.length > 0) {
                        const propsParam = forwardRefFn.params[0];
                        if (propsParam && propsParam.typeAnnotation) {
                          traversalContext.thisRef.extractPropsFromTypeAnnotation.call(
                            traversalContext.thisRef, 
                            propsParam.typeAnnotation, 
                            props
                          );
                        }
                      }
                    }
                    
                    // If we couldn't extract props from the forwardRef function itself,
                    // scan the file for exported interfaces that match the naming pattern
                    if (props.length === 0) {
                      // Look for exported interfaces like `export interface ComponentProps {...}`
                      traversalContext.thisRef.scanForPropInterface.call(
                        traversalContext.thisRef,
                        path.scope.path,
                        name,
                        props
                      );
                    }
                  }
                }
              } catch (error) {
                logger.warn(`forwardRef extraction warning for ${relativeFilePath}: ${error.message}`);
              }
              
              // Fall back to existing approaches if we didn't find props
              if (props.length === 0) {
                logger.verbose(`No props found via forwardRef extraction, trying standard methods for ${name}`);
                // ... existing prop extraction methods ...
              }
              
              // Extract description from JSDoc comment
              let description = '';
              const comments = path.node.leadingComments || declaration.leadingComments || [];
              if (comments.length > 0) {
                description = comments
                  .map(comment => comment.value.trim().replace(/^\*+/gm, '').trim())
                  .join('\n');
              }
              
              components.push({
                path: relativeFilePath,
                name,
                category,
                lastUpdated: new Date().toISOString(),
                exports: [name],
                props,
                description: description || `UI ${name} component`
              });
            });
          }
        });
      } catch (traverseError) {
        logger.warn(`AST traversal error in ${relativeFilePath}: ${traverseError.message}`);
        // Fall back to filename-based component detection
        const fallbackComponents = this.extractComponentsByFilename(relativeFilePath, fileContent);
        if (fallbackComponents && fallbackComponents.length > 0) {
          components.push(...fallbackComponents);
          hasExportedComponents = true;
        }
      }
      
      // Skip files with no exported components
      if (!hasExportedComponents) {
        logger.verbose(`No exported components found in: ${relativeFilePath}`);
        return null;
      }
      
      logger.info(`Extracted ${components.length} components from ${relativeFilePath}`);
      return components;
      
    } catch (error) {
      // General error handling
      const logger = this.logger || {
        error: (...args) => console.error('[ComponentRegistry]', ...args)
      };
      
      logger.error(`Error processing file ${filePath}:`, error.message);
      
      // IMPROVED: Even with general error, try filename-based fallback
      try {
        const relativeFilePath = path.relative(process.cwd(), filePath).replace(/\\/g, '/');
        return this.extractComponentsByFilename(relativeFilePath);
      } catch (fallbackError) {
        logger.error(`Even fallback detection failed for ${filePath}:`, fallbackError.message);
        return null;
      }
    }
  }
  
  /**
   * ADDED: New helper method for filename-based component extraction
   * Extracts component information based on filename when AST parsing fails
   */
  extractComponentsByFilename(relativeFilePath, fileContent = '') {
    try {
      const logger = this.logger || {
        info: (...args) => console.log('[ComponentRegistry]', ...args),
      };
      
      // If filename is PascalCase and has a component file extension, assume it's a component
      const fileBaseName = relativeFilePath.split('/').pop().split('.')[0];
      
      if (/^[A-Z]/.test(fileBaseName) && 
          (relativeFilePath.endsWith('.tsx') || 
           relativeFilePath.endsWith('.jsx') || 
           relativeFilePath.endsWith('.js'))) {
        
        logger.info(`Using filename-based component detection for ${relativeFilePath}`);
        
        // Determine component category from path
        let category = 'unknown';
        if (relativeFilePath.includes('/atoms/')) {
          category = 'atom';
        } else if (relativeFilePath.includes('/molecules/')) {
          category = 'molecule';
        } else if (relativeFilePath.includes('/organisms/')) {
          category = 'organism';
        }
        
        // Basic content check to ensure this is likely a React component
        const isLikelyComponent = 
          !fileContent || // If no content provided, trust the filename
          fileContent.includes('React') ||
          fileContent.includes('react') ||
          fileContent.includes('import ') ||
          fileContent.includes('export ') ||
          fileContent.includes('function ') ||
          fileContent.includes('class ') ||
          fileContent.includes('<');
          
        if (!isLikelyComponent) {
          return null;
        }
        
        return [{
          path: relativeFilePath,
          name: fileBaseName,
          category,
          lastUpdated: new Date().toISOString(),
          exports: ['default', fileBaseName],
          props: [],
          description: `UI ${fileBaseName} component (fallback detection)`,
          _detectionMethod: 'filename'
        }];
      }
      
      return null;
    } catch (error) {
      if (this.logger) {
        this.logger.error(`Error in filename-based detection for ${relativeFilePath}:`, error.message);
      } else {
        console.error('[ComponentRegistry] Error in filename-based detection:', error.message);
      }
      return null;
    }
  }
  
  /**
   * Extract props from TypeScript type annotations
   * @param {Object} typeAnnotation TypeScript type annotation node
   * @param {Array} props Array to populate with prop metadata
   */
  extractPropsFromTypeAnnotation(typeAnnotation, props) {
    // Create a safe local reference to logger
    const logger = this.logger || {
      warn: (...args) => console.warn('[ComponentRegistry]', ...args),
      error: (...args) => console.error('[ComponentRegistry]', ...args),
      info: (...args) => console.log('[ComponentRegistry]', ...args),
      verbose: (...args) => console.log('[ComponentRegistry]', ...args)
    };
    
    try {
      // Robust null checking
      if (!typeAnnotation) return;
      if (!props || !Array.isArray(props)) return;
      
      // Extract the type annotation safely
      const propType = typeAnnotation.typeAnnotation;
      if (!propType) return;
      
      // Handle TSTypeLiteral (inline interface) or TSInterfaceBody
      if (t.isTSTypeLiteral(propType) && propType.members && Array.isArray(propType.members)) {
        propType.members.forEach(member => {
          // Skip null/undefined members
          if (!member) return;
          
          if (t.isTSPropertySignature(member) && member.key && t.isIdentifier(member.key)) {
            const propName = member.key.name;
            const isOptional = member.optional === true;
            let propTypeName = 'any';
            
            // Get the type name if possible - with null safety
            if (member.typeAnnotation && member.typeAnnotation.typeAnnotation) {
              propTypeName = this.getTypeNameFromAnnotation(member.typeAnnotation.typeAnnotation);
            }
            
            props.push({
              name: propName,
              type: propTypeName,
              required: !isOptional,
              defaultValue: undefined
            });
          }
        });
      } else if (t.isTSTypeReference(propType) && propType.typeName && t.isIdentifier(propType.typeName)) {
        // Handle referenced interfaces like React.PropsWithChildren<Props>
        props.push({
          name: propType.typeName.name,
          type: 'interface',
          required: true,
          defaultValue: undefined,
          isInterface: true
        });
      } else if (t.isTSIntersectionType(propType) && propType.types && Array.isArray(propType.types)) {
        // Handle intersection types like Props & OtherProps
        propType.types.forEach(type => {
          if (t.isTSTypeReference(type) && type.typeName && t.isIdentifier(type.typeName)) {
            props.push({
              name: type.typeName.name,
              type: 'interface',
              required: true,
              defaultValue: undefined,
              isInterface: true
            });
          }
        });
      }
      // Add more type handling as needed
    } catch (error) {
      // Log warning but don't throw
      logger.warn('Error extracting props from type annotation:', error.message);
    }
  }
  
  /**
   * Extracts props from class component
   * @param {Object} classNode The class node from AST
   * @param {Array} props Array to populate with prop data
   */
  extractPropsFromClass(classNode, props) {
    // Create a safe local reference to logger
    const logger = this.logger || {
      warn: (...args) => console.warn('[ComponentRegistry]', ...args),
      error: (...args) => console.error('[ComponentRegistry]', ...args),
      info: (...args) => console.log('[ComponentRegistry]', ...args),
      verbose: (...args) => console.log('[ComponentRegistry]', ...args)
    };
    
    try {
      // Safety checks
      if (!classNode || !classNode.body || !classNode.body.body || !Array.isArray(classNode.body.body)) return;
      
      // Look for propTypes static class property
      const propTypesProperty = classNode.body.body.find(node => 
        t.isClassProperty(node) && 
        node.static === true && 
        t.isIdentifier(node.key) && 
        node.key.name === 'propTypes'
      );
      
      if (propTypesProperty && propTypesProperty.value && t.isObjectExpression(propTypesProperty.value)) {
        propTypesProperty.value.properties.forEach(prop => {
          if (t.isObjectProperty(prop) && prop.key) {
            let propName;
            if (t.isIdentifier(prop.key)) {
              propName = prop.key.name;
            } else if (t.isStringLiteral(prop.key)) {
              propName = prop.key.value;
            } else {
              return; // Skip if we can't get property name
            }
            
            let propTypeName = 'any';
            let isRequired = false;
            
            // Extract type information from PropTypes
            if (t.isMemberExpression(prop.value)) {
              if (t.isIdentifier(prop.value.object) && prop.value.object.name === 'PropTypes') {
                if (t.isIdentifier(prop.value.property)) {
                  propTypeName = prop.value.property.name;
                }
              } else if (
                t.isMemberExpression(prop.value.object) && 
                t.isIdentifier(prop.value.object.object) && 
                prop.value.object.object.name === 'PropTypes' &&
                t.isIdentifier(prop.value.property) && 
                prop.value.property.name === 'isRequired'
              ) {
                isRequired = true;
                if (t.isIdentifier(prop.value.object.property)) {
                  propTypeName = prop.value.object.property.name;
                }
              }
            }
            
            props.push({
              name: propName,
              type: propTypeName,
              required: isRequired,
              defaultValue: undefined
            });
          }
        });
      }
      
      // Look for defaultProps static class property
      const defaultPropsProperty = classNode.body.body.find(node => 
        t.isClassProperty(node) && 
        node.static === true && 
        t.isIdentifier(node.key) && 
        node.key.name === 'defaultProps'
      );
      
      if (defaultPropsProperty && defaultPropsProperty.value) {
        this.extractDefaultPropsFromAssignment({ right: defaultPropsProperty.value }, props);
      }
    } catch (error) {
      logger.warn('Error extracting props from class:', error.message);
    }
  }
  
  /**
   * Gets a type name from a type annotation
   * @param {Object} typeAnnotation A TypeScript type annotation node
   * @returns {string} The type name
   */
  getTypeNameFromAnnotation(typeAnnotation) {
    // Create a safe local reference to logger
    const logger = this.logger || {
      warn: (...args) => console.warn('[ComponentRegistry]', ...args),
      error: (...args) => console.error('[ComponentRegistry]', ...args),
      info: (...args) => console.log('[ComponentRegistry]', ...args),
      verbose: (...args) => console.log('[ComponentRegistry]', ...args)
    };
    // Safety check for null/undefined values
    if (!typeAnnotation) return 'unknown';
    
    try {
      if (t.isTSStringKeyword(typeAnnotation)) {
        return 'string';
      } else if (t.isTSNumberKeyword(typeAnnotation)) {
        return 'number';
      } else if (t.isTSBooleanKeyword(typeAnnotation)) {
        return 'boolean';
      } else if (t.isTSArrayType(typeAnnotation)) {
        // Safely get element type
        const elementType = typeAnnotation.elementType ? 
          this.getTypeNameFromAnnotation(typeAnnotation.elementType) : 
          'unknown';
        return `${elementType}[]`;
      } else if (t.isTSUnionType(typeAnnotation)) {
        if (!typeAnnotation.types || !Array.isArray(typeAnnotation.types)) {
          return 'union';
        }
        return typeAnnotation.types
          .map(type => type ? this.getTypeNameFromAnnotation(type) : 'unknown')
          .join(' | ');
      } else if (t.isTSTypeReference(typeAnnotation)) {
        // Check for null safety
        if (!typeAnnotation.typeName) return 'reference';
        
        if (t.isIdentifier(typeAnnotation.typeName)) {
          return typeAnnotation.typeName.name;
        } else if (t.isQualifiedName(typeAnnotation.typeName)) {
          // Handle namespaced types like React.ComponentProps
          if (typeAnnotation.typeName.left && typeAnnotation.typeName.right) {
            const left = t.isIdentifier(typeAnnotation.typeName.left) ? 
              typeAnnotation.typeName.left.name : 'unknown';
            const right = t.isIdentifier(typeAnnotation.typeName.right) ?
              typeAnnotation.typeName.right.name : 'unknown';
            return `${left}.${right}`;
          }
        }
        return 'reference';
      } else if (t.isTSAnyKeyword(typeAnnotation)) {
        return 'any';
      } else if (t.isTSVoidKeyword(typeAnnotation)) {
        return 'void';
      } else if (t.isTSObjectKeyword(typeAnnotation)) {
        return 'object';
      } else if (t.isTSFunctionType(typeAnnotation)) {
        return 'function';
      } else if (t.isTSLiteralType(typeAnnotation) && typeAnnotation.literal) {
        // Handle literal types like 'primary' | 'secondary'
        return 'literal';
      }
      
      return 'unknown';
    } catch (error) {
      // Use the logger instead of direct console.warn
      if (this && this.logger) {
        this.logger.warn('Error getting type name:', error.message);
      } else {
        console.warn('[ComponentRegistry] Error getting type name:', error.message);
      }
      return 'unknown';
    }
  }

  /**
   * Extracts default props from defaultProps assignment
   * @param {Object} node AST node for defaultProps assignment
   * @param {Array} props Array of props to update with defaults
   */
  extractDefaultPropsFromAssignment(node, props) {
    // Create a safe local reference to logger
    const logger = this.logger || {
      warn: (...args) => console.warn('[ComponentRegistry]', ...args),
      error: (...args) => console.error('[ComponentRegistry]', ...args),
      info: (...args) => console.log('[ComponentRegistry]', ...args),
      verbose: (...args) => console.log('[ComponentRegistry]', ...args)
    };
    
    try {
      // Safety checks
      if (!node || !node.right || !props || !Array.isArray(props)) return;
      
      // Get default values from object expression
      if (t.isObjectExpression(node.right)) {
        node.right.properties.forEach(prop => {
          if (t.isObjectProperty(prop) && prop.key) {
            // Get prop name safely
            let propName;
            if (t.isIdentifier(prop.key)) {
              propName = prop.key.name;
            } else if (t.isStringLiteral(prop.key)) {
              propName = prop.key.value;
            } else {
              return; // Can't handle this key type
            }
            
            // Find matching prop
            const matchingProp = props.find(p => p.name === propName);
            if (matchingProp) {
              // Extract default value based on type
              if (t.isStringLiteral(prop.value)) {
                matchingProp.defaultValue = `'${prop.value.value}'`;
              } else if (t.isNumericLiteral(prop.value)) {
                matchingProp.defaultValue = prop.value.value.toString();
              } else if (t.isBooleanLiteral(prop.value)) {
                matchingProp.defaultValue = prop.value.value.toString();
              } else if (t.isNullLiteral(prop.value)) {
                matchingProp.defaultValue = 'null';
              } else if (t.isArrayExpression(prop.value)) {
                matchingProp.defaultValue = '[]';
              } else if (t.isObjectExpression(prop.value)) {
                matchingProp.defaultValue = '{}';
              } else if (t.isFunctionExpression(prop.value) || t.isArrowFunctionExpression(prop.value)) {
                matchingProp.defaultValue = 'function(){}';
              }
              // If default value is set, prop is not required
              if (matchingProp.defaultValue !== undefined) {
                matchingProp.required = false;
              }
            }
          }
        });
      }
    } catch (error) {
      logger.warn('Error extracting default props:', error.message);
    }
  }

  /**
   * Get a type name from a node - legacy support for PropTypes
   * @param {Object} node AST node to extract type from 
   * @returns {string} Type name
   */
  getTypeName(node) {
    // Create a safe local reference to logger
    const logger = this.logger || {
      warn: (...args) => console.warn('[ComponentRegistry]', ...args),
      error: (...args) => console.error('[ComponentRegistry]', ...args),
      info: (...args) => console.log('[ComponentRegistry]', ...args),
      verbose: (...args) => console.log('[ComponentRegistry]', ...args)
    };
    
    try {
      // Handle various node types for prop type declarations
      if (t.isMemberExpression(node)) {
        // Handle PropTypes.something
        if (t.isIdentifier(node.object) && node.object.name === 'PropTypes') {
          if (t.isIdentifier(node.property)) {
            return node.property.name;
          }
        }
        // Handle PropTypes.something.isRequired
        else if (
          t.isMemberExpression(node.object) && 
          t.isIdentifier(node.object.object) && 
          node.object.object.name === 'PropTypes' &&
          t.isIdentifier(node.property) && 
          node.property.name === 'isRequired'
        ) {
          if (t.isIdentifier(node.object.property)) {
            return node.object.property.name;
          }
        }
        // Handle other member expressions
        else if (t.isIdentifier(node.property)) {
          return node.property.name;
        }
      }
      // Handle identifiers directly
      else if (t.isIdentifier(node)) {
        return node.name;
      }
      // Handle StringLiteral (for enum values etc)
      else if (t.isStringLiteral(node)) {
        return `'${node.value}'`;
      }
      // Handle numeric literals
      else if (t.isNumericLiteral(node)) {
        return String(node.value);
      }
      // Handle boolean literals
      else if (t.isBooleanLiteral(node)) {
        return String(node.value);
      }
      // Handle null
      else if (t.isNullLiteral(node)) {
        return 'null';
      }
      // Handle arrays
      else if (t.isArrayExpression(node)) {
        return 'array';
      }
      // Handle objects
      else if (t.isObjectExpression(node)) {
        return 'object';
      }
      // Handle functions
      else if (t.isFunctionExpression(node) || t.isArrowFunctionExpression(node)) {
        return 'function';
      }
      
      // Default type when we can't figure it out
      return 'any';
    } catch (error) {
      logger.warn('Error getting type name:', error.message);
      return 'any';
    }
  }

  /**
   * Generate a unique build ID for versioning
   * @returns {string} Unique build ID
   */
  generateBuildId() {
    return crypto.createHash('md5')
      .update(new Date().toISOString() + Math.random().toString())
      .digest('hex')
      .substring(0, 8);
  }

  /**
   * Scan for prop interface in the file
   * @param {Object} rootPath The root AST path to scan
   * @param {string} componentName The component name to look for matching interfaces
   * @param {Array} props Array to populate with prop metadata
   */
  scanForPropInterface(rootPath, componentName, props) {
    // Create a safe local reference to logger
    const logger = this.logger || {
      warn: (...args) => console.warn('[ComponentRegistry]', ...args),
      error: (...args) => console.error('[ComponentRegistry]', ...args),
      info: (...args) => console.log('[ComponentRegistry]', ...args),
      verbose: (...args) => console.log('[ComponentRegistry]', ...args)
    };
    
    try {
      // Look for patterns like:
      // export interface ComponentProps {...}
      // export interface ComponentPropsWithChildren {...}
      // export interface IComponentProps {...}
      const interfaceNames = [
        `${componentName}Props`,
        `I${componentName}Props`,
        `${componentName.replace(/^I/, '')}Props`,
        `${componentName}PropsWithChildren`
      ];
      
      rootPath.traverse({
        TSInterfaceDeclaration(interfacePath) {
          // Check if the interface is exported
          const isExported = t.isExportNamedDeclaration(interfacePath.parent);
          if (!isExported) return;
          
          // Check if the interface name matches our patterns
          if (
            interfacePath.node.id && 
            t.isIdentifier(interfacePath.node.id) && 
            interfaceNames.includes(interfacePath.node.id.name)
          ) {
            logger.verbose(`Found matching interface: ${interfacePath.node.id.name}`);
            
            // Extract properties from interface
            if (interfacePath.node.body && interfacePath.node.body.body) {
              interfacePath.node.body.body.forEach(member => {
                if (t.isTSPropertySignature(member) && member.key && t.isIdentifier(member.key)) {
                  const propName = member.key.name;
                  const isOptional = member.optional === true;
                  let propTypeName = 'any';
                  
                  // Get the type name if possible
                  if (member.typeAnnotation && member.typeAnnotation.typeAnnotation) {
                    propTypeName = this.getTypeNameFromAnnotation(member.typeAnnotation.typeAnnotation);
                  }
                  
                  props.push({
                    name: propName,
                    type: propTypeName,
                    required: !isOptional,
                    defaultValue: undefined
                  });
                }
              });
            }
          }
        }
      });
    } catch (error) {
      logger.warn('Error scanning for prop interface:', error.message);
    }
  }
}

module.exports = ComponentRegistryPlugin; 