import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalItems, itemsPerPage = 10, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  if (totalItems === 0) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 pb-2 px-6 border-t border-neutral-200 text-xs">
      <p className="text-neutral-500 font-medium">
        Showing <span className="font-semibold text-neutral-900">{startItem}</span> to{' '}
        <span className="font-semibold text-neutral-900">{endItem}</span> of{' '}
        <span className="font-semibold text-neutral-900">{totalItems}</span> items
      </p>

      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Previous Page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <span className="font-semibold text-neutral-700 px-3">
          Page {currentPage} of {totalPages}
        </span>

        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          className="p-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Next Page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;

