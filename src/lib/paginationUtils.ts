// src/lib/paginationUtils.ts

interface PaginationResult {
  skip: number;
  take: number;
}

/**
 * Calculates skip and take values for Prisma pagination based on page number and limit.
 *
 * @param page - The current page number (1-indexed).
 * @param limit - The number of items per page.
 * @returns An object containing skip and take values.
 */
export function calculatePagination(page: number, limit: number): PaginationResult {
  const pageNum = Math.max(1, page); // Ensure page is at least 1
  const limitNum = Math.max(1, limit); // Ensure limit is at least 1

  const skip = (pageNum - 1) * limitNum;
  const take = limitNum;

  return { skip, take };
}
