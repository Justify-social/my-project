#!/bin/bash

# SSOT Violations Fix Script - Automatic Pattern Updates
# Usage: ./scripts/fix-ssot-violations.sh

echo "🔧 SSOT Violations Fix: Updating Deprecated Authentication Patterns"
echo "======================================================================"

# Files that need immediate fixing
declare -a critical_files=(
    "config/cypress/e2e/settings/settings-comprehensive.cy.js"
    "config/cypress/e2e/marketplace/marketplace-comprehensive.cy.js"
    "config/cypress/e2e/marketplace/marketplace-minimal.cy.js"
    "config/cypress/e2e/admin/admin-tools-comprehensive.cy.js"
    "config/cypress/e2e/brand-lift/brand-lift-comprehensive.cy.js"
    "config/cypress/e2e/shared/ssot-demo.cy.js"
    "config/cypress/e2e/shared/performance-monitoring.cy.js"
    "config/cypress/e2e/campaigns/campaigns-with-page-objects.cy.js"
)

echo "🚨 Fixing critical SSOT violations in ${#critical_files[@]} files..."

fixed_count=0
skipped_count=0

for file in "${critical_files[@]}"; do
    if [ -f "$file" ]; then
        echo "📝 Processing: $file"
        
        # Add import if not present
        if ! grep -q "setupClerkTestingToken" "$file"; then
            echo "  ✓ Adding setupClerkTestingToken import"
            # Add import after existing imports
            sed -i '' '1a\
import { setupClerkTestingToken } from '\''@clerk/testing/cypress'\'';
' "$file"
        fi
        
        # Remove deprecated setupAuthenticatedTest calls
        if grep -q "TestSetup.setupAuthenticatedTest()" "$file"; then
            echo "  ✓ Removing deprecated TestSetup.setupAuthenticatedTest() calls"
            sed -i '' '/TestSetup\.setupAuthenticatedTest();/d' "$file"
        fi
        
        echo "  ✅ Fixed: $file"
        ((fixed_count++))
    else
        echo "  ❌ File not found: $file"
        ((skipped_count++))
    fi
done

echo ""
echo "📊 Fix Summary:"
echo "  ✅ Files fixed: $fixed_count"
echo "  ❌ Files skipped: $skipped_count"
echo ""

echo "⚠️  MANUAL ACTION REQUIRED:"
echo "After running this script, you need to manually add setupClerkTestingToken() calls"
echo "to each test method that accesses protected routes."
echo ""
echo "Pattern for each test:"
echo "  it('test name', () => {"
echo "    setupClerkTestingToken();"
echo "    // rest of test..."
echo "  });"
echo ""

echo "🧪 VERIFICATION:"
echo "Run this command to verify fixes:"
echo "  grep -r 'TestSetup.setupAuthenticatedTest' config/cypress/e2e/ || echo 'All deprecated calls removed!'"
echo ""

echo "🚀 Once fixed, run tests to verify:"
echo "  npx cypress run --spec 'config/cypress/e2e/auth/auth-official-simple.cy.js'"
echo ""

echo "✅ SSOT violation fixes applied!"
echo "📋 Next: Review SSOT-COMPLIANCE-REPORT.md for remaining tasks" 