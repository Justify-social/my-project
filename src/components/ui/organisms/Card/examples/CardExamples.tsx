// Updated import paths via tree-shake script - 2025-04-01T17:13:32.208Z
import React from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter
} from '../Card';
import { MetricCard } from '../MetricCard';
import { Button } from '@/components/ui/atoms/button';
import { Icon } from '@/components/ui/atoms/icon';

/**
 * Examples of Card component usage
 * 
 * This file provides comprehensive examples of all Card components 
 * with various configurations and use cases
 */
export const CardExamples = () => {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-bold mb-4">Basic Card</h2>
        <Card className="max-w-md">
          <CardContent>
            <p>This is a basic card with just content</p>
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">Card with Header and Content</h2>
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card description providing additional context</CardDescription>
          </CardHeader>
          <CardContent>
            <p>This card demonstrates the standard header with title and description pattern.</p>
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">Interactive Card</h2>
        <Card className="max-w-md" variant="interactive" hoverable>
          <CardHeader>
            <CardTitle>Interactive Card</CardTitle>
            <CardDescription>This card has hover effects</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Hover over this card to see the interactive effects.</p>
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">Card with Header Icon and Actions</h2>
        <Card className="max-w-md">
          <CardHeader
            icon={<Icon name="check" type="static" className="text-[#00BFFF]" />}
            actions={
              <Button variant="ghost" size="sm">
                <Icon name="ellipsis" type="static" />
              </Button>
            }
          >
            <CardTitle>Card with Icon and Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <p>This card demonstrates the use of icons and action buttons in the header.</p>
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">Card with Footer</h2>
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Card with Footer</CardTitle>
          </CardHeader>
          <CardContent>
            <p>This card includes a footer with various alignment options.</p>
          </CardContent>
          <CardFooter align="between">
            <Button variant="outline">Cancel</Button>
            <Button>Submit</Button>
          </CardFooter>
        </Card>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">Card Title Variants</h2>
        <div className="space-y-4">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle size="small">Small Title</CardTitle>
              <CardDescription>Using size="small" prop</CardDescription>
            </CardHeader>
            <CardContent>
              <p>This card demonstrates a small title.</p>
            </CardContent>
          </Card>

          <Card className="max-w-md">
            <CardHeader>
              <CardTitle size="default">Default Title</CardTitle>
              <CardDescription>Using the default title size</CardDescription>
            </CardHeader>
            <CardContent>
              <p>This card demonstrates the default title size.</p>
            </CardContent>
          </Card>

          <Card className="max-w-md">
            <CardHeader>
              <CardTitle size="large">Large Title</CardTitle>
              <CardDescription>Using size="large" prop</CardDescription>
            </CardHeader>
            <CardContent>
              <p>This card demonstrates a large title.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">Card Variants</h2>
        <div className="space-y-4">
          <Card className="max-w-md" variant="default">
            <CardHeader>
              <CardTitle>Default Variant</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Standard card with border and shadow</p>
            </CardContent>
          </Card>

          <Card className="max-w-md" variant="outline">
            <CardHeader>
              <CardTitle>Outline Variant</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Card with border but no shadow</p>
            </CardContent>
          </Card>

          <Card className="max-w-md" variant="raised">
            <CardHeader>
              <CardTitle>Raised Variant</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Card with more pronounced shadow</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">Metric Card</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MetricCard
            title="Total Users"
            value="24,521"
            description="7% increase from last month"
            trend={7}
            icon={<Icon name="user" type="static" className="text-[#4A5568]" />}
          />

          <MetricCard
            title="Revenue"
            value="$86,429"
            description="3% decrease from last month"
            trend={-3}
            icon={<Icon name="dollar-sign" type="static" className="text-[#4A5568]" />}
          />
        </div>
      </section>
    </div>
  );
};

export default CardExamples; 