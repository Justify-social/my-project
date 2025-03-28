#!/bin/bash

# Set base directory
UI_DIR="src/components/ui"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Check if component name was provided
if [ -z "$1" ]; then
  echo -e "${RED}Error: Component name is required${NC}"
  echo "Usage: ./create-ui-component.sh ComponentName"
  exit 1
fi

# Get component name and validate
COMPONENT_NAME=$1
COMPONENT_DIR=$(echo "$COMPONENT_NAME" | tr '[:upper:]' '[:lower:]')

# Check if component already exists
if [ -d "$UI_DIR/$COMPONENT_DIR" ]; then
  echo -e "${RED}Error: Component $COMPONENT_NAME already exists${NC}"
  exit 1
fi

echo -e "${GREEN}Creating new UI component: $COMPONENT_NAME${NC}"

# Create directory structure
mkdir -p "$UI_DIR/$COMPONENT_DIR/styles"
mkdir -p "$UI_DIR/$COMPONENT_DIR/types"
mkdir -p "$UI_DIR/$COMPONENT_DIR/examples"

# Create index.ts
cat > "$UI_DIR/$COMPONENT_DIR/index.ts" << EOF
// Export all components from $COMPONENT_DIR
export * from './$COMPONENT_NAME';
EOF

# Create types file
cat > "$UI_DIR/$COMPONENT_DIR/types/index.ts" << EOF
// Type definitions for $COMPONENT_NAME component

export interface ${COMPONENT_NAME}Props {
  /**
   * Optional className for custom styling
   */
  className?: string;
  
  /**
   * Optional children elements
   */
  children?: React.ReactNode;
}
EOF

# Create styles file
cat > "$UI_DIR/$COMPONENT_DIR/styles/${COMPONENT_DIR}.styles.ts" << EOF
// Styles for $COMPONENT_NAME component

import { cva } from 'class-variance-authority';

export const ${COMPONENT_DIR}Styles = cva(
  // Base styles
  [
    'relative',
    // Add your base styles here
  ],
  {
    variants: {
      // Add variants here
      size: {
        sm: ['text-sm', 'py-1', 'px-2'],
        md: ['text-base', 'py-2', 'px-3'],
        lg: ['text-lg', 'py-3', 'px-4'],
      },
      variant: {
        default: ['bg-white', 'text-gray-900'],
        primary: ['bg-primary', 'text-white'],
        secondary: ['bg-secondary', 'text-white'],
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  }
);
EOF

# Create component file
cat > "$UI_DIR/$COMPONENT_DIR/$COMPONENT_NAME.tsx" << EOF
import React from 'react';
import { cn } from '@/utils/cn';
import { ${COMPONENT_DIR}Styles } from './styles/${COMPONENT_DIR}.styles';
import type { ${COMPONENT_NAME}Props } from './types';

export const $COMPONENT_NAME: React.FC<${COMPONENT_NAME}Props> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div 
      className={cn(${COMPONENT_DIR}Styles(), className)}
      {...props}
    >
      {children}
    </div>
  );
};

// Named export
export { $COMPONENT_NAME };
EOF

# Create example file
cat > "$UI_DIR/$COMPONENT_DIR/examples/index.ts" << EOF
// Export examples
export * from './${COMPONENT_NAME}Examples';
EOF

cat > "$UI_DIR/$COMPONENT_DIR/examples/${COMPONENT_NAME}Examples.tsx" << EOF
import React from 'react';
import { $COMPONENT_NAME } from '..';

export const ${COMPONENT_NAME}Examples: React.FC = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">$COMPONENT_NAME Examples</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border p-4 rounded-md">
          <h3 className="text-lg font-medium mb-2">Default</h3>
          <$COMPONENT_NAME>
            Default $COMPONENT_NAME
          </$COMPONENT_NAME>
        </div>
      </div>
    </div>
  );
};
EOF

# Create README.md
cat > "$UI_DIR/$COMPONENT_DIR/README.md" << EOF
# $COMPONENT_NAME Component

## Overview

A brief description of the $COMPONENT_NAME component and its purpose.

## Usage

\`\`\`tsx
import { $COMPONENT_NAME } from '@/components/ui';

export const MyComponent = () => {
  return (
    <$COMPONENT_NAME>
      // Content
    </$COMPONENT_NAME>
  );
};
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| className | string | undefined | Additional CSS classes |
| children | ReactNode | undefined | Component children |

## Variants

- \`size\`: \`sm\`, \`md\`, \`lg\`
- \`variant\`: \`default\`, \`primary\`, \`secondary\`

## Examples

See the \`examples\` directory for implementation examples.
EOF

# Update main index.ts to include the new component
echo -e "${YELLOW}Adding $COMPONENT_NAME to main exports...${NC}"
echo "export * from './$COMPONENT_DIR';" >> "$UI_DIR/index.ts"

echo -e "${GREEN}$COMPONENT_NAME component created successfully!${NC}"
echo -e "${GREEN}Directory: $UI_DIR/$COMPONENT_DIR${NC}"
echo -e "${YELLOW}Don't forget to update and customize the component as needed.${NC}" 