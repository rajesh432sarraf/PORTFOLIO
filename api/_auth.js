import crypto from 'crypto';

const SECRET_KEY = process.env.ADMIN_JWT_SECRET || 'rajesh_portfolio_master_secret_key_2026_unhackable';
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'sarrafrajesh432@gmail.com').toLowerCase().trim();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'apanatime';

/**
 * Creates a cryptographically signed HMAC-SHA256 session token.
 */
export function createToken(email) {
  const expiresAt = Date.now() + 1000 * 60 * 60 * 24; // 24 hours
  const payload = `${email}:${expiresAt}:${crypto.randomBytes(8).toString('hex')}`;
  const signature = crypto.createHmac('sha256', SECRET_KEY).update(payload).digest('hex');
  const encodedPayload = Buffer.from(payload).toString('base64url');
  return `${encodedPayload}.${signature}`;
}

/**
 * Verifies the incoming HTTP request's Authorization header or token string.
 * Returns decoded payload { email } if valid, or null if invalid/expired.
 */
export function verifyToken(reqOrToken) {
  let token = reqOrToken;

  // Extract from request object if passed
  if (reqOrToken && typeof reqOrToken === 'object' && reqOrToken.headers) {
    const authHeader = reqOrToken.headers.authorization || reqOrToken.headers.Authorization || '';
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    } else {
      token = reqOrToken.headers['x-admin-token'] || '';
    }
  }

  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [encodedPayload, signature] = parts;
  try {
    const payload = Buffer.from(encodedPayload, 'base64url').toString('utf8');
    const expectedSignature = crypto.createHmac('sha256', SECRET_KEY).update(payload).digest('hex');

    // Constant-time buffer comparison to prevent timing attacks
    const sigBuffer = Buffer.from(signature, 'hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');
    if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
      return null;
    }

    const [email, expiresAtStr] = payload.split(':');
    const expiresAt = parseInt(expiresAtStr, 10);
    if (Date.now() > expiresAt) return null; // Expired token

    return { email };
  } catch (err) {
    return null;
  }
}

export { ADMIN_EMAIL, ADMIN_PASSWORD };
