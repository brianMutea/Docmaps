'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PaginationData } from '@/lib/blog/pagination-utils';

// Re-export types and utilities from pagination-utils
export type { PaginationData } from '@/lib/blog/pagination-utils';
export { calculatePagination } from '@/lib/blog/pagination-utils';

interface PaginationProps {
  pagination: PaginationData;
  basePath?: string;
}

/**
 * Pagination component for blog post listings
 * 
 * Features:
 * - Page numbers with current page highlighting
 * - Previous and next navigation buttons
 * - Handles edge cases (first/last page)
 * - Responsive design matching DocMaps style
 * - Smart page number display (shows ellipsis for large page counts)
 * 
 * @param pagination - Pagination data including current page, total pages, etc.
 * @param basePath - Base URL path for pagination links (default: '/blog')
 * 
 * @example
 * ```tsx
 * const pagination = {
 *   currentPage: 2,
 *   totalPages: 10,
 *   totalPosts: 100,
 *   postsPerPage: 10,
 *   hasNextPage: true,
 *   hasPrevPage: true,
 *   nextPage: 3,
 *   prevPage: 1,
 * };
 * 
 * <Pagination pagination={pagination} basePath="/blog" />
 * ```
 */
export function Pagination({ pagination, basePath = '/blog' }: PaginationProps) {
  const { currentPage, totalPages, hasNextPage, hasPrevPage, nextPage, prevPage } = pagination;

  // Don't render pagination if there's only one page
  if (totalPages <= 1) {
    return null;
  }

  /**
   * Generate URL for a specific page
   */
  const getPageUrl = (page: number): string => {
    if (page === 1) {
      return basePath;
    }
    return `${basePath}?page=${page}`;
  };

  /**
   * Generate array of page numbers to display
   * Shows: [1] ... [current-1] [current] [current+1] ... [totalPages]
   */
  const getPageNumbers = (): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = [];
    const showEllipsis = totalPages > 7;

    if (!showEllipsis) {
      // Show all pages if total is 7 or less
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    // Always show first page
    pages.push(1);

    if (currentPage > 3) {
      pages.push('ellipsis');
    }

    // Show pages around current page
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push('ellipsis');
    }

    // Always show last page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav
      className="flex items-center justify-center gap-2 mt-8"
      aria-label="Pagination"
    >
      {/* Previous button */}
      {hasPrevPage && prevPage !== null ? (
        <Link
          href={getPageUrl(prevPage)}
          className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-neutral-300 bg-neutral-800 border border-neutral-700 rounded-lg hover:bg-neutral-700 hover:border-neutral-600 transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Previous</span>
        </Link>
      ) : (
        <button
          disabled
          className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-neutral-600 bg-neutral-800 border border-neutral-700 rounded-lg cursor-not-allowed opacity-50"
          aria-label="Previous page (disabled)"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Previous</span>
        </button>
      )}

      {/* Page numbers */}
      <div className="flex items-center gap-1">
        {pageNumbers.map((page, index) => {
          if (page === 'ellipsis') {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-3 py-2 text-sm text-neutral-500"
                aria-hidden="true"
              >
                ...
              </span>
            );
          }

          const isCurrentPage = page === currentPage;

          return isCurrentPage ? (
            <span
              key={page}
              className="inline-flex items-center justify-center min-w-[40px] px-3 py-2 text-sm font-semibold text-white bg-primary-600 border border-primary-600 rounded-lg"
              aria-current="page"
              aria-label={`Page ${page} (current)`}
            >
              {page}
            </span>
          ) : (
            <Link
              key={page}
              href={getPageUrl(page)}
              className="inline-flex items-center justify-center min-w-[40px] px-3 py-2 text-sm font-medium text-neutral-300 bg-neutral-800 border border-neutral-700 rounded-lg hover:bg-neutral-700 hover:border-neutral-600 transition-colors"
              aria-label={`Go to page ${page}`}
            >
              {page}
            </Link>
          );
        })}
      </div>

      {/* Next button */}
      {hasNextPage && nextPage !== null ? (
        <Link
          href={getPageUrl(nextPage)}
          className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-neutral-300 bg-neutral-800 border border-neutral-700 rounded-lg hover:bg-neutral-700 hover:border-neutral-600 transition-colors"
          aria-label="Next page"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <button
          disabled
          className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-neutral-600 bg-neutral-800 border border-neutral-700 rounded-lg cursor-not-allowed opacity-50"
          aria-label="Next page (disabled)"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </nav>
  );
}
