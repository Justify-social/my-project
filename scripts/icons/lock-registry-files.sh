#!/bin/bash

# Script to make registry files read-only to ensure they remain the source of truth
# This applies multiple protection methods for macOS

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

# Loop through each file and make it read-only using multiple methods
for file in "${REGISTRY_FILES[@]}"; do
  # Check if file exists
  if [ -f "$file" ]; then
    echo "Processing: $file"
    
    # Get current permissions
    CURRENT_PERMS=$(stat -f "%OLp" "$file")
    echo "  Current permissions: $CURRENT_PERMS"
    
    # Method 1: Make file read-only for everyone using chmod
    chmod 444 "$file"
    
    # Method 2: Set the immutable flag (requires sudo)
    echo "  Setting immutable flag (may require password)..."
    sudo chflags schg "$file"
    
    # Method 3: Apply macOS ACLs to deny write permissions
    echo "  Setting ACL to deny write permissions..."
    sudo chmod +a "everyone deny write" "$file"
    
    # Verify file permissions
    IMMUTABLE=$(ls -lO "$file" | grep -o "schg")
    NEW_PERMS=$(stat -f "%OLp" "$file")
    ACL=$(ls -le "$file" | grep -o "everyone deny write")
    
    echo "  New file status:"
    echo "    - Permissions: $NEW_PERMS"
    echo "    - Immutable flag: ${IMMUTABLE:-not set}"
    echo "    - ACL deny write: ${ACL:-not set}"
    
    # Create a backup of the file for safety
    mkdir -p "public/static/icon-registry-backup"
    cp "$file" "public/static/icon-registry-backup/$(basename $file).backup"
    echo "  Created backup: public/static/icon-registry-backup/$(basename $file).backup"
    
    echo "  ✅ Successfully locked: $file is now read-only"
  else
    echo "⚠️ File not found: $file"
  fi
done

echo ""
echo "🔐 Registry files are now locked as read-only"
echo ""
echo "To unlock in the future, run these commands:"
echo "  sudo chflags noschg [filename]    # Remove immutable flag"
echo "  sudo chmod -a 'everyone deny write' [filename]  # Remove ACL"
echo "  chmod 644 [filename]              # Restore normal permissions" 