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
    <footer className="bg-white text-neutral-900 pt-16 pb-8 border-t border-neutral-200/80">
      <div className="mx-auto max-w-7xl 2xl:max-w-[1700px] px-4 sm:px-6 lg:px-8 2xl:px-12">
        
        {/* Top Columns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-neutral-100">
          
          {/* Brand Info */}
          <div className="md:col-span-4 space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <BrandLogo />
            </Link>
            <p className="text-xs text-neutral-500 max-w-sm leading-relaxed font-medium">
              Production-ready React components, developer UI kits, and SaaS templates backed by automated Razorpay delivery.
            </p>
            {settings?.branding?.location && (
              <div className="flex items-center space-x-1.5 text-[11px] font-bold text-brand-600">
                <MapPin className="h-3.5 w-3.5" />
                <span>{settings.branding.location}</span>
              </div>
            )}
            <div className="flex items-center space-x-3 pt-2">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full bg-neutral-100 text-neutral-600 hover:bg-brand-600 hover:text-white transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full bg-neutral-100 text-neutral-600 hover:bg-brand-600 hover:text-white transition-colors">
                <Github className="h-4 w-4" />
              </a>
              <a href="https://superui.in" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full bg-neutral-100 text-neutral-600 hover:bg-brand-600 hover:text-white transition-colors">
                <Globe className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold text-neutral-900 uppercase tracking-wider">Storefront</h3>
              <ul className="space-y-2 text-xs text-neutral-500 font-medium">
                <li><Link to="/products" className="hover:text-brand-600 transition-colors">Store Catalog</Link></li>
                <li><Link to="/products?category=ui-kits" className="hover:text-brand-600 transition-colors">UI Kits & Dashboards</Link></li>
                <li><Link to="/products?category=templates" className="hover:text-brand-600 transition-colors">Landing Page Templates</Link></li>
                <li><Link to="/portfolio" className="hover:text-brand-600 transition-colors">Live Demos</Link></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-extrabold text-neutral-900 uppercase tracking-wider">Support & Help</h3>
              <ul className="space-y-2 text-xs text-neutral-500 font-medium">
                <li><Link to="/contact" className="hover:text-brand-600 transition-colors">Contact Support</Link></li>
                <li><Link to="/contact" className="hover:text-brand-600 transition-colors">FAQ & Refunds</Link></li>
                <li><a href="mailto:hello.superui@gmail.com" className="hover:text-brand-600 transition-colors">Email Helpdesk</a></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-extrabold text-neutral-900 uppercase tracking-wider">Feedback & Helpdesk</h3>
              <ul className="space-y-2 text-xs text-neutral-500 font-medium">
                <li>
                  <button
                    onClick={() => setIsFeedbackOpen(true)}
                    className="hover:text-brand-600 font-bold text-brand-600 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Heart className="h-3.5 w-3.5 fill-current" />
                    <span>Leave Product Feedback</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setIsIssueOpen(true)}
                    className="hover:text-red-600 transition-colors flex items-center gap-1 font-semibold text-neutral-800 cursor-pointer"
                  >
                    <LifeBuoy className="h-3.5 w-3.5 text-red-500" />
                    <span>Raise an Issue</span>
                  </button>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-brand-600 transition-colors flex items-center gap-1 font-semibold text-neutral-800">
                    <Mail className="h-3.5 w-3.5 text-neutral-500" />
                    <span>Direct Contact Desk</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>

        </div>

        {/* Copyright Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-4">
          <p>{copyright}</p>
          <div className="flex items-center space-x-1 font-medium">
            <span>Designed & Built with</span>
            <Heart className="h-3.5 w-3.5 text-red-500 fill-current mx-0.5" />
            <span>by <strong className="text-neutral-900 font-semibold">AKHIL THADAKA</strong> in Warangal, Telangana, India</span>
          </div>
        </div>

      </div>

      {/* BIG CENTERED SUPERUI BRANDING TEXT (90% Width Centered) */}
      <div className="w-[90%] max-w-[1700px] mx-auto pt-12 pb-4 text-center overflow-hidden pointer-events-none select-none">
        <h1 className="text-[42px] xs:text-[64px] sm:text-[110px] md:text-[160px] lg:text-[210px] 2xl:text-[250px] font-black uppercase tracking-tighter text-neutral-900/[0.07] leading-none text-center">
          SUPERUI
        </h1>
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
