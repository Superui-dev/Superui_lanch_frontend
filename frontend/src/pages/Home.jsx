import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, Check, Zap, Sparkles, Shield, Heart, Eye, 
  ShoppingCart, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Star, BookOpen, Search,
  Monitor, Palette, Twitter, Github, Globe, Mail, Clock, Download, CheckCircle2,
  TrendingUp, Headphones, X, Loader2, Phone, ExternalLink
} from 'lucide-react';
import client, { API_BASE_URL } from '../api/client';
import { useWatchlist } from '../context/WatchlistContext';
import { useCart } from '../context/CartContext';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { useAuth } from '../context/AuthContext';
import BrandLogo from '../components/common/BrandLogo';
import LivePreviewModal from '../components/common/LivePreviewModal';

const categoryMeta = {
  'templates': { icon: Palette, color: 'bg-purple-500/10 text-purple-600 border-purple-200' },
  'ui-kits': { icon: Sparkles, color: 'bg-orange-500/10 text-orange-600 border-orange-200' }
};

const popularTags = [
  { label: 'dashboard', slug: 'ui-kits' },
  { label: 'landing page', slug: 'templates' },
  { label: 'mobile app', slug: 'ui-kits' },
  { label: 'portfolio', slug: 'templates' },
  { label: 'ecommerce', slug: 'templates' },
  { label: 'animation', slug: 'templates' },
  { label: 'illustration', slug: 'ui-kits' },
  { label: 'onboarding', slug: 'ui-kits' }
];

const faqs = [
  {
    question: 'What types of digital products do you sell?',
    answer: 'We sell a wide range of premium digital products including responsive websites, production-ready templates, e-books, and developer UI kits. All products are designed by senior engineers and ready for immediate deployment.'
  },
  {
    question: 'How do I receive my purchase?',
    answer: 'After successful checkout via Razorpay, you get instant download access on screen and an encrypted download token sent straight to your email inbox.'
  },
  {
    question: 'What is your refund policy?',
    answer: 'All purchases are final. We do not offer refunds or exchanges on digital products once the purchase is complete. Please review product details carefully before completing your order.'
  },
  {
    question: 'Can I use the products for commercial client projects?',
    answer: 'Absolutely. Every purchase includes a commercial usage license allowing you to build client projects, SaaS apps, or personal projects without royalty fees.'
  },
  {
    question: 'How do I get technical support?',
    answer: 'You can contact our engineering support team via email at hello.superui@gmail.com or via Telegram @SuperUI_Bot. We respond to all inquiries within 24 hours.'
  }
];

const testimonials = [
  {
    name: 'Rahul Kumar',
    role: 'Senior Fullstack Engineer',
    text: 'The code quality and Tailwind architecture in these templates are outstanding. Saved our team over 100 hours of design and setup time.',
    initials: 'RK'
  },
  {
    name: 'Priya Sharma',
    role: 'Product Designer',
    text: 'Extremely polished UI components with modern micro-interactions. The attention to detail is truly pro-level.',
    initials: 'PS'
  },
  {
    name: 'Arun Verma',
    role: 'SaaS Founder',
    text: 'SuperUI templates helped us launch our product MVP in just 3 days. Clean code, great documentation, and fast support.',
    initials: 'AV'
  },
  {
    name: 'Sneha Patel',
    role: 'Lead UI/UX Architect',
    text: 'Top-tier digital design assets. The dark and light mode components integrate seamlessly into existing React projects.',
    initials: 'SP'
  },
  {
    name: 'Vikram Singh',
    role: 'Web Developer',
    text: 'Instant download, well-organized folder structure, and clean Tailwind config. Worth every single rupee spent.',
    initials: 'VS'
  },
  {
    name: 'Anjali Gupta',
    role: 'Tech Lead & Educator',
    text: 'The e-books are goldmines of real-world practices. Clear, concise, and backed by actionable code repositories.',
    initials: 'AG'
  }
];

const defaultPricing = {
  sectionTitle: "Pricing with No additional dev cost",
  trustBadge: "Trusted by ★ 4.1k+ Creators",
  plans: [
    {
      id: "landing-page",
      title: "Landing Page",
      description: "For businesses that need one page to start converting, fast.",
      pricingNote: "Start with Free Hero section then $999 for a full page.",
      pricingNoteHighlight: "Free Hero",
      isFeatured: false,
      features: [
        "Single page",
        "Framer development",
        "Fully responsive",
        "High converting page",
        "Update every 24hrs",
        "1-2 week delivery",
        "14-day support"
      ]
    },
    {
      id: "full-website",
      title: "Full Website Package",
      description: "For businesses ready to build a real online presence.",
      pricingNote: "Start with 3 Free sections then $1999 for a full site.",
      pricingNoteHighlight: "3 Free sections",
      isFeatured: true,
      features: [
        "Up to 6 pages",
        "Up to 2 CMS collections",
        "Accept bookings, calls",
        "Google site index",
        "AEO + SEO optimization",
        "AI generated assets",
        "3-4 week delivery",
        "Private Slack channel"
      ]
    }
  ],
  customPlan: {
    title: "Custom Website",
    description: "For businesses with specific needs, integrations and beyond the standard plans."
  }
};

const renderPricingNote = (text, highlight) => {
  if (!highlight || !text) return text;
  const index = text.indexOf(highlight);
  if (index === -1) return text;
  return (
    <>
      {text.substring(0, index)}
      <span className="text-brand-600 font-extrabold">{highlight}</span>
      {text.substring(index + highlight.length)}
    </>
  );
};

const defaultHero = {
  badgeText: "SuperUI 2.0 Engine Released",
  headline: "Build Fast With Production-Ready Digital Assets",
  headlineHighlight: "Production-Ready",
  subheadline: "Curated e-books, developer UI kits, and high-converting React templates. Designed for senior engineers, designers, and scaling founders in Telangana, India.",
  ctaPrimaryText: "Explore Products Store",
  ctaSecondaryText: "Customer Sign Up"
};

