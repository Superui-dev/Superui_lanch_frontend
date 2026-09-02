import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, Mail, Lock, LogIn } from 'lucide-react';
import BrandLogo from './BrandLogo';

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { customerLogin } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!email || !password) {
        throw new Error('Please enter your email and password.');
      }
      await customerLogin(email, password);
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-neutral-950/70 backdrop-blur-md overflow-y-auto min-h-screen">
      <div className="relative w-full max-w-md max-h-[90vh] flex flex-col my-auto bg-white border border-neutral-200/90 rounded-3xl shadow-2xl overflow-hidden text-neutral-900 animate-fade-in">
        
        {/* Header decoration with animated multi-color neon orange gradient */}
        <div className="bg-gradient-to-r from-[#ff5100] via-[#ff7700] via-[#ff3d00] via-[#ff0055] to-[#ff6b00] bg-[length:200%_200%] animate-gradient p-5 sm:p-6 text-white text-center relative shrink-0 overflow-hidden shadow-inner">
          {/* Subtle background glow element */}
          <div className="absolute -top-12 -left-12 w-28 h-28 rounded-full bg-white/10 blur-xl pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-28 h-28 rounded-full bg-amber-400/20 blur-xl pointer-events-none" />

          {/* High-visibility Close Button */}
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-4 right-4 p-2 rounded-full bg-white/25 hover:bg-white text-white hover:text-neutral-900 shadow-md backdrop-blur-md border border-white/40 transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer z-10"
          >
            <X className="h-4 w-4 stroke-[2.5]" />
          </button>
          
          {/* Logo with White Rounded Background */}
          <div className="inline-flex items-center justify-center p-2.5 rounded-2xl bg-white shadow-lg border border-white/50 mb-3.5 hover:scale-105 transition-transform duration-200">
            <BrandLogo className="h-7 w-7 object-contain" hideText />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-sm">
            Welcome to SuperUI
          </h2>
          <p className="text-[11px] sm:text-xs text-white/95 font-medium mt-1 drop-shadow-sm">
            Access premium templates, e-books, and instant order downloads
          </p>
        </div>

        {/* Body Form */}
        <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(92vh-140px)]">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-600 flex items-start gap-2">
              <span className="shrink-0 mt-0.5">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type="email"
                  required
                  placeholder="customer@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-300 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-300 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-colors"
                />
              </div>
            </div>

            {/* Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-neutral-900 hover:bg-brand-600 text-white text-xs font-bold shadow-lg transition-all hover:shadow-brand-500/20 disabled:opacity-50 mt-2"
            >
              <LogIn className="h-4 w-4" />
              <span>{loading ? 'Processing...' : 'Sign In To Account'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
