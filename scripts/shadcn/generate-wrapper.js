// scripts/shadcn/generate-wrapper.js
const fs = require('fs');
const path = require('path');

/**
 * Component Wrapper Generator
 * 
 * This script:
 * 1. Generates a canonical wrapper file for all UI components
 * 2. Creates appropriate wrappers based on component types
 * 3. Handles subcomponents and special requirements
 * 4. Follows the proven implementation pattern
 */

// Load component analysis
let components;
try {
  components = require('../component-analysis.json');
} catch (error) {
  console.error('❌ Component analysis not found. Run analyze-components.js first.');
  process.exit(1);
}

// Configuration
const OUTPUT_PATH = 'src/app/(admin)/debug-tools/ui-components/wrappers/canonical-shadcn-wrappers.tsx';

// Template for dynamic imports
const generateImportTemplate = (comp) => {
  const importName = `${comp.componentName}Import`;
  const flatPath = comp.flatPath;
  
  return `const ${importName} = dynamic(
  () => safeDynamicImport(
    '${flatPath}',
    '${comp.componentName}',
    () => <ErrorLoadingComponent name="${comp.componentName}" />
  ),
  { ssr: false }
);`;
};

// Template for subcomponent imports
const generateSubcomponentImports = (comp) => {
  if (!comp.hasSubcomponents || comp.hasSubcomponents.length <= 1) return '';
  
  return comp.hasSubcomponents
    .filter(sub => sub !== comp.componentName)
    .map(sub => {
      return `const ${sub}Import = dynamic(
  () => safeDynamicImport(
    '${comp.flatPath}',
    '${sub}',
    () => <ErrorLoadingComponent name="${sub}" />
  ),
  { ssr: false }
);`;
    })
    .join('\n\n');
};

// Generate appropriate JSX for a component based on its type and requirements
const generateComponentJSX = (comp) => {
  const componentName = comp.componentName;
  const importName = `${componentName}Import`;
  
  // Special case handlers for different component types
  switch(componentName.toLowerCase()) {
    case 'accordion':
      return `<${importName} type="single" collapsible>
        <AccordionItemImport value="item-1">
          <AccordionTriggerImport>Section 1</AccordionTriggerImport>
          <AccordionContentImport>Content for section 1</AccordionContentImport>
        </AccordionItemImport>
        <AccordionItemImport value="item-2">
          <AccordionTriggerImport>Section 2</AccordionTriggerImport>
          <AccordionContentImport>Content for section 2</AccordionContentImport>
        </AccordionItemImport>
      </${importName}>`;
      
    case 'alert':
      return `<${importName}>
        <AlertTitleImport>Default Alert</AlertTitleImport>
        <AlertDescriptionImport>
          This is a default alert component with title and description.
        </AlertDescriptionImport>
      </${importName}>
      
      <${importName} variant="destructive">
        <AlertTitleImport>Destructive Alert</AlertTitleImport>
        <AlertDescriptionImport>
          This is a destructive alert for error states.
        </AlertDescriptionImport>
      </${importName}>`;
      
    case 'button':
      // Generate button with all detected variants
      const variants = comp.variants && comp.variants.length 
        ? comp.variants 
        : ['default', 'secondary', 'outline', 'destructive', 'ghost', 'link'];
      
      return variants.map(variant => 
        `<${importName} variant="${variant}">${variant.charAt(0).toUpperCase() + variant.slice(1)}</${importName}>`
      ).join('\n      ');
      
    case 'card':
      return `<${importName}>
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
      </${importName}>`;
      
    case 'dialog':
    case 'modal':
      return `<${importName} open={open} onOpenChange={setOpen}>
        <DialogTriggerImport>
          <button className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90">
            Open Dialog
          </button>
        </DialogTriggerImport>
        <DialogContentImport>
          <h2 className="text-lg font-semibold mb-2">Dialog Title</h2>
          <p className="mb-4">Dialog content goes here. This demonstrates the complete Dialog component.</p>
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
      </${importName}>`;
    
    case 'popover':
      return `<${importName} open={open} onOpenChange={setOpen}>
        <PopoverTriggerImport>
          <button className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90">
            Open Popover
          </button>
        </PopoverTriggerImport>
        <PopoverContentImport className="p-4 w-72">
          <div className="space-y-2">
            <h3 className="font-medium">Popover Title</h3>
            <p className="text-sm text-gray-500">
              This demonstrates the complete Popover component.
            </p>
          </div>
        </PopoverContentImport>
      </${importName}>`;
      
    case 'select':
    case 'combobox':
      return `<${importName}
        options={[
          { value: "option1", label: "Option 1" },
          { value: "option2", label: "Option 2" },
          { value: "option3", label: "Option 3" }
        ]}
        value={value}
        onValueChange={setValue}
        placeholder="Select an option..."
      />`;
      
    case 'tabs':
      return `<${importName} defaultValue="tab1">
        <TabsListImport>
          <TabsTriggerImport value="tab1">Tab 1</TabsTriggerImport>
          <TabsTriggerImport value="tab2">Tab 2</TabsTriggerImport>
        </TabsListImport>
        <TabsContentImport value="tab1">
          Content for Tab 1
        </TabsContentImport>
        <TabsContentImport value="tab2">
          Content for Tab 2
        </TabsContentImport>
      </${importName}>`;
      
    // Add more special cases as needed
    
    default:
      // Default simple wrapper with text content
      if (comp.hasSubcomponents && comp.hasSubcomponents.length > 1) {
        // If it has subcomponents but no special case, show a simple example
        return `<${importName}>
        ${componentName} Example
      </${importName}>`;
      } else {
        // Simple component with just text content
        return `<${importName}>
        ${componentName} Example
      </${importName}>`;
      }
  }
};

