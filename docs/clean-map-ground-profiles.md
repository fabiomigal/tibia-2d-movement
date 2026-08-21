# Perfis de chão dos mapas limpos

## Princípio visual

Todos os mapas agora exibem somente **grades de tiles de chão**. Paredes, muros, casas, pontes, árvores, rochas, baús, criaturas e outros objetos foram retirados da apresentação visual. Colisões, portais, encontros, saques e demais regras continuam ativos como gatilhos invisíveis, sem alteração de geometria ou comportamento.

| Área | Perfil de chão | Característica preservada pelo piso | Elementos visuais removidos |
|---|---|---|---|
| Cidade de Âmbar | `amber-meadow` | Relva de campo, solo pontilhado e transições de terra | Construções, muros, baús, decoração e rochas |
| Estrada dos Ventos | `wind-trail` | Terra batida e margens de relva para leitura de rota aberta | Pontes, cercas, paredes, árvores e objetos de estrada |
| Estalagem do Âmbar | `inn-garden` | Jardim de folhas, raízes e chão vegetal | Piso interno, paredes, móveis e casa |
| Santuário da Lua | `moon-clearing` | Clareira úmida com chão de vegetação e zonas de solo | Água profunda, pilares, ruínas, portais e demais estruturas |

Os quatro perfis usam cinco variações de chão por atlas, distribuídas deterministicamente na grade para evitar repetição visual rígida. As spritesheets de floresta e árvores permanecem organizadas fora do runtime para uma futura composição, mas não são instanciadas nesta etapa.

## Verificação visual

Em 21 de agosto de 2026, as prévias desktop de 1280 × 720 e mobile de 375 × 812 confirmaram a continuidade das tiles de relva e caminho sobre o campo, sem paredes, casas, pontes, muros, árvores ou marcadores de criatura/saque na cena. O Batedor de Ruínas continua visível como único sprite de imagem do mundo, e os controles/HUD permanecem funcionais.

## Disponibilidade estática

Os quatro atlas foram publicados na release pública [`clean-field-tiles-v1`](https://github.com/fabiomigal/tibia-2d-movement/releases/tag/clean-field-tiles-v1), com o pacote `vale-ambar-clean-field-v1.zip` e checksum SHA-256. Durante a publicação, o workflow do GitHub Pages extrai os atlas para `tiles/clean-field/`; o modo estático resolve cada perfil por esse caminho público dentro de `/tibia-2d-movement/`.
