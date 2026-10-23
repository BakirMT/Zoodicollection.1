import { Coupon, HomepageSection } from '../types';

const DB_NAME = 'ZoodiAppDB';
const DB_VERSION = 2;

export function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('coupons')) {
        db.createObjectStore('coupons', { keyPath: 'code' });
      }
      if (!db.objectStoreNames.contains('homepage_sections')) {
        db.createObjectStore('homepage_sections', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('homepage_draft')) {
        db.createObjectStore('homepage_draft', { keyPath: 'id' });
      }
    };
  });
}

// ================= COUPONS =================
export async function dbSaveCoupons(coupons: Coupon[]): Promise<void> {
  try {
    const db = await openDatabase();
    const tx = db.transaction('coupons', 'readwrite');
    const store = tx.objectStore('coupons');

    await new Promise<void>((resolve, reject) => {
      const clearReq = store.clear();
      clearReq.onerror = () => reject(clearReq.error);
      clearReq.onsuccess = () => {
        if (coupons.length === 0) {
          resolve();
          return;
        }
        let completed = 0;
        for (const c of coupons) {
          const req = store.put(c);
          req.onerror = () => reject(req.error);
          req.onsuccess = () => {
            completed++;
            if (completed === coupons.length) {
              resolve();
            }
          };
        }
      };
    });
  } catch (err) {
    console.warn('[Database] Failed to persist coupons to IndexedDB:', err);
  }
}

export async function dbLoadCoupons(): Promise<Coupon[]> {
  try {
    const db = await openDatabase();
    const tx = db.transaction('coupons', 'readonly');
    const store = tx.objectStore('coupons');
    return new Promise<Coupon[]>((resolve, reject) => {
      const req = store.getAll();
      req.onerror = () => reject(req.error);
      req.onsuccess = () => {
        const results = req.result as Coupon[];
        resolve(results && results.length > 0 ? results : []);
      };
    });
  } catch (err) {
    console.warn('[Database] Failed to load coupons from IndexedDB:', err);
    return [];
  }
}

// ================= HOMEPAGE SECTIONS (PUBLISHED) =================
export async function dbSaveHomepageSections(sections: HomepageSection[]): Promise<boolean> {
  try {
    // 1. Dual-layer localStorage write
    try {
      localStorage.setItem('zoodi_homepage_sections', JSON.stringify(sections));
    } catch {
      // ignore quota error
    }

    // 2. IndexedDB transaction
    const db = await openDatabase();
    const tx = db.transaction('homepage_sections', 'readwrite');
    const store = tx.objectStore('homepage_sections');

    await new Promise<void>((resolve, reject) => {
      const clearReq = store.clear();
      clearReq.onerror = () => reject(clearReq.error);
      clearReq.onsuccess = () => {
        if (sections.length === 0) {
          resolve();
          return;
        }
        let completed = 0;
        for (const sec of sections) {
          const req = store.put(sec);
          req.onerror = () => reject(req.error);
          req.onsuccess = () => {
            completed++;
            if (completed === sections.length) {
              resolve();
            }
          };
        }
      };
    });
    return true;
  } catch (err) {
    console.warn('[Database] Failed to persist homepage sections to IndexedDB:', err);
    return false;
  }
}

export async function dbLoadHomepageSections(): Promise<HomepageSection[]> {
  try {
    const db = await openDatabase();
    const tx = db.transaction('homepage_sections', 'readonly');
    const store = tx.objectStore('homepage_sections');
    return new Promise<HomepageSection[]>((resolve) => {
      const req = store.getAll();
      req.onerror = () => {
        const local = localStorage.getItem('zoodi_homepage_sections');
        resolve(local ? JSON.parse(local) : []);
      };
      req.onsuccess = () => {
        const results = req.result as HomepageSection[];
        if (results && results.length > 0) {
          resolve(results.sort((a, b) => a.order - b.order));
        } else {
          const local = localStorage.getItem('zoodi_homepage_sections');
          resolve(local ? JSON.parse(local) : []);
        }
      };
    });
  } catch {
    const local = localStorage.getItem('zoodi_homepage_sections');
    return local ? JSON.parse(local) : [];
  }
}

// ================= HOMEPAGE SECTIONS (DRAFTS) =================
export async function dbSaveHomepageDraft(sections: HomepageSection[]): Promise<boolean> {
  try {
    try {
      localStorage.setItem('zoodi_homepage_draft', JSON.stringify(sections));
    } catch {
      // ignore
    }

    const db = await openDatabase();
    const tx = db.transaction('homepage_draft', 'readwrite');
    const store = tx.objectStore('homepage_draft');

    await new Promise<void>((resolve, reject) => {
      const clearReq = store.clear();
      clearReq.onerror = () => reject(clearReq.error);
      clearReq.onsuccess = () => {
        if (sections.length === 0) {
          resolve();
          return;
        }
        let completed = 0;
        for (const sec of sections) {
          const req = store.put(sec);
          req.onerror = () => reject(req.error);
          req.onsuccess = () => {
            completed++;
            if (completed === sections.length) {
              resolve();
            }
          };
        }
      };
    });
    return true;
  } catch (err) {
    console.warn('[Database] Failed to persist draft to IndexedDB:', err);
    return false;
  }
}

export async function dbLoadHomepageDraft(): Promise<HomepageSection[] | null> {
  try {
    const db = await openDatabase();
    const tx = db.transaction('homepage_draft', 'readonly');
    const store = tx.objectStore('homepage_draft');
    return new Promise<HomepageSection[] | null>((resolve) => {
      const req = store.getAll();
      req.onerror = () => {
        const local = localStorage.getItem('zoodi_homepage_draft');
        resolve(local ? JSON.parse(local) : null);
      };
      req.onsuccess = () => {
        const results = req.result as HomepageSection[];
        if (results && results.length > 0) {
          resolve(results.sort((a, b) => a.order - b.order));
        } else {
          const local = localStorage.getItem('zoodi_homepage_draft');
          resolve(local ? JSON.parse(local) : null);
        }
      };
    });
  } catch {
    const local = localStorage.getItem('zoodi_homepage_draft');
    return local ? JSON.parse(local) : null;
  }
}
