# 'any' Type Usage Report

Generated on: 2025-03-27T11:48:53.702Z

## Summary

- Files with `any` type usage: 121
- Total occurrences: 386

## Files with 'any' type usage

### src//middleware/check-permissions.ts (1 occurrences)

- Line 20: `// Check if user has any of the required roles that grant the permissions`

### src//middleware/handle-db-errors.ts (1 occurrences)

- Line 107: `// Generic error response for any other types of errors`

### src//middleware/api/validate-api.ts (1 occurrences)

- Line 86: `// Log and return any unexpected errors`

### src//middleware/api/handle-api-errors.ts (1 occurrences)

- Line 113: `// Generic error response for any other types of errors`

### src//middleware/api-response-middleware.ts (1 occurrences)

- Line 7: `export function createApiResponse(data: any, options?: ResponseInit) {`

### src//contexts/SearchContext.tsx (1 occurrences)

- Line 44: `// Cancel any pending request`

### src//context/SearchContext.tsx (1 occurrences)

- Line 44: `// Cancel any pending request`

### src//app/(campaigns)/campaigns/wizard/submission/SubmissionContent.tsx (1 occurrences)

- Line 16: `const [campaign, setCampaign] = useState<any>(null);`

### src//app/(campaigns)/campaigns/[id]/backup/page.original.tsx (12 occurrences)

- Line 170: `};creativeAssets: any[];`
- Line 171: `creativeRequirements: any[];`
- Line 754: `return Boolean(value != null && typeof value === 'object' && typeof (value as any)[Symbol.iterator] === 'function');`
- Line 761: `function debugString(value: any, fieldName: string): string {`
- Line 801: `function validateCampaignData(data: any): CampaignValidation {`
- Line 892: `testComponentProps<T extends Record<string, any>>(componentName: string, props: T, requiredProps: Array<keyof T> = []): void {`
- Line 979: `static testNullAccess(componentName: string, value: any, path: string): void {`
- Line 989: `static testBatchProps(componentName: string, props: Record<string, any>): void {`
- Line 1031: `function safeProps<T extends Record<string, any>>(componentName: string, props: T): void {`
- Line 1373: `locations: result.locations ? result.locations.map((loc: any) => loc.location || '') : [],`
- Line 1374: `languages: result.targeting?.languages ? result.targeting.languages.map((lang: any) => lang.language || '') : ['English']`
- Line 1530: `// Log if any critical errors were found`

### src//app/(campaigns)/campaigns/[id]/page.tsx (8 occurrences)

- Line 174: `};creativeAssets: any[];`
- Line 175: `creativeRequirements: any[];`
- Line 1037: `return Boolean(value != null && typeof value === 'object' && typeof (value as any)[Symbol.iterator] === 'function');`
- Line 1044: `function debugString(value: any, fieldName: string): string {`
- Line 1084: `function validateCampaignData(data: any): CampaignValidation {`
- Line 1408: `locations: result.locations ? result.locations.map((loc: any) => loc.location || '') : [],`
- Line 1409: `languages: result.targeting?.languages ? result.targeting.languages.map((lang: any) => lang.language || '') : ['English']`
- Line 1754: `{data.creativeAssets.map((asset: any, index: number) =>`

### src//app/(campaigns)/campaigns/page.tsx (5 occurrences)

- Line 22: `const transformCampaignData = (campaign: any): Campaign => {`
- Line 31: `const safelyParseDate = (dateValue: any): string => {`
- Line 61: `const safelyParseJSON = (jsonValue: any, defaultValue: any): any => {`
- Line 76: `const safelyGetBudgetTotal = (budget: any): number => {`
- Line 277: `const safelyFormatDate = (dateValue: any): string | undefined => {`

### src//app/(campaigns)/influencer-marketplace/campaigns/[id]/page.tsx (4 occurrences)

- Line 32: `} catch (err: any) {`
- Line 355: `You haven't added any influencers to this campaign yet.`
- Line 511: `You haven't defined any content requirements for this campaign yet.`
- Line 628: `You haven't uploaded any creative assets for this campaign yet.`

### src//app/(campaigns)/influencer-marketplace/campaigns/page.tsx (2 occurrences)

- Line 43: `} catch (err: any) {`
- Line 214: `: "You don't have any campaigns yet."}`

### src//app/(campaigns)/influencer-marketplace/[id]/page.tsx (3 occurrences)

- Line 25: `const [justifyScoreBreakdown, setJustifyScoreBreakdown] = useState<any>(null);`
- Line 26: `const [justifyScoreHistory, setJustifyScoreHistory] = useState<any>(null);`
- Line 41: `} catch (err: any) {`

### src//app/api/settings/team/member/[id]/route.ts (1 occurrences)

- Line 110: `const memberData = member[0] as any;`

### src//app/api/settings/team/accept-invitation/route.ts (1 occurrences)

- Line 51: `const invitationInfo = tokenResult[0] as any;`

