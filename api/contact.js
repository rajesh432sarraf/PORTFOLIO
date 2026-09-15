/**
 * Vercel Serverless Function: POST /api/contact
 * Handles contact form submissions securely without exposing database or email credentials to client.
 */

export default async function handler(req, res) {
  // Handle GET request to fetch messages (for Admin CMS)
  if (req.method === 'GET') {
    if (process.env.MONGODB_URI) {
      try {
        const { MongoClient } = await import('mongodb');
        const client = new MongoClient(process.env.MONGODB_URI);
        await client.connect();
        const db = client.db(process.env.MONGODB_DB_NAME || 'portfolio');
        const messages = await db
          .collection('messages')
          .find()
          .sort({ createdAt: -1 })
          .limit(100)
          .toArray();
        await client.close();

        const formatted = messages.map((m) => ({
          ...m,
          _id: m._id ? m._id.toString() : `msg_${Date.now()}`,
          createdAt: m.createdAt ? new Date(m.createdAt).toISOString() : new Date().toISOString(),
        }));

        return res.status(200).json({ success: true, messages: formatted });
      } catch (err) {
        console.error('MongoDB fetch error:', err.message);
        return res.status(200).json({ success: false, messages: [], error: err.message });
      }
    }
    return res.status(200).json({ success: true, messages: [] });
  }

  // Only accept POST requests for submissions
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, subject, message, honeypot } = req.body || {};

    // 1. Honeypot check for spam bots
    if (honeypot) {
      return res.status(200).json({ success: true, message: 'Message received' });
    }

    // 2. Server-side validation
    if (!name || typeof name !== 'string' || name.trim().length < 2 || name.length > 80) {
      return res.status(400).json({ error: 'Name must be between 2 and 80 characters.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email) || email.length > 120) {
      return res.status(400).json({ error: 'A valid email address is required.' });
    }

    if (!message || typeof message !== 'string' || message.trim().length < 10 || message.length > 3000) {
      return res.status(400).json({ error: 'Message must be between 10 and 3000 characters.' });
    }

    const cleanSubject = (subject || 'Portfolio Contact').substring(0, 150);
    const timestamp = new Date().toISOString();

    // 3. Web3Forms Direct Email Delivery (Zero-setup free email to sarrafrajesh13@gmail.com)
    const web3Key = process.env.WEB3FORMS_ACCESS_KEY || process.env.VITE_PUBLIC_WEB3FORMS_KEY;
    if (web3Key) {
      try {
        await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            access_key: web3Key,
            name: name.trim(),
            email: email.trim(),
            subject: `[Portfolio] ${cleanSubject} from ${name}`,
            message: message.trim(),
            from_name: 'Rajesh Portfolio Website',
          }),
        });
      } catch (web3Err) {
        console.error('Web3Forms dispatch error:', web3Err.message);
      }
    }

    // 4. MongoDB Persistence (if configured via MONGODB_URI)
    if (process.env.MONGODB_URI) {
      try {
        const { MongoClient } = await import('mongodb');
        const client = new MongoClient(process.env.MONGODB_URI);
        await client.connect();
        const db = client.db(process.env.MONGODB_DB_NAME || 'portfolio');
        await db.collection('messages').insertOne({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          subject: cleanSubject,
          message: message.trim(),
          status: 'new',
          createdAt: new Date(),
        });
        await client.close();
      } catch (dbErr) {
        console.error('MongoDB connection error:', dbErr.message);
      }
    }

    // 5. Email Notification via Resend (if configured via RESEND_API_KEY)
    if (process.env.RESEND_API_KEY) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: process.env.RESEND_FROM_EMAIL || 'portfolio@rajeshsarraf.dev',
            to: process.env.CONTACT_NOTIFICATION_EMAIL || 'sarrafrajesh13@gmail.com',
            subject: `[Portfolio] ${cleanSubject} from ${name}`,
            html: `
              <h2>New Message Received</h2>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Subject:</strong> ${cleanSubject}</p>
              <p><strong>Message:</strong></p>
              <blockquote style="background: #f4f4f4; padding: 12px; border-left: 4px solid #7621B0; color: #111;">
                ${message.replace(/\n/g, '<br/>')}
              </blockquote>
              <p><small>Received at: ${timestamp}</small></p>
            `,
          }),
        });
      } catch (emailErr) {
        console.error('Resend notification error:', emailErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Your message has been received successfully.',
    });
  } catch (error) {
    console.error('Contact handler error:', error);
    return res.status(500).json({ error: 'Internal server error while processing message.' });
  }
}
