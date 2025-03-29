/**
 * Component Watcher
 * 
 * Monitors the filesystem for changes to component files.
 * In a real implementation, this would use chokidar for filesystem watching.
 * For this prototype, we'll simulate filesystem watching with polling.
 */

import { componentRegistry, ComponentMetadata } from '../db/registry';
import { extractComponentMetadata } from './metadata-extractor';

// Paths to watch for components
const COMPONENT_PATHS = [
  'src/components/ui/atoms',
  'src/components/ui/molecules',
  'src/components/ui/organisms',
];

// List of file extensions to monitor
const COMPONENT_EXTENSIONS = ['.tsx', '.jsx'];

// Event handler types
type ComponentDiscoveryCallback = (component: ComponentMetadata) => void;
type ComponentRemovedCallback = (path: string) => void;

class ComponentWatcher {
  private onComponentDiscovered: ComponentDiscoveryCallback[] = [];
  private onComponentChanged: ComponentDiscoveryCallback[] = [];
  private onComponentRemoved: ComponentRemovedCallback[] = [];
  private isWatching = false;
  private pollInterval: NodeJS.Timeout | null = null;
  private knownFiles = new Set<string>();

  /**
   * Start watching for component changes
   */
  startWatching(): void {
    if (this.isWatching) return;
    
    console.log('Starting component watcher...');
    this.isWatching = true;
    
    // In a real implementation, we would use chokidar:
    // const watcher = chokidar.watch(COMPONENT_PATHS, {
    //   persistent: true,
    //   ignoreInitial: false,
    //   ignorePermissionErrors: true,
    //   awaitWriteFinish: {
    //     stabilityThreshold: 1000,
    //     pollInterval: 100
    //   }
    // });
    //
    // watcher.on('add', path => this.handleFileAdded(path));
    // watcher.on('change', path => this.handleFileChanged(path));
    // watcher.on('unlink', path => this.handleFileRemoved(path));
    
    // For this prototype, simulate with initial discovery and polling
    this.simulateInitialDiscovery();
    
    // Set up polling to simulate file watching
    this.pollInterval = setInterval(() => {
      // Simulate occasional file changes
      this.simulateFileChanges();
    }, 10000); // Poll every 10 seconds
  }
  
  /**
   * Stop watching for component changes
   */
  stopWatching(): void {
    if (!this.isWatching) return;
    
    console.log('Stopping component watcher...');
    this.isWatching = false;
    
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }
  
  /**
   * Register a callback for when a new component is discovered
   */
  onDiscovered(callback: ComponentDiscoveryCallback): void {
    this.onComponentDiscovered.push(callback);
  }
  
  /**
   * Register a callback for when a component is changed
   */
  onChange(callback: ComponentDiscoveryCallback): void {
    this.onComponentChanged.push(callback);
  }
  
  /**
   * Register a callback for when a component is removed
   */
  onRemoved(callback: ComponentRemovedCallback): void {
    this.onComponentRemoved.push(callback);
  }
  
  /**
   * Handle a new component file being added
   */
  private async handleFileAdded(path: string): Promise<void> {
    if (!this.isComponentFile(path)) return;
    
    try {
      console.log(`New component discovered: ${path}`);
      this.knownFiles.add(path);
      
      const metadata = await extractComponentMetadata(path);
      componentRegistry.upsertComponent(metadata);
      
      // Notify listeners
      this.onComponentDiscovered.forEach(callback => callback(metadata));
    } catch (error) {
      console.error(`Error processing new component ${path}:`, error);
    }
  }
  
  /**
   * Handle a component file being changed
   */
  private async handleFileChanged(path: string): Promise<void> {
    if (!this.isComponentFile(path)) return;
    
    try {
      console.log(`Component changed: ${path}`);
      
      const metadata = await extractComponentMetadata(path);
      componentRegistry.upsertComponent(metadata);
      
      // Notify listeners
      this.onComponentChanged.forEach(callback => callback(metadata));
    } catch (error) {
      console.error(`Error processing component change ${path}:`, error);
    }
  }
  
  /**
   * Handle a component file being removed
   */
  private handleFileRemoved(path: string): void {
    if (!this.isComponentFile(path) || !this.knownFiles.has(path)) return;
    
    try {
      console.log(`Component removed: ${path}`);
      this.knownFiles.delete(path);
      
      componentRegistry.removeComponent(path);
      
      // Notify listeners
      this.onComponentRemoved.forEach(callback => callback(path));
    } catch (error) {
      console.error(`Error handling component removal ${path}:`, error);
    }
  }
  
