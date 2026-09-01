import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAdminTheme } from '../../context/AdminThemeContext';
import { useAdminDate } from '../../context/AdminDateContext';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminDatePicker from '../../components/common/AdminDatePicker';
import Pagination from '../../components/common/Pagination';
import client from '../../api/client';
import { Download, AlertCircle, ShieldAlert, Globe, Monitor, Loader2, Inbox } from 'lucide-react';

const Downloads = () => {
  const { colors, isLight } = useAdminTheme();
  const { selectedDate } = useAdminDate();
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchTokens = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await client.get('/api/admin/download/logs');
      if (res.data?.success && res.data?.data) {
        const formatted = res.data.data.map((log, idx) => ({
          _id: log._id || `token-${idx}`,
          tokenValue: log.downloadTokenId?.tokenValue || `token_${idx}_${Math.random().toString(36).substr(2, 6)}`,
          productName: log.productId?.name || 'Unknown Product',
          clientIp: log.ipAddress || log.userId?.lastLoginIp || '0.0.0.0',
          country: log.country || 'India',
          status: log.downloadTokenId?.revokedAt ? 'revoked' : 'active',
          downloadCount: log.downloadTokenId?.downloadCount || 0,
          limit: 5,
          downloadedAt: log.downloadedAt || new Date().toISOString()
        }));
        setTokens(formatted);
      } else {
        throw new Error('Invalid response');
      }
    } catch (err) {
      console.warn('Failed to fetch download tokens:', err);
      setTokens([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTokens();
  }, [fetchTokens]);

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'revoked' : 'active';
    if (!window.confirm(`Are you sure you want to ${newStatus === 'revoked' ? 'revoke' : 'activate'} this download link?`)) return;
    
    setActionLoading(id);
    try {
      const res = await client.put(`/api/admin/download/tokens/${id}/revoke`);
      if (res.data?.success) {
        setTokens(prev => prev.map(t => t._id === id ? { ...t, status: newStatus } : t));
      } else {
        alert('Failed to update: ' + (res.data?.message || 'Unknown error'));
      }
    } catch (err) {
      alert('Error updating token: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const activeCount = tokens.filter(t => t.status === 'active').length;
  const revokedCount = tokens.filter(t => t.status === 'revoked').length;
  const totalDownloads = tokens.reduce((sum, t) => sum + t.downloadCount, 0);

  const filteredTokens = useMemo(() => {
    if (!selectedDate) return tokens;
    return tokens.filter(t => {
      if (t.downloadedAt) {
        return new Date(t.downloadedAt).toISOString().split('T')[0] === selectedDate;
      }
      return true;
    });
  }, [tokens, selectedDate]);

  const paginatedTokens = useMemo(() => {
    return filteredTokens.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredTokens, currentPage]);

  return (
    <AdminLayout>
      <div className="p-6 lg:p-10 space-y-8">
        <header className={`pb-6 border-b ${colors.border} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
          <div>
            <h1 className={`text-xl sm:text-2xl font-semibold ${colors.text}`}>Download License Keys</h1>
            <p className={`${colors.textSecondary} text-sm mt-1`}>Review temporary download links, audit download counters, and manage access.</p>
          </div>

          <div className="flex items-center space-x-3">
            <AdminDatePicker label="Download Date" />
            <button
              onClick={fetchTokens}
              disabled={loading}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs ${colors.accent} font-medium hover:opacity-80 transition-opacity disabled:opacity-50`}
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
              <span>Refresh</span>
            </button>
          </div>
        </header>

        {/* Summary Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className={`p-6 rounded-2xl ${colors.bgCard} border ${colors.cardBorder} space-y-3 card-hover`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-medium uppercase tracking-wider ${colors.textSecondary}`}>Active Links</span>
              <div className={`p-2 rounded-xl ${isLight ? 'bg-emerald-50' : 'bg-emerald-500/10'}`}>
                <ShieldAlert className="h-4 w-4 text-emerald-500" />
              </div>
            </div>
            <p className={`text-2xl font-bold ${colors.text}`}>{activeCount}</p>
            <p className={`text-xs ${colors.textSecondary}`}>Currently accessible</p>
          </div>

          <div className={`p-6 rounded-2xl ${colors.bgCard} border ${colors.cardBorder} space-y-3 card-hover`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-medium uppercase tracking-wider ${colors.textSecondary}`}>Revoked</span>
              <div className={`p-2 rounded-xl ${isLight ? 'bg-red-50' : 'bg-red-500/10'}`}>
                <AlertCircle className="h-4 w-4 text-red-500" />
              </div>
            </div>
            <p className={`text-2xl font-bold ${colors.text}`}>{revokedCount}</p>
            <p className={`text-xs ${colors.textSecondary}`}>Access blocked</p>
          </div>

          <div className={`p-6 rounded-2xl ${colors.bgCard} border ${colors.cardBorder} space-y-3 card-hover`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-medium uppercase tracking-wider ${colors.textSecondary}`}>Total Downloads</span>
              <div className={`p-2 rounded-xl ${isLight ? 'bg-brand-50' : 'bg-brand-500/10'}`}>
                <Download className="h-4 w-4 text-brand-500" />
              </div>
            </div>
            <p className={`text-2xl font-bold ${colors.text}`}>{totalDownloads}</p>
            <p className={`text-xs ${colors.textSecondary}`}>Across all tokens</p>
          </div>
        </section>

        {/* Tokens Table */}
        <div className={`${colors.cardBg} border ${colors.cardBorder} rounded-2xl overflow-hidden shadow-sm`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className={`border-b ${colors.border} bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-slate-300 font-medium uppercase tracking-wider`}>
                  <th className="py-3 px-6">Product Item</th>
                  <th className="py-3 px-6">Download Token</th>
                  <th className="py-3 px-6">IP / Location</th>
                  <th className="py-3 px-6">Fetches Count</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Access</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${colors.border}`}>
                {paginatedTokens.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <Inbox className={`h-10 w-10 mx-auto ${colors.textMuted} mb-2`} />
                      <p className={`text-sm ${colors.textSecondary} font-medium`}>No download logs found for {selectedDate}</p>
                    </td>
                  </tr>
                ) : (
                  paginatedTokens.map((t) => (
                    <tr key={t._id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors duration-150">
                      <td className="py-4 px-6 font-medium text-neutral-900 dark:text-white">{t.productName}</td>
                      <td className="py-4 px-6 font-mono text-neutral-600 dark:text-slate-400 text-[10px]">{t.tokenValue}</td>

                      <td className="py-4 px-6">
                        <p className={`font-medium ${colors.text} flex items-center`}>
                          <Monitor className={`h-3 w-3 mr-1.5 text-neutral-400`} />
                          <span>{t.clientIp}</span>
                        </p>
                        <p className={`text-[10px] ${colors.textSecondary} flex items-center mt-0.5`}>
                          <Globe className={`h-3 w-3 mr-1.5 text-neutral-400`} />
                          <span>{t.country}</span>
                        </p>
                      </td>

                      <td className="py-4 px-6 font-medium text-neutral-700 dark:text-slate-300">{t.downloadCount} / {t.limit || 5} downloads</td>

                      <td className="py-4 px-6">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[9px] uppercase font-bold border ${
                          t.status === 'active'
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'
                            : 'bg-red-500/10 border-red-500/20 text-red-600'
                        }`}>
                          {t.status}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleToggleStatus(t._id, t.status)}
                          disabled={actionLoading === t._id}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${
                            t.status === 'active'
                              ? 'bg-emerald-500'
                              : 'bg-neutral-300'
                          } ${actionLoading === t._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-200 ${
                              t.status === 'active' ? 'translate-x-4' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={filteredTokens.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </AdminLayout>
  );
};

export default Downloads;
