import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAdminTheme } from '../../context/AdminThemeContext';
import BrandLogo from '../common/BrandLogo';
import InspectDetector from '../common/InspectDetector';
import { io } from 'socket.io-client';
import {
  LayoutDashboard, ShoppingBag, FolderOpen, Users, Receipt, CreditCard,
  Download, Mail, Bell, Settings, ShieldCheck, LogOut,
  ChevronRight, Menu, X, Sun, Moon, Search, PanelLeftClose, PanelLeftOpen, ChevronDown, TrendingUp,
  Clock, Calendar, QrCode, Copy, Check, CheckCircle2, Eye, EyeOff, Image, Heart, LifeBuoy, Grid, Phone, Type, Layers
} from 'lucide-react';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// Central audio context (lazily initialized on first user interaction)
let globalAudioCtx = null;

const playSound = (type) => {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    if (!globalAudioCtx) {
      globalAudioCtx = new AudioContextClass();
    }
    
    const ctx = globalAudioCtx;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    if (type === 'click') {
      // Warm, peaceful organic glass chime click (A4 fundamental + A5 overtone)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5 (warm fundamental)

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1046.50, ctx.currentTime); // C6 (soft overtone)

      gain.gain.setValueAtTime(0.02, ctx.currentTime); // Very quiet
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.18);
      osc2.stop(ctx.currentTime + 0.18);
    } else if (type === 'notification') {
      // Peaceful, ambient pentatonic chime arpeggio (C5 -> D5 -> E5 -> G5)
      const playTone = (freq, time, duration, vol) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(vol, time);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(time);
        osc.stop(time + duration);
      };

      const now = ctx.currentTime;
      playTone(523.25, now, 0.4, 0.04); // C5
      playTone(587.33, now + 0.12, 0.4, 0.03); // D5
      playTone(659.25, now + 0.24, 0.4, 0.03); // E5
      playTone(783.99, now + 0.36, 0.6, 0.05); // G5
    }
  } catch (e) {
    // Audio synthesis silently ignored
  }
};

