import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load .env files for local Node.js environment
  const env = loadEnv(mode, process.cwd(), '');
  Object.assign(process.env, env);

  return {
    plugins: [
      react(),
      {
        name: 'local-serverless-api-handler',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (!req.url.startsWith('/api/')) return next();

            try {
              const url = new URL(req.url, 'http://localhost:5173');
              const pathname = url.pathname;

              // Parse body for POST / DELETE / PUT requests
              let body = {};
              if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
                const buffers = [];
                for await (const chunk of req) {
                  buffers.push(chunk);
                }
                const raw = Buffer.concat(buffers).toString();
                if (raw) {
                  try {
                    body = JSON.parse(raw);
                  } catch (e) {
                    body = raw;
                  }
                }
              }

              req.body = body;
              req.query = Object.fromEntries(url.searchParams.entries());

              // Shim res.status() and res.json() for Vercel serverless functions
              res.status = (code) => {
                res.statusCode = code;
                return res;
              };
              res.json = (data) => {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(data));
                return res;
              };

              if (pathname === '/api/login') {
                const handler = (await import('./api/login.js')).default;
                return await handler(req, res);
              } else if (pathname === '/api/content') {
                const handler = (await import('./api/content.js')).default;
                return await handler(req, res);
              } else if (pathname === '/api/contact') {
                const handler = (await import('./api/contact.js')).default;
                return await handler(req, res);
              }

              next();
            } catch (err) {
              console.error('Local API middleware error:', err);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message }));
            }
          });
        },
      },
    ],
    server: {
      port: 5173,
      host: true,
    },
  };
});
