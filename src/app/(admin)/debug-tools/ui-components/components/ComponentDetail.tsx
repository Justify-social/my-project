import React from 'react';
import { Card } from '@/components/ui';
import { ComponentMetadata } from '../db/registry';
import { ShadcnWrappers } from '../utils/shadcn-wrappers';

interface ComponentDetailProps {
  component: ComponentMetadata;
}

export const ComponentDetail: React.FC<ComponentDetailProps> = ({
  component
}) => {
  // Render the component preview based on library type
  const renderComponentPreview = () => {
    // Check if this is a Shadcn component that has a wrapper
    if (component.library === 'shadcn') {
      // Safely check if there's a wrapper for this component name
      const componentName = component.name as keyof typeof ShadcnWrappers;
      
      // If we have a specific wrapper for this Shadcn component, use it
      if (ShadcnWrappers[componentName]) {
        const ComponentWrapper = ShadcnWrappers[componentName];
        return (
          <div className="border rounded-md p-6 bg-white">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Preview</h3>
            <div className="p-4 border rounded-md">
              <ComponentWrapper />
            </div>
          </div>
        );
      }
    }
    
    // Fall back to default renderer or nothing if we can't render it
    return null;
  };
  
  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-900">{component.name}</h2>
        <p className="mt-1 text-gray-500">{component.path}</p>
        {component.description && (
          <p className="mt-3 text-gray-700">{component.description}</p>
        )}
        
        {/* Display library information if available */}
        {component.library && (
          <div className="mt-2">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
              component.library === 'shadcn' 
                ? 'bg-purple-100 text-purple-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {component.library === 'shadcn' ? 'Shadcn UI' : 'Atomic Design'}
            </span>
          </div>
        )}
      </div>
      
      {/* Component Preview Section */}
      {renderComponentPreview()}

      {component.props && component.props.length > 0 && (
        <section>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Props</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Required
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Default
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {component.props.map((prop) => (
                  <tr key={prop.name}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {prop.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <code className="bg-gray-100 px-1 py-0.5 rounded">{prop.type}</code>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {prop.required ? 'Yes' : 'No'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {prop.defaultValue ? (
                        <code className="bg-gray-100 px-1 py-0.5 rounded">{prop.defaultValue}</code>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {prop.description || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {component.examples && component.examples.length > 0 && (
        <section>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Examples</h3>
          <div className="space-y-4">
            {component.examples.map((example, index) => (
              <Card key={index} className="p-4 overflow-hidden">
                <h4 className="text-md font-medium text-gray-900 mb-2">{example.name}</h4>
                {example.description && (
                  <p className="text-sm text-gray-600 mb-3">{example.description}</p>
                )}
                <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
                  <code>{example.code}</code>
                </pre>
              </Card>
            ))}
          </div>
        </section>
      )}

      {component.dependencies && component.dependencies.length > 0 && (
        <section>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Dependencies</h3>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            {component.dependencies.map((dep) => (
              <li key={dep}>{dep}</li>
            ))}
          </ul>
        </section>
      )}

      {component.usedBy && component.usedBy.length > 0 && (
        <section>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Used By</h3>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            {component.usedBy.map((usage) => (
              <li key={usage}>{usage}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

export default ComponentDetail; 