#!/bin/bash

# Script to fix remaining context imports
# Updates all imports from @/context/ to @/contexts/

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}==============================================${NC}"
echo -e "${CYAN}      FIXING REMAINING CONTEXT IMPORTS       ${NC}"
echo -e "${CYAN}==============================================${NC}"
echo

# Find all files with imports from @/context/
echo -e "${BLUE}Finding files with imports from @/context/${NC}"
FILES=$(grep -l "from ['\"]@/context/" --include="*.ts" --include="*.tsx" -r src)

if [ -z "$FILES" ]; then
  echo -e "${GREEN}No files found with imports from @/context/${NC}"
  exit 0
fi

echo -e "${YELLOW}Found $(echo "$FILES" | wc -l | tr -d ' ') files with imports from @/context/${NC}"

# Create backup directory
BACKUP_DIR="temp/context_import_fixes_backup"
mkdir -p "$BACKUP_DIR"
echo -e "${BLUE}Created backup directory: $BACKUP_DIR${NC}"

# Fix each file
echo
echo -e "${BLUE}Fixing imports in each file:${NC}"
for FILE in $FILES; do
  echo -e "${YELLOW}Processing: $FILE${NC}"
  
  # Create backup
  BACKUP_FILE="$BACKUP_DIR/$(basename "$FILE")"
  cp "$FILE" "$BACKUP_FILE"
  
  # Update the import statements
  sed -i '' 's|from ['\''"]@/context/|from '\''@/contexts/|g' "$FILE"
  
  echo -e "${GREEN}✓ Updated imports in $FILE${NC}"
done

echo
echo -e "${GREEN}All context imports have been updated.${NC}"
echo -e "${GREEN}Backups saved to $BACKUP_DIR${NC}"
echo
echo -e "${BLUE}Verifying changes...${NC}"

# Verify no more imports from @/context/
REMAINING=$(grep -l "from ['\"]@/context/" --include="*.ts" --include="*.tsx" -r src)
if [ -z "$REMAINING" ]; then
  echo -e "${GREEN}✓ No remaining imports from @/context/${NC}"
else
  echo -e "${RED}✗ Found $(echo "$REMAINING" | wc -l | tr -d ' ') files still with imports from @/context/${NC}"
  echo "$REMAINING"
fi 