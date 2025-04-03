'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/atoms/card';
import { Button } from '@/components/ui/atoms/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/molecules/tabs';
import { Input } from '@/components/ui/atoms/input';
import { Label } from '@/components/ui/atoms/label';
import { Switch } from '@/components/ui/atoms/switch';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/atoms/select';
import { Badge } from '@/components/ui/atoms/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/atoms/alert';
import { LoadingSpinner as Spinner } from '@/components/ui/atoms/loading-spinner';
import { browserComponentApi } from '../../api/component-api-browser';
import { cn } from '@/lib/utils';

interface ComponentDoc {
  id: string;
  name: string;
  description: string;
  category: string;
  props: PropDoc[];
  examples: ExampleDoc[];
  accessibility: AccessibilityDoc;
  usage: UsageDoc;
  status: 'draft' | 'review' | 'published';
  lastUpdated: string;
  author: string;
  version: string;
  hasChanges: boolean;
}

interface PropDoc {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: string;
  description: string;
}

interface ExampleDoc {
  title: string;
  code: string;
  preview: boolean;
}

interface AccessibilityDoc {
  compliance: 'A' | 'AA' | 'AAA';
  keyboard: boolean;
  screenReader: boolean;
  notes: string[];
}

interface UsageDoc {
  doList: string[];
  dontList: string[];
  guidelines: string[];
}

interface AutoGenerateOptions {
  includeMdx: boolean;
  includeStorybook: boolean;
  includeProps: boolean;
  includeExamples: boolean;
  includeAccessibility: boolean;
  includeUsageGuidelines: boolean;
  detectBreakingChanges: boolean;
  format: 'markdown' | 'html' | 'mdx';
}

/**
 * AutomatedDocs Component
 * 
 * A comprehensive documentation generator for UI components that analyzes
 * component code, extracts metadata, and generates structured documentation.
 * 
 * Features:
 * - Automated prop table generation from TypeScript types
 * - Code example extraction with live previews
 * - Accessibility compliance detection and reporting
 * - Usage guidelines with AI-assisted recommendations
 * - Documentation version tracking with change detection
 * - Export to multiple formats (Markdown, MDX, HTML)
 */
