# Marketing Intelligence Platform

A comprehensive platform that helps brands measure the impact of their social media campaigns and identify high-performing influencers through structured data collection and intuitive dashboards.

## Table of Contents

- [Purpose](#purpose)
- [Core Features](#core-features)
- [Technical Architecture](#technical-architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Development Setup](#development-setup)
  - [Development Commands](#development-commands)
- [UI Component Library](#ui-component-library)
  - [Available Components](#available-components)
  - [Atomic Design Principles](#atomic-design-principles)
  - [Shadcn UI Integration](#shadcn-ui-integration)
  - [Component Registry System](#component-registry-system)
  - [UI Component Browser](#ui-component-browser)
- [Icon System](#icon-system)
- [Master Toolkit Architecture](#master-toolkit-architecture)
- [Code Organization](#code-organization)
- [Brand Guidelines](#brand-guidelines)
- [Deployment](#deployment)
- [Security](#security)
- [Contributing](#contributing)
- [License](#license)

## Purpose

Our application is a marketing intelligence platform that helps brands measure the impact of their social media campaigns and identify high-performing influencers. The system captures authentic audience opinions through structured data collection and presents actionable insights through intuitive dashboards.

## Core Features

1. **Campaign Wizard** - Step-by-step guided campaign creation process, budget management, timeline planning, creative asset management, and KPI tracking
2. **Brand Lift Measurement** - Pre/post campaign awareness tracking, message association metrics, purchase intent analysis, and brand perception measurement
3. **Creative Asset Testing** - A/B testing for campaign assets, performance comparisons, and optimization recommendations
4. **Influencer Discovery** - Authentic engagement metrics, audience alignment verification, brand safety tools, and performance projections
5. **Brand Health Monitoring** - Sentiment tracking, competitive share of voice, audience growth metrics, and brand loyalty indicators
6. **Mixed Media Modelling** - Cross-channel campaign analysis, ROI comparison by platform, and budget allocation optimization
7. **Comprehensive Reporting** - Customizable dashboards, exportable reports, and benchmark comparisons

## Technical Architecture

### Frontend

- **Framework**: Next.js with React and TypeScript
- **UI Components**: Custom component library with Shadcn UI and Tailwind CSS
- **State Management**: React Context API with SWR for data fetching
- **Testing**: Jest and React Testing Library

### Backend

- **API**: Next.js API Routes with strong typing
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT-based authentication
- **Storage**: Cloud storage for assets and reports

### Key Development Principles

- **Atomic Design**: Structured component hierarchy (atoms, molecules, organisms)
- **Type Safety**: Comprehensive TypeScript throughout
- **Component Reusability**: Modular architecture for maintainability
- **Performance Optimization**: Efficient data loading patterns
- **Accessibility**: WCAG 2.1 AA compliance
- **Single Source of Truth**: Centralized configurations and registries

## Project Structure

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
│   ├── guides/            # User and developer guides
│   ├── architecture/      # System architecture
│   ├── standards/         # Coding standards
│   └── ...                # Other documentation
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

## Getting Started

### Development Setup

1. **Clone the repository**

   ```bash
   git clone [repository-url]
   cd [project-directory]
   ```

2. **Install dependencies**

   ```bash
   npm install --legacy-peer-deps
   ```

3. **Environment setup**

   ```bash
   cp config/env/.env.example config/env/.env.local
   # Edit .env.local with your configuration
   ```

4. **Database setup**
   ```bash
   npm run db:migrate
   npm run db:seed # Optional: populate with sample data
   ```

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

# Run master toolkit
node scripts/master/master-toolkit.mjs [category] [command]

# Check file naming consistency
npm run codebase:check-naming

# Find redundant or deprecated files
npm run codebase:find-redundant

# Check overall codebase health
npm run codebase:health
```

## UI Component Library

Our comprehensive UI component library is designed with accessibility, customization, and type safety in mind. It implements the atomic design methodology and leverages Shadcn UI for consistent, accessible components.

### Available Components

- **Accordion**: Expandable content sections
- **Alert**: Contextual feedback messages
- **Badge**: Small count and labeling component
- **Button**: Interactive button with various styles
- **Card**: Container for content and actions
- **Input**: Text input fields
- **Label**: Form labels with consistent styling
- **Modal**: Dialog windows
- **Select**: Dropdown selection menu
- **Slider**: Range slider control
- **Switch**: Toggle control
- **Table**: Data table with various features
- **Tabs**: Tabbed interface for content organization

### Atomic Design Principles

Our component library follows atomic design principles, organizing components into:

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

This approach ensures systematic component composition, promotes reusability, and simplifies maintenance.

### Shadcn UI Integration

This project extensively uses [Shadcn UI](https://ui.shadcn.com/), a collection of reusable components built with:

- **Radix UI** for accessible primitives
- **Tailwind CSS** for styling
- **TypeScript** for type safety

Key features of our Shadcn integration:

- **Component Configuration**: Managed in `config/ui/components.json`
- **Custom Styling**: Extended with our brand colors and design system
- **Accessibility**: WCAG 2.1 AA compliant components
- **CLI Tools**: Add components with `npx shadcn-ui add [component]`
- **Type Safety**: Full TypeScript support for props and variants

All Shadcn components are integrated into our atomic design system, with consistent naming conventions and styling.

### Component Registry System

The project implements a Single Source of Truth (SSOT) approach for UI components:

- Configuration files in `/config/ui/`
- Runtime registries in `/public/static/component-registry.json`
- Component discovery tools in development
- Automated validation of component paths and dependencies

### UI Component Browser

A comprehensive UI component browser is available at `/debug-tools/ui-components` in development, providing:

- **Visual Component Library**: Browse all UI components
- **Interactive Props**: Test components with different props
- **Accessibility Checks**: Verify WCAG compliance
- **Responsive Testing**: View components at different breakpoints
- **Implementation Details**: View component source code and documentation
- **Used-by List**: See where each component is used

## Icon System

The application uses a combination of FontAwesome Pro icons and custom app icons.

### Icon Single Source of Truth (SSOT)

The five category-specific registry files serve as the SSOT for all icons:

- `/public/static/app-icon-registry.json`: Application-specific icons
- `/public/static/brands-icon-registry.json`: Brand/social media icons
- `/public/static/kpis-icon-registry.json`: KPI-related icons
- `/public/static/light-icon-registry.json`: Light FontAwesome icons (default state)
- `/public/static/solid-icon-registry.json`: Solid FontAwesome icons (hover state)

These registries are automatically consolidated at runtime by the `registry-loader.ts` file.

## Master Toolkit Architecture

The master toolkit provides a unified interface for all scripts:

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

Examples:

```bash
# Generate icon registry
node scripts/master/master-toolkit.mjs icons generate

# Validate UI components
node scripts/master/master-toolkit.mjs ui validate

# Migrate configuration files
node scripts/master/master-toolkit.mjs config migrate

# Tree shake deprecated files
node scripts/master/master-toolkit.mjs cleanup tree-shake
```

## Code Organization

### Naming Conventions

- **Files/Directories**: kebab-case (`user-profile.tsx`)
- **React Components**: PascalCase (`UserProfile.tsx`)
- **Variables/Functions**: camelCase (`userName`, `fetchUserData()`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRY_COUNT`)
- **Types/Interfaces**: PascalCase (`UserProfile`, `ApiResponse`)

### Component Structure

Components follow a consistent structure:

1. Imports
2. Types
3. Helper functions
4. Component
5. Export

### Single Source of Truth

The project follows a Single Source of Truth principle for:

- UI Component configuration
- Icon registries
- Configuration files
- Type definitions

### Tree Shake Process

The project includes a comprehensive tree shake process for managing deprecated files:

- **Dry-run mode**: Preview files to be removed
- **Reference checking**: Ensure files aren't referenced elsewhere
- **Automatic backups**: Create archives before removal
- **Detailed reporting**: Document all changes
- **Command**: `node scripts/master/master-toolkit.mjs cleanup tree-shake`

## Brand Guidelines

### Brand Colors

- **Primary**: Jet `#333333`
- **Secondary**: Payne's Grey `#4A5568`
- **Accent**: Deep Sky Blue `#00BFFF`
- **Background**: White `#FFFFFF`
- **Divider**: French Grey `#D1D5DB`
- **Interactive**: Medium Blue `#3182CE`

### Icons

- **Icon Library**: FontAwesome Pro
- **Default state**: Light icons (`fa-light`)
- **Hover state**: Solid icons (`fa-solid`)

### Typography

- **Headings**: Inter (sans-serif)
- **Body**: Inter (sans-serif)
- **Code**: JetBrains Mono (monospace)

## Deployment

### Production Deployment

- **Platform**: Vercel
- **Configuration**: `config/vercel/`
- **Branch Strategy**:
  - `main`: Production deployment
  - `develop`: Staging environment
  - Feature branches: Preview deployments

### CI/CD Pipeline

- **Testing**: Automated tests run on pull requests
- **Linting**: Code quality checks
- **Build**: Production build validation
- **Deployment**: Automatic deployment on merge to main

## Security

- **Authentication**: JWT with secure HttpOnly cookies
- **API Security**: Rate limiting and CSRF protection
- **Data Validation**: Input validation on all endpoints
- **Dependency Scanning**: Regular vulnerability checks
- **Environment Variables**: Secure storage in `.env.local`
- **Content Security Policy**: Strict CSP headers

## Contributing

1. Review the [Code Standards](docs/standards/code-standards.md) for guidelines
2. Follow the [Development Setup](docs/guides/developer/setup.md) instructions
3. Submit PRs with clear descriptions and references to issues
4. Ensure all tests pass and no linting errors exist
5. Follow atomic design principles for component development
6. Update documentation for any new features

## Browser Compatibility

This application is compatible with all modern browsers:

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT
