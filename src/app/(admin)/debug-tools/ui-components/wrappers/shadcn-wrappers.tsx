import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { safeDynamicImport, resolveShadcnPath } from '../utils/component-registry-utils';

// Create a generic error message component
const ErrorLoadingComponent = ({ name }: { name: string }) => (
  <div className="p-4 border border-red-200 rounded bg-red-50 text-red-600">
    <h3 className="font-medium mb-2">Failed to load {name}</h3>
    <div className="text-sm">
      This component could not be loaded dynamically. Check console for details.
    </div>
  </div>
);

// Component imports - path resolution is handled by resolveShadcnPath function
const AccordionImport = dynamic(
  () => safeDynamicImport(
    '@/components/ui/accordion',
    'Accordion',
    () => <ErrorLoadingComponent name="Accordion" />
  ),
  { ssr: false }
);

const AccordionItemImport = dynamic(
  () => safeDynamicImport(
    '@/components/ui/accordion',
    'AccordionItem',
    () => <ErrorLoadingComponent name="AccordionItem" />
  ),
  { ssr: false }
);

const AccordionTriggerImport = dynamic(
  () => safeDynamicImport(
    '@/components/ui/accordion',
    'AccordionTrigger',
    () => <ErrorLoadingComponent name="AccordionTrigger" />
  ),
  { ssr: false }
);

const AccordionContentImport = dynamic(
  () => safeDynamicImport(
    '@/components/ui/accordion',
    'AccordionContent',
    () => <ErrorLoadingComponent name="AccordionContent" />
  ),
  { ssr: false }
);

const DialogImport = dynamic(
  () => safeDynamicImport(
    '@/components/ui/dialog',
    'Dialog',
    () => <ErrorLoadingComponent name="Dialog" />
  ),
  { ssr: false }
);

const DialogTriggerImport = dynamic(
  () => safeDynamicImport(
    '@/components/ui/dialog',
    'DialogTrigger',
    () => <ErrorLoadingComponent name="DialogTrigger" />
  ),
  { ssr: false }
);

const DialogContentImport = dynamic(
  () => safeDynamicImport(
    '@/components/ui/dialog',
    'DialogContent',
    () => <ErrorLoadingComponent name="DialogContent" />
  ),
  { ssr: false }
);

const PopoverImport = dynamic(
  () => safeDynamicImport(
    '@/components/ui/popover',
    'Popover',
    () => <ErrorLoadingComponent name="Popover" />
  ),
  { ssr: false }
);

const PopoverTriggerImport = dynamic(
  () => safeDynamicImport(
    '@/components/ui/popover',
    'PopoverTrigger',
    () => <ErrorLoadingComponent name="PopoverTrigger" />
  ),
  { ssr: false }
);

const PopoverContentImport = dynamic(
  () => safeDynamicImport(
    '@/components/ui/popover',
    'PopoverContent',
    () => <ErrorLoadingComponent name="PopoverContent" />
  ),
  { ssr: false }
);

// Button component imports
const ButtonImport = dynamic(
  () => safeDynamicImport(
    '@/components/ui/button',
    'Button',
    () => <ErrorLoadingComponent name="Button" />
  ),
  { ssr: false }
);

// Card component imports
const CardImport = dynamic(
  () => safeDynamicImport(
    '@/components/ui/card',
    'Card',
    () => <ErrorLoadingComponent name="Card" />
  ),
  { ssr: false }
);

const CardHeaderImport = dynamic(
  () => safeDynamicImport(
    '@/components/ui/card',
    'CardHeader',
    () => <ErrorLoadingComponent name="CardHeader" />
  ),
  { ssr: false }
);

const CardTitleImport = dynamic(
  () => safeDynamicImport(
    '@/components/ui/card',
    'CardTitle',
    () => <ErrorLoadingComponent name="CardTitle" />
  ),
  { ssr: false }
);

const CardDescriptionImport = dynamic(
  () => safeDynamicImport(
    '@/components/ui/card',
    'CardDescription',
    () => <ErrorLoadingComponent name="CardDescription" />
  ),
  { ssr: false }
);

const CardContentImport = dynamic(
  () => safeDynamicImport(
    '@/components/ui/card',
    'CardContent',
    () => <ErrorLoadingComponent name="CardContent" />
  ),
  { ssr: false }
);

const CardFooterImport = dynamic(
  () => safeDynamicImport(
    '@/components/ui/card',
    'CardFooter',
    () => <ErrorLoadingComponent name="CardFooter" />
  ),
  { ssr: false }
);

// Combobox component imports
const ComboboxImport = dynamic(
  () => safeDynamicImport(
    import('@/components/ui/molecules/combobox/Combobox'),
    'Combobox',
    () => <ErrorLoadingComponent name="Combobox" />
  ),
  { ssr: false }
);

/**
 * Accordion Wrapper
 * Provides a complete Accordion component with proper context
 */
