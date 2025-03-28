/**
 * @deprecated This directory is deprecated and will be removed in a future release.
 * Please update imports to use @/components/features/core/error-handling instead.
 * 
 * This is a re-export file for backward compatibility.
 */

// Re-export everything from the new location
export * from '@/components/features/core/error-handling';

// Also re-export the default export if any
import DefaultExport from '@/components/features/core/error-handling';
export default DefaultExport;
