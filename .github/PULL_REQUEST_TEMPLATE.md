# Pull Request Template

## Description
Please provide a brief description of the changes in this pull request.

## Related Issues
- Link to related issues or tickets (if any).

## Checklist
Ensure your changes adhere to the following standards before requesting a review:

- [ ] **Single Source of Truth (SSOT)**: All styles are defined in `globals.css` or use Tailwind CSS classes; no inline styles or custom CSS outside the central stylesheet.
- [ ] **Code Quality**: Code adheres to ESLint and Prettier formatting rules; `lint:fix` and `lint:format` have been run.
- [ ] **Security**: No hardcoded secrets or API keys; dependencies are up-to-date with no known vulnerabilities.
- [ ] **Performance**: Changes do not introduce unnecessary re-renders, large bundle size increases, or unoptimized database queries.
- [ ] **Testing**: Relevant unit, integration, or end-to-end tests have been added or updated; test coverage is maintained.
- [ ] **Documentation**: Changes are documented in code comments or README files if applicable.
- [ ] **Accessibility**: UI changes comply with WCAG 2.1 guidelines (ARIA attributes, keyboard navigation).

## Additional Notes
Add any additional context or information for reviewers. 