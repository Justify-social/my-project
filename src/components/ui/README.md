# UI Component Library

This directory contains all the shared UI components for the application, designed to be reusable, robust, and scalable.

## Directory Structure

Our UI component library follows a clean, modular structure:

- `/button` - Button components including variations and states
- `/calendar` - Calendar and date-related components
- `/icons` - Icon system with variants and utilities
- `/spinner` - Loading spinners and indicators
- `/loading-skeleton` - Skeleton loading patterns for content

## Recent Optimizations

### Icon System Unification (2025-03-27)

We've completed a major optimization of the icon system:

1. **Consolidated Directory Structure**
   - Moved all icons to `/components/ui/icons`
   - Updated paths from `/public/ui-icons/` to `/public/icons/`

2. **Improved Component Architecture**
   - Organized components into logical directories (`core`, `variants`, `utils`)
   - Created single entry point for consistent imports
   - Added proper type definitions for better IDE support

3. **Simplified Developer Experience**
   - Standardized icon import patterns
   - Improved documentation and examples
   - Added deprecation notices to legacy files

### Loading Component Consolidation

We've also optimized our loading/spinner components:

1. **Consolidated Implementation**
   - Primary implementation now in `/spinner` directory
   - Created backward compatibility layers for existing imports
   - Standardized API across all spinner variants

2. **Improved Customization Options**
   - Consistent sizing system
   - Unified color variants
   - Better accessibility features

## Usage Guidelines

### Icons

```tsx
// Preferred import pattern
import { Icon, ButtonIcon, StaticIcon } from '@/components/ui/icons';

// Basic usage
<Icon name="star" />

// With hover effect
<ButtonIcon name="star" />

// Without hover effect
<StaticIcon name="star" />
```

### Spinners

```tsx
// Preferred import pattern
import { Spinner, ButtonSpinner } from '@/components/ui/spinner';

// Basic usage
<Spinner />

// Inside a button
<ButtonSpinner />

// With customizations
<Spinner size="lg" variant="primary" label="Loading..." />
```

## Deprecated Components

The following components are deprecated and will be removed in a future update:

- `/icon.tsx` - Use `/icons/index.ts` instead
- `/icon-wrapper.tsx` - Use `/icons/index.ts` instead  
- `/safe-icon.tsx` - Use `/icons/core/safe-icon.tsx` instead
- `/custom-icon-display.tsx` - Use `/icons/examples/index.ts` instead
- `/loading-spinner` - Use `/spinner` instead
- `/loading-skeleton/spinners` - Use `/spinner` instead

## Next Steps

Our optimization efforts are ongoing:

1. **Tree-Shaking Support**
   - Implement proper tree-shaking for icon components
   - Ensure unused components don't add to bundle size

2. **Component Consolidation**
   - Complete removal of deprecated components
   - Ensure consistent API across component families

## Contributing

When adding new UI components, please follow these guidelines:

1. Create a dedicated directory for your component
2. Include both the component and an index.ts file
3. Add proper TypeScript typings
4. Document usage examples
5. Add appropriate tests

## Component Inventory

### Current Components

| Component | Description | Variants | File |
|-----------|-------------|----------|------|
| Card | Container component with header, content, and footer sections | Standard | card.tsx |
| Loading | Loading indicators | Spinners (border, SVG), Skeletons (rectangular, circular, text, card) | spinner.tsx, skeleton.tsx |
| LoadingSpinner | SVG-based loading indicator | - | loading-spinner.tsx |
| LoadingSpinner (duplicate) | Border-based loading indicator | - | LoadingSpinner.tsx |
| NotificationBell | Notification indicator | - | NotificationBell.tsx |
| Toast | Feedback popup component | - | toast.tsx |
| Button | Action button component | primary, secondary, outline, ghost, link, danger | button.tsx |
| Input | Form input component | text, email, password, number | input.tsx |
| Icon | SVG icon component | UI icons (SVG paths), KPI icons (from CSS), App icons (from CSS), Special icons (profile, file, etc.), Platform icons, Heroicons (solid/outline) | icon.tsx |
| Typography | Text styling components | Heading (h1-h6), Text (inline), Paragraph (block) | typography.tsx |
| Container | Layout width controller | sm, md, lg, xl, full with padding control | container.tsx |
| Grid | CSS Grid layout component | Responsive columns (1-12) with gap sizes | grid.tsx |
| Alert | Feedback messaging component | info, success, warning, error, with/without title | alert.tsx |
| FormField | Form input wrapper | vertical, horizontal layouts with integrated help text and error states | form-field.tsx |
| Select | Dropdown select | sm, md, lg sizes with optional placeholder and chevron | select.tsx |
| Checkbox | Binary selection | sm, md, lg sizes with indeterminate state and label support | checkbox.tsx |
| Radio | Single selection | standalone or grouped, horizontal/vertical orientations | radio.tsx |
| Table | Tabular data display | With sorting, pagination and custom cell rendering | table.tsx |
| List | Item collection display | ordered, unordered, with icons, actions and dividers | list.tsx |
| Avatar | User profile image component | xs, sm, md, lg, xl sizes, with fallback initials, status indicator | avatar.tsx |
| Badge | Label with optional count | default, primary, secondary, accent, outline, status variants | badge.tsx |
| Calendar | Month view calendar | With events, navigation, selection | calendar.tsx |
| Progress | Progress indicators | Linear (horizontal bar), Circular (radial) | progress.tsx |
| Tabs | Tabbed interface | underline, pills, enclosed, button variants | tabs.tsx |
| Color Palette | Brand color system | Primary, secondary, accent, background, divider, interactive | - |
| Logos | Brand identity elements | Primary logo, logo on dark, favicon, logo with text | - |

