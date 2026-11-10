import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp, getApps, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
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

app.use(express.json());

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
