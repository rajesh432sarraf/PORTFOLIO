/**
 * Vercel Serverless Function: /api/content
 * Handles both GET (fetch content) and POST (save content) using MongoDB Atlas.
 */

export default async function handler(req, res) {
  const type = req.query?.type || req.body?.type || 'projects';

  // Handle GET request to retrieve dynamic content
  if (req.method === 'GET') {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    if (process.env.MONGODB_URI) {
      try {
        const { MongoClient } = await import('mongodb');
        const client = new MongoClient(process.env.MONGODB_URI);
        await client.connect();
        const db = client.db(process.env.MONGODB_DB_NAME || 'portfolio');
        const collection = db.collection(type);
        const items = await collection.find({}).sort({ number: 1, order: 1 }).toArray();
        await client.close();

        if (items && items.length > 0) {
          const cleanItems = items.map((item) => {
            const { _id, ...rest } = item;
            return { ...rest, id: rest.id || _id.toString() };
          });
          return res.status(200).json({ success: true, [type]: cleanItems });
        }
      } catch (err) {
        console.error('MongoDB fetch error for content:', err.message);
      }
    }

    return res.status(200).json({ success: true, [type]: null, source: 'fallback' });
  }

  // Handle POST request to save/update dynamic content
  if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        body = {};
      }
    }

    const { data } = body || {};
    if (!data || !Array.isArray(data)) {
      return res.status(400).json({ error: 'Valid data array is required.' });
    }

    if (process.env.MONGODB_URI) {
      try {
        const { MongoClient } = await import('mongodb');
        const client = new MongoClient(process.env.MONGODB_URI);
        await client.connect();
        const db = client.db(process.env.MONGODB_DB_NAME || 'portfolio');
        const collection = db.collection(type);

        // Strip existing _id from objects to avoid duplicate key errors in MongoDB
        const cleanData = data.map(({ _id, ...item }) => item);

        // Replace collection with latest verified data array
        await collection.deleteMany({});
        if (cleanData.length > 0) {
          await collection.insertMany(cleanData);
        }
        await client.close();

        return res.status(200).json({ success: true, message: `${type} saved successfully to cloud.` });
      } catch (err) {
        console.error('MongoDB save error for content:', err.message);
        return res.status(500).json({ error: err.message });
      }
    }

    return res.status(200).json({ success: true, message: 'Saved locally (MongoDB not configured)' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
