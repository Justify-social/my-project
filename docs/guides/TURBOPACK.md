# Turbopack Configuration Guide

This project supports both Webpack and Turbopack as build tools. By default, Webpack is used, but you can switch to Turbopack for faster development builds.

## How to Enable Turbopack

### Option 1: Using Environment Variable (Recommended)

1. Edit `.env.local` file (create it if it doesn't exist):

   ```
   USE_TURBOPACK=true
   ```

2. Run the development server normally:
   ```bash
   npm run dev
   ```

### Option 2: Temporary Usage

You can enable Turbopack for a single run without modifying files:

```bash
USE_TURBOPACK=true npm run dev
```

## Configuration Details

The project is set up to automatically handle Turbopack vs Webpack conflicts:

1. In `next.config.js`, Turbopack is enabled conditionally:

   ```javascript
   experimental: {
     turbo: process.env.USE_TURBOPACK === "true" ? {} : undefined,
   }
   ```

2. The `dev` script clears the `.next` cache before starting to prevent stale configuration issues:
   ```json
   "dev": "rm -rf .next && next dev"
   ```

## Troubleshooting

If you encounter issues with Turbopack:

1. Try clearing the cache manually:

   ```bash
   rm -rf .next
   ```

2. Switch back to Webpack by commenting out `USE_TURBOPACK=true` in `.env.local`

3. If the issue persists, edit `next.config.js` to uncomment the webpack specific configuration.

## Performance Comparison

- **Turbopack**: Faster initial builds and faster refresh times, but may have compatibility issues with some packages.
- **Webpack**: More stable with broader compatibility, but slower builds and refresh times.

Choose the tool that fits your development workflow.
