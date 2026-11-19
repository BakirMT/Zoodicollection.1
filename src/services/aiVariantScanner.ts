import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { AIDesignVariant } from '../types';

export interface DetectedProductItem {
  itemIndex: number;
  label: string;
  mainColor: string;
  hexCode: string;
  secondaryPatternColors: string[];
  patternOrGraphicDescription: string;
  confidenceScore: number;
  boundingBox?: {
    ymin: number;
    xmin: number;
    ymax: number;
    xmax: number;
  };
}

export interface ImageScanResult {
  success: boolean;
  cached?: boolean;
  quotaExhausted?: boolean;
  error?: string;
  isMultipleProducts: boolean;
  totalDetectedProducts: number;
  detectedItems: DetectedProductItem[];
  scannedAt: string;
}

const LOCAL_SCAN_CACHE_KEY = 'zoodi_ai_image_scan_cache_v1';

function hashUrlKey(url: string): string {
  let h = 2166136261;
  const clean = url.trim();
  for (let i = 0; i < clean.length; i++) {
    h ^= clean.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `img_${(h >>> 0).toString(16)}_${clean.length}`;
}

function getLocalCachedScan(imageUrl: string): ImageScanResult | null {
  try {
    const raw = localStorage.getItem(LOCAL_SCAN_CACHE_KEY);
    if (!raw) return null;
    const map = JSON.parse(raw) as Record<string, ImageScanResult>;
    return map[imageUrl.trim()] || null;
  } catch {
    return null;
  }
}

function setLocalCachedScan(imageUrl: string, result: ImageScanResult): void {
  try {
    const raw = localStorage.getItem(LOCAL_SCAN_CACHE_KEY);
    const map: Record<string, ImageScanResult> = raw ? JSON.parse(raw) : {};
    map[imageUrl.trim()] = result;
    // Keep at most 300 entries in local storage
    const keys = Object.keys(map);
    if (keys.length > 300) {
      delete map[keys[0]];
    }
    localStorage.setItem(LOCAL_SCAN_CACHE_KEY, JSON.stringify(map));
  } catch {
    // Ignore storage quota issues
  }
}

async function getFirestoreCachedScan(imageUrl: string): Promise<ImageScanResult | null> {
  if (!db || imageUrl.startsWith('data:')) return null;
  try {
    const key = hashUrlKey(imageUrl);
    const snap = await getDoc(doc(db, 'ai_image_scan_cache', key));
    if (snap.exists()) {
      const data = snap.data();
      if (data && data.imageUrl === imageUrl.trim() && Array.isArray(data.detectedItems)) {
        return {
          success: true,
          cached: true,
          isMultipleProducts: Boolean(data.isMultipleProducts),
          totalDetectedProducts: Number(data.totalDetectedProducts) || data.detectedItems.length,
          detectedItems: data.detectedItems as DetectedProductItem[],
          scannedAt: String(data.scannedAt || new Date().toISOString()),
        };
      }
    }
  } catch {
    // Ignore cache read error
  }
  return null;
}

async function setFirestoreCachedScan(imageUrl: string, result: ImageScanResult): Promise<void> {
  if (!db || imageUrl.startsWith('data:') || !result.success) return;
  try {
    const key = hashUrlKey(imageUrl);
    await setDoc(
      doc(db, 'ai_image_scan_cache', key),
      {
        imageUrl: imageUrl.trim(),
        isMultipleProducts: result.isMultipleProducts,
        totalDetectedProducts: result.totalDetectedProducts,
        detectedItems: result.detectedItems,
        scannedAt: result.scannedAt,
      },
      { merge: true }
    );
  } catch {
    // Ignore cache write error
  }
}

/**
 * Generates a cropped preview URL when multiple separate physical products are detected in one image.
 * Preserves the original image untouched and creates a cropped preview only when necessary.
 */
export async function generateCroppedVariantPreview(
  imageUrl: string,
  boundingBox?: { ymin: number; xmin: number; ymax: number; xmax: number }
): Promise<string | undefined> {
  if (!boundingBox) return undefined;
  const { ymin, xmin, ymax, xmax } = boundingBox;
  const boxWidth = xmax - xmin;
  const boxHeight = ymax - ymin;

  // If the bounding box covers almost the entire image (>88%), no crop is needed
  if (boxWidth <= 50 || boxHeight <= 50 || (boxWidth >= 880 && boxHeight >= 880)) {
    return undefined;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    const timeoutId = setTimeout(() => {
      resolve(buildSvgCropDataUrl(imageUrl, boundingBox));
    }, 5500);

    img.onload = () => {
      clearTimeout(timeoutId);
      try {
        const natW = img.naturalWidth || img.width;
        const natH = img.naturalHeight || img.height;
        if (!natW || !natH) {
          resolve(buildSvgCropDataUrl(imageUrl, boundingBox));
          return;
        }

        // Add subtle 4% padding around the detected item so the product isn't clipped tightly
        const padX = Math.round(natW * 0.04);
        const padY = Math.round(natH * 0.04);

        const sx = Math.max(0, Math.floor((xmin / 1000) * natW) - padX);
        const sy = Math.max(0, Math.floor((ymin / 1000) * natH) - padY);
        const ex = Math.min(natW, Math.ceil((xmax / 1000) * natW) + padX);
        const ey = Math.min(natH, Math.ceil((ymax / 1000) * natH) + padY);

        const sw = Math.max(32, ex - sx);
        const sh = Math.max(32, ey - sy);

        const maxDim = 640;
        const scale = Math.min(1, maxDim / Math.max(sw, sh));
        const targetW = Math.max(1, Math.round(sw * scale));
        const targetH = Math.max(1, Math.round(sh * scale));

        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(buildSvgCropDataUrl(imageUrl, boundingBox));
          return;
        }
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetW, targetH);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.86);
        resolve(dataUrl);
      } catch {
        // Cross-origin canvas taint fallback: deterministic SVG viewBox crop wrapper
        resolve(buildSvgCropDataUrl(imageUrl, boundingBox));
      }
    };

    img.onerror = () => {
      clearTimeout(timeoutId);
      resolve(undefined);
    };

    img.src = imageUrl;
  });
}

