import { AdminRole, OrderStatus } from '../lib/commerceLogic';

export type { AdminRole, OrderStatus };

export type SpecificationInputType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'boolean'
  | 'select'
  | 'multiselect'
  | 'multi-select'
  | 'dimensions'
  | 'date'
  | 'image';

export interface ProductSpecificationField {
  id?: string;
  key: string;
  fieldKey?: string;
  label: string;
  value?: string | number | boolean | string[];
  unit?: string;
  type?: SpecificationInputType;
  inputType?: SpecificationInputType;
  options?: string[];
  required?: boolean;
  visibleToCustomers?: boolean;
  isVisibleOnStorefront?: boolean;
  categoryScope?: 'all' | string;
  description?: string;
  placeholder?: string;
  displayOrder?: number;
  isCustom?: boolean;
  section?: string;
}

export type StructuredSpecification = ProductSpecificationField;

export type VariantOptionType =
  | 'clothing_size'
  | 'clothing_sizes'
  | 'age_size'
  | 'age_sizes'
  | 'shoe_size'
  | 'shoe_sizes'
  | 'volume_ml'
  | 'custom'
  | 'custom_sizes'
  | 'none';

export interface CategorySpecificationTemplate {
  id: string;
  name?: string;
  categoryId?: string; // mainCategoryId or subCategoryId or 'default'
  categoryName?: string;
  applicableCategoryIds?: string[];
  defaultVariantType?: VariantOptionType;
  defaultSizes?: string[];
  fields: ProductSpecificationField[];
  isDefault?: boolean;
  updatedAt?: string;
}

export interface VariantStockCombination {
  id: string;
  colorId: string;
  colorName: string;
  colorCode: string;
  size: string;
  sku: string;
  stockQuantity: number;
  reservedQuantity?: number;
  isActive: boolean;
  price?: number;
  salePrice?: number;
}

export interface ProductVariant {
  id: string;
  colorName: string;
  colorCode: string;
  images: string[];
  sku: string;
  price: number;
  salePrice?: number;
  stock: number; // Derived sum of active Colour + Size combinations for this colour
  sizeStock?: Record<string, number>;
  sizeSku?: Record<string, string>;
  disabledSizes?: string[];
  reservedStock?: number;
  isActive?: boolean;
  attributes?: Record<string, string>;
  optionPricing?: Record<string, { price: number; salePrice?: number }>;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  description: string;
  mainCategoryId: string;
  subCategoryId: string;
  subSubCategoryId?: string;
  price: number;
  salePrice?: number;
  rating: number;
  reviewCount: number;
  featured: boolean;
  newArrival: boolean;
  bestSeller: boolean;
  trending: boolean;
  tags: string[];
  specifications?: Record<string, string>;
  variants: ProductVariant[];
  variantCombinations?: VariantStockCombination[];
  totalStock?: number; // Derived sum of all active Colour + Size combinations
  sizes: string[];
  status: 'published' | 'draft' | 'hidden' | 'archived';
  shippingEligible: boolean;
  returnEligible: boolean;
  createdAt: string;

  // Variant Option Type
  variantType?: VariantOptionType;

  // Dynamic Structured Specification System
  structuredSpecifications?: ProductSpecificationField[];

  // Detailed Product Specification Fields (Backwards compatible & shortcuts)
  styleName?: string;
  styleNumber?: string;
  style?: string;
  fabric?: string;
  gsm?: string;
  ratio?: string;
  accessories?: string;
  accessoriesIncluded?: string;
  packaging?: string;
  packagingDetails?: string;
  customColors?: string;
  colorsDescription?: string;
  targetAudience?: string;
  countryOfOrigin?: string;
  manufacturer?: string;
  careInstructions?: string;
  sizeChartImage?: string;
  careImage?: string;
  additionalImages?: string[];
}

export type CategoryDisplayMode = 'image' | 'text' | 'initial';