### Implementation Status

All planned components from Waves 1-3 have been successfully implemented, plus additional components identified from the dashboard:

1. ✅ Wave 1: Core UI Components
   - ✅ Button (primary, secondary, outline variants with enhanced hover styles)
   - ✅ Input (text, number, password types)
   - ✅ Icon (unified component for all icons)
   - ✅ Typography (heading, paragraph, text components)

2. ✅ Wave 2: Layout and Feedback Components
   - ✅ Container (responsive container with size variants)
   - ✅ Grid (responsive grid system with gap control)
   - ✅ Card (with variants, header/content/footer, MetricCard)
   - ✅ Alert (info, success, warning, error variants)
   - ✅ Toast (success, error, info, warning with positions and durations)

3. ✅ Wave 3: Form and Data Components
   - ✅ FormField (with label, help text, error states and layouts)
   - ✅ Select (dropdown with options, sizes, and placeholder support)
   - ✅ Checkbox (with indeterminate state and label positioning)
   - ✅ Radio (standalone and RadioGroup implementations)
   - ✅ Table (sortable, with pagination, custom cell rendering)
   - ✅ List (flexible list component with various display options)

4. ✅ Dashboard Components (Additional)
   - ✅ Avatar (user profile images with sizes, fallback, status)
   - ✅ Badge (label variants including status badges)
   - ✅ Calendar (month view with events, navigation)
   - ✅ Progress (linear and circular progress indicators)
   - ✅ Tabs (tabbed interface with multiple variants)
   - ✅ Skeleton Loading (rectangular, circular, text patterns with animation)

### Issues to Address

1. **Spinner Consolidation**: Currently have 3 different spinner implementations that need to be unified
2. **Naming Conventions**: Inconsistent naming (LoadingSpinner.tsx vs loading-spinner.tsx)
3. **Component Structure**: Need consistent structure with proper TypeScript typing
4. **Documentation**: Missing prop documentation and usage examples
5. **Centralized Exports**: Need proper exports through index.ts

## Migration Plan

1. ✅ Consolidate spinner components
2. ✅ Implement unified Button component
3. ✅ Implement unified Input component
4. ✅ Implement unified Icon component
5. ✅ Implement Typography components
6. ✅ Standardize naming conventions
7. ✅ Add proper documentation
8. ✅ Create consistent component patterns
9. ⏳ Implement Storybook for visual documentation
10. 🔜 Implement Usage Tracking System

## Debug and Testing

There's a comprehensive debug page available to view and test all UI components:

