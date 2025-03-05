# Prisma Schema Audit Summary

**Generated:** 3/5/2025, 12:54:53 PM

**Total Models:** 30

## Models Overview

| Model | Fields | Has Sample Data |
| ----- | ------ | --------------- |
| _originalClient | 0 | ❌ |
| _middlewares | 0 | ❌ |
| _extensions | 0 | ❌ |
| _previewFeatures | 0 | ❌ |
| _tracingHelper | 0 | ❌ |
| _runtimeDataModel | 0 | ❌ |
| _engineConfig | 0 | ❌ |
| _accelerateEngineConfig | 0 | ❌ |
| _engine | 0 | ❌ |
| _requestHandler | 0 | ❌ |
| _appliedParent | 0 | ❌ |
| campaignWizard | 0 | ✅ |
| influencer | 0 | ❌ |
| wizardHistory | 0 | ❌ |
| campaignWizardSubmission | 0 | ✅ |
| primaryContact | 0 | ✅ |
| secondaryContact | 0 | ✅ |
| audience | 0 | ✅ |
| audienceLocation | 0 | ✅ |
| audienceGender | 0 | ✅ |
| audienceScreeningQuestion | 0 | ✅ |
| audienceLanguage | 0 | ✅ |
| audienceCompetitor | 0 | ✅ |
| creativeAsset | 0 | ✅ |
| creativeRequirement | 0 | ✅ |
| user | 0 | ❌ |
| notificationPrefs | 0 | ❌ |
| teamMember | 0 | ❌ |
| teamInvitation | 0 | ❌ |
| brandingSettings | 0 | ❌ |

## Detailed Model Information

### _originalClient

### _middlewares

### _extensions

### _previewFeatures

### _tracingHelper

### _runtimeDataModel

### _engineConfig

### _accelerateEngineConfig

### _engine

### _requestHandler

### _appliedParent

### campaignWizard

#### Sample Record

```json
{
  "id": "914ce5b4-a623-4be2-b423-97944cf43884",
  "createdAt": "2025-03-05T12:21:45.339Z",
  "updatedAt": "2025-03-05T12:21:44.642Z",
  "currentStep": 1,
  "isComplete": false,
  "status": "DRAFT",
  "name": "Test Campaign",
  "businessGoal": "Testing database functionality",
  "startDate": "2025-03-05T12:21:44.642Z",
  "endDate": "2025-04-04T12:21:44.642Z",
  "timeZone": "UTC",
  "primaryContact": {
    "email": "john@example.com",
    "surname": "Doe",
    "position": "Manager",
    "firstName": "John"
  },
  "secondaryContact": {
    "email": "jane@example.com",
    "surname": "Smith",
    "position": "Director",
    "firstName": "Jane"
  },
  "budget": {
    "currency": "USD",
    "totalBudget": 10000,
    "socialMediaBudget": 5000
  },
  "step1Complete": true,
  "primaryKPI": null,
  "secondaryKPIs": [],
  "messaging": null,
  "expectedOutcomes": null,
  "features": [],
  "step2Complete": false,
  "demographics": null,
  "locations": [],
  "targeting": null,
  "competitors": [],
  "step3Complete": false,
  "assets": [],
  "guidelines": null,
  "requirements": [],
  "notes": null,
  "step4Complete": false,
  "userId": null
}
```

### influencer

### wizardHistory

### campaignWizardSubmission

#### Sample Record

```json
{
  "id": 1,
  "campaignName": "Test Submission",
  "description": "Testing database functionality",
  "startDate": "2025-03-05T12:22:57.163Z",
  "endDate": "2025-04-04T12:22:57.163Z",
  "timeZone": "UTC",
  "contacts": "Robert Johnson, Sarah Williams",
  "currency": "USD",
  "totalBudget": 10000,
  "socialMediaBudget": 5000,
  "platform": "INSTAGRAM",
  "influencerHandle": "@testinfluencer",
  "primaryContactId": 2,
  "secondaryContactId": 2,
  "mainMessage": "This is a test message",
  "hashtags": "#test #campaign",
  "memorability": "High memorability",
  "keyBenefits": "Testing benefits",
  "expectedAchievements": "Expected achievements",
  "purchaseIntent": "High intent",
  "brandPerception": "Positive perception",
  "primaryKPI": "BRAND_AWARENESS",
  "secondaryKPIs": [
    "AD_RECALL",
    "CONSIDERATION"
  ],
  "features": [
    "CREATIVE_ASSET_TESTING",
    "BRAND_LIFT"
  ],
  "submissionStatus": "draft",
  "createdAt": "2025-03-05T12:22:57.164Z",
  "userId": null
}
```

### primaryContact

#### Sample Record

```json
{
  "id": 1,
  "firstName": "Robert",
  "surname": "Johnson",
  "email": "robert@example.com",
  "position": "Manager"
}
```

### secondaryContact

#### Sample Record

```json
{
  "id": 1,
  "firstName": "Sarah",
  "surname": "Williams",
  "email": "sarah@example.com",
  "position": "Director"
}
```

### audience

#### Sample Record

```json
{
  "id": 1,
  "ageRangeMin": 18,
  "ageRangeMax": 35,
  "keywords": [
    "social media",
    "digital marketing"
  ],
  "interests": [
    "fashion",
    "technology"
  ],
  "campaignId": 1,
  "age1824": 0,
  "age2534": 0,
  "age3544": 0,
  "age4554": 0,
  "age5564": 0,
  "age65plus": 0
}
```

### audienceLocation

#### Sample Record

```json
{
  "id": 1,
  "country": "United States",
  "proportion": 0.6,
  "audienceId": 1
}
```

### audienceGender

#### Sample Record

```json
{
  "id": 1,
  "gender": "Male",
  "proportion": 0.5,
  "audienceId": 1
}
```

### audienceScreeningQuestion

#### Sample Record

```json
{
  "id": 1,
  "question": "Do you use social media daily?",
  "audienceId": 1
}
```

### audienceLanguage

#### Sample Record

```json
{
  "id": 1,
  "language": "English",
  "audienceId": 1
}
```

### audienceCompetitor

#### Sample Record

```json
{
  "id": 1,
  "name": "Competitor A",
  "audienceId": 1
}
```

### creativeAsset

#### Sample Record

```json
{
  "id": 1,
  "name": "Test Image",
  "description": "Test image asset",
  "url": "https://example.com/image.jpg",
  "type": "image",
  "fileSize": 1024,
  "dimensions": null,
  "duration": null,
  "format": "jpg",
  "submissionId": 1
}
```

### creativeRequirement

#### Sample Record

```json
{
  "id": 1,
  "description": "Must include product in frame",
  "mandatory": true,
  "submissionId": 1
}
```

### user

### notificationPrefs

### teamMember

### teamInvitation

### brandingSettings

## Next Steps

1. Review all models and their fields
2. Identify any missing or incorrect fields in the API routes
3. Update API routes to match the schema
4. Implement validation for all required fields
5. Add tests to ensure API-schema alignment
