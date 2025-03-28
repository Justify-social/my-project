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
