/**
 * @component Skeleton
 * @category atom
 * @subcategory feedback
 * @description Used to represent a loading state of a component.
 */
import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }
