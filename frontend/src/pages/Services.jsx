import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, ArrowRight, Code, Sparkles, CheckCircle2, Shield, Layers, Copy, Check } from 'lucide-react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

const Services = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showJsonView, setShowJsonView] = useState(false);

  const { openBookingModal } = useAuth();

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const res = await client.get('/api/public/services', { silent: true });
        if (res.data?.success && Array.isArray(res.data.data)) {
          setServices(res.data.data);
        }
      } catch (err) {
        // Services fallback
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(services, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-neutral-900 pb-20">
      {/* Hero Section */}
      <section className="relative py-16 sm:py-24 bg-white border-b border-neutral-200/80 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[40vw] max-w-[800px] max-h-[400px] bg-gradient-to-r from-brand-500/15 via-orange-400/10 to-purple-500/15 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 border border-brand-200 text-brand-600 text-xs font-bold shadow-sm animate-fade-in">
            <Sparkles className="h-3.5 w-3.5" />
            <span>DB4 Dynamic Services Engine</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-neutral-900 tracking-tight leading-tight max-w-4xl mx-auto">
            Services <span className="font-medium text-neutral-500">We Offer</span>
          </h1>

          <p className="text-sm sm:text-base text-neutral-600 max-w-2xl mx-auto font-medium leading-relaxed">
            From first click to final conversion, every service card is stored dynamically in DB4 (`operations_security_db`) to help scale your web presence.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => openBookingModal?.()}
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-lg hover:shadow-brand-500/20 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <Phone className="h-4 w-4 text-white fill-current shrink-0" />
              <span>Book a Free Discovery Call</span>
              <div className="p-1 rounded-full bg-white/20">
                <ArrowRight className="h-3 w-3 text-white rotate-[-45deg]" />
              </div>
            </button>

            <button
              onClick={() => setShowJsonView(!showJsonView)}
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl border border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-800 text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Code className="h-4 w-4 text-brand-600" />
              <span>{showJsonView ? 'Hide JSON Data' : 'View Services JSON Data'}</span>
            </button>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 space-y-12">
        
        {/* Toggleable JSON View Section */}
        {showJsonView && (
          <section className="bg-neutral-900 rounded-3xl p-6 text-white border border-neutral-800 shadow-2xl space-y-4 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Code className="h-4 w-4 text-brand-400" />
                  <span>Services JSON Schema Output (DB4)</span>
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Raw JSON representation of all {services.length} active service cards fetched from `operations_security_db`.
                </p>
              </div>
              <button
                onClick={handleCopyJson}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20 self-start sm:self-auto cursor-pointer"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
              </button>
            </div>
            <pre className="text-xs font-mono bg-neutral-950 p-4 rounded-2xl border border-neutral-800 overflow-x-auto text-emerald-400 leading-relaxed max-h-96 select-all">
              {JSON.stringify(services, null, 2)}
            </pre>
          </section>
        )}

        {/* Dynamic 6 Service Cards Grid */}
        <section>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-[340px] rounded-3xl bg-neutral-200 animate-pulse" />
              ))}
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-20 text-neutral-400 text-sm font-medium">
              No services configured in database.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left max-w-6xl mx-auto">
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
                  {/* Gradient overlay */}
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
                    {/* Glass effect CTA button */}
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
        </section>
      </div>
    </div>
  );
};

export default Services;

