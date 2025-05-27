#!/bin/bash

# Documentation Update Script
# Updates installation instructions across all documentation files

set -e

echo "📚 Updating installation documentation across codebase..."

# Files to update
README_FILES=(
    "README.md"
    "docs/onboarding/README.md"
    "docs/deployment/README.md"
    "docs/troubleshooting/README.md"
)

# Create single backup of original files (SSOT - one backup per file)
echo "💾 Creating/updating backups..."
for file in "${README_FILES[@]}"; do
    if [ -f "$file" ]; then
        # Remove any existing backup to maintain SSOT
        rm -f "$file.backup"
        # Create single backup without timestamp for SSOT compliance
        cp "$file" "$file.backup"
        echo "  Backed up: $file → $file.backup"
    fi
done

# Update README.md
echo "📝 Updating README.md..."
if [ -f "README.md" ]; then
    sed -i.tmp 's/npm install$/npm install --legacy-peer-deps/' README.md
    rm README.md.tmp 2>/dev/null || true
    
    # Add installation note if not already present
    if ! grep -q "legacy-peer-deps" README.md; then
        echo "" >> README.md
        echo "## 🔧 Installation Note" >> README.md
        echo "" >> README.md
        echo "This project currently requires \`--legacy-peer-deps\` due to a dependency conflict between Cypress 14.x and @clerk/testing." >> README.md
        echo "" >> README.md
        echo "\`\`\`bash" >> README.md
        echo "# Use the helper script (recommended)" >> README.md
        echo "./scripts/setup/install-deps.sh" >> README.md
        echo "" >> README.md
        echo "# Or install manually" >> README.md  
        echo "npm install --legacy-peer-deps" >> README.md
        echo "\`\`\`" >> README.md
        echo "" >> README.md
    fi
fi

# Update onboarding docs
echo "📝 Updating onboarding documentation..."
if [ -f "docs/onboarding/README.md" ]; then
    sed -i.tmp 's/npm install$/npm install --legacy-peer-deps/' docs/onboarding/README.md
    sed -i.tmp 's/`npm install`/`npm install --legacy-peer-deps`/' docs/onboarding/README.md
    rm docs/onboarding/README.md.tmp 2>/dev/null || true
fi

# Update deployment docs
echo "📝 Updating deployment documentation..."  
if [ -f "docs/deployment/README.md" ]; then
    sed -i.tmp 's/npm ci$/npm ci --legacy-peer-deps/' docs/deployment/README.md
    sed -i.tmp 's/run: npm ci/run: npm ci --legacy-peer-deps/' docs/deployment/README.md
    rm docs/deployment/README.md.tmp 2>/dev/null || true
fi

# Update troubleshooting docs
echo "📝 Updating troubleshooting documentation..."
if [ -f "docs/troubleshooting/README.md" ]; then
    sed -i.tmp 's/npm install$/npm install --legacy-peer-deps/' docs/troubleshooting/README.md
    sed -i.tmp 's/Run: npm install/Run: npm install --legacy-peer-deps/' docs/troubleshooting/README.md
    rm docs/troubleshooting/README.md.tmp 2>/dev/null || true
fi

echo "✅ Documentation update complete!"
echo ""
echo "📋 Updated files:"
for file in "${README_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ⚠️ $file (not found)"
    fi
done

echo ""
echo "💡 Next steps:"
echo "  1. Review the updated documentation"
echo "  2. Commit the changes"
echo "  3. Update team on new installation requirements"
echo ""
echo "🧹 To remove backup files and maintain lean codebase:"
echo "  rm -f README.md.backup docs/*/README.md.backup" 