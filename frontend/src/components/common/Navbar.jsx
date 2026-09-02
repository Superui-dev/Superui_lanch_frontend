import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import client from '../../api/client';
import { useCart } from '../../context/CartContext';
import { useWatchlist } from '../../context/WatchlistContext';
import { useAuth } from '../../context/AuthContext';
import BrandLogo from './BrandLogo';
import AuthModal from './AuthModal';
import AccountSecurityModal from './AccountSecurityModal';
import { ShoppingCart, User, LogOut, LayoutDashboard, Menu, X, ChevronDown, Heart, ShieldCheck, LogIn, Globe, KeyRound } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const { settings, loading } = useSiteSettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [productsDropdownOpen, setProductsDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [securityModalOpen, setSecurityModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  
  const { cartCount } = useCart();
  const { items: watchlistItems } = useWatchlist();
  const { 
    user, 
    logout, 
    isAuthModalOpen, 
    authModalMode, 
    openAuthModal, 
    closeAuthModal 
  } = useAuth();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await client.get('/api/public/categories', { silent: true });
        if (res.data?.success && res.data?.data) {
          setCategories(res.data.data);
        }
      } catch (err) {
        setCategories([
          { name: 'E-Books', slug: 'ebooks' },
          { name: 'Templates', slug: 'templates' },
          { name: 'Websites', slug: 'websites' },
          { name: 'UI Kits', slug: 'ui-kits' }
        ]);
      }
    };
    fetchCategories();
  }, []);

  const menuItems = (settings?.navbar?.menuItems && Array.isArray(settings.navbar.menuItems) && settings.navbar.menuItems.length > 0)
    ? settings.navbar.menuItems
    : [
        { label: 'Home', url: '/' },
        { label: 'Products', url: '/products' },
        { label: 'Portfolio', url: '/portfolio' },
        { label: 'Contact', url: '/contact' }
      ];

  if (loading) {
    return (
      <div className="sticky top-0 z-40 w-full border-b border-neutral-200/80 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <div className="h-8 w-28 rounded-lg bg-neutral-200 animate-pulse"></div>
            <div className="h-4 w-48 bg-neutral-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="sticky top-0 z-40 w-full border-b border-neutral-200/80 bg-white/85 backdrop-blur-md">
        <div className="mx-auto max-w-7xl 2xl:max-w-[1700px] px-3 sm:px-6 lg:px-8 2xl:px-12">
          <div className="flex h-16 sm:h-20 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <BrandLogo />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {menuItems.map((item, idx) => (
                <Link
                  key={idx}
                  to={item.url || item.href || (item.label.toLowerCase() === 'products' ? '/products' : '#')}
                  className="px-4 py-2.5 text-sm font-semibold text-neutral-700 hover:text-neutral-900 transition-colors rounded-xl hover:bg-neutral-100/60"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Right side actions */}
            <div className="hidden md:flex items-center space-x-3">
              {/* Location Badge */}
              {settings?.branding?.location && (
                <div className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-[10px] font-bold">
                  <Globe className="h-3 w-3" />
                  <span>{settings.branding.location}</span>
                </div>
              )}
              {/* Watchlist Icon with badge */}
              {/* Watchlist Icon with badge */}
              <button
                onClick={() => {
                  if (!user) {
                    openAuthModal('login');
                  } else {
                    navigate('/account/wishlist');
                  }
                }}
                className="relative p-2.5 rounded-full text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                title="Wishlist"
              >
                <Heart className="h-5 w-5" />
                {watchlistItems.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                    {watchlistItems.length}
                  </span>
                )}
              </button>

              {/* Cart Icon with badge */}
              {user && (
                <Link
                  to="/checkout"
                  className="relative p-2.5 rounded-full text-neutral-700 hover:bg-neutral-100 transition-colors"
                  title="Shopping Cart"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                      {cartCount}
                    </span>
                  )}
                </Link>
              )}

              {/* User Account / Auth Actions */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 px-4 py-2 rounded-2xl border border-neutral-200 bg-neutral-50 hover:bg-white text-neutral-900 text-xs font-bold transition-all"
                  >
                    <div className="h-6 w-6 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-[10px]">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="max-w-[100px] truncate">{user.name || user.email}</span>
                    <ChevronDown className="h-3.5 w-3.5 text-neutral-400" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-neutral-200 shadow-xl p-2 z-50 text-xs space-y-1">
                      <div className="px-3 py-2 border-b border-neutral-100 mb-1">
                        <p className="font-bold text-neutral-900">{user.name || 'Customer'}</p>
                        <p className="text-[11px] text-neutral-500 truncate">{user.email}</p>
                      </div>
                      <Link
                        to="/account/orders"
                        onClick={() => setUserDropdownOpen(false)}
                        className="block px-3 py-2 rounded-xl text-neutral-700 hover:bg-neutral-50 font-semibold"
                      >
                        My Orders
                      </Link>
                      <Link
                        to="/account/wishlist"
                        onClick={() => setUserDropdownOpen(false)}
                        className="block px-3 py-2 rounded-xl text-neutral-700 hover:bg-neutral-50 font-semibold"
                      >
                        Wishlist ({watchlistItems.length})
                      </Link>
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          setSecurityModalOpen(true);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-neutral-700 hover:bg-neutral-50 font-semibold flex items-center gap-1.5"
                      >
                        <KeyRound className="h-3.5 w-3.5 text-indigo-500" />
                        <span>Update Password</span>
                      </button>

                      {user.role === 'admin' && (
                        <Link
                          to="/india/admin/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="block px-3 py-2 rounded-xl text-brand-600 hover:bg-brand-50 font-bold"
                        >
                          Admin Dashboard
                        </Link>
                      )}
                      <button
                        onClick={() => { logout(); setUserDropdownOpen(false); }}
                        className="w-full text-left px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 font-bold flex items-center gap-1.5"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  {/* Customer Sign In button with padding 16px 32px (px-8 py-4) and rounded-2xl */}
                  <button
                    onClick={() => openAuthModal('login')}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-900 text-xs font-bold transition-all shadow-sm"
                  >
                    <LogIn className="h-3.5 w-3.5 text-neutral-500" />
                    <span>Sign In</span>
                  </button>

                  <button
                    onClick={() => openAuthModal('signup')}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all shadow-md hover:shadow-brand-500/25 active:scale-95 cursor-pointer"
                  >
                    <span>Sign Up</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center rounded-2xl p-2.5 text-neutral-700 hover:bg-neutral-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-neutral-200 bg-white p-4 space-y-4">
            <div className="space-y-1">
              {menuItems.map((item, idx) => (
                <Link
                  key={idx}
                  to={item.url || item.href || '#'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-xl px-4 py-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="pt-2 border-t border-neutral-100 flex items-center justify-around">
              <Link
                to="/account/wishlist"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-xs font-bold text-neutral-700"
              >
                <Heart className="h-4 w-4" />
                <span>Wishlist ({watchlistItems.length})</span>
              </Link>
              <Link
                to="/checkout"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-xs font-bold text-neutral-700"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>Cart ({cartCount})</span>
              </Link>
            </div>

            <div className="pt-2 space-y-2">
              {!user ? (
                <>
                  <button
                    onClick={() => { openAuthModal('login'); setMobileMenuOpen(false); }}
                    className="w-full flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border border-neutral-300 bg-white text-xs font-bold text-neutral-900 shadow-sm"
                  >
                    <span>Customer Sign In</span>
                  </button>
                  <button
                    onClick={() => { openAuthModal('signup'); setMobileMenuOpen(false); }}
                    className="w-full flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-brand-600 hover:bg-brand-700 text-xs font-bold text-white shadow-md active:scale-95 transition-all"
                  >
                    <span>Create Customer Account</span>
                  </button>
                </>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setSecurityModalOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-8 py-3 rounded-2xl bg-indigo-50 text-xs font-bold text-indigo-600 border border-indigo-200"
                  >
                    <KeyRound className="h-4 w-4" />
                    <span>Update Password</span>
                  </button>

                  <button
                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                    className="w-full flex items-center justify-center gap-2 px-8 py-3 rounded-2xl bg-red-50 text-xs font-bold text-red-600 border border-red-200"
                  >
                    <span>Sign Out ({user.email})</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Global Customer Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        initialMode={authModalMode}
      />

      {/* Global Customer Account Security & Password Modal */}
      <AccountSecurityModal
        isOpen={securityModalOpen}
        onClose={() => setSecurityModalOpen(false)}
      />
    </>
  );
};

export default Navbar;
