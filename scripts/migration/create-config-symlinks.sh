#!/bin/bash

# Script to implement SSOT for configuration files using symbolic links
# 
# This script:
# 1. Creates necessary directories in /config
# 2. Copies configuration files to their proper locations (if not already there)
# 3. Creates symbolic links from the root directory to the config directory

set -e # Exit on any error
ROOT_DIR=$(pwd)
echo "Starting SSOT migration in $ROOT_DIR"

# Create necessary directories
echo "Creating config directories..."
mkdir -p config/git config/npm config/eslint config/prettier config/postcss config/ui config/cypress config/jest config/middleware config/server config/prisma config/sentry config/platform/next config/tailwind

# Function to create symlink
create_symlink() {
    source_file=$1
    target_dir=$2
    target_file=$3
    
    # If target file doesn't exist, copy the source file
    if [ ! -f "$target_dir/$target_file" ]; then
        echo "Copying $source_file to $target_dir/$target_file"
        cp "$source_file" "$target_dir/$target_file"
    else
        echo "$target_dir/$target_file already exists, not overwriting"
    fi
    
    # Remove source file if it's not already a symlink to our target
    if [ -L "$source_file" ]; then
        existing_target=$(readlink "$source_file")
        if [ "$existing_target" == "$target_dir/$target_file" ]; then
            echo "$source_file is already linked to $target_dir/$target_file"
            return
        else
            echo "Removing existing symlink $source_file (was pointing to $existing_target)"
            rm "$source_file"
        fi
    elif [ -f "$source_file" ]; then
        echo "Removing original file $source_file"
        rm "$source_file"
    fi
    
    # Create the symlink
    echo "Creating symlink $source_file -> $target_dir/$target_file"
    ln -s "$target_dir/$target_file" "$source_file"
}

echo "Processing ESLint configuration..."
create_symlink ".eslintignore" "config/eslint" ".eslintignore"
create_symlink ".eslintrc.js" "config/eslint" "eslintrc.js"
create_symlink ".eslintrc.json" "config/eslint" "eslintrc.json"
create_symlink "eslint.config.mjs" "config/eslint" "eslint.config.mjs"

echo "Processing Git configuration..."
create_symlink ".gitignore" "config/git" ".gitignore"

echo "Processing npm configuration..."
create_symlink ".npmrc" "config/npm" ".npmrc"

echo "Processing Prettier configuration..."
create_symlink ".prettierrc.json" "config/prettier" ".prettierrc.json"

echo "Processing UI component configuration..."
create_symlink "components.json" "config/ui" "components.json"

echo "Processing test configuration..."
create_symlink "cypress.config.js" "config/cypress" "cypress.config.js"
create_symlink "jest.config.js" "config/jest" "jest.config.js"
create_symlink "jest.setup.js" "config/jest" "jest.setup.js"

echo "Processing Next.js configuration..."
create_symlink "middleware.ts" "config/middleware" "middleware.ts"
# Note: next-env.d.ts is kept in root (Next.js requires this)
create_symlink "next.config.js" "config/platform/next" "index.js"

echo "Processing CSS configuration..."
create_symlink "postcss.config.mjs" "config/postcss" "postcss.config.mjs"
create_symlink "tailwind.config.js" "config/tailwind" "tailwind.config.js"
create_symlink "tailwind.config.ts" "config/tailwind" "tailwind.config.ts"

echo "Processing database configuration..."
create_symlink "schema.prisma" "config/prisma" "schema.prisma"

echo "Processing monitoring configuration..."
create_symlink "sentry.config.ts" "config/sentry" "sentry.config.ts"
create_symlink "sentry.edge.config.ts" "config/sentry" "sentry.edge.config.ts"
create_symlink "sentry.server.config.ts" "config/sentry" "sentry.server.config.ts"

echo "Processing server configuration..."
create_symlink "server.ts" "config/server" "server.ts"

echo "Processing deployment configuration..."
create_symlink "vercel.json" "config/vercel" "vercel.json"

echo "SSOT migration complete!"
echo "✅ All configuration files have been moved to /config and symbolic links created."
echo "⚠️ Remember to verify that everything works by running tests, builds, and linting." 