# Contributing Guide

Thank you for your interest in contributing to our project. This guide explains our development process and how you can contribute effectively.

## Getting Started

1. **Set up your environment**
   - Follow the instructions in the main [Getting Started Guide](getting-started/README.md)
   - Ensure all dependencies are installed (`npm install`)
   - Verify that you can run the application locally (`npm run dev`)

2. **Understand the codebase**
   - Review the [Project Overview](getting-started/project-overview.md)
   - Study the [Directory Structure](architecture/directory-structure.md)

## Development Workflow

1. **Create a branch**
   - Branch from `main` for most changes
   - Use the format: `<type>/<description>` (e.g., `feature/add-campaign-filter`)
   - Types: `feature`, `fix`, `refactor`, `docs`, `test`, `chore`

2. **Make your changes**
   - Follow our [Coding Standards](standards/code-standards.md)
   - Include relevant tests for new features or fixes
   - Keep commits small and focused with meaningful messages (see below)
   - Update relevant documentation if your changes affect architecture, features, or processes

3. **Submit a pull request (PR)**
   - Fill in the pull request template clearly
   - Link any related issues
   - Request review from appropriate team members
   - Respond to feedback promptly

## Code Quality

We maintain high standards for code quality:

- **Linting**: Run `npm run lint` before committing
- **Testing**: Include tests. See [Testing Standards](standards/testing.md) (Link needs verification)
- **Documentation**: Update docs for your changes
- **Accessibility**: Ensure UI changes meet WCAG 2.1 AA standards
- **Performance**: Consider the performance impact of your changes

## Commit Guidelines

Write clear, concise commit messages using conventional commit format:

```
<type>(<optional scope>): <description>

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Formatting changes
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements
- `ci`: Continuous integration
- `build`: Build system changes

## Pull Request Process

1. Ensure all automated checks (linting, tests, build) pass
2. Confirm documentation is updated
3. Get approval from at least one reviewer
4. Rebase your branch onto `main` and resolve conflicts
5. Squash commits into logical units if necessary before merge
6. Merge using the "Squash and merge" option

## Documentation Contributions

When contributing to documentation (`/docs` directory):

- **Follow Core Principles:** Adhere to SSOT, Simple Language, Consistent Structure, Developer-First (see `docs/README.md`)
- **Naming Conventions:** Use `kebab-case` for filenames
- **Language:** Use British English spelling and grammar where natural
- **Clarity:** Prioritise simple explanations over jargon
- **Structure:** Place new documents in the most relevant subdirectory
- **SSOT:** Avoid duplicating information. Link to existing canonical documents instead

## Getting Help

If you need assistance:

- Check relevant guides in `/docs`
- Ask questions in the appropriate Slack channel
- Contact the core development team or feature owners

Thank you for helping improve our project! 