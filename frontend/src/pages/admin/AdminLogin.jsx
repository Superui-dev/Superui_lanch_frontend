import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import BrandLogo from '../../components/common/BrandLogo';
import InspectDetector from '../../components/common/InspectDetector';
import { ShieldAlert, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

import client from '../../api/client';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, mfaVerified, mfaEnrolled, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && mfaVerified) {
      navigate('/india/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, mfaVerified, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(email, password);
      
      if (!result.profile || result.profile.role !== 'admin') {
        client.post('/api/public/login-attempt', {
          email,
          status: 'UNAUTHORIZED_ATTEMPT',
          errorReason: 'Non-admin account attempted admin login'
        }).catch(() => {});
        throw new Error('Access denied. Administrator credentials required.');
      }

      if (result.mfaEnrolled) {
        navigate('/india/admin/mfa', { replace: true });
      } else {
        navigate('/india/admin/mfa-enroll', { replace: true });
      }
    } catch (err) {
      client.post('/api/public/login-attempt', {
        email,
        status: 'FAILED',
        errorReason: err.message || 'Invalid credentials'
      }).catch(() => {});

      setError(err.message || 'Invalid credentials. Access denied.');
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-neutral-0 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <InspectDetector />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-500/5 via-neutral-0 to-neutral-0 pointer-events-none"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[40vw] max-w-[800px] max-h-[400px] bg-gradient-to-r from-brand-500/10 via-secondary-500/5 to-brand-500/10 blur-[100px] pointer-events-none animate-gradient"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-[420px] relative z-10">
        <div className="text-center space-y-6 mb-10">
          <div className="flex justify-center animate-float">
            <BrandLogo textClassName="text-2xl" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">Admin Access</h1>
            <p className="mt-2 text-sm text-neutral-500">Enter your credentials to access the secure admin panel</p>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-500 via-secondary-500 to-brand-500 rounded-3xl opacity-60 blur-sm animate-gradient"></div>
          <div className="relative bg-white border border-neutral-200 rounded-3xl p-8 shadow-card">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-xs font-medium text-neutral-600">
                  Admin Email
                </label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-brand-500 transition-colors duration-200">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@superui.in"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition-all duration-200"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-medium text-neutral-600">
                  Security Password
                </label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-brand-500 transition-colors duration-200">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-10 pr-11 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-600 transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-start space-x-2.5 p-3.5 rounded-xl bg-neutral-50 border border-neutral-100">
                <ShieldAlert className="h-4 w-4 text-neutral-400 mt-0.5 shrink-0" />
                <p className="text-xs text-neutral-500 leading-relaxed">
                  This is a secured zone. All access attempts are logged and monitored. Unauthorized access is prohibited.
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-100">
                  <p className="text-xs text-red-600 font-medium text-center">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-sm font-semibold text-white transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed btn-shine"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                    <span>Authorizing Access...</span>
                  </>
                ) : (
                  <>
                    <span>Request Verification</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-neutral-400">
            Only registered organizational emails can authenticate here.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
