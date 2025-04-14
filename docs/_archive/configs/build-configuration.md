# Build Configuration Reference

This document provides a reference for the build configuration used in the project.

## Configuration Location

Build configurations are centralized in the `/config` directory:

- `/config/platform/next/` - Next.js build configuration
- `/config/webpack/` - Webpack specific configuration
- `/config/postcss/` - PostCSS configuration
- `/config/tailwind/` - Tailwind CSS configuration

## Next.js Configuration

Next.js is configured in a modular way in `/config/platform/next/`:

### Module Structure

- `index.js` - Main configuration that imports and composes all modules
- `module/webpack.js` - Webpack customization
- `module/images.js` - Image optimization settings
- `module/paths.js` - Path aliases and routing configuration

## Webpack Configuration

Webpack is customized for different environments:

### Development Configuration

```javascript
// Development-specific webpack settings
if (dev) {
  config.devtool = 'eval-source-map';
  config.plugins.push(new ReactRefreshWebpackPlugin());
}
```

### Production Configuration

```javascript
// Production optimizations
if (!dev) {
  config.optimization.minimize = true;
  config.optimization.minimizer.push(
    new TerserPlugin({
      terserOptions: {
        compress: { drop_console: true },
      },
    })
  );
}
```

## Build Scripts

Build processes are managed through npm scripts in `package.json`:

| Script          | Description                       |
| --------------- | --------------------------------- |
| `build`         | Production build                  |
| `build:analyze` | Build with bundle analysis        |
| `prebuild`      | Runs validation before building   |
| `postbuild`     | Runs optimizations after building |

## Environment-specific Builds

The build process adapts based on the `NODE_ENV` environment variable:

- `development` - Includes source maps, hot reloading
- `test` - Optimized for test environment
- `production` - Full optimization, no source maps

## Path Aliases

The build system uses path aliases to simplify imports:

```javascript
// Configured path aliases
const pathAliases = {
  '@/components': path.join(ROOT_DIR, 'src/components'),
  '@/lib': path.join(ROOT_DIR, 'src/lib'),
  '@/utils': path.join(ROOT_DIR, 'src/utils'),
  '@/hooks': path.join(ROOT_DIR, 'src/hooks'),
  '@/app': path.join(ROOT_DIR, 'src/app'),
  '@/config': path.join(ROOT_DIR, 'config'),
};
```

## Tree Shaking

The build system is configured for optimal tree shaking:

- ESM modules are preferred for better tree shaking
- Side-effect-free modules are marked in package.json
- Webpack is configured to remove dead code

## Image Optimization

Next.js image optimization is configured with:

```javascript
// Image optimization configuration
const imagesConfig = {
  remotePatterns: [
    { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    { protocol: 'https', hostname: 'images.unsplash.com' },
  ],
  formats: ['image/webp', 'image/avif'],
  minimumCacheTTL: 60 * 60 * 24,
};
```

## PostCSS Configuration

PostCSS is configured in `/config/postcss/index.js`:

```javascript
module.exports = {
  plugins: [
    'tailwindcss',
    'autoprefixer',
    process.env.NODE_ENV === 'production' ? 'cssnano' : null,
  ].filter(Boolean),
};
```

## Extending the Build Configuration

To extend or modify the build configuration:

1. Determine which module is responsible for the setting
2. Create or modify the appropriate file in `/config/platform/next/module/`
3. Update the module exports in `/config/platform/next/index.js`