### src//app/api/settings/team/route.ts (2 occurrences)

- Line 103: `(tableResult[0] as any).exists === true;`
- Line 167: `invitationId = (uuidResult as any)[0].uuid;`

### src//app/api/settings/team/verify-invitation/route.ts (1 occurrences)

- Line 50: `const invitationInfo = tokenResult[0] as any;`

### src//app/api/settings/team/invitation/[id]/route.ts (1 occurrences)

- Line 110: `const invitationData = invitation[0] as any;`

### src//app/api/settings/team/invitation/[id]/resend/route.ts (1 occurrences)

- Line 43: `const invitationData = invitation[0] as any;`

### src//app/api/auth/callback/route.ts (1 occurrences)

- Line 5: `afterCallback: async (req: NextRequest, session: any) => {`

### src//app/api/wizard/campaign.ts (1 occurrences)

- Line 27: `// Transform any enum values from frontend to backend format`

### src//app/api/uploadthing/diagnostics/route.ts (1 occurrences)

- Line 64: `// If we get here, we couldn't parse the token in any format`

### src//app/api/admin/users/suspend/route.ts (1 occurrences)

- Line 10: `[key: string]: any; // For custom claims`

### src//app/api/admin/users/update-role/route.ts (2 occurrences)

- Line 10: `[key: string]: any; // For custom claims`
- Line 90: `(tableExists[0] as any).exists === true;`

### src//app/api/admin/users/route.ts (1 occurrences)

- Line 11: `[key: string]: any; // For custom claims`

### src//app/api/admin/users/[id]/route.ts (1 occurrences)

- Line 10: `[key: string]: any; // For custom claims`

### src//app/api/user/set-onboarding-true/route.ts (1 occurrences)

- Line 21: `} catch (error: any) {`

### src//app/api/search/index-campaigns/route.ts (1 occurrences)

- Line 66: `const algoliaRecords = campaigns.map((campaign: any) => ({`

### src//app/api/icons/route.ts (1 occurrences)

- Line 17: `* This endpoint scans the icon directories and returns all valid icons and any errors.`

### src//app/api/asset-proxy/route.ts (6 occurrences)

- Line 4: `const UPLOADTHING_CACHE = new Map<string, {timestamp: number, data: any}>();`
- Line 75: `// If we get here, we couldn't parse the token in any format`
- Line 76: `console.error('Could not parse token in any known format');`
- Line 102: `async function queryUploadThingAPI(): Promise<any> {`
- Line 288: `const matches = apiResponse.files.filter((file: any) => {`
- Line 298: `const keys = matches.map((file: any) => file.key || '').filter(Boolean);`

### src//app/api/phyllo/influencer/route.ts (1 occurrences)

- Line 40: `(acc: any) => acc.platform === platform.toLowerCase()`

### src//app/api/campaigns/route.ts (20 occurrences)

- Line 14: `// Accept any platform format - transformation will handle it`
- Line 103: `// Accept any of these formats for currency, budget`
- Line 108: `exchangeRateData: z.any().optional(),`
- Line 136: `primaryContact: z.any().optional(),`
- Line 137: `secondaryContact: z.any().optional(),`
- Line 138: `additionalContacts: z.array(z.any()).optional(),`
- Line 139: `influencers: z.array(z.any()).optional(),`
- Line 140: `// Accept any string format for enums`
- Line 145: `exchangeRateData: z.any().optional(),`
- Line 148: `// Allow any step number`
- Line 151: `audience: z.any().optional(),`
- Line 152: `creativeAssets: z.array(z.any()).optional(),`
- Line 153: `creativeRequirements: z.array(z.any()).optional(),`
- Line 154: `budget: z.any().optional(),`
- Line 196: `exchangeRateData: z.any().optional(),`
- Line 197: `budget: z.any().optional()`
- Line 270: `// Check if any influencer is missing required fields`
- Line 285: `// For drafts, filter out any incomplete influencer entries`
- Line 293: `// Transform any enum values from frontend to backend format`
- Line 377: `// Filter out any incomplete influencer data`

### src//app/api/campaigns/[id]/wizard/[step]/route.ts (8 occurrences)

- Line 19: `primaryContact: z.any().optional(),`
- Line 20: `secondaryContact: z.any().optional(),`
- Line 21: `additionalContacts: z.array(z.any()).optional(),`
- Line 36: `audience: z.any().optional(),`
- Line 41: `assets: z.array(z.any()).optional(),`
- Line 84: `let validationResult: { success: boolean, data?: any, error?: any } = { success: true };`
- Line 181: `const updateData: any = {`
- Line 266: `let stepData: any = {};`

### src//app/api/campaigns/[id]/steps/route.ts (2 occurrences)

- Line 67: `const formattedAssets = creativeAssets.map((asset: any) => ({`
- Line 104: `let updateData: any = {};`

### src//app/api/campaigns/[id]/route.ts (14 occurrences)

