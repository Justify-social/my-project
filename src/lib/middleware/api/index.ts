/**
 * API Middleware Index
 *
 * Re-exports core middleware helpers from subdirectories.
 */

export { withValidation } from './validation/validate-api';
export { tryCatch } from './errorHandling/handle-api-errors';
export { handleDbError } from './errorHandling/handle-db-errors';

// Note: Other middleware like check-permissions, api-response, util
// are currently NOT re-exported here. Import them directly from their
// specific file path if needed (e.g., `@/lib/middleware/api/check-permissions`).
