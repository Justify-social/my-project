# State Management Strategy

## Overview

This document outlines the state management strategy for our application, adhering to the Single Source of Truth (SSOT) principle and best practices for maintainability and scalability.

## Server State Management: TanStack Query

- **Library**: `@tanstack/react-query`
- **Purpose**: Manages server-side data fetching, caching, and synchronization.
- **Usage**: Use `useQuery` for fetching data, `useMutation` for server updates, and `QueryClientProvider` to wrap the application for configuration.
- **Benefits**: Automatic caching, background refetching, and optimistic updates reduce boilerplate and improve performance.
- **Example**:

  ```typescript
  import { useQuery } from '@tanstack/react-query';

  function fetchData() {
    return fetch('/api/data').then(res => res.json());
  }

  function MyComponent() {
    const { data, isLoading, error } = useQuery(['dataKey'], fetchData);
    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;
    return <div>{data.name}</div>;
  }
  ```

## Client State Management: Zustand

- **Library**: `zustand`
- **Purpose**: Manages client-side state for UI and application logic not tied to server data.
- **Usage**: Create stores with `create` to centralize state, and use hooks to access and update state in components.
- **Benefits**: Lightweight, minimal API, and no need for context providers, making it ideal for client state.
- **Example**:

  ```typescript
  import create from 'zustand';

  const useStore = create(set => ({
    count: 0,
    increment: () => set(state => ({ count: state.count + 1 })),
  }));

  function Counter() {
    const { count, increment } = useStore();
    return (
      <div>
        <p>Count: {count}</p>
        <button onClick={increment}>Increment</button>
      </div>
    );
  }
  ```

## Guidelines

- **Separation of Concerns**: Use `TanStack Query` for any data that comes from or goes to the server. Use `Zustand` for local UI state or transient data not persisted on the server.
- **Avoid Redundancy**: Do not mix other state management libraries or approaches unless there's a specific, documented reason.
- **Documentation**: Always document new stores or complex query logic to maintain clarity for other developers.

## Integration

- Ensure `QueryClientProvider` is set up at the root of the application (already implemented in `src/providers/index.tsx`).
- Create `Zustand` stores in a dedicated directory (e.g., `src/stores/`) for organization and reusability.
