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
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  Product,
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

    // 1. Seed Products
    for (const prod of INITIAL_PRODUCTS) {
      await setDoc(doc(db, FIRESTORE_COLLECTIONS.PRODUCTS, prod.id), prod);
    }

    // 2. Seed Main Categories
    for (const cat of INITIAL_MAIN_CATEGORIES) {
      await setDoc(doc(db, FIRESTORE_COLLECTIONS.CATEGORIES, cat.id), cat);
    }

    // 3. Seed Subcategories
    for (const sub of INITIAL_SUB_CATEGORIES) {
      await setDoc(doc(db, FIRESTORE_COLLECTIONS.SUB_CATEGORIES, sub.id), sub);
    }

    // 4. Seed Sub-subcategories
    for (const subsub of INITIAL_SUB_SUB_CATEGORIES) {
      await setDoc(doc(db, FIRESTORE_COLLECTIONS.SUB_SUB_CATEGORIES, subsub.id), subsub);
    }

    // 5. Seed Homepage Sections
    for (const sec of INITIAL_HOMEPAGE_SECTIONS) {
      await setDoc(doc(db, FIRESTORE_COLLECTIONS.HOMEPAGE_SECTIONS, sec.id), sec);
    }

    // 6. Seed Coupons
    for (const cpn of INITIAL_COUPONS) {
      await setDoc(doc(db, FIRESTORE_COLLECTIONS.COUPONS, cpn.code), cpn);
    }

    // 7. Seed Initial Demo Orders
    for (const ord of INITIAL_ORDERS) {
      await setDoc(doc(db, FIRESTORE_COLLECTIONS.ORDERS, ord.id), ord);
    }

    // 8. Seed Default Category Specification Templates if empty
    const tmplSnap = await getDocs(query(collection(db, FIRESTORE_COLLECTIONS.CATEGORY_SPEC_TEMPLATES), limit(1)));
    if (tmplSnap.empty) {
      for (const tmpl of DEFAULT_CATEGORY_TEMPLATES) {
        await setDoc(doc(db, FIRESTORE_COLLECTIONS.CATEGORY_SPEC_TEMPLATES, tmpl.id), tmpl);
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
      const prods = snapshot.docs.map((docSnap) => docSnap.data() as Product);
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
      const list = snapshot.docs.map((d) => d.data() as MainCategory);
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
      const list = snapshot.docs.map((d) => d.data() as SubCategory);
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
      const list = snapshot.docs.map((d) => d.data() as SubSubCategory);
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
      const list = snapshot.docs.map((d) => d.data() as HomepageSection);
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
 * Saves a product to Cloud Firestore.
 */
export async function firestoreSaveProduct(product: Product): Promise<void> {
  try {
    await setDoc(doc(db, FIRESTORE_COLLECTIONS.PRODUCTS, product.id), product, { merge: true });
  } catch (error) {
    console.error('[FirestoreSync] Error saving product to Firestore:', error);
    throw error;
  }
}

/**
 * Deletes a product from Cloud Firestore.
 */
export async function firestoreDeleteProduct(productId: string): Promise<void> {
  try {
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
    await setDoc(doc(db, col, item.id), item, { merge: true });
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
      await setDoc(doc(db, FIRESTORE_COLLECTIONS.HOMEPAGE_SECTIONS, sec.id), sec, { merge: true });
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
    await setDoc(doc(db, FIRESTORE_COLLECTIONS.ORDERS, order.id), order, { merge: true });
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
  note?: string
): Promise<void> {
  try {
    const orderRef = doc(db, FIRESTORE_COLLECTIONS.ORDERS, orderId);
    const updates: Record<string, any> = {
      status: newStatus,
    };
    if (courierData) {
      updates.courierTracking = courierData;
    }
    if (note) {
      updates.notes = note;
    }
    await updateDoc(orderRef, updates);
  } catch (error) {
    console.error('[FirestoreSync] Error updating order status in Firestore:', error);
    throw error;
  }
}

/**
 * Saves a coupon to Cloud Firestore.
 */
export async function firestoreSaveCoupon(coupon: Coupon): Promise<void> {
  try {
    await setDoc(doc(db, FIRESTORE_COLLECTIONS.COUPONS, coupon.code), coupon, { merge: true });
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
    await setDoc(doc(db, FIRESTORE_COLLECTIONS.CATEGORY_SPEC_TEMPLATES, template.id), template, { merge: true });
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
