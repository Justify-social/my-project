#!/bin/bash
# show_files.sh: Print each file's name and contents.

if [ "$#" -eq 0 ]; then
  echo "Usage: $0 file1 [file2 ...]"
  exit 1
fi

for file in "$@"; do
  echo "=================================================="
  echo "File: $file"
  echo "=================================================="
  if [ -f "$file" ]; then
    cat "$file"
  else
    echo "Error: File not found: $file"
  fi
  echo ""  # Print an extra newline for spacing
done
