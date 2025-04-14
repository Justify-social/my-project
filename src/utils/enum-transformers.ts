/**
 * Enum Transformation Utilities
 *
 * This module provides centralized utilities for transforming enum values between:
 * - Frontend format (typically camelCase for KPIs, Title Case for Platforms)
 * - Backend format (UPPERCASE_SNAKE_CASE as stored in database)
 *
 * It ensures consistent handling of enum values across the application.
 */

import {
  KPI,
  Platform,
  Currency,
  Position,
  Feature,
  TeamRole,
  InvitationStatus,
  UserRole,
} from '@prisma/client';

// Enable debug logging in development
const isDev = process.env.NODE_ENV === 'development';
const debugLog = (message: string) => {
  if (isDev) {
    console.log(message);
  }
};

export const EnumTransformers = {
  // KPI transformers
  kpiToBackend(value: string): KPI {
    const mapping: Record<string, KPI> = {
      adRecall: 'AD_RECALL' as KPI,
      brandAwareness: 'BRAND_AWARENESS' as KPI,
      consideration: 'CONSIDERATION' as KPI,
      messageAssociation: 'MESSAGE_ASSOCIATION' as KPI,
      brandPreference: 'BRAND_PREFERENCE' as KPI,
      purchaseIntent: 'PURCHASE_INTENT' as KPI,
      actionIntent: 'ACTION_INTENT' as KPI,
      recommendationIntent: 'RECOMMENDATION_INTENT' as KPI,
      advocacy: 'ADVOCACY' as KPI,
    };

    const result = mapping[value] || (value as KPI);
    debugLog(`[EnumTransformer] kpiToBackend: ${value} → ${result}`);
    return result;
  },

  kpiFromBackend(value: KPI): string {
    const mapping: Record<string, string> = {
      AD_RECALL: 'adRecall',
      BRAND_AWARENESS: 'brandAwareness',
      CONSIDERATION: 'consideration',
      MESSAGE_ASSOCIATION: 'messageAssociation',
      BRAND_PREFERENCE: 'brandPreference',
      PURCHASE_INTENT: 'purchaseIntent',
      ACTION_INTENT: 'actionIntent',
      RECOMMENDATION_INTENT: 'recommendationIntent',
      ADVOCACY: 'advocacy',
    };

    const result = mapping[value] || value.toLowerCase();
    debugLog(`[EnumTransformer] kpiFromBackend: ${value} → ${result}`);
    return result;
  },

  // Platform transformers
  platformToBackend(value: string): Platform {
    const mapping: Record<string, Platform> = {
      Instagram: 'INSTAGRAM' as Platform,
      YouTube: 'YOUTUBE' as Platform,
      TikTok: 'TIKTOK' as Platform,
    };

    const result = mapping[value] || (value as Platform);
    debugLog(`[EnumTransformer] platformToBackend: ${value} → ${result}`);
    return result;
  },

  platformFromBackend(value: Platform): string {
    const mapping: Record<string, string> = {
      INSTAGRAM: 'Instagram',
      YOUTUBE: 'YouTube',
      TIKTOK: 'TikTok',
    };

    const result = mapping[value] || value;
    debugLog(`[EnumTransformer] platformFromBackend: ${value} → ${result}`);
    return result;
  },

  // Currency transformers
  currencyToBackend(value: string): Currency {
    const result = value.toUpperCase() as Currency;
    debugLog(`[EnumTransformer] currencyToBackend: ${value} → ${result}`);
    return result;
  },

  currencyFromBackend(value: Currency): string {
    debugLog(`[EnumTransformer] currencyFromBackend: ${value} → ${value}`);
    return value;
  },

  // Position transformers
  positionToBackend(value: string): Position {
    const mapping: Record<string, Position> = {
      Manager: 'Manager' as Position,
      Director: 'Director' as Position,
      VP: 'VP' as Position,
    };

    const result = mapping[value] || (value as Position);
    debugLog(`[EnumTransformer] positionToBackend: ${value} → ${result}`);
    return result;
  },

  positionFromBackend(value: Position): string {
    debugLog(`[EnumTransformer] positionFromBackend: ${value} → ${value}`);
    return value; // Position format is the same in frontend and backend
  },

  // Feature transformers
  featureToBackend(value: string): Feature {
    const mapping: Record<string, Feature> = {
      CREATIVE_ASSET_TESTING: 'CREATIVE_ASSET_TESTING' as Feature,
      BRAND_LIFT: 'BRAND_LIFT' as Feature,
      BRAND_HEALTH: 'BRAND_HEALTH' as Feature,
      MIXED_MEDIA_MODELLING: 'MIXED_MEDIA_MODELING' as Feature,
    };

    const result = mapping[value] || (value as Feature);
    debugLog(`[EnumTransformer] featureToBackend: ${value} → ${result}`);
    return result;
  },

  featureFromBackend(value: Feature): string {
    const mapping: Record<string, string> = {
      CREATIVE_ASSET_TESTING: 'CREATIVE_ASSET_TESTING',
      BRAND_LIFT: 'BRAND_LIFT',
      BRAND_HEALTH: 'BRAND_HEALTH',
      MIXED_MEDIA_MODELING: 'MIXED_MEDIA_MODELLING',
    };

    const result = mapping[value] || value;
    debugLog(`[EnumTransformer] featureFromBackend: ${value} → ${result}`);
    return result;
  },

  // TeamRole transformers
  teamRoleToBackend(value: string): TeamRole {
    debugLog(`[EnumTransformer] teamRoleToBackend: ${value} → ${value}`);
    return value as TeamRole; // Both use UPPERCASE format
  },

  teamRoleFromBackend(value: TeamRole): string {
    debugLog(`[EnumTransformer] teamRoleFromBackend: ${value} → ${value}`);
    return value; // Both use UPPERCASE format
  },

  // InvitationStatus transformers
  invitationStatusToBackend(value: string): InvitationStatus {
    debugLog(`[EnumTransformer] invitationStatusToBackend: ${value} → ${value}`);
    return value as InvitationStatus; // Both use UPPERCASE format
  },

  invitationStatusFromBackend(value: InvitationStatus): string {
    debugLog(`[EnumTransformer] invitationStatusFromBackend: ${value} → ${value}`);
    return value; // Both use UPPERCASE format, but display with first letter capitalized and rest lowercase
  },

  // UserRole transformers
  userRoleToBackend(value: string): UserRole {
    debugLog(`[EnumTransformer] userRoleToBackend: ${value} → ${value}`);
    return value as UserRole; // Both use UPPERCASE format
  },

  userRoleFromBackend(value: UserRole): string {
    debugLog(`[EnumTransformer] userRoleFromBackend: ${value} → ${value}`);
    return value; // Both use UPPERCASE format
  },

  // Recursive object transformation utility
  transformObjectToBackend<T>(obj: T): T {
    if (!obj) return obj;

    if (Array.isArray(obj)) {
      return obj.map(item => this.transformObjectToBackend(item)) as unknown as T;
    }

    if (typeof obj !== 'object') return obj;

    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      if (value === null || value === undefined) {
        result[key] = value;
        continue;
      }

      if (key === 'kpi' || key === 'primaryKPI') {
        result[key] = this.kpiToBackend(value as string);
      } else if (key === 'secondaryKPIs' && Array.isArray(value)) {
        result[key] = value.map(kpi => this.kpiToBackend(kpi as string));
      } else if (key === 'platform') {
        result[key] = this.platformToBackend(value as string);
      } else if (key === 'currency') {
        result[key] = this.currencyToBackend(value as string);
      } else if (key === 'position') {
        result[key] = this.positionToBackend(value as string);
      } else if (key === 'features' && Array.isArray(value)) {
        result[key] = value.map(feature => this.featureToBackend(feature as string));
      } else if (key === 'role') {
        result[key] = this.teamRoleToBackend(value as string);
      } else if (key === 'status') {
        result[key] = this.invitationStatusToBackend(value as string);
      } else if (key === 'userRole') {
        result[key] = this.userRoleToBackend(value as string);
      } else if (value instanceof Date) {
        // Explicitly handle Date objects
        result[key] = value; // Keep Date objects as they are for DB
      } else if (typeof value === 'object') {
        result[key] = this.transformObjectToBackend(value);
      } else {
        result[key] = value;
      }
    }

    return result as unknown as T;
  },

  transformObjectFromBackend<T>(obj: T): T {
    if (!obj) return obj;

    if (Array.isArray(obj)) {
      return obj.map(item => this.transformObjectFromBackend(item)) as unknown as T;
    }

    if (typeof obj !== 'object') return obj;

    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      if (value === null || value === undefined) {
        result[key] = value;
        continue;
      }

      if (key === 'kpi' || key === 'primaryKPI') {
        result[key] = this.kpiFromBackend(value as KPI);
      } else if (key === 'secondaryKPIs' && Array.isArray(value)) {
        result[key] = value.map(kpi => this.kpiFromBackend(kpi as KPI));
      } else if (key === 'platform') {
        result[key] = this.platformFromBackend(value as Platform);
      } else if (key === 'currency') {
        result[key] = this.currencyFromBackend(value as Currency);
      } else if (key === 'position') {
        result[key] = this.positionFromBackend(value as Position);
      } else if (key === 'features' && Array.isArray(value)) {
        result[key] = value.map(feature => this.featureFromBackend(feature as Feature));
      } else if (key === 'role') {
        result[key] = this.teamRoleFromBackend(value as TeamRole);
      } else if (key === 'status') {
        result[key] = this.invitationStatusFromBackend(value as InvitationStatus);
      } else if (key === 'userRole') {
        result[key] = this.userRoleFromBackend(value as UserRole);
      } else if (value instanceof Date) {
        // Explicitly handle Date objects
        result[key] = value.toISOString(); // Convert to ISO string for API response
      } else if (typeof value === 'object') {
        result[key] = this.transformObjectFromBackend(value);
      } else {
        result[key] = value;
      }
    }

    return result as unknown as T;
  },
};

/**
 * Formats enum values for display in the UI
 * Converts UPPERCASE_SNAKE_CASE to Title Case Words
 */
export const formatEnumForDisplay = (value: string): string => {
  if (!value) return '';

  // If it's an UPPERCASE_SNAKE_CASE value
  if (value === value.toUpperCase() && value.includes('_')) {
    // Convert to Title Case Words
    return value
      .toLowerCase()
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // If it's already in a display format, return as is
  return value;
};
