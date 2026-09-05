import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, Mail, Lock, LogIn, User, Phone, ShieldCheck, Eye, EyeOff, CheckCircle2, Sparkles, UserPlus } from 'lucide-react';
import BrandLogo from './BrandLogo';

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [mode, setMode] = useState(initialMode || 'login'); // 'login' | 'signup'

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { customerLogin, customerRegister } = useAuth();

  // Synchronize mode when opened or initialMode changes
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode === 'signup' ? 'signup' : 'login');
      setError('');
      setSuccess('');
    }
  }, [isOpen, initialMode]);

  // Clear errors when switching modes
  const handleSwitchMode = (newMode) => {
    setMode(newMode);
    setError('');
    setSuccess('');
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        // Validation for registration
        if (!name.trim()) {
          throw new Error('Please enter your full name.');
        }
        if (!email.trim() || !email.includes('@')) {
          throw new Error('Please enter a valid email address.');
        }
        if (!phone.trim() || phone.replace(/\D/g, '').length < 7) {
          throw new Error('Please enter a valid cell/phone number (at least 7 digits).');
        }
        if (!password || password.length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match. Please verify your password confirmation.');
        }

        await customerRegister({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          password
        });

        setSuccess(`Account created successfully! Welcome, ${name}.`);
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        // Validation for login
        if (!email.trim() || !password) {
          throw new Error('Please enter both your email address and password.');
        }

        await customerLogin(email.trim().toLowerCase(), password);
        setSuccess('Logged in successfully!');
        setTimeout(() => {
          onClose();
        }, 800);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-neutral-950/75 backdrop-blur-md overflow-y-auto min-h-screen">
      <div className="relative w-full max-w-md max-h-[92vh] flex flex-col my-auto bg-white border border-neutral-200/90 rounded-3xl shadow-2xl overflow-hidden text-neutral-900 animate-fade-in">
        
        {/* Header decoration with animated multi-color neon gradient */}
        <div className="bg-gradient-to-r from-[#ff5100] via-[#ff7700] via-[#ff3d00] to-[#ff0055] bg-[length:200%_200%] animate-gradient p-5 sm:p-6 text-white text-center relative shrink-0 overflow-hidden shadow-inner">
          {/* Ambient glow */}
          <div className="absolute -top-12 -left-12 w-28 h-28 rounded-full bg-white/10 blur-xl pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-28 h-28 rounded-full bg-amber-400/20 blur-xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-4 right-4 p-2 rounded-full bg-white/25 hover:bg-white text-white hover:text-neutral-900 shadow-md backdrop-blur-md border border-white/40 transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer z-10"
          >
            <X className="h-4 w-4 stroke-[2.5]" />
          </button>
          
          {/* Logo */}
          <div className="inline-flex items-center justify-center p-2.5 rounded-2xl bg-white shadow-lg border border-white/50 mb-3 hover:scale-105 transition-transform duration-200">
            <BrandLogo className="h-7 w-7 object-contain" hideText />
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-sm">
            {mode === 'signup' ? 'Create Customer Account' : 'Welcome Back to SuperUI'}
          </h2>
          <p className="text-[11px] sm:text-xs text-white/95 font-medium mt-1 drop-shadow-sm max-w-xs mx-auto">
            {mode === 'signup'
              ? 'Register once to download templates, receive order invoices & licenses'
              : 'Sign in to access your purchased products & instant downloads'}
          </p>

          {/* Mode Tabs (Sign In vs Create Account) */}
          <div className="mt-4 inline-flex p-1 rounded-2xl bg-black/25 backdrop-blur-md border border-white/20 w-full max-w-xs mx-auto">
            <button
              type="button"
              onClick={() => handleSwitchMode('login')}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-neutral-900 shadow-md scale-[1.02]'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => handleSwitchMode('signup')}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'signup'
                  ? 'bg-white text-neutral-900 shadow-md scale-[1.02]'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Register</span>
            </button>
          </div>
        </div>

        {/* Body Form */}
        <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(92vh-190px)]">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-600 flex items-start gap-2 animate-fadeIn">
              <span className="shrink-0 mt-0.5">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700 flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Registration specific: Full Name */}
            {mode === 'signup' && (
              <div className="animate-fadeIn">
                <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-300 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Email Address */}
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

            {/* Registration specific: Cell Number */}
            {mode === 'signup' && (
              <div className="animate-fadeIn">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider">
                    Cell / Phone Number <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[10px] text-neutral-400 font-medium">For order alerts & SMS</span>
                </div>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    type="tel"
                    required
                    placeholder="+91 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-300 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider">
                  Password <span className="text-red-500">*</span>
                </label>
                {mode === 'signup' && (
                  <span className="text-[10px] text-neutral-400 font-medium">Min 6 characters</span>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-neutral-300 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Registration specific: Confirm Password (2-verification password) */}
            {mode === 'signup' && (
              <div className="animate-fadeIn">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider">
                    Confirm Password (2-Step Verification) <span className="text-red-500">*</span>
                  </label>
                </div>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full pl-9 pr-10 py-2.5 rounded-xl border ${
                      confirmPassword && password !== confirmPassword
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                        : 'border-neutral-300 focus:border-brand-600 focus:ring-brand-600'
                    } text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 transition-colors`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-[10px] text-red-500 font-semibold mt-1">
                    Passwords do not match
                  </p>
                )}
              </div>
            )}

            {/* Action Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-neutral-900 hover:bg-brand-600 text-white text-xs font-bold shadow-lg transition-all hover:shadow-brand-500/20 disabled:opacity-50 mt-3 cursor-pointer"
            >
              {mode === 'signup' ? (
                <>
                  <UserPlus className="h-4 w-4" />
                  <span>{loading ? 'Registering Account...' : 'Complete Registration & Sign In'}</span>
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  <span>{loading ? 'Signing In...' : 'Sign In To Account'}</span>
                </>
              )}
            </button>
          </form>

          {/* Bottom Switcher */}
          <div className="pt-3 border-t border-neutral-100 text-center">
            {mode === 'login' ? (
              <p className="text-xs text-neutral-500 font-medium">
                New customer?{' '}
                <button
                  type="button"
                  onClick={() => handleSwitchMode('signup')}
                  className="text-brand-600 font-bold hover:underline cursor-pointer ml-1"
                >
                  Register new account
                </button>
              </p>
            ) : (
              <p className="text-xs text-neutral-500 font-medium">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => handleSwitchMode('login')}
                  className="text-brand-600 font-bold hover:underline cursor-pointer ml-1"
                >
                  Sign in to your account
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