const AdminLayout = ({ children }) => {
  const { logout, user, supabase, mfaEnrolled, enrollMfa, enrollmentData, verifyAndEnableMfa } = useAuth();
  const { toggleTheme, isLight, colors } = useAdminTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [liveVisitors, setLiveVisitors] = useState(3);
  const [healthStatus, setHealthStatus] = useState('OK');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [showMfaModal, setShowMfaModal] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaError, setMfaError] = useState('');
  const [mfaSuccess, setMfaSuccess] = useState(false);
  const [mfaLoading, setMfaLoading] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [revealQr, setRevealQr] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [socketToken, setSocketToken] = useState('');
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);
  const pagesDropdownRef = useRef(null);
  const [pagesDropdownOpen, setPagesDropdownOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        setSocketToken(session.access_token);
      }
    };
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.access_token) {
        setSocketToken(session.access_token);
      } else {
        setSocketToken('');
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    const mfaToken = sessionStorage.getItem('admin_mfa_token') || localStorage.getItem('admin_mfa_token');
    let token = mfaToken || socketToken;
    if (!token) {
      const sessionStr = localStorage.getItem('supabase.auth.token') || 
                         localStorage.getItem('sb-token') || 
                         sessionStorage.getItem('sb-token');
      if (sessionStr) {
        try {
          const parsed = JSON.parse(sessionStr);
          token = parsed?.currentSession?.access_token || parsed?.access_token || parsed;
        } catch {
          token = sessionStr;
        }
      }
    }
    if (!token) {
      return;
    }

    const socket = io(`${SOCKET_URL}/admin`, {
      auth: { token, mfaToken: mfaToken || token },
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 5000,
      timeout: 10000,
      autoConnect: true
    });

    socket.on('connect', () => {});
    socket.on('connect_error', () => {});

    socket.on('admin:visitor-live-count', (data) => {
      const count = data?.count ?? data?.liveAdmins;
      if (count !== undefined) setLiveVisitors(count);
    });

    socket.on('admin:system-health', (data) => {
      if (data?.overall) setHealthStatus(data.overall === 'ALL_SYSTEMS_OPERATIONAL' ? 'OK' : 'DEGRADED');
    });

    // Sound effect listeners for admin alerts
    socket.on('admin:new-order', () => {
      playSound('notification');
    });

    socket.on('admin:new-contact', () => {
      playSound('notification');
    });

    socket.on('admin:payment-failed', () => {
      playSound('notification');
    });

    return () => {
      socket.off('admin:visitor-live-count');
      socket.off('admin:system-health');
      socket.off('admin:new-order');
      socket.off('admin:new-contact');
      socket.off('admin:payment-failed');
      socket.disconnect();
    };
  }, [socketToken]);

  // Global click event listener for admin buttons sound effects
  useEffect(() => {
    const handleGlobalClick = (e) => {
      const target = e.target.closest('button, a, [role="button"], input[type="submit"], input[type="button"]');
      if (target) {
        playSound('click');
      }
    };

    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
      if (pagesDropdownRef.current && !pagesDropdownRef.current.contains(event.target)) {
        setPagesDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const sidebarLinks = [
    { label: 'Dashboard', path: '/india/admin/dashboard', icon: LayoutDashboard },
    { label: 'Categories', path: '/india/admin/categories', icon: FolderOpen },
    { label: 'Customers', path: '/india/admin/customers', icon: Users },
    { label: 'Orders', path: '/india/admin/orders', icon: Receipt },
    { label: 'Payments', path: '/india/admin/payments', icon: CreditCard },
    { label: 'Bookings', path: '/india/admin/bookings', icon: Phone },
    { label: 'Downloads', path: '/india/admin/downloads', icon: Download },
    // { label: 'Services', path: '/india/admin/services', icon: Grid },
    // { label: 'Navbar Menu', path: '/india/admin/navbar', icon: Type },
    { label: 'Reports', path: '/india/admin/reports', icon: TrendingUp },
    { label: 'Email Panel', path: '/india/admin/email', icon: Bell }
  ];

  const topNavLinks = [
    { label: 'Messages', path: '/india/admin/contacts', icon: Mail },
    { label: 'Telegram', path: '/india/admin/telegram', icon: Bell },
  ];

  const additionalPages = [
    { label: 'Upcoming Banners', path: '/india/admin/upcoming-banners', icon: Layers },
    { label: 'Hero Images', path: '/india/admin/hero-images', icon: Image },
    { label: 'Settings', path: '/india/admin/settings', icon: Settings },
    { label: 'Testimonials', path: '/india/admin/testimonials', icon: Heart },
    { label: 'Page Config (JSON)', path: '/india/admin/page-config', icon: Grid },
    { label: 'Feedback', path: '/india/admin/feedback', icon: Heart },
    { label: 'Issues', path: '/india/admin/issues', icon: LifeBuoy },
    { label: 'Pricing Plan', path: '/india/admin/pricing', icon: CreditCard },
    { label: 'Visitor Report', path: '/india/admin/visitors', icon: Users },
    { label: 'Booking Calls', path: '/india/admin/bookings', icon: Phone }
  ];

  const isActive = (path) => location.pathname === path;

  const allPages = [
    ...sidebarLinks,
    ...topNavLinks,
    ...additionalPages,
    { label: 'Security', path: '/india/admin/security', icon: ShieldCheck }
  ];

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim()) {
      const filtered = allPages.filter(page => 
        page.label.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered);
      setShowSearchDropdown(filtered.length > 0);
    } else {
      setSearchResults([]);
      setShowSearchDropdown(false);
    }
  };

  const navigateToPage = (path) => {
    setSearchQuery('');
    setShowSearchDropdown(false);
    navigate(path);
  };

  return (
    <div className={`admin-layout h-screen flex ${colors.bg}`}>
      <InspectDetector />
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex flex-col shrink-0 transition-all duration-300 border-r ${colors.sidebar} ${sidebarCollapsed ? 'w-16' : 'w-52'}`}>
        <div className="p-4 flex items-center justify-between border-b border-neutral-200 h-16">
          {!sidebarCollapsed && (
            <div className={`flex items-center ${isLight ? 'text-black' : 'text-white'}`}>
              <BrandLogo textClassName="text-base" />
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={`p-2 rounded-xl transition ${colors.hover} ${isLight ? 'text-neutral-600' : 'text-slate-300'}`}
          >
            {sidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        </div>

        <nav className="flex-1 px-3 pt-5 space-y-1 overflow-y-auto">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center ${sidebarCollapsed ? 'justify-center px-2 py-2' : 'space-x-3 px-3 py-2'} rounded-xl text-xs font-medium transition-all duration-200 ${
                  active
                    ? 'bg-brand-500 text-white shadow-lg'
                    : colors.sidebarInactive
                }`}
                style={active ? { borderLeft: '3px solid #ff6b00' } : {}}
                title={sidebarCollapsed ? link.label : ''}
              >
                <Icon className="h-4 w-4" />
                {!sidebarCollapsed && <span>{link.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Date / Time card */}
        <div className="p-3 space-y-3">
          <div className="p-4 rounded-2xl border border-brand-500/30 bg-brand-500 text-white shadow-[0_0_15px_rgba(255,107,0,0.3)] text-xs space-y-3">
            <div className="flex items-center space-x-2.5">
              <Clock className="h-4 w-4 text-white" />
              <span className="font-bold text-sm tracking-wide">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <Calendar className="h-4 w-4 text-white" />
              <span className="text-[11px] font-medium text-white/90">{currentTime.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>

          {/* <button
            onClick={toggleTheme}
            className={`flex items-center ${sidebarCollapsed ? 'justify-center px-2 py-2.5' : 'space-x-3 px-3 py-2.5'} rounded-xl transition text-sm font-medium w-full ${colors.hover}`}
            title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {isLight ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            {!sidebarCollapsed && <span>{isLight ? 'Dark Mode' : 'Light Mode'}</span>}
          </button>  */}

          <button
            onClick={handleLogout}
            className={`flex items-center ${sidebarCollapsed ? 'justify-center px-2 py-2.5' : 'space-x-3 px-3 py-2.5'} text-red-500 rounded-xl transition text-sm font-medium w-full ${isLight ? 'hover:bg-red-50' : 'hover:bg-red-500/10'}`}
            title="Sign Out"
          >
            <LogOut className="h-5 w-5" />
            {!sidebarCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col h-full min-w-0">
        {/* Top Navigation Bar */}
        <header className={`h-16 shrink-0 flex items-center justify-between px-4 lg:px-8 border-b ${isLight ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-neutral-800'}`}>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`lg:hidden p-2 rounded-xl border transition ${isLight ? 'text-neutral-600 border-neutral-200 hover:bg-neutral-50' : 'text-slate-300 border-neutral-700 hover:bg-neutral-800'}`}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div ref={searchRef} className="hidden lg:block relative">
              <div className="flex items-center space-x-2 px-3 py-2 rounded-xl border w-64 lg:w-80 border-neutral-200 bg-neutral-50">
                <Search className={`h-4 w-4 text-neutral-500 shrink-0`} />
                <input
                  type="text"
                  placeholder="Search pages..."
                  value={searchQuery}
                  onChange={handleSearch}
                  onFocus={() => searchQuery.trim() && setShowSearchDropdown(true)}
                  className={`bg-transparent border-none outline-none text-xs w-full text-neutral-900 placeholder:text-neutral-400`}
                />
              </div>
              
              {showSearchDropdown && (
                <div className={`absolute top-full left-0 right-0 mt-2 rounded-xl border shadow-lg z-50 max-h-64 overflow-y-auto ${isLight ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-neutral-800'}`}>
                  {searchResults.length > 0 ? (
                    <div className="p-2 space-y-1">
                      {searchResults.map((page) => {
                        const Icon = page.icon;
                        const active = isActive(page.path);
                        return (
                          <button
                            key={page.path}
                            onClick={() => navigateToPage(page.path)}
                            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                              active 
                                ? (isLight ? 'bg-brand-50 text-brand-600' : 'bg-brand-500/10 text-brand-400') 
                                : (isLight ? 'hover:bg-neutral-50 text-neutral-700' : 'hover:bg-neutral-800 text-slate-300')
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                            <span className="text-xs font-medium">{page.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-4 text-center">
                      <p className={`text-xs ${colors.textSecondary}`}>No pages found</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-1 lg:space-x-2">
            {/* Pages Dropdown */}
            <div className="relative" ref={pagesDropdownRef}>
              <button
                onClick={() => setPagesDropdownOpen(!pagesDropdownOpen)}
                className={`hidden sm:flex items-center space-x-2 px-3 py-2 rounded-xl transition-all duration-200 ${isLight ? 'border border-neutral-200' : 'border border-neutral-700'} ${pagesDropdownOpen ? (isLight ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white text-neutral-900 border-white') : (isLight ? 'text-neutral-600 hover:bg-neutral-50 hover:border-neutral-300' : 'text-slate-300 hover:bg-neutral-800 hover:border-neutral-600')}`}
              >
                <Grid className="h-4 w-4" />
                <span className="text-xs font-medium">All Pages</span>
                <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${pagesDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {pagesDropdownOpen && (
                <div className={`absolute right-0 mt-2 w-52 rounded-xl border shadow-lg z-50 p-2 space-y-1 ${isLight ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-neutral-800'}`}>
                  {additionalPages.map((link) => {
                    const Icon = link.icon;
                    const active = isActive(link.path);
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={() => setPagesDropdownOpen(false)}
                        className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                          active
                            ? 'bg-brand-500 text-white shadow-md'
                            : (isLight ? 'hover:bg-neutral-50 text-neutral-700' : 'hover:bg-neutral-800 text-slate-300')
                        }`}
                        style={active ? { borderLeft: '3px solid #ff6b00' } : {}}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{link.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {topNavLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`hidden sm:flex items-center space-x-2 px-3 py-2 rounded-xl transition-all duration-200 ${isLight ? 'border border-neutral-200' : 'border border-neutral-700'} ${active ? (isLight ? 'bg-neutral-900 text-white hover:bg-neutral-800' : 'bg-white text-neutral-900 hover:bg-neutral-100') : (isLight ? 'text-neutral-600 hover:bg-neutral-50 hover:border-neutral-300' : 'text-slate-300 hover:bg-neutral-800 hover:border-neutral-600')}`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-xs font-medium">{link.label}</span>
                </Link>
              );
            })}

            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl border transition ${isLight ? 'text-neutral-600 border-neutral-200 hover:bg-neutral-50' : 'text-slate-300 border-neutral-700 hover:bg-neutral-800'}`}
              title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {isLight ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>

            {/* User dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className={`hidden md:flex items-center space-x-2 pl-3 border-l ${isLight ? 'border-neutral-200' : 'border-neutral-700'} transition-all duration-200`}
              >
                <div className={`h-8 w-8 rounded-full ${isLight ? 'bg-brand-500 text-white' : 'bg-white text-neutral-900'} flex items-center justify-center font-medium text-xs`}>
                  {(user?.name || 'AKHIL THADAKA')?.[0]?.toUpperCase() || 'A'}
                </div>
                <div className="text-xs">
                  <p className={`font-medium ${isLight ? 'text-neutral-900' : 'text-white'}`}>{user?.name || 'AKHIL THADAKA'}</p>
                  <p className={`text-[10px] ${isLight ? 'text-neutral-500' : 'text-slate-400'}`}>Administrator</p>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''} ${isLight ? 'text-neutral-500' : 'text-slate-400'}`} />
              </button>

              {userDropdownOpen && (
                <div className={`absolute right-0 mt-2 w-64 rounded-xl border shadow-lg z-50 ${isLight ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-neutral-800'}`}>
                  <div className={`p-4 border-b ${isLight ? 'border-neutral-200' : 'border-neutral-800'}`}>
                    <p className={`text-sm font-semibold ${isLight ? 'text-neutral-900' : 'text-white'}`}>{user?.name || 'AKHIL THADAKA'}</p>
                    <p className={`text-[10px] ${isLight ? 'text-neutral-500' : 'text-slate-400'}`}>Administrator</p>
                  </div>
                  <div className="p-2 space-y-1">
                    <button
                      onClick={async () => {
                        setUserDropdownOpen(false);
                        setShowMfaModal(true);
                        setMfaError('');
                        if (!enrollmentData) {
                          await enrollMfa();
                        }
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors duration-200 ${isLight ? 'hover:bg-neutral-50 text-neutral-700' : 'hover:bg-neutral-800 text-slate-300'}`}
                    >
                      <div className="flex items-center space-x-2">
                        <ShieldCheck className="h-4 w-4 text-brand-500" />
                        <span>2FA Authenticator App</span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${mfaEnrolled ? 'bg-emerald-500/10 text-emerald-500' : 'bg-brand-500/10 text-brand-500'}`}>
                        {mfaEnrolled ? 'Active' : 'Setup'}
                      </span>
                    </button>

                    <button
                      onClick={() => { setUserDropdownOpen(false); handleLogout(); }}
                      className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium text-red-600 transition-colors duration-200 ${isLight ? 'hover:bg-red-50' : 'hover:bg-red-500/10'}`}
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Mobile menu drawer */}
        {mobileMenuOpen && (
          <div className={`lg:hidden border-b py-4 px-4 space-y-3 ${isLight ? 'bg-white border-neutral-200' : 'bg-neutral-950 border-neutral-800'}`}>
            <nav className="flex flex-col space-y-1">
              {sidebarLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg text-xs font-medium transition-all duration-200 ${active ? (isLight ? 'bg-brand-500 text-white' : 'bg-white text-neutral-900') : (isLight ? 'text-neutral-600 hover:bg-lavender-100' : 'text-slate-400 hover:bg-brand-900')}`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}

              {topNavLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg text-xs font-medium transition-all duration-200 ${active ? (isLight ? 'bg-brand-500 text-white' : 'bg-white text-neutral-900') : (isLight ? 'text-neutral-600 hover:bg-lavender-100' : 'text-slate-400 hover:bg-brand-900')}`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}

              <div className="pt-3 pb-1 px-4 text-[9px] font-bold uppercase tracking-wider text-neutral-400">
                More Modules
              </div>
              {additionalPages.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg text-xs font-medium transition-all duration-200 ${active ? (isLight ? 'bg-brand-500 text-white' : 'bg-white text-neutral-900') : (isLight ? 'text-neutral-600 hover:bg-lavender-100' : 'text-slate-400 hover:bg-brand-900')}`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
            <div className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg ${isLight ? 'bg-white' : 'bg-neutral-900'}`}>
              <div className={`h-8 w-8 rounded-full ${isLight ? 'bg-brand-500 text-white' : 'bg-white text-neutral-900'} flex items-center justify-center font-medium text-xs`}>
                {(user?.name || 'AKHIL THADAKA')?.[0]?.toUpperCase() || 'A'}
              </div>
              <div>
                <p className={`text-sm font-medium ${isLight ? 'text-neutral-900' : 'text-white'}`}>{user?.name || 'AKHIL THADAKA'}</p>
                <p className={`text-[10px] ${isLight ? 'text-neutral-500' : 'text-slate-400'}`}>Administrator</p>
              </div>
            </div>
            <button
              onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-red-500 text-xs font-medium ${isLight ? 'hover:bg-red-50' : 'hover:bg-red-500/10'}`}
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        )}

        {/* Container viewport */}
        <main className={`flex-grow overflow-y-auto ${colors.bg}`}>
          {children}
        </main>
      </div>

      {/* MFA Setup Modal */}
      {showMfaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className={`w-full max-w-lg rounded-3xl p-6 lg:p-8 border shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto ${isLight ? 'bg-white border-neutral-200 text-neutral-900' : 'bg-neutral-900 border-neutral-800 text-white'}`}>
            
            {/* Header */}
            <div className="flex justify-between items-center pb-4 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-500">
                  <QrCode className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold tracking-tight">Authenticator App Setup</h2>
                  <p className="text-xs text-neutral-500 dark:text-slate-400">Scan QR Code with Google Authenticator or Authy</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setShowMfaModal(false)}
                className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-600 dark:hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {mfaSuccess ? (
              <div className="py-6 text-center space-y-4">
                <div className="mx-auto h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400">MFA Enabled Successfully!</h3>
                <p className="text-xs text-neutral-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                  Your admin account is now protected with 2-Factor Authentication (TOTP). On your next login, you will be prompted to enter the 6-digit code.
                </p>
                <button
                  type="button"
                  onClick={() => setShowMfaModal(false)}
                  className="px-6 py-2.5 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-medium text-xs shadow-md"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Step 1: Scan QR */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-brand-500">Step 1: Scan QR Code</span>
                    {mfaEnrolled && <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full font-medium">2FA Active</span>}
                  </div>

                  <div className="flex flex-col items-center gap-4 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                    <div className="p-3 bg-white border border-neutral-200 rounded-xl shrink-0 shadow-sm flex flex-col items-center justify-center min-w-[200px] min-h-[200px]">
                      {revealQr ? (
                        (() => {
                          const getQrSrc = () => {
                            if (!enrollmentData) return null;
                            const { qrCode, uri, secret } = enrollmentData;
                            if (qrCode) {
                              if (qrCode.startsWith('data:') || qrCode.startsWith('http')) return qrCode;
                              if (qrCode.startsWith('<svg')) return `data:image/svg+xml;utf8,${encodeURIComponent(qrCode)}`;
                            }
                            if (uri) return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(uri)}`;
                            if (secret) {
                              const otp = `otpauth://totp/SuperUI%20Admin:${encodeURIComponent(user?.email || 'admin')}?secret=${secret}&issuer=SuperUI`;
                              return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otp)}`;
                            }
                            return null;
                          };
                          const src = getQrSrc();
                          return src ? (
                            <img src={src} alt="MFA QR Code" className="w-40 h-40 rounded-md" onError={(e) => { e.target.style.display = 'none'; }} />
                          ) : (
                            <div className="w-40 h-40 flex items-center justify-center text-neutral-300">
                              <QrCode className="h-16 w-16 animate-pulse" />
                            </div>
                          );
                        })()
                      ) : (
                        <div className="flex flex-col items-center justify-center text-center p-4 space-y-3">
                          <div className="p-3 rounded-full bg-brand-500/10 text-brand-500">
                            <QrCode className="h-8 w-8" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-neutral-900">QR Code Hidden</p>
                            <p className="text-[10px] text-neutral-500 dark:text-slate-400 mt-0.5">Protected by Security Policy</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setRevealQr(true)}
                            className="px-3.5 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white font-medium text-xs transition-colors shadow-sm"
                          >
                            Click to Reveal QR Code
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 text-center text-xs w-full">
                      <p className="font-medium text-neutral-700 dark:text-slate-300">Open Google Authenticator or Authy on your phone and scan code.</p>
                      <div className="flex items-center justify-center space-x-2 pt-1">
                        <span className="text-[11px] text-neutral-500 dark:text-slate-400">Secret Key:</span>
                        <code className="font-mono bg-neutral-200 dark:bg-neutral-800 px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wider">
                          {showSecret ? (enrollmentData?.secret || 'JBSWY3DPEHPK3PXP') : '••••••••••••••••'}
                        </code>
                        <button
                          type="button"
                          onClick={() => setShowSecret(!showSecret)}
                          className="p-1 rounded-md bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-slate-300 hover:text-neutral-900 dark:hover:text-white"
                          title={showSecret ? "Hide Key" : "Show Key"}
                        >
                          {showSecret ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                        {showSecret && (
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(enrollmentData?.secret || 'JBSWY3DPEHPK3PXP');
                              setCopiedSecret(true);
                              setTimeout(() => setCopiedSecret(false), 2000);
                            }}
                            className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
                            title="Copy Key"
                          >
                            {copiedSecret ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 2: Verify Code */}
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  if (mfaCode.length !== 6) {
                    setMfaError('Enter a valid 6-digit code');
                    return;
                  }
                  setMfaLoading(true);
                  setMfaError('');
                  try {
                    await verifyAndEnableMfa(mfaCode);
                    setMfaSuccess(true);
                  } catch (err) {
                    setMfaError(err.message || 'Invalid 6-digit code. Please try again.');
                  } finally {
                    setMfaLoading(false);
                  }
                }} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-brand-500 uppercase tracking-wider">
                      Step 2: Enter 6-Digit Authenticator Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={mfaCode}
                      onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-3 text-center text-lg font-mono tracking-[0.5em] outline-none focus:border-brand-500 text-neutral-900"
                    />
                  </div>

                  {mfaError && (
                    <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-xs text-red-600 dark:text-red-400 text-center font-medium">
                      {mfaError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={mfaLoading || mfaCode.length !== 6}
                    className="w-full py-3 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold text-xs transition-all hover:shadow-lg disabled:opacity-50"
                  >
                    {mfaLoading ? 'Verifying Code...' : 'Verify & Enable MFA'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;
