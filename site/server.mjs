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
 * - ETag + Last-Modified + 304, Range-Anfragen (206, fuer Video), Path-Traversal-Schutz, nur GET/HEAD (sonst 405).
 * - 404 über dist/404.html, falls vorhanden, sonst Text-Fallback.
 *
 * - POST /api/formular: nimmt Kontakt-, Chefslist- und Newsletter-Formular entgegen und schickt eine Mail
 *   ueber die Brevo-HTTP-API (F3, 2026-10-23). Umgebungsvariablen:
 *     BREVO_API_KEY    Pflicht, Brevo "API keys" (v3), ohne Key antwortet der Endpunkt 503
 *     FORM_TO          Empfaenger, Default info@albert-wilts.de
 *     FORM_FROM_EMAIL  Absender, muss in Brevo als Sender/Domain verifiziert sein, Default website@albert-wilts.de
 *     FORM_FROM_NAME   Absendername, Default "Albert Wilts Website"
 *     BREVO_API_URL    nur fuer Tests (lokaler Mock), Default https://api.brevo.com/v3/smtp/email
 *     LISTMONK_URL     Basis-URL der Listmonk-Instanz; nur fuer die Newsletter-Anmeldung
 *     LISTMONK_LIST_UUID  UUID der Liste, in die eingetragen wird (Double-Opt-in dort einstellen)
 *   Keepalive: woechentliche Leseabfrage, damit der Schluessel nicht nach 90 Tagen Inaktivitaet verfaellt.
 *   Schutz: Honeypot-Feld _gotcha, Spampunkte (Zeitfalle _ts und Links im Freitext, siehe spamPunkte),
 *           Groessenlimit 32 KB, Ratenbegrenzung 8 Anfragen je IP und 10 Minuten,
 *   Pflichtfelder und E-Mail-Format je Formulartyp. Antwort JSON bei Accept: application/json,
 *   sonst eine kleine HTML-Bestaetigungsseite (Formular ohne JavaScript).
 *
 * Bewusst NICHT enthalten (anders als KVS Nordsee): Legacy-Redirect-Tabelle.
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
  '.mp4': 'video/mp4', '.webm': 'video/webm',
};

