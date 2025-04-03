# shadcn/ui Integration Scripts

This directory contains scripts specific to the integration of [shadcn/ui](https://ui.shadcn.com/) components in the project.

## Package Details

The `package.json` in this directory defines a separate npm package for shadcn/ui integration utilities. These scripts help with installing, configuring, and managing shadcn components.

## Usage

This is primarily a utility package and is not intended to be used directly. The functionality from this package has been integrated into the main project scripts, particularly in the `ui` category.

To access shadcn-related functionality, use the master toolkit:

```bash
node scripts/master/master-toolkit.mjs ui help
```

## Integration with Project Architecture

The shadcn scripts package has been organized into its own directory to maintain a clean separation of concerns. This allows the shadcn-specific code to evolve independently of the main project scripts.

For more information on UI component scripts, see the [UI scripts README](../ui/README.md). 