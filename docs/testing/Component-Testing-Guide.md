# UI Component Testing Guide

This guide outlines the testing process for UI components following our migration to Atomic Design and centralized exports.

## Testing Objectives

1. **Verify Import Paths**: Ensure components can be imported via both centralized and direct paths
2. **Validate Icon Usage**: Confirm all components use FontAwesome icons, not Lucide
3. **Check Functionality**: Test that components function as expected
4. **Confirm Accessibility**: Verify components meet accessibility standards

## Testing Tools

### 1. Component Rendering Test Script

The `test-component-rendering.js` script verifies that components can be imported from both paths:

```bash
# Test all components
node shadcn-rendering/test-component-rendering.js

# Test a specific component
node shadcn-rendering/test-component-rendering.js --component=button

# Show detailed output
node shadcn-rendering/test-component-rendering.js --verbose
```

This script confirms that both import methods resolve to the same implementation:

```javascript
// Centralized import (Shadcn-style)
import { Button } from '@/components/ui';

// Direct Atomic Design import
import { Button } from '@/components/ui/atoms/button/Button';
```

### 2. Icon Usage Validation

Check that components use our FontAwesome icon system rather than Lucide:

```bash
# Run the validation script
node shadcn-rendering/validate-components.js --check-icons

# Fix icon issues automatically
node shadcn-rendering/validate-components.js --fix-icons
```

### 3. Visual Testing

To visually inspect components:

1. Run the component showcase app:
   ```bash
   npm run storybook
   ```

2. For each component, verify:
   - Renders correctly
   - States work (hover, focus, active, disabled)
   - Icons display properly
   - Responsive behavior is correct
   - Animations perform as expected

### 4. Accessibility Testing

Test each component for accessibility compliance:

```bash
# Run automated accessibility tests
npm run test:a11y
```

Additionally, manually check:
- Keyboard navigation works
- Screen reader announces components correctly
- Focus states are visible
- Color contrast meets WCAG standards

## Testing Process

### Step 1: Prepare Your Testing Environment

```bash
# Ensure you have the latest code
git pull

# Install dependencies
npm install

# Build the components
npm run build
```

### Step 2: Run Automated Import Tests

```bash
# Test all component imports
node shadcn-rendering/test-component-rendering.js
```

If issues are found:
1. Check the component in the centralized `index.ts` file
2. Ensure the component exists in the correct atomic location
3. Fix any naming inconsistencies

### Step 3: Validate Icon Usage

```bash
# Check for any remaining Lucide icon usage
node shadcn-rendering/validate-components.js --check-icons
```

If Lucide icons are found:
1. Replace them with our FontAwesome IconAdapter
2. Re-run the validation script to confirm fixes

### Step 4: Visual and Functional Testing

For each component:

1. Import using both methods in a test component:
   ```tsx
   import { Button as CentralizedButton } from '@/components/ui';
   import { Button as AtomicButton } from '@/components/ui/atoms/button/Button';
   
   // They should be identical
   console.log(CentralizedButton === AtomicButton); // Should be true
   ```

2. Test all component states:
   - Default
   - Hover
   - Focus
   - Active
   - Disabled
   - Loading (if applicable)
   - Error (if applicable)

3. Test all component variants:
   - Sizes
   - Colors
   - Custom styling

### Step 5: Compatibility Testing

Test components in different contexts:

1. **Server Components**: 
   ```tsx
   // In a React Server Component
   import { Button } from '@/components/ui';
   
   export default async function Page() {
     return <Button>Server Component Button</Button>;
   }
   ```

2. **Client Components**:
   ```tsx
   'use client';
   import { Button } from '@/components/ui';
   
   export default function ClientComponent() {
     return <Button onClick={() => alert('Clicked')}>Client Component Button</Button>;
   }
   ```

3. **Different Browsers**: Test in Chrome, Firefox, Safari, and Edge

## Testing Compound Components

