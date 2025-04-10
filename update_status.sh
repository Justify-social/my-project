#!/bin/bash

# Directory to search within
TARGET_DIR="/Users/edadams/my-project/src/components/ui"
# String to find
OLD_STATUS="@status stable"
# String to replace with
NEW_STATUS="@status 10th April"

# Check if the target directory exists
if [ ! -d "$TARGET_DIR" ]; then
  echo "Error: Directory '$TARGET_DIR' not found."
  exit 1
fi

echo "Searching for files in '$TARGET_DIR'..."

# Find all files in the target directory (recursively)
# For each file, replace the string using perl, creating a backup (.bak)
find "$TARGET_DIR" -type f -exec perl -pi.bak -e "s/\Q$OLD_STATUS\E/$NEW_STATUS/g" {} +

echo "Replacement process complete."
echo "Backup files have been created with the .bak extension."
echo "Please review the changes."

exit 0 