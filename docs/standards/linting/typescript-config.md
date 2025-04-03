# TypeScript Linting Configuration

This document details our TypeScript compiler and linting configuration used across the project.

## TypeScript Configuration

We use the following TypeScript configuration:

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "es2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

## TypeScript-ESLint Integration

We use `@typescript-eslint/eslint-plugin` and `@typescript-eslint/parser` for TypeScript linting:

```json
// .eslintrc.json (snippet)
{
  "parser": "@typescript-eslint/parser",
  "plugins": [
    "@typescript-eslint"
  ],
  "extends": [
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-unused-vars": ["error", { 
      "argsIgnorePattern": "^_", 
      "varsIgnorePattern": "^_" 
    }]
  }
}
```

## Common TypeScript Linting Issues

### Type Annotations

**Recommended:**
```typescript
// Use explicit return types for public APIs
function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// Use type inference for internal functions when obvious
const double = (x: number) => x * 2;
```

### Handling Unused Variables

**Recommended:**
```typescript
// Prefix unused variables with underscore
function processUser(user: User, _options?: Options): void {
  console.log(user.name);
}

// Use empty destructuring for unused array items
const [, setCount] = useState(0);
```

## Configuration Files

| File | Purpose | Location |
|------|---------|----------|
| `tsconfig.json` | Main TypeScript config | `config/typescript/tsconfig.json` |
| `tsconfig.eslint.json` | Config for linting | `config/typescript/tsconfig.eslint.json` |

## Type Checking Scripts

- `npm run type-check`: Run TypeScript compiler in verification mode
- `npm run find-any-types`: Locate usages of `any` type in the codebase

## Related Documentation

- [ESLint Configuration](./eslint-config.md)
- [TypeScript Rules](./rules/typescript-rules.md)
- [Type Safety Guidelines](../verification/type-safety.md) 