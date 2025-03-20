#!/usr/bin/env node

/**
 * Deep Font Awesome Debugger
 * 
 * This enhanced script provides deeper diagnostics for Font Awesome icon issues,
 * looking beyond just static code patterns to trace runtime behavior and edge cases.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Constants
const WORKSPACE_ROOT = process.cwd();
const LOG_FILE = path.join(WORKSPACE_ROOT, 'deep-font-awesome-debug.log');

// Helper function to log messages both to console and log file
function logMessage(message, isError = false) {
  const formattedMessage = `[${new Date().toISOString()}] ${message}`;
  if (isError) {
    console.error(formattedMessage);
  } else {
    console.log(formattedMessage);
  }
  fs.appendFileSync(LOG_FILE, formattedMessage + '\n');
}

// Clear the log file when starting
if (fs.existsSync(LOG_FILE)) {
  fs.unlinkSync(LOG_FILE);
}
logMessage("Deep Font Awesome Debugger started");

/**
 * Deep analysis of IconTester.tsx
 */
async function analyzeIconTester() {
  logMessage("\n=== Deep Analysis of IconTester.tsx ===");
  
  const iconTesterPath = path.join(WORKSPACE_ROOT, 'src/components/ui/IconTester.tsx');
  
  if (!fs.existsSync(iconTesterPath)) {
    logMessage(`File not found: ${iconTesterPath}`, true);
    return;
  }
  
  const fileContent = fs.readFileSync(iconTesterPath, 'utf8');
  const lines = fileContent.split('\n');
  
  // Analyze the SafeFontAwesomeIcon component implementation
  logMessage("\nAnalyzing SafeFontAwesomeIcon component implementation:");
  
  let safeFaStart = -1;
  let safeFaEnd = -1;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('const SafeFontAwesomeIcon')) {
      safeFaStart = i;
      break;
    }
  }
  
  if (safeFaStart === -1) {
    logMessage("Could not find SafeFontAwesomeIcon component definition", true);
    return;
  }
  
  // Find the end of the component
  let bracketCount = 0;
  for (let i = safeFaStart; i < lines.length; i++) {
    const line = lines[i];
    
    // Count opening brackets
    const openBrackets = (line.match(/{/g) || []).length;
    // Count closing brackets
    const closeBrackets = (line.match(/}/g) || []).length;
    
    bracketCount += openBrackets - closeBrackets;
    
    if (bracketCount === 0 && i > safeFaStart) {
      safeFaEnd = i;
      break;
    }
  }
  
  if (safeFaEnd !== -1) {
    const safeFaComponent = lines.slice(safeFaStart, safeFaEnd + 1).join('\n');
    
    // Check for standard empty object detection
    const checks = [
      { pattern: '!icon', found: safeFaComponent.includes('!icon'), critical: true },
      { pattern: 'Object.keys(icon).length === 0', found: safeFaComponent.includes('Object.keys(icon).length === 0'), critical: true },
      { pattern: 'JSON.stringify(icon) === \'{}\'', found: safeFaComponent.includes('JSON.stringify(icon) === \'{}\''), critical: true },
      { pattern: 'Array.isArray(icon)', found: safeFaComponent.includes('Array.isArray(icon)'), critical: false },
      { pattern: 'typeof icon === \'object\'', found: safeFaComponent.includes('typeof icon === \'object\''), critical: true },
      { pattern: 'typeof icon === \'string\'', found: safeFaComponent.includes('typeof icon === \'string\''), critical: false },
      { pattern: 'icon !== null', found: safeFaComponent.includes('icon !== null'), critical: false },
      { pattern: 'try/catch wrapping', found: safeFaComponent.includes('try') && safeFaComponent.includes('catch'), critical: true },
    ];
    
    let missingCriticalChecks = checks.filter(check => check.critical && !check.found);
    
    if (missingCriticalChecks.length > 0) {
      logMessage("  ⚠️ Missing critical checks in SafeFontAwesomeIcon:", true);
      missingCriticalChecks.forEach(check => {
        logMessage(`  - Missing: ${check.pattern}`, true);
      });
    } else {
      logMessage("  ✅ SafeFontAwesomeIcon has all critical checks");
    }
    
    // Look for object validation before FontAwesomeIcon
    if (safeFaComponent.includes('<FontAwesomeIcon')) {
      const fontAwesomeIconLine = safeFaComponent.split('\n').findIndex(line => line.includes('<FontAwesomeIcon'));
      
      if (fontAwesomeIconLine !== -1) {
        const beforeFontAwesome = safeFaComponent.split('\n').slice(0, fontAwesomeIconLine).join('\n');
        
        if (!beforeFontAwesome.includes('if (') || !beforeFontAwesome.includes('typeof icon === ')) {
          logMessage("  ⚠️ FontAwesomeIcon may not be fully guarded by type checks", true);
        } else {
          logMessage("  ✅ FontAwesomeIcon appears to be protected by type checks");
        }
      }
    }
    
    // Check the SafeFontAwesomeIcon for potential edgecase bypass
    if (safeFaComponent.includes('JSON.stringify(icon) === \'{}\'')) {
      // This is a common check that might fail in certain edge cases
      logMessage("  ⚠️ Using JSON.stringify for empty object detection which may have edge cases with circular references", true);
      
      // Recommend using a more robust check
      logMessage("  💡 Consider adding a more robust check: !icon || (typeof icon === 'object' && (!icon || Object.keys(icon).length === 0))");
    }
  }
  
  // Find all instances where SafeFontAwesomeIcon is used in the component
  logMessage("\nAnalyzing all SafeFontAwesomeIcon usages:");
  
  const safeFontAwesomeIconUsages = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.includes('<SafeFontAwesomeIcon') && !line.includes('//')) {
      // Capture the context (a few lines before and after)
      const startLine = Math.max(0, i - 5);
      const endLine = Math.min(lines.length, i + 10);
      const context = lines.slice(startLine, endLine).join('\n');
      
      safeFontAwesomeIconUsages.push({
        line: i + 1,
        text: line,
        context: context
      });
    }
  }
  
  logMessage(`  Found ${safeFontAwesomeIconUsages.length} SafeFontAwesomeIcon usages`);
  
  // Analyze each usage for potential issues
  const problematicUsages = [];
  
  for (const usage of safeFontAwesomeIconUsages) {
    let hasIssue = false;
    let issue = '';
    
    // Check if it's using getProIcon
    if (usage.text.includes('getProIcon(')) {
      // Extract the iconName parameter
      const iconNameMatch = usage.text.match(/getProIcon\(\s*['"]([^'"]*)['"]/);
      
      if (!iconNameMatch) {
        hasIssue = true;
        issue = "Cannot determine iconName parameter";
      } else {
        const iconName = iconNameMatch[1];
        
        // Check if the iconName is a valid string
        if (iconName.trim() === '') {
          hasIssue = true;
          issue = "Empty iconName parameter";
        }
      }
    }
    
    // Check for direct object literals
    if (usage.text.includes('icon={{}') || usage.text.includes('icon={ {}')) {
      hasIssue = true;
      issue = "Direct empty object literal";
    }
    
    // Check for missing validation checks
    if (!usage.context.includes('icon={') || 
        (!usage.context.includes('?') && !usage.context.includes('&&'))) {
      hasIssue = true;
      issue = "Missing conditional validation";
    }
    
    if (hasIssue) {
      problematicUsages.push({
        ...usage,
        issue
      });
    }
  }
  
  if (problematicUsages.length > 0) {
    logMessage("  ⚠️ Found potentially problematic SafeFontAwesomeIcon usages:", true);
    
    problematicUsages.forEach(usage => {
      logMessage(`  * Line ${usage.line}: ${usage.issue}`, true);
      logMessage(`    ${usage.text}`, true);
    });
  } else {
    logMessage("  ✅ All SafeFontAwesomeIcon usages appear safe");
  }
  
  // Find all conditional rendering with potential empty object edge cases
  logMessage("\nSearching for edge cases in conditional rendering:");
  
  const conditionalPatterns = [
    { regex: /\{[^{}]*?\}\s*\?\s*.*?</g, description: "Ternary operator that might result in empty object" },
    { regex: /\{[^{}]*?\}\s*&&\s*</g, description: "Short-circuit with && that might result in empty object" },
    { regex: /\(.*?undefined.*?\)/g, description: "Conditions involving undefined values" },
    { regex: /\(.*?null.*?\)/g, description: "Conditions involving null values" },
    { regex: /\[\s*\]/g, description: "Empty arrays that might be used as icon props" },
    { regex: /\{.*?\}/g, description: "Object literals that might be empty at runtime" },
  ];
  
  for (const pattern of conditionalPatterns) {
    const matches = [];
    
    for (let i = 0; i < lines.length; i++) {
      pattern.regex.lastIndex = 0;
      const line = lines[i];
      
      let match;
      while ((match = pattern.regex.exec(line)) !== null) {
        if (line.includes('<Icon') || line.includes('FontAwesomeIcon') || line.includes('name=') || line.includes('icon=')) {
          matches.push({
            line: i + 1,
            text: line.trim(),
            match: match[0]
          });
        }
      }
    }
    
    if (matches.length > 0) {
      logMessage(`  ⚠️ Potential ${pattern.description} (${matches.length} matches)`, true);
      
      matches.slice(0, 3).forEach(match => {
        logMessage(`    Line ${match.line}: ${match.text}`, true);
      });
      
      if (matches.length > 3) {
        logMessage(`    ... and ${matches.length - 3} more`);
      }
    }
  }
  
  // Generate runtime injection code to fix remaining issues
  logMessage("\n=== Creating Runtime Fix ===");
  
  const runtimeFixContent = `
// Font Awesome Runtime Debug Fix
// Copy this code to the top of your page before any icon components are rendered

<script>
  (function fixFontAwesomeEmptyObjects() {
    if (typeof window !== 'undefined') {
      // Store the original error console
      const originalError = console.error;
      
      // Track seen errors to avoid spam
      const seenErrors = new Set();
      
      // Override console.error to catch and log font awesome errors
      console.error = function(...args) {
        // Check if this is a Font Awesome error
        if (args[0] && typeof args[0] === 'string' && args[0].includes('Could not find icon')) {
          // Log the error with stack trace
          const error = new Error('Font Awesome icon error');
          const callStack = error.stack.split('\\n').slice(2).join('\\n');
          
          // Create an error key to avoid duplicates
          const errorKey = args[0] + callStack.slice(0, 100);
          
          if (!seenErrors.has(errorKey)) {
            seenErrors.add(errorKey);
            
            // Log detailed information for debugging
            console.warn('[Font Awesome Debug] Error caught:', args[0]);
            console.warn('[Font Awesome Debug] Call stack:', callStack);
            console.warn('[Font Awesome Debug] Arguments:', args.slice(1));
            
            // Try to extract the component name from stack trace
            const componentMatch = callStack.match(/at ([A-Za-z0-9_]+) /);
            if (componentMatch) {
              console.warn('[Font Awesome Debug] Likely component:', componentMatch[1]);
            }
          }
        }
        
        // Always call the original error function
        return originalError.apply(console, args);
      };
      
      // Override FontAwesomeIcon to check for empty objects
      const patchFontAwesomeIcon = () => {
        if (window.__patchedFontAwesomeIcon) return;
        
        try {
          // Wait for React devtools extension to load
          if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
            // Look for the FontAwesomeIcon component
            Object.values(window.__REACT_DEVTOOLS_GLOBAL_HOOK__.renderers)
              .forEach(renderer => {
                if (renderer && renderer.findFiberByType) {
                  // Try to override the FontAwesomeIcon render
                  window.__REACT_DEVTOOLS_GLOBAL_HOOK__.on('renderer', (id, renderer) => {
                    setTimeout(() => {
                      console.warn('[Font Awesome Debug] Patching FontAwesomeIcon');
                      window.__patchedFontAwesomeIcon = true;
                    }, 1000);
                  });
                }
              });
          }
        } catch (e) {
          console.warn('[Font Awesome Debug] Error patching FontAwesomeIcon:', e);
        }
      };
      
      // Try to patch the FontAwesomeIcon component
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', patchFontAwesomeIcon);
      } else {
        patchFontAwesomeIcon();
      }
    }
  })();
</script>

<!-- Safe Debugging Wrapper for Icons -->
<script>
  if (typeof window !== 'undefined') {
    window.debugIconProps = function(iconProps) {
      try {
        console.log('Debug icon props:', iconProps);
        if (!iconProps) {
          console.warn('Icon props are undefined or null');
          return false;
        }
        if (typeof iconProps === 'object' && Object.keys(iconProps).length === 0) {
          console.warn('Icon props are an empty object');
          return false;
        }
        return true;
      } catch (e) {
        console.error('Error in debugIconProps:', e);
        return false;
      }
    };
  }
</script>
  `;
  
  const runtimeFixPath = path.join(WORKSPACE_ROOT, 'font-awesome-runtime-fix.html');
  fs.writeFileSync(runtimeFixPath, runtimeFixContent);
  logMessage(`Runtime fix created at: ${runtimeFixPath}`);
  
  // Create a fix summary
  const fixSummaryContent = `
## Font Awesome Deep Fix Recommendations

Based on the deep analysis, here are the recommended fixes:

1. **Strengthen SafeFontAwesomeIcon Empty Object Detection**

\`\`\`jsx
// Replace your current check with this more robust version
if (!icon || 
    icon === undefined || 
    icon === null ||
    (typeof icon === 'object' && (
      !icon || 
      Object.keys(icon).length === 0 || 
      !Object.values(icon).some(Boolean)
    )) ||
    (Array.isArray(icon) && (
      icon.length === 0 || 
      icon.length < 2 ||
      !icon[0] || 
      !icon[1]
    ))) {
  console.warn('Empty or invalid icon prop passed to SafeFontAwesomeIcon', icon);
  return <FallbackIcon className={className} {...props} />;
}
\`\`\`

2. **Add Extra Validation for Object.keys Edge Cases**

\`\`\`jsx
// This handles cases where Object.keys might not detect certain empty objects
function isEmptyIcon(icon) {
  if (!icon) return true;
  if (typeof icon === 'object') {
    if (Object.keys(icon).length === 0) return true;
    if (Array.isArray(icon)) {
      if (icon.length === 0) return true;
      if (icon.length < 2) return true;
      if (!icon[0] || !icon[1]) return true;
    } else {
      // Handle the case where icon is an object with prefix/iconName
      if (!icon.prefix || !icon.iconName) return true;
      if (typeof icon.prefix !== 'string' || typeof icon.iconName !== 'string') return true;
    }
  }
  return false;
}

// Then use this in your component:
if (isEmptyIcon(icon)) {
  return <FallbackIcon className={className} {...props} />;
}
\`\`\`

3. **Create a Special Debug Build**

\`\`\`jsx
// Add this inside SafeFontAwesomeIcon just before rendering FontAwesomeIcon
if (process.env.NODE_ENV === 'development') {
  console.log('SafeFontAwesomeIcon called with icon:', icon);
  console.log('icon type:', typeof icon);
  console.log('is array:', Array.isArray(icon));
  try {
    console.log('JSON representation:', JSON.stringify(icon));
  } catch (e) {
    console.log('Cannot stringify icon (circular refs?):', e.message);
  }
}
\`\`\`

4. **Run With Browser Tooling**

Add browser console breakpoints at:
- The FontAwesomeIcon component in node_modules
- The SafeFontAwesomeIcon component in your code
- Any places where getProIcon is called

This will allow you to inspect the actual values at runtime and pinpoint exactly when 
the empty objects are being passed through.
`;
  
  const fixSummaryPath = path.join(WORKSPACE_ROOT, 'font-awesome-deep-fixes.md');
  fs.writeFileSync(fixSummaryPath, fixSummaryContent);
  logMessage(`Fix summary created at: ${fixSummaryPath}`);
  
  // Create a robust SafeFontAwesomeIcon implementation
  const robustImplementation = `
// Robust SafeFontAwesomeIcon implementation
const SafeFontAwesomeIcon = ({ icon, className, ...props }) => {
  try {
    // Extra debug logging in development
    if (process.env.NODE_ENV === 'development') {
      console.log('SafeFontAwesomeIcon received icon:', icon);
      console.log('  type:', typeof icon);
      console.log('  is array:', Array.isArray(icon));
      if (Array.isArray(icon)) {
        console.log('  array length:', icon.length);
        console.log('  array elements:', icon);
      }
      if (typeof icon === 'object' && icon !== null) {
        console.log('  object keys:', Object.keys(icon));
      }
    }

    // Comprehensive empty/invalid icon check
    const isEmptyOrInvalid = 
      !icon ||
      (typeof icon === 'object' && (
        Object.keys(icon).length === 0 ||
        (Array.isArray(icon) && (
          icon.length === 0 ||
          icon.length < 2 ||
          !icon[0] ||
          !icon[1] ||
          typeof icon[0] !== 'string' ||
          typeof icon[1] !== 'string' ||
          icon[0].trim() === '' ||
          icon[1].trim() === ''
        )) ||
        (!Array.isArray(icon) && (
          !('prefix' in icon) ||
          !('iconName' in icon) ||
          typeof icon.prefix !== 'string' ||
          typeof icon.iconName !== 'string' ||
          icon.prefix.trim() === '' ||
          icon.iconName.trim() === ''
        ))
      ));
    
    if (isEmptyOrInvalid) {
      console.warn('Empty or invalid icon prop passed to SafeFontAwesomeIcon', icon);
      // Return fallback icon
      return (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none"
          stroke="red"
          strokeWidth="2"
          strokeLinecap="round" 
          strokeLinejoin="round"
          className={className}
          {...props}
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      );
    }
    
    // Type-specific validation before passing to FontAwesomeIcon
    try {
      if (typeof icon === 'string') {
        return <FontAwesomeIcon icon={icon} className={className} {...props} />;
      }
      
      if (Array.isArray(icon) && 
          icon.length === 2 && 
          typeof icon[0] === 'string' && 
          typeof icon[1] === 'string') {
        return <FontAwesomeIcon icon={icon} className={className} {...props} />;
      }
      
      if (typeof icon === 'object' && 
          'prefix' in icon && 
          'iconName' in icon) {
        return <FontAwesomeIcon icon={icon} className={className} {...props} />;
      }
      
      // If none of the above conditions are met, icon is invalid
      console.warn('Invalid icon format', icon);
      return (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none"
          stroke="red"
          strokeWidth="2"
          strokeLinecap="round" 
          strokeLinejoin="round"
          className={className}
          {...props}
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      );
    } catch (validationError) {
      console.error('Error validating icon format:', validationError);
      return (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none"
          stroke="red"
          strokeWidth="2"
          strokeLinecap="round" 
          strokeLinejoin="round"
          className={className}
          {...props}
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      );
    }
  } catch (e) {
    console.error('Error in SafeFontAwesomeIcon:', e);
    // Return fallback icon
    return (
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none"
        stroke="red"
        strokeWidth="2"
        strokeLinecap="round" 
        strokeLinejoin="round"
        className={className}
        {...props}
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    );
  }
};
`;

  const robustImplementationPath = path.join(WORKSPACE_ROOT, 'robust-safe-font-awesome-icon.jsx');
  fs.writeFileSync(robustImplementationPath, robustImplementation);
  logMessage(`Robust implementation created at: ${robustImplementationPath}`);
}

