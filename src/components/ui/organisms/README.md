# UI Organisms

Organisms are complex UI components composed of molecules and/or atoms. They represent distinct sections of the interface with specific functionality.

## Definition

Organisms in atomic design are complex components that represent a distinct section of the interface. They're composed of multiple molecules and/or atoms working together to provide specific functionality.

## Examples of Organisms

- **Navigation Systems**: Main menus, navigation bars
- **Card Systems**: Complex card layouts with headers, content areas, and footers
- **Forms**: Complete forms with multiple input fields, validation, and submission controls
- **Tables**: Data tables with sorting, filtering, and pagination
- **Dashboards**: Widget collections and metric displays

## Our Organisms

The organisms in this directory include:

- `card`: Card components with headers, content areas, and footers (moved from atoms)
- `navigation`: Navigation components like headers and sidebars
- `table`: Complex table implementations with advanced features
- `form`: Form components with validation and submission handling
- `calendar`: Calendar and date picker components

## Usage Guidelines

- Prefer composition over inheritance
- Organisms should be context-agnostic where possible
- Organisms can sometimes be app-specific but should aim for reusability
- Document complex props and interactions thoroughly
- Include usage examples for complex organisms

## Components in this Directory

- **Card**: Card components and variations
- **Modal**: Dialog and modal window components
- **Feedback**: Alert and notification components 