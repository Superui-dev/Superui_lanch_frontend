import React, { useState } from 'react';
import { useSiteSettings } from '../../context/SiteSettingsContext';

const BrandLogo = ({ className = 'h-7 w-auto', textClassName = 'text-xl', hideText = false }) => {
  const { settings, loading } = useSiteSettings();
  const [imgError, setImgError] = useState(false);

  const logoText = settings?.branding?.logoText || 'SuperUI';
  const logoUrl = settings?.branding?.logoUrl || '/logo/superui_logo.png';
  const showLogoText = settings?.branding?.showLogoText !== false;

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="h-7 w-7 rounded-lg bg-neutral-200 animate-pulse"></div>
        <div className="h-4 w-16 bg-neutral-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 select-none font-sans">
      {!imgError ? (
        <img
          src={logoUrl}
          alt="SuperUI Logo"
          className={`${className} object-contain`}
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="h-7 w-7 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white font-extrabold text-xs shadow-md">
          SUI
        </div>
      )}
      {!hideText && showLogoText && (
        <span className={`font-extrabold tracking-tight text-slate-900 ${textClassName}`}>
          {(() => {
            if (!logoText) return null;
            const suffixLen = 2;
            if (logoText.toLowerCase().endsWith('ui') && logoText.length > suffixLen) {
              const prefix = logoText.substring(0, logoText.length - suffixLen);
              const suffix = logoText.substring(logoText.length - suffixLen);
              const highlightColor = settings?.branding?.logoHighlightColor || '#ff5100';
              const isDefaultNeon = highlightColor === '#ff5100';
              return (
                <>
                  {prefix}
                  <span 
                    className={isDefaultNeon ? 'text-neon-orange font-extrabold' : 'font-extrabold'} 
                    style={isDefaultNeon ? {} : { color: highlightColor }}
                  >
                    {suffix}
                  </span>
                </>
              );
            }
            return logoText;
          })()}
        </span>
      )}
    </div>
  );
};

export default BrandLogo;
