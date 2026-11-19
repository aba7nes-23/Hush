import { Router, type Request, type Response, type NextFunction } from "express";
import { randomBytes, createHash } from "node:crypto";
import { ReplitConnectors } from "@replit/connectors-sdk";
import { engineCode } from "../lib/engine-code";

type Peer = { id: string; username: string; room: string; token: string; seen: number; events: unknown[]; signals: number; window: number; ice?: unknown; iceAt?: number };
type Room = { members: Map<string, Peer>; created: number };
const rooms = new Map<string, Room>();
const members = new Map<string, Peer>();
const buckets = new Map<string, { count: number; at: number }>();
const connectors = new ReplitConnectors();
let relayRequests = 0;
let relayWindow = Date.now();
let accountSid: string | undefined;
const router = Router();
const tokenHash = (value: string) => createHash("sha256").update(value).digest("hex");

function remove(peer: Peer) {
  members.delete(peer.token);
  const room = rooms.get(peer.room);
  room?.members.delete(peer.id);
  for (const other of room?.members.values() ?? []) enqueue(other, { type: "left", id: peer.id });
  if (!room?.members.size) rooms.delete(peer.room);
}
function enqueue(peer: Peer, event: unknown) {
  if (peer.events.length >= 128) { remove(peer); return; }
  peer.events.push(event);
}
setInterval(() => {
  const now = Date.now();
  for (const peer of members.values()) if (now - peer.seen > 90_000) remove(peer);
  for (const [key, bucket] of buckets) if (now - bucket.at > 60_000) buckets.delete(key);
  for (const room of rooms.values()) if (now - room.created > 6 * 3600_000) for (const peer of room.members.values()) remove(peer);
}, 15_000).unref();

router.use("/rooms", (req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  const ip = tokenHash(req.ip ?? req.socket.remoteAddress ?? "unknown");
  const now = Date.now();
  const key = `${ip}:${req.method === "POST" && req.path === "/" ? "entry" : "traffic"}`;
  const bucket = buckets.get(key) ?? { count: 0, at: now };
  if (now - bucket.at > 60_000) { bucket.count = 0; bucket.at = now; }
  bucket.count++;
  if (!buckets.has(key) && buckets.size >= 10_000) { res.status(503).json({ error: "Server busy. Try again shortly." }); return; }
  buckets.set(key, bucket);
  if (bucket.count > (key.endsWith("entry") ? 15 : 600)) {
    res.setHeader("Retry-After", "60");
    res.status(429).json({ error: "Too many requests. Try again in a minute." }); return;
  }
  next();
});

