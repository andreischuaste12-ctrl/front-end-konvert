# Estrutura de conteúdo e navegação

Use este roteiro quando uma interface nova precisar de mais de uma página, categoria ou caminho de descoberta. Organize a estrutura em torno das tarefas e do conteúdo confirmado, não de um mapa de páginas inventado. Para uma tela isolada, mantenha a navegação simples e proporcional ao pedido.

## Partir do que existe

Liste conteúdos e funções fornecidos, seus responsáveis e a ação que cada grupo ajuda a concluir. Separe primeira visita, retorno e tarefa frequente quando esses caminhos diferirem. Se houver conteúdo legado, registre suas rotas e relações antes de propor mudanças. Marque páginas, volumes de catálogo e termos de busca desconhecidos como hipóteses, não como inventário completo.

## Desenhar caminhos compreensíveis

Agrupe itens que a pessoa espera encontrar juntos e dê nomes que descrevam o destino. Teste a hierarquia percorrendo tarefas concretas: da entrada ao conteúdo, do conteúdo à ação e de um erro a uma saída. Verifique se navegação, busca, filtros e links contextuais se complementam sem exigir que a pessoa conheça a organização interna da empresa. Em catálogos, preserve diferenças de produto necessárias para comparar e encontrar itens; não crie categorias apenas para preencher o menu.

### As 4 camadas de navegação
Estruture os pontos de contato da interface em quatro níveis complementares:
1. **Navegação Global (Header/Navbar):** departamentos principais, busca global e atalhos de alta prioridade.
2. **Navegação Local/Seção (Submenu/Sidebar):** hierarquia interna da seção, categoria ou documentação ativa.
3. **Navegação Contextual (In-Page):** breadcrumbs (trilha de navegação consistente), cartões relacionados, hubs-and-spokes e links cruzados que permitem avançar sem forçar retorno ao menu principal.
4. **Navegação Utilitária:** conta, carrinho/checkout, suporte, idioma e políticas, mantidos separados da taxonomia de conteúdo/produto.

### Modelagem de catálogo e e-commerce
Ao estruturar lojas ou catálogos de produtos, separe claramente as entidades para evitar duplicação e armadilhas de navegação:
- **Taxonomia estável (Categorias):** departamentos e subcategorias fixos que refletem o modelo mental de busca do usuário (não a organização do ERP/fornecedor).
- **Coleções comerciais/sazonais:** agrupamentos de curadoria ou campanha que podem cruzar várias categorias sem duplicar a árvore principal de navegação.
- **Listagem (PLP) vs. Produto (PDP):** a PLP expõe a grade de itens; a PDP representa a unidade comprável. Trate variantes (cor, tamanho, voltagem) preferencialmente como seletores de estado na mesma PDP, evitando gerar páginas separadas sem conteúdo distintivo.
- **Facetas e Filtros:** filtros refinam a listagem da PLP. Mantenha controle contra espaços infinitos de URL: apresente feedback claro ou estado vazio amigável quando combinações não retornarem produtos e nunca dependa apenas da busca interna para descobrir páginas críticas do catálogo.

Defina estados de orientação: item atual, título de página, retorno, resultado vazio e destino de links. Em tela estreita, a mesma informação deve continuar alcançável por teclado e toque. A regra dos "três cliques" é apenas uma heurística: priorize caminhos evidentes com links HTML rastreáveis em vez de aplanar artificialmente a estrutura. Quando possível, valide rótulos com tarefas representativas (tree testing).

## Rotas e mudanças de estrutura

Em um projeto novo, escolha rotas legíveis e estáveis conforme conteúdo e plataforma definidos. Em projeto existente, mudar URL, taxonomia ou navegação pode afetar links, integrações e histórico: inventarie consumidores e planeje preservação antes de editar. Não invente redirecionamentos, regras de indexação ou migração de conteúdo sem requisito e responsável. SEO técnico e publicação têm validações próprias fora deste roteiro de design.

No relatório de entrega, registre o mapa implementado, as tarefas percorridas, os rótulos ainda hipotéticos e os caminhos que dependem de conteúdo ou decisão externa.
