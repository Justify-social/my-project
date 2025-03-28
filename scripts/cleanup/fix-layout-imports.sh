#!/bin/bash

# Fix Layout Imports Script
# This script fixes remaining references to @/components/layout and ensures Header and Sidebar
# components are available in the layouts directory

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting layout import fixes...${NC}"

# Copy Navigation components to layouts directory
echo -e "${BLUE}Copying Header and Sidebar components to layouts directory...${NC}"

if [ -f "src/components/Navigation/Header.tsx" ]; then
  echo "Copying src/components/Navigation/Header.tsx to src/components/layouts/"
  cp src/components/Navigation/Header.tsx src/components/layouts/
else
  echo -e "${YELLOW}Header.tsx not found in Navigation directory${NC}"
fi

if [ -f "src/components/Navigation/Sidebar.tsx" ]; then
  echo "Copying src/components/Navigation/Sidebar.tsx to src/components/layouts/"
  cp src/components/Navigation/Sidebar.tsx src/components/layouts/
else
  echo -e "${YELLOW}Sidebar.tsx not found in Navigation directory${NC}"
fi

# Update imports in the layout files
echo -e "${BLUE}Updating imports within layout files...${NC}"
find ./src/components/layouts -type f -name "*.tsx" | xargs sed -i '' 's|from "@/components/layout/Header"|from "./Header"|g'
find ./src/components/layouts -type f -name "*.tsx" | xargs sed -i '' "s|from '@/components/layout/Header'|from './Header'|g"
find ./src/components/layouts -type f -name "*.tsx" | xargs sed -i '' 's|from "@/components/layout/Sidebar"|from "./Sidebar"|g'
find ./src/components/layouts -type f -name "*.tsx" | xargs sed -i '' "s|from '@/components/layout/Sidebar'|from './Sidebar'|g"

# Update index.ts to include Header and Sidebar
echo -e "${BLUE}Updating index.ts to include Header and Sidebar...${NC}"
if [ -f "src/components/layouts/index.ts" ]; then
  if ! grep -q "export \* from './Header'" src/components/layouts/index.ts; then
    echo "export * from './Header';" >> src/components/layouts/index.ts
    echo "Added Header export to index.ts"
  fi
  
  if ! grep -q "export \* from './Sidebar'" src/components/layouts/index.ts; then
    echo "export * from './Sidebar';" >> src/components/layouts/index.ts
    echo "Added Sidebar export to index.ts"
  fi
else
  echo -e "${YELLOW}index.ts not found in layouts directory${NC}"
fi

# Find any remaining references to the old layout path
echo -e "${BLUE}Checking for remaining references to the old layout path...${NC}"
remaining=$(grep -r "@/components/layout/" src --include="*.tsx" --include="*.ts" | wc -l)
if [ "$remaining" -gt 0 ]; then
  echo -e "${YELLOW}Found $remaining remaining references to @/components/layout/:${NC}"
  grep -r "@/components/layout/" src --include="*.tsx" --include="*.ts" | head -10
  
  echo -e "${BLUE}Attempting to fix remaining references...${NC}"
  find ./src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|@/components/layout/|@/components/layouts/|g'
  
  # Check again
  remaining_after=$(grep -r "@/components/layout/" src --include="*.tsx" --include="*.ts" | wc -l)
  if [ "$remaining_after" -gt 0 ]; then
    echo -e "${YELLOW}Still have $remaining_after references to @/components/layout/. Manual fixes may be needed.${NC}"
  else
    echo -e "${GREEN}Successfully fixed all references!${NC}"
  fi
else
  echo -e "${GREEN}No remaining references to the old layout path.${NC}"
fi

echo -e "${GREEN}Layout import fixes completed!${NC}"
echo -e "${YELLOW}Remember to test the application thoroughly before removing the original layout directory.${NC}" 