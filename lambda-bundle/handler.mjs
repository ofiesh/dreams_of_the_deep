import http from 'node:http';
import serverless from 'serverless-http';
import { handler as astroHandler } from './server/entry.mjs';

// Create a minimal http server that delegates to Astro's middleware handler
const server = http.createServer(astroHandler);

// Wrap it for Lambda
export const handler = serverless(server);
