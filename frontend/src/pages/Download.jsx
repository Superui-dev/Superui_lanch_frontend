import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../api/client';
import { Download, AlertCircle, Clock, ShieldAlert, Sparkles, FileArchive } from 'lucide-react';

const DownloadPage = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('loading');
  const [files, setFiles] = useState([]);
  const [productName, setProductName] = useState('');
  const [expiryTime, setExpiryTime] = useState('');

  useEffect(() => {
    const checkToken = async () => {
      try {
        const res = await client.get(`/api/download/${token}`);
        if (res.data?.success && res.data?.data) {
          const data = res.data.data;
          const tokenStatus = data.status || 'active';
          const fileList = Array.isArray(data.files) ? data.files : [];

          setProductName(data.productName || fileList[0]?.name || 'Premium UI Template');
          setExpiryTime(data.expiresAt ? new Date(data.expiresAt).toLocaleTimeString() : '');
          setFiles(fileList);

          if (tokenStatus === 'active') {
            setStatus('valid');
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
        const errMsg = err.response?.data?.message || err.message || '';
        if (errMsg.includes('expired')) {
          setStatus('expired');
        } else if (errMsg.includes('revoked') || errMsg.includes('revoke')) {
          setStatus('revoked');
        } else if (errMsg.includes('Maximum download') || errMsg.includes('limit')) {
          setStatus('limit_reached');
        } else if (errMsg.includes('invalid') || errMsg.includes('not found') || errMsg.includes('404')) {
          setStatus('error');
        } else {
          setStatus('error');
        }
      }
    };
    checkToken();
  }, [token]);

  const triggerDownload = (downloadUrl) => {
    if (downloadUrl) {
      window.open(downloadUrl, '_blank');
    }
  };

  const allFilesHaveUrls = files.length > 0 && files.every(f => f.downloadUrl);

  return (
    <div className="max-w-md mx-auto my-24 p-8 rounded-2xl bg-brand-900/20 border border-brand-900 text-center space-y-6">

      {status === 'loading' && (
        <div className="py-8 space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-500 mx-auto"></div>
          <p className="text-xs text-slate-400">Verifying secure download token status...</p>
        </div>
      )}

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

          {files.length > 0 ? (
            <div className="space-y-3">
              {files.map((file, idx) => (
                <button
                  key={file.key || idx}
                  onClick={() => triggerDownload(file.downloadUrl)}
                  disabled={!file.downloadUrl}
                  className={`w-full flex items-center justify-center space-x-2 py-3 rounded-xl text-xs font-bold transition ${
                    file.downloadUrl
                      ? 'bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 text-white shadow-glow'
                      : 'bg-neutral-700 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Download className="h-4 w-4" />
                  <span>{file.name || 'Download File'}</span>
                </button>
              ))}
            </div>
          ) : (
            <button
              onClick={() => triggerDownload(files[0]?.downloadUrl)}
              className="w-full flex items-center justify-center space-x-2 py-4 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 text-xs font-bold text-white shadow-glow transition"
            >
              <Download className="h-4 w-4" />
              <span>Download Files (ZIP)</span>
            </button>
          )}

          {expiryTime && (
            <p className="text-[10px] text-slate-500">
              For security reasons, this link will expire automatically at {expiryTime}.
            </p>
          )}
        </div>
      )}

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
