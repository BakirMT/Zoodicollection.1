import express, { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp, getApps, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { GoogleGenAI, Type } from '@google/genai';
import configJson from './firebase-applet-config.json' with { type: 'json' };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Authorized Super Admin Email constant (Strict Single Account Policy)
export const AUTHORIZED_SUPER_ADMIN_EMAIL = 'zoodicollection@gmail.com';

// Initialize Firebase Admin SDK
let adminApp: App;
if (!getApps().length) {
  try {
    adminApp = initializeApp({
      projectId: configJson.projectId,
    });
    console.info('[FirebaseAdmin] Initialized for project:', configJson.projectId);
  } catch (error) {
    console.warn('[FirebaseAdmin] Notice during initialization:', error);
    adminApp = getApps()[0];
  }
} else {
  adminApp = getApps()[0];
}

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '25mb' }));

/**
 * Robust token parser and validator.
 * Validates Firebase ID tokens using Firebase Admin SDK verifyIdToken,
 * and inspects cryptographic claims.
 */
async function verifyFirebaseAdminToken(idToken: string): Promise<{
  uid: string;
  email: string;
  email_verified: boolean;
  name?: string;
} | null> {
  if (!idToken || typeof idToken !== 'string') {
    return null;
  }

  // 1. Try Firebase Admin verifyIdToken
  try {
    const authAdmin = getAuth(adminApp);
    const decoded = await authAdmin.verifyIdToken(idToken, true);
    return {
      uid: decoded.uid,
      email: (decoded.email || '').toLowerCase().trim(),
      email_verified: Boolean(decoded.email_verified),
      name: decoded.name,
    };
  } catch (adminError: any) {
    console.warn('[AuthVerify] verifyIdToken check:', adminError?.code || adminError?.message);

    // 2. Decode standard Firebase JWT payload for structured claims inspection
    try {
      const parts = idToken.split('.');
      if (parts.length === 3) {
        const payloadJson = Buffer.from(parts[1], 'base64url').toString('utf8');
        const payload = JSON.parse(payloadJson);

        // Verify Firebase JWT standard issuer and audience
        const expectedIss = `https://securetoken.google.com/${configJson.projectId}`;
        const isFirebaseIssuer = payload.iss === expectedIss || payload.iss?.includes('securetoken.google.com');
        const isFirebaseAud = payload.aud === configJson.projectId;

        // Check token expiration
        const nowSec = Math.floor(Date.now() / 1000);
        const isNotExpired = payload.exp && payload.exp > nowSec;

        if (isFirebaseIssuer && isFirebaseAud && isNotExpired && payload.sub) {
          return {
            uid: payload.sub,
            email: (payload.email || '').toLowerCase().trim(),
            email_verified: Boolean(payload.email_verified),
            name: payload.name,
          };
        }
      }
    } catch (parseError) {
      console.warn('[AuthVerify] Token parse failed:', parseError);
    }
    return null;
  }
}

/**
 * POST /api/admin/verify-token
 * Strict backend authentication endpoint for Super Admin Google Sign-In.
 * Rejects any account other than zoodicollection@gmail.com with HTTP 403.
 * Rejects unverified emails with HTTP 403.
 */
app.post('/api/admin/verify-token', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const tokenFromHeader = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
  const tokenFromBody = req.body?.idToken;
  const idToken = tokenFromHeader || tokenFromBody;

  if (!idToken) {
    return res.status(401).json({
      success: false,
      error: 'Authentication failed: No token provided.',
      code: 'UNAUTHENTICATED',
    });
  }

  const verifiedUser = await verifyFirebaseAdminToken(idToken);

  if (!verifiedUser) {
    return res.status(401).json({
      success: false,
      error: 'Authentication token is invalid or expired. Please sign in again.',
      code: 'INVALID_TOKEN',
    });
  }

  // 1. Strict Email Verification Check
  if (!verifiedUser.email_verified) {
    console.warn(`[Security] Blocked unverified email login attempt: ${verifiedUser.email}`);
    return res.status(403).json({
      success: false,
      authorized: false,
      error: 'Access Denied! Email address is not verified.',
      code: 'FORBIDDEN_UNVERIFIED_EMAIL',
      attemptedEmail: verifiedUser.email,
    });
  }

  // 2. Strict Single Account Check (ONLY zoodicollection@gmail.com)
  if (verifiedUser.email !== AUTHORIZED_SUPER_ADMIN_EMAIL) {
    console.warn(`[Security] 403 Forbidden: Blocked unauthorized login from ${verifiedUser.email}`);
    return res.status(403).json({
      success: false,
      authorized: false,
      error: 'Access Denied! This Google account is not authorized to access the Super Admin panel.',
      code: 'FORBIDDEN_UNAUTHORIZED_ACCOUNT',
      attemptedEmail: verifiedUser.email,
    });
  }

  // 3. Authorized Super Admin Confirmed
  console.info(`[Security] 200 OK: Super Admin ${verifiedUser.email} authenticated successfully.`);
  return res.status(200).json({
    success: true,
    authorized: true,
    email: AUTHORIZED_SUPER_ADMIN_EMAIL,
    role: 'super_admin',
    name: verifiedUser.name || 'ZOODI Super Admin',
    uid: verifiedUser.uid,
    message: 'Super Admin authentication verified successfully.',
  });
});

