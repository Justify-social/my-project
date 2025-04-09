import { NextResponse } from 'next/server';
import { getComponentRegistry, getComponentByName } from '@/app/(admin)/debug-tools/ui-components/utils/discovery'; // Adjust path if needed
import { type ComponentRegistry } from '@/app/(admin)/debug-tools/ui-components/types'; // Import type for clarity

/**
 * API Route Handler for UI Component Discovery
 * 
 * Fetches the component registry built from JSDoc metadata (SSOT)
 * and returns it as JSON. Can optionally return metadata for a specific component.
 */
export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const componentName = url.searchParams.get('name');
        // const forceRefresh = url.searchParams.get('forceRefresh') === 'true'; // Keep for later
        const forceRefresh = process.env.NODE_ENV === 'development'; // Force refresh in dev for now

        // Get the registry data (built dynamically based on JSDoc)
        const registry = await getComponentRegistry(forceRefresh);

        if (componentName) {
            // Find component by name (using the utility function)
            const componentMeta = await getComponentByName(componentName, registry);
            if (componentMeta) {
                return NextResponse.json(componentMeta);
            } else {
                return NextResponse.json(
                    { message: `Component '${componentName}' not found` },
                    { status: 404 }
                );
            }
        } else {
            // Return the entire registry object if no name specified
            return NextResponse.json(registry);
        }

    } catch (error) {
        console.error('[API /ui-components] Error fetching component registry:', error);
        // Return an error response
        return NextResponse.json(
            { message: 'Failed to retrieve UI component registry', error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

// Add revalidation options if needed, especially for production builds
// export const revalidate = 3600; // Revalidate every hour, for example 