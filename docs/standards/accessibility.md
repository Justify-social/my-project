# Accessibility (a11y) Standards

**Last Reviewed:** 2025-05-09
**Status:** Draft (Needs Review & Expansion)

## 1. Overview

This document outlines the accessibility standards and guidelines for the Justify platform. Our goal is to ensure the application is usable and understandable by everyone, including people with disabilities, by aiming for **WCAG 2.1 Level AA** compliance.

_(Action: Accessibility Lead/Frontend Lead to review, expand, and formally adopt these standards.)_

## 2. Target Standard

- **Standard:** Web Content Accessibility Guidelines (WCAG) 2.1
- **Conformance Level:** AA
- **Reference:** [https://www.w3.org/TR/WCAG21/](https://www.w3.org/TR/WCAG21/)

## 3. Key Principles (POUR)

Development must adhere to the four core principles of accessibility:

- **Perceivable:** Users must be able to perceive the information being presented (it can't be invisible to all of their senses).
- **Operable:** Users must be able to operate the interface (the interface cannot require interaction that a user cannot perform).
- **Understandable:** Users must be able to understand the information as well as the operation of the user interface (the content or operation cannot be beyond their understanding).
- **Robust:** Users must be able to access the content as technologies advance (as technologies and user agents evolve, the content should remain accessible).

## 4. Specific Guidelines & Best Practices (React/Next.js/Shadcn/Tailwind)

- **Semantic HTML:**
  - Use native HTML elements (`<button>`, `<nav>`, `<main>`, `<h1>`-`<h6>`, `<ul>`, etc.) correctly based on their semantic meaning.
  - Avoid using `<div>` or `<span>` for interactive elements; use `<button>` or `<a>` with appropriate attributes.
- **Keyboard Navigation:**
  - All interactive elements (links, buttons, form inputs, custom controls) MUST be focusable and operable using the keyboard alone (Tab, Shift+Tab, Enter, Space, Arrow Keys).
  - Ensure a logical and intuitive focus order. Use `tabIndex="0"` for custom interactive elements and `tabIndex="-1"` to remove elements from the natural tab order when appropriate (e.g., managing focus within a modal).
  - Visible focus indicators MUST be present and clear (Tailwind's `focus-visible:` utilities are preferred over generic `focus:`).
- **Focus Management:**
  - For dynamic UI changes (modals, popovers, expanding sections), manage focus programmatically. When a modal opens, focus should move into it. When it closes, focus should return to the element that triggered it.
  - Leverage Radix UI primitives (used by Shadcn) which often handle focus management internally.
- **Images (`next/image`):**
  - Provide descriptive `alt` text for all images conveying information.
  - Use `alt=""` for purely decorative images.
  - Ensure `width` and `height` are provided to prevent layout shifts.
- **Forms (`react-hook-form`, Shadcn Components):**
  - Associate `<label>` elements explicitly with their controls using `htmlFor` matching the control's `id`.
  - Use `aria-describedby` to link error messages or instructions to form fields.
  - Ensure validation errors are clearly communicated visually and programmatically.
  - Group related controls using `<fieldset>` and `<legend>` where appropriate.
- **Color Contrast:**
  - Ensure text and interactive elements have sufficient contrast against their background (WCAG AA: 4.5:1 for normal text, 3:1 for large text/UI components).
  - Use browser developer tools or online contrast checkers to verify.
  - Do not rely on color alone to convey information.
- **ARIA Attributes:**
  - Use ARIA (`role`, `aria-*` attributes) primarily when semantic HTML is insufficient (e.g., for complex custom components like tabs, accordions, custom menus).
  - Leverage the ARIA implementations provided by Radix UI primitives within Shadcn components where possible.
  - Avoid redundant or incorrect ARIA usage (e.g., adding `role="button"` to a `<button>` element).
  - Use `aria-live` regions for announcing dynamic content changes (e.g., toast notifications, validation errors).
- **Content & Structure:**
  - Use proper heading levels (`<h1>` to `<h6>`) to structure page content logically.
  - Write clear and concise link text that describes the destination.
  - Provide alternatives for multimedia content (captions, transcripts).

## 5. Testing & Verification

Accessibility testing should be integrated throughout the development process:

- **Automated Linting:** Use `eslint-plugin-jsx-a11y` (configured via ESLint config) to catch common issues during development.
- **Automated Testing (CI/E2E):** Integrate automated accessibility checks (e.g., using `axe-core` with Jest/RTL or Cypress) into the CI pipeline to catch regressions.
- **Manual Keyboard Testing:** Regularly navigate and interact with features using only the keyboard.
- **Screen Reader Testing:** Perform periodic checks using major screen readers (NVDA on Windows, VoiceOver on macOS, TalkBack on Android).
- **Browser Tools:** Use browser extensions like Axe DevTools, WAVE, or built-in accessibility inspectors.
- **Checklists:** Utilize WCAG 2.1 AA checklists during development and QA.

## 6. Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/TR/WCAG21/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/TR/wai-aria-practices-1.1/)
- [A11Y Project Checklist](https://www.a11yproject.com/checklist/)
- [WebAIM](https://webaim.org/)
- [Shadcn UI Accessibility](https://ui.shadcn.com/docs/installation#accessibility) (Leverages Radix UI)
- [Radix UI Accessibility](https://www.radix-ui.com/primitives/docs/overview/accessibility)

Building an accessible application is a continuous effort and a responsibility for the entire team.