// Template for wrapper components
const generateWrapperTemplate = (comp) => {
  // Customize wrapper based on component type
  let wrapperContent = '';
  let stateImports = '';
  
  // Check if component needs state
  if (['dialog', 'modal', 'popover', 'select', 'combobox'].includes(comp.componentName.toLowerCase())) {
    stateImports = `const [open, setOpen] = React.useState(true);\n  `;
    
    if (['select', 'combobox'].includes(comp.componentName.toLowerCase())) {
      stateImports += `const [value, setValue] = React.useState("");\n  `;
    }
  }
  
  // Special wrapper class and layout based on component type
  let wrapperClass = 'wrapper-component';
  if (comp.componentName.toLowerCase() === 'button') {
    wrapperClass += ' flex gap-2 flex-wrap';
  } else if (['card', 'select', 'combobox'].includes(comp.componentName.toLowerCase())) {
    wrapperClass += ' w-[350px]';
  } else if (['alert'].includes(comp.componentName.toLowerCase())) {
    wrapperClass += ' space-y-4';
  }
  
  // Generate the JSX for the component
  const componentJSX = generateComponentJSX(comp);
  
  // Create the wrapper function
  return `export const ${comp.componentName}Wrapper = (props: any) => {
  ${stateImports}return (
    <div className="${wrapperClass}">
      ${componentJSX}
    </div>
  );
};`;
};

// Generate the full canonical wrappers file
const generateCanonicalWrappersFile = () => {
  // Gather all imports
  const imports = components.map(generateImportTemplate);
  
  // Gather all subcomponent imports
  const subImports = components
    .filter(comp => comp.hasSubcomponents && comp.hasSubcomponents.length > 1)
    .map(generateSubcomponentImports)
    .filter(Boolean);
  
  // Generate all wrapper components
  const wrappers = components.map(generateWrapperTemplate);
  
  // Create the exports section
  const wrapperRegistration = components
    .map(comp => `  ${comp.componentName}: ${comp.componentName}Wrapper`)
    .join(',\n');
  
  // Generate the full file template
  const template = `/**
 * CANONICAL IMPLEMENTATION - Single Source of Truth
 * AUTO-GENERATED FILE - Use the wrapper generator to update
 * Generated on ${new Date().toISOString()}
 */

import React from 'react';
import dynamic from 'next/dynamic';
import { 
  safeDynamicImport, 
  resolveShadcnPath, 
  COMPONENT_IMPORTS
} from '../utils/component-registry-utils';

// Error component for when dynamic import fails
const ErrorLoadingComponent = ({ name }: { name: string }) => (
  <div className="p-4 border border-red-200 rounded bg-red-50 text-red-600">
    <h3 className="font-medium mb-2">Failed to load {name}</h3>
    <div className="text-sm">
      This component could not be loaded dynamically. Check console for details.
    </div>
  </div>
);

// Loading component for dynamic imports
const ComponentLoading = () => (
  <div className="animate-pulse bg-muted rounded h-24 w-full flex items-center justify-center">
    <div className="text-muted-foreground text-sm">Loading component...</div>
  </div>
);

// COMPONENT IMPORTS SECTION
// -------------------------
// CRITICAL: These MUST be defined BEFORE the wrapper components
${imports.join('\n\n')}

// SUBCOMPONENT IMPORTS SECTION
// ---------------------------
// These are components that are used within other components
${subImports.join('\n\n')}

// WRAPPER COMPONENTS SECTION
// -------------------------
// These define how components are rendered in the debug tools
${wrappers.join('\n\n')}

// EXPORTS SECTION
// --------------
// This is the object that makes components available to the debug tools
export const ShadcnWrappers = {
${wrapperRegistration}
};

export default ShadcnWrappers;
`;

  // Create backup if file exists
  if (fs.existsSync(OUTPUT_PATH)) {
    fs.copyFileSync(OUTPUT_PATH, `${OUTPUT_PATH}.bak`);
    console.log(`✅ Created backup at ${OUTPUT_PATH}.bak`);
  }

  // Write the new file
  fs.writeFileSync(OUTPUT_PATH, template);
  console.log(`✅ Generated canonical wrappers file at ${OUTPUT_PATH}`);
  
  // Generate a summary report
  const report = {
    timestamp: new Date().toISOString(),
    totalComponents: components.length,
    withSubcomponents: components.filter(c => c.hasSubcomponents && c.hasSubcomponents.length > 1).length,
    specialCases: Object.keys(components.reduce((acc, comp) => {
      if (['accordion', 'alert', 'button', 'card', 'dialog', 'popover', 'tabs', 'select', 'combobox'].includes(comp.componentName.toLowerCase())) {
        acc[comp.componentName.toLowerCase()] = true;
      }
      return acc;
    }, {})).length,
    outputPath: OUTPUT_PATH
  };
  
  fs.writeFileSync('wrapper-generation-report.json', JSON.stringify(report, null, 2));
};

// Execute the generation
console.log('🔨 Generating canonical wrappers file...');
generateCanonicalWrappersFile();