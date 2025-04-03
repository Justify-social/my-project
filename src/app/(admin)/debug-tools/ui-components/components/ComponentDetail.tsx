import React from 'react';
import { Card } from '@/components/ui/atoms/card';
import { ComponentMetadata } from '../db/registry';

interface ComponentDetailProps {
  component: ComponentMetadata;
}

export const ComponentDetail: React.FC<ComponentDetailProps> = ({
  component
}) => {
  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-900">{component.name}</h2>
        <p className="mt-1 text-gray-500">{component.path}</p>
        {component.description && (
          <p className="mt-3 text-gray-700">{component.description}</p>
        )}
      </div>

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