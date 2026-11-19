// Runs only inside the device WebView/browser. No private room key reaches Express.
export const engineCode = String.raw`
(() => {
  'use strict';
  const MAX = 20 * 1024 * 1024;
  let key = '', aes, token = '', self = '', username = '', running = false, generation = 0;
  let config = { iceServers: [] }, forceRelay = false, localStream, pendingCall;
  let pollTimer, relayTimer, calling = false, sendingFile = false;
  const peers = new Map(), transfers = new Map(), files = new Map(), seen = new Set(), outgoingCalls = new Set();
  const handledEvents = new WeakSet();
  let retainedBytes = 0, relayAvailable = false;
  const enc = new TextEncoder(), dec = new TextDecoder();
  const native = !!window.ReactNativeWebView;
  let parentOrigin;
  try { parentOrigin = document.referrer ? new URL(document.referrer).origin : undefined; } catch {}
  function emit(event) {
    if (native) window.ReactNativeWebView.postMessage(JSON.stringify(event));
    else if (window.parent !== window) window.parent.postMessage(event, parentOrigin || '*');
  }
  function error(e) { emit({ type: 'error', message: e && e.message || 'Connection failed. Please try again.' }); }
  const pause = ms => new Promise(r => setTimeout(r, ms));
  function b64(bytes) {
    let result = '';
    for (let i = 0; i < bytes.length; i += 16384) result += String.fromCharCode.apply(null, bytes.subarray(i, i + 16384));
    return btoa(result);
  }
  function unb64(value) { return Uint8Array.from(atob(value), c => c.charCodeAt(0)); }
  function randomId() { return b64(crypto.getRandomValues(new Uint8Array(16))).replace(/[+/=]/g, ''); }
  async function digest(bytes) { return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), v => v.toString(16).padStart(2, '0')).join(''); }
  async function seal(value) {
    const nonce = crypto.getRandomValues(new Uint8Array(12));
    const ciphertext = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, aes, enc.encode(JSON.stringify(value))));
    const result = new Uint8Array(12 + ciphertext.length);
    result.set(nonce); result.set(ciphertext, 12); return b64(result);
  }
  async function open(value) {
    if (typeof value !== 'string' || value.length > 60000) throw new Error('Invalid encrypted packet.');
    const bytes = unb64(value);
    return JSON.parse(dec.decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: bytes.slice(0, 12) }, aes, bytes.slice(12))));
  }
  async function api(path, body) {
    const response = await fetch('/api/rooms' + path, {
      method: body === undefined ? 'GET' : 'POST', cache: 'no-store',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }), signal: AbortSignal.timeout(18000)
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      const e = new Error(data.error || 'Connection unavailable. Please retry.');
      e.status = response.status; throw e;
    }
    return response.status === 204 ? undefined : response.json();
  }
  function reportPeers() { emit({ type: 'peers', peers: Array.from(peers.values(), p => ({ id: p.id, username: p.username, connected: p.dc && p.dc.readyState === 'open' })) }); }
  async function signal(id, value) {
    const payload = await seal({ ...value, sender: self, target: id });
    await api('/signal', { to: id, payload });
  }
  async function ice() {
    const data = await api('/ice');
    relayAvailable = !!data.relayAvailable;
    emit({ type: 'relay', available: relayAvailable });
    if (forceRelay && !relayAvailable) throw new Error('Relay-only mode is unavailable. No direct connection was attempted. Try again later or turn relay-only off.');
    config = { iceServers: data.iceServers || [], iceTransportPolicy: forceRelay ? 'relay' : 'all' };
    for (const p of peers.values()) { p.pc.setConfiguration(config); if (p.callPc) p.callPc.setConfiguration(config); }
  }
  function bindChannel(p, channel) {
    if (p.dc) p.dc.close();
    p.dc = channel; channel.bufferedAmountLowThreshold = 65536;
    channel.onopen = reportPeers; channel.onclose = reportPeers;
    p.receive = Promise.resolve();
    channel.onmessage = event => {
      p.receive = p.receive.then(async () => {
        const value = await open(event.data);
        if (value.sender !== p.id || typeof value.id !== 'string' || value.id.length > 80) throw new Error('Invalid peer packet.');
        const dedup = p.id + ':' + value.id;
        if (seen.has(dedup)) return;
        seen.add(dedup); if (seen.size > 4000) seen.delete(seen.values().next().value);
        await receive(p, value);
      }).catch(() => error(new Error('An incoming packet could not be verified.')));
    };
  }
  function attachIce(p, pc, media) {
    pc.onicecandidate = e => { if (e.candidate) signal(p.id, { kind: 'ice', media, candidate: e.candidate.toJSON() }).catch(error); };
    pc.onconnectionstatechange = () => {
      if (media && pc.connectionState === 'connected') emit({ type: 'call', state: 'active' });
      if (pc.connectionState === 'failed') {
        if (!media && self < p.id) negotiate(p, true).catch(error);
        else error(new Error(media ? 'The call disconnected. End it and try again.' : 'Peer connection failed. Check your network or try relay-only mode.'));
      }
      reportPeers();
    };
  }
  async function negotiate(p, restart) {
    if (!running || p.pc.signalingState !== 'stable') return;
    const offer = await p.pc.createOffer({ iceRestart: !!restart });
    await p.pc.setLocalDescription(offer);
    await signal(p.id, { kind: 'description', description: p.pc.localDescription.toJSON() });
  }
  function makePeer(info, initiate) {
    if (!info || typeof info.id !== 'string' || info.id === self || peers.has(info.id) || peers.size >= 7) return peers.get(info.id);
    const pc = new RTCPeerConnection(config);
    const p = { id: info.id, username: String(info.username).slice(0,24), pc, candidates: [], mediaCandidates: [], send: Promise.resolve() };
    peers.set(p.id, p); attachIce(p, pc, false);
    pc.ondatachannel = e => bindChannel(p, e.channel);
    if (initiate) { bindChannel(p, pc.createDataChannel('hush', { ordered: true })); negotiate(p).catch(error); }
    reportPeers(); return p;
  }
  function drop(id) {
    const p = peers.get(id); if (!p) return;
    p.dc && p.dc.close(); p.pc.close(); p.callPc && p.callPc.close();
    document.getElementById('video-' + id)?.remove();
    peers.delete(id);
    for (const [transferId, t] of transfers) if (t.peer === id) transfers.delete(transferId);
    reportPeers();
  }
  async function handleSignal(event) {
    const p = peers.get(event.from); if (!p) return;
    const value = await open(event.payload);
    if (value.sender !== p.id || value.target !== self) return;
    if (value.kind === 'call-request') {
      if (calling) { await signal(p.id, { kind: 'call-decline' }); return; }
      pendingCall = { peer: p.id, video: !!value.video };
      emit({ type: 'call', state: 'incoming', username: p.username, video: !!value.video });
      return;
    }
    if (value.kind === 'call-accept') {
      if (!calling || !localStream) return;
      outgoingCalls.delete(p.id);
      const pc = mediaPeer(p);
      await pc.setLocalDescription(await pc.createOffer());
      await signal(p.id, { kind: 'description', media: true, description: pc.localDescription.toJSON() });
      return;
    }
    if (value.kind === 'call-end' || value.kind === 'call-decline') {
      outgoingCalls.delete(p.id);
      p.callPc && p.callPc.close(); p.callPc = null;
      document.getElementById('video-' + p.id)?.remove();
      if (pendingCall?.peer === p.id) pendingCall = undefined;
      if (!outgoingCalls.size && !Array.from(peers.values()).some(q => q.callPc)) stopMedia();
      return;
    }
    if (value.kind === 'ice') {
      const pc = value.media ? p.callPc : p.pc;
      const queue = value.media ? p.mediaCandidates : p.candidates;
      if (!pc?.remoteDescription) { if (queue.length < 64) queue.push(value.candidate); return; }
      await pc.addIceCandidate(value.candidate); return;
    }
    if (value.kind === 'description') {
      if (value.media && (!calling || !localStream)) return;
      const pc = value.media ? mediaPeer(p) : p.pc;
      const queue = value.media ? p.mediaCandidates : p.candidates;
      if (!value.description || !['offer','answer'].includes(value.description.type) || typeof value.description.sdp !== 'string') return;
      // Perfect negotiation for data ICE restarts: lower peer ID is impolite.
      if (value.description.type === 'offer' && pc.signalingState !== 'stable') {
        if (self < p.id) return;
        await pc.setLocalDescription({ type: 'rollback' });
      }
      await pc.setRemoteDescription(value.description);
      for (const candidate of queue.splice(0)) await pc.addIceCandidate(candidate);
      if (value.description.type === 'offer') {
        await pc.setLocalDescription(await pc.createAnswer());
        await signal(p.id, { kind: 'description', media: !!value.media, description: pc.localDescription.toJSON() });
      }
    }
  }
  async function poll(epoch) {
    if (!running || epoch !== generation) return;
    try {
      const data = await api('/events');
      if (epoch !== generation) return;
      for (const info of data.peers || []) makePeer(info, false);
      const current = new Set((data.peers || []).map(p => p.id));
      for (const id of peers.keys()) if (!current.has(id)) drop(id);
      for (const event of data.events || []) {
        if (event.type === 'joined') makePeer(event, false);
        else if (event.type === 'left') drop(event.id);
        else if (event.type === 'signal') await handleSignal(event).catch(error);
      }
      emit({ type: 'connection', state: 'connected' });
    } catch (e) {
      if (epoch !== generation) return;
      if (e.status === 401) { await leave(); error(e); return; }
      emit({ type: 'connection', state: 'reconnecting' });
    }
    if (running && epoch === generation) pollTimer = setTimeout(() => poll(epoch), 1200);
  }
  async function enter(command) {
    if (running) throw new Error('Leave the current room first.');
    if (!crypto.subtle || !window.RTCPeerConnection) throw new Error('This device does not support secure peer connections.');
    username = String(command.username || '').trim();
    if (!username || username.length > 24) throw new Error('Choose a username of 1–24 characters.');
    key = command.type === 'create' ? 'hush_' + b64(crypto.getRandomValues(new Uint8Array(32))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'') : String(command.key || '').trim();
    if (!/^hush_[A-Za-z0-9_-]{43}$/.test(key)) throw new Error('Enter a valid private room key.');
    const raw = unb64(key.slice(5).replace(/-/g,'+').replace(/_/g,'/') + '=');
    aes = await crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt','decrypt']);
    raw.fill(0);
    forceRelay = !!command.forceRelay;
    const joined = await api('', { create: command.type === 'create', username, roomHash: await digest(enc.encode('hush-room:' + key)) });
    token = joined.token; self = joined.peerId; running = true; generation++;
    try { await ice(); } catch (e) { await leave(false); throw e; }
    emit({ type: 'joined', key, peerId: self, username });
    for (const info of joined.peers) makePeer(info, true);
    reportPeers(); poll(generation);
    relayTimer = setInterval(() => ice().catch(error), 240000);
  }
  async function sendPacket(p, value) {
    const work = async () => {
      if (!p.dc || p.dc.readyState !== 'open') throw new Error('A peer is not connected. Retry when they are online.');
      const payload = await seal({ ...value, sender: self, id: randomId() });
      const deadline = Date.now() + 30000;
      while (p.dc.bufferedAmount > 131072) {
        if (Date.now() > deadline || p.dc.readyState !== 'open') throw new Error('Transfer interrupted. Retry the file.');
        await pause(20);
      }
      p.dc.send(payload);
    };
    const task = p.send.then(work); p.send = task.catch(() => {}); return task;
  }
  function connected() {
    const result = Array.from(peers.values()).filter(p => p.dc?.readyState === 'open');
    if (!result.length) throw new Error('Nobody is connected yet. Share your private key to invite someone.');
    return result;
  }
  async function text(value) {
    const content = String(value || '').trim();
    if (!content || content.length > 4000) throw new Error('Messages must be 1–4,000 characters.');
    const id = randomId(), time = Date.now(), targets = connected();
    await Promise.all(targets.map(p => sendPacket(p, { kind: 'text', text: content, messageId: id, time })));
    emit({ type: 'message', id, username, text: content, time, own: true });
  }
  function cleanName(name) { return String(name || 'file').replace(/[\/\\\x00-\x1f\x7f]/g, '_').slice(0,120) || 'file'; }
  async function sendFile(command) {
    if (sendingFile) throw new Error('Wait for the current transfer to finish.');
    if (typeof command.base64 !== 'string' || command.base64.length > Math.ceil(MAX / 3) * 4) throw new Error('Files must be 20 MB or smaller.');
    const bytes = unb64(command.base64);
    if (!bytes.length || bytes.length > MAX) throw new Error('Choose a nonempty file of 20 MB or less.');
    const targets = connected(), id = randomId(), name = cleanName(command.name), size = bytes.length, time = Date.now();
    sendingFile = true;
    try {
      const hash = await digest(bytes);
      const mime = /^[\w.+-]+\/[\w.+-]+$/.test(command.mime || '') ? command.mime : 'application/octet-stream';
      for (const p of targets) {
        await sendPacket(p, { kind: 'file-start', transfer: id, name, size, hash, mime });
        let index = 0;
        for (let offset = 0; offset < size; offset += 12288) {
          await sendPacket(p, { kind: 'file-chunk', transfer: id, index: index++, bytes: b64(bytes.subarray(offset, offset + 12288)) });
          emit({ type: 'transfer', progress: Math.min(99, Math.round((offset + 12288) / size * 100)) });
          await pause(4);
        }
        await sendPacket(p, { kind: 'file-end', transfer: id });
      }
      emit({ type: 'file', id, username, name, size, time, own: true });
      emit({ type: 'transfer', progress: 100 });
    } finally { sendingFile = false; bytes.fill(0); }
  }
  async function receive(p, value) {
    if (value.kind === 'text') {
      if (typeof value.text !== 'string' || value.text.length > 4000 || typeof value.messageId !== 'string') return;
      emit({ type: 'message', id: p.id + value.messageId, username: p.username, text: value.text, time: Date.now(), own: false }); return;
    }
    if (typeof value.transfer !== 'string' || value.transfer.length > 80) return;
    const id = p.id + ':' + value.transfer;
    if (value.kind === 'file-start') {
      if (!Number.isInteger(value.size) || value.size < 1 || value.size > MAX || !/^[a-f0-9]{64}$/.test(value.hash) || transfers.size >= 2 || retainedBytes + value.size > 40 * 1024 * 1024) {
        throw new Error('Incoming file exceeds room memory limits. Clear files or rejoin.');
      }
      transfers.set(id, { peer: p.id, name: cleanName(value.name), size: value.size, hash: value.hash, mime: 'application/octet-stream', chunks: [], length: 0, index: 0, at: Date.now() }); return;
    }
    const t = transfers.get(id); if (!t) return;
    if (value.kind === 'file-chunk') {
      if (value.index !== t.index || typeof value.bytes !== 'string' || value.bytes.length > 16384) { transfers.delete(id); throw new Error('File chunk order failed.'); }
      const bytes = unb64(value.bytes);
      if (!bytes.length || t.length + bytes.length > t.size) { transfers.delete(id); throw new Error('File size verification failed.'); }
      t.chunks.push(bytes); t.length += bytes.length; t.index++; t.at = Date.now();
    } else if (value.kind === 'file-end') {
      transfers.delete(id);
      if (t.length !== t.size || retainedBytes + t.size > 40 * 1024 * 1024) throw new Error('Incomplete file or memory limit reached.');
      const bytes = new Uint8Array(t.size); let offset = 0;
      for (const chunk of t.chunks) { bytes.set(chunk, offset); offset += chunk.length; }
      if (await digest(bytes) !== t.hash) { bytes.fill(0); throw new Error('File integrity check failed. Please resend.'); }
      files.set(id, { bytes, name: t.name, mime: t.mime }); retainedBytes += bytes.length;
      emit({ type: 'file', id, username: p.username, name: t.name, size: bytes.length, time: Date.now(), own: false });
    }
  }
  setInterval(() => { for (const [id,t] of transfers) if (Date.now() - t.at > 45000) transfers.delete(id); }, 10000);
  function save(id) {
    const file = files.get(id); if (!file) throw new Error('This file is no longer in memory.');
    if (native) emit({ type: 'saveFile', id, name: file.name, mime: file.mime, base64: b64(file.bytes) });
    else {
      const url = URL.createObjectURL(new Blob([file.bytes], { type: file.mime }));
      const link = document.createElement('a'); link.href = url; link.download = file.name; link.click(); setTimeout(() => URL.revokeObjectURL(url), 10000);
    }
  }
  async function acquire(video) {
    if (!navigator.mediaDevices?.getUserMedia) throw new Error('Microphone/camera access is not available in this preview. A supported device build is required.');
    try {
      localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: video ? { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } : false });
      document.getElementById('local').srcObject = localStream;
      document.getElementById('hint').textContent = 'Calls use WebRTC encryption';
    } catch { throw new Error('Microphone or camera permission was denied or unavailable. Allow access in device settings and try again.'); }
  }
  function mediaPeer(p) {
    if (p.callPc) return p.callPc;
    const pc = new RTCPeerConnection(config); p.callPc = pc; attachIce(p, pc, true);
    for (const track of localStream.getTracks()) pc.addTrack(track, localStream);
    pc.ontrack = event => {
      let video = document.getElementById('video-' + p.id);
      if (!video) { video = document.createElement('video'); video.id = 'video-' + p.id; video.autoplay = true; video.playsInline = true; document.getElementById('media').appendChild(video); }
      video.srcObject = event.streams[0] || new MediaStream([event.track]);
      video.play().catch(() => { video.controls = true; document.getElementById('hint').textContent = 'Tap play to hear the call'; });
    };
    return pc;
  }
  function stopMedia() {
    if (localStream) localStream.getTracks().forEach(track => track.stop());
    localStream = undefined; calling = false; pendingCall = undefined; outgoingCalls.clear();
    document.getElementById('local').srcObject = null;
    for (const video of document.querySelectorAll('#media video:not(#local)')) video.remove();
    emit({ type: 'call', state: 'ended' });
  }
  async function endCall() {
    for (const p of peers.values()) {
      if (calling || p.callPc || pendingCall?.peer === p.id) await signal(p.id, { kind: 'call-end' }).catch(() => {});
      p.callPc?.close(); p.callPc = null; p.mediaCandidates = [];
    }
    stopMedia();
  }
  async function call(video) {
    if (calling || localStream) throw new Error('End your current call first.');
    const targets = connected();
    await acquire(video); calling = true;
    targets.forEach(p => outgoingCalls.add(p.id));
    emit({ type: 'call', state: 'calling', video });
    await Promise.all(targets.map(p => signal(p.id, { kind: 'call-request', video })));
    const epoch = generation;
    setTimeout(() => {
      if (epoch !== generation) return;
      if (calling && !Array.from(peers.values()).some(p => p.callPc?.connectionState === 'connected')) {
        endCall().catch(error); error(new Error('No one answered or the call could not connect. Please try again.'));
      }
    }, 60000);
  }
  async function accept() {
    const incoming = pendingCall; if (!incoming) return;
    await acquire(incoming.video); calling = true; pendingCall = undefined;
    emit({ type: 'call', state: 'calling', video: incoming.video });
    await signal(incoming.peer, { kind: 'call-accept' });
  }
  async function leave(notify = true) {
    generation++; running = false; clearTimeout(pollTimer); clearInterval(relayTimer);
    const departedToken = token;
    stopMedia();
    for (const id of Array.from(peers.keys())) drop(id);
    for (const file of files.values()) file.bytes.fill(0);
    files.clear(); transfers.clear(); seen.clear(); retainedBytes = 0;
    key = ''; aes = undefined; token = ''; self = ''; username = '';
    if (notify) emit({ type: 'left' });
    // Clear sensitive local state before waiting for any network operation.
    if (departedToken) fetch('/api/rooms/leave', {
      method: 'POST', headers: { Authorization: 'Bearer ' + departedToken, 'Content-Type': 'application/json' },
      body: '{}', signal: AbortSignal.timeout(5000), keepalive: true
    }).catch(() => {});
  }
  let busy = false;
  async function command(value) {
    try {
      if (!value || typeof value.type !== 'string') return;
      if (value.type === 'create' || value.type === 'join') {
        if (busy) return; busy = true;
        try { await enter(value); } finally { busy = false; }
      } else if (value.type === 'leave') await leave();
      else if (!running) throw new Error('Join a room first.');
      else if (value.type === 'text') await text(value.text);
      else if (value.type === 'file') await sendFile(value);
      else if (value.type === 'save') save(value.id);
      else if (value.type === 'call') await call(!!value.video);
      else if (value.type === 'accept') await accept();
      else if (value.type === 'decline') { if (pendingCall) await signal(pendingCall.peer, { kind: 'call-decline' }); pendingCall = undefined; emit({ type: 'call', state: 'ended' }); }
      else if (value.type === 'endCall') await endCall();
      else if (value.type === 'mute') localStream?.getAudioTracks().forEach(track => { track.enabled = !value.muted; });
      else if (value.type === 'camera') {
        if (!localStream?.getVideoTracks().length) throw new Error('Start a video call to enable the camera.');
        localStream.getVideoTracks().forEach(track => { track.enabled = !!value.enabled; });
      }
    } catch (e) { error(e); }
  }
  function message(event) {
    if (handledEvents.has(event)) return;
    handledEvents.add(event);
    if (!native) {
      if (event.source !== window.parent || (parentOrigin && event.origin !== parentOrigin)) return;
      if (!parentOrigin) parentOrigin = event.origin;
    }
    try { command(typeof event.data === 'string' ? JSON.parse(event.data) : event.data); } catch {}
  }
  window.addEventListener('message', message);
  if (native) document.addEventListener('message', message);
  window.addEventListener('pagehide', () => { if (localStream) localStream.getTracks().forEach(t => t.stop()); });
  emit({ type: 'ready' });
})();
`;