function buildSvgCropDataUrl(
  imageUrl: string,
  boundingBox: { ymin: number; xmin: number; ymax: number; xmax: number }
): string {
  const pad = 25;
  const x = Math.max(0, boundingBox.xmin - pad);
  const y = Math.max(0, boundingBox.ymin - pad);
  const w = Math.min(1000 - x, boundingBox.xmax - boundingBox.xmin + pad * 2);
  const h = Math.min(1000 - y, boundingBox.ymax - boundingBox.ymin + pad * 2);
  const safeHref = imageUrl.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${w} ${h}" width="500" height="500" preserveAspectRatio="xMidYMid slice"><image href="${safeHref}" x="0" y="0" width="1000" height="1000" preserveAspectRatio="none"/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Scans a single product image URL using the server-side Gemini Vision endpoint.
 * Never scans the same unchanged image URL twice unless forceRescan is true.
 */
export async function scanProductImageWithAI(
  imageUrl: string,
  productName: string,
  forceRescan = false
): Promise<ImageScanResult> {
  const cleanUrl = imageUrl.trim();
  if (!cleanUrl) {
    return {
      success: false,
      error: 'Empty image URL',
      isMultipleProducts: false,
      totalDetectedProducts: 0,
      detectedItems: [],
      scannedAt: new Date().toISOString(),
    };
  }

  if (!forceRescan) {
    const localHit = getLocalCachedScan(cleanUrl);
    if (localHit && localHit.success) {
      return { ...localHit, cached: true };
    }
    const firestoreHit = await getFirestoreCachedScan(cleanUrl);
    if (firestoreHit && firestoreHit.success) {
      setLocalCachedScan(cleanUrl, firestoreHit);
      return firestoreHit;
    }
  }

  try {
    const response = await fetch('/api/ai/scan-product-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageUrl: cleanUrl,
        productName,
        forceRescan,
      }),
    });

    const data = await response.json();

    if (response.status === 429 || data.quotaExhausted) {
      return {
        success: false,
        quotaExhausted: true,
        error: data.error || 'Gemini Free API quota temporarily exhausted. Processing paused safely.',
        isMultipleProducts: false,
        totalDetectedProducts: 0,
        detectedItems: [],
        scannedAt: new Date().toISOString(),
      };
    }

    if (!response.ok || !data.success) {
      return {
        success: false,
        error: data.error || `AI scan failed (${response.status})`,
        isMultipleProducts: false,
        totalDetectedProducts: 0,
        detectedItems: [],
        scannedAt: new Date().toISOString(),
      };
    }

    const result: ImageScanResult = {
      success: true,
      cached: Boolean(data.cached),
      isMultipleProducts: Boolean(data.isMultipleProducts),
      totalDetectedProducts: Number(data.totalDetectedProducts) || (data.detectedItems?.length ?? 1),
      detectedItems: Array.isArray(data.detectedItems) ? data.detectedItems : [],
      scannedAt: data.scannedAt || new Date().toISOString(),
    };

    setLocalCachedScan(cleanUrl, result);
    await setFirestoreCachedScan(cleanUrl, result);

    return result;
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Network error while contacting AI scanner',
      isMultipleProducts: false,
      totalDetectedProducts: 0,
      detectedItems: [],
      scannedAt: new Date().toISOString(),
    };
  }
}

