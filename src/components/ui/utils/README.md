# Utils

The Utils directory contains utility components and hooks that support the UI component library but don't fit neatly into the atomic design hierarchy.

These utilities are often responsible for providing context, rendering application-wide providers, or offering helper functions that multiple components depend on.

## Guidelines

- Utilities should have a clear, focused purpose
- They should be well-documented with usage examples
- Prefer composable, functional approaches
- Test utilities thoroughly as they often support many components

## Components in this Directory

- **Providers**: Context providers and wrappers (SessionProvider, etc.) 