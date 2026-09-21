import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  scrollTargetId?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  limit,
  onPageChange,
  onLimitChange,
  scrollTargetId,
}: PaginationProps) {
  if (totalPages <= 1 && totalItems <= limit) {
    return null;
  }

  const handlePageSelect = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    onPageChange(page);

    // Scroll to top of listing
    if (scrollTargetId) {
      const target = document.getElementById(scrollTargetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
    window.scrollTo({ top: 200, behavior: 'smooth' });
  };

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav
      id="product-discovery-pagination"
      aria-label="Product pages navigation"
      className="flex flex-col sm:flex-row items-center justify-between gap-4 py-8 border-t border-neutral-200 dark:border-neutral-800 mt-8"
    >
      {/* Page Size Selector */}
      {onLimitChange && (
        <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
          <span>Items per page:</span>
          <select
            id="pagination-limit-select"
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="rounded-lg border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-800 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 focus:outline-none focus:ring-1 focus:ring-neutral-900 cursor-pointer"
          >
            <option value={6}>6</option>
            <option value={9}>9</option>
            <option value={12}>12</option>
            <option value={18}>18</option>
          </select>
        </div>
      )}

      {/* Numbered Controls */}
      <div className="flex items-center gap-1.5">
        {/* First Page */}
        <Button
          id="pagination-first-btn"
          variant="outline"
          size="sm"
          onClick={() => handlePageSelect(1)}
          disabled={currentPage === 1}
          className="h-8 w-8 p-0 hidden sm:inline-flex"
          aria-label="Go to first page"
        >
          <ChevronsLeft className="h-3.5 w-3.5" />
        </Button>

        {/* Previous Page */}
        <Button
          id="pagination-prev-btn"
          variant="outline"
          size="sm"
          onClick={() => handlePageSelect(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-8 w-8 p-0"
          aria-label="Go to previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((num, idx) => {
            if (num === '...') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-2 text-xs text-neutral-400 select-none"
                >
                  &hellip;
                </span>
              );
            }

            const pageNum = num as number;
            const isCurrent = pageNum === currentPage;

            return (
              <button
                key={`page-${pageNum}`}
                id={`pagination-page-${pageNum}-btn`}
                onClick={() => handlePageSelect(pageNum)}
                aria-current={isCurrent ? 'page' : undefined}
                className={`h-8 min-w-8 rounded-lg px-2 text-xs font-medium transition-colors ${
                  isCurrent
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                    : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Next Page */}
        <Button
          id="pagination-next-btn"
          variant="outline"
          size="sm"
          onClick={() => handlePageSelect(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-8 w-8 p-0"
          aria-label="Go to next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Last Page */}
        <Button
          id="pagination-last-btn"
          variant="outline"
          size="sm"
          onClick={() => handlePageSelect(totalPages)}
          disabled={currentPage === totalPages}
          className="h-8 w-8 p-0 hidden sm:inline-flex"
          aria-label="Go to last page"
        >
          <ChevronsRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </nav>
  );
}
