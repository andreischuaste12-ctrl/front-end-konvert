# Como contribuir

Obrigado pelo interesse em melhorar o Front-end Konvert.

## Antes de começar

1. Procure uma issue existente relacionada à mudança.
2. Para alterações amplas de comportamento ou contrato, abra uma proposta antes da implementação.
3. Não inclua credenciais, dados pessoais, conteúdo de clientes ou capturas não revisadas.
4. Respeite o [Código de Conduta](CODE_OF_CONDUCT.md).

## Preparação

Faça um fork ou crie uma branch com um nome descritivo. Para trabalhar nas ferramentas da skill de design por referência, use Node.js 20 ou posterior:

```bash
cd design-por-referencia-konvert
npm ci
npx playwright install chromium
```

## Padrões para mudanças

- mantenha as instruções em português claro;
- preserve a separação entre auditoria somente leitura e implementação;
- documente novos argumentos, formatos e limitações;
- use dados sintéticos em exemplos e testes;
- não enfraqueça validações de TLS, checksums ou proteções de rede;
- mantenha caminhos e comandos compatíveis com o contexto descrito na skill;
- atualize exemplos quando um contrato público mudar.

## Validação

Execute os checks definidos no componente alterado. Para `design-por-referencia-konvert`, os comandos esperados são:

```bash
npm run check
npm test
```

Se algum check não puder ser executado, explique o motivo e o impacto no pull request. Não descreva uma verificação como concluída quando ela não foi executada.

## Pull requests

Mantenha cada pull request focado em um objetivo. Inclua:

- o problema resolvido;
- o comportamento anterior e o novo;
- os arquivos ou contratos afetados;
- as verificações executadas e seus resultados;
- riscos, limitações ou pendências;
- imagens somente quando ajudarem a avaliar uma mudança visual e estiverem revisadas para privacidade.

Ao contribuir, você concorda que sua contribuição será distribuída sob a [Licença MIT](LICENSE).
