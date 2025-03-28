# Architecture

This section explains how our codebase is structured and the key architectural decisions that shape our project.

## Key Topics

- **[Directory Structure](./directory-structure.md)**: How our codebase is organised into folders and files
- **[Component Dependencies](../dependency-graphs/component-dependencies.mmd)**: Visual representation of how components relate to each other

## Design Principles

Our architecture follows these core principles:

1. **Separation of Concerns**: Each component has a clear, focused responsibility
2. **Domain-Driven Design**: Code is organised around business domains rather than technical functions
3. **Feature-Based Structure**: Features are grouped together for better discoverability
4. **Scalable Patterns**: Architectural patterns that allow for project growth
5. **Maintainable Structure**: Organisation that makes maintenance straightforward

## Frontend Architecture

The frontend follows a component-based architecture using React and TypeScript. Key architectural elements include:

- Component hierarchies that mirror business domains
- Shared utilities and hooks for cross-cutting concerns
- Service layer for API interactions
- State management with context and reducers

## Backend Architecture

The backend follows a layered architecture with clear separation between:

- API routes and controllers 
- Business logic services
- Data access layer
- Configuration management

For detailed implementation specifics, see the [Backend Features](../features/backend/README.md) section. 