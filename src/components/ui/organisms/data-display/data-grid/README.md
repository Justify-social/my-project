# DataGrid Component

The DataGrid component is an advanced table component that extends the standard Table component with enhanced functionality like filtering, searching, row selection, CSV export, and more.

## Features

- **Advanced Filtering**: Filter data by multiple criteria with various operators
- **Row Selection**: Select single or multiple rows with checkboxes
- **Search**: Quick search across specified fields
- **Column Resizing**: Adjust column widths as needed
- **CSV Export**: Export the filtered data to a CSV file
- **Pagination**: Built-in pagination (inherited from Table)
- **Sorting**: Column sorting (inherited from Table)
- **Customizable Toolbars**: Add custom elements to top and bottom toolbars

## Usage

```tsx
import { DataGrid } from '@/components/ui/organisms/data-display/data-grid';
import type { ColumnDef } from '@/components/ui/organisms/data-display/table';

// Define your data type
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string;
}

// Sample data
const users: User[] = [
  { 
    id: '1', 
    name: 'John Doe', 
    email: 'john@example.com', 
    role: 'Admin', 
    status: 'Active', 
    lastLogin: '2023-10-15' 
  },
  // ...more users
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
    accessor: 'status',
    sortable: true,
    cell: ({ row }) => (
      <span className={row.status === 'Active' ? 'text-green-500' : 'text-red-500'}>
        {row.status}
      </span>
    ),
  },
  {
    id: 'lastLogin',
    header: 'Last Login',
    accessor: 'lastLogin',
    sortable: true,
  },
];

// Filter options
const filterOptions = [
  {
    field: 'name',
    label: 'Name',
    operators: [
      { id: 'contains', label: 'Contains' },
      { id: 'startsWith', label: 'Starts with' },
    ],
    type: 'text',
  },
  {
    field: 'role',
    label: 'Role',
    operators: [
      { id: 'equals', label: 'Equals' },
      { id: 'contains', label: 'Contains' },
    ],
    type: 'text',
  },
  {
    field: 'status',
    label: 'Status',
    operators: [
      { id: 'equals', label: 'Equals' },
    ],
    type: 'select',
    options: [
      { value: 'Active', label: 'Active' },
      { value: 'Inactive', label: 'Inactive' },
    ],
  },
];

function UsersTable() {
  return (
    <DataGrid<User>
      data={users}
      columns={columns}
      selectable
      multiSelect
      filterable
      filterOptions={filterOptions}
      searchable
      searchFields={['name', 'email', 'role']}
      exportable
      exportFilename="users-export"
      pagination={{
        pageSize: 10,
        pageIndex: 0,
      }}
    />
  );
}
```

## Props

The DataGrid component extends all props from the Table component and adds the following:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `rowId` | `keyof T \| ((row: T) => string \| number)` | `'id'` | Unique identifier for rows, used for selection |
| `selectable` | `boolean` | `false` | Whether to allow row selection |
| `multiSelect` | `boolean` | `true` | Whether multiple rows can be selected |
| `initialSelectedRowIds` | `Array<string \| number>` | `[]` | Initially selected row IDs |
| `onSelectionChange` | `(selectedRows: T[]) => void` | - | Callback when selection changes |
| `filterable` | `boolean` | `false` | Whether to allow column filtering |
| `filterOptions` | `FilterOption<T>[]` | `[]` | Available filter options |
| `initialFilters` | `Filter<T>[]` | `[]` | Initial filters |
| `resizableColumns` | `boolean` | `false` | Whether to allow column resizing |
| `searchable` | `boolean` | `false` | Whether to show a search box |
| `searchFields` | `Array<keyof T>` | `[]` | Fields to search in |
| `onSearch` | `(term: string) => void` | - | Callback when search term changes |
| `reorderableColumns` | `boolean` | `false` | Whether to allow column reordering |
| `columnVisibility` | `boolean` | `false` | Whether to show column visibility controls |
| `exportable` | `boolean` | `false` | Whether to enable CSV export |
| `exportFilename` | `string` | `'data-export'` | Custom export filename |
| `exportFields` | `Array<keyof T>` | `[]` | Fields to include in export |
| `renderToolbar` | `(gridProps: DataGridContextValue<T>) => React.ReactNode` | - | Custom top toolbar render function |
| `renderBottomToolbar` | `(gridProps: DataGridContextValue<T>) => React.ReactNode` | - | Custom bottom toolbar render function |

## Filter Options

To configure the filters, you need to define `FilterOption` objects:

```typescript
interface FilterOption<T> {
  field: keyof T;
  label: string;
  operators: Array<{
    id: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'gt' | 'gte' | 'lt' | 'lte';
    label: string;
  }>;
  type: 'text' | 'number' | 'date' | 'select';
  options?: Array<{ value: any; label: string }>;
}
```

## Advanced Customization

You can customize the DataGrid by providing custom toolbar render functions:

```tsx
<DataGrid
  // ...other props
  renderToolbar={(gridProps) => (
    <div className="flex justify-between items-center p-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={gridProps.searchTerm}
          onChange={(e) => gridProps.setSearchTerm(e.target.value)}
          placeholder="Search..."
          className="border p-1 rounded"
        />
        <button
          onClick={() => {
            // Custom filter logic
          }}
          className="bg-blue-500 text-white px-3 py-1 rounded"
        >
          Add Filter
        </button>
      </div>
      {gridProps.selectedRows.length > 0 && (
        <div>
          <span>{gridProps.selectedRows.length} selected</span>
          <button
            onClick={gridProps.deselectAllRows}
            className="ml-2 text-gray-500"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  )}
/>
```

## Accessibility

The DataGrid component follows accessibility best practices:

- Proper ARIA attributes for interactive elements
- Keyboard navigation support
- Focus management for elements like checkboxes
- Screen reader friendly content structure

## Relationship to Table Component

The DataGrid component is built on top of the Table component, extending its functionality while maintaining compatibility with all Table props. It adds a layer of advanced features while preserving the core table rendering capabilities.

## Related Components

- [Table](/components/ui/organisms/data-display/table) - Base table component
- [Pagination](/components/ui/molecules/pagination) - Pagination component used by the table 