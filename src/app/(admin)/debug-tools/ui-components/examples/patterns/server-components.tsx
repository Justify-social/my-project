import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { RenderTypeBadge } from '@/app/(admin)/debug-tools/ui-components/components/render-type-badge';

export default function ServerComponentsTestPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-2">Server Components Test</h1>
      <p className="text-muted-foreground mb-8">
        This page demonstrates server components without client-side JavaScript.
      </p>
      
      <div className="flex items-center gap-3 mb-6">
        <span className="font-semibold">Component Type:</span>
        <RenderTypeBadge renderType="server" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="flex flex-col items-start gap-6 p-6 border rounded-lg">
          <h2 className="text-xl font-semibold">Server Button Example</h2>
          <p className="text-muted-foreground mb-4">
            This button renders on the server without client-side JavaScript or React hooks.
          </p>
          
          <div className="space-y-4">
            <div>
              <Button leftIcon="thumbs-up">
                Static Button
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button variant="default">Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
            
            <div>
              <Button 
                variant="outline" 
                rightIcon="arrow-right"
              >
                View Details
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-6 p-6 border rounded-lg">
          <h2 className="text-xl font-semibold">Server Card Example</h2>
          <p className="text-muted-foreground mb-4">
            These cards are rendered on the server and have no client-side state.
          </p>
          
          <div className="space-y-4">
            {['card1', 'card2', 'card3'].map((cardId) => (
              <Card key={cardId}>
                <CardHeader>
                  <CardTitle>Static Card {cardId.slice(-1)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>This card is rendered completely on the server.</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    No client-side JavaScript is included.
                  </p>
                </CardContent>
                <CardFooter>
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <span className="text-xs ml-2">Server Rendered</span>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
      
      <div className="p-6 border rounded-lg bg-muted/20">
        <h2 className="text-xl font-semibold mb-4">Implementation Notes</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>Server components render on the server with zero client-side JavaScript</li>
          <li>They cannot use React hooks (<code>useState</code>, <code>useEffect</code>, etc.)</li>
          <li>They cannot use browser APIs or respond to user interactions</li>
          <li>They can directly access server resources (database, filesystem, etc.)</li>
          <li>They are the default component type in Next.js 13+</li>
        </ul>
      </div>
    </div>
  );
} 