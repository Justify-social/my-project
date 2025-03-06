/**
 * Date Formatter Utility
 * 
 * This utility provides standardized date formatting functions to handle
 * the various date formats and edge cases in the application.
 * 
 * This file is maintained for backward compatibility - new code should use DateService directly.
 */
import { DateService } from './date-service';

/**
 * Formats a date value for display in form fields
 * Handles various input types and provides consistent output
 * 
 * @param date Any date representation (string, Date object, empty object, etc.)
 * @returns A formatted date string or empty string for invalid inputs
 * @deprecated Use DateService.toFormDate() instead
 */
export function formatDate(date: any): string {
  return DateService.toFormDate(date) || '';
}

/**
 * Formats a date value for API submission
 * Ensures consistent format for backend processing
 * 
 * @param date Any date representation
 * @returns A properly formatted date string or null for invalid inputs
 * @deprecated Use DateService.toApiDate() instead
 */
export function formatDateForApi(date: any): string | null {
  return DateService.toApiDate(date);
}

/**
 * Formats a date for display to users
 * Uses locale-specific formatting for readable dates
 * 
 * @param date Any date representation
 * @param format Optional format specification ('short', 'medium', 'long', or 'full')
 * @returns A user-friendly formatted date string or empty string for invalid inputs
 */
export function formatDateForDisplay(date: any, format: 'short' | 'medium' | 'long' | 'full' = 'medium'): string {
  // Get a standardized date
  const dateString = DateService.toApiDate(date);
  if (!dateString) return '';
  
  try {
    const dateObj = new Date(dateString);
    
    // Check if valid date
    if (isNaN(dateObj.getTime())) {
      return '';
    }
    
    // Format according to specification
    const options: Intl.DateTimeFormatOptions = { 
      dateStyle: format
    } as const;
    
    return new Intl.DateTimeFormat('en-US', options).format(dateObj);
  } catch (e) {
    console.error('Error formatting date for display:', e, date);
    return '';
  }
} 