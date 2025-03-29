# Pagination Component

A flexible component for navigating through multi-page content with support for large page counts, custom styling, and accessibility features.

## Features

- Responsive design with configurable number of visible pages
- Support for large page counts with intelligent truncation
- First/last and next/previous navigation controls
- Multiple size variants
- Customizable styling and button appearance
- Custom page button rendering
- Keyboard navigation and screen reader support
- Disabled state support

## Usage

```tsx
import { Pagination } from '@/components/ui/molecules/pagination';

function MyComponent() {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 10;
  
  return (
    <div>
      {/* Your content here */}
      
      <Pagination
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `totalPages` | `number` | required | Total number of pages |
| `currentPage` | `number` | required | Current active page (1-based index) |
| `onPageChange` | `(page: number) => void` | required | Callback when a page is clicked |
| `maxVisiblePages` | `number` | `5` | Maximum number of page buttons to show |
| `showFirstLast` | `boolean` | `true` | Whether to show first/last page buttons |
| `showNextPrevious` | `boolean` | `true` | Whether to show next/previous buttons |
| `previousLabel` | `ReactNode` | Icon + "Previous" | Label for the previous button |
| `nextLabel` | `ReactNode` | "Next" + Icon | Label for the next button |
| `renderPageButton` | `(page: number, isActive: boolean) => ReactNode` | undefined | Custom rendering for page buttons |
| `className` | `string` | undefined | Additional class for the container |
| `activeClassName` | `string` | undefined | Additional class for the active page button |
| `buttonClassName` | `string` | undefined | Additional class for all page buttons |
| `disabled` | `boolean` | `false` | Whether to disable the pagination |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size variant for the pagination |

## Examples

### Basic Usage

```tsx
<Pagination
  totalPages={10}
  currentPage={currentPage}
  onPageChange={setCurrentPage}
/>
```

### With Many Pages (Truncation)

```tsx
<Pagination
  totalPages={100}
  currentPage={currentPage}
  onPageChange={setCurrentPage}
/>
```

### Custom Styling

```tsx
<Pagination
  totalPages={10}
  currentPage={currentPage}
  onPageChange={setCurrentPage}
  buttonClassName="font-medium"
  activeClassName="bg-green-600 text-white border-green-600"
/>
```

### Different Sizes

```tsx
// Small
<Pagination
  totalPages={10}
  currentPage={currentPage}
  onPageChange={setCurrentPage}
  size="sm"
/>

// Medium (default)
<Pagination
  totalPages={10}
  currentPage={currentPage}
  onPageChange={setCurrentPage}
  size="md"
/>

// Large
<Pagination
  totalPages={10}
  currentPage={currentPage}
  onPageChange={setCurrentPage}
  size="lg"
/>
```

### Minimal Configuration

```tsx
<Pagination
  totalPages={10}
  currentPage={currentPage}
  onPageChange={setCurrentPage}
  showFirstLast={false}
  previousLabel={<Icon name="fa-angle-left" size="sm" />}
  nextLabel={<Icon name="fa-angle-right" size="sm" />}
/>
```

### Custom Button Rendering

```tsx
<Pagination
  totalPages={10}
  currentPage={currentPage}
  onPageChange={setCurrentPage}
  renderPageButton={(page, isActive) => (
    <div className={`rounded-full w-8 h-8 flex items-center justify-center ${
      isActive ? 'bg-blue-500 text-white' : 'bg-gray-100'
    }`}>
      {page}
    </div>
  )}
  buttonClassName="border-none"
/>
```

## Accessibility

- Uses semantic `<nav>` element with appropriate `aria-label`
- Current page is marked with `aria-current="page"`
- All buttons have appropriate `aria-label` attributes
- First/previous buttons are disabled when on the first page
- Next/last buttons are disabled when on the last page
- Focus styles for keyboard navigation

See `examples/PaginationExamples.tsx` for more implementation examples. 