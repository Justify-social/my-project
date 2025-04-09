# Project Scripts

This directory contains utility and automation scripts for the project. For a high-level overview for documentation readers, see `/docs/scripts/README.md`.

## Master Toolkit (`master/`)

A unified command-line interface, `master-toolkit.mjs`, provides centralised access to many scripts. Run it with `help` for available commands:

```bash
node scripts/master/master-toolkit.mjs help
```

See `scripts/master/README.md` for detailed usage.

## Directory Structure & Purpose

Scripts are organised into the following subdirectories:

*   `cleanup/`: Scripts for codebase cleanup and maintenance (e.g., `cleanup-codebase.sh`).
*   `components/`: Scripts related to component generation or management.
*   `config/`: Scripts for validating or managing the configuration in `/config` (e.g., `validate-config.js`).
*   `icons/`: Icon management (downloading, auditing, registry generation).
*   `linting/`: Code style and linting related utilities.
*   `master/`: The Master Toolkit script and its documentation.
*   `migration/`: Scripts used for codebase migrations or specific refactoring tasks (e.g., `fix-legacy-ui-paths.js`).
*   `testing/`: Scripts related to test setup or standardisation (e.g., `standardize-tests.sh`).
*   `tree-shake/`: Scripts for analysing or managing unused code.
*   `ui/`: UI component specific scripts (e.g., validation, analysis, backups).
*   `utils/`: General utility scripts supporting other categories.
*   `validation/`: General validation scripts (e.g., `validate-navigation-paths.js`).

Refer to the `README.md` within each subdirectory (if present) for details on its specific scripts and usage.

## Usage

While the Master Toolkit is preferred, individual scripts can often be run directly:

```bash
node scripts/<category>/<script-name>.mjs [options]
# or for shell scripts:
./scripts/<category>/<script-name>.sh [options]
```

Check individual script files or their READMEs for specific usage instructions.

## Contributing

When adding new scripts:

1.  Place the script in the most relevant subdirectory.
2.  Prefer `.mjs` for Node scripts (ES Modules).
3.  Update or create a `README.md` in the subdirectory explaining the script.
4.  Consider integrating the script into the Master Toolkit if appropriate.
5.  Ensure consistent command-line interfaces and error handling.
