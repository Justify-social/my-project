# Brand Lift Overview

**Last Updated:** 2025-03-05  
**Status:** Active  
**Owner:** Frontend Team

## Overview

The Brand Lift feature enables marketers to measure the impact of their advertising campaigns on brand awareness, perception, and consideration. This feature allows for pre-campaign and post-campaign surveys to quantify changes in consumer sentiment and brand metrics.

## Key Components

### Survey Creation

The survey creation module allows users to:

- Define survey objectives and KPIs
- Select from pre-built question templates
- Create custom questions
- Define target audience segments
- Set survey fielding parameters

### Audience Sampling

The audience sampling feature ensures:

- Statistically significant sample sizes
- Representative demographic distribution
- Control and exposed group creation
- Panel provider integration
- Survey response quality control

### Results Dashboard

The results dashboard provides:

- Comparative analysis of pre and post metrics
- Statistical significance indicators
- Demographic breakdowns of lift
- Trend analysis across multiple campaigns
- Exportable reports and visualizations

## Technical Implementation

The Brand Lift feature leverages:

- Survey API integrations with providers like Cint
- Statistical analysis libraries for lift calculation
- Data visualization components for insights presentation
- Audience matching algorithms for control/exposed groups
- Machine learning models for predictive insights

## Integration Points

The Brand Lift feature integrates with:

- Campaign Wizard for campaign association
- Creative Testing for asset performance correlation
- Reports module for consolidated reporting
- External survey platforms via API

## Usage Guidelines

Brand Lift studies are typically structured as:

1. Set up control and exposed audience groups
2. Field pre-campaign baseline surveys
3. Run advertising campaign targeting exposed group
4. Field post-campaign surveys to both groups
5. Analyze differences between control and exposed groups
6. Calculate lift across key brand metrics

## Related Documentation

- [Brand Lift Usage Guide](./usage.md)
- [Campaign Wizard](../campaign-wizard/overview.md)
- [Reports](../reports/overview.md)
