# Linting Rule Exceptions

This document provides guidelines on when and how to create exceptions to linting rules.

## When to Create Exceptions

Rule exceptions should be rare and created only when:

1. The rule conflicts with a legitimate code pattern
2. The fix would require substantial refactoring for minimal benefit
3. The rule doesn't apply in specific contexts (like test files)
4. External libraries or APIs necessitate code patterns that violate rules
5. Performance optimizations require rule violations

## How to Create Exceptions

### File-Level Exceptions

For disabling a rule throughout a file:

```typescript
/* eslint-disable rule-name */
// File content
/* eslint-enable rule-name */
```

Example:
```typescript
/* eslint-disable @typescript-eslint/no-explicit-any */
// Test mocks file where 'any' is unavoidable
/* eslint-enable @typescript-eslint/no-explicit-any */
```

### Line-Level Exceptions

For disabling a rule for a specific line:

```typescript
// eslint-disable-next-line rule-name
const problematicLine = something();
```

Example:
```typescript
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const userId = user!.id; // We validate user exists in the preceding if-block
```

### Multiple Rules

For disabling multiple rules:

```typescript
/* eslint-disable rule-1, rule-2 */
// eslint-disable-next-line rule-1, rule-2
```

## Documentation Requirements

All exceptions must be documented with:

1. **Why**: The reason for the exception
2. **Scope**: How much code it affects
3. **Alternative**: Any considered alternatives
4. **Future**: Plans to remove the exception

Example:
```typescript
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
 * REASON: Integration with legacy API that has inconsistent response structures
 * SCOPE: Limited to this file only
 * ALTERNATIVE: Considered runtime type validation, but too performance-intensive
 * FUTURE: Will be fixed when API v2 (JIRA-5678) is released with consistent types
 */
```

## Tracking Exceptions

All exceptions should be tracked:

1. In code comments as shown above
2. In our exception tracking document if long-term
3. With associated JIRA tickets for planned resolution

## Common Exception Scenarios

| Rule | Valid Exception Scenario | Invalid Exception Scenario |
|------|--------------------------|----------------------------|
| `@typescript-eslint/no-explicit-any` | External API integration | Internal function parameters |
| `@typescript-eslint/no-non-null-assertion` | After null check in same block | General usage without verification |
| `react-hooks/exhaustive-deps` | Performance-critical memoization | Normal useEffect dependencies |
| `import/no-cycle` | Temporary during major refactoring | Long-term circular dependency |

## Related Documentation

- [ESLint Configuration](../eslint-config.md)
- [Manual Fix Guidelines](./manual-fixes.md)
- [Verification Strategy](../../verification/lint-strategy.md) 