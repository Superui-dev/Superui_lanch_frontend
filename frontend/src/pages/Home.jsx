import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight, Check, Zap, Sparkles, Shield, Heart, Eye,
  ShoppingCart, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Star, BookOpen,
  Monitor, Palette, Twitter, Github, Globe, Mail, Clock, Download, CheckCircle2,
  TrendingUp, Headphones, X, Phone, Search, Bot, Brain, Cpu, Wand2, Folder, Loader2, Hash,
  Pause, Play, Cloud, ShieldCheck, FileCheck, Layers, Smartphone, Lock
} from 'lucide-react';
import client, { API_BASE_URL } from '../api/client';
import { useWatchlist } from '../context/WatchlistContext';
import { useCart } from '../context/CartContext';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { useAuth } from '../context/AuthContext';
import LivePreviewModal from '../components/common/LivePreviewModal';

const defaultUpcomingReleases = [
  {
    id: 'digilocker-banner-1',
    title: 'Your Documents, Always accessible',
    bannerImage: 'https://cdn.digilocker.gov.in/digilocker-landing-page/assets/img/banner/web-banner-1.jpg',
    badge: 'DigiLocker Ecosystem • Digital India',
    headline: 'Your Documents, Always Accessible',
    subtitle: 'Access, share and instantly verify government-issued documents, certificates, and digital records anytime, anywhere.',
    link: '/products'
  },
  {
    id: 'digilocker-banner-2',
    title: 'Now drive hassle-free with Digilocker',
    bannerImage: 'https://cdn.digilocker.gov.in/digilocker-landing-page/assets/img/banner/web-banner-2.jpg',
    badge: 'Ministry of Road Transport & Highways',
    headline: 'Now Drive Hassle-Free with DigiLocker',
    subtitle: 'Carry your digital Driving Licence and Vehicle RC legally valid across India on your mobile device.',
    link: '/products'
  },
  {
    id: 'digilocker-banner-3',
    title: 'Indian Railways accept Digilocker as valid ID',
    bannerImage: 'https://cdn.digilocker.gov.in/digilocker-landing-page/assets/img/banner/web-banner-3.jpg',
    badge: 'Indian Railways & Digital ID',
    headline: 'Indian Railways Accept DigiLocker as Valid ID',
    subtitle: 'Seamless identity verification during train journeys with digitally signed government credentials.',
    link: '/products'
  },
  {
    id: 'digilocker-banner-4',
    title: 'Airport entry get more easier now',
    bannerImage: 'https://cdn.digilocker.gov.in/digilocker-landing-page/assets/img/banner/web-banner-4.jpg',
    badge: 'DigiYatra • Ministry of Civil Aviation',
    headline: 'Airport Entry Made Faster & Seamless with DigiYatra',
    subtitle: 'Facial recognition and digital credentials for paperless airport terminal entries across major Indian airports.',
    link: '/products'
  }
];

