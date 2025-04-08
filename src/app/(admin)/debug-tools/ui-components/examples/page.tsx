/**
 * UI Component Examples
 * 
 * This page provides access to all component examples organized by category.
 * All examples use components imported from the central '@/components/ui' library.
 */

import React from 'react';
import { Card } from '@/components/ui';
import Link from 'next/link';

const CATEGORIES = [
  { 
    id: 'basics', 
    name: 'Basic Components', 
    description: 'Fundamental UI building blocks like buttons, inputs, and cards',
    examples: ['buttons', 'inputs', 'cards']
  },
  { 
    id: 'layouts', 
    name: 'Layout Components', 
    description: 'Components for organizing and structuring content',
    examples: ['grids', 'containers']
  },
  { 
    id: 'data', 
    name: 'Data Components', 
    description: 'Visualizations, metrics, and data presentation components',
    examples: ['visualization-components', 'metrics-dashboard']
  },
  { 
    id: 'forms', 
    name: 'Form Components', 
    description: 'Components for building and validating forms',
    examples: ['form-controls', 'validation']
  },
  { 
    id: 'themes', 
    name: 'Theme Components', 
    description: 'Components and examples related to theming',
    examples: ['theme-toggle', 'theme-provider', 'css-variables']
  },
  { 
    id: 'patterns', 
    name: 'UI Patterns', 
    description: 'Composition patterns and component combinations',
    examples: ['client-components', 'server-components', 'accessibility-tests']
  }
];

export default function ExamplesIndexPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">UI Component Examples</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {CATEGORIES.map(category => (
          <Card key={category.id} className="p-6">
            <h2 className="text-xl font-semibold mb-2">{category.name}</h2>
            <p className="text-muted-foreground mb-4">{category.description}</p>
            <ul className="space-y-2">
              {category.examples.map(example => (
                <li key={example}>
                  <Link 
                    href={`/debug-tools/ui-components/examples/${category.id}/${example}`}
                    className="text-primary hover:underline"
                  >
                    {example.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  );
}
