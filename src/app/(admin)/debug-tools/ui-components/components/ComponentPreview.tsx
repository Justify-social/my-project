'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardHeader, CardTitle, CardContent } from './ui-components-bridge';
import { ComponentMetadata, PropDefinition } from '../types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui-components-bridge';
import { Loader2, Code, Play, Settings, Eye } from 'lucide-react';

/**
 * Helper to safely handle dynamic imports with fallback for both default and named exports
 * @param importPromise The dynamic import promise
 * @param componentName The name of the component to extract
 * @param fallback Fallback component to use if import fails
 */
const safeDynamicImport = (importPromise: Promise<any>, componentName: string, fallback: React.ComponentType<any>) => {
  return importPromise
    .then(mod => {
      // Handle different export patterns:
      // 1. Named export matching component name: mod[componentName]
      // 2. Default export: mod.default
      // 3. Named export as 'default' property: mod.default[componentName]
      if (mod[componentName]) {
        return mod[componentName];
      } else if (mod.default) {
        // Could be either a direct default export or an object with the component
        return typeof mod.default === 'object' && mod.default[componentName] 
          ? mod.default[componentName] 
          : mod.default;
      } else {
        console.warn(`Could not find component ${componentName} in module:`, mod);
        return fallback;
      }
    })
    .catch(err => {
      console.error(`Failed to load ${componentName} component:`, err);
      return fallback;
    });
};

/**
 * Creates a fallback error component
 */
function createErrorComponent(name: string) {
  return function ErrorComponent(props: any) {
    return (
      <div className="p-4 border border-red-200 bg-red-50 rounded-md text-sm text-red-500">
        <p className="font-semibold">Error: Could not load {name} component</p>
        <p className="text-xs mt-1">Check the console for more details.</p>
      </div>
    );
  };
}

