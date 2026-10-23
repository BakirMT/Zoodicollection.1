import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ProductCard } from '../../components/ProductCard';
import { ProductSpotlightCard } from '../../components/ProductSpotlightCard';
import { HorizontalProductCarousel } from '../../components/HorizontalProductCarousel';
import { AlternatingProductFeed } from '../../components/AlternatingProductFeed';
import { CircularCategorySection } from '../../components/CircularCategorySection';
import {
  Clock,
  ArrowRight,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Layers,
  Tag,
  Zap,
  Star,
  Play,
  ShieldCheck,
} from 'lucide-react';
import { Product } from '../../types';

export const HomeScreen: React.FC = () => {
  const {
    homepageSections,
    products,
    mainCategories,
    setSelectedProductId,
    setSelectedCategorySlug,
    setActiveScreen,
    setCustomerTab,
    applyCouponCode,
    setIsCouponsModalOpen,
  } = useApp();

  // Active Hero Slide index
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Category filter for the All Products showcase feed
  const [selectedFeedCategoryId, setSelectedFeedCategoryId] = useState<string>('all');

  // Real-time tick state to refresh countdowns every second
  const [currentTick, setCurrentTick] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTick(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sorted active homepage sections
  const activeSections = [...homepageSections]
    .filter((s) => s.isActive)
    .sort((a, b) => a.order - b.order);

  // Filter products for the All Products section
  const filteredCatalogProducts =
    selectedFeedCategoryId === 'all'
      ? products
      : products.filter((p) => p.mainCategoryId === selectedFeedCategoryId);

  // Calculate remaining time for any target deadline
  const getTimeRemaining = (endTimeStr?: string) => {
    if (!endTimeStr) return null;
    const target = new Date(endTimeStr).getTime();
    const diff = target - currentTick;
    if (diff <= 0) return { expired: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    return { expired: false, days, hours, minutes, seconds };
  };

  // Helper to resolve button links
  const handleLinkClick = (link?: string) => {
    if (!link) return;
    if (link.startsWith('prod_')) {
      setSelectedProductId(link);
      setActiveScreen('product_detail');
    } else if (link.startsWith('coupon:')) {
      const code = link.replace('coupon:', '');
      applyCouponCode(code);
      setCustomerTab('cart');
      setActiveScreen('tab');
    } else if (link.startsWith('category:')) {
      const catId = link.replace('category:', '');
      setSelectedCategorySlug(catId);
      setCustomerTab('categories');
      setActiveScreen('tab');
    } else if (link === 'tab:categories') {
      setCustomerTab('categories');
      setActiveScreen('tab');
    } else if (link === 'tab:cart') {
      setCustomerTab('cart');
      setActiveScreen('tab');
    } else if (link === 'tab:account') {
      setCustomerTab('account');
      setActiveScreen('tab');
    } else {
      setSelectedProductId(link);
      setActiveScreen('product_detail');
    }
  };

  return (
    <div className="flex flex-col pb-24 space-y-6 sm:space-y-7">
      {/* Dynamic Sections mapped according to Admin builder ordering */}
      {activeSections.map((section) => {
        // Schedule Check: If future start time, do not render yet
        if (section.flashSaleStartTime && new Date(section.flashSaleStartTime).getTime() > currentTick) {
          return null;
        }

        switch (section.type) {
          // 1. HERO SLIDER
          case 'image_slider': {
            const slides = section.slides || [];
            if (slides.length === 0) return null;
            const currentSlide = slides[currentSlideIndex % slides.length];
            return (
              <div key={section.id} className="relative w-full aspect-16/10 bg-[#192E4D] overflow-hidden">
                <img
                  src={currentSlide.image}
                  alt={currentSlide.heading}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center opacity-85 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#192E4D] via-[#192E4D]/40 to-transparent" />

                <div className="absolute inset-0 p-4 sm:p-5 flex flex-col justify-end text-white">
                  {currentSlide.badge && (
                    <span className="inline-block self-start px-2 py-0.5 rounded-md bg-[#FFB000] text-[#192E4D] text-[10px] font-black uppercase tracking-wider mb-1.5 shadow-xs">
                      {currentSlide.badge}
                    </span>
                  )}
                  <h2 className="text-lg sm:text-xl font-extrabold leading-tight tracking-tight drop-shadow-sm line-clamp-2">
                    {currentSlide.heading}
                  </h2>
                  <p className="text-xs text-white/90 mt-1 line-clamp-1">{currentSlide.subheading}</p>

                  <div className="flex items-center justify-between mt-3 pt-1">
                    <button
                      type="button"
                      onClick={() => handleLinkClick(currentSlide.buttonLink)}
                      className="h-10 sm:h-11 px-4 rounded-xl bg-[#08A9A2] hover:bg-[#079690] active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                    >
                      <span>{currentSlide.buttonText || 'Shop Now'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        aria-label="Previous slide"
                        onClick={() =>
                          setCurrentSlideIndex((prev) => (prev > 0 ? prev - 1 : slides.length - 1))
                        }
                        className="w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        aria-label="Next slide"
                        onClick={() => setCurrentSlideIndex((prev) => (prev + 1) % slides.length)}
                        className="w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          // 2. PROMOTIONAL POSTER BANNER
          case 'poster_banner': {
            return (
              <div
                key={section.id}
                className="mx-4 relative rounded-3xl overflow-hidden p-5 shadow-sm text-white"
                style={{ backgroundColor: section.bgColor || '#192E4D' }}
              >
                {section.bannerImage && (
                  <img
                    src={section.bannerImage}
                    alt={section.title}
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
                    style={{ opacity: (section.overlayOpacity ?? 30) / 100 }}
                  />
                )}
                <div className="relative z-10 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[#FFB000] text-xs font-black uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{section.badge || 'Exclusive Offer'}</span>
                  </div>
                  <h2 className="text-base sm:text-lg font-black leading-tight">{section.title}</h2>
                  {section.subtitle && <p className="text-xs text-white/80">{section.subtitle}</p>}

                  {section.buttonLabel && (
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => handleLinkClick(section.buttonLink || 'coupon:FLAT100')}
                        className="h-10 px-4 rounded-xl bg-[#08A9A2] hover:bg-[#079690] text-white font-bold text-xs shadow-sm transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                      >
                        <Tag className="w-3.5 h-3.5" />
                        <span>{section.buttonLabel}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          }

          // 3. SINGLE IMAGE WITH TEXT
          case 'single_image_text': {
            const isLeft = section.imagePosition === 'left' || !section.imagePosition;
            return (
              <div key={section.id} className="mx-4 p-4 rounded-3xl bg-white border border-slate-200 shadow-xs">
                <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 items-center`}>
                  {isLeft && section.bannerImage && (
                    <div className="rounded-2xl overflow-hidden aspect-4/3 bg-slate-100">
                      <img src={section.bannerImage} alt={section.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="space-y-2">
                    {section.badge && (
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#08A9A2] bg-[#08A9A2]/10 px-2 py-0.5 rounded">
                        {section.badge}
                      </span>
                    )}
                    <h2 className="text-base sm:text-lg font-black text-[#192E4D]">{section.title}</h2>
                    {section.subtitle && <p className="text-xs font-bold text-slate-600">{section.subtitle}</p>}
                    {section.description && (
                      <p className="text-xs text-slate-500 leading-relaxed">{section.description}</p>
                    )}
                    {section.buttonLabel && (
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => handleLinkClick(section.buttonLink)}
                          className="h-9 px-4 rounded-xl bg-[#192E4D] hover:bg-[#192E4D]/90 text-white text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                        >
                          <span>{section.buttonLabel}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                  {!isLeft && section.bannerImage && (
                    <div className="rounded-2xl overflow-hidden aspect-4/3 bg-slate-100">
                      <img src={section.bannerImage} alt={section.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            );
          }

          // 4. TWO-IMAGE PROMOTIONAL LAYOUT
          case 'two_image_promo': {
            const imgs = section.images || [];
            return (
              <div key={section.id} className="px-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm sm:text-base font-extrabold text-[#192E4D]">{section.title}</h3>
                  {section.subtitle && <span className="text-xs text-slate-500">{section.subtitle}</span>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {imgs.map((im, i) => (
                    <div
                      key={im.id || i}
                      onClick={() => handleLinkClick(im.link)}
                      className="group relative rounded-2xl overflow-hidden aspect-16/10 bg-slate-900 cursor-pointer shadow-xs"
                    >
                      <img
                        src={im.url}
                        alt={im.title || ''}
                        className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-3.5 flex flex-col justify-end text-white">
                        {im.badge && (
                          <span className="self-start text-[9px] font-black uppercase px-2 py-0.5 rounded bg-[#FFB000] text-[#192E4D] mb-1">
                            {im.badge}
                          </span>
                        )}
                        <h4 className="text-sm font-bold">{im.title}</h4>
                        {im.subtitle && <p className="text-[11px] text-white/80">{im.subtitle}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          }

          // 5. THREE-IMAGE GRID
          case 'three_image_grid': {
            const imgs = section.images || [];
            return (
              <div key={section.id} className="px-4 space-y-2">
                <h3 className="text-sm sm:text-base font-extrabold text-[#192E4D]">{section.title}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {imgs.map((im, i) => (
                    <div
                      key={im.id || i}
                      onClick={() => handleLinkClick(im.link)}
                      className="group relative rounded-2xl overflow-hidden aspect-4/3 bg-slate-900 cursor-pointer shadow-xs"
                    >
                      <img
                        src={im.url}
                        alt={im.title || ''}
                        className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-3 flex flex-col justify-end text-white">
                        <h4 className="text-xs font-bold">{im.title}</h4>
                        {im.subtitle && <p className="text-[10px] text-white/80">{im.subtitle}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          }

          // 6. FLASH DEALS ENGINE
          case 'flash_sale': {
            // Check expiration if not unlimited
            const isUnlimited = section.isUnlimitedDuration;
            const remaining = isUnlimited ? null : getTimeRemaining(section.flashSaleEndTime);

            // If not unlimited and expired, automatically hide
            if (!isUnlimited && remaining?.expired) {
              return null;
            }

            // Products with configured promotional prices
            const saleProducts: Product[] = (section.productIds
              ? products.filter((p) => section.productIds?.includes(p.id))
              : products.slice(0, 4)
            ).map((p) => {
              const deal = section.dealProducts?.find((d) => d.productId === p.id);
              if (deal && deal.dealPrice) {
                return {
                  ...p,
                  salePrice: deal.dealPrice,
                };
              }
              return p;
            });

            if (saleProducts.length === 0) return null;
            const primaryDeal = saleProducts[0];
            const secondaryDeals = saleProducts.slice(1);

            return (
              <div
                key={section.id}
                className="mx-4 p-3 sm:p-3.5 rounded-2xl bg-gradient-to-br from-[#F20D58]/10 via-[#F56645]/10 to-[#FFB000]/10 border border-[#F20D58]/20 space-y-2.5"
              >
                {/* Header with Countdown or Unlimited Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-[#F20D58] text-white">
                      <Zap className="w-4 h-4" />
                    </span>
                    <div>
                      <h2 className="text-xs sm:text-sm font-extrabold text-[#192E4D]">
                        {section.title}
                      </h2>
                      <p className="text-[11px] text-[#697586]">{section.subtitle}</p>
                    </div>
                  </div>

                  {isUnlimited ? (
                    <span className="px-2.5 py-1 rounded-lg bg-[#FFB000] text-[#192E4D] font-black text-xs uppercase tracking-wider shadow-2xs">
                      Special Offer
                    </span>
                  ) : remaining && (
                    <div className="flex items-center gap-1 font-mono text-xs font-black tabular-nums">
                      {remaining.days > 0 && (
                        <>
                          <span className="px-1.5 py-0.5 rounded-md bg-[#192E4D] text-white">
                            {remaining.days}d
                          </span>
                          <span className="text-[#192E4D]">:</span>
                        </>
                      )}
                      <span className="px-1.5 py-0.5 rounded-md bg-[#192E4D] text-white">
                        {String(remaining.hours).padStart(2, '0')}h
                      </span>
                      <span className="text-[#192E4D]">:</span>
                      <span className="px-1.5 py-0.5 rounded-md bg-[#192E4D] text-white">
                        {String(remaining.minutes).padStart(2, '0')}m
                      </span>
                      <span className="text-[#192E4D]">:</span>
                      <span className="px-1.5 py-0.5 rounded-md bg-[#F20D58] text-white">
                        {String(remaining.seconds).padStart(2, '0')}s
                      </span>
                    </div>
                  )}
                </div>

                {/* Single Featured Product Spotlight */}
                <ProductSpotlightCard product={primaryDeal} badgeLabel="⚡ Flash Deal Spotlight" />

                {/* Horizontal Product Carousel for subsequent deals */}
                {secondaryDeals.length > 0 && (
                  <div className="pt-1">
                    <HorizontalProductCarousel
                      products={secondaryDeals}
                      title="More Flash Deals"
                      subtitle="Limited stock remaining at promotional prices"
                      badge="Expiring Soon"
                    />
                  </div>
                )}
              </div>
            );
          }

          // 7. LIMITED-TIME OFFERS
          case 'limited_time_offers': {
            const offerProducts = section.productIds
              ? products.filter((p) => section.productIds?.includes(p.id))
              : products.slice(0, 4);

            if (offerProducts.length === 0) return null;

            return (
              <div key={section.id} className="space-y-2">
                <div className="px-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs sm:text-sm font-extrabold text-[#192E4D] flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-[#F20D58]" />
                      <span>{section.title}</span>
                    </h3>
                    {section.subtitle && <p className="text-[11px] text-[#697586]">{section.subtitle}</p>}
                  </div>
                </div>

                <HorizontalProductCarousel
                  products={offerProducts}
                  title="Limited-Time Specials"
                  subtitle="Promotional discount applied automatically"
                  badge={section.badge || 'PROMO'}
                />
              </div>
            );
          }

          // 8. CIRCULAR CATEGORY SYSTEM (Flipkart-style circular layout)
          case 'category_carousel':
          case 'main_categories': {
            return (
              <div key={section.id}>
                <CircularCategorySection section={section} />
              </div>
            );
          }

          // 9. PROMOTIONAL VIDEO
          case 'promotional_video': {
            return (
              <div key={section.id} className="mx-4 p-4 rounded-3xl bg-slate-900 text-white space-y-3">
                <div className="space-y-1">
                  {section.badge && (
                    <span className="text-[9px] font-black uppercase text-[#08A9A2] bg-[#08A9A2]/20 px-2 py-0.5 rounded">
                      {section.badge}
                    </span>
                  )}
                  <h3 className="text-sm sm:text-base font-extrabold">{section.title}</h3>
                  {section.subtitle && <p className="text-xs text-slate-300">{section.subtitle}</p>}
                </div>

                {section.videoUrl && (
                  <div className="relative rounded-2xl overflow-hidden aspect-16/9 bg-black">
                    <video
                      src={section.videoUrl}
                      poster={section.videoPoster}
                      controls
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            );
          }

          // 10. CUSTOM HTML / RICH TEXT
          case 'custom_html': {
            if (!section.htmlContent) return null;
            return (
              <div key={section.id} className="mx-4">
                <div
                  className="rounded-2xl"
                  dangerouslySetInnerHTML={{ __html: section.htmlContent }}
                />
              </div>
            );
          }

          // 11. BRAND SHOWCASE
          case 'brand_showcase': {
            const brands = section.images || [
              { id: '1', url: '', title: 'ZOODI Collection', subtitle: 'Signature' },
              { id: '2', url: '', title: 'ZOODI Motion', subtitle: 'Footwear' },
              { id: '3', url: '', title: 'Aura Kerala', subtitle: 'Handwoven' },
              { id: '4', url: '', title: 'Titan Audio', subtitle: 'Sound' },
            ];
            return (
              <div key={section.id} className="px-4 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#192E4D]">
                  <ShieldCheck className="w-4 h-4 text-[#08A9A2]" />
                  <span>{section.title || 'Official Brand Showcase'}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {brands.map((b) => (
                    <div
                      key={b.id}
                      className="p-3 rounded-xl bg-white border border-slate-200 text-center shadow-2xs hover:border-[#08A9A2] transition-colors"
                    >
                      <h4 className="text-xs font-bold text-[#192E4D]">{b.title}</h4>
                      <p className="text-[10px] text-slate-400">{b.subtitle}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          }

          // 12. PRODUCT GRID
          case 'product_grid': {
            const gridProducts = section.productIds
              ? products.filter((p) => section.productIds?.includes(p.id))
              : products.slice(0, 8);
            const cols = section.columns || 3;

            return (
              <div key={section.id} className="px-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-extrabold text-[#192E4D]">{section.title}</h3>
                  {section.subtitle && <p className="text-[11px] text-[#697586]">{section.subtitle}</p>}
                </div>
                <div
                  className={`grid gap-2.5 sm:gap-3 ${
                    cols === 2
                      ? 'grid-cols-2'
                      : cols === 4
                      ? 'grid-cols-2 sm:grid-cols-4'
                      : 'grid-cols-2 sm:grid-cols-3'
                  }`}
                >
                  {gridProducts.map((p) => (
                    <ProductCard key={p.id} product={p} compact={true} />
                  ))}
                </div>
              </div>
            );
          }

          // 13. PRODUCT SECTIONS (Best Sellers, Trending, New Arrivals, For You, Collections, Carousel, etc.)
          case 'best_sellers':
          case 'trending':
          case 'new_arrivals':
          case 'featured_collections':
          case 'for_you':
          case 'product_carousel':
          case 'custom_collection':
          default: {
            let sectionProducts = section.productIds
              ? products.filter((p) => section.productIds?.includes(p.id))
              : section.type === 'best_sellers'
              ? products.filter((p) => p.bestSeller)
              : section.type === 'trending'
              ? products.filter((p) => p.trending)
              : section.type === 'new_arrivals'
              ? products.filter((p) => p.newArrival)
              : products.slice(0, 4);

            if (sectionProducts.length === 0) return null;

            // If configured strictly as carousel
            if (section.displayMode === 'carousel') {
              return (
                <div key={section.id} className="space-y-1">
                  <HorizontalProductCarousel
                    products={sectionProducts}
                    title={section.title}
                    subtitle={section.subtitle}
                    badge={section.badge || 'Collection'}
                  />
                </div>
              );
            }

            // Alternating spotlight & horizontal carousel rhythm
            const primaryItem = sectionProducts[0];
            const secondaryItems = sectionProducts.slice(1);

            return (
              <div key={section.id} className="space-y-2.5">
                <div className="px-4">
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <h2 className="text-xs sm:text-sm font-extrabold text-[#192E4D]">
                        {section.title}
                      </h2>
                      {section.subtitle && (
                        <p className="text-[11px] text-[#697586]">{section.subtitle}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* 1. First product shown as a product spotlight */}
                <div className="px-4">
                  <ProductSpotlightCard
                    product={primaryItem}
                    badgeLabel={section.badge || '★ Spotlight Pick'}
                  />
                </div>

                {/* 2. And the next products below change to a horizontal product carousel */}
                {secondaryItems.length > 0 && (
                  <HorizontalProductCarousel
                    products={secondaryItems}
                    title={`More ${section.title}`}
                    subtitle="Swipe horizontally to view more products"
                    badge="Trending"
                  />
                )}
              </div>
            );
          }
        }
      })}

      {/* COMPREHENSIVE ALL PRODUCTS CATALOG FEED:
          Organized in alternating spotlight & horizontal carousel */}
      <div className="pt-2 border-t border-slate-200/80">
        <div className="px-4 mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#192E4D] text-white">
                <Layers className="w-4 h-4" />
              </span>
              <div>
                <h2 className="text-xs sm:text-sm font-extrabold text-[#192E4D]">
                  All Products Showcase
                </h2>
                <p className="text-[11px] text-[#697586]">
                  Full catalog organized in alternating spotlight & horizontal carousel
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-[#08A9A2] tabular-nums">
              {filteredCatalogProducts.length} items
            </span>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1.5">
            <button
              type="button"
              onClick={() => setSelectedFeedCategoryId('all')}
              className={`h-7 px-3 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedFeedCategoryId === 'all'
                  ? 'bg-[#192E4D] text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-400'
              }`}
            >
              All Items ({products.length})
            </button>

            {mainCategories.map((cat) => {
              const count = products.filter((p) => p.mainCategoryId === cat.id).length;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedFeedCategoryId(cat.id)}
                  className={`h-7 px-3 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    selectedFeedCategoryId === cat.id
                      ? 'bg-[#08A9A2] text-white shadow-2xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-400'
                  }`}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Alternating feed */}
        <AlternatingProductFeed
          products={filteredCatalogProducts}
          spotlightBadgePrefix="Spotlight Collection"
          carouselTitle="Horizontal Product Carousel"
          carouselSubtitle="Swipe horizontally to view next products"
        />
      </div>
    </div>
  );
};
