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

## Minimapa e descrições locais

O minimapa acompanha a mesma regra de apresentação do mundo. Cada área é exibida com uma **cor plana de campo**, uma malha discreta e apenas quatro marcadores funcionais: o ponto do jogador, os losangos de criaturas, os hotspots de travessia e a indicação de norte. Ele não desenha água, estradas, pontes, muros, casas, torres, ruínas ou demais estruturas removidas da cena.

Os rótulos de região e de travessia também descrevem exclusivamente o tipo de campo em grade. A nomenclatura histórica das regiões continua disponível para orientação de progressão e destinos de portal, mas não sugere que estruturas físicas estejam sendo renderizadas.

## Verificação visual

Em 21 de agosto de 2026, as prévias desktop de 1280 × 720 e mobile de 375 × 812 confirmaram a continuidade das tiles de relva e caminho sobre o campo, sem paredes, casas, pontes, muros, árvores ou marcadores de criatura/saque na cena. O Batedor de Ruínas continua visível como único sprite de imagem do mundo, e os controles/HUD permanecem funcionais. A simplificação do minimapa deve ser verificada nas mesmas resoluções antes do próximo checkpoint.

## Disponibilidade estática

Os quatro atlas foram publicados na release pública [`clean-field-tiles-v1`](https://github.com/fabiomigal/tibia-2d-movement/releases/tag/clean-field-tiles-v1), com o pacote `vale-ambar-clean-field-v1.zip` e checksum SHA-256. Durante a publicação, o workflow do GitHub Pages extrai os atlas para `tiles/clean-field/`; o modo estático resolve cada perfil por esse caminho público dentro de `/tibia-2d-movement/`.

## Confirmação no GitHub Pages

Após o deploy do commit `bf68a276`, a página pública em <https://fabiomigal.github.io/tibia-2d-movement/?cleanGround=bf68a276> confirmou o campo de relva e trilhas em grade como fundo do mundo, sem estruturas visíveis na cena principal. O minimapa e o texto descritivo local foram então alinhados aos campos limpos, preservando navegação, colisões e portais como regras invisíveis.
