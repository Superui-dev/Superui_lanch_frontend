import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import AdminLayout from '../../components/admin/AdminLayout';
import { 
  Heart, Star, Search, Trash2, ShieldCheck, CheckCircle2, 
  MessageSquare, RefreshCw, Filter, ThumbsUp, Mail, User, Clock, Award
} from 'lucide-react';

const AdminFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [stats, setStats] = useState({ total: 0, avgRating: 5.0, recommendPercentage: 100 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (ratingFilter) params.rating = ratingFilter;

      const res = await client.get('/api/admin/feedback', { params, silent: true });
      if (res.data?.success && res.data?.data) {
        setFeedbacks(res.data.data.feedbacks || []);
        if (res.data.data.stats) {
          setStats(res.data.data.stats);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch admin feedback entries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, [search, ratingFilter]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer feedback entry?')) return;
    setDeleteLoadingId(id);
    try {
      await client.delete(`/api/admin/feedback/${id}`);
      setFeedbacks(prev => prev.filter(f => f._id !== id));
    } catch (err) {
      alert('Failed to delete feedback');
    } finally {
      setDeleteLoadingId(null);
    }
  };

  const handleToggleFeature = async (id) => {
    try {
      const res = await client.patch(`/api/admin/feedback/${id}/toggle-feature`);
      if (res.data?.success && res.data?.data) {
        setFeedbacks(prev => prev.map(f => f._id === id ? res.data.data : f));
      }
    } catch (err) {
      alert('Failed to toggle featured status');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8 p-4 sm:p-8 max-w-7xl mx-auto">
        
        {/* Top Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-sm">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-bold border border-red-200">
              <Heart className="h-3.5 w-3.5 fill-current" />
              <span>Storefront Customer Reviews & Feedback</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
              Customer Feedback & Reviews
            </h1>
            <p className="text-xs text-neutral-500 font-medium">
              Review and moderate product ratings, feedback submissions, and client testimonials.
            </p>
          </div>

          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="px-4 py-2.5 rounded-2xl bg-neutral-900 text-white text-xs font-bold shadow-md transition-all self-start md:self-auto cursor-pointer focus:outline-none"
          >
            <option value="">All Ratings</option>
            <option value="5">5 Stars Only</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>

      </div>

      {/* Feedback Items List */}
      <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-600"></div>
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="text-center py-20 space-y-3 p-6">
            <div className="p-4 rounded-full bg-neutral-100 text-neutral-400 inline-block">
              <MessageSquare className="h-8 w-8" />
            </div>
            <h3 className="text-base font-bold text-neutral-900">No Feedback Entries Found</h3>
            <p className="text-xs text-neutral-500">Customer feedback submitted post-checkout will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {feedbacks.map((item) => (
              <div key={item._id} className="p-6 hover:bg-neutral-50/60 transition-colors space-y-4">
                
                {/* Item Top Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  
                  {/* User Avatar & Info */}
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-neutral-900 text-white font-extrabold text-xs flex items-center justify-center">
                      {item.name ? item.name.charAt(0).toUpperCase() : 'C'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-extrabold text-neutral-900">{item.name || 'Valued Customer'}</h4>
                        {item.recommend && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                            Recommended
                          </span>
                        )}
                        {item.featured && (
                          <span className="px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 text-[10px] font-bold flex items-center gap-1">
                            <Award className="h-3 w-3" />
                            <span>Featured</span>
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-neutral-400 font-medium">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          <span className="text-neutral-600">{item.email}</span>
                        </span>
                        {item.orderId && (
                          <span className="font-mono text-[10px] bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-700">
                            Order: #{item.orderId}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Rating & Actions */}
                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    {/* Stars */}
                    <div className="flex items-center gap-1 text-amber-400 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${i < item.rating ? 'fill-current' : 'text-neutral-200 fill-none'}`}
                        />
                      ))}
                      <span className="text-xs font-bold text-amber-700 ml-1">{item.rating}.0</span>
                    </div>

                    {/* Toggle Feature Button */}
                    <button
                      onClick={() => handleToggleFeature(item._id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                        item.featured
                          ? 'bg-brand-50 text-brand-700 border-brand-200 hover:bg-brand-100'
                          : 'bg-neutral-100 text-neutral-700 border-neutral-200 hover:bg-neutral-200'
                      }`}
                    >
                      {item.featured ? 'Unfeature' : 'Feature'}
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(item._id)}
                      disabled={deleteLoadingId === item._id}
                      className="p-2 rounded-xl border border-neutral-200 text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete Feedback"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                </div>

                {/* Comment Body */}
                <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed font-medium bg-neutral-50/80 p-4 rounded-2xl border border-neutral-100">
                  "{item.comment}"
                </p>

                {/* Timestamp */}
                <div className="flex items-center justify-between text-[11px] text-neutral-400 font-medium pt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>Submitted on {new Date(item.createdAt).toLocaleString()}</span>
                  </span>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminFeedback;
