# Contributing Guidelines

Thank you for your interest in contributing to our project. This guide explains the process for contributing to our codebase.

## Getting Started

1. **Fork the Repository**: Create your own fork of the repository
2. **Clone**: `git clone https://github.com/your-username/project-name.git`
3. **Set Up**: Follow the setup instructions in [Development Setup](./guides/developer/setup.md)
4. **Create Branch**: Create a branch for your changes: `git checkout -b feature/your-feature-name`

## Development Process

### Coding Standards

- Follow the [Naming Conventions](./guides/naming-conventions.md)
- Adhere to the [Linting Guide](./reference/configs/linting-guide.md)
- Write clear, self-documenting code with descriptive comments
- Use TypeScript properly, avoiding `any` type where possible

### Making Changes

- Keep changes focused and specific
- Write tests for new features and bug fixes
- Ensure all tests pass: `npm test`
- Run linting checks: `npm run lint`

### Commits

- Use clear, descriptive commit messages
- Follow the format: `type(scope): description`
- Types include: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
- Example: `feat(auth): add email verification`

### Documentation

- Update documentation for new features or changes
- Use British English for all documentation
- Follow the [documentation maintenance guidelines](./README.md#documentation-maintenance)

## Pull Requests

1. **Push Changes**: Push your changes to your fork
2. **Create PR**: Open a PR against the main repository
3. **Description**: Include a clear description of the changes
4. **Link Issues**: Link related issues with "Fixes #123" or "Relates to #456"
5. **Await Review**: Respond to feedback and make requested changes

## Code Review Process

- All PRs require at least one review
- Address reviewer feedback promptly
- Keep discussions focused on code, not people
- Be open to suggestions and improvements

## Testing

- All changes must include appropriate tests
- Tests should cover both expected and edge cases
- Follow the testing patterns in the existing codebase
- Document any special testing considerations

## Deployment

- Merged PRs to main branch will trigger the CI/CD pipeline
- Changes are first deployed to staging for validation
- After validation, changes are promoted to production

## Need Help?

If you have questions or need assistance:

- Check the [Troubleshooting Guide](../troubleshooting/README.md)
- Ask for help in the PR comments
- Reach out to the development team

Thank you for contributing to our project!
