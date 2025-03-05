# 'any' Type Usage Report
Generated on: 2025-03-05T15:34:47.358Z

## Summary
- Files with `any` type usage: 64
- Total occurrences: 188

## Files with 'any' type usage

### src//middleware/checkPermissions.ts (1 occurrences)

- Line 20: `// Check if user has any of the required roles that grant the permissions`

### src//middleware/api/validateApi.ts (1 occurrences)

- Line 86: `// Log and return any unexpected errors`

### src//middleware/api/handleApiErrors.ts (1 occurrences)

- Line 113: `// Generic error response for any other types of errors`

### src//middleware/handleDbErrors.ts (1 occurrences)

- Line 107: `// Generic error response for any other types of errors`

### src//context/WizardContext.tsx (5 occurrences)

- Line 63: `campaignData: any | null;`
- Line 68: `saveProgress: (data: any) => Promise<boolean>;`
- Line 124: `const [campaignData, setCampaignData] = useState<any | null>(null);`
- Line 215: `const saveProgress = async (formData: any): Promise<boolean> => {`
- Line 253: `debounce((formData: any) => {`

### src//app/settings/test-upload/page.tsx (2 occurrences)

- Line 12: `const [uploadResult, setUploadResult] = useState<any>(null);`
- Line 13: `const [apiStatus, setApiStatus] = useState<any>(null);`

### src//app/settings/team-management/page.tsx (4 occurrences)

- Line 152: `const formattedMembers = data.data.teamMembers.map((member: any) => ({`
- Line 162: `const formattedInvitations = data.data.pendingInvitations.map((invitation: any) => ({`
- Line 388: `} catch (error: any) {`
- Line 645: `You haven't added any team members yet. Use the "Add Team Member" button to invite colleagues to your team.`

### src//app/admin/page.tsx (2 occurrences)

- Line 71: `const checkIsSuperAdmin = (userToCheck: any): boolean => {`
- Line 276: `<p className="text-center py-8 text-red-500">Error loading user: {typeof userError === 'object' && userError !== null ? (userError as any).message || 'Unknown error' : 'Unknown error'}</p>`

### src//app/accept-invitation/page.tsx (1 occurrences)

- Line 16: `const [invitationDetails, setInvitationDetails] = useState<any>(null);`

### src//app/brand-lift/report/page.tsx (9 occurrences)

- Line 325: `label: function(context: any) {`
- Line 336: `callback: function(value: any) {`
- Line 374: `<Bar data={chartData} options={chartOptions as any} />`
- Line 474: `label: function(context: any) {`
- Line 485: `callback: function(value: any) {`
- Line 603: `<Bar data={demographicData} options={chartOptions as any} />`
- Line 775: `callback: function(value: any) {`
- Line 795: `label: function(context: any) {`
- Line 827: `<Line data={data} options={options as any} />`

### src//app/brand-lift/page.tsx (1 occurrences)

- Line 121: `const fetchCampaignData = async (): Promise<any[]> => {`

### src//app/debug-tools/database/page.tsx (5 occurrences)

- Line 24: `performance: any;`
- Line 81: `const [transactionTestResult, setTransactionTestResult] = useState<any>(null);`
- Line 130: `path: '/docs/any-type-usage-report.md',`
- Line 131: `description: 'ESLint report on any type usage in the codebase',`
- Line 838: `scriptName="find-any-types.js"`

### src//app/debug-tools/api-verification/page.tsx (1 occurrences)

- Line 54: `* response times, status, and any potential issues.`

### src//app/debug-tools/debug-step/page.tsx (1 occurrences)

- Line 9: `value: any;`

### src//app/debug-tools/page.tsx (5 occurrences)

- Line 20: `primaryContact?: any;`
- Line 21: `secondaryContact?: any;`
- Line 24: `contactsData?: any;`
- Line 25: `[key: string]: any;`
- Line 33: `const [uploadthingStatus, setUploadthingStatus] = useState<{loading: boolean, data: any | null, error: string | null}>({`

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

### src//app/api/uploadthing/test/route.ts (1 occurrences)

- Line 10: `let fileRoutes: any = null;`

### src//app/api/admin/users/suspend/route.ts (1 occurrences)

- Line 10: `[key: string]: any; // For custom claims`

### src//app/api/admin/users/update-role/route.ts (2 occurrences)

- Line 10: `[key: string]: any; // For custom claims`
- Line 90: `(tableExists[0] as any).exists === true;`

### src//app/api/admin/users/route.ts (1 occurrences)

- Line 11: `[key: string]: any; // For custom claims`

### src//app/api/admin/users/[id]/route.ts (1 occurrences)

- Line 10: `[key: string]: any; // For custom claims`

### src//app/api/user/setOnboardingTrue/route.ts (1 occurrences)

- Line 21: `} catch (error: any) {`

### src//app/api/phyllo/influencer/route.ts (1 occurrences)

- Line 40: `(acc: any) => acc.platform === platform.toLowerCase()`

### src//app/api/campaigns/[id]/wizard/[step]/route.ts (2 occurrences)

