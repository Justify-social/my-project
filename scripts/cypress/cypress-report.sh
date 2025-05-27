#!/bin/bash

# Cypress Report Generation Script
# Replaces complex inline bash logic from package.json cy:report script

set -e  # Exit on any error

REPORTS_DIR="config/cypress/reports"
COMBINED_REPORT="$REPORTS_DIR/combined-report.json"

echo "🔍 Cypress Report Generation"
echo "Reports directory: $REPORTS_DIR"

# Ensure reports directory exists
mkdir -p "$REPORTS_DIR"

# Check if any individual test reports exist (exclude combined-report.json)
INDIVIDUAL_REPORTS=$(find "$REPORTS_DIR" -name "*.json" -not -name "combined-report.json" 2>/dev/null || true)

if [ -n "$INDIVIDUAL_REPORTS" ]; then
    echo "📊 Found individual JSON reports, merging..."
    echo "Reports to merge: $(echo $INDIVIDUAL_REPORTS | wc -w | tr -d ' ') files"
    
    # Merge reports (exclude combined-report.json)
    if find "$REPORTS_DIR" -name "*.json" -not -name "combined-report.json" -exec npx mochawesome-merge {} + > "$COMBINED_REPORT"; then
        echo "✅ Reports merged successfully"
        
        # Generate HTML report
        if npx marge "$COMBINED_REPORT" --reportDir "$REPORTS_DIR" --inline; then
            echo "✅ HTML report generated successfully"
            echo "📄 Report available at: $REPORTS_DIR/combined-report.html"
        else
            echo "⚠️ Failed to generate HTML report, but JSON report is available"
            exit 1
        fi
    else
        echo "❌ Failed to merge reports"
        exit 1
    fi
else
    echo "ℹ️ No JSON reports found in $REPORTS_DIR"
    echo "This typically means either:"
    echo "  • No tests were executed"
    echo "  • Tests failed before completion" 
    echo "  • mochawesome reporter not configured properly"
    
    # Create empty report for consistency
    echo '{"stats":{"failures":0,"passes":0,"pending":0,"skipped":0,"tests":0},"results":[]}' > "$COMBINED_REPORT"
    echo "📄 Created empty report for consistency"
fi

echo "✅ Cypress report generation complete" 