import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, ExternalLink, Calendar, Layers, ImageIcon, Eye } from 'lucide-react';
import client from '../api/client';

const Banners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previewBanner, setPreviewBanner] = useState(null);

  useEffect(() => {
    let cancelled = false;
    client.get('/api/public/upcoming-banners')
      .then((res) => {
        if (cancelled) return;
        if (res.data?.success && Array.isArray(res.data.data)) {
          setBanners(res.data.data);
        } else {
          setBanners([]);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.response?.data?.message || 'Failed to load banners');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-neutral-900">
      {/* Page Header */}
      <section className="pt-24 pb-10 sm:pt-28 sm:pb-12 bg-white border-b border-neutral-200/80 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-neutral-500 hover:text-brand-600 transition-colors mb-4"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Home
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-3 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50/90 border border-orange-200 text-neon-orange text-xs font-bold shadow-xs">
                <Sparkles className="h-3.5 w-3.5 fill-neon-orange text-neon-orange" />
                <span>UPCOMING ROADMAP 2026 • BANNER GALLERY</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-neutral-900 tracking-tight">
                Upcoming <span className="text-neon-orange">Products & Banners</span>
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-neutral-500 max-w-2xl font-medium leading-relaxed">
                Explore every active banner from the homepage carousel, neatly organized as a gallery.
                Click any banner to open the full-size preview and visit the linked destination.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-500 font-semibold">
              <Layers className="h-4 w-4 text-orange-500" />
              <span>{loading ? 'Loading…' : `${banners.length} banner${banners.length === 1 ? '' : 's'} live`}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Banner Grid */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-[16/7] rounded-2xl bg-neutral-200/70 animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-8 text-center text-rose-600 text-sm font-semibold">
              {error}
            </div>
          ) : banners.length === 0 ? (
            <div className="rounded-2xl border border-neutral-200/80 bg-white p-16 text-center space-y-3">
              <ImageIcon className="h-10 w-10 mx-auto text-neutral-300" />
              <p className="text-sm font-bold text-neutral-700">No banners are live right now.</p>
              <p className="text-xs text-neutral-500">Please check back later — admins publish new ones regularly.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {banners.map((banner, index) => {
                const isExternal = banner.link && /^https?:\/\//i.test(banner.link);
                const LinkComponent = isExternal ? 'a' : Link;
                const linkProps = isExternal
                  ? { href: banner.link, target: '_blank', rel: 'noopener noreferrer' }
                  : { to: banner.link || '/products' };
                return (
                  <article
                    key={banner._id}
                    className="group relative rounded-2xl overflow-hidden border border-neutral-200/80 bg-white shadow-sm hover:shadow-xl hover:border-orange-300 transition-all duration-300"
                  >
                    {/* Image */}
                    <div className="relative aspect-[16/7] bg-neutral-950 overflow-hidden">
                      <img
                        src={banner.bannerImage}
                        alt={banner.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/1200x500?text=Banner';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/70 via-neutral-950/10 to-transparent" />

                      {/* Top-left badges */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-white text-[10px] font-bold border border-white/10">
                          #{index + 1}
                        </span>
                        {banner.badge && (
                          <span className="px-2.5 py-1 rounded-full bg-orange-500/95 text-white text-[10px] font-bold shadow-sm">
                            {banner.badge}
                          </span>
                        )}
                      </div>

                      {/* Top-right preview button */}
                      <button
                        type="button"
                        onClick={() => setPreviewBanner(banner)}
                        className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/70 hover:bg-black/90 backdrop-blur-md text-white text-[10px] font-semibold border border-white/10 transition-colors"
                        title="Preview full size"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Preview
                      </button>

                      {/* Bottom info overlay */}
                      <div className="absolute bottom-0 inset-x-0 p-5 text-white">
                        {banner.headline && (
                          <h2 className="text-lg sm:text-xl font-extrabold leading-snug drop-shadow">
                            {banner.headline}
                          </h2>
                        )}
                        {banner.subtitle && (
                          <p className="text-[12px] sm:text-xs text-white/85 mt-1 line-clamp-2 max-w-2xl">
                            {banner.subtitle}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Footer action bar */}
                    <div className="flex items-center justify-between p-4 sm:p-5">
                      <div className="min-w-0">
                        <p className="text-xs uppercase font-bold tracking-wider text-neutral-400">
                          {banner.title}
                        </p>
                        <LinkComponent
                          {...linkProps}
                          className="inline-flex items-center gap-1.5 text-sm font-bold text-neutral-900 hover:text-orange-600 transition-colors mt-0.5 truncate max-w-full"
                        >
                          <span className="truncate">{banner.link || '/products'}</span>
                          <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                        </LinkComponent>
                      </div>
                      <LinkComponent
                        {...linkProps}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-900 hover:bg-orange-600 text-white text-xs font-bold transition-colors shadow-sm shrink-0"
                      >
                        <span>Open</span>
                        <ArrowLeft className="h-3.5 w-3.5 rotate-180" />
                      </LinkComponent>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Full-size preview modal */}
      {previewBanner && (
        <div
          className="fixed inset-0 z-50 bg-neutral-950/85 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
          onClick={() => setPreviewBanner(null)}
        >
          <div
            className="relative max-w-5xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewBanner(null)}
              className="absolute -top-2 -right-2 sm:top-3 sm:right-3 z-10 px-3 py-1.5 rounded-xl bg-white text-neutral-900 text-xs font-bold shadow-lg hover:bg-neutral-100 transition-colors"
            >
              Close
            </button>
            <img
              src={previewBanner.bannerImage}
              alt={previewBanner.title}
              className="w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl bg-neutral-900"
            />
            {previewBanner.headline && (
              <p className="text-center text-white/90 text-sm font-medium mt-3 px-4">
                {previewBanner.headline}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Banners;
