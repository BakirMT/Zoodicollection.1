import React, { useRef, useState, useEffect } from 'react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

interface HorizontalProductCarouselProps {
  products: Product[];
  title?: string;
  subtitle?: string;
  badge?: string;
  className?: string;
}

export const HorizontalProductCarousel: React.FC<HorizontalProductCarouselProps> = ({
  products,
  title = 'Trending Carousel',
  subtitle,
  badge,
  className = '',
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll, { passive: true });
      window.addEventListener('resize', checkScroll);
      return () => {
        el.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [products]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 155; // Smaller compact card width
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (!products || products.length === 0) return null;

  return (
    <div className={`w-full py-1 ${className}`}>
      {/* Carousel Section Header */}
      <div className="flex items-center justify-between px-4 mb-2">
        <div className="flex items-center gap-2">
          {badge && (
            <span className="flex items-center gap-1 text-[#08A9A2] text-[9px] font-black uppercase tracking-wider bg-[#08A9A2]/10 px-2 py-0.5 rounded">
              <Sparkles className="w-2.5 h-2.5" />
              <span>{badge}</span>
            </span>
          )}
          <h3 className="text-xs sm:text-sm font-extrabold text-[#192E4D] leading-tight">
            {title}
          </h3>
          {subtitle && (
            <span className="hidden sm:inline text-[11px] text-[#697586]">
              · {subtitle}
            </span>
          )}
        </div>

        {/* Carousel Navigation Arrow Controls */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            aria-label="Scroll left in carousel"
            disabled={!canScrollLeft}
            onClick={() => scroll('left')}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
              canScrollLeft
                ? 'bg-white hover:bg-slate-100 text-[#192E4D] border border-slate-200 shadow-2xs active:scale-95 cursor-pointer'
                : 'bg-slate-100 text-slate-300 border border-slate-100 cursor-not-allowed'
            }`}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            aria-label="Scroll right in carousel"
            disabled={!canScrollRight}
            onClick={() => scroll('right')}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
              canScrollRight
                ? 'bg-[#192E4D] hover:bg-[#192E4D]/90 text-white shadow-2xs active:scale-95 cursor-pointer'
                : 'bg-slate-100 text-slate-300 border border-slate-100 cursor-not-allowed'
            }`}
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Horizontal Swipe/Scroll Viewport with smaller cards */}
      <div
        ref={scrollRef}
        className="flex gap-2.5 overflow-x-auto snap-x snap-mandatory scroll-smooth px-4 py-1.5 scrollbar-none"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="w-[135px] sm:w-[155px] shrink-0 snap-start"
          >
            <ProductCard product={product} compact={true} />
          </div>
        ))}
      </div>
    </div>
  );
};
