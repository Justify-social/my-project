#!/bin/bash

# Script to fix non-compliant imports in UI components
echo "=== Fixing Non-Compliant UI Component Imports ==="
echo "================================================="

# Directories to scan and fix
DIRS_TO_FIX=(
  "src/app"
  "src/components"
  "src/lib"
)

# List of imports to be fixed
# Format: "old_import_pattern|new_import_pattern"
IMPORT_FIXES=(
  "@/components/ui/button|@/components/ui"
  "@/components/ui/card|@/components/ui"
  "@/components/ui/tabs|@/components/ui"
  "@/components/ui/input|@/components/ui"
  "@/components/ui/select|@/components/ui"
  "@/components/ui/table|@/components/ui"
  "@/components/ui/theme-toggle|@/components/ui"
  "@/components/ui/alert|@/components/ui"
  "@/components/ui/badge|@/components/ui"
  "@/components/ui/avatar|@/components/ui"
  "@/components/ui/client/button-client|@/components/ui"
  "@/components/ui/client/card-client|@/components/ui"
)

# Count of fixed files
FIXED_COUNT=0
TOTAL_FILES=0

# Scan for non-compliant imports
echo "Scanning for non-compliant imports..."
for dir in "${DIRS_TO_FIX[@]}"; do
  if [ -d "$dir" ]; then
    # Find all TypeScript/TSX files
    TS_FILES=$(find "$dir" -type f \( -name "*.ts" -o -name "*.tsx" \) | grep -v "node_modules" | grep -v "tests")
    
    for file in $TS_FILES; do
      # Skip index files and type definition files
      if [[ "$file" == *"/index.ts"* || "$file" == *".d.ts" ]]; then
        continue
      fi
      
      NEEDS_FIX=false
      
      # Check if file has non-compliant imports
      for fix in "${IMPORT_FIXES[@]}"; do
        OLD_IMPORT=$(echo "$fix" | cut -d'|' -f1)
        if grep -q "$OLD_IMPORT" "$file"; then
          NEEDS_FIX=true
          break
        fi
      done
      
      # Skip file if it already imports from index and doesn't need fixes
      if ! $NEEDS_FIX && grep -q "@/components/ui'" "$file" || grep -q '@/components/ui"' "$file"; then
        continue
      fi
      
      ((TOTAL_FILES++))
      
      # Create backup
      cp "$file" "$file.bak"
      
      # Apply fixes
      for fix in "${IMPORT_FIXES[@]}"; do
        OLD_IMPORT=$(echo "$fix" | cut -d'|' -f1)
        NEW_IMPORT=$(echo "$fix" | cut -d'|' -f2)
        
        # Replace imports
        sed -i.tmp "s|$OLD_IMPORT|$NEW_IMPORT|g" "$file"
      done
      
      # Check if file was modified
      if ! diff -q "$file" "$file.bak" > /dev/null 2>&1; then
        echo "✅ Fixed imports in: $file"
        ((FIXED_COUNT++))
      else
        # Restore backup if no changes were made
        mv "$file.bak" "$file"
      fi
      
      # Clean up temp files
      rm -f "$file.tmp" "$file.bak" 2>/dev/null
    done
  fi
done

echo -e "\n=== Import Fix Summary ==="
echo "Scanned $TOTAL_FILES files."
echo "Fixed $FIXED_COUNT files."
echo "========================="

if [ $FIXED_COUNT -gt 0 ]; then
  echo "Next steps:"
  echo "1. Run 'bash scripts/ui/validate-ssot.sh' to check if all issues are resolved"
  echo "2. Test the application to ensure everything still works"
else
  echo "No files needed fixing."
fi 