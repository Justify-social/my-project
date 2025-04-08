#!/bin/bash

# Script to fix Icon import paths across the project
# Created as part of Task 1.4 in the UI Rendering Plan
# This script finds all files with incorrect Icon imports and replaces them

echo "Starting Icon import path fixes..."

# Find all files with the incorrect import pattern
FILES=$(grep -r "import { Icon } from '@/components/ui/icon'" --include="*.tsx" --include="*.ts" src/ | grep -v "\/\/" | grep -v "index\.ts" | grep -v "index\.tsx" | cut -d':' -f1)

# Count the files that need to be fixed
COUNT=$(echo "$FILES" | wc -l)
echo "Found $COUNT files with incorrect Icon imports"

# Process each file
for FILE in $FILES
do
  echo "Fixing imports in $FILE"
  # Use sed to replace the import pattern
  sed -i '' "s/import { Icon } from '@\/components\/ui\/icon'/import { Icon } from '@\/components\/ui\/icon\/icon'/" "$FILE"
done

echo "Import path fixes completed! Please review the changes."
echo "Run ESLint to verify: npm run lint" 