For compound components (like Dialog, Tabs, etc.), test the following:

1. All subcomponents work together correctly
2. Both dot notation and named imports work:
   ```tsx
   // Dot notation
   <Dialog>
     <Dialog.Trigger>Open</Dialog.Trigger>
     <Dialog.Content>
       <Dialog.Header>
         <Dialog.Title>Title</Dialog.Title>
       </Dialog.Header>
     </Dialog.Content>
   </Dialog>
   
   // Named imports
   <Dialog>
     <DialogTrigger>Open</DialogTrigger>
     <DialogContent>
       <DialogHeader>
         <DialogTitle>Title</DialogTitle>
       </DialogHeader>
     </DialogContent>
   </Dialog>
   ```

## Testing Components at Multiple Atomic Levels

For components that exist at multiple atomic levels:

1. Test each variant can be imported correctly:
   ```tsx
   // Import atoms version
   import { MultiSelectAtom } from '@/components/ui';
   
   // Import organisms version
   import { MultiSelect } from '@/components/ui';
   ```

2. Verify each behaves as expected according to its atomic level

## Test Documentation

For each component you test, document your results:

```markdown
## Component: Button

### Import Test
- ✅ Centralized Import (`@/components/ui`)
- ✅ Atomic Design Import (`@/components/ui/atoms/button/Button`)
- ✅ Same Implementation

### Icon Usage
- ✅ Uses FontAwesome IconAdapter
- ✅ No Lucide Icons

### Visual Test
- ✅ Default State
- ✅ Hover State
- ✅ Focus State
- ✅ Disabled State
- ✅ All Variants

### Accessibility
- ✅ Keyboard Accessible
- ✅ Screen Reader Announcements
- ✅ Focus Visible
- ✅ Color Contrast

### Issues Found
- None
```

## Troubleshooting Common Issues

### Import Issues

1. **Component Not Found**:
   - Check if it's exported in `index.ts`
   - Verify the component file exists in the correct atomic location
   - Check for naming inconsistencies (PascalCase vs. kebab-case)

2. **Different Implementations**:
   - If the centralized and atomic imports resolve to different implementations,
     run `node shadcn-rendering/validate-components.js --fix` to resolve duplicates

### Icon Issues

1. **Icon Not Rendering**:
   - Check the IconAdapter import is correct
   - Verify the icon name exists in our registry
   - Check for typos in the iconId

2. **Lucide Icons Still Present**:
   - Remove the Lucide imports
   - Replace with IconAdapter
   - Update any style-specific code

### Style Issues

1. **Component Looks Different**:
   - Check if the component is using `cn()` utility for class merging
   - Verify TailwindCSS is properly configured
   - Check for hardcoded styles that should use variables

2. **Missing Variants**:
   - Ensure the `cva()` function includes all needed variants
   - Check if variants are properly passed through props

## Reporting and Tracking Issues

Report any issues found using the issue template:

```markdown
## Component Issue Report

- **Component**: [Name]
- **Import Path**: [Path used]
- **Environment**: [Browser, Node version, etc.]
- **Issue Type**: [Import, Visual, Functional, Icon]

### Description
[Detailed description of the issue]

### Expected Behavior
[What should happen]

### Actual Behavior
[What actually happens]

### Steps to Reproduce
1. [First step]
2. [Second step]
3. [And so on...]

### Screenshots/Recordings
[If applicable]
```

## Completing the Test Process

Once you've tested all components:

1. Update the Migration-Tracking.md file:
   - Mark components as tested
   - Update status of each component

2. Run a final validation:
   ```bash
   node shadcn-rendering/test-component-rendering.js
   node shadcn-rendering/validate-components.js
   node shadcn-rendering/validate-component-exports.js
   ```

3. Document your test process and results

## Conclusion

Thorough testing ensures our UI component system maintains integrity through the migration process. By testing both import paths, icon usage, and component functionality, we ensure a consistent developer experience and maintain our Single Source of Truth principles.
