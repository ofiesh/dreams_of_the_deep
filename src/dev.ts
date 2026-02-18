import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import app from './app';

// Serve static files from dist/client
app.use('/static/*', serveStatic({ root: 'dist/client' }));
app.use('/favicon.svg', serveStatic({ root: 'dist/client', path: 'favicon.svg' }));
app.use('/favicon.ico', serveStatic({ root: 'dist/client', path: 'favicon.ico' }));

// Serve images from dist/client (copied from public/ during build)
app.use('/images/*', serveStatic({ root: 'dist/client' }));

const port = 4321;
console.log(`Dev server running at http://localhost:${port}`);
serve({ fetch: app.fetch, port });
