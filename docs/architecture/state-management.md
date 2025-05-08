# State Management Strategy

**Last Reviewed:** 2025-05-09

## 1. Overview

This document outlines the state management strategy for the Justify application, adhering to the Single Source of Truth (SSOT) principle and best practices for maintainability and scalability. Our approach distinguishes between server state and client state, utilizing dedicated libraries for each.

## 2. Server State Management: TanStack Query (React Query)

- **Library**: `@tanstack/react-query`
- **Purpose**: Manages all aspects of server-side data, including fetching, caching, synchronization with the backend, and managing asynchronous operations like updates (mutations).
- **Core Concepts & Usage**:
  - **`useQuery`**: Hook used for fetching (reading) data from the server. Requires a unique query key and a fetcher function.
  - **`useMutation`**: Hook used for creating, updating, or deleting data on the server.
  - **`QueryClient`**: Manages the underlying cache and provides methods for manual cache interaction (invalidation, refetching, etc.).
  - **`QueryClientProvider`**: Wraps the application (typically in `src/providers/index.tsx` or `src/app/layout.tsx`) to provide the `QueryClient` instance.
- **Benefits**:
  - **Caching**: Automatically caches server data, reducing redundant network requests and improving perceived performance.
  - **Background Updates**: Handles stale-while-revalidate logic, keeping data fresh in the background.
  - **Simplified Data Fetching**: Reduces boilerplate code compared to manual fetch/useEffect patterns.
  - **Optimistic Updates**: Facilitates updating the UI immediately before a mutation completes on the server, improving user experience.
  - **DevTools**: Provides excellent developer tools for inspecting cache state, queries, and mutations.
- **Example (`useQuery`)**:

  ```typescript
  import { useQuery } from '@tanstack/react-query';
  import { fetchUserData } from '@/lib/api/users'; // Example API fetcher function

  function UserProfile({ userId }: { userId: string }) {
    const { data: user, isLoading, error } = useQuery({
      queryKey: ['user', userId], // Unique key for this query
      queryFn: () => fetchUserData(userId),
      enabled: !!userId, // Only run query if userId is available
    });

    if (isLoading) return <div>Loading user profile...</div>;
    if (error) return <div>Error loading profile: {error.message}</div>;

    return <div>Welcome, {user?.name}</div>;
  }
  ```

## 3. Client State Management: Zustand

- **Library**: `zustand`
- **Purpose**: Manages client-side state that is not directly tied to server data. This includes UI state (e.g., modal open/closed, sidebar visibility), temporary form state (though React Hook Form is often preferred for complex forms), and other application-level state that doesn't need server persistence.
- **Core Concepts & Usage**:
  - **Stores**: State is organized into stores created using the `create` function.
  - **Hooks**: Components access state and actions by calling the hook returned by `create`.
  - **Selectors**: Recommended for accessing specific pieces of state to optimize re-renders.
- **Benefits**:
  - **Minimal Boilerplate**: Simple API, less setup required compared to Context or Redux.
  - **Performance**: Optimized for performance, avoids unnecessary re-renders through selective subscriptions.
  - **No Context Provider**: Does not require wrapping the application in provider components.
- **Example**:

  ```typescript
  import { create } from 'zustand';

  interface SidebarState {
    isOpen: boolean;
    toggleSidebar: () => void;
  }

  // Define the store
  const useSidebarStore = create<SidebarState>((set) => ({
    isOpen: false,
    toggleSidebar: () => set((state) => ({ isOpen: !state.isOpen })),
  }));

  // Use the store in a component
  function SidebarToggleButton() {
    // Select only the action to prevent re-renders when `isOpen` changes elsewhere
    const toggleSidebar = useSidebarStore((state) => state.toggleSidebar);
    return <button onClick={toggleSidebar}>Toggle Sidebar</button>;
  }

  function Sidebar() {
    // Select only the state needed
    const isOpen = useSidebarStore((state) => state.isOpen);
    if (!isOpen) return null;
    return <nav>...</nav>;
  }
  ```

## 4. Guidelines & Best Practices

- **Clear Separation**: Strictly differentiate between server state and client state.
  - Use **TanStack Query** for _any_ data that originates from or needs to be persisted to the server.
  - Use **Zustand** for ephemeral UI state, global client-side settings, or other state not tied to the backend.
- **Avoid Redundancy**: Do not duplicate server state managed by TanStack Query into Zustand stores. Access server data directly via `useQuery` hooks where needed.
- **Store Organization**: Create Zustand stores in a dedicated directory (e.g., `src/stores/` or co-located with features if state is highly feature-specific) for better organization.
- **Query Keys**: Use well-structured and descriptive query keys for TanStack Query to ensure proper caching and invalidation.
- **Selectors**: Use selectors with Zustand (`useStore(state => state.specificPiece)`) to minimize component re-renders.
- **Context API**: While available, React Context should generally be avoided for _global_ state management in favor of Zustand due to performance considerations (re-rendering entire subtrees). Context is suitable for localized state sharing within a specific component subtree where performance is not a major concern.

By adhering to this strategy, we aim for a predictable, performant, and maintainable state management system across the Justify application.
