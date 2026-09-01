import React from 'react';
import { useAdminDate } from '../../context/AdminDateContext';
import { Calendar as CalendarIcon, RotateCcw } from 'lucide-react';

const AdminDatePicker = ({ label = 'Filter by Date' }) => {
  const { selectedDate, setSelectedDate, resetToToday, clearDateFilter, isToday, isAllTime } = useAdminDate();

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <div className="flex items-center space-x-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-1.5 shadow-sm">
        <CalendarIcon className="h-4 w-4 text-brand-500 shrink-0" />
        <span className="text-neutral-500 font-medium hidden sm:inline">{label}:</span>
        <input
          type="date"
          value={selectedDate || ''}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="bg-transparent text-neutral-900 dark:text-white font-semibold focus:outline-none cursor-pointer text-xs"
        />
      </div>

      {!isAllTime && (
        <button
          type="button"
          onClick={clearDateFilter}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 transition-colors shadow-sm"
          title="Show All Historical Records"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Show All Records</span>
        </button>
      )}

      {isAllTime && (
        <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-200 dark:border-emerald-500/20">
          Showing All Time Records
        </span>
      )}
    </div>
  );
};

export default AdminDatePicker;

