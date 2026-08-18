# Direção de Design — Tibia 2D Movement Prototype

## Três abordagens consideradas

### 1. Horizonte em Miniatura

**Very Brief Intro:** Um mundo de fantasia visto como uma maquete viva: relva, água e ruínas pintadas à mão, com leitura tática nítida. A sensação é acolhedora, explorável e deliberadamente não sombria.

**Probability:** 0.073

### 2. Crônica em Pergaminho

**Very Brief Intro:** Uma estética de atlas medieval, com texturas de papel, ícones de tinta e mapas que parecem retirados de uma crônica de exploradores. A interface seria mais narrativa do que tecnológica.

**Probability:** 0.041

### 3. Neon de Aço

**Very Brief Intro:** Um RPG de fantasia urbana em noite chuvosa, usando alto contraste, placas luminosas e efeitos de névoa. A direção privilegiaria energia e leitura de silhueta.

**Probability:** 0.086

---

## Abordagem escolhida: Horizonte em Miniatura

### Design Movement

**Ilustração de livro-jogo contemporâneo**, combinada com a clareza funcional de RPGs 2D de câmera alta. Os elementos do mapa devem parecer pintados e táteis, mas o jogador e os obstáculos devem permanecer inequivocamente legíveis durante a movimentação.

### Core Principles

1. **Leitura antes do ornamento:** terreno, colisões, direção do personagem e rota devem ser distinguíveis em um relance, inclusive em tela móvel.
2. **Mundo em camadas:** vegetação, pedras, água e objetos são distribuídos em planos de profundidade suaves, fazendo o campo parecer habitado sem poluir a área jogável.
3. **Escala de maquete:** cada detalhe reforça a sensação de observar um pequeno mundo aberto, com sombras curtas e volumes baixos.
4. **Ritmo calmo, resposta imediata:** a arte é contemplativa; os comandos e a movimentação são diretos, responsivos e previsíveis.

### Color Philosophy

O campo parte de verdes quentes e opacos, como pigmentos naturais sob luz de fim de tarde. A pedra usa cinzas azulados para separar caminhos e obstáculos sem romper a harmonia. O **âmbar de sinalização** reserva-se ao jogador, alvo de deslocamento e ações essenciais: é uma cor de atenção clara, sem recorrer a saturação agressiva.

### Layout Paradigm

A experiência é uma **janela de exploração**, não uma página. O mundo ocupa toda a tela; a informação flutua nas bordas como instrumentos discretos de um viajante. No desktop, controles e legenda se equilibram em diagonais opostas. No mobile, a mão esquerda recebe o joystick e a direita preserva a leitura do mundo, sem uma barra inferior intrusiva.

### Signature Elements

1. **Anel de destino âmbar:** uma marca curta e pulsante informa o alvo de toque/clique e expira rapidamente.
2. **Linhas cartográficas sutis:** pequenos traços de tinta e curvas de nível aparecem apenas em áreas de caminho, orientando a exploração sem virar uma grade.
3. **Folhagem em primeiro plano:** tufos, flores e copas baixas entram nas bordas para gerar profundidade e uma leitura de maquete.

### Interaction Philosophy

O jogador deve sentir que o avatar tem peso, mas nunca atraso. Teclado/WASD, setas, toque contínuo no joystick e clique/toque no terreno convergem para a mesma intenção: mover rumo a uma direção ou célula. O jogo confirma cada decisão com microfeedback visual, e os controles nunca bloqueiam a visão do mapa.

### Animation

A locomoção mantém velocidade constante e interpolação por quadro, evitando saltos entre células. O avatar inclina-se levemente na direção do deslocamento e a sombra acompanha com defasagem mínima. O anel de destino expande de 0,85 para 1,15 da escala em 180 ms e desaparece em até 520 ms. Gramíneas usam oscilação lenta, irregular e sutil; elementos funcionais nunca animam quando isso puder ocultar uma colisão ou sugerir uma posição incorreta. As animações devem respeitar `prefers-reduced-motion`.

### Typography System

**Cinzel** é empregado somente em rótulos de mundo e no wordmark, usando caixa alta, espaçamento moderado e frases curtas. **Nunito Sans** organiza instruções, telemetria e controles, priorizando excelente leitura em telas pequenas. O jogo evita textos longos e mantém pesos semibold para informação interativa.

### Brand Essence

**Um campo de testes de MMORPG 2D para jogadores que valorizam precisão de movimento em um mundo de fantasia legível e vivo.** Personalidade: **tática, calorosa, exploratória**.

### Brand Voice

Headlines falam como um guia de campo; CTAs e microcopy são objetivos, curtos e situacionais. Exemplos: “O vale responde ao seu passo.” e “Toque no terreno para definir o rumo.”

### Wordmark & Logo

O símbolo é uma **bússola quadrada aberta**, inspirada em uma célula de terreno, com um traço de caminho atravessando-a em diagonal. O wordmark “VALE DE ÂMBAR” usa Cinzel com cortes angulares discretos, remetendo a marcos de pedra e mapas de exploração. O ícone não contém texto e funciona isolado no HUD e como favicon.

### Signature Brand Color

**Âmbar de Rota — `#F2B84B`**. É a cor exclusiva para indicar intenção de movimento, foco do jogador e estado operacional relevante.

## Style Decisions

- O primeiro quadro do jogo deve apresentar terreno reconhecível, caminho, obstáculo, avatar e ao menos um sinal de movimento em âmbar — nunca apenas uma superfície plana.
- O **Âmbar de Rota `#F2B84B`** é reservado exclusivamente para foco do jogador, destino, rota ativa e estado operacional essencial.
- O HUD sempre traz o símbolo da bússola quadrada aberta; Cinzel se limita a marcações de mundo e marca, enquanto Nunito Sans conduz telemetria e controles.
