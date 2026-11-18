import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { clientHtml, failureMessage, renderPdf } from '../scripts/render-client-pdf.mjs';

const example = JSON.parse(await fs.readFile(new URL('../examples/audit-report.example.json', import.meta.url), 'utf8'));

test('client report explains evidence, rationale, improvement, verification and limitations', () => {
  const { html } = clientHtml(example);
  for (const expected of ['UX-001', 'O que foi observado', 'Por que isso importa', 'Como melhorar', 'Como verificar a melhoria', 'Precisa de validação', 'Limites da evidência', 'Estados não observados, bloqueados ou não aplicáveis']) assert.ok(html.includes(expected), expected);
  assert.ok(html.indexOf('UX-001') < html.indexOf('UX-003'));
  assert.ok(html.includes(example.findings[0].next_step));
  assert.ok(html.includes('Aprovado no relatório'));
  assert.ok(html.includes('Não aprovado para implementação no relatório'));
});

test('rejects invalid reports and escapes report content as text', () => {
  assert.throws(() => clientHtml({}), /Relatório inválido/);
  const report = structuredClone(example);
  report.project = '<img src=x onerror=alert(1)>';
  const { html } = clientHtml(report);
  assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;'));
  assert.ok(!html.includes('<img src=x'));
  report.scope.tasks = [{ toString: null }];
  assert.doesNotThrow(() => clientHtml(report));
});

test('the finding title heads its section, the location stays visible, and findings flow without forced page breaks', () => {
  const { html } = clientHtml(example);
  assert.ok(html.includes(`<h2>${example.findings[0].title}</h2>`));
  assert.ok(html.includes('<h3>Onde</h3>'));
  assert.ok(html.includes(`${example.findings[0].title} (Problema observado)`), 'the priorities list names the problem');
  assert.ok(!/break-before:\s*page/.test(html), 'a short overflow must not leave a nearly empty page');
  const untitled = structuredClone(example);
  for (const finding of untitled.findings) delete finding.title;
  const legacy = clientHtml(untitled).html;
  assert.ok(legacy.includes(`<h2>${example.findings[0].location}</h2>`), 'reports without titles keep the location heading');
  assert.ok(!legacy.includes('<h3>Onde</h3>'));
});

test('failures name their cause without echoing local paths or report content', () => {
  const local = { code: 'EEXIST', path: 'C:\\Users\\someone\\a.pdf', message: "EEXIST: file already exists, open 'C:\\Users\\someone\\a.pdf'" };
  assert.match(failureMessage(local), /já existe e não foi sobrescrito/);
  assert.ok(!failureMessage(local).includes('someone'));
  let invalid;
  try { clientHtml({}); } catch (error) { invalid = error; }
  assert.equal(invalid.code, 'INVALID_REPORT');
  assert.match(failureMessage(invalid), /validate-report\.mjs/);
  assert.match(failureMessage(invalid), /report_id must be a non-empty string/);
  assert.match(failureMessage({ code: 'PLAYWRIGHT_MISSING' }), /não instale nada no projeto auditado/);
  assert.match(failureMessage({ code: 'BROWSER_SCRIPTS_MISSING' }), /scriptsDir retornado por prepare-browser\.mjs/);
  assert.match(failureMessage(new Error('boom at /home/someone/x')), /detalhes locais foram omitidos/);
  assert.ok(!failureMessage(new Error('boom at /home/someone/x')).includes('someone'));
});

