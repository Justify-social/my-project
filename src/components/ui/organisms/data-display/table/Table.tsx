import React from 'react';
import { cn } from '@/lib/utils';
import { cva, VariantProps } from 'class-variance-authority';

const tableVariants = cva("w-full", {
  variants: {
    variant: {
      default: "border rounded-md",
      outline: "border border-border rounded-md",
      ghost: "bg-transparent",
    },
    size: {
      default: "w-full text-sm",
      sm: "w-full text-xs",
      lg: "w-full text-base",
    }
  },
  defaultVariants: {
    variant: "default",
    size: "default"
  }
});

export interface TableColumn {
  id: string;
  header: React.ReactNode;
  cell: (row: any) => React.ReactNode;
  width?: string;
}

export interface TableProps extends 
  React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof tableVariants> {
  columns: TableColumn[];
  data: any[];
}

const Table = React.forwardRef<HTMLDivElement, TableProps>(
  ({ className, columns, data, variant, size, ...props }, ref) => {
    return (
      <div 
        className={cn(tableVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      >
        <div className="overflow-auto">
          <table className="w-full caption-bottom">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/5 data-[state=selected]:bg-muted">
                {columns.map((column) => (
                  <th
                    key={column.id}
                    className="h-12 px-4 text-left align-middle font-medium text-muted-foreground"
                    style={{ width: column.width }}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {data.map((row, i) => (
                <tr
                  key={row.id || i}
                  className="border-b transition-colors hover:bg-muted/5 data-[state=selected]:bg-muted"
                >
                  {columns.map((column) => (
                    <td
                      key={`${row.id || i}-${column.id}`}
                      className="p-4 align-middle"
                    >
                      {column.cell(row)}
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

Table.displayName = "Table";

export default Table; 