import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAdminTheme } from '../../context/AdminThemeContext';
import client from '../../api/client';
import { Star, Plus, Pencil, Trash2, Check, X, Quote, Sparkles } from 'lucide-react';

const TestimonialsAdmin = () => {
  const { colors } = useAdminTheme();
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [text, setText] = useState('');
  const [initials, setInitials] = useState('');
  const [rating, setRating] = useState(5);
  const [visible, setVisible] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const res = await client.get('/api/admin/settings/testimonials');
      if (res.data?.success) {
        setTestimonials(res.data.data || []);
      }
    } catch (err) {
      console.warn('Failed to load testimonials:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setName('');
    setRole('');
    setText('');
    setInitials('');
    setRating(5);
    setVisible(true);
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setName(item.name || '');
    setRole(item.role || '');
    setText(item.text || '');
    setInitials(item.initials || '');
    setRating(item.rating || 5);
    setVisible(item.visible !== false);
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name,
        role,
        text,
        initials: initials || (name ? name.substring(0, 2).toUpperCase() : 'U'),
        rating: Number(rating),
        visible
      };

      if (editingItem && editingItem._id) {
        await client.put(`/api/admin/settings/testimonials/${editingItem._id}`, payload);
      } else {
        await client.post('/api/admin/settings/testimonials', payload);
      }

      setModalOpen(false);
      fetchTestimonials();
    } catch (err) {
      alert('Failed to save testimonial: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) return;
    try {
      await client.delete(`/api/admin/settings/testimonials/${id}`);
      fetchTestimonials();
    } catch (err) {
      alert('Failed to delete testimonial');
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className={`text-2xl font-extrabold ${colors.text} tracking-tight flex items-center gap-2`}>
              <Quote className="h-6 w-6 text-brand-600" />
              <span>Customer Testimonials Management</span>
            </h1>
            <p className={`text-xs ${colors.textSecondary} mt-1`}>
              Manage customer reviews, testimonials, ratings, and social proof shown on the frontend home page.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition-colors shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Add Testimonial</span>
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs text-neutral-400">Loading testimonials...</div>
        ) : testimonials.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
            <p className="text-sm font-medium text-neutral-500">No testimonials found in database.</p>
            <button
              onClick={openCreateModal}
              className="mt-3 px-4 py-2 rounded-xl bg-neutral-900 text-white text-xs font-bold"
            >
              Create First Testimonial
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {testimonials.map((t) => (
              <div
                key={t._id}
                className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex text-amber-400">
                      {[...Array(t.rating || 5)].map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-current" />
                      ))}
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${t.visible !== false ? 'bg-emerald-500/10 text-emerald-600' : 'bg-neutral-200 text-neutral-600'}`}>
                      {t.visible !== false ? 'Active' : 'Hidden'}
                    </span>
                  </div>

                  <p className="text-xs italic text-neutral-600 dark:text-neutral-300 leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                </div>

                <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-brand-500/10 text-brand-600 text-xs font-bold flex items-center justify-center border border-brand-200 shrink-0">
                      {t.initials || (t.name ? t.name.substring(0, 2).toUpperCase() : 'U')}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-neutral-900 dark:text-white">{t.name}</h4>
                      <p className="text-[10px] text-neutral-400">{t.role}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => openEditModal(t)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-brand-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                      title="Edit"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(t._id)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Form */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-2xl space-y-5 animate-scaleIn">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  {editingItem ? 'Edit Testimonial' : 'Create New Testimonial'}
                </h3>
                <button onClick={() => setModalOpen(false)} className="p-1.5 text-neutral-400 hover:text-neutral-700">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Kumar"
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs font-semibold text-neutral-900 dark:text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Role / Designation *</label>
                    <input
                      type="text"
                      required
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="e.g. Senior Fullstack Engineer"
                      className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs font-semibold text-neutral-900 dark:text-white focus:outline-none focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Avatar Initials</label>
                    <input
                      type="text"
                      value={initials}
                      onChange={(e) => setInitials(e.target.value)}
                      placeholder="RK"
                      maxLength={3}
                      className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs font-semibold text-neutral-900 dark:text-white focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Testimonial Quote *</label>
                  <textarea
                    rows={3}
                    required
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter customer feedback quote..."
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs font-medium text-neutral-900 dark:text-white focus:outline-none focus:border-brand-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Star Rating (1 - 5)</label>
                    <select
                      value={rating}
                      onChange={(e) => setRating(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs font-semibold text-neutral-900 dark:text-white focus:outline-none focus:border-brand-500"
                    >
                      <option value={5}>★★★★★ (5 Stars)</option>
                      <option value={4}>★★★★☆ (4 Stars)</option>
                      <option value={3}>★★★☆☆ (3 Stars)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Status</label>
                    <select
                      value={visible ? 'true' : 'false'}
                      onChange={(e) => setVisible(e.target.value === 'true')}
                      className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs font-semibold text-neutral-900 dark:text-white focus:outline-none focus:border-brand-500"
                    >
                      <option value="true">Visible on Homepage</option>
                      <option value="false">Hidden</option>
                    </select>
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-bold text-neutral-600 dark:text-neutral-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md"
                  >
                    {saving ? 'Saving...' : 'Save Testimonial'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default TestimonialsAdmin;