test('the CLI reports usage, invalid reports and a missing browser runtime before launching anything', async (t) => {
  const run = promisify(execFile);
  const script = fileURLToPath(new URL('../scripts/render-client-pdf.mjs', import.meta.url));
  const report = fileURLToPath(new URL('../examples/audit-report.example.json', import.meta.url));
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'render-pdf-cli-'));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  const out = path.join(dir, 'x.pdf');
  // Run from the empty temp directory so no project-level Playwright can be resolved.
  const cli = (args) => run(process.execPath, [script, ...args], { cwd: dir }).then(() => ({ code: 0, stderr: '' }), (error) => ({ code: error.code, stderr: error.stderr }));

  const usage = await cli([report]);
  assert.equal(usage.code, 2);
  assert.match(usage.stderr, /^Uso: /);

  const bad = path.join(dir, 'bad.json');
  await fs.writeFile(bad, '{"schema_version":2}');
  const invalid = await cli([bad, '--out', out, '--browser-scripts', dir]);
  assert.equal(invalid.code, 1);
  assert.match(invalid.stderr, /Relatório inválido para o PDF/);

  const unreadable = await cli([path.join(dir, 'absent.json'), '--out', out, '--browser-scripts', dir]);
  assert.match(unreadable.stderr, /Não foi possível ler o relatório como JSON/);

  const noScripts = await cli([report, '--out', out, '--browser-scripts', dir]);
  assert.equal(noScripts.code, 1);
  assert.match(noScripts.stderr, /scripts de navegador não foram encontrados/);

  await fs.writeFile(path.join(dir, '_common.mjs'), 'export const loadPlaywright = () => { throw new Error("must not load"); };');
  const noPlaywright = await cli([report, '--out', out, '--browser-scripts', dir]);
  assert.equal(noPlaywright.code, 1);
  assert.match(noPlaywright.stderr, /Playwright não está disponível/);
  for (const result of [usage, invalid, unreadable, noScripts, noPlaywright]) assert.ok(!result.stderr.includes(dir), 'no local path in the message');
  await assert.rejects(fs.access(out), 'no PDF is created on failure');
});

// Browser selection is verified with a stub `_common.mjs`, so no browser is launched here.
const ENV = 'PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH';

async function stubBrowserScripts(t) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'render-pdf-stub-'));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  const scripts = path.join(dir, 'scripts');
  await fs.mkdir(scripts);
  await fs.writeFile(path.join(scripts, '_common.mjs'), `
    export const loadPlaywright = () => ({});
    export async function launch() {
      globalThis.__seenBrowserPath = process.env.${ENV};
      return { close: async () => {}, newPage: async () => ({ route: async () => {}, setContent: async () => {}, pdf: async () => Buffer.from('%PDF-stub') }) };
    }
  `);
  return scripts;
}

async function withEnv(value, task) {
  const previous = process.env[ENV];
  if (value === undefined) delete process.env[ENV]; else process.env[ENV] = value;
  delete globalThis.__seenBrowserPath;
  try { return await task(); }
  finally { if (previous === undefined) delete process.env[ENV]; else process.env[ENV] = previous; }
}

test('PDF rendering uses the browser discovered by the diagnostics and restores the environment', async (t) => {
  const browserScripts = await stubBrowserScripts(t);
  const out = path.join(path.dirname(browserScripts), 'a.pdf');
  const asked = [];
  await withEnv(undefined, async () => {
    await renderPdf({ input: example, out, browserScripts, prepare: async (dir) => { asked.push(dir); return { status: 'ready', executablePath: '/discovered/chromium' }; } });
    assert.equal(globalThis.__seenBrowserPath, '/discovered/chromium');
    assert.equal(process.env[ENV], undefined);
  });
  assert.deepEqual(asked, [path.dirname(browserScripts)]);
});

test('an explicit browser override wins and skips discovery; failed discovery falls back to the default launch', async (t) => {
  const browserScripts = await stubBrowserScripts(t);
  const dir = path.dirname(browserScripts);
  await withEnv('/explicit/chromium', async () => {
    await renderPdf({ input: example, out: path.join(dir, 'b.pdf'), browserScripts, prepare: () => { throw new Error('must not probe'); } });
    assert.equal(globalThis.__seenBrowserPath, '/explicit/chromium');
    assert.equal(process.env[ENV], '/explicit/chromium');
  });
  await withEnv(undefined, async () => {
    await renderPdf({ input: example, out: path.join(dir, 'c.pdf'), browserScripts, prepare: async () => ({ status: 'unavailable', reason: 'none' }) });
    assert.equal(globalThis.__seenBrowserPath, undefined);
  });
});
