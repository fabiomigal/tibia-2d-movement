# Requisitos de expansão — Vale de Âmbar

**Fonte:** Documento Mestre de Reconstrução — *Idle RPG MMORPG (Estilo Priston Tale + Mecânica Tibia)*, anexo pelo usuário em 18 de agosto de 2026.

## Restrição imutável

O núcleo existente de movimentação e câmera é uma superfície congelada. Nenhum requisito desta expansão poderá alterar a resposta do teclado, toque, clique no terreno, joystick, resolução de colisão, velocidade, câmera ortográfica ou seu comportamento de acompanhamento. Sistemas novos devem se integrar por eventos e interfaces auxiliares.

## Escopo funcional consolidado

| Domínio | Características a implementar |
|---|---|
| Mundo | Regiões temáticas conectadas, portais, escadas entre andares, minimapa, requisitos de nível e exploração com objetos interativos. |
| Combate | Alvos, ataque e perseguição, HP/MP/energia, dano crítico, sete elementos, resistências, números de dano, efeitos de impacto, morte e revive. |
| Criaturas | Catálogo regional, estados de IA, perseguição, ataque, fuga, retorno, cadáveres, respawn e drops no chão. |
| Personagem | Três arquétipos, atributos, XP, níveis, barras de recursos, skills elementais, equipamentos, auto-poções e penalidade de morte. |
| Inventário e economia | Capacidade por peso e slots, raridade, equipamentos, uso/venda/descartar, mercador, confirmação para itens lendários e bloqueio de coleta excedente. |
| Modo idle | Caça automática por turno, seleção de alvo, recompensas, combate com contra-ataque, progresso offline e registro da sessão. |
| Interface | HUD de viajante, minimapa, popups de personagem/inventário/equipamentos/magias/cidade/mapa/teleporte, atalhos, D-pad e painel de loot. |
| Persistência e multiplayer | Dados persistentes, validação servidor-autoritativa, sessão em tempo real, FOV, sincronização regional, reconciliação e proteção contra entradas inválidas. |
| Qualidade | Testes de domínio, responsividade mobile, acessibilidade de atalhos, compilação e validação dos fluxos jogáveis. |

## Escopo técnico adaptado

O projeto atual será ampliado para incluir persistência e serviços de jogo. A implementação inicial manterá uma arquitetura de domínio que separa dados de personagem, combate, inventário, mundo e UI; a regra cliente envia intenção e o serviço aplica o resultado continuará como meta para os fluxos com persistência. O modo em tempo real poderá operar com serviço persistente quando a hospedagem contínua for ativada; enquanto isso, as regras e interfaces serão executáveis no ambiente de desenvolvimento.

## Critérios de aceitação

| Fluxo | Resultado esperado |
|---|---|
| Combate | O jogador seleciona uma criatura, ataca por skill, vê HP, tipo elemental, dano e recompensas. |
| Progressão | XP, nível, gold e recursos são atualizados e apresentados com consistência. |
| Inventário | Peso e slots limitam a coleta; equipamentos e raridades são compreensíveis; decisões de guardar/descartar funcionam. |
| Mundo | Portais, escadas, NPCs, drops e regiões podem ser explorados pelos controles existentes. |
| Idle | Uma sessão de caça pode iniciar, avançar em turnos e apresentar resultado sem alterar o controle de movimento. |
| Mobile | HUD, joystick, atalhos e popups permanecem utilizáveis em tela estreita. |
| Regressão | O comportamento de movimento e câmera aprovado permanece inalterado. |

## Fora do escopo imediato

Autenticação será mantida fora do fluxo inicial, em conformidade com a decisão anterior do usuário. A aplicação poderá usar um personagem local de desenvolvimento até que a autenticação seja explicitamente solicitada.
