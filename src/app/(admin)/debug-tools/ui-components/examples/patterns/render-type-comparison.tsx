'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RenderTypeBadge } from '@/app/(admin)/debug-tools/ui-components/components/render-type-badge';
import { getIconClasses } from '@/components/ui/utils/icon-integration';

// Import both server and client components
import { Button as ServerButton } from '@/components/ui/button';
import { Button as ClientButton } from '@/components/ui/client/button-client';

export default function RenderTypeComparisonPage() {
  const [clickCount, setClickCount] = useState(0);
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-2">Server vs. Client Components</h1>
      <p className="text-muted-foreground mb-6">
        This page demonstrates the differences between server and client components.
      </p>
      
      <div className="flex gap-4 mb-8">
        <Link 
          href="/debug-tools/ui-components/server-test" 
          className="inline-flex items-center px-4 py-2 bg-muted rounded-md hover:bg-muted/80"
        >
          <i className={`${getIconClasses('server')} mr-2`}></i>
          Server Components Demo
        </Link>
        <Link 
          href="/debug-tools/ui-components/client-test"
          className="inline-flex items-center px-4 py-2 bg-muted rounded-md hover:bg-muted/80"
        >
          <i className={`${getIconClasses('browser')} mr-2`}></i>
          Client Components Demo
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <div className="border rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Server Components</h2>
            <RenderTypeBadge renderType="server" />
          </div>
          
          <div className="prose prose-sm max-w-none mb-6">
            <ul>
              <li>Render on the server</li>
              <li>Zero client-side JavaScript</li>
              <li>Cannot use React hooks</li>
              <li>Cannot use browser APIs</li>
              <li>Best for static content</li>
              <li>Can access server resources directly</li>
            </ul>
          </div>
          
          <div className="p-4 border rounded-md bg-muted/30">
            <h3 className="font-medium mb-3">Server Button Example</h3>
            <div className="flex flex-wrap gap-2">
              <ServerButton>Static Button</ServerButton>
              <ServerButton variant="secondary">Secondary</ServerButton>
              <ServerButton variant="outline" leftIcon="check">With Icon</ServerButton>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              These buttons are static and don't track state. The HTML is sent directly from the server.
            </div>
          </div>
        </div>
        
        <div className="border rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Client Components</h2>
            <RenderTypeBadge renderType="client" />
          </div>
          
          <div className="prose prose-sm max-w-none mb-6">
            <ul>
              <li>Render on both server and client</li>
              <li>Hydrate with JavaScript on the client</li>
              <li>Can use React hooks</li>
              <li>Can use browser APIs and event handlers</li>
              <li>Best for interactive elements</li>
              <li>Cannot access server resources directly</li>
            </ul>
          </div>
          
          <div className="p-4 border rounded-md bg-muted/30">
            <h3 className="font-medium mb-3">Client Button Example</h3>
            <div className="flex flex-wrap gap-2 items-center">
              <ClientButton onClick={() => setClickCount(c => c + 1)}>
                Click Me
              </ClientButton>
              <ClientButton 
                variant="secondary" 
                isLoading={clickCount % 3 === 0 && clickCount > 0}
                onClick={() => setClickCount(c => c + 1)}
              >
                {clickCount % 3 === 0 && clickCount > 0 ? 'Loading...' : 'Submit'}
              </ClientButton>
              <span className="ml-2 text-sm font-medium">
                Clicks: {clickCount}
              </span>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              These buttons maintain state and provide interactive feedback.
            </div>
          </div>
        </div>
      </div>
      
      <div className="border rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Implementation Strategy</h2>
        
        <Tabs defaultValue="structure">
          <TabsList className="mb-4">
            <TabsTrigger value="structure">File Structure</TabsTrigger>
            <TabsTrigger value="patterns">Usage Patterns</TabsTrigger>
            <TabsTrigger value="rules">Best Practices</TabsTrigger>
          </TabsList>
          
          <TabsContent value="structure">
            <div className="p-4 bg-muted/20 rounded-md">
              <pre className="text-sm overflow-auto">
{`src/components/ui/
├── button.tsx               # Server Component (default)
├── card.tsx                 # Server Component (default)
├── ...
├── client/
│   ├── button-client.tsx    # Client Component wrapper
│   └── card-client.tsx      # Client Component wrapper`}
              </pre>
            </div>
            <p className="mt-4 text-muted-foreground">
              Server components are the default. Client components are in the <code>/client</code> directory.
            </p>
          </TabsContent>
          
          <TabsContent value="patterns">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-2">Server Component Import</h3>
                <div className="p-3 bg-muted/20 rounded-md">
                  <pre className="text-sm">
{`import { Button } from '@/components/ui/button';

export default function Page() {
  return <Button>Server Component</Button>;
}`}
                  </pre>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Client Component Import</h3>
                <div className="p-3 bg-muted/20 rounded-md">
                  <pre className="text-sm">
{`'use client';

import { Button } from '@/components/ui/client/button-client';

export default function Page() {
  return <Button onClick={() => {}}>Client Component</Button>;
}`}
                  </pre>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="rules">
            <div className="prose prose-sm max-w-none">
              <ol>
                <li><strong>Default to Server Components</strong> - Only use Client Components when necessary</li>
                <li><strong>Use JSDoc Tags</strong> - Always add <code>@renderType server|client</code> to document your components</li>
                <li><strong>Keep Components Pure</strong> - Server components should render consistently without user input</li>
                <li><strong>Keep Client Components Lean</strong> - Minimize the amount of client-side JavaScript</li>
                <li><strong>Use Component Composition</strong> - Client components can contain server components, but not vice versa</li>
              </ol>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 