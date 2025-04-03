import { NextRequest, NextResponse } from 'next/server';
import { discoverComponents } from '@/app/(admin)/debug-tools/ui-components/utils/component-discovery';

// Cache for API responses to avoid redundant discovery
let componentsCache: any[] | null = null;
let lastDiscoveryTime = 0;
const CACHE_TTL = 30000; // 30 seconds cache TTL

// Fallback component list in case discovery fails
const FALLBACK_COMPONENTS = [
  {
    name: 'Alert',
    path: '@/components/ui/atoms/alert/Alert',
    category: 'atom',
    exports: ['Alert']
  },
  {
    name: 'Button',
    path: '@/components/ui/atoms/button/Button',
    category: 'atom',
    exports: ['Button']
  },
  {
    name: 'Skeleton',
    path: '@/components/ui/molecules/skeleton/Skeleton',
    category: 'molecule',
    exports: ['Skeleton']
  },
  {
    name: 'Modal',
    path: '@/components/ui/organisms/modal/Modal',
    category: 'organism',
    exports: ['Modal']
  },
  {
    name: 'Typography',
    path: '@/components/ui/atoms/typography/Typography',
    category: 'atom',
    exports: ['Typography']
  },
  {
    name: 'Paragraph',
    path: '@/components/ui/atoms/typography/Paragraph',
    category: 'atom',
    exports: ['Paragraph']
  },
  {
    name: 'Text',
    path: '@/components/ui/atoms/typography/Text',
    category: 'atom',
    exports: ['Text']
  },
  {
    name: 'Heading',
    path: '@/components/ui/atoms/typography/Heading',
    category: 'atom',
    exports: ['Heading']
  },
  {
    name: 'Code',
    path: '@/components/ui/atoms/typography/Code',
    category: 'atom',
    exports: ['Code']
  },
  {
    name: 'Blockquote',
    path: '@/components/ui/atoms/typography/Blockquote',
    category: 'atom',
    exports: ['Blockquote']
  }
];

/**
 * API endpoint to discover UI components 
 * This route provides component data to the ClientOnlyComponentsList component
 */
export async function GET(req: NextRequest) {
  try {
    // Use cache if available and not expired
    const now = Date.now();
    if (componentsCache && now - lastDiscoveryTime < CACHE_TTL) {
      console.log('Using cached component discovery results');
      return NextResponse.json({ 
        status: 'success',
        components: componentsCache,
        timestamp: now,
        source: 'cache'
      });
    }
    
    // Get components from the discovery system
    console.log('Running component discovery...');
    const components = await discoverComponents();
    
    // Cache the results
    if (components && components.length > 0) {
      componentsCache = components;
      lastDiscoveryTime = now;
    }
    
    // Return the components with time tracking
    const discoveryTime = Date.now() - now;
    console.log(`Component discovery complete in ${discoveryTime}ms, found ${components.length} components`);
    
    // Combine discovered components with guaranteed components from fallback
    // to ensure critical components are always available
    const combinedComponents = components.length > 0 ? components : FALLBACK_COMPONENTS;
    
    return NextResponse.json({ 
      status: 'success',
      components: combinedComponents,
      timestamp: now,
      discoveryTime
    });
  } catch (error) {
    console.error('Error discovering components:', error);
    
    // Return fallback components instead of an error
    return NextResponse.json({ 
      status: 'warning',
      message: 'Using fallback component list due to discovery error',
      components: FALLBACK_COMPONENTS,
      timestamp: Date.now(),
      error: error instanceof Error ? error.message : String(error)
    });
  }
} 