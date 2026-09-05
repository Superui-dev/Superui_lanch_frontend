import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminTheme } from '../../context/AdminThemeContext';
import AdminLayout from '../../components/admin/AdminLayout';
import Pagination from '../../components/common/Pagination';
import client from '../../api/client';
import { Plus, Trash2, Folder, Pencil, X, ArrowLeft, Eye, Image as ImageIcon, Hash, ArrowUp, ArrowDown, GripVertical } from 'lucide-react';
import ProductFormModal from '../../components/admin/ProductFormModal';

// Helper: returns "1st", "2nd", "3rd", "4th", etc.
const toOrdinal = (n) => {
  const num = parseInt(n, 10);
  if (isNaN(num) || num <= 0) return `#${n}`;
  const s = ['th', 'st', 'nd', 'rd'];
  const v = num % 100;
  return num + (s[(v - 20) % 10] || s[v] || s[0]);
};

const Categories = () => {
  const { colors, isLight } = useAdminTheme();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [editingId, setEditingId] = useState(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('');
  const [color, setColor] = useState('#6B7280');
  const [productType, setProductType] = useState('website-template');
  const [parentId, setParentId] = useState('');
  const [visible, setVisible] = useState(true);
  const [order, setOrder] = useState(0);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);

  // Category Drag & Drop state
  const [draggedCatId, setDraggedCatId] = useState(null);
  const [dragOverCatId, setDragOverCatId] = useState(null);
  const isDraggingCatRef = useRef(false);

  // Category Products Drag & Drop state
  const [draggedProdId, setDraggedProdId] = useState(null);
  const [dragOverProdId, setDragOverProdId] = useState(null);
  const isDraggingProdRef = useRef(false);

  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await client.get('/api/admin/categories');
      if (res.data?.success && Array.isArray(res.data?.data)) {
        const sorted = [...res.data.data].sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
        setCategories(sorted);
      } else {
        setCategories([]);
      }
    } catch (err) {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoryProducts = async (categoryId) => {
    setProductsLoading(true);
    try {
      const res = await client.get(`/api/admin/products?categoryId=${categoryId}&limit=200`);
      if (res.data?.success && Array.isArray(res.data?.data)) {
        setCategoryProducts(res.data.data);
      } else if (res.data?.success && Array.isArray(res.data?.data?.products)) {
        setCategoryProducts(res.data.data.products);
      } else {
        setCategoryProducts([]);
      }
    } catch (err) {
      setCategoryProducts([]);
    } finally {
      setProductsLoading(false);
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
    // Auto-suggest the next available position
    setOrder(categories.length + 1);
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
    setOrder(cat.order || 0);
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
           visible,
           order
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
            visible,
            order
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
    setOrder(0);
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

  const handleCategoryClick = (cat) => {
    if (isDraggingCatRef.current) return;
    setSelectedCategory(cat);
    setCurrentPage(1);
    fetchCategoryProducts(cat._id);
  };

  // Drag & Drop for Category cards
  const handleCatDragStart = (e, catId) => {
    isDraggingCatRef.current = true;
    setDraggedCatId(catId);
    e.dataTransfer.effectAllowed = 'move';
    try {
      e.dataTransfer.setData('text/plain', catId);
    } catch (_) {}
  };

  const handleCatDragOver = (e, catId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverCatId !== catId) {
      setDragOverCatId(catId);
    }
  };

  const handleCatDragLeave = (e, catId) => {
    if (dragOverCatId === catId) {
      setDragOverCatId(null);
    }
  };

  const handleCatDragEnd = () => {
    setDraggedCatId(null);
    setDragOverCatId(null);
    setTimeout(() => {
      isDraggingCatRef.current = false;
    }, 150);
  };

  const handleCatDrop = async (e, targetCatId) => {
    e.preventDefault();
    const sourceId = draggedCatId || e.dataTransfer.getData('text/plain');
    setDraggedCatId(null);
    setDragOverCatId(null);
    setTimeout(() => {
      isDraggingCatRef.current = false;
    }, 150);

    if (!sourceId || sourceId === targetCatId) return;

    const sorted = [...categories].sort((a, b) => (a.order || 0) - (b.order || 0));
    const sourceIndex = sorted.findIndex(c => c._id === sourceId);
    const targetIndex = sorted.findIndex(c => c._id === targetCatId);

    if (sourceIndex === -1 || targetIndex === -1) return;

    const reordered = [...sorted];
    const [moved] = reordered.splice(sourceIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    const updated = reordered.map((cat, index) => ({
      ...cat,
      order: index + 1
    }));
    setCategories(updated);

    try {
      const orderedIds = updated.map(c => c._id).filter(id => id && !id.startsWith('cat-'));
      await client.put('/api/admin/categories/reorder', { orderedIds });
    } catch (err) {
      console.error('Failed to update category order:', err);
      fetchCategories();
    }
  };

  const handleMoveCategory = async (catId, direction) => {
    const sorted = [...categories].sort((a, b) => (a.order || 0) - (b.order || 0));
    const pos = sorted.findIndex(c => c._id === catId);
    if (pos === -1) return;
    const targetPos = direction === 'up' ? pos - 1 : pos + 1;
    if (targetPos < 0 || targetPos >= sorted.length) return;

    const reordered = [...sorted];
    const [moved] = reordered.splice(pos, 1);
    reordered.splice(targetPos, 0, moved);

    const updated = reordered.map((c, i) => ({ ...c, order: i + 1 }));
    setCategories(updated);

    try {
      const orderedIds = updated.map(c => c._id).filter(id => id && !id.startsWith('cat-'));
      await client.put('/api/admin/categories/reorder', { orderedIds });
    } catch (err) {
      console.error('Failed to update category order:', err);
      fetchCategories();
    }
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setCategoryProducts([]);
    setCurrentPage(1);
  };

  const handleCreateProduct = () => {
    setEditingProduct(null);
    setProductModalOpen(true);
  };

  const handleEditProduct = (prod) => {
    setEditingProduct(prod);
    setProductModalOpen(true);
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      if (id && !id.startsWith('prod-')) {
        await client.delete(`/api/admin/products/${id}`);
      }
      setCategoryProducts(prev => prev.filter(p => p._id !== id));
      if (selectedCategory) {
        fetchCategoryProducts(selectedCategory._id);
      }
      fetchCategories();
    } catch (err) {
      alert('Failed to delete product: ' + (err.response?.data?.message || err.message));
    }
  };

  // Drag & Drop for Category Product cards
  const handleProdDragStart = (e, prodId) => {
    isDraggingProdRef.current = true;
    setDraggedProdId(prodId);
    e.dataTransfer.effectAllowed = 'move';
    try {
      e.dataTransfer.setData('text/plain', prodId);
    } catch (_) {}
  };

  const handleProdDragOver = (e, prodId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverProdId !== prodId) {
      setDragOverProdId(prodId);
    }
  };

  const handleProdDragLeave = (e, prodId) => {
    if (dragOverProdId === prodId) {
      setDragOverProdId(null);
    }
  };

  const handleProdDragEnd = () => {
    setDraggedProdId(null);
    setDragOverProdId(null);
    setTimeout(() => {
      isDraggingProdRef.current = false;
    }, 150);
  };

  const handleProdDrop = async (e, targetProdId) => {
    e.preventDefault();
    const sourceId = draggedProdId || e.dataTransfer.getData('text/plain');
    setDraggedProdId(null);
    setDragOverProdId(null);
    setTimeout(() => {
      isDraggingProdRef.current = false;
    }, 150);

    if (!sourceId || sourceId === targetProdId) return;

    const sourceIndex = categoryProducts.findIndex(p => p._id === sourceId);
    const targetIndex = categoryProducts.findIndex(p => p._id === targetProdId);

    if (sourceIndex === -1 || targetIndex === -1) return;

    const reordered = [...categoryProducts];
    const [moved] = reordered.splice(sourceIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    setCategoryProducts(reordered);

    try {
      const orderedIds = reordered.map(p => p._id).filter(id => id && !id.startsWith('prod-'));
      await client.put('/api/admin/products/reorder', { orderedIds });
    } catch (err) {
      console.error('Failed to update category product order:', err);
      if (selectedCategory) {
        fetchCategoryProducts(selectedCategory._id);
      }
    }
  };

  const handleMoveCategoryProduct = async (prodId, direction) => {
    const currentIdx = categoryProducts.findIndex(p => p._id === prodId);
    if (currentIdx === -1) return;
    const targetIdx = direction === 'up' ? currentIdx - 1 : currentIdx + 1;
    if (targetIdx < 0 || targetIdx >= categoryProducts.length) return;

    const reordered = [...categoryProducts];
    const [moved] = reordered.splice(currentIdx, 1);
    reordered.splice(targetIdx, 0, moved);
    setCategoryProducts(reordered);

    try {
      const orderedIds = reordered.map(p => p._id).filter(id => id && !id.startsWith('prod-'));
      await client.put('/api/admin/products/reorder', { orderedIds });
    } catch (err) {
      console.error('Failed to update category product order:', err);
    }
  };

  const handleProductSaved = () => {
    setProductModalOpen(false);
    setEditingProduct(null);
    if (selectedCategory) {
      fetchCategoryProducts(selectedCategory._id);
    }
    fetchCategories();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'published':
        return 'bg-emerald-500/10 text-emerald-700 border-emerald-200';
      case 'archived':
        return 'bg-neutral-500/10 text-neutral-700 border-neutral-200';
      default:
        return 'bg-neutral-500/10 text-neutral-700 border-neutral-200';
    }
  };

  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
  }, [categories]);

  const paginatedCategories = sortedCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const productPagination = useMemo(() => {
    const perPage = 8;
    const totalPages = Math.ceil(categoryProducts.length / perPage);
    const start = (currentPage - 1) * perPage;
    const paginated = categoryProducts.slice(start, start + perPage);
    return { paginated, totalPages, perPage };
  }, [categoryProducts, currentPage]);

  return (
    <AdminLayout>
      <div className="p-6 lg:p-10 space-y-8">
        {!selectedCategory ? (
          <>
            <header className={`pb-8 border-b ${colors.border} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className={`text-2xl sm:text-3xl font-bold ${colors.text} tracking-tight`}>Categories</h1>
                  {/* Total count badge — updates live as categories load */}
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border ${
                    isLight
                      ? 'bg-brand-50 text-brand-700 border-brand-200'
                      : 'bg-brand-500/10 text-brand-400 border-brand-500/20'
                  } tabular-nums`}>
                    <Hash className="h-3 w-3" />
                    {loading ? '…' : categories.length}
                    <span className="font-medium opacity-70">{categories.length === 1 ? 'category' : 'categories'}</span>
                  </span>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border ${
                    isLight
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  } tabular-nums`}>
                    <Hash className="h-3 w-3" />
                    {loading ? '…' : categories.reduce((sum, c) => sum + (c.productCount || 0), 0)}
                    <span className="font-medium opacity-70">products</span>
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
                  <p className={`${colors.textSecondary} text-sm`}>Manage catalog divisions and product segments.</p>
                  <span className="inline-flex items-center gap-1 text-xs text-brand-600 dark:text-brand-400 font-semibold bg-brand-50 dark:bg-brand-950/40 px-2 py-0.5 rounded-lg border border-brand-200/60 dark:border-brand-800/40">
                    <GripVertical className="h-3 w-3" /> Drag & drop cards to reorder
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleCreateProduct}
                  className="inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all duration-200 hover:shadow-lg hover:shadow-brand-500/20 self-start sm:self-auto shrink-0"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Product</span>
                </button>
                <button
                  onClick={openCreateModal}
                  className="inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition-all duration-200 hover:shadow-lg self-start sm:self-auto shrink-0"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Category</span>
                  {/* Next position hint */}
                  {!loading && (
                    <span className="ml-0.5 inline-flex items-center px-1.5 py-0.5 rounded-full bg-white/20 text-[9px] font-extrabold">
                      #{categories.length + 1}
                    </span>
                  )}
                </button>
              </div>
            </header>

            {loading ? (
              <div className="flex items-center justify-center py-32">
                <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-neutral-900 border-t-transparent"></div>
              </div>
            ) : paginatedCategories.length === 0 ? (
              <div className="text-center py-32 rounded-3xl bg-gradient-to-b from-neutral-50 to-white border-2 border-dashed border-neutral-200">
                <div className={`inline-flex p-4 rounded-2xl ${isLight ? 'bg-neutral-100' : 'bg-neutral-800'} mb-4`}>
                  <Folder className={`h-8 w-8 ${colors.textMuted}`} />
                </div>
                <p className={`text-sm ${colors.textSecondary} font-semibold`}>No categories found</p>
                <p className={`text-xs ${colors.textSecondary} mt-1 opacity-70`}>Create your first category to get started</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {paginatedCategories.map((cat, idx) => {
                    // Find actual position across all categories (sorted by order)
                    const sortedAll = [...categories].sort((a, b) => (a.order || 0) - (b.order || 0));
                    const positionInAll = sortedAll.findIndex(c => c._id === cat._id) + 1;
                    const isFirst = positionInAll === 1;
                    const isLast = positionInAll === categories.length;
                    const isDragging = draggedCatId === cat._id;
                    const isOver = dragOverCatId === cat._id;

                    return (
                    <div
                      key={cat._id}
                      draggable={true}
                      onDragStart={(e) => handleCatDragStart(e, cat._id)}
                      onDragOver={(e) => handleCatDragOver(e, cat._id)}
                      onDragLeave={(e) => handleCatDragLeave(e, cat._id)}
                      onDragEnd={handleCatDragEnd}
                      onDrop={(e) => handleCatDrop(e, cat._id)}
                      onClick={() => handleCategoryClick(cat)}
                      className={`group relative ${colors.bgCard} border ${
                        isOver
                          ? 'ring-2 ring-brand-500 border-brand-500 scale-[1.02] shadow-2xl bg-brand-50/10'
                          : colors.cardBorder
                      } rounded-3xl p-6 cursor-pointer transition-all duration-200 hover:shadow-xl hover:shadow-brand-500/5 hover:-translate-y-1 hover:border-brand-200 overflow-hidden ${
                        isDragging ? 'opacity-40 scale-95 border-dashed border-brand-400' : ''
                      }`}
                    >
                      {/* Gradient accent bar at top */}
                      <div
                        className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl transition-all duration-300 group-hover:h-1.5"
                        style={{ backgroundColor: cat.color || '#6B7280' }}
                      />

                      {/* Ordinal position badge with drag handle grip — top-left */}
                      <div className="absolute top-3 left-4 z-10">
                        <span
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold border shadow-sm cursor-grab active:cursor-grabbing hover:scale-105 transition-transform"
                          style={{
                            backgroundColor: (cat.color || '#6B7280') + '18',
                            borderColor: (cat.color || '#6B7280') + '40',
                            color: cat.color || '#6B7280',
                          }}
                          title={`Position ${positionInAll} of ${categories.length} — Drag to reorder`}
                        >
                          <GripVertical className="h-3 w-3 opacity-60 shrink-0" />
                          <Hash className="h-2.5 w-2.5" />
                          {toOrdinal(positionInAll)}
                        </span>
                      </div>

                      {/* Reorder up/down arrows — top-right corner, visible on hover */}
                      <div
                        className="absolute top-3 right-3 z-10 flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        draggable={false}
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          draggable={false}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveCategory(cat._id, 'up');
                          }}
                          disabled={isFirst}
                          className={`p-1 rounded-lg transition-all duration-150 ${
                            isFirst
                              ? 'text-neutral-300 cursor-not-allowed'
                              : `${colors.bgSecondary} border ${colors.border} ${colors.textSecondary} hover:text-brand-600 hover:border-brand-300 hover:bg-brand-50`
                          }`}
                          title="Move up"
                        >
                          <ArrowUp className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          draggable={false}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveCategory(cat._id, 'down');
                          }}
                          disabled={isLast}
                          className={`p-1 rounded-lg transition-all duration-150 ${
                            isLast
                              ? 'text-neutral-300 cursor-not-allowed'
                              : `${colors.bgSecondary} border ${colors.border} ${colors.textSecondary} hover:text-brand-600 hover:border-brand-300 hover:bg-brand-50`
                          }`}
                          title="Move down"
                        >
                          <ArrowDown className="h-3 w-3" />
                        </button>
                      </div>

                      <div className="space-y-4 mt-5">
                        {/* Header with icon and edit/delete actions */}
                        <div className="flex items-start justify-between">
                          <div
                            className="p-3 rounded-2xl border transition-all duration-300 group-hover:scale-110"
                            style={{
                              backgroundColor: (cat.color || '#6B7280') + '15',
                              borderColor: (cat.color || '#6B7280') + '30',
                              color: cat.color || '#6B7280'
                            }}
                          >
                            {cat.icon ? (
                              <img src={cat.icon} alt="" className="h-6 w-6 object-contain" />
                            ) : (
                              <Folder className="h-6 w-6" />
                            )}
                          </div>
                          <div
                            className="flex space-x-1.5 opacity-60 group-hover:opacity-100 transition-opacity duration-200"
                            draggable={false}
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              draggable={false}
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditModal(cat);
                              }}
                              className={`p-2 rounded-xl ${colors.bgSecondary} border ${colors.border} ${colors.textSecondary} hover:text-brand-600 hover:border-brand-200 hover:bg-brand-50 transition-all duration-200`}
                              title="Edit"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              draggable={false}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCategory(cat._id);
                              }}
                              className={`p-2 rounded-xl ${colors.bgSecondary} border ${colors.border} ${colors.textSecondary} hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all duration-200`}
                              title="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Category info */}
                        <div className="space-y-1.5">
                          <h3 className={`text-base font-bold ${colors.text} leading-tight line-clamp-1 group-hover:text-brand-700 transition-colors`}>
                            {cat.name}
                          </h3>
                          <p className={`text-[10px] font-mono ${colors.textMuted} uppercase tracking-wider`}>
                            {cat.slug}
                          </p>
                          <p className={`text-xs ${colors.textSecondary} leading-relaxed line-clamp-2`}>
                            {cat.description || 'No description added.'}
                          </p>
                        </div>

                        {/* Footer: product count + position display */}
                        <div className={`pt-4 border-t ${colors.border} flex items-center justify-between`}>
                          <span className={`text-xs font-medium ${colors.textSecondary}`}>
                            {cat.productCount ?? 0} {cat.productCount === 1 ? 'product' : 'products'}
                          </span>
                          {/* Position display with ordinal */}
                          <div className="flex items-center gap-1.5">
                            <span
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold border transition-all duration-200 group-hover:shadow-sm"
                              style={{
                                backgroundColor: (cat.color || '#6B7280') + '15',
                                borderColor: (cat.color || '#6B7280') + '30',
                                color: cat.color || '#6B7280'
                              }}
                            >
                              <Hash className="h-2.5 w-2.5" />
                              {positionInAll}
                              <span className="opacity-60 text-[8px]">of {categories.length}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </div>


                <Pagination
                  currentPage={currentPage}
                  totalItems={categories.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                />
              </>
            )}
          </>
        ) : (
          <>
            <header className={`pb-8 border-b ${colors.border} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleBackToCategories}
                  className={`p-2.5 rounded-2xl border ${colors.border} ${colors.textSecondary} hover:text-neutral-900 hover:border-neutral-300 transition-all duration-200 hover:shadow-sm`}
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                  <div className="flex items-center gap-3">
                    <div
                      className="p-2 rounded-xl border"
                      style={{
                        backgroundColor: (selectedCategory.color || '#6B7280') + '15',
                        borderColor: (selectedCategory.color || '#6B7280') + '30',
                        color: selectedCategory.color || '#6B7280'
                      }}
                    >
                      {selectedCategory.icon ? (
                        <img src={selectedCategory.icon} alt="" className="h-5 w-5 object-contain" />
                      ) : (
                        <Folder className="h-5 w-5" />
                      )}
                    </div>
                    <h1 className={`text-xl sm:text-2xl font-bold ${colors.text} tracking-tight`}>{selectedCategory.name}</h1>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 ml-1">
                    <p className={`${colors.textSecondary} text-sm`}>
                      {categoryProducts.length} {categoryProducts.length === 1 ? 'product' : 'products'} in this category
                    </p>
                    {categoryProducts.length > 1 && (
                      <span className="inline-flex items-center gap-1 text-xs text-brand-600 dark:text-brand-400 font-semibold bg-brand-50 dark:bg-brand-950/40 px-2 py-0.5 rounded-lg border border-brand-200/60 dark:border-brand-800/40">
                        <GripVertical className="h-3 w-3" /> Drag & drop cards to reorder
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={handleCreateProduct}
                className="inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all duration-200 hover:shadow-lg hover:shadow-brand-500/20 self-start sm:self-auto shrink-0"
              >
                <Plus className="h-4 w-4" />
                <span>Create Product</span>
              </button>
            </header>

            {productsLoading ? (
              <div className="flex items-center justify-center py-32">
                <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-brand-500 border-t-transparent"></div>
              </div>
            ) : categoryProducts.length === 0 ? (
              <div className="text-center py-32 rounded-3xl bg-gradient-to-b from-neutral-50 to-white border-2 border-dashed border-neutral-200">
                <div className={`inline-flex p-4 rounded-2xl ${isLight ? 'bg-neutral-100' : 'bg-neutral-800'} mb-4`}>
                  <ImageIcon className={`h-8 w-8 ${colors.textMuted}`} />
                </div>
                <p className={`text-sm ${colors.textSecondary} font-semibold`}>No products found in this category</p>
                <p className={`text-xs ${colors.textSecondary} mt-1 mb-4 opacity-70`}>Create your first product for {selectedCategory.name}</p>
                <button
                  onClick={handleCreateProduct}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all shadow-lg shadow-brand-500/20"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create First Product</span>
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                  {productPagination.paginated.map((prod, idx) => {
                    const globalIdx = (currentPage - 1) * productPagination.perPage + idx;
                    const catName = selectedCategory?.name || prod.categoryId?.name || prod.category || 'Templates';
                    const isDragging = draggedProdId === prod._id;
                    const isOver = dragOverProdId === prod._id;

                    return (
                    <div
                      key={prod._id}
                      draggable={true}
                      onDragStart={(e) => handleProdDragStart(e, prod._id)}
                      onDragOver={(e) => handleProdDragOver(e, prod._id)}
                      onDragLeave={(e) => handleProdDragLeave(e, prod._id)}
                      onDragEnd={handleProdDragEnd}
                      onDrop={(e) => handleProdDrop(e, prod._id)}
                      className={`group ${colors.cardBg} border ${
                        isOver
                          ? 'ring-2 ring-brand-500 border-brand-500 scale-[1.02] shadow-2xl bg-brand-50/10'
                          : colors.cardBorder
                      } rounded-3xl overflow-hidden hover:shadow-xl hover:shadow-brand-500/5 transition-all duration-300 flex flex-col hover:-translate-y-1 ${
                        isDragging ? 'opacity-40 scale-95 border-dashed border-brand-400' : ''
                      }`}
                    >
                      <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                        <img
                          src={prod.thumbnail?.url || prod.image || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&q=80'}
                          alt={prod.name}
                          draggable={false}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 pointer-events-none select-none"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                        <div className="absolute top-3 left-3">
                          <span
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-mono font-bold bg-neutral-900/80 text-white backdrop-blur-sm shadow-sm cursor-grab active:cursor-grabbing hover:scale-105 transition-transform"
                            title={`Position #${globalIdx + 1} — Drag to reorder`}
                          >
                            <GripVertical className="h-3 w-3 opacity-60 shrink-0" />
                            #{globalIdx + 1}
                          </span>
                        </div>
                        <div className="absolute top-3 right-3">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-[9px] uppercase font-bold border ${getStatusBadge(prod.status)} shadow-sm`}>
                            {prod.status || 'published'}
                          </span>
                        </div>
                      </div>

                      <div className="p-5 flex-1 flex flex-col">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className={`text-sm font-bold ${colors.text} leading-tight line-clamp-2 flex-1 group-hover:text-brand-700 transition-colors`}>{prod.name}</h3>
                        </div>

                        <span className={`text-[10px] uppercase tracking-wider ${colors.accent} font-bold mb-3 inline-block`}>
                          {catName}
                        </span>

                        <p className={`text-[11px] ${colors.textSecondary} line-clamp-2 mb-4 flex-1 leading-relaxed`}>
                          {prod.shortDescription || prod.description || 'No description'}
                        </p>

                        {prod.technologies && prod.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {prod.technologies.slice(0, 3).map((tech, i) => (
                              <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-[9px] font-bold text-neutral-600 dark:text-slate-300">
                                {typeof tech === 'string' ? tech : tech.name}
                              </span>
                            ))}
                            {prod.technologies.length > 3 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-[9px] font-bold text-neutral-500">
                                +{prod.technologies.length - 3}
                              </span>
                            )}
                          </div>
                        )}

                        <div className={`flex justify-between items-baseline text-xs pt-3 mt-auto border-t ${colors.border}`}>
                          <div className={colors.textSecondary}>
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className="text-[10px] uppercase font-medium">Original</span>
                              {((prod.originalPrice || prod.compareAtPrice) > (prod.sellingPrice || prod.price)) && (
                                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
                                  {prod.discountPercent || Math.round((((prod.originalPrice || prod.compareAtPrice) - (prod.sellingPrice || prod.price)) / (prod.originalPrice || prod.compareAtPrice)) * 100)}% OFF
                                </span>
                              )}
                            </div>
                            <span className="line-through">INR {(prod.originalPrice || prod.compareAtPrice || prod.actualPrice || prod.price || 0).toLocaleString()}</span>
                          </div>
                          <div className="text-right">
                            <span className={`text-[10px] ${colors.textMuted} block uppercase font-medium mb-0.5`}>Selling</span>
                            <span className={`font-bold ${colors.text} text-base`}>INR {(prod.sellingPrice || prod.price || 0).toLocaleString()}</span>
                          </div>
                        </div>

                        <div
                          className={`flex items-center space-x-2 pt-3 mt-3 border-t ${colors.border}`}
                          draggable={false}
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            draggable={false}
                            onClick={() => navigate(`/products/${prod.slug || prod._id}`)}
                            className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-2.5 rounded-xl bg-neutral-900 text-white text-[10px] font-bold hover:bg-neutral-800 transition-all duration-200 hover:shadow-md"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>View</span>
                          </button>
                          <button
                            type="button"
                            draggable={false}
                            onClick={() => handleEditProduct(prod)}
                            className={`flex items-center justify-center space-x-1.5 px-3 py-2.5 rounded-xl border ${colors.border} ${colors.textSecondary} hover:text-neutral-900 hover:border-neutral-300 text-[10px] font-bold transition-all duration-200`}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            draggable={false}
                            onClick={() => handleDeleteProduct(prod._id)}
                            className="flex items-center justify-center space-x-1.5 px-3 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-[10px] font-bold transition-all duration-200"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Delete</span>
                          </button>
                          <div className="flex flex-col space-y-1 shrink-0" draggable={false} onMouseDown={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              draggable={false}
                              onClick={() => handleMoveCategoryProduct(prod._id, 'up')}
                              disabled={globalIdx === 0}
                              className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-xs"
                              title="Move product up"
                            >
                              <ArrowUp className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              draggable={false}
                              onClick={() => handleMoveCategoryProduct(prod._id, 'down')}
                              disabled={globalIdx === categoryProducts.length - 1}
                              className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-xs"
                              title="Move product down"
                            >
                              <ArrowDown className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )})}
                </div>

                {productPagination.totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalItems={categoryProducts.length}
                    itemsPerPage={productPagination.perPage}
                    onPageChange={setCurrentPage}
                  />
                )}
              </>
            )}
          </>
        )}

        {/* Category Modal Popup Form (Create & Edit) */}
        {isModalOpen && (
          <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${colors.overlay} backdrop-blur-sm`}>
            <div className={`w-full max-w-md ${colors.bgCard} border ${colors.cardBorder} rounded-3xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto`}>
              <div className={`flex justify-between items-center pb-4 border-b ${colors.border}`}>
                <div>
                  <h2 className={`text-sm font-bold uppercase tracking-wider ${colors.text}`}>
                    {modalMode === 'create' ? 'Create Category' : 'Edit Category'}
                  </h2>
                  {/* Context sub-label showing category count and target position */}
                  <p className={`text-[10px] ${colors.textMuted} mt-0.5`}>
                    {modalMode === 'create'
                      ? <>Will be added as the <strong className="text-brand-600">{toOrdinal(order)}</strong> category ({categories.length} exist)</>
                      : <>Currently in position <strong className="text-brand-600">{toOrdinal(order)}</strong> of {categories.length}</>
                    }
                  </p>
                </div>
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
                  <div className="flex items-center justify-between mb-1.5">
                    <label className={`block ${colors.textSecondary} font-medium uppercase text-[10px]`}>
                      Position (Display Order)
                    </label>
                    {/* Quick fill: set to next available slot */}
                    <button
                      type="button"
                      onClick={() => setOrder(categories.length + (modalMode === 'create' ? 1 : 0))}
                      className="text-[9px] font-extrabold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 px-2 py-0.5 rounded-full transition-colors"
                    >
                      Use #{modalMode === 'create' ? categories.length + 1 : categories.length} (next)
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      value={order}
                      onChange={(e) => setOrder(parseInt(e.target.value) || 1)}
                      className={`flex-1 ${colors.bgInput} border ${colors.borderInput} rounded-xl px-3.5 py-2.5 ${colors.text} focus:outline-none ${colors.inputFocus} transition-all duration-200 tabular-nums`}
                    />
                    {/* Live ordinal preview */}
                    <div className="flex flex-col items-center justify-center min-w-[56px] h-[40px] rounded-xl border-2 border-brand-300 bg-brand-50 dark:bg-brand-500/10 dark:border-brand-500/40">
                      <span className="text-sm font-extrabold text-brand-700 dark:text-brand-400 leading-none">
                        {toOrdinal(order || 1)}
                      </span>
                      <span className="text-[8px] text-brand-500 font-bold mt-0.5 uppercase tracking-wide">position</span>
                    </div>
                  </div>
                  <p className={`text-[10px] ${colors.textMuted} mt-1.5 leading-relaxed`}>
                    Lower numbers appear first. Currently <strong>{categories.length}</strong> {categories.length === 1 ? 'category' : 'categories'} exist.
                    {modalMode === 'create' && (
                      <> Setting <strong>{toOrdinal(order)}</strong> will place this category in the <strong>{toOrdinal(order)}</strong> position.</>
                    )}
                  </p>
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

        {/* Product Modal */}
        <ProductFormModal
          isOpen={productModalOpen}
          onClose={() => { setProductModalOpen(false); setEditingProduct(null); }}
          editingProduct={editingProduct}
          categories={categories}
          onSaved={handleProductSaved}
        />
      </div>
    </AdminLayout>
  );
};

export default Categories;
