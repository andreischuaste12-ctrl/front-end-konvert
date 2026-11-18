import test from 'node:test';
import assert from 'node:assert/strict';
import { compareStyles } from '../scripts/compare.mjs';

const capture = (overrides = {}) => ({
  meta: { width: 1440, scheme: 'light', url: 'https://example.test/' },
  elements: [{
    category: 'button', selector: 'button.primary', text: 'Buy',
    rect: { x: 10, y: 20, w: 120, h: 44 }, fontSize: '16px',
    fontWeight: '700', color: '#ffffff', background: '#0055aa', count: 1,
  }],
  ...overrides,
});

test('style comparison reports stable numeric deltas', () => {
  const before = capture();
  const after = capture({ elements: [{ ...capture().elements[0], fontSize: '18px', rect: { x: 14, y: 20, w: 120, h: 44 } }] });
  const result = compareStyles(before, after);
  assert.equal(result.entries[0].status, 'changed');
  assert.deepEqual(result.entries[0].changes.find((change) => change.field === 'fontSize').delta, { amount: 2, unit: 'px' });
  assert.deepEqual(result.entries[0].changes.find((change) => change.field === 'rect.x').delta, { amount: 4, unit: 'px' });
});

test('style comparison rejects mismatched viewports, URLs, and ambiguous identities', () => {
  assert.throws(() => compareStyles(capture(), capture({ meta: { width: 375, scheme: 'light' } })), /same viewport/);
  assert.throws(() => compareStyles(capture(), capture({ meta: { width: 1440, scheme: 'light', url: 'https://other.test/' } })), /page mapping/);
  assert.doesNotThrow(() => compareStyles(capture(), capture({ meta: { width: 1440, scheme: 'light', url: 'https://other.test/' } }), { confirmPageMapping: true }));
  const duplicate = capture({ elements: [capture().elements[0], { ...capture().elements[0] }] });
  assert.throws(() => compareStyles(duplicate, capture()), /Ambiguous/);
});

test('added and removed elements remain explicit', () => {
  const added = compareStyles(capture({ elements: [] }), capture());
  const removed = compareStyles(capture(), capture({ elements: [] }));
  assert.equal(added.entries[0].status, 'added');
  assert.equal(removed.entries[0].status, 'removed');
});
