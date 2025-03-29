# Table Component

A versatile and flexible data table component that supports sorting, pagination, and various styling options. 

## Features

- **Data Sorting**: Sort by columns in ascending or descending order
- **Pagination**: Include page navigation and row count selection
- **Customizable Styling**: Support for various visual styles including striping and hover effects
- **Responsive Design**: Mobile-friendly with column hiding options
- **Accessibility**: Built with proper ARIA attributes and keyboard navigation
- **Custom Cell Rendering**: Flexibility to render custom cell content
- **Empty and Loading States**: Built-in support for data loading and empty states
- **Row Interactions**: Support for row click events and highlighting

## Usage

```tsx
import { Table, type ColumnDef } from '@/components/ui/organisms/data-display/table';

// Define the data type
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  active: boolean;
}

// Sample data
const users: User[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', active: true },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', active: false },
  // more users...
];

// Define columns
const columns: ColumnDef<User>[] = [
  {
    id: 'name',
    header: 'Name',
    accessor: 'name',
    sortable: true,
  },
  {
    id: 'email',
    header: 'Email',
    accessor: 'email',
    sortable: true,
  },
  {
    id: 'role',
    header: 'Role',
    accessor: 'role',
    sortable: true,
  },
  {
    id: 'status',
    header: 'Status',
    accessor: 'active',
    cell: ({ value }) => (
      <span className={value ? 'text-green-500' : 'text-red-500'}>
        {value ? 'Active' : 'Inactive'}
      </span>
    ),
    sortable: true,
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <button 
        className="text-blue-500 hover:text-blue-700"
        onClick={(e) => {
          e.stopPropagation();
          alert(`Edit user ${row.name}`);
        }}
      >
        Edit
      </button>
    ),
    align: 'center',
  },
];

// Basic usage
function BasicTable() {
  return (
    <Table
      data={users}
      columns={columns}
      sortable={true}
      pagination={true}
      pageSize={10}
      onRowClick={(row) => console.log('Clicked row:', row)}
    />
  );
}

// Advanced usage with custom styling
function AdvancedTable() {
  return (
    <Table
      data={users}
      columns={columns}
      sortable={true}
      pagination={true}
      pageSize={5}
      pageSizeOptions={[5, 10, 25]}
      striped={true}
      hoverable={true}
      bordered={true}
      compact={false}
      stickyHeader={true}
      headerBgColor="blue"
      defaultSort={{ column: 'name', direction: 'asc' }}
      emptyState={<div>No users found</div>}
      loadingState={<div>Loading users...</div>}
    />
  );
}
```

## Props

### TableProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| data | T[] | - | Data array to display in the table |
| columns | ColumnDef<T>[] | - | Column definitions |
| sortable | boolean | true | Whether to enable sorting |
| defaultSort | { column: keyof T; direction: SortDirection } | undefined | Default sort column and direction |
| pagination | boolean | false | Whether to use pagination |
| pageSize | number | 10 | Default page size |
| pageSizeOptions | number[] | [5, 10, 25, 50] | Available page size options |
| striped | boolean | false | Whether to show zebra striping |
| hoverable | boolean | true | Whether to show hover effects on rows |
| bordered | boolean | true | Whether to show borders |
| compact | boolean | false | Whether to use compact sizing |
| className | string | undefined | Custom CSS class for the table |
| containerClassName | string | undefined | Custom CSS class for the table container |
| stickyHeader | boolean | false | Whether the table has a sticky header |
| emptyState | ReactNode | undefined | Custom empty state component |
| loadingState | ReactNode | undefined | Custom loading state component |
| isLoading | boolean | false | Whether the table is in a loading state |
| ariaLabel | string | 'Data table' | Aria label for the table |
| onRowClick | (row: T) => void | undefined | Callback when a row is clicked |
| highlightedRowIndex | number | undefined | Index of row to highlight |
| headerBgColor | 'white' \| 'gray' \| 'blue' | 'white' | Background color for the header |

### ColumnDef

| Prop | Type | Description |
|------|------|-------------|
| id | string | Unique identifier for the column |
| header | string \| ReactNode | Header title or custom render function |
| accessor | keyof T \| ((row: T) => any) | Accessor function or key to get the cell value |
| cell | (props: { row: T; value: any }) => ReactNode | Custom cell renderer |
| sortable | boolean | Whether the column is sortable |
| sortFn | (a: T, b: T, direction: SortDirection) => number | Custom sort function |
| width | string | Column width (e.g., "100px", "20%") |
| className | string | Custom CSS class for the cell |
| align | 'left' \| 'center' \| 'right' | Text alignment for the cell |
| hideOnMobile | boolean | Whether to hide the column on small screens |

### TableCellProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | ReactNode | - | Cell content |
| align | 'left' \| 'center' \| 'right' | 'left' | Text alignment |
| className | string | undefined | Additional CSS classes |

## Accessibility

The Table component implements proper accessibility features:

- Uses semantic HTML table elements
- Includes proper ARIA attributes for sorting (`aria-sort`)
- Provides keyboard navigation support for pagination controls
- Uses appropriate labels for interactive elements
- Manages focus states correctly
- Includes screen reader text for pagination controls

## Related Components

- **DataGrid**: A more advanced version of the table with additional features
- **Pagination**: Can be used independently for other lists
- **LoadingSkeleton**: For more advanced loading states 