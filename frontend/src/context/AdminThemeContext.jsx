import React, { createContext, useState, useContext, useEffect } from 'react';

const AdminThemeContext = createContext(null);

export const AdminThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem('admin_theme');
    return stored || 'light';
  });

  useEffect(() => {
    localStorage.setItem('admin_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const isLight = theme === 'light';

  const colors = {
    bg: isLight ? 'bg-white' : 'bg-neutral-950',
    bgSecondary: isLight ? 'bg-neutral-50' : 'bg-neutral-900',
    bgCard: isLight ? 'bg-white' : 'bg-neutral-900/20',
    bgInput: isLight ? 'bg-white' : 'bg-neutral-950/80',
    text: isLight ? 'text-neutral-900' : 'text-white',
    textSecondary: isLight ? 'text-neutral-600' : 'text-slate-400',
    textMuted: isLight ? 'text-neutral-400' : 'text-slate-500',
    border: isLight ? 'border-neutral-200' : 'border-neutral-800',
    borderInput: isLight ? 'border-neutral-200' : 'border-neutral-700',
    borderCard: isLight ? 'border-neutral-200' : 'border-neutral-800/60',
    hover: isLight ? 'hover:bg-neutral-50' : 'hover:bg-neutral-900/30',
    shadow: isLight ? 'shadow-sm' : 'shadow-2xl',
    accent: isLight ? 'text-brand-600' : 'text-brand-400',
    accentBg: isLight ? 'bg-brand-50' : 'bg-brand-500/10',
    accentBorder: isLight ? 'border-brand-200' : 'border-brand-500/20',
    tableHeader: isLight ? 'bg-neutral-100 text-neutral-600' : 'bg-neutral-900/10 text-slate-400',
    tableRowHover: isLight ? 'hover:bg-neutral-50' : 'hover:bg-neutral-900/20',
    sidebar: isLight ? 'bg-white border-neutral-200' : 'bg-neutral-950 border-neutral-800/60',
    sidebarActive: isLight ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-900',
    sidebarInactive: isLight ? 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50' : 'text-slate-400 hover:text-white hover:bg-neutral-900/30',
    inputFocus: isLight ? 'focus:border-brand-500 focus:ring-brand-500/10' : 'focus:border-brand-500 focus:ring-brand-500/30',
    badge: isLight ? 'bg-neutral-100 text-neutral-700 border-neutral-200' : 'bg-neutral-500/10 text-slate-300 border-neutral-500/20',
    danger: isLight ? 'text-red-600 bg-red-50 border-red-200' : 'text-red-400 bg-red-500/10 border-red-500/20',
    success: isLight ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    warning: isLight ? 'text-amber-600 bg-amber-50 border-amber-200' : 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    cardBg: isLight ? 'bg-white' : 'bg-neutral-900/10',
    cardBorder: isLight ? 'border-neutral-200' : 'border-neutral-800/60',
    overlay: isLight ? 'bg-white/80' : 'bg-neutral-950/80',
    glow: isLight ? 'shadow-[0_0_20px_rgba(255,107,0,0.15)]' : 'shadow-glow'
  };

  return (
    <AdminThemeContext.Provider value={{ theme, setTheme, toggleTheme, isLight, colors }}>
      {children}
    </AdminThemeContext.Provider>
  );
};

export const useAdminTheme = () => {
  const context = useContext(AdminThemeContext);
  if (!context) {
    throw new Error('useAdminTheme must be used within AdminThemeProvider');
  }
  return context;
};
