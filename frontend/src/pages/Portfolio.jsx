import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import client from '../api/client';
import { useWatchlist } from '../context/WatchlistContext';
import { useCart } from '../context/CartContext';
import LivePreviewModal from '../components/common/LivePreviewModal';
import { Eye, Heart, ArrowRight, Zap, BookOpen, Monitor, Palette, Sparkles, ExternalLink, X, Menu, ShoppingCart } from 'lucide-react';

const Portfolio = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewProduct, setPreviewProduct] = useState(null);
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsRes = await client.get('/api/public/products?limit=50');

        let allProds = [];
        if (productsRes.data?.success && productsRes.data?.data?.products) {
          allProds = productsRes.data.data.products;
        } else if (productsRes.data?.success && Array.isArray(productsRes.data.data)) {
          allProds = productsRes.data.data;
        }

        const portfolioProds = allProds.filter(p => {
          const nameMatch = p.name?.toLowerCase().includes('portfolio');
          const descMatch = p.shortDescription?.toLowerCase().includes('portfolio') || p.description?.toLowerCase().includes('portfolio');
          const catMatch = p.categoryId?.slug === 'websites' || p.category === 'websites';
          return nameMatch || descMatch || catMatch;
        });

        setProducts(portfolioProds);
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
                      <img
                        src={product.thumbnail?.url || product.image}
                        alt={product.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3">
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
                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-baseline space-x-2">
                            <span className="text-lg font-bold text-neutral-900">
                              INR {product.sellingPrice?.toLocaleString() || product.price?.toLocaleString()}
                            </span>
                            {product.compareAtPrice && (
                              <span className="text-sm text-neutral-400 line-through">
                                INR {product.compareAtPrice.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons: Add to Cart & Buy Now */}
                      <div className="mt-6 flex items-center space-x-2.5">
                        <button
                          type="button"
                          onClick={() => handleAddToCart(product)}
                          className="flex-1 inline-flex items-center justify-center space-x-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 px-4 py-2.5 text-xs font-bold text-white transition-all shadow-sm"
                        >
                          <ShoppingCart className="h-4 w-4" />
                          <span>Add to Cart</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleBuyNow(product)}
                          className="flex-1 inline-flex items-center justify-center space-x-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 px-4 py-2.5 text-xs font-bold text-white transition-all shadow-md shadow-brand-600/20"
                        >
                          <Zap className="h-4 w-4" />
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
