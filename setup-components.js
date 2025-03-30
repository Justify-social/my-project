#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Ensure directories exist
const componentsDir = path.join(process.cwd(), 'src', 'components', 'ui');
if (!fs.existsSync(componentsDir)) {
  fs.mkdirSync(componentsDir, { recursive: true });
}

// List of components to create
const components = [
  'accordion',
  'alert',
  'badge',
  'button',
  'card',
  'input',
  'label',
  'scroll-area',
  'select',
  'slider',
  'spinner',
  'switch',
  'table',
  'tabs'
];

// Basic component template
const getComponentTemplate = (name, displayName) => `
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

// ${displayName} component
export interface ${displayName}Props extends React.HTMLAttributes<HTMLDivElement> {
  // Add additional props here
}

export const ${displayName} = React.forwardRef<HTMLDivElement, ${displayName}Props>(
  ({ className, ...props }, ref) => {
    return (
      <div
        className={cn('ui-${name}', className)}
        ref={ref}
        {...props}
      />
    );
  }
);

${displayName}.displayName = '${displayName}';
`;

// Templates for specialized components
const templates = {
  accordion: `
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        className={cn('ui-accordion', className)}
        ref={ref}
        {...props}
      />
    );
  }
);

Accordion.displayName = 'Accordion';

export interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {}

export const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        className={cn('ui-accordion-item', className)}
        ref={ref}
        {...props}
      />
    );
  }
);

AccordionItem.displayName = 'AccordionItem';

export interface AccordionTriggerProps extends React.HTMLAttributes<HTMLButtonElement> {}

export const AccordionTrigger = React.forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  ({ className, ...props }, ref) => {
    return (
      <button
        className={cn('ui-accordion-trigger', className)}
        ref={ref}
        {...props}
      />
    );
  }
);

AccordionTrigger.displayName = 'AccordionTrigger';

export interface AccordionContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export const AccordionContent = React.forwardRef<HTMLDivElement, AccordionContentProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        className={cn('ui-accordion-content', className)}
        ref={ref}
        {...props}
      />
    );
  }
);

AccordionContent.displayName = 'AccordionContent';
`,

  alert: `
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        className={cn('ui-alert', className)}
        ref={ref}
        {...props}
      />
    );
  }
);

Alert.displayName = 'Alert';

export interface AlertTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export const AlertTitle = React.forwardRef<HTMLHeadingElement, AlertTitleProps>(
  ({ className, ...props }, ref) => {
    return (
      <h4
        className={cn('ui-alert-title', className)}
        ref={ref}
        {...props}
      />
    );
  }
);

AlertTitle.displayName = 'AlertTitle';

export interface AlertDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export const AlertDescription = React.forwardRef<HTMLParagraphElement, AlertDescriptionProps>(
  ({ className, ...props }, ref) => {
    return (
      <p
        className={cn('ui-alert-description', className)}
        ref={ref}
        {...props}
      />
    );
  }
);

AlertDescription.displayName = 'AlertDescription';
`,

  button: `
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => {
    return (
      <button
        className={cn('ui-button', className)}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
`,

  input: `
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        className={cn('ui-input', className)}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
`,

  card: `
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        className={cn('ui-card', className)}
        ref={ref}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        className={cn('ui-card-header', className)}
        ref={ref}
        {...props}
      />
    );
  }
);

CardHeader.displayName = 'CardHeader';

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, ...props }, ref) => {
    return (
      <h3
        className={cn('ui-card-title', className)}
        ref={ref}
        {...props}
      />
    );
  }
);

CardTitle.displayName = 'CardTitle';

export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, ...props }, ref) => {
    return (
      <p
        className={cn('ui-card-description', className)}
        ref={ref}
        {...props}
      />
    );
  }
);

CardDescription.displayName = 'CardDescription';

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        className={cn('ui-card-content', className)}
        ref={ref}
        {...props}
      />
    );
  }
);

CardContent.displayName = 'CardContent';

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        className={cn('ui-card-footer', className)}
        ref={ref}
        {...props}
      />
    );
  }
);

CardFooter.displayName = 'CardFooter';
`,

  tabs: `
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        className={cn('ui-tabs', className)}
        ref={ref}
        {...props}
      />
    );
  }
);

Tabs.displayName = 'Tabs';

export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {}

export const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        className={cn('ui-tabs-list', className)}
        ref={ref}
        {...props}
      />
    );
  }
);

TabsList.displayName = 'TabsList';

export interface TabsTriggerProps extends React.HTMLAttributes<HTMLButtonElement> {}

export const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, ...props }, ref) => {
    return (
      <button
        className={cn('ui-tabs-trigger', className)}
        ref={ref}
        {...props}
      />
    );
  }
);

TabsTrigger.displayName = 'TabsTrigger';

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        className={cn('ui-tabs-content', className)}
        ref={ref}
        {...props}
      />
    );
  }
);

TabsContent.displayName = 'TabsContent';
`,

  table: `
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TableProps extends React.HTMLAttributes<HTMLTableElement> {}

export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, ...props }, ref) => {
    return (
      <table
        className={cn('ui-table', className)}
        ref={ref}
        {...props}
      />
    );
  }
);

Table.displayName = 'Table';

export interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

export const TableHeader = React.forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className, ...props }, ref) => {
    return (
      <thead
        className={cn('ui-table-header', className)}
        ref={ref}
        {...props}
      />
    );
  }
);

TableHeader.displayName = 'TableHeader';

export interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

export const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className, ...props }, ref) => {
    return (
      <tbody
        className={cn('ui-table-body', className)}
        ref={ref}
        {...props}
      />
    );
  }
);

TableBody.displayName = 'TableBody';

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {}

export const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, ...props }, ref) => {
    return (
      <tr
        className={cn('ui-table-row', className)}
        ref={ref}
        {...props}
      />
    );
  }
);

TableRow.displayName = 'TableRow';

export interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {}

export const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, ...props }, ref) => {
    return (
      <th
        className={cn('ui-table-head', className)}
        ref={ref}
        {...props}
      />
    );
  }
);

TableHead.displayName = 'TableHead';

export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {}

export const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, ...props }, ref) => {
    return (
      <td
        className={cn('ui-table-cell', className)}
        ref={ref}
        {...props}
      />
    );
  }
);

TableCell.displayName = 'TableCell';
`,

  spinner: `
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        className={cn('ui-spinner', className)}
        ref={ref}
        {...props}
      >
        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }
);

Spinner.displayName = 'Spinner';
`
};

