# Project Overview: Marketing Intelligence Platform

## Purpose

This is a marketing intelligence platform designed to help brands measure the impact of their social media campaigns and identify high-performing influencers. The system captures authentic audience opinions through structured data collection and presents actionable insights through intuitive dashboards.

## Core Features

1. **Campaign Wizard** - Step-by-step guided campaign creation process with budget management, timeline planning, creative asset management, and KPI tracking
2. **Brand Lift Measurement** - Pre/post campaign awareness tracking, message association metrics, purchase intent analysis, and brand perception measurement
3. **Creative Asset Testing** - A/B testing for campaign assets, performance comparisons, and optimization recommendations
4. **Influencer Discovery** - Authentic engagement metrics, audience alignment verification, brand safety tools, and performance projections
5. **Brand Health Monitoring** - Sentiment tracking, competitive share of voice, audience growth metrics, and brand loyalty indicators
6. **Mixed Media Modelling** - Cross-channel campaign analysis, ROI comparison by platform, and budget allocation optimization
7. **Comprehensive Reporting** - Customizable dashboards, exportable reports, and benchmark comparisons

## Technical Architecture

### Frontend
- **Framework**: Next.js with React and TypeScript
- **UI Components**: Custom component library with Shadcn UI and Tailwind CSS
- **State Management**: React Context API with SWR for data fetching
- **Testing**: Jest and React Testing Library

### Backend
- **API**: Next.js API Routes with strong typing
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT-based authentication with Auth0
- **Storage**: Cloud storage for assets and reports

## Development Principles

The application follows these key development principles:

1. **Atomic Design**: Structured component hierarchy (atoms, molecules, organisms)
2. **Type Safety**: Comprehensive TypeScript throughout
3. **Component Reusability**: Modular architecture for maintainability
4. **Performance Optimization**: Efficient data loading patterns
5. **Accessibility**: WCAG 2.1 AA compliance
6. **Single Source of Truth**: Centralized configurations and registries

## Brand Guidelines

### Brand Colors
- **Primary**: Jet `#333333`
- **Secondary**: Payne's Grey `#4A5568`
- **Accent**: Deep Sky Blue `#00BFFF`
- **Background**: White `#FFFFFF`
- **Divider**: French Grey `#D1D5DB`
- **Interactive**: Medium Blue `#3182CE`

### Icons
- **Icon Library**: FontAwesome Pro
- **Default state**: Light icons (`fa-light`)
- **Hover state**: Solid icons (`fa-solid`)

### Typography
- **Headings**: Inter (sans-serif)
- **Body**: Inter (sans-serif)
- **Code**: JetBrains Mono (monospace)

## Deployment

- **Platform**: Vercel
- **Branch Strategy**: 
  - `main`: Production
  - `develop`: Staging
  - Feature branches: Preview deployments 