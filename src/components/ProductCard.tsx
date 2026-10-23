import React from 'react';
import { Product } from '../types';
import { useApp } from '../context/AppContext';
import { Heart, Star, ShoppingBag } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelect?: () => void;
  compact?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect, compact = false }) => {
  const { setSelectedProductId, setActiveScreen, wishlistIds, toggleWishlist, addToCart } = useApp();

  const isWishlisted = wishlistIds.includes(product.id);
  const primaryVariant = product.variants[0];
  const primaryImage =
    primaryVariant?.images[0] ||
    'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=400&q=80';

  const originalPrice = product.price ?? primaryVariant?.price ?? 0;
  const currentPrice =
    product.salePrice && product.salePrice > 0 && product.salePrice < originalPrice
      ? product.salePrice
      : primaryVariant?.salePrice && primaryVariant.salePrice < originalPrice
      ? primaryVariant.salePrice
      : originalPrice;
  const hasDiscount = currentPrice < originalPrice;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0;

  const handleClick = () => {
    setSelectedProductId(product.id);
    setActiveScreen('product_detail');
    if (onSelect) onSelect();
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (primaryVariant) {
      const defaultSize = product.sizes[0];
      addToCart(product, primaryVariant, defaultSize, 1);
    }
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <div
      onClick={handleClick}
      className={`group relative flex flex-col bg-white rounded-xl overflow-hidden border border-[#E6EAF0] shadow-[0_2px_10px_rgba(25,46,77,0.04)] hover:shadow-[0_6px_20px_rgba(25,46,77,0.08)] transition-all duration-200 cursor-pointer text-left focus-visible:ring-2 focus-visible:ring-[#08A9A2] focus:outline-hidden ${
        compact ? 'rounded-xl' : 'rounded-2xl'
      }`}
    >
      {/* Product Image & Badges */}
      <div className={`relative w-full bg-[#F6F8FA] overflow-hidden ${compact ? 'aspect-square' : 'aspect-4/5'}`}>
        <img
          src={primaryImage}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Discount Badge */}
        {hasDiscount && (
          <span
            className={`absolute top-2 left-2 bg-[#F20D58] text-white font-black tracking-wider uppercase rounded-md shadow-xs ${
              compact ? 'text-[9px] px-1.5 py-0.5' : 'text-[11px] px-2 py-0.5'
            }`}
          >
            {discountPercent}% OFF
          </span>
        )}

        {/* Wishlist Button */}
        <button
          type="button"
          aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          onClick={handleWishlistClick}
          className={`absolute top-2 right-2 rounded-full flex items-center justify-center transition-all ${
            compact ? 'w-7 h-7' : 'w-9 h-9'
          } ${
            isWishlisted
              ? 'bg-[#F20D58] text-white shadow-md scale-105'
              : 'bg-white/90 text-[#192E4D] hover:bg-white shadow-xs'
          }`}
        >
          <Heart className={compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} fill={isWishlisted ? 'currentColor' : 'none'} />
        </button>

        {/* Color Swatch Dots Preview */}
        {product.variants.length > 1 && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-white/90 backdrop-blur-xs px-1.5 py-0.5 rounded-md shadow-xs">
            {product.variants.slice(0, 3).map((v) => (
              <span
                key={v.id}
                className="w-2 h-2 rounded-full border border-black/10 shadow-2xs"
                style={{ backgroundColor: v.colorCode }}
                title={v.colorName}
              />
            ))}
            {product.variants.length > 3 && (
              <span className="text-[8px] font-bold text-[#697586]">+{product.variants.length - 3}</span>
            )}
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className={`flex flex-col flex-1 justify-between ${compact ? 'p-2 sm:p-2.5 gap-1.5' : 'p-3 sm:p-3.5 gap-2'}`}>
        <div>
          <span className={`font-bold tracking-wider uppercase text-[#08A9A2] block truncate ${compact ? 'text-[9px]' : 'text-[11px] mb-0.5'}`}>
            {product.brand}
          </span>
          <h3 className={`font-bold text-[#192E4D] line-clamp-1 group-hover:text-[#08A9A2] transition-colors ${compact ? 'text-xs' : 'text-xs sm:text-sm'}`}>
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-0.5">
            <div className="flex items-center text-[#FFB000]">
              <Star className={compact ? 'w-3 h-3 fill-current' : 'w-3.5 h-3.5 fill-current'} />
            </div>
            <span className={`font-bold text-[#192E4D] tabular-nums ${compact ? 'text-[10px]' : 'text-xs'}`}>{product.rating}</span>
            <span className={`text-[#697586] tabular-nums ${compact ? 'text-[10px]' : 'text-xs'}`}>({product.reviewCount})</span>
          </div>
        </div>

        {/* Price & Quick Add Button */}
        <div className={`flex items-center justify-between border-t border-[#F0F4F8] ${compact ? 'pt-1.5' : 'pt-2'}`}>
          <div className="flex items-baseline gap-1">
            <span className={`font-black text-[#192E4D] tabular-nums ${compact ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'}`}>
              ₹{Math.round(currentPrice).toLocaleString('en-IN')}
            </span>
            {hasDiscount && (
              <span className={`text-[#697586] line-through tabular-nums ${compact ? 'text-[10px]' : 'text-xs'}`}>
                ₹{Math.round(originalPrice).toLocaleString('en-IN')}
              </span>
            )}
          </div>

          <button
            type="button"
            aria-label={`Add ${product.name} to cart`}
            onClick={handleQuickAdd}
            className={`rounded-lg bg-[#08A9A2]/10 hover:bg-[#08A9A2] text-[#08A9A2] hover:text-white flex items-center justify-center transition-colors active:scale-95 ${
              compact ? 'w-7 h-7 sm:w-8 sm:h-8' : 'w-9 h-9 sm:w-10 sm:h-10 rounded-xl'
            }`}
          >
            <ShoppingBag className={compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
          </button>
        </div>
      </div>
    </div>
  );
};