function cacheControl(urlPath, ext) {
  if (urlPath.startsWith('/_astro/') || ext === '.woff2' || ext === '.woff') return 'public, max-age=31536000, immutable';
  if (urlPath.startsWith('/bilder/') || urlPath.startsWith('/logo/')) return 'public, max-age=300';
  if (urlPath.startsWith('/video/')) return 'public, max-age=86400';
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

// ---------------------------------------------------------------------------------------------
// Formularversand ueber Brevo
// ---------------------------------------------------------------------------------------------
// Newsletter laeuft nicht ueber Mail an Wilts, sondern ueber die selbst gehostete Listmonk-Instanz.
// Wichtig: Die Liste muss in Listmonk oeffentlich ("public") und auf Double-Opt-in gestellt sein.
// Eine private Liste beantwortet /api/public/subscription mit 400 "Ungueltige UUID" (gemessen 26.10.2026).
// Deren oeffentlicher Endpunkt loest die Bestaetigungsmail (Double-Opt-in) selbst aus, sofern die Liste
// so eingestellt ist. CORS erlaubt kein Absenden aus dem Browser, deshalb geht die Anfrage ueber diesen
// Server. Variablen: LISTMONK_URL, LISTMONK_LIST_UUID (F8, 2026-10-26).
const LISTMONK = {
  url: (process.env.LISTMONK_URL || '').replace(/\/$/, ''),
  liste: process.env.LISTMONK_LIST_UUID || '',
};

const FORM = {
  to: process.env.FORM_TO || 'info@albert-wilts.de',
  fromEmail: process.env.FORM_FROM_EMAIL || 'website@albert-wilts.de',
  fromName: process.env.FORM_FROM_NAME || 'Albert Wilts Website',
  apiKey: process.env.BREVO_API_KEY || '',
  apiUrl: process.env.BREVO_API_URL || 'https://api.brevo.com/v3/smtp/email',
  maxBytes: 32 * 1024,
  rateLimit: 8,
  rateWindowMs: 10 * 60 * 1000,
};
const FORMULARE = {
  kontakt: {
    betreff: (d) => `Anfrage über die Website: ${d.anliegen || 'Kontakt'}`,
    pflicht: ['name', 'email', 'nachricht', 'datenschutz'],
    felder: [['name', 'Name'], ['firma', 'Firma'], ['email', 'E-Mail'], ['telefon', 'Telefon'], ['anliegen', 'Anliegen'], ['nachricht', 'Nachricht']],
    danke: 'Vielen Dank für Ihre Nachricht. Wir melden uns so schnell wie möglich.',
  },
  chefslist: {
    betreff: (d) => `Chefslist-Zugang angefordert: ${d.unternehmen || ''}`,
    pflicht: ['unternehmen', 'bestandskunde', 'name', 'email', 'datenschutz'],
    felder: [['unternehmen', 'Unternehmen'], ['bestandskunde', 'Bereits Kunde'], ['kundennummer', 'Kundennummer'], ['name', 'Name'], ['handy', 'Handynummer'], ['email', 'E-Mail']],
    danke: 'Danke! Wir schicken Ihnen in Kürze Ihren Registrierungscode zu.',
  },
  newsletter: {
    betreff: () => 'Newsletter-Anmeldung über die Website',
    pflicht: ['email'],
    felder: [['email', 'E-Mail']],
    danke: 'Fast geschafft. Wir haben Ihnen eine E-Mail geschickt, bitte bestätigen Sie darin Ihre Anmeldung.',
    ziel: 'listmonk',
  },
};
const rateMap = new Map(); // ip -> [timestamps]
function rateOk(ip) {
  const now = Date.now();
  const list = (rateMap.get(ip) || []).filter((t) => now - t < FORM.rateWindowMs);
  if (list.length >= FORM.rateLimit) { rateMap.set(ip, list); return false; }
  list.push(now); rateMap.set(ip, list);
  if (rateMap.size > 5000) for (const [k, v] of rateMap) if (!v.length || now - v[v.length - 1] > FORM.rateWindowMs) rateMap.delete(k);
  return true;
}
// Spamerkennung (F9, 2026-10-27). Am 27.10.2026 kam vier Stunden nach dem Livegang Linkspam
// ueber /kontakt/ durch: der Honeypot greift nur bei Bots, die blind alle Felder ausfuellen.
// Einzelne Signale sind zu unscharf fuer eine harte Ablehnung, deshalb Punkte ab SPAM.schwelle.
// Ein Mensch ohne JavaScript hat nur den fehlenden Zeitstempel und bleibt damit unter der Schwelle.
const SPAM = {
  schwelle: 2,
  minSekunden: 3,      // schneller tippt niemand ein Formular aus
  maxStunden: 24,      // aelterer Zeitstempel: Seite lag lange offen oder wurde gefaelscht
};
function spamPunkte(d) {
  let punkte = 0;
  const gruende = [];
  // Zeitfalle: _ts setzt das Layout-Skript beim Laden. Fehlt es, kam die Anfrage nicht ueber
  // das Formular, sondern direkt an den Endpunkt.
  const ts = Number(d._ts || 0);
  if (!ts) { punkte += 1; gruende.push('kein Zeitstempel'); }
  else {
    const sek = (Date.now() - ts) / 1000;
    if (sek < SPAM.minSekunden) { punkte += 2; gruende.push(`abgeschickt nach ${sek.toFixed(1)} s`); }
    else if (sek < 0 || sek > SPAM.maxStunden * 3600) { punkte += 1; gruende.push('Zeitstempel unplausibel'); }
  }
  // Links im Freitext. Eine echte Anfrage an einen Lebensmittel-Grosshandel enthaelt praktisch nie
  // eine URL, Linkspam dagegen immer. Ein einzelner Link bleibt erlaubt, solange sonst nichts auffaellt.
  const text = [d.nachricht, d.name, d.firma, d.unternehmen].filter(Boolean).join(' ');
  const links = (text.match(/https?:\/\/|www\.|\[url|<a\s/gi) || []).length;
  if (links > 1) { punkte += 2; gruende.push(`${links} Links`); }
  else if (links === 1) { punkte += 1; gruende.push('ein Link'); }
  return { punkte, gruende };
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []; let size = 0;
    req.on('data', (c) => { size += c.length; if (size > FORM.maxBytes) { chunks.length = 0; reject(new Error('zu gross')); } else chunks.push(c); });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}
function parseBody(raw, contentType) {
  const d = {};
  if (contentType.includes('application/json')) {
    const j = JSON.parse(raw || '{}');
    for (const [k, v] of Object.entries(j)) d[k] = String(v ?? '').trim().slice(0, 4000);
  } else {
    for (const [k, v] of new URLSearchParams(raw)) d[k] = String(v).trim().slice(0, 4000);
  }
  return d;
}
const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function antwort(req, res, status, ok, text, zurueck = '/') {
  const wantsJson = (req.headers.accept || '').includes('application/json');
  if (wantsJson) {
    const body = JSON.stringify({ ok, text });
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'Content-Length': Buffer.byteLength(body) });
    return res.end(body);
  }
  const html = `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${ok ? 'Nachricht gesendet' : 'Senden fehlgeschlagen'} | Albert Wilts</title><style>body{font-family:system-ui,sans-serif;background:#F8F8F8;color:#3B3C42;margin:0;display:grid;place-items:center;min-height:100vh;padding:24px;box-sizing:border-box}main{background:#fff;border:1px solid #E9E9E9;border-radius:6px;padding:32px;max-width:560px}h1{font-size:24px;margin:0 0 12px;color:${ok ? '#4F7146' : '#B23B2E'}}p{font-size:17px;line-height:28px;margin:0 0 20px}a{color:#4F7146;font-weight:700}</style></head><body><main><h1>${ok ? 'Vielen Dank' : 'Das hat nicht geklappt'}</h1><p>${esc(text)}</p><p><a href="${esc(zurueck)}">Zurück zur Seite</a></p></main></body></html>`;
  res.writeHead(status, { 'Content-Type': MIME['.html'], 'Cache-Control': 'no-store', 'Content-Length': Buffer.byteLength(html) });
  res.end(html);
}
async function handleFormular(req, res) {
  const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').toString().split(',')[0].trim();
  const fallback = 'Das Senden hat nicht geklappt. Rufen Sie uns an unter 04934 91060 oder schreiben Sie an info@albert-wilts.de.';
  let d;
  try { d = parseBody(await readBody(req), (req.headers['content-type'] || '').toLowerCase()); }
  catch (e) { return antwort(req, res, e.message === 'zu gross' ? 413 : 400, false, fallback); }
  const zurueck = { kontakt: '/kontakt/', chefslist: '/fuer-gewerbekunden/', newsletter: '/' }[d.formular] || '/';
  const def = FORMULARE[d.formular];
  if (!def) return antwort(req, res, 400, false, fallback, zurueck);
  if (d._gotcha) return antwort(req, res, 200, true, def.danke, zurueck); // Honeypot: still bestaetigen, nichts senden
  // Wie beim Honeypot still bestaetigen: der Absender soll nicht erfahren, woran die Erkennung haengt,
  // sonst probiert der naechste Versuch gezielt daran vorbei.
  const bewertung = spamPunkte(d);
  if (bewertung.punkte >= SPAM.schwelle) {
    console.warn(`formular: als Spam verworfen (${bewertung.punkte} Punkte: ${bewertung.gruende.join(', ')})`, ip);
    return antwort(req, res, 200, true, def.danke, zurueck);
  }
  if (!rateOk(ip)) return antwort(req, res, 429, false, 'Zu viele Anfragen in kurzer Zeit. Bitte versuchen Sie es in ein paar Minuten erneut.', zurueck);
  const fehlt = def.pflicht.filter((k) => !d[k]);
  if (fehlt.length) return antwort(req, res, 422, false, 'Bitte füllen Sie alle Pflichtfelder aus.', zurueck);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email || '')) return antwort(req, res, 422, false, 'Bitte geben Sie eine gültige E-Mail-Adresse an.', zurueck);
  if (def.ziel === 'listmonk') {
    if (!LISTMONK.url || !LISTMONK.liste) { console.error('newsletter: LISTMONK_URL oder LISTMONK_LIST_UUID fehlt'); return antwort(req, res, 503, false, fallback, zurueck); }
    const name = (d.email || '').split('@')[0];
    try {
      const r = await fetch(`${LISTMONK.url}/api/public/subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email: d.email, name, list_uuids: [LISTMONK.liste] }),
        signal: AbortSignal.timeout(10000),
      });
      const text = await r.text();
      // Eine bereits eingetragene Adresse meldet Listmonk als Konflikt. Fuer den Besucher ist das kein
      // Fehler, er soll nicht erfahren, wer sonst noch angemeldet ist.
      if (!r.ok && !/bereits|already/i.test(text)) { console.error('newsletter: Listmonk antwortet', r.status, text.slice(0, 300)); return antwort(req, res, 502, false, fallback, zurueck); }
    } catch (e) {
      console.error('newsletter: Listmonk nicht erreichbar', e.message); return antwort(req, res, 502, false, fallback, zurueck);
    }
    return antwort(req, res, 200, true, def.danke, zurueck);
  }

  if (!FORM.apiKey) { console.error('formular: BREVO_API_KEY fehlt, Anfrage nicht gesendet'); return antwort(req, res, 503, false, fallback, zurueck); }
  const zeilen = def.felder.filter(([k]) => d[k]).map(([k, label]) => [label, d[k]]);
  const text = zeilen.map(([l, v]) => `${l}: ${v}`).join('\n') + `\n\nGesendet über albert-wilts.de am ${new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' })}`;
  const html = `<table style="font-family:system-ui,sans-serif;font-size:15px;border-collapse:collapse">${zeilen.map(([l, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#666;vertical-align:top">${esc(l)}</td><td style="padding:4px 0;white-space:pre-wrap">${esc(v)}</td></tr>`).join('')}</table><p style="font-family:system-ui,sans-serif;font-size:13px;color:#888">Gesendet über albert-wilts.de</p>`;
  const payload = {
    sender: { name: FORM.fromName, email: FORM.fromEmail },
    to: [{ email: FORM.to }],
    replyTo: { email: d.email, name: d.name || d.unternehmen || d.email },
    subject: def.betreff(d),
    textContent: text,
    htmlContent: html, // Brevo haengt ein Oeffnungs-Pixel an, auch an reine Textmails (geprueft 24.10.2026); abschaltbar nur in den Brevo-Kontoeinstellungen
    tags: ['website', d.formular],
  };
  try {
    const r = await fetch(FORM.apiUrl, { method: 'POST', headers: { 'api-key': FORM.apiKey, 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(payload), signal: AbortSignal.timeout(10000) });
    if (!r.ok) { console.error('formular: Brevo antwortet', r.status, (await r.text()).slice(0, 300)); return antwort(req, res, 502, false, fallback, zurueck); }
  } catch (e) {
    console.error('formular: Brevo nicht erreichbar', e.message); return antwort(req, res, 502, false, fallback, zurueck);
  }
  return antwort(req, res, 200, true, def.danke, zurueck);
}

// Brevo laesst API-Schluessel nach 90 Tagen ohne Verwendung verfallen. Ein Kontaktformular kann so lange still sein,
// deshalb einmal pro Woche eine harmlose Abfrage (Liste blockierter Kontakte, 1 Eintrag), nur damit der Schluessel aktiv bleibt.
if (FORM.apiKey && !process.env.BREVO_API_URL) {
  const anfassen = () => fetch('https://api.brevo.com/v3/smtp/blockedContacts?limit=1', { headers: { 'api-key': FORM.apiKey }, signal: AbortSignal.timeout(10000) })
    .then((r) => { if (!r.ok) console.error('brevo keepalive:', r.status); })
    .catch((e) => console.error('brevo keepalive:', e.message));
  setTimeout(anfassen, 60 * 1000);
  setInterval(anfassen, 7 * 24 * 60 * 60 * 1000).unref();
}

const server = http.createServer(async (req, res) => {
  const host = (req.headers.host || '').split(':')[0].toLowerCase();
  const url = new URL(req.url || '/', `http://${host || CANONICAL_HOST}`);
  const search = url.search || '';

  // www -> non-www, ausschließlich bei exakt www.albert-wilts.de (dev.* bleibt unberührt)
  if (host === `www.${CANONICAL_HOST}`) {
    return redirect(res, `https://${CANONICAL_HOST}${url.pathname}${search}`);
  }

  if (url.pathname === '/api/formular') {
    if (req.method !== 'POST') { res.writeHead(405, { Allow: 'POST', 'Content-Length': '0' }); return res.end(); }
    return handleFormular(req, res);
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
  // Nur die Live-Domain darf in den Index; dev.albert-wilts.de und alle anderen Hosts bekommen noindex (L1, 23.10.2026)
  if (host !== CANONICAL_HOST) headers['X-Robots-Tag'] = 'noindex, nofollow';

  const inm = req.headers['if-none-match'];
  const ims = req.headers['if-modified-since'];
  if ((inm && inm === etag) || (!inm && ims && new Date(ims).getTime() >= Math.floor(info.mtimeMs / 1000) * 1000)) {
    res.writeHead(304, headers);
    return res.end();
  }

  // Range-Anfragen (Video): Safari spielt <video> nur, wenn der Server 206 mit Content-Range liefert.
  headers['Accept-Ranges'] = 'bytes';
  const range = req.headers.range;
  if (range) {
    const m = /^bytes=(\d*)-(\d*)$/.exec(range);
    let start = m && m[1] !== '' ? Number(m[1]) : NaN;
    let end = m && m[2] !== '' ? Number(m[2]) : info.size - 1;
    if (m && m[1] === '' && m[2] !== '') { start = Math.max(0, info.size - Number(m[2])); end = info.size - 1; }
    if (!m || Number.isNaN(start) || start >= info.size || start > end) {
      res.writeHead(416, { 'Content-Range': `bytes */${info.size}` });
      return res.end();
    }
    end = Math.min(end, info.size - 1);
    headers['Content-Range'] = `bytes ${start}-${end}/${info.size}`;
    headers['Content-Length'] = end - start + 1;
    res.writeHead(206, headers);
    if (req.method === 'HEAD') return res.end();
    return createReadStream(filePath, { start, end }).pipe(res);
  }

  headers['Content-Length'] = info.size;
  res.writeHead(200, headers);
  if (req.method === 'HEAD') return res.end();
  createReadStream(filePath).pipe(res);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`site: serving ${DIST} on :${PORT}`);
});
