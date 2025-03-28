#!/bin/bash

echo "Starting script organization process..."

# Create main scripts directory if it doesn't exist
mkdir -p scripts

# Create necessary subdirectories
mkdir -p scripts/components
mkdir -p scripts/linting
mkdir -p scripts/docs
mkdir -p scripts/utils
mkdir -p scripts/testing
mkdir -p scripts/icons
mkdir -p scripts/cleanup
mkdir -p scripts/db
mkdir -p scripts/build

# Move component-related scripts
echo "Moving component-related scripts..."
mv -f create-ui-component.sh scripts/components/ 2>/dev/null
mv -f find-duplicate-components.sh scripts/components/ 2>/dev/null
mv -f remove-duplicates.sh scripts/components/ 2>/dev/null
mv -f consolidate-components.sh scripts/components/ 2>/dev/null
mv -f cleanup-duplicates.sh scripts/components/ 2>/dev/null

# Move linting scripts
echo "Moving linting scripts..."
mv -f scripts/linting-tools/* scripts/linting/ 2>/dev/null
mv -f scripts/fixers/* scripts/linting/ 2>/dev/null
mv -f clean-lint.sh scripts/linting/ 2>/dev/null

# Move documentation scripts
echo "Moving documentation scripts..."
mv -f docs/verification/finalize-cleanup.sh scripts/docs/verification-cleanup.sh 2>/dev/null
mv -f docs/verification/cleanup-script.sh scripts/docs/verification-consolidate.sh 2>/dev/null
mv -f scripts/consolidated/documentation/* scripts/docs/ 2>/dev/null

# Move utility scripts
echo "Moving utility scripts..."
mv -f show_files.sh scripts/utils/ 2>/dev/null
mv -f scripts/consolidated/utils/* scripts/utils/ 2>/dev/null
mv -f scripts/consolidated/update-script-references.js scripts/utils/ 2>/dev/null
mv -f scripts/consolidated/check-script-imports.js scripts/utils/ 2>/dev/null
mv -f scripts/consolidated/create-indexes.js scripts/utils/ 2>/dev/null
mv -f scripts/consolidated/index.js scripts/utils/ 2>/dev/null
mv -f scripts/consolidated/reorganize-utils.js scripts/utils/ 2>/dev/null

# Move testing scripts
echo "Moving testing scripts..."
mv -f scripts/consolidated/testing/* scripts/testing/ 2>/dev/null

# Move icon scripts
echo "Moving icon scripts..."
mv -f scripts/consolidated/icons/* scripts/icons/ 2>/dev/null

# Move cleanup scripts
echo "Moving cleanup scripts..."
mv -f scripts/consolidated/cleanup/* scripts/cleanup/ 2>/dev/null
mv -f finalize-cleanup.sh scripts/cleanup/ 2>/dev/null
mv -f scripts/consolidated/consolidate-scripts.js scripts/cleanup/ 2>/dev/null
mv -f scripts/consolidated/remove-original-scripts.js scripts/cleanup/ 2>/dev/null
mv -f scripts/consolidated/implement-consolidation.js scripts/cleanup/ 2>/dev/null

# Move database scripts
echo "Moving database scripts..."
mv -f scripts/consolidated/db/* scripts/db/ 2>/dev/null

# Move build scripts
echo "Moving build scripts..."
mv -f scripts/consolidated/build/* scripts/build/ 2>/dev/null

# Create an index.md file documenting the script organization
echo "Creating documentation for scripts..."
cat > scripts/README.md << 'EOL'
# Scripts Directory

This directory contains organized scripts for various purposes in the project.

## Structure

- **components/**: Scripts for managing UI components
  - `create-ui-component.sh`: Creates new UI components with proper structure
  - `find-duplicate-components.sh`: Identifies duplicate component definitions
  - `remove-duplicates.sh`: Removes duplicate component files
  - `consolidate-components.sh`: Consolidates components into a cleaner structure
  - `cleanup-duplicates.sh`: Final cleanup after consolidation

- **linting/**: Scripts for code quality and linting
  - Various linting tools and fixers for addressing ESLint issues
  - Special rule fixers for common problems

- **docs/**: Documentation-related scripts
  - `verification-cleanup.sh`: Cleans up verification directory
  - `verification-consolidate.sh`: Consolidates verification documentation
  - Additional documentation generation and maintenance scripts

- **utils/**: Utility scripts
  - General purpose scripts and utilities
  - Import and reference management

- **testing/**: Testing-related scripts
  - Test data creation and verification
  - Component testing utilities
  - Migration scripts for testing-related components

- **icons/**: Icon management scripts
  - Scripts for icon structure organization
  - Icon validation and verification
  - Import path management for icons

- **cleanup/**: Cleanup utilities
  - General codebase cleanup scripts
  - Removal of deprecated and unused code
  - Consolidation scripts

- **db/**: Database-related scripts
  - Database migrations
  - Component migrations related to data
  
- **build/**: Build-related scripts
  - Scripts for managing the build process
  - Bundling configurations

## Usage

Most scripts can be executed directly:

```bash
# For shell scripts
cd /path/to/project
bash scripts/category/script-name.sh

# For JS scripts
node scripts/category/script-name.js
```

Some scripts may require specific arguments. Check the script header comments for usage details.
EOL

# Clean up empty directories
echo "Cleaning up empty directories..."
find scripts -type d -empty -not -path "scripts/build" -delete

echo "Script organization complete! All scripts have been moved to the appropriate directories in /scripts."
echo "A README.md file has been created to document the script organization."

# Check for any remaining scripts in the consolidated directory that weren't moved
remaining_files=$(find scripts/consolidated -type f -name "*.js" -o -name "*.sh" 2>/dev/null | wc -l)

if [ "$remaining_files" -gt 0 ]; then
  echo "Warning: Some scripts in the consolidated directory were not moved. Please check them manually:"
  find scripts/consolidated -type f -name "*.js" -o -name "*.sh" 2>/dev/null
fi 