- **URL**: [http://localhost:3000/debug-tools/ui-components](http://localhost:3000/debug-tools/ui-components)
- **Components Displayed**: All components including Spinner, Button, Input, Icon, Card, etc.
- **Purpose**: Use this page to test components and see their variants in one place

To access this page, navigate to [http://localhost:3000/debug-tools](http://localhost:3000/debug-tools) and click on "View UI Components".

## Usage

```tsx
// Import components from the central export
import { Card, CardHeader, CardContent, Spinner, Button, Input, Icon } from '@/components/ui';

// Use in your components
const MyComponent = () => (
  <Card>
    <CardHeader>Title</CardHeader>
    <CardContent>
      <Spinner size="md" variant="primary" />
      <Button variant="primary" size="md" leftIcon={<Icon name="search" />}>Click Me</Button>
      <Input label="Email" type="email" placeholder="Enter your email" />
      
      {/* Use KPI icons from the CSS */}
      <Icon kpiName="brandAwareness" />
      
      {/* Use App icons from the CSS */}
      <Icon appName="home" active />
      
      {/* Use Special icons */}
      <Icon appName="profile" />
      <Icon appName="coins" />
      
      {/* Use Platform icons */}
      <Icon platformName="instagram" solid />
      
      {/* Use Heroicons */}
      <Icon heroSolid="DocumentIcon" />
      <Icon heroOutline="TrashIcon" />
    </CardContent>
  </Card>
);
```

## Icon Component

The Icon component provides a unified way to display various types of icons across the application.

- **UI Icons**: Simple SVG path-based icons for common UI elements
- **KPI Icons**: Brand measurement icons for different KPIs (brand awareness, ad recall, etc.)
- **App Icons**: Application-specific icons from the public directory
  - **Navigation Icons**: Icons used in the main navigation (home, campaigns, etc.)
  - **Special Icons**: Special-purpose icons (profile, bell, coins, magnifying glass, etc.)
- **Platform Icons**: Social media platform icons (Instagram, YouTube, TikTok, etc.)
- **Financial Icons**: Icons for financial elements (money, currency, etc.)
- **Heroicons**: Support for Heroicons library (both solid and outline variants) - DEPRECATED, use name prop instead

```tsx
// UI Icon
<Icon name="check" />

// KPI Icon
<Icon kpiName="brandAwareness" />

// Special App Icon
<Icon appName="profile" />
<Icon appName="bell" />
<Icon appName="coins" />

// Navigation App Icon
<Icon appName="home" />
<Icon appName="campaigns" />
<Icon appName="settings" />

// Platform Icon
<Icon platformName="instagram" solid />
<Icon platformName="youtube" solid />

// Financial Icon
<Icon name="money" />

// Heroicon (solid) - DEPRECATED
<Icon heroSolid="UserIcon" />
// Use instead:
<Icon name="user" solid />

// Heroicon (outline) - DEPRECATED
<Icon heroOutline="PencilIcon" />
// Use instead:
<Icon name="edit" />

// With size
<Icon name="search" size="lg" />

// With color
<Icon name="warning" color="red" />
```

Available sizes: `xs`, `sm`, `md` (default), `lg`, `xl`

**Available UI Icons:**
- search, plus, minus, close, check, chevronDown, chevronUp, chevronLeft, chevronRight, user, settings, mail, calendar, trash, warning, info, bell

**Available KPI Icons:**
- brandAwareness, adRecall, consideration, messageAssociation, brandPreference, purchaseIntent, actionIntent, recommendationIntent, advocacy

**Available App Icons:**
- Special: profile, coins, bell, magnifyingGlass, file, globe, window
- Navigation: home, campaigns, influencers, brandLift, brandHealth, creativeAssetTesting, mmm, reports, billing, settings, help

**Available Platform Icons:**
- instagram, youtube, tiktok, facebook, x-twitter, linkedin

**Common Heroicons:**
- Solid: DocumentIcon, PlayIcon, PauseIcon, CheckIcon, SparklesIcon, UserIcon, XMarkIcon, ExclamationTriangleIcon
- Outline: TrashIcon, ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon, ChevronUpIcon, PencilIcon, ArrowUpTrayIcon, CurrencyDollarIcon, CalendarDaysIcon 

#### Typography

The Typography component system provides a consistent way to style text throughout the application.

##### Heading

The Heading component is used for titles and section headings (h1-h6).

```tsx
// Basic usage with level (h1-h6)
<Heading level={1}>Page Title</Heading>
<Heading level={2}>Section Title</Heading>

// With custom size
<Heading level={2} size="xl">Smaller Section Title</Heading>

// With custom weight
<Heading level={3} weight="medium">Medium Weight Heading</Heading>

// With truncation for long text
<Heading truncate>Very long title that will be truncated with ellipsis</Heading>
```

Available levels: `1`, `2`, `3`, `4`, `5`, `6` (default: `2`)  
Available sizes: `xs`, `sm`, `md`, `lg`, `xl`, `2xl`, `3xl`, `4xl` (default: based on level)  
Available weights: `light`, `normal`, `medium`, `semibold`, `bold`, `extrabold` (default: `semibold`)

##### Text

The Text component is used for inline text elements with various styles.

```tsx
// Basic usage
<Text>Default text</Text>

// With size
<Text size="sm">Small text</Text>

// With weight
<Text weight="bold">Bold text</Text>

// With color
<Text color="primary">Primary color text</Text>
<Text color="muted">Muted text</Text>

// With custom HTML element
<Text as="label">This renders as a label</Text>

// With truncation
<Text truncate>Long text that will be truncated</Text>
```

Available elements: `span`, `div`, `p`, `label` (default: `span`)  
Available sizes: `xs`, `sm`, `base`, `lg`, `xl` (default: `base`)  
Available weights: `light`, `normal`, `medium`, `semibold`, `bold` (default: `normal`)  
Available colors: `default`, `muted`, `primary`, `secondary`, `accent`, `success`, `warning`, `danger` (default: `default`)

##### Paragraph

The Paragraph component is used for block text elements.

```tsx
// Basic usage
<Paragraph>Default paragraph text with bottom margin</Paragraph>

// With size
<Paragraph size="sm">Small paragraph text</Paragraph>

// With color
<Paragraph color="muted">Muted paragraph text</Paragraph>

// Without spacing
<Paragraph spaced={false}>Paragraph without bottom margin</Paragraph>
```

Available sizes: `sm`, `base`, `lg` (default: `base`)  
Available colors: `default`, `muted`, `primary`, `secondary` (default: `default`) 

## Component Documentation

### Container Component

The Container component is used to control the maximum width of content and center it within the viewport.

```tsx
// Default (lg width) centered container with padding
<Container>
  Content goes here
</Container>

// Small container
<Container size="sm">
  Narrow content
</Container>

// Full width container
<Container size="full">
  Edge-to-edge content
</Container>

// Container without default padding
<Container withPadding={false}>
  No padding content (add your own padding as needed)
</Container>
```

#### Container Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| size | 'sm' \| 'md' \| 'lg' \| 'xl' \| 'full' | 'lg' | Controls the maximum width |
| centered | boolean | true | Centers content horizontally |
| withPadding | boolean | true | Includes responsive padding |
| className | string | - | Additional CSS classes |

### Grid Component

The Grid component creates responsive grid layouts using CSS Grid.

```tsx
// Default 1-column grid
<Grid>
  <div>Item 1</div>
  <div>Item 2</div>
</Grid>

// 2-column grid
<Grid cols={2}>
  <div>Item 1</div>
  <div>Item 2</div>
</Grid>

// Responsive grid: 1 column on mobile, 2 on tablet, 3 on desktop
<Grid cols={1} colsMd={2} colsLg={3}>
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</Grid>

// Grid with custom gap size
<Grid gap="lg">
  <div>Item 1</div>
  <div>Item 2</div>
</Grid>
```

#### Grid Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| cols | 1-12 | 1 | Column count (mobile/default) |
| colsSm | 1-12 | - | Column count (sm breakpoint) |
| colsMd | 1-12 | - | Column count (md breakpoint) |
| colsLg | 1-12 | - | Column count (lg breakpoint) |
| colsXl | 1-12 | - | Column count (xl breakpoint) |
| gap | 'none' \| 'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' | 'md' | Gap size between grid items |
| className | string | - | Additional CSS classes |

### Alert Component

The Alert component displays feedback messages at different severity levels.

```tsx
// Info alert (default)
<Alert>
  This is an informational message.
</Alert>

// Success alert with title
<Alert variant="success" title="Success!">
  Your changes were saved successfully.
</Alert>

// Warning alert
<Alert variant="warning">
  Please review your information before proceeding.
</Alert>

// Error alert
<Alert variant="error">
  There was a problem with your request.
</Alert>

// Dismissible alert
<Alert variant="info" dismissible onDismiss={() => console.log('Alert dismissed')}>
  This alert can be dismissed.
</Alert>
```

#### Alert Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | 'info' \| 'success' \| 'warning' \| 'error' | 'info' | Alert severity level |
| title | string | - | Optional title/heading |
| dismissible | boolean | false | Shows close button |
| onDismiss | () => void | - | Callback when dismissed |
| className | string | - | Additional CSS classes |

### Card Component

Cards are used to group related information and actions in a container.

```tsx
// Basic card
<Card>
  <CardHeader>
    <h3 className="text-lg font-medium">Card Title</h3>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>

// Interactive card with hover effects
<Card variant="interactive" hoverable>
  <CardContent>
    <p>This card has hover effects</p>
  </CardContent>
</Card>

// Card header with icon and actions
<Card>
  <CardHeader
    icon={<Icon name="info" />}
    actions={<Button variant="ghost" size="sm">More</Button>}
  >
    Card with Icon
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
</Card>

// Metric card for displaying statistics
<MetricCard
  title="Total Users"
  value="1,234"
  icon={<Icon name="user" />}
  description="+12% from last month"
  trend={12}
/>
```

#### Card Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | 'default' \| 'interactive' \| 'outline' \| 'raised' | 'default' | Visual style variant |
| hoverable | boolean | false | Whether to apply hover effects |
| className | string | - | Additional CSS classes |

#### CardHeader Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| icon | ReactNode | - | Optional icon to display |
| actions | ReactNode | - | Optional actions (buttons, etc.) |
| className | string | - | Additional CSS classes |

#### CardContent Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| withPadding | boolean | true | Whether to apply padding |
| className | string | - | Additional CSS classes |

#### CardFooter Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| align | 'left' \| 'center' \| 'right' \| 'between' | 'right' | Alignment of footer content |
| withBorder | boolean | true | Whether to show top border |
| className | string | - | Additional CSS classes |

#### MetricCard Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| title | ReactNode | - | Title of the metric |
| value | ReactNode | - | Primary value to display |
| description | ReactNode | - | Secondary text (optional) |
| icon | ReactNode | - | Optional icon |
| trend | number | - | Optional trend value (affects colors) |
| className | string | - | Additional CSS classes |

### Toast Component

The Toast component provides non-intrusive notifications for success, error, info, and warning messages.

```tsx
// Basic usage with the useToast hook
import { useToast } from '@/components/ui/toast';

function MyComponent() {
  const { success, error, info, warning } = useToast();
  
  return (
    <Button onClick={() => success('Operation completed successfully')}>
      Show Success Toast
    </Button>
  );
}

// Wrapping your app with ToastProvider (typically done in a layout)
import { ToastProvider } from '@/components/ui/toast';

function MyApp({ children }) {
  return (
    <ToastProvider>
      {children}
    </ToastProvider>
  );
}

// Advanced usage with custom options
function AdvancedToastExample() {
  const { custom } = useToast();
  
  const showCustomToast = () => {
    custom({
      message: 'Custom toast with options',
      type: 'info',
      title: 'Custom Title',
      position: 'top-right',
      duration: 10000 // 10 seconds
    });
  };
  
  return (
    <Button onClick={showCustomToast}>Show Custom Toast</Button>
  );
}
```

#### Toast Hook API

The `useToast` hook provides the following methods:

| Method | Parameters | Description |
|--------|------------|-------------|
| success | message: string, options?: ToastOptions | Shows a success toast |
| error | message: string, options?: ToastOptions | Shows an error toast |
| info | message: string, options?: ToastOptions | Shows an info toast |
| warning | message: string, options?: ToastOptions | Shows a warning toast |
| custom | options: { message: string, type: ToastType } & ToastOptions | Shows a custom toast |
| dismiss | id: string | Dismisses a specific toast |
| dismissAll | - | Dismisses all toasts |

#### Toast Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| title | string | - | Optional title for the toast |
| duration | number | 5000 | Duration in milliseconds before auto-dismiss (0 disables auto-dismiss) |
| position | 'top-right' \| 'top-left' \| 'bottom-right' \| 'bottom-left' \| 'top-center' \| 'bottom-center' | 'bottom-right' | Position of the toast on the screen |
| onDismiss | () => void | - | Callback function called when toast is dismissed |

#### ToastProvider Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| defaultPosition | ToastPosition | 'bottom-right' | Default position for all toasts |
| children | ReactNode | - | Child components |

## Usage and Examples

### Layout Components

For basic page layouts, use the container and grid components:

```tsx
import { Container, Grid, Card } from '@/components/ui';

function LayoutExample() {
  return (
    <Container>
      <h1 className="text-2xl font-bold mb-6">Page Title</h1>
      
      <Grid cols={1} colsMd={2} colsLg={3} gap="lg">
        <Card>
          <CardHeader>Card 1</CardHeader>
          <CardContent>Content for card 1</CardContent>
        </Card>
        
        <Card>
          <CardHeader>Card 2</CardHeader>
          <CardContent>Content for card 2</CardContent>
        </Card>
        
        <Card>
          <CardHeader>Card 3</CardHeader>
          <CardContent>Content for card 3</CardContent>
        </Card>
      </Grid>
    </Container>
  );
}
```

### Feedback Components

For user feedback and notifications:

```tsx
import { Alert, Button } from '@/components/ui';

function FeedbackExample() {
  const [showAlert, setShowAlert] = useState(false);
  
  return (
    <div>
      <Button onClick={() => setShowAlert(true)}>
        Show Feedback
      </Button>
      
      {showAlert && (
        <Alert 
          variant="success" 
          title="Operation Complete" 
          dismissible 
          onDismiss={() => setShowAlert(false)}
        >
          The operation completed successfully.
        </Alert>
      )}
    </div>
  );
}
```

### FormField Component

FormField provides a consistent wrapper for form inputs with label, optional help text, validation messaging, and various styling options.

```tsx
// Basic usage
<FormField
  label="Username"
  id="username"
  helperText="Enter your username"
>
  <Input placeholder="Enter username" />
</FormField>

// With error message
<FormField
  label="Email"
  id="email"
  error="Please enter a valid email address"
>
  <Input type="email" placeholder="Enter email" />
</FormField>

// Horizontal layout
<FormField
  label="First Name"
  id="firstName"
  layout="horizontal"
  labelWidth="md"
>
  <Input placeholder="Enter first name" />
</FormField>

// With icons
<FormField
  label="Password"
  id="password"
  startIcon={<Icon name="lock" className="h-5 w-5 text-gray-400" />}
  endIcon={<Icon name="eye" className="h-5 w-5 text-gray-400" />}
>
  <Input type="password" placeholder="Enter password" />
</FormField>

// Compound component pattern
<FormField.Root>
  <FormField.Label htmlFor="name" required>Name</FormField.Label>
  <Input id="name" placeholder="Enter your name" />
  <FormField.HelperText>Enter your full name</FormField.HelperText>
  <FormField.ErrorMessage>This field is required</FormField.ErrorMessage>
</FormField.Root>
```

#### FormField Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| label | string | - | The form field label text |
| id | string | - | HTML ID for the input |
| children | ReactNode | - | Input element to render inside the form field |
| helperText | string | - | Optional help text to display below the input |
| error | string | - | Error message to display |
| required | boolean | false | Whether the field is required |
| disabled | boolean | false | Whether the field is disabled |
| startIcon | ReactNode | - | Optional icon to display before the input |
| endIcon | ReactNode | - | Optional icon to display after the input |
| layout | 'vertical' \| 'horizontal' | 'vertical' | Form field layout direction |
| labelWidth | 'sm' \| 'md' \| 'lg' \| 'xl' | 'md' | Space to use between label and input when in horizontal layout |

### Select Component

Select component extends the HTML select element with consistent styling, better accessibility, and enhanced features.

```tsx
// Basic usage
<Select
  options={[
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ]}
/>

// With placeholder
<Select
  placeholder="Select an option"
  options={[
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
  ]}
/>

// Different sizes
<Select
  size="sm"
  options={[
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
  ]}
/>

// Error state
<Select
  error
  options={[
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
  ]}
/>

// Without chevron icon
<Select
  showChevron={false}
  options={[
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
  ]}
/>

// Using with FormField
<FormField label="Country" id="country">
  <Select
    options={[
      { value: 'us', label: 'United States' },
      { value: 'ca', label: 'Canada' },
      { value: 'uk', label: 'United Kingdom' },
    ]}
  />
</FormField>
```

#### Select Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| options | SelectOption[] | - | Options to display in the select |
| placeholder | string | - | Placeholder text for the select |
| showChevron | boolean | true | Whether to display a chevron icon |
| size | 'sm' \| 'md' \| 'lg' | 'md' | Size of the select |
| fullWidth | boolean | false | Full width of parent container |
| error | boolean | false | Whether the select has an error |
| containerClassName | string | - | The container's additional className |

### Checkbox Component

Checkbox component with consistent styling, accessibility support, indeterminate state, and label integration.

```tsx
// Basic usage
<Checkbox id="accept" />

// With label
<Checkbox
  id="terms"
  label="I accept the terms and conditions"
/>

// Different sizes
<Checkbox
  id="small"
  size="sm"
  label="Small checkbox"
/>

<Checkbox
  id="medium"
  size="md"
  label="Medium checkbox"
/>

<Checkbox
  id="large"
  size="lg"
  label="Large checkbox"
/>

// Indeterminate state
<Checkbox
  id="indeterminate"
  indeterminate
  label="Indeterminate state"
/>

// Label position
<Checkbox
  id="leftLabel"
  label="Label on the left"
  labelPosition="left"
/>

// Disabled state
<Checkbox
  id="disabled"
  disabled
  label="Disabled checkbox"
/>

// Using with FormField
<FormField label="Agreement" id="agreement-field">
  <Checkbox
    id="agreement"
    label="I agree to the terms of service"
  />
</FormField>
```

#### Checkbox Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| label | string | - | Label for the checkbox |
| labelPosition | 'left' \| 'right' | 'right' | Position of the label relative to the checkbox |
| size | 'sm' \| 'md' \| 'lg' | 'md' | Size of the checkbox |
| indeterminate | boolean | false | Whether the checkbox is in an indeterminate state |
| labelClassName | string | - | Additional className for the label |

### Radio Component

Radio component and RadioGroup for managing related radio buttons with accessible design.

```tsx
// Basic Radio button
<Radio
  id="option1"
  name="options"
  value="option1"
  label="Option 1"
/>

// RadioGroup usage
<RadioGroup
  name="subscription"
  value={selectedValue}
  onChange={setSelectedValue}
  options={[
    { value: 'free', label: 'Free' },
    { value: 'pro', label: 'Pro' },
    { value: 'enterprise', label: 'Enterprise' },
  ]}
/>

// Horizontal layout
<RadioGroup
  name="payment"
  orientation="horizontal"
  options={[
    { value: 'credit', label: 'Credit Card' },
    { value: 'paypal', label: 'PayPal' },
    { value: 'transfer', label: 'Bank Transfer' },
  ]}
/>

// Disabled options
<RadioGroup
  name="priority"
  options={[
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High', disabled: true },
  ]}
/>

// Using with FormField
<FormField label="Notification Preferences" id="notifications-field">
  <RadioGroup
    name="notifications"
    options={[
      { value: 'all', label: 'All notifications' },
      { value: 'important', label: 'Important only' },
      { value: 'none', label: 'None' },
    ]}
  />
</FormField>
```

#### Radio Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| label | string | - | Label for the radio button |
| labelPosition | 'left' \| 'right' | 'right' | Position of the label relative to the radio button |
| size | 'sm' \| 'md' \| 'lg' | 'md' | Size of the radio button |
| labelClassName | string | - | Additional className for the label |

#### RadioGroup Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| name | string | - | Name attribute shared by all radio buttons in the group |
| value | string | - | Currently selected value |
| onChange | (value: string) => void | - | Function called when selection changes |
| options | Array<{ value: string; label: string; disabled?: boolean }> | - | Radio options to display |
| orientation | 'horizontal' \| 'vertical' | 'vertical' | Layout orientation of the radio group |
| size | 'sm' \| 'md' \| 'lg' | 'md' | Size of the radio buttons |
| disabled | boolean | false | Whether the radio group is disabled |

### Table Component

The Table component provides a way to display tabular data with sorting and pagination.

```tsx
// Basic usage
const columns = [
  { id: 'name', header: 'Name', accessor: (row) => row.name },
  { id: 'email', header: 'Email', accessor: (row) => row.email },
  { id: 'role', header: 'Role', accessor: (row) => row.role },
];

const data = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Editor' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Viewer' },
];

<Table
  columns={columns}
  data={data}
  caption="User List"
/>

// With sorting enabled
<Table
  columns={columns}
  data={data}
  enableSorting={true}
/>

// With pagination
<Table
  columns={columns}
  data={data}
  enablePagination={true}
  itemsPerPage={10}
/>

// With custom cell rendering
const columnsWithCustomCell = [
  { id: 'name', header: 'Name', accessor: (row) => row.name },
  { 
    id: 'status', 
    header: 'Status', 
    accessor: (row) => row.status,
    cell: (value) => (
      <span className={`px-2 py-1 rounded ${value === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
        {value}
      </span>
    )
  },
];

