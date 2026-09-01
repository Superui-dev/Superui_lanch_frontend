import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAdminTheme } from '../../context/AdminThemeContext';
import client from '../../api/client';
import AdminLayout from '../../components/admin/AdminLayout';
import Pagination from '../../components/common/Pagination';
import {
  Plus, Pencil, Trash2, X, ArrowLeft, Eye, ImagePlus, Code, Tag, FileText, Link as LinkIcon, Monitor, Layers, Zap, ChevronDown, ChevronUp, Copy, Check
} from 'lucide-react';

const Products = () => {
  const { colors, isLight } = useAdminTheme();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [activeTab, setActiveTab] = useState('basic');

  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [sellingPrice, setSellingPrice] = useState(0);
  const [category, setCategory] = useState('react');
  const [description, setDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [image, setImage] = useState('');
  const [images, setImages] = useState([]);
  const [imageInput, setImageInput] = useState('');
  const [techInput, setTechInput] = useState('');
  const [featuresInput, setFeaturesInput] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [documentationUrl, setDocumentationUrl] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [slug, setSlug] = useState('');
  const [status, setStatus] = useState('published');
  const [copySuccess, setCopySuccess] = useState(false);

  const itemsPerPage = 10;
  const nameRef = useRef(null);

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.categoryId?.name || p.category).filter(Boolean));
    return Array.from(cats).sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (categoryFilter === 'all') return products;
    return products.filter(p => (p.categoryId?.name || p.category) === categoryFilter);
  }, [products, categoryFilter]);

  const paginatedProducts = useMemo(() => {
    return filteredProducts.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredProducts, currentPage]);

  const [dbCategories, setDbCategories] = useState([]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const [productsRes, catRes] = await Promise.allSettled([
        client.get('/api/public/products?limit=100'),
        client.get('/api/public/categories')
      ]);

      if (productsRes.status === 'fulfilled' && productsRes.value?.data?.success) {
        const list = productsRes.value.data.data?.products || productsRes.value.data.data;
        if (Array.isArray(list)) setProducts(list);
      }

      if (catRes.status === 'fulfilled' && catRes.value?.data?.success && Array.isArray(catRes.value.data.data)) {
        setDbCategories(catRes.value.data.data);
      }
    } catch (err) {
      console.warn('API error listing products:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const generateSlug = (text) => {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setName('');
    setPrice(0);
    setSellingPrice(0);
    setCategory('react');
    setDescription('');
    setShortDescription('');
    setImage('');
    setImages([]);
    setImageInput('');
    setTechInput('');
    setFeaturesInput('');
    setPreviewUrl('');
    setDocumentationUrl('');
    setSlug('');
    setStatus('published');
    setError('');
    setActiveTab('basic');
    setModalOpen(true);
    setTimeout(() => nameRef.current?.focus(), 100);
  };

  const openEditModal = (prod) => {
    setEditingProduct(prod);
    setName(prod.name || '');
    setPrice(prod.compareAtPrice || prod.price || 0);
    setSellingPrice(prod.price || prod.sellingPrice || 0);
    setCategory(prod.categoryId?.slug || prod.category || 'react');
    setDescription(prod.description || '');
    setShortDescription(prod.shortDescription || '');
    setImage(prod.thumbnail?.url || prod.image || '');
    setImages((prod.images || []).map(img => typeof img === 'string' ? img : img.url).filter(Boolean));
    setImageInput('');
    setTechInput(prod.technologies?.map(t => typeof t === 'string' ? t : t.name).join(', ') || '');
    setFeaturesInput(prod.features?.join('\n') || '');
    setPreviewUrl(prod.preview?.url || prod.previewUrl || '');
    setDocumentationUrl(prod.documentation?.url || prod.documentationUrl || '');
    setSlug(prod.slug || '');
    setStatus(prod.status || 'published');
    setError('');
    setActiveTab('basic');
    setModalOpen(true);
    setTimeout(() => nameRef.current?.focus(), 100);
  };

  const addImage = () => {
    const trimmed = imageInput.trim();
    if (!trimmed) return;
    if (images.includes(trimmed)) {
      setImageInput('');
      return;
    }
    setImages(prev => [...prev, trimmed]);
    setImageInput('');
  };

  const removeImage = (url) => {
    setImages(prev => prev.filter(img => img !== url));
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setError('');

    const allImages = images.length > 0
      ? images
      : (image ? [image] : ['https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80']);

    const imagesPayload = allImages.map((url, idx) => ({
      url,
      order: idx,
      alt: idx === 0 ? (name || 'Product image') : ''
    }));

    const payload = {
      name,
      price: Number(sellingPrice || price),
      compareAtPrice: Number(price),
      sellingPrice: Number(sellingPrice),
      category,
      shortDescription: shortDescription || description,
      description,
      thumbnail: { url: imagesPayload[0]?.url || allImages[0] },
      image: imagesPayload[0]?.url || allImages[0],
      images: imagesPayload,
      technologies: techInput.split(',').map(t => ({ name: t.trim() })).filter(t => t.name),
      features: featuresInput.split('\n').map(f => f.trim()).filter(Boolean),
      preview: { enabled: !!previewUrl, url: previewUrl },
      documentation: { enabled: !!documentationUrl, url: documentationUrl },
      slug: slug || generateSlug(name),
      status: status || 'published'
    };

    try {
      if (editingProduct && editingProduct._id && !editingProduct._id.startsWith('prod-')) {
        await client.put(`/api/admin/products/${editingProduct._id}`, payload);
      } else {
        await client.post('/api/admin/products', payload);
      }
      setModalOpen(false);
      await fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving product. Please check input values.');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      if (id && !id.startsWith('prod-')) {
        await client.delete(`/api/admin/products/${id}`);
      }
      setProducts(prev => prev.filter(p => p._id !== id));
      await fetchProducts();
    } catch (err) {
      alert('Delete failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: FileText },
    { id: 'media', label: 'Media', icon: ImagePlus },
    { id: 'technical', label: 'Technical', icon: Code },
    { id: 'links', label: 'Links & SEO', icon: LinkIcon }
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'published':
        return 'bg-emerald-500/10 text-emerald-700 border-emerald-200';
      case 'draft':
        return 'bg-amber-500/10 text-amber-700 border-amber-200';
      case 'archived':
        return 'bg-neutral-500/10 text-neutral-700 border-neutral-200';
      default:
        return 'bg-neutral-500/10 text-neutral-700 border-neutral-200';
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 lg:p-10 space-y-10">
        <header className={`flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b ${colors.border} gap-4`}>
          <div className="flex items-center space-x-3">
            <Link to="/india/admin/dashboard" className="lg:hidden p-2 text-neutral-400 hover:text-neutral-600">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className={`text-xl sm:text-2xl font-semibold ${colors.text}`}>Product Catalog</h1>
              <p className={`${colors.textSecondary} text-sm mt-1`}>Create, edit, and manage premium UI assets, templates, and digital products.</p>
            </div>
          </div>

          <button
            onClick={openCreateModal}
            className="flex items-center space-x-2 px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-xs font-semibold text-white transition-all duration-200 hover:shadow-lg shadow-brand-500/20 self-start btn-shine"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Product</span>
          </button>
        </header>

        {/* Category Filter */}
        <div className="flex items-center space-x-3">
          <label className={`text-xs font-medium ${colors.textSecondary} uppercase tracking-wider`}>Filter:</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className={`${colors.bgInput} border ${colors.borderInput} rounded-xl px-4 py-2.5 text-xs font-medium ${colors.text} focus:outline-none ${colors.inputFocus} transition-all duration-200`}
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
            ))}
          </select>
          <span className={`text-xs ${colors.textMuted}`}>{filteredProducts.length} products</span>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-500"></div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {paginatedProducts.map((prod) => (
                <div
                  key={prod._id}
                  className={`group ${colors.cardBg} border ${colors.cardBorder} rounded-2xl overflow-hidden hover:shadow-card transition-all duration-200 flex flex-col`}
                >
                  {/* Product Image */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                    <img
                      src={prod.thumbnail?.url || prod.image || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&q=80'}
                      alt={prod.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] uppercase font-bold border ${getStatusBadge(prod.status)}`}>
                        {prod.status || 'published'}
                      </span>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className={`text-sm font-semibold ${colors.text} leading-tight line-clamp-2 flex-1`}>{prod.name}</h3>
                    </div>
                    
                    <span className={`text-[10px] uppercase tracking-wider ${colors.accent} font-bold mb-3 inline-block`}>
                      {prod.categoryId?.name || prod.category || 'UI Asset'}
                    </span>

                    <p className={`text-[11px] ${colors.textSecondary} line-clamp-2 mb-4 flex-1`}>
                      {prod.shortDescription || prod.description || 'No description'}
                    </p>

                    {/* Tech Stack */}
                    {prod.technologies && prod.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {prod.technologies.slice(0, 3).map((tech, idx) => (
                          <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-[9px] font-bold text-neutral-600 dark:text-slate-300">
                            {typeof tech === 'string' ? tech : tech.name}
                          </span>
                        ))}
                        {prod.technologies.length > 3 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-[9px] font-bold text-neutral-500">
                            +{prod.technologies.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Pricing */}
                    <div className={`flex justify-between items-baseline text-xs pt-3 mt-auto border-t ${colors.border}`}>
                      <div className={colors.textSecondary}>
                        MSRP: <span className="line-through">INR {(prod.compareAtPrice || prod.price || 0).toLocaleString()}</span>
                      </div>
                      <div className="text-right">
                        <span className={`text-[10px] ${colors.textMuted} block uppercase font-medium`}>Selling</span>
                        <span className={`font-bold ${colors.text} text-base`}>INR {(prod.price || prod.sellingPrice || 0).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className={`flex items-center space-x-2 pt-3 mt-3 border-t ${colors.border}`}>
                      <Link
                        to={`/products/${prod.slug || prod._id}`}
                        className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-2 rounded-lg bg-neutral-900 text-white text-[10px] font-semibold hover:bg-neutral-800 transition-all duration-200"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>View</span>
                      </Link>
                      <button
                        onClick={() => openEditModal(prod)}
                        className={`flex items-center justify-center space-x-1.5 px-3 py-2 rounded-lg border ${colors.border} ${colors.textSecondary} hover:text-neutral-900 text-[10px] font-semibold transition-all duration-200`}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(prod._id)}
                        className="flex items-center justify-center space-x-1.5 px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-[10px] font-semibold transition-all duration-200"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalItems={filteredProducts.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </div>
        )}

        {/* Editor Modal */}
        {modalOpen && (
          <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${colors.overlay} backdrop-blur-sm`}>
            <div className={`w-full max-w-3xl ${colors.bgCard} border ${colors.cardBorder} rounded-3xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col`}>
              {/* Modal Header */}
              <div className={`flex justify-between items-center p-6 border-b ${colors.border} shrink-0`}>
                <div>
                  <h2 className={`text-lg font-bold ${colors.text}`}>
                    {editingProduct ? 'Edit Product' : 'Create New Product'}
                  </h2>
                  <p className={`text-xs ${colors.textSecondary} mt-0.5`}>
                    {editingProduct ? `Editing: ${editingProduct.name}` : 'Fill in the product details below'}
                  </p>
                </div>
                <button type="button" onClick={() => setModalOpen(false)} className={`p-2 rounded-xl ${colors.textSecondary} hover:text-white transition-colors`}>
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Tabs */}
              <div className={`flex items-center gap-1 px-6 pt-4 border-b ${colors.border} shrink-0`}>
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      activeTab === tab.id
                        ? 'bg-brand-600 text-white shadow-md'
                        : `${colors.textSecondary} hover:bg-neutral-100 dark:hover:bg-neutral-800`
                    }`}
                  >
                    <tab.icon className="h-3.5 w-3.5" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto p-6 space-y-5">
                {error && (
                  <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 text-xs font-bold text-red-600 dark:text-red-400 flex items-start gap-2.5">
                    <X className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Basic Info Tab */}
                {activeTab === 'basic' && (
                  <div className="space-y-5">
                    <div>
                      <label className={`block ${colors.textSecondary} font-medium mb-1.5 uppercase text-[10px]`}>Product Name *</label>
                      <input
                        ref={nameRef}
                        type="text"
                        required
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (!editingProduct) setSlug(generateSlug(e.target.value));
                        }}
                        placeholder="e.g. Aether Dashboard Pro"
                        className={`w-full ${colors.bgInput} border ${colors.borderInput} rounded-xl px-4 py-3 ${colors.text} placeholder:text-neutral-400 focus:outline-none ${colors.inputFocus} transition-all duration-200 text-sm`}
                      />
                    </div>

                    <div>
                      <label className={`block ${colors.textSecondary} font-medium mb-1.5 uppercase text-[10px]`}>URL Slug</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={slug}
                          onChange={(e) => setSlug(e.target.value)}
                          placeholder="auto-generated-from-name"
                          className={`w-full ${colors.bgInput} border ${colors.borderInput} rounded-xl px-4 py-3 ${colors.text} placeholder:text-neutral-400 focus:outline-none ${colors.inputFocus} transition-all duration-200 text-sm font-mono`}
                        />
                        <button
                          type="button"
                          onClick={() => setSlug(generateSlug(name))}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-slate-300 hover:bg-neutral-200 transition-colors"
                          title="Regenerate slug"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={`block ${colors.textSecondary} font-medium mb-1.5 uppercase text-[10px]`}>Category *</label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className={`w-full ${colors.bgInput} border ${colors.borderInput} rounded-xl px-4 py-3 ${colors.text} focus:outline-none ${colors.inputFocus} transition-all duration-200 text-sm`}
                        >
                          <option value="">Select Category</option>
                          {dbCategories.map(cat => (
                            <option key={cat._id || cat.slug} value={cat.slug || cat._id}>
                              {cat.name} ({cat.slug})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={`block ${colors.textSecondary} font-medium mb-1.5 uppercase text-[10px]`}>Status</label>
                        <select
                          value={status}
                          onChange={(e) => setStatus(e.target.value)}
                          className={`w-full ${colors.bgInput} border ${colors.borderInput} rounded-xl px-4 py-3 ${colors.text} focus:outline-none ${colors.inputFocus} transition-all duration-200 text-sm`}
                        >
                          <option value="published">Published</option>
                          <option value="draft">Draft</option>
                          <option value="archived">Archived</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className={`block ${colors.textSecondary} font-medium mb-1.5 uppercase text-[10px]`}>Short Description</label>
                      <input
                        type="text"
                        value={shortDescription}
                        onChange={(e) => setShortDescription(e.target.value)}
                        placeholder="Brief one-line description for cards..."
                        className={`w-full ${colors.bgInput} border ${colors.borderInput} rounded-xl px-4 py-3 ${colors.text} placeholder:text-neutral-400 focus:outline-none ${colors.inputFocus} transition-all duration-200 text-sm`}
                      />
                    </div>

                    <div>
                      <label className={`block ${colors.textSecondary} font-medium mb-1.5 uppercase text-[10px]`}>Full Description</label>
                      <textarea
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Detailed product description, features, and usage guidelines..."
                        className={`w-full ${colors.bgInput} border ${colors.borderInput} rounded-xl px-4 py-3 ${colors.text} placeholder:text-neutral-400 focus:outline-none ${colors.inputFocus} transition-all duration-200 text-sm resize-none`}
                      />
                    </div>
                  </div>
                )}

                {/* Media Tab */}
                {activeTab === 'media' && (
                  <div className="space-y-5">
                    <div>
                      <label className={`block ${colors.textSecondary} font-medium mb-1.5 uppercase text-[10px]`}>Product Images</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={imageInput}
                          onChange={(e) => setImageInput(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addImage(); } }}
                          placeholder="Paste image URL and press Enter..."
                          className={`flex-1 ${colors.bgInput} border ${colors.borderInput} rounded-xl px-4 py-3 ${colors.text} placeholder:text-neutral-400 focus:outline-none ${colors.inputFocus} transition-all duration-200 text-sm`}
                        />
                        <button
                          type="button"
                          onClick={addImage}
                          className="p-3 rounded-xl border border-neutral-300 text-neutral-700 hover:bg-neutral-100 transition-colors shrink-0"
                          title="Add image"
                        >
                          <ImagePlus className="h-4 w-4" />
                        </button>
                      </div>
                      {images.length > 0 && (
                        <div className="mt-4 grid grid-cols-4 gap-3">
                          {images.map((imgUrl, idx) => (
                            <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border-2 border-neutral-200 dark:border-neutral-700">
                              <img src={imgUrl} alt="" className="h-full w-full object-cover" onError={(e) => e.target.src = 'https://via.placeholder.com/150'} />
                              <div className="absolute top-1.5 left-1.5 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                                #{idx + 1}
                              </div>
                              <button
                                type="button"
                                onClick={() => removeImage(imgUrl)}
                                className="absolute top-1.5 right-1.5 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                              >
                                <X className="h-3 w-3" />
                              </button>
                              {idx === 0 && (
                                <div className="absolute bottom-1.5 left-1.5 right-1.5 text-[9px] font-bold text-center bg-neutral-900/80 text-white rounded-lg py-1 backdrop-blur-sm">
                                  COVER IMAGE
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      <p className="mt-2 text-[10px] text-neutral-400">First image becomes the cover. Press Enter or click + to add images.</p>
                    </div>
                  </div>
                )}

                {/* Technical Tab */}
                {activeTab === 'technical' && (
                  <div className="space-y-5">
                    <div>
                      <label className={`block ${colors.textSecondary} font-medium mb-1.5 uppercase text-[10px]`}>Technologies (comma-separated)</label>
                      <input
                        type="text"
                        value={techInput}
                        onChange={(e) => setTechInput(e.target.value)}
                        placeholder="React, Tailwind CSS, Framer Motion, TypeScript"
                        className={`w-full ${colors.bgInput} border ${colors.borderInput} rounded-xl px-4 py-3 ${colors.text} placeholder:text-neutral-400 focus:outline-none ${colors.inputFocus} transition-all duration-200 text-sm`}
                      />
                      {techInput && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {techInput.split(',').map((t, idx) => t.trim() && (
                            <span key={idx} className="inline-flex items-center px-2.5 py-1 rounded-lg bg-brand-500/10 text-brand-700 text-[10px] font-bold border border-brand-200">
                              {t.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className={`block ${colors.textSecondary} font-medium mb-1.5 uppercase text-[10px]`}>Features Checklist (one per line)</label>
                      <textarea
                        rows={5}
                        value={featuresInput}
                        onChange={(e) => setFeaturesInput(e.target.value)}
                        placeholder="Fully responsive design&#10;Dark/Light mode support&#10;RTL compatibility&#10;Premium icon set included"
                        className={`w-full ${colors.bgInput} border ${colors.borderInput} rounded-xl px-4 py-3 ${colors.text} placeholder:text-neutral-400 focus:outline-none ${colors.inputFocus} transition-all duration-200 text-sm resize-none font-mono`}
                      />
                    </div>
                  </div>
                )}

                {/* Links Tab */}
                {activeTab === 'links' && (
                  <div className="space-y-5">
                    <div>
                      <label className={`block ${colors.textSecondary} font-medium mb-1.5 uppercase text-[10px]`}>Live Demo Preview Link</label>
                      <div className="relative">
                        <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                        <input
                          type="text"
                          value={previewUrl}
                          onChange={(e) => setPreviewUrl(e.target.value)}
                          placeholder="https://preview.example.com"
                          className={`w-full ${colors.bgInput} border ${colors.borderInput} rounded-xl pl-11 pr-4 py-3 ${colors.text} placeholder:text-neutral-400 focus:outline-none ${colors.inputFocus} transition-all duration-200 text-sm`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`block ${colors.textSecondary} font-medium mb-1.5 uppercase text-[10px]`}>Documentation Link</label>
                      <div className="relative">
                        <FileText className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                        <input
                          type="text"
                          value={documentationUrl}
                          onChange={(e) => setDocumentationUrl(e.target.value)}
                          placeholder="https://docs.example.com"
                          className={`w-full ${colors.bgInput} border ${colors.borderInput} rounded-xl pl-11 pr-4 py-3 ${colors.text} placeholder:text-neutral-400 focus:outline-none ${colors.inputFocus} transition-all duration-200 text-sm`}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className={`flex justify-between items-center pt-4 border-t ${colors.border}`}>
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className={`px-5 py-2.5 rounded-xl border border-neutral-200 text-neutral-700 text-xs font-medium hover:bg-neutral-50 transition-all duration-200`}
                  >
                    Cancel
                  </button>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] text-neutral-400">
                      {editingProduct ? 'Updating existing product' : 'Creating new product'}
                    </span>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold transition-all duration-200 hover:shadow-lg shadow-brand-500/20 btn-shine"
                    >
                      {editingProduct ? 'Update Product' : 'Create Product'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Products;
