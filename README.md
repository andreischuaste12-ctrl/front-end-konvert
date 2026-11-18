# Front-end Konvert

Coleção de skills para agentes de IA auditarem, criarem e refinarem interfaces web com evidências visuais, acessibilidade, privacidade e critérios verificáveis.

[![Licença MIT](https://img.shields.io/badge/licen%C3%A7a-MIT-green.svg)](LICENSE)
[![Idioma](https://img.shields.io/badge/idioma-pt--BR-blue.svg)](#)
[![Node.js 20+](https://img.shields.io/badge/Node.js-20%2B-339933.svg)](https://nodejs.org/)

## O que há neste repositório

| Skill | Finalidade | Resultado principal |
| --- | --- | --- |
| [`audit-frontend-designer-konvert`](audit-frontend-designer-konvert/) | Auditar uma interface existente sem alterar o projeto | Relatório estruturado em PDF, Markdown e JSON |
| [`create-frontend-from-zero-konvert`](create-frontend-from-zero-konvert/) | Criar uma interface nova a partir de um brief | Frontend funcional com verificação renderizada |
| [`design-por-referencia-konvert`](design-por-referencia-konvert/) | Refinar uma interface ou aplicar uma direção visual aprovada | Implementação acompanhada de evidências antes/depois |

As três skills formam um fluxo contínuo, mas também podem ser usadas separadamente:

1. **Auditar:** identificar problemas e oportunidades com evidências.
2. **Criar ou refinar:** implementar o escopo autorizado.
3. **Verificar:** conferir estados, responsividade, acessibilidade e fidelidade no navegador.

## Princípios

- evidência observável antes de conclusões;
- separação clara entre auditoria e implementação;
- decisões rastreáveis e critérios de aceite verificáveis;
- respeito à privacidade, com dados sintéticos e artefatos fora do Git;
- acessibilidade tratada durante todo o fluxo;
- referências visuais usadas como orientação, sem copiar identidade ou conteúdo de terceiros.

## Instalação

Copie a pasta da skill desejada para o diretório de skills do agente:

| Ferramenta | Projeto | Usuário |
| --- | --- | --- |
| Codex | `.agents/skills/<nome-da-skill>/` | `~/.agents/skills/<nome-da-skill>/` |
| Claude Code | `.claude/skills/<nome-da-skill>/` | `~/.claude/skills/<nome-da-skill>/` |

Para usar as ferramentas de navegador da skill de design por referência:

```bash
cd design-por-referencia-konvert
npm ci
npx playwright install chromium
```

Reinicie ou atualize o agente após instalar uma skill para que ela seja detectada.

## Uso responsável

Use somente projetos, páginas e ambientes que você está autorizado a inspecionar. Evite produção quando uma ação puder gerar efeitos persistentes. Não inclua credenciais, sessões, dados pessoais ou capturas não revisadas em relatórios e commits.

Os artefatos de auditoria devem ficar em `.audit/`, que é ignorado por este repositório. Consulte as instruções específicas de cada skill antes de executar scripts de navegador.

## Desenvolvimento

Leia o [guia de contribuição](CONTRIBUTING.md) antes de enviar alterações. O projeto também possui [código de conduta](CODE_OF_CONDUCT.md), [política de segurança](SECURITY.md) e [declaração de acessibilidade](ACCESSIBILITY.md).

## Licença

Distribuído sob a [Licença MIT](LICENSE).

Copyright © 2026 Marcos Andrei Schuaste do Carmo.
