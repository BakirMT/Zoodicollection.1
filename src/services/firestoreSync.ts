import {
  collection,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  getDocs,
  writeBatch,
  runTransaction,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  Product,
  ProductVariant,
  VariantStockCombination,
  CartItem,
  MainCategory,
  SubCategory,
  SubSubCategory,
  HomepageSection,
  Coupon,
  Order,
  OrderStatus,
  Review,
  SupportTicket,
  CategorySpecificationTemplate,
} from '../types';
import { formatCombinationSku, checkVariantStock } from '../lib/commerceLogic';
import {
  INITIAL_PRODUCTS,
  INITIAL_MAIN_CATEGORIES,
  INITIAL_SUB_CATEGORIES,
  INITIAL_SUB_SUB_CATEGORIES,
  INITIAL_HOMEPAGE_SECTIONS,
  INITIAL_COUPONS,
  INITIAL_ORDERS,
} from '../data/seedData';
import { DEFAULT_CATEGORY_TEMPLATES } from '../data/categoryTemplates';

// Firestore collection names
export const FIRESTORE_COLLECTIONS = {
  METADATA: '_system_metadata',
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  SUB_CATEGORIES: 'sub_categories',
  SUB_SUB_CATEGORIES: 'sub_sub_categories',
  HOMEPAGE_SECTIONS: 'homepage_sections',
  COUPONS: 'coupons',
  ORDERS: 'orders',
  REVIEWS: 'reviews',
  SUPPORT_TICKETS: 'support_tickets',
  CATEGORY_SPEC_TEMPLATES: 'category_spec_templates',
};

const DELETED_PRODUCTS_STORAGE_KEY = 'zoodi_deleted_product_ids';

