import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Tag,
  Copy,
  Check,
  Zap,
  ShoppingBag,
  ArrowRight,
  Clock,
  Sparkles,
  Percent,
  ChevronRight,
} from 'lucide-react';

export const CouponsAndDealsModal: React.FC = () => {
  const {
    isCouponsModalOpen,
    setIsCouponsModalOpen,
    coupons,
    activeCoupon,
    couponError,
    applyCouponCode,
    removeCoupon,
    products,
    addToCart,
    setSelectedProductId,
    setActiveScreen,
    setCustomerTab,
    cart,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'coupons' | 'deals'>('coupons');
  const [inputCode, setInputCode] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  if (!isCouponsModalOpen) return null;

  // Active coupons list
  const activeCouponsList = coupons.filter((c) => c.isActive !== false);

  // Discounted deal products
  const dealProducts = products.filter(
    (p) => p.salePrice && p.salePrice < p.price
  );

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setActionFeedback(`Copied code "${code}" to clipboard!`);
    setTimeout(() => {
      setCopiedCode(null);
      setActionFeedback(null);
    }, 2500);
  };

  const handleApply = (code: string) => {
    const success = applyCouponCode(code);
    if (success) {
      setActionFeedback(`Coupon "${code}" applied successfully!`);
      setTimeout(() => setActionFeedback(null), 3000);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    const success = applyCouponCode(inputCode.trim());
    if (success) {
      setActionFeedback(`Coupon "${inputCode.trim().toUpperCase()}" applied!`);
      setInputCode('');
      setTimeout(() => setActionFeedback(null), 3000);
    }
  };

  const handleProductClick = (productId: string) => {
    setSelectedProductId(productId);
    setIsCouponsModalOpen(false);
    setActiveScreen('product_detail');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={() => setIsCouponsModalOpen(false)}
    >
      <div
        className="w-full max-w-lg max-h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-[#FCD34D]/60 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* TOP HEADER */}
        <div className="px-5 py-4 bg-gradient-to-r from-[#FFFBEB] via-[#FFFDF7] to-white border-b border-[#FCD34D]/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-[#FEF3C7] border border-[#FCD34D] flex items-center justify-center text-[#BA4A00] shadow-2xs">
              <Tag className="w-5 h-5 text-[#BA4A00] stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-[#192E4D]">Coupons & Deals</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-[#BA4A00] border border-amber-300">
                  Save More
                </span>
              </div>
              <p className="text-[11px] text-[#697586]">
                Exclusive promo codes & verified price drop deals
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsCouponsModalOpen(false)}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* FEEDBACK TOAST */}
        {actionFeedback && (
          <div className="mx-4 mt-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-xs animate-in slide-in-from-top-1">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionFeedback}</span>
          </div>
        )}

        {/* TABS SWITCHER */}
        <div className="px-4 pt-3 flex gap-2 border-b border-[#F0F4F8] shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('coupons')}
            className={`flex-1 pb-2.5 text-xs font-bold transition-all flex items-center justify-center gap-1.5 border-b-2 cursor-pointer ${
              activeTab === 'coupons'
                ? 'border-[#BA4A00] text-[#BA4A00]'
                : 'border-transparent text-[#697586] hover:text-[#192E4D]'
            }`}
          >
            <Percent className="w-3.5 h-3.5" />
            <span>Promo Coupons ({activeCouponsList.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('deals')}
            className={`flex-1 pb-2.5 text-xs font-bold transition-all flex items-center justify-center gap-1.5 border-b-2 cursor-pointer ${
              activeTab === 'deals'
                ? 'border-[#BA4A00] text-[#BA4A00]'
                : 'border-transparent text-[#697586] hover:text-[#192E4D]'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Hot Deals ({dealProducts.length})</span>
          </button>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
          {activeTab === 'coupons' && (
            <div className="space-y-4">
              {/* Manual Code Input */}
              <div className="p-3.5 rounded-2xl bg-[#FFFDF7] border border-[#FCD34D]/60 space-y-2">
                <label className="text-[11px] font-bold text-[#192E4D] block">
                  Have a secret promo code?
                </label>
                <form onSubmit={handleManualSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    placeholder="Enter coupon code (e.g. FLAT100)"
                    className="flex-1 h-10 px-3 text-xs uppercase font-mono font-bold border border-slate-300 rounded-xl focus:outline-hidden focus:border-[#BA4A00] focus:ring-2 focus:ring-[#BA4A00]/20 bg-white"
                  />
                  <button
                    type="submit"
                    className="h-10 px-4 rounded-xl bg-[#BA4A00] hover:bg-[#a03e00] text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                  >
                    Apply
                  </button>
                </form>
                {couponError && (
                  <p className="text-[11px] font-semibold text-rose-600">{couponError}</p>
                )}
              </div>

              {/* Active Coupon Banner */}
              {activeCoupon && (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                    <div>
                      <span className="text-xs font-mono font-extrabold text-emerald-900">
                        {activeCoupon.code} is Active
                      </span>
                      <p className="text-[11px] text-emerald-700">{activeCoupon.description}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-xs font-bold text-rose-600 hover:text-rose-800 underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              )}

              {/* Available Coupons List */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-[#192E4D] uppercase tracking-wider">
                  Available ZOODI Discount Vouchers
                </h4>

                {activeCouponsList.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">
                    No active discount coupons at this time.
                  </p>
                ) : (
                  activeCouponsList.map((c) => {
                    const isCurrent = activeCoupon?.code === c.code;
                    return (
                      <div
                        key={c.code}
                        className={`relative p-3.5 rounded-2xl border transition-all ${
                          isCurrent
                            ? 'bg-emerald-50/50 border-emerald-300 shadow-xs'
                            : 'bg-white border-[#E6EAF0] hover:border-[#FCD34D] shadow-2xs'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-1 rounded-lg bg-amber-50 border border-[#FCD34D] text-[#BA4A00] font-mono font-black text-xs tracking-wider">
                                {c.code}
                              </span>
                              {c.discountFixed ? (
                                <span className="text-xs font-black text-emerald-700">
                                  Save ₹{c.discountFixed}
                                </span>
                              ) : c.discountPercentage ? (
                                <span className="text-xs font-black text-emerald-700">
                                  {c.discountPercentage}% OFF
                                </span>
                              ) : null}
                            </div>
                            <p className="text-xs font-bold text-[#192E4D]">{c.description}</p>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-500 pt-0.5">
                              {c.minOrder ? (
                                <span>Min. order: ₹{c.minOrder.toLocaleString('en-IN')}</span>
                              ) : (
                                <span>No minimum order</span>
                              )}
                              {c.maxDiscount && (
                                <span>Max savings: ₹{c.maxDiscount.toLocaleString('en-IN')}</span>
                              )}
                              {c.expiresAt && <span>Valid till {c.expiresAt}</span>}
                            </div>
                          </div>

                          <div className="flex flex-col gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleApply(c.code)}
                              className={`h-8 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95 ${
                                isCurrent
                                  ? 'bg-emerald-600 text-white cursor-default'
                                  : 'bg-[#BA4A00] hover:bg-[#a03e00] text-white shadow-xs'
                              }`}
                            >
                              {isCurrent ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Applied</span>
                                </>
                              ) : (
                                <span>Apply</span>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleCopy(c.code)}
                              className="h-7 px-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-[10px] font-bold text-slate-600 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                              title="Copy code"
                            >
                              {copiedCode === c.code ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span className="text-emerald-700">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {activeTab === 'deals' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-[#192E4D] uppercase tracking-wider">
                  Price Drops & Flash Discounts
                </h4>
                <span className="text-[11px] font-bold text-amber-700">
                  {dealProducts.length} deals active
                </span>
              </div>

              {dealProducts.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  All items currently at standard pricing. Check back soon for flash deals!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {dealProducts.map((p) => {
                    const discount = Math.round(((p.price - (p.salePrice || p.price)) / p.price) * 100);
                    const defaultVariant = p.variants[0];
                    return (
                      <div
                        key={p.id}
                        className="p-2.5 rounded-2xl bg-white border border-[#E6EAF0] hover:border-[#FCD34D] shadow-2xs flex gap-2.5 transition-all"
                      >
                        <img
                          src={defaultVariant?.images[0] || 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=300&q=80'}
                          alt={p.name}
                          className="w-16 h-16 rounded-xl object-cover shrink-0 cursor-pointer"
                          onClick={() => handleProductClick(p.id)}
                        />
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[10px] font-black uppercase text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                                {discount}% OFF
                              </span>
                              <span className="text-[10px] text-slate-400">{p.brand}</span>
                            </div>
                            <h5
                              onClick={() => handleProductClick(p.id)}
                              className="text-xs font-bold text-[#192E4D] truncate cursor-pointer hover:text-[#08A9A2] mt-0.5"
                            >
                              {p.name}
                            </h5>
                            <div className="flex items-baseline gap-1.5 mt-0.5">
                              <span className="text-xs font-black text-[#192E4D] tabular-nums">
                                ₹{Math.round(p.salePrice || p.price).toLocaleString('en-IN')}
                              </span>
                              <span className="text-[10px] text-slate-400 line-through tabular-nums">
                                ₹{Math.round(p.price).toLocaleString('en-IN')}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 pt-1">
                            <button
                              type="button"
                              onClick={() => handleProductClick(p.id)}
                              className="text-[10px] font-bold text-[#08A9A2] hover:underline"
                            >
                              View Deal
                            </button>
                            <span className="text-slate-300">·</span>
                            <button
                              type="button"
                              onClick={() => {
                                if (defaultVariant) {
                                  const size = Object.keys(defaultVariant.sizeStock || {})[0] || 'Standard';
                                  addToCart(p, defaultVariant, size, 1);
                                  setActionFeedback(`Added ${p.name} to your bag!`);
                                  setTimeout(() => setActionFeedback(null), 2500);
                                }
                              }}
                              className="text-[10px] font-bold text-[#BA4A00] hover:underline flex items-center gap-0.5 cursor-pointer"
                            >
                              <ShoppingBag className="w-2.5 h-2.5" />
                              <span>Add to Bag</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* BOTTOM FOOTER */}
        <div className="px-5 py-3 bg-[#FAFBFD] border-t border-[#E6EAF0] flex items-center justify-between shrink-0">
          <div className="text-[11px] text-[#697586]">
            {activeCoupon ? (
              <span className="font-bold text-emerald-700">
                Coupon applied: {activeCoupon.code}
              </span>
            ) : (
              <span>Select any coupon to apply at checkout</span>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              setIsCouponsModalOpen(false);
              setCustomerTab('cart');
              setActiveScreen('tab');
            }}
            className="px-4 py-2 rounded-xl bg-[#192E4D] hover:bg-[#243c61] text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <span>View Bag</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
