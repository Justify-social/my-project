import { logger } from '@/lib/logger';

// Simple in-memory cache for exchange rates
interface RateCacheEntry {
  rates: { [currency: string]: number };
  timestamp: number;
}
const rateCache = new Map<string, RateCacheEntry>();
const CACHE_DURATION_MS = 60 * 60 * 1000; // Cache for 1 hour

/**
 * Fetches exchange rates from exchangerate.host API with caching.
 * @param baseCurrency The base currency to fetch rates for.
 * @returns Object containing rates relative to the base currency, or null on failure.
 */
async function getExchangeRates(
  baseCurrency: string
): Promise<{ [currency: string]: number } | null> {
  const upperBaseCurrency = baseCurrency.toUpperCase();
  const now = Date.now();

  // Check cache first
  const cachedEntry = rateCache.get(upperBaseCurrency);
  if (cachedEntry && now - cachedEntry.timestamp < CACHE_DURATION_MS) {
    logger.debug(`[Currency] Using cached rates for base: ${upperBaseCurrency}`);
    return cachedEntry.rates;
  }

  logger.info(`[Currency] Fetching fresh rates for base: ${upperBaseCurrency}`);
  const endpoint = `https://api.exchangerate.host/latest?base=${upperBaseCurrency}`;

  try {
    const response = await fetch(endpoint, { signal: AbortSignal.timeout(4000) }); // 4s timeout
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();

    if (!data || !data.rates || typeof data.rates !== 'object') {
      throw new Error('Invalid API response structure');
    }

    // Update cache
    rateCache.set(upperBaseCurrency, { rates: data.rates, timestamp: now });
    logger.debug(`[Currency] Updated cache for base: ${upperBaseCurrency}`);

    return data.rates;
  } catch (error) {
    logger.error('[Currency] Failed to fetch exchange rates.', {
      base: upperBaseCurrency,
      error: error instanceof Error ? error.message : String(error),
    });
    // Return stale cache data if available and error occurred
    if (cachedEntry) {
      logger.warn(`[Currency] Returning stale cache for ${upperBaseCurrency} due to fetch error.`);
      return cachedEntry.rates;
    }
    return null;
  }
}

/**
 * Converts an amount from one currency to another using the exchangerate.host API.
 * Provides basic caching to limit API calls.
 *
 * @param amount The amount to convert.
 * @param fromCurrency The currency code to convert from (e.g., 'EUR').
 * @param toCurrency The currency code to convert to (e.g., 'USD').
 * @returns The converted amount rounded to 2 decimal places, or null if conversion fails.
 */
export async function convertCurrencyUsingApi(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<number | null> {
  if (isNaN(amount) || amount === 0) {
    return 0; // No need to convert zero
  }
  const upperFrom = fromCurrency.toUpperCase();
  const upperTo = toCurrency.toUpperCase();

  if (upperFrom === upperTo) {
    return amount; // No conversion needed
  }

  // Fetch rates using the 'from' currency as the base
  const rates = await getExchangeRates(upperFrom);

  if (!rates) {
    logger.warn(`[Currency] Could not get rates for base: ${upperFrom}`);
    return null; // Failed to get rates
  }

  const conversionRate = rates[upperTo];
  if (conversionRate === undefined || conversionRate === null) {
    logger.warn(`[Currency] Target currency rate not found: ${upperTo} in rates for ${upperFrom}`);
    return null; // Target currency not found in rates
  }

  const convertedAmount = amount * conversionRate;
  return parseFloat(convertedAmount.toFixed(2)); // Return rounded to 2 decimal places
}
