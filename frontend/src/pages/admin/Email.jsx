import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAdminTheme } from '../../context/AdminThemeContext';
import { useAdminDate } from '../../context/AdminDateContext';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminDatePicker from '../../components/common/AdminDatePicker';
import Pagination from '../../components/common/Pagination';
import { Mail, ShieldCheck, AlertCircle, RefreshCw, Send, Server, CheckCircle, XCircle, AlertTriangle, Inbox, SendIcon, Users } from 'lucide-react';

import client from '../../api/client';

const Email = () => {
  const { colors, isLight } = useAdminTheme();
  const { selectedDate } = useAdminDate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [transports, setTransports] = useState([
    { id: '1', name: 'Delivery 1 (Mailgun)', host: 'smtp.mailgun.org:587', fromAddress: 'noreply.superui@gmail.com', status: 'ready', sent: 0, totalSent: 0, limit: 300 },
    { id: '2', name: 'Delivery 2 (SendGrid)', host: 'smtp.sendgrid.net:587', fromAddress: 'delivery@superui.in', status: 'ready', sent: 0, totalSent: 0, limit: 300 },
    { id: '3', name: 'Admin Alerts', host: 'smtp.gmail.com:587', fromAddress: 'hello.superui@gmail.com', status: 'ready', sent: 0, totalSent: 0, limit: 300 }
  ]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [sending, setSending] = useState(false);
  const [toAddress, setToAddress] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const [emailConfig, setEmailConfig] = useState(null);
  const [selectedTransport, setSelectedTransport] = useState('admin');
  const [emailContactCounts, setEmailContactCounts] = useState({
    total: 0,
    successfulOrders: 0,
    bookings: 0,
    contacts: 0,
    feedbacks: 0,
    issues: 0
  });

  const fetchEmailConfig = useCallback(async () => {
    try {
      const dateParam = selectedDate ? `?date=${selectedDate}` : '';
      const [configRes, logsRes] = await Promise.allSettled([
        client.get(`/api/admin/email/config-status${dateParam}`, { silent: true }),
        client.get('/api/admin/email/logs', { silent: true })
      ]);

      if (configRes.status === 'fulfilled' && configRes.value?.data?.success) {
        const cfg = configRes.value.data.data;
        setEmailConfig(cfg);
        if (cfg.delivery1 || cfg.delivery2 || cfg.admin) {
          setTransports([
            { id: '1', name: cfg.delivery1?.label || 'Delivery 1', host: `${cfg.delivery1?.host || 'smtp.mailgun.org'}:${cfg.delivery1?.port || 587}`, fromAddress: cfg.delivery1?.fromAddress || 'noreply.superui@gmail.com', status: cfg.delivery1?.status || 'ready', sent: cfg.delivery1?.sent || 0, totalSent: cfg.delivery1?.totalSent || 0, limit: 300 },
            { id: '2', name: cfg.delivery2?.label || 'Delivery 2', host: `${cfg.delivery2?.host || 'smtp.sendgrid.net'}:${cfg.delivery2?.port || 587}`, fromAddress: cfg.delivery2?.fromAddress || 'delivery@superui.in', status: cfg.delivery2?.status || 'ready', sent: cfg.delivery2?.sent || 0, totalSent: cfg.delivery2?.totalSent || 0, limit: 300 },
            { id: '3', name: cfg.admin?.label || 'Admin Transport', host: `${cfg.admin?.host || 'smtp.gmail.com'}:${cfg.admin?.port || 587}`, fromAddress: cfg.admin?.fromAddress || 'hello.superui@gmail.com', status: cfg.admin?.status || 'ready', sent: cfg.admin?.sent || 0, totalSent: cfg.admin?.totalSent || 0, limit: 300 }
          ]);
        }
      }

      if (logsRes.status === 'fulfilled' && logsRes.value?.data?.success && Array.isArray(logsRes.value.data.data)) {
        const dbLogs = logsRes.value.data.data.map(l => ({
          _id: l._id,
          to: l.toAddress,
          subject: l.subject,
          transport: l.type || 'Admin',
          status: l.status,
          error: l.errorMessage,
          date: l.createdAt || new Date().toISOString()
        }));
        setLogs(dbLogs);
      }

      const countsRes = await client.get('/api/admin/email/contact-counts', { silent: true });
      if (countsRes.data?.success && countsRes.data.data) {
        setEmailContactCounts(countsRes.data.data);
      }
    } catch (err) {
      // Quiet fallback
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchEmailConfig();
  }, [fetchEmailConfig]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchEmailConfig();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchEmailConfig]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchEmailConfig();
  };

  const handleSendMail = async (e) => {
    e.preventDefault();
    if (!toAddress || !subject) return;
    setSending(true);
    setError('');
    try {
      const res = await client.post('/api/admin/email/send', { toAddress, subject, body, transportType: selectedTransport });
      if (res.data?.success) {
        const newLog = {
          _id: 'e_' + Math.random().toString(36).substr(2, 9),
          to: toAddress,
          subject: subject,
          transport: selectedTransport === 'delivery1' ? 'delivery1' : selectedTransport === 'delivery2' ? 'delivery2' : 'admin',
          status: 'sent',
          date: new Date().toISOString()
        };
        setLogs(prev => [newLog, ...prev]);
        setToAddress('');
        setSubject('');
        setBody('');
        await fetchEmailConfig();
      } else {
        setError(res.data?.message || 'Failed to send email');
      }
    } catch (err) {
      setError('Error sending email: ' + (err.response?.data?.message || err.message));
    } finally {
      setSending(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ready':
      case 'ok':
      case 'active':
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case 'not_configured':
      case 'inactive':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'offline':
      case 'degraded':
      case 'pending':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-neutral-400" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ready':
      case 'ok':
      case 'active':
        return 'bg-emerald-50 border-emerald-200 text-emerald-700';
      case 'not_configured':
      case 'inactive':
        return 'bg-red-50 border-red-200 text-red-700';
      case 'offline':
      case 'degraded':
      case 'pending':
        return 'bg-amber-50 border-amber-200 text-amber-700';
      default:
        return 'bg-neutral-50 border-neutral-200 text-neutral-700';
    }
  };

  const activeTransports = transports.filter(t => t.status === 'ready' || t.status === 'ok' || t.status === 'active').length;
  const inactiveTransports = transports.filter(t => t.status === 'not_configured' || t.status === 'inactive' || t.status === 'offline' || t.status === 'degraded').length;
  const totalEmailsSent = useMemo(() => {
    if (emailConfig && typeof emailConfig.totalAllSent === 'number') {
      return emailConfig.totalAllSent;
    }
    return transports.reduce((sum, t) => sum + (t.totalSent || t.sent || 0), 0);
  }, [transports, emailConfig]);
  const totalEmailLimit = transports.reduce((sum, t) => sum + (t.limit || 100), 0);

  const filteredLogs = useMemo(() => {
    if (!selectedDate) return logs;
    return logs.filter(log => new Date(log.date).toISOString().split('T')[0] === selectedDate);
  }, [logs, selectedDate]);

  return (
    <AdminLayout>
      <div className="p-6 lg:p-10 space-y-10">
        <header className={`pb-6 border-b ${colors.border} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
          <div>
            <h1 className={`text-xl sm:text-2xl font-semibold ${colors.text}`}>Email Server Administration</h1>
            <p className={`${colors.textSecondary} text-sm mt-1`}>Monitor SMTP transports, health, and delivery logs.</p>
          </div>
          <div className="flex items-center space-x-3">
            <AdminDatePicker label="Mail Date" />
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs ${colors.accent} font-medium hover:opacity-80 transition-opacity disabled:opacity-50`}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        </header>

        {/* Summary Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className={`p-6 rounded-2xl ${colors.bgCard} border ${colors.cardBorder} space-y-3 card-hover`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-medium uppercase tracking-wider ${colors.textSecondary}`}>Total Transports</span>
              <div className={`p-2 rounded-xl ${isLight ? 'bg-brand-50' : 'bg-brand-500/10'}`}>
                <Server className="h-4 w-4 text-brand-500" />
              </div>
            </div>
            <div>
              <p className={`text-2xl font-bold ${colors.text}`}>{transports.length}</p>
              <p className={`text-xs ${colors.textSecondary} mt-1`}>SMTP configurations</p>
            </div>
          </div>

          <div className={`p-6 rounded-2xl ${colors.bgCard} border ${colors.cardBorder} space-y-3 card-hover`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-medium uppercase tracking-wider ${colors.textSecondary}`}>Active</span>
              <div className={`p-2 rounded-xl ${isLight ? 'bg-emerald-50' : 'bg-emerald-500/10'}`}>
                <CheckCircle className="h-4 w-4 text-emerald-500" />
              </div>
            </div>
            <div>
              <p className={`text-2xl font-bold text-emerald-600`}>{activeTransports}</p>
              <p className={`text-xs ${colors.textSecondary} mt-1`}>Working transports</p>
            </div>
          </div>

          <div className={`p-6 rounded-2xl ${colors.bgCard} border ${colors.cardBorder} space-y-3 card-hover`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-medium uppercase tracking-wider ${colors.textSecondary}`}>Inactive</span>
              <div className={`p-2 rounded-xl ${isLight ? 'bg-red-50' : 'bg-red-500/10'}`}>
                <XCircle className="h-4 w-4 text-red-500" />
              </div>
            </div>
            <div>
              <p className={`text-2xl font-bold text-red-600`}>{inactiveTransports}</p>
              <p className={`text-xs ${colors.textSecondary} mt-1`}>Not configured / down</p>
            </div>
          </div>

          <div className={`p-6 rounded-2xl ${colors.bgCard} border ${colors.cardBorder} space-y-3 card-hover`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-medium uppercase tracking-wider ${colors.textSecondary}`}>Emails Sent</span>
              <div className={`p-2 rounded-xl ${isLight ? 'bg-brand-50' : 'bg-brand-500/10'}`}>
                <SendIcon className="h-4 w-4 text-brand-500" />
              </div>
            </div>
            <div>
              <p className={`text-2xl font-bold ${colors.text}`}>{totalEmailsSent.toLocaleString()}</p>
              <p className={`text-xs ${colors.textSecondary} mt-1`}>of {totalEmailLimit.toLocaleString()} limit</p>
            </div>
          </div>

          <div className={`p-6 rounded-2xl ${colors.bgCard} border ${colors.cardBorder} space-y-3 card-hover`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-medium uppercase tracking-wider ${colors.textSecondary}`}>Email Contacts</span>
              <div className={`p-2 rounded-xl ${isLight ? 'bg-brand-50' : 'bg-brand-500/10'}`}>
                <Users className="h-4 w-4 text-brand-500" />
              </div>
            </div>
            <div>
              <p className={`text-2xl font-bold ${colors.text}`}>{ (emailContactCounts?.total || 0).toLocaleString() }</p>
              <p className={`text-xs ${colors.textSecondary} mt-1`}>Customers + Orders + Bookings + Contacts + Feedback + Issues</p>
            </div>
          </div>
        </section>

        {/* Transports Detail */}
        <section className={`${colors.bgCard} border ${colors.cardBorder} rounded-2xl overflow-hidden`}>
          <div className="p-6 border-b border-neutral-200">
            <h2 className={`text-base font-semibold ${colors.text}`}>SMTP Transport Details</h2>
            <p className={`text-xs ${colors.textSecondary} mt-1`}>Individual transport configurations and usage statistics.</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-500"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-100 text-neutral-600 font-medium uppercase tracking-wider">
                    <th className="py-3 px-6">Transport Name</th>
                    <th className="py-3 px-6">Status</th>
                    <th className="py-3 px-6">From Address</th>
                    <th className="py-3 px-6">Daily / Total / Limit</th>
                    <th className="py-3 px-6">Usage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {transports.map((t, idx) => {
                    const dailyPercent = Math.min(100, Math.round(((t.sent || 0) / (t.limit || 100)) * 100));
                    return (
                      <tr key={idx} className="hover:bg-neutral-50 transition-colors duration-150">
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(t.status)}
                            <div>
                              <p className="font-semibold text-neutral-900">{t.name}</p>
                              <p className="text-[10px] text-neutral-500 font-mono">{t.host}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[9px] uppercase font-medium border ${getStatusBadge(t.status)}`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-mono text-neutral-600">{t.fromAddress || '-'}</td>
                        <td className="py-4 px-6">
                          <div className="space-y-1">
                            <div>
                              <span className="font-semibold text-neutral-900">{(t.sent || 0).toLocaleString()}</span>
                              <span className="text-neutral-500"> / {(t.totalSent || 0).toLocaleString()} / {t.limit?.toLocaleString() || '100'}</span>
                            </div>
                            <p className="text-[10px] text-neutral-500">Daily / All-time / Limit</p>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 h-2 rounded-full bg-neutral-100 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${dailyPercent > 90 ? 'bg-red-500' : dailyPercent > 70 ? 'bg-amber-500' : 'bg-brand-500'}`}
                                style={{ width: `${dailyPercent}%` }}
                              ></div>
                            </div>
                            <span className="text-[10px] font-medium text-neutral-600 w-10 text-right">{dailyPercent}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Send Email and Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <form onSubmit={handleSendMail} className={`lg:col-span-5 ${colors.bgCard} border ${colors.cardBorder} p-6 rounded-2xl space-y-5`}>
            <h2 className={`text-sm font-semibold uppercase tracking-wider ${colors.text}`}>
              Send Transactional Mail
            </h2>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                <p className="text-xs text-red-600 font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-4 text-xs">
              <div>
                <label className={`block ${colors.textSecondary} font-medium mb-1.5 uppercase text-[10px]`}>SMTP Transport</label>
                <select
                  value={selectedTransport}
                  onChange={(e) => setSelectedTransport(e.target.value)}
                  className={`w-full ${colors.bgInput} border ${colors.borderInput} rounded-xl px-3.5 py-2.5 ${colors.text} focus:outline-none ${colors.inputFocus} transition-all duration-200 cursor-pointer`}
                >
                  <option value="admin">Admin Transport (Alerts & Fallback)</option>
                  <option value="delivery1">Delivery 1 (Mailgun)</option>
                  <option value="delivery2">Delivery 2 (SendGrid)</option>
                </select>
              </div>

              <div>
                <label className={`block ${colors.textSecondary} font-medium mb-1.5 uppercase text-[10px]`}>Recipient Email</label>
                <input
                  type="email"
                  required
                  value={toAddress}
                  onChange={(e) => setToAddress(e.target.value)}
                  placeholder="customer@domain.com"
                  className={`w-full ${colors.bgInput} border ${colors.borderInput} rounded-xl px-3.5 py-2.5 ${colors.text} placeholder:text-neutral-400 focus:outline-none ${colors.inputFocus} transition-all duration-200`}
                />
              </div>

              <div>
                <label className={`block ${colors.textSecondary} font-medium mb-1.5 uppercase text-[10px]`}>Email Subject</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. License renewal request details"
                  className={`w-full ${colors.bgInput} border ${colors.borderInput} rounded-xl px-3.5 py-2.5 ${colors.text} placeholder:text-neutral-400 focus:outline-none ${colors.inputFocus} transition-all duration-200`}
                />
              </div>

              <div>
                <label className={`block ${colors.textSecondary} font-medium mb-1.5 uppercase text-[10px]`}>Body Content (HTML/Text)</label>
                <textarea
                  rows={3}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Type mail contents..."
                  className={`w-full ${colors.bgInput} border ${colors.borderInput} rounded-xl px-3.5 py-2.5 ${colors.text} placeholder:text-neutral-400 focus:outline-none ${colors.inputFocus} transition-all duration-200 resize-none`}
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="w-full flex items-center justify-center space-x-1.5 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold transition-all duration-200 hover:shadow-lg disabled:opacity-50 btn-shine"
              >
                <Send className="h-4 w-4" />
                <span>{sending ? 'Sending...' : 'Dispatch Email'}</span>
              </button>
            </div>
          </form>

          <div className={`lg:col-span-7 ${colors.bgCard} border ${colors.cardBorder} rounded-2xl`}>
            <div className="p-6 border-b border-neutral-200">
              <h3 className={`text-sm font-semibold uppercase tracking-wider ${colors.text}`}>Mail Delivery Logs</h3>
            </div>

            <div className="space-y-0 max-h-[50vh] overflow-y-auto">
              {filteredLogs.length === 0 ? (
                <div className="p-8 text-center">
                  <Inbox className={`h-12 w-12 mx-auto ${colors.textMuted} mb-3`} />
                  <p className={`text-sm ${colors.textSecondary}`}>No email logs yet</p>
                </div>
              ) : (
                filteredLogs.map((log) => (
                  <div key={log._id} className={`p-4 border-b border-neutral-200 last:border-b-0 text-xs flex justify-between gap-4 hover:bg-neutral-50 transition-colors duration-150`}>
                    <div className="space-y-1">
                      <p className={`font-medium ${colors.text} line-clamp-1`}>{log.subject}</p>
                      <p className={`text-[10px] ${colors.textSecondary}`}>To: {log.to} | Via: {log.transport}</p>
                      {log.error && <p className="text-[9px] text-red-500 font-medium">Err: {log.error}</p>}
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[8px] uppercase font-medium border ${
                        log.status === 'sent'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : 'bg-red-50 border-red-200 text-red-700'
                      }`}>
                        {log.status}
                      </span>
                      <span className={`block text-[8px] ${colors.textMuted} mt-1`}>{new Date(log.date).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Email;
