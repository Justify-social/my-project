# Environment Variables

This document provides a reference for all environment variables used in the application.

## Configuration

Environment variables are managed through the centralized configuration system in `/config/env/` with:

- `.env.example` - Template with all required variables and documentation
- `.env` - Local development environment variables
- `.env.development` - Development-specific variables
- `.env.test` - Testing-specific variables
- `.env.production` - Production-specific variables

## Core Environment Variables

| Variable       | Description                | Default       | Required |
| -------------- | -------------------------- | ------------- | -------- |
| `NODE_ENV`     | Application environment    | `development` | Yes      |
| `PORT`         | Server port                | `3000`        | No       |
| `DATABASE_URL` | Database connection string | -             | Yes      |
| `API_KEY`      | API authentication key     | -             | Yes      |
| `SECRET_KEY`   | Encryption secret key      | -             | Yes      |

## Feature Flags

| Variable                  | Description            | Default |
| ------------------------- | ---------------------- | ------- |
| `FEATURE_ANALYTICS`       | Enable analytics       | `false` |
| `FEATURE_DARK_MODE`       | Enable dark mode       | `true`  |
| `FEATURE_PREMIUM_CONTENT` | Enable premium content | `false` |

## Service Integration

| Variable                | Description            | Default     | Required               |
| ----------------------- | ---------------------- | ----------- | ---------------------- |
| `AWS_REGION`            | AWS region             | `us-east-1` | When using AWS         |
| `AWS_ACCESS_KEY_ID`     | AWS access key         | -           | When using AWS         |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key         | -           | When using AWS         |
| `STRIPE_API_KEY`        | Stripe API key         | -           | When using Stripe      |
| `GOOGLE_CLIENT_ID`      | Google OAuth client ID | -           | When using Google Auth |

## Usage in Code

Environment variables are accessed through the configuration system:

```javascript
import { config } from '@/config';

// Access environment-specific values
const apiKey = config.api.key; // Reads from environment variables
```

## Adding New Environment Variables

1. Add the variable to `.env.example` with documentation
2. Update the appropriate environment files
3. Add the variable to the configuration schema
4. Update this reference document

## Security Notes

- Never commit `.env` files to the repository
- Always use `.env.example` as a template
- Ensure secrets are properly secured in production environments
