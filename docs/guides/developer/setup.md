# Development Environment Setup

**Last Updated:** 2025-03-05  
**Audience:** Developers  
**Complexity:** Intermediate

## Introduction

This guide will help you set up a development environment for the Justify.social platform. By following these steps, you'll have a fully functional local environment for development and testing.

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v16 or later)
- npm (v7 or later)
- Git
- PostgreSQL (v14 or later)
- Visual Studio Code (recommended) or your preferred IDE

## Step-by-Step Setup

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/organization/campaign-wizard.git

# Navigate to the project directory
cd campaign-wizard
```

### Step 2: Install Dependencies

```bash
# Install npm dependencies
npm install
```

### Step 3: Set Up Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your local configuration:
   ```
   # Database configuration
   DATABASE_URL="postgresql://username:password@localhost:5432/campaign_wizard"
   
   # Authentication (for development)
   AUTH_SECRET="your-development-secret"
   
   # API keys (use development keys)
   API_KEY="your-development-api-key"
   ```

### Step 4: Set Up the Database

1. Create a PostgreSQL database:
   ```bash
   createdb campaign_wizard
   ```

2. Run Prisma migrations:
   ```bash
   npx prisma migrate dev
   ```

3. Seed the database with test data:
   ```bash
   npm run seed
   ```

### Step 5: Start the Development Server

```bash
# Start the Next.js development server
npm run dev
```

The application should now be running at `http://localhost:3000`.

## Development Workflow

### Code Structure

The application follows this structure:

```
/
├── src/                  # Source code
│   ├── app/              # Next.js app directory
│   │   ├── api/          # API routes
│   │   └── (routes)/     # Frontend routes
│   ├── components/       # React components
│   ├── lib/              # Shared utilities
│   │   ├── prisma/       # Prisma client and utilities
│   │   └── validation/   # Validation schemas
│   └── types/            # TypeScript type definitions
├── prisma/               # Prisma schema and migrations
│   ├── schema.prisma     # Database schema
│   └── migrations/       # Database migrations
└── public/               # Static assets
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e
```

### Code Quality Tools

```bash
# Run ESLint
npm run lint

# Run TypeScript type checking
npm run type-check

# Format code with Prettier
npm run format
```

## Debugging

### VS Code Configuration

1. Install the "JavaScript Debugger" extension
2. Use the included launch configurations in `.vscode/launch.json`
3. Set breakpoints in your code
4. Press F5 to start debugging

### Browser Debugging

1. Open Chrome DevTools (F12)
2. Navigate to the Sources tab
3. Find your code under the webpack:// section
4. Set breakpoints and debug

## Common Issues

### Database Connection Problems

If you're having trouble connecting to the database:

1. Verify PostgreSQL is running: `pg_isready`
2. Check your `.env` file for correct credentials
3. Ensure the database exists: `psql -l`

### Next.js Build Errors

If you encounter build errors:

1. Check for TypeScript errors: `npm run type-check`
2. Look for ESLint issues: `npm run lint`
3. Clear the Next.js cache: `rm -rf .next`

## Testing with Mock Data

The application includes a set of mock data for testing:

1. Use the API testing endpoints:
   - `/api/test/campaigns`: Lists test campaigns
   - `/api/test/users`: Lists test users

2. Access test accounts:
   - Username: `test@example.com`
   - Password: `test-password`

## Next Steps

Once your environment is set up, you can:

- [Explore the codebase structure](./workflow.md)
- [Learn about the testing strategy](../../features-backend/testing/strategy.md)
- [Review the database schema](../../features-backend/database/schema.md)

## Additional Resources

- [GitHub Repository](https://github.com/organization/campaign-wizard)
- [Internal Wiki](https://wiki.example.com)
- [API Documentation](../../features-backend/apis/endpoints.md) 