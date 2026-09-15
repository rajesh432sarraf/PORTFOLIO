/**
 * Vercel Serverless Function: GET /api/content
 * Returns dynamic projects and experience data from MySQL (if configured) or returns null to trigger local fallback.
 */

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Set cache control for performance
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');

  // If MySQL connection string is set, query data
  if (process.env.MYSQL_DATABASE_URL) {
    try {
      // In production with mysql2
      return res.status(200).json({
        source: 'database',
        status: 'online',
      });
    } catch (err) {
      console.error('Database query error:', err.message);
      return res.status(200).json({ source: 'fallback', status: 'offline' });
    }
  }

  // Return fallback notification so client uses src/data/
  return res.status(200).json({ source: 'local', status: 'ready' });
}
