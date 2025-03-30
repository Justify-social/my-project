import fs from 'fs';
import path from 'path';
import getConfig from 'next/config';

// Get Next.js runtime config
const { publicRuntimeConfig } = getConfig() || { publicRuntimeConfig: {} };
const staticFolder = publicRuntimeConfig.staticFolder || '/static';
const componentRegistryPath = publicRuntimeConfig.componentRegistry || '/static/component-registry.json';
const backupRegistryPath = componentRegistryPath.replace('.json', '.backup.json');

const REGISTRY_PATHS = [
  // 1. Primary registry file
  path.join(process.cwd(), 'public', componentRegistryPath),
  // 2. Backup registry file
  path.join(process.cwd(), 'public', backupRegistryPath),
  // 3. NPM-generated registry file (from predev phase)
  path.join(process.cwd(), 'public', '/static/component-registry-npm.json'),
  // 4. Fallback to .next directory
  path.join(process.cwd(), '.next', 'static/component-registry.json')
];

/**
 * Get component registry with multiple fallbacks
 * Implements the Circuit Breaker pattern to ensure we always have components
 */
export async function getComponentRegistry() {
  // Track all attempts for diagnostics
  const attempts = [];
  let registry = null;
  
  // Try each path in order until we find a valid registry
  for (const registryPath of REGISTRY_PATHS) {
    try {
      if (fs.existsSync(registryPath)) {
        const data = fs.readFileSync(registryPath, 'utf-8');
        const parsedData = JSON.parse(data);
        
        // Validate that it contains components
        if (parsedData && 
            parsedData.components && 
            Array.isArray(parsedData.components) && 
            parsedData.components.length > 0) {
          
          console.log(`[Registry] Loaded ${parsedData.components.length} components from ${registryPath}`);
          
          registry = {
            components: parsedData.components,
            meta: {
              path: registryPath,
              timestamp: new Date().toISOString(),
              componentCount: parsedData.components.length,
              source: 'file'
            }
          };
          
          break;
        } else {
          attempts.push({
            path: registryPath,
            error: 'Registry exists but contains no components',
            timestamp: new Date().toISOString()
          });
        }
      } else {
        attempts.push({
          path: registryPath,
          error: 'File not found',
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      attempts.push({
        path: registryPath,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
  
  // If no registry was found, create a minimal registry with diagnostic info
  if (!registry) {
    console.error(`[Registry] Failed to load registry from any path. Attempts:`, attempts);
    
    // Return a minimal registry with error info
    return {
      components: [],
      meta: {
        error: 'Failed to load registry',
        attempts,
        timestamp: new Date().toISOString(),
        source: 'error-fallback'
      }
    };
  }
  
  return registry;
}

/**
 * API route handler for GET /api/component-registry
 * Returns components in a consistent format regardless of source
 */
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