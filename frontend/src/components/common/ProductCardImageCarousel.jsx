import React, { useState, useEffect, useMemo, useRef } from 'react';

/**
 * ProductCardImageCarousel
 * Automatically scrolls through multiple product images every 10 seconds
 * and displays indicator dots at the bottom.
 * If the product has only 1 image, it renders a standard single image
 * with no scroll effect and no indicators.
 */
const ProductCardImageCarousel = ({ product, className = '' }) => {
  const images = useMemo(() => {
    if (!product) return [];
    const list = [];

    // Check product.images array
    if (Array.isArray(product.images) && product.images.length > 0) {
      product.images.forEach((img) => {
        const url = typeof img === 'string' ? img : img?.url;
        if (url && typeof url === 'string' && url.trim() && !list.includes(url.trim())) {
          list.push(url.trim());
        }
      });
    }

    // Include thumbnail/image if not already present in the list
    const thumbUrl = product.thumbnail?.url || (typeof product.thumbnail === 'string' ? product.thumbnail : '') || product.image;
    if (thumbUrl && typeof thumbUrl === 'string' && thumbUrl.trim() && !list.includes(thumbUrl.trim())) {
      list.unshift(thumbUrl.trim());
    }

    // Fallback placeholder if completely empty
    if (list.length === 0) {
      list.push('https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80');
    }

    return list;
  }, [product]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef(null);
  const hasMultiple = images.length > 1;

  // Reset current index when product changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [product?._id]);

  // Auto-scroll every 10 seconds if multiple images exist
  useEffect(() => {
    if (!hasMultiple) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 10000); // 10 seconds interval

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [hasMultiple, images.length]);

  // If only 1 image: don't show any scroll effect, transition, or indicator
  if (!hasMultiple) {
    return (
      <img
        src={images[0]}
        alt={product?.name || 'Product'}
        className={`h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 ${className}`}
        onError={(e) => {
          e.target.src = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80';
        }}
      />
    );
  }

  // Multiple images: scroll every 10 seconds with indicator dots
  return (
    <div className={`relative h-full w-full overflow-hidden select-none ${className}`}>
      {/* Sliding Reel */}
      <div
        className="flex h-full w-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((src, idx) => (
          <div key={idx} className="h-full w-full min-w-full shrink-0 relative">
            <img
              src={src}
              alt={`${product?.name || 'Product'} - ${idx + 1}`}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80';
              }}
            />
          </div>
        ))}
      </div>

      {/* Slide Indicators (Pills / Dots) */}
      <div
        className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 px-2 py-1 rounded-full bg-black/40 backdrop-blur-md"
        onClick={(e) => e.stopPropagation()}
      >
        {images.map((_, idx) => (
          <button
            key={idx}
            type="button"
            aria-label={`Slide ${idx + 1}`}
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex(idx);
            }}
            className={`transition-all duration-300 rounded-full cursor-pointer ${
              currentIndex === idx
                ? 'w-3.5 h-1.5 bg-white shadow-sm'
                : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/90'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductCardImageCarousel;