export function getDeletedProductIds(): Set<string> {
  try {
    const raw = localStorage.getItem(DELETED_PRODUCTS_STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? new Set(parsed) : new Set();
  } catch {
    return new Set();
  }
}

export function markProductIdDeleted(productId: string): void {
  try {
    const set = getDeletedProductIds();
    set.add(productId);
    localStorage.setItem(DELETED_PRODUCTS_STORAGE_KEY, JSON.stringify(Array.from(set)));
  } catch {
    // ignore storage errors
  }
}

export function unmarkProductIdDeleted(productId: string): void {
  try {
    const set = getDeletedProductIds();
    if (set.has(productId)) {
      set.delete(productId);
      localStorage.setItem(DELETED_PRODUCTS_STORAGE_KEY, JSON.stringify(Array.from(set)));
    }
  } catch {
    // ignore storage errors
  }
}

/**
 * Recursively strips `undefined` and `NaN` values from any payload before sending to Cloud Firestore.
 * Prevents FirebaseError: Function setDoc() called with invalid data (Unsupported field value: undefined).
 */
export function sanitizeForFirestore<T>(value: T): T {
  if (value === null || value === undefined) {
    return value;
  }
  if (typeof value === 'number') {
    return (Number.isNaN(value) ? 0 : value) as unknown as T;
  }
  if (Array.isArray(value)) {
    return value
      .filter((item) => item !== undefined)
      .map((item) => sanitizeForFirestore(item)) as unknown as T;
  }
  if (typeof value === 'object' && !(value instanceof Date)) {
    const result: Record<string, any> = {};
    for (const [key, val] of Object.entries(value as Record<string, any>)) {
      if (val !== undefined) {
        if (typeof val === 'number' && Number.isNaN(val)) {
          continue;
        }
        result[key] = sanitizeForFirestore(val);
      }
    }
    return result as T;
  }
  return value;
}

/**
 * Normalizes a raw Firestore document into a clean, consistent Product record
 * where Colour + Size combination inventory is the single source of truth
 * and aggregate variant/product stock totals are derived automatically.
 */
export function normalizeProductFromFirestore(raw: any, docId?: string): Product {
  const id = String(raw?.id || docId || `prod_${Date.now()}`);
  const price =
    typeof raw?.price === 'number' && !Number.isNaN(raw.price)
      ? raw.price
      : Number(raw?.price) || 0;
  const rawSalePrice =
    typeof raw?.salePrice === 'number' && !Number.isNaN(raw.salePrice)
      ? raw.salePrice
      : Number(raw?.salePrice);
  const salePrice =
    !Number.isNaN(rawSalePrice) && rawSalePrice > 0 && rawSalePrice < price
      ? rawSalePrice
      : undefined;

  const primaryImages: string[] = Array.isArray(raw?.additionalImages)
    ? raw.additionalImages.filter((img: any) => typeof img === 'string' && img.trim() !== '')
    : [];

  const sizes: string[] = Array.isArray(raw?.sizes)
    ? raw.sizes.map((s: any) => String(s || '').trim()).filter(Boolean)
    : [];
  const variantType =
    raw?.variantType || (sizes.length > 0 ? 'clothing_sizes' : 'none');
  const effectiveSizes =
    variantType !== 'none' && sizes.length > 0 ? sizes : ['Single Unit'];

  const savedCombList: VariantStockCombination[] = Array.isArray(raw?.variantCombinations)
    ? raw.variantCombinations
    : [];

  const rawVariants = Array.isArray(raw?.variants) && raw.variants.length > 0
    ? raw.variants
    : [
        {
          id: `${id}_var_0`,
          colorName: '',
          colorCode: '#192E4D',
          images: primaryImages,
          sku: `ZD-${id.slice(-4).toUpperCase()}`,
          price,
          salePrice,
          stock: 0,
          attributes: { isUnconfiguredDefault: 'true' },
        },
      ];

  const allCombinations: VariantStockCombination[] = [];

  const variants: ProductVariant[] = rawVariants.map((v: any, idx: number) => {
    const vId = String(v?.id || `${id}_var_${idx}`);
    const vColorName = typeof v?.colorName === 'string' ? v.colorName.trim() : '';
    const vColorCode =
      typeof v?.colorCode === 'string' && v.colorCode ? v.colorCode : '#192E4D';
    const vBaseSku =
      typeof v?.sku === 'string' && v.sku.trim()
        ? v.sku.trim()
        : `ZD-${id.slice(-4).toUpperCase()}`;
    const vPrice =
      typeof v?.price === 'number' && !Number.isNaN(v.price) && v.price > 0
        ? v.price
        : price;
    const rawVSale =
      typeof v?.salePrice === 'number' && !Number.isNaN(v.salePrice)
        ? v.salePrice
        : Number(v?.salePrice);
    const vSalePrice =
      !Number.isNaN(rawVSale) && rawVSale > 0 && rawVSale < vPrice
        ? rawVSale
        : salePrice && salePrice < vPrice
        ? salePrice
        : undefined;
    const legacyStock =
      typeof v?.stock === 'number' && !Number.isNaN(v.stock)
        ? Math.max(0, Math.floor(v.stock))
        : Number(v?.stock) >= 0
        ? Math.max(0, Math.floor(Number(v.stock)))
        : 0;
    const vImages = Array.isArray(v?.images)
      ? v.images.filter((img: any) => typeof img === 'string' && img.trim() !== '')
      : [];

    const existingSizeStock: Record<string, number> =
      v?.sizeStock && typeof v.sizeStock === 'object' ? v.sizeStock : {};
    const existingSizeSku: Record<string, string> =
      v?.sizeSku && typeof v.sizeSku === 'object' ? v.sizeSku : {};
    const existingDisabledSizes: Set<string> = new Set(
      Array.isArray(v?.disabledSizes) ? v.disabledSizes.map(String) : []
    );

    const normalizedSizeStock: Record<string, number> = {};
    const normalizedSizeSku: Record<string, string> = {};
    const normalizedDisabledSizes: string[] = [];

    // Migrate or preserve stock per size for this colour variant
    const hasAnySavedSizeStock = Object.keys(existingSizeStock).length > 0;
    const defaultPerSize =
      !hasAnySavedSizeStock && effectiveSizes.length > 0
        ? Math.floor(legacyStock / effectiveSizes.length)
        : 0;
    const remainder =
      !hasAnySavedSizeStock && effectiveSizes.length > 0
        ? legacyStock % effectiveSizes.length
        : 0;

    let derivedVariantStock = 0;

    effectiveSizes.forEach((sz, sIdx) => {
      const savedComb = savedCombList.find(
        (c) =>
          (c.colorId === vId ||
            (vColorName && c.colorName?.toLowerCase() === vColorName.toLowerCase())) &&
          c.size === sz
      );

      const isCombActive =
        savedComb !== undefined
          ? savedComb.isActive !== false
          : !existingDisabledSizes.has(sz) && v?.isActive !== false;

      let qty = 0;
      if (savedComb !== undefined && typeof savedComb.stockQuantity === 'number') {
        qty = Math.max(0, Math.floor(savedComb.stockQuantity));
      } else if (existingSizeStock[sz] !== undefined) {
        qty = Math.max(0, Math.floor(Number(existingSizeStock[sz]) || 0));
      } else if (
        sz === 'Single Unit' &&
        existingSizeStock['One Size'] !== undefined
      ) {
        qty = Math.max(0, Math.floor(Number(existingSizeStock['One Size']) || 0));
      } else if (!hasAnySavedSizeStock) {
        qty = defaultPerSize + (sIdx === 0 ? remainder : 0);
      }

      const combSku =
        (savedComb?.sku && savedComb.sku.trim()) ||
        (existingSizeSku[sz] && existingSizeSku[sz].trim()) ||
        formatCombinationSku(vBaseSku, vColorName, sz);

      normalizedSizeStock[sz] = isCombActive ? qty : 0;
      normalizedSizeSku[sz] = combSku;
      if (!isCombActive) {
        normalizedDisabledSizes.push(sz);
      } else {
        derivedVariantStock += qty;
      }

      allCombinations.push({
        id: savedComb?.id || `${id}_${vId}_${sz.replace(/\s+/g, '_')}`,
        colorId: vId,
        colorName: vColorName || 'Standard',
        colorCode: vColorCode,
        size: sz,
        sku: combSku,
        stockQuantity: qty,
        reservedQuantity: savedComb?.reservedQuantity || 0,
        isActive: isCombActive,
        price: vPrice,
        salePrice: vSalePrice,
      });
    });

    return {
      ...v,
      id: vId,
      colorName: vColorName,
      colorCode: vColorCode,
      images: vImages,
      sku: vBaseSku,
      price: vPrice,
      salePrice: vSalePrice,
      stock: derivedVariantStock, // Strictly derived from Colour + Size combinations
      sizeStock: normalizedSizeStock,
      sizeSku: normalizedSizeSku,
      disabledSizes: normalizedDisabledSizes.length > 0 ? normalizedDisabledSizes : undefined,
      isActive: v?.isActive !== false,
    };
  });

  const totalDerivedStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);

  return {
    ...raw,
    id,
    name: String(raw?.name || '').trim(),
    brand: String(raw?.brand || '').trim(),
    description: String(raw?.description || ''),
    mainCategoryId: String(raw?.mainCategoryId || ''),
    subCategoryId: String(raw?.subCategoryId || ''),
    subSubCategoryId: raw?.subSubCategoryId ? String(raw.subSubCategoryId) : undefined,
    price,
    salePrice,
    rating: typeof raw?.rating === 'number' && !Number.isNaN(raw.rating) ? raw.rating : 5.0,
    reviewCount: typeof raw?.reviewCount === 'number' && !Number.isNaN(raw.reviewCount) ? raw.reviewCount : 0,
    featured: Boolean(raw?.featured),
    trending: Boolean(raw?.trending),
    newArrival: Boolean(raw?.newArrival),
    bestSeller: Boolean(raw?.bestSeller),
    tags: Array.isArray(raw?.tags) ? raw.tags : [],
    specifications: raw?.specifications && typeof raw.specifications === 'object' ? raw.specifications : {},
    sizes,
    variantType,
    status: raw?.status === 'draft' ? 'draft' : 'published',
    shippingEligible: raw?.shippingEligible !== false,
    returnEligible: raw?.returnEligible !== false,
    createdAt: raw?.createdAt || new Date().toISOString(),
    variants,
    variantCombinations: allCombinations,
    totalStock: totalDerivedStock,
    structuredSpecifications: Array.isArray(raw?.structuredSpecifications)
      ? raw.structuredSpecifications
      : [],
  };
}

