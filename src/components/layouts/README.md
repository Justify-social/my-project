# Application Layouts

This directory contains application-level layouts used to structure pages.

## Available Layouts

- **ClientLayout**: Main layout for authenticated client views
- **Header**: Application header component
- **Sidebar**: Application sidebar navigation
- **Footer**: Application footer component

## Usage

Import layouts from this directory:

```tsx
import { ClientLayout } from '@/components/layouts';
```

## Note

For reusable UI layout components (Card, Grid, Container, etc.), 
use components from the UI layout directory:

```tsx
import { Card, Grid, Container } from '@/components/ui/layout';
```
