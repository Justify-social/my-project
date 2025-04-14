# Configuration System

This directory contains the centralized configuration system for the project, following the Single Source of Truth (SSOT) principle.

## Directory Structure

- `core/`: Core application configuration (constants, defaults)
- `environment/`: Environment-specific configurations (development, testing, production)
- `platform/`: Platform-specific configurations
  - `next/`: Next.js configuration (canonical source)
- `ui/`: UI component configuration and registry management
- `scripts/`: Configuration management scripts
- `start-up/`: Critical application startup scripts
- `cypress/`: Cypress testing configuration
- `env/`: Environment variable definitions and examples
- `typescript/`: TypeScript configuration
- `eslint/`: ESLint configuration
- `prettier/`: Prettier configuration
- `jest/`: Jest configuration
- `tailwind/`: Tailwind CSS configuration
- `postcss/`: PostCSS configuration

## Documentation

For comprehensive documentation on the configuration system, see:

- [Configuration System Documentation](/docs/configuration/README.md)
- [Migration Guide](/docs/configuration/migration-guide.md)
- [Implementation Status](/docs/configuration/implementation-status.md)

## Usage

The root project files (e.g., `next.config.js`, `.eslintrc.js`, `jest.config.js`) now reference these canonical configuration files.

## Project Structure

This project has been organized with a clean directory structure:

- `config/` - Configuration files organized by tool/framework
- `docs/` - Project documentation
- `scripts/` - Utility scripts organized by function
- `src/` - Application source code
- `public/` - Static assets

See `docs/PROJECT_STRUCTURE.md` for more details on the project organization.
