
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TableProps extends React.HTMLAttributes<HTMLTableElement> {}

export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, ...props }, ref) => {
    return (
      <table
        className={cn('ui-table', className)}
        ref={ref}
        {...props}
      />
    );
  }
);

Table.displayName = 'Table';

export interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

export const TableHeader = React.forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className, ...props }, ref) => {
    return (
      <thead
        className={cn('ui-table-header', className)}
        ref={ref}
        {...props}
      />
    );
  }
);

TableHeader.displayName = 'TableHeader';

export interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

export const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className, ...props }, ref) => {
    return (
      <tbody
        className={cn('ui-table-body', className)}
        ref={ref}
        {...props}
      />
    );
  }
);

TableBody.displayName = 'TableBody';

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {}

export const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, ...props }, ref) => {
    return (
      <tr
        className={cn('ui-table-row', className)}
        ref={ref}
        {...props}
      />
    );
  }
);

TableRow.displayName = 'TableRow';

export interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {}

export const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, ...props }, ref) => {
    return (
      <th
        className={cn('ui-table-head', className)}
        ref={ref}
        {...props}
      />
    );
  }
);

TableHead.displayName = 'TableHead';

export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {}

export const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, ...props }, ref) => {
    return (
      <td
        className={cn('ui-table-cell', className)}
        ref={ref}
        {...props}
      />
    );
  }
);

TableCell.displayName = 'TableCell';

/**
 * table - Combined component exporting all subcomponents
 * 
 * This component is the default export to ensure compatibility with dynamic imports.
 */
const table = {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
};

export default table;
