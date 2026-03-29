/**
 * Cursor-based pagination utilities for efficient large dataset pagination
 * Avoids offset/limit performance issues and prevents N+1 queries
 */

export type PaginationParams = {
  cursor?: string; // Base64-encoded ID of the last item from previous page
  limit: number; // Items per page (1-100)
};

export type PaginatedResult<T> = {
  items: T[];
  hasMore: boolean;
  nextCursor?: string;
  count: number;
};

/**
 * Validates pagination limit (1-100 items per page)
 * Prevents excessive queries and memory usage
 */
export function validatePaginationLimit(limit?: number | string): number {
  const parsed = typeof limit === "string" ? parseInt(limit, 10) : limit;
  const numLimit = isNaN(parsed) ? 20 : parsed;

  // Enforce bounds: minimum 1, maximum 100
  if (numLimit < 1) return 1;
  if (numLimit > 100) return 100;

  return numLimit;
}

/**
 * Decode base64 cursor to get the ID
 */
export function decodeCursor(cursor?: string): string | undefined {
  if (!cursor) return undefined;

  try {
    return Buffer.from(cursor, "base64").toString("utf-8");
  } catch {
    return undefined;
  }
}

/**
 * Encode ID as base64 cursor for next page
 */
export function encodeCursor(id: string): string {
  return Buffer.from(id, "utf-8").toString("base64");
}

/**
 * Build paginated result from items list
 * Used for post-query pagination of in-memory results
 */
export function paginateResults<T extends { id: string }>(
  items: T[],
  cursor: string | undefined,
  limit: number
): PaginatedResult<T> {
  let startIndex = 0;

  if (cursor) {
    const decodedCursor = decodeCursor(cursor);
    startIndex = items.findIndex((item) => item.id === decodedCursor) + 1;

    if (startIndex === 0) {
      // Cursor not found, start from beginning
      startIndex = 0;
    }
  }

  const paginatedItems = items.slice(startIndex, startIndex + limit + 1);
  const hasMore = paginatedItems.length > limit;
  const resultItems = hasMore ? paginatedItems.slice(0, limit) : paginatedItems;

  return {
    items: resultItems,
    hasMore,
    nextCursor: hasMore ? encodeCursor(resultItems[resultItems.length - 1]!.id) : undefined,
    count: items.length,
  };
}

/**
 * Convert pagination params to Prisma skip/take
 * Note: Prisma doesn't support cursor-based natively for all queries,
 * so we use skip/limit pattern based on offset
 *
 * For true cursor-based with Prisma, use:
 * .cursor({ id: lastId })
 * .skip(1) // Skip the cursor item itself
 * .take(limit)
 */
export function getPrismaSkipTake(
  offset: number,
  limit: number
): { skip: number; take: number } {
  return {
    skip: Math.max(0, offset),
    take: limit + 1, // +1 to check if hasMore
  };
}
