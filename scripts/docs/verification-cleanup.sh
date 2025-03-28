#!/bin/bash

echo "Starting final cleanup of verification directory..."

# Create proper archives structure if it doesn't exist
mkdir -p docs/verification/archives

# Move all old reports to archives
mv docs/verification/tracking/progress-report-2025-03-27.md docs/verification/archives/ 2>/dev/null
mv docs/verification/tracking/baselines/baseline-2025-03-27.json docs/verification/archives/ 2>/dev/null
mv docs/verification/tracking/baselines/latest.json docs/verification/archives/ 2>/dev/null

# Remove directories that are now redundant
echo "Removing temporary and redundant directories..."
rm -rf docs/verification/temp 2>/dev/null
rm -rf docs/verification/clean 2>/dev/null

# Remove empty directories
find docs/verification -type d -empty -delete

echo "Cleanup complete! The verification directory has been successfully reorganized."
echo "Main documentation files are now directly in the verification directory."
echo "Historical files have been moved to the archives subdirectory."
echo ""
echo "Directory structure:"
find docs/verification -type f -not -path "*/\.*" | sort 