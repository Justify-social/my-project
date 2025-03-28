# Manual Linting Issues Report
Generated on: 2025-03-27

## Overview

This document outlines linting issues that require manual fixes, as they cannot be safely addressed through automated tools. It serves as a guide for developers to systematically address these issues as part of the unification project.

## Priority Issues

### Type 'any' Usage Issues
- 121 files with 'any' type usage (386 occurrences)
- Reference: [any-type-usage-report.md](./any-type-usage-report.md)
- Status: Requires manual attention to replace with appropriate TypeScript types

### React Hook Dependency Issues
- Hook dependency patterns have been fully fixed
- No remaining issues detected

### Accessibility Issues
- Detected multiple instances of elements that need accessibility improvements:
  - Non-semantic click handlers (div with onClick)
  - Missing alt attributes on images
  - Improper use of ARIA attributes

## Resolution Strategy

### For 'any' Type Issues:
1. Start with API routes and service interfaces
2. Properly type API response interfaces
3. Focus on campaign-related code which has highest concentration of 'any' types
4. Establish appropriate interfaces for complex data structures
5. Create utility types for common patterns

### For Accessibility Issues:
1. Replace div onClick handlers with proper button elements
2. Ensure all images have appropriate alt text
3. Add proper keyboard navigation support
4. Implement appropriate ARIA attributes
5. Validate with accessibility testing tools

## Documentation Updates

After completing these manual fixes, we will:

1. Update the linting guide with examples of proper type usage
2. Document common accessibility patterns
3. Add type definitions to API documentation
4. Create PR templates that include accessibility and type checks

## Timeline

We estimate that addressing these manual linting issues will require approximately 2-3 sprint cycles, with priority given to fixing the most critical issues that impact functionality first.

## Next Steps

1. Create Jira tickets for each category of manual fixes
2. Assign developers to specific sections of the codebase
3. Set up regular code reviews focused on type safety
4. Implement automated accessibility testing in CI pipeline 