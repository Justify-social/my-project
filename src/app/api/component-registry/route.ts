import { getComponentRegistry } from '../../(admin)/debug-tools/ui-components/api/registry';

/**
 * API Route: /api/component-registry
 * 
 * Serves the static registry file generated during build/development.
 * Implements multi-layer fallback strategy to ensure a valid registry is always returned.
 */

// In-memory cache to avoid frequent disk reads
let registryCache: any = null;
let registryCacheTime: number = 0;
const CACHE_TTL = 60 * 1000; // 1 minute cache TTL

// Previous registry state to use as fallback if current one is corrupted
let lastGoodRegistry: any = null;

/**
 * Try to load the static registry file with enhanced error handling
 */
function getStaticRegistry(forceRefresh = false) {
  try {
    // Check if we can use the cached version
    const now = Date.now();
    if (!forceRefresh && registryCache && (now - registryCacheTime < CACHE_TTL)) {
      console.log('Using cached registry');
      return registryCache;
    }
    
    // Build the path to the static registry file
    const registryPath = path.join(process.cwd(), 'public', 'static', 'component-registry.json');
    const backupRegistryPath = path.join(process.cwd(), 'public', 'static', 'component-registry.backup.json');
    const predevRegistryPath = path.join(process.cwd(), '.next', 'static', 'component-registry.json');
    
    console.log(`Looking for static registry at: ${registryPath}`);
    
    // Check if the file exists
    if (fs.existsSync(registryPath)) {
      console.log('Static registry file found, reading contents...');
      const data = fs.readFileSync(registryPath, 'utf-8');
      console.log(`Raw registry content length: ${data.length} bytes`);
      
      // Check if the file is empty or contains only whitespace
      if (!data.trim()) {
        console.error('Static registry file is empty');
        return tryBackupRegistry(backupRegistryPath, predevRegistryPath);
      }
      
      try {
        const parsedData = JSON.parse(data);
        
        // Validate registry structure
        if (!parsedData || typeof parsedData !== 'object') {
          console.error('Registry is not a valid object');
          return tryBackupRegistry(backupRegistryPath, predevRegistryPath);
        }
        
        // Ensure components array exists and is an array
        if (!Array.isArray(parsedData.components)) {
          console.warn('Registry has invalid components property, fixing format');
          parsedData.components = Array.isArray(parsedData.items) ? parsedData.items : [];
        }
        
        // Check for empty components array - this is our key issue
        if (parsedData.components.length === 0) {
          console.warn('Registry components array is empty, checking for backups');
          
          // Try to load from backup or predev
          const backupRegistry = tryBackupRegistry(backupRegistryPath, predevRegistryPath);
          if (backupRegistry && Array.isArray(backupRegistry.components) && backupRegistry.components.length > 0) {
            console.log(`Found backup/predev registry with ${backupRegistry.components.length} components, using it instead of empty registry`);
            
            // Update parsedData with components from backup but keep other metadata
            parsedData.components = backupRegistry.components;
            parsedData._restoredFrom = backupRegistry._source || 'backup';
          }
        }
        
        console.log(`Successfully loaded static registry with ${parsedData.components?.length || 0} components`);
        
        // Update cache and last good registry
        registryCache = parsedData;
        registryCacheTime = now;
        
        // Only save as last good registry if it has components
        if (parsedData.components && parsedData.components.length > 0) {
          lastGoodRegistry = parsedData;
          
          // Create a backup of this good registry for future use
          try {
            fs.writeFileSync(backupRegistryPath, JSON.stringify(parsedData), 'utf-8');
            console.log('Created backup of good registry');
          } catch (backupError) {
            console.warn('Could not create registry backup:', backupError);
          }
        }
        
        return parsedData;
      } catch (parseError) {
        console.error('Failed to parse registry JSON:', parseError);
        return tryBackupRegistry(backupRegistryPath, predevRegistryPath);
      }
    }
    
    // File doesn't exist, check predev path as well
    console.warn('Static component registry file not found:', registryPath);
    return tryBackupRegistry(backupRegistryPath, predevRegistryPath);
  } catch (error) {
    console.error('Error loading static registry:', error);
    return lastGoodRegistry || createFallbackRegistry();
  }
}

/**
 * Try to load a backup registry if the main one failed
 */
