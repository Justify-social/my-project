#!/bin/bash

# clean-lint.sh - Run the codebase lint cleaner with proper error handling

echo "🔍 Starting Codebase Lint Cleaning Process..."
echo "-------------------------------------------"

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed or not in PATH"
    echo "Please install Node.js version >=20.11.0"
    exit 1
fi

# Check Node version (script requires Node 20+)
NODE_VERSION=$(node -v | cut -d "v" -f 2 | cut -d "." -f 1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "⚠️  Warning: You're using Node.js v$(node -v)"
    echo "This script works best with Node.js v20.11.0 or higher"
    echo "Continue anyway? (y/n)"
    read -r response
    if [[ ! "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        echo "Operation cancelled"
        exit 0
    fi
fi

# Run the codebase lint cleaner
echo "Running lint cleaner..."
node scripts/linting-tools/codebase-lint-cleaner.mjs

# Check if the script executed successfully
if [ $? -eq 0 ]; then
    echo "✅ Lint cleaning process completed successfully!"
    echo "📝 Check docs/verification/lint-fix-progress/ for detailed reports"
else
    echo "❌ Lint cleaning process encountered errors"
    echo "Please check the output above for details"
    exit 1
fi

echo ""
echo "Next steps:"
echo "1. Review the lint status report"
echo "2. Fix any critical parsing errors manually"
echo "3. Run npm run lint-fix to fix remaining issues"
echo ""

exit 0 