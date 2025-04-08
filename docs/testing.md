# UI Component Testing Guide

This document provides guidelines and best practices for testing UI components in our codebase.

## Testing Framework

We use the following tools for testing UI components:

- **Jest**: Main testing framework
- **React Testing Library**: For testing React components in a user-centric way
- **Storybook**: For visual testing and component development
- **Testing Library User Event**: For simulating user interactions

## Types of Tests

### 1. Unit Tests

Unit tests verify that individual components function correctly in isolation. They focus on:

- Component rendering
- Props handling
- State changes
- Event handling
- Conditional rendering

### 2. Integration Tests

Integration tests verify that multiple components work together correctly:

- Parent-child component interactions
- Component with context providers
- Form submissions
- Data flow between components

### 3. Visual Tests

Visual tests use Storybook to:

- Verify component appearance across various states
- Document component variants
- Test responsiveness
- Ensure consistent styling

## Directory Structure

```
├── tests/
│   ├── unit/
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   │   ├── button.test.tsx
│   │   │   │   ├── card.test.tsx
│   │   │   │   └── ...
│   │   │   └── ...
│   ├── integration/
│   │   ├── forms.test.tsx
│   │   └── ...
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── button.stories.tsx
│   │   │   └── ...
```

## Writing Unit Tests

### Testing Component Rendering

```tsx
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';

test('renders button with text', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
});
```

### Testing Component Props

```tsx
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';

test('applies variant class', () => {
  render(<Button variant="destructive">Delete</Button>);
  const button = screen.getByRole('button', { name: /delete/i });
  expect(button).toHaveClass('bg-destructive');
});
```

### Testing User Interactions

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/button';

test('calls onClick when clicked', async () => {
  const handleClick = jest.fn();
  render(<Button onClick={handleClick}>Click me</Button>);
  
  const user = userEvent.setup();
  await user.click(screen.getByRole('button'));
  
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

## Testing Server vs. Client Components

### Server Components

For server components, focus on testing:

- Proper rendering of HTML elements
- Proper application of styles/classes
- Correct handling of props

```tsx
import { render, screen } from '@testing-library/react';
import { Card } from '@/components/ui/card';

test('renders server component', () => {
  render(
    <Card>
      <p>Content</p>
    </Card>
  );
  expect(screen.getByText('Content')).toBeInTheDocument();
});
```

### Client Components

For client components, additionally test:

- State changes
- Event handling
- Side effects
- Hooks behavior

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toggle } from '@/components/ui/client/toggle-client';

test('toggles state on click', async () => {
  render(<Toggle>Toggle me</Toggle>);
  
  const user = userEvent.setup();
  const toggle = screen.getByRole('button');
  
  expect(toggle).not.toHaveAttribute('data-state', 'on');
  await user.click(toggle);
  expect(toggle).toHaveAttribute('data-state', 'on');
});
```

## Generating Tests

We provide a script to automatically generate tests for components:

```bash
npx ts-node scripts/generate-component-test.ts button
```

This script analyzes the component and generates a basic test file with appropriate assertions.

## Best Practices

1. **Use Role-Based Queries**: Prefer `getByRole` over other queries for better accessibility testing.
2. **Test Behavior, Not Implementation**: Focus on what the component does, not how it's built.
3. **Avoid Testing Library Implementation**: Don't test React or other library internals.
4. **Use Realistic User Interactions**: Prefer `userEvent` over `fireEvent` for more realistic user interactions.
5. **Isolate Tests**: Each test should be independent and not rely on the state from other tests.
6. **Keep Tests Simple**: Write multiple small tests instead of one large test.
7. **Test Edge Cases**: Include tests for empty states, error states, and boundary conditions.
8. **Use Setup Functions**: Extract common setup logic into reusable functions.

## Continuous Integration

Tests are automatically run in our CI pipeline:

- On pull requests
- On merges to the main branch
- Nightly builds

## Resources

- [React Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library User Event Documentation](https://testing-library.com/docs/user-event/intro)
- [Storybook Documentation](https://storybook.js.org/docs/react/get-started/introduction) 