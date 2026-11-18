# Contrato de Captura e Inspeção Visual para a Auditora

Este documento define os parâmetros normativos para captura de tela, extração de estilos computados e inspeção do DOM executados pela auditora de frontend. Ele garante que as evidências visuais sejam coletadas de forma determinística, segura e sem poluir o repositório auditado.

---

## 1. Princípios de Coleta de Evidência

1. **Somente Leitura e Isolamento de Rede:** A auditora roda as ferramentas de captura com `--block-writes` por padrão, bloqueando mutações externas, chamadas analíticas e requisições de escrita desnecessárias.
2. **Viewports Padronizados:** Toda inspeção visual multiplataforma deve registrar explicitamente o viewport em que o estado foi observado:
   - **Mobile Padrão:** `375 x 812` (viewport iPhone contemporâneo de referência).
   - **Desktop Padrão:** `1440 x 900` (resolução desktop de referência).
   - **Tablet / Intermediário (quando aplicável):** `768 x 1024`.
3. **Destino Autorizado:** Todos os artefatos de captura devem ser salvos exclusivamente dentro do diretório autorizado (`.audit/` se ignorado pelo Git, ou diretório temporário externo), nunca na raiz do projeto auditado.

---

## 2. Artefatos Gerados pela Inspeção

Quando a suite de captura é executada através do runtime isolado, são produzidos os seguintes arquivos no diretório de saída:

| Arquivo | Conteúdo e Função na Auditoria |
|---|---|
| `capture-index.json` | Manifesto de todas as rotas capturadas, viewports, timestamps, erros de rede e status HTTP. |
| `computed-styles.json` | Extração estruturada de estilos CSS computados (cores, fontes, contrastes medidos, espaçamentos e tamanhos de elementos). |
| `accessibility-tree.json` | Instantâneo da árvore de acessibilidade do navegador e mapa de violações de contraste identificadas. |
| `captures/*.png` | Capturas de tela em resolução 1x e 2x (retina) dos estados e viewports configurados. |
| `image-manifest.json` | Inventário de imagens presentes na página, dimensões intrínsecas vs renderizadas e atributos `alt`. |

---

## 3. Modo de Operação com Runtime Isolado

O preparo do navegador utiliza o script [`scripts/prepare-browser.mjs`](../scripts/prepare-browser.mjs), que copia as ferramentas para uma pasta temporária do sistema (`os.tmpdir()`), evitando rodar `npm install` no projeto do cliente.

```bash
# Preparar runtime isolado
node "<SKILL_DIR>/scripts/prepare-browser.mjs" --install

# O comando retorna o caminho do diretório temporário preparado (<SCRIPTS_DIR>)
# Execução da captura usando o runtime isolado:
node "<SCRIPTS_DIR>/capture.mjs" --url "http://127.0.0.1:3000" --routes "/" --viewports "375,1440" --out ".audit/captures" --block-writes
```

---

## 4. Modo Autônomo e Fallback (Sem Playwright ou Sem Executora)

Se a pasta da skill executora `design-por-referencia-konvert` não estiver presente ou se o Playwright não puder ser executado no host:

1. **Capturas Fornecidas pelo Usuário:**
   - A auditora pode utilizar capturas estáticas fornecidas diretamente pelo usuário.
   - Cada achado visual deve identificar explicitamente em `evidence.type` o valor `provided_material`.
   - Limitação obrigatória: uma captura fornecida de um único viewport (ex: desktop) não autoriza conclusões sobre mobile, estados de hover, foco por teclado ou rotas não visíveis.
2. **Inspeção de Código Estático (DOM e CSS):**
   - Na falta de renderização, o auditor deve inspecionar arquivos de template (HTML, JSX, Vue, Blade) e CSS.
   - O tipo de evidência deve ser marcado como `source_code`.
   - Hipóteses de quebra visual que dependem de renderização real devem ser classificadas com severidade ponderada e `finding_kind: "needs_validation"`.
