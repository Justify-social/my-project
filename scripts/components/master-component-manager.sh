#!/bin/bash

# Component Master Management Script
# This script combines functionality from multiple component management scripts:
# - find-duplicate-components.sh
# - consolidate-components.sh
# - remove-duplicates.sh
# - cleanup-duplicates.sh

# Set base directory
UI_DIR="src/components/ui"
cd "$(pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Create log directory
mkdir -p logs
LOG_FILE="logs/component-management-$(date +%Y%m%d-%H%M%S).log"
touch $LOG_FILE

# Log function
log() {
  echo -e "$1" | tee -a $LOG_FILE
}

# Confirmation function
confirm() {
  read -p "$1 (y/n): " -n 1 -r
  echo
  [[ $REPLY =~ ^[Yy]$ ]]
}

# Show help message
show_help() {
  echo -e "${GREEN}Component Master Management Script${NC}"
  echo -e "This script provides comprehensive UI component management functionality.\n"
  echo -e "${CYAN}Usage:${NC}"
  echo -e "  $0 [command]\n"
  echo -e "${CYAN}Commands:${NC}"
  echo -e "  ${YELLOW}find${NC}         Find duplicate components and analyze component structure"
  echo -e "  ${YELLOW}consolidate${NC}  Consolidate components into their canonical directories"
  echo -e "  ${YELLOW}remove${NC}       Remove duplicate/deprecated component directories"
  echo -e "  ${YELLOW}clean${NC}        Clean up component files and update imports"
  echo -e "  ${YELLOW}full-cycle${NC}   Run all steps in sequence with confirmation"
  echo -e "  ${YELLOW}help${NC}         Show this help message\n"
  echo -e "${CYAN}Examples:${NC}"
  echo -e "  $0 find"
  echo -e "  $0 consolidate"
  echo -e "  $0 full-cycle"
}

