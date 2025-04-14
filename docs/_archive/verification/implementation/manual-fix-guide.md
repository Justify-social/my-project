# Manual Fix Guide for Common Lint Errors

This guide provides detailed examples and solutions for common ESLint errors that require manual intervention. Reference this document when the automated tools can't fully resolve an issue.

## React Hooks Rules Violations

### Problem: Hooks Called Conditionally

```tsx
// ❌ INCORRECT
function Component() {
  const [isLoading, setIsLoading] = useState(false);

  if (someCondition) {
    // Error: React Hook "useState" cannot be called conditionally
    const [data, setData] = useState([]);
  }

  return <div>{/* ... */}</div>;
}

// ✅ CORRECT
function Component() {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState(someCondition ? [] : null);

  return <div>{/* ... */}</div>;
}
```

### Problem: Hooks in Callbacks

```tsx
// ❌ INCORRECT
function Component() {
  const handleClick = () => {
    // Error: React Hook "useState" cannot be called inside a callback
    const [count, setCount] = useState(0);
  };

  return <button onClick={handleClick}>Click me</button>;
}

// ✅ CORRECT
function Component() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount(count + 1);
  };

  return <button onClick={handleClick}>Click me</button>;
}
```

## Unsafe Function Types

### Problem: Generic Function Type

```tsx
// ❌ INCORRECT
interface ComponentProps {
  onSubmit: Function; // Error: The `Function` type accepts any function-like value
}

// ✅ CORRECT
interface ComponentProps {
  onSubmit: (data: FormData) => void;
}
```

### Problem: Function Type in Callback Props

```tsx
// ❌ INCORRECT
function DataTable({ onRowSelect }: { onRowSelect: Function }) {
  // ...
}

// ✅ CORRECT
interface RowData {
  id: string;
  name: string;
}

function DataTable({ onRowSelect }: { onRowSelect: (row: RowData) => void }) {
  // ...
}
```

## Empty Object Types

### Problem: Empty Object Type as Prop

```tsx
// ❌ INCORRECT
function UserProfile({ user }: { user: {} }) {
  // Error: The `{}` type allows any non-nullish value
  return <div>{user.name}</div>;
}

// ✅ CORRECT - Option 1: Define a proper interface
interface User {
  name: string;
  email: string;
}

function UserProfile({ user }: { user: User }) {
  return <div>{user.name}</div>;
}

// ✅ CORRECT - Option 2: Use Record type for flexible objects
function UserProfile({ user }: { user: Record<string, unknown> }) {
  return <div>{user.name as string}</div>;
}

// ✅ CORRECT - Option 3: Use unknown with type guards
function UserProfile({ user }: { user: unknown }) {
  // Type guard
  if (user && typeof user === 'object' && 'name' in user) {
    return <div>{user.name as string}</div>;
  }
  return <div>Invalid user</div>;
}
```

## Unused Expressions

### Problem: Statement with No Effect

```tsx
// ❌ INCORRECT
function Component() {
  useEffect(() => {
    isValid && doSomething(); // Error: Expected an assignment or function call
  }, [isValid]);

  return <div>{/* ... */}</div>;
}

// ✅ CORRECT - Option 1: Use if statement
function Component() {
  useEffect(() => {
    if (isValid) {
      doSomething();
    }
  }, [isValid]);

  return <div>{/* ... */}</div>;
}

// ✅ CORRECT - Option 2: Use the void operator
function Component() {
  useEffect(() => {
    void (isValid && doSomething());
  }, [isValid]);

  return <div>{/* ... */}</div>;
}
```

## Syntax Errors

### Problem: Invalid Character

```tsx
// ❌ INCORRECT
const value = "This has "smart quotes" that cause errors";

// ✅ CORRECT
const value = "This has \"straight quotes\" that work correctly";
```

### Problem: Missing Parentheses

```tsx
// ❌ INCORRECT
const Component = props => <div>{props.value}</div>;

// ✅ CORRECT
const Component = props => <div>{props.value}</div>;
```

## TS Ignore Comments

### Problem: Using @ts-ignore

```tsx
// ❌ INCORRECT
// @ts-ignore
const result = someFunction();

// ✅ CORRECT
// @ts-expect-error Type is incompatible
const result = someFunction();
```

## No-Undef JSX References

### Problem: Using Component without Import

```tsx
// ❌ INCORRECT
function Dashboard() {
  return (
    <div>
      <LoadingSpinner /> {/* Error: 'LoadingSpinner' is not defined */}
    </div>
  );
}

// ✅ CORRECT
import LoadingSpinner from 'components/ui/LoadingSpinner';

function Dashboard() {
  return (
    <div>
      <LoadingSpinner />
    </div>
  );
}
```

## Missing HTML Link Element

### Problem: Using Regular Anchor for Internal Links

```tsx
// ❌ INCORRECT
function Navigation() {
  return (
    <nav>
      <a href="/dashboard">Dashboard</a> {/* Error: Do not use <a> for internal links */}
    </nav>
  );
}

// ✅ CORRECT
import Link from 'next/link';

function Navigation() {
  return (
    <nav>
      <Link href="/dashboard">Dashboard</Link>
    </nav>
  );
}
```

## Troubleshooting Tips

### When ESLint Fixes Break the Build

1. Apply fixes incrementally, commit after each successful batch
2. Prioritize fixing one rule type at a time
3. Always run tests after significant changes
4. For complex files, consider fixing warnings separately from errors

### Debugging React Hook Dependency Warnings

1. Use the React DevTools to examine component re-renders
2. Extract complex logic into useMemo or useCallback hooks
3. Consider using the exhaustive-deps ESLint rule to automatically suggest fixes

### Handling Circular Dependencies

1. Identify the source of the circular dependency
2. Consider restructuring your component hierarchy
3. Extract shared logic to utility functions
4. Use React Context for deeply nested prop sharing
