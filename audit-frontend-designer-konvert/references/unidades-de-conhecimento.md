# Como usar unidades de conhecimento

Selecione unidades aplicáveis à tarefa e ao produto; são roteiros de inspeção, não achados nem prova de problema. Capture apenas evidência autorizada e separe o observado da hipótese. Estados inacessíveis ficam nos limites do relatório. Não invente pesquisas nem afirme ter consultado fontes marcadas como não verificadas.

| Unidade | Relatório |
| --- | --- |
| Evidência a coletar | `evidence_observed`, somente após coleta real |
| Prioridade padrão | `priority`, ajustável com justificativa contextual |
| Recomendação | `next_step` |
| Critério de aceite | `acceptance_criteria` |
| Preservar | `preserve` |
| Dependência externa | `external_dependency`, com responsável quando pendente |

## Prioridade padrão

A prioridade de cada unidade é um ponto de partida para o caso típico; ajuste-a pela evidência e registre o motivo em `confidence.reason`. O significado de P0–P3 está definido uma única vez em [relatório e handoff](../knowledge-base/03-relatorio-e-handoff.md#prioridade-e-confiança).

## Método e fonte

`automático` significa que uma ferramenta deste projeto mede o critério (por exemplo `extract-styles --axe`, dimensões `rect` ou `horizontalOverflow` da captura); revise o resultado no contexto. `inspeção` exige observação ou leitura de código pelo agente. `hipótese` depende de teste com pessoas. Fontes "verificado em" foram lidas no commit citado; fontes "não verificada" são heurísticas do projeto e não podem ser citadas como pesquisa.

Unidades por stack (prefixos 1xx Shopify, 2xx VTEX IO, 3xx WordPress/WooCommerce, 4xx React/Next.js, 5xx HTML) só se aplicam depois que a stack foi confirmada na inspeção; registre `stack.level: "confirmed"` e o motivo no relatório.

## Hipóteses e contexto comercial

Para método `hipótese`, use confiança `low` ou `medium`, registre em `confidence.reason` que exige teste com pessoas e nunca atribua P0 apenas pela hipótese. Em contexto `[comercial]`, comece com dependência pendente; somente o responsável autorizado pode aprovar e resolver condições. Unidades não substituem a aprovação de implementação. O formato completo e os estados do achado estão no [contrato de relatório](contrato-de-relatorio.md).
