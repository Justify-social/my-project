import { useContext } from 'react';
// Adjust path if your provider file is located elsewhere
import {
  LocalizationContextType, // Import type
} from '@/providers/LocalizationProvider.types';
import {
  LocalizationContext, // Import context object itself
} from '@/providers/LocalizationProvider';

/**
 * Custom hook to consume the LocalizationContext.
 * Provides access to the user's detected/default localization settings.
 * Must be used within a LocalizationProvider.
 * @throws {Error} If used outside of a LocalizationProvider.
 * @returns {LocalizationContextType} The localization context value.
 */
export const useLocalization = (): LocalizationContextType => {
  const context = useContext(LocalizationContext); // Use the imported context object
  if (context === undefined) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
};