function auth(req: Request, res: Response, next: NextFunction) {
  const bearer = req.get("Authorization") ?? "";
  const peer = /^Bearer [a-f0-9]{64}$/.test(bearer) ? members.get(tokenHash(bearer.slice(7))) : undefined;
  if (!peer || Date.now() - peer.seen > 90_000) { if (peer) remove(peer); res.status(401).json({ error: "Room session expired. Rejoin using your private key." }); return; }
  peer.seen = Date.now();
  res.locals.peer = peer;
  next();
}
router.post("/rooms", (req, res) => {
  const { roomHash, username, create } = req.body ?? {};
  if (typeof roomHash !== "string" || !/^[a-f0-9]{64}$/.test(roomHash) || typeof username !== "string" || !username.trim() || username.trim().length > 24 || /[\x00-\x1f\x7f]/.test(username) || typeof create !== "boolean") {
    res.status(400).json({ error: "Enter a username of 1–24 characters and a valid private key." }); return;
  }
  let room = rooms.get(roomHash);
  if (create && room) { res.status(409).json({ error: "Please generate a new room key." }); return; }
  if (!create && !room) { res.status(404).json({ error: "Room not found. Check the private key or ask your host to create a new room." }); return; }
  if (!room) {
    if (rooms.size >= 500 || members.size >= 2000) { res.status(503).json({ error: "Server is at capacity. Try later." }); return; }
    room = { members: new Map(), created: Date.now() }; rooms.set(roomHash, room);
  }
  if (room.members.size >= 8) { res.status(409).json({ error: "This room is full. Maximum eight people." }); return; }
  if ([...room.members.values()].some(p => p.username.toLowerCase() === username.trim().toLowerCase())) { res.status(409).json({ error: "That username is already in the room." }); return; }
  const rawToken = randomBytes(32).toString("hex");
  const peer: Peer = { id: randomBytes(12).toString("hex"), username: username.trim(), token: tokenHash(rawToken), room: roomHash, seen: Date.now(), events: [], signals: 0, window: Date.now() };
  const peers = [...room.members.values()].map(p => ({ id: p.id, username: p.username }));
  room.members.set(peer.id, peer); members.set(peer.token, peer);
  for (const other of room.members.values()) if (other !== peer) enqueue(other, { type: "joined", id: peer.id, username: peer.username });
  res.json({ token: rawToken, peerId: peer.id, peers });
});
router.get("/rooms/events", auth, (_req, res) => {
  const peer: Peer = res.locals.peer;
  res.json({ events: peer.events.splice(0), peers: [...(rooms.get(peer.room)?.members.values() ?? [])].map(p => ({ id: p.id, username: p.username })) });
});
router.post("/rooms/signal", auth, (req, res) => {
  const peer: Peer = res.locals.peer;
  const { to, payload } = req.body ?? {};
  if (typeof to !== "string" || !/^[a-f0-9]{24}$/.test(to) || typeof payload !== "string" || payload.length > 48_000 || !/^[A-Za-z0-9+/=]+$/.test(payload)) { res.status(400).json({ error: "Invalid signal." }); return; }
  if (Date.now() - peer.window > 60_000) { peer.window = Date.now(); peer.signals = 0; }
  if (++peer.signals > 180) { res.set("Retry-After", "60").status(429).json({ error: "Signaling limit reached." }); return; }
  const target = rooms.get(peer.room)?.members.get(to);
  if (!target) { res.status(404).json({ error: "Peer has left." }); return; }
  enqueue(target, { type: "signal", from: peer.id, payload });
  res.sendStatus(204);
});
router.post("/rooms/leave", auth, (_req, res) => { remove(res.locals.peer); res.sendStatus(204); });
router.get("/rooms/ice", auth, async (_req, res) => {
  const peer: Peer = res.locals.peer;
  if (peer.ice && Date.now() - (peer.iceAt ?? 0) < 240_000) { res.json(peer.ice); return; }
  if (Date.now() - relayWindow > 3600_000) { relayWindow = Date.now(); relayRequests = 0; }
  if (relayRequests >= 100) { res.set("Retry-After", "3600").status(429).json({ error: "Relay credential quota reached." }); return; }
  relayRequests++;
  try {
    if (!accountSid) {
      const response = await connectors.proxy("twilio", "/Accounts.json?PageSize=1", { signal: AbortSignal.timeout(8_000) });
      if (!response.ok) throw new Error("Account unavailable");
      const data = await response.json() as { accounts?: { sid?: unknown }[] };
      const sid = data.accounts?.[0]?.sid;
      if (typeof sid !== "string" || !/^AC[a-fA-F0-9]{32}$/.test(sid)) throw new Error("Account unavailable");
      accountSid = sid;
    }
    const response = await connectors.proxy("twilio", `/Accounts/${accountSid}/Tokens.json`, {
      method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: "Ttl=600", signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) throw new Error("Relay unavailable");
    const data = await response.json() as { ice_servers?: { urls?: unknown; url?: unknown; username?: unknown; credential?: unknown }[] };
    if (!Array.isArray(data.ice_servers) || !data.ice_servers.length) throw new Error("Relay unavailable");
    const iceServers = data.ice_servers.slice(0, 8).filter((s: any) => typeof (s.urls ?? s.url) === "string" && /^(stun|turn|turns):/.test(s.urls ?? s.url)).map((s: any) => ({ urls: s.urls ?? s.url, ...(typeof s.username === "string" ? { username: s.username } : {}), ...(typeof s.credential === "string" ? { credential: s.credential } : {}) }));
    peer.ice = { relayAvailable: iceServers.some((s: any) => /^turns?:/.test(s.urls)), iceServers };
    peer.iceAt = Date.now();
    res.json(peer.ice);
  } catch {
    // Do not log provider responses: they can contain relay credentials.
    peer.ice = { relayAvailable: false, iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };
    peer.iceAt = Date.now();
    res.json(peer.ice);
  }
});
router.get("/engine", (_req, res) => {
  res.set({ "Cache-Control": "no-store", "Referrer-Policy": "no-referrer", "Content-Security-Policy": "default-src 'none'; script-src 'self'; style-src 'unsafe-inline'; media-src blob:; connect-src 'self'; img-src data: blob:; base-uri 'none'; form-action 'none'" });
  res.type("html").send('<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>html,body{margin:0;background:#102d27;color:#f5f4e9;font-family:system-ui;height:100%}#media{height:100%;display:flex;flex-wrap:wrap;align-content:center;justify-content:center;gap:8px}video{width:46%;max-height:80%;border-radius:16px;object-fit:cover}#local{width:26%;position:absolute;right:12px;bottom:12px}#hint{position:absolute;top:12px;left:12px;font-size:12px}</style></head><body><div id="hint"></div><div id="media"><video id="local" muted autoplay playsinline></video></div><script src="/api/engine.js"></script></body></html>');
});
router.get("/engine.js", (_req, res) => { res.set("Cache-Control", "no-store").type("application/javascript").send(engineCode); });
export default router;
