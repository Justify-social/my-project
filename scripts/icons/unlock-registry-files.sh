#!/bin/bash

# Script to make registry files writable again after being locked.
# This reverses the actions of lock-registry-files.sh
# IMPORTANT: Requires sudo privileges. Run with 'sudo ./scripts/icons/unlock-registry-files.sh'

set -e # Exit immediately if a command exits with a non-zero status.

# Print header
echo "🔓 Unlocking registry files to make them writable..."

# Registry files to unlock (should match the lock script)
REGISTRY_FILES=(
  "public/static/app-icon-registry.json"
  "public/static/brands-icon-registry.json"
  "public/static/kpis-icon-registry.json"
  "public/static/light-icon-registry.json"
  "public/static/solid-icon-registry.json"
)

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
  echo "No registry files found to unlock. Exiting."
  exit 0
fi

echo "Processing ${#existing_files[@]} registry files..."

# --- Unlocking Steps --- Must be in reverse order of locking somewhat ---

# Step 1: Remove the immutable flag (requires sudo)
# This MUST happen before changing permissions.
echo "--> Removing immutable flag (sudo chflags noschg)..."
echo "    You may be prompted for your password."
sudo printf '%s\0' "${existing_files[@]}" | sudo xargs -0 chflags noschg
if [ $? -ne 0 ]; then
    echo "Error: Failed to remove immutable flag (chflags noschg)." >&2
    echo "  Files might still be locked. Check permissions manually." >&2
    exit 1
fi
echo "  Immutable flag removed."

# Step 2: Remove macOS ACLs denying write permissions (requires sudo)
# This might fail harmlessly if ACLs weren't set or aren't supported.
echo "--> Removing ACL deny write permission (sudo chmod -a 'everyone deny write')..."
sudo printf '%s\0' "${existing_files[@]}" | sudo xargs -0 chmod -a 'everyone deny write' > /dev/null 2>&1
echo "  ACL deny write permission removed (if it existed)."

# Step 3: Restore user write permissions
echo "--> Restoring user write permissions (chmod u+w)..."
printf '%s\0' "${existing_files[@]}" | xargs -0 chmod u+w
if [ $? -ne 0 ]; then
    echo "Error: Failed to restore user write permissions (chmod u+w)." >&2
    exit 1
fi
echo "  User write permissions restored."

echo ""
echo "✅ Successfully unlocked ${#existing_files[@]} registry files."
echo "   They should now be editable by the user."

exit 0 