/**
 * Determines whether a product is active/published and visible to customers in the storefront.
 * Draft, hidden, archived, or deleted products are hidden from customer views.
 */
export function isProductVisibleToCustomer(product?: Product | null): boolean {
  if (!product || !product.id || !product.name) return false;
  if (getDeletedProductIds().has(product.id)) return false;
  const statusStr = String(product.status || 'published').toLowerCase();
  if (statusStr === 'draft' || statusStr === 'hidden' || statusStr === 'archived' || statusStr === 'inactive') {
    return false;
  }
  if ((product as any).isActive === false || (product as any).isPublished === false) {
    return false;
  }
  return true;
}

/**
 * Computes the effective unit selling price and original retail price for a product/variant/option.
 */
export function getEffectiveProductPricing(
  product: Product,
  variant?: Product['variants'][0],
  selectedOption?: string
): { currentPrice: number; originalPrice: number; hasDiscount: boolean; discountPercent: number } {
  const targetVariant = variant || product.variants?.[0];
  const optionEntry =
    selectedOption && targetVariant?.optionPricing
      ? targetVariant.optionPricing[selectedOption]
      : undefined;

  const originalPrice =
    optionEntry?.price && optionEntry.price > 0
      ? optionEntry.price
      : product.price && product.price > 0
      ? product.price
      : targetVariant?.price && targetVariant.price > 0
      ? targetVariant.price
      : 0;

  let currentPrice = originalPrice;
  if (optionEntry?.salePrice && optionEntry.salePrice > 0 && optionEntry.salePrice < originalPrice) {
    currentPrice = optionEntry.salePrice;
  } else if (product.salePrice && product.salePrice > 0 && product.salePrice < originalPrice) {
    currentPrice = product.salePrice;
  } else if (
    !product.salePrice &&
    targetVariant?.salePrice &&
    targetVariant.salePrice > 0 &&
    targetVariant.salePrice < originalPrice
  ) {
    currentPrice = targetVariant.salePrice;
  }

  const hasDiscount = currentPrice > 0 && currentPrice < originalPrice;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0;

  return { currentPrice, originalPrice, hasDiscount, discountPercent };
}

