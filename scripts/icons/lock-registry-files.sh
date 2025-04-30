#!/bin/bash

# Script to make registry files read-only to ensure they remain the source of truth
# This applies multiple protection methods for macOS
# IMPORTANT: Requires sudo privileges for chflags and ACLs. Run with 'sudo ./scripts/icons/lock-registry-files.sh'

set -e # Exit immediately if a command exits with a non-zero status.

# Print header
echo "🔒 Locking registry files to make them read-only SSOT..."

# Registry files to protect
REGISTRY_FILES=(
  "public/static/app-icon-registry.json"
  "public/static/brands-icon-registry.json"
  "public/static/kpis-icon-registry.json"
  "public/static/light-icon-registry.json"
  "public/static/solid-icon-registry.json"
)

# BACKUP_DIR="public/static/icon-registry-backup"

# Create backup directory - COMMENTED OUT
# echo "Creating backup directory (if not exists) with sudo: $BACKUP_DIR"
# sudo mkdir -p "$BACKUP_DIR"

# Filter out files that don't exist
existing_files=()
for file in "${REGISTRY_FILES[@]}"; do
  if [ -f "$file" ]; then
    existing_files+=("$file")
  else
    echo "⚠️ File not found, skipping: $file" >&2
  fi
done

if [ ${#existing_files[@]} -eq 0 ]; then
  echo "No registry files found to lock. Exiting."
  exit 0
fi

echo "Processing ${#existing_files[@]} registry files..."

# --- Backup Step - COMMENTED OUT ---
# echo "--> Backing up files to $BACKUP_DIR (using sudo)..."
# backup_count=0
# for file in "${existing_files[@]}"; do
#   backup_file="$BACKUP_DIR/$(basename "$file").backup"
#   echo "  - Backing up '$file' to '$backup_file'..."
#   sudo cp "$file" "$backup_file"
#   if [ $? -ne 0 ]; then
#       echo "❌ Error: Failed to backup '$file' using sudo. Please check permissions and sudo access." >&2
#       # Consider more robust cleanup/rollback here if needed
#       exit 1
#   else
#       ((backup_count++))
#   fi
# done
#
# if [ $backup_count -eq 0 ]; then
#     echo "⚠️ No files were backed up. This might be because no existing registry files were found."
# else
#     echo "✅ Backup complete. $backup_count files backed up to $BACKUP_DIR"
#     # Optional: List the backup files - uncomment if desired
#     # echo "  Contents of backup directory:"
#     # sudo ls -l "$BACKUP_DIR"
# fi

# --- Locking Steps ---

# Method 1: Make file read-only for everyone using chmod
echo "--> Setting read-only permissions (chmod 444)..."
printf '%s\0' "${existing_files[@]}" | xargs -0 chmod 444
if [ $? -ne 0 ]; then
    echo "Error: Failed to set read-only permissions (chmod 444)." >&2
    echo "  Attempting to restore user write permissions..."
    # Use sudo if changing back permissions might need it
    printf '%s\0' "${existing_files[@]}" | sudo xargs -0 chmod u+w
    exit 1
fi
echo "  Read-only permissions set."

# Method 2: Set the immutable flag (requires sudo)
echo "--> Setting immutable flag (sudo chflags schg)..."
echo "    You may be prompted for your password."
printf '%s\0' "${existing_files[@]}" | sudo xargs -0 chflags schg
if [ $? -ne 0 ]; then
    echo "Error: Failed to set immutable flag (chflags schg)." >&2
    echo "  Attempting to restore user write permissions..."
    printf '%s\0' "${existing_files[@]}" | sudo xargs -0 chmod u+w
    exit 1
fi
echo "  Immutable flag set."

# Method 3: Apply macOS ACLs to deny write permissions (requires sudo)
# NOTE: This step might fail if ACLs are not supported/enabled on the filesystem.
echo "--> Setting ACL to deny write permissions (sudo chmod +a)..."
printf '%s\0' "${existing_files[@]}" | sudo xargs -0 chmod +a 'everyone deny write'
if [ $? -ne 0 ]; then
    echo "Warning: Failed to set ACL deny write permission (Operation not permitted?). This might be okay as chflags provides primary lock." >&2
    # Don't exit, but maybe log this. Chflags is the main goal.
    # echo "  Attempting to remove immutable flag..."
    # sudo printf '%s\0' "${existing_files[@]}" | xargs -0 chflags noschg
    # echo "  Attempting to restore user write permissions..."
    # printf '%s\0' "${existing_files[@]}" | sudo xargs -0 chmod u+w
    # exit 1
else
echo "  ACL deny write set."
fi

echo ""
echo "✅ Successfully locked ${#existing_files[@]} registry files (chflags immutable set)."
echo ""
echo "Remember to run this script with 'sudo ./scripts/icons/lock-registry-files.sh'"
echo "To unlock in the future, run unlock-registry-files.sh (or manually adjust commands for specific files):"
echo "  sudo chflags noschg [filename] ...    # Remove immutable flag"
echo "  sudo chmod -a 'everyone deny write' [filename] ... # Remove ACL (if set)"
echo "  chmod u+w [filename] ...            # Restore user write permissions"

exit 0 