/**
 * Shadcn Wrapper Components
 * 
 * SSOT (Single Source of Truth) implementation for Shadcn component wrappers.
 * This file contains all the wrapper components that provide proper context and props
 * for Shadcn components to render correctly in the UI Component Library.
 */

import React from 'react';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';
import { safeDynamicImport, resolveShadcnPath } from './component-registry-utils';

// Generic loading component for all dynamic imports
const ComponentLoading = () => (
  <div className="animate-pulse bg-muted rounded h-24 w-full flex items-center justify-center">
    <div className="text-muted-foreground text-sm">Loading component...</div>
  </div>
);

// Generic error component for all dynamic imports
const ErrorLoadingComponent = ({ name }: { name: string }) => (
  <div className="p-4 border border-red-200 rounded bg-red-50 text-red-600">
    <h3 className="font-medium mb-2">Failed to load {name}</h3>
    <div className="text-sm">
      This component could not be loaded dynamically. Check console for details.
    </div>
  </div>
);

// Type-safe dynamic import wrapper with proper fallbacks
const dynamicImport = (path: string, componentName: string) => {
  return dynamic(
    () => safeDynamicImport(path, componentName, () => <ErrorLoadingComponent name={componentName} />),
    { loading: () => <ComponentLoading />, ssr: false }
  );
};

// Component wrappers with proper contexts
// Each wrapper provides the correct context for the component to render properly

// --- Accordion ---
const Accordion = dynamicImport('@/components/ui/accordion', 'Accordion');
const AccordionItem = dynamicImport('@/components/ui/accordion', 'AccordionItem');
const AccordionTrigger = dynamicImport('@/components/ui/accordion', 'AccordionTrigger');
const AccordionContent = dynamicImport('@/components/ui/accordion', 'AccordionContent');

export const AccordionWrapper: React.FC = () => {
  return (
    <div className="w-full">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger>Is it accessible?</AccordionTrigger>
          <AccordionContent>
            Yes. It adheres to the WAI-ARIA design pattern.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Is it styled?</AccordionTrigger>
          <AccordionContent>
            Yes. It comes with default styles that matches the other components' aesthetic.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>Is it animated?</AccordionTrigger>
          <AccordionContent>
            Yes. It's animated by default, but you can disable it if you prefer.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

// --- Button ---
const Button = dynamicImport('@/components/ui/button', 'Button');

export const ButtonWrapper: React.FC = () => {
  return (
    <div className="flex flex-wrap gap-4">
      <Button variant="default">Default</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  );
};

// --- Card ---
const Card = dynamicImport('@/components/ui/card', 'Card');
const CardHeader = dynamicImport('@/components/ui/card', 'CardHeader');
const CardTitle = dynamicImport('@/components/ui/card', 'CardTitle');
const CardDescription = dynamicImport('@/components/ui/card', 'CardDescription');
const CardContent = dynamicImport('@/components/ui/card', 'CardContent');
const CardFooter = dynamicImport('@/components/ui/card', 'CardFooter');

export const CardWrapper: React.FC = () => {
  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>You have 3 unread messages.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Recent notifications will appear here.</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="ghost">Cancel</Button>
        <Button>View all</Button>
      </CardFooter>
    </Card>
  );
};

// --- Dialog ---
const Dialog = dynamicImport('@/components/ui/dialog', 'Dialog');
const DialogTrigger = dynamicImport('@/components/ui/dialog', 'DialogTrigger');
const DialogContent = dynamicImport('@/components/ui/dialog', 'DialogContent');
const DialogHeader = dynamicImport('@/components/ui/dialog', 'DialogHeader');
const DialogFooter = dynamicImport('@/components/ui/dialog', 'DialogFooter');
const DialogTitle = dynamicImport('@/components/ui/dialog', 'DialogTitle');
const DialogDescription = dynamicImport('@/components/ui/dialog', 'DialogDescription');

export const DialogWrapper: React.FC = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open Dialog</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-right text-sm font-medium">Name</label>
            <input
              className="col-span-3 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Your name"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-right text-sm font-medium">Username</label>
            <input
              className="col-span-3 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="@username"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// --- Popover ---
const Popover = dynamicImport('@/components/ui/popover', 'Popover');
const PopoverTrigger = dynamicImport('@/components/ui/popover', 'PopoverTrigger');
const PopoverContent = dynamicImport('@/components/ui/popover', 'PopoverContent');

export const PopoverWrapper: React.FC = () => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open Popover</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Dimensions</h4>
            <p className="text-sm text-muted-foreground">
              Set the dimensions for the layer.
            </p>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-4">
              <label className="text-sm" htmlFor="width">Width</label>
              <input
                id="width"
                className="col-span-2 h-8 rounded-md border border-input bg-background px-3 py-1 text-sm"
                placeholder="100%"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <label className="text-sm" htmlFor="height">Height</label>
              <input
                id="height"
                className="col-span-2 h-8 rounded-md border border-input bg-background px-3 py-1 text-sm"
                placeholder="25px"
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

// --- Combobox ---
const Combobox = dynamicImport('@/components/ui/molecules/combobox/Combobox', 'Combobox');

export const ComboboxWrapper: React.FC = () => {
  const [value, setValue] = React.useState("");
  
  const frameworks = [
    { value: "react", label: "React" },
    { value: "next", label: "Next.js" },
    { value: "vue", label: "Vue" },
    { value: "angular", label: "Angular" },
    { value: "svelte", label: "Svelte" },
  ];

  return (
    <div className="w-80">
      <Combobox
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

// Export all wrappers as a collection
export const ShadcnWrappers = {
  Accordion: AccordionWrapper,
  Button: ButtonWrapper,
  Card: CardWrapper,
  Combobox: ComboboxWrapper,
  Dialog: DialogWrapper,
  Popover: PopoverWrapper,
  
  // ... add more wrappers as needed
};

// Default export for dynamic imports
export default ShadcnWrappers; 