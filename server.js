// DRIFT X server: serves the game + ONE shared online city (no npm packages needed).
//   node server.js   ->  http://localhost:3000      (PORT env var is respected, works on Render / Railway / VPS)
// Transport: WebSocket (/ws) for low latency; automatic fallback to SSE + POST (/api/events, /api/msg).
// Players are tied to their connection (no timeouts while connected), houses are assigned by the server and never move.
const http = require('http'), fs = require('fs'), path = require('path'), crypto = require('crypto'), os = require('os');
const PORT = +process.env.PORT || 3000, ROOT = __dirname, MAX_PLAYERS = 40, LOT_COUNT = 8, GRACE = 20000;
const MIME = { '.html':'text/html; charset=utf-8', '.js':'text/javascript', '.json':'application/json', '.glb':'model/gltf-binary', '.gltf':'model/gltf+json', '.bin':'application/octet-stream',
  '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.webp':'image/webp', '.svg':'image/svg+xml', '.ico':'image/x-icon', '.txt':'text/plain' };
const BLOCK = new Set(['server.js', 'package.json']);
const players = new Map(), sse = new Set();
const clean = (s, n) => String(s == null ? '' : s).replace(/[<>&"'\\]/g, '').slice(0, n);
const num = (v, d) => (Number.isFinite(+v) ? +v : d);
const r2 = v => Math.round(v * 100) / 100;
const hash = t => { let h = 2166136261; for (const ch of String(t)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const livePlayers = () => [...players.values()].filter(p => !p.gone);
const pub = p => ({ id:p.id, name:p.name, seed:p.seed, wall:p.wall, roof:p.roof, color:p.color, joined:p.joined, lot:p.lot, car:p.car, fin:p.fin, rim:p.rim, glow:p.glow, dm:0, stk:p.stk || '' });
function freeLot(id) {
  const used = new Set(); for (const p of players.values()) if (p.lot >= 0) used.add(p.lot);
  const pref = hash(id) % LOT_COUNT; for (let k = 0; k < LOT_COUNT; k++) { const l = (pref + k) % LOT_COUNT; if (!used.has(l)) return l; } return -1;
}
// ---------- minimal WebSocket (RFC 6455), text frames only ----------
function frame(op, data) {
  const b = Buffer.isBuffer(data) ? data : Buffer.from(String(data)), n = b.length; let h;
  if (n < 126) h = Buffer.from([0x80 | op, n]); else if (n < 65536) { h = Buffer.alloc(4); h[0] = 0x80 | op; h[1] = 126; h.writeUInt16BE(n, 2); } else { h = Buffer.alloc(10); h[0] = 0x80 | op; h[1] = 127; h.writeBigUInt64BE(BigInt(n), 2); }
  return Buffer.concat([h, b]);
}
function wsSend(ctx, str) { if (ctx.dead) return; try { ctx.socket.write(frame(1, str)); } catch (e) { ctx.dead = true; } }
function kill(ctx) { ctx.dead = true; try { ctx.socket.destroy(); } catch (e) {} }
function wsAccept(req, socket) {
  const key = req.headers['sec-websocket-key']; if (!key) return socket.destroy();
  socket.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ' + crypto.createHash('sha1').update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64') + '\r\n\r\n');
  socket.setNoDelay(true); socket.setTimeout(0);
  const ctx = { socket, dead:false, alive:Date.now(), p:null, closed:false }; let buf = Buffer.alloc(0);
  const drop = () => { if (ctx.closed) return; ctx.closed = true; ctx.dead = true; if (ctx.p && ctx.p.ws === ctx) { ctx.p.ws = null; ctx.p.gone = Date.now(); onRoster(); } try { socket.destroy(); } catch (e) {} };
  socket.on('data', d => {
    buf = Buffer.concat([buf, d]); if (buf.length > 65536) return drop();
    for (;;) {
      if (buf.length < 2) break; const op = buf[0] & 15, masked = buf[1] & 128; let len = buf[1] & 127, off = 2;
      if (len === 126) { if (buf.length < 4) break; len = buf.readUInt16BE(2); off = 4; } else if (len === 127) { if (buf.length < 10) break; len = Number(buf.readBigUInt64BE(2)); off = 10; }
      if (len > 16384) return drop(); const need = off + (masked ? 4 : 0) + len; if (buf.length < need) break;
      let payload = buf.slice(off + (masked ? 4 : 0), need); if (masked) { const m = buf.slice(off, off + 4); payload = Buffer.from(payload); for (let i = 0; i < payload.length; i++) payload[i] ^= m[i & 3]; }
      buf = buf.slice(need);
      if (op === 8) { try { socket.write(frame(8, Buffer.alloc(0))); } catch (e) {} return drop(); }
      if (op === 9) { try { socket.write(frame(10, payload)); } catch (e) {} continue; }
      if (op === 10) { ctx.alive = Date.now(); continue; }
      if (op === 1 || op === 0) { ctx.alive = Date.now(); let m = null; try { m = JSON.parse(payload.toString()); } catch (e) {} if (m && typeof m === 'object') try { onMsg(m, ctx); } catch (e) {} }
    }
  });
  socket.on('close', drop); socket.on('error', drop); return ctx;
}
// ---------- game messages (same for WebSocket and HTTP fallback) ----------
function broadcast(obj) {
  const s = JSON.stringify(obj); for (const p of players.values()) if (p.ws) wsSend(p.ws, s);
  for (const c of sse) try { c.write('data: ' + s + '\n\n'); } catch (e) {}
}
function onRoster() { broadcast({ t:'roster', list:livePlayers().map(pub) }); }
function applyProfile(p, b) {
  p.name = clean(b.name, 14) || p.name || 'PLAYER'; p.seed = num(b.seed, p.seed || 1) >>> 0; p.wall = Math.max(-1, Math.min(7, num(b.wall, -1) | 0)); p.roof = Math.max(-1, Math.min(5, num(b.roof, -1) | 0));
  p.color = num(b.color, 0xd8362f) & 0xffffff; p.car = clean(b.car, 40) || 'default'; p.fin = clean(b.fin, 12) || 'gloss'; p.rim = num(b.rim, 0xc9ced6) & 0xffffff; p.glow = num(b.glow, 0) & 0xffffff; p.dm = 0; p.stk = (typeof b.stk === 'string' && /^[a-z]{1,10}\|\d{1,9}\|\d{1,2}$/.test(b.stk)) ? b.stk : '';
}
function onMsg(m, ctx) {
  const id = clean(m.id, 48); if (!id) return; let p = players.get(id); const now = Date.now();
  if (m.t === 'join') {
    if (!p) {
      if (livePlayers().length >= MAX_PLAYERS) { if (ctx) wsSend(ctx, JSON.stringify({ t:'full' })); return { t:'full' }; }
      p = { id, lot:freeLot(id), joined:now, x:0, y:0, z:0, h:0, v:0, st:0, f:0, dm:0, dirty:false, gone:0, ws:null, http:false, last:now }; players.set(id, p);
    }
    if (ctx) { if (p.ws && p.ws !== ctx) kill(p.ws); p.ws = ctx; ctx.p = p; p.http = false; } else p.http = true;
    p.gone = 0; p.last = now; applyProfile(p, m); p.x = num(m.x, 0); p.y = num(m.y, 0); p.z = num(m.z, 0); p.h = num(m.h, 0); p.dirty = true;
    const hello = { t:'hello', list:livePlayers().map(pub) }; if (ctx) wsSend(ctx, JSON.stringify(hello)); onRoster(); return hello;
  }
  if (!p) return { t:'rejoin' };
  if (ctx && p.ws !== ctx) return;
  p.last = now;
  if (m.t === 's') { p.x = num(m.x, p.x); p.y = num(m.y, p.y); p.z = num(m.z, p.z); p.h = num(m.h, p.h); p.v = num(m.v, 0); p.st = num(m.st, 0); p.f = num(m.f, 0) | 0; p.dm = Math.max(0, Math.min(100, num(m.dm, p.dm) | 0)); p.dirty = true; if (p.gone) { p.gone = 0; onRoster(); } }
  else if (m.t === 'prof') { applyProfile(p, m); onRoster(); }
  else if (m.t === 'fx') broadcast({ t:'fx', id, x:r2(num(m.x, 0)), z:r2(num(m.z, 0)), i:Math.min(30, Math.max(0, num(m.i, 3))) });
  else if (m.t === 'leave') { if (p.ws) kill(p.ws); players.delete(id); onRoster(); }
}
// snapshots 20x per second, only for players that sent something new
setInterval(() => {
  const out = []; for (const p of players.values()) if (p.dirty && !p.gone) { p.dirty = false; out.push([p.id, r2(p.x), r2(p.y), r2(p.z), +p.h.toFixed(3), +p.v.toFixed(1), +p.st.toFixed(2), p.f, p.dm]); }
  if (out.length) broadcast({ t:'snap', p:out });
}, 50);
setInterval(() => {   // housekeeping: keep-alive pings, remove players that are really gone, re-send roster so every client self-heals
  const now = Date.now(); let changed = false;
  for (const p of [...players.values()]) {
    if (p.ws) { if (now - p.ws.alive > 45000) kill(p.ws); else try { p.ws.socket.write(frame(9, Buffer.alloc(0))); } catch (e) { p.ws.dead = true; } }
    if (!p.ws && p.http && now - p.last > 15000 && !p.gone) { p.gone = now; changed = true; }
    if (p.gone && now - p.gone > GRACE) { players.delete(p.id); changed = true; }
  }
  if (changed || players.size) onRoster();
}, 5000);
// ---------- HTTP ----------
const send = (res, code, obj) => { res.writeHead(code, { 'Content-Type':'application/json', 'Access-Control-Allow-Origin':'*', 'Cache-Control':'no-store' }); res.end(JSON.stringify(obj)); };
function body(req, cb) { let b = ''; req.on('data', c => { b += c; if (b.length > 8192) req.destroy(); }); req.on('end', () => { try { cb(JSON.parse(b || '{}')); } catch (e) { cb(null); } }); }
function listModels(dir, rel, out) {
  let items = []; try { items = fs.readdirSync(dir, { withFileTypes:true }); } catch (e) { return out; }
  for (const it of items) { const r = rel + '/' + it.name; if (it.isDirectory()) listModels(path.join(dir, it.name), r, out); else if (/\.(glb|gltf)$/i.test(it.name)) out.push(r); }
  return out;
}
const server = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x'), p = u.pathname;
  if (req.method === 'OPTIONS') { res.writeHead(204, { 'Access-Control-Allow-Origin':'*', 'Access-Control-Allow-Headers':'Content-Type', 'Access-Control-Allow-Methods':'GET,POST,OPTIONS' }); return res.end(); }
  if (p === '/api/ping' || p === '/healthz') return send(res, 200, { game:'driftx', players:livePlayers().length, v:2 });
  if (p === '/api/models') return send(res, 200, listModels(path.join(ROOT, 'models'), 'models', []).concat(listModels(path.join(ROOT, 'model'), 'model', [])));
  if (p === '/api/msg' && req.method === 'POST') return body(req, b => { if (!b) return send(res, 400, { error:'bad' }); send(res, 200, onMsg(b, null) || {}); });
  if (p === '/api/events') {
    res.writeHead(200, { 'Content-Type':'text/event-stream', 'Cache-Control':'no-cache', Connection:'keep-alive', 'X-Accel-Buffering':'no', 'Access-Control-Allow-Origin':'*' });
    res.write('retry: 1500\ndata: ' + JSON.stringify({ t:'roster', list:livePlayers().map(pub) }) + '\n\n'); sse.add(res); req.on('close', () => sse.delete(res)); return;
  }
  let f; try { f = decodeURIComponent(p); } catch (e) { res.writeHead(400); return res.end('bad'); } if (f === '/') f = '/index.html';
  const full = path.normalize(path.join(ROOT, f)); if (!full.startsWith(ROOT) || BLOCK.has(path.basename(full)) || path.basename(full).startsWith('.')) { res.writeHead(403); return res.end('forbidden'); }
  fs.readFile(full, (err, data) => { if (err) { res.writeHead(404); return res.end('not found'); } const ext = path.extname(full).toLowerCase();
    res.writeHead(200, { 'Content-Type':MIME[ext] || 'application/octet-stream', 'Access-Control-Allow-Origin':'*', 'Cache-Control':ext === '.glb' ? 'public, max-age=3600' : 'no-cache' }); res.end(data); });
});
server.on('upgrade', (req, socket) => { if (new URL(req.url, 'http://x').pathname !== '/ws') return socket.destroy(); wsAccept(req, socket); });
setInterval(() => { for (const c of sse) try { c.write(': ka\n\n'); } catch (e) {} }, 20000);
server.listen(PORT, '0.0.0.0', () => {
  console.log('DRIFT X running:  http://localhost:' + PORT);
  for (const list of Object.values(os.networkInterfaces())) for (const i of list || []) if (i.family === 'IPv4' && !i.internal) console.log('  same Wi-Fi players:  http://' + i.address + ':' + PORT);
  console.log('  internet players: deploy this folder to Render / Railway / a VPS and share its https URL (see README.txt)');
});
