import test from 'node:test';
import assert from 'node:assert/strict';
import {
  intList,
  redactText,
  redactUrl,
  resolveRoutes,
  routeSlug,
  targetBlockReason,
} from '../scripts/_common.mjs';

test('shared redaction removes credentials, private values, and URL details', () => {
  const credentialUrl = ['https://', 'user', ':', 'synthetic-password', '@', 'example.com/account?id=42#token'].join('');
  assert.equal(redactUrl(credentialUrl), 'https://example.com/[path-redacted]');
  assert.equal(redactUrl('file:///home/person/private.html'), 'file://[local-path-redacted]');
  const safe = redactText('email=user@example.com Authorization: Bearer abc.def.ghi https://example.com/private?q=secret');
  assert.ok(!safe.includes('user@example.com'));
  assert.ok(!safe.includes('abc.def.ghi'));
  assert.ok(!safe.includes('q=secret'));
});

test('route helpers keep routes on the same protocol and produce stable slugs', () => {
  const base = new URL('https://example.com/base');
  assert.deepEqual(resolveRoutes(base, '/products,checkout').map((url) => url.href), [
    'https://example.com/products',
    'https://example.com/checkout',
  ]);
  assert.throws(() => resolveRoutes(base, 'file:///tmp/private'), /protocolo/);
  assert.equal(routeSlug(new URL('https://example.com/Product Details?q=1')), 'product-details-q');
  assert.deepEqual(intList('320, 768, bad, 5000', { min: 300, max: 1000 }), [320, 768]);
});

test('URL policy blocks metadata and private literals unless explicitly allowed', () => {
  assert.match(targetBlockReason('http://169.254.169.254/latest/meta-data'), /metadata|reserved/);
  assert.match(targetBlockReason('http://10.0.0.8/'), /private/);
  assert.equal(targetBlockReason('http://10.0.0.8/', { allowPrivate: true }), null);
  assert.equal(targetBlockReason('https://example.com/'), null);
  assert.match(targetBlockReason('ftp://example.com/'), /unsupported/);
});
