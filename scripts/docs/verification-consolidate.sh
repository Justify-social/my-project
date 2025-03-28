#!/bin/bash

# Script to clean up and consolidate files in the verification directory
# Created by: Claude 3.7 Sonnet
# Date: 2025-03-27

echo "Starting verification directory cleanup..."

# Create a temporary directory for merged files
mkdir -p docs/verification/temp

# 1. Merge lint-fix-progress files into a single report
echo "Merging lint fix progress files..."
cat docs/verification/lint-fix-progress/lint-status-report.md > docs/verification/temp/consolidated-lint-report.md
echo -e "\n\n## Comprehensive Linting Audit\n" >> docs/verification/temp/consolidated-lint-report.md
cat docs/verification/lint-fix-progress/comprehensive-linting-audit.md | grep -v "^#" >> docs/verification/temp/consolidated-lint-report.md
echo -e "\n\n## Action Plan\n" >> docs/verification/temp/consolidated-lint-report.md
cat docs/verification/lint-fix-progress/action-plan.md | grep -v "^#" >> docs/verification/temp/consolidated-lint-report.md

# 2. Merge main verification directory files
echo "Merging main verification files..."
cat docs/verification/lint-strategy.md > docs/verification/temp/linting-master-guide.md
echo -e "\n\n## Current Lint Priorities\n" >> docs/verification/temp/linting-master-guide.md
cat docs/verification/current-lint-priorities.md | grep -v "^#" >> docs/verification/temp/linting-master-guide.md
echo -e "\n\n## Automated Fixing Strategy\n" >> docs/verification/temp/linting-master-guide.md
cat docs/verification/automated-fixing-strategy.md | grep -v "^#" >> docs/verification/temp/linting-master-guide.md

# 3. Consolidate implementation guides
echo "Consolidating implementation guides..."
cat docs/verification/implementation/lint-cleanup-guidance.md > docs/verification/temp/implementation-guide.md
echo -e "\n\n## Bulk Fix Guide\n" >> docs/verification/temp/implementation-guide.md
cat docs/verification/implementation/bulk-fix-guide.md | grep -v "^#" >> docs/verification/temp/implementation-guide.md
echo -e "\n\n## Manual Fix Guide\n" >> docs/verification/temp/implementation-guide.md
cat docs/verification/implementation/manual-fix-guide.md | grep -v "^#" >> docs/verification/temp/implementation-guide.md

# 4. Consolidate progress reports
echo "Consolidating progress reports..."
cp docs/verification/progress-report.md docs/verification/temp/progress-report.md
cp docs/verification/tracking/latest-report.md docs/verification/temp/latest-status.md
cp docs/verification/tracking/baselines/latest.json docs/verification/temp/latest-baseline.json

# 5. Update README with new structure
echo "Updating README..."
cat > docs/verification/temp/README.md << 'EOL'
# ESLint Cleanup Documentation

This directory contains consolidated documentation for our ESLint cleanup project.

## Main Documentation Files

1. [**Linting Master Guide**](./linting-master-guide.md)
   - Comprehensive linting strategy
   - Current priorities
   - Automated fixing approach
   
2. [**Implementation Guide**](./implementation-guide.md)
   - Lint cleanup guidance
   - Bulk fixing instructions
   - Manual fixing instructions

3. [**Consolidated Lint Report**](./consolidated-lint-report.md)
   - Current status and statistics
   - Comprehensive audit results
   - Action plan going forward

4. [**Progress Report**](./progress-report.md)
   - Timeline of cleanup progress
   - Key milestones and achievements

## Quick References

### Current Status Summary
- See [Latest Status](./latest-status.md) for current metrics
- Baseline data available in [latest-baseline.json](./latest-baseline.json)

### Key Commands

```bash
# Check current lint status
node scripts/consolidated/cleanup/tracking-summary.js

# Fix specific files
node scripts/consolidated/linting/lint-fixer.js --file [filepath]

# Run ESLint on specific files
npx eslint --config eslint.config.mjs [filepath]
```

## Contributing

When fixing lint issues, please:
1. Document the changes you made
2. Update the progress report
3. Test thoroughly before committing
4. Follow the established patterns in similar files
EOL

# 6. Create a new clean directory structure
echo "Creating clean directory structure..."
mkdir -p docs/verification/clean
mv docs/verification/temp/README.md docs/verification/clean/
mv docs/verification/temp/linting-master-guide.md docs/verification/clean/
mv docs/verification/temp/implementation-guide.md docs/verification/clean/
mv docs/verification/temp/consolidated-lint-report.md docs/verification/clean/
mv docs/verification/temp/progress-report.md docs/verification/clean/
mv docs/verification/temp/latest-status.md docs/verification/clean/
mv docs/verification/temp/latest-baseline.json docs/verification/clean/

# Create archives directory for historical records
mkdir -p docs/verification/clean/archives
cp docs/verification/tracking/baselines/baseline-*.json docs/verification/clean/archives/
cp docs/verification/tracking/progress-report-*.md docs/verification/clean/archives/

# 7. Create syntax error log in clean directory
echo "Creating syntax error log..."
cat docs/verification/syntax-error-fixes.md > docs/verification/clean/syntax-error-log.md
echo -e "\n\n## Progress Summary\n" >> docs/verification/clean/syntax-error-log.md
cat docs/verification/syntax-error-progress-summary.md | grep -v "^#" >> docs/verification/clean/syntax-error-log.md

# 8. Finalize
echo "Cleanup complete!"
echo "New files are in docs/verification/clean/"
echo "Review the files and then run:"
echo "rm -rf docs/verification/{lint-fix-progress,implementation,tracking,temp}"
echo "mv docs/verification/clean/* docs/verification/"
echo "rmdir docs/verification/clean"
echo "rm docs/verification/cleanup-script.sh"

# Temporary files to be reviewed and potentially deleted:
cat > docs/verification/temp/deprecated-files.txt << EOL
docs/verification/eslint-report.md
docs/verification/linting-plan-summary.md
docs/verification/lint-status-verification.md
docs/verification/lint-execution-plan.md
docs/verification/lint-error-report.md
docs/verification/lint-status-implementation-plan.md
docs/verification/implementation/script-fix-report.md
docs/verification/implementation/lint-status-assessment.md
docs/verification/tracking/README.md
docs/verification/lint-fix-progress/lint-audit.md
EOL

echo "Check docs/verification/temp/deprecated-files.txt for files that may be safely removed." 