import React, { useState, useEffect } from 'react';
import { useAdminTheme } from '../../context/AdminThemeContext';
import AdminLayout from '../../components/admin/AdminLayout';
import { Plus, Trash2, Image, Pencil, X } from 'lucide-react';
import client from '../../api/client';

const HeroImages = () => {
  const { colors } = useAdminTheme();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ imageUrl: '', title: '', subtitle: '', linkUrl: '', order: 0, visible: true });

  const fetchImages = async () => {
    try {
      const res = await client.get('/api/admin/hero-images');
      if (res.data?.success && res.data?.data) {
        setImages(res.data.data);
      }
    } catch (err) {
      // Quiet fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.imageUrl) return;

    try {
      if (editingId) {
        await client.put(`/api/admin/hero-images/${editingId}`, formData);
      } else {
        await client.post('/api/admin/hero-images', formData);
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({ imageUrl: '', title: '', subtitle: '', linkUrl: '', order: 0, visible: true });
      fetchImages();
    } catch (err) {
      // Quiet fallback
    }
  };

  const handleEdit = (img) => {
    setEditingId(img._id);
    setFormData({
      imageUrl: img.imageUrl,
      title: img.title || '',
      subtitle: img.subtitle || '',
      linkUrl: img.linkUrl || '',
      order: img.order || 0,
      visible: img.visible !== false
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this hero image?')) return;
    try {
      await client.delete(`/api/admin/hero-images/${id}`);
      fetchImages();
    } catch (err) {
      // Quiet fallback
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ imageUrl: '', title: '', subtitle: '', linkUrl: '', order: 0, visible: true });
  };

  return (
    <AdminLayout>
      <div className="p-6 lg:p-10 space-y-10">
        <header className={`pb-6 border-b ${colors.border} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
          <div>
            <h1 className={`text-xl sm:text-2xl font-semibold ${colors.text}`}>Hero Images</h1>
            <p className={`${colors.textSecondary} text-sm mt-1`}>Manage scrolling hero images displayed on the homepage. Maximum 10 images.</p>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Image</span>
            </button>
          )}
        </header>

        {showForm && (
          <form onSubmit={handleSubmit} className={`${colors.bgCard} border ${colors.cardBorder} p-6 rounded-2xl space-y-5 shadow-sm`}>
            <div className="flex items-center justify-between">
              <h2 className={`text-xs font-bold uppercase tracking-wider ${colors.text}`}>
                {editingId ? 'Edit Hero Image' : 'Add Hero Image'}
              </h2>
              <button
                type="button"
                onClick={handleCancel}
                className={`p-1.5 rounded-lg ${colors.bgSecondary} border ${colors.border} ${colors.textSecondary} hover:text-neutral-900 transition-colors`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              <div>
                <label className={`block ${colors.textSecondary} font-medium mb-1.5 uppercase text-[10px]`}>Image URL *</label>
                <input
                  type="url"
                  required
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className={`w-full ${colors.bgInput} border ${colors.borderInput} rounded-xl px-3.5 py-2.5 ${colors.text} placeholder:text-neutral-400 focus:outline-none ${colors.inputFocus} transition-all duration-200`}
                />
              </div>
              <div>
                <label className={`block ${colors.textSecondary} font-medium mb-1.5 uppercase text-[10px]`}>Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Optional title"
                  className={`w-full ${colors.bgInput} border ${colors.borderInput} rounded-xl px-3.5 py-2.5 ${colors.text} placeholder:text-neutral-400 focus:outline-none ${colors.inputFocus} transition-all duration-200`}
                />
              </div>
              <div>
                <label className={`block ${colors.textSecondary} font-medium mb-1.5 uppercase text-[10px]`}>Subtitle</label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="Optional subtitle"
                  className={`w-full ${colors.bgInput} border ${colors.borderInput} rounded-xl px-3.5 py-2.5 ${colors.text} placeholder:text-neutral-400 focus:outline-none ${colors.inputFocus} transition-all duration-200`}
                />
              </div>
              <div>
                <label className={`block ${colors.textSecondary} font-medium mb-1.5 uppercase text-[10px]`}>Link URL</label>
                <input
                  type="url"
                  value={formData.linkUrl}
                  onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                  placeholder="https://example.com"
                  className={`w-full ${colors.bgInput} border ${colors.borderInput} rounded-xl px-3.5 py-2.5 ${colors.text} placeholder:text-neutral-400 focus:outline-none ${colors.inputFocus} transition-all duration-200`}
                />
              </div>
              <div>
                <label className={`block ${colors.textSecondary} font-medium mb-1.5 uppercase text-[10px]`}>Order</label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  className={`w-full ${colors.bgInput} border ${colors.borderInput} rounded-xl px-3.5 py-2.5 ${colors.text} placeholder:text-neutral-400 focus:outline-none ${colors.inputFocus} transition-all duration-200`}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="visible"
                  checked={formData.visible}
                  onChange={(e) => setFormData({ ...formData, visible: e.target.checked })}
                  className="h-4 w-4 rounded border-neutral-300 text-brand-600 focus:ring-brand-500"
                />
                <label htmlFor="visible" className={`text-xs font-medium ${colors.text}`}>Visible</label>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold transition-all duration-200"
              >
                {editingId ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className={`px-5 py-2.5 rounded-xl border border-neutral-200 text-neutral-700 text-xs font-medium hover:bg-neutral-50 transition-all duration-200`}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-500 mx-auto"></div>
            </div>
          ) : images.length === 0 ? (
            <div className="col-span-full text-center py-12 rounded-2xl border border-dashed border-neutral-300">
              <Image className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
              <p className={`text-sm ${colors.textSecondary}`}>No hero images yet. Add your first image to get started.</p>
            </div>
          ) : (
            images.map((img) => (
              <div key={img._id} className={`${colors.bgCard} border ${colors.cardBorder} rounded-2xl overflow-hidden shadow-sm`}>
                <div className="aspect-video bg-neutral-100 relative">
                  <img src={img.imageUrl} alt={img.title || 'Hero'} className="h-full w-full object-cover" />
                  {!img.visible && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white text-xs font-semibold bg-black/60 px-3 py-1 rounded-full">Hidden</span>
                    </div>
                  )}
                </div>
                <div className="p-4 space-y-2">
                  <h3 className={`text-sm font-semibold ${colors.text} line-clamp-1`}>{img.title || 'Untitled'}</h3>
                  {img.subtitle && <p className={`text-xs ${colors.textSecondary} line-clamp-1`}>{img.subtitle}</p>}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-neutral-400">Order: {img.order}</span>
                    <div className="flex space-x-1.5">
                      <button
                        onClick={() => handleEdit(img)}
                        className={`p-2 ${colors.bgSecondary} border ${colors.border} ${colors.textSecondary} hover:text-brand-600 rounded-lg hover:bg-brand-50 transition-all duration-200`}
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(img._id)}
                        className={`p-2 ${colors.bgSecondary} border ${colors.border} ${colors.textSecondary} hover:text-red-600 rounded-lg hover:bg-red-50 transition-all duration-200`}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default HeroImages;
