import React, { useState, useEffect } from 'react';
import { useAdminTheme } from '../../context/AdminThemeContext';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  Plus, Trash2, Image as ImageIcon, Pencil, X, Eye, EyeOff,
  RotateCcw, ExternalLink, Sparkles, Check, ArrowUpDown, Layers
} from 'lucide-react';
import client from '../../api/client';

const UpcomingBanners = () => {
  const { colors, isLight } = useAdminTheme();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState({ text: '', type: '' });
  
  const [formData, setFormData] = useState({
    title: '',
    bannerImage: '',
    badge: '',
    headline: '',
    subtitle: '',
    link: '/products',
    order: 0,
    visible: true
  });

  const showFeedback = (text, type = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => {
      setFeedbackMsg({ text: '', type: '' });
    }, 4000);
  };

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await client.get('/api/admin/upcoming-banners');
      if (res.data?.success && res.data?.data) {
        setBanners(res.data.data);
      }
    } catch (err) {
      showFeedback(err.response?.data?.message || 'Failed to fetch banners', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.bannerImage.trim()) {
      showFeedback('Title and Banner Image URL are required', 'error');
      return;
    }

    try {
      setSubmitting(true);
      if (editingId) {
        await client.put(`/api/admin/upcoming-banners/${editingId}`, formData);
        showFeedback('Upcoming banner updated successfully!');
      } else {
        await client.post('/api/admin/upcoming-banners', formData);
        showFeedback('New upcoming banner created successfully!');
      }
      handleCancel();
      fetchBanners();
    } catch (err) {
      showFeedback(err.response?.data?.message || 'Failed to save banner', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (banner) => {
    setEditingId(banner._id);
    setFormData({
      title: banner.title || '',
      bannerImage: banner.bannerImage || '',
      badge: banner.badge || '',
      headline: banner.headline || '',
      subtitle: banner.subtitle || '',
      link: banner.link || '/products',
      order: banner.order !== undefined ? banner.order : 0,
      visible: banner.visible !== false
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleVisibility = async (banner) => {
    try {
      const updatedVisible = !banner.visible;
      await client.put(`/api/admin/upcoming-banners/${banner._id}`, {
        visible: updatedVisible
      });
      setBanners(prev =>
        prev.map(b => (b._id === banner._id ? { ...b, visible: updatedVisible } : b))
      );
      showFeedback(`Banner is now ${updatedVisible ? 'Visible' : 'Hidden'}`);
    } catch (err) {
      showFeedback('Failed to update visibility', 'error');
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete banner "${title}"?`)) return;
    try {
      await client.delete(`/api/admin/upcoming-banners/${id}`);
      showFeedback('Banner deleted successfully');
      fetchBanners();
    } catch (err) {
      showFeedback(err.response?.data?.message || 'Failed to delete banner', 'error');
    }
  };

  const handleResetDefaults = async () => {
    if (!window.confirm('Reset all banners to default DigiLocker banners? Any custom banners will be replaced.')) return;
    try {
      setLoading(true);
      await client.post('/api/admin/upcoming-banners/reset');
      showFeedback('Reset to default DigiLocker banners successfully!');
      fetchBanners();
    } catch (err) {
      showFeedback('Failed to reset banners', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      title: '',
      bannerImage: '',
      badge: '',
      headline: '',
      subtitle: '',
      link: '/products',
      order: 0,
      visible: true
    });
  };

  return (
    <AdminLayout>
      <div className="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <header className={`pb-6 border-b ${colors.border} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-orange-500/10 text-orange-500 border border-orange-500/20">
                <Layers className="h-4 w-4" />
              </span>
              <h1 className={`text-xl sm:text-2xl font-bold tracking-tight ${colors.text}`}>
                Upcoming Products & Banners
              </h1>
            </div>
            <p className={`${colors.textSecondary} text-xs sm:text-sm mt-1.5`}>
              Create, edit, reorder, and control live visibility for the hero banner carousel displayed in the Upcoming Products section on the homepage.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleResetDefaults}
              className={`inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border ${colors.border} ${colors.bgSecondary} ${colors.textSecondary} hover:${colors.text} hover:border-orange-500/40 transition-all duration-200`}
              title="Reset to default 4 DigiLocker banners"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Defaults</span>
            </button>

            {!showForm && (
              <button
                onClick={() => {
                  handleCancel();
                  setShowForm(true);
                }}
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-orange-500 text-white text-xs font-semibold shadow-md shadow-orange-500/20 hover:bg-orange-600 transition-all duration-200 active:scale-95"
              >
                <Plus className="h-4 w-4" />
                <span>Add New Banner</span>
              </button>
            )}
          </div>
        </header>

        {/* Feedback Alert Toast */}
        {feedbackMsg.text && (
          <div className={`p-4 rounded-xl text-xs font-medium border flex items-center justify-between transition-all duration-300 ${
            feedbackMsg.type === 'error'
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
          }`}>
            <span>{feedbackMsg.text}</span>
            <button onClick={() => setFeedbackMsg({ text: '', type: '' })}>
              <X className="h-4 w-4 opacity-70 hover:opacity-100" />
            </button>
          </div>
        )}

        {/* Form: Create or Edit */}
        {showForm && (
          <form onSubmit={handleSubmit} className={`${colors.bgCard} border ${colors.cardBorder} p-6 sm:p-8 rounded-2xl space-y-6 shadow-sm`}>
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className={`text-sm font-bold uppercase tracking-wider ${colors.text} flex items-center space-x-2`}>
                  <Sparkles className="h-4 w-4 text-orange-500" />
                  <span>{editingId ? 'Edit Upcoming Banner' : 'Create New Upcoming Banner'}</span>
                </h2>
                <p className={`text-[11px] ${colors.textSecondary} mt-0.5`}>
                  Fill in the banner details. Images will render seamlessly in the full-bleed carousel on the storefront.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCancel}
                className={`p-1.5 rounded-lg ${colors.bgSecondary} border ${colors.border} ${colors.textSecondary} hover:text-orange-500 transition-colors`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              {/* Title / Name */}
              <div>
                <label className={`block ${colors.textSecondary} font-semibold mb-1.5 uppercase text-[10px] tracking-wider`}>
                  Banner Title / Card Label *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Your Documents, Always Accessible"
                  className={`w-full ${colors.bgInput} border ${colors.borderInput} rounded-xl px-3.5 py-2.5 ${colors.text} placeholder:text-neutral-400 focus:outline-none ${colors.inputFocus} transition-all duration-200`}
                />
              </div>

              {/* Banner Image URL */}
              <div>
                <label className={`block ${colors.textSecondary} font-semibold mb-1.5 uppercase text-[10px] tracking-wider`}>
                  Banner Image URL *
                </label>
                <input
                  type="url"
                  required
                  value={formData.bannerImage}
                  onChange={(e) => setFormData({ ...formData, bannerImage: e.target.value })}
                  placeholder="https://example.com/banner.jpg"
                  className={`w-full ${colors.bgInput} border ${colors.borderInput} rounded-xl px-3.5 py-2.5 ${colors.text} placeholder:text-neutral-400 focus:outline-none ${colors.inputFocus} transition-all duration-200`}
                />
              </div>

              {/* Badge Text */}
              <div>
                <label className={`block ${colors.textSecondary} font-semibold mb-1.5 uppercase text-[10px] tracking-wider`}>
                  Badge Label (Optional)
                </label>
                <input
                  type="text"
                  value={formData.badge}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  placeholder="e.g. DigiLocker Ecosystem • Digital India"
                  className={`w-full ${colors.bgInput} border ${colors.borderInput} rounded-xl px-3.5 py-2.5 ${colors.text} placeholder:text-neutral-400 focus:outline-none ${colors.inputFocus} transition-all duration-200`}
                />
              </div>

              {/* Target Link */}
              <div>
                <label className={`block ${colors.textSecondary} font-semibold mb-1.5 uppercase text-[10px] tracking-wider`}>
                  Target Link (Route or External URL)
                </label>
                <input
                  type="text"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  placeholder="e.g. /products or https://..."
                  className={`w-full ${colors.bgInput} border ${colors.borderInput} rounded-xl px-3.5 py-2.5 ${colors.text} placeholder:text-neutral-400 focus:outline-none ${colors.inputFocus} transition-all duration-200`}
                />
              </div>

              {/* Headline */}
              <div className="md:col-span-2">
                <label className={`block ${colors.textSecondary} font-semibold mb-1.5 uppercase text-[10px] tracking-wider`}>
                  Headline (Optional)
                </label>
                <input
                  type="text"
                  value={formData.headline}
                  onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                  placeholder="e.g. Indian Railways Accept DigiLocker as Valid ID"
                  className={`w-full ${colors.bgInput} border ${colors.borderInput} rounded-xl px-3.5 py-2.5 ${colors.text} placeholder:text-neutral-400 focus:outline-none ${colors.inputFocus} transition-all duration-200`}
                />
              </div>

              {/* Subtitle / Description */}
              <div className="md:col-span-2">
                <label className={`block ${colors.textSecondary} font-semibold mb-1.5 uppercase text-[10px] tracking-wider`}>
                  Subtitle / Description (Optional)
                </label>
                <textarea
                  rows={2}
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="e.g. Seamless identity verification during train journeys with digitally signed credentials."
                  className={`w-full ${colors.bgInput} border ${colors.borderInput} rounded-xl px-3.5 py-2.5 ${colors.text} placeholder:text-neutral-400 focus:outline-none ${colors.inputFocus} transition-all duration-200 resize-y`}
                />
              </div>

              {/* Sort Order */}
              <div>
                <label className={`block ${colors.textSecondary} font-semibold mb-1.5 uppercase text-[10px] tracking-wider`}>
                  Display Order (Sequence)
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                  className={`w-full ${colors.bgInput} border ${colors.borderInput} rounded-xl px-3.5 py-2.5 ${colors.text} focus:outline-none ${colors.inputFocus} transition-all duration-200`}
                />
              </div>

              {/* Visibility Checkbox */}
              <div className="flex items-center pt-5">
                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.visible}
                    onChange={(e) => setFormData({ ...formData, visible: e.target.checked })}
                    className="h-4 w-4 rounded border-neutral-300 text-orange-500 focus:ring-orange-500 accent-orange-500"
                  />
                  <span className={`text-xs font-semibold ${colors.text}`}>Visible on storefront</span>
                </label>
              </div>
            </div>

            {/* Live Image & Card Preview */}
            {formData.bannerImage && (
              <div className="pt-2 border-t space-y-2">
                <p className={`text-[10px] font-bold uppercase tracking-wider ${colors.textSecondary}`}>
                  Live Carousel Banner Preview:
                </p>
                <div className="relative rounded-2xl overflow-hidden border border-neutral-200/80 dark:border-neutral-800 shadow-md bg-neutral-900 max-w-2xl">
                  <div className="aspect-[16/7] sm:aspect-[21/9] w-full overflow-hidden flex items-center justify-center">
                    <img
                      src={formData.bannerImage}
                      alt="Banner Preview"
                      className="w-full h-full object-cover object-center"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/1200x500?text=Invalid+Image+URL';
                      }}
                    />
                  </div>
                  {formData.badge && (
                    <div className="absolute top-3 left-3 bg-neutral-900/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-semibold text-orange-400 border border-orange-500/20">
                      {formData.badge}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={handleCancel}
                className={`px-4 py-2 rounded-xl text-xs font-semibold ${colors.bgSecondary} ${colors.textSecondary} border ${colors.border} hover:${colors.text} transition-colors`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl bg-orange-500 text-white text-xs font-semibold shadow-md shadow-orange-500/20 hover:bg-orange-600 disabled:opacity-50 transition-all duration-200"
              >
                {submitting ? 'Saving...' : editingId ? 'Update Banner' : 'Create Banner'}
              </button>
            </div>
          </form>
        )}

        {/* Banner List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className={`text-xs font-bold uppercase tracking-wider ${colors.textSecondary} flex items-center space-x-2`}>
              <span>Active Banners ({banners.length})</span>
            </h2>
            <span className={`text-[11px] ${colors.textSecondary}`}>
              Sorted by display order
            </span>
          </div>

          {loading ? (
            <div className={`p-12 text-center ${colors.textSecondary} text-xs`}>
              Loading upcoming banners...
            </div>
          ) : banners.length === 0 ? (
            <div className={`${colors.bgCard} border ${colors.cardBorder} rounded-2xl p-12 text-center space-y-4`}>
              <ImageIcon className="h-10 w-10 mx-auto text-neutral-400 opacity-50" />
              <div>
                <p className={`text-sm font-semibold ${colors.text}`}>No upcoming banners found</p>
                <p className={`text-xs ${colors.textSecondary} mt-1`}>
                  Add your first custom banner or restore default DigiLocker banners.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={handleResetDefaults}
                  className="px-4 py-2 rounded-xl bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600 transition-colors"
                >
                  Load Default DigiLocker Banners
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {banners.map((banner, index) => (
                <div
                  key={banner._id || index}
                  className={`${colors.bgCard} border ${colors.cardBorder} rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between transition-all duration-200 hover:shadow-md hover:border-orange-500/30 group`}
                >
                  {/* Banner Image Thumbnail with Overlay Badges */}
                  <div className="relative aspect-[16/7] w-full bg-neutral-950 overflow-hidden">
                    <img
                      src={banner.bannerImage}
                      alt={banner.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/800x350?text=Image+Unavailable';
                      }}
                    />
                    
                    {/* Order Tag & Status Badge */}
                    <div className="absolute top-3 left-3 flex items-center space-x-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-white text-[10px] font-bold border border-white/10">
                        #{banner.order !== undefined ? banner.order : index + 1}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold backdrop-blur-md border ${
                        banner.visible !== false
                          ? 'bg-emerald-500/80 text-white border-emerald-400/30'
                          : 'bg-neutral-800/80 text-neutral-300 border-neutral-700/50'
                      }`}>
                        {banner.visible !== false ? 'Active' : 'Hidden'}
                      </span>
                    </div>

                    {banner.badge && (
                      <div className="absolute bottom-3 left-3 max-w-[80%] truncate px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md text-[10px] font-medium text-orange-400 border border-orange-500/20">
                        {banner.badge}
                      </div>
                    )}
                  </div>

                  {/* Content Information */}
                  <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className={`text-sm font-bold ${colors.text} line-clamp-1`}>
                        {banner.title}
                      </h3>
                      {banner.headline && (
                        <p className={`text-xs font-medium text-orange-500 mt-1 line-clamp-1`}>
                          {banner.headline}
                        </p>
                      )}
                      {banner.subtitle && (
                        <p className={`text-xs ${colors.textSecondary} mt-1 line-clamp-2 leading-relaxed`}>
                          {banner.subtitle}
                        </p>
                      )}
                      {banner.link && (
                        <div className="flex items-center space-x-1 mt-2 text-[11px] text-neutral-400">
                          <ExternalLink className="h-3 w-3" />
                          <span className="truncate">{banner.link}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions Bar */}
                    <div className={`pt-3 border-t ${colors.border} flex items-center justify-between`}>
                      <button
                        onClick={() => handleToggleVisibility(banner)}
                        className={`inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                          banner.visible !== false
                            ? `${colors.bgSecondary} ${colors.text} border-neutral-300 dark:border-neutral-700 hover:border-orange-500`
                            : 'bg-neutral-200/50 dark:bg-neutral-800 text-neutral-400 border-transparent hover:text-neutral-200'
                        }`}
                        title={banner.visible !== false ? 'Hide from homepage' : 'Show on homepage'}
                      >
                        {banner.visible !== false ? (
                          <>
                            <Eye className="h-3.5 w-3.5 text-emerald-500" />
                            <span>Visible</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-3.5 w-3.5 text-neutral-400" />
                            <span>Hidden</span>
                          </>
                        )}
                      </button>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(banner)}
                          className={`p-2 rounded-lg ${colors.bgSecondary} border ${colors.border} ${colors.textSecondary} hover:text-orange-500 hover:border-orange-500/40 transition-colors`}
                          title="Edit Banner"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(banner._id, banner.title)}
                          className={`p-2 rounded-lg ${colors.bgSecondary} border ${colors.border} text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/40 transition-colors`}
                          title="Delete Banner"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default UpcomingBanners;

