# Coding Standards

This document outlines the coding standards and best practices for our project. Following these guidelines ensures code consistency, improves readability, and makes maintenance easier.

## Table of Contents
- [Naming Conventions](#naming-conventions)
- [File Organization](#file-organization)
- [TypeScript Best Practices](#typescript-best-practices)
- [React Guidelines](#react-guidelines)
- [CSS/Styling Conventions](#cssstyling-conventions)
- [Testing Standards](#testing-standards)
- [Documentation Guidelines](#documentation-guidelines)
- [Git Workflow](#git-workflow)

## Naming Conventions

### General Rules
- Use descriptive names that accurately reflect the purpose of the entity
- Avoid abbreviations unless they are well-known (e.g., URL, HTML)
- Be consistent with naming patterns

### Files and Directories
- Use **kebab-case** for file and directory names: `user-profile.tsx`, `api-client.ts`
- Test files should match their implementation files with a `.test.ts` or `.test.tsx` suffix
- Directories should describe their purpose or domain: `components/`, `hooks/`, `utils/`

### React Components
- Use **PascalCase** for component names and files: `UserProfile.tsx`, `Button.tsx`
- HOCs should be prefixed with `with`: `withAuth`, `withTheme`

### Variables and Functions
- Use **camelCase** for variables and functions: `userName`, `fetchUserData()`
- Boolean variables should be prefixed with `is`, `has`, or `should`: `isLoading`, `hasError`
- Event handlers should be prefixed with `handle` or `on`: `handleSubmit`, `onUserClick`

### Constants
- Use **UPPER_SNAKE_CASE** for constants: `MAX_RETRY_COUNT`, `API_ENDPOINT`

### Types and Interfaces
- Use **PascalCase** for types and interfaces: `UserProfile`, `ApiResponse`
- Interfaces should not be prefixed with `I`: Use `User` instead of `IUser`
- Types that represent props should be suffixed with `Props`: `ButtonProps`, `UserProfileProps`

## File Organization

### Component Structure
Components should follow this general structure:
```tsx
// 1. Imports
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

// 2. Types
type UserProfileProps = {
  userId: string;
  isEditable?: boolean;
};

// 3. Helper functions (if needed)
const formatUserName = (firstName: string, lastName: string) => {
  return `${firstName} ${lastName}`;
};

// 4. Component
export const UserProfile: React.FC<UserProfileProps> = ({ userId, isEditable = false }) => {
  // State hooks
  const [isLoading, setIsLoading] = useState(true);
  
  // Other hooks
  const router = useRouter();
  
  // Effects
  useEffect(() => {
    // Effect logic
  }, [userId]);
  
  // Event handlers
  const handleSubmit = () => {
    // Handler logic
  };
  
  // Conditional rendering
  if (isLoading) {
    return <Loading />;
  }
  
  // Render
  return (
    <div>
      {/* JSX content */}
    </div>
  );
};

// 5. Default export
export default UserProfile;
```

### Directory Structure for Features
Feature directories should follow this pattern:
```
feature-name/
├── components/         # UI components specific to this feature
├── hooks/              # Custom hooks for this feature
├── types/              # TypeScript types for this feature
├── utils/              # Utility functions for this feature
└── index.ts            # Main exports from the feature
```

## TypeScript Best Practices

### General Rules
- Enable strict mode in TypeScript configuration
- Avoid `any` type whenever possible
- Use union types to represent multiple possibilities: `type Status = 'loading' | 'success' | 'error'`
- Use type inference where appropriate

### Type Definitions
- Define interfaces for data structures and component props
- Use generic types when a function or component can work with different data types
- Create type guards for runtime type checking: `if (isUser(data)) { ... }`

### Common Patterns
```typescript
// Union types for state
type RequestStatus = 'idle' | 'loading' | 'success' | 'error';

// Type guards
function isUser(obj: any): obj is User {
  return obj && typeof obj === 'object' && 'id' in obj && 'name' in obj;
}

// Generic components
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}

// Utility types
type Nullable<T> = T | null;
type AsyncData<T> = {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
};
```

## React Guidelines

### Functional Components
- Use functional components with hooks instead of class components
- Destructure props for readability
- Keep components focused on a single responsibility
- Extract complex logic into custom hooks

### Hooks
- Follow the [Rules of Hooks](https://reactjs.org/docs/hooks-rules.html)
- Use custom hooks to share stateful logic between components
- Keep dependencies array accurate in `useEffect` and other hooks
- Memoize callbacks with `useCallback` and computed values with `useMemo` when beneficial

### Performance Optimization
- Use React DevTools Profiler to identify performance issues
- Avoid unnecessary re-renders with `React.memo`, `useMemo`, and `useCallback`
- Use virtualization for long lists (react-window or react-virtualized)
- Lazy load components with `React.lazy` and `Suspense`

### State Management
- Use local state for UI-specific state
- Use context for sharing state that many components need
- Consider using React Query for server state

## CSS/Styling Conventions

### Tailwind CSS
- Follow the utility-first approach
- Use consistent spacing and sizing scales
- Extract common patterns to custom components
- Group related utilities together

```jsx
// Good
<button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
  Submit
</button>

// Bad
<button className="text-white px-4 hover:bg-blue-600 py-2 rounded transition bg-blue-500">
  Submit
</button>
```

### Custom CSS
- Use CSS modules for component-specific styles
- Follow BEM naming convention for classes: `.block__element--modifier`
- Use CSS variables for theming and consistent values

## Testing Standards

### Unit Tests
- Test components in isolation
- Mock external dependencies
- Focus on behavior, not implementation details
- Use data-testid attributes for selecting elements

```tsx
// Component
<button data-testid="submit-button" onClick={handleSubmit}>Submit</button>

// Test
const button = screen.getByTestId('submit-button');
fireEvent.click(button);
expect(handleSubmit).toHaveBeenCalled();
```

### Integration Tests
- Test how components work together
- Focus on user interactions and workflows
- Use React Testing Library's user-event for realistic user interactions

### End-to-End Tests
- Test critical user flows from start to finish
- Use Cypress for browser-based testing
- Mock external APIs when necessary

### Test Organization
- Group tests logically with describe blocks
- Use clear test descriptions that explain what's being tested
- Follow the Arrange-Act-Assert pattern

```typescript
describe('UserProfile', () => {
  describe('when user is logged in', () => {
    it('displays the user information', () => {
      // Arrange
      render(<UserProfile user={mockUser} />);
      
      // Act
      // (sometimes no action is needed)
      
      // Assert
      expect(screen.getByText(mockUser.name)).toBeInTheDocument();
    });
  });
});
```

## Documentation Guidelines

### Code Comments
- Use JSDoc comments for functions, components, and complex logic
- Focus on why, not what (the code should explain what it does)
- Keep comments up-to-date with code changes

```typescript
/**
 * Formats a user's name according to their preferences
 * 
 * @param user The user object containing name information
 * @param options Formatting options
 * @returns Formatted name string
 */
function formatUserName(user: User, options?: FormatOptions): string {
  // Implementation
}
```

### README Files
- Each significant directory should have a README.md file
- Explain the purpose and organization of the directory
- Provide examples for non-obvious usage

### API Documentation
- Document all API endpoints with:
  - URL and method
  - Request parameters and body
  - Response format
  - Error handling
  - Authentication requirements

## Git Workflow

### Branching Strategy
- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/feature-name` - New features
- `bugfix/issue-description` - Bug fixes
- `hotfix/issue-description` - Critical production fixes

### Commit Messages
Follow the Conventional Commits standard:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code changes that neither fix bugs nor add features
- `test:` - Adding or modifying tests
- `chore:` - Changes to the build process, tools, etc.

Example:
```
feat(auth): add password reset functionality

- Add password reset form component
- Implement password reset API endpoint
- Add email notification service integration

Closes #123
```

### Pull Requests
- Keep PRs focused on a single change
- Include a clear description of changes
- Reference related issues
- Include screenshots for UI changes
- Ensure all tests pass
- Request review from appropriate team members

## Conclusion

Following these coding standards will help maintain a consistent, high-quality codebase. If you have questions or suggestions for improvements, please discuss them with the team.

Remember that these standards exist to serve the team, not to restrict creativity. In exceptional cases where following a standard would result in worse code, use your judgment and document your decision. 