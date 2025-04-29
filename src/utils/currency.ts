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
  // We only need rates relative to USD for display conversion, and the fallback API uses USD base
  const targetBase = 'USD';
  const now = Date.now();

  // Check cache for USD base rates
  const cachedEntry = rateCache.get(targetBase);
  if (cachedEntry && now - cachedEntry.timestamp < CACHE_DURATION_MS) {
    logger.debug(`[Currency] Using cached rates for base: ${targetBase}`);
    return cachedEntry.rates;
  }

  // Use the keyless fallback API endpoint
  logger.info(`[Currency] Fetching fresh rates using fallback API (Base: ${targetBase})`);
  const endpoint = `https://open.er-api.com/v6/latest/${targetBase}`;
  let rawResponseText: string | null = null;

  try {
    const response = await fetch(endpoint, { signal: AbortSignal.timeout(4000) });

    if (!response.ok) {
      rawResponseText = await response.text().catch(() => 'Failed to read error response text');
      logger.error('[Currency] Fallback API request failed.', {
        base: targetBase,
        status: response.status,
        statusText: response.statusText,
        body: rawResponseText,
      });
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      rawResponseText = await response.text().catch(() => 'Failed to read non-json response text');
      logger.error('[Currency] Received non-JSON response from fallback API.', {
        base: targetBase,
        contentType: contentType,
        body: rawResponseText,
      });
      throw new Error(`Received non-JSON response: ${contentType}`);
    }

    rawResponseText = await response.text();
    const data = JSON.parse(rawResponseText);

    // Check structure for open.er-api.com format (e.g., result: "success")
    if (!data || data.result !== 'success' || !data.rates || typeof data.rates !== 'object') {
      logger.error('[Currency] Invalid fallback API JSON structure received.', {
        base: targetBase,
        responseText: rawResponseText,
      });
      throw new Error('Invalid fallback API response structure');
    }

    // Update cache with USD base rates
    rateCache.set(targetBase, { rates: data.rates, timestamp: now });
    logger.debug(`[Currency] Updated cache for base: ${targetBase}`);

    return data.rates; // Return rates relative to USD
  } catch (error) {
    // Log error details consistently
    logger.error('[Currency] Failed to fetch, parse, or validate exchange rates.', {
      base: targetBase,
      error: error instanceof Error ? error.message : String(error),
      responseText: rawResponseText, // Log raw text if available from try block
    });
    // Return stale cache data if available and error occurred
    if (cachedEntry) {
      logger.warn(`[Currency] Returning stale cache for ${targetBase} due to fetch error.`);
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
  if (isNaN(amount) || amount === 0) return 0;

  const upperFrom = fromCurrency.toUpperCase();
  const upperTo = toCurrency.toUpperCase();

  if (upperFrom === upperTo) return amount;

  // Fetch USD-based rates
  const rates = await getExchangeRates('USD'); // Always fetch USD base now

  if (!rates) {
    logger.warn(`[Currency] Could not get USD base rates for conversion`);
    return null;
  }

  // Get rates relative to USD
  const fromRate = rates[upperFrom]; // Rate of 1 USD in FromCurrency
  const toRate = rates[upperTo]; // Rate of 1 USD in ToCurrency

  if (fromRate === undefined || fromRate === null || toRate === undefined || toRate === null) {
    logger.warn(
      `[Currency] Missing rate for conversion: ${upperFrom}=${fromRate}, ${upperTo}=${toRate}`
    );
    return null;
  }

  // Convert: Amount * (ToRate / FromRate)
  // Example: 100 GBP to EUR: 100 * (EUR_Rate / GBP_Rate)
  // Rates are relative to USD, so: Amount * ( (EUR/USD) / (GBP/USD) )
  const convertedAmount = amount * (toRate / fromRate);
  return parseFloat(convertedAmount.toFixed(2));
}
