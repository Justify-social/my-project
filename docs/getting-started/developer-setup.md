# Developer Setup

**Last Reviewed:** 2025-05-09

This document is the Single Source of Truth (SSOT) for setting up your local development environment for the Justify project. Follow these steps carefully to ensure a smooth setup.

## 1. Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js**: We recommend using the version specified in the `.nvmrc` file or the `engines` field in `package.json`. As of the last review, this is `20.x`.
  - It's highly recommended to use a Node Version Manager like `nvm` to manage Node.js versions.
- **npm (Node Package Manager)**: This is usually included with Node.js. Ensure it's a recent version (e.g., v7+).
- **Git**: For version control.
- **PostgreSQL**: The database system used by Justify (e.g., v14 or later). Ensure it is running before proceeding with database setup.
- **IDE**: Visual Studio Code is recommended, but you can use any preferred Integrated Development Environment.

## 2. Clone the Repository

If you haven't already, clone the project repository to your local machine:

```bash
git clone <repository-url>
cd my-project # Or your chosen project directory name
```

Replace `<repository-url>` with the actual URL of the Git repository.

## 3. Install Dependencies

Navigate to the root of the project directory in your terminal and install the required npm dependencies:

```bash
npm install
```

This command reads the `package.json` file and installs all necessary packages into the `node_modules` directory.

## 4. Environment Variables

Justify requires environment variables for configuration, such as database connection strings, API keys, and other sensitive credentials.

1.  **Copy the example environment file:**
    In the project root, you should find an example environment file. The typical location for this is `config/env/.env.example`. Copy this to a new file named `.env.local` in the same directory:

    ```bash
    cp config/env/.env.example config/env/.env.local
    ```

    _If the example file is located directly in the root (e.g., `.env.example`), adjust the command accordingly: `cp .env.example .env.local`._

2.  **Configure `.env.local`:**
    Open the newly created `config/env/.env.local` file (or `.env.local` if in root) in your editor. Fill in the necessary values for your local development environment.

    - **`DATABASE_URL`**: This is crucial. It should point to your local PostgreSQL instance (e.g., `postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/your_justify_db_name`).
    - Other variables might include authentication secrets, external API keys, etc. Obtain any sensitive or unknown values from the project leads or your team's password management system.

    **Important**: The `.env.local` file should **never** be committed to version control as it contains sensitive information. It should be listed in the `.gitignore` file.

## 5. Database Setup

With your PostgreSQL server running and the `DATABASE_URL` configured in `.env.local`, set up the database schema and optionally seed it with initial data.

1.  **Run Database Migrations:**
    We use Prisma for database management. To apply all pending migrations and create/update your database schema according to `prisma/schema.prisma`, run:

    ```bash
    npm run db:migrate
    ```

    _This command typically executes `prisma migrate dev` or a similar Prisma CLI command. Check `package.json` scripts for the exact definition if needed._

2.  **Seed the Database (Optional but Recommended):**
    To populate your database with initial sample data for development and testing, run the seed script (if available):

    ```bash
    npm run db:seed
    ```

    _Check `package.json` for the exact seed script command. This step is highly recommended for a functional local environment._

## 6. Run the Development Server

Once all the above steps are completed, you can start the Next.js development server:

```bash
npm run dev
```

This command will typically start the application on `http://localhost:3000` (or another port if specified in your configuration or `package.json`). Open this URL in your web browser to see the Justify application running locally.

## Troubleshooting

- **Node/NPM Version Issues**: Ensure you are using the Node.js version specified by the project. Use `nvm use` if an `.nvmrc` file is present.
- **Database Connection Problems**: Double-check your `DATABASE_URL` in `.env.local`. Ensure PostgreSQL is running and accessible with the credentials provided. Verify the database name matches.
- **Migration Failures**: Look at the error messages from `npm run db:migrate`. Sometimes, manual intervention in the database or migration files is needed, but consult with your team lead first.
- **Missing Environment Variables**: If the application fails to start or features don't work, ensure all required variables in `.env.local` are correctly set.

If you encounter persistent issues, please refer to the more detailed **[Troubleshooting Guide](../guides/developer/troubleshooting.md)** or consult with your team.
