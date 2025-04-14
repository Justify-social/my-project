# Project Overview

## Purpose

Our application is a marketing intelligence platform that helps brands measure the impact of their social media campaigns and identify high-performing influencers. The system captures authentic audience opinions through structured data collection and presents actionable insights through intuitive dashboards.

## Core Features

1. **Campaign Wizard**

   - Step-by-step guided campaign creation process
   - Budget management and timeline planning
   - Creative asset management
   - KPI definition and tracking

2. **Brand Lift Measurement**

   - Pre/post campaign awareness tracking
   - Message association metrics
   - Purchase intent analysis
   - Quantified brand perception shifts

3. **Creative Asset Testing**

   - A/B testing for campaign assets
   - Performance comparisons
   - Audience reaction analysis
   - Optimisation recommendations

4. **Influencer Discovery**

   - Authentic engagement metrics
   - Audience alignment verification
   - Comprehensive brand safety tools
   - Performance projection models

5. **Brand Health Monitoring**

   - Sentiment tracking over time
   - Competitive share of voice
   - Audience growth metrics
   - Brand loyalty indicators

6. **Mixed Media Modelling**

   - Cross-channel campaign analysis
   - ROI comparison by platform
   - Budget allocation optimisation
   - Performance attribution

7. **Comprehensive Reporting**
   - Customisable dashboards
   - Exportable reports
   - Historical performance trends
   - Benchmark comparisons

## User Types

The platform serves several distinct user types:

### Brand Marketers

- **Role**: Digital marketing professionals managing social campaigns
- **Goals**: Find authentic influencers, measure ROI, reduce vetting time
- **Pain Points**: Overwhelmed by vanity metrics, difficulty assessing audience alignment

### Content Creators (Influencers)

- **Role**: Social media content producers partnering with brands
- **Goals**: Find aligned brand partnerships, demonstrate engagement quality
- **Pain Points**: Being overlooked due to follower count, limited tools to show performance

### Agency Professionals

- **Role**: Managing campaigns on behalf of brand clients
- **Goals**: Deliver measurable results, streamline campaign workflows
- **Pain Points**: Client reporting challenges, coordination complexities

### System Administrators

- **Role**: Managing platform configuration and user access
- **Goals**: Maintain system integrity, manage permissions
- **Pain Points**: Complex permission structures, audit requirements

## Access Levels

The system implements role-based access control with these primary roles:

1. **Admin**: Full system access including user management
2. **Manager**: Campaign creation and management with analytics access
3. **User**: Read-only access to campaigns and basic analytics
4. **Viewer**: Limited dashboard access for client viewing

## Technical Architecture

### Frontend

- **Framework**: Next.js with React and TypeScript
- **UI Components**: Custom component library with Tailwind CSS
- **State Management**: React Context API with SWR for data fetching
- **Testing**: Jest and React Testing Library

### Backend

- **API**: Next.js API Routes with strong typing
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT-based authentication
- **Storage**: Cloud storage for assets and reports

### Key Development Principles

- **Type Safety**: Comprehensive TypeScript throughout
- **Component Reusability**: Modular architecture for maintainability
- **Performance Optimisation**: Efficient data loading patterns
- **Accessibility**: WCAG 2.1 AA compliance

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
├── components/             # React components
│   ├── features/           # Feature-specific components
│   ├── ui/                 # Reusable UI components
├── hooks/                  # Custom React hooks
├── lib/                    # Library code
├── types/                  # TypeScript type definitions
├── utils/                  # Utility functions
```

## Development Setup

New developers should:

1. Review the [Contributing Guide](./contributing.md) for process information
2. Follow the [Development Setup](./developer/setup.md) for environment configuration
3. Study the [Directory Structure](../architecture/directory-structure.md) for codebase organisation
4. Understand [Naming Conventions](./naming-conventions.md) for consistent development
5. Consult [Linting Guide](../reference/configs/linting-guide.md) for code quality standards

## Getting Started

The fastest way to understand the system is to:

1. Create a test campaign using the Campaign Wizard
2. Explore the Brand Lift measurement functionality
3. Review the reporting dashboards
4. Experiment with creative asset testing tools

For detailed guidance on specific features, refer to the [Features documentation](../features/)
