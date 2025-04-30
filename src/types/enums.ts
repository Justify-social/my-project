/**
 * @file src/types/enums.ts
 * @description Central definitions for common enumerations used across the application.
 */

// Add other enums as needed, e.g., UserRole, Status etc. if they aren't defined elsewhere

/**
 * Represents the different social media platforms supported.
 * Ensure consistency across frontend, backend, and database.
 * Values should align with Prisma schema and potentially InsightIQ identifiers.
 */
export enum PlatformEnum {
  Instagram = 'INSTAGRAM', // Using uppercase to match Prisma schema convention
  TikTok = 'TIKTOK',
  YouTube = 'YOUTUBE',
  // Add other platforms as needed
}

// Example: If other enums defined in schema.prisma need to be accessible in FE,
// they could be redefined here or imported if Prisma Client generation makes them available.
// export { UserRole, Status } from '@prisma/client'; // Example - Check if possible
