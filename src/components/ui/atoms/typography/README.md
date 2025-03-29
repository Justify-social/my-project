# Typography Components

The Typography components provide a consistent and accessible way to style text content throughout the application, following atomic design principles.

## Font Families

The application uses the following font families:

- **Primary Font (Headings)**: Sora
- **Secondary Font (Body)**: Work Sans
- **Monospace Font (Code)**: Mono

## Components

- **Heading**: For h1-h6 heading elements with adjustable size, weight, and style
- **Text**: For inline text elements with various styles, sizes, and colors
- **Paragraph**: For block-level text content with spacing control 
- **Blockquote**: For quoted content with optional attribution
- **Code**: For displaying code snippets inline or in blocks

## Usage

```tsx
import { 
  Heading, 
  Text, 
  Paragraph, 
  Blockquote, 
  Code 
} from '@/components/ui/atoms/typography';

function ExampleComponent() {
  return (
    <div>
      <Heading level={1}>Page Title</Heading>
      
      <Paragraph>
        This is a paragraph with <Text weight="bold">bold text</Text> and 
        <Text color="primary"> primary colored text</Text>.
      </Paragraph>
      
      <Blockquote cite="Author Name">
        This is a quote with attribution.
      </Blockquote>
      
      <Code>const example = "This is inline code";</Code>
      
      <Code block>{`
// This is a code block
function example() {
  return "Hello World";
}
      `}</Code>
    </div>
  );
}
```

## Component Props

### Heading

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| level | 1-6 | 2 | HTML heading level (h1-h6) |
| size | 'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl' \| '3xl' \| '4xl' | Based on level | Text size |
| weight | 'light' \| 'normal' \| 'medium' \| 'semibold' \| 'bold' \| 'extrabold' | 'semibold' | Font weight |
| truncate | boolean | false | Whether to truncate with ellipsis |
| className | string | - | Additional class names |

### Text

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| as | 'span' \| 'div' \| 'p' \| 'label' | 'span' | Element to render |
| size | 'xs' \| 'sm' \| 'base' \| 'lg' \| 'xl' | 'base' | Text size |
| weight | 'light' \| 'normal' \| 'medium' \| 'semibold' \| 'bold' | 'normal' | Font weight |
| color | 'default' \| 'muted' \| 'primary' \| 'secondary' \| 'accent' \| 'success' \| 'warning' \| 'danger' | 'default' | Text color |
| truncate | boolean | false | Whether to truncate with ellipsis |
| className | string | - | Additional class names |

### Paragraph

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| size | 'sm' \| 'base' \| 'lg' | 'base' | Text size |
| color | 'default' \| 'muted' \| 'primary' \| 'secondary' | 'default' | Text color |
| spaced | boolean | true | Whether to add bottom margin |
| className | string | - | Additional class names |

### Blockquote

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| size | 'sm' \| 'base' \| 'lg' | 'base' | Text size |
| bordered | boolean | true | Whether to show left border |
| cite | string | - | Attribution/citation for the quote |
| className | string | - | Additional class names |

### Code

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| size | 'xs' \| 'sm' \| 'base' \| 'lg' \| 'xl' | 'sm' | Text size |
| block | boolean | false | Whether to display as a code block |
| className | string | - | Additional class names |

## Accessibility

These typography components are designed with accessibility in mind:

- **Semantic HTML**: Using proper heading levels and semantic elements
- **Color contrast**: Text colors meet WCAG AA standards
- **Responsive sizing**: All components scale appropriately across devices
- **Customizable**: Options allow for accessible customization while maintaining brand consistency

## Font Implementation

The application's fonts are implemented as follows:

- **Sora**: Used for headings and titles to create a modern, distinctive appearance
- **Work Sans**: Used for body text, paragraphs, and UI elements for optimal readability
- **Mono**: Used for code snippets, ensuring clear distinction of code elements

These fonts are loaded globally through the application's CSS and applied via utility classes or component-specific styles.

## Examples

See the examples directory for comprehensive demonstrations of each component.

```tsx
import { TypographyExamples } from '@/components/ui/atoms/typography/examples';

// Renders a showcase of all typography components and their variants
```
