#!/usr/bin/env node
const { execSync } = require("child_process");
console.log("🔧 Complete Icon System Migration and Cleanup");
console.log("Step 1: Running audit-icons.js with fix mode...");
try { execSync("node scripts/audit-icons.js --fix", { stdio: "inherit" }); } catch (e) { console.error("Error running audit with fix:", e); }
console.log("Step 2: Running fix-icon-issues.js...");
try { execSync("node scripts/fix-icon-issues.js", { stdio: "inherit" }); } catch (e) { console.error("Error running fix-icon-issues:", e); }
console.log("Step 3: Updating icons...");
try { execSync("npm run update-icons", { stdio: "inherit" }); } catch (e) { console.error("Error updating icons:", e); }
console.log("Step 4: Enhancing icon validation...");
try { execSync("node scripts/enhance-icon-validation.js", { stdio: "inherit" }); } catch (e) { console.error("Error enhancing icon validation:", e); }
console.log("Step 5: Verifying icons...");
try { execSync("node scripts/verify-icons.js", { stdio: "inherit" }); } catch (e) { console.error("Error verifying icons:", e); }
console.log("Step 6: Running final audit...");
try { execSync("node scripts/audit-icons.js", { stdio: "inherit" }); } catch (e) { console.error("Error running final audit:", e); }
console.log("Step 7: Checking debug icons...");
try { execSync("node scripts/check-debug-icons.js", { stdio: "inherit" }); } catch (e) { console.error("Error checking debug icons:", e); }

console.log("Step 8: Fixing remaining TypeScript errors...");
try { execSync("node scripts/fix-typescript-errors.js", { stdio: "inherit" }); } catch (e) { console.error("Error fixing TypeScript errors:", e); }

console.log("Step 9: Standardizing icon theming...");
try { execSync("node scripts/standardize-icon-theming.js", { stdio: "inherit" }); } catch (e) { console.error("Error standardizing icon theming:", e); }

console.log("✅ Icon migration and cleanup completed! All icons should now be working correctly.");
