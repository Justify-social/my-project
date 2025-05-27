import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from '@/lib/logger';

// Simple in-memory cache for exchange rates (server-side)
interface RateCacheEntry {
  rates: { [currency: string]: number };
  timestamp: number;
}
const rateCache = new Map<string, RateCacheEntry>();
const CACHE_DURATION_MS = 60 * 60 * 1000; // Cache for 1 hour

// Request schema
const ConvertRequestSchema = z.object({
  amount: z.number(),
  from: z.string().min(2).max(3),
  to: z.string().min(2).max(3),
});

/**
 * Server-side exchange rate fetching (no CORS issues)
 */
async function getExchangeRatesServerSide(): Promise<{ [currency: string]: number } | null> {
  const targetBase = 'USD';
  const now = Date.now();

  // Check cache first
  const cachedEntry = rateCache.get(targetBase);
  if (cachedEntry && now - cachedEntry.timestamp < CACHE_DURATION_MS) {
    logger.debug(`[Currency API] Using cached rates for base: ${targetBase}`);
    return cachedEntry.rates;
  }

  // Fetch fresh rates
  logger.info(`[Currency API] Fetching fresh rates (Base: ${targetBase})`);
  const endpoint = `https://open.er-api.com/v6/latest/${targetBase}`;

  try {
    const response = await fetch(endpoint, { signal: AbortSignal.timeout(4000) });

    if (!response.ok) {
      logger.error('[Currency API] API request failed.', {
        status: response.status,
        statusText: response.statusText,
      });
      // Return stale cache if available
      if (cachedEntry) {
        logger.warn(`[Currency API] Returning stale cache due to fetch error.`);
        return cachedEntry.rates;
      }
      return null;
    }

    const data = await response.json();

    if (!data || data.result !== 'success' || !data.rates || typeof data.rates !== 'object') {
      logger.error('[Currency API] Invalid API response structure.');
      if (cachedEntry) {
        logger.warn(`[Currency API] Returning stale cache due to invalid response.`);
        return cachedEntry.rates;
      }
      return null;
    }

    // Update cache
    rateCache.set(targetBase, { rates: data.rates, timestamp: now });
    logger.debug(`[Currency API] Updated cache for base: ${targetBase}`);

    return data.rates;
  } catch (error) {
    logger.error('[Currency API] Failed to fetch exchange rates.', {
      error: error instanceof Error ? error.message : String(error),
    });

    // Return stale cache if available
    if (cachedEntry) {
      logger.warn(`[Currency API] Returning stale cache due to fetch error.`);
      return cachedEntry.rates;
    }
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = ConvertRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request body',
          details: validationResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { amount, from, to } = validationResult.data;

    // Handle zero amount or same currency
    if (amount === 0) {
      return NextResponse.json({ success: true, convertedAmount: 0 });
    }

    const upperFrom = from.toUpperCase();
    const upperTo = to.toUpperCase();

    if (upperFrom === upperTo) {
      return NextResponse.json({ success: true, convertedAmount: amount });
    }

    // Get exchange rates
    const rates = await getExchangeRatesServerSide();

    if (!rates) {
      return NextResponse.json(
        { success: false, error: 'Unable to fetch exchange rates' },
        { status: 503 }
      );
    }

    // Get rates for conversion
    const fromRate = rates[upperFrom];
    const toRate = rates[upperTo];

    if (fromRate === undefined || toRate === undefined) {
      return NextResponse.json(
        { success: false, error: `Missing rate for ${upperFrom} or ${upperTo}` },
        { status: 400 }
      );
    }

    // Convert: Amount * (ToRate / FromRate)
    const convertedAmount = amount * (toRate / fromRate);
    const roundedAmount = parseFloat(convertedAmount.toFixed(2));

    logger.info(`[Currency API] Converted ${amount} ${upperFrom} to ${roundedAmount} ${upperTo}`);

    return NextResponse.json({
      success: true,
      convertedAmount: roundedAmount,
      rates: { from: fromRate, to: toRate },
    });
  } catch (error) {
    logger.error('[Currency API] Unexpected error during conversion:', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
