'use client';

import React, { useState, useEffect, createContext, useMemo, ReactNode, useCallback } from 'react';
import { z as _z } from 'zod';
import { LocalizationContextType, DetectionSource } from './LocalizationProvider.types';
// Assuming these paths are correct
// import { CurrencyEnum } from '@/components/features/campaigns/types'; // No longer need the Zod schema here for values
import { Currency as PrismaCurrency } from '@prisma/client'; // Import the Prisma enum directly
import timezonesData from '@/lib/timezones.json';
import { logger } from '@/lib/logger';

// Define the Context
export const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

// Define the Provider component
export const LocalizationProvider = ({ children }: { children: ReactNode }) => {
  const [timezone, setTimezone] = useState<string | null>(null);
  const [countryCode, setCountryCode] = useState<string | null>(null);
  // const [currency, setCurrency] = useState<z.infer<typeof CurrencyEnum> | null>(null); // Old type
  const [currency, setCurrency] = useState<PrismaCurrency | null>(null); // New type using Prisma enum directly
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [detectionSource, setDetectionSource] = useState<DetectionSource>('none');

  // --- Helper function to determine currency from country code ---
  const determineCurrencyForCountry = useCallback(
    // (code: string | null): z.infer<typeof CurrencyEnum> => { // Old type
    (code: string | null): PrismaCurrency => {
      // New type
      // if (!code) return CurrencyEnum.Values.USD; // Old access
      if (!code) return PrismaCurrency.USD; // New access
      // Define mappings
      const euCountryCodes = ['DE', 'FR', 'ES', 'IT']; // Add more as needed
      if (code === 'GB') {
        // return CurrencyEnum.Values.GBP; // Old access
        return PrismaCurrency.GBP; // New access
      } else if (euCountryCodes.includes(code)) {
        // return CurrencyEnum.Values.EUR; // Old access
        return PrismaCurrency.EUR; // New access
      } else {
        // return CurrencyEnum.Values.USD; // Old access
        return PrismaCurrency.USD; // New access
      }
    },
    []
  );

  // --- Effect for IP Geolocation and Timezone Detection ---
  useEffect(() => {
    let isMounted = true;

    const performDetection = async () => {
      if (!isMounted) return;

      setIsLoading(true);
      setError(null);
      setDetectionSource('none');
      logger.info('[LocalizationProvider] Attempting timezone & location detection...');

      let detectedTz: string | null = null;
      let detectedCountry: string | null = null;
      let source: DetectionSource = 'default';
      let detectionError: Error | null = null;

      // 1. Try ipgeolocation.io
      const apiKey = process.env.NEXT_PUBLIC_IPGEOLOCATION_API_KEY;
      if (apiKey) {
        source = 'ipgeolocation.io';
        try {
          const response = await fetch(`https://api.ipgeolocation.io/ipgeo?apiKey=${apiKey}`, {
            signal: AbortSignal.timeout(3000),
          });
          if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
          }
          const data = await response.json();
          if (data?.time_zone?.name && timezonesData.some(tz => tz.value === data.time_zone.name)) {
            detectedTz = data.time_zone.name;
          } else if (data?.time_zone?.name) {
            logger.warn(
              `[LocalizationProvider] ${source} returned unknown timezone: ${data.time_zone.name}`
            );
          }
          if (data?.country_code2) {
            detectedCountry = data.country_code2.toUpperCase();
          }
          logger.info(`[LocalizationProvider] Data fetched via ${source}.`, {
            detectedTz,
            detectedCountry,
          });
        } catch (err) {
          logger.warn(`[LocalizationProvider] Failed detection via ${source}.`, {
            error: err instanceof Error ? err.message : String(err),
          });
          detectionError = err instanceof Error ? err : new Error(String(err));
        }
      } else {
        logger.warn('[LocalizationProvider] Skipping ipgeolocation.io: API key not set.');
      }

      // 2. Fallback to Intl API for Timezone
      if (!detectedTz) {
        source = 'Intl API';
        logger.info('[LocalizationProvider] Falling back to Intl API for timezone.');
        try {
          const intlTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
          if (timezonesData.some(tz => tz.value === intlTz)) {
            detectedTz = intlTz;
            logger.info(`[LocalizationProvider] Timezone detected via ${source}: ${detectedTz}`);
            if (detectionError?.message?.includes('API Error')) {
              detectionError = null; // Clear API error if Intl succeeds
            }
          } else {
            logger.warn(`[LocalizationProvider] Intl API returned unknown timezone: ${intlTz}`);
            if (!detectionError) {
              detectionError = new Error('Intl API returned unknown timezone');
            }
          }
        } catch (err) {
          logger.error('[LocalizationProvider] Error using Intl API for timezone.', {
            error: err instanceof Error ? err.message : String(err),
          });
          if (!detectionError) {
            detectionError = err instanceof Error ? err : new Error(String(err));
          }
        }
      }

      // 3. Set final state if component is still mounted
      if (isMounted) {
        const finalTimeZone = detectedTz || 'UTC'; // Default to UTC if detection failed
        setTimezone(finalTimeZone);
        setCountryCode(detectedCountry);
        setError(detectionError);
        setDetectionSource(detectedTz || detectedCountry ? source : 'none');
        setIsLoading(false);
        logger.info('[LocalizationProvider] Detection complete.', {
          finalTimeZone,
          finalCountryCode: detectedCountry,
          source: detectedTz || detectedCountry ? source : 'none',
          error: detectionError?.message,
        });
      }
    };

    performDetection();

    return () => {
      isMounted = false;
    };
  }, []); // Run once on mount

  // --- Effect to determine currency based on country code ---
  useEffect(() => {
    // Only run after initial loading is complete
    if (!isLoading) {
      const determinedCurrency = determineCurrencyForCountry(countryCode);
      setCurrency(determinedCurrency);
      logger.info('[LocalizationProvider] Determined currency based on country.', {
        countryCode,
        determinedCurrency,
      });
    }
    // Depend on isLoading and countryCode
  }, [isLoading, countryCode, determineCurrencyForCountry]);

  // --- Memoize context value ---
  const contextValue = useMemo(
    () => ({
      timezone,
      countryCode,
      currency,
      isLoading,
      error,
      detectionSource,
    }),
    [timezone, countryCode, currency, isLoading, error, detectionSource]
  );

  // Return the Provider component
  return (
    <LocalizationContext.Provider value={contextValue}>{children}</LocalizationContext.Provider>
  );
};
