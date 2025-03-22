#!/usr/bin/env node
const { execSync } = require("child_process");
console.log("Running audit with fix mode...");
try { execSync("node scripts/audit-icons.js --fix", { stdio: "inherit" }); } catch (e) { console.error("Error running audit with fix:", e); }
console.log("Updating icons...");
try { execSync("npm run update-icons", { stdio: "inherit" }); } catch (e) { console.error("Error updating icons:", e); }
console.log("Verifying icons...");
try { execSync("node scripts/verify-icons.js", { stdio: "inherit" }); } catch (e) { console.error("Error verifying icons:", e); }
console.log("Running final audit...");
try { execSync("node scripts/audit-icons.js", { stdio: "inherit" }); } catch (e) { console.error("Error running final audit:", e); }
