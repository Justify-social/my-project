'use client';

import React, { useState } from 'react';
import { Heading, Text, Paragraph } from '@/components/ui/atoms/typography';
import { Button, ButtonWithIcon, IconButton } from '@/components/ui/atoms/button';
import { Spinner } from '@/components/ui/atoms/spinner';
import { Icon } from '@/components/ui/atoms/icons';
import { Container } from '@/components/ui/atoms/layout/container';
import { Divider } from '@/components/ui/atoms/layout/divider';
import { Grid } from '@/components/ui/atoms/layout/grid';
import { Spacer } from '@/components/ui/atoms/layout/spacer';
import { Stack } from '@/components/ui/atoms/layout/stack';
import { Input } from '@/components/ui/atoms/input';
import { Checkbox } from '@/components/ui/atoms/checkbox';
import { Radio } from '@/components/ui/atoms/radio';
import { Select } from '@/components/ui/atoms/select';
import { Toggle } from '@/components/ui/atoms/toggle';
import { Textarea } from '@/components/ui/atoms/textarea';
import { MultiSelect } from '@/components/ui/atoms/multi-select';
import { SearchBar } from '@/components/ui/molecules/search-bar';
import { FormField } from '@/components/ui/molecules/form-field';
import { Badge } from '@/components/ui/molecules/feedback';
import { ToastProvider, useToast } from '@/components/ui/molecules/feedback';
import { Breadcrumbs } from '@/components/ui/molecules/breadcrumbs';
import { Pagination } from '@/components/ui/molecules/pagination';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/organisms/Card';
import { Alert } from '@/components/ui/organisms/feedback';
import { 
  Tabs, 
  TabList, 
  Tab, 
  TabPanels, 
  TabPanel 
} from '@/components/ui/atoms/tabs';
import { Skeleton, TextSkeleton } from '@/components/ui/molecules/skeleton';
import { ModalDialog } from '@/components/ui/organisms/Modal';
import ErrorFallback from '@/components/ui/organisms/error-fallback';

// Code component for examples
const CodeBlock = ({ children }: { children: React.ReactNode }) => (
  <pre className="bg-gray-100 p-3 rounded-md text-sm font-mono overflow-x-auto mt-2 mb-4 border border-gray-200">
    <code>{children}</code>
  </pre>
);

// Section component for consistent layout
const ComponentSection = ({ 
  id, 
  title, 
  description, 
  category,
  children 
}: { 
  id: string; 
  title: string; 
  description: string;
  category: 'atoms' | 'molecules' | 'organisms'; 
  children: React.ReactNode;
}) => (
  <section id={`${category}-${id}`} className="mb-12 scroll-mt-24">
    <div className="border-l-4 border-blue-500 pl-4 mb-6">
      <Heading level={3} className="mb-2">{title}</Heading>
      <Text size="lg" color="muted">{description}</Text>
    </div>
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      {children}
    </div>
  </section>
);

