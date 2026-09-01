import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Monitor, Tablet, Smartphone, Sparkles, ShieldCheck, ShoppingCart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const LivePreviewModal = ({ product, isOpen, onClose }) => {
  const [device, setDevice] = useState('desktop'); // 'desktop' | 'tablet' | 'mobile'
  const [iframeLoading, setIframeLoading] = useState(true);
  const [iframeError, setIframeError] = useState(false);
  const { addToCart } = useCart();
  const { openAuthModal, user } = useAuth();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setIframeLoading(true);
      setIframeError(false);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const demoUrl = product.demoUrl || product.liveUrl || 'https://superui-demo.vercel.app';
  const price = product.sellingPrice || product.price || 0;

  const handleAddToCart = () => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    addToCart({
      _id: product._id,
      name: product.name,
      price: price,
      image: product.thumbnail?.url || product.image
    });
  };

  const getViewportWidth = () => {
    switch (device) {
      case 'mobile':
        return 'max-w-[395px] h-[720px] rounded-3xl border-8 border-neutral-900 shadow-2xl';
      case 'tablet':
        return 'max-w-[768px] h-[820px] rounded-2xl border-4 border-neutral-900 shadow-xl';
      default:
        return 'w-full h-full rounded-xl border border-neutral-200 shadow-md';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-neutral-950/95 backdrop-blur-md animate-fadeIn overflow-hidden">
      
      {/* Top Header Controls Bar */}
      <div className="h-16 px-4 sm:px-6 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between shrink-0 shadow-lg">
        
        {/* Left: Product Title & Category */}
        <div className="flex items-center space-x-3 min-w-0">
          <div className="p-2 rounded-xl bg-brand-600/20 text-brand-400 border border-brand-500/30 shrink-0">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="truncate">
            <h2 className="text-sm font-bold text-white truncate flex items-center gap-2">
              <span>{product.name}</span>
              <span className="px-2 py-0.5 rounded-md bg-neutral-800 text-[10px] font-semibold text-neutral-300 border border-neutral-700">
                {product.categoryId?.name || product.category || 'Asset'}
              </span>
            </h2>
            <p className="text-xs text-neutral-400 truncate hidden sm:block">
              {product.tagline || product.shortDescription || 'Live Website Interactive Preview'}
            </p>
          </div>
        </div>

        {/* Center: Device Viewport Switcher */}
        <div className="hidden md:flex items-center bg-neutral-950 p-1 rounded-xl border border-neutral-800 space-x-1">
          <button
            type="button"
            onClick={() => setDevice('desktop')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              device === 'desktop'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
            title="Desktop View"
          >
            <Monitor className="h-3.5 w-3.5" />
            <span>Desktop</span>
          </button>

          <button
            type="button"
            onClick={() => setDevice('tablet')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              device === 'tablet'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
            title="Tablet View"
          >
            <Tablet className="h-3.5 w-3.5" />
            <span>Tablet</span>
          </button>

          <button
            type="button"
            onClick={() => setDevice('mobile')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              device === 'mobile'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
            title="Mobile View"
          >
            <Smartphone className="h-3.5 w-3.5" />
            <span>Mobile</span>
          </button>
        </div>

        {/* Right: Price, Buy Now, Open in Tab, Close */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          <div className="hidden sm:flex flex-col items-end mr-1">
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">Price</span>
            <span className="text-sm font-extrabold text-brand-400">₹{price.toLocaleString()}</span>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            className="flex items-center space-x-1.5 px-3 sm:px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-md shadow-brand-600/30"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Add to Cart</span>
          </button>

          <a
            href={demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 transition-colors"
            title="Open Live Site in New Tab"
          >
            <ExternalLink className="h-4 w-4" />
          </a>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-red-600/80 text-neutral-300 hover:text-white border border-neutral-700 transition-colors"
            title="Close Preview"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

      </div>

      {/* Main Preview Workspace Container */}
      <div className="flex-1 p-2 sm:p-6 flex items-center justify-center overflow-auto bg-neutral-900/60 relative">
        
        {/* Device Frame Viewport Wrapper */}
        <div className={`transition-all duration-300 flex flex-col bg-white overflow-hidden relative ${getViewportWidth()}`}>
          
          {/* Mock Browser Header Bar */}
          <div className="h-9 bg-neutral-100 border-b border-neutral-200 px-3 flex items-center justify-between shrink-0 select-none">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            </div>

            <div className="px-3 py-0.5 rounded-md bg-white border border-neutral-200 text-[10px] text-neutral-500 font-mono truncate max-w-xs sm:max-w-md flex items-center space-x-1 shadow-inner">
              <ShieldCheck className="h-3 w-3 text-emerald-500 shrink-0" />
              <span className="truncate">{demoUrl}</span>
            </div>

            <a
              href={demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-semibold text-brand-600 hover:underline flex items-center gap-1"
            >
              <span>Full View</span>
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>

          {/* Iframe Viewport Container */}
          <div className="flex-1 relative bg-neutral-950">
            {iframeLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-900 text-white space-y-3 z-10">
                <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-semibold text-neutral-400">Loading Live Website View...</span>
              </div>
            )}

            {iframeError ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-900 text-neutral-200 p-6 text-center space-y-4">
                <Sparkles className="h-10 w-10 text-brand-500 animate-bounce" />
                <h3 className="text-base font-bold">Interactive Live Preview</h3>
                <p className="text-xs text-neutral-400 max-w-md">
                  This demo website site is ready for full view preview. Click below to launch in full browser tab.
                </p>
                <a
                  href={demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-lg flex items-center space-x-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Open Full Website in New Tab</span>
                </a>
              </div>
            ) : (
              <iframe
                src={demoUrl}
                title={`Live Preview - ${product.name}`}
                className="w-full h-full border-0 bg-white"
                onLoad={() => setIframeLoading(false)}
                onError={() => {
                  setIframeLoading(false);
                  setIframeError(true);
                }}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              />
            )}
          </div>

        </div>

      </div>

    </div>
  );
};

export default LivePreviewModal;
