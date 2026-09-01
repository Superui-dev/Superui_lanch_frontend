import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import { useCart } from '../../context/CartContext';
import { Heart, Trash2, ShoppingCart, ArrowRight, Eye, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const res = await client.get('/api/wishlist');
        if (res.data?.success && res.data?.data) {
          setWishlist(res.data.data.productIds || []);
        } else {
          throw new Error('Wishlist empty');
        }
      } catch (err) {
        console.warn('API error or empty wishlist.');
        setWishlist([]);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, []);

  const handleRemove = async (id) => {
    try {
      await client.delete(`/api/wishlist/remove/${id}`);
      setWishlist(prev => prev.filter(item => item._id !== id));
    } catch (err) {
      console.error('Failed to remove from wishlist');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-neutral-900"></div>
      </div>
    );
  }

  return (
    <div>
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 flex items-center gap-2">
                <Heart className="h-7 w-7 text-red-500" />
                My Watchlist
              </h1>
              <p className="text-neutral-600 mt-2">
                {wishlist.length === 0 
                  ? 'You have no saved items yet.' 
                  : `You have ${wishlist.length} item${wishlist.length !== 1 ? 's' : ''} in your watchlist.`
                }
              </p>
            </div>
          </div>

          {wishlist.length === 0 ? (
            <div className="text-center py-20 rounded-2xl bg-neutral-50 border border-neutral-200">
              <Heart className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-neutral-900">No items saved</h3>
              <p className="text-neutral-500 text-sm mt-2 max-w-sm mx-auto">
                Browse our catalog and save products you like to your watchlist.
              </p>
              <Link
                to="/products"
                className="mt-6 inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-brand-600 text-white text-sm font-semibold hover:bg-neutral-800 transition-colors"
              >
                <span>Browse Products</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {wishlist.map((item) => (
                <div key={item._id} className="bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:shadow-md transition-all duration-300">
                  <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
                    <img src={item.thumbnail?.url || item.image} alt={item.name} className="h-full w-full object-cover" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80'; }} />
                    <button
                      type="button"
                      onClick={() => handleRemove(item._id)}
                      className="absolute top-3 right-3 p-2 rounded-full bg-white/90 text-neutral-600 hover:text-red-600 backdrop-blur-sm transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="p-6">
                    <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      {item.categoryId?.name || item.category}
                    </span>
                    <Link to={`/products/${item.slug}`}>
                      <h3 className="mt-2 text-lg font-semibold text-neutral-900 line-clamp-1 hover:text-neutral-600 transition-colors">
                        {item.name}
                      </h3>
                    </Link>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-lg font-bold text-neutral-900">
                        INR {item.sellingPrice?.toLocaleString() || item.price?.toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-4 flex items-center space-x-3">
                      <Link
                        to={`/products/${item.slug}`}
                        className="flex-1 flex items-center justify-center space-x-1.5 rounded-full bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800 transition-colors"
                      >
                        <span>View Details</span>
                      </Link>
                      <button
                        onClick={() => addToCart({
                          _id: item._id,
                          name: item.name,
                          price: item.sellingPrice || item.price,
                          image: item.thumbnail?.url || item.image
                        })}
                        className="rounded-full border border-neutral-200 p-2.5 text-neutral-700 hover:bg-neutral-50 transition-colors"
                      >
                        <ShoppingCart className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Wishlist;
