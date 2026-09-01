import React, { useState, useEffect } from 'react';
import { useAdminTheme } from '../../context/AdminThemeContext';
import AdminLayout from '../../components/admin/AdminLayout';
import client from '../../api/client';
import { DollarSign, Save, RefreshCw, AlertTriangle, FileJson, Check } from 'lucide-react';

const defaultPricing = {
  sectionTitle: "Pricing with No additional dev cost",
  trustBadge: "Trusted by ★ 4.1k+ Creators",
  plans: [
    {
      id: "landing-page",
      title: "Landing Page",
      description: "For businesses that need one page to start converting, fast.",
      pricingNote: "Start with Free Hero section then $999 for a full page.",
      pricingNoteHighlight: "Free Hero",
      isFeatured: false,
      features: [
        "Single page",
        "Framer development",
        "Fully responsive",
        "High converting page",
        "Update every 24hrs",
        "1-2 week delivery",
        "14-day support"
      ]
    },
    {
      id: "full-website",
      title: "Full Website Package",
      description: "For businesses ready to build a real online presence.",
      pricingNote: "Start with 3 Free sections then $1999 for a full site.",
      pricingNoteHighlight: "3 Free sections",
      isFeatured: true,
      features: [
        "Up to 6 pages",
        "Up to 2 CMS collections",
        "Accept bookings, calls",
        "Google site index",
        "AEO + SEO optimization",
        "AI generated assets",
        "3-4 week delivery",
        "Private Slack channel"
      ]
    }
  ],
  customPlan: {
    title: "Custom Website",
    description: "For businesses with specific needs, integrations and beyond the standard plans."
  }
};

const PricingAdmin = () => {
  const { colors, isLight } = useAdminTheme();
  const [settings, setSettings] = useState(null);
  const [jsonText, setJsonText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await client.get('/api/public/settings', { silent: true });
        if (res.data?.success && res.data?.data) {
          const fetchedSettings = res.data.data;
          setSettings(fetchedSettings);
          
          const pricingData = fetchedSettings.pricing && Object.keys(fetchedSettings.pricing).length > 0
            ? fetchedSettings.pricing
            : defaultPricing;
            
          setJsonText(JSON.stringify(pricingData, null, 2));
        }
      } catch (err) {
        setError('Failed to load pricing data: ' + err.message);
        setJsonText(JSON.stringify(defaultPricing, null, 2));
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      // Validate JSON structure
      const parsedPricing = JSON.parse(jsonText);
      
      // Validation checks
      if (!parsedPricing.sectionTitle) throw new Error('Missing "sectionTitle" field.');
      if (!Array.isArray(parsedPricing.plans)) throw new Error('The "plans" field must be an array.');
      if (!parsedPricing.customPlan) throw new Error('Missing "customPlan" object.');

      const payload = {
        ...settings,
        pricing: parsedPricing
      };

      await client.put('/api/admin/settings', payload);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Invalid JSON format');
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefault = () => {
    if (window.confirm('Are you sure you want to reset the editor to the default pricing template? (This does not save until you click Save Changes)')) {
      setJsonText(JSON.stringify(defaultPricing, null, 2));
      setError('');
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 lg:p-10 space-y-8 max-w-6xl mx-auto">
        <header className="pb-6 border-b border-neutral-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className={`text-xl sm:text-2xl font-bold ${colors.text}`}>Pricing Configurations</h1>
            <p className={`${colors.textSecondary} text-sm mt-1`}>
              Manage storefront plans, parameters, features lists, and visual card designs using raw JSON structure.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleResetToDefault}
              className={`px-4 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                isLight 
                  ? 'border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 shadow-sm' 
                  : 'border-neutral-800 bg-neutral-900/50 hover:bg-neutral-900 text-slate-300'
              }`}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Reset Template</span>
            </button>
            <button
              onClick={handleSave}
              disabled={loading || saving}
              className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-xs font-bold text-white rounded-xl transition-all hover:shadow-lg flex items-center gap-2 btn-shine disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{saving ? 'Saving changes...' : 'Save Configuration'}</span>
            </button>
          </div>
        </header>

        {error && (
          <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-500 text-xs flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Validation Error</p>
              <p className="mt-1 opacity-90">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-500 text-xs flex items-center gap-3">
            <Check className="h-5 w-5 shrink-0" />
            <p className="font-bold">Pricing settings saved successfully and live on storefront!</p>
          </div>
        )}

        <div className={`border ${colors.cardBorder} ${colors.cardBg} rounded-2xl overflow-hidden shadow-sm`}>
          <div className={`px-5 py-4 border-b ${colors.cardBorder} flex items-center justify-between`}>
            <div className="flex items-center gap-2">
              <FileJson className="h-4 w-4 text-brand-500" />
              <span className={`text-xs font-bold ${colors.text} uppercase tracking-wider`}>Edit Plans JSON Schema</span>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded bg-brand-500/10 text-brand-500 font-extrabold`}>
              Schema-v1
            </span>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-24">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-500"></div>
              </div>
            ) : (
              <textarea
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                rows={22}
                className={`w-full p-4 rounded-xl font-mono text-xs leading-relaxed border ${
                  isLight
                    ? 'bg-neutral-50 border-neutral-200 text-neutral-800 focus:bg-white focus:ring-1 focus:ring-brand-500'
                    : 'bg-[#18181B] border-neutral-800 text-slate-300 focus:bg-[#1E1E24] focus:ring-1 focus:ring-brand-500'
                } focus:outline-none transition-all resize-y`}
                placeholder="Paste pricing plans JSON config here..."
              />
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default PricingAdmin;
