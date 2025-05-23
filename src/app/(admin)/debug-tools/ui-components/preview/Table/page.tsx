import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table'; // Import Table components

// Sample Data for Table
const invoices = [
  {
    invoice: 'INV001',
    paymentStatus: 'Paid',
    totalAmount: '$250.00',
    paymentMethod: 'Credit Card',
  },
  {
    invoice: 'INV002',
    paymentStatus: 'Pending',
    totalAmount: '$150.00',
    paymentMethod: 'PayPal',
  },
  {
    invoice: 'INV003',
    paymentStatus: 'Unpaid',
    totalAmount: '$350.00',
    paymentMethod: 'Bank Transfer',
  },
  {
    invoice: 'INV004',
    paymentStatus: 'Paid',
    totalAmount: '$450.00',
    paymentMethod: 'Credit Card',
  },
  {
    invoice: 'INV005',
    paymentStatus: 'Paid',
    totalAmount: '$550.00',
    paymentMethod: 'PayPal',
  },
];

const statusStyles: Record<string, string> = {
  stable: 'bg-green-100 text-green-800 border-green-200',
  beta: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  deprecated: 'bg-red-100 text-red-800 border-red-200',
  development: 'bg-blue-100 text-blue-800 border-blue-200',
};

export default function TablePreviewPage() {
  const componentMeta = {
    name: 'Table',
    description: 'Renders data in a tabular format.',
    category: 'organism',
    subcategory: 'display',
    renderType: 'server',
    status: 'stable',
    author: 'Shadcn UI',
    since: '2023-01-01',
  };
  // const examples: string[] = []; // Removed examples array

  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-secondary">
          <ol className="list-none p-0 inline-flex space-x-2">
            <li className="flex items-center">
              <Link href="/debug-tools/ui-components" className="hover:text-Interactive">
                UI Components
              </Link>
            </li>
            <li className="flex items-center">
              <span className="mx-2">/</span>
              <span className="capitalize">{componentMeta.category}</span>
            </li>
            {componentMeta.subcategory && (
              <li className="flex items-center">
                <span className="mx-2">/</span>
                <span className="capitalize">{componentMeta.subcategory}</span>
              </li>
            )}
            <li className="flex items-center">
              <span className="mx-2">/</span>
              <span className="font-medium text-primary">{componentMeta.name}</span>
            </li>
          </ol>
        </nav>

        {/* Header Section */}
        <div className="mb-8 border-b border-divider pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-3xl font-bold text-primary mb-2 sm:mb-0">{componentMeta.name}</h1>
            <div className="flex items-center space-x-3 text-sm">
              {componentMeta.status && (
                <Badge
                  variant="outline"
                  className={cn(
                    'font-medium',
                    statusStyles[componentMeta.status] || statusStyles.development
                  )}
                >
                  {componentMeta.status}
                </Badge>
              )}
              <span className="text-secondary capitalize">
                ({componentMeta.renderType || 'N/A'})
              </span>
            </div>
          </div>
          {componentMeta.description && (
            <p className="mt-2 text-secondary max-w-3xl">{componentMeta.description}</p>
          )}
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
            {componentMeta.author && <span>Author: {componentMeta.author}</span>}
            {componentMeta.since && <span>Since: {componentMeta.since}</span>}
          </div>
        </div>

        {/* Examples Section (Rendering the actual component) */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-primary">Examples / Usage</h2>
          <div className="space-y-6">
            {/* ---- ADD YOUR RENDERING EXAMPLES MANUALLY BELOW ---- */}

            {/* Example 1: Basic Table */}
            <div className="border border-divider rounded-lg p-6">
              <h3 className="text-lg font-medium mb-3">Invoice Table</h3>
              <Table>
                <TableCaption>A list of your recent invoices.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Invoice</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map(invoice => (
                    <TableRow key={invoice.invoice}>
                      <TableCell className="font-medium">{invoice.invoice}</TableCell>
                      <TableCell>{invoice.paymentStatus}</TableCell>
                      <TableCell>{invoice.paymentMethod}</TableCell>
                      <TableCell className="text-right">{invoice.totalAmount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={3}>Total</TableCell>
                    <TableCell className="text-right">$1,750.00</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>

            {/* ---- END MANUAL EXAMPLES ---- */}
          </div>
        </div>

        {/* Code Snippets Section - Removed */}
        {/* {examples && examples.length > 0 && ( ... )} */}
      </div>
    </React.Suspense>
  );
}
