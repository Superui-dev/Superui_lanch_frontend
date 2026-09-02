import React, { useState, useEffect } from 'react';
import { useAdminTheme } from '../../context/AdminThemeContext';
import AdminLayout from '../../components/admin/AdminLayout';
import Pagination from '../../components/common/Pagination';
import client from '../../api/client';
import { Plus, Trash2, Folder, Pencil, X } from 'lucide-react';

const Categories = () => {
  const { colors } = useAdminTheme();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [editingId, setEditingId] = useState(null);

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('');
  const [color, setColor] = useState('#6B7280');
  const [productType, setProductType] = useState('website-template');
  const [parentId, setParentId] = useState('');
  const [visible, setVisible] = useState(true);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await client.get('/api/public/categories');
      if (res.data?.success && Array.isArray(res.data?.data)) {
        setCategories(res.data.data);
      } else {
        setCategories([]);
      }
    } catch (err) {
      console.warn('Failed to fetch categories:', err);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setModalMode('create');
    setEditingId(null);
    setName('');
    setDescription('');
    setIcon('');
    setColor('#6B7280');
    setProductType('website-template');
    setParentId('');
    setVisible(true);
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setModalMode('edit');
    setEditingId(cat._id);
    setName(cat.name);
    setDescription(cat.description || '');
    setIcon(cat.icon || '');
    setColor(cat.color || '#6B7280');
    setProductType(cat.productType || 'website-template');
    setParentId(cat.parentId || '');
    setVisible(cat.visible !== false);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      if (modalMode === 'create') {
        await client.post('/api/admin/categories', {
          name,
          description,
          icon,
          color,
          productType,
          parentId: parentId || null,
          visible
        });
      } else {
        if (editingId && !editingId.startsWith('cat-')) {
          await client.put(`/api/admin/categories/${editingId}`, {
            name,
            description,
            icon,
            color,
            productType,
            parentId: parentId || null,
            visible
          });
        }
      }
      setIsModalOpen(false);
      setName('');
      setDescription('');
      setIcon('');
      setColor('#6B7280');
      setProductType('website-template');
      setParentId('');
      setVisible(true);
      await fetchCategories();
    } catch (err) {
      alert(`Failed to ${modalMode} category: ` + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      if (id && !id.startsWith('cat-')) {
        await client.delete(`/api/admin/categories/${id}`);
      }
      setCategories(prev => prev.filter(c => c._id !== id));
      await fetchCategories();
    } catch (err) {
      alert('Failed to delete category: ' + (err.response?.data?.message || err.message));
    }
  };

  const paginatedCategories = categories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <AdminLayout>
      <div className="p-6 lg:p-10 space-y-8">
        <header className={`pb-6 border-b ${colors.border} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
          <div>
            <h1 className={`text-xl sm:text-2xl font-semibold ${colors.text}`}>Categories Management</h1>
            <p className={`${colors.textSecondary} text-sm mt-1`}>Catalog divisions and tech segments used to organize templates.</p>
          </div>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold transition-all duration-200 hover:shadow-lg self-start sm:self-auto shrink-0"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>Create Category</span>
          </button>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-neutral-900"></div>
          </div>
        ) : paginatedCategories.length === 0 ? (
          <div className="text-center py-24 rounded-2xl bg-neutral-50 border border-neutral-200">
            <Folder className={`h-12 w-12 ${colors.textMuted} mx-auto mb-4`} />
            <p className={`text-sm ${colors.textSecondary} font-medium`}>No categories found</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {paginatedCategories.map((cat) => (
                <div
                  key={cat._id}
                  className={`p-6 rounded-2xl ${colors.bgCard} border ${colors.cardBorder} flex flex-col justify-between h-[230px] shadow-sm relative group`}
                >
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className={`p-2.5 ${colors.accentBg} border ${colors.accentBorder} ${colors.accent} rounded-xl shrink-0`}>
                        <Folder className="h-4.5 w-4.5" />
                      </div>
                      <div className="flex space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                        <button
                          onClick={() => openEditModal(cat)}
                          className={`p-1.5 ${colors.bgSecondary} border ${colors.border} ${colors.textSecondary} hover:text-brand-600 rounded-lg hover:bg-brand-50 transition-all duration-150`}
                          title="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat._id)}
                          className={`p-1.5 ${colors.bgSecondary} border ${colors.border} ${colors.textSecondary} hover:text-red-600 rounded-lg hover:bg-red-50 transition-all duration-150`}
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <h3 className={`text-sm font-semibold ${colors.text} line-clamp-1`}>{cat.name}</h3>
                      <p className={`text-[9px] ${colors.accent} font-mono mt-0.5`}>slug: {cat.slug}</p>
                      <p className={`text-xs ${colors.textSecondary} mt-2.5 leading-relaxed line-clamp-3 h-[54px]`}>
                        {cat.description || 'No description added.'}
                      </p>
                    </div>
                  </div>

                  <div className={`pt-3 border-t ${colors.border} text-xs ${colors.textSecondary} flex items-center justify-between`}>
                    <span>Products created in this category</span>
                    <span className={`px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 ${colors.text} font-bold`}>
                      {cat.productCount ?? 0}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalItems={categories.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* Modal Popup Form (Create & Edit) */}
      {isModalOpen && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${colors.overlay} backdrop-blur-sm`}>
          <div className={`w-full max-w-md ${colors.bgCard} border ${colors.cardBorder} rounded-3xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto`}>
            <div className={`flex justify-between items-center pb-4 border-b ${colors.border}`}>
              <h2 className={`text-sm font-bold uppercase tracking-wider ${colors.text}`}>
                {modalMode === 'create' ? 'Create Category' : 'Edit Category'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className={`p-1 rounded-lg ${colors.textSecondary} hover:text-neutral-900 transition-colors`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className={`block ${colors.textSecondary} font-medium mb-1.5 uppercase text-[10px]`}>Category Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Next.js components"
                  className={`w-full ${colors.bgInput} border ${colors.borderInput} rounded-xl px-3.5 py-2.5 ${colors.text} placeholder:text-neutral-400 focus:outline-none ${colors.inputFocus} transition-all duration-200`}
                />
              </div>

              <div>
                <label className={`block ${colors.textSecondary} font-medium mb-1.5 uppercase text-[10px]`}>Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain what technologies go here..."
                  className={`w-full ${colors.bgInput} border ${colors.borderInput} rounded-xl px-3.5 py-2.5 ${colors.text} placeholder:text-neutral-400 focus:outline-none ${colors.inputFocus} transition-all duration-200 resize-none`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block ${colors.textSecondary} font-medium mb-1.5 uppercase text-[10px]`}>Icon URL</label>
                  <input
                    type="text"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    placeholder="https://..."
                    className={`w-full ${colors.bgInput} border ${colors.borderInput} rounded-xl px-3.5 py-2.5 ${colors.text} placeholder:text-neutral-400 focus:outline-none ${colors.inputFocus} transition-all duration-200`}
                  />
                </div>
                <div>
                  <label className={`block ${colors.textSecondary} font-medium mb-1.5 uppercase text-[10px]`}>Brand Color</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="h-9 w-12 rounded border cursor-pointer"
                    />
                    <input
                      type="text"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className={`flex-1 ${colors.bgInput} border ${colors.borderInput} rounded-xl px-3.5 py-2.5 ${colors.text} font-mono text-[10px]`}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className={`block ${colors.textSecondary} font-medium mb-1.5 uppercase text-[10px]`}>Product Type</label>
                <select
                  value={productType}
                  onChange={(e) => setProductType(e.target.value)}
                  className={`w-full ${colors.bgInput} border ${colors.borderInput} rounded-xl px-3.5 py-2.5 ${colors.text} focus:outline-none ${colors.inputFocus} transition-all duration-200`}
                >
                  <option value="ui-component">UI Component</option>
                  <option value="website-template">Website Template</option>
                  <option value="portfolio">Portfolio</option>
                  <option value="ebook">eBook</option>
                  <option value="source-code">Source Code</option>
                  <option value="free-resource">Free Resource</option>
                  <option value="blog">Blog</option>
                </select>
              </div>

              <div>
                <label className={`block ${colors.textSecondary} font-medium mb-1.5 uppercase text-[10px]`}>Parent Category (subcategory of)</label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className={`w-full ${colors.bgInput} border ${colors.borderInput} rounded-xl px-3.5 py-2.5 ${colors.text} focus:outline-none ${colors.inputFocus} transition-all duration-200`}
                >
                  <option value="">— None (root category) —</option>
                  {categories
                    .filter(c => modalMode === 'create' || c._id !== editingId)
                    .map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                </select>
              </div>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={visible}
                  onChange={(e) => setVisible(e.target.checked)}
                  className="h-4 w-4 rounded border-neutral-300"
                />
                <span className={`text-xs ${colors.text}`}>Visible on storefront</span>
              </label>

              <button
                type="submit"
                className="w-full py-3 mt-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold transition-all duration-200 hover:shadow-lg"
              >
                {modalMode === 'create' ? 'Create Category' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Categories;
