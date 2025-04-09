# Scripts

This directory contains various utility and automation scripts used throughout the project.

## Script Organisation

The scripts directory has been organised with a master toolkit architecture for centralised access:

### Master Toolkit
- Located at: `scripts/master/master-toolkit.mjs` (Verification needed if this path is still accurate)
- Provides a unified interface for all scripts using a category-command pattern
- Documentation: `scripts/master/README.md` (Verification needed)

### Script Categories
(Note: Verify these categories against the actual `scripts/` directory)
- **icons**: Icon management scripts (`scripts/icons/`)
- **ui**: UI component scripts (`scripts/ui/`)
- **config**: Configuration scripts (`scripts/config/`) 
- **docs**: Documentation scripts (`scripts/docs/`)
- **cleanup**: Cleanup utilities (`scripts/cleanup/`)
- **utils**: Utility scripts (`scripts/utils/`)

### Consolidated Scripts
- Location: `scripts/consolidated/`
- Purpose: Single source of truth for scripts that were previously duplicated
- Each script directory should include detailed documentation in README.md files. 