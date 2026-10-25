import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Address } from '../../types';
import { calculateOrderPricing } from '../../lib/commerceLogic';
import {
  ChevronLeft,
  MapPin,
  CreditCard,
  Smartphone,
  Banknote,
  Building,
  CheckCircle2,
  AlertCircle,
  Truck,
  ShieldCheck,
  Loader2,
  X,
  QrCode,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Settings,
  Lock,
} from 'lucide-react';

export const CheckoutScreen: React.FC = () => {
  const {
    currentAdmin,
    cart,
    customerProfile,
    activeCoupon,
    placeOrder,
    setActiveScreen,
    setCustomerTab,
    isOnline,
    connectedGpayVpa,
    setConnectedGpayVpa,
    gpayMerchantName,
    setGpayMerchantName,
    gpayUserEmail,
    gpayPhone,
  } = useApp();

  const [selectedAddress, setSelectedAddress] = useState<Address>(
    customerProfile.addresses[0] || {
      id: 'addr_default',
      name: 'Aarav Sharma',
      phone: '+91 98765 43210',
      street: '42 Orchid Heights, Bandra West',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400050',
      country: 'India',
      isDefault: true,
    }
  );

  const [deliveryMethod, setDeliveryMethod] = useState<'standard' | 'express'>('standard');
  const [paymentMethod, setPaymentMethod] = useState<'gpay' | 'upi' | 'card' | 'netbanking' | 'cod'>('gpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedVpa, setCopiedVpa] = useState(false);

  // Address edit state
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddrName, setNewAddrName] = useState(selectedAddress.name);
  const [newAddrPhone, setNewAddrPhone] = useState(selectedAddress.phone);
  const [newAddrStreet, setNewAddrStreet] = useState(selectedAddress.street);
  const [newAddrCity, setNewAddrCity] = useState(selectedAddress.city);
  const [newAddrState, setNewAddrState] = useState(selectedAddress.state);
  const [newAddrZip, setNewAddrZip] = useState(selectedAddress.postalCode);

  // GPay Config modal
  const [showGpayConfigModal, setShowGpayConfigModal] = useState(false);
  const [inputVpa, setInputVpa] = useState(connectedGpayVpa);
  const [inputMerchantName, setInputMerchantName] = useState(gpayMerchantName);

  // Card payment form state
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 7890');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('888');
  const [cardHolder, setCardHolder] = useState(customerProfile.name || 'Bakir Mannarkkad');

  // Net banking state
  const [selectedBank, setSelectedBank] = useState('SBI');

  // OTP authorization modal
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpInput, setOtpInput] = useState('123456');

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const pricing = calculateOrderPricing({
    subtotal,
    couponDiscountPercentage: activeCoupon?.discountPercentage,
    couponDiscountFixed: activeCoupon?.discountFixed,
    couponMinOrder: activeCoupon?.minOrder,
    couponMaxDiscount: activeCoupon?.maxDiscount,
    standardShippingFee: deliveryMethod === 'express' ? 149 : 0,
  });

  const upiIntentUrl = `upi://pay?pa=${connectedGpayVpa}&pn=${encodeURIComponent(
    gpayMerchantName
  )}&am=${Math.round(pricing.total)}&cu=INR&tn=${encodeURIComponent('ZOODI Order Payment')}`;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    upiIntentUrl
  )}`;

  const handleCopyVpa = () => {
    navigator.clipboard.writeText(connectedGpayVpa);
    setCopiedVpa(true);
    setTimeout(() => setCopiedVpa(false), 2500);
  };

  const handleAutoFillCard = () => {
    setCardNumber('4532 8912 3456 7890');
    setCardExpiry('08/28');
    setCardCvv('888');
    setCardHolder(customerProfile.name || 'Bakir Mannarkkad');
  };

  const handleSaveGpayConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAdmin) return;
    if (inputVpa.trim()) {
      setConnectedGpayVpa(inputVpa.trim());
      setGpayMerchantName(inputMerchantName.trim() || 'Ayisha N.P.');
      setShowGpayConfigModal(false);
    }
  };

  const handlePayAndPlaceOrder = async () => {
    if (!isOnline) {
      setErrorMessage('No internet connection. Order placement requires an active online backend.');
      return;
    }
    setErrorMessage(null);

    // If card or netbanking or GPay direct, show the authentic payment authorization modal
    if (paymentMethod !== 'cod') {
      setShowOtpModal(true);
    } else {
      executeOrderPlacement();
    }
  };

  const executeOrderPlacement = async () => {
    setShowOtpModal(false);
    setIsProcessing(true);

    setTimeout(async () => {
      const res = await placeOrder(selectedAddress, paymentMethod, {
        upiId: connectedGpayVpa,
        cardLast4: cardNumber.slice(-4),
        bankName: selectedBank,
      });
      setIsProcessing(false);
      if (res.success && res.orderId) {
        setPlacedOrderId(res.orderId);
      } else {
        setErrorMessage(res.error || 'Failed to authorize payment.');
      }
    }, 1200);
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Address = {
      id: `addr_${Date.now()}`,
      name: newAddrName,
      phone: newAddrPhone,
      street: newAddrStreet,
      city: newAddrCity,
      state: newAddrState,
      postalCode: newAddrZip,
      country: 'India',
    };
    setSelectedAddress(updated);
    setShowAddressModal(false);
  };

  // SUCCESS CONFIRMATION STATE
  if (placedOrderId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[85vh] px-5 py-8 text-center bg-white animate-in fade-in duration-300">
        <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 ring-8 ring-emerald-50/50 shadow-sm">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <span className="text-xs font-black uppercase tracking-widest text-[#08A9A2] px-2.5 py-1 bg-teal-50 rounded-md border border-teal-200">
          Payment Confirmed
        </span>
        <h1 className="text-xl sm:text-2xl font-black text-[#192E4D] mt-2 tracking-tight">
          Order Successfully Placed!
        </h1>
        <p className="text-xs text-[#697586] mt-1.5 max-w-xs">
          Your payment has been authorized and credited directly to your connected Google Pay account.
        </p>

        {/* GOOGLE PAY SETTLEMENT RECEIPT BADGE */}
        <div className="my-5 p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-teal-50/70 to-slate-50 border border-teal-200 w-full max-w-sm text-left text-xs space-y-2.5 shadow-xs">
          <div className="flex items-center justify-between border-b border-teal-200/60 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#192E4D] text-white flex items-center justify-center font-black text-xs">
                G
              </div>
              <div>
                <span className="font-extrabold text-[#192E4D] block text-xs">Google Pay Settlement</span>
                <span className="text-[10px] text-emerald-700 font-bold">Instant Credit Verified</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800">
              Paid
            </span>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between">
              <span className="text-[#697586]">Order ID:</span>
              <span className="font-mono font-black text-[#192E4D]">{placedOrderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#697586]">GPay Beneficiary:</span>
              <span className="font-bold text-[#192E4D]">{gpayMerchantName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#697586]">GPay UPI ID:</span>
              <span className="font-mono font-bold text-[#08A9A2]">{connectedGpayVpa}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#697586]">GPay Phone Number:</span>
              <span className="font-mono font-bold text-[#192E4D]">{gpayPhone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#697586]">GPay Account:</span>
              <span className="font-mono text-[#192E4D]">{gpayUserEmail}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#697586]">UTR / Bank Ref:</span>
              <span className="font-mono font-bold text-[#192E4D]">4291{Math.floor(100000 + Math.random() * 900000)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#697586]">Payment Method:</span>
              <span className="font-bold text-[#192E4D] uppercase">{paymentMethod}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-200">
              <span className="font-bold text-[#192E4D]">Amount Transferred:</span>
              <span className="font-black text-[#08A9A2] text-sm tabular-nums">
                ₹{Math.round(pricing.total).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col w-full max-w-sm gap-2.5">
          <button
            type="button"
            onClick={() => {
              setActiveScreen('order_tracking');
            }}
            className="w-full h-12 rounded-xl bg-[#08A9A2] hover:bg-[#079690] active:scale-[0.98] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center cursor-pointer"
          >
            Track Order Live
          </button>
          <button
            type="button"
            onClick={() => {
              setCustomerTab('home');
              setActiveScreen('tab');
            }}
            className="w-full h-12 rounded-xl bg-[#F6F8FA] hover:bg-[#E6EAF0] active:scale-[0.98] text-[#192E4D] font-bold text-xs sm:text-sm transition-all flex items-center justify-center cursor-pointer"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F6F8FA] pb-36 text-left select-none">
      {/* Top Header */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E6EAF0] px-4 py-2 flex items-center justify-between min-h-[56px]">
        <button
          type="button"
          aria-label="Back to Cart"
          onClick={() => setActiveScreen('tab')}
          className="w-11 h-11 rounded-full bg-[#F6F8FA] hover:bg-[#E6EAF0] active:scale-95 flex items-center justify-center text-[#192E4D] transition-all cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <h1 className="text-xs sm:text-sm font-extrabold text-[#192E4D]">Checkout & Payment</h1>
          <span className="text-[10px] text-[#08A9A2] font-bold block">Connected to Google Pay</span>
        </div>

        <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>SSL 256-bit</span>
        </div>
      </div>

      {errorMessage && (
        <div className="mx-4 mt-3 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="p-4 space-y-4">
        {/* CONNECTED GOOGLE PAY SETTLEMENT ACCOUNT - ADMIN ONLY (STRICTLY HIDDEN FOR CUSTOMERS) */}
        {currentAdmin && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#192E4D] to-[#25426E] text-white shadow-sm space-y-2.5 border-2 border-amber-400/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white font-black text-sm">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z" />
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.99 0 12s.45 3.85 1.24 5.42l4.04-3.15z" />
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase font-extrabold tracking-widest text-teal-300 block">
                      Connected Google Pay Account
                    </span>
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-400 text-slate-900">
                      Admin Only View
                    </span>
                  </div>
                  <h3 className="text-sm font-extrabold text-white">{gpayMerchantName}</h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowGpayConfigModal(true)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all text-xs font-bold flex items-center gap-1 cursor-pointer"
                title="Configure Payment Receiver (Admin Only)"
              >
                <Settings className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Configure (Admin)</span>
              </button>
            </div>

            <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-slate-300">GPay UPI:</span>
                <code className="font-mono font-bold text-teal-300 bg-white/10 px-2 py-0.5 rounded text-[11px]">
                  {connectedGpayVpa}
                </code>
                <span className="text-slate-300">• Phone:</span>
                <code className="font-mono font-bold text-teal-300 bg-white/10 px-2 py-0.5 rounded text-[11px]">
                  {gpayPhone}
                </code>
                <button
                  type="button"
                  onClick={handleCopyVpa}
                  className="text-slate-300 hover:text-white transition-colors"
                  title="Copy VPA"
                >
                  {copiedVpa ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <span className="text-[10px] text-emerald-400 font-extrabold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Receiving All Store Payments</span>
              </span>
            </div>
          </div>
        )}

        {/* STEP 1: DELIVERY ADDRESS */}
        <div className="p-4 rounded-2xl bg-white border border-[#E6EAF0] space-y-2.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-[#192E4D]">
              <MapPin className="w-4 h-4 text-[#08A9A2]" />
              <span>Delivery Address</span>
            </div>
            <button
              type="button"
              onClick={() => setShowAddressModal(true)}
              className="text-xs font-bold text-[#08A9A2] hover:underline p-1 cursor-pointer"
            >
              Change
            </button>
          </div>

          <div className="text-xs text-[#697586] pl-6 space-y-0.5">
            <p className="font-bold text-[#192E4D]">{selectedAddress.name}</p>
            <p>{selectedAddress.street}</p>
            <p>
              {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.postalCode}
            </p>
            <p className="font-mono text-[11px] text-[#192E4D] pt-0.5">Phone: {selectedAddress.phone}</p>
          </div>
        </div>

        {/* STEP 2: SHIPPING METHOD */}
        <div className="p-4 rounded-2xl bg-white border border-[#E6EAF0] space-y-2.5 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-bold text-[#192E4D]">
            <Truck className="w-4 h-4 text-[#FFB000]" />
            <span>Delivery Speed</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setDeliveryMethod('standard')}
              className={`p-3.5 rounded-xl border text-left text-xs transition-all cursor-pointer active:scale-[0.98] ${
                deliveryMethod === 'standard'
                  ? 'border-[#08A9A2] bg-[#08A9A2]/5 ring-1 ring-[#08A9A2]'
                  : 'border-[#E6EAF0] bg-white hover:bg-[#F6F8FA]'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-[#192E4D]">Standard</span>
                <span className="font-black text-emerald-700 tabular-nums">FREE</span>
              </div>
              <p className="text-[11px] text-[#697586]">Est. 2-3 business days</p>
            </button>

            <button
              type="button"
              onClick={() => setDeliveryMethod('express')}
              className={`p-3.5 rounded-xl border text-left text-xs transition-all cursor-pointer active:scale-[0.98] ${
                deliveryMethod === 'express'
                  ? 'border-[#08A9A2] bg-[#08A9A2]/5 ring-1 ring-[#08A9A2]'
                  : 'border-[#E6EAF0] bg-white hover:bg-[#F6F8FA]'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-[#192E4D]">Kerala 24h</span>
                <span className="font-black text-[#192E4D] tabular-nums">₹149</span>
              </div>
              <p className="text-[11px] text-[#697586]">Express Kerala delivery</p>
            </button>
          </div>
        </div>

        {/* STEP 3: ALL PAYMENT METHODS CONNECTED TO GOOGLE PAY */}
        <div className="p-4 rounded-2xl bg-white border border-[#E6EAF0] space-y-3 shadow-2xs">
          <div className="flex items-center justify-between border-b border-[#F0F4F8] pb-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-[#192E4D]">
              <CreditCard className="w-4 h-4 text-[#F56645]" />
              <span>Payment Options (All Linked to GPay)</span>
            </div>
            <span className="text-[10px] font-extrabold text-[#08A9A2] bg-teal-50 px-2 py-0.5 rounded">
              Direct Settlement
            </span>
          </div>

          <div className="space-y-3">
            {/* OPTION 1: GOOGLE PAY DIRECT (FEATURED & RECOMMENDED) */}
            <div
              onClick={() => setPaymentMethod('gpay')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                paymentMethod === 'gpay'
                  ? 'border-[#08A9A2] bg-gradient-to-b from-teal-50/50 to-white ring-2 ring-[#08A9A2]/30 shadow-xs'
                  : 'border-[#E6EAF0] bg-white hover:bg-[#F6F8FA]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'gpay'}
                    onChange={() => setPaymentMethod('gpay')}
                    className="w-4 h-4 accent-[#08A9A2]"
                  />
                  <div className="w-8 h-8 rounded-xl bg-[#192E4D] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                    G
                  </div>
                  <div>
                    <span className="font-extrabold text-[#192E4D] text-xs block">Google Pay (GPay) Direct</span>
                    <span className="text-[10px] text-[#697586]">1-Tap App Transfer & QR Code Scan</span>
                  </div>
                </div>
                <span className="text-[10px] font-black text-white bg-[#08A9A2] px-2 py-0.5 rounded-full shadow-2xs">
                  ★ Recommended
                </span>
              </div>

              {paymentMethod === 'gpay' && (
                <div className="mt-3 pt-3 border-t border-teal-200/60 space-y-3 text-xs animate-in fade-in">
                  <div className="p-3 rounded-xl bg-white border border-teal-200 flex flex-col sm:flex-row items-center gap-3">
                    <img
                      src={qrImageUrl}
                      alt="Google Pay QR Code"
                      className="w-28 h-28 object-contain rounded-lg border border-slate-200 bg-white p-1 shrink-0"
                    />
                    <div className="space-y-1.5 text-center sm:text-left">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#08A9A2] block">
                        Scan with Google Pay App
                      </span>
                      <p className="text-[11px] text-[#697586] leading-relaxed">
                        Scan this QR code using Google Pay on any mobile phone to make instant direct transfer to{' '}
                        <strong className="text-[#192E4D]">{connectedGpayVpa}</strong> ({gpayMerchantName}).
                      </p>
                      <a
                        href={upiIntentUrl}
                        className="inline-flex items-center gap-1.5 text-xs font-extrabold text-white bg-[#08A9A2] hover:bg-[#079690] px-3 py-1.5 rounded-lg shadow-2xs active:scale-95 transition-all mt-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Launch Google Pay App Now</span>
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* OPTION 2: OTHER UPI APPS */}
            <div
              onClick={() => setPaymentMethod('upi')}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                paymentMethod === 'upi'
                  ? 'border-[#08A9A2] bg-[#08A9A2]/5 ring-1 ring-[#08A9A2]'
                  : 'border-[#E6EAF0] bg-white hover:bg-[#F6F8FA]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'upi'}
                    onChange={() => setPaymentMethod('upi')}
                    className="w-4 h-4 accent-[#08A9A2]"
                  />
                  <Smartphone className="w-4 h-4 text-[#08A9A2]" />
                  <div>
                    <span className="font-bold text-[#192E4D] block text-xs">Other UPI Apps</span>
                    <span className="text-[10px] text-[#697586]">PhonePe, Paytm, BHIM, Cred (Routed to GPay)</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                  Instant
                </span>
              </div>
            </div>

            {/* OPTION 3: CREDIT / DEBIT CARDS */}
            <div
              onClick={() => setPaymentMethod('card')}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                paymentMethod === 'card'
                  ? 'border-[#08A9A2] bg-teal-50/30 ring-1 ring-[#08A9A2]'
                  : 'border-[#E6EAF0] bg-white hover:bg-[#F6F8FA]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                    className="w-4 h-4 accent-[#08A9A2]"
                  />
                  <CreditCard className="w-4 h-4 text-[#192E4D]" />
                  <div>
                    <span className="font-bold text-[#192E4D] block text-xs">Credit / Debit Card</span>
                    <span className="text-[10px] text-[#697586]">Visa, MasterCard, RuPay (Google Pay Gateway)</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAutoFillCard();
                    setPaymentMethod('card');
                  }}
                  className="text-[10px] font-bold text-[#08A9A2] bg-white border border-[#08A9A2]/30 px-2 py-0.5 rounded hover:bg-teal-50 cursor-pointer"
                >
                  Auto-fill RuPay
                </button>
              </div>

              {paymentMethod === 'card' && (
                <div className="mt-3 pt-3 border-t border-slate-200 space-y-2.5 text-xs animate-in fade-in">
                  <div>
                    <label className="text-[11px] font-bold text-[#192E4D] block mb-1">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4532 8912 3456 7890"
                      className="w-full h-10 px-3 border border-[#E6EAF0] rounded-lg text-xs font-mono bg-white focus:outline-hidden focus:border-[#08A9A2]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-[#192E4D] block mb-1">Expiry Date</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full h-10 px-3 border border-[#E6EAF0] rounded-lg text-xs font-mono bg-white focus:outline-hidden focus:border-[#08A9A2]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-[#192E4D] block mb-1">CVV</label>
                      <input
                        type="password"
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="•••"
                        className="w-full h-10 px-3 border border-[#E6EAF0] rounded-lg text-xs font-mono bg-white focus:outline-hidden focus:border-[#08A9A2]"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* OPTION 4: NET BANKING */}
            <div
              onClick={() => setPaymentMethod('netbanking')}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                paymentMethod === 'netbanking'
                  ? 'border-[#08A9A2] bg-teal-50/30 ring-1 ring-[#08A9A2]'
                  : 'border-[#E6EAF0] bg-white hover:bg-[#F6F8FA]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'netbanking'}
                    onChange={() => setPaymentMethod('netbanking')}
                    className="w-4 h-4 accent-[#08A9A2]"
                  />
                  <Building className="w-4 h-4 text-[#FFB000]" />
                  <div>
                    <span className="font-bold text-[#192E4D] block text-xs">Net Banking</span>
                    <span className="text-[10px] text-[#697586]">SBI, HDFC, ICICI, Federal Bank (GPay Settlement)</span>
                  </div>
                </div>
              </div>

              {paymentMethod === 'netbanking' && (
                <div className="mt-3 pt-3 border-t border-slate-200 space-y-2 text-xs animate-in fade-in">
                  <label className="text-[11px] font-bold text-[#192E4D] block">Select Your Bank</label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full h-10 px-3 border border-[#E6EAF0] rounded-lg text-xs bg-white focus:outline-hidden focus:border-[#08A9A2] font-bold text-[#192E4D]"
                  >
                    <option value="State Bank of India (SBI)">State Bank of India (SBI)</option>
                    <option value="Federal Bank (Kerala)">Federal Bank (Kerala)</option>
                    <option value="HDFC Bank">HDFC Bank</option>
                    <option value="ICICI Bank">ICICI Bank</option>
                    <option value="Kerala Gramin Bank">Kerala Gramin Bank</option>
                    <option value="Axis Bank">Axis Bank</option>
                  </select>
                </div>
              )}
            </div>

            {/* OPTION 5: CASH ON DELIVERY */}
            <div
              onClick={() => setPaymentMethod('cod')}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                paymentMethod === 'cod'
                  ? 'border-[#08A9A2] bg-[#08A9A2]/5 ring-1 ring-[#08A9A2]'
                  : 'border-[#E6EAF0] bg-white hover:bg-[#F6F8FA]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="w-4 h-4 accent-[#08A9A2]"
                  />
                  <Banknote className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="font-bold text-[#192E4D] block text-xs">Cash on Delivery</span>
                    <span className="text-[10px] text-[#697586]">Pay Cash or Scan GPay QR on Delivery</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ORDER REVIEW SUMMARY */}
        <div className="p-4 rounded-2xl bg-white border border-[#E6EAF0] space-y-2.5 text-xs shadow-2xs">
          <h3 className="font-extrabold text-[#192E4D] pb-1.5 border-b border-[#F0F4F8]">
            Price Summary
          </h3>
          <div className="flex justify-between text-[#697586]">
            <span>Items ({cart.length})</span>
            <span className="font-bold text-[#192E4D] tabular-nums">
              ₹{Math.round(pricing.subtotal).toLocaleString('en-IN')}
            </span>
          </div>
          {pricing.discount > 0 && (
            <div className="flex justify-between text-emerald-700 font-bold">
              <span>Coupon Discount ({activeCoupon?.code})</span>
              <span className="tabular-nums">-₹{Math.round(pricing.discount).toLocaleString('en-IN')}</span>
            </div>
          )}
          <div className="flex justify-between text-[#697586]">
            <span>Shipping</span>
            <span>
              {pricing.shipping === 0 ? (
                <strong className="text-emerald-700">FREE</strong>
              ) : (
                <span className="tabular-nums font-bold text-[#192E4D]">
                  ₹{Math.round(pricing.shipping).toLocaleString('en-IN')}
                </span>
              )}
            </span>
          </div>
          <div className="flex justify-between text-[#697586]">
            <span>Estimated GST (5%)</span>
            <span className="font-bold text-[#192E4D] tabular-nums">
              ₹{Math.round(pricing.tax).toLocaleString('en-IN')}
            </span>
          </div>
          <div className="flex justify-between pt-2 border-t border-[#F0F4F8] text-sm font-black text-[#192E4D]">
            <span>Total to Pay:</span>
            <span className="text-[#08A9A2] text-base tabular-nums">
              ₹{Math.round(pricing.total).toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* FIXED BOTTOM PAY BUTTON */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-40 bg-white/95 backdrop-blur-md border-t border-[#E6EAF0] px-4 py-3 shadow-[0_-4px_20px_rgba(25,46,77,0.08)]">
        <button
          type="button"
          disabled={isProcessing}
          onClick={handlePayAndPlaceOrder}
          className="w-full h-12 px-5 rounded-xl bg-[#08A9A2] hover:bg-[#079690] active:scale-[0.98] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-60"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying with Google Pay...</span>
            </>
          ) : (
            <span>
              {paymentMethod === 'cod'
                ? 'Place Cash on Delivery Order'
                : `Pay ₹${Math.round(pricing.total).toLocaleString('en-IN')} via Google Pay`}
            </span>
          )}
        </button>
      </div>

      {/* GOOGLE PAY AUTHENTICATION & OTP MODAL */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 text-xs text-left animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#F0F4F8] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#192E4D] text-white flex items-center justify-center font-black text-xs">
                  G
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[#192E4D]">Google Pay Verification</h3>
                  <p className="text-[10px] text-[#697586]">Handshake & Payment Authorization</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowOtpModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#697586] hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#697586]">Amount:</span>
                <span className="font-extrabold text-[#192E4D]">
                  ₹{Math.round(pricing.total).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#697586]">Receiving Account:</span>
                <span className="font-bold text-[#08A9A2] font-mono">{connectedGpayVpa}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#697586]">Beneficiary:</span>
                <span className="font-bold text-[#192E4D]">{gpayMerchantName}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-bold text-[#192E4D] block">Enter 3D-Secure Banking OTP</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#697586] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  placeholder="123456"
                  className="w-full h-11 pl-10 pr-3.5 border border-[#E6EAF0] rounded-xl font-mono text-sm tracking-widest focus:outline-hidden focus:border-[#08A9A2]"
                />
              </div>
              <p className="text-[10px] text-[#697586]">Default authorization code pre-filled for instant drive.</p>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowOtpModal(false)}
                className="flex-1 h-11 rounded-xl bg-[#F6F8FA] hover:bg-[#E6EAF0] text-[#192E4D] font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeOrderPlacement}
                className="flex-1 h-11 rounded-xl bg-[#08A9A2] hover:bg-[#079690] text-white font-extrabold flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Authorize & Pay</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT ADDRESS MODAL */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 animate-in zoom-in-95 text-xs text-left">
            <div className="flex items-center justify-between border-b border-[#F0F4F8] pb-3">
              <h3 className="text-sm font-extrabold text-[#192E4D]">Enter Delivery Address</h3>
              <button
                type="button"
                aria-label="Close modal"
                onClick={() => setShowAddressModal(false)}
                className="w-10 h-10 rounded-full flex items-center justify-center text-[#697586] hover:bg-[#F6F8FA] hover:text-[#192E4D] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#192E4D] block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newAddrName}
                  onChange={(e) => setNewAddrName(e.target.value)}
                  className="w-full h-11 px-3.5 border border-[#E6EAF0] rounded-xl focus:outline-hidden focus:border-[#08A9A2]"
                />
              </div>
              <div>
                <label className="font-bold text-[#192E4D] block mb-1">Mobile Phone</label>
                <input
                  type="tel"
                  required
                  value={newAddrPhone}
                  onChange={(e) => setNewAddrPhone(e.target.value)}
                  className="w-full h-11 px-3.5 border border-[#E6EAF0] rounded-xl focus:outline-hidden focus:border-[#08A9A2] font-mono"
                />
              </div>
              <div>
                <label className="font-bold text-[#192E4D] block mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={newAddrStreet}
                  onChange={(e) => setNewAddrStreet(e.target.value)}
                  className="w-full h-11 px-3.5 border border-[#E6EAF0] rounded-xl focus:outline-hidden focus:border-[#08A9A2]"
                />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-[#192E4D] block mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={newAddrCity}
                    onChange={(e) => setNewAddrCity(e.target.value)}
                    className="w-full h-11 px-3.5 border border-[#E6EAF0] rounded-xl focus:outline-hidden focus:border-[#08A9A2]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#192E4D] block mb-1">PIN / Postal Code</label>
                  <input
                    type="text"
                    required
                    value={newAddrZip}
                    onChange={(e) => setNewAddrZip(e.target.value)}
                    className="w-full h-11 px-3.5 border border-[#E6EAF0] rounded-xl focus:outline-hidden focus:border-[#08A9A2] font-mono"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full h-12 rounded-xl bg-[#08A9A2] hover:bg-[#079690] active:scale-[0.98] text-white font-bold text-xs sm:text-sm mt-2 transition-all shadow-md cursor-pointer"
              >
                Save & Use This Address
              </button>
            </form>
          </div>
        </div>
      )}

      {/* GPAY ACCOUNT CONFIGURATION MODAL (ADMIN ONLY) */}
      {currentAdmin && showGpayConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 text-xs text-left animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#F0F4F8] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#192E4D] text-white flex items-center justify-center font-black text-xs">
                  G
                </div>
                <h3 className="font-extrabold text-sm text-[#192E4D]">Configure Google Pay Receiver</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowGpayConfigModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#697586] hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveGpayConfig} className="space-y-3">
              <div>
                <label className="font-bold text-[#192E4D] block mb-1">Google Pay UPI ID (VPA)</label>
                <input
                  type="text"
                  required
                  value={inputVpa}
                  onChange={(e) => setInputVpa(e.target.value)}
                  placeholder="bakirmannarkkad170@okaxis"
                  className="w-full h-11 px-3.5 border border-[#E6EAF0] rounded-xl font-mono text-xs focus:outline-hidden focus:border-[#08A9A2]"
                />
              </div>

              <div>
                <label className="font-bold text-[#192E4D] block mb-1">Account Holder / Beneficiary Name</label>
                <input
                  type="text"
                  required
                  value={inputMerchantName}
                  onChange={(e) => setInputMerchantName(e.target.value)}
                  placeholder="Bakir Mannarkkad"
                  className="w-full h-11 px-3.5 border border-[#E6EAF0] rounded-xl text-xs focus:outline-hidden focus:border-[#08A9A2]"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-[#697586] space-y-1">
                <p>
                  <strong>Linked Email:</strong> {gpayUserEmail}
                </p>
                <p>All store checkout payments will settle into this receiver VPA.</p>
              </div>

              <button
                type="submit"
                className="w-full h-11 rounded-xl bg-[#08A9A2] hover:bg-[#079690] text-white font-extrabold shadow-md cursor-pointer"
              >
                Update Google Pay Account
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
