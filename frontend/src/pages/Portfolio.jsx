import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import client from '../api/client';
import { useWatchlist } from '../context/WatchlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import LivePreviewModal from '../components/common/LivePreviewModal';
import ProductCardImageCarousel from '../components/common/ProductCardImageCarousel';
import { Eye, Heart, ArrowRight, Zap, BookOpen, Monitor, Palette, Sparkles, ExternalLink, X, Menu, ShoppingCart } from 'lucide-react';

const Portfolio = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewProduct, setPreviewProduct] = useState(null);
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const { addToCart } = useCart();
  const { user, openAuthModal } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsRes = await client.get('/api/public/products?limit=50&category=portfolio');

        let allProds = [];
        if (productsRes.data?.success && productsRes.data?.data?.products) {
          allProds = productsRes.data.data.products;
        } else if (productsRes.data?.success && Array.isArray(productsRes.data.data)) {
          allProds = productsRes.data.data;
        }

        setProducts(allProds);
      } catch (err) {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredProducts = products;

  const handleAddToCart = (product) => {
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

  return (
    <div>
      {/* Hero */}
      <section className="py-16 sm:py-20 bg-neutral-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-brand-600">
              PORTFOLIO
            </h1>
          </div>
        </div>
      </section>

      {/* Products Grid for Selected Category */}
      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">
                Portfolio
              </h2>
              <p className="text-sm text-neutral-500 mt-1">
                {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-neutral-900"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-24 rounded-2xl bg-neutral-50 border border-neutral-200">
              <Zap className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-neutral-900">No products found</h3>
              <p className="text-neutral-500 text-sm mt-2">Check back later for new additions.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product) => {
                const watched = isInWatchlist(product._id);
                return (
                  <div key={product._id} className="group bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
                    <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
                      <ProductCardImageCarousel product={product} />
                      <div className="absolute top-3 left-3 z-10">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-xs font-medium text-neutral-700">
                          {product.categoryId?.name || product.category}
                        </span>
                      </div>

                      {/* Action Icon Stack (Watchlist Heart + Preview Eye Icon Below) */}
                      <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
                        <button
                          type="button"
                          onClick={() => toggleWatchlist(product._id)}
                          className={`p-2 rounded-full backdrop-blur-sm shadow-md transition-colors ${
                            watched
                              ? 'bg-red-50 text-red-600'
                              : 'bg-white/90 text-neutral-600 hover:text-red-600'
                          }`}
                          title={watched ? 'Remove from Watchlist' : 'Add to Watchlist'}
                        >
                          <Heart className={`h-4 w-4 ${watched ? 'fill-current' : ''}`} />
                        </button>

                        <button
                          type="button"
                          onClick={() => setPreviewProduct(product)}
                          className="p-2 rounded-full bg-white/90 hover:bg-neutral-900 text-neutral-600 hover:text-white backdrop-blur-sm shadow-md transition-colors"
                          title="Website Full View Live Preview"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-neutral-900 line-clamp-1 group-hover:text-neutral-600 transition-colors">
                          {product.name}
                        </h3>
                        <p className="mt-2 text-sm text-neutral-500 line-clamp-2">
                          {product.shortDescription || product.description}
                        </p>
                        <div className="mt-4 flex items-baseline justify-between gap-2">
                          <div className="flex items-baseline gap-2">
                            <span className="text-lg font-black text-neutral-900">
                              ₹{(product.sellingPrice || product.price)?.toLocaleString()}
                            </span>
                            {product.compareAtPrice && product.compareAtPrice > (product.sellingPrice || product.price) && (
                              <span className="text-xs text-neutral-400 line-through">
                                ₹{product.compareAtPrice.toLocaleString()}
                              </span>
                            )}
                          </div>
                          {product.compareAtPrice && product.compareAtPrice > (product.sellingPrice || product.price) && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[10px] font-extrabold">
                              {Math.round(((product.compareAtPrice - (product.sellingPrice || product.price)) / product.compareAtPrice) * 100)}% OFF
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons: Details, Add to Cart & Buy Now */}
                      <div className="mt-5 pt-3 border-t border-neutral-100 grid grid-cols-12 gap-1.5">
                        <Link
                          to={`/products/${product.slug || product._id}`}
                          className="col-span-3 inline-flex items-center justify-center px-2 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 hover:text-neutral-900 text-xs font-semibold transition-colors"
                        >
                          <span>Details</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleAddToCart(product)}
                          className="col-span-4 inline-flex items-center justify-center gap-1 rounded-xl bg-neutral-900 hover:bg-neutral-800 px-2.5 py-2 text-xs font-bold text-white transition-all shadow-sm"
                        >
                          <ShoppingCart className="h-3.5 w-3.5" />
                          <span>Add</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleBuyNow(product)}
                          className="col-span-5 inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-brand-600 hover:from-orange-600 hover:to-brand-700 px-3 py-2 text-xs font-black text-white transition-all shadow-md shadow-orange-500/20"
                        >
                          <Zap className="h-3.5 w-3.5 fill-current" />
                          <span>Buy Now</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Live Website Full View Preview Modal */}
      <LivePreviewModal
        product={previewProduct}
        isOpen={!!previewProduct}
        onClose={() => setPreviewProduct(null)}
      />
    </div>
  );
};

export default Portfolio;
