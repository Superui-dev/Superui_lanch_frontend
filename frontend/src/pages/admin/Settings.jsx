import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAdminTheme } from '../../context/AdminThemeContext';
import AdminLayout from '../../components/admin/AdminLayout';
import client from '../../api/client';
import { Sliders, Laptop, Globe, Sun, Moon, Upload, Type, Grid } from 'lucide-react';

const WebsiteSettings = () => {
  const { colors, theme, toggleTheme } = useAdminTheme();
  const [activeTab, setActiveTab] = useState('branding');
  const [saving, setSaving] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [logoText, setLogoText] = useState('SuperUI');
  const [showLogo, setShowLogo] = useState(true);
  const [showLogoText, setShowLogoText] = useState(true);
  const [logoPreview, setLogoPreview] = useState('/logo/superui_logo.png');
  const fileInputRef = useRef(null);

  const [copyrightText, setCopyrightText] = useState('');
  const [twitterLink, setTwitterLink] = useState('');
  const [githubLink, setGithubLink] = useState('');

  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');

  // Load current settings from backend on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await client.get('/api/public/settings', { silent: true });
        if (res.data?.success && res.data?.data) {
          const s = res.data.data;
          if (s.branding?.logoText) setLogoText(s.branding.logoText);
          if (s.branding?.showLogo !== undefined) setShowLogo(s.branding.showLogo);
          if (s.branding?.showLogoText !== undefined) setShowLogoText(s.branding.showLogoText);
          if (s.branding?.logoUrl) setLogoPreview(s.branding.logoUrl);
          if (s.footer?.copyrightText) setCopyrightText(s.footer.copyrightText);
          if (s.footer?.socialLinks?.twitter) setTwitterLink(s.footer.socialLinks.twitter);
          if (s.footer?.socialLinks?.github) setGithubLink(s.footer.socialLinks.github);
          if (s.seo?.title) setSeoTitle(s.seo.title);
          if (s.seo?.description) setSeoDescription(s.seo.description);
        }
      } catch (err) {
        console.warn('Failed to load settings:', err.message);
      } finally {
        setLoadingSettings(false);
      }
    };
    fetchSettings();
  }, []);


  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const newLogoUrl = `/logo/superui_logo_2.png?t=${Date.now()}`;
      setLogoPreview(newLogoUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError('');
    setSaveSuccess(false);

    const payload = {
      branding: {
        logoUrl: logoPreview,
        logoText,
        showLogo,
        showLogoText
      },
      footer: {
        copyrightText,
        socialLinks: {
          twitter: twitterLink,
          github: githubLink
        }
      },
      seo: {
        title: seoTitle,
        description: seoDescription
      }
    };

    try {
      await client.put('/api/admin/settings', payload);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
      setSaveError(err.response?.data?.message || err.message || 'Failed to update settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 lg:p-10 space-y-10">
        <header className={`pb-6 border-b ${colors.border} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
          <div>
            <h1 className={`text-xl sm:text-2xl font-semibold ${colors.text}`}>Website Configurations</h1>
            <p className={`${colors.textSecondary} text-sm mt-1`}>Manage global branding, navigations, copyrights, social icons, and SEO headers.</p>
          </div>

          <div className="flex items-center gap-3 self-start">
            {saveSuccess && (
              <span className="text-xs font-medium text-emerald-600">✓ Settings saved successfully</span>
            )}
            {saveError && (
              <span className="text-xs font-medium text-red-600">{saveError}</span>
            )}
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="px-5 py-3 bg-neutral-900 hover:bg-neutral-800 text-xs font-semibold text-white rounded-xl transition-all duration-200 hover:shadow-lg btn-shine"
            >
              {saving ? 'Saving changes...' : 'Save Settings'}
            </button>
          </div>
        </header>

        {/* Theme Toggle Card */}
        <div className={`${colors.cardBg} border ${colors.cardBorder} rounded-2xl p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-sm font-semibold ${colors.text} uppercase tracking-wider`}>Admin Panel Theme</h3>
              <p className={`${colors.textSecondary} text-sm mt-1`}>Choose between light and dark mode for the admin dashboard.</p>
            </div>
            <button
              onClick={toggleTheme}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl border ${colors.border} ${colors.hover} transition-all duration-200`}
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              <span className={`text-xs font-medium ${colors.text}`}>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
            </button>
          </div>
        </div>

        {/* Quick Links */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6`}>
          <Link
            to="/india/admin/navbar"
            className={`${colors.cardBg} border ${colors.cardBorder} rounded-2xl p-6 hover:shadow-md transition-all duration-200 group`}
          >
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-xl ${colors.accentBg} ${colors.accent}`}>
                <Type className="h-5 w-5" />
              </div>
              <div>
                <h3 className={`text-sm font-bold ${colors.text} group-hover:text-brand-600 transition-colors`}>Navbar Menu</h3>
                <p className={`text-[11px] ${colors.textSecondary} mt-0.5`}>Edit navigation links, labels, URLs, order, and visibility.</p>
              </div>
            </div>
          </Link>
          <Link
            to="/india/admin/services"
            className={`${colors.cardBg} border ${colors.cardBorder} rounded-2xl p-6 hover:shadow-md transition-all duration-200 group`}
          >
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-xl ${colors.accentBg} ${colors.accent}`}>
                <Grid className="h-5 w-5" />
              </div>
              <div>
                <h3 className={`text-sm font-bold ${colors.text} group-hover:text-brand-600 transition-colors`}>Services</h3>
                <p className={`text-[11px] ${colors.textSecondary} mt-0.5`}>Manage homepage service cards, titles, images, and links.</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Dynamic configuration tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Tab lists */}
          <div className={`lg:col-span-3 ${colors.bgSecondary} border ${colors.border} rounded-2xl p-2.5 space-y-1 text-xs font-medium`}>
            {[
              { id: 'branding', label: 'Branding & Logo', icon: Sliders },
              { id: 'footer', label: 'Footer & Socials', icon: Laptop },
              { id: 'seo', label: 'SEO & Metadata', icon: Globe }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                    activeTab === tab.id
                      ? `${colors.accentBg} ${colors.accent} ${colors.accentBorder} border`
                      : `${colors.textSecondary} ${colors.hover}`
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Form contents */}
          <div className={`lg:col-span-9 ${colors.bgCard} border ${colors.cardBorder} rounded-2xl p-6`}>
            {activeTab === 'branding' && (
              <div className="space-y-5 text-xs">
                <h3 className={`text-sm font-semibold ${colors.text} uppercase tracking-wider pb-4 border-b ${colors.border}`}>Logo Parameters</h3>

                <div className="flex items-center space-x-4 pb-4">
                  <div className={`h-16 w-16 rounded-xl border ${colors.border} ${colors.bgSecondary} flex items-center justify-center overflow-hidden`}>
                    <img src={logoPreview} alt="Logo preview" className="h-12 w-12 object-contain" onError={(e) => { e.target.src = ''; e.target.style.display = 'none'; }} />
                  </div>
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl border ${colors.border} ${colors.hover} text-xs font-medium ${colors.text} transition-all duration-200`}
                    >
                      <Upload className="h-4 w-4" />
                      <span>Upload New Logo</span>
                    </button>
                    <p className={`text-[10px] ${colors.textMuted} mt-1`}>Stored as superui_logo_2.png in /logo folder</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={`block ${colors.textSecondary} font-medium mb-1.5 uppercase text-[10px]`}>Logo Primary Title</label>
                    <input
                      type="text"
                      value={logoText}
                      onChange={(e) => setLogoText(e.target.value)}
                      className={`w-full ${colors.bgInput} border ${colors.borderInput} rounded-xl px-3.5 py-2.5 ${colors.text} placeholder:text-neutral-400 focus:outline-none ${colors.inputFocus} transition-all duration-200`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <label className={`flex items-center space-x-2 ${colors.text} font-medium select-none cursor-pointer`}>
                    <input
                      type="checkbox"
                      checked={showLogo}
                      onChange={(e) => setShowLogo(e.target.checked)}
                       className="rounded border-neutral-300 text-brand-600 focus:ring-0"
                    />
                    <span>Show Vector Logo Badge</span>
                  </label>

                  <label className={`flex items-center space-x-2 ${colors.text} font-medium select-none cursor-pointer`}>
                    <input
                      type="checkbox"
                      checked={showLogoText}
                      onChange={(e) => setShowLogoText(e.target.checked)}
                       className="rounded border-neutral-300 text-brand-600 focus:ring-0"
                    />
                    <span>Show Logo Typography Text</span>
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'footer' && (
              <div className="space-y-5 text-xs">
                <h3 className={`text-sm font-semibold ${colors.text} uppercase tracking-wider pb-4 border-b ${colors.border}`}>Footer Options</h3>

                <div>
                  <label className={`block ${colors.textSecondary} font-medium mb-1.5 uppercase text-[10px]`}>Copyright Disclaimer Text</label>
                  <input
                    type="text"
                    value={copyrightText}
                    onChange={(e) => setCopyrightText(e.target.value)}
                    className={`w-full ${colors.bgInput} border ${colors.borderInput} rounded-xl px-3.5 py-2.5 ${colors.text} placeholder:text-neutral-400 focus:outline-none ${colors.inputFocus} transition-all duration-200`}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                  <div>
                    <label className={`block ${colors.textSecondary} font-medium mb-1.5 uppercase text-[10px]`}>Twitter Profile Link</label>
                    <input
                      type="text"
                      value={twitterLink}
                      onChange={(e) => setTwitterLink(e.target.value)}
                      className={`w-full ${colors.bgInput} border ${colors.borderInput} rounded-xl px-3.5 py-2.5 ${colors.text} placeholder:text-neutral-400 focus:outline-none ${colors.inputFocus} transition-all duration-200`}
                    />
                  </div>
                  <div>
                    <label className={`block ${colors.textSecondary} font-medium mb-1.5 uppercase text-[10px]`}>GitHub Repository URL</label>
                    <input
                      type="text"
                      value={githubLink}
                      onChange={(e) => setGithubLink(e.target.value)}
                      className={`w-full ${colors.bgInput} border ${colors.borderInput} rounded-xl px-3.5 py-2.5 ${colors.text} placeholder:text-neutral-400 focus:outline-none ${colors.inputFocus} transition-all duration-200`}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'seo' && (
              <div className="space-y-5 text-xs">
                <h3 className={`text-sm font-semibold ${colors.text} uppercase tracking-wider pb-4 border-b ${colors.border}`}>SEO Meta Configuration</h3>

                <div>
                  <label className={`block ${colors.textSecondary} font-medium mb-1.5 uppercase text-[10px]`}>Browser Title Header</label>
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    className={`w-full ${colors.bgInput} border ${colors.borderInput} rounded-xl px-3.5 py-2.5 ${colors.text} placeholder:text-neutral-400 focus:outline-none ${colors.inputFocus} transition-all duration-200`}
                  />
                </div>

                <div>
                  <label className={`block ${colors.textSecondary} font-medium mb-1.5 uppercase text-[10px]`}>Meta Description Tag</label>
                  <textarea
                    rows={3}
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    className={`w-full ${colors.bgInput} border ${colors.borderInput} rounded-xl px-3.5 py-2.5 ${colors.text} placeholder:text-neutral-400 focus:outline-none ${colors.inputFocus} transition-all duration-200 resize-none`}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default WebsiteSettings;
