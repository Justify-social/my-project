#!/bin/bash

# Set base directory
UI_DIR="src/components/ui"
cd "$(pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${GREEN}Scanning for duplicate UI components...${NC}"

# Create a temporary directory to store component lists
mkdir -p tmp_component_scan

# Function to normalize component name
normalize_component_name() {
  local name=$1
  # Convert to lowercase and remove extension
  echo "$name" | tr '[:upper:]' '[:lower:]' | sed 's/\.tsx$//'
}

# Find all component files
echo -e "${BLUE}Finding all component files...${NC}"
find "$UI_DIR" -type f -name "*.tsx" | grep -v "test\|spec\|__tests__" > tmp_component_scan/all_components.txt

# Extract component names and their locations
echo -e "${BLUE}Analyzing component names...${NC}"
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
echo -e "${BLUE}Identifying duplicates...${NC}"
# Extract component names only and find duplicates
cut -d: -f1 tmp_component_scan/sorted_components.txt | sort | uniq -c | awk '$1 > 1 {print $2}' > tmp_component_scan/duplicate_names.txt

# Check if we found duplicates
if [ ! -s tmp_component_scan/duplicate_names.txt ]; then
  echo -e "${GREEN}No duplicate components found!${NC}"
  rm -rf tmp_component_scan
  exit 0
fi

# For each duplicate, show all locations
echo -e "${YELLOW}Found duplicate components:${NC}"
echo -e "============================================="

while IFS= read -r component; do
  echo -e "${MAGENTA}Component: ${component}${NC}"
  grep "^$component:" tmp_component_scan/sorted_components.txt | cut -d: -f2 | while IFS= read -r location; do
    echo -e "  ${YELLOW}Location: ${location}${NC}"
    # Show first few lines of the component to help identify its purpose
    echo -e "  ${BLUE}Preview:${NC}"
    head -n 10 "$location" | grep -v "import" | grep -v "^$" | head -n 3 | sed 's/^/    /'
    echo
  done
  echo -e "---------------------------------------------"
done < tmp_component_scan/duplicate_names.txt

# Analyze directory structure for duplicates
echo -e "${BLUE}Analyzing directory structure for duplicates...${NC}"

find "$UI_DIR" -mindepth 1 -maxdepth 1 -type d | sort > tmp_component_scan/directories.txt

echo -e "${YELLOW}Potential component overlaps between directories:${NC}"
echo -e "============================================="

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
    echo -e "${MAGENTA}Potential overlap:${NC}"
    echo -e "  ${YELLOW}$UI_DIR/$dir1${NC} and ${YELLOW}$UI_DIR/$dir2${NC}"
    
    # Count files in each directory
    count1=$(find "$UI_DIR/$dir1" -name "*.tsx" | wc -l | xargs)
    count2=$(find "$UI_DIR/$dir2" -name "*.tsx" | wc -l | xargs)
    
    echo -e "  ${dir1}: $count1 component files"
    echo -e "  ${dir2}: $count2 component files"
    
    # Suggestion
    if [ "$count1" -gt "$count2" ]; then
      echo -e "  ${GREEN}Suggestion: Consider merging $dir2 into $dir1${NC}"
    else
      echo -e "  ${GREEN}Suggestion: Consider merging $dir1 into $dir2${NC}"
    fi
    echo -e "---------------------------------------------"
  fi
done

if [ "$overlap_found" = false ]; then
  echo -e "${GREEN}No directory overlaps identified!${NC}"
fi

# Clean up
rm -rf tmp_component_scan

echo -e "${GREEN}Scan complete!${NC}"
echo -e "${YELLOW}Recommendations:${NC}"
echo -e "1. Consolidate duplicate components into their canonical directories"
echo -e "2. Update imports to use the canonical paths"
echo -e "3. Follow the new organization structure for future components"
echo -e "4. Remove deprecated directories once components are consolidated" 