/**
 * Seeds initial catalog and store records to Cloud Firestore ONLY ONCE.
 * Once initialized, records an 'initial_seed' flag so user deletions are never overwritten.
 */
export async function seedFirestoreIfEmpty(): Promise<void> {
  try {
    const metaRef = doc(db, FIRESTORE_COLLECTIONS.METADATA, 'initial_seed');
    const metaSnap = await getDoc(metaRef).catch(() => null);
    if (metaSnap && metaSnap.exists()) {
      // Store has already completed initial seeding. Never re-seed even if collections are emptied!
      return;
    }

    const productsSnap = await getDocs(query(collection(db, FIRESTORE_COLLECTIONS.PRODUCTS), limit(1)));
    if (!productsSnap.empty) {
      // Database already contains records; mark as seeded
      await setDoc(metaRef, { seeded: true, timestamp: new Date().toISOString() });
      return;
    }

    console.info('[FirestoreSync] Seeding initial ZOODI catalog to Cloud Firestore...');
    const deletedSet = getDeletedProductIds();

    // 1. Seed Products (skipping any explicitly deleted IDs)
    for (const prod of INITIAL_PRODUCTS) {
      if (!deletedSet.has(prod.id)) {
        await setDoc(doc(db, FIRESTORE_COLLECTIONS.PRODUCTS, prod.id), sanitizeForFirestore(prod));
      }
    }

    // 2. Seed Main Categories
    for (const cat of INITIAL_MAIN_CATEGORIES) {
      await setDoc(doc(db, FIRESTORE_COLLECTIONS.CATEGORIES, cat.id), sanitizeForFirestore(cat));
    }

    // 3. Seed Subcategories
    for (const sub of INITIAL_SUB_CATEGORIES) {
      await setDoc(doc(db, FIRESTORE_COLLECTIONS.SUB_CATEGORIES, sub.id), sanitizeForFirestore(sub));
    }

    // 4. Seed Sub-subcategories
    for (const subsub of INITIAL_SUB_SUB_CATEGORIES) {
      await setDoc(doc(db, FIRESTORE_COLLECTIONS.SUB_SUB_CATEGORIES, subsub.id), sanitizeForFirestore(subsub));
    }

    // 5. Seed Homepage Sections
    for (const sec of INITIAL_HOMEPAGE_SECTIONS) {
      await setDoc(doc(db, FIRESTORE_COLLECTIONS.HOMEPAGE_SECTIONS, sec.id), sanitizeForFirestore(sec));
    }

    // 6. Seed Coupons
    for (const cpn of INITIAL_COUPONS) {
      await setDoc(doc(db, FIRESTORE_COLLECTIONS.COUPONS, cpn.code), sanitizeForFirestore(cpn));
    }

    // 7. Seed Initial Demo Orders
    for (const ord of INITIAL_ORDERS) {
      await setDoc(doc(db, FIRESTORE_COLLECTIONS.ORDERS, ord.id), sanitizeForFirestore(ord));
    }

    // 8. Seed Default Category Specification Templates if empty
    const tmplSnap = await getDocs(query(collection(db, FIRESTORE_COLLECTIONS.CATEGORY_SPEC_TEMPLATES), limit(1)));
    if (tmplSnap.empty) {
      for (const tmpl of DEFAULT_CATEGORY_TEMPLATES) {
        await setDoc(doc(db, FIRESTORE_COLLECTIONS.CATEGORY_SPEC_TEMPLATES, tmpl.id), sanitizeForFirestore(tmpl));
      }
    }

    // 9. Record initialization flag to prevent future re-seeding
    await setDoc(metaRef, { seeded: true, timestamp: new Date().toISOString() });

    console.info('[FirestoreSync] Successfully seeded initial ZOODI catalog to Cloud Firestore.');
  } catch (error) {
    console.warn('[FirestoreSync] Notice during database seed check:', error);
  }
}

// ================= REAL-TIME FIRESTORE LISTENERS =================

/**
 * Listens in real time to the 'products' collection.
 * Any product added, edited, or deleted in the admin dashboard immediately updates all clients.
 */
export function subscribeToProducts(callback: (products: Product[]) => void): () => void {
  const colRef = collection(db, FIRESTORE_COLLECTIONS.PRODUCTS);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const deletedIds = getDeletedProductIds();
      const prods = snapshot.docs
        .map((docSnap) => normalizeProductFromFirestore(docSnap.data(), docSnap.id))
        .filter((p) => !deletedIds.has(p.id));

      // Sort newest / most recently created or updated products first
      prods.sort((a, b) => {
        const timeA = new Date((a as any).updatedAt || a.createdAt || 0).getTime();
        const timeB = new Date((b as any).updatedAt || b.createdAt || 0).getTime();
        return timeB - timeA;
      });

      callback(prods);
    },
    (err) => {
      console.warn('[FirestoreSync] products onSnapshot error:', err);
    }
  );
}

