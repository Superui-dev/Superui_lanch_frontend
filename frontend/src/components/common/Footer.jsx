import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import BrandLogo from './BrandLogo';
import CustomerFeedbackModal from './CustomerFeedbackModal';
import RaiseIssueModal from './RaiseIssueModal';
import { Twitter, Github, Globe, Mail, Heart, ShieldCheck, MessageSquare, AlertCircle, LifeBuoy, MapPin } from 'lucide-react';

const Footer = () => {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isIssueOpen, setIsIssueOpen] = useState(false);
  const { settings, loading } = useSiteSettings();
  const footerSettings = settings?.footer || {};

  if (loading) {
    return (
      <footer className="bg-white text-neutral-900 border-t border-neutral-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div className="h-6 w-24 bg-neutral-200 rounded animate-pulse"></div>
            <div className="h-4 w-32 bg-neutral-200 rounded animate-pulse"></div>
          </div>
        </div>
      </footer>
    );
  }

  const socialLinks = settings?.socialLinks || {};
  const copyright = footerSettings.copyright || `© ${new Date().getFullYear()} SuperUI.in. All rights reserved.`;

  return (
    <footer className="bg-gradient-to-b from-neutral-50 to-white text-neutral-900 pt-20 pb-12 border-t border-neutral-200/80 relative overflow-hidden">
      {/* Subtle top accent gradient */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neutral-300 to-transparent" />

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Top Columns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-0 min-[568px]:pb-5 sm:pb-12 border-b border-neutral-100">
          
          {/* Brand Info */}
          <div className="md:col-span-4 space-y-5">
            <Link to="/" className="flex items-center space-x-2">
              <BrandLogo />
            </Link>
            <p className="text-sm text-neutral-500 max-w-sm leading-relaxed font-medium">
              Production-ready React components, developer UI kits, and SaaS templates backed by automated Razorpay delivery.
            </p>
            {settings?.branding?.location && (
              <div className="flex items-center space-x-1.5 text-xs font-bold text-brand-600">
                <MapPin className="h-3.5 w-3.5" />
                <span>{settings.branding.location}</span>
              </div>
            )}
            <div className="flex items-center space-x-3 pt-1">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-neutral-100 text-neutral-600 hover:bg-brand-600 hover:text-white transition-all duration-300 group">
                <Twitter className="h-4 w-4 group-hover:scale-110 transition-transform" />
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-neutral-100 text-neutral-600 hover:bg-brand-600 hover:text-white transition-all duration-300 group">
                <Github className="h-4 w-4 group-hover:scale-110 transition-transform" />
              </a>
              <a href="https://superui.in" target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-neutral-100 text-neutral-600 hover:bg-brand-600 hover:text-white transition-all duration-300 group">
                <Globe className="h-4 w-4 group-hover:scale-110 transition-transform" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
        <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 sm:gap-8 gap-2  ">
            <div className="space-y-4">
              <h3 className="text-xs font-extrabold text-neutral-900 uppercase tracking-wider">Storefront</h3>
              <ul className="space-y-2.5 text-sm text-neutral-500 font-medium">
                <li><Link to="/products" className="hover:text-brand-600 transition-colors">Store Catalog</Link></li>
                <li><Link to="/products?category=ui-kits" className="hover:text-brand-600 transition-colors">UI Kits & Dashboards</Link></li>
                <li><Link to="/products?category=templates" className="hover:text-brand-600 transition-colors">Landing Page Templates</Link></li>
                <li><Link to="/portfolio" className="hover:text-brand-600 transition-colors">Live Demos</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-extrabold text-neutral-900 uppercase tracking-wider">Support & Help</h3>
              <ul className="space-y-2.5 text-sm text-neutral-500 font-medium">
                <li><Link to="/contact" className="hover:text-brand-600 transition-colors">Contact Support</Link></li>
                <li><Link to="/contact" className="hover:text-brand-600 transition-colors">FAQ & Refunds</Link></li>
                <li><a href="mailto:hello.superui@gmail.com" className="hover:text-brand-600 transition-colors">Email Helpdesk</a></li>
              </ul>
            </div>

            <div className="space-y-4 hidden min-[568px]:block">
              <h3 className="text-xs font-extrabold text-neutral-900 uppercase tracking-wider">Feedback & Helpdesk</h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <button
                    onClick={() => setIsFeedbackOpen(true)}
                    className="hover:text-brand-600 font-semibold text-neutral-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Heart className="h-3.5 w-3.5 text-red-400" />
                    <span>Leave Product Feedback</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setIsIssueOpen(true)}
                    className="hover:text-red-600 transition-colors flex items-center gap-1.5 font-semibold text-neutral-800 cursor-pointer"
                  >
                    <LifeBuoy className="h-3.5 w-3.5 text-red-500" />
                    <span>Raise an Issue</span>
                  </button>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-brand-600 transition-colors flex items-center gap-1.5 font-semibold text-neutral-800">
                    <Mail className="h-3.5 w-3.5 text-neutral-500" />
                    <span>Direct Contact Desk</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>

        </div>

        {/* Copyright Bar (Left: SuperUI Copyright, Right: Designed & Built by AKHIL THADAKA above 991px) */}
        <div className="pt-6 sm:pt-8 flex flex-col min-[991px]:flex-row items-center justify-between text-xs text-neutral-500 gap-3 sm:gap-4">
          <p className="font-medium text-center min-[991px]:text-left">{copyright}</p>
          <div className="flex items-center space-x-1 font-medium text-center min-[991px]:text-right">
            <span>Designed & Built with</span>
            <Heart className="h-3.5 w-3.5 text-red-500 fill-current mx-0.5" />
            <span>by <strong className="text-neutral-900 font-semibold">AKHIL THADAKA</strong> in Warangal, Telangana, India</span>
          </div>
        </div>

      </div>

      {/* BIG CENTERED SUPERUI BRANDING TEXT (90% Width Centered) */}
      <div className="w-[90%] mx-auto pt-10 pb-0 min-[568px]:pb-4 text-center overflow-hidden pointer-events-none select-none">
        <div className="relative">
          <h1 className="text-[66px] xs:text-[86px] sm:text-[106px] md:text-[130px] lg:text-[175px] xl:text-[210px] 2xl:text-[250px] font-black uppercase tracking-tighter text-neutral-900/[0.05] leading-none text-center">
            SUPERUI
          </h1>
          {/* <div className="absolute inset-0 text-neutral-900/[0.03] font-black uppercase tracking-tighter text-center flex items-center justify-center pointer-events-none">
            <span className="text-[36px] xs:text-[56px] sm:text-[90px] md:text-[130px] lg:text-[175px] xl:text-[210px] 2xl:text-[250px] leading-none">SuperUI SuperUI SuperUI</span>
          </div> */}
        </div>
      </div>

      {/* Customer Post-Payment Feedback Modal */}
      <CustomerFeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />

      {/* Customer Support Issue Modal */}
      <RaiseIssueModal
        isOpen={isIssueOpen}
        onClose={() => setIsIssueOpen(false)}
      />
    </footer>
  );
};

export default Footer;
