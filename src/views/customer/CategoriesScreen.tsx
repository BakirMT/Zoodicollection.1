import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ProductCard } from '../../components/ProductCard';
import { CategoryIcon } from '../../components/CategoryIcon';
import { ChevronRight } from 'lucide-react';

export const CategoriesScreen: React.FC = () => {
  const {
    mainCategories,
    subCategories,
    subSubCategories,
    products,
    selectedCategorySlug,
  } = useApp();

  // Active Main Category ID (default to selectedCategorySlug or first category)
  const [activeMainId, setActiveMainId] = useState<string>(
    selectedCategorySlug && selectedCategorySlug !== 'coupons_deals' && mainCategories.some((c) => c.id === selectedCategorySlug)
      ? selectedCategorySlug
      : mainCategories[0]?.id || 'cat_fashion'
  );

  // Sync activeMainId if user clicked a category on Home or Search
  useEffect(() => {
    if (selectedCategorySlug && selectedCategorySlug !== 'coupons_deals' && mainCategories.some((c) => c.id === selectedCategorySlug)) {
      setActiveMainId(selectedCategorySlug);
      setActiveSubId(null);
      setActiveSubSubId(null);
    }
  }, [selectedCategorySlug, mainCategories]);

  // Active Subcategory ID (null means all subcategories in active main)
  const [activeSubId, setActiveSubId] = useState<string | null>(null);

  // Active Sub-Subcategory ID
  const [activeSubSubId, setActiveSubSubId] = useState<string | null>(null);

  // Filter and sort state
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'rating'>('featured');
  const [inStockOnly, setInStockOnly] = useState(false);

  // Current hierarchy items
  const activeMain = mainCategories.find((c) => c.id === activeMainId) || mainCategories[0];
  const relevantSubs = subCategories.filter((s) => s.mainCategoryId === activeMainId && s.isActive);
  const activeSub = subCategories.find((s) => s.id === activeSubId);
  const relevantSubSubs = activeSubId
    ? subSubCategories.filter((ss) => ss.subCategoryId === activeSubId && ss.isActive)
    : [];
  const activeSubSub = subSubCategories.find((ss) => ss.id === activeSubSubId);

  // Filter products matching category level
  let filteredProducts = products.filter((p) => {
    if (activeSubSubId) return p.subSubCategoryId === activeSubSubId;
    if (activeSubId) return p.subCategoryId === activeSubId;
    return p.mainCategoryId === activeMainId;
  });

  if (inStockOnly) {
    filteredProducts = filteredProducts.filter((p) => p.variants?.some((v) => v.stock > 0));
  }

  // Sort
  filteredProducts.sort((a, b) => {
    if (sortBy === 'price_asc') return a.price - b.price;
    if (sortBy === 'price_desc') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0; // featured
  });

  return (
    <div className="flex flex-col min-h-screen bg-white pb-28">
      {/* 3-LEVEL BREADCRUMBS */}
      <div className="bg-[#F6F8FA] border-b border-[#E6EAF0] px-4 py-2.5 flex items-center gap-1.5 text-xs text-[#697586] overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => {
            setActiveSubId(null);
            setActiveSubSubId(null);
          }}
          className="font-bold text-[#08A9A2] hover:underline shrink-0 p-1"
        >
          {activeMain?.name || 'Categories'}
        </button>

        {activeSub && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-[#697586] shrink-0" />
            <button
              type="button"
              onClick={() => setActiveSubSubId(null)}
              className={`font-bold hover:underline shrink-0 p-1 ${
                !activeSubSub ? 'text-[#192E4D]' : 'text-[#08A9A2]'
              }`}
            >
              {activeSub.name}
            </button>
          </>
        )}

        {activeSubSub && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-[#697586] shrink-0" />
            <span className="font-extrabold text-[#192E4D] shrink-0 p-1">{activeSubSub.name}</span>
          </>
        )}
      </div>

      {/* LEVEL 1: MAIN CATEGORY HORIZONTAL TABS (min 44px tap target) */}
      <div className="px-4 py-3 border-b border-[#E6EAF0] flex items-center gap-2 overflow-x-auto no-scrollbar">
        {mainCategories
          .filter((c) => c.isActive)
          .map((cat) => {
            const isSelected = cat.id === activeMainId;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setActiveMainId(cat.id);
                  setActiveSubId(null);
                  setActiveSubSubId(null);
                }}
                className={`min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-bold shrink-0 transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-[#08A9A2] text-white shadow-xs'
                    : 'bg-[#F6F8FA] text-[#697586] hover:bg-[#E6EAF0]'
                }`}
              >
                <CategoryIcon iconName={cat.iconName} className="w-3.5 h-3.5" />
                <span>{cat.name}</span>
              </button>
            );
          })}
      </div>

      {/* LEVEL 2 & 3: SUBCATEGORY & SUB-SUBCATEGORY PILLS */}
      {relevantSubs.length > 0 && (
        <div className="px-4 py-2.5 bg-[#FAFBFD] border-b border-[#E6EAF0] space-y-2">
          {/* Subcategories (Level 2) */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => {
                setActiveSubId(null);
                setActiveSubSubId(null);
              }}
              className={`min-h-[36px] px-3.5 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-colors ${
                activeSubId === null
                  ? 'bg-[#192E4D] text-white'
                  : 'bg-white border border-[#E6EAF0] text-[#697586] hover:bg-gray-50'
              }`}
            >
              All {activeMain?.name}
            </button>
            {relevantSubs.map((sub) => {
              const isSelected = sub.id === activeSubId;
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => {
                    setActiveSubId(sub.id);
                    setActiveSubSubId(null);
                  }}
                  className={`min-h-[36px] px-3.5 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-[#192E4D] text-white'
                      : 'bg-white border border-[#E6EAF0] text-[#697586] hover:border-[#192E4D]'
                  }`}
                >
                  {sub.name}
                </button>
              );
            })}
          </div>

          {/* Sub-subcategories (Level 3) */}
          {activeSubId && relevantSubSubs.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
              <button
                type="button"
                onClick={() => setActiveSubSubId(null)}
                className={`min-h-[36px] px-3.5 py-1.5 rounded-lg text-xs font-bold shrink-0 border transition-all active:scale-95 ${
                  activeSubSubId === null
                    ? 'bg-[#08A9A2] text-white border-[#08A9A2]'
                    : 'bg-white text-[#697586] border-[#E6EAF0] hover:bg-gray-50'
                }`}
              >
                All {activeSub?.name}
              </button>
              {relevantSubSubs.map((subsub) => {
                const isSelected = subsub.id === activeSubSubId;
                return (
                  <button
                    key={subsub.id}
                    type="button"
                    onClick={() => setActiveSubSubId(subsub.id)}
                    className={`min-h-[36px] px-3.5 py-1.5 rounded-lg text-xs font-bold shrink-0 border transition-all active:scale-95 ${
                      isSelected
                        ? 'bg-[#08A9A2] text-white border-[#08A9A2]'
                        : 'bg-white text-[#697586] border-[#E6EAF0] hover:border-[#08A9A2]'
                    }`}
                  >
                    {subsub.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* FILTER & SORT CONTROLS BAR (Consistent h-10 height) */}
      <div className="px-4 py-2.5 flex items-center justify-between border-b border-[#F0F4F8] text-xs">
        <span className="font-extrabold text-[#192E4D] tabular-nums">
          {filteredProducts.length} Products
        </span>

        <div className="flex items-center gap-2">
          {/* In Stock Filter */}
          <button
            type="button"
            onClick={() => setInStockOnly(!inStockOnly)}
            className={`h-10 px-3 rounded-xl border text-xs font-bold transition-all active:scale-95 flex items-center ${
              inStockOnly
                ? 'bg-[#08A9A2]/10 border-[#08A9A2] text-[#08A9A2]'
                : 'border-[#E6EAF0] text-[#697586] bg-white hover:bg-[#F6F8FA]'
            }`}
          >
            In Stock
          </button>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="h-10 px-3 rounded-xl border border-[#E6EAF0] text-xs font-bold text-[#192E4D] bg-white focus:outline-hidden focus:border-[#08A9A2]"
          >
            <option value="featured">Featured</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>

      {/* PRODUCT GRID */}
      <div className="p-4">
        {filteredProducts.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm font-bold text-[#192E4D]">No products found in this category</p>
            <p className="text-xs text-[#697586] mt-1">Try switching subcategories or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {filteredProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
