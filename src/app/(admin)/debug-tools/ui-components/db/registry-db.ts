/**
 * Component Registry Database Service (Client API)
 * 
 * Implements a client-side API layer for component registry operations.
 * This file serves as the entry point for component registry operations in client code.
 */

'use client';

import { ComponentMetadata, DBChange, ComponentRegistryInterface } from '@/lib/types/component-registry';

// In-memory storage for client-side fallback
const inMemoryComponents: Record<string, ComponentMetadata> = {};
const inMemoryChanges: DBChange[] = [];
let useServerApi = true;

/**
 * Client implementation that delegates to server API endpoints
 * Only references to this implementation are included in client bundles
 */
class ClientComponentRegistry implements ComponentRegistryInterface {
  constructor() {
    console.info('Using client component registry implementation');
    
    // Determine if we can use the server API or need to fall back to in-memory
    if (typeof window !== 'undefined') {
      // Client-side checks
      useServerApi = true; // Assume we can use server API by default
      
      // Could add more sophisticated detection here based on network or feature flags
    }
  }

  async getAllComponents(): Promise<ComponentMetadata[]> {
    if (!useServerApi) {
      return Object.values(inMemoryComponents);
    }
    
    try {
      // Use Next.js API route to get components from server
      const response = await fetch('/api/components');
      if (!response.ok) {
        throw new Error(`Server API error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching components from server:', error);
      // Fall back to in-memory on error
      useServerApi = false;
      return Object.values(inMemoryComponents);
    }
  }

  async getComponent(id: string): Promise<ComponentMetadata | null> {
    if (!useServerApi) {
      return inMemoryComponents[id] || null;
    }
    
    try {
      // Use Next.js API route to get component by ID
      const response = await fetch(`/api/components/${id}`);
      if (response.status === 404) {
        return null;
      }
      if (!response.ok) {
        throw new Error(`Server API error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching component ${id} from server:`, error);
      // Fall back to in-memory on error
      useServerApi = false;
      return inMemoryComponents[id] || null;
    }
  }

  async upsertComponent(component: ComponentMetadata & { id: string }): Promise<void> {
    if (!useServerApi) {
      // In-memory fallback
      inMemoryComponents[component.id] = { ...component };
      
      // Add change record
      inMemoryChanges.push({
        id: Date.now(),
        component_id: component.id,
        component_name: component.name,
        change_type: 'UPDATE',
        description: `Component ${component.name} was updated`,
        timestamp: new Date().toISOString()
      });
      
      return;
    }
    
    try {
      // Use Next.js API route to create/update component
      const response = await fetch('/api/components', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(component),
      });
      
      if (!response.ok) {
        throw new Error(`Server API error: ${response.status}`);
      }
    } catch (error) {
      console.error(`Error updating component ${component.id} on server:`, error);
      // Fall back to in-memory on error
      useServerApi = false;
      
      // Store in fallback memory
      inMemoryComponents[component.id] = { ...component };
      
      // Add change record
      inMemoryChanges.push({
        id: Date.now(),
        component_id: component.id,
        component_name: component.name,
        change_type: 'UPDATE',
        description: `Component ${component.name} was updated`,
        timestamp: new Date().toISOString()
      });
    }
  }

  async deleteComponent(id: string): Promise<void> {
    if (!useServerApi) {
      // In-memory fallback
      const component = inMemoryComponents[id];
      if (component) {
        const name = component.name;
        delete inMemoryComponents[id];
        
        // Add change record
        inMemoryChanges.push({
          id: Date.now(),
          component_id: 'system',
          component_name: 'Deleted Component',
          change_type: 'DELETE',
          description: `Component ${name} was deleted`,
          timestamp: new Date().toISOString()
        });
      }
      return;
    }
    
    try {
      // Use Next.js API route to delete component
      const response = await fetch(`/api/components/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Server API error: ${response.status}`);
      }
    } catch (error) {
      console.error(`Error deleting component ${id} on server:`, error);
      // Fall back to in-memory on error
      useServerApi = false;
      
      // Perform deletion in fallback memory
      const component = inMemoryComponents[id];
      if (component) {
        const name = component.name;
        delete inMemoryComponents[id];
        
        // Add change record
        inMemoryChanges.push({
          id: Date.now(),
          component_id: 'system',
          component_name: 'Deleted Component',
          change_type: 'DELETE',
          description: `Component ${name} was deleted`,
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  async getChangeHistory(componentId?: string): Promise<DBChange[]> {
    if (!useServerApi) {
      // In-memory fallback
      if (componentId) {
        return inMemoryChanges.filter(change => change.component_id === componentId);
      } else {
        return [...inMemoryChanges].sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        ).slice(0, 100);
      }
    }
    
    try {
      // Use Next.js API route to get change history
      const url = componentId 
        ? `/api/components/changes?componentId=${componentId}` 
        : '/api/components/changes';
        
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Server API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching change history from server:', error);
      // Fall back to in-memory on error
      useServerApi = false;
      
      // Return from fallback memory
      if (componentId) {
        return inMemoryChanges.filter(change => change.component_id === componentId);
      } else {
        return [...inMemoryChanges].sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        ).slice(0, 100);
      }
    }
  }
}

// Export a singleton instance
export const componentRegistryDB: ComponentRegistryInterface = new ClientComponentRegistry(); 