#!/usr/bin/env node
// Render validated, already-reviewed report data locally; no target site or remote assets are loaded.
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import { validateAuditReport } from './validate-report.mjs';
import { prepareBrowser } from './prepare-browser.mjs';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const list = (values, empty) => values?.length ? `<ul>${values.map((v) => `<li>${esc(v)}</li>`).join('')}</ul>` : `<p>${esc(empty)}</p>`;
const label = { problem: 'Problema observado', opportunity: 'Oportunidade', needs_validation: 'Precisa de validação' };
const confidence = { high: 'Alta', medium: 'Média', low: 'Baixa' };
const state = { observed: 'Observado', not_observed: 'Não observado', blocked: 'Bloqueado', not_applicable: 'Não se aplica' };
const text = (name, value) => value ? `<div class="item"><h3>${esc(name)}</h3><p>${esc(value)}</p></div>` : '';

export function clientHtml(input) {
  const { errors, warnings, report } = validateAuditReport(input);
  if (input?.schema_version !== 3) errors.push('O PDF requer um relatório schema_version 3.');
  if (errors.length) throw Object.assign(new Error(`Relatório inválido: ${errors.join('; ')}`), { code: 'INVALID_REPORT', details: errors });
  const findings = [...report.findings].sort((a, b) => a.priority.localeCompare(b.priority));
  const sections = findings.map((f) => {
    const dep = f.external_dependency;
    const decision = dep.status === 'pending' ? `Pendente: ${dep.detail}` : dep.status === 'resolved' ? `Resolvida: ${dep.detail} ${dep.resolution}` : 'Nenhuma dependência externa informada.';
    return `<section class="finding"><div class="meta"><span>${esc(f.id)}</span><span>${esc(f.priority)}</span><span>${esc(label[f.finding_kind])}</span></div><h2>${esc(f.title ?? f.location)}</h2>
      ${f.title ? text('Onde', f.location) : ''}
      ${text('O que foi observado', f.evidence_observed)}
      ${text('Por que isso importa', [f.inference, f.probable_impact].filter(Boolean).join(' '))}
      ${text('O que ainda precisa ser validado', f.hypothesis)}
      ${text('Como melhorar', f.next_step)}
      ${text('Como verificar a melhoria', f.acceptance_criteria)}
      ${text('Evidência e confiança', `${f.evidence.source} · estado ${f.evidence.state} · ${f.evidence.viewport}. Confiança ${confidence[f.confidence.level]}: ${f.confidence.reason}`)}
      ${text('Decisões e dependências', decision)}
      ${text('Aprovação registrada', f.approved_for_implementation ? 'Aprovado no relatório; confirme a autorização independente e as dependências antes de implementar.' : 'Não aprovado para implementação no relatório.')}
      ${text('O que preservar', f.preserve.join('; '))}</section>`;
  }).join('');
  const scopeLabels = { tasks: 'Tarefas', viewports: 'Tamanhos de tela', dimensions: 'Dimensões', routes: 'Páginas', states: 'Estados' };
  const scopeValue = (value) => typeof value === 'string' ? value : JSON.stringify(value);
  const scope = Object.entries(report.scope).map(([key, value]) => `${scopeLabels[key] ?? key}: ${Array.isArray(value) ? value.map(scopeValue).join(', ') : scopeValue(value)}`);
  const gaps = (report.coverage || []).filter((row) => row.result !== 'observed').map((row) => `${row.area} · ${row.task} · ${row.state} · ${row.viewport}: ${state[row.result]} — ${row.reason}`);
  const priorities = findings.slice(0, 3).map((f) => `${f.priority} · ${f.id} — ${f.title ? `${f.title} (${label[f.finding_kind]})` : `${label[f.finding_kind]} em ${f.location}`}`);
  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Auditoria de experiência</title><style>
  @page{size:A4;margin:18mm 16mm 20mm}*{box-sizing:border-box}body{font:10.5pt/1.5 Arial,sans-serif;color:#182738}h1{font-size:27pt;line-height:1.12;margin:0 0 10pt}h2{font-size:16pt;line-height:1.25;margin:0 0 12pt}h3{font-size:10pt;color:#284d70;margin:12pt 0 3pt}p{margin:0 0 7pt;overflow-wrap:anywhere}ul{padding-left:18pt;margin:4pt 0 14pt}li{margin:0 0 5pt;overflow-wrap:anywhere}.cover{border-top:8pt solid #315f83;padding-top:24pt;margin-bottom:26pt}.eyebrow,.meta{font-size:9pt;font-weight:bold;letter-spacing:.06em;text-transform:uppercase;color:#315f83}.muted{color:#536678}.summary{padding:16pt;background:#eef4f6;border-radius:5pt;margin-bottom:20pt}.finding,.closing{border-top:1pt solid #c9d6de;margin-top:20pt;padding-top:16pt}.meta{display:flex;gap:12pt;margin-bottom:9pt;break-after:avoid}h2,h3{break-after:avoid}.item{break-inside:avoid}.note{font-size:9pt;color:#536678}
  </style></head><body><header class="cover"><p class="eyebrow">Auditoria de experiência e interface</p><h1>${esc(report.project)}</h1><p class="muted">Relatório ${esc(report.report_id)} · Recomendações para decisão</p></header>
  <section class="summary"><h2>Prioridades para decisão</h2>${list(priorities, 'Nenhum achado foi registrado no escopo examinado.')}</section>
  <section><h2>Escopo da análise</h2>${list(scope, 'Escopo não informado.')}<h3>Limites da evidência</h3>${list(report.evidence_limits, 'Nenhuma limitação adicional foi registrada.')}
  <h3>O que funciona e deve ser preservado</h3>${list(report.preserve, 'Nenhum item de preservação registrado.')}</section>
  ${sections}<section class="closing"><h2>Cobertura e próximos passos</h2><h3>Estados não observados, bloqueados ou não aplicáveis</h3>${list(gaps, 'Nenhuma lacuna de cobertura foi registrada.')}
  <h3>Próximo passo</h3><p>Revise as recomendações e decida quais devem avançar. A implementação depende de aprovação e da resolução de eventuais dependências.</p><p class="note">Os efeitos esperados são hipóteses quando não foram medidos. Esta auditoria não constitui certificação de acessibilidade.</p></section></body></html>`;
  return { html, warnings };
}

const BROWSER_ENV = 'PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH';

// Use the same browser discovery as `doctor` and `check-project`; an explicit environment override always wins.
async function withDiscoveredBrowser(browserScripts, prepare, task) {
  const previous = process.env[BROWSER_ENV];
  if (previous === undefined) {
    const prepared = await prepare(path.dirname(path.resolve(browserScripts)));
    if (prepared.status === 'ready' && prepared.executablePath) process.env[BROWSER_ENV] = prepared.executablePath;
  }
  try { return await task(); }
  finally { if (previous === undefined) delete process.env[BROWSER_ENV]; }
}

export async function renderPdf({ input, out, browserScripts, prepare = prepareBrowser }) {
  const { html, warnings } = clientHtml(input);
  const common = await import(pathToFileURL(path.resolve(browserScripts, '_common.mjs')).href);
  await withDiscoveredBrowser(browserScripts, prepare, () => writePdf({ common, html, out }));
  return { warnings };
}

async function writePdf({ common, html, out }) {
  const browser = await common.launch(common.loadPlaywright());
  try {
    const page = await browser.newPage({ javaScriptEnabled: false });
    await page.route('**/*', (route) => route.abort());
    await page.setContent(html, { waitUntil: 'load' });
    const pdf = await page.pdf({ format: 'A4', printBackground: true, tagged: true, displayHeaderFooter: true, headerTemplate: '<span></span>', footerTemplate: '<div style="font:9px Arial;color:#64748b;width:100%;text-align:center">Auditoria de experiência · <span class="pageNumber"></span> / <span class="totalPages"></span></div>', margin: { top: '18mm', bottom: '20mm', left: '16mm', right: '16mm' } });
    await fs.writeFile(out, pdf, { flag: 'wx', mode: 0o600 });
  } finally { await browser.close(); }
}

const USAGE = 'Uso: node render-client-pdf.mjs <audit-report.json> --out <novo-arquivo.pdf> --browser-scripts <scriptsDir-do-preparo>';
const coded = (code, message = code) => Object.assign(new Error(message), { code });

/** Names the cause of a failure without echoing local paths or report content. */
export function failureMessage(error) {
  switch (error?.code) {
    case 'USAGE': return USAGE;
    case 'UNREADABLE_REPORT': return 'Não foi possível ler o relatório como JSON. Confira o caminho e o conteúdo do arquivo.';
    case 'INVALID_REPORT': return `Relatório inválido para o PDF (exige schema_version 3). Corrija e valide com validate-report.mjs antes de gerar:\n- ${(error.details ?? []).slice(0, 10).join('\n- ')}`;
    case 'EEXIST': return 'O arquivo de saída já existe e não foi sobrescrito. Gere com um nome ainda inexistente, como audit-report-client-review-N.pdf.';
    case 'ENOENT': return 'O diretório de saída não existe. Use o diretório autorizado da auditoria.';
    case 'EACCES': case 'EPERM': return 'Sem permissão para gravar no diretório de saída.';
    case 'BROWSER_SCRIPTS_MISSING': return 'Os scripts de navegador não foram encontrados em --browser-scripts. Passe o scriptsDir retornado por prepare-browser.mjs.';
    case 'PLAYWRIGHT_MISSING': return 'O Playwright não está disponível nesse diretório de scripts. Rode prepare-browser.mjs --executor <EXECUTOR_DIR> --install e passe o scriptsDir retornado; não instale nada no projeto auditado.';
    default: return 'Não foi possível gerar o PDF. Verifique o navegador e as permissões; detalhes locais foram omitidos.';
  }
}

// The executor's loader exits the process when Playwright is missing and suggests a project install,
// which the read-only auditor must not do; fail earlier with the auditor's own guidance.
async function assertBrowserRuntime(browserScripts) {
  const common = path.resolve(browserScripts, '_common.mjs');
  if (!(await fs.access(common).then(() => true, () => false))) throw coded('BROWSER_SCRIPTS_MISSING');
  try {
    const packageRoot = await fs.realpath(path.dirname(path.resolve(browserScripts)));
    const resolved = await fs.realpath(createRequire(common).resolve('playwright/package.json'));
    const relative = path.relative(packageRoot, resolved);
    if (relative && relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative)) return;
  } catch { /* use the named failure below */ }
  throw coded('PLAYWRIGHT_MISSING');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    let parsed;
    try { parsed = parseArgs({ options: { out: { type: 'string' }, 'browser-scripts': { type: 'string' } }, allowPositionals: true, strict: true }); }
    catch { throw coded('USAGE'); }
    const { values, positionals } = parsed;
    if (positionals.length !== 1 || !values.out || !values['browser-scripts'] || !values.out.toLowerCase().endsWith('.pdf')) throw coded('USAGE');
    let input;
    try { input = JSON.parse(await fs.readFile(positionals[0], 'utf8')); }
    catch { throw coded('UNREADABLE_REPORT'); }
    clientHtml(input); // Report errors before any browser work.
    await assertBrowserRuntime(values['browser-scripts']);
    const result = await renderPdf({ input, out: values.out, browserScripts: values['browser-scripts'] });
    for (const warning of result.warnings) console.error(`Aviso: ${warning}`);
    console.log('PDF gerado. Revise o conteúdo, a paginação e a privacidade antes de compartilhar.');
  } catch (error) { console.error(failureMessage(error)); process.exitCode = error?.code === 'USAGE' ? 2 : 1; }
}