#######################################################
# FIND DUPLICATE COMPONENTS
#######################################################
find_duplicate_components() {
  log "${GREEN}Scanning for duplicate UI components...${NC}"

  # Create a temporary directory to store component lists
  mkdir -p tmp_component_scan

  # Function to normalize component name
  normalize_component_name() {
    local name=$1
    # Convert to lowercase and remove extension
    echo "$name" | tr '[:upper:]' '[:lower:]' | sed 's/\.tsx$//'
  }

  # Find all component files
  log "${BLUE}Finding all component files...${NC}"
  find "$UI_DIR" -type f -name "*.tsx" | grep -v "test\|spec\|__tests__" > tmp_component_scan/all_components.txt

  # Extract component names and their locations
  log "${BLUE}Analyzing component names...${NC}"
  while IFS= read -r file; do
    # Get filename without path
    filename=$(basename "$file")
    # Normalize the name
    normalized_name=$(normalize_component_name "$filename")
    # Record the component and its location
    echo "$normalized_name:$file" >> tmp_component_scan/component_locations.txt
  done < tmp_component_scan/all_components.txt

  # Sort the components by name for easier processing
  sort tmp_component_scan/component_locations.txt > tmp_component_scan/sorted_components.txt

  # Find duplicates
  log "${BLUE}Identifying duplicates...${NC}"
  # Extract component names only and find duplicates
  cut -d: -f1 tmp_component_scan/sorted_components.txt | sort | uniq -c | awk '$1 > 1 {print $2}' > tmp_component_scan/duplicate_names.txt

  # Check if we found duplicates
  if [ ! -s tmp_component_scan/duplicate_names.txt ]; then
    log "${GREEN}No duplicate components found!${NC}"
    return 0
  fi

  # For each duplicate, show all locations
  log "${YELLOW}Found duplicate components:${NC}"
  log "============================================="

  while IFS= read -r component; do
    log "${MAGENTA}Component: ${component}${NC}"
    grep "^$component:" tmp_component_scan/sorted_components.txt | cut -d: -f2 | while IFS= read -r location; do
      log "  ${YELLOW}Location: ${location}${NC}"
      # Show first few lines of the component to help identify its purpose
      log "  ${BLUE}Preview:${NC}"
      head -n 10 "$location" | grep -v "import" | grep -v "^$" | head -n 3 | sed 's/^/    /'
      log ""
    done
    log "---------------------------------------------"
  done < tmp_component_scan/duplicate_names.txt

  # Analyze directory structure for duplicates
  log "${BLUE}Analyzing directory structure for duplicates...${NC}"

  find "$UI_DIR" -mindepth 1 -maxdepth 1 -type d | sort > tmp_component_scan/directories.txt

  log "${YELLOW}Potential component overlaps between directories:${NC}"
  log "============================================="

  # Compare component purposes across different directories
  overlap_found=false

  # Check for similar-purpose directories
  pairs=(
    "alert feedback"
    "avatar layout"
    "badge feedback"
    "button core"
    "calendar date-picker"
    "card layout"
    "container layout"
    "grid layout"
    "icon icons"
    "input forms"
    "radio forms"
    "select forms"
    "tabs navigation"
    "toast feedback"
  )

  for pair in "${pairs[@]}"; do
    dir1=$(echo $pair | cut -d' ' -f1)
    dir2=$(echo $pair | cut -d' ' -f2)
    
    if [ -d "$UI_DIR/$dir1" ] && [ -d "$UI_DIR/$dir2" ]; then
      overlap_found=true
      log "${MAGENTA}Potential overlap:${NC}"
      log "  ${YELLOW}$UI_DIR/$dir1${NC} and ${YELLOW}$UI_DIR/$dir2${NC}"
      
      # Count files in each directory
      count1=$(find "$UI_DIR/$dir1" -name "*.tsx" | wc -l | xargs)
      count2=$(find "$UI_DIR/$dir2" -name "*.tsx" | wc -l | xargs)
      
      log "  ${dir1}: $count1 component files"
      log "  ${dir2}: $count2 component files"
      
      # Suggestion
      if [ "$count1" -gt "$count2" ]; then
        log "  ${GREEN}Suggestion: Consider merging $dir2 into $dir1${NC}"
      else
        log "  ${GREEN}Suggestion: Consider merging $dir1 into $dir2${NC}"
      fi
      log "---------------------------------------------"
    fi
  done

  if [ "$overlap_found" = false ]; then
    log "${GREEN}No directory overlaps identified!${NC}"
  fi

  # Output component report
  cat tmp_component_scan/duplicate_names.txt > component-duplicates.txt
  log "${GREEN}Scan complete! Report saved to component-duplicates.txt${NC}"
  log "${YELLOW}Recommendations:${NC}"
  log "1. Consolidate duplicate components into their canonical directories"
  log "2. Update imports to use the canonical paths"
  log "3. Follow the new organization structure for future components"
  log "4. Remove deprecated directories once components are consolidated"

  # Clean up temp files but keep the report
  rm -rf tmp_component_scan
}

#######################################################
# CONSOLIDATE COMPONENTS
#######################################################
consolidate_components() {
  log "${GREEN}UI Component Consolidation Tool${NC}"
  log "${YELLOW}This will consolidate duplicate UI components into their canonical directories.${NC}"
  
  if ! confirm "Do you want to continue with consolidation?"; then
    log "${RED}Operation cancelled.${NC}"
    return 1
  fi

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
  log "${GREEN}Consolidation process completed!${NC}"
  log "${YELLOW}Next steps:${NC}"
  log "1. Verify that all components work correctly"
  log "2. Update imports to use the canonical paths"
  log "3. Run the 'remove' command to remove duplicates once verified"
}

