/**
 * @deprecated This directory is deprecated and will be removed in a future release.
 * Please update imports to use @/components/ui/error-fallback instead.
 * 
 * This is a re-export file for backward compatibility.
 */

// Re-export everything from the new location
export * from '@/components/ui/error-fallback';

// Also re-export the default export if any
import DefaultExport from '@/components/ui/error-fallback';
export default DefaultExport;
