# Registro de revisão de fontes

Complementa a [proveniência do conhecimento](proveniencia-do-conhecimento.md). Cada entrada diz quem conferiu, o que foi aberto, o que concordou, o que foi corrigido e o que ficou sem conferir. Uma entrada de agente de IA não equivale a revisão humana independente e não promove nenhuma unidade ao estado "revisada".

## 2026-11-10 — conferência por agente de IA (Claude, modelo `claude-sonnet-5-5`)

| Verificação | Resultado | Limite |
| --- | --- | --- |
| 118 URLs únicas da base e das referências, requisição HTTP | 99 responderam 200; 12 retornaram 403 e 2 retornaram 429 (bloqueio de acesso automatizado, não indica link morto); 3 estavam quebradas e foram corrigidas | Resposta 200 prova acesso, não que a fonte sustenta a afirmação |
| URL corrigida: GOV.UK, acessibilidade do serviço | `…/making-your-service-accessible` retornava 404; substituída por `…/making-your-service-accessible-an-introduction` (200; título "Making your service accessible: an introduction") | Conteúdo não relido unidade por unidade |
| URL corrigida: The FWA | `/awards/page/1/` retornava 404; substituída por `https://thefwa.com/` (200) | Página de listagem, vale como galeria |
| URL corrigida: Kohavi, Henne e Sommerfield | O endereço no `ai.stanford.edu` estava inacessível; substituído por `exp-platform.com/Documents/GuideControlledExperiments.pdf` (200, `application/pdf`) | Autoria e conteúdo do PDF **não foram conferidos**; a unidade continua "não verificada" |
| 19 arquivos `guidelines/sc/**` da WCAG citados na base | Existem no commit fixado `9b94e18` e na branch `main`; o nome do critério citado consta nos dois | Confirma existência e nome; **não** confirma que cada afirmação da unidade decorre do texto |

Pendente: revisão humana independente por amostra das regras de maior risco (teclado e foco, formulários e dados, autenticação) e conferência das 58 unidades "não verificadas".