- Line 129: `additionalContacts: z.array(z.record(z.string(), z.any())).optional(),`
- Line 150: `influencers: z.array(z.any()).optional(),`
- Line 223: `// Use any type to bypass TypeScript's strict checking`
- Line 224: `(campaign as any).startDate = campaign.startDate.toISOString();`
- Line 227: `(campaign as any).startDate = null;`
- Line 234: `(campaign as any).endDate = campaign.endDate.toISOString();`
- Line 237: `(campaign as any).endDate = null;`
- Line 243: `(campaign as any).createdAt = campaign.createdAt.toISOString();`
- Line 247: `(campaign as any).updatedAt = campaign.updatedAt.toISOString();`
- Line 253: `(campaign as any).Influencer = campaign.Influencer.map(influencer => {`
- Line 361: `const mappedData: any = {`
- Line 625: `(updatedCampaign as any).startDate = updatedCampaign.startDate.toISOString();`
- Line 629: `(updatedCampaign as any).endDate = updatedCampaign.endDate.toISOString();`
- Line 804: `console.error(`Campaign with ID ${campaignId} could not be found in any table`);`

### src//app/api/webhooks/stripe/route.ts (3 occurrences)

- Line 9: `async function handleSubscriptionCreated(subscription: any) {`
- Line 31: `async function handleSubscriptionUpdated(subscription: any) {`
- Line 47: `async function handleSubscriptionDeleted(subscription: any) {`

### src//app/api/assets/icon/route.ts (1 occurrences)

- Line 14: `// Add any other problem icons here in the future`

### src//app/api/debug/run-script/route.ts (1 occurrences)

- Line 44: `'find-any-types.js',`

### src//app/(auth)/accept-invitation/page.tsx (1 occurrences)

- Line 16: `const [invitationDetails, setInvitationDetails] = useState<any>(null);`

### src//app/(settings)/pricing/PricingContent.tsx (1 occurrences)

- Line 513: `<p className="text-[var(--secondary-color)] text-xs sm:text-sm lg:text-base font-work-sans">Yes, you can upgrade at any time. The price difference will be prorated for your current billing period.</p>`

### src//app/(dashboard)/dashboard/DashboardContent.tsx (3 occurrences)

- Line 36: `[key: string]: any;`
- Line 521: `const mapCampaign = (campaign: any, index: number) => {`
- Line 552: `const processDate = (dateInput: any): string => {`

### src//app/(dashboard)/help/page.tsx (1 occurrences)

- Line 461: `<p className="text-gray-600 text-xs mb-3 font-work-sans">Our support team is ready to assist you with any questions.</p>`

### src//app/(admin)/admin/page.tsx (2 occurrences)

- Line 68: `const checkIsSuperAdmin = (userToCheck: any): boolean => {`
- Line 260: `{userLoading ? <p className="text-center py-8 font-work-sans">Loading admin panel...</p> : userError ? <p className="text-center py-8 text-red-500 font-work-sans">Error loading user: {typeof userError === 'object' && userError !== null ? (userError as any).message || 'Unknown error' : 'Unknown error'}</p> : !user || !checkIsSuperAdmin(user) ? <div className="text-center py-8 font-work-sans">`

### src//app/(admin)/debug-tools/database/page.tsx (4 occurrences)

- Line 22: `performance: any;`
- Line 79: `const [transactionTestResult, setTransactionTestResult] = useState<any>(null);`
- Line 121: `path: '/docs/any-type-usage-report.md',`
- Line 122: `description: 'ESLint report on any type usage in the codebase',`

### src//app/(admin)/debug-tools/font-awesome-test/page.tsx (2 occurrences)

- Line 13: `(window as any).FontAwesome !== undefined;`
- Line 20: `console.log('Font Awesome version:', (window as any).FontAwesome.version);`

### src//app/(admin)/debug-tools/api-verification/page.tsx (1 occurrences)

- Line 54: `* response times, status, and any potential issues.`

### src//app/(admin)/debug-tools/debug-step/page.tsx (1 occurrences)

- Line 9: `value: any;`

### src//app/(admin)/debug-tools/page.tsx (5 occurrences)

- Line 20: `primaryContact?: any;`
- Line 21: `secondaryContact?: any;`
- Line 24: `contactsData?: any;`
- Line 25: `[key: string]: any;`
- Line 33: `const [uploadthingStatus, setUploadthingStatus] = useState<{loading: boolean;data: any | null;error: string | null;}>({`

### src//providers/index.tsx (1 occurrences)

- Line 14: `session: any;`

### src//utils/payload-sanitizer.ts (14 occurrences)

