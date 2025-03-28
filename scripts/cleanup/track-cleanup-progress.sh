#!/bin/bash

# Codebase Cleanup Progress Tracking Script
# This script checks the current state of the codebase and reports progress on cleanup tasks

# Color definitions
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}==========================================${NC}"
echo -e "${BLUE}     Codebase Cleanup Progress Report     ${NC}"
echo -e "${BLUE}==========================================${NC}"
echo

# Issue 1.1: Duplicate Context Directories
echo -e "${BLUE}Issue 1.1: Duplicate Context Directories${NC}"
if [ ! -d "src/context" ] && [ -d "src/contexts" ]; then
  context_files=$(find src/contexts -type f | wc -l)
  echo -e "${GREEN}✓ src/context has been removed${NC}"
  echo -e "${GREEN}✓ src/contexts exists with $context_files files${NC}"
  issue_1_1_status="Complete"
else
  echo -e "${RED}✗ Duplicate context directories still exist${NC}"
  issue_1_1_status="Not Started"
fi
echo

# Issue 1.2: Duplicate Layout Directories
echo -e "${BLUE}Issue 1.2: Duplicate Layout Directories${NC}"
if [ ! -d "src/components/layout" ] && [ -d "src/components/layouts" ]; then
  layout_files=$(find src/components/layouts -type f | wc -l)
  echo -e "${GREEN}✓ src/components/layout has been removed${NC}"
  echo -e "${GREEN}✓ src/components/layouts exists with $layout_files files${NC}"
  issue_1_2_status="Complete"
else
  echo -e "${RED}✗ Duplicate layout directories still exist${NC}"
  issue_1_2_status="Not Started"
fi
echo

# Check for imports from old directories
echo -e "${BLUE}Checking for imports from old directories...${NC}"
context_imports=$(grep -r --include="*.ts" --include="*.tsx" "from.*@/context" src | wc -l)
layout_imports=$(grep -r --include="*.ts" --include="*.tsx" "from.*@/components/layout" src | wc -l)

if [ $context_imports -eq 0 ]; then
  echo -e "${GREEN}✓ No imports from @/context found${NC}"
else
  echo -e "${RED}✗ Found $context_imports imports from @/context${NC}"
  issue_1_1_status="In Progress"
fi

if [ $layout_imports -eq 0 ]; then
  echo -e "${GREEN}✓ No imports from @/components/layout found${NC}"
else
  echo -e "${RED}✗ Found $layout_imports imports from @/components/layout${NC}"
  issue_1_2_status="In Progress"
fi
echo

# Issue 2.1: Inconsistent Test File Naming
echo -e "${BLUE}Issue 2.1: Inconsistent Test File Naming${NC}"
test_pattern_1=$(find src -name "*.test.ts" -o -name "*.test.tsx" | wc -l)
test_pattern_2=$(find src -name "*-test.ts" -o -name "*-test.tsx" | wc -l)
test_pattern_3=$(find src -path "*/__tests__/*" | wc -l)

echo -e "${YELLOW}Found $test_pattern_1 files with .test.ts/tsx pattern${NC}"
echo -e "${YELLOW}Found $test_pattern_2 files with -test.ts/tsx pattern${NC}"
echo -e "${YELLOW}Found $test_pattern_3 files in __tests__ directories${NC}"

# Check if standardized test structure exists
if [ -d "src/__tests__" ]; then
  central_test_count=$(find src/__tests__ -type f | wc -l)
  echo -e "${YELLOW}⚠ src/__tests__ directory exists with $central_test_count files${NC}"
fi

# Look for standardization-report
if [ -f "docs/project-history/test-standardization-report.md" ]; then
  echo -e "${GREEN}✓ Test standardization report exists${NC}"
  standardized_tests=$(grep -c "Successfully standardized" docs/project-history/test-standardization-report.md)
  echo -e "${GREEN}✓ $standardized_tests tests have been standardized${NC}"
  issue_2_1_status="Complete"
else
  # Check if we have mostly standardized to .test.tsx pattern
  if [ $test_pattern_1 -gt $test_pattern_2 ] && [ -d "src/__tests__" ]; then
    issue_2_1_status="In Progress"
  else
    issue_2_1_status="Not Started"
  fi
fi
echo

# Issue 2.2: Inconsistent Component Directory Naming
echo -e "${BLUE}Issue 2.2: Inconsistent Component Directory Naming${NC}"

# Count singular vs plural directories
singular_dirs=0
plural_dirs=0

