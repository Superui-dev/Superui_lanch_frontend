import React, { useState } from 'react';
import { X, Star, Heart, CheckCircle2, MessageSquare, ShieldCheck, Send } from 'lucide-react';
import client from '../../api/client';

const CustomerFeedbackModal = ({ isOpen, onClose, orderId, productName, productId }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [comment, setComment] = useState('');
  const [recommend, setRecommend] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await client.post('/api/public/feedback', { 
        name: name || 'Valued Customer', 
        email: email || 'customer@superui.in', 
        rating,
        comment,
        recommend,
        orderId: orderId || '',
        productId: productId || null
      });
      setSuccess(true);
    } catch (err) {
      try {
        await client.post('/api/contact', { 
          name: name || 'Valued Customer', 
          email: email || 'customer@superui.in', 
          subject: 'Customer Feedback', 
          message: `[${rating}/5 Stars]\n${comment}` 
        });
        setSuccess(true);
      } catch (fallbackErr) {
        setError('Failed to submit feedback. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl border border-neutral-200/90 shadow-2xl overflow-hidden p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {success ? (
          <div className="text-center py-10 space-y-4">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-sm">
                <ShieldCheck className="h-10 w-10" />
              </div>
            </div>
            <h3 className="text-2xl font-extrabold text-neutral-900">Thank You For Your Feedback!</h3>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed max-w-sm mx-auto font-medium">
              Your review has been submitted to the SuperUI team. We appreciate your support!
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-6 py-3 rounded-2xl bg-neutral-900 text-white text-xs font-bold shadow-md hover:bg-brand-600 transition-all"
            >
              Close & Continue
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-600 text-[11px] font-bold">
                <Heart className="h-3.5 w-3.5 fill-current" />
                <span>Post-Payment Customer Experience</span>
              </div>
              <h2 className="text-2xl font-extrabold text-neutral-900">Share Your Experience</h2>
              <p className="text-xs text-neutral-500 font-medium">
                {productName ? `How was your experience with ${productName}?` : 'How was your checkout and download experience with SuperUI?'}
              </p>
            </div>

            {/* Interactive 5 Star Selector */}
            <div className="flex flex-col items-center justify-center space-y-2 py-2">
              <span className="text-xs font-bold text-neutral-700">Overall Rating</span>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 transition-transform hover:scale-125 focus:outline-none"
                  >
                    <Star
                      className={`h-8 w-8 transition-colors ${
                        (hoverRating || rating) >= star
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-neutral-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-xs font-bold text-amber-500">{rating} out of 5 Stars</span>
            </div>

            {/* Customer Details */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1.5">Your Name (Optional)</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Rahul Sharma"
                    className="w-full px-4 py-3 rounded-2xl border border-neutral-200 bg-neutral-50 text-xs font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-brand-500 shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1.5">Email Address (Optional)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="rahul@example.com"
                    className="w-full px-4 py-3 rounded-2xl border border-neutral-200 bg-neutral-50 text-xs font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-brand-500 shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">Detailed Review & Comments *</label>
                <textarea
                  required
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What did you like about the code quality, template design, or Razorpay checkout experience?"
                  className="w-full px-4 py-3 rounded-2xl border border-neutral-200 bg-neutral-50 text-xs font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-brand-500 shadow-sm resize-none"
                />
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={recommend}
                  onChange={(e) => setRecommend(e.target.checked)}
                  className="h-4 w-4 rounded border-neutral-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                />
                <span className="text-xs font-semibold text-neutral-700">I recommend SuperUI digital assets to other developers</span>
              </label>
            </div>

            {error && <p className="text-xs font-bold text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-neutral-900 hover:bg-brand-600 text-white text-xs font-extrabold shadow-xl transition-all disabled:opacity-50 cursor-pointer"
            >
              <Send className="h-4 w-4" />
              <span>{loading ? 'Submitting Review...' : 'Submit Feedback'}</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
};

export default CustomerFeedbackModal;
