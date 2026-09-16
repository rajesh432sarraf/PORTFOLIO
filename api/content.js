import { verifyToken } from './_auth.js';

export default async function handler(req, res) {
  const type = req.query?.type || req.body?.type || 'projects';

  // Handle GET request to retrieve dynamic content (Public read-only)
  if (req.method === 'GET') {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    if (process.env.MONGODB_URI) {
      try {
        const { MongoClient } = await import('mongodb');
        const client = new MongoClient(process.env.MONGODB_URI);
        await client.connect();
        const db = client.db(process.env.MONGODB_DB_NAME || 'portfolio');
        const collection = db.collection(type);
        const items = await collection.find({}).sort({ displayOrder: 1, number: 1 }).toArray();
        await client.close();

        // Always return array from database (even if empty []) so client knows exact state
        const cleanItems = (items || []).map((item) => {
          const { _id, displayOrder, ...rest } = item;
          return { ...rest, id: rest.id || _id.toString() };
        });
        return res.status(200).json({ success: true, [type]: cleanItems });
      } catch (err) {
        console.error('MongoDB fetch error for content:', err.message);
      }
    }

    return res.status(200).json({ success: true, [type]: [], source: 'fallback' });
  }

  // Handle DELETE request to delete a specific item by ID from MongoDB (Protected)
  if (req.method === 'DELETE') {
    const auth = verifyToken(req);
    if (!auth) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Master administrator token required to delete content.' });
    }

    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        body = {};
      }
    }
    const id = req.query?.id || body?.id;
    if (!id) {
      return res.status(400).json({ error: 'Item id is required for deletion.' });
    }

    if (process.env.MONGODB_URI) {
      try {
        const { MongoClient, ObjectId } = await import('mongodb');
        const client = new MongoClient(process.env.MONGODB_URI);
        await client.connect();
        const db = client.db(process.env.MONGODB_DB_NAME || 'portfolio');
        const collection = db.collection(type);

        let query = { id: id };
        if (ObjectId.isValid(id)) {
          query = { $or: [{ id: id }, { _id: new ObjectId(id) }] };
        }

        const result = await collection.deleteOne(query);
        await client.close();

        return res.status(200).json({
          success: true,
          message: `${type} item deleted from database.`,
          deletedCount: result.deletedCount,
        });
      } catch (err) {
        console.error('MongoDB delete error for content:', err.message);
        return res.status(500).json({ error: err.message });
      }
    }

    return res.status(200).json({ success: true, message: 'Deleted locally.' });
  }

  // Handle POST request to save/update dynamic content (Protected)
  if (req.method === 'POST') {
    const auth = verifyToken(req);
    if (!auth) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Master administrator token required to modify content.' });
    }
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

        // Strip existing _id and attach displayOrder to preserve user ordering exactly
        const cleanData = data.map(({ _id, displayOrder, ...item }, idx) => ({
          ...item,
          displayOrder: idx,
        }));

        // Replace collection with latest verified data array
        await collection.deleteMany({});
        if (cleanData.length > 0) {
          await collection.insertMany(cleanData);
        }
        await client.close();

        return res.status(200).json({ success: true, message: `${type} saved successfully to cloud database.` });
      } catch (err) {
        console.error('MongoDB save error for content:', err.message);
        return res.status(500).json({ error: err.message });
      }
    }

    return res.status(200).json({ success: true, message: 'Saved locally (MongoDB not configured)' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
