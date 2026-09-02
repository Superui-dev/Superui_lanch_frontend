import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import client from '../api/client';
import { useCart } from '../context/CartContext';
import { useWatchlist } from '../context/WatchlistContext';
import { useAuth } from '../context/AuthContext';
import LivePreviewModal from '../components/common/LivePreviewModal';
import { 
  Search, 
  ShoppingCart, 
  SlidersHorizontal, 
  Sparkles, 
  Eye, 
  Heart, 
  X, 
  LayoutGrid, 
  BookOpen, 
  Monitor, 
  Palette, 
  ChevronDown, 
  Check 
} from 'lucide-react';

const categoryIcons = {
  'all': LayoutGrid,
  'ebooks': BookOpen,
  'templates': Palette,
  'websites': Monitor,
  'ui-kits': Sparkles
};

const ProductListing = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownSearch, setDropdownSearch] = useState('');
  const [previewProduct, setPreviewProduct] = useState(null);
  
  const dropdownRef = useRef(null);
  const categoryFilter = searchParams.get('category') || 'all';
  const { addToCart } = useCart();
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const { openAuthModal, user } = useAuth();

  const handleAddToCart = (product) => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    addToCart({
      _id: product._id,
      name: product.name,
      price: product.sellingPrice || product.price,
      image: product.thumbnail?.url || product.image
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [productsRes, categoriesRes] = await Promise.allSettled([
          client.get('/api/public/products?limit=100', { silent: true }),
          client.get('/api/public/categories', { silent: true })
        ]);

        if (productsRes.status === 'fulfilled' && productsRes.value?.data?.success) {
          const val = productsRes.value.data.data;
          const list = Array.isArray(val) ? val : val?.products || [];
          setProducts(list);
        } else {
          setProducts([]);
        }

        if (categoriesRes.status === 'fulfilled' && categoriesRes.value?.data?.success && Array.isArray(categoriesRes.value.data.data)) {
          setCategories(categoriesRes.value.data.data);
        } else {
          setCategories([]);
        }
      } catch (err) {
        console.warn('Failed to fetch DB products for store:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredProducts = products.filter(p => {
    const matchCategory = categoryFilter === 'all' 
      ? true 
      : (p.categoryId?.slug === categoryFilter || p.category === categoryFilter);
    const term = searchQuery.toLowerCase().trim();
    const matchQuery = !term ||
      p.name?.toLowerCase().includes(term) ||
      p.description?.toLowerCase().includes(term) ||
      String(p.sellingPrice || p.price || '').toLowerCase().includes(term) ||
      (p.categoryId?.name || p.category || '').toLowerCase().includes(term);
    return matchCategory && matchQuery;
  });

  const clearFilters = () => {
    setSearchParams({});
    setSearchQuery('');
  };

  // Resolve current active category label & icon
  const currentCategory = categoryFilter === 'all'
    ? { slug: 'all', name: 'All Products' }
    : categories.find(c => c.slug === categoryFilter || c._id === categoryFilter) || { slug: categoryFilter, name: categoryFilter };
  
  const CurrentIcon = categoryIcons[currentCategory.slug] || LayoutGrid;

  return (
    <div className="min-h-screen bg-neutral-50/50">
      {/* Live Preview Modal */}
      <LivePreviewModal
        product={previewProduct}
        isOpen={!!previewProduct}
        onClose={() => setPreviewProduct(null)}
      />

      {/* Page Header */}
      <section className="pt-16 pb-10 sm:pt-20 sm:pb-12 bg-white border-b border-neutral-200/80 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold mb-3">
              <Sparkles className="h-3.5 w-3.5 text-brand-600" />
              <span>Premium Developer & Designer Assets</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900">
              SuperUI Store Catalog
            </h1>
            <p className="mt-3 text-sm sm:text-base text-neutral-600 max-w-2xl mx-auto">
              Explore high-performance UI kits, templates, dashboard designs, and digital code components.
            </p>
          </div>
        </div>
      </section>

      {/* Category Dropdown + Category Bar + Search Filter */}
      <section className="py-6 bg-white border-b border-neutral-200/80 sticky top-16 z-20 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            
            {/* Category Filter Controls: Dropdown + Quick Pills */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
              
              {/* 1st Position: Premium Category Dropdown Menu */}
              <div className="relative shrink-0" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="inline-flex items-center justify-between space-x-2.5 px-4 py-2.5 rounded-2xl bg-neutral-900 text-white hover:bg-brand-600 text-xs font-bold shadow-md transition-all border border-neutral-800 shrink-0 min-w-[210px] group"
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <CurrentIcon className="h-4 w-4 text-brand-400 group-hover:text-white shrink-0 transition-colors" />
                    <span className="truncate">{currentCategory.name}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 shrink-0 ml-2">
                    <span className="px-2 py-0.5 rounded-full bg-neutral-800 text-[10px] text-neutral-300 font-semibold border border-neutral-700">
                      {categoryFilter === 'all' ? products.length : filteredProducts.length}
                    </span>
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${dropdownOpen ? 'rotate-180 text-brand-400' : 'text-neutral-400'}`} />
                  </div>
                </button>

                {/* Dropdown Floating Panel */}
                {dropdownOpen && (
                  <div className="absolute left-0 mt-2 w-72 bg-white rounded-2xl border border-neutral-200/90 shadow-2xl z-30 p-2 animate-fadeIn space-y-1">
                    
                    {/* Search inside Dropdown */}
                    <div className="p-1.5">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                        <input
                          type="text"
                          placeholder="Search categories..."
                          value={dropdownSearch}
                          onChange={(e) => setDropdownSearch(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-neutral-200 text-xs bg-neutral-50 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-brand-500"
                        />
                      </div>
                    </div>

                    <div className="max-h-60 overflow-y-auto space-y-0.5 pr-0.5">
                      {/* All Products Option */}
                      <button
                        type="button"
                        onClick={() => {
                          setSearchParams({});
                          setDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                          categoryFilter === 'all'
                            ? 'bg-brand-50 text-brand-700 font-bold'
                            : 'text-neutral-700 hover:bg-neutral-100'
                        }`}
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <LayoutGrid className="h-4 w-4 text-neutral-500 shrink-0" />
                          <span>All Products</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-[10px] text-neutral-400 font-mono">({products.length})</span>
                          {categoryFilter === 'all' && <Check className="h-3.5 w-3.5 text-brand-600 ml-1" />}
                        </div>
                      </button>

                      {/* Filtered Categories */}
                      {categories
                        .filter(c => c.name.toLowerCase().includes(dropdownSearch.toLowerCase()))
                        .map((cat) => {
                          const Icon = categoryIcons[cat.slug] || LayoutGrid;
                          const isActive = categoryFilter === cat.slug;
                          const catProductCount = products.filter(p => p.categoryId?.slug === cat.slug || p.category === cat.slug).length;
                          return (
                            <button
                              key={cat._id || cat.slug}
                              type="button"
                              onClick={() => {
                                setSearchParams({ category: cat.slug });
                                setDropdownOpen(false);
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                                isActive
                                  ? 'bg-brand-50 text-brand-700 font-bold'
                                  : 'text-neutral-700 hover:bg-neutral-100'
                              }`}
                            >
                              <div className="flex items-center space-x-2 truncate">
                                <Icon className="h-4 w-4 text-neutral-500 shrink-0" />
                                <span className="truncate">{cat.name}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <span className="text-[10px] text-neutral-400 font-mono">({catProductCount})</span>
                                {isActive && <Check className="h-3.5 w-3.5 text-brand-600 ml-1" />}
                              </div>
                            </button>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>

              {/* Category Pills Row for Fast Switching */}
              <div className="flex items-center space-x-2 shrink-0">
                {categories.map((cat) => {
                  const Icon = categoryIcons[cat.slug] || LayoutGrid;
                  const isActive = categoryFilter === cat.slug;
                  return (
                    <button
                      key={cat._id || cat.slug}
                      type="button"
                      onClick={() => setSearchParams({ category: cat.slug })}
                      className={`inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                        isActive
                          ? 'bg-brand-600 text-white border-brand-600 shadow-sm font-bold'
                          : 'bg-neutral-100 text-neutral-700 border-neutral-200 hover:bg-neutral-200'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{cat.name}</span>
                    </button>
                  );
                })}
              </div>

            </div>

            {/* Search Input & Extra Actions */}
            <div className="flex items-center space-x-3 shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search by name, price, category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-2 rounded-xl border border-neutral-300 bg-white text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all w-56 sm:w-64"
                />
              </div>

              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-neutral-300 bg-white text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors shadow-sm"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span>Filters</span>
              </button>
            </div>

          </div>

          {/* Active Filter Chips */}
          {(categoryFilter !== 'all' || searchQuery) && (
            <div className="mt-3 flex items-center space-x-2">
              <span className="text-[10px] text-neutral-500 font-semibold">Active filters:</span>
              {categoryFilter !== 'all' && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-brand-50 border border-brand-200 text-[10px] font-bold text-brand-700">
                  Category: {currentCategory.name}
                  <button type="button" onClick={() => setSearchParams({})} className="ml-1 text-brand-500 hover:text-brand-900">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-neutral-100 border border-neutral-200 text-[10px] font-bold text-neutral-700">
                  Search: &quot;{searchQuery}&quot;
                  <button type="button" onClick={() => setSearchQuery('')} className="ml-1 text-neutral-500 hover:text-neutral-900">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              <button type="button" onClick={clearFilters} className="text-[10px] text-neutral-600 hover:text-neutral-900 underline font-semibold">
                Clear all
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Store Products Grid */}
      <section className="py-12">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-600" />
              <span className="text-xs text-neutral-500 font-medium">Loading catalog products...</span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-3xl border border-neutral-200 shadow-sm p-8 max-w-md mx-auto space-y-3">
              <p className="text-sm text-neutral-600 font-medium">No products found matching your search criteria.</p>
              <button
                type="button"
                onClick={clearFilters}
                className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-brand-600 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredProducts.map((product) => {
                const watched = isInWatchlist(product._id);
                return (
                  <div key={product._id} className="group bg-white rounded-2xl border border-neutral-200/90 overflow-hidden hover:shadow-xl hover:border-neutral-300 transition-all duration-300 flex flex-col justify-between">
                    
                    {/* Thumbnail + Overlays */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
                      <img
                        src={product.thumbnail?.url || product.image}
                        alt={product.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80'; }}
                      />

                      {/* Category Badge */}
                      <div className="absolute top-3 left-3">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-neutral-900/80 backdrop-blur-md text-[10px] font-bold text-white shadow-sm">
                          {product.categoryId?.name || product.category || 'Digital Asset'}
                        </span>
                      </div>

                      {/* Top Right Action Stack: Watchlist Heart Icon + Preview Eye Icon (Directly Underneath) */}
                      <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
                        <button
                          type="button"
                          onClick={() => toggleWatchlist(product._id)}
                          className={`p-2 rounded-full backdrop-blur-md shadow-md transition-all transform hover:scale-110 ${
                            watched
                              ? 'bg-red-50 text-red-600 border border-red-200'
                              : 'bg-white/90 text-neutral-700 hover:text-red-600 border border-neutral-200/80 hover:bg-white'
                          }`}
                          title={watched ? 'Remove from Watchlist' : 'Add to Watchlist'}
                        >
                          <Heart className={`h-3.5 w-3.5 ${watched ? 'fill-current' : ''}`} />
                        </button>

                        {/* Preview Icon Button directly bottom of watchlist icon */}
                        <button
                          type="button"
                          onClick={() => setPreviewProduct(product)}
                          className="p-2 rounded-full bg-white/90 hover:bg-neutral-900 text-neutral-700 hover:text-white border border-neutral-200/80 backdrop-blur-md shadow-md transition-all transform hover:scale-110"
                          title="Website Full View Live Preview"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <h3 className="text-sm font-bold text-neutral-900 line-clamp-1 group-hover:text-brand-600 transition-colors">
                          {product.name}
                        </h3>
                        <p className="mt-1.5 text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                          {product.tagline || product.shortDescription || product.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
                        <div className="flex items-baseline space-x-1.5">
                          <span className="text-base font-extrabold text-neutral-900">
                            ₹{(product.sellingPrice || product.price)?.toLocaleString()}
                          </span>
                          {product.compareAtPrice && product.compareAtPrice > (product.sellingPrice || product.price) && (
                            <span className="text-xs text-neutral-400 line-through">
                              ₹{product.compareAtPrice.toLocaleString()}
                            </span>
                          )}
                        </div>

                        {/* Action buttons: View details & Add to cart */}
                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/products/${product.slug || product._id}`}
                            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold transition-colors"
                          >
                            <span>Details</span>
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleAddToCart(product)}
                            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all shadow-md shadow-brand-600/20"
                          >
                            <ShoppingCart className="h-3.5 w-3.5" />
                            <span>Add</span>
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ProductListing;
