# Getting Started with Justify

Welcome to Justify! This guide will help you get up and running quickly.

## For New Developers

If you're new to the project, follow these steps:

1.  **[Project Overview](./project-overview.md)** - Learn what Justify does and why.
2.  **Setup Your Environment** - Follow the setup instructions below.
3.  **[Directory Structure](../architecture/directory-structure.md)** - Understand how the codebase is organised.
4.  **[Contribution Guide](../CONTRIBUTING.md)** - Learn our development workflow and how to make your first contribution.
5.  **[Code Standards](../standards/code-standards.md)** - Familiarise yourself with our coding practices.

## Development Setup

1.  **Prerequisites:**
    *   Node.js (Check `.nvmrc` or `package.json` engines field for the required version - currently `20.x`).
    *   `npm` (usually included with Node.js).
    *   Git.
    *   Access to the project repository on GitHub.
2.  **Clone the Repository:**
    ```bash
    git clone <repository-url>
    cd my-project
    ```
3.  **Install Dependencies:**
    ```bash
    npm install
    ```
4.  **Environment Variables:**
    *   Copy the example environment file: `cp .env.example .env.local`
    *   Fill in the necessary values in `.env.local` (e.g., database connection string, Auth0 credentials, API keys). Obtain sensitive values from project leads or password management system.
5.  **Database Setup (if applicable):**
    *   Ensure your database (e.g., PostgreSQL) is running.
    *   Run Prisma migrations: `npx prisma migrate dev` (Check `package.json` scripts for exact command).
6.  **Run the Development Server:**
    ```bash
    npm run dev
    ```
    *   The application should now be running, typically at `http://localhost:3000`.

## What You'll Find Here

This directory contains essential introductory information:

| Document | Description |
|----------|-------------|
| [Project Overview](./project-overview.md) | High-level explanation of Justify and its purpose |

## Next Steps

After setting up and reviewing the overview:

1. Explore the **[Architecture](../architecture/README.md)** documentation.
2. Review the **[Standards](../standards/README.md)** for coding requirements.
3. Check the **[Guides](../guides/README.md)** for specific development tasks.

## Need Help?

If you get stuck during setup or have questions:

1. Ask in the relevant Slack channel.
2. Consult the **[Troubleshooting Guide](../troubleshooting/README.md)** (Verify path).
3. Contact the onboarding team or project leads. 