# Database Schema Update Plan

## Executive Summary

This document outlines a comprehensive plan to address critical validation errors in the frontend caused by mismatches between frontend data formats and the updated database schema. The primary issue stems from enum value format differences between frontend (camelCase) and backend (UPPERCASE_SNAKE_CASE). The implementation plan focuses on creating centralized enum transformation utilities and updating key components to use these utilities for proper data transformation between frontend and backend.

## Table of Contents

- [File Directory](#file-directory)
- [Problem Overview](#problem-overview)
- [Root Causes](#root-causes)
- [Affected Components](#affected-components)
- [Task Dependencies](#task-dependencies)
- [Implementation Plan](#implementation-plan)
  - [A. Create Central Enum Transformation Utilities](#a-create-central-enum-transformation-utilities)
  - [B. Update Form Submission Functions](#b-update-form-submission-functions)
  - [C. Update API Route Handlers](#c-update-api-route-handlers)
  - [D. Update Data Fetching Components](#d-update-data-fetching-components)
  - [E. Update Brand Lift Service](#e-update-brand-lift-service)
  - [F. Update Settings Components](#f-update-settings-components)
- [Testing Strategy](#testing-strategy)
- [Common Issues and Troubleshooting](#common-issues-and-troubleshooting)
- [Debugging and Logging Strategy](#debugging-and-logging-strategy)
- [Implementation Checklist](#implementation-checklist)
- [Rollback Plan](#rollback-plan)
- [Conclusion](#conclusion)

## File Directory

```
src/
├── app/
│   ├── api/
│   │   ├── campaigns/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       ├── submit/
│   │   │       │   └── route.ts
│   │   │       └── wizard/
│   │   │           └── [step]/
│   │   │               └── route.ts
│   │   ├── settings/
│   │   │   ├── branding/
│   │   │   │   └── route.ts
│   │   │   └── team/
│   │   │       ├── route.ts
│   │   │       ├── invitation/
│   │   │       │   └── [id]/
│   │   │       │       ├── route.ts
│   │   │       │       └── resend/
│   │   │       │           └── route.ts
│   │   │       └── verify-invitation/
│   │   │           └── route.ts
│   │   └── wizard/
│   │       └── campaign.ts
│   ├── campaigns/
│   │   ├── page.tsx
│   │   ├── [id]/
│   │   │   └── page.tsx
│   │   └── wizard/
│   │       ├── step-1/
│   │       │   └── Step1Content.tsx
│   │       ├── step-2/
│   │       │   └── Step2Content.tsx
│   │       ├── step-3/
│   │       │   └── Step3Content.tsx
│   │       ├── step-4/
│   │       │   └── Step4Content.tsx
│   │       ├── step-5/
│   │       │   └── Step5Content.tsx
│   │       └── submission/
│   │           └── SubmissionContent.tsx
│   ├── dashboard/
│   │   └── DashboardContent.tsx
│   └── settings/
│       ├── branding/
│       │   └── page.tsx
│       └── team-management/
│           ├── dashboard.tsx
│           └── page.tsx
├── components/
│   └── Brand-Lift/
│       ├── SelectedCampaignContent.tsx
│       └── SurveyDesignContent.tsx
├── services/
│   └── brandLiftService.ts
├── types/
│   └── brandLift.ts
└── utils/
    ├── form-adapters.ts
    ├── form-transformers.ts
    └── enum-transformers.ts (new file to create)
```

## Problem Overview

The Campaign Wizard frontend is failing with validation errors due to mismatches between the frontend data format and the updated database schema. The main errors occur during form submission, with error messages like:

1. "Validation failed" when submitting forms
2. "Invalid data format received from server" when loading campaigns
3. "Failed to save draft" when attempting to save a draft
4. "Invalid invitation status format" when working with team members
5. "User role validation failed" in settings components

## Root Causes

1. **Enum Value Format Mismatches**:
   - Frontend: Using camelCase values (e.g., `brandAwareness`, `adRecall`)
   - Backend: Using UPPERCASE_SNAKE_CASE values (e.g., `BRAND_AWARENESS`, `AD_RECALL`)
   - This affects KPI, Platform, Feature, Currency, Position, TeamRole, and InvitationStatus enums across multiple components

2. **API Response Format Issues**:
   - Backend returning data in a structure different from what frontend expects
   - API routes returning `campaigns` directly while frontend expects `data.campaigns`

3. **Form Data Structure Misalignment**:
   - Form values not being properly transformed to match database schema
   - Missing transformation logic in form submission functions

4. **Validation Schema Discrepancies**:
   - Zod schemas in API routes not aligned with updated enum values
   - Validation failures occurring due to case mismatches

## Affected Components

Based on thorough code analysis, these components require updates:

1. **Wizard Step Components**:
   - `src/app/campaigns/wizard/step-1/Step1Content.tsx`
   - `src/app/campaigns/wizard/step-2/Step2Content.tsx`
   - `src/app/campaigns/wizard/step-3/Step3Content.tsx`
   - `src/app/campaigns/wizard/step-4/Step4Content.tsx`
   - `src/app/campaigns/wizard/step-5/Step5Content.tsx` - Final review step
   - `src/app/campaigns/wizard/submission/SubmissionContent.tsx` - Submission confirmation

2. **Brand Lift Components**:
   - `src/components/Brand-Lift/SelectedCampaignContent.tsx`
   - `src/components/Brand-Lift/SurveyDesignContent.tsx`
   - `src/services/brandLiftService.ts`
   - `src/types/brandLift.ts`

3. **API Routes**:
   - `src/app/api/campaigns/route.ts`
   - `src/app/api/wizard/campaign.ts`
   - `src/app/api/campaigns/[id]/submit/route.ts`
   - `src/app/api/campaigns/[id]/wizard/[step]/route.ts`

4. **Dashboard Components**:
   - `src/app/campaigns/page.tsx`
   - `src/app/campaigns/[id]/page.tsx`
   - `src/app/dashboard/DashboardContent.tsx`

5. **Settings Components**:
   - `src/app/settings/team-management/dashboard.tsx`
   - `src/app/settings/team-management/page.tsx`
   - `src/app/settings/branding/page.tsx`
   - `src/app/api/settings/team/route.ts`
   - `src/app/api/settings/team/invitation/[id]/route.ts`
   - `src/app/api/settings/team/invitation/[id]/resend/route.ts`
   - `src/app/api/settings/team/verify-invitation/route.ts`
   - `src/app/api/settings/branding/route.ts`

6. **Data Transformation Utilities**:
   - `src/utils/form-adapters.ts`
   - `src/utils/form-transformers.ts`
   - Need to create `src/utils/enum-transformers.ts`

## Task Dependencies

This section outlines the order in which tasks must be completed. Many components depend on the core transformation utilities.

**Critical Path Dependencies:**
1. Create `enum-transformers.ts` utility **(A1)** - This is the foundation that all other changes depend on
2. Update Zod validation schemas **(C3)** - Must be completed before testing API endpoints
3. Update form submission functions **(B1-B8)** - Depends on enum-transformers.ts
4. Update API route handlers **(C1-C6)** - Depends on updated validation schemas

**Parallel Tasks:**
- Unit tests for enum-transformers **(T1)** can be done in parallel with other tasks
- Dashboard component updates **(D1-D3)** can be done after enum transformers are ready
- Settings components **(F1-F5)** can be updated independently after enum transformers are ready

**Verification Points:**
- After completing the enum-transformers.ts utility, verify it with unit tests before proceeding
- After updating the form submission functions, test each form individually before moving to the next
- After updating API routes, verify each endpoint returns the expected format

## Implementation Plan

### A. Create Central Enum Transformation Utilities

**Task A1:** Create `src/utils/enum-transformers.ts` with the following features:

```typescript
// src/utils/enum-transformers.ts

import { KPI, Platform, Currency, Position, Feature, TeamRole, InvitationStatus, UserRole } from '@prisma/client';

export const EnumTransformers = {
  // KPI transformers
  kpiToBackend(value: string): KPI {
    const mapping: Record<string, KPI> = {
      'adRecall': 'AD_RECALL' as KPI,
      'brandAwareness': 'BRAND_AWARENESS' as KPI,
      'consideration': 'CONSIDERATION' as KPI,
      'messageAssociation': 'MESSAGE_ASSOCIATION' as KPI,
      'brandPreference': 'BRAND_PREFERENCE' as KPI,
      'purchaseIntent': 'PURCHASE_INTENT' as KPI,
      'actionIntent': 'ACTION_INTENT' as KPI,
      'recommendationIntent': 'RECOMMENDATION_INTENT' as KPI,
      'advocacy': 'ADVOCACY' as KPI
    };
    
    // Add debug logging in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`kpiToBackend: ${value} → ${mapping[value] || value}`);
    }
    
    return mapping[value] || value as KPI;
  },
  
  kpiFromBackend(value: KPI): string {
    const mapping: Record<string, string> = {
      'AD_RECALL': 'adRecall',
      'BRAND_AWARENESS': 'brandAwareness',
      'CONSIDERATION': 'consideration',
      'MESSAGE_ASSOCIATION': 'messageAssociation',
      'BRAND_PREFERENCE': 'brandPreference',
      'PURCHASE_INTENT': 'purchaseIntent',
      'ACTION_INTENT': 'actionIntent',
      'RECOMMENDATION_INTENT': 'recommendationIntent',
      'ADVOCACY': 'advocacy'
    };
    
    // Add debug logging in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`kpiFromBackend: ${value} → ${mapping[value] || value.toLowerCase()}`);
    }
    
    return mapping[value] || value.toLowerCase();
  },
  
  // Platform transformers
  platformToBackend(value: string): Platform {
    const mapping: Record<string, Platform> = {
      'Instagram': 'INSTAGRAM' as Platform,
      'YouTube': 'YOUTUBE' as Platform,
      'TikTok': 'TIKTOK' as Platform
    };
    return mapping[value] || value as Platform;
  },
  
  platformFromBackend(value: Platform): string {
    const mapping: Record<string, string> = {
      'INSTAGRAM': 'Instagram',
      'YOUTUBE': 'YouTube',
      'TIKTOK': 'TikTok'
    };
    return mapping[value] || value;
  },
  
  // Currency transformers
  currencyToBackend(value: string): Currency {
    return value.toUpperCase() as Currency;
  },
  
  currencyFromBackend(value: Currency): string {
    return value;
  },
  
  // Position transformers
  positionToBackend(value: string): Position {
    const mapping: Record<string, Position> = {
      'Manager': 'Manager' as Position,
      'Director': 'Director' as Position,
      'VP': 'VP' as Position
    };
    return mapping[value] || value as Position;
  },
  
  positionFromBackend(value: Position): string {
    return value; // Position format is the same in frontend and backend
  },
  
  // Feature transformers
  featureToBackend(value: string): Feature {
    const mapping: Record<string, Feature> = {
      'CREATIVE_ASSET_TESTING': 'CREATIVE_ASSET_TESTING' as Feature,
      'BRAND_LIFT': 'BRAND_LIFT' as Feature,
      'BRAND_HEALTH': 'BRAND_HEALTH' as Feature,
      'MIXED_MEDIA_MODELLING': 'MIXED_MEDIA_MODELING' as Feature
    };
    return mapping[value] || value as Feature;
  },
  
  featureFromBackend(value: Feature): string {
    const mapping: Record<string, string> = {
      'CREATIVE_ASSET_TESTING': 'CREATIVE_ASSET_TESTING',
      'BRAND_LIFT': 'BRAND_LIFT',
      'BRAND_HEALTH': 'BRAND_HEALTH',
      'MIXED_MEDIA_MODELING': 'MIXED_MEDIA_MODELLING'
    };
    return mapping[value] || value;
  },
  
  // TeamRole transformers
  teamRoleToBackend(value: string): TeamRole {
    return value as TeamRole; // Both use UPPERCASE format
  },
  
  teamRoleFromBackend(value: TeamRole): string {
    return value; // Both use UPPERCASE format
  },
  
  // InvitationStatus transformers
  invitationStatusToBackend(value: string): InvitationStatus {
    return value as InvitationStatus; // Both use UPPERCASE format
  },
  
  invitationStatusFromBackend(value: InvitationStatus): string {
    return value; // Both use UPPERCASE format, but display with first letter capitalized and rest lowercase
  },
  
  // UserRole transformers
  userRoleToBackend(value: string): UserRole {
    return value as UserRole; // Both use UPPERCASE format
  },
  
  userRoleFromBackend(value: UserRole): string {
    return value; // Both use UPPERCASE format
  },
  
  // Recursive object transformation utility
  transformObjectToBackend(obj: any): any {
    if (!obj) return obj;
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.transformObjectToBackend(item));
    }
    
    if (typeof obj !== 'object') return obj;
    
    const result: any = {};
    
    for (const [key, value] of Object.entries(obj)) {
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
      } else if (typeof value === 'object') {
        result[key] = this.transformObjectToBackend(value);
      } else {
        result[key] = value;
      }
    }
    
    return result;
  },
  
  transformObjectFromBackend(obj: any): any {
    if (!obj) return obj;
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.transformObjectFromBackend(item));
    }
    
    if (typeof obj !== 'object') return obj;
    
    const result: any = {};
    
    for (const [key, value] of Object.entries(obj)) {
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
      } else if (typeof value === 'object') {
        result[key] = this.transformObjectFromBackend(value);
      } else {
        result[key] = value;
      }
    }
    
    return result;
  }
};
```

**Verification Step:** After creating this file, create a simple test script to verify all transformation functions work as expected.

### B. Update Form Submission Functions

**Task B1:** Update `src/app/campaigns/wizard/step-1/Step1Content.tsx` handleSubmit function:

```typescript
// src/app/campaigns/wizard/step-1/Step1Content.tsx

import { EnumTransformers } from '@/utils/enum-transformers';

// ...

const handleSubmit = async (values: FormValues) => {
  setSubmitting(true);
  debugFormData(values, false);

  try {
    // Format the values for API submission
    const formattedValues = {
      name: values.name,
      businessGoal: values.businessGoal,
      startDate: values.startDate,
      endDate: values.endDate,
      timeZone: values.timeZone,
      primaryContact: values.primaryContact,
      secondaryContact: values.secondaryContact,
      currency: EnumTransformers.currencyToBackend(values.currency),
      totalBudget: parseFloat(values.totalBudget.toString()),
      socialMediaBudget: parseFloat(values.socialMediaBudget.toString()),
      platform: values.influencers && values.influencers.length > 0 ? 
        EnumTransformers.platformToBackend(values.influencers[0].platform) : 
        'INSTAGRAM',
      influencerHandle: values.influencers && values.influencers.length > 0 ? 
        values.influencers[0].handle : '',
    };
    
    console.log('Transformed values for API submission:', formattedValues);

    const method = isEditing ? 'PATCH' : 'POST';
    const url = isEditing ? `/api/campaigns/${campaignId}` : '/api/campaigns';
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...formattedValues,
        exchangeRateData,
        status: 'draft'
      }),
    });

    // Rest of the function...
  }
  // ...
};
```

**Verification Step:** Test this function by submitting the Step 1 form and check the Network tab in browser DevTools to verify the data format being sent matches what the backend expects.

**Task B2:** Update `src/app/campaigns/wizard/step-1/Step1Content.tsx` handleSaveDraft function:

```typescript
// src/app/campaigns/wizard/step-1/Step1Content.tsx

const handleSaveDraft = async (values: FormValues) => {
  try {
    setIsSubmitting(true);
    setError(null);
    
    // Transform enum values to match backend format
    const formattedValues = {
      ...values,
      currency: EnumTransformers.currencyToBackend(values.currency),
      influencers: values.influencers.map(influencer => ({
        ...influencer,
        platform: EnumTransformers.platformToBackend(influencer.platform)
      })),
      // Transform contact positions if needed
      primaryContact: values.primaryContact ? {
        ...values.primaryContact,
        position: EnumTransformers.positionToBackend(values.primaryContact.position)
      } : values.primaryContact,
      secondaryContact: values.secondaryContact ? {
        ...values.secondaryContact,
        position: EnumTransformers.positionToBackend(values.secondaryContact.position)
      } : values.secondaryContact,
      status: 'draft'
    };
    
    console.log('Saving draft with formatted values:', formattedValues);

    const method = isEditing ? 'PATCH' : 'POST';
    const url = isEditing ? `/api/campaigns/${campaignId}` : '/api/campaigns';

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...formattedValues,
        step: 1
      }),
    });

    // Rest of the function...
  }
  // ...
};
```

**Task B3:** Update `src/app/campaigns/wizard/step-2/Step2Content.tsx` handleSubmit function:

```typescript
// src/app/campaigns/wizard/step-2/Step2Content.tsx

import { EnumTransformers } from '@/utils/enum-transformers';

// ...

const handleSubmit = async (values: any) => {
  setSubmitting(true);
  
  try {
    // Transform KPIs and features to match backend format
    const formattedValues = {
      ...values,
      primaryKPI: EnumTransformers.kpiToBackend(values.primaryKPI),
      secondaryKPIs: values.secondaryKPIs?.map((kpi: string) => 
        EnumTransformers.kpiToBackend(kpi)
      ) || [],
      features: values.features?.map((feature: string) => 
        EnumTransformers.featureToBackend(feature)
      ) || [],
    };
    
    console.log('Submitting objectives with formatted values:', formattedValues);
    
    const response = await fetch(`/api/campaigns/${campaignId}/wizard/2`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formattedValues),
    });
    
    // Rest of the function...
  }
  // ...
};
```

**Task B4:** Update `src/app/campaigns/wizard/step-3/Step3Content.tsx` and `src/app/campaigns/wizard/step-4/Step4Content.tsx` following the same pattern for any form submissions that handle enum values.

**Task B5:** Update Brand Lift form components to handle enum transformations:

```typescript
// src/components/Brand-Lift/SelectedCampaignContent.tsx

import { EnumTransformers } from '@/utils/enum-transformers';

// When handling KPIs:
const getKpiByKey = (key: string | undefined) => {
  if (!key) return undefined;
  
  // Try to find by direct key match
  let kpiMatch = kpis.find(kpi => kpi.key === key);
  
  // If not found and it might be a backend format (contains underscores),
  // try converting it to frontend format first
  if (!kpiMatch && key.includes('_')) {
    const frontendKey = EnumTransformers.kpiFromBackend(key as KPI);
    kpiMatch = kpis.find(kpi => kpi.key === frontendKey);
  }
  
  return kpiMatch;
};
```

**Task B6:** Update `src/components/Brand-Lift/SurveyDesignContent.tsx` to use the enum transformers for any form submissions.

**Task B7:** Update `src/app/campaigns/wizard/step-5/Step5Content.tsx` to transform data for display and submission:

```typescript
// src/app/campaigns/wizard/step-5/Step5Content.tsx

import { EnumTransformers } from '@/utils/enum-transformers';

// When fetching campaign data
const fetchCampaignData = async () => {
  try {
    // ...existing fetch code
    
    if (data.campaign || data.data) {
      const campaignData = data.campaign || data.data;
      
      // Transform the fetched data for display
      const transformedData = EnumTransformers.transformObjectFromBackend(campaignData);
      
      setDisplayData(transformedData);
    }
    // ...rest of the function
  } catch (error) {
    // Error handling
  }
};

// When submitting the campaign
const handleSubmit = async () => {
  try {
    setIsSubmitting(true);
    const response = await fetch(`/api/campaigns/${campaignId}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // If there's any data in the request body that contains enums, transform it
      // body: JSON.stringify(EnumTransformers.transformObjectToBackend(requestData)),
    });
    
    // ...rest of the function
  } catch (error) {
    // Error handling
  }
};

// When saving as draft
const handleSaveDraft = async () => {
  try {
    // ...existing code
    
    // If there's any data that contains enums being sent, transform it
    const requestBody = {
      submissionStatus: 'draft'
      // Add any other fields that need to be sent
    };
    
    // Send the request
    const response = await fetch(`/api/campaigns/${campaignId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    // ...rest of the function
  } catch (error) {
    // Error handling
  }
};
```

**Task B8:** Update `src/app/campaigns/wizard/submission/SubmissionContent.tsx` to transform fetched data:

```typescript
// src/app/campaigns/wizard/submission/SubmissionContent.tsx

import { EnumTransformers } from '@/utils/enum-transformers';

// When fetching campaign data
const fetchCampaign = async () => {
  if (!campaignId) {
    setError('No campaign ID provided');
    setLoading(false);
    return;
  }

  try {
    const response = await fetch(`/api/campaigns?id=${campaignId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch campaign: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("API Response:", data);

    let campaignData;
    if (data.campaign) {
      campaignData = data.campaign;
    } else if (data.data) {
      campaignData = data.data;
    } else {
      campaignData = data;
    }
    
    // Transform the campaign data for proper display
    const transformedCampaign = EnumTransformers.transformObjectFromBackend(campaignData);
    setCampaign(transformedCampaign);
    
  } catch (err) {
    console.error("Error fetching campaign:", err);
    setError('Failed to load campaign data');
  } finally {
    setLoading(false);
  }
};
```

### C. Update API Route Handlers

**Task C1:** Update `src/app/api/campaigns/route.ts` GET handler:

```typescript
// src/app/api/campaigns/route.ts

// GET handler - List campaigns
export async function GET(request: NextRequest) {
  return tryCatch(
    async () => {
      const campaigns = await prisma.campaignWizard.findMany({
        orderBy: {
          updatedAt: 'desc'
        },
        take: 100
      });
      
      // Change response format to match what frontend expects
      return NextResponse.json({
        success: true,
        campaigns: campaigns // This matches what frontend expects
      });
    },
    { entityName: 'Campaign', operation: DbOperation.FETCH }
  );
}
```

**Task C2:** Update `src/app/api/campaigns/route.ts` POST handler:

```typescript
// src/app/api/campaigns/route.ts

// POST handler - Create campaign
export async function POST(request: NextRequest) {
  return tryCatch(
    async () => {
      const body = await request.json();
      
      // Log the request body for debugging
      console.log('Create campaign request body:', body);
      
      try {
        // Validate the request
        const validatedData = campaignCreateSchema.parse(body);
        
        // Additional processing and database operations...
        
        return NextResponse.json({
          success: true,
          id: campaign.id
        });
      } catch (error) {
        // Detailed validation error logging
        if (error instanceof z.ZodError) {
          console.error('Validation error details:', JSON.stringify(error.errors, null, 2));
        }
        throw error;
      }
    },
    { entityName: 'Campaign', operation: DbOperation.CREATE }
  );
}
```

**Task C3:** Update Zod validation schemas in all API route files:

```typescript
// Update schemas in src/app/api/campaigns/route.ts

// Update the influencerSchema
const influencerSchema = z.object({
  name: z.string().optional().default(''),
  handle: z.string().min(1, "Handle is required"),
  platform: z.enum(['INSTAGRAM', 'YOUTUBE', 'TIKTOK']).default('INSTAGRAM'),
  // ...
});

// Update currency validation
const budgetSchema = z.object({
  // ...
  currency: z.enum(['GBP', 'USD', 'EUR']).default('USD'),
  // ...
});

// Update KPI and Feature schemas
const campaignSubmitSchema = z.object({
  // ...
  primaryKPI: z.enum([
    'AD_RECALL', 'BRAND_AWARENESS', 'CONSIDERATION', 'MESSAGE_ASSOCIATION',
    'BRAND_PREFERENCE', 'PURCHASE_INTENT', 'ACTION_INTENT', 
    'RECOMMENDATION_INTENT', 'ADVOCACY'
  ]).default('BRAND_AWARENESS'),
  
  secondaryKPIs: z.array(z.enum([
    'AD_RECALL', 'BRAND_AWARENESS', 'CONSIDERATION', 'MESSAGE_ASSOCIATION',
    'BRAND_PREFERENCE', 'PURCHASE_INTENT', 'ACTION_INTENT',
    'RECOMMENDATION_INTENT', 'ADVOCACY'
  ])).optional().default([]),
  
  features: z.array(z.enum([
    'CREATIVE_ASSET_TESTING', 'BRAND_LIFT', 'BRAND_HEALTH', 'MIXED_MEDIA_MODELING'
  ])).optional().default([]),
  // ...
});
```

**Task C4:** Update `src/app/api/wizard/campaign.ts` to handle enum transformations.

**Task C5:** Update `src/app/api/campaigns/[id]/submit/route.ts` to handle enum transformations.

**Task C6:** Update `src/app/api/campaigns/[id]/wizard/[step]/route.ts` to handle enum transformations.

### D. Update Data Fetching Components

**Task D1:** Update `src/app/campaigns/page.tsx` to transform fetched data:

```typescript
// src/app/campaigns/page.tsx

import { EnumTransformers } from '@/utils/enum-transformers';

useEffect(() => {
  const fetchCampaigns = async () => {
    try {
      // ...
      const response = await fetch('/api/campaigns');
      const data = await response.json();
      
      // Add logging to debug response format
      console.log('API Response:', data);
      
      // Support both response formats and transform enum values
      if (data.success && (Array.isArray(data.campaigns) || Array.isArray(data.data))) {
        const campaignsData = data.campaigns || data.data;
        
        // Transform enum values to frontend format for all campaigns
        const transformedCampaigns = campaignsData.map((campaign: any) => 
          EnumTransformers.transformObjectFromBackend(campaign)
        );
        
        setCampaigns(transformedCampaigns);
      } else {
        throw new Error('Invalid data format received from server');
      }
    } catch (error) {
      // ...
    }
  };
  // ...
});
```

**Task D2:** Update `src/app/campaigns/[id]/page.tsx` to transform fetched data:

```typescript
// src/app/campaigns/[id]/page.tsx

import { EnumTransformers } from '@/utils/enum-transformers';

// When fetching campaign data:
const fetchCampaignData = async () => {
  try {
    const response = await fetch(`/api/campaigns/${id}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch campaign');
    }
    
    // Transform enum values from backend format to frontend format
    const transformedData = EnumTransformers.transformObjectFromBackend(data);
    
    setCampaignData(transformedData);
  } catch (error) {
    console.error('Error fetching campaign:', error);
    setError(error instanceof Error ? error.message : 'Failed to load campaign');
  } finally {
    setLoading(false);
  }
};
```

**Task D3:** Update `src/app/dashboard/DashboardContent.tsx` to handle enum display:

```typescript
// src/app/dashboard/DashboardContent.tsx

import { EnumTransformers } from '@/utils/enum-transformers';

// When displaying KPI information:
const getKpiDisplayInfo = (kpi: string) => {
  // Handle both frontend and backend KPI formats
  const normalizedKpi = kpi.includes('_') 
    ? EnumTransformers.kpiFromBackend(kpi as KPI)
    : kpi;
  
  // Map to display information
  return kpiDisplayMap[normalizedKpi] || {
    title: normalizedKpi,
    description: 'No description available',
    color: 'bg-gray-500'
  };
};
```

### E. Update Brand Lift Service

**Task E1:** Update `src/services/brandLiftService.ts` to handle KPI formats:

```typescript
// src/services/brandLiftService.ts

import { EnumTransformers } from '@/utils/enum-transformers';

private generateQuestionsFromKPIs(primaryKPI: KPI, secondaryKPIs: KPI[] = [], brandName: string): SurveyPreviewData['questions'] {
  const questions: SurveyPreviewData['questions'] = [];
  const processedKPIs = new Set<string>();
  
  // Combine all KPIs, ensuring primary is first
  const allKPIs = [primaryKPI, ...secondaryKPIs];
  
  allKPIs.forEach(kpi => {
    if (processedKPIs.has(kpi)) return;
    processedKPIs.add(kpi);
    
    // Normalize KPI to frontend format if it's in backend format
    const normalizedKpi = kpi.includes('_') 
      ? EnumTransformers.kpiFromBackend(kpi)
      : kpi;
    
    // Generate questions based on normalized KPI...
    
    // Rest of the function...
  });
}
```

**Task E2:** Update `src/types/brandLift.ts` to include the new enum format types if needed.

### F. Update Settings Components

**Task F1:** Update `src/app/settings/team-management/page.tsx` to handle enum transformations:

```typescript
// src/app/settings/team-management/page.tsx

import { EnumTransformers } from '@/utils/enum-transformers';

// When inviting a new team member
const handleInvite = async (event: React.FormEvent) => {
  event.preventDefault();
  setIsInviting(true);
  setAddMemberError('');
  
  try {
    // Transform role to backend format
    const formattedRole = EnumTransformers.teamRoleToBackend(role);
    
    const response = await fetch('/api/settings/team', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        role: formattedRole
      }),
    });
    
    // ...rest of function
  } catch (error) {
    // Error handling
  } finally {
    setIsInviting(false);
  }
};

// When fetching team members and invitations
const fetchTeamData = async () => {
  try {
    // ...fetch logic
    
    // Transform team member roles and invitation statuses
    const transformedMembers = data.members.map((member: any) => ({
      ...member,
      role: member.role // Already in correct format, but for consistency
    }));
    
    const transformedInvitations = data.invitations.map((invitation: any) => ({
      ...invitation,
      // For display purposes, keep the UPPERCASE but format for UI when displaying
    }));
    
    setTeamMembers(transformedMembers);
    setInvitations(transformedInvitations);
  } catch (error) {
    // Error handling
  }
};
```

**Task F2:** Update `src/app/settings/team-management/dashboard.tsx` for enum displays:

```typescript
// src/app/settings/team-management/dashboard.tsx

// Update role and status display formatting
<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
  {/* Format role for display (e.g., "MEMBER" -> "Member") */}
  {invitation.role.charAt(0) + invitation.role.slice(1).toLowerCase()}
</td>
<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
    invitation.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
    invitation.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
    'bg-red-100 text-red-800'
  }`}>
    {/* Format status for display (e.g., "PENDING" -> "Pending") */}
    {invitation.status.charAt(0) + invitation.status.slice(1).toLowerCase()}
  </span>
</td>
```

**Task F3:** Update `src/app/api/settings/team/route.ts` to handle enum transformations:

```typescript
// src/app/api/settings/team/route.ts

// No transformation needed as both frontend and backend use the same format
// for TeamRole and InvitationStatus (UPPERCASE)

// Just ensure API returns data in consistent format
export async function GET(request: Request) {
  try {
    // Existing code...
    
    return NextResponse.json({
      success: true,
      members,
      invitations
    });
  } catch (error) {
    // Error handling
  }
}
```

**Task F4:** Update invitation handling API routes:

```typescript
// src/app/api/settings/team/invitation/[id]/route.ts
// src/app/api/settings/team/invitation/[id]/resend/route.ts
// src/app/api/settings/team/verify-invitation/route.ts

// No transformation needed as both frontend and backend use the same format
// for InvitationStatus (UPPERCASE)

// Just ensure API returns data in consistent format
return NextResponse.json({ 
  success: true, 
  data: invitationData
});
```

**Task F5:** Update branding settings if needed:

```typescript
// src/app/settings/branding/page.tsx

// This component doesn't use any enums directly
// Just ensure it properly handles API responses
```

## Testing Strategy

### Unit Testing

**Task T1:** Create unit tests for `enum-transformers.ts`:
- Test each individual transformer function (kpiToBackend, kpiFromBackend, etc.)
- Test recursive object transformation with various object structures
- Test edge cases like null/undefined values, missing mappings
- Test the new transformers for TeamRole, InvitationStatus, and UserRole

**Task T2:** Create unit tests for form submission functions:
- Test with various input formats
- Verify output matches expected backend format

### Integration Testing

**Task T3:** Test the campaign creation flow:
- Verify Step 1 form validation and submission
- Verify Step 2 KPI and Feature selection transformations
- Verify Step 3 and Step 4 data handling
- Ensure draft saving works with transformed values

**Task T4:** Test the campaign listing and details views:
- Verify campaigns load correctly with transformed enum values
- Verify detailed campaign view displays correct enum values

**Task T5:** Test Brand Lift functionality:
- Verify survey generation works with both frontend and backend KPI formats
- Test KPI display and selection components

**Task T7:** Test Settings functionality:
- Verify team management invitations work correctly
- Test role updates and transformations
- Test invitation status handling and display

### API Testing

**Task T6:** Test all API endpoints:
- Verify validation schemas accept proper enum formats
- Test error handling for invalid enum values
- Verify response format matches frontend expectations
- Include settings API routes in testing

## Common Issues and Troubleshooting

This section addresses common issues you might encounter during implementation and how to resolve them.

### 1. Validation Errors Despite Updated Code

**Problem:** Validation errors persist even after implementing the transformers.

**Troubleshooting Steps:**
1. Check browser console for detailed error messages
2. Verify that the transformed data structure matches exactly what the API expects:
   ```javascript
   // Add this before API calls
   console.log('API Request Body:', JSON.stringify(formattedValues, null, 2));
   ```
3. Check for missing imports of the EnumTransformers utility
4. Verify that enum values match exactly (check for typos or case sensitivity)

**Solution:**
- If the transformation is correct but validation still fails, check the API route's validation schema
- Ensure Zod schemas in the API route are updated to accept the new enum formats

### 2. Form Submissions Failing

**Problem:** Form submissions fail with HTTP 400 errors.

**Troubleshooting Steps:**
1. Check Network tab in browser DevTools to see the exact request payload
2. Compare with the API route handler's expected structure
3. Look for any fields that might be missing or have incorrect types

**Solution:**
- Add console.log statements in both frontend and backend to track data flow
- Check for nested object transformations that might be missed
- Verify that arrays of enum values (like secondaryKPIs) are properly transformed

### 3. Display Issues with Transformed Data

**Problem:** Data displays incorrectly after fetching from the API.

**Troubleshooting Steps:**
1. Check the raw response from the API
2. Verify transformFromBackend logic is applied to the response data
3. Check for missing transformations in display components

**Solution:**
- Add transformation to the data fetching logic
- Update display components to handle both formats temporarily during transition

### 4. Settings Component Issues

**Problem:** Team management or invitations not working correctly.

**Troubleshooting Steps:**
1. Check the casing of role and status values
2. Verify the display formatting logic for team roles and invitation statuses
3. Check API request/response formats

**Solution:**
- Add specific transforms for settings-related enums
- Update display formatting to handle both uppercase and transformed display formats

### 5. Circular Dependencies

**Problem:** Imports creating circular dependencies between files.

**Troubleshooting:**
1. Check import statements for circular patterns
2. Look for console errors about circular dependencies

**Solution:**
- Move common types to a shared types file
- Restructure imports to prevent cycles
- Consider using context API for sharing transformation functions

## Implementation Checklist

### Phase 0: Preparation (Priority: CRITICAL)
- [ ] Create feature branch for implementation
- [ ] Review Prisma schema to confirm all enum definitions
- [ ] Document current API request/response formats for reference
- [ ] Set up basic logging to capture before/after states of data

### Phase 1: Core Utilities and Form Components (Priority: HIGH)
- [ ] **A1:** Create enum-transformers.ts utility file
- [ ] **T1:** Write unit tests for enum-transformers.ts
- [ ] **B1:** Update Step1Content.tsx handleSubmit function
- [ ] **B2:** Update Step1Content.tsx handleSaveDraft function
- [ ] **T2:** Test Step 1 form submission
- [ ] **Verification:** Confirm Step 1 form submission works end-to-end

### Phase 2: Wizard Step Components (Priority: HIGH)
- [ ] **B3:** Update Step2Content.tsx handleSubmit function
- [ ] **B4:** Update Step3Content.tsx and Step4Content.tsx
- [ ] **B7:** Update Step5Content.tsx for final review
- [ ] **B8:** Update SubmissionContent.tsx for confirmation
- [ ] **T3:** Test complete wizard flow through all steps
- [ ] **D1:** Add logging to wizard components
- [ ] **Verification:** Submit a test campaign through all wizard steps including final submission

### Phase 3: API Route Handlers (Priority: HIGH)
- [ ] **C1:** Update GET handler in campaigns/route.ts
- [ ] **C2:** Update POST handler in campaigns/route.ts
- [ ] **C3:** Update Zod validation schemas
- [ ] **C4:** Update wizard/campaign.ts API handler
- [ ] **C5:** Update submit route handler for final campaign submission
- [ ] **C6:** Update step route handler
- [ ] **T6:** Test all API endpoints
- [ ] **Verification:** Test API endpoints with Postman or browser DevTools

### Phase 4: Data Display Components (Priority: MEDIUM)
- [ ] **D1:** Update campaign listing component
- [ ] **D2:** Update campaign detail component
- [ ] **D3:** Update dashboard KPI display
- [ ] **T4:** Test campaign listing and details
- [ ] **Verification:** Check displayed campaign data matches expected format

### Phase 5: Brand Lift Components (Priority: MEDIUM)
- [ ] **B5:** Update SelectedCampaignContent.tsx
- [ ] **B6:** Update SurveyDesignContent.tsx
- [ ] **E1:** Update brandLiftService.ts
- [ ] **E2:** Update brandLift.ts types
- [ ] **T5:** Test Brand Lift functionality
- [ ] **Verification:** Complete a brand lift survey configuration

### Phase 6: Settings Components (Priority: MEDIUM)
- [ ] **F1:** Update team-management page.tsx
- [ ] **F2:** Update team-management dashboard.tsx
- [ ] **F3:** Update team API route handlers
- [ ] **F4:** Update invitation API route handlers
- [ ] **F5:** Update branding settings components if needed
- [ ] **T7:** Test settings functionality
- [ ] **Verification:** Create and manage team invitations

### Phase 7: Final Testing (Priority: HIGH)
- [ ] Comprehensive end-to-end testing of all workflows
- [ ] Regression testing on core functionality
- [ ] Performance validation
- [ ] Final code review

## Rollback Plan

### Code Management
- Create a dedicated feature branch for all changes
- Commit changes in logical units with clear descriptions
- Use pull requests with mandatory code review

### Pre-deployment Backup
- Create snapshot of current production code
- Document current schema and data structures
- Prepare quick-revert scripts

### Emergency Rollback Procedure
1. Immediately revert to previous version of the codebase
2. Deploy the backup version to production
3. Analyze failure points and create targeted fixes
4. Re-deploy with focused fixes after thorough testing

## Conclusion

This comprehensive plan addresses all identified issues with the Campaign Wizard frontend related to database schema changes. By implementing a central enum transformation utility and systematically updating all affected components, we'll ensure proper communication between the frontend and backend.

The implementation follows a phased approach to minimize risk, with clear priorities for each task. The most critical components (core utilities, form submission functions, and API handlers) are addressed first, followed by data display components and Brand Lift functionality.

By following this plan, we'll achieve a consistent, maintainable solution that resolves the current validation errors and provides a solid foundation for future development.
