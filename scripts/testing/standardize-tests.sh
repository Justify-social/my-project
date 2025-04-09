#!/bin/bash

# Test standardization script
# Identifies test files that don't follow the standard naming and location pattern

echo "Analyzing test file structure..."

# Define our standard naming conventions
TEST_SUFFIX=".test.tsx"
TEST_DIR="__tests__"

# 1. Find test files not in a __tests__ directory
echo "Test files outside standard __tests__ directories:"
find src -name "*.test.*" -not -path "*/__tests__/*" -not -path "*/node_modules/*" | sort

# 2. Find test files without the standard .test.tsx extension
echo -e "\nTest files not using standard .test.tsx extension:"
find src -path "*/__tests__/*" -name "*.ts" -o -name "*.tsx" | grep -v "$TEST_SUFFIX" | sort

# 3. Find inconsistent test directory names
echo -e "\nPotentially inconsistent test directories:"
find src -type d -name "*test*" -not -name "$TEST_DIR" -not -path "*/node_modules/*" | sort

# 4. Recommend a standardized approach
echo -e "\nRECOMMENDATION:"
echo "To maintain consistency across the codebase, follow these standards:"
echo "- Place tests in a __tests__ directory adjacent to the code being tested"
echo "- Use .test.tsx extension for test files (or .test.ts for non-component tests)"
echo "- Keep test files close to the implementation they're testing"
echo "- For each file foo.tsx, create a corresponding test file __tests__/foo.test.tsx"

echo -e "\nExample:"
echo "src/components/ui/atoms/button/"
echo "├── Button.tsx"
echo "├── index.ts"
echo "└── __tests__/"
echo "    └── Button.test.tsx" 