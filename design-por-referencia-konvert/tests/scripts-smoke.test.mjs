import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const runFile = promisify(execFile);
const scripts = [
  'capture.mjs',
  'extract-styles.mjs',
  'image-manifest.mjs',
  'compare.mjs',
  'detect-stack.mjs',
];

test('every public CLI parses and exposes help without browser or network access', async () => {
  for (const name of scripts) {
    const file = fileURLToPath(new URL(`../scripts/${name}`, import.meta.url));
    const checked = await runFile(process.execPath, ['--check', file]);
    assert.equal(checked.stderr, '', `${name} syntax`);
    const help = await runFile(process.execPath, [file, '--help']);
    assert.match(help.stdout, /Usage|Uso/, `${name} help`);
  }
});
