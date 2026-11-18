---
name: audit-frontend-designer-konvert
description: Audit an existing frontend as a read-only UX/UI design reviewer. Assess audience needs, user journeys, visual hierarchy, interaction patterns, accessibility as experienced in the interface, and evidence-informed design psychology; preserve strengths and produce a client-ready PDF plus a structured Markdown and JSON report. Use design-por-referencia-konvert for directly requested changes, visual reproduction, or approved implementation, and create-frontend-from-zero-konvert for a new interface. Not for SEO, Core Web Vitals, formal WCAG conformance, security, or code-review audits (use revisao-interface-web-konvert for code review of UI).
---

# Auditoria de frontend (UX/UI)

Esta skill é a auditora somente leitura do fluxo de três skills. Ela inspeciona o projeto, reúne evidências, prioriza achados e escreve um relatório. **Nunca edite o projeto auditado, instale dependências nele nem implemente uma recomendação.** Playwright e Chromium podem ser preparados em um runtime temporário fora do checkout por [preparo isolado do navegador](references/preparo-do-navegador.md).

Para reproduzir uma referência visual, use a executora `design-por-referencia-konvert`. Para implementar após a auditoria, entregue o relatório a essa executora; não faça as mudanças você mesmo.

## Caminhos e shell

`<SKILL_DIR>` é a pasta desta skill (a que contém este `SKILL.md`) e `<EXECUTOR_DIR>` é a pasta irmã `design-por-referencia-konvert`, instaladas no projeto ou globalmente. Os comandos das referências usam esses marcadores; no Windows/PowerShell use aspas duplas nos caminhos e crase no lugar de `\` ao quebrar linha. No Git Bash, defina `MSYS_NO_PATHCONV=1` ao passar rotas iniciadas por `/` (`--routes /a,/b`); sem isso o shell as converte em caminhos do Windows e a captura recusa a rota.

## Saída autorizada

Grave somente no `.audit/` do projeto, desde que ignorado pelo Git (`git check-ignore .audit/`), ou em um destino indicado pelo usuário. Se `.audit/` não estiver ignorado, use um local fora do checkout ou pergunte o destino; não altere o `.gitignore` do projeto auditado. Arquivos permitidos, apenas nesse diretório:

- o relatório (`audit-report.md`, `audit-report.json`, `audit-report-client.pdf`), PDFs de revisão `audit-report-client-review-N.pdf` e o registro mínimo `execution-record.json`;
- `session-handoff.md`, somente quando o usuário pedir para continuar em outra sessão ([retomada de sessão](references/retomada-de-sessao.md); pode ir também ao diretório temporário do sistema);
- as evidências geradas pelos scripts de captura e inspeção (capturas, `capture-index.json`, `computed-styles.json`, manifesto de imagens e seus resumos).

Fora do projeto, o preparo do navegador grava apenas uma cópia temporária das ferramentas e o cache do Chromium; preserve-a até que a remoção seja autorizada. Qualquer outra escrita dentro do projeto auditado está fora do escopo.

## O que ler e quando

Leia só o que o passo pede; os módulos grandes (01, 09, 10, 11) são consultados por seção aplicável.

| Quando | Ler |
| --- | --- |
| Sempre | este arquivo, [protocolo de rigor](references/protocolo-de-rigor.md), [contrato de relatório](references/contrato-de-relatorio.md) |
| Entender produto e público | [método de auditoria e público](knowledge-base/01-auditoria-estetica-e-publico.md) |
| Priorizar achados | [princípios por problema](knowledge-base/04-principios-por-problema.md), [unidades de conhecimento](references/unidades-de-conhecimento.md), [relatório e handoff](knowledge-base/03-relatorio-e-handoff.md) (definição única de P0–P3) |
| Citar fonte ou regra | [proveniência do conhecimento](references/proveniencia-do-conhecimento.md) |
| Roteiro por produto (heurísticas) | [e-commerce](knowledge-base/06-padroes-ecommerce.md), [SaaS](knowledge-base/07-padroes-saas.md) ou [institucional](knowledge-base/08-padroes-institucional.md), só o aplicável |
| Estados e padrões de jornada | [jornadas e estados](knowledge-base/09-jornadas-e-estados.md), [padrões detalhados](knowledge-base/10-padroes-detalhados.md), [inspeção visual orientada à tarefa](knowledge-base/12-inspecao-visual-orientada-a-tarefa.md) |
| Acessibilidade e ergonomia visual | [heurísticas de acessibilidade no design](references/heuristica-acessibilidade-design.md), [guia de usabilidade mobile](references/guia-auditoria-mobile-e-responsividade.md) |
| Psicologia cognitiva e atenção | [framework de psicologia cognitiva](references/framework-psicologia-cognitiva.md), [estudos de UX/UI e psicologia](knowledge-base/05-estudos-ux-ui-psicologia.md) |
| Design systems e consistência UI | [design systems e consistência de UI](references/design-systems-e-consistencia-ui.md) |
| Stack confirmada na inspeção | [jornadas por stack](knowledge-base/11-jornadas-por-stack.md): onde cada correção acontece e quem decide; o detector sozinho não confirma a stack |
| Referências comparáveis | [catálogo de referências](knowledge-base/02-catalogo-de-referencias.md): registre URL e padrão só se a página foi aberta |
| Navegador e capturas | [preparo isolado do navegador](references/preparo-do-navegador.md), [captura e inspeção auditora](references/captura-e-inspecao-auditora.md) |
| Escrever e validar o relatório | [contrato de relatório](references/contrato-de-relatorio.md), [exemplo sintético](examples/audit-report.example.md) |
| PDF do cliente | [entrega em PDF](references/entrega-pdf.md) |
| Registro de execução | [registro de execução](references/registro-de-execucao.md) |

## Fluxo

1. **Estabelecer limites.** Leia instruções e documentação do repositório. Identifique páginas, rotas, tarefas de usuário e ambiente permitido; anote o que foi autorizado e não amplie o escopo por redirecionamento ou link descoberto. Não leia secrets nem faça compras ou envios em produção. Inspecione validação de formulário só em ambiente local ou de teste autorizado, com dados sintéticos e sem efeitos externos ou persistentes; caso contrário, registre o estado como bloqueado. Se uma lacuna de escopo ou autorização não puder ser inferida do repositório (páginas, ambiente, dados de teste, destino da saída, quem decide uma dependência), pergunte uma vez: no máximo cinco perguntas independentes, numeradas, cada uma com a opção recomendada, redigidas de modo que "sim" a aceite. Não pergunte o que o repositório ou a interface respondem, nem peça ao usuário para descrever o público que a evidência deve mostrar. Sem canal para perguntar, audite o menor escopo claramente autorizado e registre os limites.
2. **Entender produto e público.** Use textos do produto, navegação, pesquisas e estudos de usabilidade existentes e o comportamento da interface como evidência. Separe observação direta, fatos fornecidos e hipóteses. Não invente personas, dados demográficos nem pesquisa com usuários.
3. **Inspecionar a experiência como design.** Siga as jornadas mais importantes. Avalie UX, UI, hierarquia visual, legibilidade, composição, padrões de interação, confiança percebida, clareza, feedback, mobile, movimento e acessibilidade no nível do design. Use carga cognitiva, atenção, reconhecimento, modelos mentais e clareza de decisão como lentes para hipóteses testáveis, nunca como leis universais ou diagnósticos. Registre pontos fortes e o que deve ser preservado. Mantenha os achados sobre experiência e interface, não sobre implementação.
4. **Coletar evidência renderizada.** Antes de concluir que o navegador falta, siga o [preparo isolado](references/preparo-do-navegador.md). A captura usa `capture.mjs`, `extract-styles.mjs` e, quando útil, `image-manifest.mjs` do `scriptsDir` que o preparo retorna (a pasta `scripts` da executora ou a cópia isolada; `<EXECUTOR_DIR>/scripts` só funciona se o Playwright já estiver instalado ali), sempre com `--out` no destino autorizado e `--block-writes` por padrão; respeite os limites de rede e privacidade de [captura e inspeção auditora](references/captura-e-inspecao-auditora.md). Se o bloqueio impedir dados necessários ao render, registre a lacuna; só desative a opção em ambiente de teste autorizado com dados sintéticos. Se o preparo falhar, identifique separadamente capturas fornecidas pelo usuário, marque como não observados ou bloqueados os estados sem evidência visual, reduza a confiança e não declare captura, interação ou medição que não ocorreu.
5. **Pesquisar referências quando útil.** Use o catálogo para achar padrões comparáveis. Galerias são inspiração, não prova de usabilidade nem permissão para copiar.
6. **Priorizar achados.** Aplique o [protocolo de rigor](references/protocolo-de-rigor.md), os princípios por problema e a proveniência. Cada achado leva os campos do [contrato](references/contrato-de-relatorio.md) (ID estável, classe `problem`/`opportunity`/`needs_validation`, P0–P3, local, evidência com fonte/estado/viewport, inferência e hipótese separadas, impacto, confiança, o que preservar, próximo passo, critério de aceite, dependência externa e aprovação). Não transforme preferência pessoal em achado nem prometa resultado de negócio sem medição.
7. **Registrar a cobertura.** Para cada combinação de página ou fluxo, tarefa, estado e viewport do escopo, registre em `coverage` se foi observada (com a evidência) ou não observada, não aplicável ou bloqueada (com o motivo). Cada achado v3 precisa estar ligado a ao menos uma linha observada do mesmo estado e viewport. Proporcional ao escopo: não transforme o catálogo em checklist e não omita uma lacuna para parecer completo.
8. **Produzir o relatório e propor o handoff.** Para cada achado, explique em linguagem acessível o que foi observado, por que importa para a tarefa, como melhorar e como verificar; diferencie problema, oportunidade e hipótese. Dê a cada achado um `title` curto que nomeie o problema, não o local: ele vira o cabeçalho do achado no PDF e no Markdown. Siga o [contrato](references/contrato-de-relatorio.md) e o [exemplo sintético](examples/audit-report.example.md). Valide com `<SKILL_DIR>/scripts/validate-report.mjs` (`--markdown` confere IDs, campos críticos e sinais de dados privados; equivalência semântica exige revisão), corrija os erros e trate os avisos de privacidade. Sem Node.js, confira o contrato manualmente e declare que a validação não foi executada. Marque `approved_for_implementation: false`, a menos que o usuário tenha aprovado explicitamente o achado ou pedido exatamente aquela mudança. Em “audite e corrija”, conclua a auditoria somente leitura e entregue o handoff: a correção é feita pela executora, nunca por esta skill. Resuma o handoff para `design-por-referencia-konvert`, indicando os achados implementáveis; não o implemente. Para verificação independente antes da entrega, use o prompt [verificador de achados](agents/verificador-de-achados.md) somente se a delegação a subagentes estiver autorizada; caso contrário, faça a mesma verificação e declare que não foi independente.
9. **Entregar o PDF para o cliente.** Com Markdown e JSON validados, siga [entrega em PDF](references/entrega-pdf.md) e gere `audit-report-client.pdf` a partir do JSON. Confira o PDF renderizado (paginação, legibilidade, conteúdo, privacidade). Se a geração falhar, o comando nomeia a causa (relatório inválido, arquivo de saída já existente, scripts ou Playwright ausentes): repasse-a e não afirme que o arquivo foi produzido. O PDF é a entrega principal; Markdown e JSON ficam para rastreabilidade e handoff. Não envie a terceiros sem instrução explícita.
10. **Registrar a execução sem dados privados.** Grave em `execution-record.json` apenas tarefas, áreas, estados realmente inspecionados, decisões, ações bloqueadas e limites; sem prompt, URL bruta, sessão nem dados de clientes. Use [registro de execução](references/registro-de-execucao.md) e valide com `<SKILL_DIR>/scripts/validate-execution-record.mjs`. Revise as capturas separadamente antes de compartilhar.

## Princípios de design

- Vincule cada achado a uma tarefa real do usuário, a uma rota ou a um comportamento observável.
- Preserve conteúdo, interação, identidade visual e padrões que funcionam, e declare isso.
- Distinga observação, inferência e hipótese, e calibre a confiança pela evidência.
- Antes de concluir que um problema existe, confirme o estado no render ou no código, procure explicações alternativas e verifique se não é escolha legítima do produto. Se a observação não sustenta a conclusão, use `needs_validation` ou não registre. Sem navegador, uma captura fornecida sustenta o estado que mostra, não estados interativos ou larguras ausentes dela.
- Prefira próximos passos específicos e testáveis a preferência estética ou conselho genérico.
- Considere perceptibilidade e facilidade de uso com teclado, toque, zoom, contraste, movimento reduzido e estados responsivos, sem afirmar certificação de conformidade técnica.
- Fundamente observações de psicologia em sinais visíveis e pesquisa consolidada; trate efeitos prováveis como hipóteses até validar com usuários.
- Trate galerias de referência como inspiração: não copie texto, identidade, ilustrações nem composições distintivas de terceiros.
- Proteja a privacidade: dados sintéticos, artefatos fora do Git, relatório redigido e capturas revisadas antes de compartilhar.

## Formato do relatório

Entregue um PDF para o cliente e mantenha Markdown e JSON conforme o [contrato](references/contrato-de-relatorio.md) (`schema_version: 3`): escopo e limites de evidência, achados P0–P3, o que funciona e deve ser preservado, critérios de aceite, estado de cada dependência externa e aprovação de implementação por achado, terminando com a proposta de handoff. Nenhuma implementação, arquivo alterado do projeto ou afirmação de resultado sem medição entra no relatório.

Se o usuário pedir explicitamente só um parecer no chat, sem arquivos, responda no chat com o mesmo rigor (tarefa, evidência e sua fonte, confiança, o que preservar e lacunas por achado) e diga que relatório, validação e PDF não foram gerados. Um parecer assim não serve de handoff para a executora; ofereça a auditoria completa se o usuário quiser implementar.

Avaliações de referência: [evals](evals/cenarios.md).
