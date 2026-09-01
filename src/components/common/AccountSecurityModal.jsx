import React, { useState } from 'react';
import client from '../../api/client';
import { KeyRound, ShieldCheck, Lock, CheckCircle2, AlertCircle, Eye, EyeOff, X } from 'lucide-react';

const AccountSecurityModal = ({ isOpen, onClose }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  if (!isOpen) return null;

  // Password rules validation checks
  const checks = {
    length: newPassword.length >= 8,
    uppercase: /[A-Z]/.test(newPassword),
    lowercase: /[a-z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    special: /[@$!%*?&#]/.test(newPassword),
    match: newPassword.length > 0 && newPassword === confirmPassword
  };

  const validCount = Object.values(checks).filter(Boolean).length;
  const isStrong = validCount === 6;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!isStrong) {
      setMessage({ type: 'error', text: 'Please fulfill all password security requirements before saving.' });
      return;
    }

    setLoading(true);
    try {
      const res = await client.post('/api/auth/change-password', {
        currentPassword,
        newPassword,
        confirmPassword
      });

      if (res.data?.success) {
        setMessage({ type: 'success', text: 'Password successfully updated and securely stored in encrypted database!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          onClose();
        }, 1800);
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || err.response?.data?.error?.userMessage || 'Failed to update password. Please check current password.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6 text-white relative">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">Client Account Security</h2>
              <p className="text-xs text-neutral-400">Update & store password securely in database</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Alert message */}
        {message.text && (
          <div className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-3.5 pr-10 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
              >
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              New Advanced Password
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new strong password"
                className="w-full pl-3.5 pr-10 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
              >
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-type new password"
              className={`w-full px-3.5 py-2.5 bg-neutral-950 border rounded-xl text-xs text-white focus:outline-none transition ${
                confirmPassword && !checks.match ? 'border-red-500/50 focus:border-red-500' : 'border-neutral-800 focus:border-indigo-500'
              }`}
            />
          </div>

          {/* Password Security Strength Checklist */}
          <div className="p-3.5 bg-neutral-950 rounded-xl border border-neutral-800/80 space-y-2 text-[11px]">
            <div className="flex items-center justify-between text-neutral-400 font-medium">
              <span>Security Policy Strength</span>
              <span className={`font-bold ${isStrong ? 'text-emerald-400' : 'text-amber-400'}`}>
                {validCount}/6 Checks
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-1.5">
              <span className={`flex items-center gap-1 ${checks.length ? 'text-emerald-400' : 'text-neutral-500'}`}>
                <CheckCircle2 className="h-3 w-3" /> Min 8 characters
              </span>
              <span className={`flex items-center gap-1 ${checks.uppercase ? 'text-emerald-400' : 'text-neutral-500'}`}>
                <CheckCircle2 className="h-3 w-3" /> Uppercase letter (A-Z)
              </span>
              <span className={`flex items-center gap-1 ${checks.lowercase ? 'text-emerald-400' : 'text-neutral-500'}`}>
                <CheckCircle2 className="h-3 w-3" /> Lowercase letter (a-z)
              </span>
              <span className={`flex items-center gap-1 ${checks.number ? 'text-emerald-400' : 'text-neutral-500'}`}>
                <CheckCircle2 className="h-3 w-3" /> Number (0-9)
              </span>
              <span className={`flex items-center gap-1 ${checks.special ? 'text-emerald-400' : 'text-neutral-500'}`}>
                <CheckCircle2 className="h-3 w-3" /> Special (@$!%*?&#)
              </span>
              <span className={`flex items-center gap-1 ${checks.match ? 'text-emerald-400' : 'text-neutral-500'}`}>
                <CheckCircle2 className="h-3 w-3" /> Passwords match
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !isStrong}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition disabled:opacity-50 flex items-center space-x-1.5 shadow-lg shadow-indigo-600/20"
            >
              <Lock className="h-3.5 w-3.5" />
              <span>{loading ? 'Securing...' : 'Save Encrypted Password'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountSecurityModal;