const categoryMeta = {
  'templates': { icon: Palette, color: 'bg-purple-500/10 text-purple-600 border-purple-200' },
  'ui-kits': { icon: Cpu, color: 'bg-orange-500/10 text-orange-600 border-orange-200' },
  'ai-kits': { icon: Bot, color: 'bg-indigo-500/10 text-indigo-600 border-indigo-200' },
  'ai-tools': { icon: Brain, color: 'bg-blue-500/10 text-blue-600 border-blue-200' },
  'portfolio': { icon: Monitor, color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200' }
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
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [selectedCategoryTab, setSelectedCategoryTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [dynamicTestimonials, setDynamicTestimonials] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const [openFaq, setOpenFaq] = useState(null);
  const [previewProduct, setPreviewProduct] = useState(null);

  // Services Section Search & Category Filter State
  const [serviceSearchQuery, setServiceSearchQuery] = useState('');
  const [selectedServiceCategory, setSelectedServiceCategory] = useState('all');
  const [serviceDropdownOpen, setServiceDropdownOpen] = useState(false);
  const serviceDropdownRef = useRef(null);

  // Upcoming Products Carousel State (Auto-cycles every 8s)
  const [upcomingReleases, setUpcomingReleases] = useState(defaultUpcomingReleases);
  const [upcomingIndex, setUpcomingIndex] = useState(0);
  const [isUpcomingPaused, setIsUpcomingPaused] = useState(false);
  const [productSearch, setProductSearch] = useState('');

  useEffect(() => {
    client.get('/api/public/upcoming-banners', { silent: true })
      .then((res) => {
        if (res?.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
          setUpcomingReleases(res.data.data);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (isUpcomingPaused || !upcomingReleases.length) return;
    const timer = setInterval(() => {
      setUpcomingIndex(prev => (prev + 1) % upcomingReleases.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [isUpcomingPaused, upcomingReleases.length]);

  const currentUpcoming = upcomingReleases[upcomingIndex] || upcomingReleases[0] || defaultUpcomingReleases[0];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (serviceDropdownRef.current && !serviceDropdownRef.current.contains(e.target)) {
        setServiceDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const categoryScrollRef = useRef(null);

  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const { addToCart } = useCart();
  const { settings: siteSettings } = useSiteSettings();
  const navigate = useNavigate();
  const heroData = siteSettings?.hero && Object.keys(siteSettings.hero).length > 0
    ? siteSettings.hero
    : defaultHero;
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
    // 1. Fetch categories right away with high priority so cards load instantly
    setCategoriesLoading(true);
    client.get('/api/public/categories', { silent: true })
      .then((res) => {
        if (res?.data?.success && Array.isArray(res.data.data)) {
          const seen = new Set();
          const unique = res.data.data.filter(cat => {
            const key = String(cat._id);
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });
          setCategories(unique.sort((a, b) => (a.order || 0) - (b.order || 0)));
        }
      })
      .catch(() => {
        // Quiet fallback
      })
      .finally(() => {
        setCategoriesLoading(false);
      });

    // 2. Fetch products and testimonials
    const fetchOtherData = async () => {
      setLoading(true);
      try {
        const [productsRes, testimonialsRes] = await Promise.allSettled([
          client.get('/api/public/products?limit=20', { silent: true }),
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

        if (testimonialsRes.status === 'fulfilled' && testimonialsRes.value?.data?.success && Array.isArray(testimonialsRes.value.data.data)) {
          setDynamicTestimonials(testimonialsRes.value.data.data);
        }

      } catch (err) {
        // Fallback gracefully
      } finally {
        setLoading(false);
      }
    };

    fetchOtherData();
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
    const prodCatSlug = product.categoryId?.slug || (typeof product.category === 'string' ? product.category.toLowerCase().replace(/[^a-z0-9]+/g, '-') : '');
    const prodCatName = product.categoryId?.name || product.category || '';
    const matchesCategory = selectedCategoryTab === 'all' || 
      prodCatSlug === selectedCategoryTab ||
      prodCatName.toLowerCase() === selectedCategoryTab.toLowerCase();

    if (!searchQuery.trim()) return matchesCategory;

    const q = searchQuery.trim().toLowerCase();
    
    // 1. Name & Descriptions
    const matchText = 
      (product.name && product.name.toLowerCase().includes(q)) ||
      (product.shortDescription && product.shortDescription.toLowerCase().includes(q)) ||
      (product.description && product.description.toLowerCase().includes(q));

    // 2. Category Name or Slug
    const categoryName = product.categoryId?.name || product.category || '';
    const categorySlug = product.categoryId?.slug || '';
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

  const gridProducts = sortedProducts
    .filter(p => p.slug !== 'superui-admin-dashboard')
    .filter(p => {
      if (!productSearch) return true;
      const q = productSearch.toLowerCase();
      return (p.name || '').toLowerCase().includes(q) ||
             (p.shortDescription || p.description || '').toLowerCase().includes(q) ||
             (p.category || '').toLowerCase().includes(q);
    });

  // Memoized categories & filtered services for the Services We Offer section
  const visibleCategories = useMemo(() => {
    return categories.filter(c => c.visible !== false);
  }, [categories]);

  const filteredServiceCategories = useMemo(() => {
    return visibleCategories.filter(cat => {
      const matchesCat =
        selectedServiceCategory === 'all' ||
        cat._id === selectedServiceCategory ||
        cat.slug === selectedServiceCategory;
      if (!matchesCat) return false;

      if (!serviceSearchQuery.trim()) return true;
      const q = serviceSearchQuery.trim().toLowerCase();
      const nameMatch = cat.name && cat.name.toLowerCase().includes(q);
      const descMatch = cat.description && cat.description.toLowerCase().includes(q);
      const slugMatch = cat.slug && cat.slug.toLowerCase().includes(q);

      return nameMatch || descMatch || slugMatch;
    });
  }, [visibleCategories, selectedServiceCategory, serviceSearchQuery]);

  const activeServiceCategoryObj = visibleCategories.find(
    c => c._id === selectedServiceCategory || c.slug === selectedServiceCategory
  );
  const activeCategoryLabel = activeServiceCategoryObj ? activeServiceCategoryObj.name : 'All Categories';

  const totalProductsCount = useMemo(() => {
    const catSum = visibleCategories.reduce((acc, cat) => acc + (cat.productCount || 0), 0);
    return Math.max(catSum, products.length);
  }, [visibleCategories, products]);

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

        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative z-10">

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

   

      {/* Services Categories Section (New Pattern: Unified Search, Dropdown Filter & Book Call) */}
      <section className="py-20 bg-white border-t border-neutral-200/80">
        <div className="mx-auto w-full max-w-7xl min-[1600px]:max-w-[1680px] px-4 sm:px-6 lg:px-8 space-y-8">

          {/* Section Header */}
          <div className="text-center space-y-3 w-[90%] max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200/70 text-brand-600 text-xs font-bold shadow-xs">
              <Zap className="h-3.5 w-3.5 fill-brand-500 text-brand-600" />
              <span>Full-Stack Development & Digital Engineering</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-neutral-900 tracking-tight">
              Services <span className="font-medium text-neutral-500">We Offer</span>
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-neutral-500 max-w-lg mx-auto font-medium leading-relaxed">
              From first click to final conversion, every service is built around one goal: growing your business.
            </p>
          </div>

          {/* Modern Unified Filter & Search Bar Toolbar */}
          <div className="max-w-6xl min-[1600px]:max-w-[1600px] mx-auto w-full">
            <div className="p-2 sm:p-2.5 rounded-3xl bg-neutral-50 border border-neutral-200/90 shadow-sm flex flex-col md:flex-row items-stretch md:items-center gap-2.5">

              {/* 1. Category Custom Dropdown Selector */}
              <div className="relative shrink-0" ref={serviceDropdownRef}>
                <button
                  type="button"
                  onClick={() => setServiceDropdownOpen(!serviceDropdownOpen)}
                  className="w-full md:w-auto inline-flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold shadow-sm transition-all duration-200 border border-neutral-800 min-w-[210px] cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Folder className="h-4 w-4 text-brand-400 shrink-0" />
                    <span className="truncate">{activeCategoryLabel}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-1">
                    <span className="px-2 py-0.5 rounded-full bg-neutral-800 text-[10px] text-neutral-300 font-semibold border border-neutral-700">
                      {selectedServiceCategory === 'all' ? visibleCategories.length : filteredServiceCategories.length}
                    </span>
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 text-neutral-400 ${serviceDropdownOpen ? 'rotate-180 text-brand-400' : ''}`} />
                  </div>
                </button>

                {/* Popover Dropdown Panel */}
                {serviceDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-72 bg-white rounded-2xl border border-neutral-200/90 shadow-2xl z-40 p-2 animate-fadeIn space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedServiceCategory('all');
                        setServiceDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                        selectedServiceCategory === 'all'
                          ? 'bg-brand-50 text-brand-700 font-bold'
                          : 'text-neutral-700 hover:bg-neutral-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Folder className="h-4 w-4 text-neutral-500 shrink-0" />
                        <span>All Categories</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-neutral-400 font-mono font-medium">({visibleCategories.length})</span>
                        {selectedServiceCategory === 'all' && <Check className="h-3.5 w-3.5 text-brand-600" />}
                      </div>
                    </button>

                    <div className="h-px bg-neutral-100 my-1" />

                    <div className="max-h-60 overflow-y-auto space-y-0.5 pr-0.5">
                      {visibleCategories.map((cat) => {
                        const isSelected = selectedServiceCategory === cat._id || selectedServiceCategory === cat.slug;
                        return (
                          <button
                            key={cat._id || cat.slug}
                            type="button"
                            onClick={() => {
                              setSelectedServiceCategory(cat._id || cat.slug);
                              setServiceDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-brand-50 text-brand-700 font-bold'
                                : 'text-neutral-700 hover:bg-neutral-100'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <div
                                className="h-2.5 w-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: cat.color || '#F97316' }}
                              />
                              <span className="truncate">{cat.name}</span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0 ml-2">
                              <span className="text-[10px] text-neutral-400 font-mono font-medium">
                                ({cat.productCount ?? 0})
                              </span>
                              {isSelected && <Check className="h-3.5 w-3.5 text-brand-600" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Live Search Input Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search services (e.g. landing page, mobile app, SaaS, AI...)"
                  value={serviceSearchQuery}
                  onChange={(e) => setServiceSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 rounded-2xl bg-white border border-neutral-200/90 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all font-medium shadow-xs"
                />
                {serviceSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setServiceSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* 3. Book a Free Call Action Button */}
              <button
                onClick={openBookingModal}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md hover:shadow-brand-500/20 transition-all duration-200 shrink-0 cursor-pointer group"
              >
                <Phone className="h-3.5 w-3.5 text-white fill-current shrink-0" />
                <span>Book a Free Call</span>
                <div className="p-1 rounded-full bg-white/20 group-hover:rotate-45 transition-transform duration-200">
                  <ArrowRight className="h-3 w-3 text-white rotate-[-45deg]" />
                </div>
              </button>
            </div>

            {/* Active Filters & Results Counter Strip */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 px-2 text-xs">
              <span className="text-neutral-500 font-semibold">
                Showing <strong className="text-neutral-900 font-extrabold">{filteredServiceCategories.length}</strong> of {visibleCategories.length} services
              </span>

              {(selectedServiceCategory !== 'all' || serviceSearchQuery.trim()) && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] text-neutral-400 font-semibold">Active:</span>

                  {selectedServiceCategory !== 'all' && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-[11px] font-bold">
                      <span>Category: {activeCategoryLabel}</span>
                      <button
                        type="button"
                        onClick={() => setSelectedServiceCategory('all')}
                        className="hover:text-brand-900 rounded-full p-0.5 cursor-pointer"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}

                  {serviceSearchQuery.trim() && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-700 text-[11px] font-bold">
                      <span>Search: &ldquo;{serviceSearchQuery}&rdquo;</span>
                      <button
                        type="button"
                        onClick={() => setServiceSearchQuery('')}
                        className="hover:text-neutral-900 rounded-full p-0.5 cursor-pointer"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedServiceCategory('all');
                      setServiceSearchQuery('');
                    }}
                    className="text-[11px] font-bold text-neutral-500 hover:text-neutral-900 underline ml-1 cursor-pointer"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Cards Area: Loading, Empty, or Filtered Grid */}
          {categoriesLoading ? (
            <div className="py-12 space-y-6">
              <div className="inline-flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-600 text-xs font-bold shadow-sm mx-auto">
                <Loader2 className="h-4 w-4 animate-spin text-brand-600" />
                <span>Loading services & categories...</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 min-[1600px]:grid-cols-4 gap-6 max-w-6xl min-[1600px]:max-w-[1600px] mx-auto pt-2 justify-center sm:justify-items-center">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="relative h-[340px] rounded-3xl overflow-hidden max-w-sm w-full bg-neutral-100 border border-neutral-200/70 shadow-sm animate-pulse flex flex-col justify-end p-6 space-y-3"
                  >
                    <div className="h-7 w-7 rounded-full bg-neutral-200" />
                    <div className="h-5 w-3/4 rounded-lg bg-neutral-200" />
                    <div className="h-3.5 w-full rounded-md bg-neutral-200" />
                    <div className="h-3.5 w-2/3 rounded-md bg-neutral-200" />
                    <div className="h-9 w-32 rounded-xl bg-neutral-200 mt-2" />
                  </div>
                ))}
              </div>
            </div>
          ) : visibleCategories.length === 0 ? (
            <div className="text-center py-16 text-neutral-400 text-sm font-medium">
              No services configured yet.
            </div>
          ) : filteredServiceCategories.length === 0 ? (
            <div className="text-center py-20 px-4 rounded-3xl bg-neutral-50/70 border border-neutral-200/80 max-w-2xl mx-auto space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
                <Search className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900">No services match your search</h3>
                <p className="text-xs text-neutral-500 mt-1">
                  We couldn&apos;t find any service matching your criteria. Try another keyword or clear filters.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedServiceCategory('all');
                  setServiceSearchQuery('');
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                <span>Reset All Filters</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 min-[1600px]:grid-cols-4 gap-6 text-left max-w-6xl min-[1600px]:max-w-[1600px] mx-auto pt-4 justify-center sm:justify-items-center">
              {filteredServiceCategories.map((cat, idx) => (
                <div
                  key={cat._id || idx}
                  onClick={() => navigate(`/products?category=${cat.slug || cat._id}`)}
                  className="group relative h-[340px] rounded-3xl overflow-hidden cursor-pointer block max-w-sm w-full border border-neutral-200/60 shadow-sm hover:shadow-2xl hover:shadow-neutral-300/40 hover:border-neutral-300/80 transition-all duration-500"
                >
                  {cat.icon ? (
                    <img
                      src={cat.icon}
                      alt={cat.name}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/600x400?text=No+Image'; }}
                    />
                  ) : (
                    <div
                      className="absolute inset-0 h-full w-full transition-transform duration-700 group-hover:scale-105"
                      style={{ backgroundColor: cat.color || '#6B7280' }}
                    />
                  )}
                  {/* Gradient overlay - deeper at top for readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/5" />
                  {/* Top accent line */}
                  <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-brand-500 via-orange-400 to-purple-500 opacity-80 group-hover:opacity-100 transition-opacity" />
                  {/* Content */}
                  <div className="absolute inset-0 p-6 flex flex-col justify-end">
                    {/* Product count badge */}
                    <div className="mb-3">
                      <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[10px] font-extrabold text-white">
                        {cat.productCount ?? 0}
                      </span>
                    </div>
                    <h3 className="text-base font-extrabold text-white mb-1.5 tracking-tight leading-tight">
                      {cat.name}
                    </h3>
                    <p className="text-[11px] text-white/75 font-medium leading-relaxed line-clamp-2 mb-4">
                      {cat.description || 'No description added.'}
                    </p>
                    {/* Glass effect CTA button */}
                    <Link
                      to={`/products?category=${cat.slug || cat._id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-2 text-[11px] font-bold text-white bg-white/15 backdrop-blur-sm border border-white/20 px-4 py-2.5 rounded-xl w-fit group-hover:bg-white/25 group-hover:border-white/40 transition-all duration-300"
                    >
                      <span>View Products</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  </div>
                  {/* Subtle shine effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-white border-t border-neutral-200/80">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Pricing Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-6xl mx-auto pt-6">
            
            {((siteSettings?.pricing?.plans && Array.isArray(siteSettings.pricing.plans)) 
              ? siteSettings.pricing.plans 
              : defaultPricing.plans).map((plan) => {
                const Icon = plan.id === 'landing-page' ? Monitor : Globe;
                return (
                  <div 
                    key={plan.id}
                    className={`lg:col-span-6 h-full flex flex-col bg-white p-8 rounded-2xl space-y-6 relative overflow-hidden text-left ${
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

                    <div className="pt-6 border-t border-neutral-100 space-y-4 flex-1">
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

      {/* ========================================================================= */}
      {/* PREVIOUS UPCOMING SHOWCASE CODE (PRESERVED AS COMMENTS AS REQUESTED): */}
      {/*
      <section className="py-16 bg-gradient-to-b from-white via-indigo-50/20 to-[#FAFAFA] border-t border-neutral-200/80 overflow-hidden">
        <div className="mx-auto w-full max-w-7xl min-[1600px]:max-w-[1600px] px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-[32px] sm:rounded-[36px] bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/60 border border-indigo-100/90 shadow-[0_25px_70px_-15px_rgba(99,102,241,0.12)] p-6 sm:p-10 lg:p-14 overflow-hidden">
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
              <div className="lg:col-span-6 space-y-6 text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold shadow-xs">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600" />
                  </span>
                  <span>{currentUpcoming.badge}</span>
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-neutral-900 tracking-tight leading-[1.15]">
                    {currentUpcoming.headline.split(currentUpcoming.highlightText)[0]}
                    <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-brand-600 bg-clip-text text-transparent">
                      {currentUpcoming.highlightText}
                    </span>
                    {currentUpcoming.headline.split(currentUpcoming.highlightText)[1]}
                  </h2>
                  <p className="text-sm sm:text-base text-neutral-600 font-medium leading-relaxed max-w-xl">
                    {currentUpcoming.subtitle}
                  </p>
                </div>
                <div className="pt-4 border-t border-indigo-100/80 flex flex-wrap items-center gap-6 sm:gap-8">
                  {currentUpcoming.features.map((feat, fIdx) => {
                    const FeatIcon = feat.icon;
                    return (
                      <div key={fIdx} className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-white border border-indigo-100 shadow-sm flex items-center justify-center text-indigo-600 shrink-0">
                          <FeatIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-neutral-900">{feat.title}</h4>
                          <p className="text-[11px] text-neutral-500 font-medium">{feat.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      */}
      {/* ========================================================================= */}

      {/* ========================================================================= */}
      {/* PREVIOUS MULTI-CARD UPCOMING SHOWCASE CODE (PRESERVED AS COMMENTS AS REQUESTED):
      <section className="py-20 bg-gradient-to-b from-white via-indigo-50/25 to-[#FAFAFA] border-t border-neutral-200/80 overflow-hidden relative">
        <div className="mx-auto w-full max-w-7xl min-[1600px]:max-w-[1680px] px-4 sm:px-6 lg:px-8 mb-10 text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-bold shadow-xs">
            <Sparkles className="h-3.5 w-3.5 fill-indigo-500 text-indigo-600" />
            <span>Q1 2026 ROADMAP • EXCLUSIVE SNEAK PEEK</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-neutral-900 tracking-tight">
            Upcoming <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-brand-600 bg-clip-text text-transparent">Products</span>
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-neutral-500 max-w-2xl mx-auto font-medium leading-relaxed">
            Explore our next generation of high-converting SaaS templates, AI agentic automations, and mobile ecosystems before official release.
          </p>
        </div>
      </section>
      */}
      {/* ========================================================================= */}

      {/* NEW DIGILOCKER (https://www.digilocker.gov.in/) HERO SECTION CAROUSEL FOR UPCOMING PRODUCTS */}
      <section className="py-16 sm:py-20 bg-gradient-to-b from-[#F8FAFC] via-white to-[#F8FAFC] border-y border-neutral-200/80 overflow-hidden relative select-none shadow-xs">
        
        {/* Section Heading */}
        <div className="mx-auto w-full max-w-7xl min-[1600px]:max-w-[1680px] px-4 sm:px-6 lg:px-8 mb-8 sm:mb-10 text-center space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-50/90 border border-orange-200 text-neon-orange text-xs font-bold shadow-xs">
            <Sparkles className="h-3.5 w-3.5 fill-neon-orange text-neon-orange" />
            <span>DIGILOCKER INSPIRED • UPCOMING ROADMAP 2026</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-neutral-900 tracking-tight">
            Upcoming <span className="text-neon-orange">Products</span>
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-neutral-500 max-w-2xl mx-auto font-medium leading-relaxed">
            Explore our next generation of high-converting SaaS templates, AI agentic automations, and mobile ecosystems before official release.
          </p>
        </div>

        {/* DigiLocker Style Peek Section Container */}
        <div className="relative w-full overflow-hidden px-2 sm:px-6 lg:px-8">
          
          {/* Dynamic Ambient Background Blur Glow (Uses Active Banner Image) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85vw] h-[40vw] max-w-[1200px] max-h-[480px] rounded-[40px] blur-[100px] pointer-events-none transition-all duration-700 z-0 opacity-40 overflow-hidden">
            <img 
              src={currentUpcoming.bannerImage} 
              alt={currentUpcoming.title} 
              className="w-full h-full object-cover scale-125"
            />
          </div>

          {/* Panoramic Swiper Stage with Left & Right Peeking Full-Image Slides */}
          <div className="relative z-10 flex items-center justify-center gap-4 sm:gap-6 max-w-[1640px] mx-auto min-h-[220px] sm:min-h-[380px] md:min-h-[450px]">
            
            {/* 1. PREVIOUS PEEKING FULL-IMAGE BANNER (Left Side) */}
            {(() => {
              const prevIdx = (upcomingIndex - 1 + upcomingReleases.length) % upcomingReleases.length;
              const prevItem = upcomingReleases[prevIdx];
              return (
                <div
                  key={`prev-dl-${prevIdx}`}
                  onClick={() => setUpcomingIndex(prevIdx)}
                  className="hidden lg:block w-[72vw] max-w-[1100px] -ml-[58%] xl:-ml-[43%] shrink-0 opacity-40 hover:opacity-75 scale-[0.92] blur-[0.5px] rounded-2xl sm:rounded-[32px] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.3)] ring-1 ring-black/10 overflow-hidden transition-all duration-700 cursor-pointer aspect-[21/9] bg-neutral-900"
                  title="Click to view previous banner"
                >
                  <img 
                    src={prevItem.bannerImage} 
                    alt={prevItem.title} 
                    className="w-full h-full object-cover select-none pointer-events-none"
                    loading="lazy"
                  />
                </div>
              );
            })()}

            {/* 2. ACTIVE CENTER FULL-IMAGE BANNER */}
            <div className="w-[96vw] sm:w-[92vw] max-w-[1180px] shrink-0 rounded-2xl sm:rounded-[32px] shadow-[0_30px_90px_-20px_rgba(0,0,0,0.42),0_12px_32px_-10px_rgba(0,0,0,0.2)] ring-1 ring-black/10 border border-white/40 overflow-hidden relative z-20 transition-all duration-700 aspect-[21/9] bg-neutral-900 group">
              <Link to={currentUpcoming.link || '/products'} className="block w-full h-full relative">
                <img 
                  src={currentUpcoming.bannerImage} 
                  alt={currentUpcoming.title} 
                  className="w-full h-full object-cover select-none transition-transform duration-700 group-hover:scale-[1.015]"
                  loading="eager"
                />
                {/* Subtle bottom gradient overlay for control readability */}
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/60 via-black/15 to-transparent pointer-events-none" />
              </Link>

              {/* DigiLocker-Style Action Controls Floating Pill (< || >) */}
              <div className="absolute bottom-4 right-4 sm:bottom-7 sm:right-7 z-30 flex items-center gap-1.5 sm:gap-2 bg-neutral-950/85 backdrop-blur-md p-1.5 rounded-full border border-white/20 shadow-2xl">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setUpcomingIndex(prev => (prev - 1 + upcomingReleases.length) % upcomingReleases.length);
                  }}
                  className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-all cursor-pointer shadow-xs"
                  title="Previous Slide"
                >
                  <ChevronLeft className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsUpcomingPaused(prev => !prev);
                  }}
                  className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-all cursor-pointer shadow-xs"
                  title={isUpcomingPaused ? "Resume Carousel" : "Pause Carousel"}
                >
                  {isUpcomingPaused ? <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-300 fill-current ml-0.5" /> : <Pause className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />}
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setUpcomingIndex(prev => (prev + 1) % upcomingReleases.length);
                  }}
                  className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-all cursor-pointer shadow-xs"
                  title="Next Slide"
                >
                  <ChevronRight className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                </button>
              </div>

              {/* Slide Indicator Dots (Bottom Left) */}
              <div className="absolute bottom-4 left-4 sm:bottom-7 sm:left-7 z-30 flex items-center gap-1.5 sm:gap-2 bg-neutral-950/70 backdrop-blur-md px-3 sm:px-3.5 py-1.5 rounded-full border border-white/20 shadow-xl">
                {upcomingReleases.map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setUpcomingIndex(dotIdx);
                    }}
                    className={`transition-all duration-300 rounded-full cursor-pointer ${
                      upcomingIndex === dotIdx
                        ? 'w-6 sm:w-8 h-1.5 sm:h-2 bg-white shadow-sm'
                        : 'w-1.5 sm:w-2 h-1.5 sm:h-2 bg-white/40 hover:bg-white/70'
                    }`}
                    title={`Go to slide ${dotIdx + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* 3. NEXT PEEKING FULL-IMAGE BANNER (Right Side) */}
            {(() => {
              const nextIdx = (upcomingIndex + 1) % upcomingReleases.length;
              const nextItem = upcomingReleases[nextIdx];
              return (
                <div
                  key={`next-dl-${nextIdx}`}
                  onClick={() => setUpcomingIndex(nextIdx)}
                  className="hidden lg:block w-[72vw] max-w-[1100px] -mr-[58%] xl:-mr-[43%] shrink-0 opacity-40 hover:opacity-75 scale-[0.92] blur-[0.5px] rounded-2xl sm:rounded-[32px] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.3)] ring-1 ring-black/10 overflow-hidden transition-all duration-700 cursor-pointer aspect-[21/9] bg-neutral-900"
                  title="Click to view next banner"
                >
                  <img 
                    src={nextItem.bannerImage} 
                    alt={nextItem.title} 
                    className="w-full h-full object-cover select-none pointer-events-none"
                    loading="lazy"
                  />
                </div>
              );
            })()}

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