function tryBackupRegistry(backupPath: string, predevPath: string) {
  // First try the dedicated backup file
  try {
    if (fs.existsSync(backupPath)) {
      console.log('Found backup registry, trying to load it...');
      const backupData = fs.readFileSync(backupPath, 'utf-8');
      
      if (backupData.trim()) {
        const parsedBackup = JSON.parse(backupData);
        if (parsedBackup && Array.isArray(parsedBackup.components) && parsedBackup.components.length > 0) {
          console.log(`Loaded backup registry with ${parsedBackup.components.length} components`);
          parsedBackup._source = 'backup';
          return parsedBackup;
        } else {
          console.warn('Backup registry has no components, trying predev registry...');
        }
      }
    }
  } catch (error) {
    console.error('Failed to load backup registry:', error);
  }
  
  // Then try the predev registry (generated by npm run generate-ui-registry)
  try {
    if (fs.existsSync(predevPath)) {
      console.log('Found predev registry, trying to load it...');
      const predevData = fs.readFileSync(predevPath, 'utf-8');
      
      if (predevData.trim()) {
        const parsedPredev = JSON.parse(predevData);
        if (parsedPredev && Array.isArray(parsedPredev.components) && parsedPredev.components.length > 0) {
          console.log(`Loaded predev registry with ${parsedPredev.components.length} components`);
          parsedPredev._source = 'predev';
          return parsedPredev;
        }
      }
    }
  } catch (error) {
    console.error('Failed to load predev registry:', error);
  }
  
  // Try the npm-generated registry
  try {
    const npmGenPath = path.join(process.cwd(), 'public', 'static', 'component-registry-npm.json');
    if (fs.existsSync(npmGenPath)) {
      console.log('Found npm-generated registry, trying to load it...');
      const npmGenData = fs.readFileSync(npmGenPath, 'utf-8');
      
      if (npmGenData.trim()) {
        const parsedNpmGen = JSON.parse(npmGenData);
        if (parsedNpmGen && Array.isArray(parsedNpmGen.components) && parsedNpmGen.components.length > 0) {
          console.log(`Loaded npm-generated registry with ${parsedNpmGen.components.length} components`);
          parsedNpmGen._source = 'npm-generated';
          return parsedNpmGen;
        }
      }
    }
  } catch (error) {
    console.error('Failed to load npm-generated registry:', error);
  }
  
  // If we have a previous good registry in memory, use that
  if (lastGoodRegistry && Array.isArray(lastGoodRegistry.components) && lastGoodRegistry.components.length > 0) {
    console.log(`Using last good registry from memory with ${lastGoodRegistry.components.length} components`);
    return lastGoodRegistry;
  }
  
  // Try to find any JSON file that might be a component registry in public/static
  try {
    const staticDir = path.join(process.cwd(), 'public', 'static');
    if (fs.existsSync(staticDir)) {
      const files = fs.readdirSync(staticDir);
      for (const file of files) {
        if (file.includes('component') && file.includes('.json') && !file.includes('backup')) {
          console.log(`Trying potential registry file: ${file}`);
          const potentialData = fs.readFileSync(path.join(staticDir, file), 'utf-8');
          try {
            const parsed = JSON.parse(potentialData);
            if (parsed && Array.isArray(parsed.components) && parsed.components.length > 0) {
              console.log(`Found usable registry in ${file} with ${parsed.components.length} components`);
              parsed._source = `discovered-${file}`;
              return parsed;
            }
          } catch (e) {
            // Ignore parse errors for these extra attempts
          }
        }
      }
    }
  } catch (error) {
    console.error('Error during registry discovery:', error);
  }
  
  // Last resort: create a fallback registry
  return createFallbackRegistry();
}

/**
 * Create a fallback empty registry with proper format
 */
function createFallbackRegistry() {
  console.warn('Creating fallback empty registry');
  return {
    components: [],
    generatedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: '1.0.0'
  };
}

/**
 * Format registry for response to ensure backward compatibility
 */
function formatRegistryForResponse(registry: any) {
  if (!registry) {
    registry = createFallbackRegistry();
  }
  
  // Ensure the registry has the expected format
  const components = Array.isArray(registry.components) ? registry.components : [];
  const items = Array.isArray(registry.items) ? registry.items : components;
  
  return {
    ...registry,
    components,
    items, // Ensure items property for backward compatibility
    _diagnostics: {
      componentCount: components.length,
      format: 'enhanced',
      timestamp: new Date().toISOString()
    }
  };
}

// Handle GET requests
export async function GET() {
  try {
    const registry = await getComponentRegistry();
    
    // Format response consistently
    return new Response(JSON.stringify({
      success: true,
      data: {
        components: registry.components,
        timestamp: new Date().toISOString(),
        ...registry.meta
      },
      error: null
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  } catch (error) {
    console.error('[Registry API] Error serving component registry:', error);
    
    return new Response(JSON.stringify({
      success: false,
      data: null,
      error: error.message || 'Failed to load component registry'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  }
} 