import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const runFile = promisify(execFile);
const script = fileURLToPath(new URL('../scripts/image-manifest.mjs', import.meta.url));
async function run(args) {
  try { return { code: 0, ...(await runFile(process.execPath, [script, ...args])) }; }
  catch (error) { return { code: error.code, stdout: error.stdout, stderr: error.stderr }; }
}

test('image inventory help and required-input contract are stable', async () => {
  const help = await run(['--help']);
  assert.equal(help.code, 0);
  assert.match(help.stdout, /image-manifest\.mjs/);
  const missing = await run([]);
  assert.notEqual(missing.code, 0);
  assert.match(missing.stdout, /--root/);
});

test('image inventory rejects conflicting or dependent options', async () => {
  const conflict = await run(['--root', '.', '--save-images', '--no-save']);
  assert.notEqual(conflict.code, 0);
  assert.match(conflict.stderr, /não ambos/);
  const sourceMap = await run(['--source-map', 'private.json']);
  assert.notEqual(sourceMap.code, 0);
  assert.match(sourceMap.stderr, /exige --root/);
});
