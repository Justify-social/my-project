#!/bin/bash

# Consolidate Layout Directories
# This script implements Issue 1.2 from the codebase cleanup plan
# Consolidates src/components/layout and src/components/layouts into a single directory

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting layout directory consolidation...${NC}"

# Create backup 
echo -e "${BLUE}Creating backup of layout directories...${NC}"
mkdir -p ./temp/layout_backup
cp -r ./src/components/layout ./temp/layout_backup/
cp -r ./src/components/layouts ./temp/layout_backup/

# Ensure target directory exists
echo -e "${BLUE}Ensuring target directory exists...${NC}"
mkdir -p ./src/components/layouts

# Move files from layout to layouts
echo -e "${BLUE}Moving files from src/components/layout to src/components/layouts...${NC}"
for file in $(find ./src/components/layout -maxdepth 1 -type f); do
  filename=$(basename "$file")
  if [ -f "./src/components/layouts/$filename" ]; then
    echo -e "${YELLOW}File already exists in target: $filename - comparing content...${NC}"
    if cmp -s "$file" "./src/components/layouts/$filename"; then
      echo -e "Files are identical, skipping: $filename"
    else
      echo -e "${RED}Files differ, creating backup with .layout suffix: $filename${NC}"
      cp "$file" "./src/components/layouts/$filename.layout"
    fi
  else
    echo -e "Moving file: $filename"
    cp "$file" "./src/components/layouts/"
  fi
done

# Create/update index.ts file in layouts directory
echo -e "${BLUE}Creating/updating index.ts file in layouts directory...${NC}"
if [ ! -f "./src/components/layouts/index.ts" ]; then
  echo -e "// Application Layout Components\n// Auto-generated from consolidation script\n" > ./src/components/layouts/index.ts
fi

# Add exports to index.ts
for file in $(find ./src/components/layouts -maxdepth 1 -type f -name "*.tsx" -o -name "*.ts" | grep -v "index.ts"); do
  filename=$(basename "$file")
  component_name="${filename%.*}"
  if ! grep -q "export .* from './$component_name'" ./src/components/layouts/index.ts; then
    echo -e "export * from './$component_name';" >> ./src/components/layouts/index.ts
    echo -e "Added export for $component_name"
  fi
done

# Update imports in the codebase
echo -e "${BLUE}Updating imports from @/components/layout to @/components/layouts...${NC}"
find ./src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from "@/components/layout/|from "@/components/layouts/|g'
find ./src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i '' "s|from '@/components/layout/|from '@/components/layouts/|g"

# Create README in layouts
echo -e "${BLUE}Creating README.md in layouts directory...${NC}"
cat > ./src/components/layouts/README.md << 'EOL'
# Application Layouts

This directory contains application-level layouts used to structure pages.

## Available Layouts

- **ClientLayout**: Main layout for authenticated client views
- **Header**: Application header component
- **Sidebar**: Application sidebar navigation
- **Footer**: Application footer component

## Usage

Import layouts from this directory:

```tsx
import { ClientLayout } from '@/components/layouts';
```

## Note

For reusable UI layout components (Card, Grid, Container, etc.), 
use components from the UI layout directory:

```tsx
import { Card, Grid, Container } from '@/components/ui/layout';
```
EOL

echo -e "${GREEN}Layout directory consolidation complete!${NC}"
echo -e "${YELLOW}Note: The original layout directory has not been removed.${NC}"
echo -e "${YELLOW}Please verify the changes and test the application before removing it.${NC}"
echo -e "Use: rm -rf ./src/components/layout" 