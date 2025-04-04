// Updated import paths via tree-shake script - 2025-04-01T17:13:32.201Z
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardHeader, CardTitle, CardContent } from './ui-components-bridge';
import { ComponentMetadata, PropDefinition } from '../types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui-components-bridge';
import { Icon } from '@/components/ui/atoms/icon';
import { Modal } from '@/components/ui/organisms/modal/Modal';
import { OrgAlert } from '@/components/ui/organisms/feedback/Alert/Alert';
import { discoverComponents, createComponentMapFromDiscovery } from '../utils/component-discovery';
import { 
  createComponentMapEntry, 
  applyDefaultProps, 
  safeDynamicImport, 
  safeDynamicImportPath,
  createErrorComponent, 
  withDefaultProps 
} from '../utils/component-registry-utils';
import { ErrorBoundary } from 'react-error-boundary';
// Import component wrappers manager
import { getComponentWrapper, hasComponentWrapper, isShadcnComponent } from '../wrappers';

// Default props for components that need it to render safely
const SidebarWithDefaultProps = (props: any) => {
  // Default items array to prevent undefined.map errors
  const defaultItems = props.items || [
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: '/dashboard',
      icon: 'faHome'
    },
    {
      id: 'settings',
      label: 'Settings',
      href: '/settings',
      icon: 'faCog'
    }
  ];
  
  // Import the actual Sidebar component with default props
  const SidebarComponent = dynamic(() => 
    import('@/components/ui/organisms/navigation/sidebar/Sidebar')
      .then(mod => mod.default || mod)
      .catch(err => {
        console.error("Error loading Sidebar:", err);
        return createErrorComponent('Sidebar');
      }),
    { ssr: false }
  );
  
  return <SidebarComponent {...props} items={defaultItems} />;
};

// Default props wrapper for Calendar components
const CalendarWithDefaultProps = (props: any) => {
  // Import the actual Calendar component with client-side only rendering
  const CalendarComponent = dynamic(() => 
    safeDynamicImport(
      import('@/components/ui/organisms/calendar/Calendar'),
      'Calendar',
      createErrorComponent('Calendar')
    ),
    { ssr: false } // Ensure client-side only to prevent ReactCurrentDispatcher errors
  );
  
  // Add sensible defaults to prevent rendering errors
  return (
    <React.Suspense fallback={<div className="p-4 animate-pulse">Loading calendar...</div>}>
      <CalendarComponent {...props} />
    </React.Suspense>
  );
};

// Default props wrapper for CalendarUpcoming component
const CalendarUpcomingWithDefaultProps = (props: any) => {
  // Import the actual CalendarUpcoming component with client-side only rendering
  const CalendarUpcomingComponent = dynamic(() => 
    safeDynamicImport(
      import('@/components/ui/organisms/calendar/CalendarUpcoming'),
      'CalendarUpcoming',
      createErrorComponent('CalendarUpcoming')
    ),
    { ssr: false } // Ensure client-side only to prevent ReactCurrentDispatcher errors
  );
  
  // Add sensible defaults to prevent rendering errors
  const defaultProps = {
    events: props.events || [
      { id: 1, title: 'Team Meeting', date: new Date(Date.now() + 86400000), type: 'primary' },
      { id: 2, title: 'Project Deadline', date: new Date(Date.now() + 172800000), type: 'accent' }
    ],
    limit: props.limit || 5
  };
  
  return (
    <React.Suspense fallback={<div className="p-4 animate-pulse">Loading upcoming events...</div>}>
      <CalendarUpcomingComponent {...props} {...defaultProps} />
    </React.Suspense>
  );
};

// Default props wrapper for DataGrid components
const DataGridWithDefaultProps = (props: any) => {
  // Provide default columns and data to prevent rendering errors
  const defaultProps = {
    columns: props.columns || [
      { field: 'id', headerName: 'ID', width: 70 },
      { field: 'name', headerName: 'Name', width: 150 }
    ],
    data: props.data || [
      { id: 1, name: 'Sample Item 1' },
      { id: 2, name: 'Sample Item 2' }
    ]
  };
  
  // Import the actual DataGrid component
  const DataGridComponent = dynamic(() => 
    safeDynamicImport(
      import('@/components/ui/organisms/data-display/data-grid/DataGrid'),
      'DataGrid',
      createErrorComponent('DataGrid')
    )
  );
  
  return <DataGridComponent {...props} {...defaultProps} />;
};