// Create components
components.forEach(component => {
  const componentDir = path.join(componentsDir, component);
  if (!fs.existsSync(componentDir)) {
    fs.mkdirSync(componentDir, { recursive: true });
  }

  const componentPath = path.join(componentDir, 'index.ts');
  const displayName = component.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
  
  // Use specialized template if available, otherwise use basic template
  const template = templates[component] || getComponentTemplate(component, displayName);
  
  // Create implementation file
  const implPath = path.join(componentDir, `${component}.tsx`);
  fs.writeFileSync(implPath, template);
  
  // Create index file
  fs.writeFileSync(componentPath, `export * from './${component}';\n`);
  
  console.log(`Created component: ${component}`);
});

// Create utils.ts if it doesn't exist
const libDir = path.join(process.cwd(), 'src', 'lib');
if (!fs.existsSync(libDir)) {
  fs.mkdirSync(libDir, { recursive: true });
}

const utilsPath = path.join(libDir, 'utils.ts');
if (!fs.existsSync(utilsPath)) {
  fs.writeFileSync(utilsPath, `
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
`);
  console.log('Created utils.ts with cn function');
}

// Create the API module
const apiDir = path.join(process.cwd(), 'src', 'lib', 'components');
if (!fs.existsSync(apiDir)) {
  fs.mkdirSync(apiDir, { recursive: true });
}

const apiPath = path.join(apiDir, 'api.ts');
fs.writeFileSync(apiPath, `
// Component API
export const componentApi = {
  getComponents: async () => {
    // Mock implementation
    return [];
  },
  getComponentMetadata: async (componentPath: string) => {
    // Mock implementation
    return null;
  },
  getComponentChanges: async (componentPath: string) => {
    // Mock implementation
    return [];
  }
};
`);
console.log('Created component API module');

console.log('All UI components generated successfully!'); 