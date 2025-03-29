# Navigation Components

This directory contains navigation components for the application, organized according to atomic design principles.

## Overview

Navigation Components provide navigation functionality for the application. They are designed to be reusable and composable.

## Components

- **NavigationBar**: A responsive navigation bar component (in `nav-bar/`)
- **ComponentNav**: Navigation designed for component documentation (in `component-nav/`)
- **Tabs**: Tab navigation components (moved to `src/components/ui/molecules/Tabs/`)

## Usage

```tsx
import { NavigationBar } from '@/components/ui/organisms/navigation/nav-bar';
import { ComponentNav } from '@/components/ui/organisms/navigation/component-nav';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from '@/components/ui/molecules/Tabs';

// Example usage
function ExampleComponent() {
  return (
    <div>
      <NavigationBar 
        logo={<Logo />}
        title="App Name"
        items={[
          { label: 'Home', href: '/' },
          { label: 'About', href: '/about' }
        ]}
      />
      
      <Tabs>
        <TabList>
          <Tab>First Tab</Tab>
          <Tab>Second Tab</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>First panel content</TabPanel>
          <TabPanel>Second panel content</TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
}
```

## Directory Structure
- `nav-bar/`: NavigationBar component and related files
- `component-nav/`: ComponentNav component for documentation navigation
- `types/`: Shared TypeScript type definitions
- `styles/`: Shared styles for navigation components
- `examples/`: Usage examples 