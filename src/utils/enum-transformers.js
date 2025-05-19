'use strict';
/**
 * Enum Transformation Utilities
 *
 * This module provides centralized utilities for transforming enum values between:
 * - Frontend format (typically camelCase for KPIs, Title Case for Platforms)
 * - Backend format (UPPERCASE_SNAKE_CASE as stored in database)
 *
 * It ensures consistent handling of enum values across the application.
 */
Object.defineProperty(exports, '__esModule', { value: true });
exports.formatEnumForDisplay = exports.EnumTransformers = void 0;
// Enable debug logging in development
// Workaround for potential process.env typing issues
var isDev =
  (typeof process !== 'undefined' && process.env && process.env.NODE_ENV) === 'development';
var debugLog = function (message) {
  if (isDev) {
    console.log(message);
  }
};
exports.EnumTransformers = {
  // KPI transformers
  kpiToBackend: function (value) {
    var mapping = {
      adRecall: 'AD_RECALL',
      brandAwareness: 'BRAND_AWARENESS',
      consideration: 'CONSIDERATION',
      messageAssociation: 'MESSAGE_ASSOCIATION',
      brandPreference: 'BRAND_PREFERENCE',
      purchaseIntent: 'PURCHASE_INTENT',
      actionIntent: 'ACTION_INTENT',
      recommendationIntent: 'RECOMMENDATION_INTENT',
      advocacy: 'ADVOCACY',
    };
    var result = mapping[value] || value;
    debugLog('[EnumTransformer] kpiToBackend: '.concat(value, ' \u2192 ').concat(result));
    return result;
  },
  kpiFromBackend: function (value) {
    var mapping = {
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
    var result = mapping[value] || value.toLowerCase();
    debugLog('[EnumTransformer] kpiFromBackend: '.concat(value, ' \u2192 ').concat(result));
    return result;
  },
  // Platform transformers
  platformToBackend: function (value) {
    var mapping = {
      Instagram: 'INSTAGRAM',
      YouTube: 'YOUTUBE',
      TikTok: 'TIKTOK',
    };
    var result = mapping[value] || value;
    debugLog('[EnumTransformer] platformToBackend: '.concat(value, ' \u2192 ').concat(result));
    return result;
  },
  platformFromBackend: function (value) {
    var mapping = {
      INSTAGRAM: 'Instagram',
      YOUTUBE: 'YouTube',
      TIKTOK: 'TikTok',
    };
    var result = mapping[value] || value;
    debugLog('[EnumTransformer] platformFromBackend: '.concat(value, ' \u2192 ').concat(result));
    return result;
  },
  // Currency transformers
  currencyToBackend: function (value) {
    var result = value.toUpperCase();
    debugLog('[EnumTransformer] currencyToBackend: '.concat(value, ' \u2192 ').concat(result));
    return result;
  },
  currencyFromBackend: function (value) {
    debugLog('[EnumTransformer] currencyFromBackend: '.concat(value, ' \u2192 ').concat(value));
    return value;
  },
  // Position transformers
  positionToBackend: function (value) {
    var mapping = {
      Manager: 'Manager',
      Director: 'Director',
      VP: 'VP',
    };
    var result = mapping[value] || value;
    debugLog('[EnumTransformer] positionToBackend: '.concat(value, ' \u2192 ').concat(result));
    return result;
  },
  positionFromBackend: function (value) {
    debugLog('[EnumTransformer] positionFromBackend: '.concat(value, ' \u2192 ').concat(value));
    return value; // Position format is the same in frontend and backend
  },
  // Feature transformers
  featureToBackend: function (value) {
    var mapping = {
      CREATIVE_ASSET_TESTING: 'CREATIVE_ASSET_TESTING',
      BRAND_LIFT: 'BRAND_LIFT',
      BRAND_HEALTH: 'BRAND_HEALTH',
      MIXED_MEDIA_MODELLING: 'MIXED_MEDIA_MODELING',
    };
    var result = mapping[value] || value;
    debugLog('[EnumTransformer] featureToBackend: '.concat(value, ' \u2192 ').concat(result));
    return result;
  },
  featureFromBackend: function (value) {
    var mapping = {
      CREATIVE_ASSET_TESTING: 'CREATIVE_ASSET_TESTING',
      BRAND_LIFT: 'BRAND_LIFT',
      BRAND_HEALTH: 'BRAND_HEALTH',
      MIXED_MEDIA_MODELING: 'MIXED_MEDIA_MODELLING',
    };
    var result = mapping[value] || value;
    debugLog('[EnumTransformer] featureFromBackend: '.concat(value, ' \u2192 ').concat(result));
    return result;
  },
  // TeamRole transformers
  teamRoleToBackend: function (value) {
    debugLog('[EnumTransformer] teamRoleToBackend: '.concat(value, ' \u2192 ').concat(value));
    return value; // Both use UPPERCASE format
  },
  teamRoleFromBackend: function (value) {
    debugLog('[EnumTransformer] teamRoleFromBackend: '.concat(value, ' \u2192 ').concat(value));
    return value; // Both use UPPERCASE format
  },
  // InvitationStatus transformers
  invitationStatusToBackend: function (value) {
    debugLog(
      '[EnumTransformer] invitationStatusToBackend: '.concat(value, ' \u2192 ').concat(value)
    );
    return value; // Both use UPPERCASE format
  },
  invitationStatusFromBackend: function (value) {
    debugLog(
      '[EnumTransformer] invitationStatusFromBackend: '.concat(value, ' \u2192 ').concat(value)
    );
    return value; // Both use UPPERCASE format, but display with first letter capitalized and rest lowercase
  },
  // UserRole transformers
  userRoleToBackend: function (value) {
    debugLog('[EnumTransformer] userRoleToBackend: '.concat(value, ' \u2192 ').concat(value));
    return value; // Both use UPPERCASE format
  },
  userRoleFromBackend: function (value) {
    debugLog('[EnumTransformer] userRoleFromBackend: '.concat(value, ' \u2192 ').concat(value));
    return value; // Both use UPPERCASE format
  },
  // Recursive object transformation utility
  transformObjectToBackend: function (obj) {
    var _this = this;
    if (!obj) return obj;
    if (Array.isArray(obj)) {
      return obj.map(function (item) {
        return _this.transformObjectToBackend(item);
      });
    }
    if (typeof obj !== 'object') return obj;
    var result = {};
    for (var _i = 0, _a = Object.entries(obj); _i < _a.length; _i++) {
      var _b = _a[_i],
        key = _b[0],
        value = _b[1];
      if (value === null || value === undefined) {
        result[key] = value;
        continue;
      }
      if (key === 'kpi' || key === 'primaryKPI') {
        result[key] = this.kpiToBackend(value);
      } else if (key === 'secondaryKPIs' && Array.isArray(value)) {
        result[key] = value.map(function (kpi) {
          return _this.kpiToBackend(kpi);
        });
      } else if (key === 'platform') {
        result[key] = this.platformToBackend(value);
      } else if (key === 'currency') {
        result[key] = this.currencyToBackend(value);
      } else if (key === 'position') {
        result[key] = this.positionToBackend(value);
      } else if (key === 'features' && Array.isArray(value)) {
        result[key] = value.map(function (feature) {
          return _this.featureToBackend(feature);
        });
      } else if (key === 'role') {
        result[key] = this.teamRoleToBackend(value);
      } else if (key === 'status') {
        // Assuming 'status' here is CampaignStatus or other statuses that are already in correct backend format
        // or do not need specific transformation via a dedicated function here.
        // The previous mapping to invitationStatusToBackend was too specific and potentially incorrect for CampaignStatus.
        result[key] = value; // Pass through
      } else if (key === 'userRole') {
        result[key] = this.userRoleToBackend(value);
      } else if (value instanceof Date) {
        // Explicitly handle Date objects
        result[key] = value; // Keep Date objects as they are for DB
      } else if (typeof value === 'object') {
        result[key] = this.transformObjectToBackend(value);
      } else {
        result[key] = value;
      }
    }
    return result;
  },
  transformObjectFromBackend: function (obj) {
    var _this = this;
    if (!obj) return obj;
    if (Array.isArray(obj)) {
      return obj.map(function (item) {
        return _this.transformObjectFromBackend(item);
      });
    }
    if (typeof obj !== 'object') return obj;
    var result = {};
    for (var _i = 0, _a = Object.entries(obj); _i < _a.length; _i++) {
      var _b = _a[_i],
        key = _b[0],
        value = _b[1];
      if (value === null || value === undefined) {
        result[key] = value;
        continue;
      }
      // Keep backend enum formats when transforming FROM backend
      if (key === 'kpi' || key === 'primaryKPI') {
        result[key] = value; // Keep backend format (e.g., AD_RECALL)
      } else if (key === 'secondaryKPIs' && Array.isArray(value)) {
        result[key] = value; // Keep backend format
      } else if (key === 'platform') {
        result[key] = value; // Keep backend format (e.g., INSTAGRAM)
      } else if (key === 'currency') {
        result[key] = value; // Keep backend format (e.g., USD)
      } else if (key === 'position') {
        result[key] = value; // Keep backend format (e.g., Director)
      } else if (key === 'features' && Array.isArray(value)) {
        result[key] = value; // Keep backend format
      } else if (key === 'role') {
        result[key] = value; // Keep backend format (TeamRole)
      } else if (key === 'status') {
        // Assuming status refers to Campaign Status (DRAFT, etc.)
        result[key] = value; // Keep backend format
      } else if (key === 'userRole') {
        result[key] = value; // Keep backend format (UserRole)
      } else if (value instanceof Date) {
        // Keep Date objects as Date objects
        result[key] = value; // KEEP as Date object
      } else if (typeof value === 'object') {
        result[key] = this.transformObjectFromBackend(value);
      } else {
        result[key] = value;
      }
    }
    return result;
  },
};
/**
 * Formats enum values for display in the UI
 * Converts UPPERCASE_SNAKE_CASE to Title Case Words
 */
var formatEnumForDisplay = function (value) {
  if (!value) return '';
  // If it's an UPPERCASE_SNAKE_CASE value
  if (value === value.toUpperCase() && value.includes('_')) {
    // Convert to Title Case Words
    return value
      .toLowerCase()
      .split('_')
      .map(function (word) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(' ');
  }
  // If it's already in a display format, return as is
  return value;
};
exports.formatEnumForDisplay = formatEnumForDisplay;
