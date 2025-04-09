# UI Component Library

## Overview

The UI component library provides a comprehensive set of reusable components designed with accessibility, customization, and type safety in mind. It implements the atomic design methodology and leverages Shadcn UI for consistent, accessible components.

## Shadcn UI Integration

This project extensively uses [Shadcn UI](https://ui.shadcn.com/), a collection of reusable components built with:

- **Radix UI** for accessible primitives
- **Tailwind CSS** for styling
- **TypeScript** for type safety

Key features of our Shadcn integration:

- **Component Configuration**: Managed in `config/ui/components.json`
- **Custom Styling**: Extended with our brand colors and design system
- **Accessibility**: WCAG 2.1 AA compliant components
- **CLI Tools**: Add components with `npx shadcn-ui add [component]`
- **Type Safety**: Full TypeScript support for props and variants

## Available Components

The library includes these key components:

### Core Components

- **Accordion**: Expandable content sections
- **Alert**: Contextual feedback messages
- **Badge**: Small count and labeling component
- **Button**: Interactive button with various styles
- **Card**: Container for content and actions
- **Input**: Text input fields
- **Label**: Form labels with consistent styling
- **Modal**: Dialog windows
- **Select**: Dropdown selection menu
- **Slider**: Range slider control
- **Switch**: Toggle control
- **Table**: Data table with various features
- **Tabs**: Tabbed interface for content organization

### Form Components

- **FormField**: Wrapper for form inputs with labels and validation
- **Checkbox**: Binary selection with indeterminate state
- **Radio**: Single selection options
- **Select**: Dropdown selection
- **Input**: Text input fields
- **Textarea**: Multi-line text input

### Layout Components 

- **Container**: Controls maximum width and centers content
- **Grid**: CSS Grid-based layout system
- **Card**: Content containers with optional sections

### Feedback Components

- **Alert**: Contextual messages (info, success, warning, error)
- **Toast**: Non-intrusive notifications
- **Spinner**: Loading indicators

## Component Registry System

The project implements a Single Source of Truth (SSOT) approach for UI components:
- Configuration files in `/config/ui/`
- Runtime registries in `/public/static/component-registry.json`
- Component discovery tools in development
- Automated validation of component paths and dependencies

## UI Component Browser

A comprehensive UI component browser is available at `/debug-tools/ui-components` in development, providing:

- **Visual Component Library**: Browse all UI components
- **Interactive Props**: Test components with different props
- **Accessibility Checks**: Verify WCAG compliance
- **Responsive Testing**: View components at different breakpoints
- **Implementation Details**: View component source code and documentation
- **Used-by List**: See where each component is used

## Icon Component

The Icon component provides a unified way to display various types of icons across the application:

- **UI Icons**: Simple SVG path-based icons for common UI elements
- **KPI Icons**: Brand measurement icons for different KPIs (brand awareness, ad recall, etc.)
- **App Icons**: Application-specific icons from the public directory
- **Platform Icons**: Social media platform icons (Instagram, YouTube, TikTok, etc.)

Usage examples:

```tsx
// UI Icon
<Icon name="check" />

// KPI Icon
<Icon kpiName="brandAwareness" />

// App Icon
<Icon appName="profile" />

// Platform Icon
<Icon platformName="instagram" solid />

// With size
<Icon name="search" size="lg" />

// With color
<Icon name="warning" color="red" />
```

## Typography System

The Typography component system provides consistent text styling:

1. **Heading**: For titles and section headings (h1-h6)
2. **Text**: For inline text elements
3. **Paragraph**: For block text elements

Usage examples:

```tsx
// Headings
<Heading level={1}>Page Title</Heading>
<Heading level={2} size="xl">Section Title</Heading>

// Text
<Text size="sm" weight="bold">Bold small text</Text>
<Text color="primary">Primary color text</Text>

// Paragraph
<Paragraph>Default paragraph text with bottom margin</Paragraph>
<Paragraph size="sm" color="muted">Small muted paragraph</Paragraph>
```

## Component Directory Structure

Each UI component follows this consistent structure:

```
src/components/ui/
├── {component}/               # Main component directory
│   ├── index.ts               # Exports all from this component
│   ├── {Component}.tsx        # Main component implementation
│   ├── README.md              # Component documentation
│   ├── styles/                # Component styles 
│   │   └── {component}.styles.ts
│   ├── types/                 # Component type definitions
│   │   └── index.ts
│   ├── utils/                 # Component utility functions (if needed)
│   └── examples/              # Example implementations (if needed)
```

## Component Implementation Guidelines

1. **Component Files**:
   - Use PascalCase for component files: `Button.tsx`, not `button.tsx`
   - Place in the root of the component directory

2. **Style Files**:
   - Place in `styles/` subdirectory
   - Use kebab-case: `button.styles.ts`

3. **Type Definitions**:
   - Place in `types/` subdirectory
   - Export all types from `types/index.ts`

4. **Documentation**:
   - Include a README.md with usage examples
   - Document props and variants

5. **Examples**:
   - Place in `examples/` subdirectory
   - Create demonstrations of various use cases 