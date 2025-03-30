## Codebase Structure and Organization

This project follows a structured approach to code organization, ensuring maintainability, readability, and developer experience.

### Directory Structure

```
/
├── src/                # Application source code
│   ├── app/            # Next.js App Router pages and API routes
│   ├── components/     # React components (UI, features, layouts)
│   ├── hooks/          # Custom React hooks
│   ├── contexts/       # React contexts for state management
│   ├── lib/            # Core libraries and utilities
│   ├── middlewares/    # Request processing middleware
│   ├── services/       # External service integrations
│   ├── types/          # TypeScript type definitions
│   └── utils/          # Helper utilities
├── tests/              # Test files
│   ├── unit/           # Unit tests
│   ├── integration/    # Integration tests
│   └── e2e/            # End-to-end tests
├── docs/               # Documentation
│   ├── architecture/   # Architectural guides
│   └── project-history/# Project history and cleanup reports
└── scripts/            # Utility scripts
    └── codebase-structure/ # Code organization utilities
```

### Code Quality Tools

The project includes several tools to maintain code quality and organization:

```bash
# Check file naming consistency
npm run codebase:check-naming

# Find redundant or deprecated files
npm run codebase:find-redundant

# Clean up redundant files (use with caution)
npm run codebase:clean-redundant

# Check overall codebase health
npm run codebase:health
```

### Documentation

Comprehensive documentation is available in the `docs` directory:

- **[CODE_STANDARDS.md](docs/CODE_STANDARDS.md)** - Coding standards and best practices
- **[TESTING.md](docs/TESTING.md)** - Testing guidelines and patterns
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture overview
- **[MODULES.md](docs/architecture/MODULES.md)** - Module interactions and design

### Cleanup History

This project has undergone a comprehensive cleanup process to improve code organization, maintainability, and developer experience. The cleanup includes:

1. **Standard Directory Structure** - Consistent naming and organization
2. **Component Responsibility Separation** - UI, Features, and Layout components properly separated
3. **Test Centralization** - Tests organized in a central location
4. **API Middleware Organization** - Clear separation between application middleware and API middleware
5. **Documentation** - READMEs in all major directories

Detailed reports about the cleanup process are available in the `docs/project-history` directory.

### Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Lint code
npm run lint

# Format code
npm run format

# Run tests
npm run test
```

For more specific commands, see the scripts section in `package.json`.

# UI Component Library

This is a comprehensive UI component library designed for building modern, accessible, and consistent web applications.

## Available Components

The library includes the following components:

- **Accordion**: Expandable content sections
- **Alert**: Contextual feedback messages
- **Badge**: Small count and labeling component
- **Button**: Interactive button with various styles
- **Card**: Container for content and actions
- **Input**: Text input fields
- **Label**: Form labels with consistent styling
- **Scroll Area**: Custom scrollable area
- **Select**: Dropdown selection menu
- **Slider**: Range slider control
- **Spinner**: Loading indicator
- **Switch**: Toggle control
- **Table**: Data table with various features
- **Tabs**: Tabbed interface for content organization

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Visit `http://localhost:3000` to see the component library in action.

## Key Features

- **Accessibility**: All components follow WAI-ARIA standards
- **Customization**: Extensive theming support
- **Responsive**: Mobile-friendly components
- **Typescript**: Full type definitions included
- **Server Components**: Compatible with Next.js app router
- **Documentation**: Comprehensive usage examples

## Browser Compatibility

This library is compatible with all modern browsers:

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Implementation Notes

See the [Implementation Notes](./docs/implementation-notes.md) for details on the technical implementation and browser compatibility solutions.

## License

MIT 