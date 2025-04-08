#!/bin/bash

# Script to archive registry backup files
# This is part of Task 3.2 in the UI Rendering Plan

# Set the date for the archive directory
ARCHIVE_DATE=$(date +"%Y-%m-%d")
ARCHIVE_DIR="public/static/archive/$ARCHIVE_DATE"

echo "Starting registry file archiving process..."

# Create archive directory if it doesn't exist
mkdir -p "$ARCHIVE_DIR"
echo "Created archive directory: $ARCHIVE_DIR"

# Move backup files to archive
if [ -d "public/static/icon-registry-backup" ]; then
  echo "Moving icon-registry-backup to archive..."
  mv public/static/icon-registry-backup/* "$ARCHIVE_DIR/"
  rmdir public/static/icon-registry-backup
  echo "Moved backup files and removed backup directory"
fi

# Move staging files to the archive directory
for file in public/static/new-*-icon-registry.json; do
  if [ -f "$file" ]; then
    FILENAME=$(basename "$file")
    echo "Archiving staging file: $FILENAME"
    cp "$file" "$ARCHIVE_DIR/$FILENAME"
    echo "Copied staging file to archive"
  fi
done

# List archived files
echo "Archived files:"
ls -la "$ARCHIVE_DIR"

echo "Registry archiving complete!"
echo "All backup files have been archived to: $ARCHIVE_DIR"