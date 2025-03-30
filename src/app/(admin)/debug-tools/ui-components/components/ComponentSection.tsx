'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/organisms/Card/Card'
import { Tabs } from '@/components/ui/molecules/tabs/basic-tabs/Tabs'
import { Badge } from '@/components/ui/molecules/feedback/Badge'
import { Table } from '@/components/ui/organisms/data-display/table/Table'
import { Code, Info, Play, Code2 } from 'lucide-react';
import { ComponentMetadata } from '../types';
import ComponentResolver from './ComponentResolver';

/**
 * Props for the ComponentSection component
 */
interface ComponentSectionProps {
  /**
   * The component metadata to display
   */
  component: ComponentMetadata;
}

/**
 * ComponentSection displays a component's metadata, examples, props, and code
 */
export default function ComponentSection({ component }: ComponentSectionProps) {
  const [activeTab, setActiveTab] = useState('preview');
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start mb-2">
          <CardTitle className="text-xl">{component.name}</CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="capitalize">
              {component.category}
            </Badge>
            {component.version && (
              <Badge variant="secondary" className="text-xs">
                v{component.version}
              </Badge>
            )}
          </div>
        </div>
        <CardDescription className="flex flex-col text-muted-foreground">
          <span className="mb-1 text-sm">{component.description}</span>
          <span className="text-xs font-mono">{component.path}</span>
        </CardDescription>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="preview" className="flex items-center">
            <Play className="h-4 w-4 mr-2" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="props" className="flex items-center">
            <Info className="h-4 w-4 mr-2" />
            Props
          </TabsTrigger>
          <TabsTrigger value="code" className="flex items-center">
            <Code2 className="h-4 w-4 mr-2" />
            Code
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="preview" className="flex-1 p-0">
          <CardContent className="p-4">
            <h3 className="text-sm font-medium mb-3">Component Examples</h3>
            
            {component.examples && component.examples.length > 0 ? (
              <div className="space-y-6">
                {component.examples.map((example, index) => (
                  <div key={index} className="border rounded-md">
                    <div className="p-4 border-b bg-muted/30">
                      <ComponentResolver 
                        componentPath={component.path}
                        componentProps={parseExampleProps(example)}
                        showCard={false}
                      />
                    </div>
                    <pre className="text-xs p-3 bg-muted/10 overflow-x-auto">
                      <code>{example}</code>
                    </pre>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border rounded-md p-4 text-center text-muted-foreground">
                <p>No examples available for this component</p>
                <ComponentResolver 
                  componentPath={component.path} 
                  showCard={false} 
                  className="mt-4"
                />
              </div>
            )}
          </CardContent>
        </TabsContent>
        
        <TabsContent value="props" className="flex-1 p-0">
          <CardContent className="p-4">
            <h3 className="text-sm font-medium mb-3">Component Props</h3>
            
            {component.props && component.props.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Required</TableHead>
                    <TableHead>Default</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {component.props.map((prop) => (
                    <TableRow key={prop.name}>
                      <TableCell className="font-mono text-sm">{prop.name}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {prop.type}
                      </TableCell>
                      <TableCell>
                        {prop.required ? (
                          <Badge variant="default" className="text-xs">Yes</Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">No</Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {prop.defaultValue || '-'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {prop.description || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="border rounded-md p-4 text-center text-muted-foreground">
                No props documented for this component
              </div>
            )}
            
            {component.exports && component.exports.length > 1 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-3">Exported Types</h3>
                <div className="bg-muted/10 p-3 rounded-md">
                  <pre className="text-xs overflow-x-auto">
                    <code>
                      {component.exports
                        .filter(exp => exp !== component.name)
                        .join(', ')}
                    </code>
                  </pre>
                </div>
              </div>
            )}
          </CardContent>
        </TabsContent>
        
        <TabsContent value="code" className="flex-1 p-0">
          <CardContent className="p-4">
            <h3 className="text-sm font-medium mb-3">Implementation Details</h3>
            
            <div className="bg-muted/10 p-3 rounded-md">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-mono">{component.path}</span>
                <Badge variant="outline" className="text-xs">
                  Last updated: {new Date(component.lastUpdated).toLocaleDateString()}
                </Badge>
              </div>
              
              <div className="border-t pt-3">
                <h4 className="text-xs font-medium mb-1">Dependencies</h4>
                {component.dependencies && component.dependencies.length > 0 ? (
                  <ul className="text-xs space-y-1 mb-3">
                    {component.dependencies.map((dep, index) => (
                      <li key={index} className="font-mono text-muted-foreground">
                        {dep}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground mb-3">No dependencies</p>
                )}
                
                <div className="py-2 flex items-center justify-center border rounded-md">
                  <p className="text-sm text-muted-foreground">
                    Component source code viewer coming soon
                  </p>
                </div>
              </div>
            </div>
            
            {component.performanceMetrics && (
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-3">Performance Metrics</h3>
                <div className="grid grid-cols-3 gap-3">
                  <Card>
                    <CardContent className="p-3 text-center">
                      <div className="text-xs text-muted-foreground mb-1">Render Time</div>
                      <div className="text-lg font-medium">
                        {component.performanceMetrics.renderTime}ms
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3 text-center">
                      <div className="text-xs text-muted-foreground mb-1">Bundle Size</div>
                      <div className="text-lg font-medium">
                        {component.performanceMetrics.bundleSize}KB
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3 text-center">
                      <div className="text-xs text-muted-foreground mb-1">Complexity</div>
                      <div className="text-lg font-medium">
                        {component.performanceMetrics.complexityScore}/10
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </CardContent>
        </TabsContent>
      </Tabs>
    </Card>
  );
}

/**
 * Parse example string to extract props
 * This is a simplified version and would need to be more robust in production
 */
function parseExampleProps(example: string): Record<string, any> {
  const props: Record<string, any> = {};
  
  // Extract children content between tags
  const childrenMatch = example.match(/>([^<]+)</);
  if (childrenMatch) {
    props.children = childrenMatch[1];
  }
  
  // Extract basic props
  const propsRegex = /(\w+)=\{([^}]+)\}|(\w+)="([^"]+)"/g;
  let match;
  
  while ((match = propsRegex.exec(example)) !== null) {
    const propName = match[1] || match[3];
    const propValue = match[2] || match[4];
    
    // Try to parse the value
    try {
      // Handle booleans, numbers and simple objects
      if (propValue === 'true') {
        props[propName] = true;
      } else if (propValue === 'false') {
        props[propName] = false;
      } else if (!isNaN(Number(propValue))) {
        props[propName] = Number(propValue);
      } else {
        props[propName] = propValue;
      }
    } catch (e) {
      // If parsing fails, use the string value
      props[propName] = propValue;
    }
  }
  
  return props;
} 