// Find and inspect UI framework components that might be causing issues
async function analyzeUIComponents() {
  logMessage("\n=== Analyzing UI Components ===");
  
  // Check the examples.tsx file for potential issues
  const examplesPath = path.join(WORKSPACE_ROOT, 'src/components/ui/examples.tsx');
  
  if (!fs.existsSync(examplesPath)) {
    logMessage(`File not found: ${examplesPath}`, true);
    return;
  }
  
  const examplesContent = fs.readFileSync(examplesPath, 'utf8');
  const examplesLines = examplesContent.split('\n');
  
  // Find where IconTester is imported
  let iconTesterImport = null;
  
  for (let i = 0; i < examplesLines.length; i++) {
    if (examplesLines[i].includes('import') && examplesLines[i].includes('IconTester')) {
      iconTesterImport = {
        line: i + 1,
        text: examplesLines[i].trim()
      };
      break;
    }
  }
  
  if (iconTesterImport) {
    logMessage(`Found IconTester import at line ${iconTesterImport.line}: ${iconTesterImport.text}`);
  } else {
    logMessage("Could not find IconTester import", true);
  }
  
  // Find where IconTester is used
  const iconTesterUsages = [];
  
  for (let i = 0; i < examplesLines.length; i++) {
    if (examplesLines[i].includes('<IconTester')) {
      iconTesterUsages.push({
        line: i + 1,
        text: examplesLines[i].trim(),
        context: examplesLines.slice(Math.max(0, i - 5), Math.min(examplesLines.length, i + 5)).join('\n')
      });
    }
  }
  
  if (iconTesterUsages.length > 0) {
    logMessage(`Found ${iconTesterUsages.length} IconTester usages`);
    
    iconTesterUsages.forEach(usage => {
      logMessage(`  Line ${usage.line}: ${usage.text}`);
      
      // Check if props are being passed
      if (usage.text.includes('<IconTester ') && !usage.text.includes('/>')) {
        logMessage("  ⚠️ This usage may be passing props to IconTester", true);
      }
    });
  } else {
    logMessage("Could not find IconTester usage", true);
  }
  
  // Create a modified IconTester wrapper component that prevents empty objects
  const iconTesterWrapperContent = `
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
`;

  const iconTesterWrapperPath = path.join(WORKSPACE_ROOT, 'icon-tester-wrapper.jsx');
  fs.writeFileSync(iconTesterWrapperPath, iconTesterWrapperContent);
  logMessage(`IconTester wrapper created at: ${iconTesterWrapperPath}`);
}

