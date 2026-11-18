// Local forward proxy that resolves each destination once, validates every returned
// address, and connects to the selected address. This prevents a later DNS answer from
// redirecting an inspected browser context to a private or metadata endpoint.
import http from 'node:http';
import https from 'node:https';
import net, { isIP } from 'node:net';
import { lookup as dnsLookup } from 'node:dns/promises';
import { ipBlockReason, networkHost } from './_network.mjs';

const DEFAULT_TIMEOUT = 5000;

function authority(value, defaultPort) {
  try {
    const parsed = new URL(`http://${value}`);
    const port = Number(parsed.port || defaultPort);
    if (!parsed.hostname || !Number.isInteger(port) || port < 1 || port > 65535) return null;
    return { host: networkHost(parsed.hostname), port };
  } catch {
    return null;
  }
}

async function resolvePinned(host, config) {
  const literalFamily = isIP(host);
  if (literalFamily) {
    const reason = ipBlockReason(host, config.allowPrivate);
    if (reason) throw new Error(reason);
    return { address: host, family: literalFamily };
  }

  let answers;
  try {
    answers = await config.lookup(host, { all: true, verbatim: true });
  } catch {
    if (config.allowUnresolvedDns) return { address: host, family: 0, unresolved: true };
    throw new Error('DNS resolution failed; blocked by policy');
  }
  if (!Array.isArray(answers) || answers.length === 0) {
    if (config.allowUnresolvedDns) return { address: host, family: 0, unresolved: true };
    throw new Error('DNS resolution failed; blocked by policy');
  }
  for (const answer of answers) {
    const address = String(answer?.address ?? '').split('%')[0];
    const family = isIP(address);
    if (!family) throw new Error('Unexpected resolver output is blocked');
    const normalized = family === 6 ? networkHost(new URL(`http://[${address}]/`).hostname) : address;
    const reason = ipBlockReason(normalized, config.allowPrivate);
    if (reason) throw new Error(reason);
  }
  const first = answers[0];
  return { address: String(first.address).split('%')[0], family: Number(first.family) || isIP(first.address) };
}

function blocked(response, host, config) {
  config.onBlocked(host);
  if (response?.writeHead) {
    response.writeHead(403, { 'content-type': 'text/plain; charset=utf-8', connection: 'close' });
    response.end('Blocked by inspection network policy.');
  } else {
    response?.end('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n');
    response?.destroy();
  }
}

export async function startPinningProxy() {
  let config = {
    allowPrivate: false,
    allowUnresolvedDns: false,
    lookup: dnsLookup,
    targetCheck: () => null,
    onBlocked: () => {},
  };
  const sockets = new Set();

  const server = http.createServer(async (request, response) => {
    let target;
    try { target = new URL(request.url); }
    catch { response.writeHead(400); response.end(); return; }
    if (!['http:', 'https:'].includes(target.protocol)) { blocked(response, target.hostname || 'invalid', config); return; }
    const host = networkHost(target.hostname);
    if (config.targetCheck(target.href)) { blocked(response, host, config); return; }

    let pinned;
    try { pinned = await resolvePinned(host, config); }
    catch { blocked(response, host, config); return; }

    const headers = { ...request.headers, host: target.host };
    delete headers['proxy-authorization'];
    delete headers['proxy-connection'];
    const transport = target.protocol === 'https:' ? https : http;
    const requestOptions = {
      protocol: target.protocol,
      hostname: host,
      port: Number(target.port || (target.protocol === 'https:' ? 443 : 80)),
      method: request.method,
      path: `${target.pathname}${target.search}`,
      headers,
      servername: isIP(host) ? undefined : host,
      timeout: DEFAULT_TIMEOUT,
    };
    if (!pinned.unresolved) requestOptions.lookup = (_name, options, callback) => {
        const family = pinned.family || isIP(pinned.address) || options?.family || 0;
        if (options?.all) callback(null, [{ address: pinned.address, family }]);
        else callback(null, pinned.address, family);
      };
    const upstream = transport.request(requestOptions, (upstreamResponse) => {
      response.writeHead(upstreamResponse.statusCode ?? 502, upstreamResponse.headers);
      upstreamResponse.pipe(response);
    });
    upstream.on('timeout', () => upstream.destroy(new Error('upstream timeout')));
    upstream.on('error', () => { if (!response.headersSent) response.writeHead(502); response.end(); });
    request.pipe(upstream);
  });

  server.on('connect', async (request, client, head) => {
    const parsed = authority(request.url, 443);
    if (!parsed) { client.end('HTTP/1.1 400 Bad Request\r\nConnection: close\r\n\r\n'); return; }
    const { host, port } = parsed;
    if (config.targetCheck(`https://${isIP(host) === 6 ? `[${host}]` : host}:${port}/`)) { blocked(client, host, config); return; }
    let pinned;
    try { pinned = await resolvePinned(host, config); }
    catch { blocked(client, host, config); return; }

    const upstream = net.connect({ host: pinned.address, port, family: pinned.family || undefined });
    sockets.add(upstream);
    upstream.setTimeout(DEFAULT_TIMEOUT, () => upstream.destroy());
    upstream.once('connect', () => {
      client.write('HTTP/1.1 200 Connection Established\r\n\r\n');
      if (head.length) upstream.write(head);
      client.pipe(upstream).pipe(client);
    });
    upstream.once('error', () => client.destroy());
    upstream.once('close', () => sockets.delete(upstream));
  });

  server.on('connection', (socket) => {
    sockets.add(socket);
    socket.once('close', () => sockets.delete(socket));
  });

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const address = server.address();
  return {
    server: `http://127.0.0.1:${address.port}`,
    configure(next = {}) { config = { ...config, ...next }; },
    async close() {
      for (const socket of sockets) socket.destroy();
      if (server.listening) await new Promise((resolve) => server.close(resolve));
    },
  };
}
