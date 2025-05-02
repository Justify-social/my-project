'use client';

import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

// FAQ data based on BUILD/billing + pricing/billing + pricing.md
const faqData = [
  {
    id: 'faq-1',
    question: 'Is there a free trial?',
    answer:
      'Currently, we do not offer a free trial. However, our Pay-As-You-Go plan allows you to access core features and test campaigns with minimal commitment.',
  },
  {
    id: 'faq-2',
    question: 'Can I change my plan later?',
    answer:
      'Yes, you can upgrade or downgrade your plan at any time through your account settings. Billing adjustments will be prorated based on your current cycle.',
  },
  {
    id: 'faq-3',
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit cards (Visa, Mastercard, American Express). For Enterprise plans, we can also arrange for bank transfers.',
  },
  {
    id: 'faq-4',
    question: 'Do you offer custom enterprise plans?',
    answer:
      'Yes, we offer tailored solutions for large enterprises with specific needs. Please contact our sales team to discuss your requirements.',
  },
  {
    id: 'faq-5',
    question: 'How do the studies work?',
    answer:
      'Each study provides comprehensive analysis of a marketing campaign, including audience response, engagement metrics, conversion data, and actionable recommendations based on the features included in your plan (e.g., Brand Lift, Creative Testing).',
  },
];

export const FaqSection: React.FC = () => {
  return (
    <Accordion type="single" collapsible className="w-full">
      {faqData.map(item => (
        <AccordionItem value={item.id} key={item.id} className="border-b border-divider">
          <AccordionTrigger className="text-left font-medium text-primary hover:text-interactive hover:no-underline py-4">
            {item.question}
          </AccordionTrigger>
          <AccordionContent className="text-secondary pt-1 pb-4">{item.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default FaqSection;
