import React from 'react';
import { useApp } from '../context/AppContext';
import { ZoodiLogo } from './ZoodiLogo';
import {
  Search,
  Heart,
  Bell,
  ShieldCheck,
  Sparkles,
  User,
} from 'lucide-react';

export const CustomerHeader: React.FC = () => {
  const {
    navigateTo,
    wishlistIds,
    unreadCustomerCount,
    setIsNotificationCenterOpen,
    setActiveScreen,
    setCustomerTab,
    customerTab,
    mainCategories,
    selectedCategorySlug,
    setSelectedCategorySlug,
    customerProfile,
    isCustomerLoggedIn,
    currentAdmin,
    deviceFrameMode,
  } = useApp();

  const handleLogoClick = () => {
    setSelectedCategorySlug(null);
    setCustomerTab('home');
    setActiveScreen('tab');
    navigateTo('/');
  };

  const handleCategoryClick = (catId: string | null) => {
    setSelectedCategorySlug(catId);
    if (catId === null) {
      setCustomerTab('home');
    } else {
      setCustomerTab('categories');
    }
    setActiveScreen('tab');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 flex flex-col w-full bg-white/95 backdrop-blur-md shadow-xs border-b border-[#E6EAF0]">
      <div className={`w-full mx-auto transition-all ${deviceFrameMode === 'responsive' ? 'max-w-6xl' : 'max-w-md'}`}>
        {/* MAIN HEADER BAR */}
        <div className="px-3 sm:px-4 py-2.5 flex items-center justify-between gap-3 border-b border-[#E6EAF0]">
        {/* Brand Logo & Kerala Heritage tag */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            className="cursor-pointer select-none text-left p-1 rounded-xl focus-visible:ring-2 focus-visible:ring-[#08A9A2] focus:outline-hidden flex items-center"
            onClick={handleLogoClick}
            aria-label="ZOODI Collection Home"
          >
            <ZoodiLogo size="md" showTagline={true} />
          </button>
          <span className="hidden sm:inline-block text-[10px] uppercase font-black tracking-widest text-[#08A9A2] px-1.5 py-0.5 rounded-sm bg-[#08A9A2]/10 border border-[#08A9A2]/20">
            Kerala
          </span>
        </div>

        {/* Customer Action Shortcuts (Search Icon, Wishlist, Bag, Admin, Profile) */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Search Icon Button (clean single icon button) */}
          <button
            type="button"
            aria-label="Search products"
            onClick={() => setActiveScreen('search')}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-[#192E4D] hover:bg-[#F6F8FA] active:bg-[#E6EAF0] transition-colors focus-visible:ring-2 focus-visible:ring-[#08A9A2] focus:outline-hidden"
            title="Search products"
          >
            <Search className="w-5 h-5 hover:text-[#08A9A2] transition-colors" />
          </button>

          {/* Wishlist Shortcut */}
          <button
            type="button"
            aria-label={`Wishlist, ${wishlistIds.length} items saved`}
            onClick={() => {
              setCustomerTab('wishlist');
              setActiveScreen('tab');
            }}
            className="relative w-10 h-10 rounded-xl flex items-center justify-center text-[#192E4D] hover:bg-[#F6F8FA] active:bg-[#E6EAF0] transition-colors focus-visible:ring-2 focus-visible:ring-[#08A9A2] focus:outline-hidden group"
            title="Wishlist"
          >
            <div className="relative">
              <Heart className="w-5 h-5 group-hover:text-[#F20D58] transition-colors" />
              {wishlistIds.length > 0 && (
                <span className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-[#F20D58] text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                  {wishlistIds.length}
                </span>
              )}
            </div>
          </button>

          {/* Notification Center Shortcut */}
          <button
            type="button"
            aria-label={`Notifications, ${unreadCustomerCount} unread`}
            onClick={() => setIsNotificationCenterOpen(true)}
            className="relative w-10 h-10 rounded-xl flex items-center justify-center text-[#192E4D] hover:bg-[#F6F8FA] active:bg-[#E6EAF0] transition-colors focus-visible:ring-2 focus-visible:ring-[#08A9A2] focus:outline-hidden group"
            title="Notifications"
          >
            <div className="relative">
              <Bell className="w-5 h-5 group-hover:text-[#08A9A2] transition-colors" />
              {unreadCustomerCount > 0 && (
                <span className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-[#08A9A2] text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                  {unreadCustomerCount}
                </span>
              )}
            </div>
          </button>



          {/* Quick Admin Portal Button */}
          <button
            type="button"
            onClick={() => navigateTo('/superadmin')}
            className={`items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              currentAdmin
                ? 'flex bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 border border-amber-400/60 shadow-xs'
                : 'hidden sm:flex bg-[#08A9A2]/10 hover:bg-[#08A9A2]/20 text-[#08A9A2] border border-[#08A9A2]/30'
            }`}
            title="Admin & Staff Portal"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{currentAdmin ? 'Admin Panel' : 'Admin'}</span>
          </button>

          {/* Customer Profile Shortcut */}
          <button
            type="button"
            aria-label="My Account"
            onClick={() => {
              if (!isCustomerLoggedIn) {
                setActiveScreen('login');
              } else {
                setCustomerTab('account');
                setActiveScreen('tab');
              }
            }}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-[#192E4D] hover:bg-[#F6F8FA] active:bg-[#E6EAF0] transition-colors focus-visible:ring-2 focus-visible:ring-[#08A9A2] focus:outline-hidden cursor-pointer"
            title={isCustomerLoggedIn ? `Account (${customerProfile.name})` : 'Sign In'}
          >
            {isCustomerLoggedIn ? (
              <div className="w-7 h-7 rounded-full bg-[#192E4D] text-white text-xs font-black flex items-center justify-center">
                {customerProfile.name ? customerProfile.name.charAt(0) : 'U'}
              </div>
            ) : (
              <div className="w-7 h-7 rounded-full bg-slate-100 text-[#08A9A2] flex items-center justify-center border border-slate-200">
                <User className="w-4 h-4" />
              </div>
            )}
          </button>
        </div>
      </div>

      {/* HORIZONTAL CATEGORY NAVIGATION BAR (Hidden on Wishlist, Bag, and Account pages) */}
      {customerTab !== 'wishlist' && customerTab !== 'cart' && customerTab !== 'account' && (
        <nav
          aria-label="Category Quick Navigation"
          className="bg-white border-b border-[#F0F4F8] px-2 sm:px-4 py-1.5 flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar scroll-smooth"
        >
          {/* All / Home tab - Hidden on Explore page */}
          {customerTab !== 'categories' && (
            <button
              type="button"
              onClick={() => handleCategoryClick(null)}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                customerTab === 'home' && selectedCategorySlug === null
                  ? 'bg-[#08A9A2] text-white shadow-xs'
                  : 'text-[#697586] hover:text-[#192E4D] hover:bg-[#F6F8FA]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>All Drops</span>
            </button>
          )}

          {/* Dynamic Main Categories */}
          {mainCategories
            .filter((c) => c.isActive)
            .map((cat) => {
              const isCatActive =
                customerTab === 'categories' && selectedCategorySlug === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isCatActive
                      ? 'bg-[#08A9A2] text-white shadow-xs'
                      : 'text-[#697586] hover:text-[#192E4D] hover:bg-[#F6F8FA]'
                  }`}
                >
                  <span>{cat.name}</span>
                </button>
              );
            })}
        </nav>
      )}
      </div>
    </header>
  );
};
