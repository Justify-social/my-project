# Plan: Robust Timezone & Currency Handling via LocalizationProvider

**Goal:** Implement a modular, globally accessible, and robust system for detecting and providing user timezone, country, and default currency, resolving initialization race conditions.

**Approach:** Utilize React Context (`LocalizationProvider`) as the Single Source of Truth (SSOT) for localization data, ensuring the simplest, most scalable architecture.

**Tasks:**

1.  **Establish Provider Structure:**

    - Verify/Create directory: `src/providers`.

2.  **Define Context Shape:**

    - Create file: `src/providers/LocalizationProvider.types.ts`.
    - Define `LocalizationContextType` interface:

      ```typescript
      import { z } from 'zod';
      import { CurrencyEnum } from '@/components/features/campaigns/types'; // Adjust path if necessary

      export type DetectionSource = 'ipgeolocation.io' | 'Intl API' | 'default' | 'none';

      export interface LocalizationContextType {
        timezone: string | null; // Detected/fallback timezone (e.g., 'Europe/London', 'UTC')
        countryCode: string | null; // Detected country code (e.g., 'GB', 'US')
        currency: z.infer<typeof CurrencyEnum> | null; // Default currency based on country (e.g., 'GBP', 'USD')
        isLoading: boolean; // True while detection is in progress
        error: Error | null; // Stores any detection error
        detectionSource: DetectionSource; // Source of the detected data
        determineCurrencyForCountry: (country: string | null) => z.infer<typeof CurrencyEnum>; // Helper
      }
      ```

3.  **Implement LocalizationProvider:**

    - Create file: `src/providers/LocalizationProvider.tsx`.
    - Import necessary hooks (`useState`, `useEffect`, `createContext`, `useMemo`), types, logger, `timezones.json`, `CurrencyEnum`.
    - Create `LocalizationContext` using `createContext<LocalizationContextType | undefined>(undefined)`.
    - Implement `LocalizationProvider` component:
      - Internal state using `useState` for `timezone`, `countryCode`, `currency`, `isLoading`, `error`, `detectionSource`.
      - **Primary Detection `useEffect`:**
        - Runs once on mount.
        - Sets `isLoading` true.
        - Includes the asynchronous logic from the current `useUserLocation` hook:
          - Fetch from `ipgeolocation.io` (using `NEXT_PUBLIC_IPGEOLOCATION_API_KEY`).
          - Handle API success/error/timeout.
          - Validate timezone against `timezones.json`.
          - Fallback to `Intl.DateTimeFormat().resolvedOptions().timeZone` if API fails or returns invalid timezone.
          - Validate Intl timezone against `timezones.json`.
        - Updates `timezone`, `countryCode`, `error`, `detectionSource` state based on results.
        - Sets `isLoading` false upon completion or error.
        - Includes mount check (`isMounted`) for cleanup.
      - **Currency Determination `useEffect`:**
        - Runs when `countryCode` state changes.
        - Calls `determineCurrencyForCountry(countryCode)`.
        - Updates the `currency` state.
      - **`determineCurrencyForCountry` Function:**
        - Input: `countryCode: string | null`.
        - Output: `z.infer<typeof CurrencyEnum>`.
        - Contains mapping logic (e.g., if 'GB' return 'GBP'; if ['DE', 'FR', 'IT', 'ES'] return 'EUR'; else return 'USD').
      - Memoize context value using `useMemo`.
      - Return `<LocalizationContext.Provider value={contextValue}>{children}</LocalizationContext.Provider>`.

4.  **Create Consumer Hook:**

    - Create file: `src/hooks/useLocalization.ts`.
    - Implement simple `useLocalization` hook:

      ```typescript
      import { useContext } from 'react';
      import {
        LocalizationContext,
        LocalizationContextType,
      } from '@/providers/LocalizationProvider'; // Adjust path

      export const useLocalization = (): LocalizationContextType => {
        const context = useContext(LocalizationContext);
        if (context === undefined) {
          throw new Error('useLocalization must be used within a LocalizationProvider');
        }
        return context;
      };
      ```

5.  **Integrate Provider into App:**

    - Locate the main application layout component (e.g., `src/app/layout.tsx` or similar).
    - Import `LocalizationProvider`.
    - Wrap the primary content/children of the layout with `<LocalizationProvider>` ensuring it's inside other essential providers if necessary (like Theme, Auth) but wraps components that need localization data.

6.  **Refactor Consumer Component (`Step1Content.tsx`):**

    - Remove import and usage of `useUserLocation`.
    - Import and call `useLocalization` hook: `const localization = useLocalization();`.
    - Remove component-local state related to detection (`_detectedTimezone`, `_isDetectingTimezone`, `detectedCountryCode`).
    - Remove the component-local `useEffect` hook responsible for timezone/location detection.
    - **Update `Initial Value Calculation Effect`:**
      - Add `localization.isLoading` to dependency array.
      - Modify the main condition to wait for `!localization.isLoading`.
      - Determine `timezoneToUse`: Use `wizardState.timeZone` if available, otherwise use `localization.timezone || 'UTC'`. Remove direct dependency on `timezones.json` here.
      - Determine `currencyToUse`: Use `wizardState.budget?.currency` if available, otherwise use `localization.currency || CurrencyEnum.Values.USD`. Remove country code logic from this effect.
      - Adjust dependency array to include relevant `localization` state (`isLoading`, `timezone`, `currency`).
    - **Update `Form Reset Effect`:**
      - Ensure `localization.isLoading` is in the dependency array and the effect only runs the reset when `!localization.isLoading`.
    - **Update Timezone Form Field:**
      - Use `localization.isLoading` for the loading indicator icon (`faCircleNotchLight`).
      - Use `localization.isLoading` for the `disabled` prop of the `Select` component.
    - Remove direct import of `timezonesData` if it's no longer used elsewhere in the component.

7.  **Cleanup:**

    - Delete the redundant hook file: `src/hooks/useUserLocation.ts`.

8.  **Address Lingering Type Errors:**

    - Re-examine the persistent TypeScript errors in `Step1Content.tsx` related to `timeZone` and `budget.currency` during the `initialData` construction within the `Initial Value Calculation Effect`.
    - With the `localization` context providing stable types, investigate if the `as any` cast can be removed or if a more specific type assertion is needed based on `Step1FormData` and `react-hook-form` interaction.

9.  **Testing:**
    - **New Campaign:** Verify the timezone and currency fields default correctly based on detected location (e.g., London -> Europe/London, GBP).
    - **Existing Campaign:** Load a campaign with pre-saved timezone/currency; verify these saved values correctly override the detected defaults.
    - **Loading State:** Verify the timezone field shows the loading spinner and is disabled while `localization.isLoading` is true.
    - **API Failure:** Simulate failure of the `ipgeolocation.io` API (e.g., invalid key, network block) and verify:
      - Fallback to Intl timezone occurs (if applicable and valid).
      - Defaults (UTC, USD) are used gracefully if both detection methods fail.
      - Check console for appropriate error logs from the provider.
    - **Other Components:** (Future) Verify other parts of the application can consume `useLocalization` successfully.
