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

echo -e "${GREEN}UI Component Consolidation Tool${NC}"
echo -e "${YELLOW}This script will consolidate duplicate UI components into their canonical directories.${NC}"
echo -e "${YELLOW}Please back up your codebase before proceeding.${NC}"

if ! confirm "Do you want to continue?"; then
  echo -e "${RED}Operation cancelled.${NC}"
  exit 1
fi

# Create log directory
mkdir -p logs
LOG_FILE="logs/consolidation-$(date +%Y%m%d-%H%M%S).log"
touch $LOG_FILE

# Log function
log() {
  echo "$1" | tee -a $LOG_FILE
}

log "Starting component consolidation at $(date)"
log "===================================="

# Define consolidation mappings based on our analysis
# format: "source_directory:target_directory"
CONSOLIDATIONS=(
  # Consolidate into feedback
  "alert:feedback"
  "badge:feedback"
  "toast:feedback"
  
  # Consolidate into layout
  "card:layout"
  "container:layout"
  "grid:layout"
  "avatar:layout"
  
  # Consolidate into forms
  "input:forms"
  "radio:forms"
  "select:forms"
  "checkbox:forms"
  
  # Consolidate into navigation
  "tabs:navigation"
  
  # Consolidate date components
  "date-picker:calendar"
  
  # Typography-related
  "core:typography"
  
  # Deprecated individual files
  "icon.tsx:icons"
)

# Function to consolidate components
consolidate_directory() {
  local source=$1
  local target=$2
  
  log "Consolidating from $source to $target"
  
  # If source is a directory
  if [ -d "$UI_DIR/$source" ]; then
    log "* Source is a directory: $UI_DIR/$source"
    
    # Create target subdirectories if they don't exist
    mkdir -p "$UI_DIR/$target/styles" 2>/dev/null
    mkdir -p "$UI_DIR/$target/types" 2>/dev/null
    mkdir -p "$UI_DIR/$target/examples" 2>/dev/null
    
    # Check if index.ts exists in target
    if [ ! -f "$UI_DIR/$target/index.ts" ]; then
      log "* Creating index.ts in $UI_DIR/$target"
      echo "// Export components from $target" > "$UI_DIR/$target/index.ts"
    fi
    
    # Copy files from source to target
    for file in $(find "$UI_DIR/$source" -type f -not -path "*/node_modules/*" -not -path "*/\.*"); do
      local file_basename=$(basename "$file")
      local file_ext="${file_basename##*.}"
      local file_name="${file_basename%.*}"
      local target_path=""
      
      # Determine target path based on file extension and directory
      if [[ "$file" == *"/styles/"* ]]; then
        target_path="$UI_DIR/$target/styles/$file_basename"
      elif [[ "$file" == *"/types/"* ]]; then
        target_path="$UI_DIR/$target/types/$file_basename"
      elif [[ "$file" == *"/examples/"* ]]; then
        target_path="$UI_DIR/$target/examples/$file_basename"
      elif [[ "$file" == *"/index.ts" ]]; then
        # Don't copy index.ts, we'll update the target's index.ts instead
        continue
      else
        # Main component file - use PascalCase naming convention
        local pascal_name="$(tr '[:lower:]' '[:upper:]' <<< ${file_name:0:1})${file_name:1}"
        target_path="$UI_DIR/$target/$pascal_name.$file_ext"
      fi
      
      # Copy file
      if [ ! -f "$target_path" ]; then
        log "* Copying $file to $target_path"
        cp "$file" "$target_path"
        
        # If this is a main component file, update the index.ts
        if [[ "$target_path" == *".tsx" ]] && [[ ! "$target_path" == *"/examples/"* ]] && [[ ! "$target_path" == *"/index.tsx" ]]; then
          local component_name="${target_path##*/}"
          component_name="${component_name%.*}"
          
          # Check if component is already exported
          if ! grep -q "export.*from.*\./$component_name" "$UI_DIR/$target/index.ts"; then
            log "* Adding export for $component_name to $UI_DIR/$target/index.ts"
            echo "export * from './$component_name';" >> "$UI_DIR/$target/index.ts"
          fi
        fi
      else
        log "* Skipping copy of $file (target file already exists: $target_path)"
      fi
    done
    
  # If source is a file
  elif [ -f "$UI_DIR/$source" ]; then
    log "* Source is a file: $UI_DIR/$source"
    
    local file_basename=$(basename "$source")
    local file_ext="${file_basename##*.}"
    local file_name="${file_basename%.*}"
    
    # Convert to PascalCase
    local pascal_name="$(tr '[:lower:]' '[:upper:]' <<< ${file_name:0:1})${file_name:1}"
    local target_path="$UI_DIR/$target/$pascal_name.$file_ext"
    
    # Copy file
    if [ ! -f "$target_path" ]; then
      log "* Copying $UI_DIR/$source to $target_path"
      cp "$UI_DIR/$source" "$target_path"
      
      # Update index.ts
      if [[ "$target_path" == *".tsx" ]]; then
        # Check if component is already exported
        if ! grep -q "export.*from.*\./$pascal_name" "$UI_DIR/$target/index.ts"; then
          log "* Adding export for $pascal_name to $UI_DIR/$target/index.ts"
          echo "export * from './$pascal_name';" >> "$UI_DIR/$target/index.ts"
        fi
      fi
    else
      log "* Skipping copy of $UI_DIR/$source (target file already exists: $target_path)"
    fi
  else
    log "* Source not found: $UI_DIR/$source"
  fi
  
  log "* Consolidation completed: $source → $target"
}

# Process consolidations
for item in "${CONSOLIDATIONS[@]}"; do
  source=$(echo $item | cut -d: -f1)
  target=$(echo $item | cut -d: -f2)
  
  log ""
  log "Processing: $source → $target"
  
  consolidate_directory "$source" "$target"
done

log ""
log "Consolidation process completed at $(date)"
log "===================================="

# Do not remove original files yet, let the user verify first
echo -e "${GREEN}Consolidation process completed!${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo -e "1. Verify that all components work correctly"
echo -e "2. Update imports to use the canonical paths"
echo -e "3. Run a cleanup script to remove duplicates once verified"
echo -e "${BLUE}Log file created at: $LOG_FILE${NC}" 