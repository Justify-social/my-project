# TypeScript Linting Rules

This document details the ESLint rules we use specifically for TypeScript code.

## Core TypeScript Rules

| Rule | Severity | Description |
|------|----------|-------------|
| `@typescript-eslint/no-explicit-any` | warn | Discourages use of `any` type |
| `@typescript-eslint/explicit-module-boundary-types` | off | Optional return types on exports |
| `@typescript-eslint/no-unused-vars` | error | Prevents unused variables |
| `@typescript-eslint/no-empty-interface` | warn | Prevents empty interfaces |
| `@typescript-eslint/no-non-null-assertion` | warn | Discourages non-null assertions |
| `@typescript-eslint/no-require-imports` | warn | Enforces ES imports over require |

## Type Safety Rules

| Rule | Severity | Description |
|------|----------|-------------|
| `@typescript-eslint/ban-types` | error | Forbids problematic types like `{}` |
| `@typescript-eslint/prefer-nullish-coalescing` | warn | Encourages `??` over `||` |
| `@typescript-eslint/prefer-optional-chain` | warn | Encourages optional chaining |
| `@typescript-eslint/strict-boolean-expressions` | off | Optional strict boolean checks |
| `@typescript-eslint/no-unsafe-assignment` | off | Optional strict type assignment |

## Common Issues and Solutions

### Unused Variables

**Issue:**
```typescript
function processData(data: Data, options: Options) {
  // options is never used
  return data.value;
}
```

**Solution:**
```typescript
function processData(data: Data, _options: Options) {
  // Prefix with underscore to indicate intentionally unused
  return data.value;
}
```

### Explicit Any

**Issue:**
```typescript
function transform(input: any): any {
  return input.map(item => item.value);
}
```

**Solution:**
```typescript
interface Item {
  value: string;
}

function transform(input: Item[]): string[] {
  return input.map(item => item.value);
}
```

### Non-null Assertions

**Issue:**
```typescript
function getUserName(user?: User) {
  return user!.name; // Dangerous!
}
```

**Solution:**
```typescript
function getUserName(user?: User) {
  if (!user) {
    throw new Error('User is required');
  }
  return user.name;
}

// Or
function getUserName(user?: User) {
  return user?.name ?? 'Guest';
}
```

## Configuration Exceptions

Sometimes we need to disable rules for specific cases:

```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function handleUnknownData(data: any) {
  // Special case where we truly don't know the type
}
```

Use these sparingly and always with a comment explaining why.

## Related Documentation

- [ESLint Configuration](../eslint-config.md)
- [TypeScript Configuration](../typescript-config.md)
- [Type Safety Guidelines](../../verification/type-safety.md) 