/**
 * Listens in real time to main categories
 */
export function subscribeToMainCategories(callback: (categories: MainCategory[]) => void): () => void {
  const colRef = collection(db, FIRESTORE_COLLECTIONS.CATEGORIES);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const list = snapshot.docs.map((d) => ({ ...(d.data() as MainCategory), id: d.id }));
      list.sort((a, b) => a.order - b.order);
      callback(list);
    },
    (err) => {
      console.warn('[FirestoreSync] categories onSnapshot error:', err);
    }
  );
}

/**
 * Listens in real time to subcategories
 */
export function subscribeToSubCategories(callback: (subs: SubCategory[]) => void): () => void {
  const colRef = collection(db, FIRESTORE_COLLECTIONS.SUB_CATEGORIES);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const list = snapshot.docs.map((d) => ({ ...(d.data() as SubCategory), id: d.id }));
      list.sort((a, b) => a.order - b.order);
      callback(list);
    },
    (err) => {
      console.warn('[FirestoreSync] sub_categories onSnapshot error:', err);
    }
  );
}

/**
 * Listens in real time to sub-subcategories
 */
export function subscribeToSubSubCategories(callback: (subsubs: SubSubCategory[]) => void): () => void {
  const colRef = collection(db, FIRESTORE_COLLECTIONS.SUB_SUB_CATEGORIES);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const list = snapshot.docs.map((d) => ({ ...(d.data() as SubSubCategory), id: d.id }));
      list.sort((a, b) => a.order - b.order);
      callback(list);
    },
    (err) => {
      console.warn('[FirestoreSync] sub_sub_categories onSnapshot error:', err);
    }
  );
}

/**
 * Listens in real time to homepage sections
 */
export function subscribeToHomepageSections(callback: (sections: HomepageSection[]) => void): () => void {
  const colRef = collection(db, FIRESTORE_COLLECTIONS.HOMEPAGE_SECTIONS);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const list = snapshot.docs.map((d) => ({ ...(d.data() as HomepageSection), id: d.id }));
      list.sort((a, b) => a.order - b.order);
      callback(list);
    },
    (err) => {
      console.warn('[FirestoreSync] homepage_sections onSnapshot error:', err);
    }
  );
}

/**
 * Listens in real time to coupons
 */
export function subscribeToCoupons(callback: (coupons: Coupon[]) => void): () => void {
  const colRef = collection(db, FIRESTORE_COLLECTIONS.COUPONS);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const list = snapshot.docs.map((d) => d.data() as Coupon);
      callback(list);
    },
    (err) => {
      console.warn('[FirestoreSync] coupons onSnapshot error:', err);
    }
  );
}

/**
 * Listens in real time to orders
 */
export function subscribeToOrders(callback: (orders: Order[]) => void): () => void {
  const colRef = collection(db, FIRESTORE_COLLECTIONS.ORDERS);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const list = snapshot.docs.map((d) => d.data() as Order);
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(list);
    },
    (err) => {
      console.warn('[FirestoreSync] orders onSnapshot error:', err);
    }
  );
}

// ================= FIRESTORE MUTATION WRITERS =================

/**
 * Saves or updates a product in Cloud Firestore.
 * Uses full document replacement (no merge) on sanitized data so removed optional fields
 * (like a cleared salePrice or removed specifications) are properly cleared in Firestore.
 */
export async function firestoreSaveProduct(product: Product): Promise<void> {
  try {
    unmarkProductIdDeleted(product.id);
    const normalized = normalizeProductFromFirestore(
      {
        ...product,
        updatedAt: new Date().toISOString(),
      },
      product.id
    );
    const cleanPayload = sanitizeForFirestore({
      ...normalized,
      updatedAt: new Date().toISOString(),
    });
    await setDoc(doc(db, FIRESTORE_COLLECTIONS.PRODUCTS, product.id), cleanPayload);
  } catch (error) {
    console.error('[FirestoreSync] Error saving product to Firestore:', error);
    throw error;
  }
}

/**
 * Permanently deletes a product from Cloud Firestore and marks its ID as deleted
 * so it can never be resurrected from local caches or seed data.
 */
export async function firestoreDeleteProduct(productId: string): Promise<void> {
  try {
    markProductIdDeleted(productId);
    await deleteDoc(doc(db, FIRESTORE_COLLECTIONS.PRODUCTS, productId));
  } catch (error) {
    console.error('[FirestoreSync] Error deleting product from Firestore:', error);
    throw error;
  }
}

