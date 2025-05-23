/**
 * Clerk Configuration Utility
 * Helps validate and debug Clerk setup across environments
 */

export interface ClerkConfig {
  publishableKey: string | undefined;
  signInUrl: string;
  signUpUrl: string;
  afterSignInUrl: string;
  afterSignUpUrl: string;
  environment: 'development' | 'production' | 'preview' | 'unknown';
  isConfigured: boolean;
}

export function getClerkConfig(): ClerkConfig {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const nodeEnv = process.env.NODE_ENV;
  const vercelEnv = process.env.VERCEL_ENV;

  // Determine environment
  let environment: ClerkConfig['environment'] = 'unknown';
  if (nodeEnv === 'development') {
    environment = 'development';
  } else if (vercelEnv === 'production') {
    environment = 'production';
  } else if (vercelEnv === 'preview') {
    environment = 'preview';
  }

  const config: ClerkConfig = {
    publishableKey,
    signInUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || '/sign-in',
    signUpUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || '/sign-up',
    afterSignInUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL || '/dashboard',
    afterSignUpUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL || '/dashboard',
    environment,
    isConfigured: !!publishableKey && publishableKey.length > 0,
  };

  return config;
}

export function validateClerkConfig(): { isValid: boolean; errors: string[] } {
  const config = getClerkConfig();
  const errors: string[] = [];

  if (!config.publishableKey) {
    errors.push('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is missing');
  } else {
    // Validate key format
    const isDevelopmentKey = config.publishableKey.startsWith('pk_test_');
    const isProductionKey = config.publishableKey.startsWith('pk_live_');

    if (!isDevelopmentKey && !isProductionKey) {
      errors.push('Invalid Clerk publishable key format');
    }

    // Environment key mismatch warnings
    if (config.environment === 'production' && isDevelopmentKey) {
      errors.push('Using development Clerk key in production environment');
    }

    if (config.environment === 'development' && isProductionKey) {
      errors.push('Using production Clerk key in development environment (this may cause issues)');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Debug function to log Clerk configuration (development only)
 */
export function debugClerkConfig(): void {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  const config = getClerkConfig();
  const validation = validateClerkConfig();

  console.log('🔍 [CLERK CONFIG DEBUG]', {
    environment: config.environment,
    isConfigured: config.isConfigured,
    keyType: config.publishableKey?.startsWith('pk_test_')
      ? 'development'
      : config.publishableKey?.startsWith('pk_live_')
        ? 'production'
        : 'unknown',
    keyPrefix: config.publishableKey?.substring(0, 15) + '...',
    signInUrl: config.signInUrl,
    signUpUrl: config.signUpUrl,
    afterSignInUrl: config.afterSignInUrl,
    isValid: validation.isValid,
    errors: validation.errors,
  });

  if (!validation.isValid) {
    console.warn('⚠️ [CLERK CONFIG] Configuration issues detected:', validation.errors);
  }
}
