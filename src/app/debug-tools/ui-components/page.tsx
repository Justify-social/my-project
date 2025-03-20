'use client';

import DebugTools from '@/components/ui/debug-tools';
import { useEffect, useRef } from 'react';

// Runtime Font Awesome detector component
const FontAwesomeDebugger = () => {
  // Use a ref to avoid re-renders that could cause infinite loops
  const seenErrorsRef = useRef(new Set());
  const initialized = useRef(false);
  
  useEffect(() => {
    // Only initialize once to prevent infinite loops
    if (initialized.current) return;
    initialized.current = true;
    
    if (typeof window !== 'undefined') {
      console.log('[Font Awesome Debugger] Initializing');
      
      // Store the original error console
      const originalError = console.error;
      
      // Override console.error to catch and log font awesome errors
      console.error = function(...args) {
        // Check if this is a Font Awesome error
        if (args[0] && typeof args[0] === 'string' && args[0].includes('Could not find icon')) {
          // Create an error to capture the stack trace
          const error = new Error('Font Awesome icon error');
          const callStack = error.stack ? error.stack.split('\n').slice(2).join('\n') : 'Stack unavailable';
          
          // Create an error key to avoid duplicates
          const errorKey = args[0] + callStack.slice(0, 100);
          
          if (!seenErrorsRef.current.has(errorKey)) {
            seenErrorsRef.current.add(errorKey);
            
            // Log detailed debugging information
            console.warn('[Font Awesome Debugger] Error caught:', args[0]);
            console.warn('[Font Awesome Debugger] Call stack:', callStack);
            console.warn('[Font Awesome Debugger] Arguments:', args.slice(1));
            
            // Try to extract the component name from stack trace
            const componentMatch = callStack.match(/at ([A-Za-z0-9_]+) /);
            if (componentMatch) {
              console.warn('[Font Awesome Debugger] Likely component:', componentMatch[1]);
            }
          }
        }
        
        // Always call the original error function
        return originalError.apply(console, args);
      };
      
      // Clean up when component unmounts
      return () => {
        console.log('[Font Awesome Debugger] Cleanup');
        console.error = originalError;
      };
    }
  }, []); // Empty dependency array to ensure this only runs once
  
  // This component doesn't render anything
  return null;
};

export default function UIComponentsPage() {
  return (
    <div>
      <FontAwesomeDebugger />
      <DebugTools />
    </div>
  );
} 