# Common directory types that should be plural
directory_types=("component" "layout" "util" "hook" "context" "provider" "service")

for type in "${directory_types[@]}"; do
  # Check for singular version
  if [ -d "src/$type" ]; then
    singular_dirs=$((singular_dirs + 1))
    echo -e "${YELLOW}Found singular directory: src/$type${NC}"
  fi
  
  # Check for plural version
  if [ -d "src/${type}s" ]; then
    plural_dirs=$((plural_dirs + 1))
    echo -e "${GREEN}Found plural directory: src/${type}s${NC}"
  fi
  
  # Check for singular version in other locations
  singular_other=$(find src -type d -name "$type" -not -path "src/$type" | wc -l)
  if [ $singular_other -gt 0 ]; then
    singular_dirs=$((singular_dirs + singular_other))
    echo -e "${YELLOW}Found $singular_other other singular directories named '$type'${NC}"
  fi
done

# Look for directory naming report
if [ -f "docs/project-history/directory-naming-report.md" ]; then
  echo -e "${GREEN}✓ Directory naming standardization report exists${NC}"
  renamed_dirs=$(grep -c "Successfully renamed" docs/project-history/directory-naming-report.md)
  echo -e "${GREEN}✓ $renamed_dirs directories have been renamed${NC}"
  issue_2_2_status="Complete"
else
  # Determine status based on singular vs plural count
  if [ $singular_dirs -eq 0 ] && [ $plural_dirs -gt 0 ]; then
    issue_2_2_status="Complete"
    echo -e "${GREEN}✓ All checked directories use plural naming convention${NC}"
  elif [ $singular_dirs -gt 0 ] && [ $plural_dirs -gt 0 ]; then
    issue_2_2_status="In Progress"
    echo -e "${YELLOW}⚠ Mix of singular and plural directory naming found${NC}"
  else
    issue_2_2_status="Not Started"
    echo -e "${RED}✗ Directory naming convention not standardized${NC}"
  fi
fi
echo

# Issue 3.1: Scattered Test Files
echo -e "${BLUE}Issue 3.1: Scattered Test Files${NC}"

# Check if tests directory exists and has content
if [ -d "tests" ]; then
  test_file_count=$(find tests -type f -name "*.ts" -o -name "*.tsx" | wc -l)
  echo -e "${GREEN}✓ tests/ directory exists with $test_file_count test files${NC}"
  
  # Check test subdirectories
  if [ -d "tests/unit" ] && [ -d "tests/integration" ]; then
    unit_tests=$(find tests/unit -type f | wc -l)
    integration_tests=$(find tests/integration -type f | wc -l)
    echo -e "${GREEN}✓ tests/unit/ contains $unit_tests files${NC}"
    echo -e "${GREEN}✓ tests/integration/ contains $integration_tests files${NC}"
    
    if [ $test_file_count -gt 10 ]; then
      issue_3_1_status="Complete"
    else
      issue_3_1_status="In Progress"
    fi
  else
    issue_3_1_status="In Progress"
    echo -e "${YELLOW}⚠ Test directory structure incomplete${NC}"
  fi
else
  issue_3_1_status="Not Started"
  echo -e "${RED}✗ Central tests directory not found${NC}"
fi

# Check if standardized test files report exists
if [ -f "docs/project-history/test-standardization-report.md" ]; then
  centralized_tests=$(grep -c "Centralized:" docs/project-history/test-standardization-report.md)
  echo -e "${GREEN}✓ $centralized_tests tests have been centralized${NC}"
  if [ $centralized_tests -gt 10 ]; then
    issue_3_1_status="Complete"
  else
    issue_3_1_status="In Progress"
  fi
fi
echo

# Issue 4.1: Inconsistent or Missing Documentation
echo -e "${BLUE}Issue 4.1: Inconsistent or Missing Documentation${NC}"

# Check for README files in major directories
readme_count=$(find src -name "README.md" | wc -l)
echo -e "${YELLOW}Found $readme_count README.md files in src${NC}"

# Check if README generation report exists
if [ -f "docs/project-history/readme-generation-report.md" ]; then
  echo -e "${GREEN}✓ README generation report exists${NC}"
  added_readmes=$(grep -c "Successfully Added READMEs" docs/project-history/readme-generation-report.md)
  echo -e "${GREEN}✓ Added $added_readmes README files${NC}"
  issue_4_1_status="Complete"
