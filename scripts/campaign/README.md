# Campaign Scripts

This directory contains scripts for campaign management, testing, and indexing.

## Scripts Overview

- **index-campaigns.js**: Indexes campaigns for search functionality
- **index-campaigns.ts**: TypeScript version of campaign indexing
- **index-sample-campaigns.ts**: Indexes sample campaigns for demo purposes
- **test-campaign-creation.js**: Tests campaign creation workflows
- **test-campaign-submission.js**: Tests campaign submission processes
- **createCampaign.js**: Utility for creating campaign entries
- **testCampaign.js**: Utility for testing campaign functionality

## Usage

JavaScript scripts can be run directly with Node.js:

```bash
node scripts/campaign/[script-name].js
```

For TypeScript scripts, use ts-node:

```bash
npx ts-node scripts/campaign/index-campaigns.ts
```

Or import through the main scripts index:

```javascript
const { campaign } = require('../index');
campaign.testCampaignCreation();
``` 