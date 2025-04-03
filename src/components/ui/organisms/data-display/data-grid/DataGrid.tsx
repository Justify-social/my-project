import React from 'react';
import { cn } from '@/lib/utils';
import { cva, VariantProps } from 'class-variance-authority';

const dataGridVariants = cva("w-full", {
  variants: {
    variant: {
      default: "border rounded-md",
      outline: "border border-border rounded-md",
      ghost: "bg-transparent",
    },
    size: {
      default: "w-full",
      sm: "w-full text-sm",
      lg: "w-full text-lg",
    }
  },
  defaultVariants: {
    variant: "default",
    size: "default"
  }
});

export interface Column {
  field: string;
  headerName: string;
  width?: number;
  flex?: number;
  renderCell?: (params: any) => React.ReactNode;
}

export interface DataGridProps extends 
  React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof dataGridVariants> {
  columns: Column[];
  data: any[];
}

const DataGrid = React.forwardRef<HTMLDivElement, DataGridProps>(
  ({ className, columns, data, variant, size, ...props }, ref) => {
    return (
      <div 
        className={cn(dataGridVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      >
        <div className="overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                {columns.map((column) => (
                  <th 
                    key={column.field}
                    className="h-12 px-4 text-left align-middle font-medium text-muted-foreground"
                    style={{ width: column.width ? `${column.width}px` : 'auto' }}
                  >
                    {column.headerName}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIndex) => (
                <tr 
                  key={row.id || rowIndex}
                  className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                >
                  {columns.map((column) => (
                    <td 
                      key={`${row.id || rowIndex}-${column.field}`} 
                      className="p-4 align-middle"
                      style={{ width: column.width ? `${column.width}px` : 'auto' }}
                    >
                      {column.renderCell 
                        ? column.renderCell(row) 
                        : row[column.field]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
);

DataGrid.displayName = "DataGrid";

export default DataGrid; 