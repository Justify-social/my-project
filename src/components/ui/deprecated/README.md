# Deprecated

This directory contains components that are on a path to deprecation but are maintained for backward compatibility.

Components in this directory should not be used in new code. Instead, refer to their replacements in the atomic design structure.

## Guidelines

- Do not add new components to this directory
- All components here should have a clear migration path
- Keep documentation up-to-date with alternatives
- Add deprecation notices to all exports

## Deprecation Process

1. Move component to atomic design structure
2. Create backward compatibility re-exports
3. Add deprecation notice in JSDoc
4. After sufficient time (2-3 releases), move original to deprecated/
5. Eventually remove after all code has migrated 