<Table
  columns={columnsWithCustomCell}
  data={statusData}
/>
```

#### Table Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| columns | Column[] | required | Array of column definitions |
| data | any[] | required | Array of data objects |
| caption | string | - | Accessible table caption |
| enableSorting | boolean | false | Enable column sorting |
| enablePagination | boolean | false | Enable pagination controls |
| itemsPerPage | number | 10 | Number of items per page when pagination is enabled |
| onRowClick | (row: any) => void | - | Callback when a row is clicked |
| emptyState | ReactNode | "No data available" | Content to show when data is empty |
| className | string | - | Additional CSS classes |

### List Component

The List component provides a flexible way to display items in various list formats.

```tsx
// Basic unordered list
<List>
  <ListItem content="Item 1" />
  <ListItem content="Item 2" />
  <ListItem content="Item 3" />
</List>

// Ordered list
<List variant="ordered">
  <ListItem content="First item" />
  <ListItem content="Second item" />
  <ListItem content="Third item" />
</List>

// List with icons
<List>
  <ListItem content="Dashboard" icon="home" />
  <ListItem content="Settings" icon="settings" />
  <ListItem content="Profile" icon="user" />
</List>

// List with primary and secondary text
<List>
  <ListItem 
    content="John Doe" 
    secondaryContent="john@example.com"
  />
  <ListItem 
    content="Jane Smith" 
    secondaryContent="jane@example.com"
  />
