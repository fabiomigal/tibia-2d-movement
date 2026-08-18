# Game Plan: Vale de Âmbar — Protótipo de Movimento

## Escopo desta entrega

Criar uma experiência jogável no navegador, responsiva a desktop e dispositivos móveis, com um campo aberto em vista superior. A primeira versão não inclui autenticação, combate, rede, inventário ou NPCs; seu objetivo exclusivo é validar qualidade de movimento, câmera, terreno e colisão.

## Risk Tasks

### 1. Movimento contínuo com intenção por teclado, toque e clique

- **Why isolated:** O mesmo avatar precisa interpretar entradas contínuas e entradas por destino sem acumular velocidade, tremer em diagonais ou reter comandos após a perda de foco.
- **Approach:** Centralizar entradas em ações semânticas. Priorizar vetor contínuo de joystick/teclado enquanto estiver ativo; para clique/toque no campo, perseguir um alvo em velocidade constante. Normalizar vetores diagonais, limitar `deltaTime` e aplicar suavização somente na apresentação da posição, nunca na intenção do controle.
- **Verify:** Segurar WASD, setas ou joystick por pelo menos cinco segundos mantém velocidade uniforme; transições parado → caminhar → parado não criam deslize; diagonal não é mais rápida que um eixo; um novo comando muda o rumo sem atraso perceptível.

### 2. Câmera de mapa aberto com enquadramento estável

- **Why isolated:** Câmera que segue a posição suavizada pode oscilar, expor a borda do mundo ou dificultar leitura do avatar em telas de proporções distintas.
- **Approach:** Usar câmera ortográfica superior que acompanha uma âncora interpolada do jogador, com limites do mundo e distância ajustada à relação de aspecto. Aplicar amortecimento curto e independente da velocidade para manter o avatar visível sem efeito elástico.
- **Verify:** Durante deslocamento em qualquer direção, a câmera acompanha sem tremor; nas bordas não revela área fora do campo; mudar a orientação entre viewport desktop e mobile preserva o jogador e os controles em área segura.

### 3. Colisão circular contra obstáculos e limites

- **Why isolated:** Obstáculos estáticos e bordas podem gerar atravessamento ou travamento se a posição for atualizada por passos de quadro grandes.
- **Approach:** Representar rochas, ruínas e árvores por círculos de colisão. Resolver o deslocamento em eixos separados com subpassos, desfazendo apenas o eixo bloqueado; manter um raio consistente do jogador e limitar o avatar dentro do retângulo do mapa.
- **Verify:** Caminhar diretamente, em diagonal e tangenciando cada classe de obstáculo não atravessa nem prende o jogador; a posição permanece estável depois de contato; segurar uma direção contra a borda não produz vibração.

## Main Build

- Uma cena Babylon de mapa superior com relva repetível, riacho, pedras, ruínas, árvores e detalhes de primeiro plano.
- Um avatar de explorador simplificado, com sombra, indicador de direção e anel de destino Âmbar.
- Camera ortográfica e HUD discreto com estado de entrada, velocidade e instruções contextuais.
- Controles por WASD, setas, clique/toque no terreno e joystick virtual em telas sensíveis ao toque.
- Modo `?demo` com rota determinística que atravessa o campo e demonstra a câmera, o movimento e a fuga de obstáculos para captura visual.
- **Assets:**
  - `vale-ambar-ground` — textura repetível da relva para o plano navegável.
  - `vale-ambar-water` — textura repetível de água para o riacho não caminhável.
  - `vale-ambar-props` — referência visual de rochas, árvores, ruínas, relvas e flores; a primeira versão replica os volumes essenciais como malhas leves para preservar colisões nítidas.
  - `vale-ambar-logo` — marca da bússola quadrada usada no HUD e favicon.
- **Verify:**
  - Teclado, clique/toque e joystick geram deslocamento na direção pretendida.
  - A velocidade permanece igual em linhas retas e diagonais.
  - Ação de toque no terreno mostra destino e move o jogador até ele ou até uma colisão.
  - Colisões, riacho e bordas impedem deslocamento sem clipping.
  - Testes determinísticos de colisão cobrem atravessamento, deslize tangencial e contenção nas bordas.
  - HUD é legível e não sobrepõe joystick ou área crítica em viewport estreito.
  - Não há textura faltante, material de fallback ou erro de console na demonstração.
  - A cena preserva a paleta, escala, ângulo de câmera e densidade visual da referência.
  - O screenshot do modo `?demo` mostra deslocamento real, não apenas uma tela estática.
