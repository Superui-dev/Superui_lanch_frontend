import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, Phone, CheckCircle2, Cpu, Sparkles, Layers, ShieldCheck, 
  ChevronLeft, Code, Clock, ArrowUpRight, Monitor, ShoppingCart, Brain 
} from 'lucide-react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

const ServiceDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [relatedServices, setRelatedServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { openBookingModal } = useAuth();

  useEffect(() => {
    const fetchServiceDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await client.get(`/api/public/services/${slug}`, { silent: true });
        if (res.data?.success && res.data?.data) {
          setService(res.data.data);
          setRelatedServices(res.data.relatedServices || []);
        } else {
          setError('Service not found.');
        }
      } catch (err) {
        setError('Service detail unavailable.');
      } finally {
        setLoading(false);
      }
    };

    fetchServiceDetail();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-8">
        <div className="space-y-4 text-center">
          <div className="h-12 w-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Loading Service Details...</p>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white p-8 rounded-3xl border border-neutral-200 shadow-xl space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <Layers className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-extrabold text-neutral-900">Service Not Found</h2>
          <p className="text-xs text-neutral-500 font-medium">
            The requested service details could not be found or may have been updated.
          </p>
          <Link
            to="/services"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-900 text-white text-xs font-bold hover:bg-neutral-800 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>View All Services</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-neutral-900 pb-24">
      {/* Breadcrumb Header */}
      <div className="bg-white border-b border-neutral-200/80 py-3.5 px-4 sm:px-8">
        <div className="mx-auto w-full max-w-7xl flex items-center gap-2 text-xs font-semibold text-neutral-500">
          <Link to="/" className="hover:text-brand-600 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/services" className="hover:text-brand-600 transition-colors">Services</Link>
          <span>/</span>
          <span className="text-neutral-900 font-bold truncate">{service.title}</span>
        </div>
      </div>

      {/* Hero Banner */}
      <section className="relative py-16 sm:py-20 bg-white border-b border-neutral-200/80 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[90vw] h-[45vw] max-w-[900px] max-h-[450px] bg-gradient-to-r from-brand-500/18 via-orange-400/15 to-purple-600/15 blur-[140px] rounded-full pointer-events-none" />
        
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 border border-brand-200 text-brand-600 text-xs font-bold shadow-sm animate-fade-in">
            <Cpu className="h-3.5 w-3.5" />
            <span>Dedicated Service Capabilities</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-neutral-900 tracking-tight leading-tight max-w-4xl mx-auto">
            {service.heroTitle || service.title}
          </h1>

          <p className="text-sm sm:text-base text-neutral-600 max-w-2xl mx-auto font-medium leading-relaxed">
            {service.heroSubtitle || service.description}
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => openBookingModal?.(service.title)}
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-xl hover:shadow-brand-500/25 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <Phone className="h-4 w-4 text-white fill-current shrink-0" />
              <span>Book a Free Call for {service.title}</span>
              <div className="p-1 rounded-full bg-white/20">
                <ArrowRight className="h-3 w-3 text-white rotate-[-45deg]" />
              </div>
            </button>

            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl border border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-900 text-xs font-bold transition-all shadow-sm"
            >
              <span>Explore Store Catalog</span>
              <ArrowUpRight className="h-4 w-4 text-neutral-500" />
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 space-y-16">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Features & Deliverables */}
          <div className="lg:col-span-7 space-y-8 text-left">
            
            {/* Overview */}
            <div className="bg-white p-8 rounded-3xl border border-neutral-200/90 shadow-sm space-y-4">
              <h2 className="text-xl font-extrabold text-neutral-900 tracking-tight flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-brand-600" />
                <span>Service Overview</span>
              </h2>
              <p className="text-sm text-neutral-600 font-medium leading-relaxed">
                {service.description}
              </p>
              {service.fullContent && (
                <p className="text-xs text-neutral-500 leading-relaxed font-medium pt-2 border-t border-neutral-100">
                  {service.fullContent}
                </p>
              )}
            </div>

            {/* Key Deliverables & Features */}
            {service.features && service.features.length > 0 && (
              <div className="bg-white p-8 rounded-3xl border border-neutral-200/90 shadow-sm space-y-6">
                <h3 className="text-lg font-extrabold text-neutral-900 tracking-tight flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  <span>Key Deliverables & Included Features</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {service.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/60">
                      <CheckCircle2 className="h-4 w-4 text-brand-600 shrink-0 mt-0.5" />
                      <span className="text-xs font-bold text-neutral-800 leading-snug">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tech Stack Badges */}
            {service.techStack && service.techStack.length > 0 && (
              <div className="bg-white p-8 rounded-3xl border border-neutral-200/90 shadow-sm space-y-4">
                <h3 className="text-sm font-extrabold text-neutral-900 tracking-tight uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                  <Code className="h-4 w-4 text-brand-600" />
                  <span>Technologies & Tools Stack</span>
                </h3>
                <div className="flex flex-wrap gap-2 pt-1">
                  {service.techStack.map((tech, idx) => (
                    <span
                      key={idx}
                      className="px-3.5 py-2 rounded-xl bg-brand-50 border border-brand-200/80 text-brand-700 text-xs font-extrabold shadow-sm"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Image Showcase & Sticky Card */}
          <div className="lg:col-span-5 space-y-6 sticky top-24">
            <div className="group relative rounded-3xl overflow-hidden border border-neutral-200 shadow-xl bg-neutral-900 aspect-[4/3]">
              <img
                src={service.bgImage || service.image}
                alt={service.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                onError={(e) => { e.target.src = 'https://via.placeholder.com/600x400?text=Service+Showcase'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-400">Verified Service</span>
                <h3 className="text-lg font-black">{service.title}</h3>
                {service.pricingNote && (
                  <p className="text-xs text-white/80 font-medium">{service.pricingNote}</p>
                )}
              </div>
            </div>

            {/* Quick Booking Box */}
            <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm space-y-4 text-left">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-extrabold text-neutral-900">Ready to build?</h4>
                  <p className="text-xs text-neutral-500 font-medium mt-0.5">Schedule a 1-on-1 discovery session.</p>
                </div>
                <div className="h-10 w-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                  <Clock className="h-5 w-5" />
                </div>
              </div>

              <button
                onClick={() => openBookingModal?.(service.title)}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md hover:shadow-brand-500/25 active:scale-95 transition-all cursor-pointer"
              >
                <Phone className="h-4 w-4 fill-current" />
                <span>Book Free Call Now</span>
              </button>
            </div>

          </div>

        </div>

        {/* Related Services Section (Explore Other Services We Offer) */}
        {relatedServices.length > 0 && (
          <section className="pt-12 border-t border-neutral-200 space-y-8">
            <div className="text-left space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600 flex items-center gap-1.5">
                <Layers className="h-4 w-4" />
                <span>Explore Other Services</span>
              </h2>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-neutral-900">
                Related Services We Offer
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
              {relatedServices.map((relService, idx) => (
                <div
                  key={relService._id || idx}
                  onClick={() => navigate(`/services/${relService.slug || relService._id}`)}
                  className="group relative h-[320px] rounded-3xl overflow-hidden cursor-pointer block border border-neutral-200/60 shadow-sm hover:shadow-2xl hover:shadow-neutral-300/40 hover:border-neutral-300/80 transition-all duration-500"
                >
                  <img
                    src={relService.bgImage || relService.image}
                    alt={relService.title}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/600x400?text=No+Image'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/5" />
                  <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-brand-500 via-orange-400 to-purple-500 opacity-80" />
                  
                  <div className="absolute inset-0 p-6 flex flex-col justify-end">
                    <h4 className="text-base font-extrabold text-white mb-1 tracking-tight leading-tight">
                      {relService.title}
                    </h4>
                    <p className="text-[11px] text-white/75 font-medium leading-relaxed line-clamp-2 mb-4">
                      {relService.description}
                    </p>
                    <Link
                      to={`/services/${relService.slug || relService._id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-2 text-[11px] font-bold text-white bg-white/15 backdrop-blur-sm border border-white/20 px-4 py-2.5 rounded-xl w-fit group-hover:bg-white/25 group-hover:border-white/40 transition-all duration-300"
                    >
                      <span>View Service Detail</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
};

export default ServiceDetail;

