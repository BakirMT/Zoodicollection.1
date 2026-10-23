import React, { useRef } from 'react';
import { useApp } from '../context/AppContext';
import { HomepageSection, MainCategory } from '../types';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

interface CircularCategorySectionProps {
  section?: HomepageSection;
  showViewAll?: boolean;
}

export const CircularCategorySection: React.FC<CircularCategorySectionProps> = ({
  section,
  showViewAll = true,
}) => {
  const { mainCategories, setSelectedCategorySlug, setCustomerTab, setActiveScreen } = useApp();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Filter active and homepage-enabled categories, sorted by order
  const displayCategories = mainCategories
    .filter((cat) => cat.isActive !== false && cat.showOnHomepage !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  if (displayCategories.length === 0) return null;

  const handleCategoryClick = (catId: string) => {
    setSelectedCategorySlug(catId);
    setCustomerTab('categories');
    setActiveScreen('tab');
  };

  const handleViewAll = () => {
    setSelectedCategorySlug(null);
    setCustomerTab('categories');
    setActiveScreen('tab');
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -240, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 240, behavior: 'smooth' });
    }
  };

  // Helper to extract clean initials (1-2 uppercase letters)
  const getCategoryInitial = (name: string) => {
    const clean = name.trim();
    const parts = clean.split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return clean.slice(0, 2).toUpperCase();
  };

  return (
    <section className="px-4 py-2" aria-label={section?.title || 'Shop by Category'}>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm sm:text-base font-extrabold text-[#192E4D] tracking-tight">
            {section?.title || 'Featured Categories'}
          </h2>
          {section?.subtitle && (
            <p className="text-[11px] sm:text-xs text-[#697586] mt-0.5">{section.subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Desktop Arrow Controls */}
          <div className="hidden sm:flex items-center gap-1 mr-1">
            <button
              type="button"
              onClick={scrollLeft}
              className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              title="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={scrollRight}
              className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              title="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {showViewAll && (
            <button
              type="button"
              onClick={handleViewAll}
              className="text-xs font-bold text-[#08A9A2] hover:underline flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Flipkart-inspired Circular Categories Carousel */}
      <div
        ref={scrollContainerRef}
        className="flex items-start gap-4 sm:gap-6 overflow-x-auto no-scrollbar scroll-smooth py-1 px-0.5 -mx-1"
      >
        {displayCategories.map((cat) => {
          const mode = cat.displayMode || (cat.image ? 'image' : 'text');
          const hasImage = Boolean(cat.image && cat.image.trim() !== '');
          const bgColor = cat.backgroundColor || '#F0FDF4';
          const textColor = cat.textColor || '#08A9A2';
          const fitMode = cat.imageFit === 'contain' ? 'object-contain' : 'object-cover';
          const posMode =
            cat.imagePosition === 'top'
              ? 'object-top'
              : cat.imagePosition === 'bottom'
              ? 'object-bottom'
              : 'object-center';

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategoryClick(cat.id)}
              className="group flex flex-col items-center shrink-0 cursor-pointer focus:outline-hidden text-center transition-transform"
              title={`Explore ${cat.name}`}
            >
              {/* Perfectly Circular Container (Flipkart-style) */}
              <div
                className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-[#E6EAF0] group-hover:border-[#08A9A2] shadow-2xs group-hover:shadow-md transition-all duration-200 group-hover:scale-105 active:scale-95 flex items-center justify-center"
                style={{
                  backgroundColor: mode !== 'image' || !hasImage ? bgColor : undefined,
                }}
              >
                {/* MODE A: Image Circle */}
                {mode === 'image' && hasImage ? (
                  <img
                    src={cat.image!}
                    alt={cat.name}
                    className={`w-full h-full ${fitMode} ${posMode} transition-transform duration-300 group-hover:scale-110`}
                    loading="lazy"
                  />
                ) : mode === 'text' ? (
                  /* MODE B: Text Circle */
                  <div
                    className="w-full h-full p-2 flex items-center justify-center"
                    style={{ color: textColor }}
                  >
                    <span className="text-[10px] sm:text-xs font-black leading-tight text-center break-words line-clamp-3">
                      {cat.name}
                    </span>
                  </div>
                ) : (
                  /* MODE C: Initial/Letter Circle */
                  <div
                    className="w-full h-full flex items-center justify-center font-black text-lg sm:text-2xl tracking-tighter"
                    style={{ color: textColor }}
                  >
                    {getCategoryInitial(cat.name)}
                  </div>
                )}
              </div>

              {/* Centered Category Name Beneath Circle (Always for Mode A & C, and clean label for Mode B) */}
              <span
                className={`text-[11px] sm:text-xs font-bold text-[#192E4D] text-center mt-2 max-w-[72px] sm:max-w-[84px] leading-tight line-clamp-2 group-hover:text-[#08A9A2] transition-colors ${
                  mode === 'text' ? 'text-[#697586] font-semibold text-[10px] sm:text-[11px]' : ''
                }`}
              >
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
