/**
 * Pagination utilities
 * 
 * Helper functions for calculating pagination data
 */

/**
 * Pagination data structure
 */
export interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalPosts: number;
  postsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: number | null;
  prevPage: number | null;
}

/**
 * Helper function to calculate pagination data
 * 
 * @param totalPosts - Total number of posts
 * @param currentPage - Current page number (1-indexed)
 * @param postsPerPage - Number of posts per page
 * @returns PaginationData object
 * 
 * @example
 * ```typescript
 * const pagination = calculatePagination(100, 2, 10);
 * // {
 * //   currentPage: 2,
 * //   totalPages: 10,
 * //   totalPosts: 100,
 * //   postsPerPage: 10,
 * //   hasNextPage: true,
 * //   hasPrevPage: true,
 * //   nextPage: 3,
 * //   prevPage: 1,
 * // }
 * ```
 */
export function calculatePagination(
  totalPosts: number,
  currentPage: number,
  postsPerPage: number
): PaginationData {
  const totalPages = Math.ceil(totalPosts / postsPerPage);
  
  return {
    currentPage,
    totalPages,
    totalPosts,
    postsPerPage,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
    nextPage: currentPage < totalPages ? currentPage + 1 : null,
    prevPage: currentPage > 1 ? currentPage - 1 : null,
  };
}
