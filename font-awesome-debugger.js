#!/usr/bin/env node

/**
 * Font Awesome Empty Object Debugger
 * 
 * This script helps identify exactly when and where empty object icons are being passed
 * to the FontAwesomeIcon component, causing the "Error: Could not find icon {}" errors.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Constants
const WORKSPACE_ROOT = process.cwd();
const LOG_FILE = path.join(WORKSPACE_ROOT, 'font-awesome-debug.log');

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
logMessage("Font Awesome Empty Object Debugger started");

// Function to find and analyze potential issues in IconTester.tsx
async function analyzeIconTester() {
  logMessage("\n=== Analyzing IconTester.tsx ===");
  
  const iconTesterPath = path.join(WORKSPACE_ROOT, 'src/components/ui/IconTester.tsx');
  
  if (!fs.existsSync(iconTesterPath)) {
    logMessage(`File not found: ${iconTesterPath}`, true);
    return;
  }
  
  const fileContent = fs.readFileSync(iconTesterPath, 'utf8');
  const lines = fileContent.split('\n');
  
  // Look for FontAwesomeIcon usages without proper icon prop validation
  logMessage("\nLooking for potentially unsafe FontAwesomeIcon usages:");
  
  // Track suspicious lines for detailed analysis
  const suspiciousLines = [];
  const safeIconLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1;
    const line = lines[i];
    
    // Look for FontAwesomeIcon usage
    if (line.includes('FontAwesomeIcon') || line.includes('SafeFontAwesomeIcon')) {
      let suspicious = false;
      let note = "";
      
      // Check if this is properly guarded with a null/empty check
      const prevLines = lines.slice(Math.max(0, i - 5), i).join('\n');
      const nextLines = lines.slice(i, Math.min(lines.length, i + 5)).join('\n');
      const context = prevLines + '\n' + nextLines;
      
      // Check for potentially unsafe icon props
      if (line.includes('icon={') && !context.includes('!icon') && !context.includes('typeof icon')) {
        suspicious = true;
        note = "No null/empty check before using icon prop";
      }
      
      // Check for direct object passing without validation
      if (line.includes('icon={getProIcon(') && !context.includes('try') && !context.includes('catch')) {
        suspicious = true;
        note = "Using getProIcon without try/catch";
      }
      
      // Check for possible empty object literals
      if (line.includes('icon={{') || line.includes('icon={}')) {
        suspicious = true;
        note = "Potential empty object literal";
      }
      
      if (suspicious) {
        suspiciousLines.push({ lineNum, line, note });
        logMessage(`Line ${lineNum}: ${line.trim()} - ${note}`, true);
      } else {
        safeIconLines.push({ lineNum, line });
        logMessage(`Line ${lineNum}: ${line.trim()} - Appears safe`);
      }
    }
  }
  
  // Look for the getProIcon function definition
  logMessage("\nAnalyzing getProIcon function:");
  let getProIconStart = -1;
  let getProIconEnd = -1;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('const getProIcon =')) {
      getProIconStart = i;
      break;
    }
  }
  
  if (getProIconStart !== -1) {
    // Find the end of the function
    let bracketCount = 0;
    for (let i = getProIconStart; i < lines.length; i++) {
      const line = lines[i];
      
      // Count opening brackets
      const openBrackets = (line.match(/{/g) || []).length;
      // Count closing brackets
      const closeBrackets = (line.match(/}/g) || []).length;
      
      bracketCount += openBrackets - closeBrackets;
      
      if (bracketCount === 0 && i > getProIconStart) {
        getProIconEnd = i;
        break;
      }
    }
    
    if (getProIconEnd !== -1) {
      const getProIconFunction = lines.slice(getProIconStart, getProIconEnd + 1).join('\n');
      logMessage("getProIcon function found:");
      
      // Analyze the function for potential issues
      if (!getProIconFunction.includes('!iconName')) {
        logMessage("  ❌ getProIcon doesn't check for undefined iconName", true);
      }
      
      if (!getProIconFunction.includes('iconName === ""')) {
        logMessage("  ❌ getProIcon doesn't check for empty string iconName", true);
      }
      
      if (!getProIconFunction.includes('typeof iconName !== "string"')) {
        logMessage("  ❌ getProIcon doesn't check iconName type", true);
      }
      
      if (!getProIconFunction.includes('try') || !getProIconFunction.includes('catch')) {
        logMessage("  ❌ getProIcon doesn't have proper error handling", true);
      }
      
      // Check if proper kebab-case conversion is done
      if (!getProIconFunction.includes('replace(/([A-Z])/g')) {
        logMessage("  ❌ getProIcon doesn't convert camelCase to kebab-case", true);
      }
    }
  } else {
    logMessage("getProIcon function not found", true);
  }
  
  // Looking for potential empty object issues in IconTester render method
  logMessage("\nDetailed render analysis for empty objects:");
  
  const renderBlocks = [];
  let inRenderMethod = false;
  let blockStart = -1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Mark where we enter the return statement of IconTester
    if (line.includes("return (") && lines[i-2]?.includes("testIcons")) {
      inRenderMethod = true;
      blockStart = i;
    }
    
    // When we're inside the render method, look for empty object patterns
    if (inRenderMethod) {
      if (line.includes("icon={") && !line.includes("typeof") && !line.includes("!")) {
        const renderContext = lines.slice(Math.max(0, i-5), Math.min(lines.length, i+5)).join("\n");
        renderBlocks.push({
          lineNum: i + 1,
          line,
          context: renderContext
        });
        logMessage(`Potential issue at line ${i+1}: ${line}`, true);
      }
    }
    
    // End of render method
    if (inRenderMethod && line === "};") {
      inRenderMethod = false;
    }
  }
  
  // Create a report file
  const reportPath = path.join(WORKSPACE_ROOT, 'font-awesome-debug-report.txt');
  
  let reportContent = "FONT AWESOME DEBUGGER REPORT\n";
  reportContent += "===========================\n\n";
  
  reportContent += "SUSPICIOUS LINES:\n";
  suspiciousLines.forEach(item => {
    reportContent += `Line ${item.lineNum}: ${item.line.trim()} - ${item.note}\n`;
  });
  
  reportContent += "\nRENDER METHOD ISSUES:\n";
  renderBlocks.forEach(item => {
    reportContent += `Line ${item.lineNum}: ${item.line.trim()}\nContext:\n${item.context}\n\n`;
  });
  
  reportContent += "\nRECOMMENDED FIXES:\n";
  reportContent += "1. Ensure SafeFontAwesomeIcon properly checks for empty objects:\n";
  reportContent += "   - Add checks for !icon, empty objects, and JSON.stringify(icon) === '{}'\n";
  reportContent += "   - Return a fallback icon or component when validation fails\n\n";
  
  reportContent += "2. Fix getProIcon function:\n";
  reportContent += "   - Add proper validation for iconName (null/undefined/empty string checks)\n";
  reportContent += "   - Ensure proper error handling with try/catch\n";
  reportContent += "   - Convert camelCase to kebab-case correctly\n\n";
  
  reportContent += "3. Add proper guards in all icon usage locations:\n";
  reportContent += "   - Wrap icon={getProIcon(...)} with validation to prevent empty objects\n";
  reportContent += "   - Consider adding a safer wrapper function like: icon={iconName ? getProIcon(iconName) : ['fas', 'question']}\n";
  
  fs.writeFileSync(reportPath, reportContent);
  logMessage(`Report created at: ${reportPath}`);
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
    logMessage("  FONT AWESOME EMPTY OBJECT DEBUGGER");
    logMessage("=====================================================");
    logMessage(`Workspace root: ${WORKSPACE_ROOT}`);
    
    // Analyze IconTester component
    await analyzeIconTester();
    
    // Find references to IconTester in examples.tsx
    logMessage("\n=== Analyzing examples.tsx for IconTester usage ===");
    const examplesPath = path.join(WORKSPACE_ROOT, 'src/components/ui/examples.tsx');
    
    if (fs.existsSync(examplesPath)) {
      const examplesContent = fs.readFileSync(examplesPath, 'utf8');
      const examplesLines = examplesContent.split('\n');
      
      const iconTesterUsages = [];
      
      for (let i = 0; i < examplesLines.length; i++) {
        const line = examplesLines[i];
        if (line.includes('<IconTester')) {
          const lineNum = i + 1;
          iconTesterUsages.push({ lineNum, line });
          logMessage(`Found IconTester usage at line ${lineNum}: ${line.trim()}`);
        }
      }
      
      if (iconTesterUsages.length === 0) {
        logMessage("No direct IconTester usages found in examples.tsx");
      }
    } else {
      logMessage(`File not found: ${examplesPath}`, true);
    }
    
    // Create simple fix for the component
    const fixPath = path.join(WORKSPACE_ROOT, 'font-awesome-fix.js');
    const fixContent = `/**
 * FONT AWESOME FIX SUGGESTIONS
 * 
 * Copy these solutions to the appropriate files to fix empty object icon errors
 */

