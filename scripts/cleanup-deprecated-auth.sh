#!/bin/bash

# SSOT Cleanup Script - Remove Deprecated Authentication Patterns
# Usage: ./scripts/cleanup-deprecated-auth.sh

echo "🧹 SSOT Cleanup: Removing Deprecated Authentication Patterns"
echo "================================================================="

# Files that need updating
declare -a files=(
    "config/cypress/e2e/shared/performance-monitoring.cy.js"
    "config/cypress/e2e/brand-lift/brand-lift-comprehensive.cy.js" 
    "config/cypress/e2e/shared/ssot-demo.cy.js"
    "config/cypress/e2e/dashboard/dashboard-with-page-objects.cy.js"
    "config/cypress/e2e/campaigns/campaigns-with-page-objects.cy.js"
    "config/cypress/e2e/admin/admin-tools-comprehensive.cy.js"
    "config/cypress/e2e/marketplace/marketplace-minimal.cy.js"
    "config/cypress/e2e/marketplace/marketplace-comprehensive.cy.js"
    "config/cypress/e2e/settings/settings-comprehensive.cy.js"
)

echo "📋 Files requiring SSOT cleanup:"
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✓ $file"
    else
        echo "  ❌ $file (not found)"
    fi
done

echo ""
echo "🔧 Required changes for each file:"
echo "1. Add: import { setupClerkTestingToken } from '@clerk/testing/cypress';"
echo "2. Replace: TestSetup.setupAuthenticatedTest() calls"
echo "3. Use: setupClerkTestingToken() directly in test methods"
echo ""

echo "📖 Example pattern:"
echo "Before:"
echo "  beforeEach(() => {"
echo "    TestSetup.setupAuthenticatedTest();"
echo "  });"
echo ""
echo "After:"
echo "  beforeEach(() => {"
echo "    cy.clearLocalStorage();"
echo "    cy.clearCookies();"
echo "  });"
echo ""
echo "  it('test name', () => {"
echo "    setupClerkTestingToken();"
echo "    cy.visit('/protected-route');"
echo "  });"
echo ""

echo "✅ SSOT compliance achieved when all files follow this pattern!"
echo "🚀 Ready to proceed with Phase 4 implementation!" 