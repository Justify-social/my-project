// UI Component exports organized by atomic design principle
// Note: This is the main entry point for all UI components

// Atoms - Basic building blocks
export * from './atoms/button';
export * from './atoms/typography';
export * from './atoms/spinner';
export * from './atoms/icons';
export * from './atoms/image';
export * from './atoms/layout/container';
export * from './atoms/layout/divider';
export * from './atoms/layout/grid';
export * from './atoms/layout/spacer';
export * from './atoms/layout/stack';
export * from './atoms/input';
export * from './atoms/checkbox';
export * from './atoms/radio';
export * from './atoms/select';
export * from './atoms/textarea';
export * from './atoms/toggle';
export * from './atoms/tabs';

// Molecules - Combinations of atoms
export * from './molecules/breadcrumbs';
export * from './molecules/form-field';
export * from './molecules/pagination';
export * from './molecules/search-bar';
export * from './molecules/skeleton';
export * from './molecules/feedback';
export * from './molecules/search/search-params-wrapper';
export * from './molecules/search/search-results';

// Organisms - Complex UI components
export * from './organisms/Card';
export * from './organisms/Modal';
export * from './organisms/feedback';
export * from './organisms/error-fallback';
export * from './organisms/navigation/component-nav';
export * from './organisms/AssetCard';

// Utils - Shared functionality
export * from './utils/Providers';

// Legacy support (for backward compatibility)
export { Spinner as LoadingSpinner } from './atoms/spinner';

// Re-exports for backward compatibility
export * as feedback from './molecules/feedback';
export * as icons from './atoms/icons';
export * as spinner from './atoms/spinner';
