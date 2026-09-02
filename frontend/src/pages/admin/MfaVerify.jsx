import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import BrandLogo from '../../components/common/BrandLogo';
import { ShieldCheck, ArrowRight, Lock, CheckCircle2, QrCode } from 'lucide-react';



const MfaVerify = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { verifyMfa, user, isAuthenticated, mfaVerified, supabase } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/india/admin/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (mfaVerified) {
      navigate('/india/admin/dashboard', { replace: true });
    }
  }, [mfaVerified, navigate]);

  // If user is local fallback (no Supabase), allow direct MFA entry
  // If Supabase user without enrollment, they shouldn't be here

  const handleVerify = async (e) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError('Please input a valid 6-digit verification code from Google Authenticator');
      return;
    }
    setLoading(true);
    setError('');
    
    try {
      await verifyMfa(code);
    } catch (err) {
      setError(err.message || 'Invalid Google Authenticator code. Access blocked.');
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-brand-950">
        <div className="relative flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
          <span className="absolute text-[10px] uppercase font-bold text-brand-300">SEC</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-neutral-0 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-500/5 via-neutral-0 to-neutral-0 pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80vw] h-[40vw] max-w-[800px] max-h-[400px] bg-gradient-to-r from-secondary-500/10 via-brand-500/5 to-secondary-500/10 blur-[100px] pointer-events-none animate-gradient"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-[420px] relative z-10">
        <div className="text-center space-y-6 mb-10">
          <div className="flex justify-center animate-float" style={{ animationDelay: '0.5s' }}>
            <BrandLogo textClassName="text-2xl" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">Enter MFA Code</h1>
            <p className="mt-2 text-sm text-neutral-500 leading-relaxed">
              Input the 6-digit code from your authenticator app to authorize this admin session.
            </p>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-secondary-500 via-brand-500 to-secondary-500 rounded-3xl opacity-60 blur-sm animate-gradient"></div>
          <div className="relative bg-white border border-neutral-200 rounded-3xl p-8 shadow-card">
            <form onSubmit={handleVerify} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-xs font-medium text-neutral-600">
                  Verification Code
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                    <ShieldCheck className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-10 pr-4 py-3 text-center text-lg font-mono tracking-[0.5em] text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition-all duration-200"
                  />
                </div>
                <div className="flex justify-center space-x-1.5 mt-3">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        code.length > i ? 'bg-brand-500 w-6' : 'bg-neutral-200 w-4'
                      }`}
                    ></div>
                  ))}
                </div>
              </div>

              <div className="flex items-start space-x-2.5 p-3.5 rounded-xl bg-neutral-50 border border-neutral-100">
                <Lock className="h-4 w-4 text-neutral-400 mt-0.5 shrink-0" />
                <p className="text-xs text-neutral-500 leading-relaxed">
                  This code changes every 30 seconds. Never share it with anyone. SuperUI will never ask for your MFA code.
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-100">
                  <p className="text-xs text-red-600 font-medium text-center">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-sm font-semibold text-white transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed btn-shine"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <span>Authorize Session</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="mt-8 text-center space-y-2">
          <div className="flex items-center justify-center space-x-1.5 text-neutral-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">End-to-end encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MfaVerify;
