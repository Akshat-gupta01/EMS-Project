import React from 'react';
import { HiArrowLeft, HiArrowRight } from 'react-icons/hi';

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange
}) {
  return (
    <div className="flex items-center justify-center py-4 border-t border-slate-100">
      <div className="flex items-center gap-8">
        {/* Previous Button */}
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange && onPageChange(currentPage - 1)}
          className="rounded-md border border-slate-300 p-2.5 text-center text-sm transition-all shadow-sm hover:shadow-lg text-slate-600 hover:text-white hover:bg-slate-800 hover:border-slate-800 focus:text-white focus:bg-slate-800 focus:border-slate-800 active:border-slate-800 active:text-white active:bg-slate-800 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none cursor-pointer flex items-center justify-center"
        >
          <HiArrowLeft className="w-4 h-4" />
        </button>

        {/* Page Info */}
        <p className="text-slate-600 text-sm">
          Page <strong className="text-slate-800">{currentPage}</strong> of&nbsp;
          <strong className="text-slate-800">{totalPages || 1}</strong>
        </p>

        {/* Next Button */}
        <button
          type="button"
          disabled={currentPage >= totalPages || totalPages === 0}
          onClick={() => onPageChange && onPageChange(currentPage + 1)}
          className="rounded-md border border-slate-300 p-2.5 text-center text-sm transition-all shadow-sm hover:shadow-lg text-slate-600 hover:text-white hover:bg-slate-800 hover:border-slate-800 focus:text-white focus:bg-slate-800 focus:border-slate-800 active:border-slate-800 active:text-white active:bg-slate-800 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none cursor-pointer flex items-center justify-center"
        >
          <HiArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
