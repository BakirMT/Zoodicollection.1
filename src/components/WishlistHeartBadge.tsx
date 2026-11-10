import React from 'react';
import { Heart } from 'lucide-react';

interface WishlistHeartBadgeProps {
  count: number;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export const WishlistHeartBadge: React.FC<WishlistHeartBadgeProps> = ({
  count = 0,
  active = false,
  onClick,
  className = '',
}) => {
  const safeCount = Math.max(0, count);

  const iconContent = (
    <div className="relative inline-flex items-center justify-center">
      <Heart
        className={`w-5 h-5 transition-colors duration-200 ${
          active
            ? 'text-[#F20D58] fill-[#F20D58] stroke-[2]'
            : 'text-[#192E4D] group-hover:text-[#F20D58] stroke-[1.9]'
        }`}
      />
      {safeCount > 0 && (
        <span
          data-testid="wishlist-badge-counter"
          className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-[#F20D58] text-white text-[10px] font-black flex items-center justify-center tabular-nums shadow-xs animate-in zoom-in-75 duration-150"
        >
          {safeCount > 99 ? '99+' : safeCount}
        </span>
      )}
    </div>
  );

  if (!onClick) {
    return iconContent;
  }

  return (
    <button
      type="button"
      aria-label={`Wishlist, ${safeCount} items saved`}
      onClick={onClick}
      className={`relative w-10 h-10 rounded-xl flex items-center justify-center text-[#192E4D] hover:bg-[#F6F8FA] active:bg-[#E6EAF0] transition-colors focus-visible:ring-2 focus-visible:ring-[#08A9A2] focus:outline-hidden group cursor-pointer ${className}`}
      title={`Wishlist (${safeCount})`}
    >
      {iconContent}
    </button>
  );
};
