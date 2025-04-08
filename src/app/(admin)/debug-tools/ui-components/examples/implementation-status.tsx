/**
 * @component ImplementationStatusExample
 * @description Example usage of implementation status indicators
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

type StatusType = 'complete' | 'in-progress' | 'planned' | 'deprecated';

interface ComponentStatus {
  name: string;
  status: StatusType;
  description: string;
  version?: string;
  lastUpdated?: string;
}

const getBadgeVariant = (status: StatusType) => {
  switch (status) {
    case 'complete':
      return 'bg-green-100 text-green-800 hover:bg-green-100';
    case 'in-progress':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
    case 'planned':
      return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    case 'deprecated':
      return 'bg-red-100 text-red-800 hover:bg-red-100';
    default:
      return '';
  }
};

const components: ComponentStatus[] = [
  {
    name: 'Button',
    status: 'complete',
    description: 'Standard button component with various styles and states',
    version: '1.0.0',
    lastUpdated: '2023-05-15'
  },
  {
    name: 'Card',
    status: 'complete',
    description: 'Container component for grouping related content',
    version: '1.0.0',
    lastUpdated: '2023-05-20'
  },
  {
    name: 'DataTable',
    status: 'in-progress',
    description: 'Advanced table with sorting, filtering, and pagination',
    version: '0.8.0',
    lastUpdated: '2023-06-10'
  },
  {
    name: 'FileUploader',
    status: 'planned',
    description: 'Component for uploading and managing files',
    lastUpdated: '2023-06-15'
  },
  {
    name: 'Carousel',
    status: 'deprecated',
    description: 'Slideshow component for cycling through elements',
    version: '0.5.0',
    lastUpdated: '2023-04-10'
  }
];

export default function ImplementationStatusExample() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Implementation Status</h2>
        <p className="text-gray-500">
          Status indicators to track the implementation progress of UI components.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Status Legend */}
        <div className="p-4 border rounded-lg bg-gray-50">
          <h3 className="font-medium mb-3">Status Legend</h3>
          <div className="flex flex-wrap gap-3">
            <Badge className={getBadgeVariant('complete')}>Complete</Badge>
            <Badge className={getBadgeVariant('in-progress')}>In Progress</Badge>
            <Badge className={getBadgeVariant('planned')}>Planned</Badge>
            <Badge className={getBadgeVariant('deprecated')}>Deprecated</Badge>
          </div>
        </div>

        {/* Component Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {components.map((component) => (
            <Card key={component.name} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">{component.name}</CardTitle>
                  <Badge className={getBadgeVariant(component.status)}>
                    {component.status === 'in-progress' ? 'In Progress' : 
                     component.status.charAt(0).toUpperCase() + component.status.slice(1)}
                  </Badge>
                </div>
                {component.version && (
                  <CardDescription>Version: {component.version}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-sm">{component.description}</p>
              </CardContent>
              {component.lastUpdated && (
                <CardFooter className="pt-2 text-xs text-gray-500">
                  Last updated: {component.lastUpdated}
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Implementation Progress */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Implementation Progress</h3>
        <div className="p-6 border rounded-lg">
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm font-medium">40%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '40%' }}></div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Core Components</span>
                  <span className="text-sm font-medium">80%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '80%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Form Components</span>
                  <span className="text-sm font-medium">60%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Data Display</span>
                  <span className="text-sm font-medium">30%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-yellow-600 h-2.5 rounded-full" style={{ width: '30%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Feedback Components</span>
                  <span className="text-sm font-medium">20%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-red-600 h-2.5 rounded-full" style={{ width: '20%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 