import { parseISO, isValid, format } from 'date-fns';

/**
 * Utility service for consistent date handling throughout the application.
 * Centralizes date parsing, validation, and formatting logic.
 */
export class DateService {
  /**
   * Converts any supported date format to YYYY-MM-DD string for form display
   * Returns null for invalid dates
   */
  static toFormDate(value: unknown): string | null {
    if (!value) return null;

    // Handle string inputs
    if (typeof value === 'string') {
      const parsed = parseISO(value);
      return isValid(parsed) ? format(parsed, 'yyyy-MM-dd') : null;
    }

    // Handle Date objects
    if (value instanceof Date) {
      return isValid(value) ? format(value, 'yyyy-MM-dd') : null;
    }

    // Handle objects (including Prisma date objects)
    if (typeof value === 'object') {
      // Empty object check
      if (!value || Object.keys(value).length === 0) return null;

      // Try to extract date string if available
      const dateString = this.extractDateString(value);
      if (dateString) {
        const parsed = parseISO(dateString);
        return isValid(parsed) ? format(parsed, 'yyyy-MM-dd') : null;
      }
    }

    return null;
  }

  /**
   * Attempts to extract an ISO date string from an object
   */
  private static extractDateString(obj: object): string | null {
    // Use type assertion for accessing properties safely
    const dateObj = obj as Record<string, unknown>;

    // Common patterns in serialized dates
    if (dateObj.value && typeof dateObj.value === 'string') return dateObj.value;
    if (dateObj.date && typeof dateObj.date === 'string') return dateObj.date;

    // Handle Date-like objects with toISOString
    const objWithMethods = obj as unknown as { toISOString?: () => string };
    if (typeof objWithMethods.toISOString === 'function') {
      try {
        return objWithMethods.toISOString();
      } catch {
        return null;
      }
    }

    // Last resort - check if the object stringifies to an ISO date
    try {
      const str = JSON.stringify(obj);
      const match = str.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      return match ? match[0] : null;
    } catch {
      return null;
    }
  }

  /**
   * Converts a form date string to an ISO date for API submission
   */
  static toApiDate(formDate: string | null): string | null {
    if (!formDate) return null;

    const parsed = parseISO(formDate);
    return isValid(parsed) ? parsed.toISOString() : null;
  }

  /**
   * Determines if a value represents a valid date
   */
  static isValidDate(value: unknown): boolean {
    if (!value) return false;

    if (typeof value === 'string') {
      return isValid(parseISO(value));
    }

    if (value instanceof Date) {
      return isValid(value);
    }

    if (typeof value === 'object') {
      const dateString = this.extractDateString(value);
      return dateString ? isValid(parseISO(dateString)) : false;
    }

    return false;
  }

  /**
   * Creates a standardized date object for consistent format across the app
   */
  static standardizeDate(value: unknown): { formatted: string | null; iso: string | null } {
    const formattedDate = this.toFormDate(value);
    return {
      formatted: formattedDate, // YYYY-MM-DD for form display
      iso: formattedDate ? this.toApiDate(formattedDate) : null, // ISO string for API
    };
  }
}
