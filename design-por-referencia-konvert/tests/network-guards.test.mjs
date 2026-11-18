import test from 'node:test';
import assert from 'node:assert/strict';
import { ipBlockReason, networkHost } from '../scripts/_network.mjs';
import { resolvedBlockReason } from '../scripts/_common.mjs';

test('literal network policy covers private, metadata, reserved, and embedded ranges', () => {
  assert.equal(networkHost('[2001:DB8::1]'), '2001:db8::1');
  assert.equal(networkHost('Example.COM.'), 'example.com');
  assert.match(ipBlockReason('169.254.169.254'), /metadata/);
  assert.match(ipBlockReason('100.100.100.200'), /metadata/);
  assert.match(ipBlockReason('10.1.2.3'), /private/);
  assert.equal(ipBlockReason('10.1.2.3', true), null);
  assert.match(ipBlockReason('::ffff:a00:1'), /private/);
  assert.match(ipBlockReason('2001:db8::1'), /reserved|non-routable/);
});

test('resolved hostnames are blocked when any returned address is unsafe', async () => {
  const privateResult = await resolvedBlockReason('public.example', {
    lookup: async () => [
      { address: '93.184.216.34', family: 4 },
      { address: '10.0.0.8', family: 4 },
    ],
  });
  assert.match(privateResult, /private.*resolved address/);
  const publicResult = await resolvedBlockReason('public.example', {
    lookup: async () => [{ address: '93.184.216.34', family: 4 }],
  });
  assert.equal(publicResult, null);
});

test('DNS failures stay blocked unless explicitly accepted', async () => {
  let failures = 0;
  const lookup = async () => { throw new Error('offline'); };
  assert.match(await resolvedBlockReason('example.test', { lookup, onFailure: () => { failures += 1; } }), /DNS resolution failed/);
  assert.equal(await resolvedBlockReason('example.test', { lookup, allowUnresolvedDns: true }), null);
  assert.equal(failures, 1);
});
