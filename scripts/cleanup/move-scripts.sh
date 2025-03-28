#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Moving script files to the scripts directory...${NC}"

# Create necessary directories if they don't exist
mkdir -p scripts/utils
mkdir -p scripts/testing
mkdir -p scripts/linting

# Move fix-syntax-errors.js to scripts/linting
if [ -f "./fix-syntax-errors.js" ]; then
  echo -e "Moving fix-syntax-errors.js to scripts/linting/"
  mv ./fix-syntax-errors.js ./scripts/linting/
else
  echo -e "${YELLOW}fix-syntax-errors.js not found${NC}"
fi

# Move test-npm-only.js to scripts/testing
if [ -f "./test-npm-only.js" ]; then
  echo -e "Moving test-npm-only.js to scripts/testing/"
  mv ./test-npm-only.js ./scripts/testing/font-awesome-npm-test.js
else
  echo -e "${YELLOW}test-npm-only.js not found${NC}"
fi

# Check if there are any more .sh files in the root directory
ROOT_SH_FILES=$(find . -maxdepth 1 -name "*.sh" -not -path "./.husky/*" | wc -l)
if [ "$ROOT_SH_FILES" -gt 0 ]; then
  echo -e "${YELLOW}There are still $ROOT_SH_FILES .sh files in the root directory:${NC}"
  find . -maxdepth 1 -name "*.sh" -not -path "./.husky/*" | xargs ls -la
else
  echo -e "${GREEN}No more .sh files in the root directory.${NC}"
fi

# Check if there are any more .js files in the root directory (excluding config files)
ROOT_JS_FILES=$(find . -maxdepth 1 -name "*.js" \
  -not -name "next.config.js" \
  -not -name "jest.config.js" \
  -not -name "tailwind.config.js" \
  -not -name "cypress.config.js" \
  -not -name ".eslintrc.js" \
  -not -name "jest.setup.js" \
  | wc -l)

if [ "$ROOT_JS_FILES" -gt 0 ]; then
  echo -e "${YELLOW}There are still $ROOT_JS_FILES .js files in the root directory (excluding config files):${NC}"
  find . -maxdepth 1 -name "*.js" \
    -not -name "next.config.js" \
    -not -name "jest.config.js" \
    -not -name "tailwind.config.js" \
    -not -name "cypress.config.js" \
    -not -name ".eslintrc.js" \
    -not -name "jest.setup.js" \
    | xargs ls -la
else
  echo -e "${GREEN}No more non-config .js files in the root directory.${NC}"
fi

echo -e "${GREEN}Script organization complete!${NC}" 