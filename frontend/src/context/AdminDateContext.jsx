import React, { createContext, useState, useContext, useEffect } from 'react';

const AdminDateContext = createContext(null);

export const AdminDateProvider = ({ children }) => {
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [dateRange, setDateRange] = useState({
    start: null,
    end: null
  });

  const isToday = selectedDate === new Date().toISOString().split('T')[0];
  const isAllTime = !selectedDate;

  const resetToToday = () => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
    setDateRange({ start: null, end: null });
  };

  const clearDateFilter = () => {
    setSelectedDate('');
    setDateRange({ start: null, end: null });
  };

  return (
    <AdminDateContext.Provider value={{ selectedDate, setSelectedDate, dateRange, setDateRange, isToday, isAllTime, resetToToday, clearDateFilter }}>
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
