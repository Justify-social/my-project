#!/bin/bash

# SSOT Validation Script
echo "=== UI Component SSOT Validation ==="
echo "===================================="

# Directories to check for non-compliant imports
DIRS_TO_CHECK=(
  "src/app"
  "src/components"
  "src/layouts"
  "src/lib"
)

# Excluded pattern for imports
EXCLUDED_IMPORTS="\/index'|\/index\"|\/utils\/|\/utils'|\/types\/|\/types'"

# Components to check for in index.ts
COMPONENTS_DIR="src/components/ui"

# Flag to track if validation passed
VALIDATION_PASSED=true

# 1. Check for non-compliant imports (direct imports of component files)
echo "1. Checking for non-compliant imports..."
NON_COMPLIANT=false

for dir in "${DIRS_TO_CHECK[@]}"; do
  if [ -d "$dir" ]; then
    # Find .tsx and .ts files with direct imports from components/ui
    VIOLATIONS=$(grep -r --include="*.tsx" --include="*.ts" -l "@/components/ui/[^\"']*['\"]" "$dir" | grep -v -E "$EXCLUDED_IMPORTS" || true)
    
    if [ -n "$VIOLATIONS" ]; then
      echo "❌ SSOT violations found in $dir:"
      echo "$VIOLATIONS" | while read -r file; do
        IMPORT_LINES=$(grep -n "@/components/ui/[^\"']*['\"]" "$file" | grep -v -E "$EXCLUDED_IMPORTS" || true)
        echo "$IMPORT_LINES"
      done
      echo ""
      NON_COMPLIANT=true
      VALIDATION_PASSED=false
    fi
  fi
done

if [ "$NON_COMPLIANT" = true ]; then
  echo "🔍 Fix these by importing from the main index instead:"
  echo "   import { ComponentName } from '@/components/ui';"
  echo ""
else
  echo "✅ No direct import violations found in validated directories"
  echo ""
fi

# 2. Check if all components are exported from index.ts
echo "2. Checking for components missing from index.ts..."
MISSING_EXPORTS=false

# Get the list of .tsx files in the components directory
COMPONENT_FILES=$(find "$COMPONENTS_DIR" -maxdepth 1 -name "*.tsx" -not -name "*.stories.tsx" -not -name "*.test.tsx" | sort)

# Check each component file
for component in $COMPONENT_FILES; do
  filename=$(basename "$component")
  component_name="${filename%.*}"
  
  # Skip utils and test files
  if [[ "$component_name" == *"utils"* || "$component_name" == *"test"* || "$component_name" == *"types"* ]]; then
    continue
  fi
  
  # Look for export of this component in index.ts
  if ! grep -q "$component_name" "$COMPONENTS_DIR/index.ts"; then
    if [ "$MISSING_EXPORTS" = false ]; then
      echo "❌ Components missing from index.ts:"
      MISSING_EXPORTS=true
      VALIDATION_PASSED=false
    fi
    echo "   - $component_name"
  fi
done

if [ "$MISSING_EXPORTS" = false ]; then
  echo "✅ All components are properly exported"
  echo ""
else
  echo ""
  echo "🔍 Add exports for these components to $COMPONENTS_DIR/index.ts"
  echo ""
fi

# 3. Check for duplicate component definitions
echo "3. Checking for duplicate component definitions..."
DUPLICATES=false

# Find component function declarations
for component_type in "function" "const"; do
  COMPONENT_DEFS=$(grep -r --include="*.tsx" "${component_type} [A-Z][a-zA-Z0-9]*" "$COMPONENTS_DIR" | grep -v "test\|stories\|example" || true)
  
  # Count occurrences of component names
  COUNTS=$(echo "$COMPONENT_DEFS" | awk -F'[ (:]' '{for (i=1; i<=NF; i++) if ($i ~ /^[A-Z][a-zA-Z0-9]*$/) print $i}' | sort | uniq -c | sort -nr)
  
  # Find duplicates (count > 1)
  DUPLICATE_COMPONENTS=$(echo "$COUNTS" | awk '$1 > 1 {print $2}')
  
  if [ -n "$DUPLICATE_COMPONENTS" ]; then
    echo "❌ Duplicate component definitions found:"
    for dup in $DUPLICATE_COMPONENTS; do
      echo "   - $dup defined multiple times:"
      grep -r --include="*.tsx" "${component_type} ${dup}[ ({]" "$COMPONENTS_DIR" | grep -v "test\|stories\|example"
    done
    DUPLICATES=true
    VALIDATION_PASSED=false
  fi
done

if [ "$DUPLICATES" = false ]; then
  echo "✅ No duplicate component definitions found"
  echo ""
fi

# Output final validation result
if [ "$VALIDATION_PASSED" = true ]; then
  echo "✅ SSOT validation complete - All checks passed!"
  exit 0
else
  echo "❌ SSOT validation failed - Please fix the issues above"
  exit 1
fi 