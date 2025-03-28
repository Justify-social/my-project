#!/bin/bash

# Set base directory
UI_DIR="src/components/ui"
cd "$(pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Confirmation function
confirm() {
  read -p "$1 (y/n): " -n 1 -r
  echo
  [[ $REPLY =~ ^[Yy]$ ]]
}

echo -e "${RED}UI Component Duplicate Cleanup Tool${NC}"
echo -e "${YELLOW}WARNING: This script will remove duplicate components after consolidation.${NC}"
echo -e "${YELLOW}Only run this after verifying that your application works correctly.${NC}"
echo -e "${YELLOW}Please back up your codebase before proceeding.${NC}"

if ! confirm "Have you already run consolidate-components.sh and verified everything works?"; then
  echo -e "${RED}Please run consolidate-components.sh first and verify your application.${NC}"
  exit 1
fi

if ! confirm "Do you want to proceed with removing duplicate components?"; then
  echo -e "${RED}Operation cancelled.${NC}"
  exit 1
fi

# Create log directory
mkdir -p logs
LOG_FILE="logs/cleanup-$(date +%Y%m%d-%H%M%S).log"
touch $LOG_FILE

# Log function
log() {
  echo "$1" | tee -a $LOG_FILE
}

log "Starting duplicate component cleanup at $(date)"
log "===================================="

# Define directories to be removed
DIRECTORIES_TO_REMOVE=(
  "alert"
  "badge"
  "toast"
  "card"
  "container"
  "grid"
  "avatar"
  "input"
  "radio"
  "select"
  "tabs"
  "date-picker"
  "core"
)

# Define files to be removed
FILES_TO_REMOVE=(
  "icon.tsx"
)

# Remove directories
for dir in "${DIRECTORIES_TO_REMOVE[@]}"; do
  if [ -d "$UI_DIR/$dir" ]; then
    log "Removing directory: $UI_DIR/$dir"
    
    if ! confirm "Remove directory $UI_DIR/$dir?"; then
      log "* Skipped removal of $UI_DIR/$dir (user choice)"
      continue
    fi
    
    rm -rf "$UI_DIR/$dir"
    log "* Directory removed: $UI_DIR/$dir"
  else
    log "* Directory not found: $UI_DIR/$dir (skipping)"
  fi
done

# Remove files
for file in "${FILES_TO_REMOVE[@]}"; do
  if [ -f "$UI_DIR/$file" ]; then
    log "Removing file: $UI_DIR/$file"
    
    if ! confirm "Remove file $UI_DIR/$file?"; then
      log "* Skipped removal of $UI_DIR/$file (user choice)"
      continue
    fi
    
    rm "$UI_DIR/$file"
    log "* File removed: $UI_DIR/$file"
  else
    log "* File not found: $UI_DIR/$file (skipping)"
  fi
done

log ""
log "Cleanup process completed at $(date)"
log "===================================="

echo -e "${GREEN}Cleanup process completed!${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo -e "1. Verify your application still works correctly"
echo -e "2. Update any remaining imports to use the canonical paths"
echo -e "${BLUE}Log file created at: $LOG_FILE${NC}" 