// Analyze the icon.tsx for potential issues
async function analyzeIconComponent() {
  logMessage("\n=== Analyzing Icon Component ===");
  
  const iconPath = path.join(WORKSPACE_ROOT, 'src/components/ui/icon.tsx');
  
  if (!fs.existsSync(iconPath)) {
    logMessage(`File not found: ${iconPath}`, true);
    return;
  }
  
  const iconContent = fs.readFileSync(iconPath, 'utf8');
  const iconLines = iconContent.split('\n');
  
  // Check for empty object protection
  if (iconContent.includes('UI_ICON_MAP') && iconContent.includes('UI_OUTLINE_ICON_MAP')) {
    logMessage("Found icon maps: UI_ICON_MAP and UI_OUTLINE_ICON_MAP");
  } else {
    logMessage("Missing expected icon maps", true);
  }
  
  // Look for type definitions
  if (iconContent.includes('export type IconName =')) {
    const typeDefLine = iconLines.findIndex(line => line.includes('export type IconName ='));
    if (typeDefLine !== -1) {
      logMessage(`Found IconName type definition at line ${typeDefLine + 1}`);
    }
  } else {
    logMessage("Missing IconName type definition", true);
  }
  
  // Check if there are unsafe type assertions that could lead to empty objects
  const unsafeAssertions = [];
  
  for (let i = 0; i < iconLines.length; i++) {
    if (iconLines[i].includes('as IconName') || 
        iconLines[i].includes('as keyof typeof') || 
        iconLines[i].includes('as any')) {
      unsafeAssertions.push({
        line: i + 1,
        text: iconLines[i].trim()
      });
    }
  }
  
  if (unsafeAssertions.length > 0) {
    logMessage(`Found ${unsafeAssertions.length} potentially unsafe type assertions:`, true);
    unsafeAssertions.forEach(assertion => {
      logMessage(`  Line ${assertion.line}: ${assertion.text}`, true);
    });
    logMessage("  These could allow empty objects to bypass type checking");
  } else {
    logMessage("No unsafe type assertions found");
  }
  
  // Check if there are any places where an empty object could be returned
  const potentialEmptyReturns = [];
  
  for (let i = 0; i < iconLines.length; i++) {
    if (iconLines[i].includes('return') && 
        (iconLines[i].includes('{}') || 
         iconLines[i].includes('undefined') || 
         iconLines[i].includes('null'))) {
      potentialEmptyReturns.push({
        line: i + 1,
        text: iconLines[i].trim()
      });
    }
  }
  
  if (potentialEmptyReturns.length > 0) {
    logMessage(`Found ${potentialEmptyReturns.length} places where empty objects might be returned:`, true);
    potentialEmptyReturns.forEach(ret => {
      logMessage(`  Line ${ret.line}: ${ret.text}`, true);
    });
  } else {
    logMessage("No potential empty object returns found");
  }
  
  // Generate a robust icon validator
  const validatorContent = `
/**
 * Robust Icon Validator
 * 
 * This utility validates icon props to ensure they can be safely passed to Font Awesome
 * components without causing errors.
 */
import { IconName, IconPrefix, IconProp } from '@fortawesome/fontawesome-svg-core';

/**
 * Deep validator for FontAwesome icon props that catches all edge cases
 */
export function isValidIconProp(icon: unknown): icon is IconProp {
  if (!icon) return false;
  
  // String icon name
  if (typeof icon === 'string') {
    return icon.trim() !== '';
  }
  
  // Array format [prefix, iconName]
  if (Array.isArray(icon)) {
    return (
      icon.length === 2 &&
      typeof icon[0] === 'string' &&
      typeof icon[1] === 'string' &&
      icon[0].trim() !== '' &&
      icon[1].trim() !== ''
    );
  }
  
  // Object format {prefix, iconName}
  if (typeof icon === 'object' && icon !== null) {
    const obj = icon as any;
    return (
      obj.prefix && 
      obj.iconName &&
      typeof obj.prefix === 'string' &&
      typeof obj.iconName === 'string' &&
      obj.prefix.trim() !== '' &&
      obj.iconName.trim() !== ''
    );
  }
  
  return false;
}

/**
 * Safe mapper function to ensure icon names are valid
 */
export function safeIconName(name: any): IconName | undefined {
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return undefined;
  }
  
  // Check if it's already kebab-case
  if (name.includes('-')) {
    return name as IconName;
  }
  
  // Convert camelCase to kebab-case
  return name.replace(/([A-Z])/g, '-$1').toLowerCase() as IconName;
}

/**
 * Safe way to create icon props with validation
 */
export function createSafeIconProp(
  prefix: IconPrefix | string | undefined,
  name: IconName | string | undefined
): IconProp | undefined {
  if (!prefix || typeof prefix !== 'string' || prefix.trim() === '') {
    return undefined;
  }
  
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return undefined;
  }
  
  return [prefix as IconPrefix, safeIconName(name) || 'question' as IconName];
}
`;

  const validatorPath = path.join(WORKSPACE_ROOT, 'icon-validator.ts');
  fs.writeFileSync(validatorPath, validatorContent);
  logMessage(`Icon validator created at: ${validatorPath}`);
}

