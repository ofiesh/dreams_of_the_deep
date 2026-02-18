import * as esbuild from 'esbuild';
import { cpSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const clientOnly = process.argv.includes('--client-only');

// 1. Server bundle (skip in --client-only mode)
if (!clientOnly) {
  await esbuild.build({
    entryPoints: [join(root, 'src', 'lambda.ts')],
    outfile: join(root, 'dist', 'server', 'index.mjs'),
    bundle: true,
    platform: 'node',
    target: 'node20',
    format: 'esm',
    minify: true,
    external: ['@aws-sdk/*'],
    banner: {
      js: `import { createRequire } from 'module'; const require = createRequire(import.meta.url);`,
    },
  });
  console.log('✓ Server bundle → dist/server/index.mjs');
}

// 2. Client bundle (paged-reader)
await esbuild.build({
  entryPoints: [join(root, 'src', 'scripts', 'paged-reader.ts')],
  outfile: join(root, 'dist', 'client', 'static', 'paged-reader.js'),
  bundle: true,
  platform: 'browser',
  target: 'es2020',
  format: 'iife',
  minify: !clientOnly,
});
console.log('✓ Client bundle → dist/client/static/paged-reader.js');

// 3. Copy CSS files
const staticDir = join(root, 'dist', 'client', 'static');
mkdirSync(staticDir, { recursive: true });
cpSync(join(root, 'src', 'styles'), staticDir, {
  recursive: true,
  filter: (src) => src.endsWith('.css') || !src.includes('.'),
});
console.log('✓ CSS files → dist/client/static/');

// 4. Copy public/ files (favicon, robots.txt)
cpSync(join(root, 'public'), join(root, 'dist', 'client'), { recursive: true });
console.log('✓ Public files → dist/client/');

console.log('Build complete.');
