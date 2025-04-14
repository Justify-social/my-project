# Code Organization

## Project Structure

The project follows a well-organized structure:

```
/
├── config/                # Configuration files by category
│   ├── eslint/            # ESLint configuration
│   ├── typescript/        # TypeScript configuration
│   ├── tailwind/          # Tailwind CSS configuration
│   ├── ui/                # UI component configuration
│   └── ...                # Other tool configs
├── src/                   # Application source code
│   ├── app/               # Next.js App Router pages and layouts
│   │   ├── (admin)/       # Admin interface routes (grouped)
│   │   ├── (auth)/        # Authentication routes (grouped)
│   │   └── api/           # API route handlers
│   ├── components/        # React components
│   │   ├── ui/            # Reusable UI components
│   │   │   ├── atoms/     # Atomic design: basic components
│   │   │   ├── molecules/ # Atomic design: composite components
│   │   │   └── organisms/ # Atomic design: complex components
│   │   ├── features/      # Feature-specific components
│   │   └── layouts/       # Layout components
│   ├── lib/               # Core libraries and utilities
│   ├── hooks/             # Custom React hooks
│   ├── contexts/          # React context providers
│   └── types/             # TypeScript type definitions
├── docs/                  # Documentation
├── scripts/               # Utility scripts
│   ├── master/            # Master toolkit
│   ├── icons/             # Icon management
│   ├── ui/                # UI component scripts
│   └── ...                # Other script categories
├── tests/                 # Test files
│   ├── unit/              # Unit tests
│   ├── integration/       # Integration tests
│   └── e2e/               # End-to-end tests
└── public/                # Static assets
    └── static/            # Generated static files
```

## Naming Conventions

The project follows these naming conventions:

- **Files/Directories**: kebab-case (`user-profile.tsx`)
- **React Components**: PascalCase (`UserProfile.tsx`)
- **Variables/Functions**: camelCase (`userName`, `fetchUserData()`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRY_COUNT`)
- **Types/Interfaces**: PascalCase (`UserProfile`, `ApiResponse`)

## Component Structure

Components follow a consistent structure:

1. Imports
2. Types
3. Helper functions
4. Component
5. Export

## Single Source of Truth

The project follows a Single Source of Truth principle for:

- UI Component configuration
- Icon registries
- Configuration files
- Type definitions

## UI Components Organization

UI components follow the atomic design methodology:

1. **Atoms**: Basic building blocks (buttons, inputs, icons)

   - Located in `src/components/ui/atoms/`
   - Self-contained with minimal dependencies
   - Highly reusable across the application

2. **Molecules**: Groups of atoms functioning together

   - Located in `src/components/ui/molecules/`
   - Composed of multiple atoms
   - Examples: form groups, search bars, notification items

3. **Organisms**: Complex UI sections composed of molecules and atoms

   - Located in `src/components/ui/organisms/`
   - Examples: navigation bars, dashboards, complex forms
   - Often feature-specific but reusable

4. **Templates**: Page layouts without specific content

   - Located in `src/components/layouts/`
   - Define content structure and component positioning

5. **Pages**: Specific instances of templates with real content
   - Located in `src/app/`
   - Implement business logic and data fetching

## Master Toolkit

The project includes a master toolkit to manage various aspects of development:

```bash
node scripts/master/master-toolkit.mjs [category] [command] [--options]
```

Categories include:

- `icons`: Icon management scripts
- `ui`: UI component scripts
- `config`: Configuration scripts
- `docs`: Documentation scripts
- `cleanup`: Cleanup utilities
- `linting`: Code quality tools
- `db`: Database utilities

## Icon System

The project uses FontAwesome Pro for icons, with:

1. **Directory Organization**:

   - `/public/static/icon-registry.json`: Single source of truth for all icons
   - `/icons/brands/`: Social media platform icons
   - `/icons/light/`: UI icons in light style (default state)
   - `/icons/solid/`: UI icons in solid style (hover/active states)
   - `/icons/app/`: Application-specific custom icons

2. **Icon Management**:

   - Centralized registry with consistent naming
   - Utility functions for icon path generation
   - Automatic downloading and optimization
   - Standardized kebab-case naming without 'fa-' prefix

3. **Icon Component**:
   - Built-in error handling
   - Support for all icon variants and sizes
   - Semantic icon naming for improved accessibility

## Tree Shake Process

The project includes a comprehensive tree shake process for managing deprecated files:

- **Dry-run mode**: Preview files to be removed
- **Reference checking**: Ensure files aren't referenced elsewhere
- **Automatic backups**: Create archives before removal
- **Detailed reporting**: Document all changes
- **Command**: `node scripts/master/master-toolkit.mjs cleanup tree-shake`
