# Justify Project Overview

## What is Justify?

Justify is a comprehensive platform that connects brands with influencers for authentic marketing campaigns. Our platform helps brands find the right influencers based on audience alignment, engagement metrics, and brand safety standards.

## Simple Explanation

Think of Justify as a matchmaking service for brands and social media creators. Brands tell us what they're looking for, and we help them find creators who can genuinely represent their products to the right audience.

## Key Features

- **Brand Dashboard** - Tools for brands to manage campaigns and view analytics
- **Influencer Discovery** - Search and filtering system to find suitable influencers
- **Campaign Management** - End-to-end workflow for running influencer campaigns
- **Analytics and Reporting** - Performance tracking and ROI measurement
- **Safety Verification** - Tools to ensure brand safety and compliance

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

## Related Documentation

- [Architecture Overview](../architecture/README.md) - How the system is built
- [UI Components](../reference/ui/README.md) - Our component library
- [API Reference](../reference/api/README.md) - Backend service APIs 