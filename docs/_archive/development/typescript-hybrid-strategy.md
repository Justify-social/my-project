# TypeScript Hybridization Strategy

## Overview

This document outlines our approach to integrating TypeScript in a hybrid Node.js/Next.js environment, with a focus on simplicity, scalability, and developer experience. The strategy allows for seamless TypeScript usage across both server-side (Node.js) and client-side (Next.js) components.

## Goals

- Enable TypeScript for enhanced type safety and developer productivity
- Maintain a simple development workflow without excessive complexity
- Create a scalable foundation that grows with the application
- Ensure consistent behavior across development and production environments
- Minimize friction for developers working across different parts of the stack

## Implementation Plan

### Phase 1: Development Environment Setup

1. **Install essential dependencies:**

   ```bash
   npm install --save-dev typescript ts-node @types/node
   ```

2. **Configure TypeScript:**
   Create a base `tsconfig.json`:

   ```json
   {
     "compilerOptions": {
       "target": "ES2020",
       "lib": ["dom", "dom.iterable", "esnext"],
       "allowJs": true,
       "skipLibCheck": true,
       "strict": true,
       "forceConsistentCasingInFileNames": true,
       "noEmit": true,
       "esModuleInterop": true,
       "module": "esnext",
       "moduleResolution": "bundler",
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

3. **Create a server-specific config:**
   Create `tsconfig.server.json`:

   ```json
   {
     "extends": "./tsconfig.json",
     "compilerOptions": {
       "module": "CommonJS",
       "outDir": "dist",
       "noEmit": false,
       "isolatedModules": false
     },
     "include": ["server.ts", "src/app/(admin)/debug-tools/ui-components/api/**/*.ts"]
   }
   ```

4. **Update package.json scripts:**
   ```json
   "scripts": {
     "dev": "ts-node --transpile-only server.ts",
     "build": "tsc -p tsconfig.server.json && next build",
     "start": "NODE_ENV=production node dist/server.js"
   }
   ```

### Phase 2: Server-Side TypeScript Integration

1. **Rename `server.js` to `server.ts`**

2. **Add type definitions:**

   ```typescript
   // server.ts
   import { createServer } from 'http';
   import { parse } from 'url';
   import next from 'next';
   import type { Server } from 'http';
   import type { NextApiHandler } from 'next';

   // Type-safe server initialization
   const dev: boolean = process.env.NODE_ENV !== 'production';
   const hostname: string = 'localhost';
   const port: number = parseInt(process.env.PORT || '3000', 10);
   ```

3. **Type-safe WebSocket imports:**
   ```typescript
   // Import WebSocket server with proper error handling
   if (dev) {
     import('./src/app/(admin)/debug-tools/ui-components/api/websocket-server')
       .then(({ initWebSocketServer }) => {
         initWebSocketServer(server);
         console.log('> WebSocket server initialized');
       })
       .catch((err: Error) => {
         console.error('Failed to initialize WebSocket server:', err);
       });
   }
   ```

### Phase 3: API Layer Improvements

1. **Create consistent type definitions for WebSockets:**

   ```typescript
   // src/types/websocket.ts
   export interface WebSocketMessage {
     type: string;
     payload: unknown;
     timestamp: number;
   }

   export interface ComponentUpdateMessage extends WebSocketMessage {
     type: 'added' | 'updated' | 'removed' | 'discovered';
     payload: {
       path: string;
       name: string;
       category: string;
       lastUpdated: Date;
       props?: Array<{ name: string; type: string }>;
     };
   }
   ```

2. **Ensure shared types between client and server:**
   ```typescript
   // src/types/component.ts
   export interface ComponentMetadata {
     path: string;
     name: string;
     category: 'atom' | 'molecule' | 'organism';
     lastUpdated: Date;
     props?: Array<{ name: string; type: string }>;
     dependencies?: string[];
   }
   ```

### Phase 4: Import Consistency Strategy

To handle the TypeScript/JavaScript extension confusion:

1. **For internal modules:**
   Use extension-less imports within TypeScript files:

   ```typescript
   import { ComponentMetadata } from '../types/component';
   ```

2. **For compiled modules:**
   In `server.ts` and other files that interact with compiled code:

   ```typescript
   // Dynamic import helper function
   async function importModule(path: string) {
     try {
       // Try .js extension first (compiled)
       return await import(`${path}.js`);
     } catch (error) {
       // Fall back to .ts extension (development)
       return await import(`${path}.ts`);
     }
   }

   // Usage
   importModule('./src/app/(admin)/debug-tools/ui-components/api/websocket-server').then(
     ({ initWebSocketServer }) => {
       initWebSocketServer(server);
     }
   );
   ```

## Development Workflow

1. **During development:**

   - Run `npm run dev` to start the server with ts-node
   - Changes to TypeScript files are immediately available without compilation
   - WebSocket server and other components work in TypeScript directly

2. **For production:**
   - Run `npm run build` to compile server TypeScript files and build Next.js
   - Run `npm start` to start the production server using compiled JavaScript

## Future Improvements

1. **Hot Reloading:**
   Add nodemon for automatic server restarts:

   ```bash
   npm install --save-dev nodemon
   ```

   Update scripts:

   ```json
   "dev": "nodemon --exec ts-node --transpile-only server.ts"
   ```

2. **Type Checking Pipeline:**
   Add pre-commit hooks for type checking:

   ```bash
   npm install --save-dev husky lint-staged
   ```

3. **Containerization:**
   Add Docker support with multi-stage builds to optimize production images

## Implementation Fixes

During implementation of the TypeScript hybridization strategy, we encountered and fixed several issues:

### 1. Fixed tsconfig.json Location

The codebase had a reference to a config directory structure for TypeScript:

```bash
# Create TypeScript configuration directory
mkdir -p config/typescript

