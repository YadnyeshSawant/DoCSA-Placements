import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

function imageProxyPlugin(): Plugin {
  return {
    name: 'image-proxy',
    configureServer(server) {
      server.middlewares.use('/api/proxy-image', async (req, res) => {
        try {
          const parsed = new URL(req.url || '', 'http://localhost:3000');
          const targetUrl = parsed.searchParams.get('url');
          if (!targetUrl) {
            res.statusCode = 400;
            res.end('Missing url parameter');
            return;
          }
          const response = await fetch(targetUrl, {
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
          });

          if (!response.ok) {
            res.statusCode = response.status;
            res.end('Failed to fetch upstream image');
            return;
          }

          const contentType = response.headers.get('content-type') || 'image/jpeg';
          const arrayBuffer = await response.arrayBuffer();
          res.setHeader('Content-Type', contentType);
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Cache-Control', 'public, max-age=86400');
          res.end(Buffer.from(arrayBuffer));
        } catch (err: any) {
          res.statusCode = 500;
          res.end(`Image proxy error: ${err?.message || 'unknown'}`);
        }
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [imageProxyPlugin(), react(), tailwindcss()],
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
});

