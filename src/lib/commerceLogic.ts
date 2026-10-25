export interface PricingInput {
  subtotal: number;
  couponDiscountPercentage?: number;
  couponDiscountFixed?: number;
  couponMaxDiscount?: number;
  couponMinOrder?: number;
  freeShippingThreshold?: number;
  standardShippingFee?: number;
  taxRate?: number; // e.g. 0.05 for 5%
}

export interface PricingBreakdown {
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  couponApplied: boolean;
  couponError?: string;
}

/**
 * Formats a monetary number in Indian Rupees (₹) with standard en-IN grouping (e.g. ₹1,499)
 */
export function formatINR(amount: number): string {
  if (isNaN(amount) || amount === undefined || amount === null) return '₹0';
  return '₹' + Math.round(amount).toLocaleString('en-IN');
}

/**
 * Calculates complete order pricing breakdown including discounts, shipping, and taxes.
 */
export function calculateOrderPricing(input: PricingInput): PricingBreakdown {
  const subtotal = Math.max(0, Math.round(input.subtotal * 100) / 100);
  const minOrder = input.couponMinOrder ?? 0;
  let discount = 0;
  let couponApplied = false;
  let couponError: string | undefined;

  if (input.couponDiscountPercentage || input.couponDiscountFixed) {
    if (subtotal < minOrder) {
      couponError = `Minimum order amount of ₹${minOrder.toLocaleString('en-IN')} required for this coupon`;
    } else {
      if (input.couponDiscountPercentage) {
        discount = (subtotal * input.couponDiscountPercentage) / 100;
        if (input.couponMaxDiscount && discount > input.couponMaxDiscount) {
          discount = input.couponMaxDiscount;
        }
      } else if (input.couponDiscountFixed) {
        discount = Math.min(subtotal, input.couponDiscountFixed);
      }
      discount = Math.round(discount * 100) / 100;
      couponApplied = discount > 0;
    }
  }

  const freeShippingThreshold = input.freeShippingThreshold ?? 999;
  const standardShipping = input.standardShippingFee ?? 99;
  const shipping = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : standardShipping;

  const taxableAmount = Math.max(0, subtotal - discount);
  const taxRate = input.taxRate ?? 0.05; // 5% GST
  const tax = Math.round(taxableAmount * taxRate * 100) / 100;

  const total = Math.round((taxableAmount + shipping + tax) * 100) / 100;

  return {
    subtotal,
    discount,
    shipping,
    tax,
    total,
    couponApplied,
    couponError,
  };
}

export type OrderStatus =
  | 'placed'
  | 'confirmed'
  | 'processing'
  | 'packed'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export const ORDER_STATUS_SEQUENCE: OrderStatus[] = [
  'placed',
  'confirmed',
  'processing',
  'packed',
  'shipped',
  'out_for_delivery',
  'delivered',
];

/**
 * Validates whether an order status transition is permitted.
 */
export function isValidStatusTransition(current: OrderStatus, next: OrderStatus): boolean {
  if (current === next) return true;
  if (current === 'delivered' || current === 'cancelled' || current === 'refunded') {
    if ((current === 'delivered' || current === 'cancelled') && next === 'refunded') return true;
    return false; // Terminal states
  }
  if (next === 'cancelled') {
    // Can cancel before shipped
    return current === 'placed' || current === 'confirmed' || current === 'processing';
  }

  const currentIndex = ORDER_STATUS_SEQUENCE.indexOf(current);
  const nextIndex = ORDER_STATUS_SEQUENCE.indexOf(next);
  if (currentIndex === -1 || nextIndex === -1) return false;

  // Can move forward along the fulfillment path
  return nextIndex > currentIndex;
}

/**
 * Checks variant combination inventory availability.
 */
export function checkVariantStock(
  variantStock: number,
  sizeStock?: Record<string, number>,
  selectedSize?: string,
  requestedQuantity: number = 1
): { isAvailable: boolean; remaining: number; message?: string } {
  if (requestedQuantity <= 0) {
    return { isAvailable: false, remaining: 0, message: 'Invalid quantity requested' };
  }

  let effectiveStock = variantStock;
  if (selectedSize && sizeStock && sizeStock[selectedSize] !== undefined) {
    effectiveStock = sizeStock[selectedSize];
  }

  if (effectiveStock <= 0) {
    return { isAvailable: false, remaining: 0, message: 'Out of stock' };
  }

  if (requestedQuantity > effectiveStock) {
    return {
      isAvailable: false,
      remaining: effectiveStock,
      message: `Only ${effectiveStock} item(s) available in this size/color`,
    };
  }

  return { isAvailable: true, remaining: effectiveStock };
}

/**
 * Checks role-based permissions for admin operations.
 */
export type AdminRole =
  | 'super_admin'
  | 'product_manager'
  | 'order_manager'
  | 'inventory_manager'
  | 'customer_support'
  | 'marketing_manager';

export type AdminModule =
  | 'dashboard'
  | 'products'
  | 'categories'
  | 'homepage_builder'
  | 'orders'
  | 'inventory'
  | 'coupons_marketing'
  | 'customers'
  | 'reviews'
  | 'support'
  | 'settings'
  | 'admin_users'
  | 'audit_logs'
  | 'notifications'
  | 'flutter_export';

export function hasAdminPermission(role: AdminRole, module: AdminModule): boolean {
  if (role === 'super_admin') return true;

  switch (role) {
    case 'product_manager':
      return ['dashboard', 'products', 'categories', 'inventory', 'reviews', 'notifications', 'flutter_export'].includes(module);
    case 'order_manager':
      return ['dashboard', 'orders', 'inventory', 'customers', 'support', 'notifications', 'flutter_export'].includes(module);
    case 'inventory_manager':
      return ['dashboard', 'inventory', 'products', 'orders', 'notifications', 'flutter_export'].includes(module);
    case 'customer_support':
      return ['dashboard', 'orders', 'customers', 'reviews', 'support', 'notifications', 'flutter_export'].includes(module);
    case 'marketing_manager':
      return ['dashboard', 'homepage_builder', 'coupons_marketing', 'products', 'reviews', 'notifications', 'flutter_export'].includes(module);
    default:
      return false;
  }
}
