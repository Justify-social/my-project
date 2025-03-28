/**
 * @deprecated This directory is deprecated and will be removed in a future release.
 * Please update imports to use @/components/features/assets/upload instead.
 * 
 * This is a re-export file for backward compatibility.
 */

// Re-export everything from the new location
export * from '@/components/features/assets/upload';

// Also re-export the default export if any
import DefaultExport from '@/components/features/assets/upload';
export default DefaultExport;
