import { useState, useEffect } from 'react';

/**
 * Circuit breaker state for registry fetch failures
 */
interface CircuitBreakerState {
  failures: number;
  lastFailure: number | null;
  isOpen: boolean;
  cooldownPeriod: number; // ms
  maxFailures: number;
}

// Initialize circuit breaker state
const circuitBreaker: CircuitBreakerState = {
  failures: 0,
  lastFailure: null,
  isOpen: false,
  cooldownPeriod: 30000, // 30 seconds
  maxFailures: 3
};

// Track registry cache
let registryCache: any = null;
let lastFetchTime: number = 0;
const CACHE_TTL = 60000; // 1 minute

/**
 * Reset the circuit breaker after cooldown period
 */
function resetCircuitBreakerIfNeeded() {
  if (circuitBreaker.isOpen && circuitBreaker.lastFailure) {
    const now = Date.now();
    if (now - circuitBreaker.lastFailure > circuitBreaker.cooldownPeriod) {
      console.log('Circuit breaker cooldown complete, resetting');
      circuitBreaker.isOpen = false;
      circuitBreaker.failures = 0;
    }
  }
}

/**
 * Record a failure in the circuit breaker
 */
function recordFailure() {
  circuitBreaker.failures++;
  circuitBreaker.lastFailure = Date.now();
  
  if (circuitBreaker.failures >= circuitBreaker.maxFailures) {
    console.warn(`Circuit breaker opened after ${circuitBreaker.failures} failures`);
    circuitBreaker.isOpen = true;
  }
}

/**
 * Record a success in the circuit breaker
 */
function recordSuccess() {
  if (circuitBreaker.failures > 0) {
    circuitBreaker.failures = 0;
    if (circuitBreaker.isOpen) {
      console.log('Circuit breaker reset after successful request');
      circuitBreaker.isOpen = false;
    }
  }
}

/**
 * Fetch component registry with circuit breaker pattern
 */
async function fetchComponentRegistry(forceRefresh = false): Promise<any> {
  const now = Date.now();
  
  // Check if circuit breaker is open
  resetCircuitBreakerIfNeeded();
  if (circuitBreaker.isOpen) {
    console.warn('Circuit breaker open, using cached registry or fallback');
    return registryCache || { components: [], items: [] };
  }
  
  // Check cache
  if (!forceRefresh && registryCache && (now - lastFetchTime < CACHE_TTL)) {
    console.log('Using cached registry');
    return registryCache;
  }
  
  try {
    console.log('Fetching component registry');
    const timestamp = new Date().getTime();
    const response = await fetch(`/api/component-registry?t=${timestamp}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      console.error(`Registry fetch failed with status ${response.status}`);
      recordFailure();
      return registryCache || { components: [], items: [] };
    }
    
    const data = await response.json();
    
    // Validate response structure
    if (!data || !data.data) {
      console.error('Invalid registry response structure');
      recordFailure();
      return registryCache || { components: [], items: [] };
    }
    
    // Record successful request
    recordSuccess();
    
    // Update cache
    registryCache = data.data;
    lastFetchTime = now;
    
    // Log success
    const componentCount = data.data.components?.length || 0;
    console.log(`Loaded registry with ${componentCount} components`);
    
    return data.data;
  } catch (error) {
    console.error('Error fetching component registry:', error);
    recordFailure();
    return registryCache || { components: [], items: [] };
  }
}

/**
 * Hook to use component registry with automatic error handling
 */
export function useComponentRegistry(options: { autoRefresh?: boolean } = {}) {
  const [registry, setRegistry] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    let mounted = true;
    let refreshInterval: any = null;
    
    const loadRegistry = async () => {
      try {
        setLoading(true);
        const data = await fetchComponentRegistry();
        
        if (mounted) {
          setRegistry(data);
          setError(null);
        }
      } catch (err) {
        console.error('Registry load error:', err);
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to load registry'));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    loadRegistry();
    
    // Setup auto-refresh if enabled
    if (options.autoRefresh) {
      refreshInterval = setInterval(() => {
        loadRegistry();
      }, 60000); // Refresh every minute
    }
    
    return () => {
      mounted = false;
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, [options.autoRefresh]);
  
  // Function to manually refresh the registry
  const refreshRegistry = async () => {
    try {
      setLoading(true);
      const data = await fetchComponentRegistry(true);
      setRegistry(data);
      setError(null);
      return data;
    } catch (err) {
      console.error('Registry refresh error:', err);
      setError(err instanceof Error ? err : new Error('Failed to refresh registry'));
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  return {
    registry,
    loading,
    error,
    refreshRegistry,
    components: registry?.components || [],
    items: registry?.items || registry?.components || [],
    circuitBreakerStatus: {
      isOpen: circuitBreaker.isOpen,
      failures: circuitBreaker.failures,
      cooldownRemaining: circuitBreaker.lastFailure 
        ? Math.max(0, circuitBreaker.cooldownPeriod - (Date.now() - circuitBreaker.lastFailure)) 
        : 0
    }
  };
}

export default useComponentRegistry; 