#!/bin/bash

# Set base directory
UI_DIR="src/components/ui"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}This script will remove the remaining duplicate UI component directories.${NC}"
echo -e "${RED}Make sure you have a backup before proceeding!${NC}"

read -p "Do you want to continue? (y/n): " confirm
if [[ $confirm != "y" ]]; then
  echo -e "${RED}Operation cancelled.${NC}"
  exit 1
fi

# Update index.ts for consistency
echo -e "${GREEN}Updating main index.ts file...${NC}"

# Create a temporary file for the updated index.ts
cat > src/components/ui/index.ts.new << 'EOL'
// Organized UI component exports

// Core components
export * from './button';
export * from './calendar';
export * from './feedback';
export * from './forms';
export * from './icons';
export * from './layout';
export * from './list';
export * from './progress';
export * from './skeleton';
export * from './spinner';
export * from './table';
export * from './typography';

// Layout and navigation
export * from './navigation';

// Feedback and notifications
export * from './notifications';

// Theming
export * from './theme';

// Utils
export * from './error';

// Debug tools (only in development)
export * from './debug';

// Example components (for documentation)
export * from './examples';

// Backward compatibility aliases
export { Spinner as LoadingSpinner } from './spinner';
EOL

# Replace the index.ts file
mv src/components/ui/index.ts.new src/components/ui/index.ts
echo -e "${GREEN}Updated main index.ts file.${NC}"

# Clean up remaining duplicates
echo -e "${GREEN}Cleaning up remaining duplicates...${NC}"

# Remove loading-skeleton duplicates - consolidate into skeleton
if [[ -d "$UI_DIR/skeleton" && -d "$UI_DIR/loading-skeleton" ]]; then
  echo -e "Consolidating loading-skeleton into skeleton..."
  # Copy any unique files from loading-skeleton to skeleton
  if [[ -f "$UI_DIR/loading-skeleton/index.tsx" ]]; then
    echo -e "Moving loading-skeleton index.tsx to skeleton/LoadingSkeleton.tsx"
    cp "$UI_DIR/loading-skeleton/index.tsx" "$UI_DIR/skeleton/LoadingSkeleton.tsx"
    # Update skeleton/index.ts
    echo "export * from './LoadingSkeleton';" >> "$UI_DIR/skeleton/index.ts"
  fi
  # Remove loading-skeleton directory
  rm -rf "$UI_DIR/loading-skeleton"
  echo -e "${GREEN}Successfully consolidated loading-skeleton into skeleton${NC}"
fi

# Fix NotificationBell duplicate - use the one in notifications/
if [[ -f "$UI_DIR/feedback/NotificationBell.tsx" && -f "$UI_DIR/notifications/NotificationBell.tsx" ]]; then
  echo -e "Removing duplicate NotificationBell from feedback..."
  rm "$UI_DIR/feedback/NotificationBell.tsx"
  # Remove export from feedback/index.ts if it exists
  if grep -q "NotificationBell" "$UI_DIR/feedback/index.ts"; then
    sed -i.bak '/NotificationBell/d' "$UI_DIR/feedback/index.ts"
    rm -f "$UI_DIR/feedback/index.ts.bak" # Remove backup file
  fi
  echo -e "${GREEN}Successfully removed duplicate NotificationBell${NC}"
fi

# Fix Table duplicate - use the one in layout/
if [[ -d "$UI_DIR/table" && -f "$UI_DIR/layout/Table.tsx" ]]; then
  echo -e "Removing duplicate table directory..."
  # Check if there are any unique files in table/ that need to be preserved
  if [[ -d "$UI_DIR/table/types" ]]; then
    mkdir -p "$UI_DIR/layout/types"
    cp -n "$UI_DIR/table/types/"* "$UI_DIR/layout/types/"
  fi
  # Remove table directory
  rm -rf "$UI_DIR/table"
  echo -e "${GREEN}Successfully consolidated table into layout${NC}"
fi

echo -e "${GREEN}Cleanup completed!${NC}"
echo -e "You should now have a clean, organized UI component structure." 