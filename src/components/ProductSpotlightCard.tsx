import React, { useState } from 'react';
import { Product } from '../types';
import { useApp } from '../context/AppContext';
import { getEffectiveProductPricing, isProductVisibleToCustomer } from '../services/firestoreSync';
import { Heart, Star, ShoppingBag, ArrowRight, Check } from 'lucide-react';

interface ProductSpotlightCardProps {
  product: Product;
  badgeLabel?: string;
  onSelect?: () => void;
}

export const ProductSpotlightCard: React.FC<ProductSpotlightCardProps> = ({
  product,
  badgeLabel = 'Featured Product',
  onSelect,
}) => {
  if (!product || !isProductVisibleToCustomer(product)) return null;

  const { setSelectedProductId, setActiveScreen, wishlistIds, toggleWishlist, addToCart } = useApp();
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [justAdded, setJustAdded] = useState(false);

  const activeVariant = product.variants?.[selectedVariantIndex] || product.variants?.[0];
  const activeImage =
    activeVariant?.images?.[0] ||
    product.additionalImages?.[0] ||
    'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=400&q=80';

  const isWishlisted = wishlistIds.includes(product.id);

  const { currentPrice, originalPrice, hasDiscount, discountPercent } =
    getEffectiveProductPricing(product, activeVariant);

  const totalStock = (product.variants || []).reduce((sum, v) => sum + (v.stock ?? 0), 0);
  const isOutOfStock = totalStock <= 0;

  const handleOpenDetail = () => {
    setSelectedProductId(product.id);
    setActiveScreen('product_detail');
    if (onSelect) onSelect();
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) {
      handleOpenDetail();
      return;
    }
    const configuredColors = (product.variants || []).filter(
      (v) =>
        v.attributes?.isUnconfiguredDefault !== 'true' &&
        v.colorName &&
        v.colorName.trim() !== '' &&
        v.colorName.trim().toLowerCase() !== 'default' &&
        v.colorName.trim().toLowerCase() !== 'standard'
    );
    const needsOptionChoice =
      (product.variantType !== 'none' && product.sizes && product.sizes.length > 0) ||
      configuredColors.length > 0;

    if (needsOptionChoice) {
      handleOpenDetail();
      return;
    }

    if (activeVariant) {
      addToCart(product, activeVariant, 'One Size', 1);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1500);
    }
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <div
      onClick={handleOpenDetail}
      className="group relative bg-white rounded-2xl border border-[#E6EAF0] p-3 sm:p-3.5 shadow-[0_2px_12px_rgba(25,46,77,0.04)] hover:shadow-[0_6px_20px_rgba(25,46,77,0.08)] transition-all duration-200 cursor-pointer overflow-hidden flex items-center gap-3 sm:gap-4"
    >
      {/* Left Thumbnail Media (Compact & Proportional) */}
      <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-xl bg-[#F6F8FA] overflow-hidden shrink-0">
        <img
          src={activeImage}
          alt={product.name}
          referrerPolicy="no-referrer"
          className={`w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300 ${
            isOutOfStock ? 'opacity-65 grayscale-[25%]' : ''
          }`}
          loading="lazy"
        />

        {/* Discount or Out of Stock Badge */}
        {isOutOfStock ? (
          <span className="absolute top-1.5 left-1.5 bg-slate-800/90 text-white font-black text-[9px] tracking-wider uppercase px-1.5 py-0.5 rounded-md shadow-xs">
            Sold Out
          </span>
        ) : (
          hasDiscount && (
            <span className="absolute top-1.5 left-1.5 bg-[#F20D58] text-white font-black text-[9px] tracking-wider uppercase px-1.5 py-0.5 rounded-md shadow-xs">
              -{discountPercent}%
            </span>
          )
        )}

        {/* Wishlist Button */}
        <button
          type="button"
          aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          onClick={handleWishlist}
          className={`absolute top-1.5 right-1.5 w-7 h-7 rounded-full flex items-center justify-center transition-all ${
            isWishlisted
              ? 'bg-[#F20D58] text-white shadow-xs scale-105'
              : 'bg-white/90 text-[#192E4D] hover:bg-white shadow-2xs'
          }`}
        >
          <Heart className="w-3.5 h-3.5" fill={isWishlisted ? 'currentColor' : 'none'} />
        </button>

        {/* Mini Variant Indicator */}
        {product.variants.length > 1 && (
          <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 bg-white/90 backdrop-blur-xs px-1.5 py-0.5 rounded-md shadow-2xs">
            {product.variants.slice(0, 3).map((v, idx) => (
              <span
                key={v.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedVariantIndex(idx);
                }}
                className={`w-2 h-2 rounded-full border ${
                  selectedVariantIndex === idx ? 'ring-1 ring-[#08A9A2] scale-110' : 'border-black/20'
                }`}
                style={{ backgroundColor: v.colorCode }}
                title={v.colorName}
              />
            ))}
          </div>
        )}
      </div>

      {/* Right Content Column (Compact details) */}
      <div className="flex flex-col justify-between flex-1 min-w-0 py-0.5 space-y-1">
        <div>
          <div className="flex items-center justify-between gap-1">
            <span className="text-[9px] font-black uppercase tracking-widest text-[#08A9A2] bg-[#08A9A2]/10 px-1.5 py-0.5 rounded">
              {badgeLabel}
            </span>
            <span className="text-[10px] font-bold text-[#697586] truncate max-w-[80px]">
              {product.brand}
            </span>
          </div>

          <h3 className="text-xs sm:text-sm font-bold text-[#192E4D] line-clamp-1 group-hover:text-[#08A9A2] transition-colors mt-1">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-0.5">
            <div className="flex items-center text-[#FFB000]">
              <Star className="w-3 h-3 fill-current" />
            </div>
            <span className="text-[11px] font-bold text-[#192E4D] tabular-nums">{product.rating}</span>
            <span className="text-[10px] text-[#697586] tabular-nums">({product.reviewCount})</span>
          </div>
        </div>

        {/* Price & Action Row */}
        <div className="flex items-center justify-between pt-1 border-t border-[#F0F4F8]">
          <div className="flex items-baseline gap-1">
            <span className="text-sm sm:text-base font-black text-[#192E4D] tabular-nums">
              ₹{Math.round(currentPrice).toLocaleString('en-IN')}
            </span>
            {hasDiscount && (
              <span className="text-[10px] text-[#697586] line-through tabular-nums">
                ₹{Math.round(originalPrice).toLocaleString('en-IN')}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleAddToCart}
              className={`h-8 px-2.5 sm:px-3 rounded-lg text-xs font-bold flex items-center gap-1 transition-all active:scale-95 cursor-pointer ${
                justAdded
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#08A9A2] hover:bg-[#079690] text-white shadow-2xs'
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="w-3 h-3" />
                  <span className="text-[11px]">Added</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3 h-3" />
                  <span className="text-[11px]">Add</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleOpenDetail}
              aria-label="View product details"
              className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#192E4D] flex items-center justify-center transition-all cursor-pointer active:scale-95"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
