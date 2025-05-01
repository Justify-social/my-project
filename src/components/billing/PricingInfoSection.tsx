import React from 'react';
// Import shadcn UI components
import { Card, CardContent } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';

// Placeholder component for UI-1 pricing section
// This will eventually contain the pricing grid and FAQs.

export default function PricingInfoSection() {
  return (
    <div className="mt-6 space-y-4">
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Pricing Grid Component Placeholder</p>
        </CardContent>
      </Card>

      <Separator />

      <h3 className="text-lg font-semibold">Frequently Asked Questions</h3>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger>Is there a free trial?</AccordionTrigger>
          <AccordionContent>
            Yes, we offer a 14-day free trial on all plans. No credit card required.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Can I change my plan later?</AccordionTrigger>
          <AccordionContent>
            Absolutely! You can upgrade, downgrade, or cancel your plan at any time from your
            billing settings.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>What payment methods do you accept?</AccordionTrigger>
          <AccordionContent>
            We accept all major credit cards, processed securely via Stripe.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
