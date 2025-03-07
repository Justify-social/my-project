# Justify.social Brand Guide

**Last Updated:** 2023-07-15  
**Status:** Active  
**Owner:** Design Team

## Overview

This guide documents the official brand guidelines and design system for Justify.social. It defines the visual language, component styling, and design principles to ensure a consistent, cohesive experience across the entire platform. Justify.social captures authentic audience opinions to measure social campaign impact and identify standout influencers for brands.

## Core Brand Colors

Justify.social uses a modern, clean color palette centered around these key colors:

| Color Name | Hex Code | CSS Variable | Usage |
|------------|----------|--------------|-------|
| Jet | #333333 | `--primary-color` | Primary text, headings, icons |
| Payne's Grey | #4A5568 | `--secondary-color` | Secondary text, supporting elements |
| Deep Sky Blue | #00BFFF | `--accent-color` | Buttons, active states, links, key actions |
| White | #FFFFFF | `--background-color` | Background, containers, cards |
| French Grey | #D1D5DB | `--divider-color` | Dividers, borders, separators |

### Color Application Guidelines

- **Primary color** (#333333): Used for primary text content, headings, and major UI elements requiring emphasis
- **Secondary color** (#4A5568): Used for supporting text, secondary information, and subtle UI elements
- **Accent color** (#00BFFF): The brand's signature blue, used sparingly to highlight important actions, active states, and links
- **Background color** (#FFFFFF): Maintains a clean, minimalist white background throughout the application
- **Divider color** (#D1D5DB): Creates subtle separation between elements without sharp visual interruptions

## Typography

Justify.social employs a carefully chosen typography system that balances readability with modern aesthetics:

### Font Families

| Font Purpose | Font Family | Weight | Usage |
|--------------|-------------|--------|-------|
| Headings | Sora | 400, 700 | All headings (H1-H6) |
| Body | Work Sans | 400, 500, 600 | Body text, UI elements, buttons |

### Typography Guidelines

- Headings should use Sora font family for a distinct, professional appearance
- Body text uses Work Sans for excellent readability across different screen sizes
- Maintain appropriate contrast ratios between text and background (minimum 4.5:1)
- Font sizes should follow the established hierarchy from the design system
- Avoid using more than two font families in a single view

## KPI Icons System

Justify.social uses a sophisticated system of KPI (Key Performance Indicator) icons to visually represent different metrics throughout the application. Each KPI has a unique icon, definition, and semantic meaning:

### KPI Icon Set

| KPI Name | Description | Icon Path | Color | Funnel Location |
|----------|-------------|-----------|-------|-----------------|
| Brand Awareness | The increase in recognition of your brand | `/KPIs/Brand_Awareness.svg` | `--accent-color` | Top Funnel |
| Ad Recall | The percentage of people who remember seeing your advertisement | `/KPIs/Ad_Recall.svg` | `--accent-color` | Top Funnel |
| Consideration | The percentage of people considering purchasing from your brand | `/KPIs/Consideration.svg` | `--accent-color` | Mid Funnel |
| Message Association | How well people link your key messages to your brand | `/KPIs/Message_Association.svg` | `--accent-color` | Mid Funnel |
| Brand Preference | Preference for your brand over competitors | `/KPIs/Brand_Preference.svg` | `--accent-color` | Mid Funnel |
| Purchase Intent | Likelihood of purchasing your product or service | `/KPIs/Purchase_Intent.svg` | `--accent-color` | Mid Funnel |
| Action Intent | Likelihood of taking a specific action related to your brand | `/KPIs/Action_Intent.svg` | `--accent-color` | Bottom Funnel |
| Recommendation Intent | Likelihood of recommending your brand to others | `/KPIs/Brand_Preference.svg` | `--accent-color` | Bottom Funnel |
| Advocacy | Willingness to actively promote your brand | `/KPIs/Advocacy.svg` | `--accent-color` | Bottom Funnel |

### KPI Styling Guidelines

- Always display KPI icons with their corresponding title
- Maintain consistent sizing (24px standard, 32px for large variant)
- Apply the blue accent color filter consistently to all KPI icons
- Include tooltips with descriptions and examples when appropriate
- For funnel visualizations, arrange KPIs by their funnel location (Top → Mid → Bottom)

## Navigation Icons System

The application employs a consistent set of navigation icons throughout the interface:

### Navigation Icon Set

| Icon Name | Purpose | SVG Path | Active State |
|-----------|---------|----------|-------------|
| Home | Main dashboard navigation | `/Home.svg` | Blue accent filter |
| Campaigns | Campaign management | `/Campaigns.svg` | Blue accent filter |
| Brand Lift | Brand lift studies | `/Brand_Lift.svg` | Blue accent filter |
| Brand Health | Brand health monitoring | `/Brand_Health.svg` | Blue accent filter |
| Creative Testing | Asset testing | `/Creative_Asset_Testing.svg` | Blue accent filter |
| MMM | Marketing mix modeling | `/MMM.svg` | Blue accent filter |
| Influencers | Influencer management | `/Influencers.svg` | Blue accent filter |
| Reports | Analytics and reporting | `/Reports.svg` | Blue accent filter |
| Billing | Subscription management | `/Billing.svg` | Blue accent filter |
| Settings | Application settings | `/Settings.svg` | Blue accent filter |
| Help | Help resources | `/Help.svg` | Blue accent filter |

### Navigation Item Styling

```css
.nav-item {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  border-radius: 8px;
  margin-bottom: 4px;
  transition: background-color 0.2s ease;
}

.nav-item:hover {
  background-color: rgba(0, 191, 255, 0.1);
}

.nav-item-active {
  background-color: rgba(0, 191, 255, 0.15);
  font-weight: 500;
}
```

## Responsive Design Guidelines

Justify.social is designed to work seamlessly across desktop, tablet, and mobile viewports:

### Breakpoints

| Breakpoint Name | Screen Width | CSS Media Query | Usage |
|-----------------|--------------|----------------|-------|
| Desktop | > 1024px | Default | Full-featured experience |
| Tablet Landscape | ≤ 1024px | `@media (max-width: 1024px)` | Adjusted spacing, streamlined layouts |
| Tablet Portrait | ≤ 768px | `@media (max-width: 768px)` | Simplified navigation, stacked layouts |
| Mobile | ≤ 640px | `@media (max-width: 640px)` | Single-column layouts, optimized for touch |

### Responsive Design Principles

- Use flexible layouts with relative units (%, rem) rather than fixed pixel values
- Implement mobile-first design approach where appropriate
- Ensure touch targets are at least 44×44px on mobile devices
- Adjust font sizes and spacing proportionally across breakpoints
- Convert multi-column layouts to single-column on mobile views
- Ensure all interactive elements are accessible via touch interfaces

## UI Component Styling

### Buttons

```css
.button-primary {
  background-color: var(--accent-color);
  color: white;
  padding: 10px 16px;
  border-radius: 6px;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.button-secondary {
  background-color: transparent;
  color: var(--accent-color);
  border: 1px solid var(--accent-color);
  padding: 10px 16px;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s ease;
}
```

### Cards

```css
.card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  padding: 16px;
  border: 1px solid var(--divider-color);
}

.card-title {
  font-family: 'Sora', sans-serif;
  font-weight: 700;
  margin-bottom: 12px;
  color: var(--primary-color);
}
```

### Form Elements

```css
.input-field {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--divider-color);
  border-radius: 4px;
  font-family: 'Work Sans', sans-serif;
  transition: border-color 0.2s ease;
}

.input-field:focus {
  border-color: var(--accent-color);
  outline: none;
  box-shadow: 0 0 0 2px rgba(0, 191, 255, 0.1);
}
```

## Accessibility Considerations

Justify.social is committed to maintaining WCAG 2.1 AA compliance:

- Ensure color contrast ratios meet or exceed WCAG 2.1 AA standards (4.5:1 for normal text)
- Provide text alternatives for non-text content (like KPI icons)
- Ensure the interface is navigable with keyboard controls
- Implement proper ARIA attributes for custom components
- Design with screen reader compatibility in mind
- Support text resizing up to 200% without loss of functionality

## CSS Variables Reference

```css
:root {
  --primary-color: #333333;      /* Jet */
  --secondary-color: #4A5568;    /* Payne's Grey */
  --accent-color: #00BFFF;       /* Deep Sky Blue */
  --background-color: #FFFFFF;   /* White */
  --divider-color: #D1D5DB;      /* French Grey */
}
```

### Dark Mode Support (Future Enhancement)

While Justify.social currently maintains a light theme even when dark mode is detected, future updates may implement a proper dark theme:

```css
@media (prefers-color-scheme: dark) {
  :root {
    /* Currently unchanged but reserved for future dark theme */
    --background-color: #FFFFFF; /* Keep background white even in dark mode */
    --primary-color: #333333;    /* Keep text dark for readability on white */
  }
}
```

## Implementation Reference

This guide is implemented in the codebase via:

- **global.css**: The central stylesheet defining variables and core styles
- **component-specific styles**: Individual component styles that extend the global foundations
- **Tailwind configuration**: Extensions to the Tailwind theme to align with the brand guidelines

Developers should always reference the CSS variables defined in `global.css` rather than hardcoding color values or styles. 