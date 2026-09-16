import { createToken, ADMIN_EMAIL, ADMIN_PASSWORD } from './_auth.js';

/**
 * Vercel Serverless Function: POST /api/login
 * Validates admin credentials securely on the server and issues an HMAC-SHA256 signed session token.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
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

    // Verify credentials against server environment
    const isEmailMatch = cleanInputEmail === ADMIN_EMAIL;
    const isPasswordMatch = cleanInputPassword === ADMIN_PASSWORD;

    if (!isEmailMatch || !isPasswordMatch) {
      return res.status(401).json({
        success: false,
        error: 'Access Denied: Invalid master administrator credentials.',
      });
    }

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
