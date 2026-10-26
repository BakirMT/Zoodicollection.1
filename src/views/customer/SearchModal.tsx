import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ProductCard } from '../../components/ProductCard';
import { Search, X, TrendingUp } from 'lucide-react';

export const SearchModal: React.FC = () => {
  const { products, setActiveScreen } = useApp();
  const [query, setQuery] = useState('');

  const popularSearches = ['Bomber Jacket', 'Red Jacket', 'Aeroknit', 'Backpack', 'Silk Dress'];

  const filteredProducts = query.trim()
    ? products.filter(
        (p) =>
          p.name?.toLowerCase().includes(query.toLowerCase()) ||
          p.brand?.toLowerCase().includes(query.toLowerCase()) ||
          p.description?.toLowerCase().includes(query.toLowerCase()) ||
          p.tags?.some((t) => t.toLowerCase().includes(query.toLowerCase())) ||
          p.variants?.some(
            (v) =>
              v.sku?.toLowerCase().includes(query.toLowerCase()) ||
              v.colorName?.toLowerCase().includes(query.toLowerCase())
          )
      )
    : [];

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col overflow-y-auto">
      {/* Search Header (min 56px height) */}
      <div className="sticky top-0 bg-white border-b border-[#E6EAF0] px-4 py-2.5 flex items-center gap-3 min-h-[56px] z-10">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#697586] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            autoFocus
            placeholder="Search by name, brand, color, SKU..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-9 text-xs sm:text-sm border border-[#E6EAF0] rounded-xl focus:outline-hidden focus:border-[#08A9A2] focus:ring-2 focus:ring-[#08A9A2]/20"
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setQuery('')}
              className="w-8 h-8 rounded-full flex items-center justify-center absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setActiveScreen('tab')}
          className="h-11 px-3 text-xs font-bold text-[#697586] hover:text-[#192E4D] active:scale-95 transition-all"
        >
          Cancel
        </button>
      </div>

      <div className="p-4 space-y-5 text-left flex-1">
        {/* Popular Tags when query is empty */}
        {!query && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#192E4D]">
              <TrendingUp className="w-4 h-4 text-[#FFB000]" />
              <span>Trending Searches</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => setQuery(term)}
                  className="min-h-[36px] px-3.5 py-1.5 rounded-xl bg-[#F6F8FA] border border-[#E6EAF0] text-xs font-semibold text-[#192E4D] hover:bg-[#E6EAF0] active:scale-95 transition-all"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {query && (
          <div>
            <span className="text-xs font-bold text-[#697586] block mb-3 tabular-nums">
              Found {filteredProducts.length} results for "{query}"
            </span>

            {filteredProducts.length === 0 ? (
              <div className="py-16 text-center text-xs text-[#697586]">
                No matching products found. Try searching for "Jacket", "Red", "Sneaker" or "Silk".
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {filteredProducts.map((p) => (
                  <ProductCard key={p.id} product={p} onSelect={() => setActiveScreen('product_detail')} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
