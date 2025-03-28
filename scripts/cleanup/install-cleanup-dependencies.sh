#!/bin/bash

# Install dependencies needed for cleanup scripts
npm install --save-dev glob fs-extra chalk

echo "Cleanup dependencies installed successfully."
echo "You can now run the master cleanup script: ./scripts/cleanup/finalize-codebase-cleanup.sh" 