#!/bin/bash

# Script to update imports that referenced the removed icon-utils.ts file
# This ensures all code now uses the consolidated IconUtils.ts

echo "Updating icon utility imports..."

# Find all files that import from the old location
find src -type f -name "*.ts" -o -name "*.tsx" | xargs grep -l "from ['\"].*icon-utils['\"]" | while read -r file; do
  echo "Updating imports in: $file"
  
  # Replace imports from src/lib/icon-utils with the new path
  sed -i '' 's|from ".*icon-utils"|from "@/components/ui/atoms/icon/IconUtils"|g' "$file"
  sed -i '' "s|from '.*icon-utils'|from '@/components/ui/atoms/icon/IconUtils'|g" "$file"
  
  # If importing specific functions, update to use the IconUtils export
  sed -i '' 's|{ \(.*\) } from ".*icon-utils"|{ \1 } from "@/components/ui/atoms/icon/IconUtils"|g' "$file"
  sed -i '' "s|{ \(.*\) } from '.*icon-utils'|{ \1 } from '@/components/ui/atoms/icon/IconUtils'|g" "$file"
done

echo "Import updates completed!" 