// Default props wrapper for Table components
const TableWithDefaultProps = (props: any) => {
  // Provide default columns and data to prevent rendering errors
  const defaultProps = {
    columns: props.columns || [
      { id: 'name', header: 'Name', cell: (row: any) => row.name },
      { id: 'status', header: 'Status', cell: (row: any) => row.status }
    ],
    data: props.data || [
      { id: 1, name: 'Sample Row 1', status: 'Active' },
      { id: 2, name: 'Sample Row 2', status: 'Inactive' }
    ]
  };
  
  // Import the actual Table component
  const TableComponent = dynamic(() => 
    safeDynamicImport(
      import('@/components/ui/organisms/data-display/table/Table'),
      'Table',
      createErrorComponent('Table')
    )
  );
  
  return <TableComponent {...props} {...defaultProps} />;
};

// Define default props for components that need them for proper preview rendering
const componentDefaultProps: Record<string, any> = {
  Alert: {
    children: "This is an example alert message",
    title: "Alert Title",
    variant: "default",
    showIcon: true
  },
  Button: {
    children: "Button Text",
    variant: "default"
  },
  Card: {
    children: "Card Content"
  },
  Badge: {
    children: "Badge"
  },
  Label: {
    children: "Label"
  },
  Toggle: {
    children: "Toggle"
  },
  Input: {
    placeholder: "Input placeholder"
  },
  Checkbox: {
    label: "Checkbox label"
  },
  IconButton: {
    name: "check"
  },
  Icon: {
    name: "check"
  },
  // Add more components as needed
};