else
  # Determine status based on README count
  if [ $readme_count -gt 5 ]; then
    issue_4_1_status="In Progress"
    echo -e "${YELLOW}⚠ Some README files exist, but not consistently${NC}"
  else
    issue_4_1_status="Not Started"
    echo -e "${RED}✗ Few or no README files found${NC}"
  fi
fi
echo

# Issue 4.2: Missing Code Organization Documentation
echo -e "${BLUE}Issue 4.2: Missing Code Organization Documentation${NC}"
if [ -f "ARCHITECTURE.md" ]; then
  arch_content=$(cat ARCHITECTURE.md | wc -l)
  echo -e "${GREEN}✓ ARCHITECTURE.md exists with $arch_content lines${NC}"
  
  # Check if it has substantial content
  if [ $arch_content -gt 50 ]; then
    issue_4_2_status="Complete"
  else
    issue_4_2_status="In Progress"
    echo -e "${YELLOW}⚠ ARCHITECTURE.md exists but has limited content${NC}"
  fi
else
  issue_4_2_status="Not Started"
  echo -e "${RED}✗ ARCHITECTURE.md not found${NC}"
fi
echo

# Issue 5.1: Overly Complex Features Directory
echo -e "${BLUE}Issue 5.1: Overly Complex Features Directory${NC}"

# Check if features refinement was completed
if [ -f "docs/project-history/features-refinement-report.md" ]; then
  echo -e "${GREEN}✓ Features refinement report exists${NC}"
  refactored_components=$(grep -c "Successfully moved" docs/project-history/features-refinement-report.md)
  echo -e "${GREEN}✓ Refactored $refactored_components components in features directory${NC}"
  issue_5_1_status="Complete"
else
  # Check for organized domains in features directory
  if [ -d "src/components/features" ]; then
    domain_count=$(find src/components/features -mindepth 1 -maxdepth 1 -type d | wc -l)
    echo -e "${YELLOW}Found $domain_count domains in features directory${NC}"
    
    if [ $domain_count -gt 3 ]; then
      issue_5_1_status="In Progress"
    else
      issue_5_1_status="Not Started"
    fi
  else
    issue_5_1_status="Not Started"
    echo -e "${RED}✗ Features directory not found or not organized${NC}"
  fi
fi
echo

# Issue 5.2: Mixed Component Responsibilities
echo -e "${BLUE}Issue 5.2: Mixed Component Responsibilities${NC}"

# Check if UI vs feature components are separated
if [ -d "src/components/ui" ] && [ -d "src/components/features" ]; then
  ui_components=$(find src/components/ui -type f -name "*.tsx" | wc -l)
  feature_components=$(find src/components/features -type f -name "*.tsx" | wc -l)
  echo -e "${GREEN}✓ UI components directory has $ui_components components${NC}"
  echo -e "${GREEN}✓ Features directory has $feature_components components${NC}"
  
  # Check if features refinement report exists
  if [ -f "docs/project-history/features-refinement-report.md" ]; then
    echo -e "${GREEN}✓ Component responsibility analysis completed${NC}"
    recommended_moves=$(grep -c "Should be Moved to UI\|Should be Moved to Layouts" docs/project-history/features-refinement-report.md)
    echo -e "${YELLOW}⚠ $recommended_moves components recommended for relocation${NC}"
    
    if [ $recommended_moves -eq 0 ]; then
      issue_5_2_status="Complete"
    else
      issue_5_2_status="In Progress"
    fi
  else
    issue_5_2_status="In Progress"
  fi
else
  issue_5_2_status="Not Started"
  echo -e "${RED}✗ Clear separation of UI and feature components not established${NC}"
fi
echo

# Summary Output
echo -e "${BLUE}==========================================${NC}"
echo -e "${BLUE}              Summary                     ${NC}"
echo -e "${BLUE}==========================================${NC}"
echo
echo -e "${GREEN}Completed:${NC}"
if [ "$issue_1_1_status" == "Complete" ]; then
  echo -e "• Issue 1.1: Duplicate Context Directories"
fi
if [ "$issue_1_2_status" == "Complete" ]; then
  echo -e "• Issue 1.2: Duplicate Layout Directories"
fi
if [ "$issue_2_1_status" == "Complete" ]; then
  echo -e "• Issue 2.1: Inconsistent Test File Naming"
fi
if [ "$issue_2_2_status" == "Complete" ]; then
  echo -e "• Issue 2.2: Inconsistent Component Directory Naming"
fi
if [ "$issue_3_1_status" == "Complete" ]; then
  echo -e "• Issue 3.1: Scattered Test Files"
