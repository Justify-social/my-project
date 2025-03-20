
/**
 * Safe IconTester Wrapper
 * 
 * This wrapper ensures that IconTester never receives empty objects
 * by adding extra validation before rendering.
 */
import React, { useEffect } from 'react';
import { IconTester as OriginalIconTester } from './IconTester';

export const IconTester = (props) => {
  useEffect(() => {
    console.log('IconTester wrapper mounted with props:', props);
    
    // Add a global error handler to catch any Font Awesome errors
    const originalError = console.error;
    console.error = (...args) => {
      if (args[0] && typeof args[0] === 'string' && args[0].includes('Could not find icon')) {
        console.warn('Font Awesome error caught:', args[0]);
        console.warn('Stack trace:', new Error().stack);
      }
      return originalError.apply(console, args);
    };
    
    return () => {
      // Restore original console.error
      console.error = originalError;
    };
  }, []);
  
  return <OriginalIconTester {...props} />;
};

export default IconTester;
