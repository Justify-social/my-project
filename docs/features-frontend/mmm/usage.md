# Mixed Media Modeling Usage Guide

**Last Updated:** 2025-03-05  
**Status:** Active  
**Owner:** Data Science Team

## Introduction

This guide provides detailed instructions for using the Mixed Media Modeling (MMM) feature in the Justify.social platform. Mixed Media Modeling helps you understand how different marketing channels contribute to your business outcomes, enabling more effective budget allocation and campaign optimization.

## Accessing MMM

1. Log in to your Campaign Wizard account
2. From the main navigation sidebar, click on **MMM**
3. The MMM dashboard will load as the default view

## Key Features and How to Use Them

### MMM Dashboard

The dashboard provides a high-level overview of your marketing performance:

1. Navigate to **MMM > Dashboard** in the sidebar
2. View the marketing performance summary cards:
   - Overall ROI
   - Channel distribution
   - Top-performing campaigns
   - Historical trends
3. Use the time period selector in the top-right corner to adjust the analysis timeframe
4. Hover over charts and graphs for detailed tooltips with additional metrics
5. Click on any chart element to drill down for more detailed analysis

### Attribution Analysis

To understand how different touchpoints contribute to conversions:

1. Navigate to **MMM > Attribution** in the sidebar
2. Select the attribution model from the dropdown:
   - Last Touch
   - First Touch
   - Linear
   - Time Decay
   - Position Based
   - Data-Driven (Premium feature)
3. Choose the conversion metric you want to analyze:
   - Revenue
   - Conversions
   - Leads
   - Custom goals
4. Set the attribution window (how far back to look for touchpoints)
5. Click **Run Analysis** to generate the attribution report
6. View the results in the interactive visualization
7. Export the report as CSV, PDF, or PowerPoint using the export button

### Channel Weightings

To analyze the relative impact of each marketing channel:

1. Navigate to **MMM > Weightings** in the sidebar
2. Select the business outcome to analyze:
   - Sales
   - Brand awareness
   - Website traffic
   - App installs
   - Custom metrics
3. Choose the time period for analysis
4. Click **Calculate Weightings** to run the analysis
5. View the results showing:
   - Channel contribution percentages
   - Incremental impact by channel
   - Efficiency scores
   - Recommended budget allocation
6. Adjust the scenario planning sliders to see how changes in channel investment might affect outcomes
7. Save different scenarios for comparison

### Cross-Channel Analysis

To identify interactions between marketing channels:

1. Navigate to **MMM > Cross-channel** in the sidebar
2. View the Sankey diagram showing customer journey flows across channels
3. Use the filters to focus on specific:
   - Time periods
   - Customer segments
   - Conversion paths
4. Identify synergies and cannibalization between channels in the analysis section
5. View the heatmap of channel interactions
6. Click on specific channel pairs for detailed interaction reports

## Advanced Features

### Custom Attribution Models

To create your own attribution model:

1. Navigate to **MMM > Attribution**
2. Click **Create Custom Model** in the top-right corner
3. Set the weighting rules for touchpoints based on:
   - Position in the customer journey
   - Time before conversion
   - Channel type
   - Custom rules
4. Name and save your model
5. Select your custom model from the model dropdown to use it for analysis

### Scheduled Analysis

For regular MMM insights:

1. Navigate to **MMM > Settings**
2. Click on the **Scheduled Reports** tab
3. Click **Create New Schedule**
4. Configure:
   - Analysis type
   - Frequency (daily, weekly, monthly)
   - Recipients
   - Report format
5. Click **Save Schedule**

### Data Export & API Access

To use MMM data in other systems:

1. From any MMM analysis view, click the **Export** button
2. Choose the format (CSV, Excel, JSON)
3. For API access, navigate to **MMM > Settings > API Access**
4. Generate an API key and view documentation for programmatic access

## Best Practices

- **Run analysis consistently**: Use the same parameters for trend comparisons
- **Consider seasonality**: Account for seasonal variations when interpreting results
- **Validate with experiments**: Use A/B tests to validate MMM findings
- **Include all channels**: Ensure all marketing channels are included for accurate attribution
- **Update regularly**: Marketing effectiveness changes over time; refresh analyses quarterly

## Troubleshooting

### Analysis Won't Complete

**Symptom:** Analysis gets stuck at "Processing" or fails to complete

**Solution:** Check that all required data sources are connected and properly synced. For large datasets, try reducing the time range or increasing data aggregation.

### Unexpected Channel Performance

**Symptom:** A channel shows unexpectedly high or low impact

**Solution:** Verify data quality for that channel. Check for tracking issues, campaign tagging problems, or unusual activities during the analysis period.

### Cannot Access Certain Features

**Symptom:** Some MMM features appear disabled or inaccessible

**Solution:** Check your subscription level. Advanced features like Data-Driven attribution and Predictive Modeling require higher-tier subscriptions.

## Related Documentation

- [Mixed Media Modeling Overview](./overview.md)
- [Data Integration Guide](../../features-backend/apis/overview.md)
- [Campaign Reporting Guide](../reports/usage.md) 