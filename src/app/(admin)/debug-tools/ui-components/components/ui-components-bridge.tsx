'use client';

/**
 * UI Components Bridge
 * 
 * This file acts as a bridge between server components and UI components.
 * It re-exports all the UI components needed in the UI Components debug tools
 * to work around Turbopack's issue with server-relative imports.
 */

// Re-export from atoms
export { Button } from '@/components/ui/atoms/button/Button';
export { Badge } from '@/components/ui/atoms/badge/badge';
export { Input } from '@/components/ui/atoms/input/Input';
export { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/atoms/card/Card';

// Remove separator if it doesn't exist
// export { Separator } from '@/components/ui/atoms/separator';

// Re-export from molecules
export { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/molecules/accordion/accordion';
export { ScrollArea } from '@/components/ui/molecules/scroll-area/scroll-area';
export { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/molecules/tabs/tabs';

// Import types for the component API
import type { ComponentChangeEvent, ComponentsResult, GetComponentsOptions } from '../api/component-api';
export type { ComponentChangeEvent, ComponentsResult, GetComponentsOptions };

// Import the original ComponentApi for server environment
import { ComponentApi } from '../api/component-api';
export { ComponentApi };

// Import the unified component API
import { unifiedComponentApi, UnifiedComponentApi } from '../api/unified-component-api';
export { unifiedComponentApi, UnifiedComponentApi };

// Check environment
const isBrowser = typeof window !== 'undefined';

// Create the componentApi object based on environment
export const componentApi = isBrowser
  ? unifiedComponentApi // Use the unified API that works in browser and prioritizes the registry
  : new ComponentApi(); // Use the original implementation on the server

// Export a default to satisfy ESM
export default function UiComponentsBridge() {
  return null;
} 