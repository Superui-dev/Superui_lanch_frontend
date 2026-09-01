import React, { useState, useEffect } from 'react';
import { useAdminTheme } from '../../context/AdminThemeContext';
import AdminLayout from '../../components/admin/AdminLayout';
import { Bell, Key, Settings, Send, ShieldCheck } from 'lucide-react';

import client from '../../api/client';

const Telegram = () => {
  const { colors } = useAdminTheme();
  const [botToken, setBotToken] = useState('');
  const [chatId, setChatId] = useState('');
  const [logs, setLogs] = useState([
    { _id: 'tg-1', event: 'Admin Security System Active', text: '🚨 DevTools & Admin Inspection Alerts connected to @SuperUi_Admin_bot', status: 'sent', date: new Date().toISOString() },
    { _id: 'tg-2', event: 'Admin Login Notification', text: '✅ Admin Session Sync active with IP resolution', status: 'sent', date: new Date().toISOString() }
  ]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await client.get('/api/public/settings');
        if (res.data?.success && res.data?.data) {
          const settings = res.data.data;
          if (settings.telegram) {
            setBotToken(settings.telegram.botToken || '');
            setChatId(settings.telegram.chatId || '');
          }
        }
      } catch (err) {
        console.warn('Failed to load Telegram settings:', err.message);
      }
    };
    fetchSettings();
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await client.get('/api/public/settings');
      const currentSettings = res.data?.data || {};

      const payload = {
        ...currentSettings,
        telegram: {
          botToken,
          chatId
        }
      };

      await client.put('/api/admin/settings', payload);
      alert('Telegram Bot Credentials Saved Successfully and updated in Database.');
    } catch (err) {
      alert('Failed to save settings: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const triggerTestNotification = async () => {
    try {
      await client.post('/api/public/inspect-alert', {
        page: '/india/admin/telegram',
        details: 'Manual Test Notification dispatched from Telegram Admin Panel'
      });
      const testLog = {
        _id: 'tg_' + Math.random().toString(36).substr(2, 9),
        event: 'Manual Test Alert',
        text: '🔔 Test notification dispatched to @SuperUi_Admin_bot',
        status: 'sent',
        date: new Date().toISOString()
      };
      setLogs(prev => [testLog, ...prev]);
    } catch (err) {
      alert('Test alert dispatched: ' + (err.message || 'Check Telegram bot'));
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 lg:p-10 space-y-10">
        <header className={`pb-6 border-b ${colors.border}`}>
          <h1 className={`text-xl sm:text-2xl font-semibold ${colors.text}`}>Telegram Notifications</h1>
          <p className={`${colors.textSecondary} text-sm mt-1`}>Configure bot credentials and audit push logs for orders and security locked sessions.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <form onSubmit={handleSaveSettings} className={`lg:col-span-5 ${colors.bgCard} border ${colors.cardBorder} p-6 rounded-2xl space-y-5`}>
            <h2 className={`text-sm font-semibold uppercase tracking-wider ${colors.text}`}>
              Bot Configurations
            </h2>

            <div className="space-y-4 text-xs">
              <div>
                <label className={`block ${colors.textSecondary} font-medium mb-1.5 uppercase text-[10px]`}>Bot API Token</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                    <Key className="h-4 w-4" />
                  </span>
                  <input
                    type="password"
                    required
                    value={botToken}
                    onChange={(e) => setBotToken(e.target.value)}
                    className={`w-full ${colors.bgInput} border ${colors.borderInput} rounded-xl pl-10 pr-4 py-2.5 ${colors.text} placeholder:text-neutral-400 focus:outline-none ${colors.inputFocus} transition-all duration-200`}
                  />
                </div>
              </div>

              <div>
                <label className={`block ${colors.textSecondary} font-medium mb-1.5 uppercase text-[10px]`}>Channel Chat ID</label>
                <input
                  type="text"
                  required
                  value={chatId}
                  onChange={(e) => setChatId(e.target.value)}
                  className={`w-full ${colors.bgInput} border ${colors.borderInput} rounded-xl px-3.5 py-2.5 ${colors.text} placeholder:text-neutral-400 focus:outline-none ${colors.inputFocus} transition-all duration-200`}
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={triggerTestNotification}
                  className={`w-full py-3 rounded-xl border border-neutral-200 text-neutral-700 text-xs font-medium hover:bg-neutral-50 transition-all duration-200`}
                >
                  Send Test Alert
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold transition-all duration-200 hover:shadow-lg disabled:opacity-50 btn-shine"
                >
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </div>
          </form>

          <div className={`lg:col-span-7 ${colors.bgCard} border ${colors.cardBorder} rounded-2xl`}>
            <div className="p-6 border-b border-neutral-200">
              <h3 className={`text-sm font-semibold uppercase tracking-wider ${colors.text}`}>Bot Message Logs</h3>
            </div>

            <div className="space-y-0 max-h-[40vh] overflow-y-auto">
              {logs.map((log) => (
                <div key={log._id} className={`p-4 border-b border-neutral-200 last:border-b-0 text-xs flex justify-between gap-4 hover:bg-neutral-50 transition-colors duration-150`}>
                  <div className="space-y-1">
                    <p className={`font-medium ${colors.text} leading-tight`}>{log.event}</p>
                    <p className={`text-[10px] ${colors.textSecondary} leading-normal`}>{log.text}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[8px] uppercase font-medium border ${colors.badge}`}>
                      {log.status}
                    </span>
                    <span className={`block text-[8px] ${colors.textMuted} mt-1`}>{new Date(log.date).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Telegram;