/**
 * Saves a category (main, sub, or subsub) to Cloud Firestore.
 */
export async function firestoreSaveCategory(
  type: 'main' | 'sub' | 'subsub',
  item: any
): Promise<void> {
  try {
    const col =
      type === 'main'
        ? FIRESTORE_COLLECTIONS.CATEGORIES
        : type === 'sub'
        ? FIRESTORE_COLLECTIONS.SUB_CATEGORIES
        : FIRESTORE_COLLECTIONS.SUB_SUB_CATEGORIES;
    await setDoc(doc(db, col, item.id), sanitizeForFirestore(item));
  } catch (error) {
    console.error('[FirestoreSync] Error saving category to Firestore:', error);
    throw error;
  }
}

/**
 * Deletes a category from Cloud Firestore.
 */
export async function firestoreDeleteCategory(
  type: 'main' | 'sub' | 'subsub',
  id: string
): Promise<void> {
  try {
    const col =
      type === 'main'
        ? FIRESTORE_COLLECTIONS.CATEGORIES
        : type === 'sub'
        ? FIRESTORE_COLLECTIONS.SUB_CATEGORIES
        : FIRESTORE_COLLECTIONS.SUB_SUB_CATEGORIES;
    await deleteDoc(doc(db, col, id));
  } catch (error) {
    console.error('[FirestoreSync] Error deleting category from Firestore:', error);
    throw error;
  }
}

/**
 * Saves homepage sections to Cloud Firestore.
 */
export async function firestoreSaveHomepageSections(sections: HomepageSection[]): Promise<void> {
  try {
    for (const sec of sections) {
      await setDoc(doc(db, FIRESTORE_COLLECTIONS.HOMEPAGE_SECTIONS, sec.id), sanitizeForFirestore(sec));
    }
  } catch (error) {
    console.error('[FirestoreSync] Error saving homepage sections to Firestore:', error);
    throw error;
  }
}

/**
 * Deletes a homepage section from Cloud Firestore.
 */
export async function firestoreDeleteHomepageSection(sectionId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, FIRESTORE_COLLECTIONS.HOMEPAGE_SECTIONS, sectionId));
  } catch (error) {
    console.error('[FirestoreSync] Error deleting homepage section from Firestore:', error);
    throw error;
  }
}

/**
 * Saves an order to Cloud Firestore.
 */
export async function firestoreSaveOrder(order: Order): Promise<void> {
  try {
    await setDoc(doc(db, FIRESTORE_COLLECTIONS.ORDERS, order.id), sanitizeForFirestore(order));
  } catch (error) {
    console.error('[FirestoreSync] Error saving order to Firestore:', error);
    throw error;
  }
}

/**
 * Updates order status in Cloud Firestore.
 */
export async function firestoreUpdateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  courierData?: { courier: string; trackingNumber: string; estimatedDelivery: string },
  note?: string,
  stockRestored?: boolean
): Promise<void> {
  try {
    const orderRef = doc(db, FIRESTORE_COLLECTIONS.ORDERS, orderId);
    const updates: Record<string, any> = {
      status: newStatus,
    };
    if (courierData) {
      updates.courierTracking = sanitizeForFirestore(courierData);
    }
    if (note) {
      updates.notes = note;
    }
    if (stockRestored !== undefined) {
      updates.stockRestored = stockRestored;
    }
    await updateDoc(orderRef, sanitizeForFirestore(updates));
  } catch (error) {
    console.error('[FirestoreSync] Error updating order status in Firestore:', error);
    throw error;
  }
}

/**
 * Atomically revalidates and deducts Colour + Size combination stock in Cloud Firestore
 * using a Firestore transaction to prevent concurrent order overselling.
 */
