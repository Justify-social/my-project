#!/bin/bash

# Script to make all component preview files read-only and immutable (lock them).
# This prevents modification AND deletion/renaming.
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
files_to_lock=()
while IFS= read -r -d $'\0' file; do
    files_to_lock+=("$file")
done < <(find "$TARGET_DIR" -type f -print0)

if [ ${#files_to_lock[@]} -eq 0 ]; then
  echo "No files found in $TARGET_DIR. Nothing to lock."
  exit 0
fi

echo "Found ${#files_to_lock[@]} files to lock in $TARGET_DIR..."

# 1. Set permissions to 444 (read-only for all)
echo "--> Setting read-only permissions (chmod 444)..."
printf '%s\0' "${files_to_lock[@]}" | xargs -0 chmod 444
if [ $? -ne 0 ]; then
  echo "Error: Failed to set read-only permissions (chmod 444)." >&2
  echo "  Attempting to restore user write permissions on original files..."
  printf '%s\0' "${files_to_lock[@]}" | xargs -0 chmod u+w
  exit 1
fi
echo "  Read-only permissions set."

# 2. Set system immutable flag (requires sudo)
echo "--> Setting system immutable flag (sudo chflags schg)..."
echo "    You may be prompted for your password."
printf '%s\0' "${files_to_lock[@]}" | sudo xargs -0 chflags schg
if [ $? -ne 0 ]; then
  echo "Error: Failed to set system immutable flag (chflags schg)." >&2
  echo "  Attempting to restore user write permissions..."
  printf '%s\0' "${files_to_lock[@]}" | xargs -0 chmod u+w # No sudo needed for this
  exit 1
fi
echo "  Immutable flag set."

echo "✅ Successfully locked ${#files_to_lock[@]} files in $TARGET_DIR."

exit 0
