#!/usr/bin/env node

/**
 * Simple Font Awesome Empty Object Test
 * 
 * This script helps identify where empty object icons are causing issues 
 * in the IconTester.tsx file.
 */

const fs = require('fs');
const path = require('path');

const WORKSPACE_ROOT = process.cwd();

// Main function
async function main() {
  console.log("=== Font Awesome Empty Object Test ===");
  
  const iconTesterPath = path.join(WORKSPACE_ROOT, 'src/components/ui/IconTester.tsx');
  
  if (!fs.existsSync(iconTesterPath)) {
    console.error(`IconTester.tsx not found at ${iconTesterPath}`);
    process.exit(1);
  }
  
  console.log(`Analyzing ${iconTesterPath}...`);
  
  const content = fs.readFileSync(iconTesterPath, 'utf8');
  const lines = content.split('\n');
  
  // Check for potentially problematic patterns
  const problems = {
    emptyIconProps: [],
    undefinedChecks: [],
    safeIconUsage: []
  };
  
  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1;
    const line = lines[i].trim();
    
    // Check for empty object usage
    if (line.includes('icon={}') || line.includes('icon={{ }}')) {
      problems.emptyIconProps.push({ lineNum, line });
    }
    
    // Check for proper undefined checks
    if ((line.includes('icon={') || line.includes('<FontAwesomeIcon')) && 
        !line.includes('!icon') && 
        !line.includes('typeof icon') && 
        !line.includes('icon ?')) {
      
      // Get surrounding lines for context
      const prevLine = i > 0 ? lines[i-1].trim() : '';
      const nextLine = i < lines.length - 1 ? lines[i+1].trim() : '';
      
      if (!prevLine.includes('!icon') && !prevLine.includes('typeof icon') && 
          !nextLine.includes('!icon') && !nextLine.includes('typeof icon')) {
        problems.undefinedChecks.push({ lineNum, line, context: `${prevLine}\n${line}\n${nextLine}` });
      }
    }
    
    // Check for safety wrappers
    if (line.includes('SafeFontAwesomeIcon')) {
      const params = line.substring(line.indexOf('icon={') + 6, line.indexOf('}', line.indexOf('icon={')));
      problems.safeIconUsage.push({ lineNum, line, params });
    }
  }
  
  // Report findings
  console.log("\n=== FINDINGS ===");
  
  if (problems.emptyIconProps.length === 0) {
    console.log("✅ No direct empty object props found");
  } else {
    console.log(`❌ Found ${problems.emptyIconProps.length} empty icon props:`);
    problems.emptyIconProps.forEach(p => {
      console.log(`   Line ${p.lineNum}: ${p.line}`);
    });
  }
  
  if (problems.undefinedChecks.length === 0) {
    console.log("✅ All icon usages appear to be properly checked");
  } else {
    console.log(`⚠️ Found ${problems.undefinedChecks.length} potentially unsafe icon usages (missing undefined checks):`);
    problems.undefinedChecks.forEach(p => {
      console.log(`   Line ${p.lineNum}: ${p.line}`);
    });
  }
  
  // Check if SafeFontAwesomeIcon properly handles empty objects
  const safeFaComponent = content.substring(
    content.indexOf('const SafeFontAwesomeIcon'), 
    content.indexOf('};', content.indexOf('const SafeFontAwesomeIcon')) + 2
  );
  
  if (safeFaComponent.includes('!icon') && 
      (safeFaComponent.includes('Object.keys(icon)') || safeFaComponent.includes('typeof icon === \'object\''))) {
    console.log("✅ SafeFontAwesomeIcon component handles empty objects properly");
  } else {
    console.log("❌ SafeFontAwesomeIcon may not be handling empty objects properly");
  }
  
  // Check getProIcon function
  const getProIcon = content.substring(
    content.indexOf('const getProIcon'), 
    content.indexOf('};', content.indexOf('const getProIcon')) + 2
  );
  
  if (getProIcon.includes('!iconName') && 
      getProIcon.includes('typeof iconName !== \'string\'') &&
      getProIcon.includes('try') && 
      getProIcon.includes('catch')) {
    console.log("✅ getProIcon function has proper validation and error handling");
  } else {
    console.log("❌ getProIcon function may need better validation or error handling");
  }
  
  // Print recommended fixes based on findings
  console.log("\n=== RECOMMENDED FIXES ===");
  
  if (problems.emptyIconProps.length > 0 || problems.undefinedChecks.length > 0) {
    console.log("1. Fix all direct empty object icon props and add proper validation");
  }
  
  if (!safeFaComponent.includes('!icon') || 
      !safeFaComponent.includes('Object.keys(icon)') || 
      !safeFaComponent.includes('typeof icon === \'object\'')) {
    console.log("2. Ensure SafeFontAwesomeIcon properly checks for empty objects");
  }
  
  if (!getProIcon.includes('!iconName') || 
      !getProIcon.includes('typeof iconName !== \'string\'') ||
      !getProIcon.includes('try') || 
      !getProIcon.includes('catch')) {
    console.log("3. Add proper validation and error handling to getProIcon function");
  }
  
  console.log("\nTest complete!");
}

// Run the main function
main().catch(error => {
  console.error("Error running test:", error);
  process.exit(1);
}); 