import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const runFile = promisify(execFile);
const script = fileURLToPath(new URL('../scripts/extract-styles.mjs', import.meta.url));
async function run(args) {
  try { return { code: 0, ...(await runFile(process.execPath, [script, ...args])) }; }
  catch (error) { return { code: error.code, stdout: error.stdout, stderr: error.stderr }; }
}

test('extract-styles help is available without launching a browser', async () => {
  const result = await run(['--help']);
  assert.equal(result.code, 0);
  assert.match(result.stdout, /extract-styles\.mjs/);
});

test('extract-styles rejects unsafe option combinations before browser work', async () => {
  const detailWithoutAxe = await run(['--url', 'https://example.com', '--axe-details', 'private.json']);
  assert.notEqual(detailWithoutAxe.code, 0);
  assert.match(detailWithoutAxe.stderr, /exige --axe/);
  const width = await run(['--url', 'https://example.com', '--width', '99']);
  assert.notEqual(width.code, 0);
  assert.match(width.stderr, /entre 200 e 4000/);
  const scheme = await run(['--url', 'https://example.com', '--scheme', 'sepia']);
  assert.notEqual(scheme.code, 0);
  assert.match(scheme.stderr, /light ou dark/);
});
