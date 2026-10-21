// Local preview: serves dist/ and runs api/*.js like Vercel does.
// MOCK=1 also fakes Supabase in memory so forms work without an account.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const port = Number(process.env.PORT || 4321);
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.mp4': 'video/mp4', '.ics': 'text/calendar', '.yml': 'text/yaml', '.xml': 'application/xml', '.txt': 'text/plain' };
const mockRows = [];

if (process.env.MOCK) {
  process.env.SUPABASE_URL = `http://localhost:${port}/__mock`;
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-service-key';
}

function vercelRes(res) {
  res.status = (c) => { res.statusCode = c; return res; };
  res.json = (b) => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(b)); return res; };
  res.send = (b) => { res.end(b); return res; };
  return res;
}
const bodyOf = (req) => new Promise((ok) => { let d = ''; req.on('data', (c) => (d += c)); req.on('end', () => ok(d)); });

createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${port}`);
  try {
    if (url.pathname.startsWith('/__mock/rest/v1/submissions') && req.method === 'POST') {
      const row = JSON.parse(await bodyOf(req));
      mockRows.push(row);
      console.log('[mock supabase] stored', JSON.stringify(row));
      res.statusCode = 201; return res.end();
    }
    if (url.pathname === '/__mock/rows') { res.setHeader('Content-Type', 'application/json'); return res.end(JSON.stringify(mockRows)); }
    if (url.pathname.startsWith('/api/')) {
      const name = url.pathname.slice(5).replace(/\/$/, '');
      if (!/^[a-z-]+$/.test(name)) { res.statusCode = 404; return res.end(); }
      const mod = await import(pathToFileURL(join(root, 'api', `${name}.js`)).href);
      const raw = await bodyOf(req);
      req.body = raw && (req.headers['content-type'] || '').includes('json') ? JSON.parse(raw) : raw;
      return await mod.default(req, vercelRes(res));
    }
    let p = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, '');
    let file = join(dist, p);
    if ((await stat(file).catch(() => null))?.isDirectory()) file = join(file, 'index.html');
    if (!(await stat(file).catch(() => null))) { file = join(dist, '404.html'); res.statusCode = 404; }
    res.setHeader('Content-Type', TYPES[extname(file)] || 'application/octet-stream');
    res.end(await readFile(file));
  } catch (err) {
    console.error(err); res.statusCode = 500; res.end('error');
  }
}).listen(port, () => console.log(`Preview at http://localhost:${port}${process.env.MOCK ? ' (mock Supabase on)' : ''}`));
