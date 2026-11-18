# Movimento de interface com propósito

Use este roteiro quando o pedido envolve transição, feedback animado ou mudança de estado em uma interface web. Comece pela ação da pessoa e pela informação que o movimento deve comunicar. Uma animação sem função clara pode ser omitida; uma animação bonita não corrige falta de rótulo, foco ou estado final.

## Definir o comportamento antes do efeito

Registre o componente, o evento que inicia a mudança, os estados inicial e final e o que acontece se a pessoa repetir, inverter ou interromper a ação. Identifique quem controla foco, teclado, desmontagem do componente e anúncio de status. Para modal, menu, aba ou acordeão, preserve a semântica e a primitiva já adotadas pelo projeto; aparência e comportamento devem evoluir juntos.

Escolha a técnica de acordo com o que já existe. Transições simples podem ficar no CSS; sequências que exigem cancelamento ou controle em tempo de execução podem precisar de uma API de animação ou da biblioteca já instalada. Não adicione uma dependência para um único efeito sem demonstrar necessidade. Valores de duração, distância e curva devem respeitar os tokens do produto quando houver.

Movimento que responde a uma ação (abrir, expandir, confirmar) e mostra o que mudou tem função clara. Movimento que a pessoa não iniciou (entrada de página, revelação ao rolar) é exceção: justifique-o por um único ponto que deve atrair atenção, em vez de repetir a mesma entrada em cada seção ou o mesmo efeito de hover em cada card. Em refinamento de interface existente, mantenha o movimento já adotado, salvo pedido ou achado aprovado.

## Ciclo de vida, temporizadores e descompasso CSS/JS

- **Cancelamento e interrupção rápida:** reabrir durante o fechamento ou clicar repetidamente não pode deixar timers antigos dispararem no estado novo. Sempre limpe `clearTimeout`, aborte transições ativas e cancele listeners na desmontagem ou inversão de estado.
- **Descompasso de unidades:** `parseFloat('0.15s')` em JavaScript retorna `0.15`, não `150ms`. Padronize durações em milissegundos em contratos compartilhados entre CSS e JS ou utilize tokens unificados.
- **Não depender cegamente de `transitionend`:** o evento pode não disparar se a propriedade animada for cancelada, se a duração for zero, se o elemento for desmontado ou se `prefers-reduced-motion` zerar a transição. Tenha fallback de conclusão segura de ciclo de vida.
- **Evitar layout thrashing em replays:** forçar reflow com `offsetWidth` ou `getBoundingClientRect` para reiniciar animações CSS é recurso pontual; nunca execute leituras/escritas de layout forçadas dentro de loops ou a cada frame.

## Mecânica de performance e timing assimétrico

- **Propriedades compostas pela GPU:** anime preferencialmente `transform` e `opacity`. Evite animar `top`, `left`, `width`, `height`, `margin` ou `padding`, que disparam recálculo de layout (reflow) e repintura custosa.
- **Timing assimétrico:** saídas e fechamentos devem ser mais rápidos que aberturas (ex: fechamento/dismiss em ~150ms vs. abertura/apresentação em ~200–250ms), transmitindo sensação de prontidão e agilidade.
- **`will-change` com critério:** use `will-change` somente como otimização pontual comprovada em elementos complexos com queda real de frames (jank). Não aplique como regra padrão permanente em todas as classes, para não estourar o consumo de memória de vídeo (VRAM).

## Acessibilidade motora verificável (WCAG 2.3.3)

- **`prefers-reduced-motion` no CSS e no JS:** zerar a duração no CSS via `@media (prefers-reduced-motion: reduce)` não basta se o JavaScript mantiver um `setTimeout` de espera decorativa. Se o CSS reduz ou anula a transição, o JS deve sincronizar imediatamente o estado final.
- **Manutenção de funcionalidade e foco:** em movimento reduzido, o conteúdo final e o retorno de foco continuam obrigatórios e instantâneos. Animações de interação que possam causar desconforto vestibular devem ser reduzidas ou substituídas por crossfade simples.

## Conferir estados difíceis

- **Entrada e saída:** o conteúdo aparece e desaparece sem ficar inacessível ou preso em estado intermediário.
- **Ações rápidas:** abrir, fechar e abrir novamente não duplicam controles, timers ou listeners.
- **Interrupção:** cancelar ou navegar para outra rota deixa a interface em estado coerente.
- **Preferência reduzida:** a função e o feedback continuam disponíveis com movimento não essencial reduzido e sem atraso de espera em JS.
- **Foco e teclado:** o foco chega ao destino correto, não acompanha um elemento removido e retorna quando a interação exige.
- **Custo:** se houver travamento, meça o estado e o dispositivo afetados antes de atribuir a causa à animação.

Observe a interação no navegador quando for possível. Uma captura estática mostra o resultado, não a continuidade, a duração ou o cancelamento. Registre o que foi visto e o que não pôde ser testado. Não reutilize receitas, CSS ou scripts de bibliotecas de terceiros apenas porque foram fornecidos como inspiração.
