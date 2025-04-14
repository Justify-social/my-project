# ESLint Cleanup Action Plan

## Overview

This document outlines our strategy for addressing and fixing the linting issues in the codebase. We have a two-track approach to ensure both existing code is fixed and new changes maintain quality standards.

## Two-Track Approach

### Track 1: Automated Fixes via Git Hooks (Implemented)

We've successfully set up Husky Git hooks to automatically fix and prevent new linting issues:

- **Pre-commit Hook**: ✅ Working

  - Runs ESLint auto-fixes on staged files
  - Prefixes unused variables with underscores
  - Attempts to fix `no-explicit-any` warnings when possible
  - Applies Prettier formatting

- **Pre-push Hook**: ✅ Working
  - Runs a full lint check before allowing code to be pushed
  - Blocks pushes if critical errors exist

### Track 2: Manual Cleanup of Existing Issues

We're taking a phased approach to address existing linting issues:

- **Phase 1: Critical Parsing Errors** (In Progress)

  - Fixed parsing errors in 2 files (Step1Content.tsx and Step3Content.tsx)
  - Remaining parsing errors: 13 files with similar pattern errors
  - Estimated completion: 1-2 hours

- **Phase 2: Type Safety Issues**

  - Focus on replacing `any` types with more specific types
  - Use `unknown` + type guards or specific interfaces where appropriate
  - Create a script to automatically fix common patterns
  - Estimated completion: 2-3 days

- **Phase 3: Unused Variables**

  - Automatically prefix unused variables with underscores
  - Remove entirely when safe to do so
  - Estimated completion: 1 day

- **Phase 4: React Hook Dependencies**

  - Manual review of each dependency array issue
  - Fix dependencies and restructure components where needed
  - Estimated completion: 1 day

- **Phase 5: Next.js Image Issue**
  - Replace HTML `<img>` tags with Next.js `<Image>` components
  - Requires careful refactoring for proper sizing and properties
  - Estimated completion: 1 day

## Execution Timeline

| Phase | Task                              | Timeline | Status                        |
| ----- | --------------------------------- | -------- | ----------------------------- |
| 0     | Setup Husky Hooks                 | Week 1   | ✅ Complete                   |
| 1     | Fix Critical Parsing Errors       | Week 1-2 | 🔄 In Progress (15% complete) |
| 2     | Fix Type Safety Issues            | Week 2-3 | ⏳ Not Started                |
| 3     | Fix Unused Variables              | Week 3-4 | ⏳ Not Started                |
| 4     | Fix React Hook Dependencies       | Week 4-5 | ⏳ Not Started                |
| 5     | Fix Next.js Image Issues          | Week 5-6 | ⏳ Not Started                |
| 6     | Final Review and Remaining Issues | Week 7   | ⏳ Not Started                |

## Maintenance Plan

1. **Continuous Enforcement**: Husky hooks will auto-fix issues and prevent new ones from being introduced
2. **Regular Checks**: Monthly lint audit to catch any systematic issues
3. **Team Training**: Documentation and knowledge sharing on common linting issues

## Progress Tracking

Progress will be tracked in the `docs/verification/lint-fix-progress/lint-audit.md` file.

## Current Status (April 5, 2024)

- Total issues: 597 (46 errors, 551 warnings)
- Critical parsing errors fixed: 2 files
- Remaining critical parsing errors: 13 files
- Automated fixes functioning through Husky pre-commit hook

## Next Immediate Steps

1. Fix the remaining critical parsing errors one by one
2. Create a comprehensive script to handle unused variables with automated prefixing
3. Create a comprehensive script or approach for handling explicit `any` types
