#!/bin/bash

echo "Finalizing script organization..."

# Create a docs directory in scripts if it doesn't exist
mkdir -p scripts/docs/consolidated

# Move remaining documentation files
echo "Moving remaining consolidated documentation files..."
mv -f scripts/consolidated/consolidation-summary.json scripts/docs/consolidated/
mv -f scripts/consolidated/README.md scripts/docs/consolidated/
mv -f scripts/consolidated/script-redirects.json scripts/docs/consolidated/
mv -f scripts/consolidated/import-issues.json scripts/docs/consolidated/
mv -f scripts/consolidated/scripts-consolidation-report.md scripts/docs/consolidated/

# Clean up empty directories
echo "Cleaning up empty directories..."
find scripts -type d -empty -delete

# Move the organization script itself to scripts directory
echo "Moving organization scripts to scripts/utils..."
mkdir -p scripts/utils/organization
mv -f organize-scripts.sh scripts/utils/organization/
mv -f finalize-script-organization.sh scripts/utils/organization/ 2>/dev/null

echo "Creating a simple index file for consolidated directory..."
mkdir -p scripts/docs/consolidated
cat > scripts/docs/consolidated/index.js << 'EOL'
/**
 * Script Consolidation Documentation
 * 
 * This directory contains information about the script consolidation process.
 * All scripts have been organized into appropriate directories in the main scripts folder.
 */

console.log('Script documentation is available in the scripts/docs/consolidated directory');
EOL

echo "Organization complete! All scripts have been properly moved to the /scripts directory."
echo "Documentation files are available in scripts/docs/consolidated."

# List the final directory structure
echo -e "\nFinal directory structure:"
find scripts -type d -not -path "*/node_modules/*" | sort 