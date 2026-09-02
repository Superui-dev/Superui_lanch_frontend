import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight, Check, Zap, Sparkles, Shield, Heart, Eye,
  ShoppingCart, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Star, BookOpen,
  Monitor, Palette, Twitter, Github, Globe, Mail, Clock, Download, CheckCircle2,
  TrendingUp, Headphones, X, Phone, Search, Bot, Brain, Cpu, Wand2
} from 'lucide-react';
import client, { API_BASE_URL } from '../api/client';
import { useWatchlist } from '../context/WatchlistContext';
import { useCart } from '../context/CartContext';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { useAuth } from '../context/AuthContext';
import LivePreviewModal from '../components/common/LivePreviewModal';

const categoryMeta = {
  'templates': { icon: Palette, color: 'bg-purple-500/10 text-purple-600 border-purple-200' },
  'ui-kits': { icon: Cpu, color: 'bg-orange-500/10 text-orange-600 border-orange-200' },
  'ai-kits': { icon: Bot, color: 'bg-indigo-500/10 text-indigo-600 border-indigo-200' },
  'ai-tools': { icon: Brain, color: 'bg-blue-500/10 text-blue-600 border-blue-200' }
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
  const [dynamicTestimonials, setDynamicTestimonials] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const [openFaq, setOpenFaq] = useState(null);
  const [previewProduct, setPreviewProduct] = useState(null);

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
  const { openAuthModal, user, openBookingModal } = useAuth();

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
  }, [selectedCategoryTab, sortBy]);

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
        const [productsRes, categoriesRes, testimonialsRes] = await Promise.allSettled([
          client.get('/api/public/products?limit=20', { silent: true }),
          client.get('/api/public/categories', { silent: true }),
          client.get('/api/public/testimonials', { silent: true })
        ]);

        const handleProducts = (res) => {
          if (res?.data?.success) {
            const list = res.data.data?.products || res.data.data;
            if (Array.isArray(list) && list.length > 0) {
              setProducts(list);
              return true;
            }
          }
          return false;
        };

        if (!handleProducts(productsRes.status === 'fulfilled' ? productsRes.value : null)) {
          setTimeout(async () => {
            try {
              const retryRes = await client.get('/api/public/products?limit=20', { silent: true });
              handleProducts(retryRes);
            } catch (e) {
              // Quiet retry
            }
          }, 2000);
        }

        if (categoriesRes.status === 'fulfilled' && categoriesRes.value?.data?.success && Array.isArray(categoriesRes.value.data.data)) {
          setCategories(categoriesRes.value.data.data);
        }

        if (testimonialsRes.status === 'fulfilled' && testimonialsRes.value?.data?.success && Array.isArray(testimonialsRes.value.data.data)) {
          setDynamicTestimonials(testimonialsRes.value.data.data);
        }
      } catch (err) {
        console.warn('Home data fetch failed:', err);
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

  // Filter products by category and deep multi-attribute search query (Name, Category, Price, Tech Stack, Features)
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategoryTab === 'all' || 
      (product.categoryId?.slug || product.category) === selectedCategoryTab;

    if (!searchQuery.trim()) return matchesCategory;

    const q = searchQuery.trim().toLowerCase();
    
    // 1. Name & Descriptions
    const matchText = 
      (product.name && product.name.toLowerCase().includes(q)) ||
      (product.shortDescription && product.shortDescription.toLowerCase().includes(q)) ||
      (product.description && product.description.toLowerCase().includes(q));

    // 2. Category Name or Slug
    const categoryName = product.categoryId?.name || product.category || '';
    const categorySlug = product.categoryId?.slug || product.category || '';
    const matchCategory = categoryName.toLowerCase().includes(q) || categorySlug.toLowerCase().includes(q);

    // 3. Price (numeric & text comparison e.g. 999, free)
    const sellPriceStr = String(product.sellingPrice || product.price || '');
    const origPriceStr = String(product.originalPrice || product.compareAtPrice || '');
    const matchPrice = sellPriceStr.includes(q) || origPriceStr.includes(q) || (q === 'free' && Number(product.sellingPrice || product.price) === 0);

    // 4. Technologies & Tech Stack
    const techArray = product.technologies || product.techStack || [];
    const matchTech = techArray.some(t => {
      const tName = typeof t === 'string' ? t : (t.name || '');
      return tName.toLowerCase().includes(q);
    });

    // 5. Features
    const featArray = product.features || [];
    const matchFeatures = featArray.some(f => {
      const fText = typeof f === 'string' ? f : (f.title || f.description || '');
      return fText.toLowerCase().includes(q);
    });

    return matchesCategory && (matchText || matchCategory || matchPrice || matchTech || matchFeatures);
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    if (sortBy === 'price-low') return (a.sellingPrice || a.price || 0) - (b.sellingPrice || b.price || 0);
    if (sortBy === 'price-high') return (b.sellingPrice || b.price || 0) - (a.sellingPrice || a.price || 0);
    return (b.downloadsCount || b.viewsCount || 0) - (a.downloadsCount || a.viewsCount || 0);
  });

  const gridProducts = sortedProducts.filter(p => p.slug !== 'superui-admin-dashboard');

  return (
    <div className="bg-[#FAFAFA] min-h-screen text-neutral-900 selection:bg-brand-500 selection:text-white font-sans antialiased">
      
      {/* HERO SECTION WITH PRO-LEVEL BALANCED ANIMATED BACKGROUND */}
      <section className="relative pt-12 sm:pt-20 pb-16 overflow-hidden bg-[#FAFAFA]">
        
        {/* Animated Radial Grid Pattern */}
        <div className="absolute inset-0 bg-hero-grid pointer-events-none opacity-45 z-0" />

        {/* Precision Thin & Light Concentric Circle Rings & Orbiting Pulse Nodes */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] h-[90vw] max-w-[1450px] max-h-[1450px] pointer-events-none z-0 flex items-center justify-center select-none opacity-60">
          {/* Outer Ring 1 (Ultra thin & light) */}
          <div className="absolute w-[88vw] h-[88vw] max-w-[1350px] max-h-[1350px] rounded-full border border-neutral-200/40 animate-spin-slow" style={{ animationDuration: '45s' }} />
          
          {/* Orbit Ring 2 with Light Dashed Border & Subtle Nodes */}
          <div className="absolute w-[70vw] h-[70vw] max-w-[1020px] max-h-[1020px] rounded-full border border-dashed border-brand-500/15 animate-spin-slow flex items-center justify-between p-1" style={{ animationDuration: '32s', animationDirection: 'reverse' }}>
            <div className="h-2 w-2 rounded-full bg-brand-500/70 shadow-[0_0_8px_rgba(255,81,0,0.4)] animate-orbit-pulse -ml-1" />
            <div className="h-2 w-2 rounded-full bg-orange-400/70 shadow-[0_0_8px_rgba(255,81,0,0.4)] animate-orbit-pulse -mr-1" />
          </div>
          
          {/* Ring 3 (Ultra Light Solid Line) */}
          <div className="absolute w-[51vw] h-[51vw] max-w-[740px] max-h-[740px] rounded-full border border-neutral-200/50 animate-pulse-glow" />

          {/* Ring 4 (Inner Dashed Circle with Light Pulse Dots) */}
          <div className="absolute w-[33vw] h-[33vw] max-w-[480px] max-h-[480px] rounded-full border border-dashed border-orange-400/20 animate-spin-slow flex flex-col justify-between items-center p-1" style={{ animationDuration: '20s' }}>
            <div className="h-1.5 w-1.5 rounded-full bg-orange-400/60 shadow-[0_0_6px_rgba(255,81,0,0.3)] animate-orbit-pulse -mt-0.75" />
            <div className="h-1.5 w-1.5 rounded-full bg-brand-500/60 shadow-[0_0_6px_rgba(255,81,0,0.3)] animate-orbit-pulse -mb-0.75" />
          </div>

          {/* Crosshair Radial Axis Lines - Ultra Light */}
          <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-neutral-200/40 to-transparent" />
          <div className="absolute h-full w-px bg-gradient-to-b from-transparent via-neutral-200/40 to-transparent" />
        </div>

        {/* Pro Balanced Ambient Aurora Glow */}
        <div className="absolute -top-36 left-1/2 -translate-x-1/2 w-[69vw] h-[38vw] max-w-[1000px] max-h-[550px] bg-gradient-to-r from-brand-500/22 via-orange-500/18 to-purple-600/18 blur-[140px] rounded-full animate-aurora pointer-events-none z-0" />

        <div className="mx-auto max-w-7xl 2xl:max-w-[1700px] px-3 sm:px-6 lg:px-8 2xl:px-12 text-center relative z-10">

          {/* Badge Pill */}
          {heroData.badgeText && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 border border-brand-200 text-brand-600 text-xs font-bold shadow-sm mb-6 animate-fade-in">
              <Bot className="h-3.5 w-3.5 text-brand-600 animate-pulse" />
              <span>{heroData.badgeText}</span>
            </div>
          )}

          {/* Hero Main Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-neutral-900 tracking-tight leading-[1.1] w-[90%] max-w-5xl mx-auto">
            {renderHeroHeadline(heroData.headline, heroData.headlineHighlight)}
          </h1>

          <p className="mt-6 text-base sm:text-lg lg:text-xl text-neutral-600 w-[90%] max-w-3xl mx-auto font-medium leading-relaxed">
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
          <div className="mt-5 min-[600px]:mt-5 inline-flex flex-wrap items-center justify-center gap-3 sm:gap-6 px-6 sm:px-8 py-3 rounded-full max-[599px]:rounded-[10px] bg-white/90 border border-neutral-200/90 shadow-md text-xs font-semibold text-neutral-600 max-w-[90%] sm:max-w-[94%] mx-auto backdrop-blur-md">

            {/* Metric 1: Instant Digital Delivery */}
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-full max-[599px]:rounded-[10px]  bg-brand-50 text-brand-600 shrink-0 sm:">
                <Zap className="h-4 w-4 fill-brand-600/20 text-brand-600" />
              </div>
              <div className="flex items-center gap-1.5 text-xs ">
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
<div className="mt-12 sm:mt-5 relative max-w-[1550px] w-full mx-auto px-2 sm:px-4">
          {/* Spinning Gradient Halo Ring */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[59vw] h-[38vw] max-w-[850px] max-h-[550px] bg-gradient-to-r from-brand-500/30 via-orange-400/25 to-sky-400/30 blur-[130px] rounded-full animate-spin-slow pointer-events-none z-0" />
          
          <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-full h-52 bg-gradient-to-t from-[#FAFAFA] via-[#FAFAFA]/90 to-transparent blur-2xl pointer-events-none z-20" />
          <div className="absolute -bottom-14 left-1/4 w-[38vw] h-[32vw] max-w-[550px] max-h-[48vw] bg-orange-400/30 blur-3xl rounded-full pointer-events-none z-0 animate-smoke-1" />
          <div className="absolute -bottom-14 right-1/4 w-[38vw] h-[32vw] max-w-[550px] max-h-[48vw] bg-sky-300/30 blur-3xl rounded-full pointer-events-none z-0 animate-smoke-2" />

            <div className="relative z-10 rounded-2xl sm:rounded-3xl p-1 bg-white border border-neutral-200/90 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.12)] overflow-hidden transition-all duration-500 hover:scale-[1.002]">
              <img
                src="/Home/dashboard_preview.png"
                alt="SuperUI Admin Dashboard Widescreen Live Showcase"
                className="w-full h-auto object-cover object-top rounded-xl sm:rounded-2xl shadow-inner"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent rounded-xl sm:rounded-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 sm:gap-4">
                <div className="space-y-1 max-[600px]:hidden">
                  <p className="text-[8px] xs:text-[10px] font-bold uppercase tracking-wider text-white/70">Premium Template</p>
                  <h3 className="text-sm xs:text-base sm:text-lg font-extrabold text-white">SuperUI Admin Dashboard</h3>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
                  <Link
                    to="/products"
                    className="hidden xs:inline-flex items-center justify-center gap-2 px-5 py-3 sm:px-6 sm:py-3.5 rounded-2xl bg-white/90 hover:bg-white text-neutral-900 text-xs sm:text-[13px] font-bold transition-all duration-300 shadow-xl hover:shadow-2xl border border-white/50"
                  >
                    <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span>View More</span>
                  </Link>
                  <button
                    onClick={() => {
                      const product = products.find(p => p.slug === 'superui-admin-dashboard') || products[0];
                      if (product) handleBuyNow(product);
                    }}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 sm:px-6 sm:py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-700 hover:to-purple-700 text-white text-xs sm:text-[13px] font-bold transition-all duration-300 shadow-xl hover:shadow-brand-500/30"
                  >
                    <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span>Buy Now</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>





      {/* REAL DB PRODUCT CARDS GRID SECTION */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl 2xl:max-w-[1700px] px-4 sm:px-6 lg:px-8 2xl:px-12">
          
          {/* Header Row */}
          <div className="flex flex-row items-center justify-between mb-8 gap-4 flex-wrap">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600 flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5" />
                <span>Verified Store Catalog</span>
              </h2>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-neutral-900 mt-1">
                Explore Digital Products ({gridProducts.length})
              </p>
            </div>
            <Link
              to="/products"
              className="text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 flex items-center gap-1.5 px-4 py-2.5 rounded-xl shadow-md hover:shadow-lg hover:shadow-brand-500/25 active:scale-95 transition-all duration-200 shrink-0 group border border-brand-500/30"
            >
              <span>View Full Store Catalog</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Centered Pill Search Bar (Matching Reference Image media_1788319281942.png) */}
          <div className="mb-12 max-w-3xl mx-auto relative group">
            {/* Outer Glow */}
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-brand-500/20 via-orange-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity blur-md" />
            
            <div className="relative flex items-center bg-white rounded-full border border-neutral-200/90 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] group-focus-within:border-brand-500 group-focus-within:bg-white group-focus-within:ring-4 group-focus-within:ring-brand-500/10 transition-all p-1.5 pl-6 sm:pl-8">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="What type of design are you interested in?"
                className="w-full bg-transparent text-sm sm:text-base font-medium text-neutral-800 placeholder:text-neutral-400 focus:outline-none pr-4"
              />
              
              <div className="flex items-center space-x-2 shrink-0">
                {searchQuery.trim() && (
                  <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 text-[10px] font-extrabold border border-brand-200 shrink-0">
                    {filteredProducts.length} Match
                  </span>
                )}
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-full hover:bg-neutral-200/60 transition-colors mr-1"
                    title="Clear Search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}

                {/* Circular Orange Magnifying Glass Search Button */}
                <button
                  type="button"
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#ff5100] hover:bg-[#e64d00] text-white flex items-center justify-center shadow-md shadow-orange-500/30 hover:scale-105 transition-all shrink-0 cursor-pointer"
                  title="Search"
                >
                  <Search className="h-5 w-5 stroke-[2.5]" />
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-600"></div>
            </div>
          ) : gridProducts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-neutral-200 p-8 space-y-3">
              <p className="text-base font-bold text-neutral-900">No store products match your filter.</p>
              <p className="text-xs text-neutral-500">Try selecting "All Assets".</p>
              <button
                onClick={() => setSelectedCategoryTab('all')}
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
                        className="px-3.5 py-2 rounded-xl border border-neutral-200 bg-white text-xs font-bold text-neutral-700 hover:bg-brand-50 hover:text-brand-600 hover:border-brand-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-neutral-700 disabled:hover:border-neutral-200 transition-all shadow-sm cursor-pointer"
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
                                ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25 font-black scale-105'
                                : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-brand-50 hover:text-brand-600 hover:border-brand-300'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-3.5 py-2 rounded-xl border border-neutral-200 bg-white text-xs font-bold text-neutral-700 hover:bg-brand-50 hover:text-brand-600 hover:border-brand-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-neutral-700 disabled:hover:border-neutral-200 transition-all shadow-sm cursor-pointer"
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
          
          <div className="space-y-3 w-[90%] mx-auto">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-neutral-900 tracking-tight">
              Services <span className="font-medium text-neutral-500">We Offer</span>
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-neutral-500 max-w-md mx-auto font-bold leading-relaxed">
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
                <div
                  key={service._id || idx}
                  onClick={() => navigate(`/services/${service.slug || service._id}`)}
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
                    {/* Glass effect CTA button to dedicated Service Detail page */}
                    <Link
                      to={`/services/${service.slug || service._id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-2 text-[11px] font-bold text-white bg-white/15 backdrop-blur-sm border border-white/20 px-4 py-2.5 rounded-xl w-fit group-hover:bg-white/25 group-hover:border-white/40 transition-all duration-300"
                    >
                      <span>View Service Detail</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  </div>
                  {/* Subtle shine effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
                </div>
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
            {(() => {
              const items = dynamicTestimonials.length > 0 ? dynamicTestimonials : testimonials;
              return [...items, ...items, ...items, ...items].map((item, idx) => (
                <div
                  key={idx}
                  className="w-[340px] sm:w-[380px] shrink-0 p-6 rounded-2xl bg-white border border-neutral-200/90 shadow-sm space-y-4 hover:border-neutral-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-xs">
                      {item.initials || (item.name ? item.name.substring(0, 2).toUpperCase() : 'U')}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-neutral-900">{item.name}</h4>
                      <p className="text-[11px] text-neutral-400 font-medium">{item.role}</p>
                    </div>
                  </div>
                  <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                    &ldquo;{item.text}&rdquo;
                  </p>
                </div>
              ));
            })()}
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
