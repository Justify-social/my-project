# Campaign Data Loading

**Last Updated:** 2023-07-15  
**Status:** Active

## Overview

The Campaign Wizard loads saved campaign data efficiently across all steps, ensuring a seamless editing experience.

## How It Works

1. When editing an existing campaign, the system loads all data at the initial step
2. Data is cached in the WizardContext to prevent redundant API calls
3. Each step displays the relevant portions of campaign data

## Key Features

- **Efficient loading**: Data loads only once per session
- **Context sharing**: All steps access the same data context
- **Field persistence**: Form values maintain state between steps
- **Data transformation**: Backend data formats are automatically converted to frontend formats

## Common Scenarios

| Scenario | Behavior |
|----------|----------|
| Editing a draft | All available data loads with default values for missing fields |
| Editing a submitted campaign | Complete data loads with all fields populated |
| Network issues | Graceful error handling with retry options |

## Troubleshooting

- **Empty fields**: Refresh the page to reload data
- **Infinite loading**: Check your network connection
- **Field format issues**: Some special characters may require escaping in text fields 