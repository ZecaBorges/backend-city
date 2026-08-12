import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';

const root = join(process.cwd(), 'dist');
const basePath = (process.env.TEST_BASE_PATH ?? '').replace(/\/$/, '');
const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

createServer((request, response) => {
  const pathname = new URL(request.url ?? '/', 'http://localhost').pathname;
  if (basePath && pathname !== basePath && !pathname.startsWith(`${basePath}/`)) {
    response.writeHead(404).end('Not found');
    return;
  }

  const relativePath = decodeURIComponent(pathname.slice(basePath.length)).replace(/^\/+/, '');
  const candidate = normalize(join(root, relativePath || 'index.html'));
  const isFile = candidate.startsWith(root) && existsSync(candidate) && statSync(candidate).isFile();
  const acceptsHtml = request.headers.accept?.includes('text/html') ?? false;
  if (!isFile && relativePath && !acceptsHtml) {
    response.writeHead(404).end('Not found');
    return;
  }
  const filePath = isFile ? candidate : join(root, 'index.html');

  response.writeHead(200, {
    'Content-Type': mimeTypes[extname(filePath)] ?? 'application/octet-stream',
    'Cache-Control': 'no-store',
  });
  createReadStream(filePath).pipe(response);
}).listen(4321, '127.0.0.1');
