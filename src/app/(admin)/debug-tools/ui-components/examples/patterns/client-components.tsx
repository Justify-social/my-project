'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/client/button-client';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/client/card-client';
import { RenderTypeBadge } from '@/app/(admin)/debug-tools/ui-components/components/render-type-badge';

export default function ClientComponentsTestPage() {
  const [clicks, setClicks] = useState(0);
  const [activeCard, setActiveCard] = useState<string | null>(null);
  
  const handleButtonClick = () => {
    setClicks(prev => prev + 1);
  };
  
  const handleCardClick = (cardId: string) => {
    setActiveCard(cardId === activeCard ? null : cardId);
  };
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-2">Client Components Test</h1>
      <p className="text-muted-foreground mb-8">
        This page demonstrates client components with interactive behavior.
      </p>
      
      <div className="flex items-center gap-3 mb-6">
        <span className="font-semibold">Component Type:</span>
        <RenderTypeBadge renderType="client" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="flex flex-col items-start gap-6 p-6 border rounded-lg">
          <h2 className="text-xl font-semibold">Client Button Example</h2>
          <p className="text-muted-foreground mb-4">
            This button uses client-side state and provides interactive feedback.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Button onClick={handleButtonClick} leftIcon="thumbs-up">
                Click Me
              </Button>
              
              <span className="text-lg font-medium">
                Clicks: <span className="font-bold">{clicks}</span>
              </span>
            </div>
            
            <div>
              <Button 
                variant="outline" 
                rightIcon="arrow-right"
                isLoading={clicks % 3 === 0 && clicks > 0}
                onClick={handleButtonClick}
              >
                {clicks % 3 === 0 && clicks > 0 ? 'Loading...' : 'Submit Form'}
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-6 p-6 border rounded-lg">
          <h2 className="text-xl font-semibold">Client Card Example</h2>
          <p className="text-muted-foreground mb-4">
            These cards have hover effects and track active state.
          </p>
          
          <div className="space-y-4">
            {['card1', 'card2', 'card3'].map((cardId) => (
              <Card 
                key={cardId}
                onClick={() => handleCardClick(cardId)} 
                isInteractive
                className={activeCard === cardId ? 'border-primary' : ''}
              >
                <CardHeader>
                  <CardTitle>Interactive Card {cardId.slice(-1)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>This card has hover effects and tracks state.</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Click to {activeCard === cardId ? 'deselect' : 'select'} this card.
                  </p>
                </CardContent>
                <CardFooter>
                  <div className={`h-2 w-2 rounded-full ${activeCard === cardId ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="text-xs ml-2">
                    {activeCard === cardId ? 'Selected' : 'Not Selected'}
                  </span>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
      
      <div className="p-6 border rounded-lg bg-muted/20">
        <h2 className="text-xl font-semibold mb-4">Implementation Notes</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>Both components use React hooks (<code>useState</code>) for client-side state</li>
          <li>The Button component provides loading state and click animations</li>
          <li>The Card component has hover effects and tracks selection state</li>
          <li>All client components are located in <code>src/components/ui/client/</code></li>
          <li>They extend server components with additional interactive functionality</li>
        </ul>
      </div>
    </div>
  );
} 