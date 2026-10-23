import React from 'react';
import { useApp } from '../../context/AppContext';
import { ProductCard } from '../../components/ProductCard';
import { Heart, ShoppingBag } from 'lucide-react';

export const WishlistScreen: React.FC = () => {
  const { wishlistIds, products, setCustomerTab, setActiveScreen } = useApp();

  const wishlistedProducts = products.filter((p) => wishlistIds.includes(p.id));

  if (wishlistedProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center pb-24">
        <div className="w-20 h-20 rounded-full bg-[#F20D58]/10 text-[#F20D58] flex items-center justify-center mb-4">
          <Heart className="w-10 h-10" />
        </div>
        <h2 className="text-lg font-black text-[#192E4D]">Your Wishlist is Empty</h2>
        <p className="text-xs text-[#697586] max-w-xs mt-1.5 mb-6">
          Save your favorite styles, outerwear jackets, and exclusive drops to shop later.
        </p>
        <button
          type="button"
          onClick={() => {
            setCustomerTab('home');
            setActiveScreen('tab');
          }}
          className="h-12 px-6 rounded-xl bg-[#08A9A2] hover:bg-[#079690] active:scale-[0.98] text-white font-bold text-xs sm:text-sm shadow-md transition-all"
        >
          Explore Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F6F8FA] pb-28 text-left">
      <div className="bg-white border-b border-[#E6EAF0] px-4 py-3.5">
        <h1 className="text-base font-extrabold text-[#192E4D]">My Wishlist</h1>
        <p className="text-[11px] text-[#697586]">{wishlistedProducts.length} saved products</p>
      </div>

      <div className="p-4 grid grid-cols-2 gap-3.5">
        {wishlistedProducts.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
};