- Line 35: `if (typeof payload !== 'object' || Array.isArray(payload)) return payload as any;`
- Line 37: `const result: Record<string, any> = {};`
- Line 93: `export function sanitizeContactFields<T extends Record<string, any>>(`
- Line 125: `export function sanitizeDraftPayload<T extends Record<string, any>>(payload: T): Partial<T> {`
- Line 132: `}) as Record<string, any>; // Cast to allow property access`
- Line 136: `// Remove any influencers with empty/undefined platform or handle`
- Line 137: `sanitized.influencers = sanitized.influencers.filter((influencer: any) => {`
- Line 153: `return sanitizeContactFields(sanitized as any) as Partial<T>;`
- Line 159: `export function sanitizeStepPayload<T extends Record<string, any>>(payload: T, step: number): Partial<T> {`
- Line 183: `function sanitizeStep1Payload<T extends Record<string, any>>(payload: T): Partial<T> {`
- Line 191: `function sanitizeStep2Payload<T extends Record<string, any>>(payload: T): Partial<T> {`
- Line 209: `function sanitizeStep3Payload<T extends Record<string, any>>(payload: T): Partial<T> {`
- Line 223: `function sanitizeStep4Payload<T extends Record<string, any>>(payload: T): Partial<T> {`
- Line 237: `function sanitizeStep5Payload<T extends Record<string, any>>(payload: T): Partial<T> {`

### src//utils/enum-transformers.ts (4 occurrences)

- Line 184: `const result: Record<string, any> = {};`
- Line 186: `for (const [key, value] of Object.entries(obj as Record<string, any>)) {`
- Line 229: `const result: Record<string, any> = {};`
- Line 231: `for (const [key, value] of Object.entries(obj as Record<string, any>)) {`

### src//utils/date-service.ts (2 occurrences)

- Line 9: `* Converts any supported date format to YYYY-MM-DD string for form display`
- Line 45: `private static extractDateString(obj: any): string | null {`

### src//utils/form-adapters.ts (6 occurrences)

- Line 89: `exchangeRateData?: any;`
- Line 92: `[key: string]: any;`
- Line 141: `? formValues.budgetAllocation.map((item: any) => ({`
- Line 211: `// Pass through any additional fields that might be needed`
- Line 222: `export function adaptApiToLegacyForm(apiData: any): LegacyCampaignForm {`
- Line 261: `const socialMediaBudget = apiData.budget?.allocation?.find((a: any) => a.category === 'Social Media')?.value || 0;`

### src//utils/survey-mappers.ts (3 occurrences)

- Line 10: `creativeAssets?: any[];`
- Line 11: `audience?: any;`
- Line 17: `startDate?: Date | string | any;`

### src//utils/date-formatter.ts (3 occurrences)

- Line 19: `export function formatDate(date: any): string {`
- Line 31: `export function formatDateForApi(date: any): string | null {`
- Line 43: `export function formatDateForDisplay(date: any, format: 'short' | 'medium' | 'long' | 'full' = 'medium'): string {`

### src//utils/db-monitoring.ts (1 occurrences)

- Line 134: `}, {} as Record<string, any>);`

### src//utils/string/utils.ts (4 occurrences)

- Line 77: `export function debounce<T extends (...args: any[]) => any>(`
- Line 95: `export function throttle<T extends (...args: any[]) => any>(`
- Line 117: `export function isEmpty(value: any): boolean {`
- Line 198: `// Remove any potentially dangerous characters`

### src//utils/rate-limit.ts (1 occurrences)

- Line 31: `check: async (response: any, token: string, maxCount: number): Promise<RateLimitStatus> => {`

### src//utils/api-response-formatter.ts (6 occurrences)

- Line 23: `export function standardizeApiResponse(data: any) {`
- Line 54: `result.influencers = result.Influencer.map((inf: any) => ({`
- Line 105: `const locationStrings = locations.map((loc: any) => {`
- Line 115: `? targeting.screeningQuestions.map((q: any) => {`
- Line 125: `? targeting.languages.map((l: any) => {`
- Line 210: `export function standardizeApiResponseArray(dataArray: any[]) {`

### src//utils/file-metadata.ts (1 occurrences)

- Line 91: `* Extract metadata from any supported file type`

### src//components/ui/calendar/calendar-dashboard.tsx (1 occurrences)

- Line 224: `// First, add this new state for all bar positions outside any loops`

### src//components/ui/forms/form-controls.tsx (1 occurrences)

- Line 161: `children.type === Input || (children.type as any)?.displayName === 'Input');`

### src//components/ui/layout/Table.tsx (3 occurrences)

- Line 32: `const TableContext = createContext<TableContextValue<any> | undefined>(undefined);`
- Line 58: `accessor?: keyof T | ((row: T) => any);`
- Line 65: `value: any;`

### src//components/ui/examples.tsx (3 occurrences)

- Line 399: `typeof UI_ICON_MAP[icon as keyof typeof UI_ICON_MAP] !== 'object' || Object.keys(UI_ICON_MAP[icon as keyof typeof UI_ICON_MAP] as any).length > 0));`
- Line 414: `typeof PLATFORM_ICON_MAP[icon as keyof typeof PLATFORM_ICON_MAP] !== 'object' || Object.keys(PLATFORM_ICON_MAP[icon as keyof typeof PLATFORM_ICON_MAP] as any).length > 0));`
- Line 824: `<p className="mt-2 font-work-sans">You can add any elements here.</p>`

