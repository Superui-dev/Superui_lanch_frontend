import React, { createContext, useState, useContext, useEffect } from 'react';

const AdminDateContext = createContext(null);

const getStartOfWeek = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const formatDate = (d) => {
  if (!d) return '';
  return new Date(d).toISOString().split('T')[0];
};

export const AdminDateProvider = ({ children }) => {
  const today = new Date();
  const startOfWeek = getStartOfWeek(today);

  const [dateRange, setDateRange] = useState({
    start: formatDate(startOfWeek),
    end: formatDate(today)
  });

  const setStart = (start) => setDateRange(prev => ({ ...prev, start }));
  const setEnd = (end) => setDateRange(prev => ({ ...prev, end }));
  const setRange = (start, end) => setDateRange({ start, end });

  const resetToToday = () => {
    const todayStr = formatDate(new Date());
    setDateRange({ start: todayStr, end: todayStr });
  };

  const resetToWeek = () => {
    const todayDate = new Date();
    const startOfWeekDate = getStartOfWeek(todayDate);
    setDateRange({ start: formatDate(startOfWeekDate), end: formatDate(todayDate) });
  };

  const showAllTime = () => {
    setDateRange({ start: '', end: '' });
  };

  const isAllTime = !dateRange.start && !dateRange.end;
  const isTodayOnly = dateRange.start === dateRange.end && dateRange.start === formatDate(new Date());
  const isCurrentWeek = dateRange.start && dateRange.end && !isTodayOnly;

  return (
    <AdminDateContext.Provider value={{
      dateRange,
      setStart,
      setEnd,
      setRange,
      resetToToday,
      resetToWeek,
      showAllTime,
      isAllTime,
      isTodayOnly,
      isCurrentWeek
    }}>
      {children}
    </AdminDateContext.Provider>
  );
};

export const useAdminDate = () => {
  const context = useContext(AdminDateContext);
  if (!context) {
    throw new Error('useAdminDate must be used within AdminDateProvider');
  }
  return context;
};
