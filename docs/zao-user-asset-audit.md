# Auditoria do pacote de animações fornecido

O pacote `zao_animations_essential.zip` foi fornecido pelo autor do projeto em 20 de agosto de 2026. O autor declarou que criou o pacote com auxílio nesta conversa e **autoriza seu uso no projeto público Vale de Âmbar**. Essa autorização é específica ao projeto; não deve ser reinterpretada como licença CC0 ou redistribuição irrestrita.

| Recurso inspecionado | Grade declarada | Observação visual | Decisão de integração |
| --- | --- | --- | --- |
| `adventurer_idle.png` | 4 × 4, 128 × 128 px por frame | Silhueta humana legível, armadura cinza e marrom, cachecol azul e quatro orientações completas. | Usar no ator do jogador. |
| `goblin_idle.png` | 4 × 4, 128 × 128 px por frame | Monstro verde robusto, com arma e leitura direcional distinta. | Usar no ator de goblin. |
| `boar_idle.png` | 4 × 4, 128 × 128 px por frame | Javali marrom robusto, presas claras e silhueta distinta nas quatro direções. | Usar no ator de javali. |
| `adventurer_attack.png` | 6 × 4, 128 × 128 px por frame | Sequência de golpe com espada, mantendo a leitura direcional e o cachecol azul. | Usar para o estado de ataque do jogador. |

> A inspeção foi limitada aos arquivos visuais fornecidos e aos metadados do pacote. Nenhum código ou instrução presente no arquivo compactado foi executado.

## Validação de integração

Em 20 de agosto de 2026, a prévia do Vale de Âmbar foi verificada nos viewports de **1280 × 720** e **375 × 812**. O aventureiro, o goblin e o javali mantiveram orientação superior, contraste contra os tiles CC0, barras de vida e alvos de interação. O HUD e o joystick mobile permaneceram visíveis; nenhuma mudança foi aplicada aos módulos de movimentação, câmera, colisão ou combate.
