import { verifyToken, getAdminCredentials, updateAdminCredentials } from './_auth.js';

/**
 * Vercel Serverless Function: /api/security
 * Handles admin security management (Email & Password updates) stored in MongoDB Atlas.
 * Protected: Requires valid master administrator JWT session token.
 */
export default async function handler(req, res) {
  // Strictly verify master administrator session token
  const auth = verifyToken(req);
  if (!auth) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Master administrator session token required to manage security.',
    });
  }

  // GET: Fetch current admin credentials overview
  if (req.method === 'GET') {
    try {
      const creds = await getAdminCredentials();
      return res.status(200).json({
        success: true,
        email: creds.email,
        isCustom: creds.isCustom,
      });
    } catch (err) {
      console.error('Fetch security status error:', err);
      return res.status(500).json({ success: false, error: 'Could not fetch security status.' });
    }
  }

  // POST: Update email or password
  if (req.method === 'POST') {
    try {
      let body = req.body;
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch (e) {
          body = {};
        }
      }

      const { action, newEmail, newPassword } = body || {};

      if (action === 'update_email') {
        if (!newEmail || typeof newEmail !== 'string') {
          return res.status(400).json({ success: false, error: 'Valid email address is required.' });
        }

        const cleanEmail = newEmail.toLowerCase().trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(cleanEmail)) {
          return res.status(400).json({ success: false, error: 'Invalid email address format.' });
        }

        await updateAdminCredentials({ newEmail: cleanEmail });
        return res.status(200).json({
          success: true,
          message: `Admin email successfully updated to: ${cleanEmail}`,
          email: cleanEmail,
        });
      }

      if (action === 'update_password') {
        if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
          return res.status(400).json({
            success: false,
            error: 'Password must be at least 6 characters long.',
          });
        }

        await updateAdminCredentials({ newPassword });
        return res.status(200).json({
          success: true,
          message: 'Master password successfully updated in MongoDB database.',
        });
      }

      return res.status(400).json({ success: false, error: 'Invalid action specified.' });
    } catch (err) {
      console.error('Update security credentials error:', err);
      return res.status(500).json({ success: false, error: err.message || 'Error updating credentials.' });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed.' });
}
