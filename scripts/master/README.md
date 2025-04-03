# Master Script Architecture

This directory contains the master toolkit and related scripts that serve as the unified entry point for all script functionality across the project.

## Master Toolkit

The `master-toolkit.mjs` script provides a centralized interface to access all scripts in the project. It follows a category-command pattern that makes it easy to discover and use available functionality.

### Design Principles

The master toolkit design follows these key principles:

1. **Discoverability**: All available commands are documented and discoverable through help commands
2. **Consistency**: All scripts follow a consistent interface pattern
3. **Modularity**: Each script handles a specific function but is accessible through a common interface
4. **Extensibility**: New categories and commands can be easily added
5. **Backward Compatibility**: Existing scripts continue to work as before

### Usage

```bash
node scripts/master/master-toolkit.mjs <category> <command> [options]
```

### Categories

The master toolkit organizes scripts into logical categories:

- **icons**: Icon management tools
- **ui**: UI component management tools
- **config**: Configuration management tools
- **docs**: Documentation tools
- **cleanup**: Cleanup and maintenance tools
- **linting**: Code quality tools
- **db**: Database tools

### Help System

The master toolkit includes a comprehensive help system:

```bash
# Show general help
node scripts/master/master-toolkit.mjs help

# Show help for a specific category
node scripts/master/master-toolkit.mjs icons help

# Show help for a specific command
node scripts/master/master-toolkit.mjs icons audit --help
```

## Implementation Details

The master toolkit uses a central registry of script paths and categories. When a command is invoked, it:

1. Validates the category and command
2. Locates the appropriate script
3. Spawns a child process to execute the script
4. Passes any additional arguments to the script
5. Returns the exit code from the executed script

## Extending the Master Toolkit

To add a new category or command to the master toolkit:

1. Edit the `categories` object in `master-toolkit.mjs`
2. Add your category and associated commands
3. Ensure your scripts follow the consistent interface pattern
4. Update this README to document the new functionality

## Integration with npm Scripts

The master toolkit can be integrated with npm scripts in `package.json`:

```json
{
  "scripts": {
    "toolkit": "node scripts/master/master-toolkit.mjs",
    "icons": "node scripts/master/master-toolkit.mjs icons",
    "ui": "node scripts/master/master-toolkit.mjs ui"
  }
}
```

This allows for even more convenient usage:

```bash
npm run toolkit icons audit
npm run icons audit
``` 