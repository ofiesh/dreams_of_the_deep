// Lambda Web Adapter entry point
// The adapter (as a Lambda extension) monitors PORT for a web server.
// When the runtime loads this handler, it starts the Astro server.
// The adapter detects the server and proxies Lambda events to it.

import('./entry.mjs');

// Export a handler — the Web Adapter intercepts HTTP requests
// before they reach this, but Lambda requires a handler to exist.
export const handler = async (event) => {
  return { statusCode: 200, body: 'OK' };
};
