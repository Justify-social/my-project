import { logger } from '@/lib/logger';

/**
 * Currency conversion utility that uses our server-side API endpoint.
 * All exchange rate fetching and caching is now handled server-side to avoid CORS issues.
 */

/**
 * Converts an amount from one currency to another using our server-side API.
 * This avoids CORS issues by making the external API call server-side.
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

  try {
    logger.info(`[Currency] Converting ${amount} ${upperFrom} to ${upperTo} via API`);

    const response = await fetch('/api/currency/convert', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        from: upperFrom,
        to: upperTo,
      }),
    });

    if (!response.ok) {
      logger.error('[Currency] API conversion request failed.', {
        status: response.status,
        statusText: response.statusText,
      });
      return null;
    }

    const data = await response.json();

    if (!data.success) {
      logger.error('[Currency] API conversion returned error.', {
        error: data.error,
      });
      return null;
    }

    logger.debug(
      `[Currency] Successfully converted ${amount} ${upperFrom} to ${data.convertedAmount} ${upperTo}`
    );
    return data.convertedAmount;
  } catch (error) {
    logger.error('[Currency] Failed to convert currency via API.', {
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}
