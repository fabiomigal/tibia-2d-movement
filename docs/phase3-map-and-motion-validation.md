# Validação visual — inventário rápido, mapa em tiles e poeira de movimento

## Escopo verificado

Em 19 de agosto de 2026, a interface foi revisada no preview do projeto em desktop (1280 × 720) e mobile (375 × 812). A verificação concentrou-se no mundo renderizado, no HUD e nos novos elementos de interface, sem alterar os módulos congelados de movimentação ou câmera.

| Viewport | Evidência observada | Resultado |
| --- | --- | --- |
| Desktop, 1280 × 720 | Cidade em tiles, rio, ponte, praça, minimapa, barra de habilidades e painel de Mochila Rápida com agrupamento e quantidades. | Aprovado |
| Mobile, 375 × 812 | HUD compacto, minimapa, joystick, encontros, atalhos, habilidades e Mochila Rápida permanecem visíveis e operáveis no espaço reduzido. | Aprovado |

## Validação complementar

O efeito de poeira é acionado exclusivamente pelo estado visual `player.isMoving()` no orquestrador do mundo. A emissão é interrompida em repouso e o recurso é descartado durante a limpeza da cena. O comportamento possui contrato automatizado, enquanto a aparência dinâmica é verificada no runtime durante o deslocamento.

> A composição de tiles adiciona zonas decorativas em camadas para praça urbana, jardins, clareiras, floresta e estrada. A geometria de colisões continua sendo consumida sem modificações de `zaoMapLayout.ts`.