### src//components/ui/toast/styles/toast.styles.ts (4 occurrences)

- Line 93: `initial: Record<string, any>;`
- Line 94: `animate: Record<string, any>;`
- Line 95: `exit: Record<string, any>;`
- Line 96: `transition: Record<string, any>;`

### src//components/ui/table/types/index.ts (2 occurrences)

- Line 63: `accessor?: keyof T | ((row: T) => any);`
- Line 70: `value: any;`

### src//components/ui/table/Table.tsx (3 occurrences)

- Line 25: `const TableContext = createContext<TableContextValue<any> | undefined>(undefined);`
- Line 234: `let valueA: any;`
- Line 235: `let valueB: any;`

### src//components/ui/icons/core/icon-mappings.ts (1 occurrences)

- Line 28: `* Extract the base name from an icon name (removing any prefixes)`

### src//components/ui/icons/core/icon-types.ts (2 occurrences)

- Line 115: `// Allow any other props to be passed through to the SVG element`
- Line 116: `[key: string]: any;`

### src//components/ui/icons/test/icon-tester-backup.tsx (2 occurrences)

- Line 113: `let iconData: Record<string, any> = {};`
- Line 241: `All SVG icons from <code className="bg-gray-100 px-1 rounded">public/icons</code> with light → solid hover transition. Hover over any icon to see it change from light to solid variant.`

### src//components/ui/icons/test/IconTester.tsx (5 occurrences)

- Line 60: `* to prevent any movement/shifting between light and solid variants.`
- Line 188: `let iconData: Record<string, any> = {};`
- Line 244: `sampleIcons: data?.icons?.slice(0, 5).map((i: any) => i.name) || []`
- Line 348: `{/* Show errors and warnings if any */}`
- Line 446: `All SVG icons from <code className="bg-gray-100 px-1 rounded">public/icons</code> with light → solid hover transition. Hover over any icon to see it change from light to solid variant.`

### src//components/ui/table.tsx (3 occurrences)

- Line 32: `const TableContext = createContext<TableContextValue<any> | undefined>(undefined);`
- Line 58: `accessor?: keyof T | ((row: T) => any);`
- Line 65: `value: any;`

### src//components/ui/loading-skeleton/index.ts (1 occurrences)

- Line 11: `// Also re-export the default export if any`

### src//components/settings/shared/DebugWrapper.tsx (1 occurrences)

- Line 6: `dataInfo?: Record<string, any>;`

### src//components/mmm/index.ts (1 occurrences)

- Line 11: `// Also re-export the default export if any`

### src//components/mmm/CustomerJourney/SankeyDiagram.tsx (4 occurrences)

- Line 94: `const handleNodeClick = (event: any) => {`
- Line 102: `const handleLinkClick = (event: any) => {`
- Line 137: `} as any]`
- Line 202: `<p className="font-work-sans">The Sankey diagram visualizes user flow between marketing channels. Click on any node to see detailed information.</p>`

### src//components/ErrorBoundary/index.ts (1 occurrences)

- Line 11: `// Also re-export the default export if any`

### src//components/ErrorFallback/index.ts (1 occurrences)

- Line 11: `// Also re-export the default export if any`

### src//components/features/settings/branding/CreativePreview.tsx (3 occurrences)

- Line 144: `const isInstagram = (config: any): config is InstagramConfig => platform === 'Instagram';`
- Line 145: `const isTikTok = (config: any): config is TikTokConfig => platform === 'TikTok';`
- Line 146: `const isYouTube = (config: any): config is YoutubeConfig => platform === 'YouTube';`

### src//components/features/settings/branding/FileUpload.tsx (1 occurrences)

- Line 9: `* The current image URL to display (if any)`

### src//components/features/settings/account/page.tsx (1 occurrences)

- Line 363: `const IconComponent = tab === 'overview' ? (props: any) => <Icon name="faCreditCard" {...props} solid={false} className="text-[var(--secondary-color)] font-work-sans" /> : (props: any) => <Icon name="faMoney" {...props} solid={false} className="text-[var(--secondary-color)] font-work-sans" />;`

### src//components/features/core/search/SearchBar.tsx (1 occurrences)

- Line 73: `// Clear any existing timeout`

### src//components/features/navigation/MobileMenu.tsx (1 occurrences)

- Line 17: `user?: any;`

### src//components/features/users/authentication/password-management-section-test.tsx (1 occurrences)

- Line 143: `// Click the Save button without filling in any fields`

### src//components/features/campaigns/wizard/steps/Step5Content.tsx (51 occurrences)

