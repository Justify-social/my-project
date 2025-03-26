# Justify.social

A platform that captures authentic audience opinions to measure social campaign impact and identify standout influencers for brands.

## Overview

Justify.social is an enterprise-grade platform that streamlines the process of measuring and analyzing social media campaigns. It provides comprehensive tools for capturing authentic audience opinions, identifying top-performing influencers, and measuring campaign impact.

## Key Features

- **Campaign Creation Wizard**: Step-by-step interface for creating campaigns
- **Brand Lift Measurement**: Measure the impact of campaigns on brand awareness and perception
- **Creative Asset Testing**: Test and optimize creative assets before campaign launch
- **Influencer Analytics**: Discover and analyze top-performing influencers
- **Brand Health Monitoring**: Track brand sentiment and perception over time
- **Mixed Media Modeling**: Analyze campaign performance across multiple channels
- **Comprehensive Reporting**: Generate detailed insights and visualizations

## Technical Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js
- **Testing**: Jest, React Testing Library, Cypress
- **Deployment**: Vercel

## Getting Started

### For Users

Visit our [User Documentation](./docs/guides/user/getting-started.md) to learn how to use Justify.social.

### For Developers

Check out our [Developer Setup Guide](./docs/guides/developer/setup.md) to set up your local development environment.

## Documentation

Our comprehensive documentation is available in the [docs](./docs) directory, with these main sections:

- [Frontend Features](./docs/features-frontend/README.md)
- [Backend Features](./docs/features-backend/README.md)
- [User Guides](./docs/guides/user/README.md)
- [Developer Guides](./docs/guides/developer/README.md)

## Contributing

Please read our [Contributing Guidelines](./docs/CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Testing

This project includes comprehensive testing at multiple levels:

### Unit and Integration Tests

Unit and integration tests are implemented using Jest and React Testing Library. To run these tests:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test:watch

# Generate test coverage report
npm test:coverage
```

### End-to-End Tests

End-to-end tests are implemented using Cypress. To run these tests:

```bash
# Open Cypress test runner
npm run cypress

# Run Cypress tests headlessly
npm run cypress:run

# Start development server and run e2e tests
npm run test:e2e
```

### Test Structure

- **Unit Tests**: Located in `src/__tests__/unit/`
- **Integration Tests**: Located in `src/__tests__/integration/`
- **End-to-End Tests**: Located in `cypress/e2e/`

### Test Coverage

The project aims to maintain high test coverage across all components and pages:

- Unit test coverage: 90%+
- Integration test coverage: 85%+
- Key user flows covered by E2E tests: 100%
