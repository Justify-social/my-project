#!/bin/bash

# Icon System Migration Script
# Automates the process of scanning for and migrating legacy icon references
# to the new standardized iconId format

# Text styling
BOLD='\033[1m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BOLD}${BLUE}📊 Icon System Migration Tool${NC}"
echo -e "${BLUE}============================${NC}\n"

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is required but not installed. Please install Node.js first.${NC}"
    exit 1
fi

# Make script executable
chmod +x scripts/icons/scan-legacy-references.mjs
chmod +x scripts/icons/migrate-icons.mjs

# Step 1: Run the scan to identify all legacy references
echo -e "${BOLD}Step 1: Scanning codebase for legacy icon references${NC}"
node scripts/icons/scan-legacy-references.mjs

# Check if the scan was successful
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Scan failed. Aborting migration.${NC}"
    exit 1
fi

# Step 2: Ask if user wants to proceed with migration
echo -e "\n${BOLD}${YELLOW}Do you want to proceed with migration?${NC}"
echo -e "  1) Migrate top 10 files with most legacy references"
echo -e "  2) Run a dry run on all files"
echo -e "  3) Migrate all files (with backup)"
echo -e "  4) Exit without migrating"
read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo -e "\n${BOLD}${BLUE}Migrating top 10 files...${NC}"
        node scripts/icons/migrate-icons.mjs --top-10
        ;;
    2)
        echo -e "\n${BOLD}${BLUE}Running dry run on all files...${NC}"
        node scripts/icons/migrate-icons.mjs --auto
        ;;
    3)
        echo -e "\n${BOLD}${YELLOW}⚠️ This will modify files across your codebase. Backups will be created.${NC}"
        read -p "Are you sure? (y/n): " confirm
        if [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]]; then
            echo -e "\n${BOLD}${BLUE}Migrating all files...${NC}"
            node scripts/icons/migrate-icons.mjs --auto --force
        else
            echo -e "${YELLOW}Migration cancelled.${NC}"
            exit 0
        fi
        ;;
    4|*)
        echo -e "${YELLOW}Migration cancelled.${NC}"
        exit 0
        ;;
esac

# Step 3: Run the scan again to see the progress
if [ $choice -ne 4 ]; then
    echo -e "\n${BOLD}${BLUE}Running final scan to measure progress...${NC}"
    node scripts/icons/scan-legacy-references.mjs
fi

echo -e "\n${BOLD}${GREEN}✅ Migration process completed!${NC}"
echo -e "${BLUE}Review the reports in the reports/ directory for details.${NC}"

# Final instructions
echo -e "\n${BOLD}Next steps:${NC}"
echo -e "1. Check for any errors in the logs"
echo -e "2. Review the generated reports"
echo -e "3. Run tests to ensure nothing broke"
echo -e "4. For any complex cases that couldn't be automatically migrated:"
echo -e "   - See docs/icon-system-migration-guide.md for manual migration guidance"
echo -e "   - Use node scripts/icons/migrate-icons.mjs [file-path] for specific files" 