export async function firestoreProcessOrderStockTransaction(
  items: CartItem[],
  fallbackProducts: Product[] = []
): Promise<{ success: boolean; updatedProducts: Product[]; error?: string }> {
  try {
    const updatedProducts: Product[] = [];

    await runTransaction(db, async (transaction) => {
      // Group items by productId
      const itemsByProduct = new Map<string, CartItem[]>();
      for (const item of items) {
        const list = itemsByProduct.get(item.productId) || [];
        list.push(item);
        itemsByProduct.set(item.productId, list);
      }

      // 1. Read all affected product documents first (Firestore transaction rule: all reads before writes)
      const productSnaps = new Map<string, Product>();
      for (const productId of itemsByProduct.keys()) {
        const prodRef = doc(db, FIRESTORE_COLLECTIONS.PRODUCTS, productId);
        const snap = await transaction.get(prodRef);
        if (snap.exists()) {
          productSnaps.set(productId, normalizeProductFromFirestore(snap.data(), snap.id));
        } else {
          const fallback = fallbackProducts.find((p) => p.id === productId);
          if (!fallback) {
            throw new Error(`Product (${productId}) no longer exists in the catalog.`);
          }
          productSnaps.set(productId, normalizeProductFromFirestore(fallback, fallback.id));
        }
      }

      // 2. Validate and deduct each Colour + Size combination
      for (const [productId, prodItems] of itemsByProduct.entries()) {
        const currentProd = productSnaps.get(productId)!;
        if (!isProductVisibleToCustomer(currentProd)) {
          throw new Error(`"${currentProd.name}" is no longer available for purchase.`);
        }

        const nextVariants = currentProd.variants.map((v) => ({
          ...v,
          sizeStock: { ...(v.sizeStock || {}) },
          sizeSku: { ...(v.sizeSku || {}) },
          disabledSizes: v.disabledSizes ? [...v.disabledSizes] : undefined,
        }));

        for (const item of prodItems) {
          const targetVar =
            nextVariants.find((v) => v.id === item.variantId) || nextVariants[0];
          if (!targetVar) {
            throw new Error(`Variant for "${currentProd.name}" is unavailable.`);
          }

          const effectiveSizeKey =
            item.size &&
            item.size !== 'One Size' &&
            item.size !== 'default' &&
            targetVar.sizeStock[item.size] !== undefined
              ? item.size
              : targetVar.sizeStock['Single Unit'] !== undefined
              ? 'Single Unit'
              : item.size && item.size !== 'One Size' && item.size !== 'default'
              ? item.size
              : Object.keys(targetVar.sizeStock)[0] || 'Single Unit';

          const check = checkVariantStock(
            targetVar.stock,
            targetVar.sizeStock,
            effectiveSizeKey,
            item.quantity,
            targetVar.disabledSizes,
            targetVar.isActive !== false
          );

          if (!check.isAvailable) {
            throw new Error(
              `${currentProd.name} (${targetVar.colorName || 'Standard'} / ${effectiveSizeKey}): ${
                check.message || 'Insufficient stock'
              }`
            );
          }

          const currentCombStock =
            targetVar.sizeStock[effectiveSizeKey] !== undefined
              ? targetVar.sizeStock[effectiveSizeKey]
              : targetVar.stock;
          targetVar.sizeStock[effectiveSizeKey] = Math.max(0, currentCombStock - item.quantity);

          // Re-derive variant total stock from active combinations
          const disabledSet = new Set(targetVar.disabledSizes || []);
          targetVar.stock = Object.entries(targetVar.sizeStock).reduce((sum, [sz, qty]) => {
            if (disabledSet.has(sz)) return sum;
            return sum + Math.max(0, Math.floor(Number(qty) || 0));
          }, 0);
        }

        // Normalize and write back updated product inside transaction
        const normalizedUpdated = normalizeProductFromFirestore(
          {
            ...currentProd,
            variants: nextVariants,
            variantCombinations: undefined, // Re-derived cleanly from variants.sizeStock & sizeSku
            updatedAt: new Date().toISOString(),
          },
          currentProd.id
        );

        updatedProducts.push(normalizedUpdated);
        const prodRef = doc(db, FIRESTORE_COLLECTIONS.PRODUCTS, productId);
        transaction.set(
          prodRef,
          sanitizeForFirestore({
            ...normalizedUpdated,
            updatedAt: new Date().toISOString(),
          })
        );
      }
    });

    return { success: true, updatedProducts };
  } catch (err: any) {
    console.warn('[FirestoreSync] Stock transaction error:', err);
    return {
      success: false,
      updatedProducts: [],
      error: err?.message || 'Unable to reserve inventory for this order.',
    };
  }
}

/**
 * Atomically restores Colour + Size combination stock in Cloud Firestore
 * when an order is cancelled or refunded (if not already restored).
 */