#######################################################
# REMOVE DUPLICATE COMPONENTS
#######################################################
remove_duplicates() {
  log "${YELLOW}This will remove duplicate UI component directories.${NC}"
  log "${YELLOW}Consolidated components should already be copied to their canonical locations.${NC}"
  log "${RED}Make sure you have a backup before proceeding!${NC}"

  if ! confirm "Do you want to continue with removal?"; then
    log "${RED}Operation cancelled.${NC}"
    return 1
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

  log "${GREEN}Starting cleanup...${NC}"

  # Remove directories
  for dir in "${DIRS_TO_REMOVE[@]}"; do
    if [[ -d "$UI_DIR/$dir" ]]; then
      log "Removing directory: ${YELLOW}$UI_DIR/$dir${NC}"
      rm -rf "$UI_DIR/$dir"
      if [[ $? -eq 0 ]]; then
        log "${GREEN}Successfully removed $UI_DIR/$dir${NC}"
      else
        log "${RED}Failed to remove $UI_DIR/$dir${NC}"
      fi
    else
      log "${YELLOW}Directory $UI_DIR/$dir does not exist, skipping${NC}"
    fi
  done

  # Remove individual files
  for file in "${FILES_TO_REMOVE[@]}"; do
    if [[ -f "$UI_DIR/$file" ]]; then
      log "Removing file: ${YELLOW}$UI_DIR/$file${NC}"
      rm "$UI_DIR/$file"
      if [[ $? -eq 0 ]]; then
        log "${GREEN}Successfully removed $UI_DIR/$file${NC}"
      else
        log "${RED}Failed to remove $UI_DIR/$file${NC}"
      fi
    else
      log "${YELLOW}File $UI_DIR/$file does not exist, skipping${NC}"
    fi
  done

  log "${GREEN}Cleanup completed!${NC}"
  log "You should now have a clean, organized UI component structure."
}

#######################################################
# CLEANUP COMPONENTS
#######################################################
cleanup_components() {
  log "${GREEN}UI Component Cleanup Utility${NC}"
  log "${YELLOW}This will clean up component structure and fix imports.${NC}"
  
  if ! confirm "Do you want to continue with cleanup?"; then
    log "${RED}Operation cancelled.${NC}"
    return 1
  fi

  # Update the main index.ts file
  log "${CYAN}Updating the main UI components index.ts...${NC}"
  
  # Check if the index.ts file exists
  if [ ! -f "$UI_DIR/index.ts" ]; then
    log "${RED}Error: $UI_DIR/index.ts file not found!${NC}"
    return 1
  }
  
  # Create a backup of the index file
  cp "$UI_DIR/index.ts" "$UI_DIR/index.ts.bak"
  log "Created backup: $UI_DIR/index.ts.bak"
  
  # Get all directories in the UI folder
  directories=$(find "$UI_DIR" -maxdepth 1 -type d | sort | grep -v "node_modules" | sed "s|$UI_DIR/||")
  
  # Generate new index.ts content
  EXPORT_SECTIONS=''
  
  for dir in $directories; do
    # Skip the UI directory itself or hidden directories
    if [ "$dir" == "$UI_DIR" ] || [[ "$dir" == .* ]]; then
      continue
    fi
    
    # Skip empty directories
    if [ -z "$(ls -A "$UI_DIR/$dir" 2>/dev/null)" ]; then
      log "${YELLOW}Skipping empty directory: $dir${NC}"
      continue
    fi
    
    log "Processing directory: $dir"
    
    # Check if this directory has an index.ts file
    if [ -f "$UI_DIR/$dir/index.ts" ]; then
      EXPORT_SECTIONS+="// Export from $dir components\n"
      EXPORT_SECTIONS+="export * from './$dir';\n\n"
    else
      log "${YELLOW}Directory $dir doesn't have an index.ts file, skipping${NC}"
    fi
  done
  
  # Write the new index.ts file
  cat > "$UI_DIR/index.ts" << EOF
// Main UI Components Export
// Auto-generated on $(date)

