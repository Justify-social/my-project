JIRA Ticket: Comprehensive Logging Statement Inventory for Production Review
Epic Link: [Production Readiness]
Project: [Your Project Key]
Ticket Type: Task
Priority: High
Assignee: [TBD]
Reporter: [Your Name]
Labels: logging, production-readiness, code-audit
Sprint: [Current/Next Sprint]
Created Date: May 13, 2025
Summary
Document and inventory all console.log, console.warn, and console.error statements in the codebase, as identified in the Codebase Logging Review, for review prior to production deployment. This ticket provides a comprehensive list of every logging statement with exact file paths, line numbers, and code snippets, excluding src/app/api/webhooks/clerk/route.ts due to active debugging.
Description
This ticket serves as a detailed catalog of all console.log, console.warn, and console.error statements identified in the codebase, as per the Codebase Logging Review document. Each logging statement is listed with its precise location (file path and line number) and the exact code snippet, organized by file and log type. The purpose is to provide a complete reference for all logging statements that may need review or action for production readiness. Logging in src/app/api/webhooks/clerk/route.ts is explicitly excluded from this inventory due to ongoing webhook debugging.
Scope

Files Covered: All files listed in the Codebase Logging Review, including src/services/_, src/lib/_, src/components/_, src/app/_, src/hooks/_, src/utils/_, and scripts/\*, except src/app/api/webhooks/clerk/route.ts.
Log Types: console.log, console.warn, console.error.
Detail Level: Each log includes the file path, line number, and full code snippet as provided in the document.
Exclusions: Logging statements in src/app/api/webhooks/clerk/route.ts.

Logging Statement Inventory
Below is the complete list of all identified logging statements, grouped by file and categorized by log type (console.log, console.warn, console.error). Each entry includes the file path, line number, and the exact code snippet.
src/services/asset-service.ts
console.log:

