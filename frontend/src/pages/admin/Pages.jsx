import React, { useState, useEffect } from 'react';
import { useAdminTheme } from '../../context/AdminThemeContext';
import AdminLayout from '../../components/admin/AdminLayout';
import client from '../../api/client';
import { Layout, Save, RefreshCw, AlertTriangle, FileJson, Check, Menu, Image, Footprints } from 'lucide-react';

const defaultHero = {
  badgeText: "Antigravity SuperUI 2.0 Engine Released",
  headline: "Build Fast With Production-Ready Digital Assets",
  headlineHighlight: "Production-Ready",
  subheadline: "Curated e-books, developer UI kits, and high-converting React templates. Designed for senior engineers, designers, and scaling founders.",
  ctaPrimaryText: "Explore Products Store",
  ctaSecondaryText: "Customer Sign Up"
};

const defaultNavbar = {
  logoText: "SuperUI",
  logoHighlightColor: "#ff5100",
  showLogo: true,
  showLogoText: true,
  menuItems: [
    { label: "Home", url: "/" },
    { label: "Products", url: "/products" },
    { label: "Portfolio", url: "/portfolio" },
    { label: "Contact", url: "/contact" }
  ],
  showLogin: true,
  showRegister: true,
  showCart: true
};

const defaultFooter = {
  description: "Premium digital products for modern creators. Websites, templates, e-books, and more.",
  copyright: "© 2026 SuperUI. All rights reserved.",
  columns: [
    {
      title: "Products",
      links: [
        { label: "All Products", url: "/products" },
        { label: "E-Books", url: "/products?category=ebooks" },
        { label: "Templates", url: "/products?category=templates" },
        { label: "Websites", url: "/products?category=websites" }
      ]
    },
    {
      title: "Portfolio",
      links: [
        { label: "E-Books", url: "/portfolio?category=ebooks" },
        { label: "Templates", url: "/portfolio?category=templates" },
        { label: "Websites", url: "/portfolio?category=websites" },
        { label: "UI Kits", url: "/portfolio?category=ui-kits" }
      ]
    },
    {
      title: "Support",
      links: [
        { label: "Contact", url: "/contact" },
        { label: "FAQ", url: "/contact" },
        { label: "Terms", url: "/contact" },
        { label: "Privacy", url: "/contact" }
      ]
    }
  ]
};