// Component imports map - this is crucial for dynamic rendering
const componentMap: Record<string, any> = {
  // Atoms
  Button: dynamic(() => safeDynamicImport(
    import('@/components/ui/atoms/button/Button'), 
    'Button', 
    createErrorComponent('Button')
  )),
  ButtonWithIcon: dynamic(() => safeDynamicImport(
    import('@/components/ui/atoms/button/ButtonWithIcon'), 
    'ButtonWithIcon', 
    createErrorComponent('ButtonWithIcon')
  )),
  IconButton: dynamic(() => safeDynamicImport(
    import('@/components/ui/atoms/button/IconButton'), 
    'IconButton', 
    createErrorComponent('IconButton')
  )),
  ActionButtons: dynamic(() => safeDynamicImport(
    import('@/components/ui/atoms/button/ActionButtons'), 
    'ActionButtons', 
    createErrorComponent('ActionButtons')
  )),
  Card: dynamic(() => safeDynamicImport(
    import('@/components/ui/atoms/card/Card'), 
    'Card', 
    createErrorComponent('Card')
  )),
  CardContent: dynamic(() => safeDynamicImport(
    import('@/components/ui/atoms/card/Card'), 
    'CardContent', 
    createErrorComponent('CardContent')
  )),
  CardHeader: dynamic(() => safeDynamicImport(
    import('@/components/ui/atoms/card/Card'), 
    'CardHeader', 
    createErrorComponent('CardHeader')
  )),
  CardTitle: dynamic(() => safeDynamicImport(
    import('@/components/ui/atoms/card/Card'), 
    'CardTitle', 
    createErrorComponent('CardTitle')
  )),
  CardDescription: dynamic(() => safeDynamicImport(
    import('@/components/ui/atoms/card/Card'), 
    'CardDescription', 
    createErrorComponent('CardDescription')
  )),
  Badge: dynamic(() => safeDynamicImport(
    import('@/components/ui/atoms/badge/badge'), 
    'Badge', 
    createErrorComponent('Badge')
  )),
  Input: dynamic(() => safeDynamicImport(
    import('@/components/ui/atoms/input/Input'), 
    'Input', 
    createErrorComponent('Input')
  )),
  Toggle: dynamic(() => safeDynamicImport(
    import('@/components/ui/atoms/toggle/Toggle'), 
    'Toggle', 
    createErrorComponent('Toggle')
  )),
  Switch: dynamic(() => safeDynamicImport(
    import('@/components/ui/atoms/switch/Switch'), 
    'Switch', 
    createErrorComponent('Switch')
  )),
  Checkbox: dynamic(() => safeDynamicImport(
    import('@/components/ui/atoms/checkbox/Checkbox'), 
    'Checkbox', 
    createErrorComponent('Checkbox')
  )),
  Radio: dynamic(() => safeDynamicImport(
    import('@/components/ui/atoms/radio/Radio'), 
    'Radio', 
    createErrorComponent('Radio')
  )),
  Select: dynamic(() => safeDynamicImport(
    import('@/components/ui/atoms/select/Select'), 
    'Select', 
    createErrorComponent('Select')
  )),
  Textarea: dynamic(() => safeDynamicImport(
    import('@/components/ui/atoms/textarea/Textarea'), 
    'Textarea', 
    createErrorComponent('Textarea')
  )),
  Spinner: dynamic(() => safeDynamicImport(
    import('@/components/ui/atoms/spinner/Spinner'), 
    'Spinner', 
    createErrorComponent('Spinner')
  )),
  Icon: dynamic(() => safeDynamicImport(
    import('@/components/ui/atoms/icons/Icon'), 
    'Icon', 
    createErrorComponent('Icon')
  )),
  
  // Molecules
  Accordion: dynamic(() => safeDynamicImport(
    import('@/components/ui/molecules/accordion/accordion'), 
    'Accordion', 
    createErrorComponent('Accordion')
  )),
  AccordionItem: dynamic(() => safeDynamicImport(
    import('@/components/ui/molecules/accordion/accordion'), 
    'AccordionItem', 
    createErrorComponent('AccordionItem')
  )),
  AccordionTrigger: dynamic(() => safeDynamicImport(
    import('@/components/ui/molecules/accordion/accordion'), 
    'AccordionTrigger', 
    createErrorComponent('AccordionTrigger')
  )),
  AccordionContent: dynamic(() => safeDynamicImport(
    import('@/components/ui/molecules/accordion/accordion'), 
    'AccordionContent', 
    createErrorComponent('AccordionContent')
  )),
  Tabs: dynamic(() => safeDynamicImport(
    import('@/components/ui/molecules/tabs/tabs'), 
    'Tabs', 
    createErrorComponent('Tabs')
  )),
  TabsList: dynamic(() => safeDynamicImport(
    import('@/components/ui/molecules/tabs/tabs'), 
    'TabsList', 
    createErrorComponent('TabsList')
  )),
  TabsTrigger: dynamic(() => safeDynamicImport(
    import('@/components/ui/molecules/tabs/tabs'), 
    'TabsTrigger', 
    createErrorComponent('TabsTrigger')
  )),
  TabsContent: dynamic(() => safeDynamicImport(
    import('@/components/ui/molecules/tabs/tabs'), 
    'TabsContent', 
    createErrorComponent('TabsContent')
  )),
  Breadcrumbs: dynamic(() => safeDynamicImport(
    import('@/components/ui/molecules/breadcrumbs/Breadcrumbs'), 
    'Breadcrumbs', 
    createErrorComponent('Breadcrumbs')
  )),
  Pagination: dynamic(() => safeDynamicImport(
    import('@/components/ui/molecules/pagination/Pagination'), 
    'Pagination', 
    createErrorComponent('Pagination')
  )),
  ScrollArea: dynamic(() => safeDynamicImport(
    import('@/components/ui/molecules/scroll-area/scroll-area'), 
    'ScrollArea', 
    createErrorComponent('ScrollArea')
  )),
  Alert: dynamic(() => safeDynamicImport(
    import('@/components/ui/molecules/feedback/alert/alert'), 
    'Alert', 
    createErrorComponent('Alert')
  )),
  FormField: dynamic(() => safeDynamicImport(
    import('@/components/ui/molecules/form-field/FormField'), 
    'FormField', 
    createErrorComponent('FormField')
  )),
  DatePicker: dynamic(() => safeDynamicImport(
    import('@/components/ui/molecules/forms/date-picker/DatePicker'), 
    'DatePicker', 
    createErrorComponent('DatePicker')
  )),
  SearchParamsWrapper: dynamic(() => safeDynamicImport(
    import('@/components/ui/molecules/search/search-params-wrapper/SearchParamsWrapper'), 
    'SearchParamsWrapper', 
    createErrorComponent('SearchParamsWrapper')
  )),
  
  // Organisms
  MobileMenu: dynamic(() => safeDynamicImport(
    import('@/components/ui/organisms/navigation/mobile-menu/MobileMenu'), 
    'MobileMenu', 
    createErrorComponent('MobileMenu')
  )),
  AssetCard: dynamic(() => safeDynamicImport(
    import('@/components/ui/organisms/AssetCard/AssetCard'), 
    'AssetCard', 
    createErrorComponent('AssetCard')
  )),
  AssetPreview: dynamic(() => safeDynamicImport(
    import('@/components/ui/organisms/AssetCard/components/AssetPreview'), 
    'AssetPreview', 
    createErrorComponent('AssetPreview')
  )),
  Calendar: dynamic(() => safeDynamicImport(
    import('@/components/ui/organisms/Calendar/Calendar'), 
    'Calendar', 
    createErrorComponent('Calendar')
  )),
  CalendarUpcoming: dynamic(() => safeDynamicImport(
    import('@/components/ui/organisms/Calendar/CalendarUpcoming'), 
    'CalendarUpcoming', 
    createErrorComponent('CalendarUpcoming')
  )),
  Modal: dynamic(() => safeDynamicImport(
    import('@/components/ui/organisms/Modal/Modal'), 
    'Modal', 
    createErrorComponent('Modal')
  )),
  DataGrid: dynamic(() => safeDynamicImport(
    import('@/components/ui/organisms/data-display/data-grid/DataGrid'), 
    'DataGrid', 
    createErrorComponent('DataGrid')
  )),
  Table: dynamic(() => safeDynamicImport(
    import('@/components/ui/organisms/data-display/table/Table'), 
    'Table', 
    createErrorComponent('Table')
  )),
  ErrorFallback: dynamic(() => safeDynamicImport(
    import('@/components/ui/organisms/error-fallback/ErrorFallback'), 
    'ErrorFallback', 
    createErrorComponent('ErrorFallback')
  )),
  OrgAlert: dynamic(() => safeDynamicImport(
    import('@/components/ui/organisms/feedback/Alert'), 
    'OrgAlert', 
    createErrorComponent('OrgAlert')
  )),
  ComponentNav: dynamic(() => safeDynamicImport(
    import('@/components/ui/organisms/navigation/component-nav/ComponentNav'), 
    'ComponentNav', 
    createErrorComponent('ComponentNav')
  )),
  Header: dynamic(() => safeDynamicImport(
    import('@/components/ui/organisms/navigation/header/Header'), 
    'Header', 
    createErrorComponent('Header')
  )),
  NavigationBar: dynamic(() => safeDynamicImport(
    import('@/components/ui/organisms/navigation/nav-bar/NavigationBar'), 
    'NavigationBar', 
    createErrorComponent('NavigationBar')
  )),
  Sidebar: dynamic(() => safeDynamicImport(
    import('@/components/ui/organisms/navigation/sidebar/Sidebar'), 
    'Sidebar', 
    createErrorComponent('Sidebar')
  )),
};

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
  
  // Props state for the component
  const [propValues, setPropValues] = useState<Record<string, any>>({});
  
  // Initialize default prop values
  useEffect(() => {
    if (!component || !component.props) return;
    
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
    
    setPropValues(defaultProps);
    setLoading(false);
  }, [component]);
  
  // Get the component to render
  const ComponentToRender = useMemo(() => {
    if (!component || !component.name) return null;
    
    // Find the component in our map
    const exportName = component.exports && component.exports.length > 0 
      ? component.exports[0] // Use the first export by default
      : component.name;
    
    return componentMap[exportName] || null;
  }, [component]);
  
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
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
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
  if (!ComponentToRender) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{component.name}</CardTitle>
        </CardHeader>
        <CardContent className="py-6">
          <div className="text-amber-500">Component not available for preview</div>
          <div className="text-sm text-gray-500 mt-2">
            This component is registered but not available in the component map for dynamic rendering.
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
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="code" className="flex items-center">
            <Code className="w-4 h-4 mr-2" />
            Code
          </TabsTrigger>
          <TabsTrigger value="props" className="flex items-center">
            <Settings className="w-4 h-4 mr-2" />
            Props
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="preview" className="p-6">
          <div className="flex items-center justify-center p-6 border rounded-md bg-gray-50 min-h-[200px]">
            <ComponentToRender {...propValues} />
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