/**
 * Converts AI scan results for a specific image into structured AIDesignVariant records.
 */
export async function buildVariantsFromImageScan(params: {
  productId: string;
  imageId: string;
  originalImageUrl: string;
  scanResult: ImageScanResult;
  startSortOrder: number;
}): Promise<AIDesignVariant[]> {
  const { productId, imageId, originalImageUrl, scanResult, startSortOrder } = params;
  const now = new Date().toISOString();

  if (!scanResult.success || scanResult.detectedItems.length === 0) {
    // Create a Manual Review Required placeholder variant so the admin can inspect or retry
    return [
      {
        id: `aivar-${productId}-${imageId}-0`,
        product_id: productId,
        source_image_id: imageId,
        original_image_url: originalImageUrl,
        variant_image_url: originalImageUrl,
        detected_product_index: 0,
        main_color: 'Manual Review Required',
        color_hex: '#94A3B8',
        confidence_score: 0,
        is_visible: true,
        sort_order: startSortOrder,
        processing_status: scanResult.quotaExhausted ? 'Waiting for AI' : 'Manual Review Required',
        approval_status: 'Manual Review Required',
        created_at: now,
        updated_at: now,
      },
    ];
  }

  const variants: AIDesignVariant[] = [];
  const isMulti = scanResult.isMultipleProducts || scanResult.detectedItems.length > 1;

  for (let i = 0; i < scanResult.detectedItems.length; i++) {
    const item = scanResult.detectedItems[i];
    const confidence = Number(item.confidenceScore ?? 0);
    const needsManualReview =
      confidence < 0.7 ||
      !item.mainColor ||
      item.mainColor.toLowerCase().includes('unknown') ||
      item.mainColor.toLowerCase().includes('unclear') ||
      item.mainColor.toLowerCase().includes('manual review');

    let croppedUrl: string | undefined;
    if (isMulti && item.boundingBox) {
      croppedUrl = await generateCroppedVariantPreview(originalImageUrl, item.boundingBox);
    }

    const mainColorName = needsManualReview
      ? item.mainColor && !item.mainColor.toLowerCase().includes('unknown')
        ? item.mainColor
        : 'Manual Review Required'
      : item.mainColor.trim();

    variants.push({
      id: `aivar-${productId}-${imageId}-${i}`,
      product_id: productId,
      source_image_id: imageId,
      original_image_url: originalImageUrl,
      cropped_image_url: croppedUrl,
      variant_image_url: croppedUrl || originalImageUrl,
      detected_product_index: i,
      main_color: mainColorName,
      color_hex: item.hexCode || '#64748B',
      secondary_pattern_colors: item.secondaryPatternColors || [],
      pattern_description: item.patternOrGraphicDescription || '',
      bounding_box: item.boundingBox,
      confidence_score: confidence,
      is_visible: true,
      sort_order: startSortOrder + i,
      processing_status: needsManualReview ? 'Manual Review Required' : 'Completed',
      approval_status: needsManualReview ? 'Manual Review Required' : 'Auto Approved',
      created_at: now,
      updated_at: now,
    });
  }

  return variants;
}
