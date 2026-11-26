import crypto from 'crypto';
import { createToken, ADMIN_EMAIL, ADMIN_PASSWORD } from './_auth.js';

// In-memory brute force protection: IP -> { attempts, lockedUntil }
const loginAttemptMap = new Map();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.headers['x-real-ip'] || req.socket?.remoteAddress || '127.0.0.1';
}

function checkBruteForce(ip) {
  const now = Date.now();
  const record = loginAttemptMap.get(ip);
  if (!record) return { blocked: false };
  if (now > record.lockedUntil) {
    loginAttemptMap.delete(ip);
    return { blocked: false };
  }
  if (record.attempts >= MAX_ATTEMPTS) {
    const minutesRemaining = Math.ceil((record.lockedUntil - now) / 60000);
    return { blocked: true, minutesRemaining };
  }
  return { blocked: false };
}

function recordFailedAttempt(ip) {
  const now = Date.now();
  const record = loginAttemptMap.get(ip) || { attempts: 0, lockedUntil: now + LOCKOUT_MS };
  record.attempts += 1;
  record.lockedUntil = now + LOCKOUT_MS;
  loginAttemptMap.set(ip, record);
}

function clearAttempts(ip) {
  loginAttemptMap.delete(ip);
}

/**
 * Vercel Serverless Function: POST /api/login
 * Validates admin credentials securely on the server and issues an HMAC-SHA256 signed session token.
 * Protected against brute-force attacks, timing attacks, and credential spoofing.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const clientIp = getClientIp(req);

  // 1. Check Rate Limit / Brute-Force lockout
  const { blocked, minutesRemaining } = checkBruteForce(clientIp);
  if (blocked) {
    return res.status(429).json({
      success: false,
      error: `Too many failed login attempts. IP temporarily locked. Try again in ${minutesRemaining} minute(s).`,
    });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        body = {};
      }
    }

    const { email, password } = body || {};
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    const cleanInputEmail = String(email).toLowerCase().trim();
    const cleanInputPassword = String(password).trim();

    // Verify master password configuration exists
    if (!ADMIN_PASSWORD) {
      console.error('Security alert: ADMIN_PASSWORD environment variable is missing.');
      return res.status(500).json({
        success: false,
        error: 'Authentication configuration error: ADMIN_PASSWORD is not configured on the server.',
      });
    }

    // Timing-safe comparison to prevent side-channel timing attacks
    const emailA = Buffer.from(cleanInputEmail);
    const emailB = Buffer.from(ADMIN_EMAIL);
    const isEmailMatch =
      emailA.length === emailB.length && crypto.timingSafeEqual(emailA, emailB);

    const passA = Buffer.from(cleanInputPassword);
    const passB = Buffer.from(ADMIN_PASSWORD);
    const isPasswordMatch =
      passA.length === passB.length && crypto.timingSafeEqual(passA, passB);

    if (!isEmailMatch || !isPasswordMatch) {
      recordFailedAttempt(clientIp);
      // Artificial delay to thwart fast dictionary/brute-force scripts
      await new Promise((resolve) => setTimeout(resolve, 400));
      return res.status(401).json({
        success: false,
        error: 'Access Denied: Invalid master administrator credentials.',
      });
    }

    // Success: clear failed attempts
    clearAttempts(clientIp);

    // Generate secure cryptographically signed session token
    const token = createToken(ADMIN_EMAIL);

    return res.status(200).json({
      success: true,
      token,
      user: {
        email: ADMIN_EMAIL,
        name: 'Rajesh Kumar',
        role: 'master_admin',
      },
    });
  } catch (err) {
    console.error('Server login error:', err);
    return res.status(500).json({ success: false, error: 'Authentication service encountered an error.' });
  }
}
