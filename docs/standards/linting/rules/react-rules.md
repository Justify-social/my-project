# React Linting Rules

This document details the ESLint rules we use specifically for React components.

## Core React Rules

| Rule | Severity | Description |
|------|----------|-------------|
| `react/prop-types` | off | Disabled in favor of TypeScript types |
| `react/react-in-jsx-scope` | off | Not needed with Next.js/modern React |
| `react/jsx-key` | error | Requires keys for array elements |
| `react/no-unescaped-entities` | warn | Checks for unescaped HTML entities |
| `react/display-name` | warn | Ensures components have displayName for debugging |
| `react/jsx-curly-brace-presence` | error | Enforces consistent use of curly braces |

## React Hooks Rules

| Rule | Severity | Description |
|------|----------|-------------|
| `react-hooks/rules-of-hooks` | error | Enforces Rules of Hooks |
| `react-hooks/exhaustive-deps` | warn | Checks effect dependencies |

## Common Issues and Solutions

### Missing Dependencies in useEffect

**Issue:**
```tsx
function Component({ id }) {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetchData(id).then(setData);
  }, []); // Missing dependency: 'id'
}
```

**Solution:**
```tsx
function Component({ id }) {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetchData(id).then(setData);
  }, [id]); // Added 'id' to the dependency array
}
```

### Function in useEffect Dependencies

**Issue:**
```tsx
function Component() {
  const fetchItems = () => api.getItems();
  
  useEffect(() => {
    fetchItems();
  }, [fetchItems]); // fetchItems is recreated every render
}
```

**Solution:**
```tsx
function Component() {
  const fetchItems = useCallback(() => api.getItems(), []);
  
  useEffect(() => {
    fetchItems();
  }, [fetchItems]); // Now stable across renders
}
```

### Event Handlers

**Issue:**
```tsx
<div onClick={handleClick}>Click me</div>
```

**Solution:**
```tsx
<button type="button" onClick={handleClick}>Click me</button>
```

## Accessibility Rules

| Rule | Severity | Description |
|------|----------|-------------|
| `jsx-a11y/alt-text` | error | Requires alt text for images |
| `jsx-a11y/click-events-have-key-events` | warn | Ensures keyboard accessibility |
| `jsx-a11y/no-static-element-interactions` | warn | Prevents interactions on non-interactive elements |

## Related Documentation

- [ESLint Configuration](../eslint-config.md)
- [TypeScript Rules](./typescript-rules.md)
- [Component Standards](../../ui/components.md) 