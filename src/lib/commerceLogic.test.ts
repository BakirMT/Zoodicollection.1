import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateOrderPricing,
  formatINR,
  isValidStatusTransition,
  checkVariantStock,
  hasAdminPermission,
} from './commerceLogic.ts';

test('formatINR formats currency in Indian Rupees with comma grouping', () => {
  assert.equal(formatINR(0), '₹0');
  assert.equal(formatINR(999), '₹999');
  assert.equal(formatINR(2499), '₹2,499');
  assert.equal(formatINR(125000), '₹1,25,000');
});

test('calculateOrderPricing computes subtotal, free shipping (₹0), tax and total correctly in INR', () => {
  // Case 1: Order amount ₹500 has ₹0 shipping under all conditions
  const breakdown1 = calculateOrderPricing({
    subtotal: 500,
  });

  assert.equal(breakdown1.subtotal, 500);
  assert.equal(breakdown1.shipping, 0); // Always 0: Free Delivery for all orders
  assert.equal(breakdown1.discount, 0);
  assert.equal(breakdown1.total, 500.0); // Subtotal - discounts (no added shipping)

  // Case 2: Order with 10% coupon
  const breakdown2 = calculateOrderPricing({
    subtotal: 2000,
    couponDiscountPercentage: 10,
    couponMinOrder: 999,
  });

  assert.equal(breakdown2.subtotal, 2000);
  assert.equal(breakdown2.discount, 200);
  assert.equal(breakdown2.shipping, 0); // Free shipping across India
  assert.equal(breakdown2.total, 1800.0); // 2000 - 200
  assert.equal(breakdown2.couponApplied, true);

  // Case 3: Coupon min order threshold not met (₹500 < ₹999)
  const breakdown3 = calculateOrderPricing({
    subtotal: 500,
    couponDiscountFixed: 100,
    couponMinOrder: 999,
  });
  assert.equal(breakdown3.couponApplied, false);
  assert.equal(breakdown3.shipping, 0);
  assert.equal(breakdown3.total, 500.0);
  assert.match(breakdown3.couponError || '', /Minimum order amount of ₹999/);
});

test('isValidStatusTransition validates sequential order statuses', () => {
  assert.equal(isValidStatusTransition('placed', 'confirmed'), true);
  assert.equal(isValidStatusTransition('confirmed', 'processing'), true);
  assert.equal(isValidStatusTransition('processing', 'shipped'), true);
  assert.equal(isValidStatusTransition('shipped', 'delivered'), true);

  // Cannot jump backwards
  assert.equal(isValidStatusTransition('shipped', 'placed'), false);
  assert.equal(isValidStatusTransition('delivered', 'processing'), false);

  // Can cancel before shipped
  assert.equal(isValidStatusTransition('placed', 'cancelled'), true);
  assert.equal(isValidStatusTransition('processing', 'cancelled'), true);
  assert.equal(isValidStatusTransition('shipped', 'cancelled'), false);

  // Can refund delivered order
  assert.equal(isValidStatusTransition('delivered', 'refunded'), true);
});

test('checkVariantStock checks stock for color and size combinations', () => {
  const sizeStock = { S: 5, M: 0, L: 8 };

  // In-stock size
  const res1 = checkVariantStock(13, sizeStock, 'S', 2);
  assert.equal(res1.isAvailable, true);
  assert.equal(res1.remaining, 5);

  // Out-of-stock size
  const res2 = checkVariantStock(13, sizeStock, 'M', 1);
  assert.equal(res2.isAvailable, false);
  assert.equal(res2.remaining, 0);

  // Exceeds stock
  const res3 = checkVariantStock(13, sizeStock, 'S', 10);
  assert.equal(res3.isAvailable, false);
  assert.match(res3.message || '', /Only 5 unit/);
});

test('hasAdminPermission validates roles and permissions correctly', () => {
  // Super admin has all permissions
  assert.equal(hasAdminPermission('super_admin', 'products'), true);
  assert.equal(hasAdminPermission('super_admin', 'admin_users'), true);
  assert.equal(hasAdminPermission('super_admin', 'settings'), true);

  // Product manager
  assert.equal(hasAdminPermission('product_manager', 'products'), true);
  assert.equal(hasAdminPermission('product_manager', 'admin_users'), false);

  // Customer support
  assert.equal(hasAdminPermission('customer_support', 'support'), true);
  assert.equal(hasAdminPermission('customer_support', 'coupons_marketing'), false);
});