- Line 184: `demographics?: any;`
- Line 185: `locations?: any[];`
- Line 186: `targeting?: any;`
- Line 187: `competitors?: any[];`
- Line 188: `genders?: any[];`
- Line 189: `jobTitles?: any[] | string;`
- Line 199: `location?: any[];`
- Line 200: `languages?: any[];`
- Line 201: `screeningQuestions?: any[];`
- Line 218: `primaryContact: Record<string, any>;`
- Line 219: `secondaryContact: Record<string, any>;`
- Line 221: `secondaryKPIs: any[];`
- Line 222: `features: any[];`
- Line 231: `creativeRequirements: any[];`
- Line 233: `contacts?: Array<Record<string, any>>;`
- Line 244: `phylloData?: any;   // Add the phylloData property`
- Line 248: `overview: Record<string, any>;`
- Line 249: `objectives: Record<string, any>;`
- Line 271: `[key: string]: any;`
- Line 274: `// Allow for any other properties that might exist`
- Line 275: `[key: string]: any;`
- Line 385: `const extractCreativeAssets = (data: any, isWizardSchema: boolean): any[] => {`
- Line 398: `return data.assets.map((asset: any) => {`
- Line 434: `return data.creativeAssets.map((asset: any) => {`
- Line 462: `return data.creative.creativeAssets.map((asset: any) => {`
- Line 490: `console.warn("No creative assets found in any expected location");`
- Line 495: `const fetchInfluencerDetails = async (campaignId: string, handle: string, platform: string): Promise<any> => {`
- Line 520: `const normalizeApiData = (data: any): MergedData => {`
- Line 564: `console.log("No influencers found in any expected location");`
- Line 568: `const normalizedInfluencers = influencers.map((inf: any) => {`
- Line 671: `competitors: Array.isArray(audienceData.competitors) ? audienceData.competitors.map((comp: any) => {`
- Line 678: `genders: Array.isArray(audienceData.demographics?.gender) ? audienceData.demographics?.gender.map((g: any) => ({`
- Line 692: `location: Array.isArray(audienceData.locations) ? audienceData.locations.map((loc: any) => ({`
- Line 695: `languages: Array.isArray(audienceData.targeting?.languages) ? audienceData.targeting.languages.map((lang: any) => ({`
- Line 701: `creativeRequirements: Array.isArray(data.creativeRequirements) ? data.creativeRequirements : isWizardSchema && Array.isArray(data.requirements) ? data.requirements.map((req: any) => ({`
- Line 1034: `const [campaignData, setCampaignData] = useState<Record<string, any> | null>(null);`
- Line 1048: `const validateCampaignData = (data: any): void => {`
- Line 1053: `// Only log any validation issues but don't prevent submission`
- Line 1083: `const enhanceNormalizeApiData = (data: any): MergedData => {`
- Line 1116: `console.warn("No data available from any source");`
- Line 1167: `} as unknown as Record<string, any>);`
- Line 1222: `const enhancedInfluencers = await Promise.all(result.data.influencers.map(async (inf: any) => {`
- Line 1258: `const enhancedInfluencers = displayData.influencers.map((inf: any) => {`
- Line 1316: `// No request body needed, but if any is added in the future:`
- Line 1333: `// If needed, update any local state here to reflect the new status`
- Line 1422: `{/* Add a reset button to clear any cached state */}`
- Line 2059: `displayData.audience.genders.map((g: any, idx: number) => (`
- Line 2083: `displayData.audience.locations.map((l: any, idx: number) => (`
- Line 2099: `displayData.audience.languages.map((l: any, idx: number) => (`
- Line 2119: `{displayData.audience.screeningQuestions.map((q: any, idx: number) => (`
- Line 2194: `{displayData.audience.competitors.map((item: any, index: number) => (`

### src//components/features/campaigns/wizard/steps/Step2Content.tsx (7 occurrences)

- Line 136: `}: any) => {`
- Line 203: `const handleSubmit = async (values: any) => {`
- Line 207: `const currentCampaignId = campaignId || (data as any)?.id;`
- Line 272: `const handleSaveDraft = async (values: any) => {`
- Line 402: `...(initialValues as any)`
- Line 490: `Pick up to one Primary KPI and up to any Secondary KPIs (max 4).`
- Line 662: `<ProgressBar currentStep={2} onStepClick={(step) => router.push(`/campaigns/wizard/step-${step}?id=${campaignId || (data as any)?.id}`)} onBack={() => router.push(`/campaigns/wizard/step-1?id=${campaignId || (data as any)?.id}`)} onNext={() => handleSubmit(values)} onSaveDraft={() => handleSaveDraft(values)} disableNext={disableNext} isFormValid={isValid} isDirty={dirty} isSaving={isSaving} />`

### src//components/features/campaigns/wizard/steps/Step1Content.tsx (26 occurrences)

