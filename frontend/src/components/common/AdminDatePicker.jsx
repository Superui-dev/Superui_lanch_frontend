import React from 'react';
import { useAdminDate } from '../../context/AdminDateContext';
import { Calendar as CalendarIcon, RotateCcw } from 'lucide-react';

const AdminDatePicker = ({ label = 'Filter by Date' }) => {
  const {
    dateRange,
    setStart,
    setEnd,
    resetToToday,
    resetToWeek,
    showAllTime,
    isAllTime,
    isTodayOnly,
    isCurrentWeek
  } = useAdminDate();

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <div className="flex items-center space-x-2 bg-white border border-neutral-200 rounded-xl px-3 py-1.5 shadow-sm">
        <CalendarIcon className="h-4 w-4 text-brand-500 shrink-0" />
        <span className="text-neutral-500 font-medium hidden sm:inline">{label}:</span>

        <div className="flex items-center gap-1.5">
          <input
            type="date"
            value={dateRange.start || ''}
            max={dateRange.end || todayStr}
            onChange={(e) => setStart(e.target.value)}
            className="bg-transparent text-neutral-900 font-semibold focus:outline-none cursor-pointer text-xs w-[130px]"
            style={{ colorScheme: 'light' }}
            placeholder="From"
          />
          <span className="text-neutral-400 font-medium">→</span>
          <input
            type="date"
            value={dateRange.end || ''}
            min={dateRange.start || ''}
            max={todayStr}
            onChange={(e) => setEnd(e.target.value)}
            className="bg-transparent text-neutral-900 font-semibold focus:outline-none cursor-pointer text-xs w-[130px]"
            style={{ colorScheme: 'light' }}
            placeholder="To"
          />
        </div>
      </div>

      {/* Quick Presets */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={resetToToday}
          className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-colors border ${
            isTodayOnly
              ? 'bg-brand-600 text-white border-brand-600'
              : 'bg-white text-neutral-600 border-neutral-200 hover:border-brand-500 hover:text-brand-600'
          }`}
        >
          Today
        </button>
        <button
          type="button"
          onClick={resetToWeek}
          className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-colors border ${
            isCurrentWeek
              ? 'bg-brand-600 text-white border-brand-600'
              : 'bg-white text-neutral-600 border-neutral-200 hover:border-brand-500 hover:text-brand-600'
          }`}
        >
          This Week
        </button>
        <button
          type="button"
          onClick={showAllTime}
          className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-colors border ${
            isAllTime
              ? 'bg-brand-600 text-white border-brand-600'
              : 'bg-white text-neutral-600 border-neutral-200 hover:border-brand-500 hover:text-brand-600'
          }`}
        >
          All Time
        </button>
      </div>

      {isAllTime && (
        <span className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider border border-emerald-200">
          Showing All Time Records
        </span>
      )}
    </div>
  );
};

export default AdminDatePicker;

