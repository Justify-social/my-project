/**
 * Delay function for async operations
 * @param ms milliseconds to delay
 * @returns Promise that resolves after the delay
 */
export const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

/**
 * Check if an error is retryable (network errors, 5xx responses)
 * @param error The error to check
 * @returns boolean indicating if the error is retryable
 */
export const isRetryableError = (error: unknown): boolean => {
  if (error instanceof Error) {
    // Network errors are retryable
    if (error.name === 'NetworkError') return true;
    
    // Check for specific error types that should be retried
    if (error.message.includes('timeout')) return true;
    if (error.message.includes('network')) return true;
  }
  
  // If it's a response error, check the status code
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const status = (error as { status: number }).status;
    // 5xx errors are server errors and can be retried
    return status >= 500 && status < 600;
  }
  
  return false;
};

/**
 * Sanitize a string input
 * @param input string to sanitize
 * @returns sanitized string
 */
export const sanitizeInput = (input: string): string => {
  // Remove any potentially dangerous characters
  return input.replace(/[<>]/g, '');
}; 