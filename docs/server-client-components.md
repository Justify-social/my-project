# Server vs. Client Component Strategy

This guide outlines our approach to React Server Components and Client Components in our UI library. It provides clear guidelines on when to use each type and how to implement them correctly.

## Overview

In Next.js 13+, components are **Server Components** by default. They:
- Render on the server
- Don't include client-side JavaScript
- Can't use React hooks (`useState`, `useEffect`, etc.)
- Can access server-side resources directly

**Client Components** are explicitly marked with `'use client'` and:
- Render on both server and client 
- Hydrate on the client with JavaScript
- Can use React hooks and browser APIs
- Can't access server-side resources directly

## Component Organization

```
src/components/ui/
├── button.tsx               # Server Component (default)
├── client/
│   └── button-client.tsx    # Client Component wrapper when needed
```

## When to Use Server Components

Use Server Components (default) when your component:
- Primarily renders UI without interactivity
- Doesn't use React hooks
- Doesn't need browser APIs
- Performs data fetching

**Examples:** Card, Avatar, Badge, Alert, Table

## When to Use Client Components

Use Client Components when your component:
- Uses React hooks (`useState`, `useEffect`, etc.)
- Adds interactivity (event listeners, state changes)
- Needs access to browser APIs
- Uses third-party libraries that depend on client-side functionality

**Examples:** ThemeToggle, Dropdown, Modal, Form with validation

## Implementation Guidelines

### Server Components (Default)

```tsx
/**
 * @component Button
 * @category atom
 * @renderType server
 * @description A reusable button component
 */
export function Button({ children }: { children: React.ReactNode }) {
  return <button>{children}</button>;
}
```

### Client Components

```tsx
'use client';

/**
 * @component ButtonClient
 * @category atom
 * @renderType client
 * @description Interactive button with client-side behavior
 */
export function Button({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  const [isPressed, setIsPressed] = useState(false);
  
  const handleClick = () => {
    setIsPressed(true);
    onClick?.();
    setTimeout(() => setIsPressed(false), 200);
  };
  
  return (
    <button 
      onClick={handleClick} 
      className={isPressed ? 'scale-95' : ''}
    >
      {children}
    </button>
  );
}
```

## Client Component Wrappers

When a component needs both server and client versions:

1. Create the base component as a Server Component
2. Create a client wrapper in the `/client` directory
3. Re-export all properties and customize behavior

```tsx
// src/components/ui/client/button-client.tsx
'use client';

import { Button as ServerButton, ButtonProps } from '@/components/ui/button';

export function Button(props: ButtonProps & { onClick?: () => void }) {
  // Add client-side functionality
  return <ServerButton {...props} />;
}
```

## Metadata and Documentation

Always include the `@renderType` tag in your JSDoc comments:

```tsx
/**
 * @component ComponentName
 * @category atom|molecule|organism
 * @renderType server|client
 * @description Component description
 */
```

## Component Browser Integration

The Component Browser displays render type with an icon badge:
- 🖥️ Server - Components that render on the server
- 💻 Client - Components that include client-side JavaScript

## Best Practices

1. **Default to Server Components** - Only use Client Components when necessary
2. **Keep Client Components Lean** - Minimize client-side JavaScript
3. **Component Composition** - Use Client Components to wrap Server Components when needed
4. **Moving "Up" the Tree** - Place client-side logic as high in the tree as possible
5. **Proper Documentation** - Always document render type with the `@renderType` tag

## Testing Considerations

When testing components:
- Server Components can be tested with simple rendering tests
- Client Components require more complex tests with events and state changes

## Common Pitfalls

1. Using hooks in Server Components
2. Forgetting the `'use client'` directive
3. Using browser APIs in Server Components
4. Importing Client Components into Server Components without wrapping

By following these guidelines, we ensure our components are optimized for performance while maintaining the interactivity needed for a great user experience. 