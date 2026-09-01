import React, { useState, useEffect, useCallback } from 'react';
import { useAdminTheme } from '../../context/AdminThemeContext';
import { useAdminDate } from '../../context/AdminDateContext';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminDatePicker from '../../components/common/AdminDatePicker';
import client from '../../api/client';
import { 
  Users, Activity, Calendar, FileText, Globe, Laptop, Smartphone, Tablet, 
  RefreshCw, Search, ArrowUpRight, Compass, ShieldAlert
} from 'lucide-react';

const VisitorsReport = () => {
  const { colors, isLight } = useAdminTheme();
  const { selectedDate } = useAdminDate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterSearch, setFilterSearch] = useState('');

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const dateParam = selectedDate ? `?date=${selectedDate}` : '';
      const res = await client.get(`/api/admin/analytics/visitors${dateParam}`);
      if (res.data?.success && res.data?.data) {
        setData(res.data.data);
      } else {
        throw new Error('Failed to load visitors data');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch visitor analytics');
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const getDeviceIcon = (device) => {
    switch (device?.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="h-4 w-4 text-neutral-500" />;
      case 'tablet':
        return <Tablet className="h-4 w-4 text-neutral-500" />;
      default:
        return <Laptop className="h-4 w-4 text-neutral-500" />;
    }
  };

  // Filter recent visitors
  const filteredVisitors = data?.recentVisitors?.filter(visitor => {
    const term = filterSearch.toLowerCase();
    return (
      visitor.visitorId.toLowerCase().includes(term) ||
      (visitor.country || '').toLowerCase().includes(term) ||
      (visitor.browser || '').toLowerCase().includes(term) ||
      (visitor.os || '').toLowerCase().includes(term) ||
      (visitor.lastPage || '').toLowerCase().includes(term)
    );
  }) || [];

  return (
    <AdminLayout>
      <div className="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto">
        
        {/* Header Section */}
        <header className="pb-6 border-b border-neutral-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className={`text-xl sm:text-2xl font-bold ${colors.text}`}>Visitor Analytics Report</h1>
            <p className={`${colors.textSecondary} text-sm mt-1`}>
              Monitor real-time visitors, aggregate trends, geo-locations, browser layouts, and pageview counts.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <AdminDatePicker label="Visitor Date" />
            <button
              onClick={fetchReport}
              disabled={loading}
              className={`px-4 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                isLight 
                  ? 'border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 shadow-sm' 
                  : 'border-neutral-800 bg-neutral-900/50 hover:bg-neutral-900 text-slate-300'
              } disabled:opacity-50`}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Stats</span>
            </button>
          </div>
        </header>

        {error && (
          <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-500 text-xs flex items-center gap-3">
            <ShieldAlert className="h-5 w-5 shrink-0" />
            <p className="font-bold">{error}</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {/* Card 1: Total Visitors */}
          <div className={`p-5 rounded-2xl border ${colors.cardBorder} ${colors.cardBg} shadow-sm space-y-3 text-left`}>
            <div className="flex items-center justify-between">
              <span className={`text-[10px] uppercase font-bold tracking-wider ${colors.textSecondary}`}>
                Total Visitors
              </span>
              <div className="p-2 rounded-xl bg-blue-50 text-blue-500">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <h3 className={`text-2xl font-extrabold ${colors.text}`}>
              {loading ? '...' : data?.totalVisitors || 0}
            </h3>
            <p className="text-[10px] text-neutral-400 font-medium">All-time unique profiles</p>
          </div>

          {/* Card 2: Today */}
          <div className={`p-5 rounded-2xl border ${colors.cardBorder} ${colors.cardBg} shadow-sm space-y-3 text-left`}>
            <div className="flex items-center justify-between">
              <span className={`text-[10px] uppercase font-bold tracking-wider ${colors.textSecondary}`}>
                Active Today
              </span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-500">
                <Activity className="h-4 w-4" />
              </div>
            </div>
            <h3 className={`text-2xl font-extrabold ${colors.text}`}>
              {loading ? '...' : data?.todayVisitors || 0}
            </h3>
            <p className="text-[10px] text-neutral-400 font-medium">Unique active in last 24h</p>
          </div>

          {/* Card 3: This Week */}
          <div className={`p-5 rounded-2xl border ${colors.cardBorder} ${colors.cardBg} shadow-sm space-y-3 text-left`}>
            <div className="flex items-center justify-between">
              <span className={`text-[10px] uppercase font-bold tracking-wider ${colors.textSecondary}`}>
                This Week
              </span>
              <div className="p-2 rounded-xl bg-brand-50 text-brand-600">
                <Calendar className="h-4 w-4" />
              </div>
            </div>
            <h3 className={`text-2xl font-extrabold ${colors.text}`}>
              {loading ? '...' : data?.weekVisitors || 0}
            </h3>
            <p className="text-[10px] text-neutral-400 font-medium">Active in past 7 days</p>
          </div>

          {/* Card 4: This Month */}
          <div className={`p-5 rounded-2xl border ${colors.cardBorder} ${colors.cardBg} shadow-sm space-y-3 text-left`}>
            <div className="flex items-center justify-between">
              <span className={`text-[10px] uppercase font-bold tracking-wider ${colors.textSecondary}`}>
                This Month
              </span>
              <div className="p-2 rounded-xl bg-purple-50 text-purple-500">
                <Calendar className="h-4 w-4" />
              </div>
            </div>
            <h3 className={`text-2xl font-extrabold ${colors.text}`}>
              {loading ? '...' : data?.monthVisitors || 0}
            </h3>
            <p className="text-[10px] text-neutral-400 font-medium">Active in past 30 days</p>
          </div>

          {/* Card 5: Page Views */}
          <div className={`p-5 rounded-2xl border ${colors.cardBorder} ${colors.cardBg} shadow-sm space-y-3 text-left`}>
            <div className="flex items-center justify-between">
              <span className={`text-[10px] uppercase font-bold tracking-wider ${colors.textSecondary}`}>
                Page Views
              </span>
              <div className="p-2 rounded-xl bg-amber-50 text-amber-500">
                <FileText className="h-4 w-4" />
              </div>
            </div>
            <h3 className={`text-2xl font-extrabold ${colors.text}`}>
              {loading ? '...' : data?.totalPageViews || 0}
            </h3>
            <p className="text-[10px] text-neutral-400 font-medium">All page loads registered</p>
          </div>
        </div>

        {/* Countries & Recent split grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Countries card (4 cols) */}
          <div className={`lg:col-span-4 border ${colors.cardBorder} ${colors.cardBg} rounded-2xl p-6 shadow-sm flex flex-col justify-start text-left`}>
            <div className="flex items-center gap-2 pb-4 border-b border-neutral-100">
              <Globe className="h-4.5 w-4.5 text-brand-500" />
              <h3 className={`text-sm font-bold ${colors.text}`}>Traffic by Country</h3>
            </div>
            
            <div className="mt-4 flex-1 space-y-4 overflow-y-auto max-h-[400px]">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-8 w-full bg-neutral-100 dark:bg-neutral-800/80 animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : (data?.countries || []).length === 0 ? (
                <div className="text-center py-10 text-neutral-400 text-xs font-semibold">
                  No geolocation logs found.
                </div>
              ) : (
                data.countries.map((c, idx) => {
                  const maxCount = data.countries[0]?.count || 1;
                  const percent = Math.round((c.count / maxCount) * 100);
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className={`${colors.text}`}>{c.country}</span>
                        <span className={`${colors.textSecondary}`}>{c.count} visitors</span>
                      </div>
                      <div className="h-2 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-brand-500 rounded-full transition-all"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Recent Visitors Table (8 cols) */}
          <div className={`lg:col-span-8 border ${colors.cardBorder} ${colors.cardBg} rounded-2xl p-6 shadow-sm text-left flex flex-col justify-start`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <Compass className="h-4.5 w-4.5 text-brand-500" />
                <h3 className={`text-sm font-bold ${colors.text}`}>Recent Active Visitors</h3>
              </div>
              <div className="relative max-w-xs w-full">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search visitors, os, country..."
                  value={filterSearch}
                  onChange={(e) => setFilterSearch(e.target.value)}
                  className={`w-full pl-9 pr-4 py-1.5 text-xs rounded-xl border ${
                    isLight 
                      ? 'bg-neutral-50 border-neutral-200 focus:bg-white text-neutral-800 focus:ring-1 focus:ring-brand-500' 
                      : 'bg-neutral-900 border-neutral-800 focus:bg-neutral-900/80 text-slate-300 focus:ring-1 focus:ring-brand-500'
                  } focus:outline-none transition-all`}
                />
              </div>
            </div>

            <div className="overflow-x-auto mt-4">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className={`border-b ${isLight ? 'border-neutral-100' : 'border-neutral-800'} text-neutral-400 font-bold uppercase tracking-wider text-[10px]`}>
                    <th className="pb-3 pr-2">Visitor Details</th>
                    <th className="pb-3 px-2">Geo</th>
                    <th className="pb-3 px-2">Browser / OS</th>
                    <th className="pb-3 px-2">Device</th>
                    <th className="pb-3 px-2">Pages</th>
                    <th className="pb-3 pl-2">Last Visit At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60 font-semibold">
                  {loading ? (
                    [1, 2, 3, 4].map(i => (
                      <tr key={i}>
                        <td colSpan={6} className="py-4">
                          <div className="h-6 w-full bg-neutral-100 dark:bg-neutral-800/80 animate-pulse rounded-lg" />
                        </td>
                      </tr>
                    ))
                  ) : filteredVisitors.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-neutral-400">
                        No matching visitors logged in system.
                      </td>
                    </tr>
                  ) : (
                    filteredVisitors.map((visitor, idx) => (
                      <tr key={idx} className={`${isLight ? 'hover:bg-neutral-50/50' : 'hover:bg-neutral-900/20'} transition-all`}>
                        <td className="py-3.5 pr-2">
                          <div className="flex flex-col gap-1 max-w-[160px]">
                            <span className={`font-mono text-[10px] truncate ${colors.text}`} title={visitor.visitorId}>
                              {visitor.visitorId}
                            </span>
                            <span className="text-[10px] text-neutral-400 truncate" title={visitor.lastPage}>
                              Last: {visitor.lastPage || '/'}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isLight ? 'bg-neutral-100 text-neutral-600' : 'bg-neutral-900 text-slate-300'
                          }`}>
                            {visitor.country || 'IN'}
                          </span>
                        </td>
                        <td className="py-3.5 px-2">
                          <div className="flex flex-col gap-0.5">
                            <span className={colors.text}>{visitor.browser || 'Chrome'}</span>
                            <span className="text-[10px] text-neutral-400">{visitor.os || 'Windows'}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-2">
                          <div className="flex items-center gap-1.5">
                            {getDeviceIcon(visitor.device)}
                            <span className="text-[10px] text-neutral-500 font-bold uppercase">{visitor.device || 'Desktop'}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-2">
                          <span className={`font-bold ${colors.text}`}>
                            {visitor.pagesViewed || 1}
                          </span>
                        </td>
                        <td className="py-3.5 pl-2">
                          <span className="text-neutral-400 font-bold text-[10px]">
                            {new Date(visitor.lastVisitAt).toLocaleDateString('en-IN', {
                              day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                            })}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};

export default VisitorsReport;