- Line 73: `const debugFormData = (values: any, isDraft: boolean) => {`
- Line 124: `overview?: any;`
- Line 126: `exchangeRateData?: any; // Add this to support storing exchange rate data`
- Line 127: `[key: string]: any; // Allow for additional properties for extensibility`
- Line 169: `}: any) => {`
- Line 202: `}: any) => {`
- Line 346: `}: {currency: string;onRatesFetched: (data: any) => void;}) => {`
- Line 566: `return function executedFunction(...args: any[]) {`
- Line 585: `}: {index: number;remove: () => void;arrayHelpers: any;}) => {`
- Line 638: `const hasError = touched.influencers?.[index] && ((errors.influencers?.[index] as any)?.platform || (errors.influencers?.[index] as any)?.handle);`
- Line 652: `<Field name={`influencers[${index}].platform`} as="select" className={`w-full pl-3 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] appearance-none ${(errors.influencers?.[index] as any)?.platform && touched.influencers?.[index]?.platform ? 'border-red-500' : 'border-[var(--divider-color)]'}`}>`
- Line 666: `<Field name={`influencers[${index}].handle`} type="text" placeholder="e.g. @username" className={`w-full pl-3 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] ${(errors.influencers?.[index] as any)?.handle && touched.influencers?.[index]?.handle ? 'border-red-500' : 'border-[var(--divider-color)]'}`} />`
- Line 808: `const [exchangeRateData, setExchangeRateData] = useState<any>(null);`
- Line 827: `const formatDate = (date: any) => {`
- Line 839: `const safeGet = (obj: any, path: string, defaultValue: any = '') => {`
- Line 1008: `const validatePayload = (payload: any) => {`
- Line 1055: `const parseValidationError = (details: any) => {`
- Line 1067: `if (error && typeof error === 'object' && (error as any)._errors) {`
- Line 1068: `const fieldErrors = (error as any)._errors;`
- Line 1090: `const val = value as any;`
- Line 1093: `const val = value as any;`
- Line 1209: `const formikRef = useRef<any>(null);`
- Line 1310: `totalBudget: campaignData.totalBudget || (campaignData.budget && typeof campaignData.budget === 'object' && campaignData.budget !== null && 'total' in campaignData.budget ? (campaignData.budget as any).total : '') || '',`
- Line 1311: `socialMediaBudget: campaignData.socialMediaBudget || (campaignData.budget && typeof campaignData.budget === 'object' && campaignData.budget !== null && 'socialMedia' in campaignData.budget ? (campaignData.budget as any).socialMedia : '') || '',`
- Line 1524: `}: any) => <div className="font-work-sans">`
- Line 1563: `}: {field: any;}) => <ExchangeRateHandler currency={field.value} onRatesFetched={setExchangeRateData} />}`

### src//components/features/campaigns/wizard/WizardContext.tsx (2 occurrences)

- Line 35: `[key: string]: any;`
- Line 160: `const [campaignData, setCampaignData] = useState<any | null>(null);`

### src//components/features/assets/upload/EnhancedAssetPreview.tsx (1 occurrences)

- Line 37: `[key: string]: any;`

### src//components/features/assets/gif/GifGallery.tsx (1 occurrences)

- Line 37: `const gifsData: Gif[] = json.data.map((item: any) => ({`

### src//components/features/analytics/mmm/SankeyDiagram.tsx (4 occurrences)

- Line 94: `const handleNodeClick = (event: any) => {`
- Line 102: `const handleLinkClick = (event: any) => {`
- Line 137: `} as any]`
- Line 202: `<p className="font-work-sans">The Sankey diagram visualizes user flow between marketing channels. Click on any node to see detailed information.</p>`

### src//components/Wizard/index.ts (1 occurrences)

- Line 11: `// Also re-export the default export if any`

### src//components/Navigation/MobileMenu.tsx (1 occurrences)

- Line 17: `user?: any;`

### src//components/Search/SearchBar.tsx (1 occurrences)

- Line 73: `// Clear any existing timeout`

### src//components/Search/index.ts (1 occurrences)

- Line 11: `// Also re-export the default export if any`

### src//components/AssetPreview/index.ts (1 occurrences)

- Line 11: `// Also re-export the default export if any`

### src//components/Influencers/InfluencerCard.tsx (2 occurrences)

- Line 100: `<PlatformIcon platformName={getPlatformIconName(influencer.platform) as any} size="sm" />`
- Line 172: `<PlatformIcon platformName={getPlatformIconName(influencer.platform) as any} size="sm" />`

### src//components/Influencers/AdvancedSearch/index.tsx (1 occurrences)

- Line 56: `const handleFilterChange = (name: string, value: any) => {`

### src//components/Influencers/index.ts (1 occurrences)

- Line 11: `// Also re-export the default export if any`

### src//components/upload/EnhancedAssetPreview.tsx (1 occurrences)

- Line 37: `[key: string]: any;`

### src//components/upload/index.ts (1 occurrences)

- Line 11: `// Also re-export the default export if any`

### src//components/gif/GifGallery.tsx (1 occurrences)

