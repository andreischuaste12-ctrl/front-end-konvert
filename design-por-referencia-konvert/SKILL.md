---
name: design-por-referencia-konvert
description: Implement approved frontend audit findings, adapt an existing interface from a visual reference, or refine a directly requested UI area. Preserve product behavior and protected elements, make decisions traceable, and verify the rendered result with repeatable browser evidence. Use audit-frontend-designer-konvert for a read-only audit and create-frontend-from-zero-konvert for a new interface.
---

# Design por referência

Implemente mudanças visuais autorizadas em uma interface existente e verifique o resultado renderizado. Esta skill é a executora do fluxo Konvert: ela recebe um pedido direto, uma referência visual ou achados aprovados da auditora; preserva comportamento e contratos existentes; edita o projeto; e produz evidências antes/depois proporcionais ao escopo.

## Quando usar

Use esta skill para:

- aplicar achados de `audit-frontend-designer-konvert` aprovados pelo usuário;
- adaptar uma URL, captura, `DESIGN.md` ou direção escrita a um produto existente;
- corrigir responsividade, hierarquia, estados, movimento ou acessibilidade visual em uma área nomeada;
- refinar uma interface existente sem mudar sua finalidade.

Use `create-frontend-from-zero-konvert` quando a tarefa principal for criar uma interface nova. Use `audit-frontend-designer-konvert` quando o pedido for somente analisar e relatar. Trabalho exclusivamente backend, vídeo e auditoria formal de conformidade ficam fora do escopo.

## Precedência e autorização

Siga esta ordem quando houver conflito:

1. instrução direta e atual do usuário;
2. instruções do repositório e contratos do produto;
3. escopo aprovado, itens a preservar e critérios de aceite;
4. referência visual escolhida;
5. padrões e defaults desta skill.

Um relatório de auditoria não autoriza implementação sozinho. Implemente apenas achados que atendam simultaneamente a estes requisitos:

- `approved_for_implementation: true`;
- ID incluído na autorização atual do usuário;
- `external_dependency.status` igual a `not_applicable` ou `resolved`;
- critério de aceite verificável.

Dependência `pending`, achado não aprovado ou recomendação fora do pedido permanece bloqueado. Um pedido direto e específico do usuário pode autorizar sua própria mudança sem aprovar outros achados do relatório.

## Antes de editar

Leia as instruções locais e identifique stack, comandos, arquivos alterados pelo usuário e estado do Git. Não crie um projeto paralelo nem troque a stack para facilitar a tarefa.

Feche o [contrato de entrada](references/contrato-de-entrada.md):

- fonte da referência;
- nível de fidelidade, quando houver referência visual;
- telas, rotas e componentes no escopo;
- marca, conteúdo, tokens, contratos e comportamentos intocáveis;
- critério de pronto e viewports aplicáveis.

Infira o que o projeto e a referência já respondem. Pergunte somente quando uma decisão ausente mudar materialmente o resultado. Continue o trabalho independente enquanto aguarda uma resposta não bloqueante.

## Fluxo de trabalho

### 1. Confirmar a base

Inspecione o projeto e execute a jornada relevante antes de editar, quando o ambiente permitir. Para sinais de stack, use `scripts/detect-stack.mjs` como ponto de partida e confirme no código; `signal` e `likely` não são prova.

Registre:

- rotas e estados observados;
- comportamento que deve permanecer;
- erros existentes relevantes;
- limitações de ambiente;
- arquivos locais ou mudanças do usuário que precisam ser preservados.

Consulte [adaptadores de stack](references/adaptadores-de-stack.md) e, quando aplicável, [Next.js](references/nextjs-na-interface.md) ou [Tailwind](references/tailwind-no-sistema-visual.md).

### 2. Coletar evidência anterior

Quando a interface puder ser executada, capture o estado anterior nas mesmas rotas, larguras, esquemas e estados que serão usados depois. Siga [captura e inspeção](references/captura-e-inspecao.md).

Ferramentas disponíveis:

- `scripts/capture.mjs` para capturas de viewport, foco e hover;
- `scripts/extract-styles.mjs` para estilos computados, contraste estimado e estrutura;
- `scripts/image-manifest.mjs` para inventário estático e renderizado;
- `scripts/compare.mjs` para diferenças medidas e, quando solicitado, pixels.

Grave artefatos em `.audit/` ignorado pelo Git ou em outro destino autorizado. Use dados sintéticos. Revise capturas antes de compartilhar.

### 3. Traduzir a referência

