import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAdminTheme } from '../../context/AdminThemeContext';
import client from '../../api/client';
import { Plus, Trash2, ArrowUp, ArrowDown, Save, GripVertical, Link as LinkIcon, Type } from 'lucide-react';

const NavbarAdmin = () => {
  const { colors, isLight } = useAdminTheme();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newItem, setNewItem] = useState({ label: '', url: '/' });

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await client.get('/api/admin/settings');
      if (res.data?.success && res.data?.data?.navbar?.menuItems) {
        setMenuItems(res.data.data.navbar.menuItems);
      } else {
        setMenuItems([]);
      }
    } catch (err) {
      console.warn('Failed to fetch navbar settings:', err);
      setMenuItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleAdd = () => {
    if (!newItem.label.trim() || !newItem.url.trim()) return;
    const updated = [...menuItems, { ...newItem, visible: true, order: menuItems.length + 1 }];
    setMenuItems(updated);
    setNewItem({ label: '', url: '/' });
  };

  const handleUpdate = (index, field, value) => {
    const updated = menuItems.map((item, i) => i === index ? { ...item, [field]: value } : item);
    setMenuItems(updated);
  };

  const handleRemove = (index) => {
    const updated = menuItems.filter((_, i) => i !== index).map((item, i) => ({ ...item, order: i + 1 }));
    setMenuItems(updated);
  };

  const handleMove = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= menuItems.length) return;
    const updated = [...menuItems];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    updated.forEach((item, i) => item.order = i + 1);
    setMenuItems(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await client.put('/api/admin/settings', {
        navbar: {
          menuItems: menuItems.map((item, idx) => ({
            ...item,
            order: idx + 1
          }))
        }
      });
      alert('Navbar menu items saved successfully!');
    } catch (err) {
      alert('Failed to save: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const sortedItems = [...menuItems].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <AdminLayout>
      <div className="p-6 lg:p-10 space-y-8">
        <header className={`pb-6 border-b ${colors.border} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
          <div>
            <h1 className={`text-xl sm:text-2xl font-semibold ${colors.text} flex items-center space-x-2`}>
              <Type className="h-6 w-6 text-brand-500" />
              <span>Navbar Menu Management</span>
            </h1>
            <p className={`${colors.textSecondary} text-sm mt-1`}>
              Manage the top navigation menu items, labels, URLs, order, and visibility.
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

        {/* Add New Menu Item */}
        <section className={`p-6 rounded-2xl border ${colors.cardBorder} ${colors.cardBg} shadow-sm space-y-5`}>
          <h2 className={`text-sm font-bold ${colors.text} flex items-center space-x-2`}>
            <Plus className="h-4 w-4 text-brand-500" />
            <span>Add New Menu Item</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-neutral-600 dark:text-slate-300 flex items-center space-x-1">
                <Type className="h-3 w-3" />
                <span>Label</span>
              </label>
              <input
                type="text"
                value={newItem.label}
                onChange={(e) => setNewItem({ ...newItem, label: e.target.value })}
                placeholder="e.g., Products"
                className={`w-full px-3 py-2.5 rounded-xl border text-xs ${colors.borderInput} ${colors.bgInput} ${colors.text} placeholder:text-neutral-400 focus:outline-none ${colors.inputFocus}`}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-neutral-600 dark:text-slate-300 flex items-center space-x-1">
                <LinkIcon className="h-3 w-3" />
                <span>URL</span>
              </label>
              <input
                type="text"
                value={newItem.url}
                onChange={(e) => setNewItem({ ...newItem, url: e.target.value })}
                placeholder="/products"
                className={`w-full px-3 py-2.5 rounded-xl border text-xs ${colors.borderInput} ${colors.bgInput} ${colors.text} placeholder:text-neutral-400 focus:outline-none ${colors.inputFocus}`}
              />
            </div>
          </div>
          <button
            onClick={handleAdd}
            disabled={!newItem.label.trim() || !newItem.url.trim()}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs hover:bg-brand-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4" />
            <span>Add Menu Item</span>
          </button>
        </section>

        {/* Menu Items Table */}
        <section className={`rounded-2xl border ${colors.cardBorder} ${colors.cardBg} shadow-sm overflow-hidden`}>
          <div className={`px-6 py-4 border-b ${colors.border} flex items-center justify-between`}>
            <div>
              <h2 className={`text-sm font-bold ${colors.text}`}>Menu Items</h2>
              <p className={`text-[11px] ${colors.textSecondary} mt-0.5`}>
                {menuItems.length} menu items configured
              </p>
            </div>
          </div>

          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-neutral-100 dark:bg-neutral-800 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : sortedItems.length === 0 ? (
            <div className={`py-16 text-center ${colors.textSecondary} text-sm font-medium`}>
              No menu items yet. Add your first menu item above.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`border-b ${isLight ? 'border-neutral-200 bg-neutral-50' : 'border-neutral-800 bg-neutral-900'}`}>
                    <th className={`py-3 px-4 text-[10px] font-bold uppercase tracking-wider ${colors.textSecondary} w-24`}>Order</th>
                    <th className={`py-3 px-4 text-[10px] font-bold uppercase tracking-wider ${colors.textSecondary} min-w-[180px]`}>Label</th>
                    <th className={`py-3 px-4 text-[10px] font-bold uppercase tracking-wider ${colors.textSecondary} min-w-[200px]`}>URL</th>
                    <th className={`py-3 px-4 text-[10px] font-bold uppercase tracking-wider ${colors.textSecondary} w-28 text-right`}>Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isLight ? 'divide-neutral-100' : 'divide-neutral-800/60'}`}>
                  {sortedItems.map((item, idx) => (
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
                            disabled={idx === sortedItems.length - 1}
                            className="p-1 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-slate-300 hover:bg-neutral-200 disabled:opacity-30 transition-colors"
                            title="Move down"
                          >
                            <ArrowDown className="h-3 w-3" />
                          </button>
                          <span className="text-[11px] font-bold text-neutral-500 ml-1">{item.order || idx + 1}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={item.label}
                          onChange={(e) => handleUpdate(idx, 'label', e.target.value)}
                          className={`w-full px-3 py-2 rounded-lg border text-xs font-bold ${colors.borderInput} ${colors.bgInput} ${colors.text} focus:outline-none ${colors.inputFocus}`}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={item.url}
                          onChange={(e) => handleUpdate(idx, 'url', e.target.value)}
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
        {menuItems.length > 0 && (
          <section className={`rounded-2xl border ${colors.cardBorder} ${colors.cardBg} shadow-sm overflow-hidden`}>
            <div className={`px-6 py-4 border-b ${colors.border}`}>
              <h2 className={`text-sm font-bold ${colors.text}`}>JSON Preview</h2>
              <p className={`text-[11px] ${colors.textSecondary} mt-0.5`}>
                This data will be saved to the database when you click "Save All Changes"
              </p>
            </div>
            <div className="p-6 overflow-x-auto">
              <pre className={`text-xs font-mono leading-relaxed ${colors.text} bg-neutral-50 dark:bg-neutral-950 p-4 rounded-xl border ${colors.borderInput} overflow-x-auto`}>
                {JSON.stringify(sortedItems, null, 2)}
              </pre>
            </div>
          </section>
        )}
      </div>
    </AdminLayout>
  );
};

export default NavbarAdmin;
