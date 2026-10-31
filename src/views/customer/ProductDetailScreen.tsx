import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ProductCard } from '../../components/ProductCard';
import {
  ChevronLeft,
  Heart,
  Share2,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Plus,
  Minus,
  X,
  Sparkles,
  Ruler,
} from 'lucide-react';

export const ProductDetailScreen: React.FC = () => {
  const {
    products,
    selectedProductId,
    setActiveScreen,
    setCustomerTab,
    wishlistIds,
    toggleWishlist,
    addToCart,
    reviews,
    addReview,
  } = useApp();

  const product = products.find((p) => p.id === selectedProductId) || products[0];

  // Do NOT preselect color variant or size automatically!
  const [selectedVariantIndex, setSelectedVariantIndex] = useState<number | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modals
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showSizeChartModal, setShowSizeChartModal] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState('');
  const [newComment, setNewComment] = useState('');

  // Reset state whenever a new product is opened — never preselect size or color!
  useEffect(() => {
    setSelectedVariantIndex(null);
    setSelectedImageIndex(0);
    setSelectedSize('');
    setQuantity(1);
    setFeedbackMsg(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedProductId, product?.id]);

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-base font-bold text-[#192E4D] mb-1">Product Unavailable</h2>
        <p className="text-xs text-[#697586] mb-4">
          This product has been removed or is currently unavailable in the catalog.
        </p>
        <button
          onClick={() => {
            setActiveScreen('tab');
            setCustomerTab('home');
          }}
          className="px-5 py-2.5 bg-[#192E4D] text-white text-xs font-bold rounded-xl shadow hover:bg-[#192E4D]/90 transition-all cursor-pointer"
        >
          Return to Catalog
        </button>
      </div>
    );
  }

  // Filter out unconfigured internal carrier variants so only real configured color variants are shown
  const configuredVariants = (product.variants || []).filter(
    (v) =>
      v.attributes?.isUnconfiguredDefault !== 'true' &&
      v.colorName &&
      v.colorName.trim() !== '' &&
      v.colorName.trim().toLowerCase() !== 'default' &&
      v.colorName.trim().toLowerCase() !== 'standard'
  );

  const requiresColorSelection = configuredVariants.length > 0;
  const requiresSizeSelection =
    product.variantType !== 'none' && Boolean(product.sizes && product.sizes.length > 0);

  // Active variant for gallery/price display (uses selected variant if chosen, or first variant for preview)
  const activeVariant =
    (selectedVariantIndex !== null
      ? configuredVariants[selectedVariantIndex]
      : configuredVariants[0]) ||
    product.variants?.[0];

  const isWishlisted = wishlistIds.includes(product.id);

  // Option-specific price override (e.g. for perfume volume 30ml / 50ml / 100ml)
  const optionPriceEntry =
    selectedSize && activeVariant?.optionPricing ? activeVariant.optionPricing[selectedSize] : undefined;

  const originalPrice = optionPriceEntry?.price ?? activeVariant?.price ?? product.price ?? 0;
  const currentPrice =
    optionPriceEntry?.salePrice && optionPriceEntry.salePrice > 0 && optionPriceEntry.salePrice < originalPrice
      ? optionPriceEntry.salePrice
      : activeVariant?.salePrice && activeVariant.salePrice > 0 && activeVariant.salePrice < originalPrice
      ? activeVariant.salePrice
      : product.salePrice && product.salePrice > 0 && product.salePrice < originalPrice
      ? product.salePrice
      : originalPrice;

  const hasDiscount = currentPrice < originalPrice;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0;

  // Variant size stock check
  const sizeStockMap = activeVariant?.sizeStock || {};
  const currentSizeStock =
    requiresSizeSelection && selectedSize
      ? sizeStockMap[selectedSize] !== undefined
        ? sizeStockMap[selectedSize]
        : activeVariant?.stock ?? 0
      : activeVariant?.stock ?? 0;
  const isAvailable = currentSizeStock > 0;

  // Handle color variant change
  const handleVariantChange = (index: number) => {
    setSelectedVariantIndex(index);
    setSelectedImageIndex(0);
    setFeedbackMsg(null);
  };

  // Similar products logic
  const similarProducts = products.filter(
    (p) =>
      p.id !== product.id &&
      (p.subCategoryId === product.subCategoryId ||
        p.mainCategoryId === product.mainCategoryId ||
        p.tags?.some((t) => product.tags?.includes(t)))
  );

  const displaySimilar =
    similarProducts.length >= 2
      ? similarProducts.slice(0, 4)
      : [
          ...similarProducts,
          ...products.filter((p) => p.id !== product.id && !similarProducts.some((sp) => sp.id === p.id)),
        ].slice(0, 4);

  const getOptionTypeName = () => {
    if (product.variantType === 'volume_ml') return 'volume / bottle size';
    if (product.variantType === 'shoe_sizes' || product.variantType === 'shoe_size') return 'shoe size';
    if (product.variantType === 'age_sizes' || product.variantType === 'age_size') return 'age size';
    if (product.variantType === 'custom_sizes' || product.variantType === 'custom') return 'option';
    return 'size';
  };

  const validatePurchaseSelection = (): boolean => {
    if (requiresColorSelection && selectedVariantIndex === null) {
      setFeedbackMsg({
        type: 'error',
        text: 'Please select a color option before adding this product to your cart.',
      });
      return false;
    }
    if (requiresSizeSelection && !selectedSize) {
      setFeedbackMsg({
        type: 'error',
        text: `Please select an available ${getOptionTypeName()} before adding this product to your cart.`,
      });
      return false;
    }
    if (!isAvailable) {
      setFeedbackMsg({
        type: 'error',
        text: 'This selected option is currently out of stock.',
      });
      return false;
    }
    return true;
  };

  const handleAddToCart = () => {
    if (!validatePurchaseSelection()) return;

    const chosenSize = requiresSizeSelection ? selectedSize : 'One Size';
    const result = addToCart(product, activeVariant, chosenSize, quantity);
    if (result.success) {
      const optionSummary = [
        requiresColorSelection && activeVariant?.colorName ? activeVariant.colorName : '',
        requiresSizeSelection && selectedSize ? selectedSize : '',
      ]
        .filter(Boolean)
        .join(', ');
      setFeedbackMsg({
        type: 'success',
        text: `Added ${product.name}${optionSummary ? ` (${optionSummary})` : ''} to cart!`,
      });
      setTimeout(() => setFeedbackMsg(null), 3500);
    } else {
      setFeedbackMsg({ type: 'error', text: result.message || 'Could not add to cart' });
    }
  };

  const handleBuyNow = () => {
    if (!validatePurchaseSelection()) return;

    const chosenSize = requiresSizeSelection ? selectedSize : 'One Size';
    const result = addToCart(product, activeVariant, chosenSize, quantity);
    if (result.success) {
      setCustomerTab('cart');
      setActiveScreen('checkout');
    } else {
      setFeedbackMsg({ type: 'error', text: result.message || 'Could not proceed to checkout' });
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newComment.trim()) return;
    addReview(product.id, newRating, newTitle.trim(), newComment.trim());
    setShowReviewModal(false);
    setNewTitle('');
    setNewComment('');
    setFeedbackMsg({ type: 'success', text: 'Thank you! Your verified review has been published.' });
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const productReviews = reviews.filter((r) => r.productId === product.id && r.status === 'approved');
  const galleryImages = activeVariant?.images?.filter(Boolean) || [];

  return (
    <div className="flex flex-col min-h-screen bg-white pb-32">
      {/* Top Navigation Bar with 44px touch targets */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E6EAF0] px-4 py-2 flex items-center justify-between min-h-[56px]">
        <button
          type="button"
          aria-label="Back to Catalog"
          onClick={() => setActiveScreen('tab')}
          className="w-11 h-11 rounded-full bg-[#F6F8FA] hover:bg-[#E6EAF0] active:scale-95 flex items-center justify-center text-[#192E4D] transition-all cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <span className="text-xs font-bold uppercase tracking-wider text-[#697586] truncate max-w-[200px]">
          {product.brand || 'ZOODI Collection'}
        </span>

        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            onClick={() => toggleWishlist(product.id)}
            className={`w-11 h-11 rounded-full flex items-center justify-center active:scale-95 transition-all cursor-pointer ${
              isWishlisted ? 'bg-[#F20D58] text-white shadow-sm' : 'bg-[#F6F8FA] text-[#192E4D] hover:bg-[#E6EAF0]'
            }`}
          >
            <Heart className="w-4 h-4" fill={isWishlisted ? 'currentColor' : 'none'} />
          </button>
          <button
            type="button"
            aria-label="Share product"
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: product.name, url: window.location.href });
              }
            }}
            className="w-11 h-11 rounded-full bg-[#F6F8FA] hover:bg-[#E6EAF0] active:scale-95 flex items-center justify-center text-[#192E4D] transition-all cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {feedbackMsg && (
        <div
          className={`mx-4 mt-3 p-3 rounded-2xl flex items-center gap-2 text-xs font-bold ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {feedbackMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Main Image Gallery */}
      {galleryImages.length > 0 && (
        <div className="relative w-full aspect-1/1 bg-[#F6F8FA] overflow-hidden">
          <img
            src={galleryImages[selectedImageIndex] || galleryImages[0]}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center transition-all duration-300"
          />

          {/* Gallery Thumbnails Overlay */}
          {galleryImages.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 px-4">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  aria-label={`View image ${idx + 1}`}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-12 h-12 rounded-xl overflow-hidden border-2 bg-white shadow-sm transition-all cursor-pointer ${
                    selectedImageIndex === idx
                      ? 'border-[#08A9A2] scale-105 ring-2 ring-[#08A9A2]/30'
                      : 'border-white opacity-80'
                  }`}
                >
                  <img src={img} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Discount Badge */}
          {hasDiscount && (
            <span className="absolute top-4 left-4 bg-[#F20D58] text-white font-extrabold text-xs px-2.5 py-1 rounded-md shadow-md">
              {discountPercent}% OFF
            </span>
          )}
        </div>
      )}

      {/* Product Information */}
      <div className="p-4 space-y-5">
        <div>
          <div className="flex items-center justify-between">
            {product.brand && (
              <span className="text-xs font-bold uppercase tracking-wider text-[#08A9A2]">
                {product.brand}
              </span>
            )}
            {activeVariant?.sku && (
              <span className="text-xs font-mono text-[#697586] bg-[#F6F8FA] px-2.5 py-1 rounded-md border border-[#E6EAF0] ml-auto">
                SKU: {activeVariant.sku}
              </span>
            )}
          </div>

          <h1 className="text-lg sm:text-xl font-extrabold text-[#192E4D] mt-1 leading-snug">
            {product.name}
          </h1>

          {/* Rating Summary */}
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center text-[#FFB000]">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className="w-4 h-4"
                  fill={s <= Math.round(product.rating) ? 'currentColor' : 'none'}
                />
              ))}
            </div>
            <span className="text-xs font-bold text-[#192E4D] tabular-nums">{product.rating}</span>
            <span className="text-xs text-[#697586] tabular-nums">({product.reviewCount} customer reviews)</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2.5 mt-3">
            <span className="text-2xl font-black text-[#192E4D] tabular-nums">
              ₹{Math.round(currentPrice).toLocaleString('en-IN')}
            </span>
            {hasDiscount && (
              <span className="text-sm font-semibold text-[#697586] line-through tabular-nums">
                ₹{Math.round(originalPrice).toLocaleString('en-IN')}
              </span>
            )}
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              Inclusive of GST
            </span>
          </div>
        </div>

        {/* COLOR VARIANT SELECTOR (Only displayed when real color variants are configured; never preselected!) */}
        {requiresColorSelection && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#192E4D]">
                Select Color:{' '}
                <span className="text-[#08A9A2]">
                  {selectedVariantIndex !== null
                    ? configuredVariants[selectedVariantIndex]?.colorName
                    : 'Please select a color'}
                </span>
              </span>
            </div>
            <div className="w-fit px-2.5 py-1.5 rounded-full bg-[#F6F8FA] border border-[#E6EAF0] flex items-center gap-2 flex-wrap">
              {configuredVariants.map((v, idx) => {
                const isSelected = idx === selectedVariantIndex;
                return (
                  <button
                    key={v.id || idx}
                    type="button"
                    aria-label={`Color: ${v.colorName}`}
                    title={v.colorName}
                    onClick={() => handleVariantChange(idx)}
                    className={`group relative w-7 h-7 rounded-full flex items-center justify-center transition-all active:scale-90 shrink-0 cursor-pointer ${
                      isSelected
                        ? 'ring-2 ring-offset-1 ring-[#08A9A2] shadow-xs'
                        : 'hover:scale-110 ring-1 ring-black/10'
                    }`}
                  >
                    <span
                      className="w-full h-full rounded-full border border-black/15 flex items-center justify-center shadow-2xs"
                      style={{ backgroundColor: v.colorCode }}
                    >
                      {isSelected && (
                        <CheckCircle2
                          className={`w-3.5 h-3.5 drop-shadow-xs ${
                            v.colorCode.toLowerCase() === '#ffffff' ||
                            v.colorCode.toLowerCase() === '#ffb000' ||
                            v.colorCode.toLowerCase() === '#e6eaf0'
                              ? 'text-slate-900'
                              : 'text-white'
                          }`}
                        />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ADAPTIVE SIZE / PURCHASE OPTION SELECTOR (Never preselected automatically!) */}
        {requiresSizeSelection && (
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#192E4D]">
                  {product.variantType === 'volume_ml'
                    ? 'Select Volume / Bottle Size:'
                    : product.variantType === 'shoe_sizes' || product.variantType === 'shoe_size'
                    ? 'Select Shoe Size (UK / India):'
                    : product.variantType === 'age_sizes' || product.variantType === 'age_size'
                    ? 'Select Age Size:'
                    : product.variantType === 'custom_sizes' || product.variantType === 'custom'
                    ? 'Select Option:'
                    : 'Select Size:'}{' '}
                  <span className="text-[#08A9A2]">
                    {selectedSize || `Choose ${getOptionTypeName()}`}
                  </span>
                </span>
                {product.sizeChartImage && (
                  <button
                    type="button"
                    onClick={() => setShowSizeChartModal(true)}
                    className="text-[11px] font-bold text-[#08A9A2] hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <Ruler className="w-3 h-3" />
                    <span>Size Guide</span>
                  </button>
                )}
              </div>
              {selectedSize && (
                <span className={`text-xs font-bold ${isAvailable ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {isAvailable ? `${currentSizeStock} in stock` : 'Out of stock in this size'}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {product.sizes.map((size) => {
                const isSelected = size === selectedSize;
                const sizeStock = sizeStockMap[size] !== undefined ? sizeStockMap[size] : activeVariant?.stock ?? 0;
                const hasStock = sizeStock > 0;

                return (
                  <button
                    key={size}
                    type="button"
                    disabled={!hasStock}
                    onClick={() => {
                      setSelectedSize(size);
                      setFeedbackMsg(null);
                    }}
                    className={`min-h-[44px] min-w-[52px] px-4 py-2.5 rounded-xl text-xs font-bold border transition-all active:scale-95 cursor-pointer ${
                      isSelected
                        ? 'bg-[#08A9A2] text-white border-[#08A9A2] shadow-xs'
                        : hasStock
                        ? 'bg-white border-[#E6EAF0] text-[#192E4D] hover:border-[#08A9A2]'
                        : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed line-through'
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* QUANTITY PICKER with 40px touch buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-[#F0F4F8]">
          <span className="text-xs font-bold text-[#192E4D]">Quantity:</span>
          <div className="flex items-center border border-[#E6EAF0] rounded-xl overflow-hidden bg-white shadow-2xs">
            <button
              type="button"
              aria-label="Decrease quantity"
              disabled={quantity <= 1}
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-10 h-10 flex items-center justify-center text-[#192E4D] hover:bg-[#F6F8FA] active:bg-[#E6EAF0] disabled:opacity-30 transition-colors cursor-pointer"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-10 text-center font-bold text-xs text-[#192E4D] tabular-nums">
              {quantity}
            </span>
            <button
              type="button"
              aria-label="Increase quantity"
              disabled={quantity >= Math.max(1, currentSizeStock)}
              onClick={() => setQuantity((q) => Math.min(Math.max(1, currentSizeStock), q + 1))}
              className="w-10 h-10 flex items-center justify-center text-[#192E4D] hover:bg-[#F6F8FA] active:bg-[#E6EAF0] disabled:opacity-30 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* DELIVERY ESTIMATOR & TRUST PROMISES */}
        <div className="p-4 rounded-2xl bg-white border border-[#E6EAF0] space-y-2.5">
          {product.shippingEligible !== false && (
            <div className="flex items-center gap-3 text-xs text-[#192E4D]">
              <Truck className="w-4 h-4 text-[#08A9A2] shrink-0" />
              <span>
                <strong>Express Delivery:</strong> Fast & secure doorstep delivery
              </span>
            </div>
          )}
          {product.returnEligible !== false && (
            <div className="flex items-center gap-3 text-xs text-[#192E4D]">
              <RotateCcw className="w-4 h-4 text-[#FFB000] shrink-0" />
              <span>
                <strong>15-Day Easy Returns:</strong> Hassle-free return policy
              </span>
            </div>
          )}
          <div className="flex items-center gap-3 text-xs text-[#192E4D]">
            <ShieldCheck className="w-4 h-4 text-[#F56645] shrink-0" />
            <span>
              <strong>100% Authentic ZOODI:</strong> Quality verified guarantee
            </span>
          </div>
        </div>

        {/* DESCRIPTION & SPECIFICATIONS */}
        <div className="space-y-3 pt-2">
          {product.description && product.description.trim() !== '' && (
            <>
              <h2 className="text-sm font-bold text-[#192E4D]">Product Description</h2>
              <p className="text-xs text-[#697586] leading-relaxed">{product.description}</p>
            </>
          )}

          {/* DYNAMIC PRODUCT SPECIFICATIONS (Rendered ONLY if valid, non-empty specifications were saved for this product) */}
          {(() => {
            const validSpecs: Array<{ label: string; value: string }> = [];

            const addSpec = (label: string, rawVal: any) => {
              if (rawVal === undefined || rawVal === null) return;
              const valStr = String(rawVal).trim();
              if (
                !valStr ||
                valStr.toLowerCase() === 'n/a' ||
                valStr.toLowerCase() === 'na' ||
                valStr.toLowerCase() === 'null' ||
                valStr.toLowerCase() === 'undefined'
              ) {
                return;
              }
              if (!validSpecs.some((s) => s.label.toLowerCase() === label.toLowerCase())) {
                validSpecs.push({ label, value: valStr });
              }
            };

            addSpec('Style', product.style || product.styleName);
            addSpec('Style Number', product.styleNumber);
            addSpec('Fabric', product.fabric);
            addSpec('GSM', product.gsm);
            addSpec('Ratio', product.ratio);
            addSpec('Colors', product.customColors || product.colorsDescription);
            addSpec('Accessories Included', product.accessories || product.accessoriesIncluded);
            addSpec('Packaging Details', product.packaging || product.packagingDetails);
            addSpec('Country of Origin', product.countryOfOrigin);
            addSpec('Manufacturer Details', product.manufacturer);
            addSpec('Care Instructions', product.careInstructions);

            // Structured specifications from category template and custom builder
            (product.structuredSpecifications || []).forEach((spec) => {
              if (spec.isVisibleOnStorefront !== false && spec.visibleToCustomers !== false) {
                const rawVal = spec.value;
                if (rawVal !== undefined && rawVal !== null && String(rawVal).trim() !== '') {
                  const displayVal = spec.unit ? `${rawVal} ${spec.unit}` : String(rawVal);
                  addSpec(spec.label, displayVal);
                }
              }
            });

            // Backward-compatible specifications map
            if (product.specifications) {
              Object.entries(product.specifications).forEach(([k, v]) => {
                addSpec(k, v);
              });
            }

            // If no specifications have been entered, hide the entire Product Specifications section
            if (validSpecs.length === 0) return null;

            return (
              <div className="space-y-2 pt-2">
                <h2 className="text-sm font-bold text-[#192E4D]">Product Specifications</h2>
                <div className="divide-y divide-[#F0F4F8] border border-[#E6EAF0] rounded-2xl overflow-hidden text-xs bg-white shadow-2xs">
                  {validSpecs.map((spec) => (
                    <div key={spec.label} className="flex px-3.5 py-2.5">
                      <span className="w-1/3 font-semibold text-[#697586]">{spec.label}</span>
                      <span className="w-2/3 font-bold text-[#192E4D]">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Optional Visual Guides: Care Guide Image */}
          {product.careImage && (
            <div className="pt-2">
              <span className="text-xs font-bold text-[#192E4D] block mb-1.5">Fabric & Care Guide:</span>
              <img
                src={product.careImage}
                alt="Care instructions guide"
                className="w-full max-h-48 object-cover rounded-xl border border-slate-200"
              />
            </div>
          )}
        </div>

        {/* SIZE CHART MODAL */}
        {showSizeChartModal && product.sizeChartImage && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-5 max-w-lg w-full space-y-3 shadow-2xl animate-in zoom-in-95">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-sm font-bold text-[#192E4D] flex items-center gap-1.5">
                  <Ruler className="w-4 h-4 text-[#08A9A2]" />
                  <span>Size Chart Guide</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowSizeChartModal(false)}
                  className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <img
                src={product.sizeChartImage}
                alt="Size chart diagram"
                className="w-full object-contain max-h-[70vh] rounded-xl"
              />
            </div>
          </div>
        )}

        {/* REVIEWS SECTION */}
        <div className="space-y-3 pt-4 border-t border-[#F0F4F8]">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#192E4D]">
              Customer Reviews ({productReviews.length})
            </h2>
            <button
              type="button"
              onClick={() => setShowReviewModal(true)}
              className="text-xs font-bold text-[#08A9A2] hover:underline p-1 cursor-pointer"
            >
              + Write a Review
            </button>
          </div>

          <div className="space-y-2.5">
            {productReviews.length === 0 ? (
              <p className="text-xs text-[#697586] italic">No reviews yet. Be the first to review this product!</p>
            ) : (
              productReviews.map((rev) => (
                <div key={rev.id} className="p-3.5 rounded-2xl bg-[#F6F8FA] border border-[#E6EAF0] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#192E4D]">{rev.customerName}</span>
                    <span className="text-[10px] text-[#697586]">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center text-[#FFB000]">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className="w-3.5 h-3.5"
                        fill={s <= rev.rating ? 'currentColor' : 'none'}
                      />
                    ))}
                  </div>
                  <p className="text-xs font-bold text-[#192E4D]">{rev.title}</p>
                  <p className="text-xs text-[#697586] leading-relaxed">{rev.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* SIMILAR PRODUCTS / YOU MAY ALSO LIKE SECTION */}
        {displaySimilar.length > 0 && (
          <div className="space-y-3.5 pt-6 pb-2 border-t border-[#F0F4F8]">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-[#08A9A2] text-xs font-bold uppercase tracking-wider mb-0.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Curated For You</span>
                </div>
                <h2 className="text-sm sm:text-base font-extrabold text-[#192E4D]">
                  Similar Products
                </h2>
                <p className="text-[11px] text-[#697586]">
                  Customers who viewed this also loved these pieces
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {displaySimilar.map((simProd) => (
                <ProductCard key={simProd.id} product={simProd} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* FIXED BOTTOM ACTION BAR: Standard 48px height buttons */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-40 bg-white/95 backdrop-blur-md border-t border-[#E6EAF0] px-4 py-3 flex items-center gap-3 shadow-[0_-4px_20px_rgba(25,46,77,0.08)]">
        <button
          type="button"
          onClick={handleAddToCart}
          className="flex-1 h-12 px-4 rounded-xl border-2 border-[#08A9A2] text-[#08A9A2] hover:bg-[#08A9A2]/10 active:scale-[0.98] font-bold text-xs sm:text-sm flex items-center justify-center transition-all cursor-pointer"
        >
          Add to Cart
        </button>

        <button
          type="button"
          onClick={handleBuyNow}
          className="flex-1 h-12 px-4 rounded-xl bg-[#F56645] hover:bg-[#de5535] active:scale-[0.98] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center shadow-md transition-all cursor-pointer"
        >
          Buy Now
        </button>
      </div>

      {/* WRITE A REVIEW MODAL */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#F0F4F8] pb-3">
              <h3 className="text-base font-extrabold text-[#192E4D]">Write a Review</h3>
              <button
                type="button"
                aria-label="Close modal"
                onClick={() => setShowReviewModal(false)}
                className="w-10 h-10 rounded-full flex items-center justify-center text-[#697586] hover:bg-[#F6F8FA] hover:text-[#192E4D] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#192E4D] block mb-1.5">Your Rating</label>
                <div className="flex items-center gap-2 text-[#FFB000]">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className="p-1 hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                    >
                      <Star
                        className="w-7 h-7"
                        fill={star <= newRating ? 'currentColor' : 'none'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#192E4D] block mb-1">Headline</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Great quality and rich color!"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full h-11 px-3.5 text-xs sm:text-sm border border-[#E6EAF0] rounded-xl focus:outline-hidden focus:border-[#08A9A2] focus:ring-2 focus:ring-[#08A9A2]/20"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#192E4D] block mb-1">Your Review</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Share details about the fit, fabric, and appearance..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full p-3.5 text-xs sm:text-sm border border-[#E6EAF0] rounded-xl focus:outline-hidden focus:border-[#08A9A2] focus:ring-2 focus:ring-[#08A9A2]/20"
                />
              </div>

              <button
                type="submit"
                className="w-full h-12 rounded-xl bg-[#08A9A2] hover:bg-[#079690] active:scale-[0.98] text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
              >
                Submit Review
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