// Replace the component map with our automated discovery
const componentMap: Record<string, any> = (() => {
  // Define default props for components that need them to render properly
  const defaultProps = {
    // Dialog components
    Modal: {
      isOpen: true,
      onClose: () => {},
      title: "Example Modal",
      children: "Modal content goes here",
      size: "md"
    },
    Dialog: {
      open: true,
      onOpenChange: () => {},
      title: "Example Dialog",
      children: "Dialog content"
    },
    // Data display components
    Table: {
      columns: [{ id: 'name', header: 'Name' }, { id: 'status', header: 'Status' }],
      data: [{ id: 1, name: 'Example', status: 'Active' }]
    },
    DataGrid: {
      columns: [{ field: 'id', headerName: 'ID' }, { field: 'name', headerName: 'Name' }],
      data: [{ id: 1, name: 'Example Item' }]
    },
    // Content components
    Skeleton: {
      width: "100%",
      height: "24px"
    },
    Calendar: {
      initialDate: new Date(),
    },
    // Various skeleton components
    SkeletonSection: {},
    UICampaignDetailSkeleton: {},
    WizardSkeleton: {},
    TableSkeleton: {},
    UIFormSkeleton: {},
    AuthSkeleton: {},
    UIDashboardSkeleton: {},
    // Navigation components
    CommandMenu: { open: true, onOpenChange: () => {} },
    Sidebar: {},
    BaseMobileMenu: {},
    // Card variants
    CardFooter: {},
    MetricCard: { title: "Example Metric", value: "42", description: "Sample metric" },
    // Calendar components
    CalendarUpcoming: {},
    CalendarDashboard: {},
    DatePickerCalendar: {},
    ModalDialog: { open: true, onOpenChange: () => {} },
    // Form components
    FormStyleReset: { children: "Form content" },
    UIFormField: { label: "Example Field", name: "example" }
  };

  // Guaranteed components - these are directly registered regardless of discovery
  const guaranteedComponents: Record<string, any> = {
    // Core atomic components
    Button: dynamic(() => 
      safeDynamicImport(
        import('@/components/ui/atoms/button/Button'),
        'Button',
        createErrorComponent('Button')
      ),
      { ssr: false, loading: () => <div>Loading Button...</div> }
    ),
    Alert: dynamic(() => 
      safeDynamicImport(
        import('@/components/ui/atoms/alert/Alert'),
        'Alert',
        createErrorComponent('Alert')
      ),
      { ssr: false, loading: () => <div>Loading Alert...</div> }
    ),
    Skeleton: dynamic(() => 
      safeDynamicImport(
        import('@/components/ui/molecules/skeleton/Skeleton'),
        'Skeleton',
        createErrorComponent('Skeleton')
      ),
      { ssr: false, loading: () => <div>Loading Skeleton...</div> }
    ),
    Modal: dynamic(() => 
      safeDynamicImport(
        import('@/components/ui/organisms/modal/Modal'),
        'Modal',
        createErrorComponent('Modal')
      ),
      { ssr: false, loading: () => <div>Loading Modal...</div> }
    ),
    Typography: dynamic(() => 
      safeDynamicImport(
        import('@/components/ui/atoms/typography/Typography'),
        'Typography',
        createErrorComponent('Typography')
      ),
      { ssr: false, loading: () => <div>Loading Typography...</div> }
    ),
    Paragraph: dynamic(() => 
      safeDynamicImport(
        import('@/components/ui/atoms/typography/Paragraph'),
        'Paragraph',
        createErrorComponent('Paragraph')
      ),
      { ssr: false, loading: () => <div>Loading Paragraph...</div> }
    ),
    Text: dynamic(() => 
      safeDynamicImport(
        import('@/components/ui/atoms/typography/Text'),
        'Text',
        createErrorComponent('Text')
      ),
      { ssr: false, loading: () => <div>Loading Text...</div> }
    ),
    Heading: dynamic(() => 
      safeDynamicImport(
        import('@/components/ui/atoms/typography/Heading'),
        'Heading',
        createErrorComponent('Heading')
      ),
      { ssr: false, loading: () => <div>Loading Heading...</div> }
    ),
    // Add more critical components as needed
  };

  // Special handlers for complex components that need default props
  const specialComponentHandlers: Record<string, any> = {
    Sidebar: SidebarWithDefaultProps,
    Calendar: CalendarWithDefaultProps,
    CalendarUpcoming: CalendarUpcomingWithDefaultProps,
    DataGrid: DataGridWithDefaultProps,
    Table: TableWithDefaultProps,
  };
  
  // Combine the guaranteed components and special handlers
  const baseComponentMap = {
    ...guaranteedComponents,
    ...specialComponentHandlers
  };
  
  return baseComponentMap;
})();

// Create a registry to track loaded components
const loadedComponentsRegistry = new Map<string, any>();

interface ComponentPreviewProps {
  component: ComponentMetadata;
  onClose?: () => void;
}

/**
 * Component Preview
 * 
 * Renders a live preview of a UI component with prop controls
 */
