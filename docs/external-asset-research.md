# Pesquisa de assets externos para o Vale de Âmbar

## Critério de seleção

Os assets devem ter licença explícita de reutilização, manter a leitura de fantasia em visão superior e não reproduzir sprites ou tiles proprietários de Tibia. A referência do usuário orienta a composição: trilhas claras, campo verde com vegetação densa, pedras, flores e personagem central em pixel art.

| Fonte avaliada | Licença declarada | Adequação | Decisão |
| --- | --- | --- | --- |
| Kenney RPG Urban Pack | CC0; 480 arquivos de 16 × 16 | Bom para pedra, objetos urbanos e detalhes de interiores, mas pouco adequado ao campo florestal principal. | Reserva para interiores e estruturas. |
| OpenGameArt — Overworld Grass Biome | CC0; tiles de gramado em pixel art 16 × 16, com PNG e ZIP disponíveis | Boa base para gramado, caminhos e transições naturais, próxima da leitura de campo da referência. | Candidato principal para o terreno externo. |
| OpenGameArt — RPG sprite, humano masculino em oito direções | CC0; sprite 16 × 16 com caminhada e ataque simples, PNG disponível | Permite substituir visualmente o aventureiro mantendo os estados existentes do controlador de animação. | Candidato principal para a representação do personagem. |

> A seleção seguirá somente para arquivos cuja página de origem declara a licença. A aparência será inspirada no gênero e na referência fornecida, não em recursos proprietários de Tibia.

## Seleção aplicada

Os recortes abaixo foram derivados localmente do atlas CC0 *Overworld Grass Biome*, preservado em `/home/ubuntu/webdev-static-assets/oga-overworld-grass/`, e publicados para uso exclusivamente visual no projeto.

| Uso visual | Origem | Caminho publicado |
| --- | --- | --- |
| Gramado e variação com flores | Atlas Overworld Grass Biome (CC0) | `/manus-storage/vale-ambar-grass_cd07443a.png` e `/manus-storage/vale-ambar-grass-flowers_b8d10c91.png` |
| Trilha clara, água, pedra e muro | Atlas Overworld Grass Biome (CC0) | `/manus-storage/vale-ambar-path_b6e3b152.png`, `/manus-storage/vale-ambar-water_2d11e2c5.png`, `/manus-storage/vale-ambar-stone_9095b7f2.png` e `/manus-storage/vale-ambar-wall_ba5e000b.png` |
| Copa de árvore e canteiro de flores | Atlas Overworld Grass Biome (CC0) | `/manus-storage/vale-ambar-tree_b687db29.png` e `/manus-storage/vale-ambar-flower-bed_f48fafee.png` |
| Aventureiro em 8 direções | RPG Sprite — Human Male (CC0) | `/manus-storage/sprite_oga_f4502ba6.png` |

> Os identificadores de terreno, interação, colisão, encontro e movimentação existentes não mudam com a substituição das texturas.

## Referências

[1] [Kenney, *RPG Urban Pack*](https://kenney.nl/assets/rpg-urban-pack).

[2] [OpenGameArt, *Overworld — Grass Biome*](https://opengameart.org/content/overworld-grass-biome).

[3] [OpenGameArt, *RPG sprite — 8 direction human male 16x16*](https://opengameart.org/content/rpg-sprite-8-direction-human-male-16x16).
