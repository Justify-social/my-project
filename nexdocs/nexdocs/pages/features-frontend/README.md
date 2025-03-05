# Frontend Features

**Last Updated:** 2025-03-05  
**Status:** Active  
**Owner:** Frontend Team

## Overview

This section contains documentation for all user-facing features of the Campaign Wizard application. Each feature has detailed documentation covering its purpose, usage, and technical implementation details.

## Available Features

| Feature | Description | Key Documentation |
|---------|-------------|------------------|
| [Dashboard](./dashboard/overview.md) | Central hub for monitoring campaign performance and accessing key features | [Overview](./dashboard/overview.md), [Usage Guide](./dashboard/usage.md), [Components](./dashboard/components.md) |
| [Campaign Wizard](./campaign-wizard/overview.md) | Step-by-step campaign creation flow | [Overview](./campaign-wizard/overview.md), [Usage Guide](./campaign-wizard/usage.md), [Workflow](./campaign-wizard/workflow.md), [Form Validation](./campaign-wizard/form-validation.md) |
| [Creative Testing](./creative-testing/overview.md) | Tools for testing and optimizing creative assets | [Overview](./creative-testing/overview.md), [Usage Guide](./creative-testing/usage.md) |
| [Brand Lift](./brand-lift/overview.md) | Measure brand awareness impact of campaigns | [Overview](./brand-lift/overview.md), [Usage Guide](./brand-lift/usage.md) |
| [Brand Health](./brand-health/overview.md) | Monitor overall brand health metrics | [Overview](./brand-health/overview.md), [Usage Guide](./brand-health/usage.md) |
| [Influencers](./influencers/overview.md) | Manage influencer partnerships and campaigns | [Overview](./influencers/overview.md), [Usage Guide](./influencers/usage.md) |
| [Mixed Media Modeling](./mmm/overview.md) | Advanced analytics for cross-channel performance | [Overview](./mmm/overview.md), [Usage Guide](./mmm/usage.md) |
| [Reports](./reports/overview.md) | Comprehensive reporting tools | [Overview](./reports/overview.md), [Usage Guide](./reports/usage.md) |
| [Settings](./settings/overview.md) | Application configuration and customization | [Overview](./settings/overview.md), [Usage Guide](./settings/usage.md), [Team Management](./settings/team-management.md), [Branding](./settings/branding.md) |
| [Admin](./admin/overview.md) | Administrative functions for super admins | [Overview](./admin/overview.md), [Usage Guide](./admin/usage.md) |

## Feature Architecture

The frontend features in Campaign Wizard follow a consistent architecture pattern:

1. **Component-Based Structure**: All features are built using React components with TypeScript
2. **Shared Components**: Common UI elements are shared across features
3. **State Management**: Context API and hooks for local state, with Redux for global state
4. **API Integration**: RESTful API communication with the backend services
5. **Styling**: Tailwind CSS for styling with a design system for consistency

## User Experience Principles

Our frontend features adhere to the following UX principles:

- **Intuitive Navigation**: Clear pathways between features with consistent navigation patterns
- **Progressive Disclosure**: Complex functionality is revealed progressively to avoid overwhelming users
- **Responsive Design**: All features adapt seamlessly to different screen sizes and devices
- **Accessibility**: WCAG 2.1 AA compliance across all features
- **Performance**: Fast load times and efficient interactions
- **Consistent Branding**: Configurable branding that maintains a consistent look and feel

## Technical Dependencies

The frontend features rely on the following key technologies:

- React 18+
- Next.js
- TypeScript
- Tailwind CSS
- Zod (for form validation)
- React Query (for data fetching)
- NextAuth.js (for authentication)
- Recharts (for data visualization)

## Related Documentation

- [User Guides](../guides/user/getting-started.md) - End-user focused documentation
- [Developer Setup](../guides/developer/setup.md) - Setup instructions for developers
- [API Documentation](../features-backend/apis/overview.md) - Documentation for backend APIs
- [Architecture Overview](../features-backend/architecture/overview.md) - Technical architecture

## Contributing

To contribute to frontend feature documentation, please follow the [documentation guidelines](../CONTRIBUTING.md) and use the appropriate [templates](../templates/feature.md). 