export default function UIComponentsPage() {
  const toast = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [radioValue, setRadioValue] = useState('option1');

  // Demo function for toast
  const showToast = (type: 'success' | 'error' | 'info' | 'warning') => {
    toast({
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Message`,
      description: `This is a ${type} toast notification`,
      type,
    });
  };

  return (
    <div>
      <section className="mb-12">
        <Heading level={1} className="mb-4">UI Component Library</Heading>
        <Paragraph size="lg">
          This comprehensive showcase demonstrates all UI components following Atomic Design methodology.
          Components are organized into Atoms (basic building blocks), Molecules (simple combinations of atoms),
          and Organisms (complex UI components).
        </Paragraph>
      </section>

      <Heading level={2} className="mb-6 pb-2 border-b border-gray-200" id="atoms">Atoms</Heading>

      {/* BUTTON COMPONENTS */}
      <ComponentSection 
        id="button" 
        title="Buttons" 
        description="Buttons allow users to trigger actions with a single click or tap."
        category="atoms"
      >
        <Heading level={4} className="mb-4">Button Variants</Heading>
        <div className="flex flex-wrap gap-4 mb-6">
          <Button>Default Button</Button>
          <Button variant="secondary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link Button</Button>
        </div>

        <Heading level={4} className="mb-4">Button Sizes</Heading>
        <div className="flex flex-wrap gap-4 items-center mb-6">
          <Button size="xs">Extra Small</Button>
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>

        <Heading level={4} className="mb-4">Button States</Heading>
        <div className="flex flex-wrap gap-4 mb-6">
          <Button>Normal</Button>
          <Button disabled>Disabled</Button>
          <Button loading>Loading</Button>
        </div>

        <Heading level={4} className="mb-4">Button with Icon</Heading>
        <div className="flex flex-wrap gap-4 mb-6">
          <ButtonWithIcon icon="faPlus">Create New</ButtonWithIcon>
          <ButtonWithIcon icon="faSave" iconPosition="right">Save</ButtonWithIcon>
        </div>

        <Heading level={4} className="mb-4">Icon Button</Heading>
        <div className="flex flex-wrap gap-4 mb-6">
          <IconButton icon="faEdit" aria-label="Edit" />
          <IconButton icon="faTrash" aria-label="Delete" variant="outline" />
          <IconButton icon="faHeart" aria-label="Favorite" variant="ghost" />
        </div>

        <CodeBlock>{`<Button variant="secondary" size="md">Click Me</Button>
<ButtonWithIcon icon="faPlus">Create New</ButtonWithIcon>
<IconButton icon="faEdit" aria-label="Edit" />`}</CodeBlock>
      </ComponentSection>

      {/* TYPOGRAPHY COMPONENTS */}
      <ComponentSection 
        id="typography" 
        title="Typography" 
        description="Typography components for displaying text at various hierarchical levels."
        category="atoms"
      >
        <div className="space-y-4 mb-6">
          <Heading level={1}>Heading 1</Heading>
          <Heading level={2}>Heading 2</Heading>
          <Heading level={3}>Heading 3</Heading>
          <Heading level={4}>Heading 4</Heading>
          <Heading level={5}>Heading 5</Heading>
          <Heading level={6}>Heading 6</Heading>
        </div>

        <Divider className="my-6" />

        <div className="space-y-4 mb-6">
          <Text size="xs">Extra Small Text</Text>
          <Text size="sm">Small Text</Text>
          <Text size="md">Medium Text (Default)</Text>
          <Text size="lg">Large Text</Text>
          <Text size="xl">Extra Large Text</Text>
        </div>

        <Divider className="my-6" />

        <div className="space-y-4 mb-6">
          <Text weight="normal">Normal Weight</Text>
          <Text weight="medium">Medium Weight</Text>
          <Text weight="semibold">Semibold Weight</Text>
          <Text weight="bold">Bold Weight</Text>
        </div>

        <Divider className="my-6" />

        <div className="space-y-4">
          <Paragraph>
            This is a paragraph component that provides proper spacing and formatting for blocks of text.
            It's designed to enhance readability with appropriate line height and margins.
          </Paragraph>
          <Paragraph size="sm">
            This is a smaller paragraph for less prominent text sections.
          </Paragraph>
        </div>

        <CodeBlock>{`<Heading level={2}>Page Title</Heading>
<Text size="lg" weight="medium">Subtitle text</Text>
<Paragraph>Main content paragraph...</Paragraph>`}</CodeBlock>
      </ComponentSection>

      {/* SPINNER COMPONENTS */}
      <ComponentSection 
        id="spinner" 
        title="Spinners" 
        description="Spinners indicate that content is loading or an action is being processed."
        category="atoms"
      >
        <div className="flex flex-wrap gap-8 items-center mb-6">
          <div>
            <Heading level={5} className="mb-2">Default</Heading>
            <Spinner />
          </div>
          <div>
            <Heading level={5} className="mb-2">Small</Heading>
            <Spinner size="sm" />
          </div>
          <div>
            <Heading level={5} className="mb-2">Large</Heading>
            <Spinner size="lg" />
          </div>
          <div>
            <Heading level={5} className="mb-2">Primary Color</Heading>
            <Spinner color="blue" />
          </div>
          <div>
            <Heading level={5} className="mb-2">Secondary Color</Heading>
            <Spinner color="gray" />
          </div>
        </div>

        <CodeBlock>{`<Spinner />
<Spinner size="sm" color="blue" />`}</CodeBlock>
      </ComponentSection>

      {/* ICON COMPONENTS */}
      <ComponentSection 
        id="icon" 
        title="Icons" 
        description="Icons provide visual cues to help users understand content and actions."
        category="atoms"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          <div className="flex flex-col items-center">
            <Icon name="faHome" size="lg" className="mb-2" />
            <Text size="sm">faHome</Text>
          </div>
          <div className="flex flex-col items-center">
            <Icon name="faUser" size="lg" className="mb-2" />
            <Text size="sm">faUser</Text>
          </div>
          <div className="flex flex-col items-center">
            <Icon name="faCog" size="lg" className="mb-2" />
            <Text size="sm">faCog</Text>
          </div>
          <div className="flex flex-col items-center">
            <Icon name="faSearch" size="lg" className="mb-2" />
            <Text size="sm">faSearch</Text>
          </div>
          <div className="flex flex-col items-center">
            <Icon name="faBell" size="lg" className="mb-2" />
            <Text size="sm">faBell</Text>
          </div>
          <div className="flex flex-col items-center">
            <Icon name="faCheck" size="lg" className="mb-2" />
            <Text size="sm">faCheck</Text>
          </div>
          <div className="flex flex-col items-center">
            <Icon name="faTimes" size="lg" className="mb-2" />
            <Text size="sm">faTimes</Text>
          </div>
          <div className="flex flex-col items-center">
            <Icon name="faArrowRight" size="lg" className="mb-2" />
            <Text size="sm">faArrowRight</Text>
          </div>
        </div>

        <Heading level={4} className="mb-4">Icon Sizes</Heading>
        <div className="flex items-end gap-6 mb-6">
          <Icon name="faStar" size="xs" />
          <Icon name="faStar" size="sm" />
          <Icon name="faStar" size="md" />
          <Icon name="faStar" size="lg" />
          <Icon name="faStar" size="xl" />
        </div>

        <Heading level={4} className="mb-4">Icon Colors</Heading>
        <div className="flex gap-6 mb-6">
          <Icon name="faCircle" className="text-blue-500" />
          <Icon name="faCircle" className="text-red-500" />
          <Icon name="faCircle" className="text-green-500" />
          <Icon name="faCircle" className="text-yellow-500" />
          <Icon name="faCircle" className="text-purple-500" />
        </div>

        <CodeBlock>{`<Icon name="faHome" size="lg" />
<Icon name="faStar" className="text-yellow-500" />`}</CodeBlock>
      </ComponentSection>

      {/* INPUT COMPONENTS */}
      <ComponentSection 
        id="input" 
        title="Input Fields" 
        description="Input fields allow users to enter and edit text."
        category="atoms"
      >
        <div className="space-y-6 mb-6">
          <div>
            <Heading level={5} className="mb-2">Default Input</Heading>
            <Input placeholder="Enter your name" />
          </div>
          
          <div>
            <Heading level={5} className="mb-2">Input with Label</Heading>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <Input type="email" placeholder="you@example.com" />
          </div>

          <div>
            <Heading level={5} className="mb-2">Disabled Input</Heading>
            <Input disabled placeholder="Disabled input" value="Disabled value" />
          </div>

          <div>
            <Heading level={5} className="mb-2">Error State</Heading>
            <Input error placeholder="Enter value" />
            <div className="text-red-500 text-sm mt-1">This field is required</div>
          </div>

          <div>
            <Heading level={5} className="mb-2">Input Sizes</Heading>
            <div className="space-y-4">
              <Input size="sm" placeholder="Small input" />
              <Input size="md" placeholder="Medium input (default)" />
              <Input size="lg" placeholder="Large input" />
            </div>
          </div>

          <div>
            <Heading level={5} className="mb-2">Input with Icon</Heading>
            <div className="space-y-4">
              <Input leftIcon="faSearch" placeholder="Search..." />
              <Input rightIcon="faCalendar" placeholder="Select date..." />
            </div>
          </div>
        </div>

        <CodeBlock>{`<Input placeholder="Enter your name" />
<Input leftIcon="faSearch" placeholder="Search..." />
<Input error={!!errorMessage} {...props} />`}</CodeBlock>
      </ComponentSection>

      {/* LAYOUT COMPONENTS */}
      <ComponentSection 
        id="layout" 
        title="Layout Components" 
        description="Core components for creating responsive layouts."
        category="atoms"
      >
        <Heading level={4} className="mb-4">Container</Heading>
        <Container className="bg-gray-100 p-4 mb-6">
          <Text>Container with max-width and centered content</Text>
        </Container>

        <Heading level={4} className="mb-4">Grid</Heading>
        <Grid cols={3} gap={4} className="mb-6">
          <div className="bg-blue-100 p-4 rounded">Grid Item 1</div>
          <div className="bg-blue-100 p-4 rounded">Grid Item 2</div>
          <div className="bg-blue-100 p-4 rounded">Grid Item 3</div>
          <div className="bg-blue-100 p-4 rounded">Grid Item 4</div>
          <div className="bg-blue-100 p-4 rounded">Grid Item 5</div>
          <div className="bg-blue-100 p-4 rounded">Grid Item 6</div>
        </Grid>

        <Heading level={4} className="mb-4">Stack</Heading>
        <Stack spacing={4} className="mb-6">
          <div className="bg-green-100 p-4 rounded">Stack Item 1</div>
          <div className="bg-green-100 p-4 rounded">Stack Item 2</div>
          <div className="bg-green-100 p-4 rounded">Stack Item 3</div>
        </Stack>

        <Heading level={4} className="mb-4">Divider</Heading>
        <div className="mb-6">
          <Text className="mb-2">Content above divider</Text>
          <Divider />
          <Text className="mt-2">Content below divider</Text>
        </div>

        <Heading level={4} className="mb-4">Spacer</Heading>
        <div className="bg-purple-100 p-4 mb-6">
          <Text>Content before spacer</Text>
          <Spacer height={8} />
          <Text>Content after spacer</Text>
        </div>

        <CodeBlock>{`<Container>
  <Grid cols={3} gap={4}>
    <div>Item 1</div>
    <div>Item 2</div>
    <div>Item 3</div>
  </Grid>
</Container>`}</CodeBlock>
      </ComponentSection>

      <Heading level={2} className="mb-6 pb-2 border-b border-gray-200" id="molecules">Molecules</Heading>

      {/* FORM FIELD COMPONENTS */}
      <ComponentSection 
        id="form-field" 
        title="Form Field" 
        description="Combines input elements with labels, help text, and error messages."
        category="molecules"
      >
        <div className="space-y-6 mb-6">
          <FormField
            label="Full Name"
            htmlFor="fullName"
            helperText="Enter your legal full name"
          >
            <Input id="fullName" placeholder="John Doe" />
          </FormField>

          <FormField
            label="Email Address"
            htmlFor="email"
            required
          >
            <Input id="email" type="email" placeholder="you@example.com" />
          </FormField>

          <FormField
            label="Password"
            htmlFor="password"
            error="Password must be at least 8 characters"
          >
            <Input id="password" type="password" error />
          </FormField>

          <FormField
            label="Country"
            htmlFor="country"
          >
            <Select id="country">
              <option value="">Select a country</option>
              <option value="us">United States</option>
              <option value="ca">Canada</option>
              <option value="uk">United Kingdom</option>
            </Select>
          </FormField>

          <FormField
            label="Message"
            htmlFor="message"
          >
            <Textarea id="message" placeholder="Enter your message here..." />
          </FormField>

          <FormField
            label="Subscribe to newsletter"
            htmlFor="subscribe"
            orientation="horizontal"
          >
            <Checkbox id="subscribe" />
          </FormField>
        </div>

        <CodeBlock>{`<FormField
  label="Email Address"
  htmlFor="email"
  required
  helperText="We'll never share your email"
>
  <Input id="email" type="email" placeholder="you@example.com" />
</FormField>`}</CodeBlock>
      </ComponentSection>

      {/* SEARCH BAR */}
      <ComponentSection 
        id="search-bar" 
        title="Search Bar" 
        description="Search input with keyboard shortcuts and suggestions."
        category="molecules"
      >
        <div className="space-y-6 mb-6">
          <SearchBar placeholder="Search for anything..." className="max-w-md" />
          
          <Heading level={5} className="mb-2">With Keyboard Shortcut</Heading>
          <SearchBar 
            placeholder="Search (Press / to focus)" 
            className="max-w-md"
            showShortcut 
          />
        </div>

        <CodeBlock>{`<SearchBar 
  placeholder="Search for anything..."
  showShortcut 
  className="max-w-md" 
/>`}</CodeBlock>
      </ComponentSection>

      {/* FEEDBACK COMPONENTS */}
      <ComponentSection 
        id="feedback" 
        title="Feedback Components" 
        description="Components for providing user feedback."
        category="molecules"
      >
        <Heading level={4} className="mb-4">Badges</Heading>
        <div className="flex flex-wrap gap-4 mb-6">
          <Badge>Default</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="info">Info</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="error">Error</Badge>
        </div>

        <Heading level={4} className="mb-4">Toast Notifications</Heading>
        <div className="flex flex-wrap gap-4 mb-6">
          <Button onClick={() => showToast('success')}>Success Toast</Button>
          <Button onClick={() => showToast('error')}>Error Toast</Button>
          <Button onClick={() => showToast('info')}>Info Toast</Button>
          <Button onClick={() => showToast('warning')}>Warning Toast</Button>
        </div>

        <CodeBlock>{`// Toast example
const { toast } = useToast();
toast({
  title: "Success",
  description: "Your changes were saved",
  type: "success",
});

// Badge example
<Badge variant="success">New</Badge>`}</CodeBlock>
      </ComponentSection>

      {/* SKELETON COMPONENTS */}
      <ComponentSection 
        id="skeleton" 
        title="Skeleton Components" 
        description="Placeholder loading states for UI elements."
        category="molecules"
      >
        <div className="space-y-6 mb-6">
          <Heading level={5} className="mb-2">Text Skeleton</Heading>
          <TextSkeleton lines={3} />

          <Heading level={5} className="mb-2">Card Skeleton</Heading>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="mb-4">
              <Skeleton className="h-6 w-3/4" />
            </div>
            <Skeleton className="h-32 mb-4" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          </div>

          <Heading level={5} className="mb-2">Form Skeleton</Heading>
          <div className="space-y-4">
            <div>
              <Skeleton className="h-4 w-1/4 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div>
              <Skeleton className="h-4 w-1/3 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div>
              <Skeleton className="h-4 w-1/4 mb-2" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>

        <CodeBlock>{`<TextSkeleton lines={3} />

<Skeleton className="h-6 w-3/4" />
<Skeleton className="h-10 w-full" />`}</CodeBlock>
      </ComponentSection>

      <Heading level={2} className="mb-6 pb-2 border-b border-gray-200" id="organisms">Organisms</Heading>

      {/* CARD COMPONENTS */}
      <ComponentSection 
        id="card" 
        title="Card Components" 
        description="Containers for displaying content and actions."
        category="organisms"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <Heading level={4}>Simple Card</Heading>
            </CardHeader>
            <CardContent>
              <Paragraph>
                This is a basic card component with header, content, and footer sections.
                Cards provide a flexible container for displaying various types of content.
              </Paragraph>
            </CardContent>
            <CardFooter className="justify-end">
              <Button variant="ghost">Cancel</Button>
              <Button>Submit</Button>
            </CardFooter>
          </Card>

          <Card variant="interactive" hoverable>
            <CardHeader>
              <Heading level={4}>Interactive Card</Heading>
            </CardHeader>
            <CardContent>
              <Paragraph>
                This card has hover effects and is designed to be interactive.
                Use this variant for clickable cards that link to other pages or trigger actions.
              </Paragraph>
            </CardContent>
            <CardFooter>
              <Button variant="link">Learn More →</Button>
            </CardFooter>
          </Card>
        </div>

        <Heading level={4} className="mb-4">Card Variants</Heading>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="default">
            <CardContent className="p-4">
              <Text>Default Card</Text>
            </CardContent>
          </Card>
          <Card variant="outline">
            <CardContent className="p-4">
              <Text>Outline Card</Text>
            </CardContent>
          </Card>
          <Card variant="raised">
            <CardContent className="p-4">
              <Text>Raised Card</Text>
            </CardContent>
          </Card>
        </div>

        <CodeBlock>{`<Card>
  <CardHeader>
    <Heading level={4}>Card Title</Heading>
  </CardHeader>
  <CardContent>
    <Paragraph>Card content goes here</Paragraph>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>`}</CodeBlock>
      </ComponentSection>

      {/* MODAL COMPONENTS */}
      <ComponentSection 
        id="modal" 
        title="Modal Components" 
        description="Dialogs that appear over the main content for focused interactions."
        category="organisms"
      >
        <div className="mb-6">
          <Button onClick={() => setModalOpen(true)}>Open Modal</Button>
          
          <ModalDialog 
            isOpen={modalOpen} 
            onClose={() => setModalOpen(false)}
            title="Example Modal"
          >
            <div className="p-4">
              <Paragraph className="mb-4">
                This is an example modal dialog. Modals are used to display content that requires user attention or interaction.
              </Paragraph>
              <div className="flex justify-end space-x-2">
                <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
                <Button onClick={() => setModalOpen(false)}>Confirm</Button>
              </div>
            </div>
          </ModalDialog>
        </div>

        <CodeBlock>{`const [isOpen, setIsOpen] = useState(false);

<Button onClick={() => setIsOpen(true)}>
  Open Modal
</Button>

<ModalDialog 
  isOpen={isOpen} 
  onClose={() => setIsOpen(false)}
  title="Example Modal"
>
  <div className="p-4">
    <Paragraph>Modal content here</Paragraph>
    <Button onClick={() => setIsOpen(false)}>Close</Button>
  </div>
</ModalDialog>`}</CodeBlock>
      </ComponentSection>

      {/* ALERT COMPONENT */}
      <ComponentSection 
        id="feedback" 
        title="Alert Components" 
        description="Alerts provide contextual feedback messages for typical user actions."
        category="organisms"
      >
        <div className="space-y-4 mb-6">
          <Alert status="info">
            <Text>This is an informational alert</Text>
          </Alert>
          
          <Alert status="success">
            <Text>This is a success alert</Text>
          </Alert>
          
          <Alert status="warning">
            <Text>This is a warning alert</Text>
          </Alert>
          
          <Alert status="error">
            <Text>This is an error alert</Text>
          </Alert>
        </div>

        <CodeBlock>{`<Alert status="success">
  <Text>Your changes have been saved successfully!</Text>
</Alert>`}</CodeBlock>
      </ComponentSection>

      {/* ERROR FALLBACK */}
      <ComponentSection 
        id="error-fallback" 
        title="Error Fallback" 
        description="Component displayed when an error occurs in the application."
        category="organisms"
      >
        <div className="mb-6">
          <div className="border border-gray-200 rounded-lg">
            <ErrorFallback 
              error={new Error("Example error message")} 
              resetErrorBoundary={() => alert('Error boundary reset')} 
            />
          </div>
        </div>

        <CodeBlock>{`<ErrorBoundary
  FallbackComponent={ErrorFallback}
  onReset={() => {
    // Reset application state here
  }}
>
  <YourComponent />
</ErrorBoundary>`}</CodeBlock>
      </ComponentSection>

      {/* TABS COMPONENT */}
      <ComponentSection 
        id="tabs" 
        title="Tabs" 
        description="Tabs organize content into separate views that can be navigated between."
        category="molecules"
      >
        <div className="mb-6">
          <Tabs selectedIndex={selectedTab} onChange={setSelectedTab}>
            <TabList className="mb-4">
              <Tab>First Tab</Tab>
              <Tab>Second Tab</Tab>
              <Tab>Third Tab</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <Card>
                  <CardContent>
                    <Heading level={4} className="mb-2">First Tab Content</Heading>
                    <Paragraph>
                      This is the content for the first tab. Tabs make it easy to navigate between different sections of content.
                    </Paragraph>
                  </CardContent>
                </Card>
              </TabPanel>
              <TabPanel>
                <Card>
                  <CardContent>
                    <Heading level={4} className="mb-2">Second Tab Content</Heading>
                    <Paragraph>
                      This is the content for the second tab. Each tab can contain different types of content.
                    </Paragraph>
                  </CardContent>
                </Card>
              </TabPanel>
              <TabPanel>
                <Card>
                  <CardContent>
                    <Heading level={4} className="mb-2">Third Tab Content</Heading>
                    <Paragraph>
                      This is the content for the third tab. Tabs help reduce visual clutter by showing only one section at a time.
                    </Paragraph>
                  </CardContent>
                </Card>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </div>

        <CodeBlock>{`<Tabs selectedIndex={selectedTab} onChange={setSelectedTab}>
  <TabList>
    <Tab>First Tab</Tab>
    <Tab>Second Tab</Tab>
  </TabList>
  <TabPanels>
    <TabPanel>First tab content</TabPanel>
    <TabPanel>Second tab content</TabPanel>
  </TabPanels>
</Tabs>`}</CodeBlock>
      </ComponentSection>

      {/* BREADCRUMBS */}
      <ComponentSection 
        id="breadcrumbs" 
        title="Breadcrumbs" 
        description="Navigation component showing the user's location in the site hierarchy."
        category="molecules"
      >
        <div className="mb-6">
          <Breadcrumbs
            items={[
              { id: 'home', label: 'Home', href: '/' },
              { id: 'products', label: 'Products', href: '/products' },
              { id: 'categories', label: 'Categories', href: '/categories' },
              { id: 'electronics', label: 'Electronics', href: '/categories/electronics', isCurrent: true }
            ]}
          />
        </div>

        <CodeBlock>{`<Breadcrumbs
  items={[
    { id: 'home', label: 'Home', href: '/' },
    { id: 'products', label: 'Products', href: '/products' },
    { id: 'electronics', label: 'Electronics', href: '#', isCurrent: true }
  ]}
/>`}</CodeBlock>
      </ComponentSection>

      {/* PAGINATION */}
      <ComponentSection 
        id="pagination" 
        title="Pagination" 
        description="Pagination controls for navigating through multi-page content."
        category="molecules"
      >
        <div className="mb-6">
          <Pagination
            currentPage={3}
            totalPages={10}
            onPageChange={(page) => console.log(`Page changed to ${page}`)}
          />
        </div>

        <CodeBlock>{`<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={handlePageChange}
/>`}</CodeBlock>
      </ComponentSection>
    </div>
  );
} 