</List>

// List with actions
<List>
  <ListItem 
    content="Edit profile" 
    icon="user"
    action={<Button size="sm" variant="outline">Edit</Button>}
  />
  <ListItem 
    content="Account settings" 
    icon="settings"
    action={<Button size="sm" variant="outline">Manage</Button>}
  />
</List>

// Horizontal list
<List direction="horizontal">
  <ListItem content="Home" />
  <ListItem content="Products" />
  <ListItem content="About" />
  <ListItem content="Contact" />
</List>

// Interactive list with dividers
<List withDividers interactive>
  <ListItem 
    content="Messages" 
    icon="mail"
    onClick={() => navigate('/messages')}
  />
  <ListItem 
    content="Notifications" 
    icon="bell"
    onClick={() => navigate('/notifications')}
  />
  <ListItem 
    content="Logout" 
    icon="logout"
    onClick={handleLogout}
  />
</List>
```

#### List Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | 'unordered' \| 'ordered' | 'unordered' | List type |
| withDividers | boolean | false | Show dividers between items |
| interactive | boolean | false | Apply hover effects for interactive items |
| size | 'sm' \| 'md' \| 'lg' | 'md' | Size of list items |
| direction | 'vertical' \| 'horizontal' | 'vertical' | List layout direction |
| icon | IconName \| ReactNode | - | Default icon for all items (can be overridden per item) |
| className | string | - | Additional CSS classes |

#### ListItem Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| content | ReactNode | required | Primary content to display |
| secondaryContent | ReactNode | - | Secondary/supporting text |
| icon | IconName \| ReactNode | - | Icon to display (overrides list default) |
| action | ReactNode | - | Action element (button, link, etc.) |
| selected | boolean | false | Whether the item is selected |
| disabled | boolean | false | Whether the item is disabled |
| onClick | () => void | - | Click handler for interactive items |
| className | string | - | Additional CSS classes |

### Color Palette

The Justify.social application uses a consistent color palette defined through CSS variables in the global stylesheet.

#### Brand Colors

```tsx
// Access colors through CSS variables
<div style={{ color: 'var(--primary-color)' }}>Primary text</div>
<div style={{ backgroundColor: 'var(--accent-color)' }}>Accent background</div>
```

| Color Name | Hex Value | CSS Variable | Description |
|------------|-----------|--------------|-------------|
| Primary | #333333 | --primary-color | Main text color (Jet) |
| Secondary | #4A5568 | --secondary-color | Secondary text color (Payne's Grey) |
| Accent | #00BFFF | --accent-color | Brand accent color (Deep Sky Blue) |
| Background | #FFFFFF | --background-color | Background color (White) |
| Divider | #D1D5DB | --divider-color | Border and divider color (French Grey) |
| Interactive | #3182CE | --interactive-color | Interactive elements color (Medium Blue) |

#### Interactive Color Usage Guidelines

The Interactive Medium Blue color (#3182CE) is specifically designated for interactive elements and states:

- **Primary Use Cases:**
  - Interactive elements (links, buttons)
  - Selected/active states
  - Focus indicators
  - Information alerts and notifications

- **Color Variations:**
  - Primary shade (#3182CE) for buttons, links, and interactive elements
  - Light shade (#EBF8FF, blue-50) for backgrounds of selected items, info alerts
  - Medium shade (#90CDF4, blue-300) for borders and decorative elements
  - Dark shade (#2C5282, blue-800) for text and emphasizing interactive elements

```tsx
// Examples of proper usage
<a className="text-[#3182CE] hover:text-[#2C5282]">Interactive Link</a>
<div className="bg-[#EBF8FF] border border-[#90CDF4] text-[#2C5282]">Selected Item</div>
<button style={{ backgroundColor: 'var(--interactive-color)', color: 'white' }}>Interactive Button</button>
```

#### Usage Examples

```tsx
// Using in Tailwind classes directly
<div className="text-[#333333] bg-[#00BFFF]">Content</div>

