import React from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowLeft, Home, Compass, ShoppingBag, Search } from 'lucide-react';

export const NotFoundScreen: React.FC = () => {
  const { setCustomerTab, setActiveScreen, setSelectedCategorySlug, navigateTo } = useApp();

  const handleGoHome = () => {
    setSelectedCategorySlug(null);
    setCustomerTab('home');
    setActiveScreen('tab');
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', '/');
    }
  };

  const handleGoCategories = () => {
    setCustomerTab('categories');
    setActiveScreen('tab');
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', '/categories');
    }
  };

  const handleGoCart = () => {
    setCustomerTab('cart');
    setActiveScreen('tab');
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', '/cart');
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-between bg-white text-[#192E4D] animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="p-4 border-b border-[#F0F4F8] flex items-center justify-between">
        <button
          type="button"
          onClick={handleGoHome}
          className="flex items-center gap-1.5 text-xs font-bold text-[#697586] hover:text-[#192E4D] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Store</span>
        </button>
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#08A9A2]">
          ZOODI Collection
        </span>
      </div>

      {/* Main 404 Body */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto space-y-4">
        <div className="relative">
          <div className="w-24 h-24 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400">
            <ShoppingBag className="w-12 h-12 stroke-[1.5]" />
          </div>
          <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-rose-500 text-white font-black text-xs shadow-sm">
            404
          </span>
        </div>

        <div className="space-y-1.5">
          <h1 className="text-xl sm:text-2xl font-black text-[#192E4D] tracking-tight">
            Page Not Found
          </h1>
          <p className="text-xs text-[#697586] leading-relaxed">
            The page or product you are looking for doesn't exist, has been moved, or the link is incorrect.
          </p>
        </div>

        {/* Quick Action Navigation Buttons */}
        <div className="w-full pt-4 space-y-2.5">
          <button
            type="button"
            onClick={handleGoHome}
            className="w-full h-11 rounded-xl bg-[#08A9A2] hover:bg-[#079690] active:scale-[0.98] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Return to Homepage</span>
          </button>

          <button
            type="button"
            onClick={handleGoCategories}
            className="w-full h-11 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-[#192E4D] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            <span>Explore Collections</span>
          </button>

          <button
            type="button"
            onClick={handleGoCart}
            className="w-full h-11 rounded-xl border border-slate-200 hover:bg-slate-50 text-[#192E4D] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>View Shopping Bag</span>
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-[#F0F4F8] text-center text-[11px] text-[#697586]">
        Need help? Search our collection or contact Kerala Support.
      </div>
    </div>
  );
};