- Line 53: `let updateData: any = {};`
- Line 245: `let stepData: any = {};`

### src//app/api/campaigns/[id]/steps/route.ts (2 occurrences)

- Line 71: `create: data.creativeAssets.map((asset: any) => ({`
- Line 82: `create: data.creativeRequirements.map((req: any) => ({`

### src//app/api/campaigns/[id]/route.ts (1 occurrences)

- Line 94: `additionalContacts: z.array(z.record(z.string(), z.any())).optional(),`

### src//app/api/webhooks/stripe/route.ts (3 occurrences)

- Line 9: `async function handleSubscriptionCreated(subscription: any) {`
- Line 31: `async function handleSubscriptionUpdated(subscription: any) {`
- Line 47: `async function handleSubscriptionDeleted(subscription: any) {`

### src//app/api/debug/run-script/route.ts (1 occurrences)

- Line 44: `'find-any-types.js',`

### src//app/campaigns/wizard/step-1/Step1Content.tsx (17 occurrences)

- Line 96: `const debugFormData = (values: any, isDraft: boolean) => {`
- Line 147: `overview?: any;`
- Line 149: `exchangeRateData?: any; // Add this to support storing exchange rate data`
- Line 150: `[key: string]: any; // Allow for additional properties for extensibility`
- Line 180: `const StyledField = ({ label, name, type = "text", as, children, required = false, icon, ...props }: any) => {`
- Line 226: `const DateField = ({ label, name, required = false, ...props }: any) => {`
- Line 398: `const ExchangeRateHandler = ({ currency, onRatesFetched }: { currency: string, onRatesFetched: (data: any) => void }) => {`
- Line 661: `return function executedFunction(...args: any[]) {`
- Line 672: `const InfluencerEntry = ({ index, remove, arrayHelpers }: { index: number, remove: () => void, arrayHelpers: any }) => {`
- Line 718: `(errors.influencers?.[index] as any)?.platform ||`
- Line 719: `(errors.influencers?.[index] as any)?.handle`
- Line 746: `(errors.influencers?.[index] as any)?.platform && touched.influencers?.[index]?.platform`
- Line 773: `(errors.influencers?.[index] as any)?.handle && touched.influencers?.[index]?.handle`
- Line 940: `const [exchangeRateData, setExchangeRateData] = useState<any>(null);`
- Line 1229: `const formikRef = useRef<any>(null);`
- Line 1523: `{({ push, remove, form }: any) => (`
- Line 1571: `{({ field }: { field: any }) => (`

### src//app/campaigns/wizard/step-5/Step5Content.tsx (12 occurrences)

- Line 113: `[key: string]: any;`
- Line 174: `primaryContact?: any;`
- Line 175: `secondaryContact?: any;`
- Line 201: `const [campaignData, setCampaignData] = useState<any>(null);`
- Line 212: `console.warn("No data available from any source");`
- Line 490: `{/* Add a reset button to clear any cached state */}`
- Line 902: `displayData.audience.genders.map((g: any) => g.gender).join(', ')`
- Line 915: `displayData.audience.locations.map((l: any) => l.location).join(', ')`
- Line 924: `displayData.audience.languages.map((l: any) => l.language).join(', ')`
- Line 968: `{displayData.audience.screeningQuestions.map((item: any, index: number) => (`
- Line 984: `{displayData.audience.competitors.map((item: any, index: number) => (`
- Line 1075: `{displayData.creativeRequirements.map((req: any, index: number) => (`

### src//app/campaigns/wizard/step-2/Step2Content.tsx (7 occurrences)

- Line 183: `const StyledField = ({ label, name, type = "text", as, children, required = false, icon, ...props }: any) => {`
- Line 254: `const handleSubmit = async (values: any) => {`
- Line 259: `const currentCampaignId = campaignId || (data as any)?.id;`
- Line 321: `const handleSaveDraft = async (values: any) => {`
- Line 477: `Pick up to one Primary KPI and up to any Secondary KPIs (max 4).`
- Line 710: `onStepClick={(step) => router.push(`/campaigns/wizard/step-${step}?id=${campaignId || (data as any)?.id}`)}`
- Line 711: `onBack={() => router.push(`/campaigns/wizard/step-1?id=${campaignId || (data as any)?.id}`)}`

### src//app/campaigns/wizard/step-3/Step3Content.tsx (1 occurrences)

- Line 143: `const audienceData = (data as any)?.audience || {};`

### src//app/campaigns/wizard/step-4/Step4Content.tsx (3 occurrences)

- Line 422: `// Transform any existing assets to our format`
- Line 486: `// Show errors if any`
- Line 591: `} catch (err: any) {`

### src//app/campaigns/wizard/submission/SubmissionContent.tsx (1 occurrences)

- Line 20: `const [campaign, setCampaign] = useState<any>(null);`

### src//app/campaigns/[id]/page.tsx (12 occurrences)

