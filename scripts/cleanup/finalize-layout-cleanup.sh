#!/bin/bash

# Script to finalize layout directory cleanup
# - Fixes remaining import issues
# - Copies necessary files from layout to layouts
# - Updates imports in client-layout.tsx
# - Makes layout directory safe to delete

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}==============================================${NC}"
echo -e "${CYAN}      FINALIZING LAYOUT DIRECTORY CLEANUP     ${NC}"
echo -e "${CYAN}==============================================${NC}"
echo

# Create backup directory
BACKUP_DIR="temp/layout_final_cleanup_backup"
mkdir -p "$BACKUP_DIR"
echo -e "${BLUE}Created backup directory: $BACKUP_DIR${NC}"

# Copy client-layout.example.tsx to layouts directory
if [ -f "src/components/layout/client-layout.example.tsx" ]; then
  echo -e "${BLUE}Copying client-layout.example.tsx to layouts directory${NC}"
  cp "src/components/layout/client-layout.example.tsx" "src/components/layouts/"
  cp "src/components/layout/client-layout.example.tsx" "${BACKUP_DIR}/"
  echo -e "${GREEN}✓ Copied client-layout.example.tsx to layouts directory${NC}"
else
  echo -e "${RED}✗ client-layout.example.tsx not found in layout directory${NC}"
fi

# Fix import in layouts/client-layout.tsx
echo -e "${BLUE}Fixing import in layouts/client-layout.tsx${NC}"
cp "src/components/layouts/client-layout.tsx" "${BACKUP_DIR}/"
sed -i '' 's|import ClientLayoutProps from '\''../layout/client-layout.example'\''|import ClientLayoutProps from '\''./client-layout.example'\''|g' "src/components/layouts/client-layout.tsx"
echo -e "${GREEN}✓ Fixed import in layouts/client-layout.tsx${NC}"

# Fix imports in client-layout.example.tsx
echo -e "${BLUE}Fixing imports in layouts/client-layout.example.tsx${NC}"
if [ -f "src/components/layouts/client-layout.example.tsx" ]; then
  cp "src/components/layouts/client-layout.example.tsx" "${BACKUP_DIR}/client-layout.example.layouts.tsx"
  sed -i '' 's|import { Header } from '\''@/components/layout/Header'\''|import { Header } from '\''@/components/layouts/Header'\''|g' "src/components/layouts/client-layout.example.tsx"
  sed -i '' 's|import { Sidebar } from '\''@/components/layout/Sidebar'\''|import { Sidebar } from '\''@/components/layouts/Sidebar'\''|g' "src/components/layouts/client-layout.example.tsx"
  echo -e "${GREEN}✓ Fixed imports in layouts/client-layout.example.tsx${NC}"
else
  echo -e "${RED}✗ client-layout.example.tsx not found in layouts directory${NC}"
fi

# Find any remaining files referencing @/components/layout/
echo -e "${BLUE}Finding files with imports from @/components/layout/${NC}"
FILES=$(grep -l "from ['\"]@/components/layout/" --include="*.ts" --include="*.tsx" -r src)

if [ -z "$FILES" ]; then
  echo -e "${GREEN}No files found with imports from @/components/layout/${NC}"
else
  echo -e "${YELLOW}Found $(echo "$FILES" | wc -l | tr -d ' ') files with imports from @/components/layout/${NC}"
  
  # Fix each file
  echo -e "${BLUE}Fixing imports in each file:${NC}"
  for FILE in $FILES; do
    echo -e "${YELLOW}Processing: $FILE${NC}"
    
    # Create backup
    BACKUP_FILE="$BACKUP_DIR/$(basename "$FILE")"
    cp "$FILE" "$BACKUP_FILE"
    
    # Update the import statements
    sed -i '' 's|from ['\''"]@/components/layout/|from '\''@/components/layouts/|g' "$FILE"
    
    echo -e "${GREEN}✓ Updated imports in $FILE${NC}"
  done
fi

# Verify no more imports from @/components/layout/
echo
echo -e "${BLUE}Verifying changes...${NC}"
REMAINING=$(grep -l "from ['\"]@/components/layout/" --include="*.ts" --include="*.tsx" -r src)
if [ -z "$REMAINING" ]; then
  echo -e "${GREEN}✓ No remaining imports from @/components/layout/${NC}"
else
  echo -e "${RED}✗ Found $(echo "$REMAINING" | wc -l | tr -d ' ') files still with imports from @/components/layout/${NC}"
  echo -e "${YELLOW}Manual intervention required for:${NC}"
  echo "$REMAINING"
fi

echo
echo -e "${GREEN}Layout directory cleanup is complete.${NC}"
echo -e "${GREEN}Backups saved to $BACKUP_DIR${NC}"
echo -e "${YELLOW}You can now review the changes and if satisfied, safely remove the src/components/layout directory${NC}"
echo

# Create script to safely remove layout directory
echo -e "${BLUE}Creating script to safely remove layout directory${NC}"
cat > "scripts/cleanup/remove-layout-directory.sh" << 'EOF'
#!/bin/bash

# Script to safely remove the layout directory after cleanup
# Run this only after verifying that the layout directory is no longer needed

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}==============================================${NC}"
echo -e "${CYAN}      REMOVING LAYOUT DIRECTORY               ${NC}"
echo -e "${CYAN}==============================================${NC}"
echo

# Check for any remaining imports
REMAINING=$(grep -l "from ['\"]@/components/layout/" --include="*.ts" --include="*.tsx" -r src)
if [ -z "$REMAINING" ]; then
  echo -e "${GREEN}✓ No imports from @/components/layout/ found${NC}"
else
  echo -e "${RED}✗ Found imports from @/components/layout/ - Cannot safely remove directory${NC}"
  echo "$REMAINING"
  echo -e "${YELLOW}Please fix these imports first${NC}"
  exit 1
fi

# Final backup
BACKUP_DIR="temp/layout_directory_backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
echo -e "${BLUE}Creating final backup in $BACKUP_DIR${NC}"
cp -r "src/components/layout" "$BACKUP_DIR/"

# Remove the directory
echo -e "${YELLOW}Removing src/components/layout directory${NC}"
rm -rf "src/components/layout"

if [ ! -d "src/components/layout" ]; then
  echo -e "${GREEN}✓ Successfully removed src/components/layout directory${NC}"
else
  echo -e "${RED}✗ Failed to remove src/components/layout directory${NC}"
fi
EOF

chmod +x "scripts/cleanup/remove-layout-directory.sh"
echo -e "${GREEN}✓ Created script to safely remove layout directory: scripts/cleanup/remove-layout-directory.sh${NC}" 