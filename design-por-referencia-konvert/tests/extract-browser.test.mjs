import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const runFile = promisify(execFile);
const script = fileURLToPath(new URL('../scripts/extract-styles.mjs', import.meta.url));

test('contrast sampling attributes nested link text to the link, not its list-item parent', { timeout: 60000 }, async (t) => {
  const server = http.createServer((_request, response) => {
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    response.end('<!doctype html><html lang="en"><style>body{background:#fff;color:#111}a{color:#777}</style><body><ul><li><a href="/next">Low contrast link</a></li></ul></body></html>');
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const out = await fs.mkdtemp(path.join(os.tmpdir(), 'extract-contrast-'));
  t.after(() => fs.rm(out, { recursive: true, force: true }));
  const url = `http://127.0.0.1:${server.address().port}/`;
  await runFile(process.execPath, [script, '--url', url, '--allow-private', '--out', out, '--width', '375']);
  const report = JSON.parse(await fs.readFile(path.join(out, 'computed-styles.json'), 'utf8'));
  const listItem = report.elements.find((entry) => entry.category === 'li');
  const link = report.elements.find((entry) => entry.category === 'a');
  assert.equal(listItem?.contrastStatus, 'indeterminado');
  assert.equal(link?.contrastStatus, 'falha');
  assert.equal(report.elements.filter((entry) => entry.contrastStatus === 'falha').length, 1);
});
