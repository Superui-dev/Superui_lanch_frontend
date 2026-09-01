import React, { useState } from 'react';
import { useSiteSettings } from '../../context/SiteSettingsContext';

const BrandLogo = ({ className = 'h-7 w-auto', textClassName = 'text-xl', hideText = false }) => {
  const { settings, loading } = useSiteSettings();
  const [imgError, setImgError] = useState(false);

  const rawLogoText = settings?.branding?.logoText;
  const logoText = (!rawLogoText || rawLogoText === 'VoiceCall') ? 'SuperUI' : rawLogoText;
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
    <div className="flex items-center space-x-2.5 select-none font-sans">
      {!imgError && logoUrl ? (
        <img
          src={logoUrl}
          alt="SuperUI Logo"
          className={`${className} object-contain`}
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="relative flex items-center justify-center w-7 h-7">
          <div className="absolute w-5 h-5 rounded-md bg-orange-400 opacity-60 transform -rotate-12 translate-x-[-2px] translate-y-[-2px]"></div>
          <div className="absolute w-5 h-5 rounded-md bg-orange-500 opacity-85 transform -rotate-6"></div>
          <div className="relative w-5 h-5 rounded-md bg-gradient-to-tr from-[#ff3d00] to-[#ff7a00] shadow-sm flex items-center justify-center text-white font-extrabold text-[10px]">
            S
          </div>
        </div>
      )}
      {!hideText && showLogoText && (
        <span className={`font-extrabold tracking-tight ${textClassName}`}>
          {(() => {
            const textToDisplay = (logoText === 'VoiceCall') ? 'SuperUI' : logoText;
            const suffixLen = 2;
            if (textToDisplay.toLowerCase().endsWith('ui') && textToDisplay.length >= suffixLen) {
              const prefix = textToDisplay.substring(0, textToDisplay.length - suffixLen);
              const suffix = textToDisplay.substring(textToDisplay.length - suffixLen);
              return (
                <>
                  <span className="text-slate-900 dark:text-white font-black">{prefix}</span>
                  <span 
                    className="font-black text-[#ff5100]" 
                    style={{ color: '#ff5100' }}
                  >
                    {suffix}
                  </span>
                </>
              );
            }
            return textToDisplay;
          })()}
        </span>
      )}
    </div>
  );
};

export default BrandLogo;
