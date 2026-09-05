import React, { useState, useRef, useEffect } from 'react';
import { X, ImagePlus, Code, Tag, FileText, Link as LinkIcon, Copy, Check } from 'lucide-react';
import { useAdminTheme } from '../../context/AdminThemeContext';
import client from '../../api/client';

const ProductFormModal = ({ isOpen, onClose, editingProduct, categories, onSaved }) => {
  const { colors, isLight } = useAdminTheme();

  const [activeTab, setActiveTab] = useState('basic');
  const [name, setName] = useState('');
  const [price, setPrice] = useState(2999);
  const [sellingPrice, setSellingPrice] = useState(999);
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
  const [slug, setSlug] = useState('');
  const [status, setStatus] = useState('published');
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const nameRef = useRef(null);

  const dbCategories = categories || [];

  useEffect(() => {
    if (!isOpen) return;
    if (editingProduct) {
      setName(editingProduct.name || '');
      setPrice(editingProduct.originalPrice || editingProduct.compareAtPrice || editingProduct.price || editingProduct.sellingPrice || 0);
      setSellingPrice(editingProduct.sellingPrice || editingProduct.actualPrice || editingProduct.price || 0);

      const matchedCategory = dbCategories.find(c =>
        c.slug === editingProduct.category ||
        c.name === editingProduct.category ||
        String(c._id) === String(editingProduct.categoryId?._id || editingProduct.categoryId) ||
        c.slug === editingProduct.categoryId?.slug
      );
      setCategory(matchedCategory?._id || editingProduct.categoryId?._id || editingProduct.categoryId || matchedCategory?.slug || editingProduct.category || '');

      setDescription(editingProduct.description || '');
      setShortDescription(editingProduct.shortDescription || '');

      const rawImages = (editingProduct.images || []).map(img => typeof img === 'string' ? img : img?.url).filter(Boolean);
      const thumbUrl = editingProduct.thumbnail?.url || (typeof editingProduct.thumbnail === 'string' ? editingProduct.thumbnail : '') || editingProduct.image || '';
      const initialImages = rawImages.length > 0
        ? (thumbUrl && !rawImages.includes(thumbUrl) ? [thumbUrl, ...rawImages] : rawImages)
        : (thumbUrl ? [thumbUrl] : []);

      setImages(initialImages);
      setImage(thumbUrl || initialImages[0] || '');
      setImageInput('');

      const techList = (editingProduct.techStack && editingProduct.techStack.length > 0) ? editingProduct.techStack : (editingProduct.technologies || []);
      setTechInput(techList.map(t => typeof t === 'string' ? t : t.name).filter(Boolean).join(', '));

      const featuresList = (editingProduct.features || []).map(f => {
        if (typeof f === 'string') return f;
        if (f.title && f.description) return `${f.title}: ${f.description}`;
        return f.title || f.description || '';
      }).filter(Boolean);
      setFeaturesInput(featuresList.join('\n'));

      setPreviewUrl(editingProduct.preview?.url || editingProduct.previewUrl || editingProduct.liveUrl || '');
      setDocumentationUrl(editingProduct.documentation?.url || editingProduct.documentationUrl || '');
      setSlug(editingProduct.slug || '');
      setStatus(editingProduct.status || 'published');
      setError('');
      setActiveTab('basic');
    } else {
      resetForm();
    }
  }, [isOpen, editingProduct, dbCategories]);

  const resetForm = () => {
    setName('');
    setPrice(2999);
    setSellingPrice(999);
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
  };

  const generateSlug = (text) => {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
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

    const origPrice = Number(price);
    const sellPrice = Number(sellingPrice);

    const formattedFeatures = featuresInput.split('\n').map(line => {
      const trimmed = line.trim();
      if (!trimmed) return null;
      if (trimmed.includes(':')) {
        const [title, ...descParts] = trimmed.split(':');
        return { title: title.trim(), description: descParts.join(':').trim() };
      }
      return { title: trimmed, description: '' };
    }).filter(Boolean);

    const selectedCat = dbCategories.find(c => 
      String(c._id) === String(category) || 
      c.slug === category || 
      c.name === category
    );

    const resolvedCategoryId = selectedCat?._id || (category && category.length === 24 ? category : undefined);
    const resolvedCategorySlug = selectedCat?.slug || selectedCat?.name || (typeof category === 'string' ? category : 'react');

    const payload = {
      name,
      originalPrice: origPrice >= sellPrice ? origPrice : sellPrice,
      sellingPrice: sellPrice,
      price: sellPrice,
      compareAtPrice: origPrice >= sellPrice ? origPrice : sellPrice,
      category: resolvedCategorySlug,
      categoryId: resolvedCategoryId,
      shortDescription: shortDescription || description,
      description,
      thumbnail: { url: imagesPayload[0]?.url || allImages[0] },
      image: imagesPayload[0]?.url || allImages[0],
      images: imagesPayload,
      techStack: techInput.split(',').map(t => ({ name: t.trim() })).filter(t => t.name),
      features: formattedFeatures,
      preview: { enabled: !!previewUrl, url: previewUrl },
      documentation: { enabled: !!documentationUrl, url: documentationUrl },
      liveUrl: previewUrl,
      slug: slug || generateSlug(name),
      status: status || 'published'
    };

    try {
      if (editingProduct && editingProduct._id && !editingProduct._id.startsWith('prod-')) {
        await client.put(`/api/admin/products/${editingProduct._id}`, payload);
      } else {
        await client.post('/api/admin/products', payload);
      }
      onClose();
      if (onSaved) onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving product. Please check input values.');
    }
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: FileText },
    { id: 'media', label: 'Media', icon: ImagePlus },
    { id: 'technical', label: 'Technical', icon: Code },
    { id: 'links', label: 'Links & SEO', icon: LinkIcon }
  ];

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${colors.overlay || 'bg-black/60'} backdrop-blur-sm`}>
      <div className={`w-full max-w-3xl ${colors.bgCard || 'bg-white'} border ${colors.cardBorder || 'border-neutral-200'} rounded-3xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col`}>
        <div className={`flex justify-between items-center p-6 border-b ${colors.border || 'border-neutral-200'} shrink-0`}>
          <div>
            <h2 className={`text-lg font-bold ${colors.text || 'text-neutral-900'}`}>
              {editingProduct ? 'Edit Product' : 'Create New Product'}
            </h2>
            <p className={`text-xs ${colors.textSecondary || 'text-neutral-500'} mt-0.5`}>
              {editingProduct ? `Editing: ${editingProduct.name}` : 'Fill in the product details below'}
            </p>
          </div>
          <button type="button" onClick={onClose} className={`p-2 rounded-xl ${colors.textSecondary || 'text-neutral-400'} hover:text-white transition-colors`}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className={`flex items-center gap-1 px-6 pt-4 border-b ${colors.border || 'border-neutral-200'} shrink-0`}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-brand-600 text-white shadow-md'
                  : `${colors.textSecondary || 'text-neutral-500'} hover:bg-neutral-100 dark:hover:bg-neutral-800`
              }`}
            >
              <tab.icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 text-xs font-bold text-red-600 dark:text-red-400 flex items-start gap-2.5">
              <X className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {activeTab === 'basic' && (
            <div className="space-y-5">
              <div>
                <label className={`block ${colors.textSecondary || 'text-neutral-500'} font-medium mb-1.5 uppercase text-[10px]`}>Product Name *</label>
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
                  className={`w-full ${colors.bgInput || 'bg-neutral-50'} border ${colors.borderInput || 'border-neutral-200'} rounded-xl px-4 py-3 ${colors.text || 'text-neutral-900'} placeholder:text-neutral-400 focus:outline-none ${colors.inputFocus || 'focus:border-brand-500'} transition-all duration-200 text-sm`}
                />
              </div>

              <div>
                <label className={`block ${colors.textSecondary || 'text-neutral-500'} font-medium mb-1.5 uppercase text-[10px]`}>URL Slug</label>
                <div className="relative">
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="auto-generated-from-name"
                    className={`w-full ${colors.bgInput || 'bg-neutral-50'} border ${colors.borderInput || 'border-neutral-200'} rounded-xl px-4 py-3 ${colors.text || 'text-neutral-900'} placeholder:text-neutral-400 focus:outline-none ${colors.inputFocus || 'focus:border-brand-500'} transition-all duration-200 text-sm font-mono`}
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
                  <label className={`block ${colors.textSecondary || 'text-neutral-500'} font-medium mb-1.5 uppercase text-[10px]`}>Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={`w-full ${colors.bgInput || 'bg-neutral-50'} border ${colors.borderInput || 'border-neutral-200'} rounded-xl px-4 py-3 ${colors.text || 'text-neutral-900'} focus:outline-none ${colors.inputFocus || 'focus:border-brand-500'} transition-all duration-200 text-sm`}
                  >
                    <option value="">Select Category</option>
                    {dbCategories.map(cat => (
                      <option key={cat._id || cat.slug} value={cat._id || cat.slug}>
                        {cat.name} ({cat.slug}){cat.homeSection ? ` • ${cat.homeSection}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block ${colors.textSecondary || 'text-neutral-500'} font-medium mb-1.5 uppercase text-[10px]`}>Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className={`w-full ${colors.bgInput || 'bg-neutral-50'} border ${colors.borderInput || 'border-neutral-200'} rounded-xl px-4 py-3 ${colors.text || 'text-neutral-900'} focus:outline-none ${colors.inputFocus || 'focus:border-brand-500'} transition-all duration-200 text-sm`}
                    >
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5" />
                    <span>Product Pricing (INR ₹) *</span>
                  </label>
                  {Number(price) > Number(sellingPrice) && Number(price) > 0 && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                      {Math.round(((Number(price) - Number(sellingPrice)) / Number(price)) * 100)}% OFF DISCOUNT
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`block ${colors.textSecondary || 'text-neutral-500'} font-medium mb-1.5 uppercase text-[10px]`}>Original Price (MSRP / MRP) *</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400">₹</span>
                      <input
                        type="number"
                        required
                        min="0"
                        step="1"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="2999"
                        className={`w-full ${colors.bgInput || 'bg-neutral-50'} border ${colors.borderInput || 'border-neutral-200'} rounded-xl pl-8 pr-4 py-3 ${colors.text || 'text-neutral-900'} focus:outline-none ${colors.inputFocus || 'focus:border-brand-500'} transition-all duration-200 text-sm font-semibold`}
                      />
                    </div>
                    <p className="text-[10px] text-neutral-400 mt-1">Original list price before discount (strikethrough)</p>
                  </div>

                  <div>
                    <label className={`block ${colors.textSecondary || 'text-neutral-500'} font-medium mb-1.5 uppercase text-[10px]`}>Selling Price (Offer Price) *</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400">₹</span>
                      <input
                        type="number"
                        required
                        min="0"
                        step="1"
                        value={sellingPrice}
                        onChange={(e) => setSellingPrice(e.target.value)}
                        placeholder="999"
                        className={`w-full ${colors.bgInput || 'bg-neutral-50'} border ${colors.borderInput || 'border-neutral-200'} rounded-xl pl-8 pr-4 py-3 ${colors.text || 'text-neutral-900'} focus:outline-none ${colors.inputFocus || 'focus:border-brand-500'} transition-all duration-200 text-sm font-semibold text-emerald-600 dark:text-emerald-400`}
                      />
                    </div>
                    <p className="text-[10px] text-neutral-400 mt-1">Final checkout price paid by customers</p>
                  </div>
                </div>
              </div>

              <div>
                <label className={`block ${colors.textSecondary || 'text-neutral-500'} font-medium mb-1.5 uppercase text-[10px]`}>Short Description</label>
                <input
                  type="text"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="Brief one-line description for cards..."
                  className={`w-full ${colors.bgInput || 'bg-neutral-50'} border ${colors.borderInput || 'border-neutral-200'} rounded-xl px-4 py-3 ${colors.text || 'text-neutral-900'} placeholder:text-neutral-400 focus:outline-none ${colors.inputFocus || 'focus:border-brand-500'} transition-all duration-200 text-sm`}
                />
              </div>

              <div>
                <label className={`block ${colors.textSecondary || 'text-neutral-500'} font-medium mb-1.5 uppercase text-[10px]`}>Full Description</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed product description, features, and usage guidelines..."
                  className={`w-full ${colors.bgInput || 'bg-neutral-50'} border ${colors.borderInput || 'border-neutral-200'} rounded-xl px-4 py-3 ${colors.text || 'text-neutral-900'} placeholder:text-neutral-400 focus:outline-none ${colors.inputFocus || 'focus:border-brand-500'} transition-all duration-200 text-sm resize-none`}
                />
              </div>
            </div>
          )}

          {activeTab === 'media' && (
            <div className="space-y-5">
              <div>
                <label className={`block ${colors.textSecondary || 'text-neutral-500'} font-medium mb-1.5 uppercase text-[10px]`}>Product Images</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={imageInput}
                    onChange={(e) => setImageInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addImage(); } }}
                    placeholder="Paste image URL and press Enter..."
                    className={`flex-1 ${colors.bgInput || 'bg-neutral-50'} border ${colors.borderInput || 'border-neutral-200'} rounded-xl px-4 py-3 ${colors.text || 'text-neutral-900'} placeholder:text-neutral-400 focus:outline-none ${colors.inputFocus || 'focus:border-brand-500'} transition-all duration-200 text-sm`}
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

          {activeTab === 'technical' && (
            <div className="space-y-5">
              <div>
                <label className={`block ${colors.textSecondary || 'text-neutral-500'} font-medium mb-1.5 uppercase text-[10px]`}>Technologies (comma-separated)</label>
                <input
                  type="text"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  placeholder="React, Tailwind CSS, Framer Motion, TypeScript"
                  className={`w-full ${colors.bgInput || 'bg-neutral-50'} border ${colors.borderInput || 'border-neutral-200'} rounded-xl px-4 py-3 ${colors.text || 'text-neutral-900'} placeholder:text-neutral-400 focus:outline-none ${colors.inputFocus || 'focus:border-brand-500'} transition-all duration-200 text-sm`}
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
                <label className={`block ${colors.textSecondary || 'text-neutral-500'} font-medium mb-1.5 uppercase text-[10px]`}>Features Checklist (one per line)</label>
                <textarea
                  rows={5}
                  value={featuresInput}
                  onChange={(e) => setFeaturesInput(e.target.value)}
                  placeholder="Fully responsive design&#10;Dark/Light mode support&#10;RTL compatibility&#10;Premium icon set included"
                  className={`w-full ${colors.bgInput || 'bg-neutral-50'} border ${colors.borderInput || 'border-neutral-200'} rounded-xl px-4 py-3 ${colors.text || 'text-neutral-900'} placeholder:text-neutral-400 focus:outline-none ${colors.inputFocus || 'focus:border-brand-500'} transition-all duration-200 text-sm resize-none font-mono`}
                />
              </div>
            </div>
          )}

          {activeTab === 'links' && (
            <div className="space-y-5">
              <div>
                <label className={`block ${colors.textSecondary || 'text-neutral-500'} font-medium mb-1.5 uppercase text-[10px]`}>Live Demo Preview Link</label>
                <div className="relative">
                  <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    type="text"
                    value={previewUrl}
                    onChange={(e) => setPreviewUrl(e.target.value)}
                    placeholder="https://preview.example.com"
                    className={`w-full ${colors.bgInput || 'bg-neutral-50'} border ${colors.borderInput || 'border-neutral-200'} rounded-xl pl-11 pr-4 py-3 ${colors.text || 'text-neutral-900'} placeholder:text-neutral-400 focus:outline-none ${colors.inputFocus || 'focus:border-brand-500'} transition-all duration-200 text-sm`}
                  />
                </div>
              </div>

              <div>
                <label className={`block ${colors.textSecondary || 'text-neutral-500'} font-medium mb-1.5 uppercase text-[10px]`}>Documentation Link</label>
                <div className="relative">
                  <FileText className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    type="text"
                    value={documentationUrl}
                    onChange={(e) => setDocumentationUrl(e.target.value)}
                    placeholder="https://docs.example.com"
                    className={`w-full ${colors.bgInput || 'bg-neutral-50'} border ${colors.borderInput || 'border-neutral-200'} rounded-xl pl-11 pr-4 py-3 ${colors.text || 'text-neutral-900'} placeholder:text-neutral-400 focus:outline-none ${colors.inputFocus || 'focus:border-brand-500'} transition-all duration-200 text-sm`}
                  />
                </div>
              </div>
            </div>
          )}

          <div className={`flex justify-between items-center pt-4 border-t ${colors.border || 'border-neutral-200'}`}>
            <button
              type="button"
              onClick={onClose}
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
                className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold transition-all duration-200 hover:shadow-lg shadow-brand-500/20"
              >
                {editingProduct ? 'Update Product' : 'Create Product'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductFormModal;