const PagesAdmin = () => {
  const { colors, isLight } = useAdminTheme();
  const [settings, setSettings] = useState(null);
  const [activeTab, setActiveTab] = useState('navbar'); // 'navbar' | 'hero' | 'footer'
  const [jsonText, setJsonText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const loadTabData = (fetchedSettings, tab) => {
    setError('');
    if (tab === 'navbar') {
      const navData = {
        logoText: fetchedSettings.branding?.logoText || defaultNavbar.logoText,
        logoHighlightColor: fetchedSettings.branding?.logoHighlightColor || defaultNavbar.logoHighlightColor,
        showLogo: fetchedSettings.branding?.showLogo ?? defaultNavbar.showLogo,
        showLogoText: fetchedSettings.branding?.showLogoText ?? defaultNavbar.showLogoText,
        menuItems: fetchedSettings.navbar?.menuItems || defaultNavbar.menuItems,
        showLogin: fetchedSettings.navbar?.showLogin ?? defaultNavbar.showLogin,
        showRegister: fetchedSettings.navbar?.showRegister ?? defaultNavbar.showRegister,
        showCart: fetchedSettings.navbar?.showCart ?? defaultNavbar.showCart
      };
      setJsonText(JSON.stringify(navData, null, 2));
    } else if (tab === 'hero') {
      const heroData = fetchedSettings.hero && Object.keys(fetchedSettings.hero).length > 0
        ? fetchedSettings.hero
        : defaultHero;
      setJsonText(JSON.stringify(heroData, null, 2));
    } else if (tab === 'footer') {
      const footerData = {
        description: fetchedSettings.footer?.description || defaultFooter.description,
        copyright: fetchedSettings.footer?.copyright || defaultFooter.copyright,
        columns: fetchedSettings.footer?.columns || defaultFooter.columns
      };
      setJsonText(JSON.stringify(footerData, null, 2));
    }
  };

  const fetchSettings = async (tabToLoad = activeTab) => {
    setLoading(true);
    try {
      const res = await client.get('/api/public/settings', { silent: true });
      if (res.data?.success && res.data?.data) {
        setSettings(res.data.data);
        loadTabData(res.data.data, tabToLoad);
      }
    } catch (err) {
      setError('Failed to load page content: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (settings) {
      loadTabData(settings, tab);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      const parsed = JSON.parse(jsonText);
      let payload = { ...settings };

      if (activeTab === 'navbar') {
        payload.branding = {
          ...payload.branding,
          logoText: parsed.logoText,
          logoHighlightColor: parsed.logoHighlightColor,
          showLogo: parsed.showLogo,
          showLogoText: parsed.showLogoText
        };
        payload.navbar = {
          ...payload.navbar,
          menuItems: parsed.menuItems,
          showLogin: parsed.showLogin,
          showRegister: parsed.showRegister,
          showCart: parsed.showCart
        };
      } else if (activeTab === 'hero') {
        payload.hero = parsed;
      } else if (activeTab === 'footer') {
        payload.footer = {
          ...payload.footer,
          description: parsed.description,
          copyright: parsed.copyright,
          columns: parsed.columns
        };
      }

      await client.put('/api/admin/settings', payload);
      setSettings(payload);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Invalid JSON format');
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefault = () => {
    if (window.confirm(`Are you sure you want to reset the ${activeTab.toUpperCase()} configuration editor to default template?`)) {
      if (activeTab === 'navbar') {
        setJsonText(JSON.stringify(defaultNavbar, null, 2));
      } else if (activeTab === 'hero') {
        setJsonText(JSON.stringify(defaultHero, null, 2));
      } else if (activeTab === 'footer') {
        setJsonText(JSON.stringify(defaultFooter, null, 2));
      }
      setError('');
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 lg:p-10 space-y-8 max-w-6xl mx-auto">
        <header className="pb-6 border-b border-neutral-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className={`text-xl sm:text-2xl font-bold ${colors.text}`}>Page Configuration Panel</h1>
            <p className={`${colors.textSecondary} text-sm mt-1`}>
              Edit your website Navbar, Hero section, and Footer parameters "pin to pin" using structured JSON format.
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

        {/* Configuration Tabs */}
        <div className="flex border-b border-neutral-200 dark:border-neutral-850 gap-2">
          <button
            onClick={() => handleTabChange('navbar')}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'navbar'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-neutral-400 hover:text-neutral-600'
            }`}
          >
            <Menu className="h-4 w-4" />
            <span>Navbar Header Config</span>
          </button>
          <button
            onClick={() => handleTabChange('hero')}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'hero'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-neutral-400 hover:text-neutral-600'
            }`}
          >
            <Image className="h-4 w-4" />
            <span>Hero Section Config</span>
          </button>
          <button
            onClick={() => handleTabChange('footer')}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'footer'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-neutral-400 hover:text-neutral-600'
            }`}
          >
            <Footprints className="h-4 w-4" />
            <span>Footer Section Config</span>
          </button>
        </div>

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
            <p className="font-bold">{activeTab.toUpperCase()} layout settings saved successfully and live on storefront!</p>
          </div>
        )}

        <div className={`border ${colors.cardBorder} ${colors.cardBg} rounded-2xl overflow-hidden shadow-sm`}>
          <div className={`px-5 py-4 border-b ${colors.cardBorder} flex items-center justify-between`}>
            <div className="flex items-center gap-2">
              <FileJson className="h-4 w-4 text-brand-500" />
              <span className={`text-xs font-bold ${colors.text} uppercase tracking-wider`}>Edit {activeTab} JSON Schema</span>
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
                placeholder={`Paste ${activeTab} JSON config here...`}
              />
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default PagesAdmin;
