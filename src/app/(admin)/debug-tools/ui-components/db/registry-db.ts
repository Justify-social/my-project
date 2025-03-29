/**
 * Component Registry Database Service
 * 
 * Implements a repository pattern for component metadata storage with SQLite.
 * This service provides a clean abstraction layer that can be replaced with
 * PostgreSQL in production environments without changing the consuming code.
 */

'use client';

import { ComponentMetadata, PropDefinition, Change } from './registry';
import { Database, Statement } from './database-types';

// Server component marker for database operations
let db: any = null;
let isInitialized = false;

// Initialize database on server side only
async function initDatabaseIfServer() {
  // Only run on server side and avoid duplicate initialization
  if (typeof window !== 'undefined' || isInitialized) return;
  
  try {
    // Dynamic imports to ensure these modules are only loaded on the server
    const Database = (await import('better-sqlite3')).default;
    const fs = await import('fs');
    const path = await import('path');
    
    const dbDir = path.join(process.cwd(), '.db');
    const dbPath = path.join(dbDir, 'component-registry.db');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    
    // Initialize database
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL'); // Write-Ahead Logging for better concurrency
    db.pragma('foreign_keys = ON');  // Enable foreign key constraints
    
    // Create tables
    createTables();
    isInitialized = true;
  } catch (error) {
    console.error('Error initializing database:', error);
    // In browser, this will fail and we'll just continue without DB functionality
  }
}

// Create necessary tables
function createTables() {
  if (!db) return;
  
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS components (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT,
        path TEXT NOT NULL,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS props (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        component_id TEXT NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        description TEXT,
        default_value TEXT,
        required BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (component_id) REFERENCES components(id)
      );

      CREATE TABLE IF NOT EXISTS changes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        component_id TEXT NOT NULL,
        change_type TEXT NOT NULL,
        description TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (component_id) REFERENCES components(id)
      );
    `);
  } catch (error) {
    console.error('Error creating database tables:', error);
  }
}

/**
 * ComponentRegistryDB is responsible for persisting component metadata
 * in a SQLite database with proper schema management and migrations.
 */
export class ComponentRegistryDB {
  constructor() {
    // Initialize database if on server
    if (typeof window === 'undefined') {
      initDatabaseIfServer();
    }
  }

  /**
   * Get all components from the registry
   */
  getAllComponents(): ComponentMetadata[] {
    if (!db) {
      console.warn('Database operations are only available on the server side');
      return [];
    }
    
    try {
      const components = db.prepare(`
        SELECT * FROM components
      `).all();

      return components.map((row: any) => this.hydrateComponent(row));
    } catch (error) {
      console.error('Error getting components:', error);
      return [];
    }
  }

  /**
   * Get a component by ID
   */
  getComponent(id: string): ComponentMetadata | null {
    if (!db) return null;
    
    try {
      const component = db.prepare(`
        SELECT * FROM components WHERE id = ?
      `).get(id);

      if (!component) return null;

      return this.hydrateComponent(component);
    } catch (error) {
      console.error(`Error getting component with ID ${id}:`, error);
      return null;
    }
  }

  /**
   * Add or update a component in the registry
   */
  upsertComponent(component: ComponentMetadata & { id: string }): void {
    if (!db) return;
    
    try {
      const { id, name, description, category, path, props } = component;

      // Begin transaction
      db.transaction(() => {
        // Insert or replace component
        db.prepare(`
          INSERT OR REPLACE INTO components (id, name, description, category, path, last_updated)
          VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `).run(id, name, description, category, path);
  
        // Delete existing props
        db.prepare(`DELETE FROM props WHERE component_id = ?`).run(id);
  
        // Insert new props
        if (props && props.length > 0) {
          const insertProp = db.prepare(`
            INSERT INTO props (component_id, name, type, description, default_value, required)
            VALUES (?, ?, ?, ?, ?, ?)
          `);
  
          for (const prop of props) {
            insertProp.run(
              id,
              prop.name,
              prop.type,
              prop.description,
              prop.defaultValue,
              prop.required
            );
          }
        }
  
        // Add change record
        db.prepare(`
          INSERT INTO changes (component_id, change_type, description)
          VALUES (?, ?, ?)
        `).run(id, 'UPDATE', `Component ${name} was updated`);
      })();
    } catch (error) {
      console.error('Error upserting component:', error);
    }
  }

  /**
   * Delete a component from the registry
   */
  deleteComponent(id: string): void {
    if (!db) return;
    
    try {
      db.transaction(() => {
        // Get component name before deletion
        const component = db.prepare(`SELECT name FROM components WHERE id = ?`).get(id);
        
        if (!component) return;
        
        // Delete props first (foreign key constraint)
        db.prepare(`DELETE FROM props WHERE component_id = ?`).run(id);
        
        // Delete changes
        db.prepare(`DELETE FROM changes WHERE component_id = ?`).run(id);
        
        // Delete component
        db.prepare(`DELETE FROM components WHERE id = ?`).run(id);
        
        // Add change record with special "orphaned" ID
        db.prepare(`
          INSERT INTO changes (component_id, change_type, description)
          VALUES (?, ?, ?)
        `).run('system', 'DELETE', `Component ${component.name} was deleted`);
      })();
    } catch (error) {
      console.error(`Error deleting component with ID ${id}:`, error);
    }
  }

  /**
   * Get change history for all components or a specific component
   */
  getChangeHistory(componentId?: string): Change[] {
    if (!db) return [];
    
    try {
      let query = `
        SELECT 
          changes.id, 
          changes.component_id, 
          COALESCE(components.name, 'Deleted Component') as component_name,
          changes.change_type, 
          changes.description, 
          changes.timestamp
        FROM changes
        LEFT JOIN components ON changes.component_id = components.id
      `;
      
      if (componentId) {
        query += ` WHERE changes.component_id = ?`;
        return db.prepare(query).all(componentId);
      } else {
        query += ` ORDER BY changes.timestamp DESC LIMIT 100`;
        return db.prepare(query).all();
      }
    } catch (error) {
      console.error('Error getting change history:', error);
      return [];
    }
  }

  /**
   * Helper method to hydrate a component with its props
   */
  private hydrateComponent(component: any): ComponentMetadata {
    if (!db) return component;
    
    try {
      const props = db.prepare(`
        SELECT * FROM props WHERE component_id = ?
      `).all(component.id);
  
      return {
        ...component,
        props: props.map((prop: any) => ({
          name: prop.name,
          type: prop.type,
          description: prop.description,
          defaultValue: prop.default_value,
          required: !!prop.required
        }))
      };
    } catch (error) {
      console.error(`Error hydrating component with ID ${component.id}:`, error);
      return {
        ...component,
        props: []
      };
    }
  }
}

// Export a singleton instance
export const componentRegistryDB = new ComponentRegistryDB(); 