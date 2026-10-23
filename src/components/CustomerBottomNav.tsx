import React from 'react';
import { useApp, CustomerTab } from '../context/AppContext';
import { Home, Compass, Heart, ShoppingBag, User } from 'lucide-react';

export const CustomerBottomNav: React.FC = () => {
  const { customerTab, setCustomerTab, setActiveScreen, cart, wishlistIds, setSelectedCategorySlug } =
    useApp();

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const tabs: Array<{
    id: CustomerTab;
    label: string;
    icon: (active: boolean) => React.ReactNode;
    badge?: number;
    badgeColor?: string;
  }> = [
    {
      id: 'home',
      label: 'Home',
      icon: (active) => (
        <Home
          className={`w-5 h-5 transition-transform duration-200 ${
            active ? 'scale-110 text-[#08A9A2] stroke-[2.4]' : 'text-[#697586] stroke-[1.8]'
          }`}
        />
      ),
    },
    {
      id: 'categories',
      label: 'Explore',
      icon: (active) => (
        <Compass
          className={`w-5 h-5 transition-transform duration-200 ${
            active ? 'scale-110 text-[#08A9A2] stroke-[2.4]' : 'text-[#697586] stroke-[1.8]'
          }`}
        />
      ),
    },
    {
      id: 'wishlist',
      label: 'Wishlist',
      badge: wishlistIds.length > 0 ? wishlistIds.length : undefined,
      badgeColor: 'bg-[#F20D58]',
      icon: (active) => (
        <Heart
          className={`w-5 h-5 transition-transform duration-200 ${
            active
              ? 'scale-110 text-[#F20D58] fill-[#F20D58] stroke-[2]'
              : 'text-[#697586] stroke-[1.8]'
          }`}
        />
      ),
    },
    {
      id: 'cart',
      label: 'Bag',
      badge: totalCartCount > 0 ? totalCartCount : undefined,
      badgeColor: 'bg-[#08A9A2]',
      icon: (active) => (
        <ShoppingBag
          className={`w-5 h-5 transition-transform duration-200 ${
            active
              ? 'scale-110 text-[#08A9A2] fill-[#08A9A2]/20 stroke-[2.4]'
              : 'text-[#697586] stroke-[1.8]'
          }`}
        />
      ),
    },
    {
      id: 'account',
      label: 'Account',
      icon: (active) => (
        <User
          className={`w-5 h-5 transition-transform duration-200 ${
            active ? 'scale-110 text-[#08A9A2] stroke-[2.4]' : 'text-[#697586] stroke-[1.8]'
          }`}
        />
      ),
    },
  ];

  const handleTabClick = (tabId: CustomerTab) => {
    if (tabId === 'home') {
      setSelectedCategorySlug(null);
    }
    setCustomerTab(tabId);
    setActiveScreen('tab');
  };

  return (
    <nav
      aria-label="Customer Navigation"
      className="sticky bottom-0 left-0 right-0 w-full z-40 bg-white/95 backdrop-blur-xl border-t border-[#E6EAF0] px-3 py-1.5 flex items-center justify-around shadow-[0_-4px_24px_rgba(25,46,77,0.07)] select-none"
    >
      {tabs.map((tab) => {
        const isSelected = customerTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            aria-label={tab.label}
            aria-current={isSelected ? 'page' : undefined}
            onClick={() => handleTabClick(tab.id)}
            className={`group relative flex flex-col items-center justify-center flex-1 min-h-[50px] py-1 px-1.5 rounded-2xl transition-all duration-200 active:scale-90 focus-visible:ring-2 focus-visible:ring-[#08A9A2] focus:outline-hidden ${
              isSelected
                ? 'bg-[#08A9A2]/10 text-[#08A9A2]'
                : 'text-[#697586] hover:text-[#192E4D] hover:bg-slate-50'
            }`}
          >
            {/* Icon + Micro-Badge */}
            <div className="relative flex items-center justify-center">
              {tab.icon(isSelected)}
              {tab.badge !== undefined && (
                <span
                  className={`absolute -top-1.5 -right-2.5 px-1 min-w-[17px] h-[17px] rounded-full text-[9px] font-black flex items-center justify-center text-white tabular-nums shadow-xs ${
                    tab.badgeColor || 'bg-[#08A9A2]'
                  }`}
                >
                  {tab.badge > 99 ? '99+' : tab.badge}
                </span>
              )}
            </div>

            {/* Label */}
            <span
              className={`text-[10px] mt-0.5 tracking-tight transition-all ${
                isSelected ? 'font-black text-[#08A9A2]' : 'font-semibold text-[#697586]'
              }`}
            >
              {tab.label}
            </span>

            {/* Subtle Active Glow Dot */}
            {isSelected && (
              <span className="w-1.5 h-1 rounded-full bg-[#08A9A2] mt-0.5 animate-in fade-in zoom-in-50" />
            )}
          </button>
        );
      })}
    </nav>
  );
};