Mapeie papéis, não apenas valores: superfície, texto, ação, destaque, feedback, espaço, tipo, composição e movimento. Classifique cada decisão como medida, inferida, fornecida ou decidida. Consulte [papéis e tokens](references/papeis-e-tokens.md) e [guia de referências](references/guia-de-referencias.md).

Não copie logotipos, marca, textos, ilustrações ou dados de terceiros. Preserve conteúdo real e contratos do produto, salvo autorização explícita para alterá-los.

### 4. Implementar o menor conjunto coerente

Edite somente o escopo necessário para produzir o resultado autorizado. Reuse tokens, componentes e padrões existentes quando eles cumprem o objetivo. Evite valores isolados sem papel claro.

Para refinamentos pontuais, siga [refinamento de interface](references/refinamento-de-interface.md). Para movimento, siga [movimento de interface](references/movimento-de-interface.md). Respeite foco, teclado, reflow, zoom, contraste, alvos de toque e preferência por movimento reduzido.

Não altere comportamento, analytics, rede, autenticação, conteúdo comercial ou contratos de dados como efeito colateral de uma mudança visual.

### 5. Verificar comportamento e integração

Execute os testes e checks do projeto que cobrem os arquivos alterados. Confira a jornada principal e os estados aplicáveis: normal, carregando, vazio, erro, sucesso, foco, hover, disabled e recuperação.

Use [testes de fluxos](references/testes-de-fluxos.md) e [validação](references/validacao.md). Não substitua testes existentes por verificações triviais e não descreva uma etapa não executada como aprovada.

### 6. Repetir a evidência

Capture o estado posterior com a mesma rota, largura, esquema, conteúdo e estado do baseline. Diferenças só são comparáveis quando essas condições correspondem.

Use `compare.mjs --confirm-page-mapping` apenas depois de confirmar que as páginas representam a mesma tarefa. Comparação de pixels mede mudança visual; não prova qualidade, acessibilidade ou fidelidade sem revisão humana.

### 7. Entregar com rastreabilidade

Relate:

- o que mudou e por quê;
- IDs dos achados implementados, quando houver;
- itens preservados;
- verificações executadas e resultados;
- evidências e viewports usados;
- limitações, falhas existentes e pontos não observados.

Não declare certificação de acessibilidade, ganho de conversão, desempenho de campo ou fidelidade total sem evidência apropriada.

## Segurança do navegador

Os scripts executam JavaScript da página e não são uma sandbox para conteúdo hostil. Use apenas alvos autorizados.

Por padrão, as ferramentas:

- bloqueiam endpoints conhecidos de metadata e endereços reservados;
- exigem opção explícita para redes privadas;
- validam DNS e fixam cada conexão no endereço aprovado por um proxy local;
- bloqueiam trackers conhecidos, salvo autorização explícita;
- removem credenciais, query strings e fragmentos de URLs relatadas;
- não clicam nem enviam formulários;
- desativam service workers;
- podem bloquear métodos além de GET/HEAD e WebSockets com `--block-writes`.

`--allow-private`, `--allow-tracking`, `--allow-unresolved-dns` e `--no-mask` reduzem proteções. Use somente quando o alvo e os dados forem autorizados e registre a decisão.

## Perfis de verificação

- `rapido`: mudança pontual; 375 e 1440 px.
- `tela`: até três telas; 320, 375, 768 e 1440 px.
- `completo`: site inteiro ou réplica estrutural; 320, 375, 768, 1024 e 1440 px.

Sobrescreva as larguras quando os breakpoints reais do projeto exigirem. Teste claro e escuro quando ambos existirem.

## Definição de pronto

A tarefa está pronta quando:

- o escopo autorizado foi implementado;
- itens protegidos e comportamento existente foram preservados;
- checks relevantes concluíram ou falhas foram diagnosticadas;
- a jornada e os estados críticos foram exercitados;
- antes/depois usam condições comparáveis quando a comparação é aplicável;
- novos erros de console, overflow e regressões visuais foram investigados;
- limitações e evidências estão registradas com precisão.

Se a aplicação não puder ser executada, conclua apenas o que o código sustenta, declare a verificação renderizada como não executada e não invente evidência.

## Referências

Leia apenas as referências aplicáveis ao trabalho atual:

- [contrato de entrada](references/contrato-de-entrada.md);
- [refinamento de interface](references/refinamento-de-interface.md);
- [captura e inspeção](references/captura-e-inspecao.md);
- [inventário de imagens](references/inventario-de-imagens.md);
- [validação](references/validacao.md);
- [desempenho percebido](references/desempenho-percebido.md);
- [cenários mobile e mockups](references/cenarios-mobile-e-mockups.md);
- [retomada de sessão](references/retomada-de-sessao.md), somente quando solicitada.
