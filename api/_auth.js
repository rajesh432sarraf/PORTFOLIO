import crypto from 'crypto';

// Cryptographically secure secret key: uses environment secret or falls back to a deterministic hash of MONGODB_URI/fallback secret
// Ensures tokens remain valid across serverless cold starts
const SECRET_KEY =
  process.env.ADMIN_JWT_SECRET ||
  (process.env.MONGODB_URI
    ? crypto.createHash('sha256').update(process.env.MONGODB_URI + '_jwt_secret_rajesh_2026').digest('hex')
    : 'rajesh_portfolio_secure_master_jwt_secret_2026_production');

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'sarrafrajesh432@gmail.com').toLowerCase().trim();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'apanatime';

export const isMongoConfigured = (uri) =>
  Boolean(uri && uri.trim() && !uri.includes('<cluster>') && !uri.includes('<username>') && uri.startsWith('mongodb'));

/**
 * Hash password using PBKDF2 with 100,000 iterations and sha512.
 */
export function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

/**
 * Constant-time verification of PBKDF2 password against stored hash and salt.
 */
export function verifyPassword(password, storedHash, salt) {
  try {
    const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    const a = Buffer.from(hash, 'hex');
    const b = Buffer.from(storedHash, 'hex');
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch (err) {
    return false;
  }
}

/**
 * Retrieve admin credentials from MongoDB `admin_security` collection.
 * Falls back to default environment variables or default owner credentials if not yet set in DB.
 */
export async function getAdminCredentials() {
  if (isMongoConfigured(process.env.MONGODB_URI)) {
    try {
      const { MongoClient } = await import('mongodb');
      const client = new MongoClient(process.env.MONGODB_URI);
      await client.connect();
      const db = client.db(process.env.MONGODB_DB_NAME || 'portfolio');
      const doc = await db.collection('admin_security').findOne({ _id: 'master_credentials' });
      await client.close();

      if (doc) {
        return {
          email: (doc.email || ADMIN_EMAIL).toLowerCase().trim(),
          passwordHash: doc.passwordHash || null,
          salt: doc.salt || null,
          defaultPassword: ADMIN_PASSWORD,
          isCustom: Boolean(doc.passwordHash && doc.salt),
        };
      }
    } catch (err) {
      console.warn('Could not read admin credentials from MongoDB, using fallback:', err.message);
    }
  }

  return {
    email: ADMIN_EMAIL,
    defaultPassword: ADMIN_PASSWORD,
    passwordHash: null,
    salt: null,
    isCustom: false,
  };
}

/**
 * Update admin email and/or master password in MongoDB `admin_security` collection.
 */
export async function updateAdminCredentials({ newEmail, newPassword }) {
  if (!isMongoConfigured(process.env.MONGODB_URI)) {
    throw new Error('MongoDB is not configured on the server. Credentials cannot be persisted.');
  }

  const { MongoClient } = await import('mongodb');
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db(process.env.MONGODB_DB_NAME || 'portfolio');
  const collection = db.collection('admin_security');

  const updateFields = {
    updatedAt: new Date(),
  };

  if (newEmail) {
    updateFields.email = String(newEmail).toLowerCase().trim();
  }

  if (newPassword) {
    const { hash, salt } = hashPassword(String(newPassword).trim());
    updateFields.passwordHash = hash;
    updateFields.salt = salt;
  }

  await collection.updateOne(
    { _id: 'master_credentials' },
    { $set: updateFields },
    { upsert: true }
  );

  await client.close();
  return { success: true, email: updateFields.email };
}

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
