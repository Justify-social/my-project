# Contributing Guide

Thank you for your interest in contributing to our project. This guide explains our development process and how you can contribute effectively.

## Getting Started

1. **Set up your environment**
   - Follow our [Development Setup Guide](guides/developer/setup.md)
   - Ensure all dependencies are installed correctly
   - Verify that you can run the application locally

2. **Understand the codebase**
   - Review the [Project Overview](guides/project-overview.md)
   - Study the [Directory Structure](architecture/directory-structure.md)
   - Familiarise yourself with our [Naming Conventions](guides/naming-conventions.md)

## Development Workflow

1. **Create a branch**
   - Branch from `main` for most changes
   - Use the naming format: `<type>/<description>`
   - Types: `feature`, `bugfix`, `refactor`, `docs`, `test`, `chore`
   - Example: `feature/campaign-filter-improvements`

2. **Make your changes**
   - Follow our [Coding Standards](guides/developer/coding-standards.md)
   - Ensure proper testing of your changes
   - Keep commits small and focused
   - Write meaningful commit messages

3. **Submit a pull request**
   - Fill in the pull request template
   - Link any related issues
   - Request review from appropriate team members
   - Respond to feedback promptly

## Code Quality

We maintain high standards for code quality:

- **Linting**: Run `npm run lint` before committing
- **Testing**: Include tests for new features and fixes
- **Documentation**: Update relevant documentation for your changes
- **Accessibility**: Ensure UI changes meet WCAG 2.1 AA standards
- **Performance**: Consider the performance impact of your changes

## Commit Guidelines

Write clear, concise commit messages:

```
<type>: <summary>

<optional body>

<optional footer>
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Formatting changes
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

## Pull Request Process

1. Ensure all tests pass
2. Update documentation as needed
3. Get approval from at least one reviewer
4. Rebase and squash commits if needed
5. Merge using the squash and merge option

## Getting Help

If you need assistance:

- Check our [Development Setup Guide](guides/developer/setup.md)
- Review our [Troubleshooting Guide](guides/developer/troubleshooting.md)
- Ask questions in the development channel on Slack
- Contact the core development team

Thank you for helping improve our project! 