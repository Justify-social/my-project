#!/bin/bash

# Set base directory
UI_DIR="src/components/ui"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}This script will remove duplicate UI component directories.${NC}"
echo -e "${YELLOW}Consolidated components have already been copied to their canonical locations.${NC}"
echo -e "${RED}Make sure you have a backup before proceeding!${NC}"

read -p "Do you want to continue? (y/n): " confirm
if [[ $confirm != "y" ]]; then
  echo -e "${RED}Operation cancelled.${NC}"
  exit 1
fi

# Directories to be removed
DIRS_TO_REMOVE=(
  "alert"
  "badge"
  "card"
  "container"
  "grid"
  "avatar"
  "input"
  "radio"
  "select"
  "checkbox"
  "toast"
  "tabs"
  "date-picker"
  "core"
)

# Main files to be removed
FILES_TO_REMOVE=(
  "icon.tsx"
  "ErrorBoundary.tsx"
)

echo -e "${GREEN}Starting cleanup...${NC}"

# Remove directories
for dir in "${DIRS_TO_REMOVE[@]}"; do
  if [[ -d "$UI_DIR/$dir" ]]; then
    echo -e "Removing directory: ${YELLOW}$UI_DIR/$dir${NC}"
    rm -rf "$UI_DIR/$dir"
    if [[ $? -eq 0 ]]; then
      echo -e "${GREEN}Successfully removed $UI_DIR/$dir${NC}"
    else
      echo -e "${RED}Failed to remove $UI_DIR/$dir${NC}"
    fi
  else
    echo -e "${YELLOW}Directory $UI_DIR/$dir does not exist, skipping${NC}"
  fi
done

# Remove individual files
for file in "${FILES_TO_REMOVE[@]}"; do
  if [[ -f "$UI_DIR/$file" ]]; then
    echo -e "Removing file: ${YELLOW}$UI_DIR/$file${NC}"
    rm "$UI_DIR/$file"
    if [[ $? -eq 0 ]]; then
      echo -e "${GREEN}Successfully removed $UI_DIR/$file${NC}"
    else
      echo -e "${RED}Failed to remove $UI_DIR/$file${NC}"
    fi
  else
    echo -e "${YELLOW}File $UI_DIR/$file does not exist, skipping${NC}"
  fi
done

echo -e "${GREEN}Cleanup completed!${NC}"
echo -e "You should now have a clean, organized UI component structure." 