export async function firestoreRestoreOrderStockTransaction(
  order: Order,
  fallbackProducts: Product[] = []
): Promise<{ success: boolean; updatedProducts: Product[] }> {
  try {
    if (order.stockRestored) {
      return { success: true, updatedProducts: [] };
    }

    const updatedProducts: Product[] = [];

    await runTransaction(db, async (transaction) => {
      const itemsByProduct = new Map<string, CartItem[]>();
      for (const item of order.items) {
        const list = itemsByProduct.get(item.productId) || [];
        list.push(item);
        itemsByProduct.set(item.productId, list);
      }

      const productSnaps = new Map<string, Product>();
      for (const productId of itemsByProduct.keys()) {
        const prodRef = doc(db, FIRESTORE_COLLECTIONS.PRODUCTS, productId);
        const snap = await transaction.get(prodRef);
        if (snap.exists()) {
          productSnaps.set(productId, normalizeProductFromFirestore(snap.data(), snap.id));
        } else {
          const fallback = fallbackProducts.find((p) => p.id === productId);
          if (fallback) {
            productSnaps.set(productId, normalizeProductFromFirestore(fallback, fallback.id));
          }
        }
      }

      for (const [productId, prodItems] of itemsByProduct.entries()) {
        const currentProd = productSnaps.get(productId);
        if (!currentProd) continue;

        const nextVariants = currentProd.variants.map((v) => ({
          ...v,
          sizeStock: { ...(v.sizeStock || {}) },
          sizeSku: { ...(v.sizeSku || {}) },
          disabledSizes: v.disabledSizes ? [...v.disabledSizes] : undefined,
        }));

        for (const item of prodItems) {
          const targetVar =
            nextVariants.find((v) => v.id === item.variantId) || nextVariants[0];
          if (!targetVar) continue;

          const effectiveSizeKey =
            item.size &&
            item.size !== 'One Size' &&
            item.size !== 'default' &&
            targetVar.sizeStock[item.size] !== undefined
              ? item.size
              : targetVar.sizeStock['Single Unit'] !== undefined
              ? 'Single Unit'
              : item.size && item.size !== 'One Size' && item.size !== 'default'
              ? item.size
              : Object.keys(targetVar.sizeStock)[0] || 'Single Unit';

          const currentCombStock =
            targetVar.sizeStock[effectiveSizeKey] !== undefined
              ? targetVar.sizeStock[effectiveSizeKey]
              : 0;
          targetVar.sizeStock[effectiveSizeKey] = Math.max(0, currentCombStock + item.quantity);

          const disabledSet = new Set(targetVar.disabledSizes || []);
          targetVar.stock = Object.entries(targetVar.sizeStock).reduce((sum, [sz, qty]) => {
            if (disabledSet.has(sz)) return sum;
            return sum + Math.max(0, Math.floor(Number(qty) || 0));
          }, 0);
        }

        const normalizedUpdated = normalizeProductFromFirestore(
          {
            ...currentProd,
            variants: nextVariants,
            variantCombinations: undefined,
            updatedAt: new Date().toISOString(),
          },
          currentProd.id
        );

        updatedProducts.push(normalizedUpdated);
        const prodRef = doc(db, FIRESTORE_COLLECTIONS.PRODUCTS, productId);
        transaction.set(
          prodRef,
          sanitizeForFirestore({
            ...normalizedUpdated,
            updatedAt: new Date().toISOString(),
          })
        );
      }
    });

    return { success: true, updatedProducts };
  } catch (err) {
    console.warn('[FirestoreSync] Error restoring order stock:', err);
    return { success: false, updatedProducts: [] };
  }
}

/**
 * Saves a coupon to Cloud Firestore.
 */
export async function firestoreSaveCoupon(coupon: Coupon): Promise<void> {
  try {
    await setDoc(doc(db, FIRESTORE_COLLECTIONS.COUPONS, coupon.code), sanitizeForFirestore(coupon));
  } catch (error) {
    console.error('[FirestoreSync] Error saving coupon to Firestore:', error);
    throw error;
  }
}

/**
 * Deletes a coupon from Cloud Firestore.
 */
export async function firestoreDeleteCoupon(couponCode: string): Promise<void> {
  try {
    await deleteDoc(doc(db, FIRESTORE_COLLECTIONS.COUPONS, couponCode));
  } catch (error) {
    console.error('[FirestoreSync] Error deleting coupon from Firestore:', error);
    throw error;
  }
}

/**
 * Listens in real time to category specification templates.
 */
export function subscribeToCategoryTemplates(callback: (templates: CategorySpecificationTemplate[]) => void): () => void {
  const colRef = collection(db, FIRESTORE_COLLECTIONS.CATEGORY_SPEC_TEMPLATES);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const templates = snapshot.docs.map((docSnap) => docSnap.data() as CategorySpecificationTemplate);
      callback(templates);
    },
    (err) => {
      console.warn('[FirestoreSync] category_spec_templates onSnapshot error:', err);
    }
  );
}

/**
 * Saves a category specification template to Cloud Firestore.
 */
export async function firestoreSaveCategoryTemplate(template: CategorySpecificationTemplate): Promise<void> {
  try {
    await setDoc(
      doc(db, FIRESTORE_COLLECTIONS.CATEGORY_SPEC_TEMPLATES, template.id),
      sanitizeForFirestore(template)
    );
  } catch (error) {
    console.error('[FirestoreSync] Error saving category specification template to Firestore:', error);
    throw error;
  }
}

/**
 * Deletes a category specification template from Cloud Firestore.
 */
export async function firestoreDeleteCategoryTemplate(templateId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, FIRESTORE_COLLECTIONS.CATEGORY_SPEC_TEMPLATES, templateId));
  } catch (error) {
    console.error('[FirestoreSync] Error deleting category specification template from Firestore:', error);
    throw error;
  }
}
