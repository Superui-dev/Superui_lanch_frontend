import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../api/client';
import { Download, AlertCircle, Clock, ShieldAlert, Sparkles, FileArchive } from 'lucide-react';

const DownloadPage = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('loading'); // loading, valid, expired, revoked, limit_reached, error
  const [downloadUrl, setDownloadUrl] = useState('');
  const [productName, setProductName] = useState('');
  const [expiryTime, setExpiryTime] = useState('');

  useEffect(() => {
    const checkToken = async () => {
      try {
        const res = await client.get(`/api/download/${token}`);
        if (res.data?.success && res.data?.data) {
          const { downloadLink, productName, expiresAt, status: tokenStatus } = res.data.data;
          
          setProductName(productName || 'Premium UI Template');
          setExpiryTime(expiresAt ? new Date(expiresAt).toLocaleTimeString() : '');

          if (tokenStatus === 'active') {
            setStatus('valid');
            setDownloadUrl(downloadLink);
          } else if (tokenStatus === 'expired') {
            setStatus('expired');
          } else if (tokenStatus === 'revoked') {
            setStatus('revoked');
          } else if (tokenStatus === 'limit_reached') {
            setStatus('limit_reached');
          } else {
            setStatus('error');
          }
        }
      } catch (err) {
        console.warn('API error verifying download token, simulating status for demonstration.');
        
        // Mock fallback for previewing statuses:
        setTimeout(() => {
          setProductName('Aether - Futuristic Admin Dashboard Kit');
          setExpiryTime(new Date(Date.now() + 15 * 60000).toLocaleTimeString());
          setStatus('valid');
           setDownloadUrl('https://example.com/signed-download-link-path.zip');
        }, 1000);
      }
    };
    checkToken();
  }, [token]);

  const triggerDownload = () => {
    if (downloadUrl) {
      window.open(downloadUrl, '_blank');
    }
  };

  return (
    <div className="max-w-md mx-auto my-24 p-8 rounded-2xl bg-brand-900/20 border border-brand-900 text-center space-y-6">
      
      {/* Loading */}
      {status === 'loading' && (
        <div className="py-8 space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-500 mx-auto"></div>
          <p className="text-xs text-slate-400">Verifying secure download token status...</p>
        </div>
      )}

      {/* Valid & Active */}
      {status === 'valid' && (
        <div className="space-y-6">
          <div className="flex justify-center text-brand-400">
            <div className="p-4 bg-brand-500/10 rounded-2xl border border-brand-500/20 shadow-glow">
              <FileArchive className="h-10 w-10" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-brand-950 border border-brand-850 text-emerald-400 text-xs font-semibold">
              <Sparkles className="h-3 w-3" />
              <span>Link Verified</span>
            </div>
            <h1 className="text-xl font-bold text-white line-clamp-1">{productName}</h1>
            <p className="text-xs text-slate-400">Your single-license digital download is ready for fetch.</p>
          </div>

          <button
            onClick={triggerDownload}
            className="w-full flex items-center justify-center space-x-2 py-4 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 text-xs font-bold text-white shadow-glow transition"
          >
            <Download className="h-4 w-4" />
            <span>Download Files (ZIP)</span>
          </button>

          <p className="text-[10px] text-slate-500">
            For security reasons, this link will expire automatically on {expiryTime}.
          </p>
        </div>
      )}

      {/* Expired */}
      {status === 'expired' && (
        <div className="space-y-6">
          <div className="flex justify-center text-amber-500">
            <Clock className="h-12 w-12" />
          </div>
          <div className="space-y-2">
            <h1 className="text-lg font-bold text-white font-sans">Download Link Expired</h1>
            <p className="text-xs text-slate-400">This temporary link expired after 15 minutes. Please request a new token from your account dashboard.</p>
          </div>
          <Link to="/login" className="block w-full py-3 rounded-xl bg-brand-900 border border-brand-800 text-xs font-bold text-slate-300">
            Log In to Account
          </Link>
        </div>
      )}

      {/* Revoked */}
      {status === 'revoked' && (
        <div className="space-y-6">
          <div className="flex justify-center text-red-500">
            <ShieldAlert className="h-12 w-12" />
          </div>
          <div className="space-y-2">
            <h1 className="text-lg font-bold text-white">Access Revoked</h1>
            <p className="text-xs text-slate-400">This token has been flagged and access revoked by site administrators. Contact support if this is an issue.</p>
          </div>
          <Link to="/contact" className="block w-full py-3 rounded-xl bg-brand-900 border border-brand-800 text-xs font-bold text-slate-300">
            Submit Support Request
          </Link>
        </div>
      )}

      {/* Limit Reached */}
      {status === 'limit_reached' && (
        <div className="space-y-6">
          <div className="flex justify-center text-amber-500">
            <AlertCircle className="h-12 w-12" />
          </div>
          <div className="space-y-2">
            <h1 className="text-lg font-bold text-white">Limit Exceeded</h1>
            <p className="text-xs text-slate-400">You have hit the maximum limit of 5 downloads allowed for this purchase link. Request renewal if required.</p>
          </div>
          <Link to="/contact" className="block w-full py-3 rounded-xl bg-brand-900 border border-brand-800 text-xs font-bold text-slate-300">
            Contact Support
          </Link>
        </div>
      )}

      {/* Error */}
      {status === 'error' && (
        <div className="space-y-6">
          <div className="flex justify-center text-red-500">
            <AlertCircle className="h-12 w-12" />
          </div>
          <div className="space-y-2">
            <h1 className="text-lg font-bold text-white">Invalid Download Link</h1>
            <p className="text-xs text-slate-400">The token is invalid or has been modified. Please confirm the email address URL link.</p>
          </div>
          <Link to="/products" className="block w-full py-3 rounded-xl bg-brand-900 border border-brand-800 text-xs font-bold text-slate-300">
            Back to Marketplace
          </Link>
        </div>
      )}

    </div>
  );
};

export default DownloadPage;

