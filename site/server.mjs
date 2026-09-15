/**
 * Static-Server für den Astro-Build (dist/), nur Node-Standardbibliothek, keine Dependencies.
 * Läuft in Coolify (Nixpacks) hinter Traefik, siehe nixpacks.toml.
 *
 * Aufgaben:
 * - 301 www.albert-wilts.de/* -> https://albert-wilts.de/* (Pfad + Query erhalten).
 *   WICHTIG: Der Redirect greift NUR, wenn der Host exakt `www.${CANONICAL_HOST}` ist.
 *   Alle anderen Hosts (dev.albert-wilts.de, localhost, sslip.io) werden unverändert
 *   ausgeliefert. Sonst würde die Entwicklungsdomain auf die Live-Domain umleiten.
 * - 301 auf Trailing-Slash-Form für Verzeichnisrouten (/presse -> /presse/ -> dist/presse/index.html).
 * - Cache-Control: immutable für gehashte Assets (/_astro/) und Fonts, kurz für /bilder/ und /logo/,
 *   no-cache für HTML/XML/TXT, sonst eine Stunde.
 * - ETag + Last-Modified + 304, Path-Traversal-Schutz, nur GET/HEAD (sonst 405).
 * - 404 über dist/404.html, falls vorhanden, sonst Text-Fallback.
 *
 * Bewusst NICHT enthalten (anders als KVS Nordsee): Legacy-Redirect-Tabelle und
 * Proxy /api/kontakt. Das Kontaktformular-Backend ist für Wilts noch nicht entschieden.
 */
import http from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import { stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PORT = Number(process.env.PORT || 3000);
const DIST = path.join(path.dirname(fileURLToPath(import.meta.url)), 'dist');
const CANONICAL_HOST = 'albert-wilts.de';

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.avif': 'image/avif', '.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2',
  '.pdf': 'application/pdf', '.webmanifest': 'application/manifest+json',
};

function cacheControl(urlPath, ext) {
  if (urlPath.startsWith('/_astro/') || ext === '.woff2' || ext === '.woff') return 'public, max-age=31536000, immutable';
  if (urlPath.startsWith('/bilder/') || urlPath.startsWith('/logo/')) return 'public, max-age=300';
  if (ext === '.html' || ext === '.xml' || ext === '.txt') return 'no-cache';
  return 'public, max-age=3600';
}

function redirect(res, location, status = 301) {
  res.writeHead(status, { Location: location, 'Cache-Control': 'no-cache', 'Content-Length': '0' });
  res.end();
}

async function fileInfo(filePath) {
  try {
    const s = await stat(filePath);
    return s.isFile() ? s : null;
  } catch {
    return null;
  }
}

function send404(req, res) {
  const notFound = path.join(DIST, '404.html');
  const s = (() => { try { return statSync(notFound); } catch { return null; } })();
  if (s && s.isFile()) {
    res.writeHead(404, { 'Content-Type': MIME['.html'], 'Content-Length': s.size, 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' });
    if (req.method === 'HEAD') return res.end();
    return createReadStream(notFound).pipe(res);
  }
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' });
  res.end('Seite nicht gefunden.');
}

const server = http.createServer(async (req, res) => {
  const host = (req.headers.host || '').split(':')[0].toLowerCase();
  const url = new URL(req.url || '/', `http://${host || CANONICAL_HOST}`);
  const search = url.search || '';

  // www -> non-www, ausschließlich bei exakt www.albert-wilts.de (dev.* bleibt unberührt)
  if (host === `www.${CANONICAL_HOST}`) {
    return redirect(res, `https://${CANONICAL_HOST}${url.pathname}${search}`);
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD', 'Content-Length': '0' });
    return res.end();
  }

  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    return send404(req, res);
  }

  // Path-Traversal-Schutz
  const safePath = path.normalize(pathname).replace(/^(\.\.[/\\])+/, '');
  const abs = path.join(DIST, safePath);
  if (!abs.startsWith(DIST + path.sep) && abs !== DIST) return send404(req, res);

  // Verzeichnisroute: /presse -> /presse/ (301), /presse/ -> /presse/index.html
  let filePath = abs;
  let info = await fileInfo(filePath);
  if (!info) {
    const asIndex = path.join(abs, 'index.html');
    const idx = await fileInfo(asIndex);
    if (idx) {
      if (!pathname.endsWith('/')) return redirect(res, `${pathname}/${search}`);
      filePath = asIndex;
      info = idx;
    }
  }
  if (!info) return send404(req, res);

  const ext = path.extname(filePath).toLowerCase();
  const etag = `W/"${info.size.toString(16)}-${Math.floor(info.mtimeMs).toString(16)}"`;
  const lastModified = info.mtime.toUTCString();
  const headers = {
    'Content-Type': MIME[ext] || 'application/octet-stream',
    'Cache-Control': cacheControl(pathname, ext),
    ETag: etag,
    'Last-Modified': lastModified,
    'X-Content-Type-Options': 'nosniff',
  };

  const inm = req.headers['if-none-match'];
  const ims = req.headers['if-modified-since'];
  if ((inm && inm === etag) || (!inm && ims && new Date(ims).getTime() >= Math.floor(info.mtimeMs / 1000) * 1000)) {
    res.writeHead(304, headers);
    return res.end();
  }

  headers['Content-Length'] = info.size;
  res.writeHead(200, headers);
  if (req.method === 'HEAD') return res.end();
  createReadStream(filePath).pipe(res);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`site: serving ${DIST} on :${PORT}`);
});
