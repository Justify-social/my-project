/**
 * Date Formatter Utility
 * 
 * This utility provides standardized date formatting functions to handle
 * the various date formats and edge cases in the application.
 */

/**
 * Formats a date value for display in form fields
 * Handles various input types and provides consistent output
 * 
 * @param date Any date representation (string, Date object, empty object, etc.)
 * @returns A formatted date string or empty string for invalid inputs
 */
export function formatDate(date: any): string {
  // Handle empty values
  if (!date) return '';
  
  // Handle empty objects
  if (typeof date === 'object' && Object.keys(date).length === 0) {
    console.warn('Empty date object received:', date);
    return '';
  }
  
  try {
    // If it's already a string, check if it's valid
    if (typeof date === 'string') {
      if (!date.trim()) return '';
      
      const parsed = new Date(date);
      if (isNaN(parsed.getTime())) {
        console.warn('Invalid date string:', date);
        return '';
      }
      // Extract just the date part if it's an ISO string
      return date.includes('T') ? date.split('T')[0] : date;
    }
    
    // If it's a Date object
    if (date instanceof Date) {
      if (isNaN(date.getTime())) {
        console.warn('Invalid Date object:', date);
        return '';
      }
      return date.toISOString().split('T')[0];
    }
    
    console.warn('Unhandled date format:', date);
    return '';
  } catch (e) {
    console.error('Error formatting date:', e, date);
    return '';
  }
}

/**
 * Formats a date value for API submission
 * Ensures consistent format for backend processing
 * 
 * @param date Any date representation
 * @returns A properly formatted date string or null for invalid inputs
 */
export function formatDateForApi(date: any): string | null {
  // Handle empty values
  if (!date) return null;
  
  // Handle empty objects
  if (typeof date === 'object' && Object.keys(date).length === 0) {
    return null;
  }
  
  try {
    // If it's a string, check if it's valid
    if (typeof date === 'string') {
      if (!date.trim()) return null;
      
      const parsed = new Date(date);
      if (isNaN(parsed.getTime())) return null;
      
      // Return ISO string for API
      return parsed.toISOString();
    }
    
    // If it's a Date object
    if (date instanceof Date) {
      if (isNaN(date.getTime())) return null;
      return date.toISOString();
    }
    
    return null;
  } catch (e) {
    console.error('Error formatting date for API:', e, date);
    return null;
  }
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
  // Handle empty values
  if (!date) return '';
  
  // Handle empty objects
  if (typeof date === 'object' && Object.keys(date).length === 0) {
    return '';
  }
  
  try {
    let dateObj: Date;
    
    // Parse string to Date if needed
    if (typeof date === 'string') {
      if (!date.trim()) return '';
      dateObj = new Date(date);
    } else if (date instanceof Date) {
      dateObj = date;
    } else {
      return '';
    }
    
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