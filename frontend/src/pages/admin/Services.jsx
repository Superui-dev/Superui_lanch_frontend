import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAdminTheme } from '../../context/AdminThemeContext';
import client from '../../api/client';
import { Plus, Trash2, GripVertical, Eye, EyeOff, ArrowUp, ArrowDown, Save, Image as ImageIcon, Link as LinkIcon, Type, AlignLeft, Code, Monitor } from 'lucide-react';

const ServicesAdmin = () => {
  const { colors, isLight } = useAdminTheme();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newService, setNewService] = useState({ title: '', description: '', image: '', bgImage: '', link: '/contact', code: '' });

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await client.get('/api/admin/services');
      if (res.data?.success && Array.isArray(res.data.data)) {
        setServices(res.data.data);
      } else {
        setServices([]);
      }
    } catch (err) {
      // Quiet fallback
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleAdd = async () => {
    if (!newService.title.trim() || !newService.image.trim()) return;
    try {
      const payload = { ...newService, order: services.length + 1, visible: true };
      const res = await client.post('/api/admin/services', payload);
      if (res.data?.success) {
        fetchServices();
        setNewService({ title: '', description: '', image: '', bgImage: '', link: '/contact', code: '' });
      }
    } catch (err) {
      alert('Failed to add service: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleUpdate = (index, field, value) => {
    const updated = services.map((s, i) => i === index ? { ...s, [field]: value } : s);
    setServices(updated);
  };

  const handleRemove = async (index) => {
    const serviceToDelete = services[index];
    if (serviceToDelete && serviceToDelete._id) {
      try {
        await client.delete(`/api/admin/services/${serviceToDelete._id}`);
      } catch (err) {
        // Quiet fallback
      }
    }
    const updated = services.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i + 1 }));
    setServices(updated);
  };

  const handleMove = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= services.length) return;
    const updated = [...services];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    updated.forEach((s, i) => s.order = i + 1);
    setServices(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await client.put('/api/admin/services', { services });
      alert('Services saved successfully to DB4 (operations_security_db)!');
      fetchServices();
    } catch (err) {
      alert('Failed to save: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const sortedServices = [...services].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <AdminLayout>
      <div className="p-6 lg:p-10 space-y-8">
        <header className={`pb-6 border-b ${colors.border} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
          <div>
            <h1 className={`text-xl sm:text-2xl font-semibold ${colors.text} flex items-center space-x-2`}>
              <ImageIcon className="h-6 w-6 text-brand-500" />
              <span>Services Management</span>
            </h1>
            <p className={`${colors.textSecondary} text-sm mt-1`}>
              Manage service cards displayed on the homepage.
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold text-xs shadow-md hover:shadow-lg transition-all disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? 'Saving...' : 'Save All Changes'}</span>
          </button>
        </header>

        {/* Add New Service */}
        <section className={`p-6 rounded-2xl border ${colors.cardBorder} ${colors.cardBg} shadow-sm space-y-5`}>
          <h2 className={`text-sm font-bold ${colors.text} flex items-center space-x-2`}>
            <Plus className="h-4 w-4 text-brand-500" />
            <span>Add New Service Card</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-neutral-600 dark:text-slate-300 flex items-center space-x-1">
                <Type className="h-3 w-3" />
                <span>Title</span>
              </label>
              <input
                type="text"
                value={newService.title}
                onChange={(e) => setNewService({ ...newService, title: e.target.value })}
                placeholder="e.g., Landing Pages"
                className={`w-full px-3 py-2.5 rounded-xl border text-xs ${colors.borderInput} ${colors.bgInput} ${colors.text} placeholder:text-neutral-400 focus:outline-none ${colors.inputFocus}`}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-neutral-600 dark:text-slate-300 flex items-center space-x-1">
                <AlignLeft className="h-3 w-3" />
                <span>Description</span>
              </label>
              <input
                type="text"
                value={newService.description}
                onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                placeholder="Short service description"
                className={`w-full px-3 py-2.5 rounded-xl border text-xs ${colors.borderInput} ${colors.bgInput} ${colors.text} placeholder:text-neutral-400 focus:outline-none ${colors.inputFocus}`}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-neutral-600 dark:text-slate-300 flex items-center space-x-1">
                <ImageIcon className="h-3 w-3" />
                <span>Image URL</span>
              </label>
              <input
                type="text"
                value={newService.image}
                onChange={(e) => setNewService({ ...newService, image: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className={`w-full px-3 py-2.5 rounded-xl border text-xs ${colors.borderInput} ${colors.bgInput} ${colors.text} placeholder:text-neutral-400 focus:outline-none ${colors.inputFocus}`}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-neutral-600 dark:text-slate-300 flex items-center space-x-1">
                <Monitor className="h-3 w-3" />
                <span>Background Image URL</span>
              </label>
              <input
                type="text"
                value={newService.bgImage}
                onChange={(e) => setNewService({ ...newService, bgImage: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className={`w-full px-3 py-2.5 rounded-xl border text-xs ${colors.borderInput} ${colors.bgInput} ${colors.text} placeholder:text-neutral-400 focus:outline-none ${colors.inputFocus}`}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-neutral-600 dark:text-slate-300 flex items-center space-x-1">
                <LinkIcon className="h-3 w-3" />
                <span>Link</span>
              </label>
              <input
                type="text"
                value={newService.link}
                onChange={(e) => setNewService({ ...newService, link: e.target.value })}
                placeholder="/contact"
                className={`w-full px-3 py-2.5 rounded-xl border text-xs ${colors.borderInput} ${colors.bgInput} ${colors.text} placeholder:text-neutral-400 focus:outline-none ${colors.inputFocus}`}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2 lg:col-span-4">
              <label className="text-[11px] font-bold text-neutral-600 dark:text-slate-300 flex items-center space-x-1">
                <Code className="h-3 w-3" />
                <span>Custom Code / JSON</span>
              </label>
              <textarea
                rows={3}
                value={newService.code}
                onChange={(e) => setNewService({ ...newService, code: e.target.value })}
                placeholder='{"customClass": "bg-red-500", "badge": "NEW"}'
                className={`w-full px-3 py-2.5 rounded-xl border text-xs ${colors.borderInput} ${colors.bgInput} ${colors.text} placeholder:text-neutral-400 focus:outline-none ${colors.inputFocus} resize-none font-mono`}
              />
            </div>
          </div>
          <button
            onClick={handleAdd}
            disabled={!newService.title.trim() || !newService.image.trim()}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs hover:bg-brand-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4" />
            <span>Add Service Card</span>
          </button>
        </section>

        {/* Services JSON Data View */}
        <section className={`rounded-2xl border ${colors.cardBorder} ${colors.cardBg} shadow-sm overflow-hidden`}>
          <div className={`px-6 py-4 border-b ${colors.border} flex items-center justify-between`}>
            <div>
              <h2 className={`text-sm font-bold ${colors.text}`}>Services JSON Data</h2>
              <p className={`text-[11px] ${colors.textSecondary} mt-0.5`}>
                {services.length} service cards stored in database
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                Editable Table
              </span>
            </div>
          </div>

          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-neutral-100 dark:bg-neutral-800 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : sortedServices.length === 0 ? (
            <div className={`py-16 text-center ${colors.textSecondary} text-sm font-medium`}>
              No service cards yet. Add your first service card above.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`border-b ${isLight ? 'border-neutral-200 bg-neutral-50' : 'border-neutral-800 bg-neutral-900'}`}>
                    <th className={`py-3 px-4 text-[10px] font-bold uppercase tracking-wider ${colors.textSecondary} w-12`}>Order</th>
                    <th className={`py-3 px-4 text-[10px] font-bold uppercase tracking-wider ${colors.textSecondary} w-12`}>Visible</th>
                    <th className={`py-3 px-4 text-[10px] font-bold uppercase tracking-wider ${colors.textSecondary} min-w-[160px]`}>Title</th>
                    <th className={`py-3 px-4 text-[10px] font-bold uppercase tracking-wider ${colors.textSecondary} min-w-[150px]`}>Slug</th>
                    <th className={`py-3 px-4 text-[10px] font-bold uppercase tracking-wider ${colors.textSecondary} min-w-[220px]`}>Description</th>
                    <th className={`py-3 px-4 text-[10px] font-bold uppercase tracking-wider ${colors.textSecondary} min-w-[200px]`}>Features (Comma-separated)</th>
                    <th className={`py-3 px-4 text-[10px] font-bold uppercase tracking-wider ${colors.textSecondary} min-w-[160px]`}>Tech Stack</th>
                    <th className={`py-3 px-4 text-[10px] font-bold uppercase tracking-wider ${colors.textSecondary} min-w-[180px]`}>Image URL</th>
                    <th className={`py-3 px-4 text-[10px] font-bold uppercase tracking-wider ${colors.textSecondary} min-w-[140px]`}>Link</th>
                    <th className={`py-3 px-4 text-[10px] font-bold uppercase tracking-wider ${colors.textSecondary} w-28 text-right`}>Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isLight ? 'divide-neutral-100' : 'divide-neutral-800/60'}`}>
                  {sortedServices.map((service, idx) => (
                    <tr key={idx} className={`${isLight ? 'hover:bg-neutral-50/60' : 'hover:bg-neutral-900/20'} transition-colors`}>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleMove(idx, -1)}
                            disabled={idx === 0}
                            className="p-1 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-slate-300 hover:bg-neutral-200 disabled:opacity-30 transition-colors"
                            title="Move up"
                          >
                            <ArrowUp className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleMove(idx, 1)}
                            disabled={idx === sortedServices.length - 1}
                            className="p-1 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-slate-300 hover:bg-neutral-200 disabled:opacity-30 transition-colors"
                            title="Move down"
                          >
                            <ArrowDown className="h-3 w-3" />
                          </button>
                          <span className="text-[11px] font-bold text-neutral-500 ml-1">{service.order || idx + 1}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleUpdate(idx, 'visible', !service.visible)}
                          className={`p-1.5 rounded-lg transition-colors ${service.visible ? 'bg-emerald-500 text-white' : 'bg-neutral-300 text-neutral-600'}`}
                          title={service.visible ? 'Visible' : 'Hidden'}
                        >
                          {service.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={service.title}
                          onChange={(e) => handleUpdate(idx, 'title', e.target.value)}
                          className={`w-full px-3 py-2 rounded-lg border text-xs font-bold ${colors.borderInput} ${colors.bgInput} ${colors.text} focus:outline-none ${colors.inputFocus}`}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={service.slug || ''}
                          onChange={(e) => handleUpdate(idx, 'slug', e.target.value)}
                          placeholder="auto-generated"
                          className={`w-full px-3 py-2 rounded-lg border text-xs font-mono ${colors.borderInput} ${colors.bgInput} ${colors.text} focus:outline-none ${colors.inputFocus}`}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <textarea
                          rows={1}
                          value={service.description}
                          onChange={(e) => handleUpdate(idx, 'description', e.target.value)}
                          className={`w-full px-3 py-2 rounded-lg border text-xs ${colors.borderInput} ${colors.bgInput} ${colors.text} focus:outline-none ${colors.inputFocus} resize-none`}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={Array.isArray(service.features) ? service.features.join(', ') : (service.features || '')}
                          onChange={(e) => handleUpdate(idx, 'features', e.target.value)}
                          placeholder="Feature 1, Feature 2"
                          className={`w-full px-3 py-2 rounded-lg border text-xs ${colors.borderInput} ${colors.bgInput} ${colors.text} focus:outline-none ${colors.inputFocus}`}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={Array.isArray(service.techStack) ? service.techStack.join(', ') : (service.techStack || '')}
                          onChange={(e) => handleUpdate(idx, 'techStack', e.target.value)}
                          placeholder="React, Node.js"
                          className={`w-full px-3 py-2 rounded-lg border text-xs ${colors.borderInput} ${colors.bgInput} ${colors.text} focus:outline-none ${colors.inputFocus}`}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={service.image}
                          onChange={(e) => handleUpdate(idx, 'image', e.target.value)}
                          className={`w-full px-3 py-2 rounded-lg border text-xs ${colors.borderInput} ${colors.bgInput} ${colors.text} focus:outline-none ${colors.inputFocus}`}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={service.link || `/services/${service.slug || ''}`}
                          onChange={(e) => handleUpdate(idx, 'link', e.target.value)}
                          className={`w-full px-3 py-2 rounded-lg border text-xs ${colors.borderInput} ${colors.bgInput} ${colors.text} focus:outline-none ${colors.inputFocus}`}
                        />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleRemove(idx)}
                          className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                          title="Remove"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* JSON Preview */}
        {services.length > 0 && (
          <section className={`rounded-2xl border ${colors.cardBorder} ${colors.cardBg} shadow-sm overflow-hidden`}>
            <div className={`px-6 py-4 border-b ${colors.border} flex items-center justify-between`}>
              <div>
                <h2 className={`text-sm font-bold ${colors.text}`}>Services JSON Data (DB4 - operations_security_db)</h2>
                <p className={`text-[11px] ${colors.textSecondary} mt-0.5`}>
                  All {sortedServices.length} service cards formatted in JSON structure stored in database 4.
                </p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(sortedServices, null, 2));
                  alert('Services JSON copied to clipboard!');
                }}
                className="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Code className="h-3.5 w-3.5" />
                <span>Copy JSON</span>
              </button>
            </div>
            <div className="p-6 overflow-x-auto">
              <pre className={`text-xs font-mono leading-relaxed ${colors.text} bg-neutral-50 dark:bg-neutral-950 p-4 rounded-xl border ${colors.borderInput} overflow-x-auto select-all`}>
                {JSON.stringify(sortedServices, null, 2)}
              </pre>
            </div>
          </section>
        )}
      </div>
    </AdminLayout>
  );
};

export default ServicesAdmin;