- Line 204: `creativeAssets: any[];`
- Line 205: `creativeRequirements: any[];`
- Line 693: `typeof (value as any)[Symbol.iterator] === 'function'`
- Line 702: `function debugString(value: any, fieldName: string): string {`
- Line 746: `function validateCampaignData(data: any): CampaignValidation {`
- Line 852: `testComponentProps<T extends Record<string, any>>(`
- Line 949: `static testNullAccess(componentName: string, value: any, path: string): void {`
- Line 960: `static testBatchProps(componentName: string, props: Record<string, any>): void {`
- Line 1002: `function safeProps<T extends Record<string, any>>(componentName: string, props: T): void {`
- Line 1328: `creativeAssets: result.creativeAssets ? result.creativeAssets.map((asset: any) => ({`
- Line 1337: `creativeRequirements: result.creativeRequirements ? result.creativeRequirements.map((req: any) => ({`
- Line 1502: `// Log if any critical errors were found`

### src//app/pricing/PricingContent.tsx (1 occurrences)

- Line 617: `<p className="text-[var(--secondary-color)] text-xs sm:text-sm lg:text-base">Yes, you can upgrade at any time. The price difference will be prorated for your current billing period.</p>`

### src//app/help/page.tsx (1 occurrences)

- Line 643: `<p className="text-gray-600 text-xs mb-3">Our support team is ready to assist you with any questions.</p>`

### src//providers/index.tsx (1 occurrences)

- Line 14: `session: any;`

### src//utils/surveyMappers.ts (3 occurrences)

- Line 10: `creativeAssets?: any[];`
- Line 11: `audience?: any;`
- Line 17: `startDate?: Date | string | any;`

### src//utils/form-adapters.ts (6 occurrences)

- Line 89: `exchangeRateData?: any;`
- Line 92: `[key: string]: any;`
- Line 141: `? formValues.budgetAllocation.map((item: any) => ({`
- Line 211: `// Pass through any additional fields that might be needed`
- Line 222: `export function adaptApiToLegacyForm(apiData: any): LegacyCampaignForm {`
- Line 261: `const socialMediaBudget = apiData.budget?.allocation?.find((a: any) => a.category === 'Social Media')?.value || 0;`

### src//utils/db-monitoring.ts (1 occurrences)

- Line 134: `}, {} as Record<string, any>);`

### src//components/mmm/CustomerJourney/SankeyDiagram.tsx (4 occurrences)

- Line 94: `const handleNodeClick = (event: any) => {`
- Line 102: `const handleLinkClick = (event: any) => {`
- Line 137: `} as any,`
- Line 202: `<p>The Sankey diagram visualizes user flow between marketing channels. Click on any node to see detailed information.</p>`

### src//components/Navigation/MobileMenu.tsx (1 occurrences)

- Line 17: `user?: any;`

### src//components/Brand-Lift/CreativePreview.tsx (3 occurrences)

- Line 144: `const isInstagram = (config: any): config is InstagramConfig => platform === 'Instagram';`
- Line 145: `const isTikTok = (config: any): config is TikTokConfig => platform === 'TikTok';`
- Line 146: `const isYouTube = (config: any): config is YoutubeConfig => platform === 'YouTube';`

### src//components/gif/GifGallery.tsx (1 occurrences)

- Line 37: `const gifsData: Gif[] = json.data.map((item: any) => ({`

### src//hooks/useCampaignWizard.ts (1 occurrences)

- Line 200: `let stepData: any = {};`

### src//hooks/useFormSubmission.ts (5 occurrences)

- Line 21: `details?: Record<string, any>;`
- Line 38: `onSuccess?: (response: any) => void;`
- Line 57: `response: any;`
- Line 83: `const [response, setResponse] = useState<any>(null);`
- Line 291: `// Clear any existing interval`

### src//hooks/useCampaignDetails.ts (1 occurrences)

- Line 7: `const [campaignDetails, setCampaignDetails] = useState<any>(null);`

### src//lib/error-logging.ts (1 occurrences)

- Line 7: `additionalData?: Record<string, any>`

### src//lib/analytics.ts (1 occurrences)

- Line 2: `track: (eventName: string, properties?: Record<string, any>) => {`

### src//lib/utils.ts (4 occurrences)

- Line 77: `export function debounce<T extends (...args: any[]) => any>(`
- Line 95: `export function throttle<T extends (...args: any[]) => any>(`
- Line 117: `export function isEmpty(value: any): boolean {`
- Line 198: `// Remove any potentially dangerous characters`

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

### src//services/brandLiftService.ts (3 occurrences)

- Line 264: `private mapCampaignToSurveyData(campaignData: any, campaignId: string): SurveyPreviewData {`
- Line 276: `private ensureValidSurveyData(data: any, campaignId: string): SurveyPreviewData {`
- Line 311: `? data.questions.map((q: any) => ({`

## Recommendations

1. Replace `any` with more specific types:
   - Use `unknown` for values of unknown type
   - Use `Record<string, unknown>` for objects with unknown properties
   - Use proper interfaces or type aliases for structured data
   - Use union types for values that can be of multiple types

2. Consider using the interactive fix script:
   ```
   node src/scripts/fix-any-types.js --fix --file=path/to/file.ts
   ```