$EXPORT_SECTIONS
// End of exports
EOF
  
  log "${GREEN}Updated $UI_DIR/index.ts successfully!${NC}"
  
  # Now update imports in the codebase
  if confirm "Do you want to update component imports throughout the codebase?"; then
    log "${CYAN}Scanning for component imports to update...${NC}"
    
    # Define import patterns to look for and their replacements
    declare -A IMPORT_REPLACEMENTS=(
      ["@/components/ui/alert"]="@/components/ui/feedback"
      ["@/components/ui/badge"]="@/components/ui/feedback"
      ["@/components/ui/toast"]="@/components/ui/feedback"
      ["@/components/ui/card"]="@/components/ui/layout"
      ["@/components/ui/container"]="@/components/ui/layout"
      ["@/components/ui/grid"]="@/components/ui/layout"
      ["@/components/ui/avatar"]="@/components/ui/layout"
      ["@/components/ui/input"]="@/components/ui/forms"
      ["@/components/ui/radio"]="@/components/ui/forms"
      ["@/components/ui/select"]="@/components/ui/forms"
      ["@/components/ui/checkbox"]="@/components/ui/forms"
      ["@/components/ui/tabs"]="@/components/ui/navigation"
      ["@/components/ui/date-picker"]="@/components/ui/calendar"
      ["@/components/ui/core"]="@/components/ui/typography"
    )
    
    # Find all TypeScript/React files
    FILES_TO_UPDATE=$(find "src" -type f \( -name "*.ts" -o -name "*.tsx" \) | grep -v "node_modules")
    
    UPDATE_COUNT=0
    
    for file in $FILES_TO_UPDATE; do
      UPDATED=false
      
      # Read file content
      FILE_CONTENT=$(cat "$file")
      NEW_CONTENT="$FILE_CONTENT"
      
      # Check each import pattern
      for pattern in "${!IMPORT_REPLACEMENTS[@]}"; do
        replacement="${IMPORT_REPLACEMENTS[$pattern]}"
        
        # Check if this file contains the pattern
        if grep -q "$pattern" "$file"; then
          log "Updating imports in: ${YELLOW}$file${NC}"
          
          # Replace the import pattern
          NEW_CONTENT=$(echo "$NEW_CONTENT" | sed "s|$pattern|$replacement|g")
          UPDATED=true
          UPDATE_COUNT=$((UPDATE_COUNT + 1))
        fi
      done
      
      # Write updated content back to file if changes were made
      if [ "$UPDATED" = true ]; then
        echo "$NEW_CONTENT" > "$file"
        log "${GREEN}Updated imports in: $file${NC}"
      fi
    done
    
    log "${GREEN}Updated imports in $UPDATE_COUNT files${NC}"
  fi
  
  log "${GREEN}Component cleanup completed!${NC}"
}

#######################################################
# FULL CYCLE MANAGEMENT
#######################################################
full_cycle() {
  log "${GREEN}Starting full component management cycle...${NC}"
  
  # Find duplicates
  log "${CYAN}STEP 1: Find duplicate components${NC}"
  find_duplicate_components
  
  # Confirm before continuing
  if ! confirm "Continue to consolidation step?"; then
    log "${YELLOW}Cycle stopped after find step.${NC}"
    return 0
  fi
  
  # Consolidate components
  log "${CYAN}STEP 2: Consolidate components${NC}"
  consolidate_components
  
  # Confirm before continuing
  if ! confirm "Continue to removal step?"; then
    log "${YELLOW}Cycle stopped after consolidation step.${NC}"
    return 0
  fi
  
  # Remove duplicates
  log "${CYAN}STEP 3: Remove duplicate components${NC}"
  remove_duplicates
  
  # Confirm before continuing
  if ! confirm "Continue to cleanup step?"; then
    log "${YELLOW}Cycle stopped after removal step.${NC}"
    return 0
  fi
  
  # Cleanup
  log "${CYAN}STEP 4: Clean up component structure${NC}"
  cleanup_components
  
  log "${GREEN}Full component management cycle completed!${NC}"
}

#######################################################
# MAIN SCRIPT EXECUTION
#######################################################

# Check command line arguments
if [ $# -eq 0 ]; then
  show_help
  exit 0
fi

case "$1" in
  find)
    find_duplicate_components
    ;;
  consolidate)
    consolidate_components
    ;;
  remove)
    remove_duplicates
    ;;
  clean)
    cleanup_components
    ;;
  full-cycle)
    full_cycle
    ;;
  help)
    show_help
    ;;
  *)
    echo -e "${RED}Unknown command: $1${NC}"
    show_help
    exit 1
    ;;
esac

log "${GREEN}Script completed at $(date)${NC}"
exit 0