- Line 37: `const gifsData: Gif[] = json.data.map((item: any) => ({`

### src//components/gif/index.ts (1 occurrences)

- Line 11: `// Also re-export the default export if any`

### src//hooks/use-error-recovery.tsx (1 occurrences)

- Line 37: `* Checks localStorage for any pending operations that could be recovered`

### src//hooks/use-campaign-wizard.ts (1 occurrences)

- Line 200: `let stepData: any = {};`

### src//hooks/use-campaign-details.ts (1 occurrences)

- Line 7: `const [campaignDetails, setCampaignDetails] = useState<any>(null);`

### src//hooks/use-form-submission.ts (5 occurrences)

- Line 21: `details?: Record<string, any>;`
- Line 38: `onSuccess?: (response: any) => void;`
- Line 57: `response: any;`
- Line 83: `const [response, setResponse] = useState<any>(null);`
- Line 291: `// Clear any existing interval`

### src//lib/error-logging.ts (1 occurrences)

- Line 7: `additionalData?: Record<string, any>`

### src//lib/icon-diagnostic.ts (3 occurrences)

- Line 33: `private logs: { timestamp: number; event: string; data?: any }[] = [];`
- Line 36: `log(event: string, data?: any) {`
- Line 332: `(window as any).__iconDiagnostics = {`

### src//lib/analytics.ts (1 occurrences)

- Line 2: `track: (eventName: string, properties?: Record<string, any>) => {`

### src//lib/algolia.ts (1 occurrences)

- Line 55: `export async function indexCampaigns(campaigns: any[]): Promise<void> {`

### src//lib/data-mapping/schema-mapping.ts (3 occurrences)

- Line 116: `currency: data.currency as any, // Cast to Currency enum`
- Line 123: `platform: data.platform as any, // Cast to Platform enum`
- Line 271: `return async (tx: any) => {`

### src//lib/data-mapping/db-logger.ts (12 occurrences)

- Line 20: `data?: any;`
- Line 22: `error?: any;`
- Line 37: `[key: string]: any;`
- Line 38: `campaignId?: any; // We'll handle type conversion internally`
- Line 61: `error?: any`
- Line 132: `public warn(operation: DbOperation | string, message: string, data?: LogData, error?: any): void {`
- Line 139: `public error(operation: DbOperation | string, message: string, data?: LogData, error?: any): void {`
- Line 188: `private formatError(error: any): any {`
- Line 202: `private sanitizeData(data: any): any {`
- Line 206: `let clonedData: any;`
- Line 231: `const sanitize = (obj: any): any => {`
- Line 238: `const sanitized: any = {};`

### src//lib/data-mapping/campaign-service.ts (6 occurrences)

- Line 24: `export interface ApiResponse<T = any> {`
- Line 29: `errors?: any[];`
- Line 104: `public async updateOverview(id: number, data: any): Promise<ApiResponse> {`
- Line 191: `public async updateObjectives(id: number, data: any): Promise<ApiResponse> {`
- Line 270: `public async updateAudience(id: number, data: any): Promise<ApiResponse> {`
- Line 680: `data: any`

### src//lib/utils/caching.ts (1 occurrences)

- Line 53: `} catch (err: any) {`

### src//lib/db.ts (6 occurrences)

- Line 5: `var mockBrandingSettings: Record<string, any>;`
- Line 98: `// Note: Using any here because the schema might not be generated yet`
- Line 99: `return await (prisma as any).brandingSettings.findUnique({`
- Line 122: `export async function saveBrandingSettings(companyId: string, settings: any) {`
- Line 127: `let existingData: any = null;`
- Line 189: `return await (prisma as any).brandingSettings.upsert({`

### src//lib/api-verification.ts (4 occurrences)

- Line 31: `details?: any;`
- Line 43: `data?: any;`
- Line 1473: `// Map the results to handle any rejections`
- Line 1478: `// Return an error result for any APIs that threw exceptions`

### src//lib/analytics/analytics.ts (1 occurrences)

- Line 2: `track: (eventName: string, properties?: Record<string, any>) => {`

### src//services/brand-lift-service.ts (3 occurrences)

- Line 264: `private mapCampaignToSurveyData(campaignData: any, campaignId: string): SurveyPreviewData {`
- Line 276: `private ensureValidSurveyData(data: any, campaignId: string): SurveyPreviewData {`
- Line 311: `? data.questions.map((q: any) => ({`

### src//services/campaign-service.ts (1 occurrences)

- Line 30: `): Promise<{ success: boolean; data?: any; error?: string }> {`

## Recommendations

1. Replace `any` with more specific types:

   - Use `unknown` for values of unknown type
   - Use `Record<string, unknown>` for objects with unknown properties
   - Use proper interfaces or type aliases for structured data
   - Use union types for values that can be of multiple types

2. Consider using the interactive fix script:
   ```
   node scripts/validation/fix-any-types.js --fix --file=path/to/file.ts
   ```