// ========================================================================
// 1. SafeFontAwesomeIcon Component Fix
// ========================================================================

const SafeFontAwesomeIcon = ({ icon, className, ...props }) => {
  try {
    // Handle all possible empty/invalid icon cases
    if (!icon || 
        (typeof icon === 'object' && Object.keys(icon).length === 0) || 
        JSON.stringify(icon) === '{}' ||
        (Array.isArray(icon) && !icon[0] && !icon[1])) {
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
    
    return <FontAwesomeIcon icon={icon} className={className} {...props} />;
  } catch (e) {
    console.error('Error rendering FontAwesomeIcon:', e);
    // Return fallback icon
    return <FallbackIcon />;
  }
};

// ========================================================================
// 2. getProIcon Function Fix
// ========================================================================

const getProIcon = (iconName, style = 'fas') => {
  try {
    // Check for undefined or empty iconName
    if (!iconName || typeof iconName !== 'string' || iconName.trim() === '') {
      console.warn(\`Invalid icon name passed to getProIcon: \${iconName}\`);
      return ['fas', 'question'];
    }
    
    // Convert the iconName to a valid IconName - ensure kebab-case format
    const validIconName = iconName.replace(/([A-Z])/g, '-$1').toLowerCase();
    
    // Verify the icon exists in the library
    try {
      // Try to find the icon - if it doesn't exist, this will throw an error
      findIconDefinition({ prefix: style, iconName: validIconName });
    } catch (e) {
      console.warn(\`Icon \${style} \${validIconName} not found in library\`);
      return ['fas', 'question'];
    }
    
    return [style, validIconName];
  } catch (e) {
    console.error(\`Error in getProIcon for \${style} \${iconName}:\`, e);
    // Fallback to a safe icon
    return ['fas', 'question'];
  }
};

// ========================================================================
// 3. Safe Component Usage
// ========================================================================

{/* Make sure you validate the icon name before passing it to getProIcon */}
<SafeFontAwesomeIcon 
  icon={name && typeof name === 'string' ? getProIcon(name, 'fas') : ['fas', 'question']} 
  className={className} 
/>

// Alternative approach using optional chaining and nullish coalescing
<SafeFontAwesomeIcon 
  icon={getProIcon(name ?? 'question', style ?? 'fas')} 
  className={className} 
/>
`;

    fs.writeFileSync(fixPath, fixContent);
    logMessage(`Fix suggestions created at: ${fixPath}`);
    
    // Create list of recommended fixes
    logMessage("\n=== RECOMMENDED FIXES ===");
    logMessage("1. Update the SafeFontAwesomeIcon component in IconTester.tsx to handle all edge cases:");
    logMessage("   - Check for undefined, null, empty objects");
    logMessage("   - Add proper error handling with detailed logging");
    logMessage("   - Add a robust fallback component");
    
    logMessage("\n2. Fix the getProIcon function in IconTester.tsx:");
    logMessage("   - Add proper validation for iconName parameter");
    logMessage("   - Convert camelCase to kebab-case properly");
    logMessage("   - Add try/catch for findIconDefinition calls");
    logMessage("   - Return a safe fallback for invalid icons");
    
    logMessage("\n3. Add guards in the render method:");
    logMessage("   - Add proper null/undefined checks before rendering icons");
    logMessage("   - Use conditional rendering to avoid passing empty objects");
    
    logMessage("\nFor detailed implementation examples, see the fix suggestions file.");
    
    logMessage("\n=== SUMMARY ===");
    logMessage("Diagnostic complete. The fix suggestions file contains examples of fixed code.");
    logMessage(`See log file at: ${LOG_FILE}`);
    
  } catch (error) {
    logMessage(`Error running diagnostic: ${error.message}`, true);
    logMessage(error.stack, true);
  }
}

// Run the main function
main().catch(e => {
  console.error("Fatal error:", e);
  process.exit(1);
}); 