export const AccordionWrapper = (props: any) => {
  return (
    <div className="wrapper-component">
      <AccordionImport type="single" collapsible>
        <AccordionItemImport value="item-1">
          <AccordionTriggerImport>Section 1</AccordionTriggerImport>
          <AccordionContentImport>Content for section 1</AccordionContentImport>
        </AccordionItemImport>
        <AccordionItemImport value="item-2">
          <AccordionTriggerImport>Section 2</AccordionTriggerImport>
          <AccordionContentImport>Content for section 2</AccordionContentImport>
        </AccordionItemImport>
      </AccordionImport>
    </div>
  );
};

/**
 * Dialog Wrapper
 * Provides a complete Dialog component with proper state management
 */
export const DialogWrapper = (props: any) => {
  const [open, setOpen] = React.useState(true);
  
  return (
    <div className="wrapper-component">
      <DialogImport open={open} onOpenChange={setOpen}>
        <DialogTriggerImport>
          <button className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90">
            Open Dialog
          </button>
        </DialogTriggerImport>
        <DialogContentImport>
          <h2 className="text-lg font-semibold mb-2">Dialog Title</h2>
          <p className="mb-4">Dialog content goes here. This demonstrates the complete Dialog component with proper context and state management.</p>
          <div className="flex justify-end">
            <button 
              className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 mr-2"
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>
            <button 
              className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
              onClick={() => setOpen(false)}
            >
              Confirm
            </button>
          </div>
        </DialogContentImport>
      </DialogImport>
    </div>
  );
};

/**
 * Popover Wrapper
 * Provides a complete Popover component with proper state management
 */
export const PopoverWrapper = (props: any) => {
  const [open, setOpen] = React.useState(true);
  
  return (
    <div className="wrapper-component">
      <PopoverImport open={open} onOpenChange={setOpen}>
        <PopoverTriggerImport>
          <button className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90">
            Open Popover
          </button>
        </PopoverTriggerImport>
        <PopoverContentImport className="p-4 w-72">
          <div className="space-y-2">
            <h3 className="font-medium">Popover Title</h3>
            <p className="text-sm text-gray-500">
              This demonstrates the complete Popover component with proper context and state management.
            </p>
          </div>
        </PopoverContentImport>
      </PopoverImport>
    </div>
  );
};

/**
 * Button Wrapper
 * Displays different button variants
 */
export const ButtonWrapper = (props: any) => {
  return (
    <div className="wrapper-component flex gap-2 flex-wrap">
      <ButtonImport variant="default">Default</ButtonImport>
      <ButtonImport variant="secondary">Secondary</ButtonImport>
      <ButtonImport variant="outline">Outline</ButtonImport>
      <ButtonImport variant="destructive">Destructive</ButtonImport>
      <ButtonImport variant="ghost">Ghost</ButtonImport>
      <ButtonImport variant="link">Link</ButtonImport>
    </div>
  );
};

/**
 * Card Wrapper
 * Displays a complete card with all subcomponents
 */
export const CardWrapper = (props: any) => {
  return (
    <div className="wrapper-component w-[350px]">
      <CardImport>
        <CardHeaderImport>
          <CardTitleImport>Card Title</CardTitleImport>
          <CardDescriptionImport>Card description here</CardDescriptionImport>
        </CardHeaderImport>
        <CardContentImport>
          <p>Card content goes here. This demonstrates the complete Card component.</p>
        </CardContentImport>
        <CardFooterImport className="flex justify-end gap-2">
          <ButtonImport variant="outline">Cancel</ButtonImport>
          <ButtonImport>Submit</ButtonImport>
        </CardFooterImport>
      </CardImport>
    </div>
  );
};

/**
 * Combobox Wrapper
 * Demonstrates a combobox with framework options
 */
export const ComboboxWrapper = (props: any) => {
  const [value, setValue] = React.useState("");
  
  const frameworks = [
    { value: "react", label: "React" },
    { value: "next", label: "Next.js" },
    { value: "vue", label: "Vue" },
    { value: "angular", label: "Angular" },
    { value: "svelte", label: "Svelte" },
  ];

  return (
    <div className="wrapper-component w-80">
      <ComboboxImport
        options={frameworks}
        value={value}
        onValueChange={setValue}
        placeholder="Select a framework..."
        emptyMessage="No framework found."
        searchPlaceholder="Search framework..."
      />
    </div>
  );
};

// Export a mapping of component names to their wrapper components
export const componentWrappers = {
  // Original components
  'Accordion': AccordionWrapper,
  'Dialog': DialogWrapper,
  'Popover': PopoverWrapper,
  'Button': ButtonWrapper,
  'Card': CardWrapper,
  'Combobox': ComboboxWrapper,
  
  // Namespaced versions to handle collisions
  'ShadcnAccordion': AccordionWrapper,
  'ShadcnDialog': DialogWrapper,
  'ShadcnPopover': PopoverWrapper,
  'ShadcnButton': ButtonWrapper,
  'ShadcnCard': CardWrapper,
  'ShadcnCombobox': ComboboxWrapper,
};

export default componentWrappers; 