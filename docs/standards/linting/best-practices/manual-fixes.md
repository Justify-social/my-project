# Manual Linting Fixes Guidelines

This document provides guidance on addressing linting issues that require manual intervention.

## When to Fix Manually

Not all linting issues can be automatically fixed. Manual fixes are typically needed for:

1. Complex code structure issues
2. Type safety problems
3. React hooks dependency array issues
4. Architectural issues like circular dependencies
5. Issues requiring refactoring or redesign

## Common Manual Fix Scenarios

### Complex React Hooks Dependencies

**Issue:**
```tsx
useEffect(() => {
  // Complex logic accessing various dependencies
  if (user && user.preferences) {
    const filteredItems = items.filter(item => 
      user.preferences.includes(item.category)
    );
    setFilteredItems(filteredItems);
  }
}, []); // Missing dependencies
```

**Manual Fix:**
```tsx
// Extract logic to useMemo
const filteredItems = useMemo(() => {
  if (user && user.preferences) {
    return items.filter(item => 
      user.preferences.includes(item.category)
    );
  }
  return [];
}, [user, items]); // Properly declare dependencies

useEffect(() => {
  setFilteredItems(filteredItems);
}, [filteredItems]); // Now has proper dependencies
```

### Circular Dependencies

**Issue:**
```
Error: Circular dependency detected:
  src/components/UserProfile.tsx → 
  src/utils/user-helpers.ts → 
  src/components/UserProfile.tsx
```

**Manual Fix:**
1. Identify the shared logic causing the cycle
2. Extract common logic to a separate module
3. Refactor both dependencies to use the new shared module

### Type Safety Issues

**Issue:**
```typescript
// @ts-ignore
const data = fetchData();
data.process(); // Unsafe
```

**Manual Fix:**
```typescript
interface DataResponse {
  process: () => void;
  // Add all other known properties
}

const data = fetchData() as DataResponse;
if (typeof data.process === 'function') {
  data.process();
}
```

## Best Practices for Manual Fixes

1. **Understand before fixing** - Don't just make the error go away; understand why it's there
2. **Test thoroughly** - Manual fixes can introduce subtle bugs, so test thoroughly
3. **Document complex fixes** - Leave comments explaining complex fixes
4. **Refactor if needed** - Sometimes a proper fix requires refactoring the underlying code
5. **Consult the team** - For architectural issues, consult with the team before major changes

## Documenting Exceptions

When a linting rule must be disabled for a valid reason:

```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseExternalData(data: any) {
  // External API returns unpredictable data structure
  // Future enhancement: Add runtime type validation (JIRA-1234)
}
```

Always include:
1. Why the rule is disabled
2. Any future plans to address it properly
3. A ticket reference if applicable

## Related Documentation

- [Manual Fix Guide](../../verification/implementation/manual-fix-guide.md) - Detailed manual fix procedures
- [Auto-fixable Issues](./auto-fixable.md) - Issues that can be fixed automatically
- [Rule Exceptions](./exceptions.md) - Guide for when to create exceptions 