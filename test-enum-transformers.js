/**
 * Simple Test Script for Enum Transformers
 */

// Manually create mock enums
const KPI = {
  AD_RECALL: 'AD_RECALL',
  BRAND_AWARENESS: 'BRAND_AWARENESS',
  CONSIDERATION: 'CONSIDERATION',
  MESSAGE_ASSOCIATION: 'MESSAGE_ASSOCIATION',
  BRAND_PREFERENCE: 'BRAND_PREFERENCE',
  PURCHASE_INTENT: 'PURCHASE_INTENT',
  ACTION_INTENT: 'ACTION_INTENT',
  RECOMMENDATION_INTENT: 'RECOMMENDATION_INTENT',
  ADVOCACY: 'ADVOCACY'
};

const Platform = {
  INSTAGRAM: 'INSTAGRAM',
  YOUTUBE: 'YOUTUBE',
  TIKTOK: 'TIKTOK'
};

// Create our transformers utility
const EnumTransformers = {
  // KPI transformers
  kpiToBackend(value) {
    const mapping = {
      'adRecall': KPI.AD_RECALL,
      'brandAwareness': KPI.BRAND_AWARENESS,
      'consideration': KPI.CONSIDERATION,
      'messageAssociation': KPI.MESSAGE_ASSOCIATION,
      'brandPreference': KPI.BRAND_PREFERENCE,
      'purchaseIntent': KPI.PURCHASE_INTENT,
      'actionIntent': KPI.ACTION_INTENT,
      'recommendationIntent': KPI.RECOMMENDATION_INTENT,
      'advocacy': KPI.ADVOCACY
    };
    
    console.log(`[EnumTransformer] kpiToBackend: ${value} → ${mapping[value] || value}`);
    return mapping[value] || value;
  },
  
  kpiFromBackend(value) {
    const mapping = {
      [KPI.AD_RECALL]: 'adRecall',
      [KPI.BRAND_AWARENESS]: 'brandAwareness',
      [KPI.CONSIDERATION]: 'consideration',
      [KPI.MESSAGE_ASSOCIATION]: 'messageAssociation',
      [KPI.BRAND_PREFERENCE]: 'brandPreference',
      [KPI.PURCHASE_INTENT]: 'purchaseIntent',
      [KPI.ACTION_INTENT]: 'actionIntent',
      [KPI.RECOMMENDATION_INTENT]: 'recommendationIntent',
      [KPI.ADVOCACY]: 'advocacy'
    };
    
    console.log(`[EnumTransformer] kpiFromBackend: ${value} → ${mapping[value] || value.toLowerCase()}`);
    return mapping[value] || (typeof value === 'string' ? value.toLowerCase() : value);
  },
  
  // Platform transformers
  platformToBackend(value) {
    const mapping = {
      'Instagram': Platform.INSTAGRAM,
      'YouTube': Platform.YOUTUBE,
      'TikTok': Platform.TIKTOK
    };

    console.log(`[EnumTransformer] platformToBackend: ${value} → ${mapping[value] || value}`);
    return mapping[value] || value;
  },
  
  platformFromBackend(value) {
    const mapping = {
      [Platform.INSTAGRAM]: 'Instagram',
      [Platform.YOUTUBE]: 'YouTube',
      [Platform.TIKTOK]: 'TikTok'
    };

    console.log(`[EnumTransformer] platformFromBackend: ${value} → ${mapping[value] || value}`);
    return mapping[value] || value;
  },
  
  // Recursive object transformation utility
  transformObjectToBackend(obj) {
    if (!obj) return obj;
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.transformObjectToBackend(item));
    }
    
    if (typeof obj !== 'object') return obj;
    
    const result = {};
    
    for (const [key, value] of Object.entries(obj)) {
      if (value === null || value === undefined) {
        result[key] = value;
        continue;
      }
      
      if (key === 'kpi' || key === 'primaryKPI') {
        result[key] = this.kpiToBackend(value);
      } else if (key === 'secondaryKPIs' && Array.isArray(value)) {
        result[key] = value.map(kpi => this.kpiToBackend(kpi));
      } else if (key === 'platform') {
        result[key] = this.platformToBackend(value);
      } else if (typeof value === 'object') {
        result[key] = this.transformObjectToBackend(value);
      } else {
        result[key] = value;
      }
    }
    
    return result;
  },
  
  transformObjectFromBackend(obj) {
    if (!obj) return obj;
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.transformObjectFromBackend(item));
    }
    
    if (typeof obj !== 'object') return obj;
    
    const result = {};
    
    for (const [key, value] of Object.entries(obj)) {
      if (value === null || value === undefined) {
        result[key] = value;
        continue;
      }
      
      if (key === 'kpi' || key === 'primaryKPI') {
        result[key] = this.kpiFromBackend(value);
      } else if (key === 'secondaryKPIs' && Array.isArray(value)) {
        result[key] = value.map(kpi => this.kpiFromBackend(kpi));
      } else if (key === 'platform') {
        result[key] = this.platformFromBackend(value);
      } else if (typeof value === 'object') {
        result[key] = this.transformObjectFromBackend(value);
      } else {
        result[key] = value;
      }
    }
    
    return result;
  }
};

