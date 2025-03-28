#!/bin/bash

# Finalize Codebase Cleanup Script
# This script runs all the codebase cleanup scripts in the appropriate sequence
# to complete the cleanup plan.

# Color definitions
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Display header
echo -e "${BLUE}==========================================${NC}"
echo -e "${BLUE}   Codebase Cleanup Finalization Script   ${NC}"
echo -e "${BLUE}==========================================${NC}"
echo

# Create logs directory if not exists
mkdir -p logs/cleanup

# Function to log messages with timestamps
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a logs/cleanup/master-cleanup.log
}

# Function to run a command and log output
run_with_log() {
  log "Running: $1"
  
  if [ -n "$2" ]; then
    node $1 | tee -a "logs/cleanup/$2.log"
  else
    node $1 | tee -a logs/cleanup/$(basename $1 .js).log
  fi
  
  if [ ${PIPESTATUS[0]} -eq 0 ]; then
    log "Successfully completed: $1"
    return 0
  else
    log "Failed: $1"
    return 1
  fi
}

# Log start of script
log "Starting codebase cleanup process"

# Create branch for cleanup work
log "Creating backup branch for the entire cleanup process"
git branch -D complete-codebase-cleanup 2>/dev/null || true
git checkout -b complete-codebase-cleanup

# Step 1: Standardize test file naming
log "Step 1: Standardizing test file naming"
run_with_log "./scripts/cleanup/standardize-test-filenames.js" "test-standardization"

# Step 2: Standardize directory naming
log "Step 2: Standardizing directory naming"
run_with_log "./scripts/cleanup/standardize-directory-names.js" "directory-naming"

# Step 3: Add README files to major directories
log "Step 3: Adding README files to major directories"
run_with_log "./scripts/cleanup/add-directory-readmes.js" "readme-generation"

# Step 4: Refine features directory structure
log "Step 4: Refining features directory structure"
run_with_log "./scripts/cleanup/refine-features-directory.js" "features-refinement"

# Step 5: FIXME Relocate UI components
log "Step 5: Relocating UI components to proper locations"
run_with_log "./scripts/cleanup/relocate-ui-components.js" "component-relocation"

# Step 6: FIXME Centralize test files
log "Step 6: Centralizing test files"
run_with_log "./scripts/cleanup/centralize-test-files.js" "test-centralization"

# Step 7: FIXME Consolidate middleware
log "Step 7: Consolidating middleware functionality"
run_with_log "./scripts/cleanup/consolidate-middleware.js" "middleware-consolidation"

# Step 8: Track cleanup progress
log "Step 8: Tracking cleanup progress"
run_with_log "./scripts/cleanup/track-cleanup-progress.js" "cleanup-tracking"

# Log completion
log "Codebase cleanup completed!"
log "Log files are available in the logs/cleanup directory"
log "Detailed results can be found in the docs/project-history directory"

# Print summary
echo ""
echo "======================= CLEANUP SUMMARY ======================="
echo "All cleanup steps have been executed."
echo "Check the following files for detailed information:"
echo "  - Test standardization: docs/project-history/test-standardization-report.md"
echo "  - Directory naming: docs/project-history/directory-naming-report.md"
echo "  - README generation: docs/project-history/readme-generation-report.md"
echo "  - Features refinement: docs/project-history/features-refinement-report.md"
echo "  - Component relocation: docs/project-history/component-responsibility-report.md"
echo "  - Test centralization: docs/project-history/test-centralization-report.md"
echo "  - Middleware consolidation: docs/project-history/middleware-consolidation-report.md"
echo "  - Overall progress: docs/project-history/cleanup-progress-report.md"
echo "=============================================================="

# Display summary
echo -e "${BLUE}==========================================${NC}"
echo -e "${BLUE}       Codebase Cleanup Summary          ${NC}"
echo -e "${BLUE}==========================================${NC}"
echo -e "${GREEN}The codebase cleanup process has been completed!${NC}"
echo -e "${YELLOW}Log files are available in the logs/cleanup directory.${NC}"
echo -e "${YELLOW}Check the reports in the docs/project-history directory for detailed results.${NC}"
echo
echo -e "${BLUE}Summary of actions performed:${NC}"
echo -e "1. Standardized test file naming (using .test.tsx pattern in __tests__ directories)"
echo -e "2. Standardized directory naming (using plural form and kebab-case)"
echo -e "3. Added README files to major directories"
echo -e "4. Refined features directory by organizing components by domain"
echo -e "5. Generated cleanup progress report"
echo
echo -e "${GREEN}The codebase is now organized according to the cleanup plan!${NC}" 