  /**
   * Check if a file path is a component file
   */
  private isComponentFile(path: string): boolean {
    const extension = path.substring(path.lastIndexOf('.'));
    return COMPONENT_EXTENSIONS.includes(extension) && 
           COMPONENT_PATHS.some(dir => path.startsWith(dir));
  }
  
  /**
   * Simulate initial component discovery
   * This is only for the prototype - in a real implementation, chokidar would handle this
   */
  private simulateInitialDiscovery(): void {
    console.log('Simulating initial component discovery...');
    
    // In a real implementation, we would scan the filesystem
    // For this prototype, create some sample components
    const sampleComponents: Partial<ComponentMetadata>[] = [
      {
        path: 'src/components/ui/atoms/button/Button.tsx',
        name: 'Button',
        category: 'atom',
        lastUpdated: new Date(),
        exports: ['Button', 'ButtonProps'],
        props: [
          { name: 'variant', type: 'string', required: false, defaultValue: 'primary' },
          { name: 'size', type: 'string', required: false, defaultValue: 'md' },
          { name: 'disabled', type: 'boolean', required: false, defaultValue: 'false' },
          { name: 'children', type: 'ReactNode', required: true }
        ],
        description: 'Button component for triggering actions',
        examples: ['<Button>Click Me</Button>'],
        dependencies: [],
        version: '1.0.0',
        changeHistory: []
      },
      {
        path: 'src/components/ui/atoms/typography/Heading.tsx',
        name: 'Heading',
        category: 'atom',
        lastUpdated: new Date(),
        exports: ['Heading', 'HeadingProps'],
        props: [
          { name: 'level', type: 'number', required: true },
          { name: 'children', type: 'ReactNode', required: true },
          { name: 'className', type: 'string', required: false }
        ],
        description: 'Heading component for page titles and sections',
        examples: ['<Heading level={1}>Page Title</Heading>'],
        dependencies: [],
        version: '1.0.0',
        changeHistory: []
      },
      {
        path: 'src/components/ui/molecules/form-field/FormField.tsx',
        name: 'FormField',
        category: 'molecule',
        lastUpdated: new Date(),
        exports: ['FormField', 'FormFieldProps'],
        props: [
          { name: 'label', type: 'string', required: true },
          { name: 'children', type: 'ReactNode', required: true },
          { name: 'error', type: 'string', required: false },
          { name: 'hint', type: 'string', required: false }
        ],
        description: 'FormField component for wrapping input elements with labels',
        examples: ['<FormField label="Email"><Input /></FormField>'],
        dependencies: [
          'src/components/ui/atoms/typography/Text.tsx'
        ],
        version: '1.0.0',
        changeHistory: []
      }
    ];
    
    // Add to registry
    sampleComponents.forEach(component => {
      // Add to known files for tracking
      this.knownFiles.add(component.path!);
      
      // Create full component metadata
      const metadata = component as ComponentMetadata;
      
      // Add to registry
      componentRegistry.upsertComponent(metadata);
      
      // Notify listeners
      this.onComponentDiscovered.forEach(callback => callback(metadata));
    });
  }
  
  /**
   * Simulate file changes for the prototype
   */
  private simulateFileChanges(): void {
    // 20% chance to simulate a file change
    if (Math.random() < 0.2) {
      const knownFilesArray = Array.from(this.knownFiles);
      if (knownFilesArray.length === 0) return;
      
      // Pick a random file
      const randomIndex = Math.floor(Math.random() * knownFilesArray.length);
      const path = knownFilesArray[randomIndex];
      
      // Get existing metadata
      const metadata = componentRegistry.getComponent(path);
      if (!metadata) return;
      
      // Update lastUpdated date
      const updatedMetadata = {
        ...metadata,
        lastUpdated: new Date()
      };
      
      // Update registry
      componentRegistry.upsertComponent(updatedMetadata);
      
      // Notify listeners
      this.onComponentChanged.forEach(callback => callback(updatedMetadata));
      
      console.log(`Simulated change to component: ${path}`);
    }
  }
  
  /**
   * Get the list of known component files
   */
  getKnownFiles(): string[] {
    return Array.from(this.knownFiles);
  }
}

// Export a singleton instance
export const componentWatcher = new ComponentWatcher(); 