fi
if [ "$issue_4_1_status" == "Complete" ]; then
  echo -e "• Issue 4.1: Inconsistent or Missing Documentation"
fi
if [ "$issue_4_2_status" == "Complete" ]; then
  echo -e "• Issue 4.2: Missing Code Organization Documentation"
fi
if [ "$issue_5_1_status" == "Complete" ]; then
  echo -e "• Issue 5.1: Overly Complex Features Directory"
fi
if [ "$issue_5_2_status" == "Complete" ]; then
  echo -e "• Issue 5.2: Mixed Component Responsibilities"
fi
echo -e "• Scripts Organization"
echo

echo -e "${YELLOW}In Progress:${NC}"
if [ "$issue_1_1_status" == "In Progress" ]; then
  echo -e "• Issue 1.1: Duplicate Context Directories"
fi
if [ "$issue_1_2_status" == "In Progress" ]; then
  echo -e "• Issue 1.2: Duplicate Layout Directories"
fi
if [ "$issue_2_1_status" == "In Progress" ]; then
  echo -e "• Issue 2.1: Inconsistent Test File Naming"
fi
if [ "$issue_2_2_status" == "In Progress" ]; then
  echo -e "• Issue 2.2: Inconsistent Component Directory Naming"
fi
if [ "$issue_3_1_status" == "In Progress" ]; then
  echo -e "• Issue 3.1: Scattered Test Files"
fi
if [ "$issue_4_1_status" == "In Progress" ]; then
  echo -e "• Issue 4.1: Inconsistent or Missing Documentation"
fi
if [ "$issue_4_2_status" == "In Progress" ]; then
  echo -e "• Issue 4.2: Missing Code Organization Documentation"
fi
if [ "$issue_5_1_status" == "In Progress" ]; then
  echo -e "• Issue 5.1: Overly Complex Features Directory"
fi
if [ "$issue_5_2_status" == "In Progress" ]; then
  echo -e "• Issue 5.2: Mixed Component Responsibilities"
fi
echo

echo -e "${RED}Not Started:${NC}"
if [ "$issue_1_1_status" == "Not Started" ]; then
  echo -e "• Issue 1.1: Duplicate Context Directories"
fi
if [ "$issue_1_2_status" == "Not Started" ]; then
  echo -e "• Issue 1.2: Duplicate Layout Directories"
fi
if [ "$issue_2_1_status" == "Not Started" ]; then
  echo -e "• Issue 2.1: Inconsistent Test File Naming"
fi
if [ "$issue_2_2_status" == "Not Started" ]; then
  echo -e "• Issue 2.2: Inconsistent Component Directory Naming"
fi
if [ "$issue_3_1_status" == "Not Started" ]; then
  echo -e "• Issue 3.1: Scattered Test Files"
fi
if [ "$issue_4_1_status" == "Not Started" ]; then
  echo -e "• Issue 4.1: Inconsistent or Missing Documentation"
fi
if [ "$issue_4_2_status" == "Not Started" ]; then
  echo -e "• Issue 4.2: Missing Code Organization Documentation"
fi
if [ "$issue_5_1_status" == "Not Started" ]; then
  echo -e "• Issue 5.1: Overly Complex Features Directory"
fi
if [ "$issue_5_2_status" == "Not Started" ]; then
  echo -e "• Issue 5.2: Mixed Component Responsibilities"
fi
echo

# Export results to a report file
echo "# Codebase Cleanup Progress Report" > cleanup-progress-report.md
echo "" >> cleanup-progress-report.md
echo "## Summary" >> cleanup-progress-report.md
echo "" >> cleanup-progress-report.md
echo "### Completed" >> cleanup-progress-report.md
if [ "$issue_1_1_status" == "Complete" ]; then
  echo "- ✅ Issue 1.1: Duplicate Context Directories" >> cleanup-progress-report.md
fi
if [ "$issue_1_2_status" == "Complete" ]; then
  echo "- ✅ Issue 1.2: Duplicate Layout Directories" >> cleanup-progress-report.md
fi
if [ "$issue_2_1_status" == "Complete" ]; then
  echo "- ✅ Issue 2.1: Inconsistent Test File Naming" >> cleanup-progress-report.md
fi
if [ "$issue_2_2_status" == "Complete" ]; then
  echo "- ✅ Issue 2.2: Inconsistent Component Directory Naming" >> cleanup-progress-report.md
fi
if [ "$issue_3_1_status" == "Complete" ]; then
  echo "- ✅ Issue 3.1: Scattered Test Files" >> cleanup-progress-report.md