export interface MainCategory {
  id: string;
  name: string;
  slug?: string;
  iconName: string;
  image?: string | null;
  displayMode?: CategoryDisplayMode;
  backgroundColor?: string;
  textColor?: string;
  imageFit?: 'cover' | 'contain';
  imagePosition?: 'center' | 'top' | 'bottom';
  order: number;
  isActive: boolean;
  showOnHomepage?: boolean;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SubCategory {
  id: string;
  mainCategoryId: string;
  name: string;
  image: string;
  order: number;
  isActive: boolean;
}

export interface SubSubCategory {
  id: string;
  subCategoryId: string;
  mainCategoryId: string;
  name: string;
  image: string;
  order: number;
  isActive: boolean;
}

export interface HomepageSlide {
  id: string;
  image: string;
  mobileImage?: string;
  heading: string;
  subheading: string;
  buttonText?: string;
  buttonLink?: string;
  badge?: string;
}

export interface HomepageImage {
  id: string;
  url: string;
  mobileUrl?: string;
  alt?: string;
  title?: string;
  subtitle?: string;
  link?: string;
  buttonText?: string;
  badge?: string;
}

export interface DealProductConfig {
  productId: string;
  dealPrice?: number;
  dealStock?: number;
  customerLimit?: number;
}

export type HomepageSectionStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'expired' | 'ended';

export type HomepageSectionType =
  | 'image_slider' // 1. Hero Banner / Main Slider
  | 'poster_banner' // 2. Promotional Image Banner
  | 'single_image_text' // 3. Single Image with Text
  | 'two_image_promo' // 4. Two-Image Promotional Layout
  | 'three_image_grid' // 5. Three-Image Grid
  | 'category_carousel' // 6. Category Carousel
  | 'featured_collections' // 7. Featured Products
  | 'best_sellers' // 8. Best Sellers
  | 'trending' // 9. Trending Products
  | 'new_arrivals' // 10. New Arrivals
  | 'for_you' // 11. Recommended for You
  | 'flash_sale' // 12. Flash Deals
  | 'limited_time_offers' // 13. Limited-Time Offers
  | 'product_carousel' // 14. Product Carousel
  | 'product_grid' // 15. Product Grid
  | 'main_categories' // 16. Shop by Category (main)
  | 'subcategories' // Shop by Subcategory
  | 'brand_showcase' // 17. Brand Showcase
  | 'promotional_video' // 18. Promotional Video
  | 'custom_html' // 19. Custom HTML/Rich Text Section
  | 'custom_collection' // 20. Custom Product Collection
  | 'custom_card'; // 21. Custom Promotional Section

export interface HomepageSection {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  type: HomepageSectionType;
  order: number;
  isActive: boolean;
  status?: HomepageSectionStatus;

  // Visual & styling
  badge?: string;
  buttonLabel?: string;
  buttonLink?: string;
  bgColor?: string;
  textColor?: string;
  paddingY?: 'compact' | 'normal' | 'relaxed';

  // Banner / Image
  bannerImage?: string;
  mobileBannerImage?: string;
  imagePosition?: 'left' | 'right' | 'top' | 'background';
  imageMode?: 'cover' | 'contain';
  aspectRatio?: '16/9' | '4/3' | '1/1' | '4/5' | '21/9';
  overlayOpacity?: number; // 0 to 100
  textPosition?: 'left' | 'center' | 'right';
  images?: HomepageImage[]; // For multi-image layouts or brand showcase

  // Slides
  slides?: HomepageSlide[];
  sliderAutoplay?: boolean;
  sliderInterval?: number; // in seconds

  // Products & Categories
  productIds?: string[];
  categoryIds?: string[];
  productSelectionMode?: 'manual' | 'best_sellers' | 'new_arrivals' | 'trending' | 'category' | 'featured';
  productLimit?: number;
  productSort?: 'default' | 'price_low_high' | 'price_high_low' | 'rating' | 'discount';
  displayMode?: 'carousel' | 'grid' | 'alternating';
  columns?: number; // 2, 3, 4, 5

  // Flash Deals & Scheduling
  flashSaleEndTime?: string; // ISO string
  flashSaleStartTime?: string; // ISO string
  durationMode?: 'scheduled' | 'immediate' | 'unlimited';
  durationMinutes?: number;
  isUnlimitedDuration?: boolean;
  showCountdown?: boolean;
  dealProducts?: DealProductConfig[];

