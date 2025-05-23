/**
 * @component Skeleton
 * @category atom
 * @subcategory feedback
 * @description A simple animated placeholder component for loading states.
 * @status 23rd May 2025
 * @author Shadcn UI
 * @since 2023-01-01
 */
import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('animate-pulse rounded-md bg-muted', className)} {...props} />;
}

export { Skeleton };
