# Project Overview

**Last Reviewed:** 2025-05-09

## What Justify IS: Core Purpose & Value Proposition

Justify is a marketing intelligence platform designed to help brands measure the impact of their social media campaigns and identify high-performing influencers. The system captures authentic audience opinions through structured data collection and presents actionable insights through intuitive dashboards. Our core value is to provide clarity and confidence in social media marketing investments by focusing on genuine engagement and measurable outcomes.

## Key Features

1.  **Campaign Wizard**

    - Step-by-step guided campaign creation process.
    - Budget management and timeline planning.
    - Creative asset management.
    - KPI definition and tracking.

2.  **Brand Lift Measurement**

    - Pre/post campaign awareness tracking.
    - Message association metrics.
    - Purchase intent analysis.
    - Quantified brand perception shifts.

3.  **Creative Asset Testing**

    - A/B testing for campaign assets.
    - Performance comparisons.
    - Audience reaction analysis.
    - Optimisation recommendations.

4.  **Influencer Discovery**

    - Authentic engagement metrics.
    - Audience alignment verification.
    - Comprehensive brand safety tools.
    - Performance projection models.

5.  **Brand Health Monitoring**

    - Sentiment tracking over time.
    - Competitive share of voice.
    - Audience growth metrics.
    - Brand loyalty indicators.

6.  **Mixed Media Modelling**

    - Cross-channel campaign analysis.
    - ROI comparison by platform.
    - Budget allocation optimisation.
    - Performance attribution.

7.  **Comprehensive Reporting**
    - Customisable dashboards.
    - Exportable reports.
    - Historical performance trends.
    - Benchmark comparisons.

## User Types

The platform serves several distinct user types:

### Brand Marketers

- **Role**: Digital marketing professionals managing social campaigns.
- **Goals**: Find authentic influencers, measure ROI, reduce vetting time.
- **Pain Points**: Overwhelmed by vanity metrics, difficulty assessing audience alignment.

### Content Creators (Influencers)

- **Role**: Social media content producers partnering with brands.
- **Goals**: Find aligned brand partnerships, demonstrate engagement quality.
- **Pain Points**: Being overlooked due to follower count, limited tools to show performance.

### Agency Professionals

- **Role**: Managing campaigns on behalf of brand clients.
- **Goals**: Deliver measurable results, streamline campaign workflows.
- **Pain Points**: Client reporting challenges, coordination complexities.

### System Administrators

- **Role**: Managing platform configuration and user access.
- **Goals**: Maintain system integrity, manage permissions.
- **Pain Points**: Complex permission structures, audit requirements.

## Access Levels (High-Level)

The system implements role-based access control with these primary roles:

1.  **Admin**: Full system access including user management.
2.  **Manager**: Campaign creation and management with analytics access.
3.  **User**: Read-only access to campaigns and basic analytics.
4.  **Viewer**: Limited dashboard access for client viewing.

## Technology Stack

We use modern web technologies to build Justify:

- **Frontend**: Next.js, React, TypeScript
- **Backend**: Node.js, Express, PostgreSQL
- **Authentication**: Auth0
- **UI Components**: Custom component library with Shadcn
- **State Management**: React Query and Context API

## Project Structure

The codebase is organised into several key areas:

```
src/
├── app/                # Next.js app router pages
├── components/         # UI components
├── hooks/              # React hooks
├── lib/                # Utility functions
├── services/           # External service integrations
└── types/              # TypeScript type definitions
```

## Simple Code Example

Here's a simple example of how we create a component in Justify:

```tsx
// A typical component in our system
export function CampaignCard({ campaign, onView }) {
  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle>{campaign.title}</CardTitle>
        <CardDescription>{campaign.brand}</CardDescription>
      </CardHeader>
      <CardContent>
        <p>{campaign.description}</p>
        <div className="mt-2">Budget: £{campaign.budget}</div>
      </CardContent>
      <CardFooter>
        <Button onClick={() => onView(campaign.id)}>View Details</Button>
      </CardFooter>
    </Card>
  );
}
```

## Key Concepts

- **Campaigns** - Projects created by brands seeking influencer collaboration
- **Influencer Profiles** - Creator data including audience demographics and performance metrics
- **Matches** - Suggested pairings between brands and influencers
- **Analytics** - Performance data for campaigns and influencer content

## Further Reading

Looking to explore deeper? Here are your next steps:

- [Architecture Overview](../architecture/README.md) - How the system is built
- [Component Library](../components/component-library.md) - Our comprehensive UI component system
- [API Reference](../api/comprehensive-reference.md) - Complete backend service documentation