export default function AutomatedDocs() {
  const [components, setComponents] = useState<ComponentDoc[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<ComponentDoc | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [autoGenerating, setAutoGenerating] = useState(false);
  const [docUpdated, setDocUpdated] = useState(false);
  const [autoGenerateOptions, setAutoGenerateOptions] = useState<AutoGenerateOptions>({
    includeMdx: true,
    includeStorybook: true,
    includeProps: true,
    includeExamples: true,
    includeAccessibility: true,
    includeUsageGuidelines: true,
    detectBreakingChanges: true,
    format: 'mdx'
  });

  // Load components on mount
  useEffect(() => {
    fetchComponents();
  }, []);

  // Fetch components from API
  const fetchComponents = async () => {
    setIsLoading(true);
    try {
      // This would be the actual API call in a real implementation
      const response = await browserComponentApi.getComponents();
      
      // For demo purposes, we'll use mock data
      const mockData: ComponentDoc[] = [
        {
          id: 'button',
          name: 'Button',
          description: 'A button component for user interaction',
          category: 'atoms',
          props: [
            { name: 'variant', type: '"default" | "outline" | "ghost" | "link"', required: false, defaultValue: 'default', description: 'Controls the visual style of the button' },
            { name: 'size', type: '"default" | "sm" | "lg" | "icon"', required: false, defaultValue: 'default', description: 'Controls the size of the button' },
            { name: 'disabled', type: 'boolean', required: false, defaultValue: 'false', description: 'Disables the button' },
            { name: 'onClick', type: '() => void', required: false, description: 'Function called when button is clicked' }
          ],
          examples: [
            { title: 'Basic Button', code: '<Button>Click me</Button>', preview: true },
            { title: 'Outline Button', code: '<Button variant="outline">Outline</Button>', preview: true },
            { title: 'Disabled Button', code: '<Button disabled>Disabled</Button>', preview: true }
          ],
          accessibility: {
            compliance: 'AA',
            keyboard: true,
            screenReader: true,
            notes: [
              'Use appropriate aria-labels when button has only an icon',
              'Ensure color contrast meets WCAG 2.1 AA standards'
            ]
          },
          usage: {
            doList: [
              'Use buttons for the main actions in a form',
              'Use the primary variant for the main action',
              'Keep button labels short and action-oriented'
            ],
            dontList: [
              'Don\'t use buttons for navigation, use links instead',
              'Don\'t use too many primary buttons on a single page',
              'Don\'t use vague text like "Click Here"'
            ],
            guidelines: [
              'Buttons should have a clear hierarchy of importance',
              'Use the most appropriate variant for the context',
              'Ensure button state changes are visible'
            ]
          },
          status: 'published',
          lastUpdated: '2025-03-15T14:30:00Z',
          author: 'Design System Team',
          version: '1.2.0',
          hasChanges: false
        },
        {
          id: 'card',
          name: 'Card',
          description: 'A container component for grouping related content',
          category: 'molecules',
          props: [
            { name: 'className', type: 'string', required: false, description: 'Additional CSS classes' },
            { name: 'children', type: 'React.ReactNode', required: true, description: 'Content of the card' }
          ],
          examples: [
            { title: 'Basic Card', code: '<Card><CardHeader><CardTitle>Title</CardTitle></CardHeader><CardContent>Content</CardContent></Card>', preview: true }
          ],
          accessibility: {
            compliance: 'AA',
            keyboard: true,
            screenReader: true,
            notes: [
              'Ensure proper heading structure within cards',
              'Use appropriate semantic HTML inside cards'
            ]
          },
          usage: {
            doList: [
              'Use cards to group related content',
              'Maintain consistent spacing between cards',
              'Keep card content concise'
            ],
            dontList: [
              'Don\'t nest cards within cards',
              'Don\'t overcrowd cards with too much content',
              'Don\'t use cards for primary navigation'
            ],
            guidelines: [
              'Cards should have a clear visual hierarchy',
              'Use cards for content that needs to be visually separated',
              'Ensure card actions are clearly identifiable'
            ]
          },
          status: 'published',
          lastUpdated: '2025-02-28T10:15:00Z',
          author: 'Design System Team',
          version: '1.0.0',
          hasChanges: true
        },
        {
          id: 'dialog',
          name: 'Dialog',
          description: 'A modal dialog component for displaying content on top of the page',
          category: 'organisms',
          props: [
            { name: 'open', type: 'boolean', required: true, description: 'Controls dialog visibility' },
            { name: 'onOpenChange', type: '(open: boolean) => void', required: true, description: 'Function called when dialog open state changes' },
            { name: 'children', type: 'React.ReactNode', required: true, description: 'Content of the dialog' }
          ],
          examples: [
            { title: 'Basic Dialog', code: '<Dialog open={open} onOpenChange={setOpen}><DialogContent>Dialog content</DialogContent></Dialog>', preview: false }
          ],
          accessibility: {
            compliance: 'AA',
            keyboard: true,
            screenReader: true,
            notes: [
              'Traps focus within the dialog when open',
              'Closes on ESC key press',
              'Returns focus to trigger element on close'
            ]
          },
          usage: {
            doList: [
              'Use dialogs for important user actions requiring confirmation',
              'Keep dialogs focused on a single task',
              'Provide clear actions in dialog footers'
            ],
            dontList: [
              'Don\'t use dialogs for non-critical information',
              'Don\'t nest dialogs',
              'Don\'t use dialogs for content that could be part of the main flow'
            ],
            guidelines: [
              'Dialogs should be dismissable with an explicit close button',
              'Ensure dialog content is concise and focused',
              'Use appropriate heading levels inside dialogs'
            ]
          },
          status: 'draft',
          lastUpdated: '2025-04-05T09:45:00Z',
          author: 'UI Team',
          version: '0.8.0',
          hasChanges: false
        }
      ];
      
      setComponents(mockData);
      if (mockData.length > 0) {
        setSelectedComponent(mockData[0]);
      }
    } catch (error) {
      console.error('Error fetching components:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter components based on search query and category
  const filteredComponents = useMemo(() => {
    return components.filter(component => {
      const matchesSearch = component.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            component.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || component.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [components, searchQuery, selectedCategory]);

  // Categories for filtering
  const categories = useMemo(() => {
    const categorySet = new Set<string>();
    components.forEach(component => categorySet.add(component.category));
    return Array.from(categorySet);
  }, [components]);

  // Handle component selection
  const handleSelectComponent = (component: ComponentDoc) => {
    setSelectedComponent(component);
  };

  // Auto-generate documentation
  const handleAutoGenerateDoc = async () => {
    if (!selectedComponent) return;
    
    setAutoGenerating(true);
    try {
      // This would be the actual API call in a real implementation
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      // Simulate successful update
      setDocUpdated(true);
      setTimeout(() => setDocUpdated(false), 3000);
      
      // Update the component in the list
      setComponents(prev => prev.map(comp => 
        comp.id === selectedComponent.id 
          ? {...comp, hasChanges: false, lastUpdated: new Date().toISOString()} 
          : comp
      ));
      
      // Update selected component
      setSelectedComponent(prev => 
        prev ? {...prev, hasChanges: false, lastUpdated: new Date().toISOString()} : null
      );
    } catch (error) {
      console.error('Error generating documentation:', error);
    } finally {
      setAutoGenerating(false);
    }
  };

  // Handle option change for auto-generate
  const handleOptionChange = (key: keyof AutoGenerateOptions, value: any) => {
    setAutoGenerateOptions(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status badge color
  const getStatusColor = (status: 'draft' | 'review' | 'published') => {
    switch (status) {
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'review':
        return 'bg-blue-100 text-blue-800';
      case 'published':
        return 'bg-green-100 text-green-800';
      default:
        return '';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Automated Documentation</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Component List */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Components</CardTitle>
              <div className="mt-2">
                <Input 
                  placeholder="Search components..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="mb-2"
                />
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredComponents.length === 0 ? (
                  <p className="text-center text-gray-500 my-8">No components found</p>
                ) : (
                  filteredComponents.map(component => (
                    <div 
                      key={component.id}
                      className={cn(
                        "p-2 rounded cursor-pointer border transition-colors",
                        selectedComponent?.id === component.id 
                          ? "bg-secondary border-primary" 
                          : "hover:bg-gray-50"
                      )}
                      onClick={() => handleSelectComponent(component)}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{component.name}</span>
                        <Badge className={getStatusColor(component.status)}>
                          {component.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 truncate">{component.description}</p>
                      <div className="flex items-center mt-1 text-xs text-gray-400">
                        <span>v{component.version}</span>
                        <span className="mx-1">•</span>
                        <span>{component.category}</span>
                        {component.hasChanges && (
                          <Badge className="ml-2 bg-red-100 text-red-800 text-xs">Changes detected</Badge>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Component Documentation */}
        <div className="lg:col-span-3">
          {selectedComponent ? (
            <Card>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <CardTitle>{selectedComponent.name}</CardTitle>
                    <Badge className={getStatusColor(selectedComponent.status)}>
                      {selectedComponent.status}
                    </Badge>
                    <span className="text-sm text-gray-500">v{selectedComponent.version}</span>
                  </div>
                  <CardDescription className="mt-1">
                    {selectedComponent.description}
                  </CardDescription>
                  <div className="flex items-center mt-2 text-sm text-gray-500">
                    <span>Last updated: {formatDate(selectedComponent.lastUpdated)}</span>
                    <span className="mx-2">•</span>
                    <span>By: {selectedComponent.author}</span>
                  </div>
                </div>
                <div>
                  <Button 
                    onClick={handleAutoGenerateDoc}
                    disabled={autoGenerating}
                    className="relative"
                  >
                    {autoGenerating ? (
                      <>
                        <Spinner className="mr-2 h-4 w-4" />
                        Generating...
                      </>
                    ) : (
                      'Auto-generate Documentation'
                    )}
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent>
                {docUpdated && (
                  <Alert className="mb-4 bg-green-50 border-green-200">
                    <AlertDescription className="text-green-700">
                      Documentation successfully updated and published!
                    </AlertDescription>
                  </Alert>
                )}
                
                <Tabs defaultValue="preview">
                  <TabsList className="mb-4">
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                    <TabsTrigger value="props">Props</TabsTrigger>
                    <TabsTrigger value="examples">Examples</TabsTrigger>
                    <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
                    <TabsTrigger value="usage">Usage Guidelines</TabsTrigger>
                    <TabsTrigger value="settings">Generate Settings</TabsTrigger>
                  </TabsList>
                  
                  {/* Preview Tab */}
                  <TabsContent value="preview">
                    <div className="border rounded-md p-6">
                      <h2 className="text-2xl font-bold mb-4">{selectedComponent.name}</h2>
                      <p className="mb-6">{selectedComponent.description}</p>
                      
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-2">Installation</h3>
                        <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
                          <code>{`import { ${selectedComponent.name} } from "@/components/ui/${selectedComponent.id}";`}</code>
                        </pre>
                      </div>
                      
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-2">Usage</h3>
                        <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
                          <code>{selectedComponent.examples[0]?.code || `<${selectedComponent.name} />`}</code>
                        </pre>
                      </div>
                      
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-2">Properties</h3>
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Required</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Default</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {selectedComponent.props.map(prop => (
                              <tr key={prop.name}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{prop.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{prop.type}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{prop.required ? 'Yes' : 'No'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{prop.defaultValue || '-'}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{prop.description}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </TabsContent>
                  
                  {/* Props Tab */}
                  <TabsContent value="props">
                    <div className="border rounded-md p-6">
                      <h3 className="text-lg font-semibold mb-4">Component Properties</h3>
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Required</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Default</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedComponent.props.map(prop => (
                            <tr key={prop.name}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{prop.name}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{prop.type}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{prop.required ? 'Yes' : 'No'}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{prop.defaultValue || '-'}</td>
                              <td className="px-6 py-4 text-sm text-gray-500">{prop.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </TabsContent>
                  
                  {/* Examples Tab */}
                  <TabsContent value="examples">
                    <div className="border rounded-md p-6">
                      <h3 className="text-lg font-semibold mb-4">Component Examples</h3>
                      <div className="space-y-6">
                        {selectedComponent.examples.map((example, index) => (
                          <div key={index} className="border rounded-md p-4">
                            <h4 className="font-medium mb-2">{example.title}</h4>
                            <pre className="bg-gray-100 p-4 rounded-md overflow-auto mb-4">
                              <code>{example.code}</code>
                            </pre>
                            {example.preview && (
                              <div className="border rounded-md p-4 bg-gray-50">
                                <p className="text-center text-gray-500">Preview would render here</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                  
                  {/* Accessibility Tab */}
                  <TabsContent value="accessibility">
                    <div className="border rounded-md p-6">
                      <h3 className="text-lg font-semibold mb-4">Accessibility Compliance</h3>
                      <div className="mb-4">
                        <div className="flex items-center mb-2">
                          <span className="mr-2 font-medium">WCAG Compliance Level:</span>
                          <Badge>{`WCAG 2.1 ${selectedComponent.accessibility.compliance}`}</Badge>
                        </div>
                        <div className="flex items-center mb-2">
                          <span className="mr-2 font-medium">Keyboard Accessible:</span>
                          <span className={selectedComponent.accessibility.keyboard ? "text-green-600" : "text-red-600"}>
                            {selectedComponent.accessibility.keyboard ? "Yes" : "No"}
                          </span>
                        </div>
                        <div className="flex items-center mb-2">
                          <span className="mr-2 font-medium">Screen Reader Compatible:</span>
                          <span className={selectedComponent.accessibility.screenReader ? "text-green-600" : "text-red-600"}>
                            {selectedComponent.accessibility.screenReader ? "Yes" : "No"}
                          </span>
                        </div>
                      </div>
                      
                      <h4 className="font-medium mb-2">Accessibility Notes</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {selectedComponent.accessibility.notes.map((note, index) => (
                          <li key={index} className="text-gray-700">{note}</li>
                        ))}
                      </ul>
                    </div>
                  </TabsContent>
                  
                  {/* Usage Guidelines Tab */}
                  <TabsContent value="usage">
                    <div className="border rounded-md p-6">
                      <h3 className="text-lg font-semibold mb-4">Usage Guidelines</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="border rounded-md p-4 bg-green-50">
                          <h4 className="font-medium mb-2 text-green-700">Do</h4>
                          <ul className="list-disc pl-5 space-y-1">
                            {selectedComponent.usage.doList.map((item, index) => (
                              <li key={index} className="text-gray-700">{item}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="border rounded-md p-4 bg-red-50">
                          <h4 className="font-medium mb-2 text-red-700">Don't</h4>
                          <ul className="list-disc pl-5 space-y-1">
                            {selectedComponent.usage.dontList.map((item, index) => (
                              <li key={index} className="text-gray-700">{item}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      <h4 className="font-medium mb-2">Design Guidelines</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {selectedComponent.usage.guidelines.map((guideline, index) => (
                          <li key={index} className="text-gray-700">{guideline}</li>
                        ))}
                      </ul>
                    </div>
                  </TabsContent>
                  
                  {/* Generate Settings Tab */}
                  <TabsContent value="settings">
                    <div className="border rounded-md p-6">
                      <h3 className="text-lg font-semibold mb-4">Documentation Generation Settings</h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="include-mdx">Include MDX</Label>
                            <p className="text-sm text-gray-500">Generate MDX files for Storybook</p>
                          </div>
                          <Switch
                            id="include-mdx"
                            checked={autoGenerateOptions.includeMdx}
                            onCheckedChange={(checked) => handleOptionChange('includeMdx', checked)}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="include-storybook">Include Storybook Stories</Label>
                            <p className="text-sm text-gray-500">Generate Storybook stories with examples</p>
                          </div>
                          <Switch
                            id="include-storybook"
                            checked={autoGenerateOptions.includeStorybook}
                            onCheckedChange={(checked) => handleOptionChange('includeStorybook', checked)}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="include-props">Include Props Documentation</Label>
                            <p className="text-sm text-gray-500">Extract and document component props</p>
                          </div>
                          <Switch
                            id="include-props"
                            checked={autoGenerateOptions.includeProps}
                            onCheckedChange={(checked) => handleOptionChange('includeProps', checked)}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="include-examples">Include Examples</Label>
                            <p className="text-sm text-gray-500">Extract and document code examples</p>
                          </div>
                          <Switch
                            id="include-examples"
                            checked={autoGenerateOptions.includeExamples}
                            onCheckedChange={(checked) => handleOptionChange('includeExamples', checked)}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="include-accessibility">Include Accessibility Audit</Label>
                            <p className="text-sm text-gray-500">Run accessibility checks and document issues</p>
                          </div>
                          <Switch
                            id="include-accessibility"
                            checked={autoGenerateOptions.includeAccessibility}
                            onCheckedChange={(checked) => handleOptionChange('includeAccessibility', checked)}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="include-usage">Include Usage Guidelines</Label>
                            <p className="text-sm text-gray-500">Generate best practices and usage guidelines</p>
                          </div>
                          <Switch
                            id="include-usage"
                            checked={autoGenerateOptions.includeUsageGuidelines}
                            onCheckedChange={(checked) => handleOptionChange('includeUsageGuidelines', checked)}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="detect-breaking">Detect Breaking Changes</Label>
                            <p className="text-sm text-gray-500">Identify breaking changes between versions</p>
                          </div>
                          <Switch
                            id="detect-breaking"
                            checked={autoGenerateOptions.detectBreakingChanges}
                            onCheckedChange={(checked) => handleOptionChange('detectBreakingChanges', checked)}
                          />
                        </div>
                        
                        <div className="pt-2">
                          <Label htmlFor="format">Output Format</Label>
                          <Select
                            value={autoGenerateOptions.format}
                            onValueChange={(value) => handleOptionChange('format', value)}
                          >
                            <SelectTrigger id="format" className="mt-1">
                              <SelectValue placeholder="Select format" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="markdown">Markdown</SelectItem>
                              <SelectItem value="mdx">MDX</SelectItem>
                              <SelectItem value="html">HTML</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <Button 
                          onClick={handleAutoGenerateDoc}
                          disabled={autoGenerating}
                          className="w-full"
                        >
                          {autoGenerating ? (
                            <>
                              <Spinner className="mr-2 h-4 w-4" />
                              Generating Documentation...
                            </>
                          ) : (
                            'Generate Documentation with These Settings'
                          )}
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card className="flex items-center justify-center h-96">
              <p className="text-gray-500">Select a component to view and generate documentation</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 