import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import client from '../api/client';
import { useCart } from '../context/CartContext';
import { useWatchlist } from '../context/WatchlistContext';
import { useAuth } from '../context/AuthContext';
import LivePreviewModal from '../components/common/LivePreviewModal';
import ProductCardImageCarousel from '../components/common/ProductCardImageCarousel';
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
  Check,
  Phone,
  ArrowRight,
  Folder,
  Zap
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
  const navigate = useNavigate();
  const categoryFilter = searchParams.get('category') || 'all';
  const { addToCart } = useCart();
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const { openAuthModal, openBookingModal, user } = useAuth();

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

  const handleBuyNow = (product) => {
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
    navigate('/checkout');
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
          const seen = new Set();
          const unique = categoriesRes.value.data.data.filter(cat => {
            const key = String(cat._id);
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });
          setCategories(unique.sort((a, b) => (a.order || 0) - (b.order || 0)));
        } else {
          setCategories([]);
        }
      } catch (err) {
        // Fallback gracefully
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
    const matchedCat = categories.find(c => String(c._id) === String(p.categoryId?._id || p.categoryId));
    const prodCatSlug = (p.categoryId?.slug || matchedCat?.slug || (typeof p.category === 'string' ? p.category.toLowerCase().replace(/[^a-z0-9]+/g, '-') : '')).toLowerCase();
    const prodCatName = (p.categoryId?.name || matchedCat?.name || p.category || '').toLowerCase();
    const prodCatId = String(p.categoryId?._id || p.categoryId || '');
    
    const filterLower = categoryFilter.toLowerCase();
    const matchCategory = categoryFilter === 'all' 
      ? true 
      : (
          prodCatSlug === filterLower || 
          prodCatName === filterLower || 
          prodCatId === categoryFilter ||
          (matchedCat && (
            matchedCat.slug?.toLowerCase() === filterLower ||
            String(matchedCat._id) === categoryFilter ||
            matchedCat.name?.toLowerCase() === filterLower
          ))
        );
      
    const term = searchQuery.toLowerCase().trim();
    const matchQuery = !term ||
      p.name?.toLowerCase().includes(term) ||
      p.description?.toLowerCase().includes(term) ||
      p.shortDescription?.toLowerCase().includes(term) ||
      String(p.sellingPrice || p.price || '').toLowerCase().includes(term) ||
      prodCatName.includes(term);
    return matchCategory && matchQuery;
  });

  const clearFilters = () => {
    setSearchParams({});
    setSearchQuery('');
  };

  // Resolve current active category label & icon
  const currentCategory = categoryFilter === 'all'
    ? { slug: 'all', name: 'All Categories' }
    : categories.find(c => 
        (c.slug && c.slug.toLowerCase() === categoryFilter.toLowerCase()) || 
        String(c._id) === String(categoryFilter) ||
        (c.name && c.name.toLowerCase() === categoryFilter.toLowerCase())
      ) || { slug: categoryFilter, name: categoryFilter };
  
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

      {/* Category Dropdown + Search Filter Toolbar (New Unified Pattern matching 2nd Image) */}
      <section className="py-6 bg-white border-b border-neutral-200/80 sticky top-16 z-20 shadow-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-3">
          
          {/* Unified Floating Filter & Search Bar Container */}
          <div className="p-2 sm:p-2.5 rounded-3xl bg-neutral-50 border border-neutral-200/90 shadow-sm flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
            
            {/* 1. Category Custom Dropdown Selector */}
            <div className="relative shrink-0" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full md:w-auto inline-flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold shadow-sm transition-all duration-200 border border-neutral-800 min-w-[210px] cursor-pointer group"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <CurrentIcon className="h-4 w-4 text-brand-400 group-hover:text-white shrink-0 transition-colors" />
                  <span className="truncate">{currentCategory.name}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-1">
                  <span className="px-2 py-0.5 rounded-full bg-neutral-800 text-[10px] text-neutral-300 font-semibold border border-neutral-700">
                    {categoryFilter === 'all' 
                      ? (products.length > 0 ? products.length : categories.reduce((s, c) => s + (c.productCount || 0), 0))
                      : (products.length > 0 ? filteredProducts.length : (currentCategory.productCount ?? 0))
                    }
                  </span>
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 text-neutral-400 ${dropdownOpen ? 'rotate-180 text-brand-400' : ''}`} />
                </div>
              </button>

              {/* Popover Floating Panel */}
              {dropdownOpen && (
                <div className="absolute left-0 mt-2 w-72 bg-white rounded-2xl border border-neutral-200/90 shadow-2xl z-40 p-2 animate-fadeIn space-y-1">
                  
                  {/* Search inside Dropdown */}
                  <div className="p-1.5">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                      <input
                        type="text"
                        placeholder="Filter categories..."
                        value={dropdownSearch}
                        onChange={(e) => setDropdownSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-neutral-200 text-xs bg-neutral-50 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-brand-500"
                      />
                    </div>
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-0.5 pr-0.5">
                    {/* All Categories Option */}
                    <button
                      type="button"
                      onClick={() => {
                        setSearchParams({});
                        setDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                        categoryFilter === 'all'
                          ? 'bg-brand-50 text-brand-700 font-bold'
                          : 'text-neutral-700 hover:bg-neutral-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <LayoutGrid className="h-4 w-4 text-neutral-500 shrink-0" />
                        <span>All Categories</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-neutral-400 font-mono font-medium">
                          ({products.length > 0 ? products.length : categories.reduce((s, c) => s + (c.productCount || 0), 0)})
                        </span>
                        {categoryFilter === 'all' && <Check className="h-3.5 w-3.5 text-brand-600" />}
                      </div>
                    </button>

                    <div className="h-px bg-neutral-100 my-1" />

                    {/* Filtered Categories */}
                    {categories
                      .filter(c => c.name?.toLowerCase().includes(dropdownSearch.toLowerCase()))
                      .map((cat) => {
                        const Icon = categoryIcons[cat.slug] || LayoutGrid;
                        const isActive = (cat.slug && cat.slug.toLowerCase() === categoryFilter.toLowerCase()) || 
                                         String(cat._id) === String(categoryFilter) || 
                                         (cat.name && cat.name.toLowerCase() === categoryFilter.toLowerCase());
                        const catProductCount = products.length > 0
                          ? products.filter(p => {
                              const matchedProductCat = categories.find(c => String(c._id) === String(p.categoryId?._id || p.categoryId));
                              const pSlug = (p.categoryId?.slug || matchedProductCat?.slug || (typeof p.category === 'string' ? p.category.toLowerCase().replace(/[^a-z0-9]+/g, '-') : '')).toLowerCase();
                              const pName = (p.categoryId?.name || matchedProductCat?.name || p.category || '').toLowerCase();
                              const pId = String(p.categoryId?._id || p.categoryId || '');
                              return (cat.slug && pSlug === cat.slug.toLowerCase()) || 
                                     (cat.name && pName === cat.name.toLowerCase()) || 
                                     pId === String(cat._id);
                            }).length
                          : (cat.productCount ?? 0);

                        return (
                          <button
                            key={cat._id || cat.slug}
                            type="button"
                            onClick={() => {
                              setSearchParams({ category: cat.slug || cat._id });
                              setDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                              isActive
                                ? 'bg-brand-50 text-brand-700 font-bold'
                                : 'text-neutral-700 hover:bg-neutral-100'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <div
                                className="h-2.5 w-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: cat.color || '#F97316' }}
                              />
                              <span className="truncate">{cat.name}</span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0 ml-2">
                              <span className="text-[10px] text-neutral-400 font-mono font-medium">
                                ({catProductCount})
                              </span>
                              {isActive && <Check className="h-3.5 w-3.5 text-brand-600" />}
                            </div>
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>

            {/* 2. All Products Quick Reset Button */}
            <button
              type="button"
              onClick={() => {
                setSearchParams({});
                setSearchQuery('');
                setDropdownSearch('');
                setSortBy('popular');
              }}
              className={`shrink-0 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-200 border min-w-[150px] cursor-pointer ${
                categoryFilter === 'all' && !searchQuery
                  ? 'bg-brand-600 border-brand-600 text-white shadow-md hover:shadow-brand-500/20'
                  : 'bg-white border-neutral-200/90 text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5 shrink-0" />
              <span>All Products</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-mono ${
                categoryFilter === 'all' && !searchQuery
                  ? 'bg-white/20 text-white'
                  : 'bg-neutral-100 text-neutral-500'
              }`}>
                {products.length > 0 ? products.length : categories.reduce((s, c) => s + (c.productCount || 0), 0)}
              </span>
            </button>

            {/* 3. Live Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search products (e.g. templates, UI kits, dashboards, code...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-3 rounded-2xl bg-white border border-neutral-200/90 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all font-medium shadow-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* 3. Book a Free Call CTA Button */}
            <button
              onClick={openBookingModal}
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md hover:shadow-brand-500/20 transition-all duration-200 shrink-0 cursor-pointer group"
            >
              <Phone className="h-3.5 w-3.5 text-white fill-current shrink-0" />
              <span>Book a Free Call</span>
              <div className="p-1 rounded-full bg-white/20 group-hover:rotate-45 transition-transform duration-200">
                <ArrowRight className="h-3 w-3 text-white rotate-[-45deg]" />
              </div>
            </button>

          </div>

          {/* Active Filters & Results Counter Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-2 text-xs">
            <span className="text-neutral-500 font-semibold">
              Showing <strong className="text-neutral-900 font-extrabold">{filteredProducts.length}</strong> of {products.length} products
            </span>

            {(categoryFilter !== 'all' || searchQuery.trim()) && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] text-neutral-400 font-semibold">Active:</span>

                {categoryFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-[11px] font-bold">
                    <span>Category: {currentCategory.name}</span>
                    <button
                      type="button"
                      onClick={() => setSearchParams({})}
                      className="hover:text-brand-900 rounded-full p-0.5 cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}

                {searchQuery.trim() && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-700 text-[11px] font-bold">
                    <span>Search: &ldquo;{searchQuery}&rdquo;</span>
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="hover:text-neutral-900 rounded-full p-0.5 cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}

                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-[11px] font-bold text-neutral-500 hover:text-neutral-900 underline ml-1 cursor-pointer"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

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
                      <ProductCardImageCarousel product={product} />

                      {/* Category Badge */}
                      <div className="absolute top-3 left-3 z-10">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-neutral-900/80 backdrop-blur-md text-[10px] font-bold text-white shadow-sm">
                          {(() => {
                            const matchedCat = categories.find(c => String(c._id) === String(product.categoryId?._id || product.categoryId));
                            return product.categoryId?.name || matchedCat?.name || product.category || 'Digital Asset';
                          })()}
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

                      <div className="pt-3 border-t border-neutral-100 flex flex-col gap-3">
                        <div className="flex items-baseline justify-between gap-2">
                          <div className="flex items-baseline gap-2">
                            <span className="text-base sm:text-lg font-black text-neutral-900 tracking-tight">
                              ₹{(product.sellingPrice || product.price)?.toLocaleString()}
                            </span>
                            {product.compareAtPrice && product.compareAtPrice > (product.sellingPrice || product.price) && (
                              <span className="text-xs text-neutral-400 line-through">
                                ₹{product.compareAtPrice.toLocaleString()}
                              </span>
                            )}
                          </div>
                          {product.compareAtPrice && product.compareAtPrice > (product.sellingPrice || product.price) && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[10px] font-extrabold tracking-wide">
                              {Math.round(((product.compareAtPrice - (product.sellingPrice || product.price)) / product.compareAtPrice) * 100)}% OFF
                            </span>
                          )}
                        </div>

                        {/* Senior Developer 3-Action Toolbar: Details, Add to Cart, Direct Buy */}
                        <div className="grid grid-cols-12 gap-1.5 pt-1">
                          <Link
                            to={`/products/${product.slug || product._id}`}
                            className="col-span-3 inline-flex items-center justify-center px-2 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 hover:text-neutral-900 text-xs font-semibold transition-colors"
                            title="View Full Product Details"
                          >
                            <span>Details</span>
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleAddToCart(product)}
                            className="col-span-4 inline-flex items-center justify-center gap-1 px-2.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition-all shadow-sm"
                            title="Add to Shopping Cart"
                          >
                            <ShoppingCart className="h-3.5 w-3.5 shrink-0" />
                            <span>Add</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleBuyNow(product)}
                            className="col-span-5 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-brand-600 hover:from-orange-600 hover:to-brand-700 text-white text-xs font-black shadow-md shadow-orange-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                            title="Buy Now (Direct Checkout)"
                          >
                            <Zap className="h-3.5 w-3.5 fill-current shrink-0" />
                            <span>Buy Now</span>
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
