#!/bin/bash

# Helper script for installing dependencies with legacy peer deps support
# This resolves the Cypress 14 + @clerk/testing peer dependency conflict

echo "🔧 Installing dependencies with legacy peer dependency resolution..."
echo "ℹ️  This resolves the conflict between Cypress 14.x and @clerk/testing 1.7.3"

# Install with legacy peer deps
npm install --legacy-peer-deps

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully!"
    echo ""
    echo "🧪 You can now run tests:"
    echo "  npm run test        # Unit & Integration tests"
    echo "  npm run cy:run      # Cypress E2E tests"
    echo "  npm run cy:open     # Open Cypress GUI"
    echo ""
    echo "🔍 For CI/CD, workflows have been updated to use --legacy-peer-deps automatically"
else
    echo "❌ Installation failed. Please check the output above for errors."
    exit 1
fi 