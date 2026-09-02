import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAdminTheme } from '../../context/AdminThemeContext';
import client from '../../api/client';
import { Code, Save, RefreshCw, Check, Copy, AlertTriangle, Sparkles, FileCode, Sliders } from 'lucide-react';

const PageConfigPanel = () => {
  const { colors } = useAdminTheme();
  const [jsonText, setJsonText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [jsonError, setJsonError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchConfig = async () => {
    setLoading(true);
    setJsonError('');
    try {
      const res = await client.get('/api/admin/settings/page-config');
      if (res.data?.success && res.data?.data) {
        setJsonText(JSON.stringify(res.data.data, null, 2));
      }
    } catch (err) {
      setJsonError('Failed to load page configuration JSON: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setJsonText(JSON.stringify(parsed, null, 2));
      setJsonError('');
    } catch (err) {
      setJsonError('Invalid JSON format: ' + err.message);
    }
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveConfig = async () => {
    setJsonError('');
    setSaveSuccess(false);

    let parsedConfig = null;
    try {
      parsedConfig = JSON.parse(jsonText);
    } catch (err) {
      setJsonError('JSON Syntax Error: ' + err.message);
      return;
    }

    setSaving(true);
    try {
      const res = await client.put('/api/admin/settings/page-config', { config: parsedConfig });
      if (res.data?.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        fetchConfig();
      }
    } catch (err) {
      setJsonError('Failed to save configuration: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className={`text-2xl font-extrabold ${colors.text} tracking-tight flex items-center gap-2.5`}>
              <FileCode className="h-6 w-6 text-brand-600" />
              <span>Page Configuration Panel (JSON Format)</span>
            </h1>
            <p className={`text-xs ${colors.textSecondary} mt-1`}>
              Manage site layout, hero text, pricing plans, navigation links, branding, and testimonials using dynamic JSON format.
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handleFormatJson}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-bold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 transition-colors"
              title="Format JSON"
            >
              <Code className="h-3.5 w-3.5" />
              <span>Format JSON</span>
            </button>

            <button
              onClick={handleCopyJson}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-bold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 transition-colors"
              title="Copy JSON"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>

            <button
              onClick={fetchConfig}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-bold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 transition-colors"
              title="Reload JSON"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Reload</span>
            </button>

            <button
              onClick={handleSaveConfig}
              disabled={saving || loading}
              className="inline-flex items-center space-x-2 px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition-colors"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'Saving JSON...' : 'Save Configuration'}</span>
            </button>
          </div>
        </div>

        {/* Notifications */}
        {jsonError && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{jsonError}</span>
          </div>
        )}

        {saveSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-xs font-semibold flex items-center gap-2">
            <Check className="h-4 w-4 shrink-0" />
            <span>Page configuration JSON saved successfully! Updated database and site settings.</span>
          </div>
        )}

        {/* JSON Editor Box */}
        <div className="p-4 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-neutral-900 shadow-xl space-y-3">
          <div className="flex items-center justify-between px-2 text-xs font-mono font-bold text-neutral-400">
            <span className="flex items-center gap-1.5">
              <Sliders className="h-3.5 w-3.5 text-brand-400" />
              page_configuration.json
            </span>
            <span className="text-[10px] text-neutral-500">Live Mongoose Schema JSON Sync</span>
          </div>

          <textarea
            rows={24}
            value={jsonText}
            onChange={(e) => {
              setJsonText(e.target.value);
              setJsonError('');
            }}
            placeholder="Edit Page Configuration JSON here..."
            className="w-full p-4 rounded-2xl bg-neutral-950 text-emerald-400 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 leading-relaxed resize-none shadow-inner border border-neutral-800"
          />
        </div>
      </div>
    </AdminLayout>
  );
};

export default PageConfigPanel;