  // Video & Custom HTML
  videoUrl?: string;
  videoPoster?: string;
  videoAutoplay?: boolean;
  htmlContent?: string;

  // Metadata
  createdAt?: string;
  updatedAt?: string;
  draftChanges?: boolean;
}

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  brand: string;
  variantId: string;
  colorName: string;
  colorCode: string;
  image: string;
  size?: string;
  sku?: string;
  price: number;
  quantity: number;
  maxStock: number;
}

export interface Address {
  id: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: CartItem[];
  amounts: {
    subtotal: number;
    discount: number;
    shipping: number;
    tax: number;
    total: number;
  };
  shippingAddress: Address;
  payment: {
    method: 'gpay' | 'upi' | 'card' | 'netbanking' | 'cod';
    status: 'paid' | 'pending' | 'failed';
    transactionId?: string;
    gpayReceiver?: string;
    gpayAccount?: string;
    upiId?: string;
    paidVia?: string;
    utrNumber?: string;
  };
  status: OrderStatus;
  timeline: Array<{
    status: OrderStatus;
    timestamp: string;
    note?: string;
    updatedBy?: string;
  }>;
  courierTracking?: {
    courier: string;
    trackingNumber: string;
    estimatedDelivery: string;
  };
  notes?: string;
  couponCode?: string;
  stockRestored?: boolean;
  createdAt: string;
}

export interface Coupon {
  code: string;
  description: string;
  discountPercentage?: number;
  discountFixed?: number;
  minOrder: number;
  maxDiscount?: number;
  expiresAt: string;
  isActive: boolean;
}

export interface Review {
  id: string;
  productId: string;
  productName: string;
  customerId: string;
  customerName: string;
  rating: number;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  createdAt: string;
  status: 'approved' | 'pending' | 'rejected';
}

export interface SupportTicket {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  subject: string;
  orderId?: string;
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: string;
  messages: Array<{
    sender: 'customer' | 'admin';
    text: string;
    timestamp: string;
  }>;
}

export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  addresses: Address[];
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  avatar?: string;
  lastActive: string;
  department?: string;
  phone?: string;
  status?: 'active' | 'suspended';
}

export interface AuditLog {
  id: string;
  adminName: string;
  adminEmail: string;
  action: string;
  details: string;
  timestamp: string;
}

export type NotificationType =
  | 'order_placed'
  | 'order_status'
  | 'payment_success'
  | 'payment_failed'
  | 'refund'
  | 'low_stock'
  | 'out_of_stock'
  | 'back_in_stock'
  | 'promotional'
  | 'support_ticket'
  | 'account_security'
  | 'catalogue_update';

export type NotificationRecipientRole = 'customer' | 'admin' | 'all';

export interface AppNotification {
  id: string;
  recipientUserId?: string;
  recipientRole: NotificationRecipientRole;
  type: NotificationType;
  title: string;
  message: string;
  orderId?: string;
  relatedId?: string;
  deepLink?: string;
  isRead: boolean;
  createdAt: string;
  deliveryStatus: 'delivered' | 'sent' | 'pending';
  campaignId?: string;
  senderAdminName?: string;
}

export interface AdminNotificationSettings {
  enableOrderAlerts: boolean;
  enablePaymentAlerts: boolean;
  enableStockAlerts: boolean;
  enableCustomerAlerts?: boolean;
  enableCustomerRegistrationAlerts: boolean;
  enableCatalogueAlerts: boolean;
  enablePromotionalBroadcasts: boolean;
  soundEnabled: boolean;
  browserPushEnabled: boolean;
}

export interface CustomerNotificationPreferences {
  orderUpdates: boolean;
  promotionsAndOffers: boolean;
  backInStockAlerts: boolean;
  accountSecurity: boolean;
  browserPushEnabled: boolean;
}

export interface NotificationBroadcastCampaign {
  id: string;
  title: string;
  message: string;
  audience: 'all' | 'buyers' | 'wishlist';
  deepLink?: string;
  bannerImage?: string;
  scheduledAt?: string;
  sentAt: string;
  sentByAdminName: string;
  targetCount: number;
  deliveredCount: number;
  openCount: number;
  status: 'sent' | 'scheduled' | 'draft';
}

