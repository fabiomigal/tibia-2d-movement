# Estrutura Técnica — Vale de Âmbar

## Decisão de plataforma

O protótipo é um jogo web responsivo: executa em navegador desktop e em navegadores móveis por meio do mesmo canvas. A etapa atual não cria empacotamentos nativos para lojas, nem serviços remotos.

## Princípio de camadas

**React enquadra o jogo; Babylon renderiza a cena; as classes TypeScript governam o mundo.** Nenhuma regra de movimentação fica acoplada a estado React.

## Módulos principais

| Módulo | Responsabilidade | Dependências diretas |
|---|---|---|
| `components/GameCanvas.tsx` | Ciclo de vida do canvas, foco, resize e sobreposições React mínimas | `game/scene.ts` |
| `game/scene.ts` | Cria cena, câmera, mundo e loop; expõe `GameHandle` para descarte seguro | Babylon, `GameWorld` |
| `game/GameWorld.ts` | Cria mapa, materiais, obstáculos e executa atualização de todos os sistemas | `Player`, `MovementInput`, `CameraController` |
| `game/Player.ts` | Mantém posição lógica, direção, alvo, visual do avatar e sombra | `CollisionWorld` |
| `game/MovementInput.ts` | Converte teclado, ponteiro e joystick em ações semânticas | canvas e eventos de janela |
| `game/CollisionWorld.ts` | Contém limites, água e colisores circulares; resolve deslocamentos | tipos de mundo |
| `game/CameraController.ts` | Mantém câmera ortográfica em uma âncora estável do jogador | câmera Babylon |
| `game/MobileJoystick.ts` | Desenha e atualiza controle de toque na tela sem interferir com clique no terreno | ponteiro do canvas |
| `game/DemoPilot.ts` | Em `?demo`, envia intenções reproduzíveis para prova visual | `Player` |
| `game/types.ts` | Tipos compartilhados de vetores, obstáculos e ações de movimento | nenhum |

## Modelo de estado

O jogador mantém `position`, `facing`, `target`, `speed`, `moving` e `lastInput`. A intenção de movimento pode ser `vector`, quando vem de um controle contínuo, ou `target`, quando vem de um ponto do mapa. A intenção contínua tem prioridade; ao cessar, o destino permanece se existir.

## Contrato de atualização

Em cada quadro: limitar `deltaTime`, coletar ações, calcular deslocamento desejado, resolver colisão, atualizar posição lógica, atualizar visual e então deslocar câmera. Posição lógica é a fonte de verdade. O visual nunca altera regras de colisão.

## Asset Hints

| Ativo | Papel | Dimensão de uso | Estratégia |
|---|---|---:|---|
| Relva | Solo navegável | repete a cada 3 unidades | Textura gerada em `StandardMaterial` |
| Água | Riacho não caminhável | repete a cada 2 unidades | Textura gerada em planos de água |
| Props | Referência para obstáculos orgânicos | 1 a 3 unidades | Geometria leve com materiais e silhuetas coerentes |
| Marca | Identidade e favicon | 44 px HUD, 64 px favicon | Imagem gerada carregada externamente |

## Limites conhecidos

Esta entrega é deliberadamente local e determinística. Autoridade de servidor, sincronização multiplayer, navegação de longa distância, mapas Tiled, sprites animados e persistência entrarão somente após a validação do controlador de movimento.
