# Campaign Draft Saving

**Last Updated:** 2023-07-15  
**Status:** Active

## Overview

The draft saving feature allows users to save incomplete campaign forms at any step in the wizard and return to them later.

## How It Works

1. Click the "Save as Draft" button in any wizard step
2. The system stores your current progress without requiring all fields to be complete
3. Access your saved drafts from the Campaign List page

## Key Benefits

- **No data loss**: Save work at any point and continue later
- **No validation barriers**: Unlike submission, drafts don't require complete data
- **Quick iterations**: Test different campaign configurations without commitment

## Technical Implementation

The draft saving system uses specialized validation schemas that are more permissive than those used for final submissions.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Draft not saving | Check that at least the campaign name is entered |
| Missing fields after reload | Some fields like dates require special formatting - contact support |
| "Failed to save draft" error | Try again or save with minimal information first |

## Best Practices

- Save drafts regularly during complex campaign creation
- Complete each section fully before moving to the next when possible
- Use meaningful campaign names for easy identification of drafts 