# Copy main tsconfig.json to the expected location
cp tsconfig.json config/typescript/tsconfig.json
```

This ensures compatibility with existing tooling while maintaining our TypeScript configuration.

### 2. Fixed Type Assertions in WebSocket Implementation

We found type mismatches between our shared types and the implementations:

**Before:**

```typescript
// In websocket-server.ts
category: component.category as string,

// In useComponentWebSocket.ts
category: typedMessage.payload.category as any,
```

**Fixed by:**

1. Updating imports in websocket.ts to properly use ComponentCategory:

```typescript
import { ComponentCategory, ComponentProp } from './component';

export interface ComponentUpdateMessage extends WebSocketMessage {
  payload: {
    // ...
    category: ComponentCategory; // Properly typed
    // ...
    props?: ComponentProp[]; // Using shared type
  };
}
```

2. Removing unnecessary type assertions:

```typescript
// In websocket-server.ts
category: component.category, // No assertion needed

// In useComponentWebSocket.ts
category: typedMessage.payload.category, // No assertion needed
```

### 3. Updated Node.js Version Requirement

The package.json specified Node.js >=20.11.0, but our environment runs on Node.js v18.20.6:

```json
"engines": {
  "node": ">=18.0.0"
}
```

This change allows the project to run on Node.js 18.x, which is our current environment version.

## Verification Steps

To verify the implementation:

1. Run the development server with TypeScript support:

```bash
npm run dev
```

2. Check for WebSocket connectivity in browser console

3. Verify build process successfully compiles TypeScript:

```bash
npm run build
```

4. Start the production server with compiled JavaScript:

```bash
npm start
```

These fixes ensure a smooth TypeScript integration that works correctly across development and production environments.

## Conclusion

This TypeScript hybridization strategy provides a scalable foundation that balances simplicity with proper engineering practices. It enables type safety during development while maintaining a straightforward workflow. The approach can be gradually enhanced as the application matures, without requiring major refactoring of the existing codebase.

By focusing on developer experience first, while building in the right extensibility points, this strategy supports rapid development in the project's embryonic stages while laying groundwork for more robust practices as the application grows.