export default function ComponentPreview({ component, onClose }: ComponentPreviewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('preview');
  const [renderError, setRenderError] = useState<Error | null>(null);
  const [componentToRender, setComponentToRender] = useState<React.ComponentType<any> | null>(null);
  
  // Props state for the component
  const [propValues, setPropValues] = useState<Record<string, any>>({});
  
  // Initialize default prop values
  useEffect(() => {
    if (!component || !component.props) return;
    
    try {
      const defaultProps: Record<string, any> = {};
      component.props.forEach(prop => {
        if (prop.defaultValue !== undefined) {
          try {
            // Convert string default values to actual values
            if (prop.type === 'boolean') {
              defaultProps[prop.name] = prop.defaultValue === 'true';
            } else if (prop.type === 'number') {
              defaultProps[prop.name] = Number(prop.defaultValue);
            } else if (prop.defaultValue.startsWith("'") && prop.defaultValue.endsWith("'")) {
              // Handle string literals in the format "'value'"
              defaultProps[prop.name] = prop.defaultValue.slice(1, -1);
            } else {
              defaultProps[prop.name] = prop.defaultValue;
            }
          } catch (e) {
            defaultProps[prop.name] = prop.defaultValue;
          }
        }
      });
      
      // Get any global default props for this component type
      const globalComponentDefaults = componentDefaultProps[component.name] || {};
      
      // Merge global defaults with component-specific defaults
      setPropValues({...globalComponentDefaults, ...defaultProps});
    } catch (err) {
      console.error("Error initializing props:", err);
      setError(`Error setting up component props: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [component]);
  
  // Load the component
  useEffect(() => {
    if (!component || !component.name) {
      setLoading(false);
      return;
    }
    
    const loadComponent = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Check if already in the registry
        const registryKey = `${component.path}:${component.name}`;
        if (loadedComponentsRegistry.has(registryKey)) {
          setComponentToRender(loadedComponentsRegistry.get(registryKey));
          setLoading(false);
          return;
        }
        
        // New condition - Check if this is a Shadcn component using library metadata
        if (component.library === 'shadcn') {
          // Use original name for namespaced components
          const componentName = component.originalName || component.name;
          if (hasComponentWrapper(componentName)) {
            const wrapper = getComponentWrapper(componentName);
            if (wrapper) {
              setComponentToRender(wrapper);
              loadedComponentsRegistry.set(registryKey, wrapper);
              setLoading(false);
              return;
            }
          }
        }
        
        // Continue with existing checks for non-Shadcn components
        // Check if the component is in our pre-defined map
        const exportName = component.exports && component.exports.length > 0 
          ? component.exports[0] 
          : component.name;
          
        if (componentMap[exportName]) {
          setComponentToRender(componentMap[exportName]);
          loadedComponentsRegistry.set(registryKey, componentMap[exportName]);
          setLoading(false);
          return;
        }
        
        if (componentMap[component.name]) {
          setComponentToRender(componentMap[component.name]);
          loadedComponentsRegistry.set(registryKey, componentMap[component.name]);
          setLoading(false);
          return;
        }
        
        // Check if this is a component with a dedicated wrapper
        if (hasComponentWrapper(component.name)) {
          const wrapper = getComponentWrapper(component.name);
          setComponentToRender(wrapper);
          loadedComponentsRegistry.set(registryKey, wrapper);
          setLoading(false);
          return;
        }
        
        // If not found in pre-defined map, try to dynamically load it
        if (component.path) {
          console.log(`Dynamically loading ${component.name} from ${component.path}`);
          
          // Normalize the import path
          const importPath = component.path
            .replace(/\/$/, '') // Remove trailing slash if present
            .replace(/\.tsx$|\.jsx$/, ''); // Remove file extension if present
          
          // Create a dynamic component
          const DynamicComponent = dynamic(
            () => safeDynamicImport(
              import(/* @vite-ignore */ importPath),
              exportName,
              createErrorComponent(component.name)
            ),
            { 
              loading: () => <div className="flex justify-center items-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-2"></div>
                <span>Loading {component.name}...</span>
              </div>,
              ssr: false
            }
          );
          
          setComponentToRender(DynamicComponent);
          loadedComponentsRegistry.set(registryKey, DynamicComponent);
        } else {
          throw new Error(`No path specified for component ${component.name}`);
        }
      } catch (err) {
        console.error(`Error loading component ${component.name}:`, err);
        setError(`Failed to load component: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setLoading(false);
      }
    };
    
    loadComponent();
  }, [component]);
  
  // Render component with error boundary
  const renderComponent = () => {
    if (!componentToRender) return null;
    
    try {
      return (
        <React.Suspense fallback={
          <div className="flex items-center justify-center p-8">
            <Icon iconId="faSpinnerLight"  className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        }>
          <ErrorBoundary
            fallbackRender={({ error, resetErrorBoundary }) => (
              <div className="p-4 border border-red-300 rounded bg-red-50 text-red-700">
                <h3 className="font-medium mb-2">Component Failed to Render</h3>
                <p className="text-sm mb-2">The component could not be rendered due to an error:</p>
                <pre className="text-xs bg-red-100 p-2 rounded overflow-auto max-h-40">{error.message}</pre>
                {error.stack && (
                  <details className="mt-2">
                    <summary className="text-xs cursor-pointer hover:text-red-900">View Stack Trace</summary>
                    <pre className="mt-1 text-xs bg-red-100 p-2 rounded overflow-auto max-h-40">
                      {error.stack}
                    </pre>
                  </details>
                )}
                <div className="mt-4 flex items-center justify-between">
                  <button 
                    onClick={resetErrorBoundary}
                    className="px-3 py-1 bg-red-200 hover:bg-red-300 rounded text-sm"
                  >
                    Try Again
                  </button>
                  <span className="text-xs text-gray-500">Component: {component.name}</span>
                </div>
              </div>
            )}
            onError={(error: Error, info: React.ErrorInfo) => {
              // Enhanced logging with component details
              console.error(`Error rendering component ${component.name}:`, {
                component,
                error,
                componentInfo: info,
                props: propValues
              });
              
              // Log to server or analytics if needed
              try {
                // You could add server logging here in the future
                // e.g., logToServer({ component, error, info });
              } catch (logError) {
                console.error('Failed to log error:', logError);
              }
              
              setRenderError(error);
            }}
            onReset={() => {
              console.log(`Resetting error boundary for ${component.name}`);
              setRenderError(null);
            }}
          >
            {React.createElement(componentToRender, propValues)}
          </ErrorBoundary>
        </React.Suspense>
      );
    } catch (err) {
      console.error('Error rendering component', err);
      setRenderError(err instanceof Error ? err : new Error(String(err)));
      return (
        <div className="p-4 border border-red-300 rounded bg-red-50 text-red-700">
          <h3 className="font-medium mb-2">Component Initialization Failed</h3>
          <p className="text-sm mb-2">The component could not be initialized:</p>
          <pre className="text-xs bg-red-100 p-2 rounded overflow-auto max-h-40">
            {err instanceof Error ? err.message : String(err)}
          </pre>
          <div className="mt-4 flex items-center justify-between">
            <button 
              onClick={() => setRenderError(null)}
              className="px-3 py-1 bg-red-200 hover:bg-red-300 rounded text-sm"
            >
              Try Again
            </button>
            <span className="text-xs text-gray-500">Component: {component.name}</span>
          </div>
        </div>
      );
    }
  };
  
  // Handle prop change
  const handlePropChange = (propName: string, value: any) => {
    setPropValues(prev => ({
      ...prev,
      [propName]: value
    }));
  };
  
  // Generate example code
  const generateExampleCode = () => {
    if (!component || !component.name) return '';
    
    const exportName = component.exports && component.exports.length > 0 
      ? component.exports[0] 
      : component.name;
    
    const propsCode = Object.entries(propValues)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => {
        if (typeof value === 'string') {
          return `${key}="${value}"`;
        } else if (typeof value === 'boolean') {
          return value ? key : `${key}={false}`;
        } else {
          return `${key}={${JSON.stringify(value)}}`;
        }
      })
      .join(' ');
    
    return `<${exportName} ${propsCode} />`;
  };
  
  // Render loading state
  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="py-10 flex justify-center">
          <Icon iconId="faSpinnerLight"  className="h-8 w-8 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="py-6">
          <div className="text-red-500">{error}</div>
        </CardContent>
      </Card>
    );
  }
  
  // If component not found
  if (!componentToRender) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{component.name}</CardTitle>
        </CardHeader>
        <CardContent className="py-6">
          <div className="p-4 border border-amber-300 rounded bg-amber-50 text-amber-800">
            <h3 className="font-medium mb-2">Component Not Available</h3>
            <p className="text-sm mb-3">
              This component is registered in the component registry but could not be dynamically loaded.
            </p>
            
            <details className="mt-2">
              <summary className="text-xs cursor-pointer hover:text-amber-900 font-medium">Component Details</summary>
              <div className="mt-2 text-xs space-y-1">
                <div><strong>Name:</strong> {component.name}</div>
                <div><strong>Path:</strong> {component.path}</div>
                {component.exports && component.exports.length > 0 && (
                  <div><strong>Exports:</strong> {component.exports.join(', ')}</div>
                )}
                {component.category && <div><strong>Category:</strong> {component.category}</div>}
              </div>
            </details>
            
            <details className="mt-2">
              <summary className="text-xs cursor-pointer hover:text-amber-900 font-medium">Troubleshooting</summary>
              <div className="mt-2 text-xs space-y-1 p-2 bg-amber-100 rounded">
                <p>Possible reasons for this issue:</p>
                <ul className="list-disc list-inside pl-2 space-y-1">
                  <li>The component file path in the registry is incorrect</li>
                  <li>The component is not exported correctly from its module</li>
                  <li>There was an error during the dynamic import process</li>
                  <li>The component requires specific context providers that aren't available</li>
                </ul>
                <p className="mt-2">Try checking the browser console for more detailed error messages.</p>
              </div>
            </details>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center">
          <span>{component.name}</span>
          {onClose && (
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          )}
        </CardTitle>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="px-4">
          <TabsTrigger value="preview" className="flex items-center">
            <Icon iconId="faEyeLight"  className="w-4 h-4 mr-2" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="code" className="flex items-center">
            <Icon iconId="faCodeLight"  className="w-4 h-4 mr-2" />
            Code
          </TabsTrigger>
          <TabsTrigger value="props" className="flex items-center">
            <Icon iconId="faGearLight"  className="w-4 h-4 mr-2" />
            Props
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="preview" className="p-6">
          <div className="flex items-center justify-center p-6 border rounded-md bg-gray-50 min-h-[200px]">
            {renderError ? (
              <div className="p-4 border border-red-200 rounded bg-red-50 text-red-600 max-w-md">
                <h3 className="font-medium mb-2">Error rendering component</h3>
                <div className="text-sm overflow-auto max-h-40">
                  {renderError.message}
                  {renderError.stack && (
                    <pre className="mt-2 text-xs overflow-auto p-2 bg-red-100 rounded">
                      {renderError.stack.split('\n').slice(0, 5).join('\n')}
                    </pre>
                  )}
                </div>
                <button 
                  onClick={() => setRenderError(null)}
                  className="mt-4 px-3 py-1 bg-red-100 hover:bg-red-200 rounded text-sm"
                >
                  Retry
                </button>
              </div>
            ) : renderComponent()}
          </div>
        </TabsContent>
        
        <TabsContent value="code" className="p-6">
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto">
            <code>{generateExampleCode()}</code>
          </pre>
        </TabsContent>
        
        <TabsContent value="props" className="p-6">
          {component.props && component.props.length > 0 ? (
            <div className="space-y-4">
              {component.props.map(prop => (
                <div key={prop.name} className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium">
                      {prop.name}
                      {prop.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <span className="text-xs text-gray-500">{prop.type}</span>
                  </div>
                  
                  {/* Render different input types based on prop type */}
                  {prop.type === 'boolean' ? (
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={!!propValues[prop.name]}
                        onChange={e => handlePropChange(prop.name, e.target.checked)}
                        className="mr-2 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-sm">{propValues[prop.name] ? 'True' : 'False'}</span>
                    </div>
                  ) : prop.type === 'number' ? (
                    <input
                      type="number"
                      value={propValues[prop.name] || ''}
                      onChange={e => handlePropChange(prop.name, Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
                    />
                  ) : prop.type === 'string' && (prop.name === 'variant' || prop.name === 'size') ? (
                    <select
                      value={propValues[prop.name] || ''}
                      onChange={e => handlePropChange(prop.name, e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
                    >
                      <option value="">Select {prop.name}</option>
                      {prop.name === 'variant' && (
                        <>
                          <option value="default">default</option>
                          <option value="primary">primary</option>
                          <option value="secondary">secondary</option>
                          <option value="outline">outline</option>
                          <option value="ghost">ghost</option>
                        </>
                      )}
                      {prop.name === 'size' && (
                        <>
                          <option value="sm">sm</option>
                          <option value="md">md</option>
                          <option value="lg">lg</option>
                        </>
                      )}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={propValues[prop.name] || ''}
                      onChange={e => handlePropChange(prop.name, e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
                    />
                  )}
                  
                  {prop.description && (
                    <p className="text-xs text-gray-500 mt-1">{prop.description}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500">No props available for this component</div>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
} 