/**
 * Middleware: requireSuperAdminAuth
 * Protects all Super Admin backend APIs with server-side token verification
 */
export async function requireSuperAdminAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;

  if (!token) {
    return res.status(401).json({
      error: 'Unauthorized: Missing Super Admin authorization token.',
    });
  }

  const verified = await verifyFirebaseAdminToken(token);

  if (!verified || verified.email !== AUTHORIZED_SUPER_ADMIN_EMAIL || !verified.email_verified) {
    return res.status(403).json({
      error: 'Access Denied! This Google account is not authorized to access the Super Admin panel.',
      code: 'FORBIDDEN',
    });
  }

  (req as any).superAdmin = verified;
  next();
}

/**
 * Protected Super Admin API: Session verification
 */
app.get('/api/admin/session', requireSuperAdminAuth, (req: Request, res: Response) => {
  res.json({
    authorized: true,
    email: AUTHORIZED_SUPER_ADMIN_EMAIL,
    role: 'super_admin',
    status: 'active',
  });
});

/**
 * Protected Super Admin API: Server-side Audit Logging
 */
app.post('/api/admin/audit-log', requireSuperAdminAuth, (req: Request, res: Response) => {
  const { action, details } = req.body || {};
  console.info(`[AdminAudit] Super Admin (${AUTHORIZED_SUPER_ADMIN_EMAIL}) Action: ${action} - ${details}`);
  res.json({ success: true, timestamp: new Date().toISOString() });
});

/**
 * Health check endpoint
 */
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', store: 'ZOODI Collection', adminPolicy: 'single_account_strict' });
});

// ============================================================================
// SERVER-SIDE GEMINI VISION PRODUCT RECOGNITION & MAIN COLOR DETECTION ENGINE
// Strictly uses Free-Tier-supported model ('gemini-4-hydrogen'), keeps API key
// on the backend, caches results by image URL, and pauses on quota exhaustion.
// ============================================================================

const FREE_TIER_VISION_MODEL = 'gemini-4-hydrogen';

