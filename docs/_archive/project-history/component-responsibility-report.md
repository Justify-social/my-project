# Component Responsibility Relocation Report

## Summary

- Total components processed: 6
- Successfully relocated: 0
- Failed: 6

## Successfully Relocated Components

## Failed Relocations

- ❌ `src/components/features/navigation/index.ts`: Source file not found
- ❌ `src/components/features/core/tests/index.ts`: Source file not found
- ❌ `src/components/features/core/tests/SaveIconTest.tsx`: Source file not found
- ❌ `src/components/features/core/loading/skeleton.tsx`: Source file not found
- ❌ `src/components/features/core/error-handling/ErrorBoundary.tsx`: Source file not found
- ❌ `src/components/features/core/search/index.ts`: Source file not found

## Purpose

This script relocated components from the features directory to either the UI or layouts directory based on their responsibilities:

- UI components: Generic, presentational components without business logic
- Layout components: Components that provide structural layout without specific business logic
- Feature components: Components with specific business logic tied to application features

This separation ensures better organization and maintainability.
