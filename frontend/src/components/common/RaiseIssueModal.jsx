import React, { useState } from 'react';
import { X, AlertCircle, ShieldCheck, Send, HelpCircle, LifeBuoy } from 'lucide-react';
import client from '../../api/client';

const RaiseIssueModal = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [issueType, setIssueType] = useState('Download Issue');
  const [orderId, setOrderId] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await client.post('/api/public/issues', {
        name: name || 'Valued Customer',
        email,
        issueType,
        orderId,
        subject,
        description
      });
      setSuccess(true);
    } catch (err) {
      try {
        await client.post('/api/contact', {
          name: name || 'Valued Customer',
          email,
          subject: `[ISSUE: ${issueType}] ${subject}`,
          message: `Order ID: ${orderId}\n\n${description}`
        });
        setSuccess(true);
      } catch (fallbackErr) {
        setError('Failed to log issue. Please try again or email hello.superui@gmail.com directly.');
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
            <h3 className="text-2xl font-extrabold text-neutral-900">Support Ticket Logged!</h3>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed max-w-sm mx-auto font-medium">
              Your support ticket has been submitted to the SuperUI engineering team. We will contact your email within 2 hours.
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-6 py-3 rounded-2xl bg-neutral-900 text-white text-xs font-bold shadow-md hover:bg-brand-600 transition-all"
            >
              Close Window
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 text-[11px] font-bold">
                <LifeBuoy className="h-3.5 w-3.5" />
                <span>Priority Customer Helpdesk Ticket</span>
              </div>
              <h2 className="text-2xl font-extrabold text-neutral-900">Raise a Support Issue</h2>
              <p className="text-xs text-neutral-500 font-medium">
                Experiencing download, payment, or code integration problems? Log your issue below.
              </p>
            </div>

            {/* Issue Category Dropdown */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
                Issue Category *
              </label>
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 bg-neutral-50 text-xs font-bold text-neutral-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-brand-500 shadow-sm"
              >
                <option value="Download Issue">Download Issue / Missing Token</option>
                <option value="Payment Problem">Payment Problem / Razorpay Verification</option>
                <option value="Bug Report">Code Bug Report / Integration Question</option>
                <option value="Custom Order">Custom License / Enterprise Request</option>
                <option value="General Support">General Account Support</option>
              </select>
            </div>

            {/* Inputs */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1.5">Your Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="customer@example.com"
                    className="w-full px-4 py-3 rounded-2xl border border-neutral-200 bg-neutral-50 text-xs font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-brand-500 shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1.5">Order ID (Optional)</label>
                  <input
                    type="text"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="ORD_SUP_84920"
                    className="w-full px-4 py-3 rounded-2xl border border-neutral-200 bg-neutral-50 text-xs font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-brand-500 shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">Issue Subject *</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., Cannot extract zip archive or download link expired"
                  className="w-full px-4 py-3 rounded-2xl border border-neutral-200 bg-neutral-50 text-xs font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-brand-500 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">Detailed Description *</label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please describe what happened, error message, or how we can assist..."
                  className="w-full px-4 py-3 rounded-2xl border border-neutral-200 bg-neutral-50 text-xs font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-brand-500 shadow-sm resize-none"
                />
              </div>
            </div>

            {error && <p className="text-xs font-bold text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-neutral-900 hover:bg-red-600 text-white text-xs font-extrabold shadow-xl transition-all disabled:opacity-50 cursor-pointer"
            >
              <Send className="h-4 w-4" />
              <span>{loading ? 'Submitting Ticket...' : 'Submit Support Issue'}</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
};

export default RaiseIssueModal;
