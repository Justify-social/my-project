import { logger } from '@/utils/logger';

// Log the value read from the environment immediately
const uploadthingSecretFromEnv = process.env.UPLOADTHING_SECRET;
logger.info(
  `[Server Config] Reading UPLOADTHING_SECRET: ${uploadthingSecretFromEnv ? 'Found (length: ' + uploadthingSecretFromEnv.length + ')' : 'Not Found'}`
);
const uploadthingTokenFromEnv = process.env.UPLOADTHING_TOKEN; // Read the token
logger.info(
  `[Server Config] Reading UPLOADTHING_TOKEN: ${uploadthingTokenFromEnv ? 'Found (length: ' + uploadthingTokenFromEnv.length + ')' : 'Not Found'}`
); // Log the token

/**
 * Configuration object specifically for server-side environment variables.
 * Reads variables at module load time when the server starts.
 */
export const serverConfig = {
  phyllo: {
    clientId: process.env.NEXT_PUBLIC_PHYLLO_CLIENT_ID,
    clientSecret: process.env.PHYLLO_SECRET,
    baseUrl: process.env.PHYLLO_BASE_URL || 'https://api.staging.getphyllo.com',
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    // Add publishable key if needed server-side (less common)
  },
  cint: {
    apiKey: process.env.CINT_API_KEY,
    clientId: process.env.CINT_CLIENT_ID,
    clientSecret: process.env.CINT_CLIENT_SECRET,
  },
  uploadthing: {
    secret: uploadthingSecretFromEnv, // Keep secret for potential other uses
    token: uploadthingTokenFromEnv, // Add the token field
  },
  database: {
    url: process.env.POSTGRES_DATABASE_URL || process.env.DATABASE_URL, // Prioritize specific one if needed
  },
  // *** Add Algolia Config ***
  algolia: {
    appId: process.env.NEXT_PUBLIC_ALGOLIA_APP_ID,
    apiKey: process.env.NEXT_PUBLIC_ALGOLIA_API_KEY, // Use the public/search API Key
    // Add Admin API key if needed for specific server-side admin tasks
    adminApiKey: process.env.ALGOLIA_ADMIN_API_KEY,
  },
  // *** Add Mux Config ***
  mux: {
    tokenId: process.env.MUX_TOKEN_ID,
    tokenSecret: process.env.MUX_TOKEN_SECRET,
  },
  // *** Add SendGrid Config ***
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY,
  },
  // Add other server-side variables here
};

// Optional: Log loaded config during server startup (won't run per-request)
logger.info('[Server Config] Loaded server configuration', {
  phylloClientIdSet: !!serverConfig.phyllo.clientId,
  phylloSecretSet: !!serverConfig.phyllo.clientSecret,
  stripeKeySet: !!serverConfig.stripe.secretKey,
  cintKeySet: !!serverConfig.cint.apiKey, // Check Cint API Key
  uploadthingSecretSet: !!serverConfig.uploadthing.secret, // Check Uploadthing Secret
  uploadthingTokenSet: !!serverConfig.uploadthing.token, // Check Uploadthing Token
  dbUrlSet: !!serverConfig.database.url, // Check DB URL
  algoliaAppIdSet: !!serverConfig.algolia.appId,
  algoliaApiKeySet: !!serverConfig.algolia.apiKey, // Log the search key
  algoliaAdminKeySet: !!serverConfig.algolia.adminApiKey, // Log admin key presence
  muxTokenIdSet: !!serverConfig.mux.tokenId, // Check Mux Token ID
  sendgridApiKeySet: !!serverConfig.sendgrid.apiKey, // Check SendGrid API Key
  // Add checks for other critical keys
});