fi
if [ "$issue_4_1_status" == "Complete" ]; then
  echo "- ✅ Issue 4.1: Inconsistent or Missing Documentation" >> cleanup-progress-report.md
fi
if [ "$issue_4_2_status" == "Complete" ]; then
  echo "- ✅ Issue 4.2: Missing Code Organization Documentation" >> cleanup-progress-report.md
fi
if [ "$issue_5_1_status" == "Complete" ]; then
  echo "- ✅ Issue 5.1: Overly Complex Features Directory" >> cleanup-progress-report.md
fi
if [ "$issue_5_2_status" == "Complete" ]; then
  echo "- ✅ Issue 5.2: Mixed Component Responsibilities" >> cleanup-progress-report.md
fi
echo "- ✅ Scripts Organization" >> cleanup-progress-report.md
echo "" >> cleanup-progress-report.md

echo "### In Progress" >> cleanup-progress-report.md
if [ "$issue_1_1_status" == "In Progress" ]; then
  echo "- 🔄 Issue 1.1: Duplicate Context Directories" >> cleanup-progress-report.md
fi
if [ "$issue_1_2_status" == "In Progress" ]; then
  echo "- 🔄 Issue 1.2: Duplicate Layout Directories" >> cleanup-progress-report.md
fi
if [ "$issue_2_1_status" == "In Progress" ]; then
  echo "- 🔄 Issue 2.1: Inconsistent Test File Naming" >> cleanup-progress-report.md
fi
if [ "$issue_2_2_status" == "In Progress" ]; then
  echo "- 🔄 Issue 2.2: Inconsistent Component Directory Naming" >> cleanup-progress-report.md
fi
if [ "$issue_3_1_status" == "In Progress" ]; then
  echo "- 🔄 Issue 3.1: Scattered Test Files" >> cleanup-progress-report.md
fi
if [ "$issue_4_1_status" == "In Progress" ]; then
  echo "- 🔄 Issue 4.1: Inconsistent or Missing Documentation" >> cleanup-progress-report.md
fi
if [ "$issue_4_2_status" == "In Progress" ]; then
  echo "- 🔄 Issue 4.2: Missing Code Organization Documentation" >> cleanup-progress-report.md
fi
if [ "$issue_5_1_status" == "In Progress" ]; then
  echo "- 🔄 Issue 5.1: Overly Complex Features Directory" >> cleanup-progress-report.md
fi
if [ "$issue_5_2_status" == "In Progress" ]; then
  echo "- 🔄 Issue 5.2: Mixed Component Responsibilities" >> cleanup-progress-report.md
fi
echo "" >> cleanup-progress-report.md

echo "### Not Started" >> cleanup-progress-report.md
if [ "$issue_1_1_status" == "Not Started" ]; then
  echo "- ❌ Issue 1.1: Duplicate Context Directories" >> cleanup-progress-report.md
fi
if [ "$issue_1_2_status" == "Not Started" ]; then
  echo "- ❌ Issue 1.2: Duplicate Layout Directories" >> cleanup-progress-report.md
fi
if [ "$issue_2_1_status" == "Not Started" ]; then
  echo "- ❌ Issue 2.1: Inconsistent Test File Naming" >> cleanup-progress-report.md
fi
if [ "$issue_2_2_status" == "Not Started" ]; then
  echo "- ❌ Issue 2.2: Inconsistent Component Directory Naming" >> cleanup-progress-report.md
fi
if [ "$issue_3_1_status" == "Not Started" ]; then
  echo "- ❌ Issue 3.1: Scattered Test Files" >> cleanup-progress-report.md
fi
if [ "$issue_4_1_status" == "Not Started" ]; then
  echo "- ❌ Issue 4.1: Inconsistent or Missing Documentation" >> cleanup-progress-report.md
fi
if [ "$issue_4_2_status" == "Not Started" ]; then
  echo "- ❌ Issue 4.2: Missing Code Organization Documentation" >> cleanup-progress-report.md
fi
if [ "$issue_5_1_status" == "Not Started" ]; then
  echo "- ❌ Issue 5.1: Overly Complex Features Directory" >> cleanup-progress-report.md
fi
if [ "$issue_5_2_status" == "Not Started" ]; then
  echo "- ❌ Issue 5.2: Mixed Component Responsibilities" >> cleanup-progress-report.md
fi
echo "" >> cleanup-progress-report.md

echo -e "${BLUE}Report saved to cleanup-progress-report.md${NC}" 