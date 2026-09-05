import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import client from '../api/client';
import { useCart } from '../context/CartContext';
import { useWatchlist } from '../context/WatchlistContext';
import { ShoppingCart, Check, ExternalLink, FileText, ChevronLeft, Heart, Zap, Shield, ArrowRight, Star, Eye } from 'lucide-react';

const ProductDetail = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { toggleWatchlist, isInWatchlist } = useWatchlist();
   const [relatedProducts, setRelatedProducts] = useState([]);
   const [activeImageIdx, setActiveImageIdx] = useState(0);
   const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await client.get(`/api/public/products/${slug}`);
        if (res.data?.success && res.data?.data) {
          const prod = res.data.data;
          setProduct(prod);
          setActiveImageIdx(0);

          // Fetch related products (same category or fallback list)
          try {
            const catSlug = prod.categoryId?.slug || prod.category;
            let fetchedRelated = [];
            if (catSlug) {
              const relRes = await client.get(`/api/public/products?category=${catSlug}&limit=5`);
              if (relRes.data?.success && relRes.data?.data?.products) {
                fetchedRelated = relRes.data.data.products.filter(p => p._id !== prod._id);
              }
            }
            if (fetchedRelated.length < 3) {
              const fallbackRes = await client.get('/api/public/products?limit=6');
              if (fallbackRes.data?.success && fallbackRes.data?.data?.products) {
                const fallbackList = fallbackRes.data.data.products.filter(p => p._id !== prod._id);
                fetchedRelated = [...fetchedRelated, ...fallbackList];
              }
            }
            const finalRelated = Array.from(new Map(fetchedRelated.map(p => [p._id, p])).values()).slice(0, 3);
            setRelatedProducts(finalRelated);
          } catch (relErr) {
            // Quiet fallback
          }

        } else {
          throw new Error('Not found');
        }
      } catch (err) {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-neutral-900"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-neutral-900">Product not found</h2>
          <Link to="/products" className="mt-4 inline-block text-neutral-900 hover:text-neutral-600">
            ← Back to products
          </Link>
        </div>
      </div>
    );
  }

  const watched = isInWatchlist(product._id);

  return (
    <div>
      {/* Breadcrumb */}
      <section className="py-6 border-b border-neutral-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-neutral-500 hover:text-neutral-900 transition-colors">Home</Link>
            <span className="text-neutral-400">/</span>
            <Link to="/products" className="text-neutral-500 hover:text-neutral-900 transition-colors">Products</Link>
            <span className="text-neutral-400">/</span>
            <span className="text-neutral-900 font-medium">{product.name}</span>
          </nav>
        </div>
      </section>

      {/* Product Detail */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-neutral-100 border border-neutral-200">
                <img
                  src={(() => {
                    const imgs = product.images?.length > 0
                      ? product.images.map(i => typeof i === 'string' ? i : i.url)
                      : [product.thumbnail?.url, product.image].filter(Boolean);
                    return imgs[activeImageIdx] || imgs[0] || '';
                  })()}
                  alt={product.name}
                  className="h-full w-full object-cover"
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80'; }}
                />
              </div>
              {(() => {
                const imgs = product.images?.length > 0
                  ? product.images.map(i => typeof i === 'string' ? i : i.url)
                  : [product.thumbnail?.url, product.image].filter(Boolean);
                return imgs.length > 1 ? (
                  <div className="grid grid-cols-5 gap-3">
                    {imgs.slice(0, 5).map((img, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setActiveImageIdx(idx)}
                        className={`aspect-square rounded-xl overflow-hidden border-2 transition-colors ${
                          activeImageIdx === idx ? 'border-neutral-900' : 'border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        <img src={img} alt="" className="h-full w-full object-cover" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80'; }} />
                      </button>
                    ))}
                  </div>
                ) : null;
              })()}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-neutral-100 text-xs font-medium text-neutral-700 uppercase tracking-wider">
                  {product.categoryId?.name || product.category}
                </span>
                <h1 className="mt-3 text-3xl font-bold text-neutral-900 tracking-tight">{product.name}</h1>
                <div className="mt-4 flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-5 w-5 fill-neutral-900 text-neutral-900" />
                  ))}
                  <span className="ml-2 text-sm text-neutral-500">(5.0)</span>
                </div>
                <p className="mt-4 text-neutral-600 leading-relaxed">{product.description}</p>
              </div>

              <div className="flex items-baseline space-x-3">
                <span className="text-3xl font-bold text-neutral-900">
                  ₹{product.sellingPrice?.toLocaleString() || product.price?.toLocaleString()}
                </span>
                {product.compareAtPrice && (
                  <span className="text-xl text-neutral-400 line-through">
                    ₹{product.compareAtPrice.toLocaleString()}
                  </span>
                )}
                {product.compareAtPrice && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-xs font-semibold text-green-700">
                    {Math.round(((product.compareAtPrice - (product.sellingPrice || product.price)) / product.compareAtPrice) * 100)}% OFF
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-4">
                <button
                  onClick={() => addToCart({
                    _id: product._id,
                    name: product.name,
                    price: product.sellingPrice || product.price,
                    image: product.thumbnail?.url || product.image
                  })}
                  className="flex-1 flex items-center justify-center space-x-2 rounded-full bg-brand-600 px-6 py-3.5 text-sm font-semibold text-white hover:bg-brand-500 transition-colors"
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span>Add to Cart</span>
                </button>
                <button
                  onClick={() => toggleWatchlist(product._id)}
                  className={`rounded-full border p-3.5 transition-colors ${
                    watched
                      ? 'border-red-200 bg-red-50 text-red-600'
                      : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  <Heart className={`h-5 w-5 ${watched ? 'fill-current' : ''}`} />
                </button>
              </div>

              {product.features && product.features.length > 0 && (
                <div className="space-y-3 pt-6 border-t border-neutral-200">
                  <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider">
                    Features
                  </h3>
                  <ul className="space-y-2.5">
                    {product.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start space-x-2.5 text-sm text-neutral-600">
                        <Check className="h-4 w-4 text-neutral-900 mt-0.5 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {product.technologies && product.technologies.length > 0 && (
                <div className="space-y-3 pt-6 border-t border-neutral-200">
                  <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider">
                    Technologies
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.technologies.map((tech, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-3 py-1.5 rounded-full bg-neutral-100 text-xs font-medium text-neutral-700"
                      >
                        {tech.name || tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {product.requirements && product.requirements.length > 0 && (
                <div className="space-y-3 pt-6 border-t border-neutral-200">
                  <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider">
                    Requirements
                  </h3>
                  <ul className="space-y-2.5">
                    {product.requirements.map((req, idx) => (
                      <li key={idx} className="flex items-start space-x-2.5 text-xs text-neutral-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-neutral-900 mt-2 shrink-0" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-6 border-t border-neutral-200 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-neutral-500 block">Version</span>
                  <span className="font-bold text-neutral-900">{product.version || '1.0.0'}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Last Updated</span>
                  <span className="font-bold text-neutral-900">
                    {new Date(product.updatedAt || product.createdAt || Date.now()).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>

              {(product.preview?.url || (product.documentation?.enabled && product.documentation?.url)) && (
                <div className="pt-6 border-t border-neutral-200 flex flex-wrap gap-4">
                  {product.preview?.url && (
                    <a
                      href={product.preview.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 text-sm font-semibold text-neutral-900 hover:text-neutral-600 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>Live Preview</span>
                    </a>
                  )}
                  {product.documentation?.enabled && product.documentation?.url && (
                    <a
                      href={product.documentation.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 text-sm font-semibold text-neutral-900 hover:text-neutral-600 transition-colors"
                    >
                      <FileText className="h-4 w-4" />
                      <span>Documentation</span>
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <section className="py-24 bg-neutral-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-8">Related Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedProducts.map((prod, idx) => {
                const discount = prod.compareAtPrice && prod.compareAtPrice > prod.price
                  ? Math.round(((prod.compareAtPrice - prod.price) / prod.compareAtPrice) * 100)
                  : null;
                const catName = prod.categoryId?.name || 'Digital Asset';

                return (
                  <div
                    key={prod._id || idx}
                    className="group bg-white rounded-2xl border border-neutral-200/80 overflow-hidden hover:border-neutral-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* Image container */}
                      <div className="relative aspect-[16/11] overflow-hidden bg-neutral-900 group">
                        <img
                          src={prod.thumbnail?.url || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80'}
                          alt={prod.name}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute bottom-3 left-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-neutral-900/70 backdrop-blur-md text-[9px] font-bold text-white shadow-sm">
                            {catName}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 space-y-2 text-left">
                        <Link to={`/products/${prod.slug}`} className="block">
                          <h3 className="text-sm font-bold text-neutral-900 line-clamp-1 group-hover:text-brand-600 transition-colors">
                            {prod.name}
                          </h3>
                        </Link>
                        <p className="text-[11px] text-neutral-500 line-clamp-2 leading-relaxed">
                          {prod.shortDescription || 'Production ready digital asset template for developers.'}
                        </p>
                      </div>
                    </div>

                    {/* Stats & Footer */}
                    <div className="p-4 pt-0 border-t border-neutral-100 mt-2 space-y-3">
                      <div className="flex items-center justify-between text-xs pt-2">
                        {/* Author info */}
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-[10px]">
                            S
                          </div>
                          <span className="font-bold text-neutral-800 text-[11px]">SuperUI</span>
                          <span className="px-1.5 py-0.2 bg-neutral-200/80 rounded text-[9px] font-extrabold text-neutral-600 uppercase">PRO</span>
                        </div>

                        {/* Views & Likes */}
                        <div className="flex items-center gap-2 text-neutral-400 text-[11px]">
                          <span className="flex items-center gap-1" title="Watchlist Count">
                            <Heart className="h-3 w-3 fill-neutral-300" />
                            <span>{prod.watchlistCount || 0}</span>
                          </span>
                          <span className="flex items-center gap-1" title="Page Views Count">
                            <Eye className="h-3 w-3" />
                            <span>{prod.viewsCount || 0}</span>
                          </span>
                        </div>
                      </div>

                      {/* Price and Buttons */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center flex-wrap gap-1.5">
                          <span className="text-sm font-extrabold text-neutral-900">
                            ₹{(prod.price || 1499).toLocaleString()}
                          </span>
                          {prod.compareAtPrice && (
                            <span className="text-[10px] text-neutral-400 line-through">
                              ₹{prod.compareAtPrice.toLocaleString()}
                            </span>
                          )}
                          {discount && (
                            <span className="text-[10px] font-extrabold text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded-md">
                              {discount}% OFF
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          {prod.preview?.url && (
                            <a
                              href={prod.preview.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-[10px] font-bold transition-all"
                            >
                              Preview
                            </a>
                          )}
                          <button
                            onClick={() => addToCart({
                              _id: prod._id,
                              name: prod.name,
                              price: prod.price,
                              image: prod.thumbnail?.url || prod.image
                            })}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-neutral-900 hover:bg-brand-600 text-white text-[10px] font-bold transition-all shadow-sm"
                          >
                            <ShoppingCart className="h-3 w-3" />
                            <span>Add</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetail;