const renderHeroHeadline = (headline, highlight) => {
  if (!highlight || !headline) return headline;
  const index = headline.indexOf(highlight);
  if (index === -1) return headline;
  return (
    <>
      {headline.substring(0, index)}
      <span className="text-neon-orange">
        {highlight}
      </span>
      {headline.substring(index + highlight.length)}
    </>
  );
};

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategoryTab, setSelectedCategoryTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const [openFaq, setOpenFaq] = useState(null);
  const [previewProduct, setPreviewProduct] = useState(null);

  // Cal.com Call Booking Wizard States
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState('calendar'); // 'calendar' | 'form' | 'success'
  const [selectedBookDate, setSelectedBookDate] = useState('');
  const [selectedBookTime, setSelectedBookTime] = useState('');
  const [bookName, setBookName] = useState('');
  const [bookEmail, setBookEmail] = useState('');
  const [bookInstagramId, setBookInstagramId] = useState('');
  const [previewInstagramId, setPreviewInstagramId] = useState('');
  const autoAdvancedRef = useRef(false);
  const fetchedSlotsRef = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPreviewInstagramId(bookInstagramId);
    }, 800);
    return () => clearTimeout(timer);
  }, [bookInstagramId]);

  const [bookPhone, setBookPhone] = useState('');
  const [bookMessage, setBookMessage] = useState('');
  const [bookingSubmitLoading, setBookingSubmitLoading] = useState(false);
  const [bookedSlots, setBookedSlots] = useState([]);

  const fetchBookedSlots = async () => {
    try {
      const res = await client.get('/api/public/booked-slots', { silent: true });
      if (res.data?.success && Array.isArray(res.data.data)) {
        setBookedSlots(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch booked slots:', err);
    }
  };

  const getInitialBookingMonthAndYear = () => {
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    if (today.getDate() >= daysInMonth) {
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      return { month: nextMonth.getMonth(), year: nextMonth.getFullYear() };
    }
    return { month: today.getMonth(), year: today.getFullYear() };
  };

  const initialDateData = getInitialBookingMonthAndYear();
  const [bookMonth, setBookMonth] = useState(initialDateData.month);
  const [bookYear, setBookYear] = useState(initialDateData.year);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  const timeSlots = [
    '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '02:00 PM', '02:30 PM',
    '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM'
  ];

  const handlePrevMonth = () => {
    const initialData = getInitialBookingMonthAndYear();
    if (bookYear === initialData.year && bookMonth === initialData.month) return;
    if (bookMonth === 0) {
      setBookMonth(11);
      setBookYear(bookYear - 1);
    } else {
      setBookMonth(bookMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (bookMonth === 11) {
      setBookMonth(0);
      setBookYear(bookYear + 1);
    } else {
      setBookMonth(bookMonth + 1);
    }
  };

  const getCleanInstagramUsername = (input) => {
    if (!input) return '';
    let clean = input.trim();
    clean = clean.replace(/^@/, '');
    try {
      if (clean.includes('instagram.com/')) {
        const parts = clean.split('instagram.com/');
        if (parts[1]) {
          clean = parts[1].split('/')[0].split('?')[0];
        }
      }
    } catch (e) {}
    return clean.trim();
  };

  const openBookingModal = (serviceName = '') => {
    setIsBookModalOpen(true);
    setBookingStep('calendar');
    setSelectedBookDate('');
    setSelectedBookTime('');
    setBookName('');
    setBookEmail('');
    setBookInstagramId('');
    setPreviewInstagramId('');
    setBookPhone('');
    setBookMessage(serviceName ? `I'm interested in your "${String(serviceName)}" service.` : '');
    autoAdvancedRef.current = false;
    const initialData = getInitialBookingMonthAndYear();
    setBookMonth(initialData.month);
    setBookYear(initialData.year);
    fetchBookedSlots();
  };

  const isFullyBooked = (dateStr) => {
    const slotsBookedForDate = bookedSlots.filter(b => b.date === dateStr).map(b => b.time);
    return timeSlots.every(slot => slotsBookedForDate.includes(slot));
  };

  const hasAvailableSlots = (dateStr) => {
    const slotsBookedForDate = bookedSlots.filter(b => b.date === dateStr).map(b => b.time);
    return timeSlots.some(slot => !slotsBookedForDate.includes(slot));
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!bookName || !bookEmail) {
      alert('Please enter your name and email.');
      return;
    }
    setBookingSubmitLoading(true);
    try {
      await client.post('/api/public/book-call', {
        name: bookName,
        email: bookEmail,
        instagramId: getCleanInstagramUsername(bookInstagramId),
        phone: bookPhone,
        date: selectedBookDate,
        time: selectedBookTime,
        message: bookMessage
      });
      setBookingStep('success');
    } catch (err) {
      alert('Booking failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setBookingSubmitLoading(false);
    }
  };

  const categoryScrollRef = useRef(null);

  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const { addToCart } = useCart();
  const { settings: siteSettings } = useSiteSettings();
  const navigate = useNavigate();
  const heroData = siteSettings?.hero && Object.keys(siteSettings.hero).length > 0
    ? siteSettings.hero
    : defaultHero;
  const services = (siteSettings?.services && Array.isArray(siteSettings.services))
    ? siteSettings.services.filter(s => s.visible !== false).sort((a, b) => (a.order || 0) - (b.order || 0))
    : [];
  const { openAuthModal, user } = useAuth();

  const handleAddToCart = (product) => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    addToCart(product);
  };

  const handleBuyNow = (product) => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    addToCart(product);
    navigate('/checkout');
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategoryTab, searchQuery, sortBy]);

  useEffect(() => {
    if (!isBookModalOpen) {
      fetchedSlotsRef.current = false;
      return;
    }
    if (autoAdvancedRef.current) return;

    const checkAndAdvance = async () => {
      let slots = bookedSlots;
      if (!fetchedSlotsRef.current && slots.length === 0) {
        fetchedSlotsRef.current = true;
        try {
          const res = await client.get('/api/public/booked-slots', { silent: true });
          if (res.data?.success && Array.isArray(res.data.data)) {
            slots = res.data.data;
            setBookedSlots(slots);
          } else {
            return;
          }
        } catch (err) {
          return;
        }
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const daysInMonth = new Date(bookYear, bookMonth + 1, 0).getDate();

      let startDay = 1;
      if (bookYear === today.getFullYear() && bookMonth === today.getMonth()) {
        startDay = today.getDate() + 1;
      }

      let hasAvailable = false;
      for (let d = startDay; d <= daysInMonth; d++) {
        const dateStr = `${bookYear}-${String(bookMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        if (hasAvailableSlots(dateStr)) {
          hasAvailable = true;
          break;
        }
      }

      if (!hasAvailable) {
        autoAdvancedRef.current = true;
        if (bookMonth === 11) {
          setBookMonth(0);
          setBookYear(bookYear + 1);
        } else {
          setBookMonth(bookMonth + 1);
        }
      }
    };

    checkAndAdvance();
  }, [isBookModalOpen, bookedSlots, bookMonth, bookYear]);

  const scrollCategories = (direction) => {
    if (categoryScrollRef.current) {
      const scrollAmount = direction === 'left' ? -250 : 250;
      categoryScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleCategoryWheel = (e) => {
    if (categoryScrollRef.current) {
      categoryScrollRef.current.scrollLeft += e.deltaY;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [productsRes, categoriesRes] = await Promise.allSettled([
          client.get('/api/public/products?limit=20', { silent: true }),
          client.get('/api/public/categories', { silent: true })
        ]);

        if (productsRes.status === 'fulfilled' && productsRes.value?.data?.success) {
          const list = productsRes.value.data.data?.products || productsRes.value.data.data;
          if (Array.isArray(list)) {
            setProducts(list);
          }
        }

        if (categoriesRes.status === 'fulfilled' && categoriesRes.value?.data?.success && Array.isArray(categoriesRes.value.data.data)) {
          setCategories(categoriesRes.value.data.data);
        }
      } catch (err) {
        console.warn('DB Products fetch warning:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const getDaysInMonth = (month, year) => {
    const date = new Date(year, month, 1);
    const days = [];
    const startDay = date.getDay();
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    const totalDays = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= totalDays; i++) {
      days.push(i);
    }
    return days;
  };

  // Filter products by category & search query
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategoryTab === 'all' || 
      (product.categoryId?.slug || product.category) === selectedCategoryTab;
    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (product.shortDescription && product.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const gridProducts = filteredProducts.filter(p => p.slug !== 'superui-admin-dashboard');

  return (
    <div className="bg-[#FAFAFA] min-h-screen text-neutral-900 selection:bg-brand-500 selection:text-white font-sans antialiased">
      
      {/* HERO SECTION WITH PRO-LEVEL BALANCED ANIMATED BACKGROUND */}
      <section className="relative pt-12 sm:pt-20 pb-16 overflow-hidden bg-[#FAFAFA]">
        
        {/* Animated Radial Grid Pattern */}
        <div className="absolute inset-0 bg-hero-grid pointer-events-none opacity-45 z-0" />

        {/* Precision Thin & Light Concentric Circle Rings & Orbiting Pulse Nodes */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1450px] h-[1450px] pointer-events-none z-0 flex items-center justify-center select-none opacity-60">
          {/* Outer Ring 1 (Ultra thin & light) */}
          <div className="absolute w-[1350px] h-[1350px] rounded-full border border-neutral-200/40 animate-spin-slow" style={{ animationDuration: '45s' }} />
          
          {/* Orbit Ring 2 with Light Dashed Border & Subtle Nodes */}
          <div className="absolute w-[1020px] h-[1020px] rounded-full border border-dashed border-brand-500/15 animate-spin-slow flex items-center justify-between p-1" style={{ animationDuration: '32s', animationDirection: 'reverse' }}>
            <div className="h-2 w-2 rounded-full bg-brand-500/70 shadow-[0_0_8px_rgba(255,81,0,0.4)] animate-orbit-pulse -ml-1" />
            <div className="h-2 w-2 rounded-full bg-orange-400/70 shadow-[0_0_8px_rgba(255,81,0,0.4)] animate-orbit-pulse -mr-1" />
          </div>
          
          {/* Ring 3 (Ultra Light Solid Line) */}
          <div className="absolute w-[740px] h-[740px] rounded-full border border-neutral-200/50 animate-pulse-glow" />

          {/* Ring 4 (Inner Dashed Circle with Light Pulse Dots) */}
          <div className="absolute w-[480px] h-[480px] rounded-full border border-dashed border-orange-400/20 animate-spin-slow flex flex-col justify-between items-center p-1" style={{ animationDuration: '20s' }}>
            <div className="h-1.5 w-1.5 rounded-full bg-orange-400/60 shadow-[0_0_6px_rgba(255,81,0,0.3)] animate-orbit-pulse -mt-0.75" />
            <div className="h-1.5 w-1.5 rounded-full bg-brand-500/60 shadow-[0_0_6px_rgba(255,81,0,0.3)] animate-orbit-pulse -mb-0.75" />
          </div>

          {/* Crosshair Radial Axis Lines - Ultra Light */}
          <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-neutral-200/40 to-transparent" />
          <div className="absolute h-full w-px bg-gradient-to-b from-transparent via-neutral-200/40 to-transparent" />
        </div>

        {/* Pro Balanced Ambient Aurora Glow */}
        <div className="absolute -top-36 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-r from-brand-500/22 via-orange-500/18 to-purple-600/18 blur-[140px] rounded-full animate-aurora pointer-events-none z-0" />

        <div className="mx-auto max-w-7xl 2xl:max-w-[1700px] px-3 sm:px-6 lg:px-8 2xl:px-12 text-center relative z-10">

          {/* Badge Pill */}
          {heroData.badgeText && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 border border-brand-200 text-brand-600 text-xs font-bold shadow-sm mb-6 animate-fade-in">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{heroData.badgeText}</span>
            </div>
          )}

          {/* Hero Main Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-neutral-900 tracking-tight leading-[1.1] max-w-4xl mx-auto">
            {renderHeroHeadline(heroData.headline, heroData.headlineHighlight)}
          </h1>

          <p className="mt-6 text-base sm:text-lg text-neutral-600 max-w-2xl mx-auto font-medium leading-relaxed">
            {heroData.subheadline}
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            {heroData.ctaPrimaryText && (
              <Link
                to="/products"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-neutral-900 hover:bg-brand-600 text-white text-sm font-bold shadow-xl transition-all hover:shadow-brand-500/20"
              >
                <span>{heroData.ctaPrimaryText}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}

            {heroData.ctaSecondaryText && (
              <button
                onClick={() => openAuthModal('signup')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white border border-neutral-300 hover:bg-neutral-100 text-neutral-900 text-sm font-bold shadow-sm transition-all"
              >
                <Shield className="h-4 w-4 text-brand-600" />
                <span>{heroData.ctaSecondaryText}</span>
              </button>
            )}
          </div>

          {/* Social Proof metrics */}
          <div className="mt-12 inline-flex flex-wrap items-center justify-center gap-3 sm:gap-6 px-6 sm:px-8 py-3 rounded-full bg-white/90 border border-neutral-200/90 shadow-md text-xs font-semibold text-neutral-600 max-w-4xl mx-auto backdrop-blur-md">
            
            {/* Metric 1: Instant Digital Delivery */}
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-full bg-brand-50 text-brand-600 shrink-0">
                <Zap className="h-4 w-4 fill-brand-600/20 text-brand-600" />
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-extrabold text-neutral-900">Instant</span>
                <span className="text-neutral-600 font-medium">Digital Delivery</span>
              </div>
            </div>

            <div className="hidden sm:block h-4 w-px bg-neutral-300" />

            {/* Metric 2: 100% Clean Source Code */}
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-full bg-emerald-50 text-emerald-600 shrink-0">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-extrabold text-neutral-900">100%</span>
                <span className="text-neutral-600 font-medium">Clean Source Code</span>
              </div>
            </div>

            <div className="hidden sm:block h-4 w-px bg-neutral-300" />

            {/* Metric 3: Rating */}
            <div className="flex items-center gap-2">
              <div className="flex text-amber-400 shrink-0">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="h-3.5 w-3.5 fill-current" />
                ))}
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-extrabold text-neutral-900">4.9/5</span>
                <span className="text-neutral-600 font-medium">User Rating</span>
              </div>
            </div>

          </div>

          {/* Hero Widescreen Showcase Container with Spinning Halo Ring */}
          <div className="mt-12 sm:mt-16 relative max-w-[1550px] w-full mx-auto px-2 sm:px-4">
            
            {/* Spinning Gradient Halo Ring */}
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[850px] h-[550px] bg-gradient-to-r from-brand-500/30 via-orange-400/25 to-sky-400/30 blur-[130px] rounded-full animate-spin-slow pointer-events-none z-0" />
            
            <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-full h-52 bg-gradient-to-t from-[#FAFAFA] via-[#FAFAFA]/90 to-transparent blur-2xl pointer-events-none z-20" />
            <div className="absolute -bottom-14 left-1/4 w-[550px] h-48 bg-orange-400/30 blur-3xl rounded-full pointer-events-none z-0 animate-smoke-1" />
            <div className="absolute -bottom-14 right-1/4 w-[550px] h-48 bg-sky-300/30 blur-3xl rounded-full pointer-events-none z-0 animate-smoke-2" />

            <div className="relative z-10 rounded-2xl sm:rounded-3xl p-1 bg-white border border-neutral-200/90 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.12)] overflow-hidden transition-all duration-500 hover:scale-[1.002]">
              <img
                src="/Home/dashboard_preview.png"
                alt="SuperUI Admin Dashboard Widescreen Live Showcase"
                className="w-full h-auto object-cover object-top rounded-xl sm:rounded-2xl shadow-inner"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent rounded-xl sm:rounded-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">Premium Template</p>
                  <h3 className="text-base sm:text-lg font-extrabold text-white">SuperUI Admin Dashboard</h3>
                </div>
                <div className="flex items-center gap-2.5">
                  <Link
                    to="/products"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-neutral-900 text-xs font-bold hover:bg-neutral-100 transition-colors shadow-lg"
                  >
                    <span>View More</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <button
                    onClick={() => {
                      const product = products.find(p => p.slug === 'superui-admin-dashboard') || products[0];
                      if (product) handleBuyNow(product);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 transition-colors shadow-lg"
                  >
                    <ShoppingCart className="h-3.5 w-3.5" />
                    <span>Buy Now</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEARCH BAR & CATEGORY TAG FILTER SECTION (As shown in reference image) */}
      <section className="py-12 bg-white border-y border-neutral-200/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          {/* Search Pill Input (Matching Reference Image) */}
          <div className="relative max-w-4xl mx-auto mb-8">
            <input
              type="text"
              placeholder="What type of design are you interested in?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-7 pr-16 py-4 sm:py-5 rounded-full border border-neutral-200/90 bg-neutral-100/70 text-sm font-medium text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-brand-500 shadow-sm transition-all"
            />
            <button type="button" className="absolute right-2.5 top-1/2 -translate-y-1/2 p-3.5 rounded-full bg-brand-600 hover:bg-brand-700 text-white transition-colors shadow-md">
              <Search className="h-4 w-4" />
            </button>
          </div>

          {/* Popular Category Filter Pills Row (Matching Reference Image media_1787995973136.png) */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            
            {/* Left side: Scrollable Admin Categories Row with Arrow Buttons & Mouse Scroll */}
            <div className="flex items-center gap-2 overflow-hidden relative flex-1 min-w-0">
              <span className="text-xs font-bold text-neutral-900 shrink-0 mr-1">Categories:</span>

              {/* Left Scroll Arrow */}
              <button
                onClick={() => scrollCategories('left')}
                className="p-2 rounded-full border border-neutral-200 bg-white hover:bg-neutral-100 text-neutral-700 shadow-sm shrink-0 transition-colors"
                title="Scroll left"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>

              {/* Horizontally Scrollable Pills Container with Mouse Wheel Scroll support */}
              <div
                ref={categoryScrollRef}
                onWheel={handleCategoryWheel}
                className="flex items-center gap-2 overflow-x-auto py-1 scroll-smooth no-scrollbar select-none"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                <button
                  onClick={() => setSelectedCategoryTab('all')}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategoryTab === 'all'
                      ? 'bg-neutral-900 text-white shadow-sm'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  All Assets
                </button>

                {categories.map((cat) => (
                  <button
                    key={cat.slug}
                    onClick={() => setSelectedCategoryTab(cat.slug)}
                    className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                      selectedCategoryTab === cat.slug
                        ? 'bg-neutral-900 text-white shadow-sm'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Right Scroll Arrow */}
              <button
                onClick={() => scrollCategories('right')}
                className="p-2 rounded-full border border-neutral-200 bg-white hover:bg-neutral-100 text-neutral-700 shadow-sm shrink-0 transition-colors"
                title="Scroll right"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Right side: Filter / Sort Dropdown */}
            <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 rounded-xl border border-neutral-200 bg-white text-xs font-bold text-neutral-800 shadow-sm focus:outline-none cursor-pointer hover:border-neutral-300"
              >
                <option value="popular">Popular ∨</option>
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

        </div>
      </section>

      {/* REAL DB PRODUCT CARDS GRID SECTION (Strictly DB Products, No Fake Defaults) */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl 2xl:max-w-[1700px] px-3 sm:px-6 lg:px-8 2xl:px-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600">Verified Database Store</h2>
              <p className="text-2xl sm:text-4xl font-extrabold text-neutral-900 mt-1">
                Store Products Catalog ({gridProducts.length})
              </p>
            </div>
            <Link
              to="/products"
              className="mt-4 sm:mt-0 text-xs font-bold text-neutral-700 hover:text-brand-600 flex items-center gap-1.5 px-4 py-2 rounded-xl border border-neutral-200 bg-white shadow-sm hover:bg-neutral-50 transition-colors"
            >
              <span>View Full Catalog</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-600"></div>
            </div>
          ) : gridProducts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-neutral-200 p-8 space-y-3">
              <p className="text-base font-bold text-neutral-900">No store products match your filter.</p>
              <p className="text-xs text-neutral-500">Try selecting "All Assets" or clear your search input.</p>
              <button
                onClick={() => { setSelectedCategoryTab('all'); setSearchQuery(''); }}
                className="px-5 py-2 rounded-xl bg-neutral-900 text-white text-xs font-bold"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <>
              {/* Product Grid (Exactly 12 cards per page, 3 cards per row max) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {(() => {
                  const totalPages = Math.ceil(gridProducts.length / itemsPerPage);
                  const startIndex = (currentPage - 1) * itemsPerPage;
                  const paginatedProducts = gridProducts.slice(startIndex, startIndex + itemsPerPage);

                   return paginatedProducts.map((product, idx) => {
                     const watched = isInWatchlist(product._id);
                     const categoryName = product.categoryId?.name || 'Digital Asset';
                     const discount = product.compareAtPrice && product.compareAtPrice > product.price
                       ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
                       : 0;

                     return (
                       <div
                         key={product._id || idx}
                         className="group bg-white rounded-2xl border border-neutral-200/80 overflow-hidden hover:border-brand-200 hover:shadow-xl transition-all duration-300 flex flex-col"
                       >
                         {/* Product Thumbnail */}
                         <div className="relative aspect-[16/11] overflow-hidden bg-neutral-100">
                           <img
                             src={product.thumbnail?.url || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80'}
                             alt={product.name}
                             className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                           />
                           
                           {/* Category Badge */}
                           <div className="absolute top-3 left-3">
                             <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-[10px] font-bold text-neutral-700 shadow-sm">
                               {categoryName}
                             </span>
                           </div>

                           {/* Action Stack: Wishlist Button + Preview Eye Icon (Directly Bottom) */}
                           <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
                             <button
                               type="button"
                               onClick={() => {
                                 if (!user) {
                                   openAuthModal('login');
                                 } else {
                                   toggleWatchlist(product._id);
                                 }
                               }}
                               className={`p-2 rounded-full backdrop-blur-md shadow-sm transition-all transform hover:scale-110 ${
                                 watched
                                   ? 'bg-red-50 text-red-600 border border-red-200'
                                   : 'bg-white/90 text-neutral-600 hover:text-red-600 border border-neutral-200/80 hover:bg-white'
                               }`}
                               title={watched ? 'Remove from Watchlist' : 'Add to Watchlist'}
                             >
                               <Heart className={`h-3.5 w-3.5 ${watched ? 'fill-current' : ''}`} />
                             </button>

                             <button
                               type="button"
                               onClick={() => setPreviewProduct(product)}
                               className="p-2 rounded-full bg-white/90 hover:bg-neutral-900 text-neutral-700 hover:text-white border border-neutral-200/80 backdrop-blur-md shadow-sm transition-all transform hover:scale-110"
                               title="Website Full View Live Preview"
                             >
                               <Eye className="h-3.5 w-3.5" />
                             </button>
                           </div>
                         </div>

                         {/* Card Content */}
                         <div className="p-5 flex flex-col flex-1">
                           <Link to={`/products/${product.slug}`} className="block mb-2">
                             <h3 className="text-sm font-bold text-neutral-900 line-clamp-1 group-hover:text-brand-600 transition-colors">
                               {product.name}
                             </h3>
                           </Link>

                           <p className="text-[11px] text-neutral-500 line-clamp-2 leading-relaxed mb-4 flex-1">
                             {product.shortDescription || 'Production ready digital asset template for developers.'}
                           </p>

                           {/* Price Section */}
                           <div className="flex items-center justify-between mb-4">
                             <div className="flex items-baseline gap-2">
                               <span className="text-base font-extrabold text-neutral-900">
                                 ₹{(product.price || product.sellingPrice || 1499).toLocaleString()}
                               </span>
                               {product.compareAtPrice && product.compareAtPrice > (product.price || product.sellingPrice) && (
                                 <span className="text-[11px] text-neutral-400 line-through">
                                   ₹{product.compareAtPrice.toLocaleString()}
                                 </span>
                               )}
                             </div>
                             {discount > 0 && (
                               <span className="text-[10px] font-extrabold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                                 {discount}% OFF
                               </span>
                             )}
                           </div>

                           {/* Action Buttons */}
                           <div className="flex items-center gap-2">
                             {product.preview?.url && (
                               <a
                                 href={product.preview.url}
                                 target="_blank"
                                 rel="noopener noreferrer"
                                 className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs font-bold transition-all"
                               >
                                 <span>Preview</span>
                               </a>
                             )}
                              <button
                                onClick={() => handleAddToCart(product)}
                                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition-all"
                              >
                                <ShoppingCart className="h-3.5 w-3.5" />
                                <span>Add</span>
                              </button>
                              <button
                                onClick={() => handleBuyNow(product)}
                                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#ff5100] hover:bg-[#e64d00] text-white text-xs font-bold transition-all shadow-sm"
                              >
                                <span>Buy Now</span>
                              </button>
                           </div>
                         </div>
                       </div>
                     );
                   });
                })()}
              </div>

              {/* Pagination Controls Bar (12 cards per page) */}
              {(() => {
                const totalPages = Math.ceil(gridProducts.length / itemsPerPage);
                const startIndex = (currentPage - 1) * itemsPerPage;
                const endIndex = Math.min(startIndex + itemsPerPage, gridProducts.length);

                if (totalPages <= 1) return null;

                return (
                  <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-neutral-200/80">
                     <p className="text-xs font-semibold text-neutral-500">
                       Showing <span className="font-bold text-neutral-900">{startIndex + 1}</span>–<span className="font-bold text-neutral-900">{endIndex}</span> of <span className="font-bold text-neutral-900">{gridProducts.length}</span> products
                     </p>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3.5 py-2 rounded-xl border border-neutral-200 bg-white text-xs font-bold text-neutral-700 hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm cursor-pointer"
                      >
                        Previous
                      </button>

                      {[...Array(totalPages)].map((_, i) => {
                        const pageNum = i + 1;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`h-9 w-9 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer ${
                              currentPage === pageNum
                                ? 'bg-neutral-900 text-white shadow-md'
                                : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-3.5 py-2 rounded-xl border border-neutral-200 bg-white text-xs font-bold text-neutral-700 hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm cursor-pointer"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                );
              })()}
            </>
          )}
        </div>
      </section>

      {/* SERVICES WE OFFER SECTION (Matching user pattern same-to-same) */}
      <section className="py-20 bg-white border-t border-neutral-200/80">
        <div className="mx-auto max-w-7xl 2xl:max-w-[1700px] px-4 sm:px-6 lg:px-8 2xl:px-12 text-center space-y-8">
          
          <div className="space-y-3">
            <h2 className="text-4xl sm:text-5xl font-black text-neutral-900 tracking-tight">
              Services <span className="font-medium text-neutral-500">We Offer</span>
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto font-bold leading-relaxed">
              From first click to final conversion, every service is built around one goal: growing your business.
            </p>
            <div className="pt-3">
              <button
                onClick={openBookingModal}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md hover:shadow-brand-500/20 transition-all duration-200"
              >
                <Phone className="h-3.5 w-3.5 text-white fill-current shrink-0" />
                <span>Book a Free Call</span>
                <div className="p-1 rounded-full bg-white/20">
                  <ArrowRight className="h-3 w-3 text-white rotate-[-45deg]" />
                </div>
              </button>
            </div>
          </div>

          {services.length === 0 ? (
            <div className="text-center py-16 text-neutral-400 text-sm font-medium">
              No services configured yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left max-w-6xl mx-auto pt-8">
              {services.map((service, idx) => (
                <Link
                  key={idx}
                  to={service.link || '/contact'}
                  className="group relative h-[340px] rounded-3xl overflow-hidden cursor-pointer block border border-neutral-200/60 shadow-sm hover:shadow-2xl hover:shadow-neutral-300/40 hover:border-neutral-300/80 transition-all duration-500"
                >
                  {/* Image */}
                  <img
                    src={service.bgImage || service.image}
                    alt={service.title}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/600x400?text=No+Image'; }}
                  />
                  {/* Gradient overlay - deeper at top for readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/5" />
                  {/* Top accent line */}
                  <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-brand-500 via-orange-400 to-purple-500 opacity-80 group-hover:opacity-100 transition-opacity" />
                  {/* Content */}
                  <div className="absolute inset-0 p-6 flex flex-col justify-end">
                    {/* Service number badge */}
                    <div className="mb-3">
                      <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[10px] font-extrabold text-white">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <h3 className="text-base font-extrabold text-white mb-1.5 tracking-tight leading-tight">
                      {service.title}
                    </h3>
                    <p className="text-[11px] text-white/75 font-medium leading-relaxed line-clamp-2 mb-4">
                      {service.description}
                    </p>
                    {/* CTA with animated arrow */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        openBookingModal(service.title);
                      }}
                      className="inline-flex items-center gap-2 text-[11px] font-bold text-white bg-white/15 backdrop-blur-sm border border-white/20 px-4 py-2.5 rounded-xl w-fit group-hover:bg-white/25 group-hover:border-white/40 transition-all duration-300"
                    >
                      <span>Book a call now</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                    </button>
                  </div>
                  {/* Subtle shine effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
                </Link>
              ))}
            </div>
          )}

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-6xl mx-auto pt-6">
            
            {((siteSettings?.pricing?.plans && Array.isArray(siteSettings.pricing.plans)) 
              ? siteSettings.pricing.plans 
              : defaultPricing.plans).map((plan) => {
                const Icon = plan.id === 'landing-page' ? Monitor : Globe;
                return (
                  <div 
                    key={plan.id}
                    className={`lg:col-span-6 bg-white p-8 rounded-2xl space-y-6 relative overflow-hidden text-left ${
                      plan.isFeatured 
                        ? 'border-2 border-brand-500/30 shadow-md' 
                        : 'border border-neutral-200/85 shadow-sm'
                    }`}
                  >
                    {/* Star corner decoration pill */}
                    {plan.isFeatured && (
                      <div className="absolute top-4 right-4 h-6 w-6 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center border border-brand-100">
                        <Star className="h-3.5 w-3.5 fill-current text-brand-600" />
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="h-8 w-8 rounded-lg bg-brand-50 flex items-center justify-center border border-brand-100">
                        <Icon className="h-4.5 w-4.5 text-brand-600" />
                      </div>
                      <h3 className="text-xl font-extrabold text-neutral-900 mt-3">{plan.title}</h3>
                      <p className="text-xs text-neutral-500 font-bold leading-relaxed">
                        {plan.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        onClick={openBookingModal}
                        className={`inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all duration-200 shadow-md ${
                          plan.isFeatured
                            ? 'bg-brand-600 hover:bg-brand-700 text-white hover:shadow-brand-500/20'
                            : 'border border-brand-500/20 bg-brand-50 hover:bg-brand-100 text-brand-600'
                        }`}
                      >
                        <Phone className={`h-3.5 w-3.5 fill-current shrink-0 ${plan.isFeatured ? 'text-white' : 'text-brand-600'}`} />
                        <span>Book a Free Call</span>
                        <div className={`p-0.5 rounded-full ${plan.isFeatured ? 'bg-white/20' : 'bg-brand-200/50'}`}>
                          <ArrowRight className={`h-2.5 w-2.5 rotate-[-45deg] ${plan.isFeatured ? 'text-white' : 'text-brand-600'}`} />
                        </div>
                      </button>
                      <div className="text-[10px] text-neutral-400 font-bold max-w-[200px] leading-snug">
                        {renderPricingNote(plan.pricingNote, plan.pricingNoteHighlight)}
                      </div>
                    </div>

                    <div className="pt-6 border-t border-neutral-100 space-y-4">
                      <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">
                        {plan.isFeatured ? 'Everything in LP, plus:' : 'What you get?'}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-neutral-600 font-semibold">
                        {(plan.features || []).map((feature, fIdx) => (
                          <div 
                            key={fIdx} 
                            className={`flex items-center gap-2 ${
                              plan.isFeatured ? '' : fIdx === (plan.features || []).length - 1 ? 'col-span-2' : ''
                            }`}
                          >
                            <Check className="h-4 w-4 text-brand-600 shrink-0" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}

            {/* Custom Website Row Banner (Glassmorphism + Blur Background Image) */}
            <div className="relative lg:col-span-12 rounded-3xl overflow-hidden border border-white/20 shadow-xl p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 w-full text-left transition-all duration-500 group">
              {/* Background Image */}
              <img
                src="https://beeimg.com/images/j34824302021.jpg"
                alt="Custom Website Background"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Glassmorphism Backdrop Blur & Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-neutral-950/70 backdrop-blur-xl bg-gradient-to-r from-neutral-950/90 via-neutral-950/75 to-neutral-900/60" />
              {/* Glowing Top Accent */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-brand-500 via-orange-400 to-purple-500 opacity-80" />

              {/* Content */}
              <div className="relative z-10 space-y-1.5 max-w-2xl">
                <h3 className="text-lg font-extrabold text-white tracking-tight">
                  {siteSettings?.pricing?.customPlan?.title || defaultPricing.customPlan.title}
                </h3>
                <p className="text-xs text-white/80 font-medium leading-relaxed">
                  {siteSettings?.pricing?.customPlan?.description || defaultPricing.customPlan.description}
                </p>
              </div>

              {/* Action Button */}
              <button
                onClick={openBookingModal}
                className="relative z-10 inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/30 text-white text-xs font-bold backdrop-blur-md shadow-lg transition-all duration-300 shrink-0 self-stretch sm:self-auto justify-center group/btn"
              >
                <Phone className="h-4 w-4 text-brand-400 fill-current shrink-0" />
                <span>Book a Free Call</span>
                <div className="p-1 rounded-full bg-white/20 group-hover/btn:translate-x-0.5 transition-transform">
                  <ArrowRight className="h-3 w-3 text-white rotate-[-45deg]" />
                </div>
              </button>
            </div>

          </div>

          {/* Core pricing trust checks footer */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-600 font-bold pt-4">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-neutral-900 fill-neutral-900/10" />
              <span>Smooth communication</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-neutral-900 fill-neutral-900/10" />
              <span>10+ successful sites</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-neutral-900 fill-neutral-900/10" />
              <span>Flexible revisions</span>
            </div>
          </div>

        </div>
      </section>

      {/* INFINITE SCROLLING TESTIMONIALS SECTION */}
      <section className="py-20 bg-[#FAFAFA] overflow-hidden border-t border-neutral-200/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center mb-12">
          <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600 mb-2">Loved by Developers</h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-neutral-900">What Our Customers Say</p>
          <p className="mt-2 text-xs sm:text-sm text-neutral-500 max-w-xl mx-auto">
            Trusted by senior engineers, product managers, and founders worldwide.
          </p>
        </div>

        {/* Marquee Row 1 (Scrolls Left Seamless Gapless Loop) */}
        <div className="relative w-full overflow-hidden mb-6 select-none">
          <div className="animate-marquee flex gap-6 pr-6">
            {[...testimonials, ...testimonials, ...testimonials, ...testimonials].map((item, idx) => (
              <div
                key={idx}
                className="w-[340px] sm:w-[380px] shrink-0 p-6 rounded-2xl bg-white border border-neutral-200/90 shadow-sm space-y-4 hover:border-neutral-300 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-xs">
                    {item.initials}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-neutral-900">{item.name}</h4>
                    <p className="text-[11px] text-neutral-400 font-medium">{item.role}</p>
                  </div>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                  "{item.text}"
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Marquee Row 2 (Scrolls Right Seamless Gapless Loop) */}
        <div className="relative w-full overflow-hidden select-none">
          <div className="animate-marquee-reverse flex gap-6 pr-6">
            {[...testimonials, ...testimonials, ...testimonials, ...testimonials].reverse().map((item, idx) => (
              <div
                key={idx}
                className="w-[340px] sm:w-[380px] shrink-0 p-6 rounded-2xl bg-white border border-neutral-200/90 shadow-sm space-y-4 hover:border-neutral-300 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-xs">
                    {item.initials}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-neutral-900">{item.name}</h4>
                    <p className="text-[11px] text-neutral-400 font-medium">{item.role}</p>
                  </div>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                  "{item.text}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-20 bg-white border-t border-neutral-200/80">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600 mb-2">Got Questions?</h2>
            <p className="text-3xl font-extrabold text-neutral-900">Frequently Asked Questions</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-neutral-200/80 bg-neutral-50/50 overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-6 py-5 text-left font-bold text-neutral-900 flex items-center justify-between text-sm sm:text-base"
                >
                  <span>{faq.question}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="h-4 w-4 text-brand-600 shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-neutral-400 shrink-0" />
                  )}
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-5 text-xs sm:text-sm text-neutral-600 leading-relaxed border-t border-neutral-200/60 pt-4 bg-white">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CAL.COM CALL BOOKING MODAL */}
      {isBookModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 animate-fade-in">
          <div className="bg-[#131313] text-white rounded-3xl border border-neutral-800 w-full max-w-[950px] overflow-hidden flex flex-col md:flex-row relative max-h-[90vh] md:max-h-[640px] shadow-2xl">
            
            {/* Close Button */}
            <button
              onClick={() => {
                setIsBookModalOpen(false);
              }}
              className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-full bg-neutral-900/50 hover:bg-neutral-800/80 z-20 transition-all"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            {/* Left Column: Details (32% width) */}
            <div className="w-full md:w-[32%] p-6 md:p-8 border-b md:border-b-0 md:border-r border-neutral-800 space-y-6 shrink-0 bg-[#0A0A0A] text-left">
              <div className="flex items-center gap-3">
                <BrandLogo className="h-8 w-8" hideText />
                <span className="text-white font-extrabold text-sm tracking-tight">SuperUI</span>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight leading-snug">Project Discovery Call</h3>
                <p className="text-xs text-neutral-400 font-medium leading-relaxed">
                  Book a free 30-minute call to discuss your project. We'll cover your goals, audience, and needs so we can give you a clear plan and timeline.
                </p>
              </div>

              <div className="space-y-3.5 pt-4 border-t border-neutral-800 text-neutral-400 text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-neutral-500" />
                  <span>30m</span>
                </div>
                <div className="flex items-center gap-2">
                  <Monitor className="h-4 w-4 text-neutral-500" />
                  <span>Voice Call</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-neutral-500" />
                  <span>Telangana, India</span>
                </div>
              </div>
            </div>

            {/* Right Side: Custom Booker System */}
            <div className="flex-grow p-6 md:p-8 md:pt-12 md:pr-14 bg-[#131313] overflow-y-auto min-h-0 text-left relative flex flex-col justify-start items-stretch">
              {bookingStep === 'calendar' && (
                <div className="space-y-6 flex flex-col justify-between flex-grow">
                  <div className="space-y-4">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-brand-500 mb-2">
                      1. Select Date & Time
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                      {/* Left: Calendar grid */}
                      <div className="border border-neutral-800 p-5 rounded-2xl bg-neutral-950/40">
                        {/* Month navigation header - centered and white text */}
                        <div className="flex items-center justify-between mb-4 px-1">
                          <button
                            type="button"
                            onClick={handlePrevMonth}
                            disabled={bookYear === getInitialBookingMonthAndYear().year && bookMonth === getInitialBookingMonthAndYear().month}
                            className="p-1 px-2.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                          >
                            &lt;
                          </button>
                          <span className="text-xs font-extrabold text-white tracking-wide">
                            {monthNames[bookMonth]} {bookYear}
                          </span>
                          <button
                            type="button"
                            onClick={handleNextMonth}
                            className="p-1 px-2.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white cursor-pointer transition-colors"
                          >
                            &gt;
                          </button>
                        </div>

                        <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-extrabold text-neutral-500 mb-2">
                          {daysOfWeek.map(day => (
                            <div key={day}>{day}</div>
                          ))}
                        </div>

                        <div className="grid grid-cols-7 gap-2">
                          {(() => {
                            const daysInMonth = new Date(bookYear, bookMonth + 1, 0).getDate();
                            const firstDayIndex = new Date(bookYear, bookMonth, 1).getDay();
                            const prevMonthDays = new Date(bookYear, bookMonth, 0).getDate();

                            const cells = [];
                            
                            // 1. Previous Month Muted Padding Days
                            for (let i = firstDayIndex - 1; i >= 0; i--) {
                              const d = prevMonthDays - i;
                              cells.push(
                                <div
                                  key={`prev-${d}`}
                                  className="aspect-square text-xs font-bold rounded-xl flex items-center justify-center text-neutral-750 opacity-20 cursor-not-allowed"
                                >
                                  {d}
                                </div>
                              );
                            }

                             // 2. Current Month Selectable Days
                             for (let d = 1; d <= daysInMonth; d++) {
                               const dateStr = `${bookYear}-${String(bookMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                               const dateToCheck = new Date(bookYear, bookMonth, d);
                               const todayVal = new Date();
                               todayVal.setHours(0, 0, 0, 0);
                               
                               const isSelectable = dateToCheck > todayVal && !isFullyBooked(dateStr);
                               const isSelected = selectedBookDate === dateStr;

                              cells.push(
                                <button
                                  key={`day-${d}`}
                                  type="button"
                                  disabled={!isSelectable}
                                  onClick={() => {
                                    setSelectedBookDate(dateStr);
                                    setSelectedBookTime(''); // Reset time on date change
                                  }}
                                  className={`aspect-square text-xs font-bold rounded-xl transition-all ${
                                    isSelected
                                      ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25'
                                      : isSelectable
                                      ? 'bg-neutral-900 text-neutral-200 hover:bg-neutral-800 hover:text-white cursor-pointer'
                                      : 'bg-transparent text-neutral-750 opacity-20 cursor-not-allowed'
                                  }`}
                                >
                                  {d}
                                </button>
                              );
                            }

                            // 3. Next Month Muted Padding Days
                            const totalRendered = cells.length;
                            const nextMonthNeeded = 42 - totalRendered;
                            for (let d = 1; d <= nextMonthNeeded; d++) {
                              cells.push(
                                <div
                                  key={`next-${d}`}
                                  className="aspect-square text-xs font-bold rounded-xl flex items-center justify-center text-neutral-750 opacity-20 cursor-not-allowed"
                                >
                                  {d}
                                </div>
                              );
                            }

                            return cells;
                          })()}
                        </div>
                      </div>

                      {/* Right: Time Slots */}
                      <div className="space-y-3">
                        <h5 className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500">
                          Available Slots {selectedBookDate ? `for ${selectedBookDate}` : ''}
                        </h5>
                        
                        {!selectedBookDate ? (
                          <div className="h-full flex items-center justify-center p-8 border border-dashed border-neutral-800 rounded-2xl text-center text-xs text-neutral-500">
                            Please select a date from the calendar first.
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-2 max-h-[170px] overflow-y-auto pr-1">
                            {timeSlots.map(slot => {
                              const isSelected = selectedBookTime === slot;
                              const isBooked = bookedSlots.some(b => b.date === selectedBookDate && b.time === slot);
                              return (
                                <button
                                  key={slot}
                                  type="button"
                                  disabled={isBooked}
                                  onClick={() => setSelectedBookTime(slot)}
                                  className={`py-2 px-3 text-[11px] font-bold rounded-xl border transition-all ${
                                    isSelected
                                      ? 'bg-brand-600 text-white border-brand-500 shadow-md shadow-brand-500/10 cursor-pointer'
                                      : isBooked
                                      ? 'bg-neutral-950/40 text-neutral-650 border-neutral-900 line-through opacity-25 cursor-not-allowed'
                                      : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:bg-neutral-800 hover:text-white cursor-pointer'
                                  }`}
                                >
                                  {slot}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={!selectedBookDate || !selectedBookTime}
                    onClick={() => setBookingStep('form')}
                    className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-extrabold disabled:opacity-40 disabled:cursor-not-allowed transition-all mt-4"
                  >
                    Next: Enter Details
                  </button>
                </div>
              )}

              {bookingStep === 'form' && (
                <form onSubmit={handleBookingSubmit} className="space-y-5 flex flex-col justify-between flex-grow">
                  <div className="space-y-4">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-brand-500">
                      2. Enter Booking Details
                    </h4>
                    
                    <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs space-y-1">
                      <p className="text-neutral-400 font-semibold">Selected Session Time:</p>
                      <p className="text-white font-extrabold text-xs">
                        {new Date(selectedBookDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} at {selectedBookTime} (IST)
                      </p>
                    </div>

                    <div className="space-y-3.5 text-xs text-left">
                      <div>
                        <label className="block text-neutral-400 font-bold mb-1.5 uppercase text-[9px]">Full Name</label>
                        <input
                          type="text"
                          required
                          value={bookName}
                          onChange={(e) => setBookName(e.target.value)}
                          placeholder="Your Name"
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white placeholder:text-neutral-650 focus:outline-none focus:border-brand-500 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-neutral-400 font-bold mb-1.5 uppercase text-[9px]">Email Address</label>
                        <input
                          type="email"
                          required
                          value={bookEmail}
                          onChange={(e) => setBookEmail(e.target.value)}
                          placeholder="your.email@example.com"
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white placeholder:text-neutral-650 focus:outline-none focus:border-brand-500 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-neutral-400 font-bold mb-1.5 uppercase text-[9px]">Instagram ID</label>
                        <input
                          type="text"
                          value={bookInstagramId}
                          onChange={(e) => setBookInstagramId(e.target.value)}
                          placeholder="@username"
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white placeholder:text-neutral-650 focus:outline-none focus:border-brand-500 transition-all"
                        />
                        {getCleanInstagramUsername(bookInstagramId) && (
                          <div className="mt-2.5 p-3 rounded-xl bg-neutral-950 border border-neutral-850 space-y-2 animate-fade-in text-left">
                            <div className="text-[10px] text-neutral-400 font-semibold flex items-center gap-1.5">
                              <span>Verify Link:</span>
                              <a
                                href={`https://instagram.com/${getCleanInstagramUsername(bookInstagramId)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-brand-500 hover:text-brand-400 hover:underline flex items-center gap-0.5 transition-colors font-bold"
                              >
                                instagram.com/{getCleanInstagramUsername(bookInstagramId)}
                                <ExternalLink className="h-2.5 w-2.5 inline" />
                              </a>
                            </div>
                            <div className="text-[10px] text-brand-500 font-extrabold leading-relaxed border-t border-neutral-900 pt-1.5 flex items-start gap-1">
                              <span>⚠️</span>
                              <span>Please enter your correct Instagram ID. Our team will call/contact you on Instagram only.</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-neutral-400 font-bold mb-1.5 uppercase text-[9px]">Main Cell Number</label>
                        <input
                          type="tel"
                          required
                          value={bookPhone}
                          onChange={(e) => setBookPhone(e.target.value)}
                          placeholder="e.g. +91 98765 43210"
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white placeholder:text-neutral-650 focus:outline-none focus:border-brand-500 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-neutral-400 font-bold mb-1.5 uppercase text-[9px]">Message / Requirements (Optional)</label>
                        <textarea
                          rows={3}
                          value={bookMessage}
                          onChange={(e) => setBookMessage(e.target.value)}
                          placeholder="Brief description of what you'd like to cover..."
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white placeholder:text-neutral-650 focus:outline-none focus:border-brand-500 transition-all resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      type="button"
                      onClick={() => setBookingStep('calendar')}
                      className="py-3 px-6 rounded-xl border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors text-xs font-bold"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={bookingSubmitLoading}
                      className="flex-grow py-3 px-6 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-extrabold transition-all disabled:opacity-50"
                    >
                      {bookingSubmitLoading ? 'Scheduling...' : 'Confirm Call Booking'}
                    </button>
                  </div>
                </form>
              )}

              {bookingStep === 'success' && (
                <div className="flex flex-col items-center justify-center text-center p-8 space-y-6 flex-grow">
                  <div className="h-16 w-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-500">
                    <Check className="h-8 w-8 stroke-[3]" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-lg font-extrabold text-white">Call Booking Confirmed!</h3>
                    <p className="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed">
                      We have scheduled your 30-minute discovery call and sent a Google Meet invitation link to <b>{bookEmail}</b>.
                    </p>
                  </div>

                  <div className="p-4 bg-neutral-900/60 border border-neutral-800 rounded-2xl text-xs text-left w-full max-w-sm space-y-1">
                    <p className="text-neutral-400 font-semibold">Scheduled Date & Time:</p>
                    <p className="text-white font-extrabold text-xs">
                      {new Date(selectedBookDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} at {selectedBookTime} (IST)
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsBookModalOpen(false)}
                    className="py-3 px-8 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-800 text-xs font-bold transition-all"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Live Website Preview Modal */}
      <LivePreviewModal
        product={previewProduct}
        isOpen={!!previewProduct}
        onClose={() => setPreviewProduct(null)}
      />

    </div>
  );
};

export default Home;
