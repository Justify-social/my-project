#!/bin/bash

# Script to unlock component preview files by removing read-only and immutable flags.
# This reverses the actions of lock-preview-components.sh.
# IMPORTANT: Requires sudo privileges for chflags.

set -e # Exit immediately if a command exits with a non-zero status.

# Define the target directory relative to the project root
TARGET_DIR="src/app/(admin)/debug-tools/ui-components/preview"

# Check if the directory exists
if [ ! -d "$TARGET_DIR" ]; then
  echo "Error: Target directory not found: $TARGET_DIR" >&2
  exit 1
fi

# Find files to process and store in an array (more portable than mapfile)
files_to_unlock=()
while IFS= read -r -d $'\0' file; do
    files_to_unlock+=("$file")
done < <(find "$TARGET_DIR" -type f -print0)

if [ ${#files_to_unlock[@]} -eq 0 ]; then
  echo "No files found in $TARGET_DIR. Nothing to unlock."
  exit 0
fi

echo "Found ${#files_to_unlock[@]} files to unlock in $TARGET_DIR..."

# 1. Remove system immutable flag (requires sudo)
echo "--> Removing system immutable flag (sudo chflags noschg)..."
echo "    You may be prompted for your password."
printf '%s\0' "${files_to_unlock[@]}" | sudo xargs -0 chflags noschg
if [ $? -ne 0 ]; then
  echo "Error: Failed to remove system immutable flag (chflags noschg)." >&2
  exit 1
fi
echo "  Immutable flag removed."

# 2. Restore user write permissions
echo "--> Restoring user write permissions (chmod u+w)..."
printf '%s\0' "${files_to_unlock[@]}" | xargs -0 chmod u+w
if [ $? -ne 0 ]; then
  echo "Error: Failed to restore user write permissions (chmod u+w)." >&2
  exit 1
fi
echo "  Write permissions restored."

echo "✅ Successfully unlocked ${#files_to_unlock[@]} files in $TARGET_DIR."

exit 0 