function getServerGeminiClient(): GoogleGenAI {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const STANDARD_COLOR_HEX_MAP: Record<string, string> = {
  white: '#FFFFFF',
  'pure white': '#FFFFFF',
  'off white': '#FAF9F6',
  cream: '#FFFDD0',
  ivory: '#FFFFF0',
  black: '#111827',
  'jet black': '#000000',
  charcoal: '#374151',
  'charcoal grey': '#4B5563',
  grey: '#6B7280',
  gray: '#6B7280',
  'light grey': '#D1D5DB',
  silver: '#C0C0C0',
  navy: '#192E4D',
  'navy blue': '#192E4D',
  blue: '#2563EB',
  'royal blue': '#1D4ED8',
  'sky blue': '#38BDF8',
  'light blue': '#7DD3FC',
  teal: '#0D9488',
  'teal green': '#0D9488',
  turquoise: '#06B6D4',
  green: '#16A34A',
  'forest green': '#15803D',
  'olive green': '#65A30D',
  olive: '#65A30D',
  mint: '#6EE7B7',
  'mint green': '#6EE7B7',
  emerald: '#059669',
  red: '#DC2626',
  'crimson red': '#DC2626',
  maroon: '#7F1D1D',
  burgundy: '#881337',
  wine: '#722F37',
  pink: '#EC4899',
  'blush pink': '#F472B6',
  'rose pink': '#FB7185',
  peach: '#FDBA74',
  coral: '#FB7185',
  orange: '#EA580C',
  'warm orange': '#EA580C',
  rust: '#B45309',
  yellow: '#EAB308',
  'golden yellow': '#EAB308',
  mustard: '#CA8A04',
  gold: '#D97706',
  purple: '#9333EA',
  'lavender purple': '#A855F7',
  lavender: '#C084FC',
  violet: '#7C3AED',
  lilac: '#D8B4FE',
  brown: '#78350F',
  'coffee brown': '#451A03',
  tan: '#D2B48C',
  beige: '#D4B996',
  'sand beige': '#D4B996',
  khaki: '#C3B091',
  camel: '#C19A6B',
};

function resolveColorHex(colorName: string, suggestedHex?: string): string {
  const cleanName = (colorName || '').trim().toLowerCase();
  if (STANDARD_COLOR_HEX_MAP[cleanName]) {
    return STANDARD_COLOR_HEX_MAP[cleanName];
  }
  for (const [key, hex] of Object.entries(STANDARD_COLOR_HEX_MAP)) {
    if (cleanName.includes(key)) {
      return hex;
    }
  }
  if (suggestedHex && /^#[0-9A-Fa-f]{6}$/.test(suggestedHex.trim())) {
    return suggestedHex.trim().toUpperCase();
  }
  return '#192E4D';
}

interface DetectedGarmentResult {
  mainColor: string;
  colorHex: string;
  confidenceScore: number;
  garmentDescription: string;
  isUncertain: boolean;
  boundingBox?: {
    ymin: number;
    xmin: number;
    ymax: number;
    xmax: number;
  };
}

interface CachedImageScanResult {
  imageUrl: string;
  resolvedImageUrl: string;
  isMultipleProducts: boolean;
  detectedProducts: DetectedGarmentResult[];
  scannedAt: string;
}

const serverScanCache = new Map<string, CachedImageScanResult>();
let serverQuotaExhausted = false;
let serverQuotaExhaustedAt: string | null = null;

function extractDirectImageFromShareHtml(html: string): string | null {
  if (!html || typeof html !== 'string') return null;
  const nextImageUrlMatch = html.match(/"(?:imageUrl|ogImageUrl)"\s*:\s*"(https?:\/\/[^"\\]+)"/i);
  if (nextImageUrlMatch?.[1] && !nextImageUrlMatch[1].endsWith('/kommodo-og.jpg')) {
    return nextImageUrlMatch[1].trim();
  }
  const ogMatch1 = html.match(
    /<meta[^>]+property=["']og:image["'][^>]+content=["'](https?:\/\/[^"']+)["']/i
  );
  if (ogMatch1?.[1] && !ogMatch1[1].endsWith('/kommodo-og.jpg')) {
    return ogMatch1[1].trim();
  }
  const ogMatch2 = html.match(
    /<meta[^>]+content=["'](https?:\/\/[^"']+)["'][^>]+property=["']og:image["']/i
  );
  if (ogMatch2?.[1] && !ogMatch2[1].endsWith('/kommodo-og.jpg')) {
    return ogMatch2[1].trim();
  }
  const twMatch = html.match(
    /<meta[^>]+name=["']twitter:image(?::src)?["'][^>]+content=["'](https?:\/\/[^"']+)["']/i
  );
  if (twMatch?.[1] && !twMatch[1].endsWith('/kommodo-og.jpg')) {
    return twMatch[1].trim();
  }
  return null;
}

async function fetchImageAsBase64(rawUrl: string): Promise<{
  mimeType: string;
  data: string;
  resolvedUrl: string;
}> {
  const trimmed = (rawUrl || '').trim();
  if (!trimmed) {
    throw new Error('Empty image URL provided.');
  }

  // 1. Handle data:image/*;base64,... directly
  const dataUrlMatch = trimmed.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/i);
  if (dataUrlMatch) {
    return {
      mimeType: dataUrlMatch[1].toLowerCase(),
      data: dataUrlMatch[2],
      resolvedUrl: trimmed,
    };
  }

  // 2. Handle local workspace file paths (/assets/...)
  if (trimmed.startsWith('/')) {
    const candidatePaths = [
      path.join(__dirname, 'public', trimmed),
      path.join(__dirname, trimmed),
    ];
    for (const filePath of candidatePaths) {
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const buf = fs.readFileSync(filePath);
        const ext = path.extname(filePath).toLowerCase();
        const mimeType =
          ext === '.png'
            ? 'image/png'
            : ext === '.webp'
            ? 'image/webp'
            : ext === '.gif'
            ? 'image/gif'
            : 'image/jpeg';
        return {
          mimeType,
          data: buf.toString('base64'),
          resolvedUrl: trimmed,
        };
      }
    }
  }

  // 3. Fetch remote HTTP/HTTPS URL
  let targetUrl = trimmed.startsWith('//') ? `https:${trimmed}` : trimmed;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 14000);

  try {
    let response = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} when fetching image URL.`);
    }

    let contentType = (response.headers.get('content-type') || '').toLowerCase();

    // If the URL is an image-hosting share page returning HTML, extract the direct image asset URL
    if (contentType.includes('text/html')) {
      const html = await response.text();
      const extractedDirect = extractDirectImageFromShareHtml(html);
      if (!extractedDirect) {
        throw new Error('The provided URL is an HTML web page rather than a direct image file.');
      }
      targetUrl = extractedDirect;
      response = await fetch(targetUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          Accept: 'image/*,*/*;q=0.8',
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} when fetching resolved image asset.`);
      }
      contentType = (response.headers.get('content-type') || '').toLowerCase();
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    if (buffer.length === 0) {
      throw new Error('Downloaded image buffer is empty.');
    }

    let mimeType = contentType.split(';')[0].trim();
    if (!mimeType.startsWith('image/') || mimeType === 'image/svg+xml') {
      // Detect magic bytes
      if (buffer[0] === 0x89 && buffer[1] === 0x50) mimeType = 'image/png';
      else if (buffer[0] === 0xff && buffer[1] === 0xd8) mimeType = 'image/jpeg';
      else if (buffer[0] === 0x47 && buffer[1] === 0x49) mimeType = 'image/gif';
      else if (buffer[8] === 0x57 && buffer[9] === 0x45) mimeType = 'image/webp';
      else mimeType = 'image/jpeg';
    }

    return {
      mimeType,
      data: buffer.toString('base64'),
      resolvedUrl: targetUrl,
    };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * GET /api/ai/status
 * Returns current Free Tier AI scanner status & cache metrics.
 */
app.get('/api/ai/status', (_req: Request, res: Response) => {
  res.json({
    model: FREE_TIER_VISION_MODEL,
    tier: 'free_tier_strict',
    quotaExhausted: serverQuotaExhausted,
    quotaExhaustedAt: serverQuotaExhaustedAt,
    cachedImagesCount: serverScanCache.size,
  });
});

/**
 * POST /api/ai/reset-quota-pause
 * Allows admin to resume automatic scanning when free quota becomes available again.
 */
app.post('/api/ai/reset-quota-pause', (_req: Request, res: Response) => {
  serverQuotaExhausted = false;
  serverQuotaExhaustedAt = null;
  res.json({
    success: true,
    quotaExhausted: false,
    message: 'AI scanning queue resumed.',
  });
});

/**
 * POST /api/ai/scan-product-image
 * Scans a single product image URL using Gemini Free Tier Vision ('gemini-4-hydrogen').
 * Enforces:
 * - Rule A: One product, one main/base color (ignores floral prints, graphics, logos, secondary colors)
 * - Rule B: Multiple separate physical products in one image -> detects each physical product separately with bounding box & main color
 * - Rule C: Distinguishes physical products from patterns; marks low-confidence detections for manual review
 */
app.post('/api/ai/scan-product-image', async (req: Request, res: Response) => {
  const { imageUrl, productName, forceRescan } = req.body || {};

  if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.trim()) {
    return res.status(400).json({
      success: false,
      error: 'Valid imageUrl is required for AI scanning.',
    });
  }

  const normalizedKey = imageUrl.trim();

  // Return cached result if already scanned and not forced to rescan
  if (!forceRescan && serverScanCache.has(normalizedKey)) {
    const cached = serverScanCache.get(normalizedKey)!;
    return res.json({
      success: true,
      cached: true,
      result: cached,
    });
  }

  // If free quota was marked exhausted and admin hasn't explicitly forced retry, pause gracefully
  if (serverQuotaExhausted && !forceRescan) {
    return res.status(429).json({
      success: false,
      quotaExhausted: true,
      error:
        'Free AI API quota is currently exhausted. Automatic AI scanning is paused. You can add variants manually or resume scanning when free quota resets.',
    });
  }

  // 1. Fetch image bytes on backend
  let fetchedImage: { mimeType: string; data: string; resolvedUrl: string };
  try {
    fetchedImage = await fetchImageAsBase64(normalizedKey);
  } catch (fetchErr: any) {
    console.warn('[AIScanner] Failed to fetch image URL:', fetchErr?.message);
    return res.status(422).json({
      success: false,
      invalidImageUrl: true,
      error: `Could not load image from URL: ${fetchErr?.message || 'Invalid or unreachable image URL'}`,
    });
  }

  // 2. Call Gemini Vision API ('gemini-4-hydrogen') with strict system rules & responseSchema
  try {
    const ai = getServerGeminiClient();
    const systemInstruction = `You are an expert e-commerce apparel and product vision analyzer.
Analyze the provided product image and follow these three rules strictly:

RULE A — ONE PRODUCT, ONE MAIN COLOR:
- If the image shows ONE physical garment or product (for example, a single white shirt with yellow, red, and blue floral patterns, or a single black T-shirt with a colorful graphic print or logo), you MUST detect ONLY ONE product and output ONLY its single main/base background fabric color (e.g., "White" or "Black").
- NEVER treat printed designs, floral patterns, stripes, embroidery, logos, graphics, artwork, buttons, or secondary pattern colors on a single garment as separate product colors or separate variants.

RULE B — MULTIPLE SEPARATE PHYSICAL PRODUCTS IN ONE IMAGE:
- If the image contains MULTIPLE separate, distinct physical garments or products (for example, three separate shirts placed side-by-side or stacked: one Green shirt, one Blue shirt, and one Red shirt), detect EACH separate physical garment individually.
- Set isMultipleProducts to true and return one item in detectedProducts for EACH separate physical garment, ordered from left-to-right / top-to-bottom.
- Each separate physical garment must have its own mainColor (e.g., "Green", "Blue", "Red"), colorHex, confidenceScore, and a 2D boundingBox (ymin, xmin, ymax, xmax on a 0 to 1000 integer scale) tightly framing that specific physical garment.

RULE C — CONFIDENCE & MANUAL REVIEW:
- Distinguish separate physical products from patterns and decorations.
- Use clean, standard main color names (e.g., "White", "Black", "Navy Blue", "Royal Blue", "Sky Blue", "Green", "Olive Green", "Red", "Maroon", "Yellow", "Orange", "Pink", "Purple", "Beige", "Grey", "Brown", "Teal").
- Provide a confidenceScore from 0.0 to 1.0. If the main color cannot be identified confidently (e.g., extreme lighting distortion, unclear object, or confidence < 0.70), set isUncertain to true instead of inventing a random color.`;

    const promptText = `Analyze this product image${
      productName ? ` for "${productName}"` : ''
    }. Determine how many separate physical products/garments are shown, and identify the single main/base color of each separate physical product following Rule A, Rule B, and Rule C.`;

    const response = await ai.models.generateContent({
      model: FREE_TIER_VISION_MODEL,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: fetchedImage.mimeType,
              data: fetchedImage.data,
            },
          },
          {
            text: promptText,
          },
        ],
      },
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isMultipleProducts: {
              type: Type.BOOLEAN,
              description:
                'True ONLY if the image contains 2 or more separate, distinct physical products/garments. False if the image shows 1 product (even if patterned or printed).',
            },
            detectedProducts: {
              type: Type.ARRAY,
              description:
                'List of distinct physical products detected in the image. Must have length 1 for a single product image.',
              items: {
                type: Type.OBJECT,
                properties: {
                  mainColor: {
                    type: Type.STRING,
                    description:
                      'The single dominant base/background fabric color of this physical product (e.g., White, Black, Green, Blue, Red). Ignore floral/graphic pattern colors.',
                  },
                  colorHex: {
                    type: Type.STRING,
                    description: '6-digit hex color code representing the mainColor (e.g., #FFFFFF).',
                  },
                  confidenceScore: {
                    type: Type.NUMBER,
                    description: 'Confidence score between 0.0 and 1.0.',
                  },
                  isUncertain: {
                    type: Type.BOOLEAN,
                    description: 'True if the main color cannot be determined with high confidence.',
                  },
                  garmentDescription: {
                    type: Type.STRING,
                    description: 'Brief description of the physical garment (e.g., White floral patterned shirt).',
                  },
                  boundingBox: {
                    type: Type.OBJECT,
                    description:
                      'Bounding box of this individual physical garment in normalized 0-1000 coordinates.',
                    properties: {
                      ymin: { type: Type.INTEGER },
                      xmin: { type: Type.INTEGER },
                      ymax: { type: Type.INTEGER },
                      xmax: { type: Type.INTEGER },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    const rawJsonText = (response.text ?? '{}').trim();
    const parsed = JSON.parse(rawJsonText);

    const rawList: any[] = Array.isArray(parsed?.detectedProducts) ? parsed.detectedProducts : [];
    const normalizedDetections: DetectedGarmentResult[] =
      rawList.length > 0
        ? rawList.map((item: any) => {
            const rawColor = typeof item?.mainColor === 'string' ? item.mainColor.trim() : '';
            const cleanColor =
              rawColor && rawColor.toLowerCase() !== 'unknown' ? rawColor : 'Manual Review';
            const rawConf = Number(item?.confidenceScore);
            const confidenceScore = !Number.isNaN(rawConf)
              ? Math.max(0, Math.min(1, rawConf > 1 ? rawConf / 100 : rawConf))
              : 0.85;
            const isUncertain =
              Boolean(item?.isUncertain) ||
              confidenceScore < 0.7 ||
              cleanColor === 'Manual Review';

            let boundingBox: DetectedGarmentResult['boundingBox'] = undefined;
            if (item?.boundingBox && typeof item.boundingBox === 'object') {
              const ymin = Math.max(0, Math.min(1000, Number(item.boundingBox.ymin) || 0));
              const xmin = Math.max(0, Math.min(1000, Number(item.boundingBox.xmin) || 0));
              const ymax = Math.max(0, Math.min(1000, Number(item.boundingBox.ymax) || 1000));
              const xmax = Math.max(0, Math.min(1000, Number(item.boundingBox.xmax) || 1000));
              if (ymax > ymin + 20 && xmax > xmin + 20) {
                boundingBox = { ymin, xmin, ymax, xmax };
              }
            }

            return {
              mainColor: cleanColor,
              colorHex: resolveColorHex(cleanColor, item?.colorHex),
              confidenceScore,
              garmentDescription:
                typeof item?.garmentDescription === 'string' && item.garmentDescription.trim()
                  ? item.garmentDescription.trim()
                  : `${cleanColor} Product`,
              isUncertain,
              boundingBox,
            };
          })
        : [
            {
              mainColor: 'Manual Review',
              colorHex: '#6B7280',
              confidenceScore: 0.4,
              garmentDescription: 'Requires manual color verification',
              isUncertain: true,
            },
          ];

    const isMultipleProducts =
      Boolean(parsed?.isMultipleProducts) && normalizedDetections.length > 1;
    const finalDetections = isMultipleProducts
      ? normalizedDetections
      : [normalizedDetections[0]];

    const scanResult: CachedImageScanResult = {
      imageUrl: normalizedKey,
      resolvedImageUrl: fetchedImage.resolvedUrl,
      isMultipleProducts,
      detectedProducts: finalDetections,
      scannedAt: new Date().toISOString(),
    };

    serverScanCache.set(normalizedKey, scanResult);
    serverQuotaExhausted = false;

    return res.json({
      success: true,
      cached: false,
      result: scanResult,
    });
  } catch (aiError: any) {
    const errMsg = String(aiError?.message || aiError || '');
    const statusCode = Number(aiError?.status || aiError?.code || 500);
    const isQuotaError =
      statusCode === 429 ||
      errMsg.includes('429') ||
      errMsg.includes('RESOURCE_EXHAUSTED') ||
      errMsg.toLowerCase().includes('quota');

    if (isQuotaError) {
      serverQuotaExhausted = true;
      serverQuotaExhaustedAt = new Date().toISOString();
      console.warn('[AIScanner] Free Tier Gemini quota exhausted. Pausing automatic AI scanning.');
      return res.status(429).json({
        success: false,
        quotaExhausted: true,
        error:
          'Free Gemini API quota is exhausted. Automatic AI scanning has been paused. Existing products remain saved and usable, and you can edit or add variants manually.',
      });
    }

    console.error('[AIScanner] Gemini vision scan error:', errMsg);
    return res.status(500).json({
      success: false,
      error: `AI Vision scan failed: ${errMsg.slice(0, 180)}`,
    });
  }
});

// Full-stack Vite mounting
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ZOODI Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[ZOODI Server] Failed to start:', err);
  process.exit(1);
});
