# Environment Configuration

This directory contains environment variable configurations for the application. Root-level `.env` files are symbolic links to these canonical files.

## Files

- `.env` - Base environment variables used across all environments
- `.env.local` - Local development environment variables (not committed to version control)
- `.env.example` - Example environment variables with documentation (committed to version control)

## Usage

Environment variables are accessed through the central configuration system:

```javascript
import { config } from '@/config';

// Access environment-specific configurations
console.log(config.database.host); // Will use the appropriate value based on environment
```

## Guidelines

1. **Never** store sensitive values in committed files
2. Keep `.env.example` up to date with all required variables
3. Document each variable with a comment in `.env.example`
4. Use prefixes (e.g., `NEXT_PUBLIC_`) consistently