Line 19: console.log(\[${correlationId}] Deleting asset from storage:`, url);`
Line 54: console.log(\[${correlationId}] Successfully deleted asset from storage`, result);`
Line 56: console.log(\[${correlationId}] Successfully deleted asset from storage`);`

console.error:

Line 36: console.error(\[${correlationId}] Failed to delete from storage:`, errorData);`
Line 39: console.error(\n          \[${correlationId}] Failed to delete from storage: ${response.status} ${response.statusText}\n        );`
Line 44: console.error(\n          \[${correlationId}] Failed to delete from storage: ${response.status} ${response.statusText}\n        );`
Line 61: console.error(\[${correlationId}] Error deleting asset from storage:`, error);`
Line 80: console.error(\\'Failed to log orphaned asset:\\', error);

src/lib/analytics/analytics.ts
console.log:

Line 3: console.log(\[Analytics] ${eventName}`, properties);`

src/lib/db.ts
console.log:

Line 18: console.log('Connected to database');
Line 39: console.log('SERVER: Returning cached branding settings for', companyId);
Line 49: console.log('CLIENT: Found saved mock branding settings:', parsed);
Line 135: console.log('Saving branding settings (mock):', settings);
Line 187: console.log('Preserving existing logo URL:', existingData.logoUrl);
Line 193: console.log('Logo explicitly removed');
Line 205: console.log('Final data to save with logo handling:', mockData);
Line 214: console.log('SERVER: Saved mock branding settings to global store');
Line 219: console.log('CLIENT: Saved mock branding settings to localStorage');

console.warn:

Line 179: console.warn('Existing mock data does not match BrandingSettings type:', rawExistingData);

console.error:

Line 21: console.error('Failed to connect to database:', error);
Line 55: console.error('Error parsing saved mock branding settings:', e);
Line 60: console.error('Error accessing mock branding storage:', e);
Line 89: console.error('Error storing default settings:', e);
Line 103: console.error('Error fetching branding settings:', error);
Line 166: console.error(\n 'Error parsing saved mock branding settings from localStorage:',\n parseError\n );
Line 182: console.error('Error accessing mock branding storage:', e);
Line 222: console.error('Error saving to mock branding storage:', e);
Line 248: console.error('Error saving branding settings:', error);

src/lib/insightiqService.ts
console.log:

Line 228: console.log('[EXTREME DEBUG] Fetch Headers:', JSON.stringify(fetchOptions.headers));

src/lib/cint.ts
console.log:

Line 722: console.log("Project Created (mock):", project);
Line 728: console.log("Target Group Created (mock):", targetGroup);
Line 733: console.log("Target Group Launch initiated (mock):", launchResponse);
Line 740: console.log("Target Group Overview (mock):", overview);
Line 746: console.log("S2S Respondent Validation (mock):", s2sValidation);
Line 751: console.log("S2S Respondent Status Update (mock):", s2sUpdate);

console.warn:

Line 708: console.warn("Please configure actual Cint credentials in environment variables for meaningful testing.");

console.error:

Line 755: console.error("Error in Cint service test:", error);

src/lib/server/server.ts
console.log:

Line 51: console.log('Attempting to initialize WebSocket server...');
Line 56: console.log('> WebSocket server initialized');

console.error:

Line 41: console.error('HTTP Server Error:', err);
Line 59: console.error('Failed to initialize WebSocket server:', wsError);
Line 73: console.error('Error occurred preparing the server:', err);

src/lib/middleware/api/validation/validate-request.ts
console.log:

Line 79: console.log('[Validation Middleware] Data validated successfully');

console.error:

Line 117: console.error('Error getting validated data:', error);

src/lib/middleware/cursor-ai/graphiti-check-enforcer.ts
console.log:

Line 29: console.log(\[GraphitiEnforcer] Expired session removed: ${sessionId}`);`
Line 83: console.log('[GraphitiEnforcer] Bypass header detected with valid secret');
Line 122: console.log(\[GraphitiTelemetry] ${record.action} | ${record.sessionId} | ${record.success}`);`
Line 164: console.log(\[GraphitiEnforcer] Graphiti check detected for session ${sessionId}`);`
Line 218: console.log(\n \[GraphitiEnforcer] Task completed, resetting check state for session ${sessionId}`\n    );`

console.warn:

Line 179: console.warn(\n \[GraphitiEnforcer] Blocking request - missing Graphiti check for session ${sessionId}`\n    );`

console.error:

Line 56: console.error('[GraphitiEnforcer] Error extracting task info:', error);
Line 95: console.error('[GraphitiEnforcer] Error checking for Graphiti in request:', error);

src/lib/prisma.ts
console.log:

Line 9: console.log(\[src/lib/prisma.ts] Effective Database URL Source: ${dbUrlSource}`);`
Line 10: console.log(\n '[src/lib/prisma.ts] Runtime Effective DATABASE_URL:',\n effectiveDbUrl\n ? effectiveDbUrl.substring(0, effectiveDbUrl.indexOf('@') + 1) + '...'\n : 'NOT SET'\n );
Line 34: console.log('[src/lib/prisma.ts] Creating new PrismaClient instance.');

src/hooks/useDebouncedInfluencerValidation.ts
console.log:

Line 33: console.log(\VALIDATING: ${handle} on ${platform}...`);`
Line 61: console.log(\VALIDATION SUCCESS: ${handle} on ${platform}`, validatedData);`

console.warn:

Line 40: console.warn(\Validation failed simulation for ${handle} on ${platform}`);`

console.error:

Line 65: console.error('Error during simulated validation:', error);
Line 125: console.error('Validation hook caught error:', err);

src/utils/file-utils.ts
console.log:

Line 110: console.log(\Type detection for ${url}: type=${detectedType}, format=${format}`);`
Line 225: console.log(\Found alternative file ID: ${data.possibleReplacement}`);`

src/utils/image-compression.ts
console.log:

Line 77: console.log(\n 'Compression params:', \n maxSizeMB, \n maxWidthOrHeight, \n useWebWorker, \n initialQuality\n );

src/utils/schema-validator.ts
console.log:

Line 42: console.log(\Validating ${models.length} models against the database...`);`

src/utils/enum-transformers.ts
console.log:

Line 28: console.log(message);

src/components/features/campaigns/Step1Content.tsx
console.log:

Line 483: console.log('Navigate to step', step);

src/components/features/campaigns/Step2Content.tsx
console.log:

Line 267: console.log(\n '[Step2Content] Form data after mapping for context:',\n mappedDataForContext\n );
Line 298: console.log('Initial Features:', initialFeatures);
Line 385: console.log('[Step 2] Attempting Manual Save...');
Line 393: console.log('[Step 2] Form data is valid for manual save.');
Line 410: console.log('[Step 2] Payload prepared for manual save:', payload);
Line 417: console.log('[Step 2] Manual save successful!');

console.warn:

Line 255: console.warn('[Step2Content] Wizard state is null during render.');
Line 388: console.warn('[Step 2] Validation failed for manual save.');

console.error:

Line 227: console.error("Autosave error:", error);
Line 423: console.error("[Step 2] Manual save failed.");
Line 428: console.error("[Step 2] Error during manual save:", error);

src/components/features/campaigns/Step3Content.tsx
console.log:

Line 138: console.log(\n '[Step3Content] Form data after mapping for context:',\n mappedDataForContext\n );
Line 159: console.log('[Step 3] Attempting Manual Save...');
Line 167: console.log('[Step 3] Form data is valid for manual save.', data);
Line 179: console.log('[Step 3] Payload prepared for manual save, sending to saveProgress:', payload);
Line 186: console.log('[Step 3] Manual save successful!');

console.warn:

Line 162: console.warn('[Step 3] Validation failed for manual save.');

console.error:

Line 192: console.error("[Step 3] Manual save failed.");
Line 197: console.error("[Step 3] Error during manual save:", error);

src/components/features/campaigns/Step4Content.tsx
console.log:

Line 100: console.log('Form state after appending assets:', form.getValues('assets'));
Line 154: console.log(\n '[Step4Content] Form data after mapping for context:',\n mappedDataForContext\n );
Line 177: console.log('[Step 4] Attempting Manual Save...');
Line 187: console.log('[Step 4] Form data is valid for manual save.');
Line 197: console.log('[Step 4] Payload prepared for manual save:', payload);
Line 204: console.log('[Step 4] Manual save successful!');
Line 280: console.log(\Rendering AssetCardStep4 for index: ${index}, field data:`, field);`

console.warn:

Line 181: console.warn('[Step 4] Validation failed for manual save.');
Line 233: console.warn('[Step4Content] Wizard state is null during render.');

console.error:

Line 107: console.error('Upload failed in parent:', error);
Line 211: console.error("[Step 4] Manual save failed.");
Line 216: console.error("[Step 4] Error during manual save:", error);

src/components/features/campaigns/Step5Content.tsx
console.log:

Line 615: console.log('[Step 5] Attempting final campaign submission for ID:', wizard.campaignId);
Line 633: console.log(\n '[Step5Content] Final wizard state before submission:',\n wizardStateToSubmit\n );
Line 657: console.log('[Step5Content] Navigation after successful POST .../submit initiated.');

console.error:

Line 645: console.error("Error preparing payload for submission:", error);
Line 652: console.error("Validation failed before submission:", validationResult.error.format());
Line 663: console.error('[Step5Content] POST .../submit failed:', errorData);
Line 666: console.error('Submission Error (catch block):', err);

src/components/ui/icon/icons.ts
console.log:

Line 26: console.log('[icons.ts]', ...args);

console.warn:

Line 100: console.warn(\[Icon Warning] ${message}`, ..._args);`

src/components/ui/icon/icon.tsx
console.log:

Line 36: console.log(\[Icon DEBUG] useEffect for iconId: ${iconId}, iconPath: ${iconPath}`);`
Line 48: console.log(\[Icon DEBUG] fetchSvg called for path: ${iconPath}`);`
Line 51: console.log(\[Icon DEBUG] fetch response status for ${iconPath}: ${response.status}`);`
Line 56: console.log(\n \[Icon DEBUG] SVG content loaded successfully for ${iconId} from ${iconPath}`\n        );`
Line 65: console.log(\[Icon DEBUG] SVG content sanitized, setting state for ${iconId}`);`
Line 82: console.log(\[Icon DEBUG] Resetting state and calling fetchSvg for ${iconId}`);`

console.error:

Line 39: console.error(\[Icon DEBUG] ${errorMsg}`);`
Line 72: console.error(\n \[Icon DEBUG] Error fetching SVG for ${iconId} from ${iconPath}: ${response.status} ${response.statusText}\n );`

src/components/ui/file-uploader.tsx
console.log:

Line 98: console.log(\\'Upload Complete:\\', res);

console.warn:

Line 132: console.warn('Rejected files:', fileRejections);

console.error:

Line 111: console.error('UploadThing Error:', error);

src/components/ui/card-asset-step-4.tsx
console.log:

Line 134: console.log(\AssetCardStep4[${assetIndex}] - Props:`, { assetIndex, availableInfluencers });`
Line 135: console.log(\AssetCardStep4[${assetIndex}] - Watched Data:`, asset);`
Line 182: console.log('Save icon clicked');
Line 222: console.log(\n \AssetCardStep4[${assetIndex}] - onInfluencerSelect - value:`,\n            influencerId\n          );`
Line 231: console.log(\n \AssetCardStep4[${assetIndex}] - onRationaleChange - value:`,\n            e.target.value\n          );`
Line 336: console.log(\n \AssetCardStep4[${assetIndex}] - Upload Success - file: ${file.name}, url: ${res?.[0]?.url}`\n        );`
Line 368: console.log(\n          \AssetCardStep4[${assetIndex}] - Upload Error - file: ${file.name}, error:`,\n          error\n        );`

console.error:

Line 47: console.error('Error formatting number:', e);

src/app/(admin)/debug-tools/api-verification/page.tsx
console.log:

Line 61: console.log(\[ApiVerificationPage] Sending request to verify ALL APIs`);`
Line 94: console.log('[ApiVerificationPage] Received verification results.');

console.error:

Line 74: console.error(\n \[ApiVerificationPage] Error verifying API: ${api.name}`,\n          verificationError\n        );`
Line 112: console.error('[ApiVerificationPage] Fetch error calling verification route:', error);

src/app/(admin)/debug-tools/ui-components/utils/discovery.ts
console.log:

Line 159: console.log(\Starting component discovery in: ${UI_COMPONENTS_DIR}`);`

console.warn:

Line 107: console.warn(\Could not determine component name for: ${filePath}`);`
Line 190: console.warn(\n \Skipping component preview generation for ${componentName}: Missing category or status.`\n        );`
Line 260: console.warn('Falling back to dynamic component discovery');

console.error:

Line 113: console.error(\Error reading or parsing file ${filePath}:`, error);`
Line 150: console.error(\Could not read directory ${dir}:`, readDirError);`
Line 259: console.error('Error loading static component registry:', error);

src/lib/api-verification.ts
console.warn:

Line 56: console.warn(\Host ${hostname} connectivity check failed:`, error);`
Line 79: console.warn(\${apiName} verification warning: Missing API token, will use fallback service`);`
Line 129: console.warn(\n \${apiName} verification warning: Primary geolocation service error, using fallback.`\n      );`
Line 134: console.warn('Primary geolocation service error, trying fallback\\', primaryError);
Line 319: console.warn(\n \${apiName} verification warning: Primary exchange rates service error, using fallback.`\n      );`
Line 324: console.warn('Primary exchange rates service error, trying fallback\\', primaryError);
Line 486: console.warn(\${apiName} verification warning: Missing API key`);`

console.error:

Line 198: console.error(\n \[API Verify] ${apiName} check failed for ${serviceUrl}: ${error.message}`,\n        error\n      );`
Line 226: console.error(\n \[API Verify] Error parsing JSON from ${apiName} at ${serviceUrl}: ${error.message}`,\n        error\n      );`
Line 246: console.error(\${apiName} verification failed with unexpected error: ${errorMessage}`);`
Line 388: console.error(\n \[API Verify] ${apiName} check failed for ${serviceUrl}: ${error.message}`,\n        error\n      );`
Line 418: console.error(\n \[API Verify] Error parsing JSON from ${apiName} at ${serviceUrl}: ${error.message}`,\n        error\n      );`
Line 438: console.error(\${apiName} verification failed with unexpected error: ${errorMessage}`);`
Line 469: console.error(\${apiName} host is unreachable`);`
Line 555: console.error(\${apiName} verification failed with HTTP ${response.status}`);`
Line 571: console.error(\n \[API Verify] Error parsing JSON from ${apiName}: ${error.message}`,\n        error\n      );`
Line 590: console.error(\${apiName} verification failed with unexpected error: ${errorMessage}`);`
Line 921: console.error(\[Server Verify] ${apiName} verification failed:`, message);`
Line 1396: console.error(\[Server Verify] ${apiName} verification failed:`, message);`

src/lib/logger.ts
console.warn:

Line 143: console.warn(JSON.stringify(data, null, 2));

console.error:

Line 146: console.error(JSON.stringify(data, null, 2));

src/lib/data-mapping/db-logger.ts
console.warn:

Line 263: console.warn(\n '[DbLogger] Warning: Failed to deep clone data for sanitization. Returning original data.'\n );
Line 278: console.warn(\n '[DbLogger] Warning: Failed to deep clone data for sanitization. Returning original data.'\n );
Line 363: console.warn(\n \${prefix} ${log.message}`,\n          log.campaignId ? `(Campaign ID: ${log.campaignId})` : '',\n          log.data ? log.data : '',\n          log.error ? log.error : ''\n        );`

console.error:

Line 371: console.error(\n \${prefix} ${log.message}`,\n          log.campaignId ? `(Campaign ID: ${log.campaignId})` : '',\n          log.data ? log.data : '',\n          log.error ? log.error : ''\n        );`
Line 401: console.error('Failed to store log:', error);

src/lib/data-mapping/schema-mapping.ts
console.warn:

Line 80: console.warn(\Invalid Currency string: ${input}`);`
Line 90: console.warn(\Invalid Platform string: ${input}`);`
Line 105: console.warn(\Invalid KPI string: ${input}`);`
Line 124: console.warn(\Invalid Feature string: ${input}`);`
Line 281: console.warn(\Invalid or missing asset type: ${asset.type}, skipping asset.`);`
Line 285: console.warn(\Asset URL missing for ${asset.name || 'Untitled Asset'}, skipping asset.`);`

src/components/ui/icon/adapters/font-awesome-adapter.tsx
console.warn:

Line 81: console.warn('IconAdapter: No icon ID provided');

src/components/ui/navigation/header.tsx
console.warn:

Line 68: console.warn('Logo image failed to load');

src/components/ui/navigation/mobile-menu.tsx
console.warn:

Line 216: console.warn('Logo image failed to load');

src/components/ui/card-asset.tsx
console.warn:

Line 131: console.warn('Play was prevented:', error);
Line 163: console.warn('Auto-play was prevented:', error);

console.error:

Line 175: console.error('Error replaying video:', err);
Line 186: console.error('Error replaying video:', err);

src/utils/logger.ts
console.warn:

Line 47: console.warn('[WARN]', ...args);

src/utils/payload-sanitizer.ts
console.warn:

Line 110: console.warn(\Removing incomplete ${fieldName Salsa to prevent validation errors`);`

src/app/(admin)/debug-tools/database/page.tsx
console.warn:

Line 229: console.warn('Redirecting non-admin user from Database Debug page');

console.error:

Line 248: console.error('Error fetching database health:', error);
Line 297: console.error('Error clearing slow queries:', error);
Line 1159: console.error('Error running script:', error);

src/app/api/debug/run-script/route.ts
console.warn:

Line 51: console.warn(\Forbidden access attempt to run-script by user ${userId} with role ${userRole}`);`
Line 66: console.warn(\Attempted to run disallowed script: ${requestedScriptName}`);`

console.error:

Line 77: console.error(\Script not found or not executable: ${scriptPath}`, fsError);`
Line 94: console.error(\Script execution error for ${scriptConfig.path}:\n${stderr}`);`

src/app/api/icons/route.ts
console.warn:

Line 179: console.warn(error);
Line 185: console.warn(error);

src/app/api/asset-proxy/route.ts
console.warn:

Line 467: console.warn(\Final direct check failed, proceeding with 410: ${\_e}`);`
Line 532: console.warn(\Failed to fetch ${url}:`, error);`

src/app/api/internal/graphiti-telemetry/route.ts
console.warn:

Line 24: console.warn(\n '[Graphiti Telemetry] Received empty or invalid payload for telemetry',\n {\n payload: body,\n }\n );

src/app/(campaigns)/campaigns/page.tsx
console.warn:

Line 397: console.warn(\n '[CampaignsPage] Error fetching campaigns from API:',\n errorData.error,\n errorData.details // Log details if available\n );
Line 441: console.warn(\Invalid date format: ${dateString}`);`
Line 608: console.warn('Campaign not found during deletion (404):', campaignId);

scripts/icons/download-light-icons.mjs
console.warn:

Line 28: console.warn(\⚠️ Skipping icon with missing data: ${id}`);`
Line 61: console.warn(\⚠️ Icon not found in light icons: ${faIconName}. Available similar icons:`);`
Line 72: console.warn(\⚠️ Non-light icons not supported in this version: ${style}`);`
Line 82: console.warn(\⚠️ Failed to render icon: ${name}`);`

scripts/tree-shake/tree-shake.mjs
console.warn:

Line 257: console.warn(\Skipping removal of ${filePath} due to backup failure`);`

scripts/icons/audit-icons.mjs
console.warn:

Line 60: console.warn(\n chalk.yellow("⚠️ Some icons in the current registry don't seem to be used in the codebase.")\n );

scripts/icons/merge-icon-registries.mjs
console.warn:

Line 151: console.warn(\⚠️ Skipping icon without ID in staging registry`);`

scripts/icons/download-solid-icons.mjs
console.warn:

Line 28: console.warn(\⚠️ Skipping icon with missing data: ${id}`);`
Line 61: console.warn(\⚠️ Icon not found in solid icons: ${faIconName}. Available similar icons:`);`
Line 72: console.warn(\⚠️ Non-solid icons not supported in this version: ${style}`);`
Line 82: console.warn(\⚠️ Failed to render icon: ${name}`);`

scripts/icons/download-brands-icons.mjs
console.warn:

Line 25: console.warn(\⚠️ Skipping icon with missing data: ${id}`);`
Line 58: console.warn(\⚠️ Icon not found in brand icons: ${faIconName}. Available similar icons:`);`
Line 69: console.warn(\⚠️ Non-brand icons not supported in this version: ${style}`);`
Line 79: console.warn(\⚠️ Failed to render icon: ${name}`);`

scripts/icons/generate-registry-module.mjs
console.warn:

Line 25: console.warn(\[GenerateRegistry] Invalid format in ${fileName}`);`
Line 27: console.warn(\[GenerateRegistry] Registry file not found: ${fileName}`);`

scripts/algolia/src/lib/algolia.js
console.warn:

Line 214: console.warn('No campaigns to index');

scripts/config/validate-config.js
console.warn:

Line 68: console.warn('⚠️ WARNING: .env.example file not found. Cannot validate environment variables.');
Line 131: console.warn(\n \⚠️ WARNING: The following variables are in .env but missing from .env.example:\n`,\n      missingInExample.join(', ')\n    );`

config/scripts/validate-config.js
console.warn:

Line 68: console.warn('⚠️ WARNING: .env.example file not found. Cannot validate environment variables.');
Line 131: console.warn(\n \⚠️ WARNING: The following variables are in .env but missing from .env.example:\n`,\n      missingInExample.join(', ')\n    );`

src/pages/api/cursor-ai/task.ts
console.error:

Line 69: console.error('Error processing CursorAI task:\\', error);

src/lib/stripe.ts
console.error:

Line 4: console.error(\n 'Build Error: STRIPE_SECRET_KEY is not defined. Stripe functionality will be disabled.'\n );

src/lib/mux.ts
console.error:

Line 202: console.error("Error in Mux service test:", error);

src/lib/data/dashboard.ts
console.error:

Line 132: console.error('Error parsing budget JSON:', e);
Line 153: console.error('Error fetching upcoming events:', error);
Line 255: console.error('Error parsing budget JSON:', e);

src/lib/session.ts
console.error:

Line 29: console.error('[getSession] Error fetching Clerk session:', error);

src/components/billing/StripeElementWrapper.tsx
console.error:

Line 76: console.error('Stripe confirmSetup error:', result.error);
Line 81: console.error('Unexpected error during confirmSetup call:', e);
Line 139: console.error('Error fetching client secret:', error);

src/components/features/influencers/ProfileHeader.tsx
console.error:

Line 66: console.error('Copy email error:', err);

src/components/features/campaigns/InfluencerCard.tsx
console.error:

Line 39: console.error('Error fetching influencer data:', err);

src/components/features/brand-lift/CommentThread.tsx
console.error:

Line 78: console.error('Error adding comment:', error);

src/components/features/core/error-handling/ErrorFallback.tsx
console.error:

Line 15: console.error('Render Error Caught:', error);

src/components/features/core/error-handling/ErrorBoundary.tsx
console.error:

Line 22: console.error('Error caught by ErrorBoundary:', error, errorInfo);

src/lib/error-logging.ts
console.error:

Line 35: console.error('Error occurred:', errorDetails);

src/components/ui/progress-bar-wizard.tsx
console.error:

Line 92: console.error('Manual save failed:', error);

src/components/ui/dialog-confirm-delete.tsx
console.error:

Line 60: console.error('Error during onConfirm in ConfirmDeleteDialog:', error);

src/lib/middleware/api/check-permissions.ts
console.error:

Line 44: console.error('Server-side permission check error:', error);

src/components/ui/navigation/sidebar.tsx
console.error:

Line 171: console.error('Error loading icon registry:', error);

src/components/ui/calendar-upcoming.tsx
console.error:

Line 120: console.error('Error formatting campaign duration:', e);
Line 178: console.error(\Error processing event date for event ID ${event.id}:`, e);`

src/providers/SearchProvider.tsx
console.error:

Line 55: console.error('Search error:', error);

src/app/(admin)/debug-tools/ui-components/page.tsx
console.error:

Line 124: console.error('Error fetching component registry JSON:', err);
Line 156: console.error('Failed to load icon registry:', error);

src/app/(dashboard)/dashboard/ClientDashboard.tsx
console.error:

Line 84: console.error('Invalid events data format:', eventsData);
Line 91: console.error('Invalid campaigns data format:', campaignsData);
Line 99: console.error('Failed to fetch dashboard data:', error);

src/app/api/debug/calendar-events/route.ts
console.error:

Line 97: console.error('API Route Error fetching calendar events:', error);

Acceptance Criteria

Completeness:
Every console.log, console.warn, and console.error statement listed in the Codebase Logging Review is documented with its file path, line number, and exact code snippet.

Exclusions:
No logging statements from src/app/api/webhooks/clerk/route.ts are included.

Accuracy:
All listed logging statements match the provided document in terms of location and content.

Organization:
Logging statements are grouped by file and categorized by log type for easy reference.

Notes

This ticket is a reference inventory and does not include actions for removal or replacement of logging statements, as per the request for detail-focused content.
The line numbers and snippets are sourced directly from the provided Codebase Logging Review document, assumed to be accurate as of May 13, 2025.
Any discrepancies in file paths (e.g., config/scripts/validate-config.js vs. scripts/config/validate-config.js) are preserved as listed in the document.