// Format enum values for display
const formatEnumForDisplay = (value) => {
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

// Test KPI transformers
console.log('--- TESTING KPI TRANSFORMERS ---');
console.log('Frontend to Backend:');
const kpisToTest = ['adRecall', 'brandAwareness', 'consideration', 'messageAssociation', 'unknown'];
kpisToTest.forEach(kpi => {
  const backendKpi = EnumTransformers.kpiToBackend(kpi);
  console.log(`${kpi} => ${backendKpi}`);
});

console.log('\nBackend to Frontend:');
const backendKpisToTest = [KPI.AD_RECALL, KPI.BRAND_AWARENESS, KPI.CONSIDERATION, KPI.MESSAGE_ASSOCIATION, 'UNKNOWN_KPI'];
backendKpisToTest.forEach(kpi => {
  const frontendKpi = EnumTransformers.kpiFromBackend(kpi);
  console.log(`${kpi} => ${frontendKpi}`);
});

// Test Platform transformers
console.log('\n--- TESTING PLATFORM TRANSFORMERS ---');
console.log('Frontend to Backend:');
const platformsToTest = ['Instagram', 'YouTube', 'TikTok', 'Unknown'];
platformsToTest.forEach(platform => {
  const backendPlatform = EnumTransformers.platformToBackend(platform);
  console.log(`${platform} => ${backendPlatform}`);
});

console.log('\nBackend to Frontend:');
const backendPlatformsToTest = [Platform.INSTAGRAM, Platform.YOUTUBE, Platform.TIKTOK, 'UNKNOWN_PLATFORM'];
backendPlatformsToTest.forEach(platform => {
  const frontendPlatform = EnumTransformers.platformFromBackend(platform);
  console.log(`${platform} => ${frontendPlatform}`);
});

// Test recursive object transformation
console.log('\n--- TESTING RECURSIVE OBJECT TRANSFORMATION ---');
const testObject = {
  name: 'Test Campaign',
  primaryKPI: 'brandAwareness',
  secondaryKPIs: ['adRecall', 'consideration'],
  platform: 'Instagram',
  nestedObject: {
    primaryKPI: 'messageAssociation',
    platform: 'YouTube'
  },
  arrayOfObjects: [
    { kpi: 'adRecall', platform: 'TikTok' },
    { kpi: 'brandAwareness', platform: 'Instagram' }
  ]
};

console.log('Original Object:');
console.log(JSON.stringify(testObject, null, 2));

const transformedObject = EnumTransformers.transformObjectToBackend(testObject);
console.log('\nTransformed to Backend:');
console.log(JSON.stringify(transformedObject, null, 2));

const backToFrontend = EnumTransformers.transformObjectFromBackend(transformedObject);
console.log('\nTransformed Back to Frontend:');
console.log(JSON.stringify(backToFrontend, null, 2));

// Test formatEnumForDisplay utility
console.log('\n--- TESTING FORMAT ENUM FOR DISPLAY ---');
const displayTests = ['BRAND_AWARENESS', 'AD_RECALL', 'MIXED_MEDIA_MODELING', 'Regular Text'];
displayTests.forEach(value => {
  const displayValue = formatEnumForDisplay(value);
  console.log(`${value} => ${displayValue}`);
});

console.log('\n--- TEST COMPLETE ---'); 