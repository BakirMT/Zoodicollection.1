import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { calculateOrderPricing } from '../../lib/commerceLogic';
import { Trash2, Plus, Minus, Tag, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';

export const CartScreen: React.FC = () => {
  const {
    cart,
    removeFromCart,
    updateCartQuantity,
    activeCoupon,
    couponError,
    applyCouponCode,
    removeCoupon,
    setActiveScreen,
    setCustomerTab,
  } = useApp();

  const [inputCoupon, setInputCoupon] = useState('');

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const pricing = calculateOrderPricing({
    subtotal,
    couponDiscountPercentage: activeCoupon?.discountPercentage,
    couponDiscountFixed: activeCoupon?.discountFixed,
    couponMinOrder: activeCoupon?.minOrder,
    couponMaxDiscount: activeCoupon?.maxDiscount,
  });

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCoupon.trim()) return;
    const ok = applyCouponCode(inputCoupon.trim());
    if (ok) setInputCoupon('');
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center pb-24">
        <div className="w-20 h-20 rounded-full bg-[#08A9A2]/10 text-[#08A9A2] flex items-center justify-center mb-4">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-lg font-black text-[#192E4D]">Your Cart is Empty</h2>
        <p className="text-xs text-[#697586] max-w-xs mt-1.5 mb-6">
          Explore our signature outerwear, designer silhouettes, and footwear collections.
        </p>
        <button
          type="button"
          onClick={() => {
            setCustomerTab('home');
            setActiveScreen('tab');
          }}
          className="h-12 px-6 rounded-xl bg-[#08A9A2] hover:bg-[#079690] active:scale-[0.98] text-white font-bold text-xs sm:text-sm shadow-md transition-all"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F6F8FA] pb-32">
      {/* Title Header */}
      <div className="bg-white border-b border-[#E6EAF0] px-4 py-3 flex items-center justify-between min-h-[56px]">
        <div>
          <h1 className="text-sm sm:text-base font-extrabold text-[#192E4D]">Shopping Bag</h1>
          <p className="text-[11px] text-[#697586] tabular-nums">
            {cart.reduce((sum, i) => sum + i.quantity, 0)} items in your cart
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Secure Bag</span>
        </div>
      </div>

      {/* Cart Items List */}
      <div className="p-4 space-y-3">
        {cart.map((item) => (
          <div
            key={item.id}
            className="flex gap-3 p-3.5 rounded-2xl bg-white border border-[#E6EAF0] shadow-2xs text-left"
          >
            {/* Variant Image */}
            <div className="w-20 h-24 rounded-xl bg-[#F6F8FA] overflow-hidden shrink-0 border border-[#F0F4F8]">
              <img
                src={item.image}
                alt={item.productName}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
              />
            </div>

            {/* Item Details */}
            <div className="flex flex-col justify-between flex-1">
              <div>
                <div className="flex items-start justify-between gap-1">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#08A9A2]">
                      {item.brand}
                    </span>
                    <h3 className="text-xs font-extrabold text-[#192E4D] line-clamp-1">
                      {item.productName}
                    </h3>
                  </div>
                  <button
                    type="button"
                    aria-label={`Remove ${item.productName} from cart`}
                    onClick={() => removeFromCart(item.id)}
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-rose-600 hover:bg-rose-50 active:scale-95 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Color and Size attributes */}
                <div className="flex items-center gap-2 mt-1 text-[11px] text-[#697586]">
                  <div className="flex items-center gap-1">
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-black/10"
                      style={{ backgroundColor: item.colorCode }}
                    />
                    <span>{item.colorName}</span>
                  </div>
                  {item.size && (
                    <>
                      <span>•</span>
                      <span className="font-semibold text-[#192E4D]">Size: {item.size}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Price and Quantity Adjuster */}
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#F0F4F8]">
                <span className="text-sm font-black text-[#192E4D] tabular-nums">
                  ₹{Math.round(item.price * item.quantity).toLocaleString('en-IN')}
                </span>

                <div className="flex items-center border border-[#E6EAF0] rounded-xl overflow-hidden bg-[#F6F8FA]">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                    className="w-8 h-8 flex items-center justify-center text-[#192E4D] hover:bg-white active:bg-gray-100 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center font-bold text-xs text-[#192E4D] tabular-nums">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    disabled={item.quantity >= item.maxStock}
                    onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center text-[#192E4D] hover:bg-white active:bg-gray-100 disabled:opacity-30 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Coupon Code Section */}
      <div className="px-4 mb-3">
        <div className="p-4 rounded-2xl bg-white border border-[#E6EAF0] space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#192E4D]">
            <Tag className="w-4 h-4 text-[#FFB000]" />
            <span>Apply Promo Code</span>
          </div>

          {activeCoupon ? (
            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
              <div>
                <span className="font-mono font-extrabold text-emerald-800">
                  {activeCoupon.code}
                </span>
                <span className="text-[11px] text-emerald-700 block">
                  {activeCoupon.description}
                </span>
              </div>
              <button
                type="button"
                onClick={removeCoupon}
                className="text-xs font-bold text-rose-600 hover:underline p-1"
              >
                Remove
              </button>
            </div>
          ) : (
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                placeholder="Try ZOODI10 or FESTIVE25"
                value={inputCoupon}
                onChange={(e) => setInputCoupon(e.target.value)}
                className="flex-1 h-11 px-3.5 text-xs uppercase font-mono border border-[#E6EAF0] rounded-xl focus:outline-hidden focus:border-[#08A9A2] focus:ring-2 focus:ring-[#08A9A2]/20"
              />
              <button
                type="submit"
                className="h-11 px-5 rounded-xl bg-[#192E4D] hover:bg-[#243c61] active:scale-95 text-white font-bold text-xs transition-all"
              >
                Apply
              </button>
            </form>
          )}

          {couponError && (
            <p className="text-[11px] font-semibold text-rose-600">{couponError}</p>
          )}
        </div>
      </div>

      {/* Order Pricing Summary */}
      <div className="px-4">
        <div className="p-4 rounded-2xl bg-white border border-[#E6EAF0] space-y-2.5 text-xs">
          <h3 className="font-extrabold text-sm text-[#192E4D] pb-1.5 border-b border-[#F0F4F8]">
            Order Breakdown
          </h3>

          <div className="flex justify-between text-[#697586]">
            <span>Bag Subtotal</span>
            <span className="font-bold text-[#192E4D] tabular-nums">₹{Math.round(pricing.subtotal).toLocaleString('en-IN')}</span>
          </div>

          {pricing.discount > 0 && (
            <div className="flex justify-between text-emerald-700 font-bold">
              <span>Coupon Savings</span>
              <span className="tabular-nums">-₹{Math.round(pricing.discount).toLocaleString('en-IN')}</span>
            </div>
          )}

          <div className="flex justify-between text-[#697586]">
            <span>Shipping (Kerala & All-India)</span>
            <span>
              {pricing.shipping === 0 ? (
                <strong className="text-emerald-700 font-bold">FREE</strong>
              ) : (
                <span className="tabular-nums font-bold text-[#192E4D]">₹{Math.round(pricing.shipping).toLocaleString('en-IN')}</span>
              )}
            </span>
          </div>

          <div className="flex justify-between text-[#697586]">
            <span>Estimated GST (5%)</span>
            <span className="font-bold text-[#192E4D] tabular-nums">₹{Math.round(pricing.tax).toLocaleString('en-IN')}</span>
          </div>

          <div className="flex justify-between text-sm font-black text-[#192E4D] pt-2 border-t border-[#F0F4F8]">
            <span>Order Total</span>
            <span className="text-[#08A9A2] text-base tabular-nums">₹{Math.round(pricing.total).toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Floating Checkout Trigger (docked above bottom nav) */}
      <div className="sticky bottom-[58px] z-30 bg-white/95 backdrop-blur-md border-t border-[#E6EAF0] px-4 py-3 shadow-[0_-4px_20px_rgba(25,46,77,0.08)] mt-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="text-[11px] text-[#697586] block">Total Payable:</span>
            <span className="text-base font-black text-[#192E4D] tabular-nums">₹{Math.round(pricing.total).toLocaleString('en-IN')}</span>
          </div>
          <button
            type="button"
            onClick={() => setActiveScreen('checkout')}
            className="flex-1 h-12 px-5 rounded-xl bg-[#08A9A2] hover:bg-[#079690] active:scale-[0.98] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