// Using with styled-components
const StyledComponent = styled.div`
  color: var(--primary-color);
  background-color: var(--background-color);
  border: 1px solid var(--divider-color);
`;

// In component props
<Button variant="primary">Primary Color Button</Button>
<Alert variant="info">Info Alert</Alert>
```

### Logos

The Justify.social application includes several logo variants for different contexts.

#### Available Logos

| Logo Variant | File Path | Usage |
|--------------|-----------|-------|
| Primary Logo | /logo.png | Main brand logo for headers and light backgrounds |
| Logo on Dark | /logo.png | Logo for use on dark backgrounds |
| Favicon | /favicon.ico | Browser tab icon |
| Logo with Text | /logo.png + Text | Combined logo with brand name |

#### Usage Examples

```tsx
// Primary logo
<img src="/logo.png" alt="Justify Logo" />

// Logo in header
<header>
  <div className="flex items-center">
    <img src="/logo.png" alt="Justify Logo" className="h-10 w-10" />
    <span className="ml-2 font-bold text-xl">Justify</span>
  </div>
</header>

// Favicon (automatically used in Next.js)
// In pages/_app.js or app/layout.js
import Head from 'next/head';

<Head>
  <link rel="icon" href="/favicon.ico" />
</Head>
```

## Component Organization

### Directory Structure

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

### Component Categories

Our UI components are organized into these categories:

1. **Core Components**
   - Alert, Avatar, Badge, Button, Calendar, Card, Checkbox
   - Container, Grid, Icons, Input, List, Progress
   - Radio, Select, Skeleton, Spinner, Table, Tabs, Toast, Typography

2. **Layout and Navigation**
   - Navigation components (ComponentNav)

3. **Feedback and Notifications**
   - Notification components (NotificationBell)

4. **Theming**
   - Color palettes and themes

5. **Utils**
   - Error handling components

6. **Debug Tools**
   - Development and debugging utilities

### Import Patterns

```tsx
// Import specific components
import { Button, Card, Input } from '@/components/ui';

// Or import directly from a component category
import { Spinner } from '@/components/ui/spinner';
```

### Component Implementation Guidelines

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

### Component Creation

Use the `create-ui-component.sh` script to generate new components with the correct structure:

```bash
./create-ui-component.sh ComponentName
```

This will:
- Create the directory structure
- Generate type definitions
- Create style files
- Set up example files
- Add exports to index.ts