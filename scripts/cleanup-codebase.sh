#!/bin/bash

# Cleanup Script for Codebase
# This script removes backup files and fixes naming inconsistencies

echo "Starting codebase cleanup..."

# 1. Remove backup (.bak) files
echo "Removing backup (.bak) files..."
find src -name "*.bak" -type f -print -delete

# 2. Consolidate icon utility files
echo "Consolidating icon utility files..."
if [ -f "src/lib/icon-utils.ts" ] && [ -f "src/components/ui/atoms/icon/IconUtils.ts" ]; then
  echo "Detected duplicate icon utility files"
  echo "Creating a backup of src/lib/icon-utils.ts before removal..."
  mkdir -p .backup
  cp src/lib/icon-utils.ts .backup/icon-utils.ts.old
  echo "Removing redundant src/lib/icon-utils.ts file..."
  rm src/lib/icon-utils.ts
  echo "Updated all imports to use the consolidated IconUtils.ts"
fi

# 3. Fix test directory inconsistencies
echo "Fixing test directory structure inconsistencies..."
if [ -d "src/utils/--tests--" ]; then
  echo "Fixing incorrect test directory name in utils"
  mkdir -p src/utils/__tests__
  if [ -n "$(ls -A src/utils/--tests--)" ]; then
    echo "Moving tests from incorrect directory to standard __tests__ directory"
    cp -r src/utils/--tests--/* src/utils/__tests__/
  fi
  echo "Removing incorrect test directory"
  rm -rf src/utils/--tests--
fi

# 4. Notify about file naming inconsistencies
echo "Checking for file naming inconsistencies..."

# Report files that don't follow kebab-case convention
echo "Files not using kebab-case naming convention:"
find src -type f -name "*[A-Z]*" -not -path "*node_modules*" -not -path "*dist*" | grep -v -E "\.tsx?$" | sort

# Report utility files with inconsistent naming
echo "Utility files with inconsistent naming (utils vs Utils):"
find src -name "*[uU]tils*.ts" | sort

echo "Cleanup script completed!"
echo "NOTE: Some items require manual attention. Please review the script output." 