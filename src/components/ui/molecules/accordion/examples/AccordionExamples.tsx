// Updated import paths via tree-shake script - 2025-04-01T17:13:32.204Z
import React from 'react';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent
} from '../accordion';
import { Icon } from '@/components/ui/atoms/icon';

/**
 * Examples of Accordion component usage
 * 
 * This file provides comprehensive examples of all Accordion components
 * with various configurations and use cases
 */
export const AccordionExamples = () => {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-bold mb-4">Basic Accordion</h2>
        <Accordion type="single" collapsible className="w-full max-w-md">
          <AccordionItem value="item-1">
            <AccordionTrigger>Is the Accordion accessible?</AccordionTrigger>
            <AccordionContent>
              Yes. It adheres to the WAI-ARIA design pattern for accordions, ensuring proper
              keyboard navigation and screen reader compatibility.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Can I customize the styling?</AccordionTrigger>
            <AccordionContent>
              Absolutely. The component accepts className props for each subcomponent,
              allowing for complete customization while maintaining its core functionality.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>What are the Accordion types?</AccordionTrigger>
            <AccordionContent>
              The Accordion supports both "single" and "multiple" types. The "single" type
              allows only one item to be open at a time, while "multiple" allows multiple
              items to be expanded simultaneously.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">Multiple Type Accordion</h2>
        <Accordion type="multiple" className="w-full max-w-md">
          <AccordionItem value="feature-1">
            <AccordionTrigger>Feature 1: Data Analytics</AccordionTrigger>
            <AccordionContent>
              Our data analytics feature provides deep insights into your business metrics,
              helping you make data-driven decisions. Monitor trends, track performance, and
              generate custom reports with ease.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="feature-2">
            <AccordionTrigger>Feature 2: User Management</AccordionTrigger>
            <AccordionContent>
              Manage user accounts, roles, and permissions through our intuitive user management
              system. Create custom roles, assign granular permissions, and maintain security
              across your organization.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="feature-3">
            <AccordionTrigger>Feature 3: Integration API</AccordionTrigger>
            <AccordionContent>
              Our comprehensive API allows seamless integration with your existing systems and
              third-party applications. With detailed documentation and authentication options,
              connecting services has never been easier.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">Custom Styled Accordion</h2>
        <Accordion type="single" collapsible className="w-full max-w-md">
          <AccordionItem 
            value="styled-1" 
            className="border-b-0 mb-2 rounded-lg border border-[#D1D5DB] overflow-hidden"
          >
            <AccordionTrigger className="bg-[#F9FAFB] px-4 hover:no-underline hover:bg-[#F3F4F6]">
              <div className="flex items-center">
                <Icon name="chart-line" type="static" className="text-[#00BFFF] mr-2" />
                <span>Performance Metrics</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 bg-white">
              <div className="pt-2">
                View detailed performance metrics including load times, response rates,
                and user engagement statistics across all your applications.
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem 
            value="styled-2" 
            className="border-b-0 mb-2 rounded-lg border border-[#D1D5DB] overflow-hidden"
          >
            <AccordionTrigger className="bg-[#F9FAFB] px-4 hover:no-underline hover:bg-[#F3F4F6]">
              <div className="flex items-center">
                <Icon name="user" type="static" className="text-[#4A5568] mr-2" />
                <span>User Profiles</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 bg-white">
              <div className="pt-2">
                Manage comprehensive user profiles with customizable fields, activity logs,
                and preference settings for a personalized experience.
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem 
            value="styled-3" 
            className="border-b-0 rounded-lg border border-[#D1D5DB] overflow-hidden"
          >
            <AccordionTrigger className="bg-[#F9FAFB] px-4 hover:no-underline hover:bg-[#F3F4F6]">
              <div className="flex items-center">
                <Icon name="cog" type="static" className="text-[#333333] mr-2" />
                <span>System Configuration</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 bg-white">
              <div className="pt-2">
                Configure system-wide settings, notification preferences, and integration
                parameters through an intuitive administration interface.
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
    </div>
  );
};

export default AccordionExamples; 