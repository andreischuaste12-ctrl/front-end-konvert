import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { startPinningProxy } from '../scripts/_pinning.mjs';

const listen = (server) => new Promise((resolve, reject) => {
  server.once('error', reject);
  server.listen(0, '127.0.0.1', resolve);
});
const close = (server) => new Promise((resolve) => server.close(resolve));
const requestThrough = (proxyUrl, target) => new Promise((resolve, reject) => {
  const proxy = new URL(proxyUrl);
  const request = http.request({ hostname: proxy.hostname, port: proxy.port, path: target, method: 'GET' }, (response) => {
    const chunks = [];
    response.on('data', (chunk) => chunks.push(chunk));
    response.on('end', () => resolve({ status: response.statusCode, body: Buffer.concat(chunks).toString() }));
  });
  request.on('error', reject);
  request.end();
});

test('proxy pins an approved hostname to the validated address and preserves Host', async (t) => {
  let seenHost;
  const upstream = http.createServer((request, response) => {
    seenHost = request.headers.host;
    response.end('pinned');
  });
  await listen(upstream);
  t.after(() => close(upstream));
  const proxy = await startPinningProxy();
  t.after(() => proxy.close());
  proxy.configure({
    allowPrivate: true,
    lookup: async () => [{ address: '127.0.0.1', family: 4 }],
    targetCheck: () => null,
  });
  const port = upstream.address().port;
  const result = await requestThrough(proxy.server, `http://public.example:${port}/hello`);
  assert.equal(result.status, 200);
  assert.equal(result.body, 'pinned');
  assert.equal(seenHost, `public.example:${port}`);
});

test('proxy refuses a hostname that resolves to a private address', async (t) => {
  const blocked = [];
  const proxy = await startPinningProxy();
  t.after(() => proxy.close());
  proxy.configure({
    allowPrivate: false,
    lookup: async () => [{ address: '10.0.0.8', family: 4 }],
    targetCheck: () => null,
    onBlocked: (host) => blocked.push(host),
  });
  const result = await requestThrough(proxy.server, 'http://public.example/');
  assert.equal(result.status, 403);
  assert.deepEqual(blocked, ['public.example']);
});

test('proxy applies the URL policy before DNS resolution', async (t) => {
  let lookups = 0;
  const proxy = await startPinningProxy();
  t.after(() => proxy.close());
  proxy.configure({
    lookup: async () => { lookups += 1; return [{ address: '203.0.113.2', family: 4 }]; },
    targetCheck: (url) => new URL(url).hostname === 'metadata.example' ? 'blocked' : null,
  });
  const result = await requestThrough(proxy.server, 'http://metadata.example/latest');
  assert.equal(result.status, 403);
  assert.equal(lookups, 0);
});