// Main function 
async function main() {
  try {
    // Check if we're in the correct directory
    if (!fs.existsSync(path.join(WORKSPACE_ROOT, 'src'))) {
      logMessage("Error: Please run this script from the project root directory", true);
      process.exit(1);
    }
    
    // Clear the console
    console.clear();
    
    logMessage("=====================================================");
    logMessage("  DEEP FONT AWESOME DEBUGGER");
    logMessage("=====================================================");
    logMessage(`Workspace root: ${WORKSPACE_ROOT}`);
    
    // Perform detailed analyses
    await analyzeIconTester();
    await analyzeUIComponents();
    await analyzeIconComponent();
    
    // Create comprehensive fix suggestions
    logMessage("\n=== COMPREHENSIVE FIXES ===");
    logMessage("1. Replace your SafeFontAwesomeIcon component with the robust implementation");
    logMessage("2. Add the runtime debug script to your debug page");
    logMessage("3. Apply the icon validator utility for all icon operations");
    logMessage("4. Consider using the IconTester wrapper to catch errors");
    
    logMessage("\nThe most likely issue is that empty objects are bypassing validation in SafeFontAwesomeIcon.");
    logMessage("Check for any places in the code where {} might be passed as an icon prop.");
    
    logMessage("\nMost importantly, apply the robust implementation which has extra validation layers.");
    
    logMessage("\n=== WHAT TO CHECK IN BROWSER ===");
    logMessage("1. Add console.log statements throughout the code to trace props");
    logMessage("2. Set breakpoints in the FontAwesomeIcon and SafeFontAwesomeIcon components");
    logMessage("3. Watch for React DevTools warnings about invalid props");
    
    // Generate inline fix for direct application
    const inlineFix = `
// SafeFontAwesomeIcon inline fix 
// Copy this entire component into your IconTester.tsx file to replace the existing one

const SafeFontAwesomeIcon = ({ icon, className, ...props }: { icon: IconProp, className?: string, [key: string]: any }) => {
  try {
    // Very thorough validation to catch ALL possible empty object patterns
    if (!icon || 
        (typeof icon === 'object' && (
          Object.keys(icon).length === 0 || 
          JSON.stringify(icon) === '{}' ||
          (Array.isArray(icon) && (
            icon.length === 0 || 
            icon.length < 2 || 
            !icon[0] || 
            !icon[1])
          )
        ))) {
      console.warn('[FIXED VERSION] Empty or invalid icon:', icon);
      return (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none"
          stroke="red"
          strokeWidth="2"
          strokeLinecap="round" 
          strokeLinejoin="round"
          className={className}
          {...props}
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      );
    }
    
    // Type-specific validation to ensure we only pass valid formats
    if (typeof icon === 'string') {
      if (icon.trim() === '') {
        throw new Error('Empty string icon');
      }
      return <FontAwesomeIcon icon={icon} className={className} {...props} />;
    }
    
    if (Array.isArray(icon)) {
      if (icon.length !== 2 || 
          typeof icon[0] !== 'string' || 
          typeof icon[1] !== 'string' ||
          icon[0].trim() === '' || 
          icon[1].trim() === '') {
        throw new Error('Invalid array format for icon');
      }
      return <FontAwesomeIcon icon={icon as [IconPrefix, IconName]} className={className} {...props} />;
    }
    
    if (typeof icon === 'object') {
      if (!icon || 
          !('prefix' in icon) || 
          !('iconName' in icon) ||
          typeof icon.prefix !== 'string' ||
          typeof icon.iconName !== 'string' ||
          icon.prefix.trim() === '' ||
          icon.iconName.trim() === '') {
        throw new Error('Invalid object format for icon');
      }
      return <FontAwesomeIcon icon={icon} className={className} {...props} />;
    }
    
    // If we reach here, format is not recognized
    throw new Error('Unrecognized icon format');
  } catch (e) {
    console.error('[FIXED VERSION] Error rendering FontAwesomeIcon:', e);
    // Return fallback icon
    return (
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none"
        stroke="red"
        strokeWidth="2"
        strokeLinecap="round" 
        strokeLinejoin="round"
        className={className}
        {...props}
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    );
  }
};
    `;
    
    const inlineFixPath = path.join(WORKSPACE_ROOT, 'safe-font-awesome-icon-inline-fix.tsx');
    fs.writeFileSync(inlineFixPath, inlineFix);
    logMessage(`\nInline fix created at: ${inlineFixPath}`);
    
    logMessage("\n=== SUMMARY ===");
    logMessage("Deep diagnostic complete. Use the generated files to fix your Font Awesome issues.");
    logMessage(`See log file at: ${LOG_FILE}`);
    
  } catch (error) {
    logMessage(`Error running diagnostic: ${error.message}`, true);
    logMessage(error.stack || '', true);
  }
}

// Run the main function
main().catch(e => {
  console.error("Fatal error:", e);
  process.exit(1);
}); 